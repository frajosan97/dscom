<?php

namespace App\Http\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // You might want to add authorization logic here
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $repairOrderId = $this->route('repair_order'); // Assuming your route parameter is repair_order

        return [
            // Customer information
            'customer.id' => 'sometimes|integer|exists:users,id',
            'customer.name' => 'sometimes|string|max:255',
            'customer.phone' => 'sometimes|string|max:20',
            'customer.email' => 'sometimes|email|max:255',
            'customer.address' => 'nullable|string|max:500',
            'customer.city' => 'nullable|string|max:100',
            'customer.country' => 'nullable|string|max:100',

            // Job details
            'job_details.job_number' => 'sometimes|string|max:50|unique:repair_orders,order_number,' . $repairOrderId,
            'job_details.entry_date' => 'sometimes|date',
            'job_details.reference_number' => 'nullable|string|max:100',
            'job_details.warranty_status' => 'nullable|string|in:on,off',
            'job_details.company' => 'sometimes|string|max:100',
            'job_details.model' => 'sometimes|string|max:100',
            'job_details.color' => 'nullable|string|max:50',
            'job_details.imei_serial' => 'sometimes|string|max:100',
            'job_details.device_password' => 'nullable|string|max:100',
            'job_details.provider_info' => 'nullable|string|max:255',
            'job_details.complaint' => 'sometimes|string',
            'job_details.remarks' => 'nullable|string',
            'job_details.service_type' => 'nullable|string|max:100',
            'job_details.description' => 'nullable|string',
            'job_details.priority' => 'sometimes|string|in:low,medium,high,urgent,normal',
            'job_details.assigned_to' => 'nullable|integer|exists:users,id',
            'job_details.due_date' => 'nullable|date',

            // Initial check
            'initial_check.status' => 'nullable|string',
            'initial_check.notes' => 'nullable|string',
            'initial_check.checked_by' => 'nullable|integer|exists:users,id',
            'initial_check.date' => 'nullable|date',
            'initial_check.physicalCondition' => 'nullable|string|max:100',
            'initial_check.riskAgreement' => 'nullable|string|max:100',
            'initial_check.accessories' => 'nullable|array',

            // Payment info
            'payment_info.mpesa' => 'nullable|array',
            'payment_info.mpesa.*.id' => 'nullable|numeric',
            'payment_info.mpesa.*.date' => 'nullable|date',
            'payment_info.mpesa.*.name' => 'nullable|string|max:255',
            'payment_info.mpesa.*.phone' => 'nullable|string|max:20',
            'payment_info.mpesa.*.amount' => 'nullable|numeric|min:0',

            'payment_info.cheque' => 'nullable|array',
            'payment_info.cheque.*.id' => 'nullable|numeric',
            'payment_info.cheque.*.date' => 'nullable|date',
            'payment_info.cheque.*.name' => 'nullable|string|max:255',
            'payment_info.cheque.*.phone' => 'nullable|string|max:20',
            'payment_info.cheque.*.amount' => 'nullable|numeric|min:0',

            'payment_info.cash' => 'nullable|array',
            'payment_info.cash.*.id' => 'nullable|numeric',
            'payment_info.cash.*.date' => 'nullable|date',
            'payment_info.cash.*.name' => 'nullable|string|max:255',
            'payment_info.cash.*.phone' => 'nullable|string|max:20',
            'payment_info.cash.*.amount' => 'nullable|numeric|min:0',

            'payment_info.balanceAccount' => 'nullable|string',
            'payment_info.estimate' => 'nullable|numeric|min:0',

            // Other info
            'other_info.remarks' => 'nullable|string',
            'other_info.attachments' => 'nullable|array',
            'other_info.staff' => 'nullable|string|max:100',
            'other_info.technician' => 'nullable|integer|exists:users,id',
            'other_info.dueDate' => 'nullable|date',
            'other_info.sendSms' => 'nullable|boolean',
            'other_info.sendWhatsApp' => 'nullable|boolean',
            'other_info.sendEmail' => 'nullable|boolean',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Decode JSON strings if they come as strings
        $this->merge([
            'customer' => is_string($this->customer) ? json_decode($this->customer, true) : $this->customer,
            'job_details' => is_string($this->job_details) ? json_decode($this->job_details, true) : $this->job_details,
            'initial_check' => is_string($this->initial_check) ? json_decode($this->initial_check, true) : $this->initial_check,
            'payment_info' => is_string($this->payment_info) ? json_decode($this->payment_info, true) : $this->payment_info,
            'other_info' => is_string($this->other_info) ? json_decode($this->other_info, true) : $this->other_info,
        ]);
    }
}