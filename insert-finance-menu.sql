-- SQL Script to Insert Finance Menu Manually
-- Run this in phpMyAdmin if seeder fails

-- Use your database
USE super_apps_xboss;

-- Insert Finance Parent Menu
INSERT INTO `menus` (
    `name`,
    `menu_key`,
    `path`,
    `icon`,
    `children`,
    `parent_id`,
    `order`,
    `is_active`,
    `created_at`,
    `updated_at`
) VALUES (
    'Finance',
    'finance',
    '/dashboard/finance',
    'LayoutGrid',
    '[{"name":"Cashflow","menu_key":"cashflow","path":"/dashboard/finance/cashflow","icon":"BookOpen","order":1,"is_active":true,"children":null}]',
    NULL,
    4,
    1,
    NOW(),
    NOW()
);

-- Verify the insert
SELECT 'Finance menu inserted successfully!' AS status;
SELECT * FROM menus WHERE menu_key = 'finance';
SELECT * FROM menus WHERE JSON_CONTAINS(children, '{"menu_key": "cashflow"}', '$');
