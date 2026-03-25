<?php

declare(strict_types=1);

namespace App\Exceptions;

class AuthorizationException extends \Exception
{
    public function __construct(string $message = 'غير مصرح لك بهذا الإجراء')
    {
        parent::__construct($message);
    }
}
