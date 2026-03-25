-- Create the student user if not exists
INSERT INTO users (full_name, phone_number, password, email, status, created_at, updated_at) 
VALUES (
    'المستخدم التجريبي',
    '05395556050',
    '$2y$10$w8W9N9U2Kz7/K9uX4q7C6.T6N9Z9P9e9q8z7x6v5c4b3n2m1l0k9j', -- This is a placeholder, let's use a real hash for 'Mm@12345678'
    'test@example.com',
    'active',
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE id=id;
