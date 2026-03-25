-- إدراج بيانات تجريبية لاختبار تذاكر الدعم
USE yemen_union_db;

-- 1. إدراج تذكرة تجريبية (استبدل user_id بـ ID عضو حقيقي)
INSERT INTO support_tickets (
    ticket_number, 
    user_id, 
    subject, 
    message, 
    priority, 
    status,
    created_at
) VALUES (
    'TKT-2025-TEST1',
    1, -- استبدل بـ ID عضو موجود
    'تذكرة تجريبية - مشكلة في الاشتراك',
    'هذه رسالة تجريبية لاختبار النظام. أواجه مشكلة في عرض الاشتراك الخاص بي.',
    'high',
    'open',
    NOW()
);

-- 2. إدراج تذكرة عاجلة
INSERT INTO support_tickets (
    ticket_number, 
    user_id, 
    subject, 
    message, 
    priority, 
    status,
    created_at
) VALUES (
    'TKT-2025-TEST2',
    1, -- استبدل بـ ID عضو موجود
    'طلب عاجل - استفسار عن النشاط القادم',
    'السلام عليكم، أريد الاستفسار عن موعد النشاط القادم وكيفية التسجيل فيه.',
    'urgent',
    'open',
    NOW()
);

-- 3. إدراج إشعار للمدير (استبدل user_id بـ ID مدير موجود)
INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    is_read,
    created_at
) VALUES (
    2, -- استبدل بـ ID مدير موجود
    'warning',
    'تذكرة دعم جديدة - TKT-2025-TEST2',
    'تم استلام تذكرة دعم جديدة من العضو
الأولوية: عاجلة
الموضوع: طلب عاجل - استفسار عن النشاط القادم',
    '/support/tickets/TKT-2025-TEST2',
    0,
    NOW()
);

-- 4. التحقق من الإدراج
SELECT 
    st.id,
    st.ticket_number,
    st.subject,
    st.priority,
    st.status,
    u.full_name as member_name,
    st.created_at
FROM support_tickets st
LEFT JOIN users u ON st.user_id = u.id
WHERE st.deleted_at IS NULL
ORDER BY st.created_at DESC;

-- 5. عرض الإشعارات
SELECT 
    n.id,
    n.title,
    n.type,
    n.is_read,
    u.full_name as recipient,
    n.created_at
FROM notifications n
LEFT JOIN users u ON n.user_id = u.id
WHERE n.title LIKE '%تذكرة%'
ORDER BY n.created_at DESC;
