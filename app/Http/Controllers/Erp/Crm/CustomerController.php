<?php

namespace App\Http\Controllers\Erp\Crm;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreRequest;
use App\Http\Requests\Customer\UpdateRequest;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Throwable;
use Yajra\DataTables\Facades\DataTables;

class CustomerController extends Controller
{
    /**
     * SMS Service instance for sending notifications
     * 
     * @var SmsService
     */
    protected $smsService;

    /**
     * Constructor for dependency injection
     */
    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    /**
     * Display customer listing page or DataTable response
     */
    public function index(Request $request)
    {
        try {
            if ($request->ajax() || $request->has('draw')) {
                return $this->getCustomerDataTable($request);
            }

            return Inertia::render('Backend/ERP/CRM/Customer', [
                'filters' => $request->only(['is_active', 'role']),
            ]);
        } catch (Throwable $e) {
            Log::error('Customer index error: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'request' => $request->all(),
            ]);

            return $request->ajax()
                ? response()->json(['error' => 'Failed to load customer data'], 500)
                : back()->with('error', 'Failed to load customer list.');
        }
    }

    /**
     * Get DataTable response for customers
     */
    private function getCustomerDataTable(Request $request)
    {
        $query = User::with(['branch', 'roles'])
            ->whereHas('roles', fn($q) => $q->where('name', 'customer'))
            ->when($request->filled('is_active'), fn($q) => $q->where('is_active', $request->is_active))
            ->when($request->filled('role'), function ($q) use ($request) {
                $q->whereHas('roles', fn($query) => $query->where('name', $request->role));
            });

        return DataTables::eloquent($query)
            ->addIndexColumn()
            ->addColumn('photo', fn($row) => $this->getPhotoColumn($row))
            ->addColumn('role', fn($row) => $this->getRoleColumn($row))
            ->addColumn('status', fn($row) => view('partials.backend.status-badge', compact('row'))->render())
            ->addColumn('action', fn($row) => view('partials.backend.customer-actions', compact('row'))->render())
            ->rawColumns(['photo', 'status', 'action', 'role'])
            ->make(true);
    }

    /**
     * Get formatted photo column
     */
    private function getPhotoColumn(User $user): string
    {
        $photoPath = $user->profile_image
            ? asset('storage/' . ltrim($user->profile_image, '/'))
            : asset('/storage/images/profile/default.png');

        return sprintf(
            '<img src="%s" class="img-fluid thumbnail" style="max-width: 30px" alt="User Photo">',
            e($photoPath)
        );
    }

    /**
     * Get formatted role column
     */
    private function getRoleColumn(User $user): string
    {
        $roleName = $user->roles->first()?->name;

        return $roleName
            ? ucfirst($roleName)
            : '<span class="text-muted">No role</span>';
    }

    /**
     * Show customer creation form
     */
    public function create()
    {
        return Inertia::render('Backend/ERP/CRM/CustomerForm');
    }

    /**
     * Store a new customer
     */
    public function store(StoreRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $validated = $request->validated();
            $role = $validated['role'] ?? 'customer';

            $userData = $this->prepareUserData($validated);
            $user = User::create($userData);

            // Handle profile image upload
            if ($request->hasFile('profile_image')) {
                $file = $request->file('profile_image');
                $path = $file->store('customers/profile_images', 'public');
                $user->update(['profile_image' => $path]);
            }

            // Assign role
            $user->assignRole($role);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Customer created successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->full_name ?? "{$user->first_name} {$user->last_name}",
                    'email' => $user->email,
                    'username' => $user->username,
                    'phone' => $user->phone,
                    'role' => $role,
                ],
                'redirect' => route('customers.show', $user),
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Customer creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create customer. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Prepare user data for creation
     */
    private function prepareUserData(array $validated): array
    {
        $userData = Arr::except($validated, ['role', 'confirm_password']);

        return array_merge($userData, [
            'token' => Str::random(60),
            'created_by' => Auth::id(),
            'email_verified_at' => now(),
            'is_active' => ($validated['status'] ?? 'active') === 'active',
            'is_verified' => true,
            'balance' => $validated['opening_balance'] ?? 0,
            'password' => Hash::make($validated['password']),
            'ending_date' => now()->addYear(),
        ]);
    }

    /**
     * Display customer details
     */
    public function show(User $customer)
    {
        try {
            $customer->load([
                'branch',
                'roles',
                'services',
                'orders',
                'payments'
            ]);

            return Inertia::render('Backend/ERP/CRM/CustomerShow', [
                'customer' => $customer,
            ]);
        } catch (Throwable $e) {
            Log::error('Customer show error:', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to load customer details.');
        }
    }

    /**
     * Get customer data for editing
     */
    public function edit(User $customer)
    {
        try {
            $customer->load(['roles']);

            return Inertia::render('Backend/ERP/CRM/CustomerForm', [
                'customer' => $customer
            ]);
        } catch (Throwable $e) {
            Log::error('Customer edit error:', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load customer data.',
            ], 500);
        }
    }

    /**
     * Update customer
     */
    public function update(UpdateRequest $request, User $customer): JsonResponse
    {
        DB::beginTransaction();

        try {
            $validated = $request->validated();
            $updateData = Arr::except($validated, [
                'role',
                'permissions',
                'password_confirmation'
            ]);

            // Handle password update
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            // Handle profile image upload
            if ($request->hasFile('profile_image')) {
                $file = $request->file('profile_image');
                $path = $file->store('customers/profile_images', 'public');
                $updateData['profile_image'] = $path;
            }

            // Update customer
            $customer->update(array_merge($updateData, [
                'updated_by' => Auth::id(),
                'is_active' => $validated['is_active'] ?? $customer->is_active,
            ]));

            // Update role if provided
            if ($request->filled('role')) {
                $customer->syncRoles([$request->role]);
            }

            // Update permissions if provided
            if ($request->filled('permissions')) {
                $customer->syncPermissions($request->permissions);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Customer updated successfully',
                'data' => [
                    'id' => $customer->id,
                    'name' => "{$customer->first_name} {$customer->last_name}",
                ],
            ]);

        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Customer update failed:', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update customer.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Delete customer (soft delete)
     */
    public function destroy(User $customer): JsonResponse
    {
        try {
            $customer->delete();

            Log::info('Customer soft deleted', [
                'customer_id' => $customer->id,
                'deleted_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Customer deleted successfully',
            ]);
        } catch (Throwable $e) {
            Log::error('Customer deletion failed:', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete customer.',
            ], 500);
        }
    }

    /**
     * Send SMS to customer
     */
    public function sendSms(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customerId' => 'required|exists:users,id',
            'phoneNumber' => 'required',
            'message' => 'required|max:160',
        ]);

        try {
            $this->smsService->sendSms($validated['phoneNumber'], $validated['message']);

            Log::info('SMS sent to customer', [
                'customer_id' => $validated['customerId'],
                'phone_number' => $validated['phoneNumber'],
                'sent_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'SMS sent successfully'
            ], 200);
        } catch (Throwable $e) {
            Log::error('SMS sending failed:', [
                'customer_id' => $validated['customerId'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send SMS: ' . $e->getMessage(),
            ], 500);
        }
    }
}