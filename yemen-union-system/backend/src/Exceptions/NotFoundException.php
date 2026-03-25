<?php

declare(strict_types=1);

namespace App\Exceptions;

class NotFoundException extends \Exception
{
    public function __construct(string $message = 'العنصر غير موجود')
    {
        parent::__construct($message);
    }
}
