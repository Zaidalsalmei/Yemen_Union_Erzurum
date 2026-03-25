<?php
declare(strict_types=1);

namespace App\Exceptions;

class ValidationException extends \Exception
{
    public function __construct(string $message = 'خطأ في البيانات', int $code = 422)
    {
        parent::__construct($message, $code);
    }
}
