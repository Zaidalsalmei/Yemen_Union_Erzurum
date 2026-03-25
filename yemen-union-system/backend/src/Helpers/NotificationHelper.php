<?php
declare(strict_types=1);

namespace App\Helpers;

class NotificationHelper
{
    private static function db(): \PDO
    {
        return \App\Core\Database::getInstance()->getConnection();
    }

    // ══════════════════════════════════════════
    //  الدوال الأساسية
    // ══════════════════════════════════════════

    /**
     * إرسال إشعار لمستخدم واحد
     */
    public static function notify(
        int    $userId,
        string $type,
        string $title,
        string $message,
        string $actionUrl = ''
    ): bool {
        try {
            $stmt = self::db()->prepare("
                INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
                VALUES (:userId, :type, :title, :message, :actionUrl, 0, NOW())
            ");
            return $stmt->execute([
                ':userId'    => $userId,
                ':type'      => $type,
                ':title'     => $title,
                ':message'   => $message,
                ':actionUrl' => $actionUrl,
            ]);
        } catch (\Exception $e) {
            error_log('NotificationHelper::notify error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * إرسال إشعار لكل أصحاب دور معين
     * مثال: notifyRole('president', 'new_member', 'عضو جديد', '...')
     */
    public static function notifyRole(
        string $roleName,
        string $type,
        string $title,
        string $message,
        string $actionUrl = ''
    ): void {
        try {
            $stmt = self::db()->prepare("
                SELECT ur.user_id
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE r.name = :roleName
                  AND ur.is_active = 1
                  AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
            ");
            $stmt->execute([':roleName' => $roleName]);
            $userIds = $stmt->fetchAll(\PDO::FETCH_COLUMN);

            foreach ($userIds as $uid) {
                self::notify((int)$uid, $type, $title, $message, $actionUrl);
            }
        } catch (\Exception $e) {
            error_log('NotificationHelper::notifyRole error: ' . $e->getMessage());
        }
    }

    /**
     * إرسال إشعار لمستخدمين متعددين
     */
    public static function notifyMany(
        array  $userIds,
        string $type,
        string $title,
        string $message,
        string $actionUrl = ''
    ): void {
        foreach ($userIds as $uid) {
            self::notify((int)$uid, $type, $title, $message, $actionUrl);
        }
    }

    /**
     * إرسال إشعار لكل المستخدمين النشطين
     */
    public static function notifyAll(
        string $type,
        string $title,
        string $message,
        string $actionUrl = ''
    ): void {
        try {
            $stmt = self::db()->query(
                "SELECT id FROM users WHERE deleted_at IS NULL AND status = 'active'"
            );
            $userIds = $stmt->fetchAll(\PDO::FETCH_COLUMN);
            self::notifyMany($userIds, $type, $title, $message, $actionUrl);
        } catch (\Exception $e) {
            error_log('NotificationHelper::notifyAll error: ' . $e->getMessage());
        }
    }

    // ══════════════════════════════════════════
    //  دوال جاهزة للأحداث الشائعة
    // ══════════════════════════════════════════

    /** عند انضمام عضو جديد — يُرسل للرئيس */
    public static function onNewMember(string $memberName, int $memberId): void
    {
        self::notifyRole(
            'president',
            'new_member',
            '👤 عضو جديد انضم',
            "انضم {$memberName} كعضو جديد في الاتحاد",
            "/users/{$memberId}"
        );
    }

    /** عند إنشاء نشاط جديد — يُرسل لكل الأعضاء */
    public static function onNewActivity(string $activityTitle, int $activityId): void
    {
        self::notifyAll(
            'activity',
            '🎯 نشاط جديد',
            "تم إضافة نشاط جديد: {$activityTitle}",
            "/activities/{$activityId}"
        );
    }

    /** عند تجديد أو إنشاء اشتراك — يُرسل للرئيس */
    public static function onNewMembership(string $memberName, int $userId): void
    {
        self::notifyRole(
            'president',
            'membership',
            '🪪 طلب اشتراك جديد',
            "قدّم {$memberName} طلب اشتراك جديداً",
            "/memberships"
        );
    }

    /** عند إنشاء منشور — يُرسل لكل الأعضاء */
    public static function onNewPost(string $postTitle, int $postId): void
    {
        self::notifyAll(
            'post',
            '📢 منشور جديد',
            $postTitle,
            "/posts/{$postId}"
        );
    }

    /** عند فتح تذكرة دعم — يُرسل للرئيس */
    public static function onNewSupportTicket(string $memberName, int $ticketId): void
    {
        self::notifyRole(
            'president',
            'support_ticket',
            '🎫 طلب دعم جديد',
            "أرسل {$memberName} طلب دعم جديداً",
            "/support/{$ticketId}"
        );
    }

    /** عند إضافة معاملة مالية — يُرسل للرئيس */
    public static function onNewTransaction(string $type, float $amount): void
    {
        $typeAr  = $type === 'income' ? 'إيراد' : 'مصروف';
        $amountF = number_format($amount, 0, '.', ',');
        self::notifyRole(
            'president',
            'financial',
            '💰 معاملة مالية جديدة',
            "تمت إضافة {$typeAr} بمبلغ {$amountF}",
            "/finance"
        );
    }
}
