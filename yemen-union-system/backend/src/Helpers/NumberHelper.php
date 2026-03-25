<?php
declare(strict_types=1);

namespace App\Helpers;

class NumberHelper
{
    /**
     * Convert Arabic/Eastern Arabic numerals to Western Arabic numerals
     */
    public static function convertArabicToWestern($string): string
    {
        $arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        $persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        $english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        $string = str_replace($arabic, $english, (string)$string);
        $string = str_replace($persian, $english, $string);

        return $string;
    }

    /**
     * Get float value safely even with Arabic numerals
     */
    public static function parseFloat($value): float
    {
        if (is_numeric($value)) return (float)$value;
        $clean = self::convertArabicToWestern($value);
        return (float)preg_replace('/[^0-9.]/', '', $clean);
    }
}
