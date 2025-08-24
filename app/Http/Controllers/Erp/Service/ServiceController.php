<?php

namespace App\Http\Controllers\Erp\Service;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ServiceController extends Controller {
    /**
    * Display a listing of the resource.
    */

    public function index( Request $request ) {
        return Inertia::render( 'Backend/ERP/Service/Index' );
    }

    /**
    * Show the form for creating a new resource.
    */

    public function create() {
        return Inertia::render( 'Backend/ERP/Service/Create' );
    }

    /**
    * Summary of store
    * @param \Illuminate\Http\Request $request
    * @return void
    */

    public function store( Request $request ) {
        Log::info( $request );
    }
}
