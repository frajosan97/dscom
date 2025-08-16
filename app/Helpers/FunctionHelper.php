<?php

use Illuminate\Http\Request;
use Illuminate\Support\Str;

if (!function_exists('systemMode')) {
    function systemMode()
    {
        $defaultMode = 'ecommerce';
        $modeMap = [
            'erp' => 'erp',
            'awa' => 'erp',
        ];

        $host = app(Request::class)->getHost();
        $subdomain = Str::before($host, '.');

        return $modeMap[strtolower($subdomain)] ?? $defaultMode;
    }
}

if (!function_exists('generateSlug')) {
    function generateSlug(string $string, string $separator = '-', string $language = 'en'): string
    {
        // Convert all characters to their ASCII representation
        $string = Str::ascii($string, $language);
        // Convert to lowercase
        $string = strtolower($string);
        // Replace all non-word characters with the separator
        $string = preg_replace('/[^a-z0-9]+/', $separator, $string);
        // Trim separators from the beginning and end
        $string = trim($string, $separator);
        // Remove duplicate separators
        $string = preg_replace('/' . preg_quote($separator, '/') . '{2,}/', $separator, $string);
        // Limit slug length to 255 characters (database friendly)
        if (strlen($string) > 255) {
            $string = substr($string, 0, 255);
            $string = rtrim($string, $separator);
        }

        return $string;
    }
}
