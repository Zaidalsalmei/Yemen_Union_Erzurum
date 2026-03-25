<?php
declare(strict_types=1);

namespace App\Helpers;

class ResponseHelper
{
    public static function success(string $message, $data = null, int $code = 200): array
    {
        $response = [
            'success' => true,
            'message' => $message,
            'code' => $code
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return $response;
    }

    public static function error(string $message, int $code = 400): array
    {
        return [
            'success' => false,
            'message' => $message,
            'code' => $code
        ];
    }

    public static function validationError(string $message, array $errors = [], int $code = 422): array
    {
        $response = [
            'success' => false,
            'message' => $message,
            'code' => $code
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return $response;
    }

    public static function paginated(array $data, int $total, int $page, int $perPage, string $message = 'تم جلب البيانات بنجاح'): array
    {
        $lastPage = (int) ceil($total / $perPage);
        
        $response = self::success($message, $data);
        $response['meta'] = [
            'total' => $total,
            'current_page' => $page,
            'per_page' => $perPage,
            'last_page' => $lastPage,
            'from' => ($page - 1) * $perPage + 1,
            'to' => min($page * $perPage, $total)
        ];
        return $response;
    }
}
