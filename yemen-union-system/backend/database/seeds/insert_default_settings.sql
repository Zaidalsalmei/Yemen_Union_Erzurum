-- إدخال بيانات افتراضية في جدول settings

-- إعدادات العلامة التجارية
INSERT INTO `settings` (`setting_key`, `setting_value`, `category`, `data_type`, `label_ar`, `is_editable`, `is_public`) VALUES
('union_name_ar', 'اتحاد الطلاب اليمنيين - أرضروم', 'branding', 'string', 'اسم الاتحاد (عربي)', 1, 1),
('union_name_en', 'Yemen Student Union - Erzurum', 'branding', 'string', 'اسم الاتحاد (إنجليزي)', 1, 1),
('logo_path', NULL, 'branding', 'string', 'شعار الاتحاد', 1, 1),
('primary_color', '#DC2626', 'branding', 'string', 'اللون الأساسي', 1, 1),
('accent_color', '#991B1B', 'branding', 'string', 'اللون الثانوي', 1, 1),
('sidebar_color', '#1F2937', 'branding', 'string', 'لون القائمة الجانبية', 1, 1),
('sidebar_text_color', '#F9FAFB', 'branding', 'string', 'لون نص القائمة', 1, 1),
('watermark_enabled', 'true', 'branding', 'boolean', 'تفعيل العلامة المائية', 1, 1),
('watermark_opacity', '0.05', 'branding', 'number', 'شفافية العلامة المائية', 1, 1);

-- إعدادات النظام
INSERT INTO `settings` (`setting_key`, `setting_value`, `category`, `data_type`, `label_ar`, `is_editable`, `is_public`) VALUES
('default_currency', 'TRY', 'system', 'string', 'العملة الافتراضية', 1, 1),
('default_language', 'ar', 'system', 'string', 'اللغة الافتراضية', 1, 1),
('timezone', 'Europe/Istanbul', 'system', 'string', 'المنطقة الزمنية', 1, 1),
('max_activities_per_day', '5', 'system', 'number', 'الحد الأقصى للأنشطة يومياً', 1, 0),
('auto_approve_activities', 'false', 'system', 'boolean', 'الموافقة التلقائية على الأنشطة', 1, 0),
('membership_duration_months', '12', 'system', 'number', 'مدة العضوية (أشهر)', 1, 0),
('maintenance_mode', 'false', 'system', 'boolean', 'وضع الصيانة', 1, 0),
('registration_enabled', 'true', 'system', 'boolean', 'السماح بالتسجيل', 1, 1),
('max_upload_size', '5', 'system', 'number', 'الحد الأقصى لحجم الرفع (MB)', 1, 0);

-- إعدادات الإشعارات
INSERT INTO `settings` (`setting_key`, `setting_value`, `category`, `data_type`, `label_ar`, `is_editable`, `is_public`) VALUES
('email_notifications', 'true', 'notifications', 'boolean', 'إشعارات البريد الإلكتروني', 1, 0),
('sms_notifications', 'false', 'notifications', 'boolean', 'إشعارات الرسائل النصية', 1, 0),
('activity_reminders', 'true', 'notifications', 'boolean', 'تذكيرات الأنشطة', 1, 0),
('membership_expiry_alerts', 'true', 'notifications', 'boolean', 'تنبيهات انتهاء العضوية', 1, 0);
