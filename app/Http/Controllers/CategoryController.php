<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display the specified resource.
     */
    public function show(string $slug)
    {
        $category = Category::with(['children.products', 'products'])
            ->where('slug', $slug)
            ->firstOrFail()
            ->toArray(); // Convert the model to array immediately

        // Merge direct products and children's products into one array
        $category['products'] = array_merge(
            $category['products'], // Direct products
            collect($category['children']) // Children's products
                ->pluck('products')
                ->flatten(1)
                ->toArray()
        );

        return Inertia::render('Frontend/Category', [
            'category' => $category
        ]);
    }
}
