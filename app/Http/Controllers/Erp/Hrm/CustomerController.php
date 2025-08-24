<?php

namespace App\Http\Controllers\Erp\Hrm;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreRequest;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller {
    /**
    * Display a listing of the resource.
    */

    public function index() {
        //
    }

    /**
    * Show the form for creating a new resource.
    */

    public function create() {
        //
    }

    /**
    * Store a newly created customer in storage.
    */

    public function store( StoreRequest $request ) {
        try {
            $validated = $request->validated();
            $user = User::create( $validated +[
                'ending_date'=> now()->addYear()
            ] );
            $user->assignRole( 'customer' );

            return response()->json( [
                'success' => true,
                'message' => 'Customer registered successfully',
            ], 200 );
        } catch ( \Exception $e ) {
            return response()->json( [
                'success' => false,
                'message' => 'Failed : ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500 );
        }
    }

    /**
    * Display the specified resource.
    */

    public function show( string $id ) {
        //
    }

    /**
    * Show the form for editing the specified resource.
    */

    public function edit( string $id ) {
        //
    }

    /**
    * Update the specified resource in storage.
    */

    public function update( Request $request, string $id ) {
        //
    }

    /**
    * Remove the specified resource from storage.
    */

    public function destroy( string $id ) {
        //
    }
}
