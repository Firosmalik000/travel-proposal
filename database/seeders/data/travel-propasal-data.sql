/*
 Navicat Premium Data Transfer

 Source Server         : local
 Source Server Type    : MySQL
 Source Server Version : 80403 (8.4.3)
 Source Host           : localhost:3306
 Source Schema         : travel-propasal

 Target Server Type    : MySQL
 Target Server Version : 80403 (8.4.3)
 File Encoding         : 65001

 Date: 30/05/2026 23:58:44
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for activities
-- ----------------------------
DROP TABLE IF EXISTS `activities`;
CREATE TABLE `activities`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `sort_order` smallint UNSIGNED NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `activities_code_unique`(`code` ASC) USING BTREE,
  INDEX `activities_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `activities_updated_by_index`(`updated_by` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of activities
-- ----------------------------
INSERT INTO `activities` VALUES (1, 'ACT-DEPARTURE-BRIEFING', '\"Briefing Keberangkatan\"', '\"Briefing akhir sebelum keberangkatan, pembagian dokumen perjalanan, dan koordinasi rombongan jamaah.\"', 1, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `activities` VALUES (2, 'ACT-AIRPORT-HANDLING', '\"Handling Bandara\"', '\"Pendampingan proses check-in, bagasi, imigrasi, dan boarding di bandara keberangkatan.\"', 2, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `activities` VALUES (3, 'ACT-DEPARTURE-FLIGHT', '\"Penerbangan Keberangkatan\"', '\"Perjalanan udara menuju tanah suci sesuai maskapai dan jadwal yang telah ditentukan.\"', 3, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `activities` VALUES (4, 'ACT-ARRIVAL-TRANSFER', '\"Transfer Kedatangan\"', '\"Penjemputan rombongan jamaah dari bandara menuju hotel atau kota tujuan pertama.\"', 4, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `activities` VALUES (5, 'ACT-HOTEL-CHECKIN', '\"Check-in Hotel\"', '\"Proses pembagian kamar, pembagian koper, dan orientasi awal setibanya di hotel.\"', 5, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `activities` VALUES (6, 'ACT-MANASIK-ONSITE', '\"Manasik di Lokasi\"', '\"Pembekalan manasik di lokasi untuk memastikan jamaah siap menjalankan rangkaian ibadah.\"', 6, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `activities` VALUES (7, 'ACT-UMRAH-RITUAL', '\"Pelaksanaan Umroh\"', '\"Pelaksanaan rangkaian ibadah umroh yang meliputi ihram, thawaf, sa\\u2019i, dan tahallul dengan pendampingan pembimbing.\"', 7, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `activities` VALUES (8, 'ACT-ZIARAH-MAKKAH', '\"Ziarah Makkah\"', '\"Kunjungan ke lokasi bersejarah di Makkah seperti Jabal Tsur, Jabal Rahmah, dan area sekitarnya.\"', 8, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `activities` VALUES (9, 'ACT-ZIARAH-MADINAH', '\"Ziarah Madinah\"', '\"Kunjungan ke lokasi bersejarah di Madinah seperti Masjid Quba, Jabal Uhud, dan kebun kurma.\"', 9, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `activities` VALUES (10, 'ACT-FREE-IBADAH', '\"Ibadah Mandiri\"', '\"Waktu bebas bagi jamaah untuk memperbanyak ibadah pribadi di Masjidil Haram atau Masjid Nabawi.\"', 10, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `activities` VALUES (11, 'ACT-CITY-TRANSFER', '\"Transfer Antar Kota\"', '\"Perpindahan rombongan jamaah dari Makkah ke Madinah atau sebaliknya dengan bus atau kereta.\"', 11, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `activities` VALUES (12, 'ACT-HOTEL-CHECKOUT', '\"Check-out Hotel\"', '\"Persiapan check-out hotel, pengumpulan bagasi, dan briefing untuk agenda berikutnya.\"', 12, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `activities` VALUES (13, 'ACT-RETURN-FLIGHT', '\"Penerbangan Kepulangan\"', '\"Perjalanan udara kepulangan jamaah menuju Indonesia sesuai jadwal penerbangan yang ditetapkan.\"', 13, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `activities` VALUES (14, 'ACT-ARRIVAL-HOME', '\"Kedatangan di Tanah Air\"', '\"Kedatangan rombongan jamaah di tanah air dan proses akhir penjemputan atau distribusi kepulangan.\"', 14, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);

-- ----------------------------
-- Table structure for activity_logs
-- ----------------------------
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NULL DEFAULT NULL,
  `event_type` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `menu_key` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `subject_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `subject_id` bigint UNSIGNED NULL DEFAULT NULL,
  `method` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `route_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `properties` json NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `logged_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `activity_logs_event_type_logged_at_index`(`event_type` ASC, `logged_at` ASC) USING BTREE,
  INDEX `activity_logs_module_logged_at_index`(`module` ASC, `logged_at` ASC) USING BTREE,
  INDEX `activity_logs_user_id_logged_at_index`(`user_id` ASC, `logged_at` ASC) USING BTREE,
  INDEX `activity_logs_menu_key_logged_at_index`(`menu_key` ASC, `logged_at` ASC) USING BTREE,
  INDEX `activity_logs_subject_type_subject_id_index`(`subject_type` ASC, `subject_id` ASC) USING BTREE,
  CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 126 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of activity_logs
-- ----------------------------
INSERT INTO `activity_logs` VALUES (1, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:26:36', '2026-05-26 06:26:36', '2026-05-26 06:26:36');
INSERT INTO `activity_logs` VALUES (2, 1, 'view', 'master-data', 'dashboard', NULL, NULL, 'GET', 'master-data.inventory.index', 'admin/master-data/inventory', 'Melihat halaman pada module master data (route: master-data.inventory.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:26:36', '2026-05-26 06:26:36', '2026-05-26 06:26:36');
INSERT INTO `activity_logs` VALUES (3, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:26:36', '2026-05-26 06:26:36', '2026-05-26 06:26:36');
INSERT INTO `activity_logs` VALUES (4, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:26:37', '2026-05-26 06:26:37', '2026-05-26 06:26:37');
INSERT INTO `activity_logs` VALUES (5, 1, 'view', 'product-management', 'dashboard', NULL, NULL, 'GET', 'products.index', 'admin/product-management/products', 'Melihat halaman pada module product management (route: products.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:26:37', '2026-05-26 06:26:37', '2026-05-26 06:26:37');
INSERT INTO `activity_logs` VALUES (6, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:26:46', '2026-05-26 06:26:46', '2026-05-26 06:26:46');
INSERT INTO `activity_logs` VALUES (7, 1, 'view', 'master-data', 'dashboard', NULL, NULL, 'GET', 'master-data.inventory.index', 'admin/master-data/inventory', 'Melihat halaman pada module master data (route: master-data.inventory.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:26:46', '2026-05-26 06:26:46', '2026-05-26 06:26:46');
INSERT INTO `activity_logs` VALUES (8, 1, 'view', 'product-management', 'dashboard', NULL, NULL, 'GET', 'products.index', 'admin/product-management/products', 'Melihat halaman pada module product management (route: products.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:26:47', '2026-05-26 06:26:47', '2026-05-26 06:26:47');
INSERT INTO `activity_logs` VALUES (9, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:26:47', '2026-05-26 06:26:47', '2026-05-26 06:26:47');
INSERT INTO `activity_logs` VALUES (10, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:28:12', '2026-05-26 06:28:12', '2026-05-26 06:28:12');
INSERT INTO `activity_logs` VALUES (11, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:28:12', '2026-05-26 06:28:12', '2026-05-26 06:28:12');
INSERT INTO `activity_logs` VALUES (12, 1, 'view', 'master-data', 'dashboard', NULL, NULL, 'GET', 'master-data.inventory.index', 'admin/master-data/inventory', 'Melihat halaman pada module master data (route: master-data.inventory.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:28:14', '2026-05-26 06:28:14', '2026-05-26 06:28:14');
INSERT INTO `activity_logs` VALUES (13, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:28:14', '2026-05-26 06:28:14', '2026-05-26 06:28:14');
INSERT INTO `activity_logs` VALUES (14, 1, 'view', 'product-management', 'dashboard', NULL, NULL, 'GET', 'products.index', 'admin/product-management/products', 'Melihat halaman pada module product management (route: products.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:28:14', '2026-05-26 06:28:14', '2026-05-26 06:28:14');
INSERT INTO `activity_logs` VALUES (15, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:28:25', '2026-05-26 06:28:25', '2026-05-26 06:28:25');
INSERT INTO `activity_logs` VALUES (16, 1, 'view', 'master-data', 'dashboard', NULL, NULL, 'GET', 'master-data.inventory.index', 'admin/master-data/inventory', 'Melihat halaman pada module master data (route: master-data.inventory.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:28:25', '2026-05-26 06:28:25', '2026-05-26 06:28:25');
INSERT INTO `activity_logs` VALUES (17, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:28:30', '2026-05-26 06:28:30', '2026-05-26 06:28:30');
INSERT INTO `activity_logs` VALUES (18, 1, 'view', 'product-management', 'dashboard', NULL, NULL, 'GET', 'products.index', 'admin/product-management/products', 'Melihat halaman pada module product management (route: products.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:28:34', '2026-05-26 06:28:34', '2026-05-26 06:28:34');
INSERT INTO `activity_logs` VALUES (19, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:29:44', '2026-05-26 06:29:44', '2026-05-26 06:29:44');
INSERT INTO `activity_logs` VALUES (20, 1, 'view', 'admin', 'dashboard', NULL, NULL, 'GET', 'dashboard', 'admin', 'Melihat halaman pada module admin (route: dashboard)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:30:25', '2026-05-26 06:30:25', '2026-05-26 06:30:25');
INSERT INTO `activity_logs` VALUES (21, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:54:37', '2026-05-26 06:54:37', '2026-05-26 06:54:37');
INSERT INTO `activity_logs` VALUES (22, 1, 'view', 'booking-management', 'dashboard', NULL, NULL, 'GET', 'booking.register.index', 'admin/booking-management/register', 'Melihat halaman pada module booking management (route: booking.register.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:57:20', '2026-05-26 06:57:20', '2026-05-26 06:57:20');
INSERT INTO `activity_logs` VALUES (23, 1, 'view', 'booking-management', 'dashboard', NULL, NULL, 'GET', 'booking.register.index', 'admin/booking-management/register', 'Melihat halaman pada module booking management (route: booking.register.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 06:57:27', '2026-05-26 06:57:27', '2026-05-26 06:57:27');
INSERT INTO `activity_logs` VALUES (24, 1, 'view', 'booking-management', 'dashboard', NULL, NULL, 'GET', 'booking.register.index', 'admin/booking-management/register', 'Melihat halaman pada module booking management (route: booking.register.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 07:32:29', '2026-05-26 07:32:29', '2026-05-26 07:32:29');
INSERT INTO `activity_logs` VALUES (25, 1, 'view', 'master-data', 'dashboard', NULL, NULL, 'GET', 'master-data.inventory.index', 'admin/master-data/inventory', 'Melihat halaman pada module master data (route: master-data.inventory.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 07:32:34', '2026-05-26 07:32:34', '2026-05-26 07:32:34');
INSERT INTO `activity_logs` VALUES (26, 1, 'view', 'master-data', 'dashboard', NULL, NULL, 'GET', 'master-data.inventory.index', 'admin/master-data/inventory', 'Melihat halaman pada module master data (route: master-data.inventory.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 07:58:44', '2026-05-26 07:58:44', '2026-05-26 07:58:44');
INSERT INTO `activity_logs` VALUES (27, 1, 'view', 'administrator', 'dashboard', NULL, NULL, 'GET', 'users.index', 'admin/administrator/users', 'Melihat halaman pada module administrator (route: users.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 07:58:49', '2026-05-26 07:58:49', '2026-05-26 07:58:49');
INSERT INTO `activity_logs` VALUES (28, 1, 'view', 'administrator', 'dashboard', NULL, NULL, 'GET', 'roles.index', 'admin/administrator/roles', 'Melihat halaman pada module administrator (route: roles.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 07:58:52', '2026-05-26 07:58:52', '2026-05-26 07:58:52');
INSERT INTO `activity_logs` VALUES (29, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'website.index', 'admin/website-management/website', 'Melihat halaman pada module website management (route: website.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 07:59:29', '2026-05-26 07:59:29', '2026-05-26 07:59:29');
INSERT INTO `activity_logs` VALUES (30, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'articles.index', 'admin/website-management/articles', 'Melihat halaman pada module website management (route: articles.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 07:59:29', '2026-05-26 07:59:29', '2026-05-26 07:59:29');
INSERT INTO `activity_logs` VALUES (31, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 07:59:29', '2026-05-26 07:59:29', '2026-05-26 07:59:29');
INSERT INTO `activity_logs` VALUES (32, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'branding.index', 'admin/website-management/branding', 'Melihat halaman pada module website management (route: branding.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 07:59:38', '2026-05-26 07:59:38', '2026-05-26 07:59:38');
INSERT INTO `activity_logs` VALUES (33, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'seo.index', 'admin/website-management/seo', 'Melihat halaman pada module website management (route: seo.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:08:20', '2026-05-26 08:08:20', '2026-05-26 08:08:20');
INSERT INTO `activity_logs` VALUES (34, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'gallery.index', 'admin/website-management/gallery', 'Melihat halaman pada module website management (route: gallery.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:08:20', '2026-05-26 08:08:20', '2026-05-26 08:08:20');
INSERT INTO `activity_logs` VALUES (35, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'articles.index', 'admin/website-management/articles', 'Melihat halaman pada module website management (route: articles.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:08:22', '2026-05-26 08:08:22', '2026-05-26 08:08:22');
INSERT INTO `activity_logs` VALUES (36, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:08:24', '2026-05-26 08:08:24', '2026-05-26 08:08:24');
INSERT INTO `activity_logs` VALUES (37, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'gallery.index', 'admin/website-management/gallery', 'Melihat halaman pada module website management (route: gallery.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:09:14', '2026-05-26 08:09:14', '2026-05-26 08:09:14');
INSERT INTO `activity_logs` VALUES (38, 1, 'view', 'master-data', 'dashboard', NULL, NULL, 'GET', 'master-data.inventory.index', 'admin/master-data/inventory', 'Melihat halaman pada module master data (route: master-data.inventory.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:09:15', '2026-05-26 08:09:15', '2026-05-26 08:09:15');
INSERT INTO `activity_logs` VALUES (39, 1, 'view', 'product-management', 'dashboard', NULL, NULL, 'GET', 'product-categories.index', 'admin/product-management/categories', 'Melihat halaman pada module product management (route: product-categories.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:09:19', '2026-05-26 08:09:19', '2026-05-26 08:09:19');
INSERT INTO `activity_logs` VALUES (40, 1, 'view', 'product-management', 'dashboard', NULL, NULL, 'GET', 'products.index', 'admin/product-management/products', 'Melihat halaman pada module product management (route: products.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:09:19', '2026-05-26 08:09:19', '2026-05-26 08:09:19');
INSERT INTO `activity_logs` VALUES (41, 1, 'view', 'product-management', 'dashboard', NULL, NULL, 'GET', 'packages.index', 'admin/product-management/packages', 'Melihat halaman pada module product management (route: packages.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:09:20', '2026-05-26 08:09:20', '2026-05-26 08:09:20');
INSERT INTO `activity_logs` VALUES (42, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'seo.index', 'admin/website-management/seo', 'Melihat halaman pada module website management (route: seo.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:09:22', '2026-05-26 08:09:22', '2026-05-26 08:09:22');
INSERT INTO `activity_logs` VALUES (43, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'gallery.index', 'admin/website-management/gallery', 'Melihat halaman pada module website management (route: gallery.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:09:22', '2026-05-26 08:09:22', '2026-05-26 08:09:22');
INSERT INTO `activity_logs` VALUES (44, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:09:22', '2026-05-26 08:09:22', '2026-05-26 08:09:22');
INSERT INTO `activity_logs` VALUES (45, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'branding.index', 'admin/website-management/branding', 'Melihat halaman pada module website management (route: branding.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:09:31', '2026-05-26 08:09:31', '2026-05-26 08:09:31');
INSERT INTO `activity_logs` VALUES (46, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'articles.index', 'admin/website-management/articles', 'Melihat halaman pada module website management (route: articles.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:10:21', '2026-05-26 08:10:21', '2026-05-26 08:10:21');
INSERT INTO `activity_logs` VALUES (47, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'website.index', 'admin/website-management/website', 'Melihat halaman pada module website management (route: website.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:10:21', '2026-05-26 08:10:21', '2026-05-26 08:10:21');
INSERT INTO `activity_logs` VALUES (48, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:10:21', '2026-05-26 08:10:21', '2026-05-26 08:10:21');
INSERT INTO `activity_logs` VALUES (49, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:11:46', '2026-05-26 08:11:46', '2026-05-26 08:11:46');
INSERT INTO `activity_logs` VALUES (50, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:14:52', '2026-05-26 08:14:52', '2026-05-26 08:14:52');
INSERT INTO `activity_logs` VALUES (51, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'seo.index', 'admin/website-management/seo', 'Melihat halaman pada module website management (route: seo.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:15:27', '2026-05-26 08:15:27', '2026-05-26 08:15:27');
INSERT INTO `activity_logs` VALUES (52, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'gallery.index', 'admin/website-management/gallery', 'Melihat halaman pada module website management (route: gallery.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:15:27', '2026-05-26 08:15:27', '2026-05-26 08:15:27');
INSERT INTO `activity_logs` VALUES (53, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'branding.index', 'admin/website-management/branding', 'Melihat halaman pada module website management (route: branding.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:15:27', '2026-05-26 08:15:27', '2026-05-26 08:15:27');
INSERT INTO `activity_logs` VALUES (54, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:15:51', '2026-05-26 08:15:51', '2026-05-26 08:15:51');
INSERT INTO `activity_logs` VALUES (55, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:16:25', '2026-05-26 08:16:25', '2026-05-26 08:16:25');
INSERT INTO `activity_logs` VALUES (56, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'gallery.index', 'admin/website-management/gallery', 'Melihat halaman pada module website management (route: gallery.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:16:36', '2026-05-26 08:16:36', '2026-05-26 08:16:36');
INSERT INTO `activity_logs` VALUES (57, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'articles.index', 'admin/website-management/articles', 'Melihat halaman pada module website management (route: articles.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:16:36', '2026-05-26 08:16:36', '2026-05-26 08:16:36');
INSERT INTO `activity_logs` VALUES (58, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'landing.index', 'admin/website-management/landing', 'Melihat halaman pada module website management (route: landing.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:16:38', '2026-05-26 08:16:38', '2026-05-26 08:16:38');
INSERT INTO `activity_logs` VALUES (59, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'seo.index', 'admin/website-management/seo', 'Melihat halaman pada module website management (route: seo.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:16:54', '2026-05-26 08:16:54', '2026-05-26 08:16:54');
INSERT INTO `activity_logs` VALUES (60, 1, 'view', 'website-management', 'dashboard', NULL, NULL, 'GET', 'branding.index', 'admin/website-management/branding', 'Melihat halaman pada module website management (route: branding.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:16:57', '2026-05-26 08:16:57', '2026-05-26 08:16:57');
INSERT INTO `activity_logs` VALUES (61, 1, 'view', 'product-management', 'dashboard', NULL, NULL, 'GET', 'product-categories.index', 'admin/product-management/categories', 'Melihat halaman pada module product management (route: product-categories.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:16:59', '2026-05-26 08:16:59', '2026-05-26 08:16:59');
INSERT INTO `activity_logs` VALUES (62, 1, 'view', 'financial-management', 'dashboard', NULL, NULL, 'GET', 'financial.report.index', 'admin/financial-management/financial-report', 'Melihat halaman pada module financial management (route: financial.report.index)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:17:06', '2026-05-26 08:17:06', '2026-05-26 08:17:06');
INSERT INTO `activity_logs` VALUES (63, 1, 'update', 'website-management', 'dashboard', NULL, NULL, 'PATCH', 'gallery.update', 'admin/website-management/gallery/1', 'Memperbarui data pada module website management (route: gallery.update)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 08:21:23', '2026-05-26 08:21:23', '2026-05-26 08:21:23');
INSERT INTO `activity_logs` VALUES (64, 1, 'login', 'auth', NULL, NULL, NULL, 'POST', 'login.store', 'login', 'User login ke sistem.', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 14:01:21', '2026-05-26 14:01:21', '2026-05-26 14:01:21');
INSERT INTO `activity_logs` VALUES (65, 1, 'login', 'auth', NULL, NULL, NULL, 'POST', 'login.store', 'login', 'User login ke sistem.', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 17:44:08', '2026-05-26 17:44:08', '2026-05-26 17:44:08');
INSERT INTO `activity_logs` VALUES (66, 1, 'update', 'website_management', NULL, NULL, NULL, 'PATCH', 'content.update', 'admin/website-management/content/19', 'Memperbarui data pada module website_management (route: content.update)', '{\"path\": \"admin/website-management/content/19\", \"query\": [], \"method\": \"PATCH\", \"payload\": {\"media\": [], \"title\": \"Landing Asfar Tour\", \"_method\": \"PATCH\", \"content\": {\"faq\": {\"title\": \"Pertanyaan yang Sering Ditanyakan\", \"description\": \"Temukan jawaban atas pertanyaan jamaah kami.\"}, \"hero\": {\"image\": \"/images/dummy.jpg\", \"label\": \"Hajj & Umrah Terpercaya\", \"title\": \"Perjalanan\\nMenuju\\nTanah Suci\\nImpian Anda\", \"cta_label\": \"?? Konsultasi Gratis\", \"description\": \"Bersama Asfar Tour, setiap langkah ibadah Anda kami jaga dengan sepenuh hati. Didampingi mutawif berpengalaman, fasilitas premium, dan layanan tulus.\", \"feature_cards\": [{\"icon\": \"hotel\", \"title\": \"Hotel Premium Pilihan\", \"description\": \"Dekat Masjidil Haram & Nabawi\"}, {\"icon\": \"plane\", \"title\": \"Penerbangan Direct\", \"description\": \"Jakarta ? Madinah Non-stop\"}, {\"icon\": \"images\", \"title\": \"Free Dokumentasi\", \"description\": \"Kenangan ibadah Anda abadi\"}], \"secondary_cta_href\": \"/paket-umroh\", \"secondary_cta_label\": \"Lihat Paket ?\"}, \"about\": {\"cta\": \"Baca Selengkapnya\", \"label\": \"Tentang Kami\", \"title\": \"Pelayanan Umroh yang Tertata dan Menenangkan\", \"description\": \"Kami mengelola keberangkatan umroh dengan alur yang jelas, pendampingan ibadah, dan komunikasi yang transparan.\", \"image_primary\": \"/images/dummy.jpg\", \"image_secondary\": \"/images/dummy.jpg\"}, \"stats\": [{\"label\": \"Jamaah Diberangkatkan\", \"value\": \"500+\"}, {\"label\": \"Tahun Pengalaman\", \"value\": \"10+\"}, {\"label\": \"Rating Jamaah\", \"value\": \"4.9?\"}, {\"label\": \"Program Terlaksana\", \"value\": \"50+\"}], \"footer\": {\"brand\": \"ASFAR TOUR\", \"subtitle\": \"Hajj & Umrah\", \"copyright\": \"2025 Asfar Tour  Terdaftar Kemenag RI\"}, \"contact\": {\"label\": \"Kontak Cepat\", \"title\": \"Siap berangkat? Konsultasi gratis dulu.\", \"description\": \"Konsultasikan kebutuhan ibadah Anda bersama tim kami. Gratis, tanpa syarat, tanpa tekanan.\", \"banner_image\": \"/images/dummy.jpg\", \"banner_title\": \"Siap Melangkah ke\\nTanah Suci?\", \"address_label\": \"Alamat\", \"banner_kicker\": \"Mulai Perjalanan Anda\", \"contact_label\": \"Lihat Kontak Lengkap\", \"secondary_href\": \"/paket-umroh\", \"whatsapp_label\": \"?? Chat Admin WhatsApp Sekarang\", \"secondary_label\": \"Lihat Paket\", \"contact_info_label\": \"Kontak\", \"navbar_whatsapp_label\": \"?? Chat Admin\"}, \"gallery\": {\"title\": \"Galeri Perjalanan\", \"images\": [], \"cta_label\": \"OUR HISTORY\", \"description\": \"Momen-momen berharga selama perjalanan jamaah.\"}, \"problem\": {\"label\": \"PENTING DIKETAHUI\", \"quote\": \"Kami memahami kekhawatiran itu. Karena itu, kami hadir dengan sistem yang jelas dan transparan.\", \"badges\": [\"Biaya tiba-tiba berubah di tengah jalan\", \"Minimnya informasi & komunikasi\", \"Jadwal keberangkatan tidak jelas\", \"Takut tertipu travel yang tidak amanah\"], \"heading\": \"Banyak Jamaah Gagal Berangkat Bukan Karena Niat, Tapi Karena Salah Pilih Travel\"}, \"articles\": {\"label\": \"Artikel\", \"heading\": \"News & Update Terbaru\", \"cta_label\": \"Lihat Semua Artikel\", \"empty_title\": \"Belum ada artikel yang tampil.\", \"read_more_label\": \"Baca selengkapnya\", \"empty_description\": \"Pastikan artikel sudah berstatus Terbit dan tanggal publikasinya tidak di masa depan.\", \"fallback_item_title_prefix\": \"Artikel\"}, \"packages\": {\"title\": \"Pilihan Paket\", \"heading\": \"Paket Umrah Kami\", \"cta_label\": \"Lihat Paket\", \"description\": \"Pilih paket yang sesuai dengan kebutuhan dan budget perjalanan ibadah Anda.\", \"detail_label\": \"Tanya Paket Ini ?\", \"price_prefix\": \"Mulai\", \"fallback_name\": \"Paket Umroh\", \"duration_suffix\": \"Hari\", \"fallback_summary\": \"Detail paket akan tampil di sini.\", \"discount_badge_label\": \"UNGGULAN\", \"selected_package_ids\": []}, \"services\": {\"items\": [{\"icon\": \"heart-handshake\", \"title\": \"Mutawif Berpengalaman\", \"image_path\": \"/images/dummy.jpg\", \"description\": \"Didampingi pembimbing ibadah profesional yang hafal rute, doa, dan ritual di Tanah Suci.\"}, {\"icon\": \"plane\", \"title\": \"Penerbangan Direct\", \"image_path\": \"/images/dummy.jpg\", \"description\": \"Penerbangan langsung tanpa transit untuk kenyamanan dan efisiensi waktu jamaah.\"}, {\"icon\": \"images\", \"title\": \"Free Dokumentasi\", \"image_path\": \"/images/dummy.jpg\", \"description\": \"Setiap momen berharga ibadah Anda diabadikan secara profesional sebagai kenangan seumur hidup.\"}, {\"icon\": \"shield-check\", \"title\": \"Legal & Amanah\", \"image_path\": \"/images/dummy.jpg\", \"description\": \"Terdaftar resmi di Kemenag RI. Kepercayaan jamaah adalah prioritas utama kami.\"}], \"label\": \"Layanan Kami\", \"title\": \"Mengapa Asfar Tour\", \"heading\": \"Ibadah Lebih Bermakna\\nBersama Kami\", \"description\": \"Kami tidak sekadar memberangkatkan - kami memastikan setiap momen ibadah Anda berjalan sempurna.\", \"heading_top\": \"Ibadah Lebih\", \"heading_bottom\": \"Bersama Kami\", \"highlight_word\": \"Bermakna\", \"heading_highlight\": \"Bermakna\", \"fallback_description\": \"Deskripsi layanan akan tampil di sini.\", \"fallback_title_prefix\": \"Layanan\"}, \"timeline\": {\"label\": \"Alur Perjalanan yang Kami Jalankan\", \"steps\": [{\"icon\": \"users\", \"title\": \"Registrasi\", \"caption\": \"DAFTAR & KONSULTASI\", \"description\": \"Konsultasi & pilih paket yang sesuai.\"}, {\"icon\": \"credit-card\", \"title\": \"Pembayaran\", \"caption\": \"DP / PELUNASAN\", \"description\": \"Skema biaya jelas, konfirmasi transparan.\"}, {\"icon\": \"check-circle-2\", \"title\": \"Persiapan Umroh\", \"caption\": \"MANASIK & DOKUMEN\", \"description\": \"Manasik, perlengkapan, dan dokumen.\"}, {\"icon\": \"plane\", \"title\": \"Keberangkatan\", \"caption\": \"BERANGKAT BARENG\", \"description\": \"Briefing & pendampingan sebelum berangkat.\"}, {\"icon\": \"landmark\", \"title\": \"Ibadah\", \"caption\": \"BIMBINGAN IBADAH\", \"description\": \"Bimbingan ibadah sepanjang perjalanan.\"}, {\"icon\": \"calendar-days\", \"title\": \"Kepulangan\", \"caption\": \"PULANG AMAN\", \"description\": \"Kontrol perjalanan sampai tiba di tanah air.\"}], \"heading\": \"Sistem Perjalanan yang Jelas, Bukan Sekadar Janji\", \"value_cards\": [{\"icon\": \"shield-check\", \"title\": \"Transparansi Biaya\", \"description\": \"Rincian biaya jelas sejak awal, tanpa kejutan di tengah jalan.\"}, {\"icon\": \"calendar-days\", \"title\": \"Timeline Terencana\", \"description\": \"Jadwal terstruktur dari pendaftaran sampai kepulangan.\"}, {\"icon\": \"heart-handshake\", \"title\": \"Pendampingan Ibadah\", \"description\": \"Pembimbing berpengalaman memastikan ibadah lebih tenang dan khusyuk.\"}, {\"icon\": \"check-circle-2\", \"title\": \"Sistem Terstruktur\", \"description\": \"Proses administrasi, keberangkatan, dan pelayanan berjalan rapi.\"}]}, \"testimonials\": {\"title\": \"Testimoni Jamaah\", \"heading\": \"Mereka Sudah Merasakan\", \"next_label\": \"Berikutnya\", \"prev_label\": \"Sebelumnya\", \"description\": \"Kepercayaan jamaah adalah kebanggaan terbesar Asfar Tour.\", \"fallback_quote\": \"Kepercayaan jamaah adalah kebanggaan terbesar Asfar Tour.\", \"featured_label\": \"UNGGULAN\"}}, \"excerpt\": \"Konten landing baru untuk halaman /landing.\", \"is_active\": true}, \"module_key\": \"website_management\", \"route_name\": \"content.update\", \"module_name\": \"Website Management\", \"status_code\": 302, \"submenu_key\": null, \"submenu_name\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 18:06:07', '2026-05-26 18:06:07', '2026-05-26 18:06:07');
INSERT INTO `activity_logs` VALUES (67, 1, 'create', 'financial_management', 'cashflow', NULL, NULL, 'POST', 'cashflow.store', 'admin/financial-management/cashflow', 'Membuat data pada module financial_management (route: cashflow.store)', '{\"path\": \"admin/financial-management/cashflow\", \"query\": [], \"method\": \"POST\", \"payload\": {\"type\": \"expense\", \"amount\": \"2000000\", \"category\": \"operasional\", \"attachments\": [{\"size\": 650983, \"mime_type\": \"image/png\", \"original_name\": \"screencapture-travel-proposal-test-landing-2026-05-25-21_45_55.png\"}], \"description\": \"test\", \"transaction_date\": \"2026-05-27\"}, \"module_key\": \"financial_management\", \"route_name\": \"cashflow.store\", \"module_name\": \"Financial Management\", \"status_code\": 302, \"submenu_key\": \"cashflow\", \"submenu_name\": \"Cashflow\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 19:15:28', '2026-05-26 19:15:28', '2026-05-26 19:15:28');
INSERT INTO `activity_logs` VALUES (68, 1, 'login', 'auth', NULL, NULL, NULL, 'POST', 'login.store', 'login', 'User login ke sistem.', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-28 02:17:43', '2026-05-28 02:17:43', '2026-05-28 02:17:43');
INSERT INTO `activity_logs` VALUES (69, 1, 'create', 'master_data', 'hotel', NULL, NULL, 'POST', 'master-data.hotels.room-types.store', 'admin/master-data/hotels/room-types', 'Membuat data pada module master_data (route: master-data.hotels.room-types.store)', '{\"path\": \"admin/master-data/hotels/room-types\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": null}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotels.room-types.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel\", \"submenu_name\": \"Hotel\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-28 06:39:22', '2026-05-28 06:39:22', '2026-05-28 06:39:22');
INSERT INTO `activity_logs` VALUES (70, 1, 'login', 'auth', NULL, NULL, NULL, 'POST', 'login.store', 'login', 'User login ke sistem.', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-28 14:23:25', '2026-05-28 14:23:25', '2026-05-28 14:23:25');
INSERT INTO `activity_logs` VALUES (71, 1, 'login', 'auth', NULL, NULL, NULL, 'POST', 'login.store', 'login', 'User login ke sistem.', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 01:13:38', '2026-05-29 01:13:38', '2026-05-29 01:13:38');
INSERT INTO `activity_logs` VALUES (72, 1, 'create', 'product_management', 'package', NULL, NULL, 'POST', 'packages.update', 'admin/product-management/packages/6', 'Membuat data pada module product_management (route: packages.update)', '{\"path\": \"admin/product-management/packages/6\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": {\"en\": \"Umroh Basic 9 Hari\", \"id\": \"Umroh Basic 9 Hari\"}, \"slug\": \"umroh-basic-9-hari\", \"price\": \"29029000\", \"_method\": \"POST\", \"content\": \"{\\\"room\\\":\\\"Quad sharing\\\",\\\"badge\\\":\\\"Best Value\\\",\\\"hotel\\\":\\\"Hotel area Ajyad / setara\\\",\\\"meals\\\":\\\"Makan terjadwal\\\",\\\"period\\\":\\\"Agustus - Oktober 2026\\\",\\\"policy\\\":\\\"Pembatalan 30 hari sebelum keberangkatan dikenakan biaya 25%. Pembatalan kurang dari 14 hari tidak dapat dikembalikan.\\\",\\\"airline\\\":\\\"Saudia Airlines\\\",\\\"excluded\\\":\\\"Pengeluaran pribadi\\\\nOleh-oleh\\\\nBiaya paspor (jika belum punya)\\\",\\\"handling\\\":\\\"Handling bandara Jakarta\\\",\\\"included\\\":\\\"Tiket pesawat PP Saudia\\\\nVisa umroh resmi\\\\nHotel bintang 3 Makkah & Madinah...\", \"summary\": {\"en\": \"Paket basic untuk jamaah yang mengutamakan harga terjangkau dengan layanan inti lengkap.\", \"id\": \"Paket basic untuk jamaah yang mengutamakan harga terjangkau dengan layanan inti lengkap.\"}, \"currency\": \"IDR\", \"is_active\": \"1\", \"is_featured\": \"1\", \"itineraries\": \"[{\\\"id\\\":1,\\\"activity_id\\\":null,\\\"activity_ids\\\":[],\\\"day_number\\\":1,\\\"sort_order\\\":1,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":2,\\\"activity_id\\\":null,\\\"activity_ids\\\":[],\\\"day_number\\\":2,\\\"sort_order\\\":2,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":3,\\\"activity_id\\\":null,\\\"activity_ids\\\":[],\\\"day_number\\\":3,\\\"sort_order\\\":3,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":4,\\\"activity_id\\\":null,\\\"activity_ids\\\":[],\\\"...\", \"product_ids\": [\"1\", \"4\", \"9\", \"5\", \"11\", \"13\", \"68\"], \"package_type\": \"reguler\", \"duration_days\": \"9\", \"departure_city\": \"Jakarta\", \"discount_label\": \"EARLY BIRD\", \"original_price\": \"31900000\", \"existing_images\": [\"/images/dummy.jpg\"], \"discount_ends_at\": \"2026-08-15 23:59\"}, \"module_key\": \"product_management\", \"route_name\": \"packages.update\", \"module_name\": \"Product Management\", \"status_code\": 302, \"submenu_key\": \"package\", \"submenu_name\": \"Package\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 01:34:18', '2026-05-29 01:34:18', '2026-05-29 01:34:18');
INSERT INTO `activity_logs` VALUES (73, 1, 'create', 'product_management', 'package', NULL, NULL, 'POST', 'packages.update', 'admin/product-management/packages/8', 'Membuat data pada module product_management (route: packages.update)', '{\"path\": \"admin/product-management/packages/8\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": {\"en\": \"Umroh Premium 12 Hari\", \"id\": \"Umroh Premium 12 Hari\"}, \"slug\": \"umroh-premium-12-hari\", \"price\": \"49959000\", \"_method\": \"POST\", \"content\": \"{\\\"room\\\":\\\"Double sharing premium\\\",\\\"badge\\\":\\\"VIP Premium\\\",\\\"hotel\\\":\\\"Hotel bintang 5 walking distance ke Masjidil Haram\\\",\\\"meals\\\":\\\"Menu premium 3 kali sehari\\\",\\\"period\\\":\\\"Oktober - Desember 2026\\\",\\\"policy\\\":\\\"Pembatalan 45 hari sebelum keberangkatan dikenakan biaya 20%. Pembatalan kurang dari 21 hari tidak dapat dikembalikan.\\\",\\\"ziarah\\\":\\\"City tour premium dan ziarah terarah\\\",\\\"airline\\\":\\\"Garuda Indonesia Business Class\\\",\\\"excluded\\\":\\\"Pengeluaran pribadi\\\\nOleh-oleh\\\",\\\"handling\\\":\\\"Fast track dan handling prioritas\\\"...\", \"summary\": {\"en\": \"Paket premium dengan hotel bintang 5 sangat dekat Masjidil Haram dan durasi lebih longgar untuk ibadah yang tenang.\", \"id\": \"Paket premium dengan hotel bintang 5 sangat dekat Masjidil Haram dan durasi lebih longgar untuk ibadah yang tenang.\"}, \"currency\": \"IDR\", \"is_active\": \"1\", \"is_featured\": \"1\", \"itineraries\": \"[{\\\"id\\\":20,\\\"activity_id\\\":null,\\\"activity_ids\\\":[],\\\"day_number\\\":1,\\\"sort_order\\\":1,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":21,\\\"activity_id\\\":null,\\\"activity_ids\\\":[],\\\"day_number\\\":2,\\\"sort_order\\\":2,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":22,\\\"activity_id\\\":null,\\\"activity_ids\\\":[],\\\"day_number\\\":3,\\\"sort_order\\\":3,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":23,\\\"activity_id\\\":null,\\\"activity_ids\\\":...\", \"product_ids\": [\"1\", \"2\", \"3\", \"9\", \"10\", \"5\", \"11\", \"12\", \"13\", \"73\"], \"package_type\": \"vip\", \"duration_days\": \"12\", \"departure_city\": \"Jakarta\", \"discount_label\": \"HEMAT 9%\", \"original_price\": \"54900000\", \"existing_images\": [\"/images/dummy.jpg\"], \"discount_ends_at\": \"2026-10-01 23:59\"}, \"module_key\": \"product_management\", \"route_name\": \"packages.update\", \"module_name\": \"Product Management\", \"status_code\": 302, \"submenu_key\": \"package\", \"submenu_name\": \"Package\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 01:34:55', '2026-05-29 01:34:55', '2026-05-29 01:34:55');
INSERT INTO `activity_logs` VALUES (74, 1, 'create', 'product_management', 'package', NULL, NULL, 'POST', 'packages.update', 'admin/product-management/packages/7', 'Membuat data pada module product_management (route: packages.update)', '{\"path\": \"admin/product-management/packages/7\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": {\"en\": \"Umroh Regular 10 Hari\", \"id\": \"Umroh Regular 10 Hari\"}, \"slug\": \"umroh-regular-10-hari\", \"price\": \"36708000\", \"_method\": \"POST\", \"content\": \"{\\\"room\\\":\\\"Triple / quad sharing\\\",\\\"badge\\\":\\\"Pilihan Keluarga\\\",\\\"hotel\\\":\\\"Hotel bintang 4 dekat Masjidil Haram\\\",\\\"meals\\\":\\\"3 kali makan menu Indonesia\\\",\\\"period\\\":\\\"September - November 2026\\\",\\\"policy\\\":\\\"Pembatalan 30 hari sebelum keberangkatan dikenakan biaya 25%. Pembatalan kurang dari 14 hari tidak dapat dikembalikan.\\\",\\\"ziarah\\\":\\\"Program ziarah Makkah dan Madinah\\\",\\\"airline\\\":\\\"Garuda Indonesia\\\",\\\"excluded\\\":\\\"Pengeluaran pribadi\\\\nOleh-oleh\\\",\\\"handling\\\":\\\"Handling bandara dan hotel\\\",\\\"included\\\":\\\"Tiket pesawat PP Ga...\", \"summary\": {\"en\": \"Paket seimbang untuk keluarga dan jamaah umum dengan hotel nyaman serta pembimbing berpengalaman.\", \"id\": \"Paket seimbang untuk keluarga dan jamaah umum dengan hotel nyaman serta pembimbing berpengalaman.\"}, \"currency\": \"IDR\", \"is_active\": \"1\", \"is_featured\": \"1\", \"itineraries\": \"[{\\\"id\\\":10,\\\"activity_id\\\":null,\\\"activity_ids\\\":[],\\\"day_number\\\":1,\\\"sort_order\\\":1,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":11,\\\"activity_id\\\":null,\\\"activity_ids\\\":[],\\\"day_number\\\":2,\\\"sort_order\\\":2,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":12,\\\"activity_id\\\":null,\\\"activity_ids\\\":[],\\\"day_number\\\":3,\\\"sort_order\\\":3,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":13,\\\"activity_id\\\":null,\\\"activity_ids\\\":...\", \"product_ids\": [\"1\", \"3\", \"9\", \"10\", \"5\", \"11\", \"12\", \"13\", \"56\"], \"package_type\": \"reguler\", \"duration_days\": \"10\", \"departure_city\": \"Jakarta\", \"discount_label\": \"FAMILY DEAL\", \"original_price\": \"39900000\", \"existing_images\": [\"/images/dummy.jpg\"], \"discount_ends_at\": \"2026-09-01 23:59\"}, \"module_key\": \"product_management\", \"route_name\": \"packages.update\", \"module_name\": \"Product Management\", \"status_code\": 302, \"submenu_key\": \"package\", \"submenu_name\": \"Package\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 01:35:21', '2026-05-29 01:35:21', '2026-05-29 01:35:21');
INSERT INTO `activity_logs` VALUES (75, 1, 'create', 'product_management', 'package', NULL, NULL, 'POST', 'packages.update', 'admin/product-management/packages/9', 'Membuat data pada module product_management (route: packages.update)', '{\"path\": \"admin/product-management/packages/9\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": {\"en\": \"Umroh Basic 9 Hari\", \"id\": \"Umroh Basic 9 Hari\"}, \"slug\": \"umroh-basic-9-hari\", \"price\": \"29029000\", \"_method\": \"POST\", \"content\": \"{\\\"room\\\":\\\"Quad sharing\\\",\\\"badge\\\":\\\"Best Value\\\",\\\"hotel\\\":\\\"Hotel area Ajyad / setara\\\",\\\"meals\\\":\\\"Makan terjadwal\\\",\\\"period\\\":\\\"Agustus - Oktober 2026\\\",\\\"policy\\\":\\\"Pembatalan 30 hari sebelum keberangkatan dikenakan biaya 25%. Pembatalan kurang dari 14 hari tidak dapat dikembalikan.\\\",\\\"airline\\\":\\\"Saudia Airlines\\\",\\\"excluded\\\":\\\"Pengeluaran pribadi\\\\nOleh-oleh\\\\nBiaya paspor (jika belum punya)\\\",\\\"handling\\\":\\\"Handling bandara Jakarta\\\",\\\"included\\\":\\\"Tiket pesawat PP Saudia\\\\nVisa umroh resmi\\\\nHotel bintang 3 Makkah & Madinah...\", \"summary\": {\"en\": \"Paket basic untuk jamaah yang mengutamakan harga terjangkau dengan layanan inti lengkap.\", \"id\": \"Paket basic untuk jamaah yang mengutamakan harga terjangkau dengan layanan inti lengkap.\"}, \"currency\": \"IDR\", \"is_active\": \"1\", \"is_featured\": \"1\", \"itineraries\": \"[{\\\"id\\\":32,\\\"activity_id\\\":3,\\\"activity_ids\\\":[3],\\\"day_number\\\":1,\\\"sort_order\\\":1,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":33,\\\"activity_id\\\":5,\\\"activity_ids\\\":[5],\\\"day_number\\\":2,\\\"sort_order\\\":2,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":34,\\\"activity_id\\\":6,\\\"activity_ids\\\":[6],\\\"day_number\\\":3,\\\"sort_order\\\":3,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":35,\\\"activity_id\\\":7,\\\"activity_ids\\\":[7],\\\"day_...\", \"product_ids\": [\"1\", \"4\", \"9\", \"5\", \"11\", \"13\", \"67\"], \"package_type\": \"reguler\", \"duration_days\": \"9\", \"departure_city\": \"Jakarta\", \"discount_label\": \"EARLY BIRD\", \"original_price\": \"31900000\", \"existing_images\": [\"/images/dummy.jpg\"], \"discount_ends_at\": \"2026-08-15 23:59\"}, \"module_key\": \"product_management\", \"route_name\": \"packages.update\", \"module_name\": \"Product Management\", \"status_code\": 302, \"submenu_key\": \"package\", \"submenu_name\": \"Package\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 01:39:33', '2026-05-29 01:39:33', '2026-05-29 01:39:33');
INSERT INTO `activity_logs` VALUES (76, 1, 'create', 'product_management', 'package', NULL, NULL, 'POST', 'packages.update', 'admin/product-management/packages/11', 'Membuat data pada module product_management (route: packages.update)', '{\"path\": \"admin/product-management/packages/11\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": {\"en\": \"Umroh Premium 12 Hari\", \"id\": \"Umroh Premium 12 Hari\"}, \"slug\": \"umroh-premium-12-hari\", \"price\": \"49959000\", \"_method\": \"POST\", \"content\": \"{\\\"room\\\":\\\"Double sharing premium\\\",\\\"badge\\\":\\\"VIP Premium\\\",\\\"hotel\\\":\\\"Hotel bintang 5 walking distance ke Masjidil Haram\\\",\\\"meals\\\":\\\"Menu premium 3 kali sehari\\\",\\\"period\\\":\\\"Oktober - Desember 2026\\\",\\\"policy\\\":\\\"Pembatalan 45 hari sebelum keberangkatan dikenakan biaya 20%. Pembatalan kurang dari 21 hari tidak dapat dikembalikan.\\\",\\\"ziarah\\\":\\\"City tour premium dan ziarah terarah\\\",\\\"airline\\\":\\\"Garuda Indonesia Business Class\\\",\\\"excluded\\\":\\\"Pengeluaran pribadi\\\\nOleh-oleh\\\",\\\"handling\\\":\\\"Fast track dan handling prioritas\\\"...\", \"summary\": {\"en\": \"Paket premium dengan hotel bintang 5 sangat dekat Masjidil Haram dan durasi lebih longgar untuk ibadah yang tenang.\", \"id\": \"Paket premium dengan hotel bintang 5 sangat dekat Masjidil Haram dan durasi lebih longgar untuk ibadah yang tenang.\"}, \"currency\": \"IDR\", \"is_active\": \"1\", \"is_featured\": \"1\", \"itineraries\": \"[{\\\"id\\\":51,\\\"activity_id\\\":3,\\\"activity_ids\\\":[3],\\\"day_number\\\":1,\\\"sort_order\\\":1,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":52,\\\"activity_id\\\":5,\\\"activity_ids\\\":[5],\\\"day_number\\\":2,\\\"sort_order\\\":2,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":53,\\\"activity_id\\\":6,\\\"activity_ids\\\":[6],\\\"day_number\\\":3,\\\"sort_order\\\":3,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":54,\\\"activity_id\\\":7,\\\"activity_ids\\\":[7],\\\"day_...\", \"product_ids\": [\"1\", \"2\", \"3\", \"9\", \"10\", \"5\", \"11\", \"12\", \"13\", \"74\"], \"package_type\": \"vip\", \"duration_days\": \"12\", \"departure_city\": \"Jakarta\", \"discount_label\": \"HEMAT 9%\", \"original_price\": \"54900000\", \"existing_images\": [\"/images/dummy.jpg\"], \"discount_ends_at\": \"2026-10-01 23:59\"}, \"module_key\": \"product_management\", \"route_name\": \"packages.update\", \"module_name\": \"Product Management\", \"status_code\": 302, \"submenu_key\": \"package\", \"submenu_name\": \"Package\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 01:39:48', '2026-05-29 01:39:48', '2026-05-29 01:39:48');
INSERT INTO `activity_logs` VALUES (77, 1, 'create', 'product_management', 'package', NULL, NULL, 'POST', 'packages.update', 'admin/product-management/packages/10', 'Membuat data pada module product_management (route: packages.update)', '{\"path\": \"admin/product-management/packages/10\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": {\"en\": \"Umroh Regular 10 Hari\", \"id\": \"Umroh Regular 10 Hari\"}, \"slug\": \"umroh-regular-10-hari\", \"price\": \"36708000\", \"_method\": \"POST\", \"content\": \"{\\\"room\\\":\\\"Triple / quad sharing\\\",\\\"badge\\\":\\\"Pilihan Keluarga\\\",\\\"hotel\\\":\\\"Hotel bintang 4 dekat Masjidil Haram\\\",\\\"meals\\\":\\\"3 kali makan menu Indonesia\\\",\\\"period\\\":\\\"September - November 2026\\\",\\\"policy\\\":\\\"Pembatalan 30 hari sebelum keberangkatan dikenakan biaya 25%. Pembatalan kurang dari 14 hari tidak dapat dikembalikan.\\\",\\\"ziarah\\\":\\\"Program ziarah Makkah dan Madinah\\\",\\\"airline\\\":\\\"Garuda Indonesia\\\",\\\"excluded\\\":\\\"Pengeluaran pribadi\\\\nOleh-oleh\\\",\\\"handling\\\":\\\"Handling bandara dan hotel\\\",\\\"included\\\":\\\"Tiket pesawat PP Ga...\", \"summary\": {\"en\": \"Paket seimbang untuk keluarga dan jamaah umum dengan hotel nyaman serta pembimbing berpengalaman.\", \"id\": \"Paket seimbang untuk keluarga dan jamaah umum dengan hotel nyaman serta pembimbing berpengalaman.\"}, \"currency\": \"IDR\", \"is_active\": \"1\", \"is_featured\": \"1\", \"itineraries\": \"[{\\\"id\\\":41,\\\"activity_id\\\":3,\\\"activity_ids\\\":[3],\\\"day_number\\\":1,\\\"sort_order\\\":1,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":42,\\\"activity_id\\\":5,\\\"activity_ids\\\":[5],\\\"day_number\\\":2,\\\"sort_order\\\":2,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":43,\\\"activity_id\\\":6,\\\"activity_ids\\\":[6],\\\"day_number\\\":3,\\\"sort_order\\\":3,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":44,\\\"activity_id\\\":7,\\\"activity_ids\\\":[7],\\\"day_...\", \"product_ids\": [\"1\", \"3\", \"9\", \"10\", \"5\", \"11\", \"12\", \"13\", \"57\"], \"package_type\": \"reguler\", \"duration_days\": \"10\", \"departure_city\": \"Jakarta\", \"discount_label\": \"FAMILY DEAL\", \"original_price\": \"39900000\", \"existing_images\": [\"/images/dummy.jpg\"], \"discount_ends_at\": \"2026-09-01 23:59\"}, \"module_key\": \"product_management\", \"route_name\": \"packages.update\", \"module_name\": \"Product Management\", \"status_code\": 302, \"submenu_key\": \"package\", \"submenu_name\": \"Package\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 01:40:01', '2026-05-29 01:40:01', '2026-05-29 01:40:01');
INSERT INTO `activity_logs` VALUES (78, 1, 'delete', 'website_management', NULL, NULL, NULL, 'DELETE', 'content.resources.destroy', 'admin/website-management/content/resources/products/8', 'Menghapus data pada module website_management (route: content.resources.destroy)', '{\"path\": \"admin/website-management/content/resources/products/8\", \"query\": [], \"method\": \"DELETE\", \"payload\": [], \"module_key\": \"website_management\", \"route_name\": \"content.resources.destroy\", \"module_name\": \"Website Management\", \"status_code\": 302, \"submenu_key\": null, \"submenu_name\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 02:05:34', '2026-05-29 02:05:34', '2026-05-29 02:05:34');
INSERT INTO `activity_logs` VALUES (79, 1, 'delete', 'website_management', NULL, NULL, NULL, 'DELETE', 'content.resources.destroy', 'admin/website-management/content/resources/products/7', 'Menghapus data pada module website_management (route: content.resources.destroy)', '{\"path\": \"admin/website-management/content/resources/products/7\", \"query\": [], \"method\": \"DELETE\", \"payload\": [], \"module_key\": \"website_management\", \"route_name\": \"content.resources.destroy\", \"module_name\": \"Website Management\", \"status_code\": 302, \"submenu_key\": null, \"submenu_name\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 02:05:39', '2026-05-29 02:05:39', '2026-05-29 02:05:39');
INSERT INTO `activity_logs` VALUES (80, 1, 'update', 'booking_management', 'booking_register', NULL, NULL, 'PUT', 'booking.register.mark-registered', 'admin/booking-management/register/2/mark-registered', 'Memperbarui data pada module booking_management (route: booking.register.mark-registered)', '{\"path\": \"admin/booking-management/register/2/mark-registered\", \"query\": [], \"method\": \"PUT\", \"payload\": [], \"module_key\": \"booking_management\", \"route_name\": \"booking.register.mark-registered\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_register\", \"submenu_name\": \"Register\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 02:24:46', '2026-05-29 02:24:46', '2026-05-29 02:24:46');
INSERT INTO `activity_logs` VALUES (81, 1, 'update', 'booking_management', 'booking_register', NULL, NULL, 'PUT', 'booking.register.mark-registered', 'admin/booking-management/register/4/mark-registered', 'Memperbarui data pada module booking_management (route: booking.register.mark-registered)', '{\"path\": \"admin/booking-management/register/4/mark-registered\", \"query\": [], \"method\": \"PUT\", \"payload\": [], \"module_key\": \"booking_management\", \"route_name\": \"booking.register.mark-registered\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_register\", \"submenu_name\": \"Register\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 03:15:34', '2026-05-29 03:15:34', '2026-05-29 03:15:34');
INSERT INTO `activity_logs` VALUES (82, 1, 'update', 'booking_management', 'booking_register', NULL, NULL, 'PUT', 'booking.register.mark-registered', 'admin/booking-management/register/5/mark-registered', 'Memperbarui data pada module booking_management (route: booking.register.mark-registered)', '{\"path\": \"admin/booking-management/register/5/mark-registered\", \"query\": [], \"method\": \"PUT\", \"payload\": [], \"module_key\": \"booking_management\", \"route_name\": \"booking.register.mark-registered\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_register\", \"submenu_name\": \"Register\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 03:24:39', '2026-05-29 03:24:39', '2026-05-29 03:24:39');
INSERT INTO `activity_logs` VALUES (83, 1, 'create', 'booking_management', 'booking_hotel_assignment', NULL, NULL, 'POST', 'booking.hotel-assignment.store', 'admin/booking-management/hotel-assignment', 'Membuat data pada module booking_management (route: booking.hotel-assignment.store)', '{\"path\": \"admin/booking-management/hotel-assignment\", \"query\": [], \"method\": \"POST\", \"payload\": {\"notes\": null, \"rooms\": [{\"room_count\": \"1\", \"room_type_id\": \"1\"}, {\"room_count\": \"1\", \"room_type_id\": \"3\"}, {\"room_count\": \"1\", \"room_type_id\": \"2\"}], \"status\": \"draft\", \"hotel_id\": \"22\", \"travel_package_id\": \"9\", \"departure_schedule_id\": \"42\"}, \"module_key\": \"booking_management\", \"route_name\": \"booking.hotel-assignment.store\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_hotel_assignment\", \"submenu_name\": \"Hotel Assignment\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 03:36:52', '2026-05-29 03:36:52', '2026-05-29 03:36:52');
INSERT INTO `activity_logs` VALUES (84, 1, 'create', 'booking_management', 'booking_hotel_assignment', NULL, NULL, 'POST', 'booking.hotel-assignment.store', 'admin/booking-management/hotel-assignment', 'Membuat data pada module booking_management (route: booking.hotel-assignment.store)', '{\"path\": \"admin/booking-management/hotel-assignment\", \"query\": [], \"method\": \"POST\", \"payload\": {\"notes\": null, \"rooms\": [{\"room_count\": \"1\", \"room_type_id\": \"1\"}, {\"room_count\": \"1\", \"room_type_id\": \"3\"}, {\"room_count\": \"1\", \"room_type_id\": \"2\"}], \"status\": \"draft\", \"hotel_id\": \"22\", \"travel_package_id\": \"9\", \"departure_schedule_id\": \"42\"}, \"module_key\": \"booking_management\", \"route_name\": \"booking.hotel-assignment.store\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_hotel_assignment\", \"submenu_name\": \"Hotel Assignment\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 03:40:58', '2026-05-29 03:40:58', '2026-05-29 03:40:58');
INSERT INTO `activity_logs` VALUES (85, 1, 'create', 'booking_management', 'booking_hotel_assignment', NULL, NULL, 'POST', 'booking.hotel-assignment.store', 'admin/booking-management/hotel-assignment', 'Membuat data pada module booking_management (route: booking.hotel-assignment.store)', '{\"path\": \"admin/booking-management/hotel-assignment\", \"query\": [], \"method\": \"POST\", \"payload\": {\"notes\": null, \"rooms\": [{\"room_count\": \"1\", \"room_type_id\": \"1\"}, {\"room_count\": \"1\", \"room_type_id\": \"3\"}, {\"room_count\": \"1\", \"room_type_id\": \"2\"}], \"status\": \"draft\", \"hotel_id\": \"22\", \"travel_package_id\": \"9\", \"departure_schedule_id\": \"42\"}, \"module_key\": \"booking_management\", \"route_name\": \"booking.hotel-assignment.store\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_hotel_assignment\", \"submenu_name\": \"Hotel Assignment\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 03:41:01', '2026-05-29 03:41:01', '2026-05-29 03:41:01');
INSERT INTO `activity_logs` VALUES (86, 1, 'create', 'booking_management', 'booking_hotel_assignment', NULL, NULL, 'POST', 'booking.hotel-assignment.store', 'admin/booking-management/hotel-assignment', 'Membuat data pada module booking_management (route: booking.hotel-assignment.store)', '{\"path\": \"admin/booking-management/hotel-assignment\", \"query\": [], \"method\": \"POST\", \"payload\": {\"notes\": null, \"rooms\": [{\"room_count\": \"01\", \"room_type_id\": \"1\"}, {\"room_count\": \"01\", \"room_type_id\": \"3\"}, {\"room_count\": \"01\", \"room_type_id\": \"2\"}], \"status\": \"draft\", \"hotel_id\": \"22\", \"travel_package_id\": \"9\", \"departure_schedule_id\": \"42\"}, \"module_key\": \"booking_management\", \"route_name\": \"booking.hotel-assignment.store\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_hotel_assignment\", \"submenu_name\": \"Hotel Assignment\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 03:56:29', '2026-05-29 03:56:29', '2026-05-29 03:56:29');
INSERT INTO `activity_logs` VALUES (87, 1, 'create', 'booking_management', 'booking_hotel_assignment', NULL, NULL, 'POST', 'booking.hotel-assignment.store', 'admin/booking-management/hotel-assignment', 'Membuat data pada module booking_management (route: booking.hotel-assignment.store)', '{\"path\": \"admin/booking-management/hotel-assignment\", \"query\": [], \"method\": \"POST\", \"payload\": {\"notes\": null, \"rooms\": [{\"room_count\": \"01\", \"room_type_id\": \"1\"}, {\"room_count\": \"01\", \"room_type_id\": \"3\"}, {\"room_count\": \"01\", \"room_type_id\": \"2\"}], \"status\": \"draft\", \"hotel_id\": \"22\", \"travel_package_id\": \"9\", \"departure_schedule_id\": \"42\"}, \"module_key\": \"booking_management\", \"route_name\": \"booking.hotel-assignment.store\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_hotel_assignment\", \"submenu_name\": \"Hotel Assignment\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 03:56:40', '2026-05-29 03:56:40', '2026-05-29 03:56:40');
INSERT INTO `activity_logs` VALUES (88, 1, 'create', 'booking_management', 'booking_hotel_assignment', NULL, NULL, 'POST', 'booking.hotel-assignment.store', 'admin/booking-management/hotel-assignment', 'Membuat data pada module booking_management (route: booking.hotel-assignment.store)', '{\"path\": \"admin/booking-management/hotel-assignment\", \"query\": [], \"method\": \"POST\", \"payload\": {\"notes\": null, \"rooms\": [{\"room_count\": \"1\", \"room_type_id\": \"1\"}, {\"room_count\": \"1\", \"room_type_id\": \"3\"}, {\"room_count\": \"1\", \"room_type_id\": \"2\"}], \"status\": \"draft\", \"hotel_id\": \"22\", \"travel_package_id\": \"9\", \"departure_schedule_id\": \"42\"}, \"module_key\": \"booking_management\", \"route_name\": \"booking.hotel-assignment.store\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_hotel_assignment\", \"submenu_name\": \"Hotel Assignment\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 03:58:06', '2026-05-29 03:58:06', '2026-05-29 03:58:06');
INSERT INTO `activity_logs` VALUES (89, 1, 'create', 'booking_management', 'booking_hotel_assignment', NULL, NULL, 'POST', 'booking.hotel-assignment.store', 'admin/booking-management/hotel-assignment', 'Membuat data pada module booking_management (route: booking.hotel-assignment.store)', '{\"path\": \"admin/booking-management/hotel-assignment\", \"query\": [], \"method\": \"POST\", \"payload\": {\"notes\": null, \"rooms\": [{\"room_count\": \"1\", \"room_type_id\": \"1\"}, {\"room_count\": \"1\", \"room_type_id\": \"3\"}, {\"room_count\": \"1\", \"room_type_id\": \"2\"}], \"status\": \"draft\", \"hotel_id\": \"22\", \"travel_package_id\": \"9\", \"departure_schedule_id\": \"42\"}, \"module_key\": \"booking_management\", \"route_name\": \"booking.hotel-assignment.store\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_hotel_assignment\", \"submenu_name\": \"Hotel Assignment\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 04:00:33', '2026-05-29 04:00:33', '2026-05-29 04:00:33');
INSERT INTO `activity_logs` VALUES (90, 1, 'create', 'booking_management', 'booking_hotel_assignment', NULL, NULL, 'POST', 'booking.hotel-assignment.store', 'admin/booking-management/hotel-assignment', 'Membuat data pada module booking_management (route: booking.hotel-assignment.store)', '{\"path\": \"admin/booking-management/hotel-assignment\", \"query\": [], \"method\": \"POST\", \"payload\": {\"notes\": null, \"rooms\": [{\"room_count\": \"1\", \"room_type_id\": \"2\"}], \"status\": \"draft\", \"hotel_id\": \"29\", \"travel_package_id\": \"11\", \"departure_schedule_id\": \"45\"}, \"module_key\": \"booking_management\", \"route_name\": \"booking.hotel-assignment.store\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_hotel_assignment\", \"submenu_name\": \"Hotel Assignment\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 04:35:21', '2026-05-29 04:35:21', '2026-05-29 04:35:21');
INSERT INTO `activity_logs` VALUES (91, 1, 'login', 'auth', NULL, NULL, NULL, 'POST', 'login.store', 'login', 'User login ke sistem.', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 13:07:38', '2026-05-29 13:07:38', '2026-05-29 13:07:38');
INSERT INTO `activity_logs` VALUES (92, 1, 'login', 'auth', NULL, NULL, NULL, 'POST', 'login.store', 'login', 'User login ke sistem.', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 22:25:53', '2026-05-29 22:25:53', '2026-05-29 22:25:53');
INSERT INTO `activity_logs` VALUES (93, 1, 'create', 'product_management', 'package', NULL, NULL, 'POST', 'packages.update', 'admin/product-management/packages/11', 'Membuat data pada module product_management (route: packages.update)', '{\"path\": \"admin/product-management/packages/11\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": {\"en\": \"Umroh Premium 12 Hari\", \"id\": \"Umroh Premium 12 Hari\"}, \"slug\": \"umroh-premium-12-hari\", \"price\": \"49959000\", \"_method\": \"POST\", \"content\": \"{\\\"room\\\":\\\"Double sharing premium\\\",\\\"badge\\\":\\\"VIP Premium\\\",\\\"hotel\\\":\\\"Hotel bintang 5 walking distance ke Masjidil Haram\\\",\\\"meals\\\":\\\"Menu premium 3 kali sehari\\\",\\\"period\\\":\\\"Oktober - Desember 2026\\\",\\\"policy\\\":\\\"Pembatalan 45 hari sebelum keberangkatan dikenakan biaya 20%. Pembatalan kurang dari 21 hari tidak dapat dikembalikan.\\\",\\\"ziarah\\\":\\\"City tour premium dan ziarah terarah\\\",\\\"airline\\\":\\\"Garuda Indonesia Business Class\\\",\\\"gallery\\\":[],\\\"excluded\\\":\\\"Pengeluaran pribadi\\\\nOleh-oleh\\\",\\\"handling\\\":\\\"Fast track dan handli...\", \"summary\": {\"en\": \"Paket premium dengan hotel bintang 5 sangat dekat Masjidil Haram dan durasi lebih longgar untuk ibadah yang tenang.\", \"id\": \"Paket premium dengan hotel bintang 5 sangat dekat Masjidil Haram dan durasi lebih longgar untuk ibadah yang tenang.\"}, \"currency\": \"IDR\", \"is_active\": \"1\", \"is_featured\": \"1\", \"itineraries\": \"[{\\\"id\\\":72,\\\"activity_id\\\":3,\\\"activity_ids\\\":[3],\\\"day_number\\\":1,\\\"sort_order\\\":1,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":73,\\\"activity_id\\\":5,\\\"activity_ids\\\":[5],\\\"day_number\\\":2,\\\"sort_order\\\":2,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":74,\\\"activity_id\\\":6,\\\"activity_ids\\\":[6],\\\"day_number\\\":3,\\\"sort_order\\\":3,\\\"title\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"description\\\":{\\\"id\\\":\\\"\\\",\\\"en\\\":\\\"\\\"},\\\"product_ids\\\":[]},{\\\"id\\\":75,\\\"activity_id\\\":7,\\\"activity_ids\\\":[7],\\\"day_...\", \"product_ids\": [\"1\", \"2\", \"3\", \"9\", \"10\", \"5\", \"11\", \"12\", \"13\", \"48\"], \"package_type\": \"vip\", \"duration_days\": \"12\", \"departure_city\": \"Jakarta\", \"discount_label\": \"HEMAT 9%\", \"original_price\": \"54900000\", \"existing_images\": [\"/images/dummy.jpg\"], \"discount_ends_at\": \"2026-10-01 23:59\"}, \"module_key\": \"product_management\", \"route_name\": \"packages.update\", \"module_name\": \"Product Management\", \"status_code\": 302, \"submenu_key\": \"package\", \"submenu_name\": \"Package\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 22:38:20', '2026-05-29 22:38:20', '2026-05-29 22:38:20');
INSERT INTO `activity_logs` VALUES (94, 1, 'delete', 'booking_management', 'booking_register', NULL, NULL, 'DELETE', 'booking.register.destroy', 'admin/booking-management/register/6', 'Menghapus data pada module booking_management (route: booking.register.destroy)', '{\"path\": \"admin/booking-management/register/6\", \"query\": [], \"method\": \"DELETE\", \"payload\": [], \"module_key\": \"booking_management\", \"route_name\": \"booking.register.destroy\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_register\", \"submenu_name\": \"Register\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 22:41:11', '2026-05-29 22:41:11', '2026-05-29 22:41:11');
INSERT INTO `activity_logs` VALUES (95, 1, 'update', 'booking_management', 'booking_register', NULL, NULL, 'PUT', 'booking.register.mark-registered', 'admin/booking-management/register/7/mark-registered', 'Memperbarui data pada module booking_management (route: booking.register.mark-registered)', '{\"path\": \"admin/booking-management/register/7/mark-registered\", \"query\": [], \"method\": \"PUT\", \"payload\": [], \"module_key\": \"booking_management\", \"route_name\": \"booking.register.mark-registered\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_register\", \"submenu_name\": \"Register\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 22:41:15', '2026-05-29 22:41:15', '2026-05-29 22:41:15');
INSERT INTO `activity_logs` VALUES (96, 1, 'create', 'booking_management', 'booking_hotel_assignment', NULL, NULL, 'POST', 'booking.hotel-assignment.store', 'admin/booking-management/hotel-assignment', 'Membuat data pada module booking_management (route: booking.hotel-assignment.store)', '{\"path\": \"admin/booking-management/hotel-assignment\", \"query\": [], \"method\": \"POST\", \"payload\": {\"notes\": null, \"rooms\": [{\"room_count\": \"1\", \"room_type_id\": \"3\"}], \"status\": \"draft\", \"hotel_id\": \"6\", \"travel_package_id\": \"11\", \"departure_schedule_id\": \"46\"}, \"module_key\": \"booking_management\", \"route_name\": \"booking.hotel-assignment.store\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_hotel_assignment\", \"submenu_name\": \"Hotel Assignment\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-29 22:42:43', '2026-05-29 22:42:43', '2026-05-29 22:42:43');
INSERT INTO `activity_logs` VALUES (97, 1, 'update', 'booking_management', 'booking_register', NULL, NULL, 'PUT', 'booking.register.mark-registered', 'admin/booking-management/register/8/mark-registered', 'Memperbarui data pada module booking_management (route: booking.register.mark-registered)', '{\"path\": \"admin/booking-management/register/8/mark-registered\", \"query\": [], \"method\": \"PUT\", \"payload\": [], \"module_key\": \"booking_management\", \"route_name\": \"booking.register.mark-registered\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_register\", \"submenu_name\": \"Register\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 02:15:31', '2026-05-30 02:15:31', '2026-05-30 02:15:31');
INSERT INTO `activity_logs` VALUES (98, 1, 'create', 'booking_management', 'booking_hotel_assignment', NULL, NULL, 'POST', 'booking.hotel-assignment.store', 'admin/booking-management/hotel-assignment', 'Membuat data pada module booking_management (route: booking.hotel-assignment.store)', '{\"path\": \"admin/booking-management/hotel-assignment\", \"query\": [], \"method\": \"POST\", \"payload\": {\"notes\": null, \"rooms\": [{\"room_count\": \"2\", \"room_type_id\": \"1\"}, {\"room_count\": \"1\", \"room_type_id\": \"3\"}], \"status\": \"draft\", \"hotel_id\": \"12\", \"travel_package_id\": \"10\", \"departure_schedule_id\": \"43\"}, \"module_key\": \"booking_management\", \"route_name\": \"booking.hotel-assignment.store\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_hotel_assignment\", \"submenu_name\": \"Hotel Assignment\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 02:16:51', '2026-05-30 02:16:51', '2026-05-30 02:16:51');
INSERT INTO `activity_logs` VALUES (99, 1, 'login', 'auth', NULL, NULL, NULL, 'POST', 'login.store', 'login', 'User login ke sistem.', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 13:24:39', '2026-05-30 13:24:39', '2026-05-30 13:24:39');
INSERT INTO `activity_logs` VALUES (100, 1, 'create', 'master_data', 'hotel_country', NULL, NULL, 'POST', 'master-data.hotel-countries.store', 'admin/master-data/hotel-countries', 'Membuat data pada module master_data (route: master-data.hotel-countries.store)', '{\"path\": \"admin/master-data/hotel-countries\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"TEST NEGARA\", \"is_active\": true}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-countries.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_country\", \"submenu_name\": \"Master Negara\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 13:40:10', '2026-05-30 13:40:10', '2026-05-30 13:40:10');
INSERT INTO `activity_logs` VALUES (101, 1, 'create', 'master_data', 'hotel_city', NULL, NULL, 'POST', 'master-data.hotel-cities.store', 'admin/master-data/hotel-cities', 'Membuat data pada module master_data (route: master-data.hotel-cities.store)', '{\"path\": \"admin/master-data/hotel-cities\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"TEST KOTA\", \"is_active\": true, \"country_id\": \"2\"}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-cities.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_city\", \"submenu_name\": \"Master Kota\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 13:40:31', '2026-05-30 13:40:31', '2026-05-30 13:40:31');
INSERT INTO `activity_logs` VALUES (102, 1, 'create', 'master_data', 'hotel', NULL, NULL, 'POST', 'master-data.hotels.bulk-store', 'admin/master-data/hotels/bulk', 'Membuat data pada module master_data (route: master-data.hotels.bulk-store)', '{\"path\": \"admin/master-data/hotels/bulk\", \"query\": [], \"method\": \"POST\", \"payload\": {\"hotels\": [{\"name\": \"TEST HOTEL 2\", \"prices\": [{\"price\": 500000, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 1}, {\"price\": 600000, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 2}, {\"price\": 700000, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 3}, {\"price\": 600000, \"period_end\": \"2026-08-30\", \"period_start\": \"2026-07-01\", \"room_type_id\": 1}, {\"price\": 700000, \"period_end\": \"2026-08-30\", \"period_start\": \"2026-07-01\", \"room_type_id\": 2}, {\"price\": 800000, \"period_end\": \"2026-08-30\", \"period_start\": \"2026-07-01\", \"room_type_id\": 3}], \"city_id\": \"3\", \"currency\": \"IDR\", \"is_active\": true, \"country_id\": \"2\", \"description\": null}]}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotels.bulk-store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel\", \"submenu_name\": \"Hotel\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 13:42:26', '2026-05-30 13:42:26', '2026-05-30 13:42:26');
INSERT INTO `activity_logs` VALUES (103, 1, 'delete', 'master_data', 'hotel', NULL, NULL, 'DELETE', 'master-data.hotels.destroy', 'admin/master-data/hotels/33', 'Menghapus data pada module master_data (route: master-data.hotels.destroy)', '{\"path\": \"admin/master-data/hotels/33\", \"query\": [], \"method\": \"DELETE\", \"payload\": [], \"module_key\": \"master_data\", \"route_name\": \"master-data.hotels.destroy\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel\", \"submenu_name\": \"Hotel\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 13:42:49', '2026-05-30 13:42:49', '2026-05-30 13:42:49');
INSERT INTO `activity_logs` VALUES (104, 1, 'create', 'master_data', 'hotel', NULL, NULL, 'POST', 'master-data.hotels.bulk-store', 'admin/master-data/hotels/bulk', 'Membuat data pada module master_data (route: master-data.hotels.bulk-store)', '{\"path\": \"admin/master-data/hotels/bulk\", \"query\": [], \"method\": \"POST\", \"payload\": {\"hotels\": [{\"name\": \"TEST HOTEL 1\", \"prices\": [{\"price\": 1, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 1}, {\"price\": 2, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 2}, {\"price\": 3, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 3}, {\"price\": 2, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 1}, {\"price\": 3, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 2}, {\"price\": 4, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 3}], \"city_id\": \"3\", \"currency\": \"IDR\", \"is_active\": true, \"country_id\": \"2\"}, {\"name\": \"TEST HOTEL 2\", \"prices\": [{\"price\": 2, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 1}, {\"price\": 3, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 2}, {\"price\": 4, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 3}, {\"price\": 3, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 1}, {\"price\": 4, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 2}, {\"price\": 5, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 3}], \"city_id\": \"3\", \"currency\": \"IDR\", \"is_active\": true, \"country_id\": \"2\"}]}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotels.bulk-store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel\", \"submenu_name\": \"Hotel\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 15:12:29', '2026-05-30 15:12:29', '2026-05-30 15:12:29');
INSERT INTO `activity_logs` VALUES (105, 1, 'create', 'master_data', 'hotel', NULL, NULL, 'POST', 'master-data.hotels.bulk-store', 'admin/master-data/hotels/bulk', 'Membuat data pada module master_data (route: master-data.hotels.bulk-store)', '{\"path\": \"admin/master-data/hotels/bulk\", \"query\": [], \"method\": \"POST\", \"payload\": {\"hotels\": [{\"name\": \"TEST HOTEL 1\", \"prices\": [{\"price\": 1, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 1}, {\"price\": 2, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 2}, {\"price\": 3, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 3}, {\"price\": 2, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 1}, {\"price\": 3, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 2}, {\"price\": 4, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 3}], \"city_id\": \"3\", \"currency\": \"IDR\", \"is_active\": true, \"country_id\": \"2\"}, {\"name\": \"TEST HOTEL 2\", \"prices\": [{\"price\": 2, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 1}, {\"price\": 3, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 2}, {\"price\": 4, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 3}, {\"price\": 3, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 1}, {\"price\": 4, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 2}, {\"price\": 5, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 3}], \"city_id\": \"3\", \"currency\": \"IDR\", \"is_active\": true, \"country_id\": \"2\"}]}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotels.bulk-store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel\", \"submenu_name\": \"Hotel\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 15:12:42', '2026-05-30 15:12:42', '2026-05-30 15:12:42');
INSERT INTO `activity_logs` VALUES (106, 1, 'update', 'booking_management', 'booking_listing', NULL, NULL, 'PUT', 'booking.listing.update', 'admin/booking-management/listing/7', 'Memperbarui data pada module booking_management (route: booking.listing.update)', '{\"path\": \"admin/booking-management/listing/7\", \"query\": [], \"method\": \"PUT\", \"payload\": {\"email\": \"Firosmalik.job@gmail.com\", \"notes\": null, \"phone\": \"085236446961\", \"status\": \"cancelled\", \"full_name\": \"Firos Malik Abdillah\", \"origin_city\": \"Kab. Probolinggo\", \"passenger_count\": \"6\", \"travel_package_id\": \"10\", \"departure_schedule_id\": \"43\"}, \"module_key\": \"booking_management\", \"route_name\": \"booking.listing.update\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_listing\", \"submenu_name\": \"Listing\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 15:20:24', '2026-05-30 15:20:24', '2026-05-30 15:20:24');
INSERT INTO `activity_logs` VALUES (107, 1, 'update', 'booking_management', 'booking_listing', NULL, NULL, 'PUT', 'booking.listing.update', 'admin/booking-management/listing/3', 'Memperbarui data pada module booking_management (route: booking.listing.update)', '{\"path\": \"admin/booking-management/listing/3\", \"query\": [], \"method\": \"PUT\", \"payload\": {\"email\": \"Firosmalik.job@gmail.com\", \"notes\": null, \"phone\": \"085236446961\", \"status\": \"cancelled\", \"full_name\": \"Firos Malik Abdillah\", \"origin_city\": \"Kab. Probolinggo\", \"passenger_count\": \"3\", \"travel_package_id\": \"9\", \"departure_schedule_id\": \"42\"}, \"module_key\": \"booking_management\", \"route_name\": \"booking.listing.update\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_listing\", \"submenu_name\": \"Listing\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 15:21:23', '2026-05-30 15:21:23', '2026-05-30 15:21:23');
INSERT INTO `activity_logs` VALUES (108, 1, 'update', 'booking_management', 'booking_listing', NULL, NULL, 'PUT', 'booking.listing.update', 'admin/booking-management/listing/7', 'Memperbarui data pada module booking_management (route: booking.listing.update)', '{\"path\": \"admin/booking-management/listing/7\", \"query\": [], \"method\": \"PUT\", \"payload\": {\"email\": \"Firosmalik.job@gmail.com\", \"notes\": null, \"phone\": \"085236446961\", \"status\": \"registered\", \"full_name\": \"Firos Malik Abdillah\", \"origin_city\": \"Kab. Probolinggo\", \"passenger_count\": \"6\", \"custom_unit_price\": null, \"travel_package_id\": \"10\", \"custom_return_date\": null, \"custom_departure_date\": null, \"departure_schedule_id\": \"43\"}, \"module_key\": \"booking_management\", \"route_name\": \"booking.listing.update\", \"module_name\": \"Booking\", \"status_code\": 302, \"submenu_key\": \"booking_listing\", \"submenu_name\": \"Listing\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 15:22:17', '2026-05-30 15:22:17', '2026-05-30 15:22:17');
INSERT INTO `activity_logs` VALUES (109, 1, 'create', 'master_data', 'hotel', NULL, NULL, 'POST', 'master-data.hotels.bulk-store', 'admin/master-data/hotels/bulk', 'Membuat data pada module master_data (route: master-data.hotels.bulk-store)', '{\"path\": \"admin/master-data/hotels/bulk\", \"query\": [], \"method\": \"POST\", \"payload\": {\"hotels\": [{\"name\": \"test hotel 123\", \"prices\": [{\"price\": 1, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 1}, {\"price\": 2, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 2}, {\"price\": 3, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 3}, {\"price\": 2, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 1}, {\"price\": 3, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 2}, {\"price\": 4, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 3}], \"city_id\": \"3\", \"currency\": \"IDR\", \"is_active\": true, \"country_id\": \"2\"}, {\"name\": \"test hotel 1234\", \"prices\": [{\"price\": 2, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 1}, {\"price\": 3, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 2}, {\"price\": 4, \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\", \"room_type_id\": 3}, {\"price\": 3, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 1}, {\"price\": 4, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 2}, {\"price\": 5, \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\", \"room_type_id\": 3}], \"city_id\": \"3\", \"currency\": \"IDR\", \"is_active\": true, \"country_id\": \"2\"}]}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotels.bulk-store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel\", \"submenu_name\": \"Hotel\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 15:30:30', '2026-05-30 15:30:30', '2026-05-30 15:30:30');
INSERT INTO `activity_logs` VALUES (110, 1, 'create', 'master_data', 'hotel_country', NULL, NULL, 'POST', 'master-data.hotel-countries.store', 'admin/master-data/hotel-countries', 'Membuat data pada module master_data (route: master-data.hotel-countries.store)', '{\"path\": \"admin/master-data/hotel-countries\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Turkey\", \"is_active\": true}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-countries.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_country\", \"submenu_name\": \"Master Negara\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:16:10', '2026-05-30 16:16:10', '2026-05-30 16:16:10');
INSERT INTO `activity_logs` VALUES (111, 1, 'create', 'master_data', 'hotel_country', NULL, NULL, 'POST', 'master-data.hotel-countries.store', 'admin/master-data/hotel-countries', 'Membuat data pada module master_data (route: master-data.hotel-countries.store)', '{\"path\": \"admin/master-data/hotel-countries\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Malaysia\", \"is_active\": true}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-countries.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_country\", \"submenu_name\": \"Master Negara\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:16:26', '2026-05-30 16:16:26', '2026-05-30 16:16:26');
INSERT INTO `activity_logs` VALUES (112, 1, 'create', 'master_data', 'hotel_country', NULL, NULL, 'POST', 'master-data.hotel-countries.store', 'admin/master-data/hotel-countries', 'Membuat data pada module master_data (route: master-data.hotel-countries.store)', '{\"path\": \"admin/master-data/hotel-countries\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Indonesia\", \"is_active\": true}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-countries.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_country\", \"submenu_name\": \"Master Negara\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:16:40', '2026-05-30 16:16:40', '2026-05-30 16:16:40');
INSERT INTO `activity_logs` VALUES (113, 1, 'create', 'master_data', 'hotel_city', NULL, NULL, 'POST', 'master-data.hotel-cities.store', 'admin/master-data/hotel-cities', 'Membuat data pada module master_data (route: master-data.hotel-cities.store)', '{\"path\": \"admin/master-data/hotel-cities\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Bali\", \"is_active\": true, \"country_id\": \"5\"}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-cities.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_city\", \"submenu_name\": \"Master Kota\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:17:27', '2026-05-30 16:17:27', '2026-05-30 16:17:27');
INSERT INTO `activity_logs` VALUES (114, 1, 'create', 'master_data', 'hotel_city', NULL, NULL, 'POST', 'master-data.hotel-cities.store', 'admin/master-data/hotel-cities', 'Membuat data pada module master_data (route: master-data.hotel-cities.store)', '{\"path\": \"admin/master-data/hotel-cities\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Jakarta\", \"is_active\": true, \"country_id\": \"5\"}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-cities.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_city\", \"submenu_name\": \"Master Kota\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:17:46', '2026-05-30 16:17:46', '2026-05-30 16:17:46');
INSERT INTO `activity_logs` VALUES (115, 1, 'create', 'master_data', 'hotel_city', NULL, NULL, 'POST', 'master-data.hotel-cities.store', 'admin/master-data/hotel-cities', 'Membuat data pada module master_data (route: master-data.hotel-cities.store)', '{\"path\": \"admin/master-data/hotel-cities\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Yogyakarta\", \"is_active\": true, \"country_id\": \"5\"}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-cities.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_city\", \"submenu_name\": \"Master Kota\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:18:04', '2026-05-30 16:18:04', '2026-05-30 16:18:04');
INSERT INTO `activity_logs` VALUES (116, 1, 'create', 'master_data', 'hotel_city', NULL, NULL, 'POST', 'master-data.hotel-cities.store', 'admin/master-data/hotel-cities', 'Membuat data pada module master_data (route: master-data.hotel-cities.store)', '{\"path\": \"admin/master-data/hotel-cities\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Lombok\", \"is_active\": true, \"country_id\": \"5\"}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-cities.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_city\", \"submenu_name\": \"Master Kota\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:18:16', '2026-05-30 16:18:16', '2026-05-30 16:18:16');
INSERT INTO `activity_logs` VALUES (117, 1, 'create', 'master_data', 'hotel_city', NULL, NULL, 'POST', 'master-data.hotel-cities.store', 'admin/master-data/hotel-cities', 'Membuat data pada module master_data (route: master-data.hotel-cities.store)', '{\"path\": \"admin/master-data/hotel-cities\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Kuala Lumpur\", \"is_active\": true, \"country_id\": \"4\"}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-cities.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_city\", \"submenu_name\": \"Master Kota\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:18:27', '2026-05-30 16:18:27', '2026-05-30 16:18:27');
INSERT INTO `activity_logs` VALUES (118, 1, 'create', 'master_data', 'hotel_city', NULL, NULL, 'POST', 'master-data.hotel-cities.store', 'admin/master-data/hotel-cities', 'Membuat data pada module master_data (route: master-data.hotel-cities.store)', '{\"path\": \"admin/master-data/hotel-cities\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Penang\", \"is_active\": true, \"country_id\": \"4\"}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-cities.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_city\", \"submenu_name\": \"Master Kota\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:18:36', '2026-05-30 16:18:36', '2026-05-30 16:18:36');
INSERT INTO `activity_logs` VALUES (119, 1, 'create', 'master_data', 'hotel_city', NULL, NULL, 'POST', 'master-data.hotel-cities.store', 'admin/master-data/hotel-cities', 'Membuat data pada module master_data (route: master-data.hotel-cities.store)', '{\"path\": \"admin/master-data/hotel-cities\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Johor Bahru\", \"is_active\": true, \"country_id\": \"4\"}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-cities.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_city\", \"submenu_name\": \"Master Kota\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:18:46', '2026-05-30 16:18:46', '2026-05-30 16:18:46');
INSERT INTO `activity_logs` VALUES (120, 1, 'create', 'master_data', 'hotel_city', NULL, NULL, 'POST', 'master-data.hotel-cities.store', 'admin/master-data/hotel-cities', 'Membuat data pada module master_data (route: master-data.hotel-cities.store)', '{\"path\": \"admin/master-data/hotel-cities\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Langkawi\", \"is_active\": true, \"country_id\": \"4\"}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-cities.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_city\", \"submenu_name\": \"Master Kota\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:18:58', '2026-05-30 16:18:58', '2026-05-30 16:18:58');
INSERT INTO `activity_logs` VALUES (121, 1, 'create', 'master_data', 'hotel_city', NULL, NULL, 'POST', 'master-data.hotel-cities.store', 'admin/master-data/hotel-cities', 'Membuat data pada module master_data (route: master-data.hotel-cities.store)', '{\"path\": \"admin/master-data/hotel-cities\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Istanbul\", \"is_active\": true, \"country_id\": \"3\"}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-cities.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_city\", \"submenu_name\": \"Master Kota\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:19:17', '2026-05-30 16:19:17', '2026-05-30 16:19:17');
INSERT INTO `activity_logs` VALUES (122, 1, 'create', 'master_data', 'hotel_city', NULL, NULL, 'POST', 'master-data.hotel-cities.store', 'admin/master-data/hotel-cities', 'Membuat data pada module master_data (route: master-data.hotel-cities.store)', '{\"path\": \"admin/master-data/hotel-cities\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Bursa\", \"is_active\": true, \"country_id\": \"3\"}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-cities.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_city\", \"submenu_name\": \"Master Kota\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:19:30', '2026-05-30 16:19:30', '2026-05-30 16:19:30');
INSERT INTO `activity_logs` VALUES (123, 1, 'create', 'master_data', 'hotel_city', NULL, NULL, 'POST', 'master-data.hotel-cities.store', 'admin/master-data/hotel-cities', 'Membuat data pada module master_data (route: master-data.hotel-cities.store)', '{\"path\": \"admin/master-data/hotel-cities\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Antalya\", \"is_active\": true, \"country_id\": \"3\"}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-cities.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_city\", \"submenu_name\": \"Master Kota\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:19:41', '2026-05-30 16:19:41', '2026-05-30 16:19:41');
INSERT INTO `activity_logs` VALUES (124, 1, 'create', 'master_data', 'hotel_city', NULL, NULL, 'POST', 'master-data.hotel-cities.store', 'admin/master-data/hotel-cities', 'Membuat data pada module master_data (route: master-data.hotel-cities.store)', '{\"path\": \"admin/master-data/hotel-cities\", \"query\": [], \"method\": \"POST\", \"payload\": {\"name\": \"Cappadocia\", \"is_active\": true, \"country_id\": \"3\"}, \"module_key\": \"master_data\", \"route_name\": \"master-data.hotel-cities.store\", \"module_name\": \"Master Data\", \"status_code\": 302, \"submenu_key\": \"hotel_city\", \"submenu_name\": \"Master Kota\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:19:51', '2026-05-30 16:19:51', '2026-05-30 16:19:51');
INSERT INTO `activity_logs` VALUES (125, 1, 'update', 'website_management', NULL, NULL, NULL, 'PATCH', 'content.update', 'admin/website-management/content/19', 'Memperbarui data pada module website_management (route: content.update)', '{\"path\": \"admin/website-management/content/19\", \"query\": [], \"method\": \"PATCH\", \"payload\": {\"media\": [], \"title\": \"Landing Asfar Tour\", \"_method\": \"PATCH\", \"content\": {\"faq\": {\"title\": \"Pertanyaan yang Sering Ditanyakan\", \"description\": \"Temukan jawaban atas pertanyaan jamaah kami.\"}, \"hero\": {\"image\": \"/images/dummy.jpg\", \"label\": \"Hajj & Umrah Terpercaya\", \"title\": \"Perjalanan\\nMenuju\\nTanah Suci\\nImpian Anda\", \"cta_label\": \"Konsultasi Gratis\", \"description\": \"Bersama Asfar Tour, setiap langkah ibadah Anda kami jaga dengan sepenuh hati. Didampingi mutawif berpengalaman, fasilitas premium, dan layanan tulus.\", \"feature_cards\": [{\"icon\": \"hotel\", \"title\": \"Hotel Premium Pilihan\", \"description\": \"Dekat Masjidil Haram & Nabawi\"}, {\"icon\": \"plane\", \"title\": \"Penerbangan Direct\", \"description\": \"Jakarta - Madinah Non-stop\"}, {\"icon\": \"images\", \"title\": \"Free Dokumentasi\", \"description\": \"Kenangan ibadah Anda abadi\"}], \"secondary_cta_href\": \"/paket-umroh\", \"secondary_cta_label\": \"Lihat Paket\"}, \"about\": {\"cta\": \"Baca Selengkapnya\", \"label\": \"Tentang Kami\", \"title\": \"Pelayanan Umroh yang Tertata dan Menenangkan\", \"description\": \"Kami mengelola keberangkatan umroh dengan alur yang jelas, pendampingan ibadah, dan komunikasi yang transparan.\", \"image_primary\": \"/images/dummy.jpg\", \"image_secondary\": \"/images/dummy.jpg\"}, \"stats\": [{\"label\": \"Jamaah Diberangkatkan\", \"value\": \"500+\"}, {\"label\": \"Tahun Pengalaman\", \"value\": \"10+\"}, {\"label\": \"Rating Jamaah\", \"value\": \"4.9\"}, {\"label\": \"Program Terlaksana\", \"value\": \"50+\"}], \"footer\": {\"brand\": \"ASFAR TOUR\", \"subtitle\": \"Hajj & Umrah\", \"copyright\": \"(c) 2025 Asfar Tour - Terdaftar Kemenag RI\"}, \"contact\": {\"label\": \"Kontak Cepat\", \"title\": \"Siap berangkat? Konsultasi gratis dulu.\", \"description\": \"Konsultasikan kebutuhan ibadah Anda bersama tim kami. Gratis, tanpa syarat, tanpa tekanan.\", \"banner_image\": \"/images/dummy.jpg\", \"banner_title\": \"Siap Melangkah ke\\nTanah Suci?\", \"address_label\": \"Alamat\", \"banner_kicker\": \"Mulai Perjalanan Anda\", \"contact_label\": \"Lihat Kontak Lengkap\", \"secondary_href\": \"/paket-umroh\", \"whatsapp_label\": \"Chat Admin WhatsApp Sekarang\", \"secondary_label\": \"Lihat Paket\", \"contact_info_label\": \"Kontak\", \"navbar_whatsapp_label\": \"Chat Admin\"}, \"gallery\": {\"title\": \"Galeri Perjalanan\", \"images\": [], \"cta_label\": \"OUR HISTORY\", \"description\": \"Momen-momen berharga selama perjalanan jamaah.\"}, \"problem\": {\"label\": \"PENTING DIKETAHUI\", \"quote\": \"Kami memahami kekhawatiran itu. Karena itu, kami hadir dengan sistem yang jelas dan transparan.\", \"badges\": [\"Biaya tiba-tiba berubah di tengah jalan\", \"Minimnya informasi & komunikasi\", \"Jadwal keberangkatan tidak jelas\", \"Takut tertipu travel yang tidak amanah\"], \"heading\": \"Banyak Jamaah Gagal Berangkat Bukan Karena Niat, Tapi Karena Salah Pilih Travel\"}, \"articles\": {\"label\": \"Artikel\", \"heading\": \"News & Update Terbaru\", \"cta_label\": \"Lihat Semua Artikel\", \"empty_title\": \"Belum ada artikel yang tampil.\", \"read_more_label\": \"Baca selengkapnya\", \"empty_description\": \"Pastikan artikel sudah berstatus Terbit dan tanggal publikasinya tidak di masa depan.\", \"fallback_item_title_prefix\": \"Artikel\"}, \"packages\": {\"title\": \"Pilihan Paket\", \"heading\": \"Paket Umrah Kami\", \"cta_label\": \"Lihat Paket\", \"description\": \"Pilih paket yang sesuai dengan kebutuhan dan budget perjalanan ibadah Anda.\", \"detail_label\": \"Tanya Paket Ini\", \"price_prefix\": \"Mulai\", \"fallback_name\": \"Paket Umroh\", \"duration_suffix\": \"Hari\", \"fallback_summary\": \"Detail paket akan tampil di sini.\", \"discount_badge_label\": \"UNGGULAN\", \"selected_package_ids\": []}, \"services\": {\"items\": [{\"icon\": \"heart-handshake\", \"title\": \"Mutawif Berpengalaman\", \"image_path\": \"/images/dummy.jpg\", \"description\": \"Didampingi pembimbing ibadah profesional yang hafal rute, doa, dan ritual di Tanah Suci.\"}, {\"icon\": \"plane\", \"title\": \"Penerbangan Direct\", \"image_path\": \"/images/dummy.jpg\", \"description\": \"Penerbangan langsung tanpa transit untuk kenyamanan dan efisiensi waktu jamaah.\"}, {\"icon\": \"images\", \"title\": \"Free Dokumentasi\", \"image_path\": \"/images/dummy.jpg\", \"description\": \"Setiap momen berharga ibadah Anda diabadikan secara profesional sebagai kenangan seumur hidup.\"}, {\"icon\": \"shield-check\", \"title\": \"Legal & Amanah\", \"image_path\": \"/images/dummy.jpg\", \"description\": \"Terdaftar resmi di Kemenag RI. Kepercayaan jamaah adalah prioritas utama kami.\"}], \"label\": \"Layanan Kami\", \"title\": \"Mengapa Asfar Tour\", \"heading\": \"Ibadah Lebih Bermakna\\nBersama Kami\", \"description\": \"Kami tidak sekadar memberangkatkan - kami memastikan setiap momen ibadah Anda berjalan sempurna.\", \"heading_top\": \"Ibadah Lebih\", \"heading_bottom\": \"Bersama Kami\", \"highlight_word\": \"Bermakna\", \"heading_highlight\": \"Bermakna\", \"fallback_description\": \"Deskripsi layanan akan tampil di sini.\", \"fallback_title_prefix\": \"Layanan\"}, \"timeline\": {\"label\": \"Alur Perjalanan yang Kami Jalankan\", \"steps\": [{\"icon\": \"users\", \"title\": \"Registrasi\", \"caption\": \"DAFTAR & KONSULTASI\", \"description\": \"Konsultasi & pilih paket yang sesuai.\"}, {\"icon\": \"credit-card\", \"title\": \"Pembayaran\", \"caption\": \"DP / PELUNASAN\", \"description\": \"Skema biaya jelas, konfirmasi transparan.\"}, {\"icon\": \"check-circle-2\", \"title\": \"Persiapan Umroh\", \"caption\": \"MANASIK & DOKUMEN\", \"description\": \"Manasik, perlengkapan, dan dokumen.\"}, {\"icon\": \"plane\", \"title\": \"Keberangkatan\", \"caption\": \"BERANGKAT BARENG\", \"description\": \"Briefing & pendampingan sebelum berangkat.\"}, {\"icon\": \"landmark\", \"title\": \"Ibadah\", \"caption\": \"BIMBINGAN IBADAH\", \"description\": \"Bimbingan ibadah sepanjang perjalanan.\"}, {\"icon\": \"calendar-days\", \"title\": \"Kepulangan\", \"caption\": \"PULANG AMAN\", \"description\": \"Kontrol perjalanan sampai tiba di tanah air.\"}], \"heading\": \"Sistem Perjalanan yang Jelas, Bukan Sekadar Janji\", \"value_cards\": [{\"icon\": \"shield-check\", \"title\": \"Transparansi Biaya\", \"description\": \"Rincian biaya jelas sejak awal, tanpa kejutan di tengah jalan.\"}, {\"icon\": \"calendar-days\", \"title\": \"Timeline Terencana\", \"description\": \"Jadwal terstruktur dari pendaftaran sampai kepulangan.\"}, {\"icon\": \"heart-handshake\", \"title\": \"Pendampingan Ibadah\", \"description\": \"Pembimbing berpengalaman memastikan ibadah lebih tenang dan khusyuk.\"}, {\"icon\": \"check-circle-2\", \"title\": \"Sistem Terstruktur\", \"description\": \"Proses administrasi, keberangkatan, dan pelayanan berjalan rapi.\"}]}, \"testimonials\": {\"title\": \"Testimoni Jamaah\", \"heading\": \"Mereka Sudah Merasakan\", \"next_label\": \"Berikutnya\", \"prev_label\": \"Sebelumnya\", \"description\": \"Kepercayaan jamaah adalah kebanggaan terbesar Asfar Tour.\", \"fallback_quote\": \"Kepercayaan jamaah adalah kebanggaan terbesar Asfar Tour.\", \"featured_label\": \"UNGGULAN\"}}, \"excerpt\": \"Konten landing baru untuk halaman /landing.\", \"is_active\": true}, \"module_key\": \"website_management\", \"route_name\": \"content.update\", \"module_name\": \"Website Management\", \"status_code\": 302, \"submenu_key\": null, \"submenu_name\": null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-30 16:53:30', '2026-05-30 16:53:30', '2026-05-30 16:53:30');

-- ----------------------------
-- Table structure for articles
-- ----------------------------
DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `body` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `content_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'umrah_education',
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `author_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `tags` json NULL,
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `meta_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `og_image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `reading_time_minutes` int UNSIGNED NOT NULL DEFAULT 1,
  `views_count` int UNSIGNED NOT NULL DEFAULT 0,
  `published_at` timestamp NULL DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `articles_slug_unique`(`slug` ASC) USING BTREE,
  INDEX `articles_published_at_is_active_index`(`published_at` ASC, `is_active` ASC) USING BTREE,
  INDEX `articles_is_featured_is_active_index`(`is_featured` ASC, `is_active` ASC) USING BTREE,
  INDEX `articles_status_published_at_index`(`status` ASC, `published_at` ASC) USING BTREE,
  INDEX `articles_content_type_status_index`(`content_type` ASC, `status` ASC) USING BTREE,
  INDEX `articles_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `articles_updated_by_index`(`updated_by` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of articles
-- ----------------------------
INSERT INTO `articles` VALUES (1, 'tips-menyiapkan-dokumen-umroh', 'Tips Menyiapkan Dokumen Umroh', 'Checklist dokumen yang perlu disiapkan sebelum keberangkatan.', 'Pastikan paspor aktif, data identitas sesuai, dan konsultasikan kebutuhan vaksin serta dokumen tambahan dengan admin resmi.', '/images/dummy.jpg', 'umrah_education', 'draft', NULL, NULL, NULL, NULL, NULL, 1, 0, '2026-05-16 18:16:33', 1, 1, '2026-05-06 03:04:04', '2026-05-26 18:16:33', NULL, NULL);
INSERT INTO `articles` VALUES (2, 'cara-memilih-paket-umroh-sesuai-kebutuhan', 'Cara Memilih Paket Umroh Sesuai Kebutuhan', 'Panduan sederhana membandingkan durasi, hotel, dan kota keberangkatan.', 'Pertimbangkan durasi, lokasi hotel, maskapai, dan pendampingan ibadah sebelum memilih paket keberangkatan.', '/images/dummy.jpg', 'umrah_education', 'draft', NULL, NULL, NULL, NULL, NULL, 1, 0, '2026-05-22 18:16:33', 0, 1, '2026-05-06 03:04:04', '2026-05-26 18:16:33', NULL, NULL);
INSERT INTO `articles` VALUES (3, 'expedita-beatae-id-h', 'Doloribus delectus', 'Molestiae laborum si', '<i>- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga\r\n\r\n- Poin penting pertama\r\n- Poin penting kedua\r\n- Poin penting ketiga</i>', '/storage/articles/JkRcM9OJrMn3zqKJ9UGEwC80wqIJPdjInMFkw6lR.png', 'company_news', 'published', 'Iusto nemo elit ape', '[\"Quia vero quia non u\"]', 'Eos sed corporis sol', 'Quidem dolore maxime', NULL, 2, 21, '2023-11-15 20:46:00', 0, 1, '2026-05-07 09:07:28', '2026-05-28 06:21:25', NULL, NULL);

-- ----------------------------
-- Table structure for bookings
-- ----------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `package_id` bigint UNSIGNED NOT NULL,
  `departure_schedule_id` bigint UNSIGNED NULL DEFAULT NULL,
  `booking_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'regular',
  `custom_departure_date` date NULL DEFAULT NULL,
  `custom_return_date` date NULL DEFAULT NULL,
  `custom_unit_price` bigint UNSIGNED NULL DEFAULT NULL,
  `custom_total_amount` bigint UNSIGNED NULL DEFAULT NULL,
  `custom_currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `origin_city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `passenger_count` smallint UNSIGNED NOT NULL DEFAULT 1,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'registered',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `bookings_booking_code_unique`(`booking_code` ASC) USING BTREE,
  INDEX `bookings_departure_schedule_id_foreign`(`departure_schedule_id` ASC) USING BTREE,
  INDEX `bookings_package_id_status_index`(`package_id` ASC, `status` ASC) USING BTREE,
  INDEX `bookings_created_at_index`(`created_at` ASC) USING BTREE,
  INDEX `bookings_booking_type_index`(`booking_type` ASC) USING BTREE,
  INDEX `bookings_custom_unit_price_index`(`custom_unit_price` ASC) USING BTREE,
  INDEX `bookings_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `bookings_updated_by_index`(`updated_by` ASC) USING BTREE,
  CONSTRAINT `bookings_departure_schedule_id_foreign` FOREIGN KEY (`departure_schedule_id`) REFERENCES `departure_schedules` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `bookings_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of bookings
-- ----------------------------
INSERT INTO `bookings` VALUES (3, 'BK-260529-0002', 9, 42, 'regular', NULL, NULL, NULL, NULL, NULL, 'Firos Malik Abdillah', '085236446961', 'Firosmalik.job@gmail.com', 'Kab. Probolinggo', 3, NULL, 'cancelled', '2026-05-29 02:24:46', '2026-05-30 15:21:23', 1, 1);
INSERT INTO `bookings` VALUES (4, 'BK-260529-0004', 9, 42, 'regular', NULL, NULL, NULL, NULL, NULL, 'teest peplajar', '8951717192', 'tave@mailinator.com', 'Esse dolore modi fac', 5, NULL, 'registered', '2026-05-29 03:15:34', '2026-05-29 03:15:34', 1, 1);
INSERT INTO `bookings` VALUES (5, 'BK-260529-0005', 11, 45, 'regular', NULL, NULL, NULL, NULL, NULL, 'tee tee teeee', '8951717192', 'anjaay@mailinator.com', 'Esse dolore modi fac', 3, NULL, 'registered', '2026-05-29 03:24:39', '2026-05-29 03:24:39', 1, 1);
INSERT INTO `bookings` VALUES (6, 'BK-260529-0007', 11, 46, 'regular', NULL, NULL, NULL, NULL, NULL, 'Firos Malik Abdillah', '085236446961', 'Firosmalik.job@gmail.com', 'Kab. Probolinggo', 4, NULL, 'registered', '2026-05-29 22:41:14', '2026-05-29 22:41:14', 1, 1);
INSERT INTO `bookings` VALUES (7, 'BK-260530-0008', 10, 43, 'regular', NULL, NULL, NULL, NULL, NULL, 'Firos Malik Abdillah', '085236446961', 'Firosmalik.job@gmail.com', 'Kab. Probolinggo', 6, NULL, 'registered', '2026-05-30 02:15:31', '2026-05-30 15:22:17', 1, 1);

-- ----------------------------
-- Table structure for cache
-- ----------------------------
DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache`  (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cache
-- ----------------------------
INSERT INTO `cache` VALUES ('travel_proposal_cache_514ceea6b1d5332139c9d05230d3ad11', 'i:1;', 1780147537);
INSERT INTO `cache` VALUES ('travel_proposal_cache_514ceea6b1d5332139c9d05230d3ad11:timer', 'i:1780147537;', 1780147537);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.landing.daily_visitors.2026-05-28', 'i:2;', 2095339958);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.landing.daily_visitors.2026-05-30', 'i:2;', 2095465034);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.landing.daily_visits.2026-05-28', 'i:12;', 2095339958);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.landing.daily_visits.2026-05-30', 'i:4;', 2095465034);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.landing.total_visitors', 'i:4;', 2095339958);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.landing.total_visits', 'i:16;', 2095339958);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.public.daily_visitors.2026-05-28', 'i:1;', 2095339766);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.public.daily_visitors.2026-05-29', 'i:4;', 2095376610);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.public.daily_visitors.2026-05-30', 'i:2;', 2095463153);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.public.daily_visits.2026-05-28', 'i:61;', 2095339766);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.public.daily_visits.2026-05-29', 'i:335;', 2095376609);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.public.daily_visits.2026-05-30', 'i:145;', 2095463153);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.public.total_visitors', 'i:7;', 2095339766);
INSERT INTO `cache` VALUES ('travel_proposal_cache_analytics.public.total_visits', 'i:541;', 2095339766);
INSERT INTO `cache` VALUES ('travel_proposal_cache_spatie.permission.cache', 'a:3:{s:5:\"alias\";a:4:{s:1:\"a\";s:2:\"id\";s:1:\"b\";s:4:\"name\";s:1:\"c\";s:10:\"guard_name\";s:1:\"r\";s:5:\"roles\";}s:11:\"permissions\";a:232:{i:0;a:4:{s:1:\"a\";i:1;s:1:\"b\";s:26:\"menu.booking_register.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:1;a:4:{s:1:\"a\";i:2;s:1:\"b\";s:28:\"menu.booking_register.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:2;a:4:{s:1:\"a\";i:3;s:1:\"b\";s:26:\"menu.booking_register.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:3;a:4:{s:1:\"a\";i:4;s:1:\"b\";s:28:\"menu.booking_register.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:4;a:4:{s:1:\"a\";i:5;s:1:\"b\";s:28:\"menu.booking_register.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:5;a:4:{s:1:\"a\";i:6;s:1:\"b\";s:28:\"menu.booking_register.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:6;a:4:{s:1:\"a\";i:7;s:1:\"b\";s:29:\"menu.booking_register.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:7;a:4:{s:1:\"a\";i:8;s:1:\"b\";s:28:\"menu.booking_register.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:8;a:4:{s:1:\"a\";i:9;s:1:\"b\";s:25:\"menu.booking_listing.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:9;a:4:{s:1:\"a\";i:10;s:1:\"b\";s:27:\"menu.booking_listing.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:10;a:4:{s:1:\"a\";i:11;s:1:\"b\";s:25:\"menu.booking_listing.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:11;a:4:{s:1:\"a\";i:12;s:1:\"b\";s:27:\"menu.booking_listing.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:12;a:4:{s:1:\"a\";i:13;s:1:\"b\";s:27:\"menu.booking_listing.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:13;a:4:{s:1:\"a\";i:14;s:1:\"b\";s:27:\"menu.booking_listing.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:14;a:4:{s:1:\"a\";i:15;s:1:\"b\";s:28:\"menu.booking_listing.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:15;a:4:{s:1:\"a\";i:16;s:1:\"b\";s:27:\"menu.booking_listing.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:16;a:4:{s:1:\"a\";i:17;s:1:\"b\";s:26:\"menu.financial_report.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:17;a:4:{s:1:\"a\";i:18;s:1:\"b\";s:28:\"menu.financial_report.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:18;a:4:{s:1:\"a\";i:19;s:1:\"b\";s:26:\"menu.financial_report.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:19;a:4:{s:1:\"a\";i:20;s:1:\"b\";s:28:\"menu.financial_report.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:20;a:4:{s:1:\"a\";i:21;s:1:\"b\";s:28:\"menu.financial_report.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:21;a:4:{s:1:\"a\";i:22;s:1:\"b\";s:28:\"menu.financial_report.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:22;a:4:{s:1:\"a\";i:23;s:1:\"b\";s:29:\"menu.financial_report.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:23;a:4:{s:1:\"a\";i:24;s:1:\"b\";s:28:\"menu.financial_report.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:24;a:4:{s:1:\"a\";i:25;s:1:\"b\";s:19:\"menu.dashboard.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;}}i:25;a:4:{s:1:\"a\";i:26;s:1:\"b\";s:21:\"menu.dashboard.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:26;a:4:{s:1:\"a\";i:27;s:1:\"b\";s:19:\"menu.dashboard.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:27;a:4:{s:1:\"a\";i:28;s:1:\"b\";s:21:\"menu.dashboard.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:28;a:4:{s:1:\"a\";i:29;s:1:\"b\";s:21:\"menu.dashboard.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:29;a:4:{s:1:\"a\";i:30;s:1:\"b\";s:21:\"menu.dashboard.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:30;a:4:{s:1:\"a\";i:31;s:1:\"b\";s:22:\"menu.dashboard.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:31;a:4:{s:1:\"a\";i:32;s:1:\"b\";s:21:\"menu.dashboard.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:32;a:4:{s:1:\"a\";i:33;s:1:\"b\";s:22:\"menu.landing_page.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:33;a:4:{s:1:\"a\";i:34;s:1:\"b\";s:24:\"menu.landing_page.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:34;a:4:{s:1:\"a\";i:35;s:1:\"b\";s:22:\"menu.landing_page.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:35;a:4:{s:1:\"a\";i:36;s:1:\"b\";s:24:\"menu.landing_page.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:36;a:4:{s:1:\"a\";i:37;s:1:\"b\";s:24:\"menu.landing_page.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:37;a:4:{s:1:\"a\";i:38;s:1:\"b\";s:24:\"menu.landing_page.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:38;a:4:{s:1:\"a\";i:39;s:1:\"b\";s:25:\"menu.landing_page.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:39;a:4:{s:1:\"a\";i:40;s:1:\"b\";s:24:\"menu.landing_page.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:40;a:4:{s:1:\"a\";i:41;s:1:\"b\";s:29:\"menu.articles_management.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:41;a:4:{s:1:\"a\";i:42;s:1:\"b\";s:31:\"menu.articles_management.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:42;a:4:{s:1:\"a\";i:43;s:1:\"b\";s:29:\"menu.articles_management.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:43;a:4:{s:1:\"a\";i:44;s:1:\"b\";s:31:\"menu.articles_management.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:44;a:4:{s:1:\"a\";i:45;s:1:\"b\";s:31:\"menu.articles_management.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:45;a:4:{s:1:\"a\";i:46;s:1:\"b\";s:31:\"menu.articles_management.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:46;a:4:{s:1:\"a\";i:47;s:1:\"b\";s:32:\"menu.articles_management.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:47;a:4:{s:1:\"a\";i:48;s:1:\"b\";s:31:\"menu.articles_management.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:48;a:4:{s:1:\"a\";i:49;s:1:\"b\";s:24:\"menu.portal_content.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:49;a:4:{s:1:\"a\";i:50;s:1:\"b\";s:26:\"menu.portal_content.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:50;a:4:{s:1:\"a\";i:51;s:1:\"b\";s:24:\"menu.portal_content.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:51;a:4:{s:1:\"a\";i:52;s:1:\"b\";s:26:\"menu.portal_content.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:52;a:4:{s:1:\"a\";i:53;s:1:\"b\";s:26:\"menu.portal_content.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:53;a:4:{s:1:\"a\";i:54;s:1:\"b\";s:26:\"menu.portal_content.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:54;a:4:{s:1:\"a\";i:55;s:1:\"b\";s:27:\"menu.portal_content.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:55;a:4:{s:1:\"a\";i:56;s:1:\"b\";s:26:\"menu.portal_content.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:56;a:3:{s:1:\"a\";i:57;s:1:\"b\";s:28:\"menu.content_management.view\";s:1:\"c\";s:3:\"web\";}i:57;a:3:{s:1:\"a\";i:58;s:1:\"b\";s:30:\"menu.content_management.create\";s:1:\"c\";s:3:\"web\";}i:58;a:3:{s:1:\"a\";i:59;s:1:\"b\";s:28:\"menu.content_management.edit\";s:1:\"c\";s:3:\"web\";}i:59;a:3:{s:1:\"a\";i:60;s:1:\"b\";s:30:\"menu.content_management.delete\";s:1:\"c\";s:3:\"web\";}i:60;a:3:{s:1:\"a\";i:61;s:1:\"b\";s:30:\"menu.content_management.import\";s:1:\"c\";s:3:\"web\";}i:61;a:3:{s:1:\"a\";i:62;s:1:\"b\";s:30:\"menu.content_management.export\";s:1:\"c\";s:3:\"web\";}i:62;a:3:{s:1:\"a\";i:63;s:1:\"b\";s:31:\"menu.content_management.approve\";s:1:\"c\";s:3:\"web\";}i:63;a:3:{s:1:\"a\";i:64;s:1:\"b\";s:30:\"menu.content_management.reject\";s:1:\"c\";s:3:\"web\";}i:64;a:4:{s:1:\"a\";i:65;s:1:\"b\";s:28:\"menu.gallery_management.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:65;a:4:{s:1:\"a\";i:66;s:1:\"b\";s:30:\"menu.gallery_management.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:66;a:4:{s:1:\"a\";i:67;s:1:\"b\";s:28:\"menu.gallery_management.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:67;a:4:{s:1:\"a\";i:68;s:1:\"b\";s:30:\"menu.gallery_management.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:68;a:4:{s:1:\"a\";i:69;s:1:\"b\";s:30:\"menu.gallery_management.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:69;a:4:{s:1:\"a\";i:70;s:1:\"b\";s:30:\"menu.gallery_management.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:70;a:4:{s:1:\"a\";i:71;s:1:\"b\";s:31:\"menu.gallery_management.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:71;a:4:{s:1:\"a\";i:72;s:1:\"b\";s:30:\"menu.gallery_management.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:72;a:4:{s:1:\"a\";i:73;s:1:\"b\";s:22:\"menu.seo_settings.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:73;a:4:{s:1:\"a\";i:74;s:1:\"b\";s:24:\"menu.seo_settings.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:74;a:4:{s:1:\"a\";i:75;s:1:\"b\";s:22:\"menu.seo_settings.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:75;a:4:{s:1:\"a\";i:76;s:1:\"b\";s:24:\"menu.seo_settings.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:76;a:4:{s:1:\"a\";i:77;s:1:\"b\";s:24:\"menu.seo_settings.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:77;a:4:{s:1:\"a\";i:78;s:1:\"b\";s:24:\"menu.seo_settings.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:78;a:4:{s:1:\"a\";i:79;s:1:\"b\";s:25:\"menu.seo_settings.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:79;a:4:{s:1:\"a\";i:80;s:1:\"b\";s:24:\"menu.seo_settings.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:80;a:4:{s:1:\"a\";i:81;s:1:\"b\";s:18:\"menu.branding.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:81;a:4:{s:1:\"a\";i:82;s:1:\"b\";s:20:\"menu.branding.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:82;a:4:{s:1:\"a\";i:83;s:1:\"b\";s:18:\"menu.branding.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:83;a:4:{s:1:\"a\";i:84;s:1:\"b\";s:20:\"menu.branding.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:84;a:4:{s:1:\"a\";i:85;s:1:\"b\";s:20:\"menu.branding.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:85;a:4:{s:1:\"a\";i:86;s:1:\"b\";s:20:\"menu.branding.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:86;a:4:{s:1:\"a\";i:87;s:1:\"b\";s:21:\"menu.branding.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:87;a:4:{s:1:\"a\";i:88;s:1:\"b\";s:20:\"menu.branding.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:88;a:4:{s:1:\"a\";i:89;s:1:\"b\";s:26:\"menu.product_category.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:89;a:4:{s:1:\"a\";i:90;s:1:\"b\";s:28:\"menu.product_category.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:90;a:4:{s:1:\"a\";i:91;s:1:\"b\";s:26:\"menu.product_category.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:91;a:4:{s:1:\"a\";i:92;s:1:\"b\";s:28:\"menu.product_category.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:92;a:4:{s:1:\"a\";i:93;s:1:\"b\";s:28:\"menu.product_category.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:93;a:4:{s:1:\"a\";i:94;s:1:\"b\";s:28:\"menu.product_category.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:94;a:4:{s:1:\"a\";i:95;s:1:\"b\";s:29:\"menu.product_category.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:95;a:4:{s:1:\"a\";i:96;s:1:\"b\";s:28:\"menu.product_category.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:96;a:4:{s:1:\"a\";i:97;s:1:\"b\";s:17:\"menu.product.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:97;a:4:{s:1:\"a\";i:98;s:1:\"b\";s:19:\"menu.product.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:98;a:4:{s:1:\"a\";i:99;s:1:\"b\";s:17:\"menu.product.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:99;a:4:{s:1:\"a\";i:100;s:1:\"b\";s:19:\"menu.product.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:100;a:4:{s:1:\"a\";i:101;s:1:\"b\";s:19:\"menu.product.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:101;a:4:{s:1:\"a\";i:102;s:1:\"b\";s:19:\"menu.product.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:102;a:4:{s:1:\"a\";i:103;s:1:\"b\";s:20:\"menu.product.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:103;a:4:{s:1:\"a\";i:104;s:1:\"b\";s:19:\"menu.product.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:104;a:4:{s:1:\"a\";i:105;s:1:\"b\";s:17:\"menu.package.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:105;a:4:{s:1:\"a\";i:106;s:1:\"b\";s:19:\"menu.package.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:106;a:4:{s:1:\"a\";i:107;s:1:\"b\";s:17:\"menu.package.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:107;a:4:{s:1:\"a\";i:108;s:1:\"b\";s:19:\"menu.package.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:108;a:4:{s:1:\"a\";i:109;s:1:\"b\";s:19:\"menu.package.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:109;a:4:{s:1:\"a\";i:110;s:1:\"b\";s:19:\"menu.package.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:110;a:4:{s:1:\"a\";i:111;s:1:\"b\";s:20:\"menu.package.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:111;a:4:{s:1:\"a\";i:112;s:1:\"b\";s:19:\"menu.package.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:112;a:4:{s:1:\"a\";i:113;s:1:\"b\";s:18:\"menu.activity.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:113;a:4:{s:1:\"a\";i:114;s:1:\"b\";s:20:\"menu.activity.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:114;a:4:{s:1:\"a\";i:115;s:1:\"b\";s:18:\"menu.activity.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:115;a:4:{s:1:\"a\";i:116;s:1:\"b\";s:20:\"menu.activity.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:116;a:4:{s:1:\"a\";i:117;s:1:\"b\";s:20:\"menu.activity.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:117;a:4:{s:1:\"a\";i:118;s:1:\"b\";s:20:\"menu.activity.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:118;a:4:{s:1:\"a\";i:119;s:1:\"b\";s:21:\"menu.activity.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:119;a:4:{s:1:\"a\";i:120;s:1:\"b\";s:20:\"menu.activity.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:120;a:4:{s:1:\"a\";i:121;s:1:\"b\";s:33:\"menu.booking_custom_requests.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:121;a:4:{s:1:\"a\";i:122;s:1:\"b\";s:35:\"menu.booking_custom_requests.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:122;a:4:{s:1:\"a\";i:123;s:1:\"b\";s:33:\"menu.booking_custom_requests.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:123;a:4:{s:1:\"a\";i:124;s:1:\"b\";s:35:\"menu.booking_custom_requests.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:124;a:4:{s:1:\"a\";i:125;s:1:\"b\";s:35:\"menu.booking_custom_requests.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:125;a:4:{s:1:\"a\";i:126;s:1:\"b\";s:35:\"menu.booking_custom_requests.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:126;a:4:{s:1:\"a\";i:127;s:1:\"b\";s:36:\"menu.booking_custom_requests.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:127;a:4:{s:1:\"a\";i:128;s:1:\"b\";s:35:\"menu.booking_custom_requests.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:128;a:4:{s:1:\"a\";i:129;s:1:\"b\";s:25:\"menu.menu_management.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:129;a:4:{s:1:\"a\";i:130;s:1:\"b\";s:27:\"menu.menu_management.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:130;a:4:{s:1:\"a\";i:131;s:1:\"b\";s:25:\"menu.menu_management.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:131;a:4:{s:1:\"a\";i:132;s:1:\"b\";s:27:\"menu.menu_management.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:132;a:4:{s:1:\"a\";i:133;s:1:\"b\";s:27:\"menu.menu_management.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:133;a:4:{s:1:\"a\";i:134;s:1:\"b\";s:27:\"menu.menu_management.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:134;a:4:{s:1:\"a\";i:135;s:1:\"b\";s:28:\"menu.menu_management.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:135;a:4:{s:1:\"a\";i:136;s:1:\"b\";s:27:\"menu.menu_management.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:136;a:4:{s:1:\"a\";i:137;s:1:\"b\";s:25:\"menu.user_management.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:137;a:4:{s:1:\"a\";i:138;s:1:\"b\";s:27:\"menu.user_management.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:138;a:4:{s:1:\"a\";i:139;s:1:\"b\";s:25:\"menu.user_management.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:139;a:4:{s:1:\"a\";i:140;s:1:\"b\";s:27:\"menu.user_management.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:140;a:4:{s:1:\"a\";i:141;s:1:\"b\";s:27:\"menu.user_management.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:141;a:4:{s:1:\"a\";i:142;s:1:\"b\";s:27:\"menu.user_management.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:142;a:4:{s:1:\"a\";i:143;s:1:\"b\";s:28:\"menu.user_management.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:143;a:4:{s:1:\"a\";i:144;s:1:\"b\";s:27:\"menu.user_management.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:144;a:4:{s:1:\"a\";i:145;s:1:\"b\";s:25:\"menu.role_management.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:145;a:4:{s:1:\"a\";i:146;s:1:\"b\";s:27:\"menu.role_management.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:146;a:4:{s:1:\"a\";i:147;s:1:\"b\";s:25:\"menu.role_management.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:147;a:4:{s:1:\"a\";i:148;s:1:\"b\";s:27:\"menu.role_management.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:148;a:4:{s:1:\"a\";i:149;s:1:\"b\";s:27:\"menu.role_management.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:149;a:4:{s:1:\"a\";i:150;s:1:\"b\";s:27:\"menu.role_management.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:150;a:4:{s:1:\"a\";i:151;s:1:\"b\";s:28:\"menu.role_management.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:151;a:4:{s:1:\"a\";i:152;s:1:\"b\";s:27:\"menu.role_management.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:152;a:4:{s:1:\"a\";i:153;s:1:\"b\";s:19:\"menu.inventory.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:153;a:4:{s:1:\"a\";i:154;s:1:\"b\";s:21:\"menu.inventory.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:154;a:4:{s:1:\"a\";i:155;s:1:\"b\";s:19:\"menu.inventory.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:155;a:4:{s:1:\"a\";i:156;s:1:\"b\";s:21:\"menu.inventory.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:156;a:4:{s:1:\"a\";i:157;s:1:\"b\";s:21:\"menu.inventory.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:157;a:4:{s:1:\"a\";i:158;s:1:\"b\";s:21:\"menu.inventory.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:158;a:4:{s:1:\"a\";i:159;s:1:\"b\";s:22:\"menu.inventory.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:159;a:4:{s:1:\"a\";i:160;s:1:\"b\";s:21:\"menu.inventory.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:160;a:4:{s:1:\"a\";i:161;s:1:\"b\";s:22:\"menu.activity_log.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:161;a:4:{s:1:\"a\";i:162;s:1:\"b\";s:24:\"menu.activity_log.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:162;a:4:{s:1:\"a\";i:163;s:1:\"b\";s:22:\"menu.activity_log.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:163;a:4:{s:1:\"a\";i:164;s:1:\"b\";s:24:\"menu.activity_log.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:164;a:4:{s:1:\"a\";i:165;s:1:\"b\";s:24:\"menu.activity_log.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:165;a:4:{s:1:\"a\";i:166;s:1:\"b\";s:24:\"menu.activity_log.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:166;a:4:{s:1:\"a\";i:167;s:1:\"b\";s:25:\"menu.activity_log.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:167;a:4:{s:1:\"a\";i:168;s:1:\"b\";s:24:\"menu.activity_log.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:168;a:4:{s:1:\"a\";i:169;s:1:\"b\";s:18:\"menu.cashflow.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:169;a:4:{s:1:\"a\";i:170;s:1:\"b\";s:20:\"menu.cashflow.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:170;a:4:{s:1:\"a\";i:171;s:1:\"b\";s:18:\"menu.cashflow.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:171;a:4:{s:1:\"a\";i:172;s:1:\"b\";s:20:\"menu.cashflow.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:172;a:4:{s:1:\"a\";i:173;s:1:\"b\";s:20:\"menu.cashflow.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:173;a:4:{s:1:\"a\";i:174;s:1:\"b\";s:20:\"menu.cashflow.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:174;a:4:{s:1:\"a\";i:175;s:1:\"b\";s:21:\"menu.cashflow.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:175;a:4:{s:1:\"a\";i:176;s:1:\"b\";s:20:\"menu.cashflow.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:176;a:4:{s:1:\"a\";i:177;s:1:\"b\";s:15:\"menu.hotel.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:177;a:4:{s:1:\"a\";i:178;s:1:\"b\";s:17:\"menu.hotel.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:178;a:4:{s:1:\"a\";i:179;s:1:\"b\";s:15:\"menu.hotel.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:179;a:4:{s:1:\"a\";i:180;s:1:\"b\";s:17:\"menu.hotel.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:180;a:4:{s:1:\"a\";i:181;s:1:\"b\";s:17:\"menu.hotel.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:181;a:4:{s:1:\"a\";i:182;s:1:\"b\";s:17:\"menu.hotel.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:182;a:4:{s:1:\"a\";i:183;s:1:\"b\";s:18:\"menu.hotel.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:183;a:4:{s:1:\"a\";i:184;s:1:\"b\";s:17:\"menu.hotel.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:184;a:4:{s:1:\"a\";i:185;s:1:\"b\";s:23:\"menu.hotel_country.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:185;a:4:{s:1:\"a\";i:186;s:1:\"b\";s:25:\"menu.hotel_country.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:186;a:4:{s:1:\"a\";i:187;s:1:\"b\";s:23:\"menu.hotel_country.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:187;a:4:{s:1:\"a\";i:188;s:1:\"b\";s:25:\"menu.hotel_country.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:188;a:4:{s:1:\"a\";i:189;s:1:\"b\";s:25:\"menu.hotel_country.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:189;a:4:{s:1:\"a\";i:190;s:1:\"b\";s:25:\"menu.hotel_country.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:190;a:4:{s:1:\"a\";i:191;s:1:\"b\";s:26:\"menu.hotel_country.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:191;a:4:{s:1:\"a\";i:192;s:1:\"b\";s:25:\"menu.hotel_country.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:192;a:4:{s:1:\"a\";i:193;s:1:\"b\";s:20:\"menu.hotel_city.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:193;a:4:{s:1:\"a\";i:194;s:1:\"b\";s:22:\"menu.hotel_city.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:194;a:4:{s:1:\"a\";i:195;s:1:\"b\";s:20:\"menu.hotel_city.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:195;a:4:{s:1:\"a\";i:196;s:1:\"b\";s:22:\"menu.hotel_city.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:196;a:4:{s:1:\"a\";i:197;s:1:\"b\";s:22:\"menu.hotel_city.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:197;a:4:{s:1:\"a\";i:198;s:1:\"b\";s:22:\"menu.hotel_city.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:198;a:4:{s:1:\"a\";i:199;s:1:\"b\";s:23:\"menu.hotel_city.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:199;a:4:{s:1:\"a\";i:200;s:1:\"b\";s:22:\"menu.hotel_city.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:200;a:4:{s:1:\"a\";i:201;s:1:\"b\";s:25:\"menu.hotel_room_type.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:201;a:4:{s:1:\"a\";i:202;s:1:\"b\";s:27:\"menu.hotel_room_type.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:202;a:4:{s:1:\"a\";i:203;s:1:\"b\";s:25:\"menu.hotel_room_type.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:203;a:4:{s:1:\"a\";i:204;s:1:\"b\";s:27:\"menu.hotel_room_type.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:204;a:4:{s:1:\"a\";i:205;s:1:\"b\";s:27:\"menu.hotel_room_type.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:205;a:4:{s:1:\"a\";i:206;s:1:\"b\";s:27:\"menu.hotel_room_type.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:206;a:4:{s:1:\"a\";i:207;s:1:\"b\";s:28:\"menu.hotel_room_type.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:207;a:4:{s:1:\"a\";i:208;s:1:\"b\";s:27:\"menu.hotel_room_type.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:208;a:4:{s:1:\"a\";i:209;s:1:\"b\";s:34:\"menu.booking_hotel_assignment.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:209;a:4:{s:1:\"a\";i:210;s:1:\"b\";s:36:\"menu.booking_hotel_assignment.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:210;a:4:{s:1:\"a\";i:211;s:1:\"b\";s:34:\"menu.booking_hotel_assignment.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:211;a:4:{s:1:\"a\";i:212;s:1:\"b\";s:36:\"menu.booking_hotel_assignment.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:212;a:4:{s:1:\"a\";i:213;s:1:\"b\";s:36:\"menu.booking_hotel_assignment.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:213;a:4:{s:1:\"a\";i:214;s:1:\"b\";s:36:\"menu.booking_hotel_assignment.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:214;a:4:{s:1:\"a\";i:215;s:1:\"b\";s:37:\"menu.booking_hotel_assignment.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:215;a:4:{s:1:\"a\";i:216;s:1:\"b\";s:36:\"menu.booking_hotel_assignment.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:216;a:4:{s:1:\"a\";i:217;s:1:\"b\";s:21:\"menu.hpp_package.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:217;a:4:{s:1:\"a\";i:218;s:1:\"b\";s:23:\"menu.hpp_package.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:218;a:4:{s:1:\"a\";i:219;s:1:\"b\";s:21:\"menu.hpp_package.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:219;a:4:{s:1:\"a\";i:220;s:1:\"b\";s:23:\"menu.hpp_package.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:220;a:4:{s:1:\"a\";i:221;s:1:\"b\";s:23:\"menu.hpp_package.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:221;a:4:{s:1:\"a\";i:222;s:1:\"b\";s:23:\"menu.hpp_package.import\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:222;a:4:{s:1:\"a\";i:223;s:1:\"b\";s:24:\"menu.hpp_package.approve\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:223;a:4:{s:1:\"a\";i:224;s:1:\"b\";s:23:\"menu.hpp_package.reject\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:224;a:3:{s:1:\"a\";i:225;s:1:\"b\";s:25:\"menu.master_currency.view\";s:1:\"c\";s:3:\"web\";}i:225;a:3:{s:1:\"a\";i:226;s:1:\"b\";s:27:\"menu.master_currency.create\";s:1:\"c\";s:3:\"web\";}i:226;a:3:{s:1:\"a\";i:227;s:1:\"b\";s:25:\"menu.master_currency.edit\";s:1:\"c\";s:3:\"web\";}i:227;a:3:{s:1:\"a\";i:228;s:1:\"b\";s:27:\"menu.master_currency.delete\";s:1:\"c\";s:3:\"web\";}i:228;a:3:{s:1:\"a\";i:229;s:1:\"b\";s:27:\"menu.master_currency.import\";s:1:\"c\";s:3:\"web\";}i:229;a:3:{s:1:\"a\";i:230;s:1:\"b\";s:27:\"menu.master_currency.export\";s:1:\"c\";s:3:\"web\";}i:230;a:3:{s:1:\"a\";i:231;s:1:\"b\";s:28:\"menu.master_currency.approve\";s:1:\"c\";s:3:\"web\";}i:231;a:3:{s:1:\"a\";i:232;s:1:\"b\";s:27:\"menu.master_currency.reject\";s:1:\"c\";s:3:\"web\";}}s:5:\"roles\";a:4:{i:0;a:3:{s:1:\"a\";i:1;s:1:\"b\";s:11:\"Super Admin\";s:1:\"c\";s:3:\"web\";}i:1;a:3:{s:1:\"a\";i:2;s:1:\"b\";s:11:\"Operasional\";s:1:\"c\";s:3:\"web\";}i:2;a:3:{s:1:\"a\";i:4;s:1:\"b\";s:2:\"CS\";s:1:\"c\";s:3:\"web\";}i:3;a:3:{s:1:\"a\";i:3;s:1:\"b\";s:13:\"ContentEditor\";s:1:\"c\";s:3:\"web\";}}}', 1780190265);

-- ----------------------------
-- Table structure for cache_locks
-- ----------------------------
DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks`  (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cache_locks
-- ----------------------------

-- ----------------------------
-- Table structure for career_openings
-- ----------------------------
DROP TABLE IF EXISTS `career_openings`;
CREATE TABLE `career_openings`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `employment_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirements` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `career_openings_sort_order_is_active_index`(`sort_order` ASC, `is_active` ASC) USING BTREE,
  INDEX `career_openings_employment_type_is_active_index`(`employment_type` ASC, `is_active` ASC) USING BTREE,
  INDEX `career_openings_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `career_openings_updated_by_index`(`updated_by` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of career_openings
-- ----------------------------
INSERT INTO `career_openings` VALUES (1, 'Customer Service', 'Jakarta', 'Full-time', 'Menangani konsultasi jamaah dan tindak lanjut administrasi.', 'Pengalaman 1 tahun di bidang pelayanan.', 1, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `career_openings` VALUES (2, 'Tour Leader', 'Jakarta', 'Project based', 'Mendampingi rombongan dan memastikan itinerary berjalan rapi.', 'Memahami alur perjalanan ibadah dan komunikasi jamaah.', 2, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);

-- ----------------------------
-- Table structure for cashflow_attachments
-- ----------------------------
DROP TABLE IF EXISTS `cashflow_attachments`;
CREATE TABLE `cashflow_attachments`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `cashflow_id` bigint UNSIGNED NOT NULL,
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `cashflow_attachments_cashflow_id_foreign`(`cashflow_id` ASC) USING BTREE,
  CONSTRAINT `cashflow_attachments_cashflow_id_foreign` FOREIGN KEY (`cashflow_id`) REFERENCES `cashflows` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cashflow_attachments
-- ----------------------------
INSERT INTO `cashflow_attachments` VALUES (1, 1, '/storage/cashflows/oEjUUAVDy4bYasR9BdNf7EEiUCeqYGb2Gvk2Ossd.png', 'screencapture-travel-proposal-test-landing-2026-05-25-21_45_55.png', 650983, '2026-05-26 19:15:28', '2026-05-26 19:15:28');

-- ----------------------------
-- Table structure for cashflows
-- ----------------------------
DROP TABLE IF EXISTS `cashflows`;
CREATE TABLE `cashflows`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `transaction_date` date NOT NULL,
  `type` enum('income','expense') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` bigint UNSIGNED NOT NULL,
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `cashflows_transaction_date_type_index`(`transaction_date` ASC, `type` ASC) USING BTREE,
  INDEX `cashflows_category_index`(`category` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cashflows
-- ----------------------------
INSERT INTO `cashflows` VALUES (1, '2026-05-27', 'expense', 2000000, 'operasional', 'test', '2026-05-26 19:15:28', '2026-05-26 19:15:28', NULL, 1, 1);

-- ----------------------------
-- Table structure for custom_umroh_requests
-- ----------------------------
DROP TABLE IF EXISTS `custom_umroh_requests`;
CREATE TABLE `custom_umroh_requests`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `origin_city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `passenger_count` int UNSIGNED NOT NULL,
  `group_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `departure_month` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `departure_date` date NULL DEFAULT NULL,
  `return_date` date NULL DEFAULT NULL,
  `budget` bigint UNSIGNED NULL DEFAULT NULL,
  `focus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_preference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `booking_id` bigint UNSIGNED NULL DEFAULT NULL,
  `approved_by` bigint UNSIGNED NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejected_by` bigint UNSIGNED NULL DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `custom_umroh_requests_request_code_unique`(`request_code` ASC) USING BTREE,
  INDEX `custom_umroh_requests_booking_id_foreign`(`booking_id` ASC) USING BTREE,
  INDEX `custom_umroh_requests_approved_by_foreign`(`approved_by` ASC) USING BTREE,
  INDEX `custom_umroh_requests_rejected_by_foreign`(`rejected_by` ASC) USING BTREE,
  INDEX `custom_umroh_requests_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `custom_umroh_requests_updated_by_index`(`updated_by` ASC) USING BTREE,
  CONSTRAINT `custom_umroh_requests_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `custom_umroh_requests_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `custom_umroh_requests_rejected_by_foreign` FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of custom_umroh_requests
-- ----------------------------
INSERT INTO `custom_umroh_requests` VALUES (1, 'CU-260507-KETL3C', 'Ut iste fugiat minim', '987655678', 'xyzoqytut@mailinator.com', 'Consequatur iusto r', 46, 'Teman / Komunitas', '2004-10', NULL, NULL, 200000000, 'Pendampingan ibadah', 'Double', 'Reiciendis aliquip v', 'new', NULL, NULL, NULL, NULL, NULL, '2026-05-07 07:19:49', '2026-05-07 07:19:49', NULL, NULL);
INSERT INTO `custom_umroh_requests` VALUES (2, 'CU-260507-49FWZQ', 'Ut ex repellendus V', '45464737373', 'lenep@mailinator.com', 'Quis aut sint ut sit', 42, 'Corporate / Instansi', '1985-02', '2026-06-23', '2026-06-25', 30000000, 'Harga terbaik', 'Fleksibel', 'Id atque a qui omnis', 'approved', NULL, 1, '2026-05-07 13:07:22', NULL, NULL, '2026-05-07 13:06:03', '2026-05-07 13:07:22', NULL, NULL);

-- ----------------------------
-- Table structure for departure_schedules
-- ----------------------------
DROP TABLE IF EXISTS `departure_schedules`;
CREATE TABLE `departure_schedules`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `package_id` bigint UNSIGNED NULL DEFAULT NULL,
  `departure_date` date NOT NULL,
  `return_date` date NULL DEFAULT NULL,
  `departure_city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `seats_total` int UNSIGNED NOT NULL DEFAULT 0,
  `seats_available` int UNSIGNED NOT NULL DEFAULT 0,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `departure_schedules_package_id_foreign`(`package_id` ASC) USING BTREE,
  INDEX `departure_schedules_departure_date_is_active_index`(`departure_date` ASC, `is_active` ASC) USING BTREE,
  INDEX `departure_schedules_status_is_active_index`(`status` ASC, `is_active` ASC) USING BTREE,
  INDEX `departure_schedules_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `departure_schedules_updated_by_index`(`updated_by` ASC) USING BTREE,
  CONSTRAINT `departure_schedules_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 47 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of departure_schedules
-- ----------------------------
INSERT INTO `departure_schedules` VALUES (41, 9, '2026-08-18', '2026-08-26', 'Jakarta', 45, 20, 'open', 'Kuota batch 1.', 1, '2026-05-29 01:37:39', '2026-05-29 01:37:39', NULL, NULL);
INSERT INTO `departure_schedules` VALUES (42, 9, '2026-09-16', '2026-09-24', 'Jakarta', 45, 40, 'open', 'Kuota batch 2.', 1, '2026-05-29 01:37:39', '2026-05-30 15:21:23', NULL, NULL);
INSERT INTO `departure_schedules` VALUES (43, 10, '2026-10-06', '2026-10-15', 'Jakarta', 40, 34, 'open', 'Program keluarga.', 1, '2026-05-29 01:37:39', '2026-05-30 15:22:17', NULL, NULL);
INSERT INTO `departure_schedules` VALUES (44, 10, '2026-11-03', '2026-11-12', 'Surabaya', 40, 26, 'open', 'Keberangkatan Surabaya.', 1, '2026-05-29 01:37:39', '2026-05-29 01:37:39', NULL, NULL);
INSERT INTO `departure_schedules` VALUES (45, 11, '2026-11-20', '2026-12-01', 'Jakarta', 30, 27, 'open', 'Layanan premium lengkap.', 1, '2026-05-29 01:37:39', '2026-05-29 03:24:39', NULL, NULL);
INSERT INTO `departure_schedules` VALUES (46, 11, '2026-12-10', '2026-12-21', 'Jakarta', 30, 26, 'open', 'Batch akhir tahun.', 1, '2026-05-29 01:37:39', '2026-05-29 22:41:14', NULL, NULL);

-- ----------------------------
-- Table structure for failed_jobs
-- ----------------------------
DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `failed_jobs_uuid_unique`(`uuid` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of failed_jobs
-- ----------------------------

-- ----------------------------
-- Table structure for faqs
-- ----------------------------
DROP TABLE IF EXISTS `faqs`;
CREATE TABLE `faqs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `question` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `faqs_sort_order_is_active_index`(`sort_order` ASC, `is_active` ASC) USING BTREE,
  INDEX `faqs_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `faqs_updated_by_index`(`updated_by` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of faqs
-- ----------------------------
INSERT INTO `faqs` VALUES (1, 'Apakah Asfar Tour sudah terdaftar resmi di Kemenag?', 'Ya, Asfar Tour terdaftar resmi di Kemenag RI dan memiliki izin operasional yang berlaku.', 1, 1, '2026-05-06 03:04:04', '2026-05-25 23:03:47', NULL, NULL);
INSERT INTO `faqs` VALUES (2, 'Berapa lama proses pendaftaran hingga keberangkatan?', 'Umumnya 1-3 bulan sebelum jadwal keberangkatan, tergantung kuota seat dan proses dokumen.', 2, 1, '2026-05-06 03:04:04', '2026-05-25 23:03:47', NULL, NULL);
INSERT INTO `faqs` VALUES (3, 'Apakah bisa daftar untuk pasangan suami istri?', 'Bisa. Kami menyediakan opsi kamar dan pengaturan keberangkatan untuk pasangan.', 3, 1, '2026-05-06 03:04:04', '2026-05-25 23:03:48', NULL, NULL);
INSERT INTO `faqs` VALUES (4, 'Apakah ada cicilan atau DP?', 'Ada. Pembayaran dapat dimulai dengan DP lalu pelunasan mengikuti jadwal yang disepakati.', 4, 1, '2026-05-25 23:03:48', '2026-05-25 23:03:48', NULL, NULL);
INSERT INTO `faqs` VALUES (5, 'Apa yang dimaksud free dokumentasi di Paket Santuy?', 'Jamaah mendapatkan layanan dokumentasi foto/video selama program sesuai ketentuan paket.', 5, 1, '2026-05-25 23:03:48', '2026-05-25 23:03:48', NULL, NULL);

-- ----------------------------
-- Table structure for gallery_items
-- ----------------------------
DROP TABLE IF EXISTS `gallery_items`;
CREATE TABLE `gallery_items`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `gallery_items_category_is_active_index`(`category` ASC, `is_active` ASC) USING BTREE,
  INDEX `gallery_items_sort_order_is_active_index`(`sort_order` ASC, `is_active` ASC) USING BTREE,
  INDEX `gallery_items_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `gallery_items_updated_by_index`(`updated_by` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of gallery_items
-- ----------------------------
INSERT INTO `gallery_items` VALUES (1, 'Detail arsitektur Masjid Nabawi', 'galeri', 'Momen dokumentasi perjalanan jamaah.', '/images/dummy.jpg', 1, 1, '2026-05-06 03:04:04', '2026-05-26 08:44:06', NULL, 1);
INSERT INTO `gallery_items` VALUES (2, 'Pemandangan kota Madinah', 'galeri', 'Area sekitar masjid dan hotel jamaah.', '/images/dummy.jpg', 2, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `gallery_items` VALUES (3, 'Jamaah sedang berdoa', 'galeri', 'Pendampingan ibadah selama di tanah suci.', '/images/dummy.jpg', 3, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);

-- ----------------------------
-- Table structure for hotel_assignment_rooms
-- ----------------------------
DROP TABLE IF EXISTS `hotel_assignment_rooms`;
CREATE TABLE `hotel_assignment_rooms`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `hotel_assignment_id` bigint UNSIGNED NOT NULL,
  `room_type_id` bigint UNSIGNED NOT NULL,
  `room_count` int UNSIGNED NOT NULL,
  `room_capacity` smallint UNSIGNED NOT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `hotel_assignment_rooms_assignment_room_type_unique`(`hotel_assignment_id` ASC, `room_type_id` ASC) USING BTREE,
  INDEX `hotel_assignment_rooms_room_type_id_foreign`(`room_type_id` ASC) USING BTREE,
  INDEX `hotel_assignment_rooms_created_by_foreign`(`created_by` ASC) USING BTREE,
  INDEX `hotel_assignment_rooms_updated_by_foreign`(`updated_by` ASC) USING BTREE,
  CONSTRAINT `hotel_assignment_rooms_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `hotel_assignment_rooms_hotel_assignment_id_foreign` FOREIGN KEY (`hotel_assignment_id`) REFERENCES `hotel_assignments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `hotel_assignment_rooms_room_type_id_foreign` FOREIGN KEY (`room_type_id`) REFERENCES `hotel_room_types` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `hotel_assignment_rooms_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hotel_assignment_rooms
-- ----------------------------
INSERT INTO `hotel_assignment_rooms` VALUES (1, 1, 1, 1, 2, 1, 1, '2026-05-29 03:36:52', '2026-05-29 03:36:52', NULL);
INSERT INTO `hotel_assignment_rooms` VALUES (2, 1, 3, 1, 4, 1, 1, '2026-05-29 03:36:52', '2026-05-29 03:36:52', NULL);
INSERT INTO `hotel_assignment_rooms` VALUES (3, 1, 2, 1, 3, 1, 1, '2026-05-29 03:36:52', '2026-05-29 03:36:52', NULL);
INSERT INTO `hotel_assignment_rooms` VALUES (4, 2, 2, 1, 3, 1, 1, '2026-05-29 04:35:21', '2026-05-29 04:35:21', NULL);
INSERT INTO `hotel_assignment_rooms` VALUES (5, 3, 3, 1, 4, 1, 1, '2026-05-29 22:42:43', '2026-05-29 22:42:43', NULL);
INSERT INTO `hotel_assignment_rooms` VALUES (6, 4, 1, 2, 2, 1, 1, '2026-05-30 02:16:51', '2026-05-30 02:16:51', NULL);
INSERT INTO `hotel_assignment_rooms` VALUES (7, 4, 3, 1, 4, 1, 1, '2026-05-30 02:16:51', '2026-05-30 02:16:51', NULL);

-- ----------------------------
-- Table structure for hotel_assignments
-- ----------------------------
DROP TABLE IF EXISTS `hotel_assignments`;
CREATE TABLE `hotel_assignments`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `package_id` bigint UNSIGNED NOT NULL,
  `departure_schedule_id` bigint UNSIGNED NOT NULL,
  `hotel_id` bigint UNSIGNED NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `hotel_assignments_schedule_hotel_unique`(`departure_schedule_id` ASC, `hotel_id` ASC) USING BTREE,
  INDEX `hotel_assignments_package_id_foreign`(`package_id` ASC) USING BTREE,
  INDEX `hotel_assignments_hotel_id_foreign`(`hotel_id` ASC) USING BTREE,
  INDEX `hotel_assignments_created_by_foreign`(`created_by` ASC) USING BTREE,
  INDEX `hotel_assignments_updated_by_foreign`(`updated_by` ASC) USING BTREE,
  CONSTRAINT `hotel_assignments_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `hotel_assignments_departure_schedule_id_foreign` FOREIGN KEY (`departure_schedule_id`) REFERENCES `departure_schedules` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `hotel_assignments_hotel_id_foreign` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `hotel_assignments_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `hotel_assignments_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hotel_assignments
-- ----------------------------
INSERT INTO `hotel_assignments` VALUES (1, 9, 42, 22, 'draft', NULL, 1, 1, '2026-05-29 03:36:52', '2026-05-29 03:36:52', NULL);
INSERT INTO `hotel_assignments` VALUES (2, 11, 45, 29, 'draft', NULL, 1, 1, '2026-05-29 04:35:21', '2026-05-29 04:35:21', NULL);
INSERT INTO `hotel_assignments` VALUES (3, 11, 46, 6, 'draft', NULL, 1, 1, '2026-05-29 22:42:43', '2026-05-29 22:42:43', NULL);
INSERT INTO `hotel_assignments` VALUES (4, 10, 43, 12, 'draft', NULL, 1, 1, '2026-05-30 02:16:51', '2026-05-30 02:16:51', NULL);

-- ----------------------------
-- Table structure for hotel_cities
-- ----------------------------
DROP TABLE IF EXISTS `hotel_cities`;
CREATE TABLE `hotel_cities`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `country_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `hotel_cities_country_id_name_unique`(`country_id` ASC, `name` ASC) USING BTREE,
  INDEX `hotel_cities_country_id_is_active_index`(`country_id` ASC, `is_active` ASC) USING BTREE,
  CONSTRAINT `hotel_cities_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `hotel_countries` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hotel_cities
-- ----------------------------
INSERT INTO `hotel_cities` VALUES (1, 1, 'Mekkah', 1, '2026-05-28 06:15:37', '2026-05-28 06:15:37', NULL, NULL, NULL);
INSERT INTO `hotel_cities` VALUES (2, 1, 'Madinah', 1, '2026-05-28 06:23:01', '2026-05-28 06:23:01', NULL, NULL, NULL);
INSERT INTO `hotel_cities` VALUES (3, 2, 'TEST KOTA', 1, '2026-05-30 13:40:31', '2026-05-30 13:40:31', NULL, 1, 1);
INSERT INTO `hotel_cities` VALUES (4, 5, 'Bali', 1, '2026-05-30 16:17:27', '2026-05-30 16:17:27', NULL, 1, 1);
INSERT INTO `hotel_cities` VALUES (5, 5, 'Jakarta', 1, '2026-05-30 16:17:46', '2026-05-30 16:17:46', NULL, 1, 1);
INSERT INTO `hotel_cities` VALUES (6, 5, 'Yogyakarta', 1, '2026-05-30 16:18:04', '2026-05-30 16:18:04', NULL, 1, 1);
INSERT INTO `hotel_cities` VALUES (7, 5, 'Lombok', 1, '2026-05-30 16:18:16', '2026-05-30 16:18:16', NULL, 1, 1);
INSERT INTO `hotel_cities` VALUES (8, 4, 'Kuala Lumpur', 1, '2026-05-30 16:18:27', '2026-05-30 16:18:27', NULL, 1, 1);
INSERT INTO `hotel_cities` VALUES (9, 4, 'Penang', 1, '2026-05-30 16:18:36', '2026-05-30 16:18:36', NULL, 1, 1);
INSERT INTO `hotel_cities` VALUES (10, 4, 'Johor Bahru', 1, '2026-05-30 16:18:46', '2026-05-30 16:18:46', NULL, 1, 1);
INSERT INTO `hotel_cities` VALUES (11, 4, 'Langkawi', 1, '2026-05-30 16:18:58', '2026-05-30 16:18:58', NULL, 1, 1);
INSERT INTO `hotel_cities` VALUES (12, 3, 'Istanbul', 1, '2026-05-30 16:19:17', '2026-05-30 16:19:17', NULL, 1, 1);
INSERT INTO `hotel_cities` VALUES (13, 3, 'Bursa', 1, '2026-05-30 16:19:30', '2026-05-30 16:19:30', NULL, 1, 1);
INSERT INTO `hotel_cities` VALUES (14, 3, 'Antalya', 1, '2026-05-30 16:19:41', '2026-05-30 16:19:41', NULL, 1, 1);
INSERT INTO `hotel_cities` VALUES (15, 3, 'Cappadocia', 1, '2026-05-30 16:19:51', '2026-05-30 16:19:51', NULL, 1, 1);

-- ----------------------------
-- Table structure for hotel_countries
-- ----------------------------
DROP TABLE IF EXISTS `hotel_countries`;
CREATE TABLE `hotel_countries`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `hotel_countries_name_unique`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hotel_countries
-- ----------------------------
INSERT INTO `hotel_countries` VALUES (1, 'Arab Saudi', 1, '2026-05-28 06:15:37', '2026-05-28 06:15:37', NULL, NULL, NULL);
INSERT INTO `hotel_countries` VALUES (2, 'TEST NEGARA', 1, '2026-05-30 13:40:10', '2026-05-30 13:40:10', NULL, 1, 1);
INSERT INTO `hotel_countries` VALUES (3, 'Turkey', 1, '2026-05-30 16:16:10', '2026-05-30 16:16:10', NULL, 1, 1);
INSERT INTO `hotel_countries` VALUES (4, 'Malaysia', 1, '2026-05-30 16:16:26', '2026-05-30 16:16:26', NULL, 1, 1);
INSERT INTO `hotel_countries` VALUES (5, 'Indonesia', 1, '2026-05-30 16:16:40', '2026-05-30 16:16:40', NULL, 1, 1);

-- ----------------------------
-- Table structure for hotel_prices
-- ----------------------------
DROP TABLE IF EXISTS `hotel_prices`;
CREATE TABLE `hotel_prices`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `hotel_id` bigint UNSIGNED NOT NULL,
  `room_type_id` bigint UNSIGNED NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `price` bigint UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `hotel_prices_room_type_id_foreign`(`room_type_id` ASC) USING BTREE,
  INDEX `hotel_prices_hotel_id_room_type_id_index`(`hotel_id` ASC, `room_type_id` ASC) USING BTREE,
  INDEX `hotel_prices_period_start_period_end_index`(`period_start` ASC, `period_end` ASC) USING BTREE,
  CONSTRAINT `hotel_prices_hotel_id_foreign` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `hotel_prices_room_type_id_foreign` FOREIGN KEY (`room_type_id`) REFERENCES `hotel_room_types` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 769 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hotel_prices
-- ----------------------------
INSERT INTO `hotel_prices` VALUES (1, 1, 1, '2026-06-20', '2026-07-01', 540, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (2, 1, 2, '2026-06-20', '2026-07-01', 610, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (3, 1, 3, '2026-06-20', '2026-07-01', 680, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (4, 1, 1, '2026-07-01', '2026-08-01', 590, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (5, 1, 2, '2026-07-01', '2026-08-01', 680, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (6, 1, 3, '2026-07-01', '2026-08-01', 770, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (7, 1, 1, '2026-08-01', '2026-09-01', 620, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (8, 1, 2, '2026-08-01', '2026-09-01', 720, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (9, 1, 3, '2026-08-01', '2026-09-01', 820, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (10, 2, 1, '2026-06-16', '2026-07-31', 580, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (11, 2, 2, '2026-06-16', '2026-07-31', 680, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (12, 2, 3, '2026-06-16', '2026-07-31', 780, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (13, 2, 1, '2026-07-31', '2026-10-04', 660, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (14, 2, 2, '2026-07-31', '2026-10-04', 760, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (15, 2, 3, '2026-07-31', '2026-10-04', 860, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:11', '2026-05-28 06:18:11', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (16, 3, 1, '2026-06-16', '2026-07-31', 380, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:12', '2026-05-28 06:18:12', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (17, 3, 2, '2026-06-16', '2026-07-31', 425, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:12', '2026-05-28 06:18:12', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (18, 3, 3, '2026-06-16', '2026-07-31', 470, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:12', '2026-05-28 06:18:12', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (19, 3, 1, '2026-08-01', '2026-10-04', 430, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:12', '2026-05-28 06:18:12', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (20, 3, 2, '2026-08-01', '2026-10-04', 475, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:12', '2026-05-28 06:18:12', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (21, 3, 3, '2026-08-01', '2026-10-04', 520, 1, '2026-05-28 06:15:37', '2026-05-28 06:18:12', '2026-05-28 06:18:12', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (22, 1, 1, '2026-06-20', '2026-07-01', 540, 1, '2026-05-28 06:18:11', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (23, 1, 2, '2026-06-20', '2026-07-01', 610, 1, '2026-05-28 06:18:11', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (24, 1, 3, '2026-06-20', '2026-07-01', 680, 1, '2026-05-28 06:18:11', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (25, 1, 1, '2026-07-01', '2026-08-01', 590, 1, '2026-05-28 06:18:11', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (26, 1, 2, '2026-07-01', '2026-08-01', 680, 1, '2026-05-28 06:18:11', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (27, 1, 3, '2026-07-01', '2026-08-01', 770, 1, '2026-05-28 06:18:11', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (28, 1, 1, '2026-08-01', '2026-09-01', 620, 1, '2026-05-28 06:18:11', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (29, 1, 2, '2026-08-01', '2026-09-01', 720, 1, '2026-05-28 06:18:11', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (30, 1, 3, '2026-08-01', '2026-09-01', 820, 1, '2026-05-28 06:18:11', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (31, 2, 1, '2026-06-16', '2026-07-31', 580, 1, '2026-05-28 06:18:12', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (32, 2, 2, '2026-06-16', '2026-07-31', 680, 1, '2026-05-28 06:18:12', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (33, 2, 3, '2026-06-16', '2026-07-31', 780, 1, '2026-05-28 06:18:12', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (34, 2, 1, '2026-07-31', '2026-10-04', 660, 1, '2026-05-28 06:18:12', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (35, 2, 2, '2026-07-31', '2026-10-04', 760, 1, '2026-05-28 06:18:12', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (36, 2, 3, '2026-07-31', '2026-10-04', 860, 1, '2026-05-28 06:18:12', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (37, 3, 1, '2026-06-16', '2026-07-31', 380, 1, '2026-05-28 06:18:12', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (38, 3, 2, '2026-06-16', '2026-07-31', 425, 1, '2026-05-28 06:18:12', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (39, 3, 3, '2026-06-16', '2026-07-31', 470, 1, '2026-05-28 06:18:12', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (40, 3, 1, '2026-08-01', '2026-10-04', 430, 1, '2026-05-28 06:18:12', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (41, 3, 2, '2026-08-01', '2026-10-04', 475, 1, '2026-05-28 06:18:12', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (42, 3, 3, '2026-08-01', '2026-10-04', 520, 1, '2026-05-28 06:18:12', '2026-05-28 06:23:02', '2026-05-28 06:23:02', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (43, 4, 1, '2026-06-16', '2026-08-30', 1050, 1, '2026-05-28 06:23:01', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (44, 4, 2, '2026-06-16', '2026-08-30', 1275, 1, '2026-05-28 06:23:01', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (45, 4, 3, '2026-06-16', '2026-08-30', 1500, 1, '2026-05-28 06:23:01', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (46, 4, 1, '2026-08-31', '2026-10-11', 1100, 1, '2026-05-28 06:23:01', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (47, 4, 2, '2026-08-31', '2026-10-11', 1325, 1, '2026-05-28 06:23:01', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (48, 4, 3, '2026-08-31', '2026-10-11', 1550, 1, '2026-05-28 06:23:01', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (49, 4, 1, '2026-10-12', '2026-12-16', 1250, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (50, 4, 2, '2026-10-12', '2026-12-16', 1500, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (51, 4, 3, '2026-10-12', '2026-12-16', 1750, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (52, 5, 1, '2026-06-16', '2026-07-08', 925, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (53, 5, 2, '2026-06-16', '2026-07-08', 1125, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (54, 5, 3, '2026-06-16', '2026-07-08', 1325, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (55, 5, 1, '2026-07-09', '2026-08-31', 800, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (56, 5, 2, '2026-07-09', '2026-08-31', 1000, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (57, 5, 3, '2026-07-09', '2026-08-31', 1200, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (58, 5, 1, '2026-09-01', '2026-10-11', 850, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (59, 5, 2, '2026-09-01', '2026-10-11', 1050, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (60, 5, 3, '2026-09-01', '2026-10-11', 1250, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (61, 6, 1, '2026-06-16', '2026-07-08', 1180, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (62, 6, 2, '2026-06-16', '2026-07-08', 1450, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (63, 6, 3, '2026-06-16', '2026-07-08', 1720, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (64, 6, 1, '2026-07-09', '2026-09-30', 1100, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (65, 6, 2, '2026-07-09', '2026-09-30', 1370, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (66, 6, 3, '2026-07-09', '2026-09-30', 1640, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (67, 6, 1, '2026-10-01', '2026-12-16', 1250, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (68, 6, 2, '2026-10-01', '2026-12-16', 1520, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (69, 6, 3, '2026-10-01', '2026-12-16', 1790, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (70, 1, 1, '2026-06-20', '2026-07-01', 540, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (71, 1, 2, '2026-06-20', '2026-07-01', 610, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (72, 1, 3, '2026-06-20', '2026-07-01', 680, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (73, 1, 1, '2026-07-01', '2026-08-01', 590, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (74, 1, 2, '2026-07-01', '2026-08-01', 680, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (75, 1, 3, '2026-07-01', '2026-08-01', 770, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (76, 1, 1, '2026-08-01', '2026-09-01', 620, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (77, 1, 2, '2026-08-01', '2026-09-01', 720, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (78, 1, 3, '2026-08-01', '2026-09-01', 820, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (79, 2, 1, '2026-06-16', '2026-07-31', 580, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (80, 2, 2, '2026-06-16', '2026-07-31', 680, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (81, 2, 3, '2026-06-16', '2026-07-31', 780, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (82, 2, 1, '2026-07-31', '2026-10-04', 660, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (83, 2, 2, '2026-07-31', '2026-10-04', 760, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (84, 2, 3, '2026-07-31', '2026-10-04', 860, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (85, 3, 1, '2026-06-16', '2026-07-31', 380, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (86, 3, 2, '2026-06-16', '2026-07-31', 425, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (87, 3, 3, '2026-06-16', '2026-07-31', 470, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (88, 3, 1, '2026-08-01', '2026-10-04', 430, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (89, 3, 2, '2026-08-01', '2026-10-04', 475, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (90, 3, 3, '2026-08-01', '2026-10-04', 520, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (91, 7, 1, '2026-06-16', '2026-07-19', 420, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (92, 7, 2, '2026-06-16', '2026-07-19', 465, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (93, 7, 3, '2026-06-16', '2026-07-19', 510, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (94, 8, 1, '2026-06-16', '2026-07-31', 390, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (95, 8, 2, '2026-06-16', '2026-07-31', 440, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (96, 8, 3, '2026-06-16', '2026-07-31', 490, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (97, 8, 1, '2026-08-01', '2026-09-12', 450, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (98, 8, 2, '2026-08-01', '2026-09-12', 500, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (99, 8, 3, '2026-08-01', '2026-09-12', 550, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:31', '2026-05-28 06:27:31', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (100, 9, 1, '2026-06-16', '2026-06-30', 475, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (101, 9, 2, '2026-06-16', '2026-06-30', 550, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (102, 9, 3, '2026-06-16', '2026-06-30', 625, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (103, 9, 1, '2026-07-01', '2026-07-31', 500, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (104, 9, 2, '2026-07-01', '2026-07-31', 575, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (105, 9, 3, '2026-07-01', '2026-07-31', 650, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (106, 9, 1, '2026-08-01', '2026-10-04', 625, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (107, 9, 2, '2026-08-01', '2026-10-04', 725, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (108, 9, 3, '2026-08-01', '2026-10-04', 825, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (109, 10, 1, '2026-06-16', '2026-07-31', 290, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (110, 10, 2, '2026-06-16', '2026-07-31', 330, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (111, 10, 3, '2026-06-16', '2026-07-31', 370, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (112, 10, 1, '2026-08-01', '2026-10-04', 310, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (113, 10, 2, '2026-08-01', '2026-10-04', 350, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (114, 10, 3, '2026-08-01', '2026-10-04', 390, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (115, 11, 1, '2026-06-16', '2026-07-15', 520, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (116, 11, 2, '2026-06-16', '2026-07-15', 430, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (117, 11, 3, '2026-06-16', '2026-07-15', 480, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (118, 11, 1, '2026-07-15', '2026-09-12', 530, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (119, 11, 2, '2026-07-15', '2026-09-12', 420, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (120, 11, 3, '2026-07-15', '2026-09-12', 470, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (121, 12, 1, '2026-06-16', '2026-07-15', 470, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (122, 12, 2, '2026-06-16', '2026-07-15', 390, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (123, 12, 3, '2026-06-16', '2026-07-15', 440, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (124, 12, 1, '2026-07-15', '2026-09-12', 490, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (125, 12, 2, '2026-07-15', '2026-09-12', 370, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (126, 12, 3, '2026-07-15', '2026-09-12', 420, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (127, 12, 1, '2026-09-12', '2026-12-16', 575, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (128, 12, 2, '2026-09-12', '2026-12-16', 475, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (129, 12, 3, '2026-09-12', '2026-12-16', 525, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (130, 13, 1, '2026-06-30', '2026-07-31', 370, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (131, 13, 2, '2026-06-30', '2026-07-31', 310, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (132, 13, 3, '2026-06-30', '2026-07-31', 350, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (133, 13, 1, '2026-08-01', '2026-09-12', 390, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (134, 13, 2, '2026-08-01', '2026-09-12', 290, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (135, 13, 3, '2026-08-01', '2026-09-12', 330, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (136, 13, 1, '2026-09-12', '2026-12-16', 520, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (137, 13, 2, '2026-09-12', '2026-12-16', 420, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (138, 13, 3, '2026-09-12', '2026-12-16', 470, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (139, 14, 1, '2026-06-30', '2026-07-31', 330, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (140, 14, 2, '2026-06-30', '2026-07-31', 370, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (141, 14, 3, '2026-06-30', '2026-07-31', 410, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (142, 15, 1, '2026-06-16', '2026-07-15', 260, 1, '2026-05-28 06:23:02', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (143, 15, 2, '2026-06-16', '2026-07-15', 300, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (144, 15, 3, '2026-06-16', '2026-07-15', 340, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (145, 16, 1, '2026-07-15', '2026-09-12', 285, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (146, 16, 2, '2026-07-15', '2026-09-12', 325, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (147, 16, 3, '2026-07-15', '2026-09-12', 365, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (148, 16, 1, '2026-09-12', '2026-12-16', 300, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (149, 16, 2, '2026-09-12', '2026-12-16', 340, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (150, 16, 3, '2026-09-12', '2026-12-16', 380, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (151, 17, 1, '2026-07-01', '2026-08-01', 170, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (152, 17, 2, '2026-07-01', '2026-08-01', 170, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (153, 17, 3, '2026-07-01', '2026-08-01', 170, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (154, 17, 1, '2026-08-01', '2026-09-01', 200, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (155, 17, 2, '2026-08-01', '2026-09-01', 200, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (156, 17, 3, '2026-08-01', '2026-09-01', 200, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (157, 18, 1, '2026-06-30', '2026-08-14', 700, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (158, 18, 2, '2026-06-30', '2026-08-14', 825, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (159, 18, 3, '2026-06-30', '2026-08-14', 950, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (160, 18, 1, '2026-08-15', '2026-09-20', 750, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (161, 18, 2, '2026-08-15', '2026-09-20', 875, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (162, 18, 3, '2026-08-15', '2026-09-20', 1000, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (163, 19, 1, '2026-06-30', '2026-08-15', 800, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (164, 19, 2, '2026-06-30', '2026-08-15', 925, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (165, 19, 3, '2026-06-30', '2026-08-15', 1050, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (166, 19, 1, '2026-08-15', '2026-11-11', 900, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (167, 19, 2, '2026-08-15', '2026-11-11', 1025, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (168, 19, 3, '2026-08-15', '2026-11-11', 1150, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (169, 20, 1, '2026-06-30', '2026-08-14', 750, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (170, 20, 2, '2026-06-30', '2026-08-14', 875, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (171, 20, 3, '2026-06-30', '2026-08-14', 1000, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (172, 20, 1, '2026-08-15', '2026-09-20', 800, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (173, 20, 2, '2026-08-15', '2026-09-20', 925, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (174, 20, 3, '2026-08-15', '2026-09-20', 1050, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (175, 20, 1, '2026-11-11', '2026-12-10', 1100, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (176, 20, 2, '2026-11-11', '2026-12-10', 1225, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (177, 20, 3, '2026-11-11', '2026-12-10', 1350, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (178, 21, 1, '2026-06-30', '2026-08-14', 700, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (179, 21, 2, '2026-06-30', '2026-08-14', 825, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (180, 21, 3, '2026-06-30', '2026-08-14', 950, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (181, 21, 1, '2026-08-15', '2026-09-20', 725, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (182, 21, 2, '2026-08-15', '2026-09-20', 850, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (183, 21, 3, '2026-08-15', '2026-09-20', 975, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (184, 22, 1, '2026-06-30', '2026-08-14', 500, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (185, 22, 2, '2026-06-30', '2026-08-14', 570, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (186, 22, 3, '2026-06-30', '2026-08-14', 640, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (187, 22, 1, '2026-08-15', '2026-09-20', 525, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (188, 22, 2, '2026-08-15', '2026-09-20', 595, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (189, 22, 3, '2026-08-15', '2026-09-20', 665, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (190, 23, 1, '2026-07-15', '2026-08-01', 490, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (191, 23, 2, '2026-07-15', '2026-08-01', 535, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (192, 23, 3, '2026-07-15', '2026-08-01', 580, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (193, 23, 1, '2026-08-01', '2026-09-01', 510, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (194, 23, 2, '2026-08-01', '2026-09-01', 555, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (195, 23, 3, '2026-08-01', '2026-09-01', 600, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (196, 23, 1, '2026-09-01', '2026-10-01', 530, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (197, 23, 2, '2026-09-01', '2026-10-01', 575, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (198, 23, 3, '2026-09-01', '2026-10-01', 620, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:32', '2026-05-28 06:27:32', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (199, 24, 1, '2026-06-30', '2026-07-31', 440, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (200, 24, 2, '2026-06-30', '2026-07-31', 490, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (201, 24, 3, '2026-06-30', '2026-07-31', 540, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (202, 24, 1, '2026-08-01', '2026-09-01', 430, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (203, 24, 2, '2026-08-01', '2026-09-01', 480, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (204, 24, 3, '2026-08-01', '2026-09-01', 530, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (205, 24, 1, '2026-09-01', '2026-10-05', 450, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (206, 24, 2, '2026-09-01', '2026-10-05', 500, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (207, 24, 3, '2026-09-01', '2026-10-05', 550, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (208, 25, 1, '2026-06-30', '2026-08-14', 485, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (209, 25, 2, '2026-06-30', '2026-08-14', 530, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (210, 25, 3, '2026-06-30', '2026-08-14', 575, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (211, 25, 1, '2026-08-15', '2026-09-20', 460, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (212, 25, 2, '2026-08-15', '2026-09-20', 505, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (213, 25, 3, '2026-08-15', '2026-09-20', 550, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (214, 26, 1, '2026-06-30', '2026-08-14', 460, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (215, 26, 2, '2026-06-30', '2026-08-14', 505, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (216, 26, 3, '2026-06-30', '2026-08-14', 550, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (217, 26, 1, '2026-08-15', '2026-09-20', 430, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (218, 26, 2, '2026-08-15', '2026-09-20', 475, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (219, 26, 3, '2026-08-15', '2026-09-20', 520, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (220, 27, 1, '2026-06-30', '2026-08-14', 525, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (221, 27, 2, '2026-06-30', '2026-08-14', 575, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (222, 27, 3, '2026-06-30', '2026-08-14', 625, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (223, 27, 1, '2026-08-15', '2026-11-11', 475, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (224, 27, 2, '2026-08-15', '2026-11-11', 525, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (225, 27, 3, '2026-08-15', '2026-11-11', 575, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (226, 27, 1, '2026-11-11', '2026-12-10', 575, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (227, 27, 2, '2026-11-11', '2026-12-10', 625, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (228, 27, 3, '2026-11-11', '2026-12-10', 675, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (229, 28, 1, '2026-06-30', '2026-08-14', 475, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (230, 28, 2, '2026-06-30', '2026-08-14', 525, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (231, 28, 3, '2026-06-30', '2026-08-14', 575, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (232, 28, 1, '2026-08-15', '2026-11-11', 425, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (233, 28, 2, '2026-08-15', '2026-11-11', 475, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (234, 28, 3, '2026-08-15', '2026-11-11', 525, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (235, 28, 1, '2026-11-11', '2026-12-10', 525, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (236, 28, 2, '2026-11-11', '2026-12-10', 575, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (237, 28, 3, '2026-11-11', '2026-12-10', 625, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (238, 29, 1, '2026-06-20', '2026-07-25', 420, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (239, 29, 2, '2026-06-20', '2026-07-25', 465, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (240, 29, 3, '2026-06-20', '2026-07-25', 510, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (241, 29, 1, '2026-07-25', '2026-08-23', 390, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (242, 29, 2, '2026-07-25', '2026-08-23', 435, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (243, 29, 3, '2026-07-25', '2026-08-23', 480, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (244, 29, 1, '2026-08-23', '2026-09-15', 450, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (245, 29, 2, '2026-08-23', '2026-09-15', 495, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (246, 29, 3, '2026-08-23', '2026-09-15', 540, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (247, 30, 1, '2026-06-20', '2026-07-25', 410, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (248, 30, 2, '2026-06-20', '2026-07-25', 455, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (249, 30, 3, '2026-06-20', '2026-07-25', 500, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (250, 30, 1, '2026-07-25', '2026-08-23', 380, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (251, 30, 2, '2026-07-25', '2026-08-23', 425, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (252, 30, 3, '2026-07-25', '2026-08-23', 470, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (253, 30, 1, '2026-08-23', '2026-09-15', 440, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (254, 30, 2, '2026-08-23', '2026-09-15', 485, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (255, 30, 3, '2026-08-23', '2026-09-15', 530, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (256, 31, 1, '2026-06-30', '2026-08-14', 360, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (257, 31, 2, '2026-06-30', '2026-08-14', 400, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (258, 31, 3, '2026-06-30', '2026-08-14', 440, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (259, 31, 1, '2026-08-15', '2026-11-11', 340, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (260, 31, 2, '2026-08-15', '2026-11-11', 380, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (261, 31, 3, '2026-08-15', '2026-11-11', 420, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (262, 31, 1, '2026-11-11', '2026-12-10', 420, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (263, 31, 2, '2026-11-11', '2026-12-10', 460, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (264, 31, 3, '2026-11-11', '2026-12-10', 500, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (265, 32, 1, '2026-06-30', '2026-08-14', 460, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (266, 32, 2, '2026-06-30', '2026-08-14', 510, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (267, 32, 3, '2026-06-30', '2026-08-14', 560, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (268, 32, 1, '2026-08-15', '2026-11-11', 370, 1, '2026-05-28 06:23:03', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (269, 32, 2, '2026-08-15', '2026-11-11', 415, 1, '2026-05-28 06:23:04', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (270, 32, 3, '2026-08-15', '2026-11-11', 480, 1, '2026-05-28 06:23:04', '2026-05-28 06:27:33', '2026-05-28 06:27:33', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (271, 4, 1, '2026-06-16', '2026-08-30', 1050, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (272, 4, 2, '2026-06-16', '2026-08-30', 1275, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (273, 4, 3, '2026-06-16', '2026-08-30', 1500, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (274, 4, 1, '2026-08-31', '2026-10-11', 1100, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (275, 4, 2, '2026-08-31', '2026-10-11', 1325, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (276, 4, 3, '2026-08-31', '2026-10-11', 1550, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (277, 4, 1, '2026-10-12', '2026-12-16', 1250, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (278, 4, 2, '2026-10-12', '2026-12-16', 1500, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (279, 4, 3, '2026-10-12', '2026-12-16', 1750, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (280, 5, 1, '2026-06-16', '2026-07-08', 925, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (281, 5, 2, '2026-06-16', '2026-07-08', 1125, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (282, 5, 3, '2026-06-16', '2026-07-08', 1325, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (283, 5, 1, '2026-07-09', '2026-08-31', 800, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (284, 5, 2, '2026-07-09', '2026-08-31', 1000, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (285, 5, 3, '2026-07-09', '2026-08-31', 1200, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (286, 5, 1, '2026-09-01', '2026-10-11', 850, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (287, 5, 2, '2026-09-01', '2026-10-11', 1050, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (288, 5, 3, '2026-09-01', '2026-10-11', 1250, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (289, 6, 1, '2026-06-16', '2026-07-08', 1180, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (290, 6, 2, '2026-06-16', '2026-07-08', 1450, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (291, 6, 3, '2026-06-16', '2026-07-08', 1720, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (292, 6, 1, '2026-07-09', '2026-09-30', 1100, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (293, 6, 2, '2026-07-09', '2026-09-30', 1370, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (294, 6, 3, '2026-07-09', '2026-09-30', 1640, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (295, 6, 1, '2026-10-01', '2026-12-16', 1250, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (296, 6, 2, '2026-10-01', '2026-12-16', 1520, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (297, 6, 3, '2026-10-01', '2026-12-16', 1790, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (298, 1, 1, '2026-06-20', '2026-07-01', 540, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (299, 1, 2, '2026-06-20', '2026-07-01', 610, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (300, 1, 3, '2026-06-20', '2026-07-01', 680, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (301, 1, 1, '2026-07-01', '2026-08-01', 590, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (302, 1, 2, '2026-07-01', '2026-08-01', 680, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (303, 1, 3, '2026-07-01', '2026-08-01', 770, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (304, 1, 1, '2026-08-01', '2026-09-01', 620, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (305, 1, 2, '2026-08-01', '2026-09-01', 720, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (306, 1, 3, '2026-08-01', '2026-09-01', 820, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (307, 2, 1, '2026-06-16', '2026-07-31', 580, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (308, 2, 2, '2026-06-16', '2026-07-31', 680, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (309, 2, 3, '2026-06-16', '2026-07-31', 780, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (310, 2, 1, '2026-07-31', '2026-10-04', 660, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (311, 2, 2, '2026-07-31', '2026-10-04', 760, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (312, 2, 3, '2026-07-31', '2026-10-04', 860, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (313, 3, 1, '2026-06-16', '2026-07-31', 380, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (314, 3, 2, '2026-06-16', '2026-07-31', 425, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (315, 3, 3, '2026-06-16', '2026-07-31', 470, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (316, 3, 1, '2026-08-01', '2026-10-04', 430, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (317, 3, 2, '2026-08-01', '2026-10-04', 475, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (318, 3, 3, '2026-08-01', '2026-10-04', 520, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (319, 7, 1, '2026-06-16', '2026-07-19', 420, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (320, 7, 2, '2026-06-16', '2026-07-19', 465, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (321, 7, 3, '2026-06-16', '2026-07-19', 510, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (322, 8, 1, '2026-06-16', '2026-07-31', 390, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (323, 8, 2, '2026-06-16', '2026-07-31', 440, 1, '2026-05-28 06:27:31', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (324, 8, 3, '2026-06-16', '2026-07-31', 490, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (325, 8, 1, '2026-08-01', '2026-09-12', 450, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (326, 8, 2, '2026-08-01', '2026-09-12', 500, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (327, 8, 3, '2026-08-01', '2026-09-12', 550, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (328, 9, 1, '2026-06-16', '2026-06-30', 475, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (329, 9, 2, '2026-06-16', '2026-06-30', 550, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (330, 9, 3, '2026-06-16', '2026-06-30', 625, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (331, 9, 1, '2026-07-01', '2026-07-31', 500, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (332, 9, 2, '2026-07-01', '2026-07-31', 575, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (333, 9, 3, '2026-07-01', '2026-07-31', 650, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (334, 9, 1, '2026-08-01', '2026-10-04', 625, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (335, 9, 2, '2026-08-01', '2026-10-04', 725, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (336, 9, 3, '2026-08-01', '2026-10-04', 825, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (337, 10, 1, '2026-06-16', '2026-07-31', 290, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (338, 10, 2, '2026-06-16', '2026-07-31', 330, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (339, 10, 3, '2026-06-16', '2026-07-31', 370, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (340, 10, 1, '2026-08-01', '2026-10-04', 310, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (341, 10, 2, '2026-08-01', '2026-10-04', 350, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (342, 10, 3, '2026-08-01', '2026-10-04', 390, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (343, 11, 1, '2026-06-16', '2026-07-15', 520, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (344, 11, 2, '2026-06-16', '2026-07-15', 430, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (345, 11, 3, '2026-06-16', '2026-07-15', 480, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (346, 11, 1, '2026-07-15', '2026-09-12', 530, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (347, 11, 2, '2026-07-15', '2026-09-12', 420, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (348, 11, 3, '2026-07-15', '2026-09-12', 470, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (349, 12, 1, '2026-06-16', '2026-07-15', 470, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (350, 12, 2, '2026-06-16', '2026-07-15', 390, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (351, 12, 3, '2026-06-16', '2026-07-15', 440, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (352, 12, 1, '2026-07-15', '2026-09-12', 490, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (353, 12, 2, '2026-07-15', '2026-09-12', 370, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (354, 12, 3, '2026-07-15', '2026-09-12', 420, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (355, 12, 1, '2026-09-12', '2026-12-16', 575, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (356, 12, 2, '2026-09-12', '2026-12-16', 475, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (357, 12, 3, '2026-09-12', '2026-12-16', 525, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (358, 13, 1, '2026-06-30', '2026-07-31', 370, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (359, 13, 2, '2026-06-30', '2026-07-31', 310, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (360, 13, 3, '2026-06-30', '2026-07-31', 350, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (361, 13, 1, '2026-08-01', '2026-09-12', 390, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (362, 13, 2, '2026-08-01', '2026-09-12', 290, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (363, 13, 3, '2026-08-01', '2026-09-12', 330, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (364, 13, 1, '2026-09-12', '2026-12-16', 520, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (365, 13, 2, '2026-09-12', '2026-12-16', 420, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (366, 13, 3, '2026-09-12', '2026-12-16', 470, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (367, 14, 1, '2026-06-30', '2026-07-31', 330, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (368, 14, 2, '2026-06-30', '2026-07-31', 370, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (369, 14, 3, '2026-06-30', '2026-07-31', 410, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (370, 15, 1, '2026-06-16', '2026-07-15', 260, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (371, 15, 2, '2026-06-16', '2026-07-15', 300, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (372, 15, 3, '2026-06-16', '2026-07-15', 340, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (373, 16, 1, '2026-07-15', '2026-09-12', 285, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (374, 16, 2, '2026-07-15', '2026-09-12', 325, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (375, 16, 3, '2026-07-15', '2026-09-12', 365, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (376, 16, 1, '2026-09-12', '2026-12-16', 300, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (377, 16, 2, '2026-09-12', '2026-12-16', 340, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (378, 16, 3, '2026-09-12', '2026-12-16', 380, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (379, 17, 1, '2026-07-01', '2026-08-01', 170, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (380, 17, 2, '2026-07-01', '2026-08-01', 170, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (381, 17, 3, '2026-07-01', '2026-08-01', 170, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (382, 17, 1, '2026-08-01', '2026-09-01', 200, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (383, 17, 2, '2026-08-01', '2026-09-01', 200, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (384, 17, 3, '2026-08-01', '2026-09-01', 200, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (385, 18, 1, '2026-06-30', '2026-08-14', 700, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (386, 18, 2, '2026-06-30', '2026-08-14', 825, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (387, 18, 3, '2026-06-30', '2026-08-14', 950, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (388, 18, 1, '2026-08-15', '2026-09-20', 750, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (389, 18, 2, '2026-08-15', '2026-09-20', 875, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (390, 18, 3, '2026-08-15', '2026-09-20', 1000, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (391, 19, 1, '2026-06-30', '2026-08-15', 800, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (392, 19, 2, '2026-06-30', '2026-08-15', 925, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (393, 19, 3, '2026-06-30', '2026-08-15', 1050, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (394, 19, 1, '2026-08-15', '2026-11-11', 900, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (395, 19, 2, '2026-08-15', '2026-11-11', 1025, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (396, 19, 3, '2026-08-15', '2026-11-11', 1150, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (397, 20, 1, '2026-06-30', '2026-08-14', 750, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (398, 20, 2, '2026-06-30', '2026-08-14', 875, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (399, 20, 3, '2026-06-30', '2026-08-14', 1000, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (400, 20, 1, '2026-08-15', '2026-09-20', 800, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (401, 20, 2, '2026-08-15', '2026-09-20', 925, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (402, 20, 3, '2026-08-15', '2026-09-20', 1050, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (403, 20, 1, '2026-11-11', '2026-12-10', 1100, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (404, 20, 2, '2026-11-11', '2026-12-10', 1225, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (405, 20, 3, '2026-11-11', '2026-12-10', 1350, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (406, 21, 1, '2026-06-30', '2026-08-14', 700, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (407, 21, 2, '2026-06-30', '2026-08-14', 825, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (408, 21, 3, '2026-06-30', '2026-08-14', 950, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (409, 21, 1, '2026-08-15', '2026-09-20', 725, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (410, 21, 2, '2026-08-15', '2026-09-20', 850, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (411, 21, 3, '2026-08-15', '2026-09-20', 975, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (412, 22, 1, '2026-06-30', '2026-08-14', 500, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (413, 22, 2, '2026-06-30', '2026-08-14', 570, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (414, 22, 3, '2026-06-30', '2026-08-14', 640, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (415, 22, 1, '2026-08-15', '2026-09-20', 525, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (416, 22, 2, '2026-08-15', '2026-09-20', 595, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (417, 22, 3, '2026-08-15', '2026-09-20', 665, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (418, 23, 1, '2026-07-15', '2026-08-01', 490, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (419, 23, 2, '2026-07-15', '2026-08-01', 535, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (420, 23, 3, '2026-07-15', '2026-08-01', 580, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (421, 23, 1, '2026-08-01', '2026-09-01', 510, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (422, 23, 2, '2026-08-01', '2026-09-01', 555, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (423, 23, 3, '2026-08-01', '2026-09-01', 600, 1, '2026-05-28 06:27:32', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (424, 23, 1, '2026-09-01', '2026-10-01', 530, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (425, 23, 2, '2026-09-01', '2026-10-01', 575, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (426, 23, 3, '2026-09-01', '2026-10-01', 620, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (427, 24, 1, '2026-06-30', '2026-07-31', 440, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (428, 24, 2, '2026-06-30', '2026-07-31', 490, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (429, 24, 3, '2026-06-30', '2026-07-31', 540, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (430, 24, 1, '2026-08-01', '2026-09-01', 430, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (431, 24, 2, '2026-08-01', '2026-09-01', 480, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (432, 24, 3, '2026-08-01', '2026-09-01', 530, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (433, 24, 1, '2026-09-01', '2026-10-05', 450, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (434, 24, 2, '2026-09-01', '2026-10-05', 500, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (435, 24, 3, '2026-09-01', '2026-10-05', 550, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (436, 25, 1, '2026-06-30', '2026-08-14', 485, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (437, 25, 2, '2026-06-30', '2026-08-14', 530, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (438, 25, 3, '2026-06-30', '2026-08-14', 575, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (439, 25, 1, '2026-08-15', '2026-09-20', 460, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (440, 25, 2, '2026-08-15', '2026-09-20', 505, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (441, 25, 3, '2026-08-15', '2026-09-20', 550, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (442, 26, 1, '2026-06-30', '2026-08-14', 460, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (443, 26, 2, '2026-06-30', '2026-08-14', 505, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (444, 26, 3, '2026-06-30', '2026-08-14', 550, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (445, 26, 1, '2026-08-15', '2026-09-20', 430, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (446, 26, 2, '2026-08-15', '2026-09-20', 475, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (447, 26, 3, '2026-08-15', '2026-09-20', 520, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (448, 27, 1, '2026-06-30', '2026-08-14', 525, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (449, 27, 2, '2026-06-30', '2026-08-14', 575, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (450, 27, 3, '2026-06-30', '2026-08-14', 625, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (451, 27, 1, '2026-08-15', '2026-11-11', 475, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (452, 27, 2, '2026-08-15', '2026-11-11', 525, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (453, 27, 3, '2026-08-15', '2026-11-11', 575, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (454, 27, 1, '2026-11-11', '2026-12-10', 575, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (455, 27, 2, '2026-11-11', '2026-12-10', 625, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (456, 27, 3, '2026-11-11', '2026-12-10', 675, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (457, 28, 1, '2026-06-30', '2026-08-14', 475, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (458, 28, 2, '2026-06-30', '2026-08-14', 525, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (459, 28, 3, '2026-06-30', '2026-08-14', 575, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (460, 28, 1, '2026-08-15', '2026-11-11', 425, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (461, 28, 2, '2026-08-15', '2026-11-11', 475, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (462, 28, 3, '2026-08-15', '2026-11-11', 525, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (463, 28, 1, '2026-11-11', '2026-12-10', 525, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (464, 28, 2, '2026-11-11', '2026-12-10', 575, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (465, 28, 3, '2026-11-11', '2026-12-10', 625, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (466, 29, 1, '2026-06-20', '2026-07-25', 420, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (467, 29, 2, '2026-06-20', '2026-07-25', 465, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (468, 29, 3, '2026-06-20', '2026-07-25', 510, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (469, 29, 1, '2026-07-25', '2026-08-23', 390, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (470, 29, 2, '2026-07-25', '2026-08-23', 435, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (471, 29, 3, '2026-07-25', '2026-08-23', 480, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (472, 29, 1, '2026-08-23', '2026-09-15', 450, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (473, 29, 2, '2026-08-23', '2026-09-15', 495, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (474, 29, 3, '2026-08-23', '2026-09-15', 540, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (475, 30, 1, '2026-06-20', '2026-07-25', 410, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (476, 30, 2, '2026-06-20', '2026-07-25', 455, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (477, 30, 3, '2026-06-20', '2026-07-25', 500, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (478, 30, 1, '2026-07-25', '2026-08-23', 380, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (479, 30, 2, '2026-07-25', '2026-08-23', 425, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (480, 30, 3, '2026-07-25', '2026-08-23', 470, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (481, 30, 1, '2026-08-23', '2026-09-15', 440, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (482, 30, 2, '2026-08-23', '2026-09-15', 485, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (483, 30, 3, '2026-08-23', '2026-09-15', 530, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (484, 31, 1, '2026-06-30', '2026-08-14', 360, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (485, 31, 2, '2026-06-30', '2026-08-14', 400, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (486, 31, 3, '2026-06-30', '2026-08-14', 440, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (487, 31, 1, '2026-08-15', '2026-11-11', 340, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (488, 31, 2, '2026-08-15', '2026-11-11', 380, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (489, 31, 3, '2026-08-15', '2026-11-11', 420, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (490, 31, 1, '2026-11-11', '2026-12-10', 420, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (491, 31, 2, '2026-11-11', '2026-12-10', 460, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (492, 31, 3, '2026-11-11', '2026-12-10', 500, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (493, 32, 1, '2026-06-30', '2026-08-14', 460, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (494, 32, 2, '2026-06-30', '2026-08-14', 510, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (495, 32, 3, '2026-06-30', '2026-08-14', 560, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (496, 32, 1, '2026-08-15', '2026-11-11', 370, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (497, 32, 2, '2026-08-15', '2026-11-11', 415, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (498, 32, 3, '2026-08-15', '2026-11-11', 480, 1, '2026-05-28 06:27:33', '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `hotel_prices` VALUES (499, 4, 1, '2026-06-16', '2026-08-30', 1050, 1, '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (500, 4, 2, '2026-06-16', '2026-08-30', 1275, 1, '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (501, 4, 3, '2026-06-16', '2026-08-30', 1500, 1, '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (502, 4, 1, '2026-08-31', '2026-10-11', 1100, 1, '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (503, 4, 2, '2026-08-31', '2026-10-11', 1325, 1, '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (504, 4, 3, '2026-08-31', '2026-10-11', 1550, 1, '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (505, 4, 1, '2026-10-12', '2026-12-16', 1250, 1, '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (506, 4, 2, '2026-10-12', '2026-12-16', 1500, 1, '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (507, 4, 3, '2026-10-12', '2026-12-16', 1750, 1, '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (508, 5, 1, '2026-06-16', '2026-07-08', 925, 1, '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (509, 5, 2, '2026-06-16', '2026-07-08', 1125, 1, '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (510, 5, 3, '2026-06-16', '2026-07-08', 1325, 1, '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (511, 5, 1, '2026-07-09', '2026-08-31', 800, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (512, 5, 2, '2026-07-09', '2026-08-31', 1000, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (513, 5, 3, '2026-07-09', '2026-08-31', 1200, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (514, 5, 1, '2026-09-01', '2026-10-11', 850, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (515, 5, 2, '2026-09-01', '2026-10-11', 1050, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (516, 5, 3, '2026-09-01', '2026-10-11', 1250, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (517, 6, 1, '2026-06-16', '2026-07-08', 1180, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (518, 6, 2, '2026-06-16', '2026-07-08', 1450, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (519, 6, 3, '2026-06-16', '2026-07-08', 1720, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (520, 6, 1, '2026-07-09', '2026-09-30', 1100, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (521, 6, 2, '2026-07-09', '2026-09-30', 1370, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (522, 6, 3, '2026-07-09', '2026-09-30', 1640, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (523, 6, 1, '2026-10-01', '2026-12-16', 1250, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (524, 6, 2, '2026-10-01', '2026-12-16', 1520, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (525, 6, 3, '2026-10-01', '2026-12-16', 1790, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (526, 1, 1, '2026-06-20', '2026-07-01', 540, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (527, 1, 2, '2026-06-20', '2026-07-01', 610, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (528, 1, 3, '2026-06-20', '2026-07-01', 680, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (529, 1, 1, '2026-07-01', '2026-08-01', 590, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (530, 1, 2, '2026-07-01', '2026-08-01', 680, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (531, 1, 3, '2026-07-01', '2026-08-01', 770, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (532, 1, 1, '2026-08-01', '2026-09-01', 620, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (533, 1, 2, '2026-08-01', '2026-09-01', 720, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (534, 1, 3, '2026-08-01', '2026-09-01', 820, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (535, 2, 1, '2026-06-16', '2026-07-31', 580, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (536, 2, 2, '2026-06-16', '2026-07-31', 680, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (537, 2, 3, '2026-06-16', '2026-07-31', 780, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (538, 2, 1, '2026-07-31', '2026-10-04', 660, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (539, 2, 2, '2026-07-31', '2026-10-04', 760, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (540, 2, 3, '2026-07-31', '2026-10-04', 860, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (541, 3, 1, '2026-06-16', '2026-07-31', 380, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (542, 3, 2, '2026-06-16', '2026-07-31', 425, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (543, 3, 3, '2026-06-16', '2026-07-31', 470, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (544, 3, 1, '2026-08-01', '2026-10-04', 430, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (545, 3, 2, '2026-08-01', '2026-10-04', 475, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (546, 3, 3, '2026-08-01', '2026-10-04', 520, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (547, 7, 1, '2026-06-16', '2026-07-19', 420, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (548, 7, 2, '2026-06-16', '2026-07-19', 465, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (549, 7, 3, '2026-06-16', '2026-07-19', 510, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (550, 8, 1, '2026-06-16', '2026-07-31', 390, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (551, 8, 2, '2026-06-16', '2026-07-31', 440, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (552, 8, 3, '2026-06-16', '2026-07-31', 490, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (553, 8, 1, '2026-08-01', '2026-09-12', 450, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (554, 8, 2, '2026-08-01', '2026-09-12', 500, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (555, 8, 3, '2026-08-01', '2026-09-12', 550, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (556, 9, 1, '2026-06-16', '2026-06-30', 475, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (557, 9, 2, '2026-06-16', '2026-06-30', 550, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (558, 9, 3, '2026-06-16', '2026-06-30', 625, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (559, 9, 1, '2026-07-01', '2026-07-31', 500, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (560, 9, 2, '2026-07-01', '2026-07-31', 575, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (561, 9, 3, '2026-07-01', '2026-07-31', 650, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (562, 9, 1, '2026-08-01', '2026-10-04', 625, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (563, 9, 2, '2026-08-01', '2026-10-04', 725, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (564, 9, 3, '2026-08-01', '2026-10-04', 825, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (565, 10, 1, '2026-06-16', '2026-07-31', 290, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (566, 10, 2, '2026-06-16', '2026-07-31', 330, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (567, 10, 3, '2026-06-16', '2026-07-31', 370, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (568, 10, 1, '2026-08-01', '2026-10-04', 310, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (569, 10, 2, '2026-08-01', '2026-10-04', 350, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (570, 10, 3, '2026-08-01', '2026-10-04', 390, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (571, 11, 1, '2026-06-16', '2026-07-15', 520, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (572, 11, 2, '2026-06-16', '2026-07-15', 430, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (573, 11, 3, '2026-06-16', '2026-07-15', 480, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (574, 11, 1, '2026-07-15', '2026-09-12', 530, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (575, 11, 2, '2026-07-15', '2026-09-12', 420, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (576, 11, 3, '2026-07-15', '2026-09-12', 470, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (577, 12, 1, '2026-06-16', '2026-07-15', 470, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (578, 12, 2, '2026-06-16', '2026-07-15', 390, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (579, 12, 3, '2026-06-16', '2026-07-15', 440, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (580, 12, 1, '2026-07-15', '2026-09-12', 490, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (581, 12, 2, '2026-07-15', '2026-09-12', 370, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (582, 12, 3, '2026-07-15', '2026-09-12', 420, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (583, 12, 1, '2026-09-12', '2026-12-16', 575, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (584, 12, 2, '2026-09-12', '2026-12-16', 475, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (585, 12, 3, '2026-09-12', '2026-12-16', 525, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (586, 13, 1, '2026-06-30', '2026-07-31', 370, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (587, 13, 2, '2026-06-30', '2026-07-31', 310, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (588, 13, 3, '2026-06-30', '2026-07-31', 350, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (589, 13, 1, '2026-08-01', '2026-09-12', 390, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (590, 13, 2, '2026-08-01', '2026-09-12', 290, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (591, 13, 3, '2026-08-01', '2026-09-12', 330, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (592, 13, 1, '2026-09-12', '2026-12-16', 520, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (593, 13, 2, '2026-09-12', '2026-12-16', 420, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (594, 13, 3, '2026-09-12', '2026-12-16', 470, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (595, 14, 1, '2026-06-30', '2026-07-31', 330, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (596, 14, 2, '2026-06-30', '2026-07-31', 370, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (597, 14, 3, '2026-06-30', '2026-07-31', 410, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (598, 15, 1, '2026-06-16', '2026-07-15', 260, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (599, 15, 2, '2026-06-16', '2026-07-15', 300, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (600, 15, 3, '2026-06-16', '2026-07-15', 340, 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (601, 16, 1, '2026-07-15', '2026-09-12', 285, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (602, 16, 2, '2026-07-15', '2026-09-12', 325, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (603, 16, 3, '2026-07-15', '2026-09-12', 365, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (604, 16, 1, '2026-09-12', '2026-12-16', 300, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (605, 16, 2, '2026-09-12', '2026-12-16', 340, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (606, 16, 3, '2026-09-12', '2026-12-16', 380, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (607, 17, 1, '2026-07-01', '2026-08-01', 170, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (608, 17, 2, '2026-07-01', '2026-08-01', 170, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (609, 17, 3, '2026-07-01', '2026-08-01', 170, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (610, 17, 1, '2026-08-01', '2026-09-01', 200, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (611, 17, 2, '2026-08-01', '2026-09-01', 200, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (612, 17, 3, '2026-08-01', '2026-09-01', 200, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (613, 18, 1, '2026-06-30', '2026-08-14', 700, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (614, 18, 2, '2026-06-30', '2026-08-14', 825, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (615, 18, 3, '2026-06-30', '2026-08-14', 950, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (616, 18, 1, '2026-08-15', '2026-09-20', 750, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (617, 18, 2, '2026-08-15', '2026-09-20', 875, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (618, 18, 3, '2026-08-15', '2026-09-20', 1000, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (619, 19, 1, '2026-06-30', '2026-08-15', 800, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (620, 19, 2, '2026-06-30', '2026-08-15', 925, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (621, 19, 3, '2026-06-30', '2026-08-15', 1050, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (622, 19, 1, '2026-08-15', '2026-11-11', 900, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (623, 19, 2, '2026-08-15', '2026-11-11', 1025, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (624, 19, 3, '2026-08-15', '2026-11-11', 1150, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (625, 20, 1, '2026-06-30', '2026-08-14', 750, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (626, 20, 2, '2026-06-30', '2026-08-14', 875, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (627, 20, 3, '2026-06-30', '2026-08-14', 1000, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (628, 20, 1, '2026-08-15', '2026-09-20', 800, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (629, 20, 2, '2026-08-15', '2026-09-20', 925, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (630, 20, 3, '2026-08-15', '2026-09-20', 1050, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (631, 20, 1, '2026-11-11', '2026-12-10', 1100, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (632, 20, 2, '2026-11-11', '2026-12-10', 1225, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (633, 20, 3, '2026-11-11', '2026-12-10', 1350, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (634, 21, 1, '2026-06-30', '2026-08-14', 700, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (635, 21, 2, '2026-06-30', '2026-08-14', 825, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (636, 21, 3, '2026-06-30', '2026-08-14', 950, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (637, 21, 1, '2026-08-15', '2026-09-20', 725, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (638, 21, 2, '2026-08-15', '2026-09-20', 850, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (639, 21, 3, '2026-08-15', '2026-09-20', 975, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (640, 22, 1, '2026-06-30', '2026-08-14', 500, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (641, 22, 2, '2026-06-30', '2026-08-14', 570, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (642, 22, 3, '2026-06-30', '2026-08-14', 640, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (643, 22, 1, '2026-08-15', '2026-09-20', 525, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (644, 22, 2, '2026-08-15', '2026-09-20', 595, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (645, 22, 3, '2026-08-15', '2026-09-20', 665, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (646, 23, 1, '2026-07-15', '2026-08-01', 490, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (647, 23, 2, '2026-07-15', '2026-08-01', 535, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (648, 23, 3, '2026-07-15', '2026-08-01', 580, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (649, 23, 1, '2026-08-01', '2026-09-01', 510, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (650, 23, 2, '2026-08-01', '2026-09-01', 555, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (651, 23, 3, '2026-08-01', '2026-09-01', 600, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (652, 23, 1, '2026-09-01', '2026-10-01', 530, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (653, 23, 2, '2026-09-01', '2026-10-01', 575, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (654, 23, 3, '2026-09-01', '2026-10-01', 620, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (655, 24, 1, '2026-06-30', '2026-07-31', 440, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (656, 24, 2, '2026-06-30', '2026-07-31', 490, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (657, 24, 3, '2026-06-30', '2026-07-31', 540, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (658, 24, 1, '2026-08-01', '2026-09-01', 430, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (659, 24, 2, '2026-08-01', '2026-09-01', 480, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (660, 24, 3, '2026-08-01', '2026-09-01', 530, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (661, 24, 1, '2026-09-01', '2026-10-05', 450, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (662, 24, 2, '2026-09-01', '2026-10-05', 500, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (663, 24, 3, '2026-09-01', '2026-10-05', 550, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (664, 25, 1, '2026-06-30', '2026-08-14', 485, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (665, 25, 2, '2026-06-30', '2026-08-14', 530, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (666, 25, 3, '2026-06-30', '2026-08-14', 575, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (667, 25, 1, '2026-08-15', '2026-09-20', 460, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (668, 25, 2, '2026-08-15', '2026-09-20', 505, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (669, 25, 3, '2026-08-15', '2026-09-20', 550, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (670, 26, 1, '2026-06-30', '2026-08-14', 460, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (671, 26, 2, '2026-06-30', '2026-08-14', 505, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (672, 26, 3, '2026-06-30', '2026-08-14', 550, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (673, 26, 1, '2026-08-15', '2026-09-20', 430, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (674, 26, 2, '2026-08-15', '2026-09-20', 475, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (675, 26, 3, '2026-08-15', '2026-09-20', 520, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (676, 27, 1, '2026-06-30', '2026-08-14', 525, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (677, 27, 2, '2026-06-30', '2026-08-14', 575, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (678, 27, 3, '2026-06-30', '2026-08-14', 625, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (679, 27, 1, '2026-08-15', '2026-11-11', 475, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (680, 27, 2, '2026-08-15', '2026-11-11', 525, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (681, 27, 3, '2026-08-15', '2026-11-11', 575, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (682, 27, 1, '2026-11-11', '2026-12-10', 575, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (683, 27, 2, '2026-11-11', '2026-12-10', 625, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (684, 27, 3, '2026-11-11', '2026-12-10', 675, 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (685, 28, 1, '2026-06-30', '2026-08-14', 475, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (686, 28, 2, '2026-06-30', '2026-08-14', 525, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (687, 28, 3, '2026-06-30', '2026-08-14', 575, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (688, 28, 1, '2026-08-15', '2026-11-11', 425, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (689, 28, 2, '2026-08-15', '2026-11-11', 475, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (690, 28, 3, '2026-08-15', '2026-11-11', 525, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (691, 28, 1, '2026-11-11', '2026-12-10', 525, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (692, 28, 2, '2026-11-11', '2026-12-10', 575, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (693, 28, 3, '2026-11-11', '2026-12-10', 625, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (694, 29, 1, '2026-06-20', '2026-07-25', 420, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (695, 29, 2, '2026-06-20', '2026-07-25', 465, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (696, 29, 3, '2026-06-20', '2026-07-25', 510, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (697, 29, 1, '2026-07-25', '2026-08-23', 390, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (698, 29, 2, '2026-07-25', '2026-08-23', 435, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (699, 29, 3, '2026-07-25', '2026-08-23', 480, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (700, 29, 1, '2026-08-23', '2026-09-15', 450, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (701, 29, 2, '2026-08-23', '2026-09-15', 495, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (702, 29, 3, '2026-08-23', '2026-09-15', 540, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (703, 30, 1, '2026-06-20', '2026-07-25', 410, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (704, 30, 2, '2026-06-20', '2026-07-25', 455, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (705, 30, 3, '2026-06-20', '2026-07-25', 500, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (706, 30, 1, '2026-07-25', '2026-08-23', 380, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (707, 30, 2, '2026-07-25', '2026-08-23', 425, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (708, 30, 3, '2026-07-25', '2026-08-23', 470, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (709, 30, 1, '2026-08-23', '2026-09-15', 440, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (710, 30, 2, '2026-08-23', '2026-09-15', 485, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (711, 30, 3, '2026-08-23', '2026-09-15', 530, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (712, 31, 1, '2026-06-30', '2026-08-14', 360, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (713, 31, 2, '2026-06-30', '2026-08-14', 400, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (714, 31, 3, '2026-06-30', '2026-08-14', 440, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (715, 31, 1, '2026-08-15', '2026-11-11', 340, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (716, 31, 2, '2026-08-15', '2026-11-11', 380, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (717, 31, 3, '2026-08-15', '2026-11-11', 420, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (718, 31, 1, '2026-11-11', '2026-12-10', 420, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (719, 31, 2, '2026-11-11', '2026-12-10', 460, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (720, 31, 3, '2026-11-11', '2026-12-10', 500, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (721, 32, 1, '2026-06-30', '2026-08-14', 460, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (722, 32, 2, '2026-06-30', '2026-08-14', 510, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (723, 32, 3, '2026-06-30', '2026-08-14', 560, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (724, 32, 1, '2026-08-15', '2026-11-11', 370, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (725, 32, 2, '2026-08-15', '2026-11-11', 415, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (726, 32, 3, '2026-08-15', '2026-11-11', 480, 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotel_prices` VALUES (727, 33, 1, '2026-05-01', '2026-06-30', 500000, 1, '2026-05-30 13:42:26', '2026-05-30 13:42:26', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (728, 33, 2, '2026-05-01', '2026-06-30', 600000, 1, '2026-05-30 13:42:26', '2026-05-30 13:42:26', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (729, 33, 3, '2026-05-01', '2026-06-30', 700000, 1, '2026-05-30 13:42:26', '2026-05-30 13:42:26', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (730, 33, 1, '2026-07-01', '2026-08-30', 600000, 1, '2026-05-30 13:42:26', '2026-05-30 13:42:26', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (731, 33, 2, '2026-07-01', '2026-08-30', 700000, 1, '2026-05-30 13:42:26', '2026-05-30 13:42:26', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (732, 33, 3, '2026-07-01', '2026-08-30', 800000, 1, '2026-05-30 13:42:26', '2026-05-30 13:42:26', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (757, 42, 1, '2026-05-01', '2026-05-30', 1, 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (758, 42, 2, '2026-05-01', '2026-05-30', 2, 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (759, 42, 3, '2026-05-01', '2026-05-30', 3, 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (760, 42, 1, '2026-06-01', '2026-06-30', 2, 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (761, 42, 2, '2026-06-01', '2026-06-30', 3, 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (762, 42, 3, '2026-06-01', '2026-06-30', 4, 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (763, 43, 1, '2026-05-01', '2026-05-30', 2, 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (764, 43, 2, '2026-05-01', '2026-05-30', 3, 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (765, 43, 3, '2026-05-01', '2026-05-30', 4, 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (766, 43, 1, '2026-06-01', '2026-06-30', 3, 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (767, 43, 2, '2026-06-01', '2026-06-30', 4, 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);
INSERT INTO `hotel_prices` VALUES (768, 43, 3, '2026-06-01', '2026-06-30', 5, 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);

-- ----------------------------
-- Table structure for hotel_room_types
-- ----------------------------
DROP TABLE IF EXISTS `hotel_room_types`;
CREATE TABLE `hotel_room_types`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `hotel_room_types_name_unique`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hotel_room_types
-- ----------------------------
INSERT INTO `hotel_room_types` VALUES (1, 'DBL', 1, '2026-05-28 06:13:10', '2026-05-28 06:13:10', NULL, 1, 1);
INSERT INTO `hotel_room_types` VALUES (2, 'TRPL', 1, '2026-05-28 06:13:10', '2026-05-28 06:13:10', NULL, 1, 1);
INSERT INTO `hotel_room_types` VALUES (3, 'QUAD', 1, '2026-05-28 06:13:10', '2026-05-28 06:13:10', NULL, 1, 1);

-- ----------------------------
-- Table structure for hotels
-- ----------------------------
DROP TABLE IF EXISTS `hotels`;
CREATE TABLE `hotels`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `country_id` bigint UNSIGNED NOT NULL,
  `city_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IDR',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `hotels_city_id_name_unique`(`city_id` ASC, `name` ASC) USING BTREE,
  UNIQUE INDEX `hotels_code_unique`(`code` ASC) USING BTREE,
  INDEX `hotels_product_id_foreign`(`product_id` ASC) USING BTREE,
  INDEX `hotels_country_id_city_id_is_active_index`(`country_id` ASC, `city_id` ASC, `is_active` ASC) USING BTREE,
  CONSTRAINT `hotels_city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `hotel_cities` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `hotels_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `hotel_countries` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `hotels_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 44 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hotels
-- ----------------------------
INSERT INTO `hotels` VALUES (1, 1, 1, 49, 'Azka Al Maqam', 'HTL-AZKA-ALMAQAM', NULL, 'IDR', 1, '2026-05-28 06:15:37', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (2, 1, 1, 50, 'Olayan Ajyad', 'HTL-OLAYAN-AJYAD', NULL, 'IDR', 1, '2026-05-28 06:15:37', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (3, 1, 1, 51, 'Snood Ajyad', 'HTL-SNOOD-AJYAD', NULL, 'IDR', 1, '2026-05-28 06:15:37', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (4, 1, 1, 46, 'Movenpick Hajar', 'HTL-MOVENPICK-HAJAR', NULL, 'IDR', 1, '2026-05-28 06:23:01', '2026-05-28 17:24:34', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (5, 1, 1, 47, 'Al Safwa Tower', 'HTL-ALSAFWA-TOWER', NULL, 'IDR', 1, '2026-05-28 06:23:02', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (6, 1, 1, 48, 'Al Marwa Rotana', 'HTL-ALMARWA-ROTANA', NULL, 'IDR', 1, '2026-05-28 06:23:02', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (7, 1, 1, 52, 'Sawaed Al Khaier', 'HTL-SAWAED-ALKHAIER', NULL, 'IDR', 1, '2026-05-28 06:23:02', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (8, 1, 1, 53, 'Maysan Al Maqam', 'HTL-MAYSAN-ALMAQAM', NULL, 'IDR', 1, '2026-05-28 06:23:02', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (9, 1, 1, 54, 'Prestige Ajyad', 'HTL-PRESTIGE-AJYAD', NULL, 'IDR', 1, '2026-05-28 06:23:02', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (10, 1, 1, 55, 'Wahat Ajyad', 'HTL-WAHAT-AJYAD', NULL, 'IDR', 1, '2026-05-28 06:23:02', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (11, 1, 1, 56, 'Nada Ajyad', 'HTL-NADA-AJYAD', NULL, 'IDR', 1, '2026-05-28 06:23:02', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (12, 1, 1, 57, 'Al Massa Grand', 'HTL-ALMASSA-GRAND', NULL, 'IDR', 1, '2026-05-28 06:23:02', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (13, 1, 1, 58, 'Al Massa Dar Fayzeen', 'HTL-ALMASSA-DARFAYZEEN', NULL, 'IDR', 1, '2026-05-28 06:23:02', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (14, 1, 1, 59, 'Maather Al Jiwaar', 'HTL-MAATHER-ALJIWAAR', NULL, 'IDR', 1, '2026-05-28 06:23:02', '2026-05-28 17:24:35', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (15, 1, 1, 60, 'Tara Al Hijra', 'HTL-TARA-ALHIJRA', NULL, 'IDR', 1, '2026-05-28 06:23:02', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (16, 1, 1, 61, 'Badr Al Massa', 'HTL-BADR-ALMASSA', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (17, 1, 1, 62, 'Saif Al Yamani', 'HTL-SAIF-ALYAMANI', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (18, 1, 2, 63, 'Taibah Front', 'HTL-TAIBAH-FRONT', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (19, 1, 2, 64, 'Dar Al Eiman Al Haram', 'HTL-DAREIMAN-ALHARAM', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (20, 1, 2, 65, 'Millineum Al Aqeeq', 'HTL-MILLINEUM-ALAQEEQ', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (21, 1, 2, 66, 'Ruve', 'HTL-RUVE', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (22, 1, 2, 67, 'Grand Plaza', 'HTL-GRAND-PLAZA', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (23, 1, 2, 68, 'Al Ansar Golden Tuilp', 'HTL-ALANSAR-GOLDENTUILP', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (24, 1, 2, 69, 'Jiwar Al Saha', 'HTL-JIWAR-ALSAHA', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (25, 1, 2, 70, 'Zowar International', 'HTL-ZOWAR-INTERNATIONAL', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (26, 1, 2, 71, 'Odest', 'HTL-ODEST', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:36', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (27, 1, 2, 72, 'Deyar Al Eiman', 'HTL-DEYAR-ALEIMAN', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (28, 1, 2, 73, 'Durrat El Eiman', 'HTL-DURRAT-ELEIMAN', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (29, 1, 2, 74, 'Golden Tulip Alshakereen', 'HTL-GOLDENTULIP-ALSHAKEREEN', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (30, 1, 2, 75, 'Manazel Al Safiyah', 'HTL-MANAZEL-ALSAFIYAH', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (31, 1, 2, 76, 'Al Mokhtara Al Gharbi', 'HTL-ALMOKHTARA-ALGHARBI', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (32, 1, 2, 77, 'Nusk Al Eiman', 'HTL-NUSK-ALEIMAN', NULL, 'IDR', 1, '2026-05-28 06:23:03', '2026-05-28 17:24:37', NULL, NULL, NULL);
INSERT INTO `hotels` VALUES (33, 2, 3, 78, 'TEST HOTEL 2', 'HTL-TEST-HOTEL-2', NULL, 'IDR', 1, '2026-05-30 13:42:26', '2026-05-30 13:42:49', '2026-05-30 13:42:49', 1, 1);
INSERT INTO `hotels` VALUES (42, 2, 3, 83, 'test hotel 123', 'HTL-TEST-HOTEL-123', NULL, 'IDR', 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);
INSERT INTO `hotels` VALUES (43, 2, 3, 84, 'test hotel 1234', 'HTL-TEST-HOTEL-1234', NULL, 'IDR', 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, 1, 1);

-- ----------------------------
-- Table structure for inventory_items
-- ----------------------------
DROP TABLE IF EXISTS `inventory_items`;
CREATE TABLE `inventory_items`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NULL DEFAULT NULL,
  `item_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unit` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `quantity` int UNSIGNED NOT NULL DEFAULT 0,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `inventory_items_item_code_unique`(`item_code` ASC) USING BTREE,
  UNIQUE INDEX `inventory_items_product_id_unique`(`product_id` ASC) USING BTREE,
  INDEX `inventory_items_created_by_foreign`(`created_by` ASC) USING BTREE,
  INDEX `inventory_items_updated_by_foreign`(`updated_by` ASC) USING BTREE,
  CONSTRAINT `inventory_items_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `inventory_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `inventory_items_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inventory_items
-- ----------------------------
INSERT INTO `inventory_items` VALUES (1, 3, 'PRD-TIKET-GA', 'Tiket Garuda Indonesia', 'transportasi', 'round trip', 7, NULL, 1, NULL, 1, '2026-05-26 01:47:35', '2026-05-30 15:22:17');
INSERT INTO `inventory_items` VALUES (2, 12, 'PRD-CITYTOUR', 'City Tour & Ziarah', 'perlengkapan', 'per paket', 44, 'Generated from product seeder (merchandise/perlengkapan).', 1, NULL, 1, '2026-05-30 01:29:58', '2026-05-30 15:22:17');
INSERT INTO `inventory_items` VALUES (3, 11, 'PRD-HANDLING', 'Handling Bandara', 'perlengkapan', 'per keberangkatan', 47, 'Generated from product seeder (merchandise/perlengkapan).', 1, NULL, 1, '2026-05-30 01:29:58', '2026-05-30 15:22:17');
INSERT INTO `inventory_items` VALUES (4, 10, 'PRD-MAKAN', 'Konsumsi & Katering', 'perlengkapan', 'per jamaah', 44, 'Generated from product seeder (merchandise/perlengkapan).', 1, NULL, 1, '2026-05-30 01:29:58', '2026-05-30 15:22:17');
INSERT INTO `inventory_items` VALUES (5, 9, 'PRD-MANASIK', 'Manasik & Pembimbing', 'perlengkapan', 'per paket', 47, 'Generated from product seeder (merchandise/perlengkapan).', 1, NULL, 1, '2026-05-30 01:29:58', '2026-05-30 15:22:17');
INSERT INTO `inventory_items` VALUES (6, 2, 'PRD-PASPOR', 'Pengurusan Paspor', 'perlengkapan', 'per jamaah', 50, 'Generated from product seeder (merchandise/perlengkapan).', 1, NULL, NULL, '2026-05-30 01:29:58', '2026-05-30 01:31:23');
INSERT INTO `inventory_items` VALUES (7, 13, 'PRD-PERLENGKAPAN', 'Perlengkapan Umroh', 'merchandise', 'per jamaah', 97, 'Generated from product seeder (merchandise/perlengkapan).', 1, NULL, 1, '2026-05-30 01:29:58', '2026-05-30 15:22:17');
INSERT INTO `inventory_items` VALUES (8, 1, 'PRD-VISA', 'Visa Umroh', 'perlengkapan', 'per jamaah', 47, 'Generated from product seeder (merchandise/perlengkapan).', 1, NULL, 1, '2026-05-30 01:29:58', '2026-05-30 15:22:17');

-- ----------------------------
-- Table structure for inventory_stock_mutations
-- ----------------------------
DROP TABLE IF EXISTS `inventory_stock_mutations`;
CREATE TABLE `inventory_stock_mutations`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `inventory_item_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `booking_id` bigint UNSIGNED NULL DEFAULT NULL,
  `change_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_before` int NOT NULL,
  `quantity_change` int NOT NULL,
  `quantity_after` int NOT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `meta` json NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `inventory_stock_mutations_inventory_item_id_foreign`(`inventory_item_id` ASC) USING BTREE,
  INDEX `inventory_stock_mutations_product_id_foreign`(`product_id` ASC) USING BTREE,
  INDEX `inventory_stock_mutations_booking_id_foreign`(`booking_id` ASC) USING BTREE,
  INDEX `inventory_stock_mutations_created_by_foreign`(`created_by` ASC) USING BTREE,
  INDEX `inventory_stock_mutations_updated_by_foreign`(`updated_by` ASC) USING BTREE,
  CONSTRAINT `inventory_stock_mutations_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `inventory_stock_mutations_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `inventory_stock_mutations_inventory_item_id_foreign` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `inventory_stock_mutations_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `inventory_stock_mutations_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 29 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inventory_stock_mutations
-- ----------------------------
INSERT INTO `inventory_stock_mutations` VALUES (1, 1, 3, NULL, 'manual_adjustment', 0, 20, 20, 'Stok awal inventory.', NULL, NULL, NULL, '2026-05-26 01:47:35', '2026-05-26 01:47:35');
INSERT INTO `inventory_stock_mutations` VALUES (2, 1, 3, 5, 'booking_allocation_sync', 20, -3, 17, 'Sinkron stok booking BK-260529-0005.', '{\"booking_code\": \"BK-260529-0005\"}', 1, 1, '2026-05-29 03:24:39', '2026-05-29 03:24:39');
INSERT INTO `inventory_stock_mutations` VALUES (3, 1, 3, 6, 'booking_allocation_sync', 17, -4, 13, 'Sinkron stok booking BK-260529-0007.', '{\"booking_code\": \"BK-260529-0007\"}', 1, 1, '2026-05-29 22:41:14', '2026-05-29 22:41:14');
INSERT INTO `inventory_stock_mutations` VALUES (4, 8, 1, 7, 'booking_allocation_sync', 50, -6, 44, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 02:15:31', '2026-05-30 02:15:31');
INSERT INTO `inventory_stock_mutations` VALUES (5, 1, 3, 7, 'booking_allocation_sync', 13, -6, 7, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 02:15:31', '2026-05-30 02:15:31');
INSERT INTO `inventory_stock_mutations` VALUES (6, 5, 9, 7, 'booking_allocation_sync', 50, -6, 44, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 02:15:31', '2026-05-30 02:15:31');
INSERT INTO `inventory_stock_mutations` VALUES (7, 4, 10, 7, 'booking_allocation_sync', 50, -6, 44, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 02:15:31', '2026-05-30 02:15:31');
INSERT INTO `inventory_stock_mutations` VALUES (8, 3, 11, 7, 'booking_allocation_sync', 50, -6, 44, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 02:15:31', '2026-05-30 02:15:31');
INSERT INTO `inventory_stock_mutations` VALUES (9, 2, 12, 7, 'booking_allocation_sync', 50, -6, 44, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 02:15:31', '2026-05-30 02:15:31');
INSERT INTO `inventory_stock_mutations` VALUES (10, 7, 13, 7, 'booking_allocation_sync', 100, -6, 94, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 02:15:31', '2026-05-30 02:15:31');
INSERT INTO `inventory_stock_mutations` VALUES (11, 8, 1, 7, 'booking_allocation_sync', 44, 6, 50, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:20:24', '2026-05-30 15:20:24');
INSERT INTO `inventory_stock_mutations` VALUES (12, 1, 3, 7, 'booking_allocation_sync', 7, 6, 13, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:20:24', '2026-05-30 15:20:24');
INSERT INTO `inventory_stock_mutations` VALUES (13, 5, 9, 7, 'booking_allocation_sync', 44, 6, 50, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:20:24', '2026-05-30 15:20:24');
INSERT INTO `inventory_stock_mutations` VALUES (14, 4, 10, 7, 'booking_allocation_sync', 44, 6, 50, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:20:24', '2026-05-30 15:20:24');
INSERT INTO `inventory_stock_mutations` VALUES (15, 3, 11, 7, 'booking_allocation_sync', 44, 6, 50, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:20:24', '2026-05-30 15:20:24');
INSERT INTO `inventory_stock_mutations` VALUES (16, 2, 12, 7, 'booking_allocation_sync', 44, 6, 50, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:20:24', '2026-05-30 15:20:24');
INSERT INTO `inventory_stock_mutations` VALUES (17, 7, 13, 7, 'booking_allocation_sync', 94, 6, 100, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:20:24', '2026-05-30 15:20:24');
INSERT INTO `inventory_stock_mutations` VALUES (18, 8, 1, 3, 'booking_allocation_sync', 50, 3, 53, 'Sinkron stok booking BK-260529-0002.', '{\"booking_code\": \"BK-260529-0002\"}', 1, 1, '2026-05-30 15:21:23', '2026-05-30 15:21:23');
INSERT INTO `inventory_stock_mutations` VALUES (19, 5, 9, 3, 'booking_allocation_sync', 50, 3, 53, 'Sinkron stok booking BK-260529-0002.', '{\"booking_code\": \"BK-260529-0002\"}', 1, 1, '2026-05-30 15:21:23', '2026-05-30 15:21:23');
INSERT INTO `inventory_stock_mutations` VALUES (20, 3, 11, 3, 'booking_allocation_sync', 50, 3, 53, 'Sinkron stok booking BK-260529-0002.', '{\"booking_code\": \"BK-260529-0002\"}', 1, 1, '2026-05-30 15:21:23', '2026-05-30 15:21:23');
INSERT INTO `inventory_stock_mutations` VALUES (21, 7, 13, 3, 'booking_allocation_sync', 100, 3, 103, 'Sinkron stok booking BK-260529-0002.', '{\"booking_code\": \"BK-260529-0002\"}', 1, 1, '2026-05-30 15:21:23', '2026-05-30 15:21:23');
INSERT INTO `inventory_stock_mutations` VALUES (22, 8, 1, 7, 'booking_allocation_sync', 53, -6, 47, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:22:17', '2026-05-30 15:22:17');
INSERT INTO `inventory_stock_mutations` VALUES (23, 1, 3, 7, 'booking_allocation_sync', 13, -6, 7, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:22:17', '2026-05-30 15:22:17');
INSERT INTO `inventory_stock_mutations` VALUES (24, 5, 9, 7, 'booking_allocation_sync', 53, -6, 47, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:22:17', '2026-05-30 15:22:17');
INSERT INTO `inventory_stock_mutations` VALUES (25, 4, 10, 7, 'booking_allocation_sync', 50, -6, 44, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:22:17', '2026-05-30 15:22:17');
INSERT INTO `inventory_stock_mutations` VALUES (26, 3, 11, 7, 'booking_allocation_sync', 53, -6, 47, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:22:17', '2026-05-30 15:22:17');
INSERT INTO `inventory_stock_mutations` VALUES (27, 2, 12, 7, 'booking_allocation_sync', 50, -6, 44, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:22:17', '2026-05-30 15:22:17');
INSERT INTO `inventory_stock_mutations` VALUES (28, 7, 13, 7, 'booking_allocation_sync', 103, -6, 97, 'Sinkron stok booking BK-260530-0008.', '{\"booking_code\": \"BK-260530-0008\"}', 1, 1, '2026-05-30 15:22:17', '2026-05-30 15:22:17');

-- ----------------------------
-- Table structure for invitations
-- ----------------------------
DROP TABLE IF EXISTS `invitations`;
CREATE TABLE `invitations`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `invited_by_user_id` bigint UNSIGNED NULL DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `invitations_email_unique`(`email` ASC) USING BTREE,
  UNIQUE INDEX `invitations_token_hash_unique`(`token_hash` ASC) USING BTREE,
  INDEX `invitations_invited_by_user_id_foreign`(`invited_by_user_id` ASC) USING BTREE,
  INDEX `invitations_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `invitations_updated_by_index`(`updated_by` ASC) USING BTREE,
  CONSTRAINT `invitations_invited_by_user_id_foreign` FOREIGN KEY (`invited_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of invitations
-- ----------------------------
INSERT INTO `invitations` VALUES (1, 'ikihapid@gmsil.com', '8f19e45e6c060440784f23a43731663deb37d1ff756bcb417309119b93b2f990', 1, '2026-05-27 12:43:50', NULL, '2026-05-20 12:43:50', '2026-05-20 12:43:50', NULL, NULL);
INSERT INTO `invitations` VALUES (2, 'ikihapid@gmail.com', '54fc57ce0017f5455e1b293ab3713e662c70267786d2c0c17c43d132cc1392cf', 1, '2026-05-27 12:44:27', NULL, '2026-05-20 12:44:27', '2026-05-20 12:44:27', NULL, NULL);
INSERT INTO `invitations` VALUES (3, 'firosmalik.job@gmail.com', 'de20cf15dd3cc3a62c49e5dec42b6e3d6ec9b9a4b0c8e0e6501f6be34d5eb242', 1, '2026-05-27 12:44:56', '2026-05-20 12:45:37', '2026-05-20 12:44:56', '2026-05-20 12:45:37', NULL, NULL);

-- ----------------------------
-- Table structure for job_batches
-- ----------------------------
DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches`  (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `cancelled_at` int NULL DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of job_batches
-- ----------------------------

-- ----------------------------
-- Table structure for jobs
-- ----------------------------
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED NULL DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `jobs_queue_index`(`queue` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of jobs
-- ----------------------------

-- ----------------------------
-- Table structure for legal_documents
-- ----------------------------
DROP TABLE IF EXISTS `legal_documents`;
CREATE TABLE `legal_documents`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `issued_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `legal_documents_sort_order_is_active_index`(`sort_order` ASC, `is_active` ASC) USING BTREE,
  INDEX `legal_documents_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `legal_documents_updated_by_index`(`updated_by` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of legal_documents
-- ----------------------------
INSERT INTO `legal_documents` VALUES (1, 'Izin Penyelenggara Perjalanan Ibadah Umroh', 'PPIU-2026-001', 'Kementerian Agama RI', 'Legalitas utama penyelenggaraan perjalanan umroh.', 1, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `legal_documents` VALUES (2, 'Akta Pendirian Perusahaan', 'ASF-LEGAL-002', 'Notaris Resmi', 'Dokumen pendirian dan perubahan perusahaan.', 2, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);

-- ----------------------------
-- Table structure for menus
-- ----------------------------
DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `menu_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MenuIcon',
  `children` json NULL,
  `order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `menus_menu_key_unique`(`menu_key` ASC) USING BTREE,
  INDEX `menus_created_by_foreign`(`created_by` ASC) USING BTREE,
  INDEX `menus_updated_by_foreign`(`updated_by` ASC) USING BTREE,
  INDEX `menus_order_index`(`order` ASC) USING BTREE,
  INDEX `menus_menu_key_index`(`menu_key` ASC) USING BTREE,
  INDEX `menus_is_active_index`(`is_active` ASC) USING BTREE,
  CONSTRAINT `menus_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `menus_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of menus
-- ----------------------------
INSERT INTO `menus` VALUES (1, 'Dashboard', 'dashboard', '/dashboard', 'Home', NULL, 1, 1, NULL, NULL, '2026-05-29 14:41:06', '2026-05-29 14:41:06');
INSERT INTO `menus` VALUES (2, 'Website Management', 'website_management', '/dashboard/website-management', 'Globe', '[{\"icon\": \"FileText\", \"name\": \"Website\", \"path\": \"/dashboard/website-management/website\", \"order\": 1, \"children\": null, \"menu_key\": \"landing_page\", \"is_active\": true}, {\"icon\": \"FileText\", \"name\": \"Articles & News\", \"path\": \"/dashboard/website-management/articles\", \"order\": 2, \"children\": null, \"menu_key\": \"articles_management\", \"is_active\": true}, {\"icon\": \"Folder\", \"name\": \"Landing HTML\", \"path\": \"/dashboard/website-management/landing\", \"order\": 3, \"children\": null, \"menu_key\": \"portal_content\", \"is_active\": true}, {\"icon\": \"Images\", \"name\": \"Gallery\", \"path\": \"/dashboard/website-management/gallery\", \"order\": 4, \"children\": null, \"menu_key\": \"gallery_management\", \"is_active\": true}, {\"icon\": \"Search\", \"name\": \"SEO Settings\", \"path\": \"/dashboard/website-management/seo\", \"order\": 5, \"children\": null, \"menu_key\": \"seo_settings\", \"is_active\": true}, {\"icon\": \"Palette\", \"name\": \"Branding\", \"path\": \"/dashboard/website-management/branding\", \"order\": 6, \"children\": null, \"menu_key\": \"branding\", \"is_active\": true}]', 2, 1, NULL, NULL, '2026-05-29 14:41:06', '2026-05-29 14:41:06');
INSERT INTO `menus` VALUES (3, 'Product Management', 'product_management', '/dashboard/product-management/products', 'Package', '[{\"icon\": \"Tags\", \"name\": \"Product Category\", \"path\": \"/dashboard/product-management/categories\", \"order\": 1, \"children\": null, \"menu_key\": \"product_category\", \"is_active\": true}, {\"icon\": \"Package\", \"name\": \"Product\", \"path\": \"/dashboard/product-management/products\", \"order\": 2, \"children\": null, \"menu_key\": \"product\", \"is_active\": true}, {\"icon\": \"Boxes\", \"name\": \"Package\", \"path\": \"/dashboard/product-management/packages\", \"order\": 3, \"children\": null, \"menu_key\": \"package\", \"is_active\": true}, {\"icon\": \"ListChecks\", \"name\": \"Activity\", \"path\": \"/dashboard/product-management/activities\", \"order\": 4, \"children\": null, \"menu_key\": \"activity\", \"is_active\": true}]', 3, 1, NULL, NULL, '2026-05-29 14:41:06', '2026-05-29 14:41:06');
INSERT INTO `menus` VALUES (4, 'Booking', 'booking_management', '/dashboard/booking-management', 'BookOpen', '[{\"icon\": \"ClipboardList\", \"name\": \"Register\", \"path\": \"/dashboard/booking-management/register\", \"order\": 1, \"children\": null, \"menu_key\": \"booking_register\", \"is_active\": true}, {\"icon\": \"Users\", \"name\": \"Listing\", \"path\": \"/dashboard/booking-management/listing\", \"order\": 2, \"children\": null, \"menu_key\": \"booking_listing\", \"is_active\": true}, {\"icon\": \"MessageSquare\", \"name\": \"Custom Requests\", \"path\": \"/dashboard/booking-management/custom-requests\", \"order\": 3, \"children\": null, \"menu_key\": \"booking_custom_requests\", \"is_active\": true}, {\"icon\": \"Building2\", \"name\": \"Hotel Assignment\", \"path\": \"/dashboard/booking-management/hotel-assignment\", \"order\": 4, \"children\": null, \"menu_key\": \"booking_hotel_assignment\", \"is_active\": true}]', 4, 1, NULL, NULL, '2026-05-29 14:41:06', '2026-05-29 14:41:06');
INSERT INTO `menus` VALUES (5, 'Master Data', 'master_data', '/dashboard/master-data', 'Database', '[{\"icon\": \"Archive\", \"name\": \"Inventory\", \"path\": \"/dashboard/master-data/inventory\", \"order\": 1, \"children\": null, \"menu_key\": \"inventory\", \"is_active\": true}, {\"icon\": \"Building2\", \"name\": \"Hotel\", \"path\": \"/dashboard/master-data/hotels\", \"order\": 2, \"children\": null, \"menu_key\": \"hotel\", \"is_active\": true}, {\"icon\": \"Flag\", \"name\": \"Master Negara\", \"path\": \"/dashboard/master-data/hotel-countries\", \"order\": 3, \"children\": null, \"menu_key\": \"hotel_country\", \"is_active\": true}, {\"icon\": \"MapPinned\", \"name\": \"Master Kota\", \"path\": \"/dashboard/master-data/hotel-cities\", \"order\": 4, \"children\": null, \"menu_key\": \"hotel_city\", \"is_active\": true}, {\"icon\": \"BedDouble\", \"name\": \"Master Room Type\", \"path\": \"/dashboard/master-data/hotel-room-types\", \"order\": 5, \"children\": null, \"menu_key\": \"hotel_room_type\", \"is_active\": true}, {\"icon\": \"Coins\", \"name\": \"Master Currency\", \"path\": \"/dashboard/master-data/currencies\", \"order\": 6, \"children\": null, \"menu_key\": \"master_currency\", \"is_active\": true}]', 5, 1, NULL, NULL, '2026-05-29 14:41:06', '2026-05-30 01:15:15');
INSERT INTO `menus` VALUES (6, 'Financial Management', 'financial_management', '/dashboard/financial-management', 'Wallet', '[{\"icon\": \"FileText\", \"name\": \"Financial Report\", \"path\": \"/dashboard/financial-management/financial-report\", \"order\": 1, \"children\": null, \"menu_key\": \"financial_report\", \"is_active\": true}, {\"icon\": \"Wallet\", \"name\": \"Cashflow\", \"path\": \"/dashboard/financial-management/cashflow\", \"order\": 2, \"children\": null, \"menu_key\": \"cashflow\", \"is_active\": true}, {\"icon\": \"Calculator\", \"name\": \"HPP Package\", \"path\": \"/dashboard/financial-management/hpp-package\", \"order\": 3, \"children\": null, \"menu_key\": \"hpp_package\", \"is_active\": true}]', 7, 1, NULL, NULL, '2026-05-29 14:41:06', '2026-05-29 14:41:06');
INSERT INTO `menus` VALUES (7, 'Activity', 'activity_management', '/dashboard/activity', 'ClipboardList', '[{\"icon\": \"History\", \"name\": \"Activity Log\", \"path\": \"/dashboard/activity/logs\", \"order\": 1, \"children\": null, \"menu_key\": \"activity_log\", \"is_active\": true}]', 8, 1, NULL, NULL, '2026-05-29 14:41:06', '2026-05-29 14:41:06');
INSERT INTO `menus` VALUES (8, 'Administrator', 'administrator', '/dashboard/administrator', 'Settings', '[{\"icon\": \"FolderTree\", \"name\": \"Menu Management\", \"path\": \"/dashboard/administrator/menus\", \"order\": 1, \"children\": null, \"menu_key\": \"menu_management\", \"is_active\": true}, {\"icon\": \"Users\", \"name\": \"User Management\", \"path\": \"/dashboard/administrator/users\", \"order\": 2, \"children\": null, \"menu_key\": \"user_management\", \"is_active\": true}, {\"icon\": \"Shield\", \"name\": \"Role Management\", \"path\": \"/dashboard/administrator/roles\", \"order\": 3, \"children\": null, \"menu_key\": \"role_management\", \"is_active\": true}]', 9, 1, NULL, NULL, '2026-05-29 14:41:06', '2026-05-29 14:41:06');

-- ----------------------------
-- Table structure for migrations
-- ----------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 81 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of migrations
-- ----------------------------
INSERT INTO `migrations` VALUES (1, '0001_01_01_000000_create_users_table', 1);
INSERT INTO `migrations` VALUES (2, '0001_01_01_000001_create_cache_table', 1);
INSERT INTO `migrations` VALUES (3, '0001_01_01_000002_create_jobs_table', 1);
INSERT INTO `migrations` VALUES (4, '2025_01_22_000001_create_menus_table', 1);
INSERT INTO `migrations` VALUES (5, '2025_01_22_100000_recreate_user_accesses_table', 1);
INSERT INTO `migrations` VALUES (6, '2025_08_26_100418_add_two_factor_columns_to_users_table', 1);
INSERT INTO `migrations` VALUES (7, '2025_10_25_120000_add_username_fullname_to_users_table', 1);
INSERT INTO `migrations` VALUES (8, '2026_04_10_000000_create_user_profiles_table', 1);
INSERT INTO `migrations` VALUES (9, '2026_04_10_000100_create_page_contents_and_travel_products_tables', 1);
INSERT INTO `migrations` VALUES (10, '2026_04_10_000110_create_packages_and_departures_tables', 1);
INSERT INTO `migrations` VALUES (11, '2026_04_10_000120_create_public_content_tables', 1);
INSERT INTO `migrations` VALUES (12, '2026_04_10_000130_create_supporting_travel_tables', 1);
INSERT INTO `migrations` VALUES (13, '2026_04_13_000100_create_product_categories_table', 1);
INSERT INTO `migrations` VALUES (14, '2026_04_15_143256_add_discount_columns_to_travel_packages', 1);
INSERT INTO `migrations` VALUES (15, '2026_04_17_100000_create_package_registrations_table', 1);
INSERT INTO `migrations` VALUES (16, '2026_04_17_145716_add_booking_menu_to_menus_table', 1);
INSERT INTO `migrations` VALUES (17, '2026_04_17_150954_add_booking_listing_menu_item', 1);
INSERT INTO `migrations` VALUES (18, '2026_04_18_025419_create_package_itineraries_table', 1);
INSERT INTO `migrations` VALUES (19, '2026_04_18_044215_add_sort_order_to_package_itineraries_table', 1);
INSERT INTO `migrations` VALUES (20, '2026_04_18_045446_create_package_itinerary_product_table', 1);
INSERT INTO `migrations` VALUES (21, '2026_04_19_120000_upgrade_articles_for_editorial_management', 1);
INSERT INTO `migrations` VALUES (22, '2026_04_19_130000_add_articles_menu_to_website_management', 1);
INSERT INTO `migrations` VALUES (23, '2026_04_20_085239_add_activity_ids_to_package_itineraries_table', 1);
INSERT INTO `migrations` VALUES (24, '2026_04_20_090000_create_activities_table', 1);
INSERT INTO `migrations` VALUES (25, '2026_04_20_091000_add_activity_id_to_package_itineraries_table', 1);
INSERT INTO `migrations` VALUES (26, '2026_04_20_092000_add_activities_menu_to_product_management', 1);
INSERT INTO `migrations` VALUES (27, '2026_04_21_120000_add_icon_to_travel_products_table', 1);
INSERT INTO `migrations` VALUES (28, '2026_04_24_064315_ensure_articles_menu_exists_in_website_management', 1);
INSERT INTO `migrations` VALUES (29, '2026_04_24_080000_add_portal_content_menu_and_pages', 1);
INSERT INTO `migrations` VALUES (30, '2026_04_24_083000_rename_portal_content_menu_to_policy_and_help', 1);
INSERT INTO `migrations` VALUES (31, '2026_04_24_084000_force_policy_and_help_menu_label', 1);
INSERT INTO `migrations` VALUES (32, '2026_04_25_000000_drop_partners_table', 1);
INSERT INTO `migrations` VALUES (33, '2026_04_28_000200_add_gallery_menu_to_website_management', 1);
INSERT INTO `migrations` VALUES (34, '2026_04_30_061721_create_bookings_table', 1);
INSERT INTO `migrations` VALUES (35, '2026_04_30_062350_migrate_registered_registrations_to_bookings', 1);
INSERT INTO `migrations` VALUES (36, '2026_04_30_063506_add_booking_links_to_testimonials_table', 1);
INSERT INTO `migrations` VALUES (37, '2026_04_30_070000_add_photos_to_testimonials_table', 1);
INSERT INTO `migrations` VALUES (38, '2026_04_30_134500_create_custom_umroh_requests_table', 1);
INSERT INTO `migrations` VALUES (39, '2026_05_01_020000_add_custom_fields_to_bookings_table', 1);
INSERT INTO `migrations` VALUES (40, '2026_05_01_090000_add_custom_unit_price_to_bookings_table', 1);
INSERT INTO `migrations` VALUES (41, '2026_05_01_100000_add_rejection_fields_to_custom_umroh_requests_table', 1);
INSERT INTO `migrations` VALUES (42, '2026_05_02_083800_add_financial_management_menu_to_menus_table', 1);
INSERT INTO `migrations` VALUES (43, '2026_05_02_125156_create_permission_tables', 1);
INSERT INTO `migrations` VALUES (44, '2026_05_02_200000_create_invitations_table', 1);
INSERT INTO `migrations` VALUES (45, '2026_05_02_210000_add_user_and_role_management_menus_to_administrator', 1);
INSERT INTO `migrations` VALUES (46, '2026_05_02_220000_seed_menu_permissions_for_spatie', 1);
INSERT INTO `migrations` VALUES (47, '2026_05_03_000000_remove_user_access_menu_from_administrator', 1);
INSERT INTO `migrations` VALUES (48, '2026_05_07_125324_add_departure_and_return_date_to_custom_umroh_requests_table', 2);
INSERT INTO `migrations` VALUES (49, '2026_05_21_160000_add_master_data_inventory_menu', 3);
INSERT INTO `migrations` VALUES (50, '2026_05_21_170000_create_inventory_items_table', 3);
INSERT INTO `migrations` VALUES (51, '2026_05_24_042835_sync_website_management_landing_and_website_content_labels', 4);
INSERT INTO `migrations` VALUES (52, '2026_05_24_055000_update_website_management_menu_links_for_website_and_landing_html', 5);
INSERT INTO `migrations` VALUES (53, '2026_05_24_062131_enforce_website_management_submenus_website_and_landing', 6);
INSERT INTO `migrations` VALUES (54, '2026_05_24_072844_remove_content_management_submenu_from_website_management', 7);
INSERT INTO `migrations` VALUES (55, '2026_05_26_090000_align_inventory_with_products_table', 8);
INSERT INTO `migrations` VALUES (56, '2026_05_26_090100_create_inventory_stock_mutations_table', 8);
INSERT INTO `migrations` VALUES (57, '2026_05_26_110000_add_audit_columns_to_inventory_tables', 9);
INSERT INTO `migrations` VALUES (58, '2026_05_26_130000_add_activity_menu_with_log_submenu', 9);
INSERT INTO `migrations` VALUES (59, '2026_05_26_150000_create_activity_logs_table', 9);
INSERT INTO `migrations` VALUES (60, '2026_05_26_160000_add_audit_columns_to_core_tables', 10);
INSERT INTO `migrations` VALUES (61, '2026_05_26_170000_create_cashflows_table', 11);
INSERT INTO `migrations` VALUES (62, '2026_05_26_171000_add_cashflow_submenu_to_financial_management', 11);
INSERT INTO `migrations` VALUES (63, '2026_05_26_173000_sync_cashflow_permissions_to_roles', 12);
INSERT INTO `migrations` VALUES (64, '2026_05_26_174000_grant_cashflow_crud_to_cs_role', 12);
INSERT INTO `migrations` VALUES (65, '2026_05_27_090000_sync_cashflow_permissions_from_financial_report_roles', 13);
INSERT INTO `migrations` VALUES (66, '2026_05_27_100000_create_hotel_master_tables', 13);
INSERT INTO `migrations` VALUES (67, '2026_05_27_101000_add_hotel_submenu_to_master_data', 13);
INSERT INTO `migrations` VALUES (68, '2026_05_27_102000_add_hotel_product_category', 13);
INSERT INTO `migrations` VALUES (69, '2026_05_28_100000_add_hotel_reference_submenus', 14);
INSERT INTO `migrations` VALUES (70, '2026_05_28_160000_drop_icon_from_products_table', 15);
INSERT INTO `migrations` VALUES (71, '2026_05_29_090000_add_audit_columns_to_packages_and_products_tables', 15);
INSERT INTO `migrations` VALUES (72, '2026_05_29_090000_create_hotel_assignments_table', 15);
INSERT INTO `migrations` VALUES (73, '2026_05_29_091000_add_hotel_assignment_submenu_to_booking_management', 15);
INSERT INTO `migrations` VALUES (74, '2026_05_29_120000_create_package_cost_calculations_table', 16);
INSERT INTO `migrations` VALUES (75, '2026_05_29_120100_create_package_cost_calculation_items_table', 16);
INSERT INTO `migrations` VALUES (76, '2026_05_29_120200_add_hpp_package_submenu_to_financial_management', 16);
INSERT INTO `migrations` VALUES (77, '2026_05_29_120300_add_audit_columns_to_package_cost_calculations_table', 16);
INSERT INTO `migrations` VALUES (78, '2026_05_29_121000_sync_hpp_package_permissions_from_financial_report_roles', 16);
INSERT INTO `migrations` VALUES (79, '2026_05_30_090000_drop_status_from_package_cost_calculations_table', 17);
INSERT INTO `migrations` VALUES (80, '2026_05_30_090500_add_master_currency_submenu_to_master_data', 18);

-- ----------------------------
-- Table structure for model_has_permissions
-- ----------------------------
DROP TABLE IF EXISTS `model_has_permissions`;
CREATE TABLE `model_has_permissions`  (
  `permission_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`permission_id`, `model_id`, `model_type`) USING BTREE,
  INDEX `model_has_permissions_model_id_model_type_index`(`model_id` ASC, `model_type` ASC) USING BTREE,
  CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of model_has_permissions
-- ----------------------------

-- ----------------------------
-- Table structure for model_has_roles
-- ----------------------------
DROP TABLE IF EXISTS `model_has_roles`;
CREATE TABLE `model_has_roles`  (
  `role_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `model_id`, `model_type`) USING BTREE,
  INDEX `model_has_roles_model_id_model_type_index`(`model_id` ASC, `model_type` ASC) USING BTREE,
  CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of model_has_roles
-- ----------------------------
INSERT INTO `model_has_roles` VALUES (1, 'App\\Models\\User', 1);
INSERT INTO `model_has_roles` VALUES (2, 'App\\Models\\User', 2);
INSERT INTO `model_has_roles` VALUES (3, 'App\\Models\\User', 3);
INSERT INTO `model_has_roles` VALUES (4, 'App\\Models\\User', 4);
INSERT INTO `model_has_roles` VALUES (5, 'App\\Models\\User', 5);

-- ----------------------------
-- Table structure for package_cost_calculation_items
-- ----------------------------
DROP TABLE IF EXISTS `package_cost_calculation_items`;
CREATE TABLE `package_cost_calculation_items`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `package_cost_calculation_id` bigint UNSIGNED NOT NULL,
  `cost_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `reference_id` bigint UNSIGNED NULL DEFAULT NULL,
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `quantity` int UNSIGNED NOT NULL DEFAULT 1,
  `unit_price` bigint UNSIGNED NOT NULL DEFAULT 0,
  `total_price` bigint UNSIGNED NOT NULL DEFAULT 0,
  `meta` json NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `pcc_items_calc_id_fk`(`package_cost_calculation_id` ASC) USING BTREE,
  CONSTRAINT `pcc_items_calc_id_fk` FOREIGN KEY (`package_cost_calculation_id`) REFERENCES `package_cost_calculations` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of package_cost_calculation_items
-- ----------------------------

-- ----------------------------
-- Table structure for package_cost_calculations
-- ----------------------------
DROP TABLE IF EXISTS `package_cost_calculations`;
CREATE TABLE `package_cost_calculations`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `package_id` bigint UNSIGNED NOT NULL,
  `departure_schedule_id` bigint UNSIGNED NULL DEFAULT NULL,
  `calculation_date` date NULL DEFAULT NULL,
  `booking_count` int UNSIGNED NOT NULL DEFAULT 0,
  `customer_count` int UNSIGNED NOT NULL DEFAULT 0,
  `hotel_total` bigint UNSIGNED NOT NULL DEFAULT 0,
  `product_total` bigint UNSIGNED NOT NULL DEFAULT 0,
  `manual_adjustment` bigint NOT NULL DEFAULT 0,
  `grand_total` bigint UNSIGNED NOT NULL DEFAULT 0,
  `hpp_per_customer` bigint UNSIGNED NULL DEFAULT NULL,
  `currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IDR',
  `warnings` json NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `calculated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `package_cost_calculations_package_id_foreign`(`package_id` ASC) USING BTREE,
  INDEX `package_cost_calculations_departure_schedule_id_foreign`(`departure_schedule_id` ASC) USING BTREE,
  CONSTRAINT `package_cost_calculations_departure_schedule_id_foreign` FOREIGN KEY (`departure_schedule_id`) REFERENCES `departure_schedules` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `package_cost_calculations_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of package_cost_calculations
-- ----------------------------

-- ----------------------------
-- Table structure for package_itineraries
-- ----------------------------
DROP TABLE IF EXISTS `package_itineraries`;
CREATE TABLE `package_itineraries`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `package_id` bigint UNSIGNED NOT NULL,
  `activity_id` bigint UNSIGNED NULL DEFAULT NULL,
  `activity_ids` json NULL,
  `day_number` smallint UNSIGNED NOT NULL,
  `sort_order` smallint UNSIGNED NOT NULL DEFAULT 1,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `package_itineraries_package_id_day_number_unique`(`package_id` ASC, `day_number` ASC) USING BTREE,
  INDEX `package_itineraries_activity_id_foreign`(`activity_id` ASC) USING BTREE,
  INDEX `package_itineraries_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `package_itineraries_updated_by_index`(`updated_by` ASC) USING BTREE,
  CONSTRAINT `package_itineraries_activity_id_foreign` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `package_itineraries_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 106 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of package_itineraries
-- ----------------------------
INSERT INTO `package_itineraries` VALUES (63, 9, 3, '[3]', 1, 1, 'Penerbangan Keberangkatan', 'Perjalanan udara menuju tanah suci sesuai maskapai dan jadwal yang telah ditentukan.', '2026-05-29 01:39:33', '2026-05-29 01:39:33', 1, 1);
INSERT INTO `package_itineraries` VALUES (64, 9, 5, '[5]', 2, 2, 'Check-in Hotel', 'Proses pembagian kamar, pembagian koper, dan orientasi awal setibanya di hotel.', '2026-05-29 01:39:33', '2026-05-29 01:39:33', 1, 1);
INSERT INTO `package_itineraries` VALUES (65, 9, 6, '[6]', 3, 3, 'Manasik di Lokasi', 'Pembekalan manasik di lokasi untuk memastikan jamaah siap menjalankan rangkaian ibadah.', '2026-05-29 01:39:33', '2026-05-29 01:39:33', 1, 1);
INSERT INTO `package_itineraries` VALUES (66, 9, 7, '[7]', 4, 4, 'Pelaksanaan Umroh', 'Pelaksanaan rangkaian ibadah umroh yang meliputi ihram, thawaf, sa’i, dan tahallul dengan pendampingan pembimbing.', '2026-05-29 01:39:33', '2026-05-29 01:39:33', 1, 1);
INSERT INTO `package_itineraries` VALUES (67, 9, 10, '[10]', 5, 5, 'Ibadah Mandiri', 'Waktu bebas bagi jamaah untuk memperbanyak ibadah pribadi di Masjidil Haram atau Masjid Nabawi.', '2026-05-29 01:39:33', '2026-05-29 01:39:33', 1, 1);
INSERT INTO `package_itineraries` VALUES (68, 9, 8, '[8]', 6, 6, 'Ziarah Makkah', 'Kunjungan ke lokasi bersejarah di Makkah seperti Jabal Tsur, Jabal Rahmah, dan area sekitarnya.', '2026-05-29 01:39:33', '2026-05-29 01:39:33', 1, 1);
INSERT INTO `package_itineraries` VALUES (69, 9, 11, '[11]', 7, 7, 'Transfer Antar Kota', 'Perpindahan rombongan jamaah dari Makkah ke Madinah atau sebaliknya dengan bus atau kereta.', '2026-05-29 01:39:33', '2026-05-29 01:39:33', 1, 1);
INSERT INTO `package_itineraries` VALUES (70, 9, 9, '[9]', 8, 8, 'Ziarah Madinah', 'Kunjungan ke lokasi bersejarah di Madinah seperti Masjid Quba, Jabal Uhud, dan kebun kurma.', '2026-05-29 01:39:33', '2026-05-29 01:39:33', 1, 1);
INSERT INTO `package_itineraries` VALUES (71, 9, 13, '[13]', 9, 9, 'Penerbangan Kepulangan', 'Perjalanan udara kepulangan jamaah menuju Indonesia sesuai jadwal penerbangan yang ditetapkan.', '2026-05-29 01:39:33', '2026-05-29 01:39:33', 1, 1);
INSERT INTO `package_itineraries` VALUES (84, 10, 3, '[3]', 1, 1, 'Penerbangan Keberangkatan', 'Perjalanan udara menuju tanah suci sesuai maskapai dan jadwal yang telah ditentukan.', '2026-05-29 01:40:01', '2026-05-29 01:40:01', 1, 1);
INSERT INTO `package_itineraries` VALUES (85, 10, 5, '[5]', 2, 2, 'Check-in Hotel', 'Proses pembagian kamar, pembagian koper, dan orientasi awal setibanya di hotel.', '2026-05-29 01:40:01', '2026-05-29 01:40:01', 1, 1);
INSERT INTO `package_itineraries` VALUES (86, 10, 6, '[6]', 3, 3, 'Manasik di Lokasi', 'Pembekalan manasik di lokasi untuk memastikan jamaah siap menjalankan rangkaian ibadah.', '2026-05-29 01:40:01', '2026-05-29 01:40:01', 1, 1);
INSERT INTO `package_itineraries` VALUES (87, 10, 7, '[7]', 4, 4, 'Pelaksanaan Umroh', 'Pelaksanaan rangkaian ibadah umroh yang meliputi ihram, thawaf, sa’i, dan tahallul dengan pendampingan pembimbing.', '2026-05-29 01:40:01', '2026-05-29 01:40:01', 1, 1);
INSERT INTO `package_itineraries` VALUES (88, 10, 10, '[10]', 5, 5, 'Ibadah Mandiri', 'Waktu bebas bagi jamaah untuk memperbanyak ibadah pribadi di Masjidil Haram atau Masjid Nabawi.', '2026-05-29 01:40:01', '2026-05-29 01:40:01', 1, 1);
INSERT INTO `package_itineraries` VALUES (89, 10, 8, '[8]', 6, 6, 'Ziarah Makkah', 'Kunjungan ke lokasi bersejarah di Makkah seperti Jabal Tsur, Jabal Rahmah, dan area sekitarnya.', '2026-05-29 01:40:01', '2026-05-29 01:40:01', 1, 1);
INSERT INTO `package_itineraries` VALUES (90, 10, 11, '[11]', 7, 7, 'Transfer Antar Kota', 'Perpindahan rombongan jamaah dari Makkah ke Madinah atau sebaliknya dengan bus atau kereta.', '2026-05-29 01:40:01', '2026-05-29 01:40:01', 1, 1);
INSERT INTO `package_itineraries` VALUES (91, 10, 9, '[9]', 8, 8, 'Ziarah Madinah', 'Kunjungan ke lokasi bersejarah di Madinah seperti Masjid Quba, Jabal Uhud, dan kebun kurma.', '2026-05-29 01:40:01', '2026-05-29 01:40:01', 1, 1);
INSERT INTO `package_itineraries` VALUES (92, 10, 10, '[10]', 9, 9, 'Ibadah Mandiri', 'Waktu bebas bagi jamaah untuk memperbanyak ibadah pribadi di Masjidil Haram atau Masjid Nabawi.', '2026-05-29 01:40:01', '2026-05-29 01:40:01', 1, 1);
INSERT INTO `package_itineraries` VALUES (93, 10, 13, '[13]', 10, 10, 'Penerbangan Kepulangan', 'Perjalanan udara kepulangan jamaah menuju Indonesia sesuai jadwal penerbangan yang ditetapkan.', '2026-05-29 01:40:01', '2026-05-29 01:40:01', 1, 1);
INSERT INTO `package_itineraries` VALUES (94, 11, 3, '[3]', 1, 1, 'Penerbangan Keberangkatan', 'Perjalanan udara menuju tanah suci sesuai maskapai dan jadwal yang telah ditentukan.', '2026-05-29 22:38:19', '2026-05-29 22:38:19', 1, 1);
INSERT INTO `package_itineraries` VALUES (95, 11, 5, '[5]', 2, 2, 'Check-in Hotel', 'Proses pembagian kamar, pembagian koper, dan orientasi awal setibanya di hotel.', '2026-05-29 22:38:19', '2026-05-29 22:38:19', 1, 1);
INSERT INTO `package_itineraries` VALUES (96, 11, 6, '[6]', 3, 3, 'Manasik di Lokasi', 'Pembekalan manasik di lokasi untuk memastikan jamaah siap menjalankan rangkaian ibadah.', '2026-05-29 22:38:19', '2026-05-29 22:38:19', 1, 1);
INSERT INTO `package_itineraries` VALUES (97, 11, 7, '[7]', 4, 4, 'Pelaksanaan Umroh', 'Pelaksanaan rangkaian ibadah umroh yang meliputi ihram, thawaf, sa’i, dan tahallul dengan pendampingan pembimbing.', '2026-05-29 22:38:20', '2026-05-29 22:38:20', 1, 1);
INSERT INTO `package_itineraries` VALUES (98, 11, 10, '[10]', 5, 5, 'Ibadah Mandiri', 'Waktu bebas bagi jamaah untuk memperbanyak ibadah pribadi di Masjidil Haram atau Masjid Nabawi.', '2026-05-29 22:38:20', '2026-05-29 22:38:20', 1, 1);
INSERT INTO `package_itineraries` VALUES (99, 11, 8, '[8]', 6, 6, 'Ziarah Makkah', 'Kunjungan ke lokasi bersejarah di Makkah seperti Jabal Tsur, Jabal Rahmah, dan area sekitarnya.', '2026-05-29 22:38:20', '2026-05-29 22:38:20', 1, 1);
INSERT INTO `package_itineraries` VALUES (100, 11, 10, '[10]', 7, 7, 'Ibadah Mandiri', 'Waktu bebas bagi jamaah untuk memperbanyak ibadah pribadi di Masjidil Haram atau Masjid Nabawi.', '2026-05-29 22:38:20', '2026-05-29 22:38:20', 1, 1);
INSERT INTO `package_itineraries` VALUES (101, 11, 11, '[11]', 8, 8, 'Transfer Antar Kota', 'Perpindahan rombongan jamaah dari Makkah ke Madinah atau sebaliknya dengan bus atau kereta.', '2026-05-29 22:38:20', '2026-05-29 22:38:20', 1, 1);
INSERT INTO `package_itineraries` VALUES (102, 11, 9, '[9]', 9, 9, 'Ziarah Madinah', 'Kunjungan ke lokasi bersejarah di Madinah seperti Masjid Quba, Jabal Uhud, dan kebun kurma.', '2026-05-29 22:38:20', '2026-05-29 22:38:20', 1, 1);
INSERT INTO `package_itineraries` VALUES (103, 11, 10, '[10]', 10, 10, 'Ibadah Mandiri', 'Waktu bebas bagi jamaah untuk memperbanyak ibadah pribadi di Masjidil Haram atau Masjid Nabawi.', '2026-05-29 22:38:20', '2026-05-29 22:38:20', 1, 1);
INSERT INTO `package_itineraries` VALUES (104, 11, 12, '[12]', 11, 11, 'Check-out Hotel', 'Persiapan check-out hotel, pengumpulan bagasi, dan briefing untuk agenda berikutnya.', '2026-05-29 22:38:20', '2026-05-29 22:38:20', 1, 1);
INSERT INTO `package_itineraries` VALUES (105, 11, 13, '[13]', 12, 12, 'Penerbangan Kepulangan', 'Perjalanan udara kepulangan jamaah menuju Indonesia sesuai jadwal penerbangan yang ditetapkan.', '2026-05-29 22:38:20', '2026-05-29 22:38:20', 1, 1);

-- ----------------------------
-- Table structure for package_itinerary_product
-- ----------------------------
DROP TABLE IF EXISTS `package_itinerary_product`;
CREATE TABLE `package_itinerary_product`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `package_itinerary_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `sort_order` smallint UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `pip_itinerary_product_unique`(`package_itinerary_id` ASC, `product_id` ASC) USING BTREE,
  INDEX `package_itinerary_product_product_id_foreign`(`product_id` ASC) USING BTREE,
  CONSTRAINT `package_itinerary_product_package_itinerary_id_foreign` FOREIGN KEY (`package_itinerary_id`) REFERENCES `package_itineraries` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `package_itinerary_product_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 103 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of package_itinerary_product
-- ----------------------------

-- ----------------------------
-- Table structure for package_product
-- ----------------------------
DROP TABLE IF EXISTS `package_product`;
CREATE TABLE `package_product`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `package_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `package_product_unique`(`package_id` ASC, `product_id` ASC) USING BTREE,
  INDEX `package_product_product_id_foreign`(`product_id` ASC) USING BTREE,
  CONSTRAINT `package_product_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `package_product_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 95 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of package_product
-- ----------------------------
INSERT INTO `package_product` VALUES (65, 9, 1, 1, '2026-05-29 01:37:39', '2026-05-29 01:39:33');
INSERT INTO `package_product` VALUES (66, 9, 4, 2, '2026-05-29 01:37:39', '2026-05-29 01:39:33');
INSERT INTO `package_product` VALUES (68, 9, 9, 3, '2026-05-29 01:37:39', '2026-05-29 01:39:33');
INSERT INTO `package_product` VALUES (69, 9, 5, 4, '2026-05-29 01:37:39', '2026-05-29 01:39:33');
INSERT INTO `package_product` VALUES (70, 9, 11, 5, '2026-05-29 01:37:39', '2026-05-29 01:39:33');
INSERT INTO `package_product` VALUES (71, 9, 13, 6, '2026-05-29 01:37:39', '2026-05-29 01:39:33');
INSERT INTO `package_product` VALUES (72, 10, 1, 1, '2026-05-29 01:37:39', '2026-05-29 01:40:00');
INSERT INTO `package_product` VALUES (73, 10, 3, 2, '2026-05-29 01:37:39', '2026-05-29 01:40:00');
INSERT INTO `package_product` VALUES (75, 10, 9, 3, '2026-05-29 01:37:39', '2026-05-29 01:40:00');
INSERT INTO `package_product` VALUES (76, 10, 10, 4, '2026-05-29 01:37:39', '2026-05-29 01:40:00');
INSERT INTO `package_product` VALUES (77, 10, 5, 5, '2026-05-29 01:37:39', '2026-05-29 01:40:00');
INSERT INTO `package_product` VALUES (78, 10, 11, 6, '2026-05-29 01:37:39', '2026-05-29 01:40:00');
INSERT INTO `package_product` VALUES (79, 10, 12, 7, '2026-05-29 01:37:39', '2026-05-29 01:40:00');
INSERT INTO `package_product` VALUES (80, 10, 13, 8, '2026-05-29 01:37:39', '2026-05-29 01:40:00');
INSERT INTO `package_product` VALUES (81, 11, 1, 1, '2026-05-29 01:37:39', '2026-05-29 22:38:19');
INSERT INTO `package_product` VALUES (82, 11, 2, 2, '2026-05-29 01:37:39', '2026-05-29 22:38:19');
INSERT INTO `package_product` VALUES (83, 11, 3, 3, '2026-05-29 01:37:39', '2026-05-29 22:38:19');
INSERT INTO `package_product` VALUES (85, 11, 9, 4, '2026-05-29 01:37:39', '2026-05-29 22:38:19');
INSERT INTO `package_product` VALUES (86, 11, 10, 5, '2026-05-29 01:37:39', '2026-05-29 22:38:19');
INSERT INTO `package_product` VALUES (87, 11, 5, 6, '2026-05-29 01:37:39', '2026-05-29 22:38:19');
INSERT INTO `package_product` VALUES (88, 11, 11, 7, '2026-05-29 01:37:39', '2026-05-29 22:38:19');
INSERT INTO `package_product` VALUES (89, 11, 12, 8, '2026-05-29 01:37:39', '2026-05-29 22:38:19');
INSERT INTO `package_product` VALUES (90, 11, 13, 9, '2026-05-29 01:37:39', '2026-05-29 22:38:19');
INSERT INTO `package_product` VALUES (91, 9, 67, 7, '2026-05-29 01:39:33', '2026-05-29 01:39:33');
INSERT INTO `package_product` VALUES (93, 10, 57, 9, '2026-05-29 01:40:00', '2026-05-29 01:40:00');
INSERT INTO `package_product` VALUES (94, 11, 48, 10, '2026-05-29 22:38:19', '2026-05-29 22:38:19');

-- ----------------------------
-- Table structure for package_registrations
-- ----------------------------
DROP TABLE IF EXISTS `package_registrations`;
CREATE TABLE `package_registrations`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `package_id` bigint UNSIGNED NOT NULL,
  `departure_schedule_id` bigint UNSIGNED NULL DEFAULT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `origin_city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `passenger_count` smallint UNSIGNED NOT NULL DEFAULT 1,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `package_registrations_departure_schedule_id_foreign`(`departure_schedule_id` ASC) USING BTREE,
  INDEX `package_registrations_package_id_status_index`(`package_id` ASC, `status` ASC) USING BTREE,
  INDEX `package_registrations_created_at_index`(`created_at` ASC) USING BTREE,
  INDEX `package_registrations_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `package_registrations_updated_by_index`(`updated_by` ASC) USING BTREE,
  CONSTRAINT `package_registrations_departure_schedule_id_foreign` FOREIGN KEY (`departure_schedule_id`) REFERENCES `departure_schedules` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `package_registrations_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of package_registrations
-- ----------------------------
INSERT INTO `package_registrations` VALUES (3, 9, 42, 'teest peplajar', '8951717192', 'tave@mailinator.com', 'Esse dolore modi fac', 5, NULL, 'pending', '2026-05-29 03:14:22', '2026-05-29 03:14:22', 1, 1);

-- ----------------------------
-- Table structure for packages
-- ----------------------------
DROP TABLE IF EXISTS `packages`;
CREATE TABLE `packages`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `package_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'reguler',
  `departure_city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_days` int UNSIGNED NOT NULL,
  `price` decimal(12, 2) NULL DEFAULT NULL,
  `original_price` decimal(12, 2) NULL DEFAULT NULL,
  `discount_label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `discount_ends_at` datetime NULL DEFAULT NULL,
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IDR',
  `image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `content` json NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `packages_code_unique`(`code` ASC) USING BTREE,
  UNIQUE INDEX `packages_slug_unique`(`slug` ASC) USING BTREE,
  INDEX `packages_package_type_is_active_index`(`package_type` ASC, `is_active` ASC) USING BTREE,
  INDEX `packages_departure_city_is_active_index`(`departure_city` ASC, `is_active` ASC) USING BTREE,
  INDEX `packages_is_featured_is_active_index`(`is_featured` ASC, `is_active` ASC) USING BTREE,
  INDEX `packages_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `packages_updated_by_index`(`updated_by` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of packages
-- ----------------------------
INSERT INTO `packages` VALUES (9, 'ASF-UMROH-BASIC-9-HARI-9', 'umroh-basic-9-hari', 'Umroh Basic 9 Hari', 'reguler', 'Jakarta', 9, 29029000.00, 31900000.00, 'EARLY BIRD', '2026-08-15 23:59:00', 'IDR', '/images/dummy.jpg', 'Paket basic untuk jamaah yang mengutamakan harga terjangkau dengan layanan inti lengkap.', '{\"room\": \"Quad sharing\", \"badge\": \"Best Value\", \"hotel\": \"Hotel area Ajyad / setara\", \"meals\": \"Makan terjadwal\", \"period\": \"Agustus - Oktober 2026\", \"policy\": \"Pembatalan 30 hari sebelum keberangkatan dikenakan biaya 25%. Pembatalan kurang dari 14 hari tidak dapat dikembalikan.\", \"airline\": \"Saudia Airlines\", \"gallery\": [], \"excluded\": \"Pengeluaran pribadi\\nOleh-oleh\\nBiaya paspor (jika belum punya)\", \"handling\": \"Handling bandara Jakarta\", \"included\": \"Tiket pesawat PP Saudia\\nVisa umroh resmi\\nHotel bintang 3 Makkah & Madinah\\nManasik & pembimbing\\nTransportasi bus AC\\nPerlengkapan umroh\", \"highlights\": [{\"id\": \"legacy-airline\", \"icon\": \"Plane\", \"label\": {\"en\": \"Airline\", \"id\": \"Maskapai\"}, \"value\": {\"en\": \"Saudia Airlines\", \"id\": \"Saudia Airlines\"}}, {\"id\": \"legacy-hotel\", \"icon\": \"Hotel\", \"label\": {\"en\": \"Hotel\", \"id\": \"Hotel\"}, \"value\": {\"en\": \"Hotel area Ajyad / setara\", \"id\": \"Hotel area Ajyad / setara\"}}, {\"id\": \"legacy-badge\", \"icon\": \"BadgeCheck\", \"label\": {\"en\": \"Badge\", \"id\": \"Badge\"}, \"value\": {\"en\": \"Best Value\", \"id\": \"Best Value\"}}, {\"id\": \"legacy-period\", \"icon\": \"CalendarDays\", \"label\": {\"en\": \"Period\", \"id\": \"Periode\"}, \"value\": {\"en\": \"Agustus - Oktober 2026\", \"id\": \"Agustus - Oktober 2026\"}}]}', 1, 1, '2026-05-29 01:37:39', '2026-05-29 01:39:32', NULL, 1);
INSERT INTO `packages` VALUES (10, 'ASF-UMROH-REGULAR-10-HARI-10', 'umroh-regular-10-hari', 'Umroh Regular 10 Hari', 'reguler', 'Jakarta', 10, 36708000.00, 39900000.00, 'FAMILY DEAL', '2026-09-01 23:59:00', 'IDR', '/images/dummy.jpg', 'Paket seimbang untuk keluarga dan jamaah umum dengan hotel nyaman serta pembimbing berpengalaman.', '{\"room\": \"Triple / quad sharing\", \"badge\": \"Pilihan Keluarga\", \"hotel\": \"Hotel bintang 4 dekat Masjidil Haram\", \"meals\": \"3 kali makan menu Indonesia\", \"period\": \"September - November 2026\", \"policy\": \"Pembatalan 30 hari sebelum keberangkatan dikenakan biaya 25%. Pembatalan kurang dari 14 hari tidak dapat dikembalikan.\", \"ziarah\": \"Program ziarah Makkah dan Madinah\", \"airline\": \"Garuda Indonesia\", \"gallery\": [], \"excluded\": \"Pengeluaran pribadi\\nOleh-oleh\", \"handling\": \"Handling bandara dan hotel\", \"included\": \"Tiket pesawat PP Garuda\\nVisa umroh resmi\\nHotel bintang 4 Makkah & Madinah\\nManasik & pembimbing\\nKonsumsi 3x sehari\\nTransportasi bus AC\\nPerlengkapan umroh\", \"highlights\": [{\"id\": \"legacy-airline\", \"icon\": \"Plane\", \"label\": {\"en\": \"Airline\", \"id\": \"Maskapai\"}, \"value\": {\"en\": \"Garuda Indonesia\", \"id\": \"Garuda Indonesia\"}}, {\"id\": \"legacy-hotel\", \"icon\": \"Hotel\", \"label\": {\"en\": \"Hotel\", \"id\": \"Hotel\"}, \"value\": {\"en\": \"Hotel bintang 4 dekat Masjidil Haram\", \"id\": \"Hotel bintang 4 dekat Masjidil Haram\"}}, {\"id\": \"legacy-badge\", \"icon\": \"BadgeCheck\", \"label\": {\"en\": \"Badge\", \"id\": \"Badge\"}, \"value\": {\"en\": \"Pilihan Keluarga\", \"id\": \"Pilihan Keluarga\"}}, {\"id\": \"legacy-period\", \"icon\": \"CalendarDays\", \"label\": {\"en\": \"Period\", \"id\": \"Periode\"}, \"value\": {\"en\": \"September - November 2026\", \"id\": \"September - November 2026\"}}]}', 1, 1, '2026-05-29 01:37:39', '2026-05-29 01:40:00', NULL, 1);
INSERT INTO `packages` VALUES (11, 'ASF-UMROH-PREMIUM-12-HARI-12', 'umroh-premium-12-hari', 'Umroh Premium 12 Hari', 'vip', 'Jakarta', 12, 49959000.00, 54900000.00, 'HEMAT 9%', '2026-10-01 23:59:00', 'IDR', '/images/dummy.jpg', 'Paket premium dengan hotel bintang 5 sangat dekat Masjidil Haram dan durasi lebih longgar untuk ibadah yang tenang.', '{\"room\": \"Double sharing premium\", \"badge\": \"VIP Premium\", \"hotel\": \"Hotel bintang 5 walking distance ke Masjidil Haram\", \"meals\": \"Menu premium 3 kali sehari\", \"period\": \"Oktober - Desember 2026\", \"policy\": \"Pembatalan 45 hari sebelum keberangkatan dikenakan biaya 20%. Pembatalan kurang dari 21 hari tidak dapat dikembalikan.\", \"ziarah\": \"City tour premium dan ziarah terarah\", \"airline\": \"Garuda Indonesia Business Class\", \"gallery\": [], \"excluded\": \"Pengeluaran pribadi\\nOleh-oleh\", \"handling\": \"Fast track dan handling prioritas\", \"included\": \"Tiket Garuda Business Class PP\\nVisa umroh resmi\\nPengurusan paspor (jika diperlukan)\\nHotel bintang 5 Makkah & Madinah\\nManasik & pembimbing senior\\nKonsumsi 3x sehari menu premium\\nTransportasi bus AC eksklusif\\nPerlengkapan umroh premium\", \"highlights\": [{\"id\": \"legacy-airline\", \"icon\": \"Plane\", \"label\": {\"en\": \"Airline\", \"id\": \"Maskapai\"}, \"value\": {\"en\": \"Garuda Indonesia Business Class\", \"id\": \"Garuda Indonesia Business Class\"}}, {\"id\": \"legacy-hotel\", \"icon\": \"Hotel\", \"label\": {\"en\": \"Hotel\", \"id\": \"Hotel\"}, \"value\": {\"en\": \"Hotel bintang 5 walking distance ke Masjidil Haram\", \"id\": \"Hotel bintang 5 walking distance ke Masjidil Haram\"}}, {\"id\": \"legacy-badge\", \"icon\": \"BadgeCheck\", \"label\": {\"en\": \"Badge\", \"id\": \"Badge\"}, \"value\": {\"en\": \"VIP Premium\", \"id\": \"VIP Premium\"}}, {\"id\": \"legacy-period\", \"icon\": \"CalendarDays\", \"label\": {\"en\": \"Period\", \"id\": \"Periode\"}, \"value\": {\"en\": \"Oktober - Desember 2026\", \"id\": \"Oktober - Desember 2026\"}}]}', 1, 1, '2026-05-29 01:37:39', '2026-05-29 22:38:19', NULL, 1);

-- ----------------------------
-- Table structure for page_contents
-- ----------------------------
DROP TABLE IF EXISTS `page_contents`;
CREATE TABLE `page_contents`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `content` json NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `page_contents_slug_unique`(`slug` ASC) USING BTREE,
  INDEX `page_contents_category_is_active_index`(`category` ASC, `is_active` ASC) USING BTREE,
  INDEX `page_contents_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `page_contents_updated_by_index`(`updated_by` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of page_contents
-- ----------------------------
INSERT INTO `page_contents` VALUES (1, 'terms-conditions', 'page', 'Syarat & Ketentuan', 'Ketentuan penggunaan layanan, pendaftaran, dan transaksi.', '{\"body\": \"<p>Dengan menggunakan layanan Asfar Tour, pengguna dianggap telah memahami alur pendaftaran, pembayaran, dan komunikasi resmi yang berlaku.</p><h2>Ketentuan Umum</h2><ul><li>Pendaftaran dinyatakan aktif setelah data jamaah dan pembayaran awal diterima.</li><li>Harga paket mengikuti detail yang tertulis pada invoice atau penawaran resmi.</li><li>Perubahan jadwal keberangkatan mengikuti ketersediaan seat dan kebijakan maskapai.</li></ul><h2>Tanggung Jawab Pengguna</h2><p>Calon jamaah wajib memberikan data identitas yang benar, aktif merespons kebutuhan dokumen, dan mengikuti arahan administrasi sebelum keberangkatan.</p>\"}', 1, '2026-05-06 03:03:55', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `page_contents` VALUES (2, 'privacy-policy', 'page', 'Kebijakan Privasi', 'Pengelolaan data pribadi jamaah dan pengguna website.', '{\"body\": \"<p>Data pribadi digunakan untuk proses registrasi, komunikasi layanan, validasi dokumen, dan peningkatan kualitas pendampingan jamaah.</p><h2>Data yang Dikumpulkan</h2><ul><li>Identitas dasar seperti nama, nomor telepon, email, dan alamat.</li><li>Dokumen perjalanan yang dibutuhkan untuk pengurusan keberangkatan.</li><li>Riwayat komunikasi yang berkaitan dengan konsultasi dan transaksi.</li></ul><h2>Perlindungan Data</h2><p>Kami membatasi akses data hanya untuk tim internal yang membutuhkan dan tidak membagikan data kepada pihak luar tanpa dasar yang sah.</p>\"}', 1, '2026-05-06 03:03:55', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `page_contents` VALUES (3, 'refund-policy', 'page', 'Kebijakan Refund', 'Aturan refund, reschedule, dan pembatalan keberangkatan.', '{\"body\": \"<p>Permintaan refund atau perubahan jadwal diproses berdasarkan status pembayaran, progres pengurusan dokumen, dan kebijakan vendor terkait.</p><h2>Pengajuan Refund</h2><ul><li>Pengajuan wajib dilakukan melalui admin resmi perusahaan.</li><li>Nominal refund dapat dipotong biaya administrasi, visa, tiket, atau komponen lain yang sudah diproses.</li><li>Estimasi penyelesaian mengikuti hasil verifikasi internal dan vendor.</li></ul><h2>Perubahan Jadwal</h2><p>Reschedule akan dibantu sesuai seat yang tersedia dan selisih biaya yang mungkin timbul pada periode baru.</p>\"}', 1, '2026-05-06 03:03:55', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `page_contents` VALUES (4, 'disclaimer', 'page', 'Disclaimer', 'Batas tanggung jawab informasi dan layanan.', '{\"body\": \"<p>Informasi pada website disediakan untuk membantu calon jamaah memahami layanan, namun detail akhir tetap mengacu pada penawaran resmi, invoice, dan dokumen perjalanan.</p><ul><li>Ketersediaan seat, harga, dan jadwal dapat berubah mengikuti vendor dan kondisi operasional.</li><li>Materi website tidak menggantikan verifikasi administratif yang diwajibkan sebelum keberangkatan.</li><li>Keputusan akhir terkait visa dan regulasi perjalanan tetap mengikuti otoritas terkait.</li></ul>\"}', 1, '2026-05-06 03:03:55', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `page_contents` VALUES (5, 'branding-settings', 'settings', 'Branding Settings', 'Default branding settings for public pages and administrator portal.', '{\"palette\": {\"accent\": \"#ff9200\", \"primary\": \"#c80012\", \"surface\": \"#f6e7c6\", \"secondary\": \"#8c0a16\", \"accent_soft\": \"#ffc578\"}, \"company_name\": \"Asfar Tour\", \"public_theme\": {\"text\": \"#ffffff\", \"gradient_to\": \"#e69c32\", \"gradient_from\": \"#5d0812\"}, \"company_subtitle\": \"Jelas Rencananya, Terjamin Amanahnya.\"}', 1, '2026-05-06 03:04:04', '2026-05-26 18:16:33', NULL, NULL);
INSERT INTO `page_contents` VALUES (6, 'seo-settings', 'settings', 'SEO Settings', 'Pengaturan SEO, kontak, dan identitas website travel.', '{\"colors\": {\"accent\": \"#ff9200\", \"primary\": \"#c80012\", \"surface\": \"#f6e7c6\", \"secondary\": \"#8c0a16\", \"accent_soft\": \"#ffc578\"}, \"social\": {\"ogTitle\": \"Asfar Tour\", \"accounts\": [{\"url\": \"https://instagram.com/asfartour.id\", \"label\": \"Instagram\", \"platform\": \"instagram\"}, {\"url\": \"https://tiktok.com/@asfartour.id\", \"label\": \"TikTok\", \"platform\": \"tiktok\"}], \"ogDescription\": \"Jelas rencananya, terjamin amanahnya bersama layanan umroh Asfar Tour.\"}, \"contact\": {\"email\": \"info@asfartour.co.id\", \"phone\": \"08137892647\", \"address\": {\"full\": \"Casa pesanggrahan, 2 no B6, Jl. H. Sulaiman, Petukangan Utara, Kec. Pesanggrahan, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12260\", \"mapLink\": \"https://maps.google.com/?q=Casa+pesanggrahan+2+no+B6+Jl.+H.+Sulaiman+Petukangan+Utara+Pesanggrahan+Jakarta+Selatan+12260\"}, \"whatsapp\": \"08137892647\", \"operatingHours\": {\"weekday\": \"Senin - Jumat, 08.00 - 17.00\", \"weekend\": \"Sabtu, 09.00 - 14.00\"}}, \"general\": {\"tagline\": \"Jelas Rencananya, Terjamin Amanahnya.\", \"keywords\": \"travel umroh, paket umroh, haji khusus, jadwal umroh, asfar tour\", \"siteName\": \"Asfar Tour\", \"defaultDescription\": \"Asfar Tour melayani perjalanan umroh dan haji dengan paket terstruktur, jadwal jelas, dan pendampingan yang profesional.\"}, \"advanced\": {\"canonicalBase\": \"http://travel-propposal.test\", \"robotsDefault\": \"index, follow\", \"bingVerification\": \"\", \"googleAnalyticsId\": \"\", \"googleVerification\": \"\"}}', 1, '2026-05-06 03:04:04', '2026-05-26 18:16:33', NULL, NULL);
INSERT INTO `page_contents` VALUES (7, 'home', 'page', 'Asfar Tour - Umroh Profesional & Terpercaya', 'Landing page travel umroh dengan hero, statistik, layanan, galeri, dan CTA konsultasi.', '{\"faq\": {\"title\": \"Pertanyaan Umum\", \"description\": \"Temukan jawaban untuk pertanyaan yang sering ditanyakan.\"}, \"hero\": {\"image\": \"/images/dummy.jpg\", \"label\": \"Asfar Tour\", \"title\": \"Jelas Rencananya, Terjamin Amanahnya.\", \"cta_label\": \"FREE KONSULTASI\", \"description\": \"Pengalaman ibadah umroh yang khusyuk, nyaman, dan terarah bersama tim yang amanah.\", \"secondary_cta_href\": \"/paket-umroh\", \"secondary_cta_label\": \"Lihat Paket\"}, \"about\": {\"cta\": \"Baca Selengkapnya\", \"label\": \"Tentang Kami\", \"title\": \"Pelayanan Umroh yang Tertata dan Menenangkan\", \"description\": \"Kami mengelola keberangkatan umroh dengan alur yang jelas, pendampingan ibadah, dan komunikasi yang transparan.\", \"image_primary\": \"/images/dummy.jpg\", \"image_secondary\": \"/images/dummy.jpg\"}, \"stats\": [{\"label\": \"Tahun Melayani\", \"value\": \"15+\"}, {\"label\": \"Kepuasan Jamaah\", \"value\": \"98%\"}, {\"label\": \"Jamaah Berangkat\", \"value\": \"20K+\"}, {\"label\": \"Program Terlaksana\", \"value\": \"50+\"}], \"contact\": {\"label\": \"Kontak Cepat\", \"title\": \"Siap berangkat? Konsultasi gratis dulu.\", \"description\": \"Tim kami siap membantu memilih package terbaik, jadwal keberangkatan, dan kebutuhan dokumen.\", \"banner_image\": \"/images/dummy.jpg\", \"banner_title\": \"AYO WUJUDKAN IBADAH KE TANAH SUCI BARENG {company_name}\", \"address_label\": \"Alamat\", \"banner_kicker\": \"Konsultasi Gratis\", \"contact_label\": \"Lihat Kontak Lengkap\", \"secondary_href\": \"/paket-umroh\", \"whatsapp_label\": \"Konsultasi WhatsApp\", \"secondary_label\": \"Lihat Paket\", \"contact_info_label\": \"Kontak\"}, \"gallery\": {\"title\": \"Galeri Perjalanan\", \"images\": [], \"cta_label\": \"OUR HISTORY\", \"description\": \"Momen-momen berharga selama perjalanan jamaah Asfar Tour.\"}, \"problem\": {\"label\": \"PENTING DIKETAHUI\", \"quote\": \"“Kami memahami kekhawatiran itu. Karena itu, kami hadir dengan sistem yang jelas dan transparan.”\", \"badges\": [\"Biaya tiba-tiba berubah di tengah jalan\", \"Minimnya informasi & komunikasi\", \"Jadwal keberangkatan tidak jelas\", \"Takut tertipu travel yang tidak amanah\"], \"heading\": \"Banyak Jamaah Gagal Berangkat Bukan Karena Niat, Tapi Karena Salah Pilih Travel\"}, \"articles\": {\"label\": \"Artikel\", \"heading\": \"News & Update Terbaru\", \"cta_label\": \"Lihat Semua Artikel\", \"empty_title\": \"Belum ada artikel yang tampil.\", \"read_more_label\": \"Baca selengkapnya\", \"empty_description\": \"Pastikan artikel sudah berstatus Terbit dan tanggal publikasinya tidak di masa depan.\", \"fallback_item_title_prefix\": \"Artikel\"}, \"packages\": {\"title\": \"Paket Unggulan\", \"heading\": \"PAKET UMROH KAMI\", \"cta_label\": \"Lihat Paket Lainnya\", \"detail_label\": \"Lihat Detail\", \"price_prefix\": \"Mulai\", \"fallback_name\": \"Paket Umroh\", \"duration_suffix\": \"hari\", \"fallback_summary\": \"Detail paket akan tampil di sini.\"}, \"services\": {\"label\": \"Layanan Kami\", \"title\": \"Apa yang Kami Tawarkan?\", \"description\": \"Layanan umroh menyeluruh untuk menjaga perjalanan ibadah tetap aman, nyaman, dan terarah.\", \"fallback_description\": \"Deskripsi layanan akan tampil di sini.\", \"fallback_title_prefix\": \"Layanan\"}, \"timeline\": {\"label\": \"Alur Perjalanan yang Kami Jalankan\", \"steps\": [{\"icon\": \"users\", \"title\": \"Registrasi\", \"caption\": \"DAFTAR & KONSULTASI\", \"description\": \"Konsultasi & pilih paket yang sesuai.\"}, {\"icon\": \"credit-card\", \"title\": \"Pembayaran\", \"caption\": \"DP / PELUNASAN\", \"description\": \"Skema biaya jelas, konfirmasi transparan.\"}, {\"icon\": \"check-circle-2\", \"title\": \"Persiapan Umroh\", \"caption\": \"MANASIK & DOKUMEN\", \"description\": \"Manasik, perlengkapan, dan dokumen.\"}, {\"icon\": \"plane\", \"title\": \"Keberangkatan\", \"caption\": \"BERANGKAT BARENG\", \"description\": \"Briefing & pendampingan sebelum berangkat.\"}, {\"icon\": \"landmark\", \"title\": \"Ibadah\", \"caption\": \"BIMBINGAN IBADAH\", \"description\": \"Bimbingan ibadah sepanjang perjalanan.\"}, {\"icon\": \"calendar-days\", \"title\": \"Kepulangan\", \"caption\": \"PULANG AMAN\", \"description\": \"Kontrol perjalanan sampai tiba di tanah air.\"}], \"heading\": \"Sistem Perjalanan yang Jelas, Bukan Sekadar Janji\", \"value_cards\": [{\"icon\": \"shield-check\", \"title\": \"Transparansi Biaya\", \"description\": \"Rincian biaya jelas sejak awal, tanpa kejutan di tengah jalan.\"}, {\"icon\": \"calendar-days\", \"title\": \"Timeline Terencana\", \"description\": \"Jadwal terstruktur dari pendaftaran sampai kepulangan.\"}, {\"icon\": \"heart-handshake\", \"title\": \"Pendampingan Ibadah\", \"description\": \"Pembimbing berpengalaman memastikan ibadah lebih tenang dan khusyuk.\"}, {\"icon\": \"check-circle-2\", \"title\": \"Sistem Terstruktur\", \"description\": \"Proses administrasi, keberangkatan, dan pelayanan berjalan rapi.\"}]}, \"testimonials\": {\"heading\": \"Kesan Jamaah\", \"fallback_quote\": \"Testimoni jamaah akan tampil di sini.\"}}', 1, '2026-05-06 03:04:04', '2026-05-26 18:16:42', NULL, 1);
INSERT INTO `page_contents` VALUES (8, 'tentang-kami', 'page', 'Tentang Asfar Tour', 'Profil perusahaan, visi misi, dan tim inti travel umroh.', '{\"hero\": {\"title\": \"Tentang Asfar Tour\", \"description\": \"Mengenal visi, misi, nilai layanan, dan tim inti Asfar Tour.\"}, \"team\": {\"title\": \"Tim Inti Kami\", \"description\": \"Figur-figur yang mengawal pelayanan jamaah dari awal hingga akhir.\"}, \"stats\": [{\"label\": \"Tahun Melayani\", \"value\": \"15+\"}, {\"label\": \"Jamaah Berangkat\", \"value\": \"20K+\"}, {\"label\": \"Kepuasan Jamaah\", \"value\": \"98%\"}, {\"label\": \"Program Terlaksana\", \"value\": \"50+\"}], \"values\": [{\"title\": \"Visi Kami\", \"description\": \"Menjadi perusahaan travel umroh terpercaya dengan pelayanan yang profesional dan menenangkan.\"}, {\"title\": \"Misi Kami\", \"description\": \"Memberikan bimbingan ibadah, fasilitas transparan, dan pendampingan total dari awal hingga akhir.\"}], \"profile\": {\"title\": \"Profil & Nilai Perusahaan\", \"description\": \"Asfar Tour fokus pada penyelenggaraan perjalanan umroh yang tertib, nyaman, dan sesuai tuntunan sejak 2015.\", \"image_primary\": \"/images/dummy.jpg\", \"image_secondary\": \"/images/dummy.jpg\"}}', 1, '2026-05-06 03:04:04', '2026-05-26 18:16:33', NULL, NULL);
INSERT INTO `page_contents` VALUES (9, 'paket-umroh', 'page', 'Paket Umroh 2026', 'Daftar paket umroh berdasarkan kota keberangkatan, durasi, dan kebutuhan jamaah.', '{\"note\": \"Harga dapat berbeda sesuai tipe kamar dan periode keberangkatan.\", \"cards\": {\"ask\": \"Tanya Seat\", \"detail\": \"Detail Paket\"}, \"filters\": {\"cities\": [\"Jakarta\", \"Surabaya\", \"Makassar\"], \"months\": [\"Maret 2026\", \"April 2026\", \"Mei 2026\"], \"durations\": [\"9 Hari\", \"10 Hari\", \"12 Hari\"]}}', 1, '2026-05-06 03:04:04', '2026-05-26 18:16:33', NULL, NULL);
INSERT INTO `page_contents` VALUES (10, 'kontak', 'page', 'Kontak Resmi', 'Kanal resmi Asfar Tour untuk konsultasi paket dan dokumen.', '{\"map\": {\"note\": \"Lokasi tampil setelah link maps diisi di SEO settings.\", \"badge\": \"Maps\", \"title\": \"Lokasi Kantor\", \"placeholder\": \"Maps belum ditambahkan\"}, \"badge\": \"Kontak Resmi\", \"heading\": \"Hubungi Asfar Tour\", \"description\": \"Kami siap membantu dari konsultasi package sampai kebutuhan dokumen.\"}', 1, '2026-05-06 03:04:04', '2026-05-26 18:16:33', NULL, NULL);
INSERT INTO `page_contents` VALUES (11, 'legalitas', 'page', 'Legalitas & Perizinan', 'Informasi legalitas resmi travel umroh.', '{\"body\": \"<p>Asfar Tour berkomitmen menjalankan operasional perjalanan ibadah secara legal, transparan, dan mudah diverifikasi oleh calon jamaah maupun keluarga.</p><h2>Komitmen Legalitas</h2><ul><li>Setiap transaksi diarahkan melalui rekening resmi perusahaan.</li><li>Dokumen perizinan dan identitas usaha dapat diverifikasi melalui tim admin resmi.</li><li>Informasi paket, jadwal, dan fasilitas selalu disampaikan tertulis sebelum keberangkatan.</li></ul><h3>Catatan Penting</h3><p>Apabila Anda menerima penawaran dari pihak yang mengatasnamakan perusahaan, pastikan nomor kontak, rekening, dan dokumen pendukung sesuai dengan kanal resmi yang tercantum di website.</p>\", \"hero\": {\"badge\": \"Legal\", \"title\": \"Legalitas & Perizinan\", \"description\": \"Informasi resmi yang memperkuat kepercayaan jamaah.\"}, \"bank_lines\": [\"Nama rekening: PT Asfar Tour\", \"Bank: BSI / Bank Syariah\", \"No rekening: 1234 5678 90\"], \"bank_title\": \"Rekening Resmi\", \"disclaimer\": \"Kami hanya melayani transaksi melalui rekening resmi perusahaan dan kontak resmi.\", \"docs_title\": \"Dokumen Legalitas\", \"disclaimer_title\": \"Disclaimer Anti Penipuan\"}', 1, '2026-05-06 03:04:04', '2026-05-26 18:16:33', NULL, NULL);
INSERT INTO `page_contents` VALUES (12, 'galeri', 'page', 'Galeri Foto & Video', 'Dokumentasi perjalanan jamaah dan tim.', '{\"badge\": \"Gallery\", \"description\": \"Dokumentasi jamaah, hotel, manasik, dan perjalanan di tanah suci.\"}', 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `page_contents` VALUES (13, 'karier', 'page', 'Karier di Asfar Tour', 'Lowongan kerja untuk mendukung operasional travel umroh.', '{\"cta\": \"Lihat Detail\", \"badge\": \"Career\", \"subtitle\": \"Bergabung dengan tim yang melayani jamaah dengan amanah.\"}', 1, '2026-05-06 03:04:04', '2026-05-26 18:16:33', NULL, NULL);
INSERT INTO `page_contents` VALUES (14, 'custom-umroh', 'page', 'Custom atau Private Umroh', 'Paket custom untuk keluarga, komunitas, dan corporate.', '{\"cta\": \"Kirim Request\", \"badge\": \"Custom\", \"subtitle\": \"Untuk keluarga, komunitas, atau corporate dengan kebutuhan khusus.\", \"description\": \"Kami menyesuaikan jadwal, hotel, maskapai, dan itinerary sesuai kebutuhan rombongan.\"}', 1, '2026-05-06 03:04:04', '2026-05-26 18:16:33', NULL, NULL);
INSERT INTO `page_contents` VALUES (15, 'paket-detail', 'page', 'Detail Paket Umroh', 'Label dan blok umum untuk halaman detail package.', '{\"ctas\": {\"book\": \"Booking & Konsultasi WhatsApp\", \"brochure\": \"Unduh Brosur\"}, \"interest\": {\"title\": \"Form Minat\", \"button\": \"Kirim Minat\", \"placeholders\": [\"Nama lengkap\", \"Kota domisili\", \"Tanggal minat\"]}, \"cta_block\": {\"title\": \"Siap berangkat umroh dengan tenang?\", \"button\": \"WhatsApp Sekarang\", \"description\": \"Klik WhatsApp, kami kirim brosur dan rincian fasilitas package ini.\"}, \"policy_title\": \"Kebijakan Perubahan\", \"payment_title\": \"Skema Pembayaran\", \"summary_title\": \"Ringkasan Paket\", \"excluded_title\": \"Yang Tidak Termasuk\", \"included_title\": \"Yang Termasuk\", \"itinerary_title\": \"Itinerary Perjalanan\", \"facilities_title\": \"Fasilitas & Layanan\", \"requirements_title\": \"Syarat & Dokumen\"}', 1, '2026-05-06 03:04:04', '2026-05-26 18:16:33', NULL, NULL);
INSERT INTO `page_contents` VALUES (17, 'home_landing', 'page', 'Home', 'Konten landing page utama.', '{\"faq\": {\"title\": \"Pertanyaan Umum\", \"description\": \"Temukan jawaban untuk pertanyaan yang sering ditanyakan.\"}, \"hero\": {\"image\": \"/images/dummy.jpg\", \"label\": \"Asfar Tour\", \"title\": \"Jelas Rencananya, Terjamin Amanahnya.\", \"cta_label\": \"FREE KONSULTASI\", \"description\": \"Pengalaman ibadah umroh yang khusyuk, nyaman, dan terarah bersama tim yang amanah.\", \"secondary_cta_href\": \"/paket-umroh\", \"secondary_cta_label\": \"Lihat Paket\"}, \"about\": {\"cta\": \"Baca Selengkapnya\", \"label\": \"Tentang Kami\", \"title\": \"Pelayanan Umroh yang Tertata dan Menenangkan\", \"description\": \"Kami mengelola keberangkatan umroh dengan alur yang jelas, pendampingan ibadah, dan komunikasi yang transparan.\", \"image_primary\": \"/images/dummy.jpg\", \"image_secondary\": \"/images/dummy.jpg\"}, \"stats\": [{\"label\": \"Tahun Melayani\", \"value\": \"15+\"}, {\"label\": \"Kepuasan Jamaah\", \"value\": \"98%\"}, {\"label\": \"Jamaah Berangkat\", \"value\": \"20K+\"}, {\"label\": \"Program Terlaksana\", \"value\": \"50+\"}], \"contact\": {\"label\": \"Kontak Cepat\", \"title\": \"Siap berangkat? Konsultasi gratis dulu.\", \"description\": \"Tim kami siap membantu memilih paket terbaik, jadwal, dan kebutuhan dokumen.\", \"banner_image\": \"/images/dummy.jpg\", \"banner_title\": \"AYO WUJUDKAN IBADAH KE TANAH SUCI BARENG {company_name}\", \"address_label\": \"Alamat\", \"banner_kicker\": \"Konsultasi Gratis\", \"contact_label\": \"Lihat Kontak Lengkap\", \"secondary_href\": \"/paket-umroh\", \"whatsapp_label\": \"Konsultasi WhatsApp\", \"secondary_label\": \"Lihat Paket\", \"contact_info_label\": \"Kontak\"}, \"gallery\": {\"title\": \"Galeri Perjalanan\", \"images\": [], \"cta_label\": \"OUR HISTORY\", \"description\": \"Momen-momen berharga selama perjalanan jamaah.\"}, \"problem\": {\"label\": \"PENTING DIKETAHUI\", \"quote\": \"“Kami memahami kekhawatiran itu. Karena itu, kami hadir dengan sistem yang jelas dan transparan.”\", \"badges\": [\"Biaya tiba-tiba berubah di tengah jalan\", \"Minimnya informasi & komunikasi\", \"Jadwal keberangkatan tidak jelas\", \"Takut tertipu travel yang tidak amanah\"], \"heading\": \"Banyak Jamaah Gagal Berangkat Bukan Karena Niat, Tapi Karena Salah Pilih Travel\"}, \"articles\": {\"label\": \"Artikel\", \"heading\": \"News & Update Terbaru\", \"cta_label\": \"Lihat Semua Artikel\", \"empty_title\": \"Belum ada artikel yang tampil.\", \"read_more_label\": \"Baca selengkapnya\", \"empty_description\": \"Pastikan artikel sudah berstatus Terbit dan tanggal publikasinya tidak di masa depan.\", \"fallback_item_title_prefix\": \"Artikel\"}, \"packages\": {\"title\": \"Paket Unggulan\", \"heading\": \"PAKET UMROH KAMI\", \"cta_label\": \"Lihat Paket Lainnya\", \"detail_label\": \"Lihat Detail\", \"price_prefix\": \"Mulai\", \"fallback_name\": \"Paket Umroh\", \"duration_suffix\": \"hari\", \"fallback_summary\": \"Detail paket akan tampil di sini.\"}, \"services\": {\"label\": \"Layanan Kami\", \"title\": \"Apa yang Kami Tawarkan?\", \"description\": \"Layanan umroh menyeluruh untuk menjaga perjalanan ibadah tetap aman, nyaman, dan terarah.\", \"fallback_description\": \"Deskripsi layanan akan tampil di sini.\", \"fallback_title_prefix\": \"Layanan\"}, \"timeline\": {\"label\": \"Alur Perjalanan yang Kami Jalankan\", \"steps\": [{\"icon\": \"users\", \"title\": \"Registrasi\", \"caption\": \"DAFTAR & KONSULTASI\", \"description\": \"Konsultasi & pilih paket yang sesuai.\"}, {\"icon\": \"credit-card\", \"title\": \"Pembayaran\", \"caption\": \"DP / PELUNASAN\", \"description\": \"Skema biaya jelas, konfirmasi transparan.\"}, {\"icon\": \"check-circle-2\", \"title\": \"Persiapan Umroh\", \"caption\": \"MANASIK & DOKUMEN\", \"description\": \"Manasik, perlengkapan, dan dokumen.\"}, {\"icon\": \"plane\", \"title\": \"Keberangkatan\", \"caption\": \"BERANGKAT BARENG\", \"description\": \"Briefing & pendampingan sebelum berangkat.\"}, {\"icon\": \"landmark\", \"title\": \"Ibadah\", \"caption\": \"BIMBINGAN IBADAH\", \"description\": \"Bimbingan ibadah sepanjang perjalanan.\"}, {\"icon\": \"calendar-days\", \"title\": \"Kepulangan\", \"caption\": \"PULANG AMAN\", \"description\": \"Kontrol perjalanan sampai tiba di tanah air.\"}], \"heading\": \"Sistem Perjalanan yang Jelas, Bukan Sekadar Janji\", \"value_cards\": [{\"icon\": \"shield-check\", \"title\": \"Transparansi Biaya\", \"description\": \"Rincian biaya jelas sejak awal, tanpa kejutan di tengah jalan.\"}, {\"icon\": \"calendar-days\", \"title\": \"Timeline Terencana\", \"description\": \"Jadwal terstruktur dari pendaftaran sampai kepulangan.\"}, {\"icon\": \"heart-handshake\", \"title\": \"Pendampingan Ibadah\", \"description\": \"Pembimbing berpengalaman memastikan ibadah lebih tenang dan khusyuk.\"}, {\"icon\": \"check-circle-2\", \"title\": \"Sistem Terstruktur\", \"description\": \"Proses administrasi, keberangkatan, dan pelayanan berjalan rapi.\"}]}, \"testimonials\": {\"heading\": \"Kesan Jamaah\", \"fallback_quote\": \"Testimoni jamaah akan tampil di sini.\"}}', 1, '2026-05-24 04:17:35', '2026-05-24 04:17:35', NULL, NULL);
INSERT INTO `page_contents` VALUES (18, 'landing_html', 'page', 'Landing HTML', 'HTML mockup landing page', '{\"html\": \"<!DOCTYPE html>\\n<html lang=\\\"id\\\">\\n<head>\\n<meta charset=\\\"UTF-8\\\">\\n<meta name=\\\"viewport\\\" content=\\\"width=device-width, initial-scale=1.0\\\">\\n<title>Asfar Tour – Hajj & Umrah</title>\\n<link href=\\\"https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@300;400;500;600;700&display=swap\\\" rel=\\\"stylesheet\\\">\\n<style>\\n*{margin:0;padding:0;box-sizing:border-box}\\nhtml{scroll-behavior:smooth}\\nbody{font-family:\'Inter\',sans-serif;color:#1a0a08;background:#fff;line-height:1.7;overflow-x:hidden}\\n\\n:root{\\n  --red:#c80012;\\n  --red-dark:#8c0a16;\\n  --gold:#ff9200;\\n  --gold-light:#ffc578;\\n  --cream:#f6e7c6;\\n  --cream2:#fdf6ec;\\n  --dark:#0f0505;\\n}\\n\\n/* SECTION TRANSITIONS */\\n.sec{position:relative}\\n.sec::before{content:\'\';position:absolute;top:-80px;left:0;right:0;height:80px;z-index:2;pointer-events:none}\\n.sec::after{content:\'\';position:absolute;bottom:-80px;left:0;right:0;height:80px;z-index:2;pointer-events:none}\\n\\n/* Hero → Why (dark) */\\n.hero::after{content:\'\';position:absolute;bottom:0;left:0;right:0;height:120px;background:linear-gradient(to bottom,transparent,#0f0505);z-index:2;pointer-events:none}\\n\\n/* Why → Paket */\\n.why-bg::after{content:\'\';position:absolute;bottom:0;left:0;right:0;height:100px;background:linear-gradient(to bottom,#0f0505,var(--cream2));z-index:2;pointer-events:none}\\n\\n/* Paket → Testimoni */\\n.pkg-bg::after{content:\'\';position:absolute;bottom:0;left:0;right:0;height:100px;background:linear-gradient(to bottom,var(--cream2),#0f0505);z-index:2;pointer-events:none}\\n\\n/* Testimoni → FAQ */\\n.testi-bg::after{content:\'\';position:absolute;bottom:0;left:0;right:0;height:100px;background:linear-gradient(to bottom,#0f0505,#fff);z-index:2;pointer-events:none}\\n\\n/* FAQ → CTA */\\n.faq-bg::after{content:\'\';position:absolute;bottom:0;left:0;right:0;height:100px;background:linear-gradient(to bottom,#fff,#0f0505);z-index:2;pointer-events:none}\\n\\n/* SCROLL REVEAL */\\n.reveal{opacity:0;transform:translateY(40px);transition:opacity .8s cubic-bezier(.4,0,.2,1),transform .8s cubic-bezier(.4,0,.2,1)}\\n.reveal.visible{opacity:1;transform:translateY(0)}\\n.reveal-delay-1{transition-delay:.1s}\\n.reveal-delay-2{transition-delay:.2s}\\n.reveal-delay-3{transition-delay:.3s}\\n.reveal-delay-4{transition-delay:.4s}\\n\\n/* SCROLLBAR */\\n::-webkit-scrollbar{width:4px}\\n::-webkit-scrollbar-track{background:#fff}\\n::-webkit-scrollbar-thumb{background:var(--red);border-radius:2px}\\n\\n/* NAV */\\nnav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 48px;height:72px;display:flex;align-items:center;justify-content:space-between;transition:all .4s}\\nnav.scrolled{background:rgba(255,255,255,0.97);backdrop-filter:blur(20px);box-shadow:0 1px 40px rgba(0,0,0,0.08)}\\n.logo-text .name{font-family:\'Playfair Display\',serif;font-size:20px;font-weight:700;color:#fff;letter-spacing:1px;line-height:1;transition:color .4s}\\n.logo-text .tag{font-size:9px;color:var(--gold-light);font-weight:600;letter-spacing:3px;text-transform:uppercase;transition:color .4s}\\nnav.scrolled .logo-text .name{color:var(--red-dark)}\\nnav.scrolled .logo-text .tag{color:var(--gold)}\\n.nav-links{display:flex;align-items:center;gap:32px}\\n.nav-links a{font-size:13px;color:rgba(255,255,255,0.8);text-decoration:none;font-weight:500;letter-spacing:.5px;transition:all .3s}\\nnav.scrolled .nav-links a{color:#555}\\n.nav-links a:hover{color:var(--gold-light)}\\nnav.scrolled .nav-links a:hover{color:var(--red)}\\n.nav-cta{background:var(--gold)!important;color:#fff!important;padding:11px 26px!important;border-radius:30px!important;font-weight:700!important;font-size:13px!important;letter-spacing:.3px;box-shadow:0 4px 20px rgba(255,146,0,0.35);transition:all .3s!important}\\n.nav-cta:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(255,146,0,0.45)!important}\\n@media(max-width:640px){nav{padding:0 20px}.nav-links a:not(.nav-cta){display:none}}\\n\\n/* HERO */\\n.hero{min-height:100vh;position:relative;display:flex;align-items:center;overflow:hidden;background:var(--dark)}\\n.hero-bg{position:absolute;inset:0;background:linear-gradient(125deg,#0f0505 0%,#2a0608 40%,#8c0a16 100%);z-index:0}\\n.hero-pattern{position:absolute;inset:0;z-index:1;opacity:.06;background-image:url(\\\"data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z\' fill=\'none\' stroke=\'%23ffd700\' stroke-width=\'0.8\'/%3E%3Cpath d=\'M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z\' fill=\'none\' stroke=\'%23ffd700\' stroke-width=\'0.5\'/%3E%3C/svg%3E\\\") repeat;background-size:80px}\\n.hero-glow{position:absolute;right:-100px;top:50%;transform:translateY(-50%);width:700px;height:700px;background:radial-gradient(circle,rgba(200,0,18,0.25) 0%,transparent 65%);z-index:1}\\n.hero-glow2{position:absolute;left:-50px;bottom:-100px;width:500px;height:500px;background:radial-gradient(circle,rgba(255,146,0,0.12) 0%,transparent 65%);z-index:1}\\n.hero-inner{max-width:1140px;margin:0 auto;width:100%;padding:120px 48px 80px;position:relative;z-index:2;display:grid;grid-template-columns:1fr 420px;gap:60px;align-items:center}\\n.hero-eyebrow{display:inline-flex;align-items:center;gap:10px;margin-bottom:28px}\\n.eyebrow-line{width:32px;height:1px;background:var(--gold)}\\n.eyebrow-text{font-size:11px;font-weight:700;color:var(--gold);letter-spacing:3px;text-transform:uppercase}\\n.hero h1{font-family:\'Playfair Display\',serif;font-size:clamp(36px,5vw,64px);font-weight:800;color:#fff;line-height:1.1;margin-bottom:24px}\\n.hero h1 .gold{color:var(--gold)}\\n.hero h1 .stroke{-webkit-text-stroke:1px rgba(255,255,255,0.4);color:transparent}\\n.hero-desc{font-size:16px;color:rgba(255,255,255,0.6);max-width:480px;margin-bottom:44px;line-height:1.85;font-weight:300}\\n.hero-btns{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:60px}\\n.btn-gold-solid{background:linear-gradient(135deg,var(--gold),#e07f00);color:#fff;font-size:15px;font-weight:700;padding:15px 34px;border-radius:50px;border:none;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:10px;transition:all .3s;box-shadow:0 8px 32px rgba(255,146,0,0.4);letter-spacing:.3px}\\n.btn-gold-solid:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(255,146,0,0.5)}\\n.btn-ghost{background:transparent;color:rgba(255,255,255,0.85);font-size:15px;font-weight:500;padding:15px 30px;border-radius:50px;border:1px solid rgba(255,255,255,0.2);cursor:pointer;text-decoration:none;transition:all .3s;letter-spacing:.3px}\\n.btn-ghost:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.4)}\\n.hero-stats{display:flex;gap:0;border-top:1px solid rgba(255,255,255,0.1);padding-top:32px}\\n.hstat{flex:1;padding-right:32px;border-right:1px solid rgba(255,255,255,0.1);margin-right:32px}\\n.hstat:last-child{border:none;margin:0;padding:0}\\n.hstat-num{font-family:\'Playfair Display\',serif;font-size:32px;font-weight:700;color:#fff;line-height:1}\\n.hstat-num span{color:var(--gold);font-size:20px}\\n.hstat-label{font-size:12px;color:rgba(255,255,255,0.45);margin-top:6px;font-weight:400;letter-spacing:.5px}\\n\\n/* HERO RIGHT CARDS */\\n.hero-right{display:flex;flex-direction:column;gap:14px}\\n.hero-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:22px;backdrop-filter:blur(10px);transition:all .3s}\\n.hero-card:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,197,120,0.2);transform:translateX(-4px)}\\n.hc-row{display:flex;align-items:center;gap:14px}\\n.hc-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--red-dark),var(--red));display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}\\n.hc-icon.gold-ic{background:linear-gradient(135deg,#b36200,var(--gold))}\\n.hc-title{font-size:14px;font-weight:600;color:#fff;margin-bottom:3px}\\n.hc-sub{font-size:12px;color:rgba(255,255,255,0.45)}\\n.hc-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}\\n.hc-tag{background:rgba(255,197,120,0.1);border:1px solid rgba(255,197,120,0.15);color:var(--gold-light);font-size:11px;padding:3px 10px;border-radius:8px;font-weight:500}\\n@media(max-width:900px){.hero-inner{grid-template-columns:1fr;padding:100px 24px 60px}.hero-right{display:none}}\\n\\n/* DIVIDER */\\n.gold-divider{height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent);opacity:.3}\\n\\n/* SECTION */\\n.sec{padding:100px 48px}\\n@media(max-width:640px){.sec{padding:72px 20px}}\\n.sec-inner{max-width:1100px;margin:0 auto}\\n.sec-head{margin-bottom:64px}\\n.sec-eyebrow{display:inline-flex;align-items:center;gap:10px;margin-bottom:16px}\\n.sec-eyebrow-line{width:24px;height:1px;background:var(--gold)}\\n.sec-eyebrow-text{font-size:11px;font-weight:700;color:var(--gold);letter-spacing:3px;text-transform:uppercase}\\n.sec-head h2{font-family:\'Playfair Display\',serif;font-size:clamp(28px,4vw,46px);font-weight:700;color:var(--dark);line-height:1.2;margin-bottom:16px}\\n.sec-head h2 em{font-style:normal;color:var(--red)}\\n.sec-head p{font-size:16px;color:#888;max-width:520px;font-weight:300;line-height:1.8}\\n.sec-head.center{text-align:center}\\n.sec-head.center p{margin:0 auto}\\n\\n/* WHY */\\n.why-bg{background:var(--dark)}\\n.why-bg .sec-head h2{color:#fff}\\n.why-bg .sec-head p{color:rgba(255,255,255,0.45)}\\n.why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.06);border-radius:24px;overflow:hidden}\\n.why-card{background:var(--dark);padding:40px 32px;transition:all .3s;position:relative;overflow:hidden}\\n.why-card::after{content:\'\';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--red),var(--gold));transform:scaleX(0);transform-origin:left;transition:transform .4s}\\n.why-card:hover{background:#1a0808}\\n.why-card:hover::after{transform:scaleX(1)}\\n.why-num{font-family:\'Playfair Display\',serif;font-size:48px;font-weight:700;color:rgba(255,255,255,0.04);position:absolute;top:20px;right:24px;line-height:1}\\n.why-icon{font-size:32px;margin-bottom:20px;display:block}\\n.why-card h3{font-size:16px;font-weight:600;color:#fff;margin-bottom:10px;letter-spacing:.3px}\\n.why-card p{font-size:13px;color:rgba(255,255,255,0.4);line-height:1.75;font-weight:300}\\n\\n/* PAKET */\\n.pkg-bg{background:var(--cream2)}\\n.pkg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;max-width:780px;margin:0 auto}\\n.pkg-card{border-radius:24px;overflow:hidden;background:#fff;border:1px solid #ede0d0;transition:all .35s;position:relative}\\n.pkg-card:hover{transform:translateY(-6px);box-shadow:0 30px 60px rgba(140,10,22,0.12)}\\n.pkg-card.featured{border:1.5px solid var(--gold);box-shadow:0 12px 40px rgba(255,146,0,0.12)}\\n.pkg-ribbon{position:absolute;top:20px;right:-30px;background:linear-gradient(135deg,var(--gold),#e07f00);color:#fff;font-size:10px;font-weight:800;padding:5px 40px;letter-spacing:1px;transform:rotate(45deg);transform-origin:center}\\n.pkg-top{padding:36px 32px 28px;border-bottom:1px solid #f5ece0;position:relative}\\n.pkg-icon-wrap{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:20px}\\n.pkg-icon-wrap.ico-eco{background:linear-gradient(135deg,#fff5e6,var(--cream))}\\n.pkg-icon-wrap.ico-feat{background:linear-gradient(135deg,var(--red-dark),var(--red))}\\n.pkg-top h3{font-family:\'Playfair Display\',serif;font-size:22px;font-weight:700;color:var(--dark);margin-bottom:6px}\\n.pkg-tag{font-size:11px;font-weight:600;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;display:block}\\n.pkg-price-row{display:flex;align-items:baseline;gap:6px}\\n.pkg-amount{font-family:\'Playfair Display\',serif;font-size:34px;font-weight:700;color:var(--red-dark)}\\n.pkg-per{font-size:13px;color:#aaa;font-weight:400}\\n.pkg-body{padding:28px 32px}\\n.pkg-features{list-style:none;margin-bottom:28px}\\n.pkg-features li{font-size:14px;color:#555;padding:10px 0;border-bottom:1px solid #f8f0e8;display:flex;align-items:center;gap:12px;font-weight:400}\\n.pkg-features li:last-child{border:none}\\n.pkg-check{width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,var(--red-dark),var(--red));display:flex;align-items:center;justify-content:center;flex-shrink:0}\\n.pkg-check svg{width:10px;height:10px}\\n.pkg-btn{width:100%;border:none;border-radius:14px;padding:15px;font-size:14px;font-weight:700;cursor:pointer;transition:all .3s;letter-spacing:.3px}\\n.pkg-btn.eco{background:var(--cream);color:var(--red-dark)}\\n.pkg-btn.eco:hover{background:var(--red);color:#fff}\\n.pkg-btn.feat{background:linear-gradient(135deg,var(--red-dark),var(--red));color:#fff;box-shadow:0 6px 20px rgba(200,0,18,0.25)}\\n.pkg-btn.feat:hover{box-shadow:0 10px 30px rgba(200,0,18,0.35);transform:translateY(-1px)}\\n\\n/* TESTI */\\n.testi-bg{background:var(--dark)}\\n.testi-bg .sec-head h2{color:#fff}\\n.testi-bg .sec-head p{color:rgba(255,255,255,0.4)}\\n.testi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}\\n.testi-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:32px;transition:all .3s}\\n.testi-card:hover{background:rgba(255,255,255,0.06);border-color:rgba(255,197,120,0.15);transform:translateY(-3px)}\\n.testi-quote{font-family:\'Playfair Display\',serif;font-size:56px;color:var(--red);line-height:.8;margin-bottom:16px;opacity:.6}\\n.testi-text{font-size:14px;color:rgba(255,255,255,0.6);line-height:1.85;margin-bottom:24px;font-weight:300;font-style:italic}\\n.testi-divider{height:1px;background:rgba(255,255,255,0.07);margin-bottom:20px}\\n.testi-author{display:flex;align-items:center;gap:14px}\\n.testi-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--red-dark),var(--red));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0;font-family:\'Playfair Display\',serif}\\n.testi-name{font-size:14px;font-weight:600;color:#fff;margin-bottom:2px}\\n.testi-loc{font-size:11px;color:rgba(255,255,255,0.35);letter-spacing:.5px}\\n.stars{color:var(--gold);font-size:13px;letter-spacing:2px;margin-bottom:16px}\\n\\n/* FAQ */\\n.faq-bg{background:#fff}\\n.faq-wrap{max-width:720px;margin:0 auto}\\n.faq-item{border-bottom:1px solid #f0e4d8;overflow:hidden}\\n.faq-q{width:100%;background:transparent;border:none;padding:24px 0;font-size:15px;font-weight:500;color:var(--dark);text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:20px;font-family:\'Inter\',sans-serif;transition:color .2s}\\n.faq-q:hover{color:var(--red)}\\n.faq-toggle{width:32px;height:32px;border-radius:50%;border:1.5px solid #e0d0c8;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s;color:var(--red);font-size:18px;font-weight:300}\\n.faq-item.open-item .faq-toggle{background:var(--red);color:#fff;border-color:var(--red);transform:rotate(45deg)}\\n.faq-a{font-size:14px;color:#888;padding:0 0 24px;line-height:1.85;display:none;font-weight:300}\\n.faq-a.open{display:block}\\n\\n/* CTA */\\n.cta-sec{background:linear-gradient(135deg,#0f0505 0%,var(--red-dark) 50%,#6b0010 100%);padding:120px 48px;text-align:center;position:relative;overflow:hidden}\\n.cta-pattern{position:absolute;inset:0;opacity:.05;background-image:url(\\\"data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z\' fill=\'none\' stroke=\'%23ffd700\' stroke-width=\'1\'/%3E%3C/svg%3E\\\") repeat;background-size:80px}\\n.cta-inner{position:relative;z-index:1;max-width:600px;margin:0 auto}\\n.cta-eyebrow{display:inline-flex;align-items:center;gap:10px;margin-bottom:24px}\\n.cta-eyebrow-line{width:24px;height:1px;background:var(--gold)}\\n.cta-eyebrow-text{font-size:11px;font-weight:700;color:var(--gold);letter-spacing:3px;text-transform:uppercase}\\n.cta-sec h2{font-family:\'Playfair Display\',serif;font-size:clamp(28px,5vw,48px);font-weight:700;color:#fff;margin-bottom:16px;line-height:1.2}\\n.cta-sec p{font-size:16px;color:rgba(255,255,255,0.6);margin-bottom:44px;font-weight:300;line-height:1.8}\\n.btn-cta-gold{background:linear-gradient(135deg,var(--gold),#d97700);color:#fff;font-size:16px;font-weight:700;padding:18px 48px;border-radius:50px;border:none;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:12px;transition:all .3s;box-shadow:0 8px 32px rgba(255,146,0,0.4);letter-spacing:.3px}\\n.btn-cta-gold:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(255,146,0,0.55)}\\n\\n/* WA FLOAT */\\n.wa-float{position:fixed;bottom:28px;right:28px;z-index:999;background:linear-gradient(135deg,#25d366,#1da851);width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;box-shadow:0 8px 28px rgba(37,211,102,0.45);animation:wpulse 2.5s infinite}\\n@keyframes wpulse{0%,100%{box-shadow:0 8px 28px rgba(37,211,102,0.45)}50%{box-shadow:0 8px 36px rgba(37,211,102,0.65),0 0 0 12px rgba(37,211,102,0.1)}}\\n\\n/* FOOTER */\\nfooter{background:#080202;padding:36px 48px;display:flex;align-items:center;justify-content:space-between;flex-wrap:gap}\\n.footer-logo .name{font-family:\'Playfair Display\',serif;font-size:18px;font-weight:700;color:#fff}\\n.footer-logo .tag{font-size:9px;color:var(--gold);letter-spacing:3px;text-transform:uppercase}\\nfooter p{font-size:12px;color:rgba(255,197,120,0.3);letter-spacing:.5px}\\n@media(max-width:640px){footer{flex-direction:column;gap:12px;text-align:center;padding:28px 20px}}\\n</style>\\n</head>\\n<body>\\n\\n<!-- NAV -->\\n<nav id=\\\"navbar\\\">\\n  <div class=\\\"logo-text\\\">\\n    <div class=\\\"name\\\">ASFAR TOUR</div>\\n    <div class=\\\"tag\\\">Hajj &amp; Umrah</div>\\n  </div>\\n  <div class=\\\"nav-links\\\">\\n    <a href=\\\"#keunggulan\\\">Keunggulan</a>\\n    <a href=\\\"#paket\\\">Paket</a>\\n    <a href=\\\"#testimoni\\\">Testimoni</a>\\n    <a href=\\\"#faq\\\">FAQ</a>\\n    <a href=\\\"https://wa.me/628137892647?text=Halo%20Admin%20Asfar%20Tour%2C%20saya%20ingin%20info%20paket%20Umrah\\\" target=\\\"_blank\\\" class=\\\"nav-cta\\\">💬 Chat Admin</a>\\n  </div>\\n</nav>\\n\\n<!-- HERO -->\\n<section class=\\\"hero\\\">\\n  <div class=\\\"hero-bg\\\"></div>\\n  <div class=\\\"hero-pattern\\\"></div>\\n  <div class=\\\"hero-glow\\\"></div>\\n  <div class=\\\"hero-glow2\\\"></div>\\n  <div class=\\\"hero-inner\\\">\\n    <div class=\\\"hero-left\\\">\\n      <div class=\\\"hero-eyebrow\\\">\\n        <div class=\\\"eyebrow-line\\\"></div>\\n        <div class=\\\"eyebrow-text\\\">Hajj &amp; Umrah Terpercaya</div>\\n      </div>\\n      <h1>Perjalanan Menuju<br><span class=\\\"gold\\\">Tanah Suci</span><br><span class=\\\"stroke\\\">Impian Anda</span></h1>\\n      <p class=\\\"hero-desc\\\">Bersama Asfar Tour, setiap langkah ibadah Anda kami jaga dengan sepenuh hati. Didampingi mutawif berpengalaman, fasilitas premium, dan layanan tulus.</p>\\n      <div class=\\\"hero-btns\\\">\\n        <a href=\\\"https://wa.me/628137892647?text=Halo%20Admin%20Asfar%20Tour%2C%20saya%20ingin%20info%20paket%20Umrah\\\" target=\\\"_blank\\\" class=\\\"btn-gold-solid\\\">💬 Konsultasi Gratis</a>\\n        <a href=\\\"#paket\\\" class=\\\"btn-ghost\\\">Lihat Paket →</a>\\n      </div>\\n      <div class=\\\"hero-stats\\\">\\n        <div class=\\\"hstat\\\"><div class=\\\"hstat-num\\\">500<span>+</span></div><div class=\\\"hstat-label\\\">Jamaah Diberangkatkan</div></div>\\n        <div class=\\\"hstat\\\"><div class=\\\"hstat-num\\\">10<span>+</span></div><div class=\\\"hstat-label\\\">Tahun Pengalaman</div></div>\\n        <div class=\\\"hstat\\\"><div class=\\\"hstat-num\\\">4.9<span>★</span></div><div class=\\\"hstat-label\\\">Rating Jamaah</div></div>\\n      </div>\\n    </div>\\n    <div class=\\\"hero-right\\\">\\n      <div class=\\\"hero-card\\\">\\n        <div class=\\\"hc-row\\\">\\n          <div class=\\\"hc-icon\\\">🏨</div>\\n          <div><div class=\\\"hc-title\\\">Hotel Premium Pilihan</div><div class=\\\"hc-sub\\\">Dekat Masjidil Haram &amp; Nabawi</div></div>\\n        </div>\\n        <div class=\\\"hc-tags\\\"><span class=\\\"hc-tag\\\">Bintang 4–5</span><span class=\\\"hc-tag\\\">Walking distance</span></div>\\n      </div>\\n      <div class=\\\"hero-card\\\">\\n        <div class=\\\"hc-row\\\">\\n          <div class=\\\"hc-icon gold-ic\\\">✈️</div>\\n          <div><div class=\\\"hc-title\\\">Penerbangan Direct</div><div class=\\\"hc-sub\\\">Jakarta → Madinah Non-stop</div></div>\\n        </div>\\n        <div class=\\\"hc-tags\\\"><span class=\\\"hc-tag\\\">Tanpa transit</span><span class=\\\"hc-tag\\\">Maskapai terpilih</span></div>\\n      </div>\\n      <div class=\\\"hero-card\\\">\\n        <div class=\\\"hc-row\\\">\\n          <div class=\\\"hc-icon\\\">📸</div>\\n          <div><div class=\\\"hc-title\\\">Free Dokumentasi</div><div class=\\\"hc-sub\\\">Kenangan ibadah Anda abadi</div></div>\\n        </div>\\n        <div class=\\\"hc-tags\\\"><span class=\\\"hc-tag\\\">Foto &amp; Video</span><span class=\\\"hc-tag\\\">Profesional</span></div>\\n      </div>\\n    </div>\\n  </div>\\n</section>\\n\\n<!-- KEUNGGULAN -->\\n<section class=\\\"sec why-bg\\\" id=\\\"keunggulan\\\">\\n  <div class=\\\"sec-inner\\\">\\n    <div class=\\\"sec-head\\\">\\n      <div class=\\\"sec-eyebrow\\\"><div class=\\\"sec-eyebrow-line\\\"></div><div class=\\\"sec-eyebrow-text\\\">Mengapa Asfar Tour</div></div>\\n      <h2>Ibadah Lebih <em>Bermakna</em><br>Bersama Kami</h2>\\n      <p>Kami tidak sekadar memberangkatkan — kami memastikan setiap momen ibadah Anda berjalan sempurna.</p>\\n    </div>\\n    <div class=\\\"why-grid\\\">\\n      <div class=\\\"why-card reveal reveal-delay-1\\\"><div class=\\\"why-num\\\">01</div><span class=\\\"why-icon\\\">🤝</span><h3>Mutawif Berpengalaman</h3><p>Didampingi pembimbing ibadah profesional yang hafal rute, doa, dan ritual di Tanah Suci.</p></div>\\n      <div class=\\\"why-card reveal reveal-delay-2\\\"><div class=\\\"why-num\\\">02</div><span class=\\\"why-icon\\\">✈️</span><h3>Penerbangan Direct</h3><p>Penerbangan langsung tanpa transit untuk kenyamanan dan efisiensi waktu jamaah.</p></div>\\n      <div class=\\\"why-card reveal reveal-delay-3\\\"><div class=\\\"why-num\\\">03</div><span class=\\\"why-icon\\\">📸</span><h3>Free Dokumentasi</h3><p>Setiap momen berharga ibadah Anda diabadikan secara profesional sebagai kenangan seumur hidup.</p></div>\\n      <div class=\\\"why-card reveal reveal-delay-4\\\"><div class=\\\"why-num\\\">04</div><span class=\\\"why-icon\\\">📋</span><h3>Legal &amp; Amanah</h3><p>Terdaftar resmi di Kemenag RI. Kepercayaan jamaah adalah prioritas utama kami.</p></div>\\n    </div>\\n  </div>\\n</section>\\n\\n<!-- PAKET -->\\n<section class=\\\"sec pkg-bg\\\" id=\\\"paket\\\">\\n  <div class=\\\"sec-inner\\\">\\n    <div class=\\\"sec-head center\\\">\\n      <div class=\\\"sec-eyebrow\\\" style=\\\"justify-content:center\\\"><div class=\\\"sec-eyebrow-line\\\"></div><div class=\\\"sec-eyebrow-text\\\">Pilihan Paket</div><div class=\\\"sec-eyebrow-line\\\"></div></div>\\n      <h2>Paket <em>Umrah</em> Kami</h2>\\n      <p>Pilih paket yang sesuai dengan kebutuhan dan budget perjalanan ibadah Anda.</p>\\n    </div>\\n    <div class=\\\"pkg-grid\\\">\\n\\n      <!-- PAKET HEMAT -->\\n      <div class=\\\"pkg-card\\\">\\n        <div class=\\\"pkg-top\\\">\\n          <div class=\\\"pkg-icon-wrap ico-eco\\\">🌙</div>\\n          <span class=\\\"pkg-tag\\\">Paket Hemat</span>\\n          <h3>Ekonomi</h3>\\n          <div class=\\\"pkg-price-row\\\"><span class=\\\"pkg-amount\\\">Rp 31 Jt</span><span class=\\\"pkg-per\\\">/orang</span></div>\\n        </div>\\n        <div class=\\\"pkg-body\\\">\\n          <ul class=\\\"pkg-features\\\">\\n            <li><div class=\\\"pkg-check\\\"><svg viewBox=\\\"0 0 10 10\\\"><polyline points=\\\"1,5 4,8 9,2\\\" stroke=\\\"#fff\\\" stroke-width=\\\"1.5\\\" fill=\\\"none\\\" stroke-linecap=\\\"round\\\"/></svg></div>9 Hari</li>\\n            <li><div class=\\\"pkg-check\\\"><svg viewBox=\\\"0 0 10 10\\\"><polyline points=\\\"1,5 4,8 9,2\\\" stroke=\\\"#fff\\\" stroke-width=\\\"1.5\\\" fill=\\\"none\\\" stroke-linecap=\\\"round\\\"/></svg></div>Penerbangan Transit</li>\\n            <li><div class=\\\"pkg-check\\\"><svg viewBox=\\\"0 0 10 10\\\"><polyline points=\\\"1,5 4,8 9,2\\\" stroke=\\\"#fff\\\" stroke-width=\\\"1.5\\\" fill=\\\"none\\\" stroke-linecap=\\\"round\\\"/></svg></div>Visa Umrah</li>\\n            <li><div class=\\\"pkg-check\\\"><svg viewBox=\\\"0 0 10 10\\\"><polyline points=\\\"1,5 4,8 9,2\\\" stroke=\\\"#fff\\\" stroke-width=\\\"1.5\\\" fill=\\\"none\\\" stroke-linecap=\\\"round\\\"/></svg></div>Pembimbing Ibadah</li>\\n          </ul>\\n          <button class=\\\"pkg-btn eco\\\" onclick=\\\"waChat(\'Paket Hemat\')\\\">Tanya Paket Ini →</button>\\n        </div>\\n      </div>\\n\\n      <!-- PAKET SANTUY -->\\n      <div class=\\\"pkg-card featured reveal reveal-delay-2\\\">\\n        <div class=\\\"pkg-ribbon\\\">UNGGULAN</div>\\n        <div class=\\\"pkg-top\\\">\\n          <div class=\\\"pkg-icon-wrap ico-feat\\\">🕌</div>\\n          <span class=\\\"pkg-tag\\\" style=\\\"color:var(--gold)\\\">Paket Santuy</span>\\n          <h3>Reguler</h3>\\n          <div class=\\\"pkg-price-row\\\"><span class=\\\"pkg-amount\\\">Rp 36,5 Jt</span><span class=\\\"pkg-per\\\">/orang</span></div>\\n        </div>\\n        <div class=\\\"pkg-body\\\">\\n          <ul class=\\\"pkg-features\\\">\\n            <li><div class=\\\"pkg-check\\\"><svg viewBox=\\\"0 0 10 10\\\"><polyline points=\\\"1,5 4,8 9,2\\\" stroke=\\\"#fff\\\" stroke-width=\\\"1.5\\\" fill=\\\"none\\\" stroke-linecap=\\\"round\\\"/></svg></div>12 Hari (6 Makkah + 4 Madinah)</li>\\n            <li><div class=\\\"pkg-check\\\"><svg viewBox=\\\"0 0 10 10\\\"><polyline points=\\\"1,5 4,8 9,2\\\" stroke=\\\"#fff\\\" stroke-width=\\\"1.5\\\" fill=\\\"none\\\" stroke-linecap=\\\"round\\\"/></svg></div>Pesawat Direct (Non-stop)</li>\\n            <li><div class=\\\"pkg-check\\\"><svg viewBox=\\\"0 0 10 10\\\"><polyline points=\\\"1,5 4,8 9,2\\\" stroke=\\\"#fff\\\" stroke-width=\\\"1.5\\\" fill=\\\"none\\\" stroke-linecap=\\\"round\\\"/></svg></div>Hotel Bintang 4</li>\\n            <li><div class=\\\"pkg-check\\\"><svg viewBox=\\\"0 0 10 10\\\"><polyline points=\\\"1,5 4,8 9,2\\\" stroke=\\\"#fff\\\" stroke-width=\\\"1.5\\\" fill=\\\"none\\\" stroke-linecap=\\\"round\\\"/></svg></div>Free Dokumentasi</li>\\n            <li><div class=\\\"pkg-check\\\"><svg viewBox=\\\"0 0 10 10\\\"><polyline points=\\\"1,5 4,8 9,2\\\" stroke=\\\"#fff\\\" stroke-width=\\\"1.5\\\" fill=\\\"none\\\" stroke-linecap=\\\"round\\\"/></svg></div>Visa Umrah</li>\\n            <li><div class=\\\"pkg-check\\\"><svg viewBox=\\\"0 0 10 10\\\"><polyline points=\\\"1,5 4,8 9,2\\\" stroke=\\\"#fff\\\" stroke-width=\\\"1.5\\\" fill=\\\"none\\\" stroke-linecap=\\\"round\\\"/></svg></div>Pembimbing Ibadah</li>\\n          </ul>\\n          <button class=\\\"pkg-btn feat\\\" onclick=\\\"waChat(\'Paket Santuy\')\\\">Tanya Paket Ini →</button>\\n        </div>\\n      </div>\\n\\n    </div>\\n  </div>\\n</section>\\n\\n<!-- TESTIMONI -->\\n<section class=\\\"sec testi-bg\\\" id=\\\"testimoni\\\">\\n  <div class=\\\"sec-inner\\\">\\n    <div class=\\\"sec-head center\\\">\\n      <div class=\\\"sec-eyebrow\\\" style=\\\"justify-content:center\\\"><div class=\\\"sec-eyebrow-line\\\"></div><div class=\\\"sec-eyebrow-text\\\">Testimoni Jamaah</div><div class=\\\"sec-eyebrow-line\\\"></div></div>\\n      <h2 style=\\\"color:#fff\\\">Mereka Sudah <em>Merasakan</em></h2>\\n      <p>Kepercayaan jamaah adalah kebanggaan terbesar Asfar Tour.</p>\\n    </div>\\n    <div class=\\\"testi-grid\\\">\\n      <div class=\\\"testi-card\\\">\\n        <div class=\\\"testi-quote\\\">\\\"</div>\\n        <div class=\\\"stars\\\">★★★★★</div>\\n        <p class=\\\"testi-text\\\">Alhamdulillah, perjalanan umrah bersama Asfar Tour sangat berkesan. Mutawifnya sabar dan profesional, hotel dekat Masjidil Haram. Dokumentasinya pun bagus sekali!</p>\\n        <div class=\\\"testi-divider\\\"></div>\\n        <div class=\\\"testi-author\\\"><div class=\\\"testi-avatar\\\">UH</div><div><div class=\\\"testi-name\\\">Ustazah Hana R.</div><div class=\\\"testi-loc\\\">Jakarta Selatan</div></div></div>\\n      </div>\\n      <div class=\\\"testi-card\\\">\\n        <div class=\\\"testi-quote\\\">\\\"</div>\\n        <div class=\\\"stars\\\">★★★★★</div>\\n        <p class=\\\"testi-text\\\">Pelayanan luar biasa! Dari proses pendaftaran hingga pulang semua diurus dengan baik. Sangat direkomendasikan untuk keluarga yang ingin beribadah dengan nyaman.</p>\\n        <div class=\\\"testi-divider\\\"></div>\\n        <div class=\\\"testi-author\\\"><div class=\\\"testi-avatar\\\">BF</div><div><div class=\\\"testi-name\\\">Bapak Fahmi</div><div class=\\\"testi-loc\\\">Bekasi</div></div></div>\\n      </div>\\n      <div class=\\\"testi-card\\\">\\n        <div class=\\\"testi-quote\\\">\\\"</div>\\n        <div class=\\\"stars\\\">★★★★★</div>\\n        <p class=\\\"testi-text\\\">Ini umrah kedua saya bersama Asfar Tour. Tidak pindah ke lain hati karena pelayanannya selalu memuaskan, amanah, dan pembimbingnya luar biasa sabar.</p>\\n        <div class=\\\"testi-divider\\\"></div>\\n        <div class=\\\"testi-author\\\"><div class=\\\"testi-avatar\\\">IS</div><div><div class=\\\"testi-name\\\">Ibu Siti M.</div><div class=\\\"testi-loc\\\">Bandung</div></div></div>\\n      </div>\\n    </div>\\n  </div>\\n</section>\\n\\n<!-- FAQ -->\\n<section class=\\\"sec faq-bg\\\" id=\\\"faq\\\">\\n  <div class=\\\"sec-inner\\\">\\n    <div class=\\\"sec-head\\\">\\n      <div class=\\\"sec-eyebrow\\\"><div class=\\\"sec-eyebrow-line\\\"></div><div class=\\\"sec-eyebrow-text\\\">FAQ</div></div>\\n      <h2>Pertanyaan yang <em>Sering Ditanyakan</em></h2>\\n      <p>Temukan jawaban atas pertanyaan jamaah kami.</p>\\n    </div>\\n    <div class=\\\"faq-wrap\\\">\\n      <div class=\\\"faq-item\\\"><button class=\\\"faq-q\\\" onclick=\\\"toggleFaq(this)\\\">Apakah Asfar Tour sudah terdaftar resmi di Kemenag?<span class=\\\"faq-toggle\\\">+</span></button><div class=\\\"faq-a\\\">Ya, Asfar Tour telah terdaftar dan mendapat izin resmi dari Kementerian Agama RI sebagai penyelenggara perjalanan ibadah umrah yang sah dan terpercaya.</div></div>\\n      <div class=\\\"faq-item\\\"><button class=\\\"faq-q\\\" onclick=\\\"toggleFaq(this)\\\">Berapa lama proses pendaftaran hingga keberangkatan?<span class=\\\"faq-toggle\\\">+</span></button><div class=\\\"faq-a\\\">Proses pendaftaran membutuhkan waktu minimal 1–3 bulan sebelum keberangkatan, tergantung ketersediaan kursi dan pengurusan visa.</div></div>\\n      <div class=\\\"faq-item\\\"><button class=\\\"faq-q\\\" onclick=\\\"toggleFaq(this)\\\">Apakah bisa daftar untuk pasangan suami istri?<span class=\\\"faq-toggle\\\">+</span></button><div class=\\\"faq-a\\\">Tentu bisa! Kami menyediakan paket khusus untuk pasangan dengan kamar double. Hubungi admin kami untuk informasi lebih lanjut.</div></div>\\n      <div class=\\\"faq-item\\\"><button class=\\\"faq-q\\\" onclick=\\\"toggleFaq(this)\\\">Apakah ada cicilan atau DP?<span class=\\\"faq-toggle\\\">+</span></button><div class=\\\"faq-a\\\">Ya, kami menyediakan kemudahan pembayaran dengan DP mulai 5 juta rupiah dan sisanya dapat dicicil hingga sebelum keberangkatan.</div></div>\\n      <div class=\\\"faq-item\\\"><button class=\\\"faq-q\\\" onclick=\\\"toggleFaq(this)\\\">Apa yang dimaksud free dokumentasi di Paket Santuy?<span class=\\\"faq-toggle\\\">+</span></button><div class=\\\"faq-a\\\">Kami menyediakan fotografer/videografer profesional yang akan mengabadikan momen ibadah Anda selama di Tanah Suci, tanpa biaya tambahan.</div></div>\\n    </div>\\n  </div>\\n</section>\\n\\n<!-- CTA -->\\n<section class=\\\"cta-sec\\\">\\n  <div class=\\\"cta-pattern\\\"></div>\\n  <div class=\\\"cta-inner\\\">\\n    <div class=\\\"cta-eyebrow\\\" style=\\\"justify-content:center\\\"><div class=\\\"cta-eyebrow-line\\\"></div><div class=\\\"cta-eyebrow-text\\\">Mulai Perjalanan Anda</div><div class=\\\"cta-eyebrow-line\\\"></div></div>\\n    <h2>Siap Melangkah ke<br>Tanah Suci?</h2>\\n    <p>Konsultasikan kebutuhan ibadah Anda bersama tim kami. Gratis, tanpa syarat, tanpa tekanan.</p>\\n    <a href=\\\"https://wa.me/628137892647?text=Halo%20Admin%20Asfar%20Tour%2C%20saya%20ingin%20konsultasi%20paket%20Umrah\\\" target=\\\"_blank\\\" class=\\\"btn-cta-gold\\\">💬 Chat Admin WhatsApp Sekarang</a>\\n  </div>\\n</section>\\n\\n<!-- FOOTER -->\\n<footer>\\n  <div class=\\\"footer-logo\\\">\\n    <div class=\\\"name\\\">ASFAR TOUR</div>\\n    <div class=\\\"tag\\\">Hajj &amp; Umrah</div>\\n  </div>\\n  <p>© 2025 Asfar Tour · Terdaftar Kemenag RI</p>\\n</footer>\\n\\n<!-- WA FLOAT -->\\n<a class=\\\"wa-float\\\" href=\\\"https://wa.me/628137892647?text=Halo%20Admin%20Asfar%20Tour%2C%20saya%20ingin%20info%20paket%20Umrah\\\" target=\\\"_blank\\\">\\n  <svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"28\\\" height=\\\"28\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"white\\\"><path d=\\\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z\\\"/></svg>\\n</a>\\n\\n<script>\\nfunction waChat(pkg){\\n  var msg=\'Halo Admin Asfar Tour, saya ingin bertanya tentang \'+pkg+\'. Mohon informasinya ya 🙏\';\\n  window.open(\'https://wa.me/628137892647?text=\'+encodeURIComponent(msg),\'_blank\');\\n}\\nfunction toggleFaq(btn){\\n  var item=btn.parentElement;\\n  var a=btn.nextElementSibling;\\n  var isOpen=item.classList.contains(\'open-item\');\\n  document.querySelectorAll(\'.faq-item\').forEach(function(el){el.classList.remove(\'open-item\')});\\n  document.querySelectorAll(\'.faq-a\').forEach(function(el){el.classList.remove(\'open\')});\\n  if(!isOpen){item.classList.add(\'open-item\');a.classList.add(\'open\')}\\n}\\n// SCROLL REVEAL\\nvar revealEls=document.querySelectorAll(\'.reveal\');\\nvar observer=new IntersectionObserver(function(entries){\\n  entries.forEach(function(e){\\n    if(e.isIntersecting){e.target.classList.add(\'visible\');observer.unobserve(e.target)}\\n  });\\n},{threshold:0.12});\\nrevealEls.forEach(function(el){observer.observe(el)});\\n\\nwindow.addEventListener(\'scroll\',function(){\\n  var nav=document.getElementById(\'navbar\');\\n  if(window.scrollY>60){nav.classList.add(\'scrolled\')}else{nav.classList.remove(\'scrolled\')}\\n});\\n</script>\\n</body>\\n</html>\\n\"}', 1, '2026-05-24 05:17:51', '2026-05-24 05:25:35', NULL, NULL);
INSERT INTO `page_contents` VALUES (19, 'home_landing_mockup', 'page', 'Landing Asfar Tour', 'Konten landing baru untuk halaman /landing.', '{\"faq\": {\"title\": \"Pertanyaan yang Sering Ditanyakan\", \"description\": \"Temukan jawaban atas pertanyaan jamaah kami.\"}, \"hero\": {\"image\": \"/images/dummy.jpg\", \"label\": \"Hajj & Umrah Terpercaya\", \"title\": \"Perjalanan\\nMenuju\\nTanah Suci\\nImpian Anda\", \"cta_label\": \"Konsultasi Gratis\", \"description\": \"Bersama Asfar Tour, setiap langkah ibadah Anda kami jaga dengan sepenuh hati. Didampingi mutawif berpengalaman, fasilitas premium, dan layanan tulus.\", \"feature_cards\": [{\"icon\": \"hotel\", \"title\": \"Hotel Premium Pilihan\", \"description\": \"Dekat Masjidil Haram & Nabawi\"}, {\"icon\": \"plane\", \"title\": \"Penerbangan Direct\", \"description\": \"Jakarta - Madinah Non-stop\"}, {\"icon\": \"images\", \"title\": \"Free Dokumentasi\", \"description\": \"Kenangan ibadah Anda abadi\"}], \"secondary_cta_href\": \"/paket-umroh\", \"secondary_cta_label\": \"Lihat Paket\"}, \"about\": {\"cta\": \"Baca Selengkapnya\", \"label\": \"Tentang Kami\", \"title\": \"Pelayanan Umroh yang Tertata dan Menenangkan\", \"description\": \"Kami mengelola keberangkatan umroh dengan alur yang jelas, pendampingan ibadah, dan komunikasi yang transparan.\", \"image_primary\": \"/images/dummy.jpg\", \"image_secondary\": \"/images/dummy.jpg\"}, \"stats\": [{\"label\": \"Jamaah Diberangkatkan\", \"value\": \"500+\"}, {\"label\": \"Tahun Pengalaman\", \"value\": \"10+\"}, {\"label\": \"Rating Jamaah\", \"value\": \"4.9\"}, {\"label\": \"Program Terlaksana\", \"value\": \"50+\"}], \"footer\": {\"brand\": \"ASFAR TOUR\", \"subtitle\": \"Hajj & Umrah\", \"copyright\": \"(c) 2025 Asfar Tour - Terdaftar Kemenag RI\"}, \"contact\": {\"label\": \"Kontak Cepat\", \"title\": \"Siap berangkat? Konsultasi gratis dulu.\", \"description\": \"Konsultasikan kebutuhan ibadah Anda bersama tim kami. Gratis, tanpa syarat, tanpa tekanan.\", \"banner_image\": \"/images/dummy.jpg\", \"banner_title\": \"Siap Melangkah ke\\nTanah Suci?\", \"address_label\": \"Alamat\", \"banner_kicker\": \"Mulai Perjalanan Anda\", \"contact_label\": \"Lihat Kontak Lengkap\", \"secondary_href\": \"/paket-umroh\", \"whatsapp_label\": \"Chat Admin WhatsApp Sekarang\", \"secondary_label\": \"Lihat Paket\", \"contact_info_label\": \"Kontak\", \"navbar_whatsapp_label\": \"Chat Admin\"}, \"gallery\": {\"title\": \"Galeri Perjalanan\", \"images\": [], \"cta_label\": \"OUR HISTORY\", \"description\": \"Momen-momen berharga selama perjalanan jamaah.\"}, \"problem\": {\"label\": \"PENTING DIKETAHUI\", \"quote\": \"Kami memahami kekhawatiran itu. Karena itu, kami hadir dengan sistem yang jelas dan transparan.\", \"badges\": [\"Biaya tiba-tiba berubah di tengah jalan\", \"Minimnya informasi & komunikasi\", \"Jadwal keberangkatan tidak jelas\", \"Takut tertipu travel yang tidak amanah\"], \"heading\": \"Banyak Jamaah Gagal Berangkat Bukan Karena Niat, Tapi Karena Salah Pilih Travel\"}, \"articles\": {\"label\": \"Artikel\", \"heading\": \"News & Update Terbaru\", \"cta_label\": \"Lihat Semua Artikel\", \"empty_title\": \"Belum ada artikel yang tampil.\", \"read_more_label\": \"Baca selengkapnya\", \"empty_description\": \"Pastikan artikel sudah berstatus Terbit dan tanggal publikasinya tidak di masa depan.\", \"fallback_item_title_prefix\": \"Artikel\"}, \"packages\": {\"title\": \"Pilihan Paket\", \"heading\": \"Paket Umrah Kami\", \"cta_label\": \"Lihat Paket\", \"description\": \"Pilih paket yang sesuai dengan kebutuhan dan budget perjalanan ibadah Anda.\", \"detail_label\": \"Tanya Paket Ini\", \"price_prefix\": \"Mulai\", \"fallback_name\": \"Paket Umroh\", \"duration_suffix\": \"Hari\", \"fallback_summary\": \"Detail paket akan tampil di sini.\", \"discount_badge_label\": \"UNGGULAN\", \"selected_package_ids\": []}, \"services\": {\"items\": [{\"icon\": \"heart-handshake\", \"title\": \"Mutawif Berpengalaman\", \"image_path\": \"/images/dummy.jpg\", \"description\": \"Didampingi pembimbing ibadah profesional yang hafal rute, doa, dan ritual di Tanah Suci.\"}, {\"icon\": \"plane\", \"title\": \"Penerbangan Direct\", \"image_path\": \"/images/dummy.jpg\", \"description\": \"Penerbangan langsung tanpa transit untuk kenyamanan dan efisiensi waktu jamaah.\"}, {\"icon\": \"images\", \"title\": \"Free Dokumentasi\", \"image_path\": \"/images/dummy.jpg\", \"description\": \"Setiap momen berharga ibadah Anda diabadikan secara profesional sebagai kenangan seumur hidup.\"}, {\"icon\": \"shield-check\", \"title\": \"Legal & Amanah\", \"image_path\": \"/images/dummy.jpg\", \"description\": \"Terdaftar resmi di Kemenag RI. Kepercayaan jamaah adalah prioritas utama kami.\"}], \"label\": \"Layanan Kami\", \"title\": \"Mengapa Asfar Tour\", \"heading\": \"Ibadah Lebih Bermakna\\nBersama Kami\", \"description\": \"Kami tidak sekadar memberangkatkan - kami memastikan setiap momen ibadah Anda berjalan sempurna.\", \"heading_top\": \"Ibadah Lebih\", \"heading_bottom\": \"Bersama Kami\", \"highlight_word\": \"Bermakna\", \"heading_highlight\": \"Bermakna\", \"fallback_description\": \"Deskripsi layanan akan tampil di sini.\", \"fallback_title_prefix\": \"Layanan\"}, \"timeline\": {\"label\": \"Alur Perjalanan yang Kami Jalankan\", \"steps\": [{\"icon\": \"users\", \"title\": \"Registrasi\", \"caption\": \"DAFTAR & KONSULTASI\", \"description\": \"Konsultasi & pilih paket yang sesuai.\"}, {\"icon\": \"credit-card\", \"title\": \"Pembayaran\", \"caption\": \"DP / PELUNASAN\", \"description\": \"Skema biaya jelas, konfirmasi transparan.\"}, {\"icon\": \"check-circle-2\", \"title\": \"Persiapan Umroh\", \"caption\": \"MANASIK & DOKUMEN\", \"description\": \"Manasik, perlengkapan, dan dokumen.\"}, {\"icon\": \"plane\", \"title\": \"Keberangkatan\", \"caption\": \"BERANGKAT BARENG\", \"description\": \"Briefing & pendampingan sebelum berangkat.\"}, {\"icon\": \"landmark\", \"title\": \"Ibadah\", \"caption\": \"BIMBINGAN IBADAH\", \"description\": \"Bimbingan ibadah sepanjang perjalanan.\"}, {\"icon\": \"calendar-days\", \"title\": \"Kepulangan\", \"caption\": \"PULANG AMAN\", \"description\": \"Kontrol perjalanan sampai tiba di tanah air.\"}], \"heading\": \"Sistem Perjalanan yang Jelas, Bukan Sekadar Janji\", \"value_cards\": [{\"icon\": \"shield-check\", \"title\": \"Transparansi Biaya\", \"description\": \"Rincian biaya jelas sejak awal, tanpa kejutan di tengah jalan.\"}, {\"icon\": \"calendar-days\", \"title\": \"Timeline Terencana\", \"description\": \"Jadwal terstruktur dari pendaftaran sampai kepulangan.\"}, {\"icon\": \"heart-handshake\", \"title\": \"Pendampingan Ibadah\", \"description\": \"Pembimbing berpengalaman memastikan ibadah lebih tenang dan khusyuk.\"}, {\"icon\": \"check-circle-2\", \"title\": \"Sistem Terstruktur\", \"description\": \"Proses administrasi, keberangkatan, dan pelayanan berjalan rapi.\"}]}, \"testimonials\": {\"title\": \"Testimoni Jamaah\", \"heading\": \"Mereka Sudah Merasakan\", \"next_label\": \"Berikutnya\", \"prev_label\": \"Sebelumnya\", \"description\": \"Kepercayaan jamaah adalah kebanggaan terbesar Asfar Tour.\", \"fallback_quote\": \"Kepercayaan jamaah adalah kebanggaan terbesar Asfar Tour.\", \"featured_label\": \"UNGGULAN\"}}', 1, '2026-05-24 08:23:40', '2026-05-30 16:53:30', NULL, 1);

-- ----------------------------
-- Table structure for password_reset_tokens
-- ----------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens`  (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of password_reset_tokens
-- ----------------------------

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `permissions_name_guard_name_unique`(`name` ASC, `guard_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 233 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of permissions
-- ----------------------------
INSERT INTO `permissions` VALUES (1, 'menu.booking_register.view', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (2, 'menu.booking_register.create', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (3, 'menu.booking_register.edit', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (4, 'menu.booking_register.delete', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (5, 'menu.booking_register.import', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (6, 'menu.booking_register.export', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (7, 'menu.booking_register.approve', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (8, 'menu.booking_register.reject', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (9, 'menu.booking_listing.view', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (10, 'menu.booking_listing.create', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (11, 'menu.booking_listing.edit', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (12, 'menu.booking_listing.delete', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (13, 'menu.booking_listing.import', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (14, 'menu.booking_listing.export', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (15, 'menu.booking_listing.approve', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (16, 'menu.booking_listing.reject', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (17, 'menu.financial_report.view', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (18, 'menu.financial_report.create', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (19, 'menu.financial_report.edit', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (20, 'menu.financial_report.delete', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (21, 'menu.financial_report.import', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (22, 'menu.financial_report.export', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (23, 'menu.financial_report.approve', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (24, 'menu.financial_report.reject', 'web', '2026-05-06 03:03:58', '2026-05-06 03:03:58');
INSERT INTO `permissions` VALUES (25, 'menu.dashboard.view', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (26, 'menu.dashboard.create', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (27, 'menu.dashboard.edit', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (28, 'menu.dashboard.delete', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (29, 'menu.dashboard.import', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (30, 'menu.dashboard.export', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (31, 'menu.dashboard.approve', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (32, 'menu.dashboard.reject', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (33, 'menu.landing_page.view', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (34, 'menu.landing_page.create', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (35, 'menu.landing_page.edit', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (36, 'menu.landing_page.delete', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (37, 'menu.landing_page.import', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (38, 'menu.landing_page.export', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (39, 'menu.landing_page.approve', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (40, 'menu.landing_page.reject', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (41, 'menu.articles_management.view', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (42, 'menu.articles_management.create', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (43, 'menu.articles_management.edit', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (44, 'menu.articles_management.delete', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (45, 'menu.articles_management.import', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (46, 'menu.articles_management.export', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (47, 'menu.articles_management.approve', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (48, 'menu.articles_management.reject', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (49, 'menu.portal_content.view', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (50, 'menu.portal_content.create', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (51, 'menu.portal_content.edit', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (52, 'menu.portal_content.delete', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (53, 'menu.portal_content.import', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (54, 'menu.portal_content.export', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (55, 'menu.portal_content.approve', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (56, 'menu.portal_content.reject', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (57, 'menu.content_management.view', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (58, 'menu.content_management.create', 'web', '2026-05-06 03:03:59', '2026-05-06 03:03:59');
INSERT INTO `permissions` VALUES (59, 'menu.content_management.edit', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (60, 'menu.content_management.delete', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (61, 'menu.content_management.import', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (62, 'menu.content_management.export', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (63, 'menu.content_management.approve', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (64, 'menu.content_management.reject', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (65, 'menu.gallery_management.view', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (66, 'menu.gallery_management.create', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (67, 'menu.gallery_management.edit', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (68, 'menu.gallery_management.delete', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (69, 'menu.gallery_management.import', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (70, 'menu.gallery_management.export', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (71, 'menu.gallery_management.approve', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (72, 'menu.gallery_management.reject', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (73, 'menu.seo_settings.view', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (74, 'menu.seo_settings.create', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (75, 'menu.seo_settings.edit', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (76, 'menu.seo_settings.delete', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (77, 'menu.seo_settings.import', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (78, 'menu.seo_settings.export', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (79, 'menu.seo_settings.approve', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (80, 'menu.seo_settings.reject', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (81, 'menu.branding.view', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (82, 'menu.branding.create', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (83, 'menu.branding.edit', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (84, 'menu.branding.delete', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (85, 'menu.branding.import', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (86, 'menu.branding.export', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (87, 'menu.branding.approve', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (88, 'menu.branding.reject', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (89, 'menu.product_category.view', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (90, 'menu.product_category.create', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (91, 'menu.product_category.edit', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (92, 'menu.product_category.delete', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (93, 'menu.product_category.import', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (94, 'menu.product_category.export', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (95, 'menu.product_category.approve', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (96, 'menu.product_category.reject', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (97, 'menu.product.view', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (98, 'menu.product.create', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (99, 'menu.product.edit', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (100, 'menu.product.delete', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (101, 'menu.product.import', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (102, 'menu.product.export', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (103, 'menu.product.approve', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (104, 'menu.product.reject', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (105, 'menu.package.view', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (106, 'menu.package.create', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (107, 'menu.package.edit', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (108, 'menu.package.delete', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (109, 'menu.package.import', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (110, 'menu.package.export', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (111, 'menu.package.approve', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (112, 'menu.package.reject', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (113, 'menu.activity.view', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (114, 'menu.activity.create', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (115, 'menu.activity.edit', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (116, 'menu.activity.delete', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (117, 'menu.activity.import', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (118, 'menu.activity.export', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (119, 'menu.activity.approve', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (120, 'menu.activity.reject', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (121, 'menu.booking_custom_requests.view', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (122, 'menu.booking_custom_requests.create', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (123, 'menu.booking_custom_requests.edit', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (124, 'menu.booking_custom_requests.delete', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (125, 'menu.booking_custom_requests.import', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (126, 'menu.booking_custom_requests.export', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (127, 'menu.booking_custom_requests.approve', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (128, 'menu.booking_custom_requests.reject', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (129, 'menu.menu_management.view', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (130, 'menu.menu_management.create', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (131, 'menu.menu_management.edit', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (132, 'menu.menu_management.delete', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (133, 'menu.menu_management.import', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (134, 'menu.menu_management.export', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (135, 'menu.menu_management.approve', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (136, 'menu.menu_management.reject', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (137, 'menu.user_management.view', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (138, 'menu.user_management.create', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (139, 'menu.user_management.edit', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (140, 'menu.user_management.delete', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (141, 'menu.user_management.import', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (142, 'menu.user_management.export', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (143, 'menu.user_management.approve', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (144, 'menu.user_management.reject', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (145, 'menu.role_management.view', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (146, 'menu.role_management.create', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (147, 'menu.role_management.edit', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (148, 'menu.role_management.delete', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (149, 'menu.role_management.import', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (150, 'menu.role_management.export', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (151, 'menu.role_management.approve', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (152, 'menu.role_management.reject', 'web', '2026-05-06 03:04:00', '2026-05-06 03:04:00');
INSERT INTO `permissions` VALUES (153, 'menu.inventory.view', 'web', '2026-05-23 07:38:14', '2026-05-23 07:38:14');
INSERT INTO `permissions` VALUES (154, 'menu.inventory.create', 'web', '2026-05-23 07:38:14', '2026-05-23 07:38:14');
INSERT INTO `permissions` VALUES (155, 'menu.inventory.edit', 'web', '2026-05-23 07:38:14', '2026-05-23 07:38:14');
INSERT INTO `permissions` VALUES (156, 'menu.inventory.delete', 'web', '2026-05-23 07:38:14', '2026-05-23 07:38:14');
INSERT INTO `permissions` VALUES (157, 'menu.inventory.import', 'web', '2026-05-23 07:38:14', '2026-05-23 07:38:14');
INSERT INTO `permissions` VALUES (158, 'menu.inventory.export', 'web', '2026-05-23 07:38:14', '2026-05-23 07:38:14');
INSERT INTO `permissions` VALUES (159, 'menu.inventory.approve', 'web', '2026-05-23 07:38:14', '2026-05-23 07:38:14');
INSERT INTO `permissions` VALUES (160, 'menu.inventory.reject', 'web', '2026-05-23 07:38:14', '2026-05-23 07:38:14');
INSERT INTO `permissions` VALUES (161, 'menu.activity_log.view', 'web', '2026-05-26 07:58:51', '2026-05-26 07:58:51');
INSERT INTO `permissions` VALUES (162, 'menu.activity_log.create', 'web', '2026-05-26 07:58:51', '2026-05-26 07:58:51');
INSERT INTO `permissions` VALUES (163, 'menu.activity_log.edit', 'web', '2026-05-26 07:58:51', '2026-05-26 07:58:51');
INSERT INTO `permissions` VALUES (164, 'menu.activity_log.delete', 'web', '2026-05-26 07:58:51', '2026-05-26 07:58:51');
INSERT INTO `permissions` VALUES (165, 'menu.activity_log.import', 'web', '2026-05-26 07:58:51', '2026-05-26 07:58:51');
INSERT INTO `permissions` VALUES (166, 'menu.activity_log.export', 'web', '2026-05-26 07:58:51', '2026-05-26 07:58:51');
INSERT INTO `permissions` VALUES (167, 'menu.activity_log.approve', 'web', '2026-05-26 07:58:51', '2026-05-26 07:58:51');
INSERT INTO `permissions` VALUES (168, 'menu.activity_log.reject', 'web', '2026-05-26 07:58:51', '2026-05-26 07:58:51');
INSERT INTO `permissions` VALUES (169, 'menu.cashflow.view', 'web', '2026-05-26 17:53:06', '2026-05-26 17:53:06');
INSERT INTO `permissions` VALUES (170, 'menu.cashflow.create', 'web', '2026-05-26 17:53:06', '2026-05-26 17:53:06');
INSERT INTO `permissions` VALUES (171, 'menu.cashflow.edit', 'web', '2026-05-26 17:53:06', '2026-05-26 17:53:06');
INSERT INTO `permissions` VALUES (172, 'menu.cashflow.delete', 'web', '2026-05-26 17:53:06', '2026-05-26 17:53:06');
INSERT INTO `permissions` VALUES (173, 'menu.cashflow.import', 'web', '2026-05-26 17:53:06', '2026-05-26 17:53:06');
INSERT INTO `permissions` VALUES (174, 'menu.cashflow.export', 'web', '2026-05-26 17:53:06', '2026-05-26 17:53:06');
INSERT INTO `permissions` VALUES (175, 'menu.cashflow.approve', 'web', '2026-05-26 17:53:06', '2026-05-26 17:53:06');
INSERT INTO `permissions` VALUES (176, 'menu.cashflow.reject', 'web', '2026-05-26 17:53:06', '2026-05-26 17:53:06');
INSERT INTO `permissions` VALUES (177, 'menu.hotel.view', 'web', '2026-05-28 06:11:47', '2026-05-28 06:11:47');
INSERT INTO `permissions` VALUES (178, 'menu.hotel.create', 'web', '2026-05-28 06:11:47', '2026-05-28 06:11:47');
INSERT INTO `permissions` VALUES (179, 'menu.hotel.edit', 'web', '2026-05-28 06:11:47', '2026-05-28 06:11:47');
INSERT INTO `permissions` VALUES (180, 'menu.hotel.delete', 'web', '2026-05-28 06:11:47', '2026-05-28 06:11:47');
INSERT INTO `permissions` VALUES (181, 'menu.hotel.import', 'web', '2026-05-28 06:11:47', '2026-05-28 06:11:47');
INSERT INTO `permissions` VALUES (182, 'menu.hotel.export', 'web', '2026-05-28 06:11:47', '2026-05-28 06:11:47');
INSERT INTO `permissions` VALUES (183, 'menu.hotel.approve', 'web', '2026-05-28 06:11:47', '2026-05-28 06:11:47');
INSERT INTO `permissions` VALUES (184, 'menu.hotel.reject', 'web', '2026-05-28 06:11:47', '2026-05-28 06:11:47');
INSERT INTO `permissions` VALUES (185, 'menu.hotel_country.view', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (186, 'menu.hotel_country.create', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (187, 'menu.hotel_country.edit', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (188, 'menu.hotel_country.delete', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (189, 'menu.hotel_country.import', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (190, 'menu.hotel_country.export', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (191, 'menu.hotel_country.approve', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (192, 'menu.hotel_country.reject', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (193, 'menu.hotel_city.view', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (194, 'menu.hotel_city.create', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (195, 'menu.hotel_city.edit', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (196, 'menu.hotel_city.delete', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (197, 'menu.hotel_city.import', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (198, 'menu.hotel_city.export', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (199, 'menu.hotel_city.approve', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (200, 'menu.hotel_city.reject', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (201, 'menu.hotel_room_type.view', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (202, 'menu.hotel_room_type.create', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (203, 'menu.hotel_room_type.edit', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (204, 'menu.hotel_room_type.delete', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (205, 'menu.hotel_room_type.import', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (206, 'menu.hotel_room_type.export', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (207, 'menu.hotel_room_type.approve', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (208, 'menu.hotel_room_type.reject', 'web', '2026-05-28 06:58:47', '2026-05-28 06:58:47');
INSERT INTO `permissions` VALUES (209, 'menu.booking_hotel_assignment.view', 'web', '2026-05-29 13:18:43', '2026-05-29 13:18:43');
INSERT INTO `permissions` VALUES (210, 'menu.booking_hotel_assignment.create', 'web', '2026-05-29 13:18:43', '2026-05-29 13:18:43');
INSERT INTO `permissions` VALUES (211, 'menu.booking_hotel_assignment.edit', 'web', '2026-05-29 13:18:43', '2026-05-29 13:18:43');
INSERT INTO `permissions` VALUES (212, 'menu.booking_hotel_assignment.delete', 'web', '2026-05-29 13:18:43', '2026-05-29 13:18:43');
INSERT INTO `permissions` VALUES (213, 'menu.booking_hotel_assignment.import', 'web', '2026-05-29 13:18:43', '2026-05-29 13:18:43');
INSERT INTO `permissions` VALUES (214, 'menu.booking_hotel_assignment.export', 'web', '2026-05-29 13:18:43', '2026-05-29 13:18:43');
INSERT INTO `permissions` VALUES (215, 'menu.booking_hotel_assignment.approve', 'web', '2026-05-29 13:18:43', '2026-05-29 13:18:43');
INSERT INTO `permissions` VALUES (216, 'menu.booking_hotel_assignment.reject', 'web', '2026-05-29 13:18:43', '2026-05-29 13:18:43');
INSERT INTO `permissions` VALUES (217, 'menu.hpp_package.view', 'web', '2026-05-29 14:16:55', '2026-05-29 14:16:55');
INSERT INTO `permissions` VALUES (218, 'menu.hpp_package.create', 'web', '2026-05-29 14:16:55', '2026-05-29 14:16:55');
INSERT INTO `permissions` VALUES (219, 'menu.hpp_package.edit', 'web', '2026-05-29 14:16:55', '2026-05-29 14:16:55');
INSERT INTO `permissions` VALUES (220, 'menu.hpp_package.delete', 'web', '2026-05-29 14:16:55', '2026-05-29 14:16:55');
INSERT INTO `permissions` VALUES (221, 'menu.hpp_package.export', 'web', '2026-05-29 14:16:55', '2026-05-29 14:16:55');
INSERT INTO `permissions` VALUES (222, 'menu.hpp_package.import', 'web', '2026-05-29 15:06:16', '2026-05-29 15:06:16');
INSERT INTO `permissions` VALUES (223, 'menu.hpp_package.approve', 'web', '2026-05-29 15:06:16', '2026-05-29 15:06:16');
INSERT INTO `permissions` VALUES (224, 'menu.hpp_package.reject', 'web', '2026-05-29 15:06:16', '2026-05-29 15:06:16');
INSERT INTO `permissions` VALUES (225, 'menu.master_currency.view', 'web', '2026-05-30 01:17:45', '2026-05-30 01:17:45');
INSERT INTO `permissions` VALUES (226, 'menu.master_currency.create', 'web', '2026-05-30 01:17:45', '2026-05-30 01:17:45');
INSERT INTO `permissions` VALUES (227, 'menu.master_currency.edit', 'web', '2026-05-30 01:17:45', '2026-05-30 01:17:45');
INSERT INTO `permissions` VALUES (228, 'menu.master_currency.delete', 'web', '2026-05-30 01:17:45', '2026-05-30 01:17:45');
INSERT INTO `permissions` VALUES (229, 'menu.master_currency.import', 'web', '2026-05-30 01:17:45', '2026-05-30 01:17:45');
INSERT INTO `permissions` VALUES (230, 'menu.master_currency.export', 'web', '2026-05-30 01:17:45', '2026-05-30 01:17:45');
INSERT INTO `permissions` VALUES (231, 'menu.master_currency.approve', 'web', '2026-05-30 01:17:45', '2026-05-30 01:17:45');
INSERT INTO `permissions` VALUES (232, 'menu.master_currency.reject', 'web', '2026-05-30 01:17:45', '2026-05-30 01:17:45');

-- ----------------------------
-- Table structure for product_categories
-- ----------------------------
DROP TABLE IF EXISTS `product_categories`;
CREATE TABLE `product_categories`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `product_categories_key_unique`(`key` ASC) USING BTREE,
  INDEX `product_categories_sort_order_is_active_index`(`sort_order` ASC, `is_active` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_categories
-- ----------------------------
INSERT INTO `product_categories` VALUES (5, 'perlengkapan', 'Perlengkapan', NULL, 4, 1, '2026-05-06 03:04:04', '2026-05-28 16:50:05');
INSERT INTO `product_categories` VALUES (6, 'hotel', 'Hotel', NULL, 1, 1, '2026-05-28 06:10:54', '2026-05-28 16:50:04');
INSERT INTO `product_categories` VALUES (7, 'tiket', 'Tiket', NULL, 2, 1, '2026-05-28 16:50:04', '2026-05-28 16:50:05');
INSERT INTO `product_categories` VALUES (9, 'merchandise', 'Merchandise', NULL, 3, 1, '2026-05-28 16:50:04', '2026-05-28 16:50:05');

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `content` json NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `products_code_unique`(`code` ASC) USING BTREE,
  UNIQUE INDEX `products_slug_unique`(`slug` ASC) USING BTREE,
  INDEX `products_product_type_is_active_index`(`product_type` ASC, `is_active` ASC) USING BTREE,
  INDEX `products_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `products_updated_by_index`(`updated_by` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 85 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, 'PRD-VISA', 'visa-umroh', 'Visa Umroh', 'perlengkapan', 'Pengurusan visa resmi Kerajaan Arab Saudi.', '{\"unit\": \"per jamaah\", \"price\": 3500000, \"currency\": \"IDR\"}', 1, '2026-05-06 03:04:04', '2026-05-28 16:57:41', NULL, NULL);
INSERT INTO `products` VALUES (2, 'PRD-PASPOR', 'pengurusan-paspor', 'Pengurusan Paspor', 'perlengkapan', 'Bantuan pengurusan paspor baru atau perpanjangan.', '{\"unit\": \"per jamaah\", \"price\": 1200000, \"currency\": \"IDR\"}', 1, '2026-05-06 03:04:04', '2026-05-28 16:57:41', NULL, NULL);
INSERT INTO `products` VALUES (3, 'PRD-TIKET-GA', 'tiket-garuda', 'Tiket Garuda Indonesia', 'tiket', 'Tiket penerbangan PP dengan Garuda Indonesia.', '{\"unit\": \"round trip\", \"price\": 18500000, \"currency\": \"IDR\"}', 1, '2026-05-06 03:04:04', '2026-05-28 16:57:41', NULL, NULL);
INSERT INTO `products` VALUES (4, 'PRD-TIKET-SV', 'tiket-saudia', 'Tiket Saudia Airlines', 'tiket', 'Tiket penerbangan PP dengan Saudia Airlines.', '{\"unit\": \"round trip\", \"price\": 16900000, \"currency\": \"IDR\"}', 1, '2026-05-06 03:04:04', '2026-05-28 16:57:41', NULL, NULL);
INSERT INTO `products` VALUES (5, 'PRD-BUS', 'transportasi-bus', 'Bus Selama Perjalanan', 'tiket', 'Transportasi bus AC selama di tanah suci.', '{\"unit\": \"per paket\", \"price\": 4500000, \"currency\": \"IDR\"}', 1, '2026-05-06 03:04:04', '2026-05-28 16:57:41', NULL, NULL);
INSERT INTO `products` VALUES (6, 'PRD-HOTEL-3', 'hotel-bintang-3', 'Hotel Bintang 3', 'hotel', 'Akomodasi hotel bintang 3 di Makkah dan Madinah.', '{\"unit\": \"per kamar quad\"}', 1, '2026-05-06 03:04:04', '2026-05-28 16:50:05', NULL, NULL);
INSERT INTO `products` VALUES (9, 'PRD-MANASIK', 'manasik-pembimbing', 'Manasik & Pembimbing', 'perlengkapan', 'Manasik sebelum berangkat dan pendampingan ustadz selama ibadah.', '{\"unit\": \"per paket\", \"price\": 1750000, \"currency\": \"IDR\"}', 1, '2026-05-06 03:04:04', '2026-05-28 16:57:41', NULL, NULL);
INSERT INTO `products` VALUES (10, 'PRD-MAKAN', 'konsumsi-katering', 'Konsumsi & Katering', 'perlengkapan', 'Makan 3x sehari dengan menu Indonesia selama di tanah suci.', '{\"unit\": \"per jamaah\", \"price\": 3200000, \"currency\": \"IDR\"}', 1, '2026-05-06 03:04:04', '2026-05-28 16:57:41', NULL, NULL);
INSERT INTO `products` VALUES (11, 'PRD-HANDLING', 'handling-bandara', 'Handling Bandara', 'perlengkapan', 'Pendampingan check-in, bagasi, dan grouping jamaah di bandara.', '{\"unit\": \"per keberangkatan\", \"price\": 1250000, \"currency\": \"IDR\"}', 1, '2026-05-06 03:04:04', '2026-05-28 16:57:41', NULL, NULL);
INSERT INTO `products` VALUES (12, 'PRD-CITYTOUR', 'city-tour-ziarah', 'City Tour & Ziarah', 'perlengkapan', 'Program ziarah dan kunjungan lokasi penting di Makkah dan Madinah.', '{\"unit\": \"per paket\", \"price\": 2400000, \"currency\": \"IDR\"}', 1, '2026-05-06 03:04:04', '2026-05-28 16:57:41', NULL, NULL);
INSERT INTO `products` VALUES (13, 'PRD-PERLENGKAPAN', 'perlengkapan-umroh', 'Perlengkapan Umroh', 'merchandise', 'Koper, kain ihram, buku panduan, dan tas jamaah.', '{\"unit\": \"per jamaah\", \"price\": 950000, \"currency\": \"IDR\"}', 1, '2026-05-06 03:04:04', '2026-05-28 16:57:41', NULL, NULL);
INSERT INTO `products` VALUES (46, 'HTL-MOVENPICK-HAJAR', 'movenpick-hajar-mekkah', 'Movenpick Hajar', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 1050, \"room_type\": \"DBL\", \"period_end\": \"2026-08-30\", \"period_start\": \"2026-06-16\"}, {\"price\": 1275, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-30\", \"period_start\": \"2026-06-16\"}, {\"price\": 1500, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-30\", \"period_start\": \"2026-06-16\"}, {\"price\": 1100, \"room_type\": \"DBL\", \"period_end\": \"2026-10-11\", \"period_start\": \"2026-08-31\"}, {\"price\": 1325, \"room_type\": \"TRPL\", \"period_end\": \"2026-10-11\", \"period_start\": \"2026-08-31\"}, {\"price\": 1550, \"room_type\": \"QUAD\", \"period_end\": \"2026-10-11\", \"period_start\": \"2026-08-31\"}, {\"price\": 1250, \"room_type\": \"DBL\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-10-12\"}, {\"price\": 1500, \"room_type\": \"TRPL\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-10-12\"}, {\"price\": 1750, \"room_type\": \"QUAD\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-10-12\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:34', '2026-05-28 17:24:34', NULL, NULL);
INSERT INTO `products` VALUES (47, 'HTL-AL-SAFWA-TOWER', 'al-safwa-tower-mekkah', 'Al Safwa Tower', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 925, \"room_type\": \"DBL\", \"period_end\": \"2026-07-08\", \"period_start\": \"2026-06-16\"}, {\"price\": 1125, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-08\", \"period_start\": \"2026-06-16\"}, {\"price\": 1325, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-08\", \"period_start\": \"2026-06-16\"}, {\"price\": 800, \"room_type\": \"DBL\", \"period_end\": \"2026-08-31\", \"period_start\": \"2026-07-09\"}, {\"price\": 1000, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-31\", \"period_start\": \"2026-07-09\"}, {\"price\": 1200, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-31\", \"period_start\": \"2026-07-09\"}, {\"price\": 850, \"room_type\": \"DBL\", \"period_end\": \"2026-10-11\", \"period_start\": \"2026-09-01\"}, {\"price\": 1050, \"room_type\": \"TRPL\", \"period_end\": \"2026-10-11\", \"period_start\": \"2026-09-01\"}, {\"price\": 1250, \"room_type\": \"QUAD\", \"period_end\": \"2026-10-11\", \"period_start\": \"2026-09-01\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `products` VALUES (48, 'HTL-AL-MARWA-ROTANA', 'al-marwa-rotana-mekkah', 'Al Marwa Rotana', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 1180, \"room_type\": \"DBL\", \"period_end\": \"2026-07-08\", \"period_start\": \"2026-06-16\"}, {\"price\": 1450, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-08\", \"period_start\": \"2026-06-16\"}, {\"price\": 1720, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-08\", \"period_start\": \"2026-06-16\"}, {\"price\": 1100, \"room_type\": \"DBL\", \"period_end\": \"2026-09-30\", \"period_start\": \"2026-07-09\"}, {\"price\": 1370, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-30\", \"period_start\": \"2026-07-09\"}, {\"price\": 1640, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-30\", \"period_start\": \"2026-07-09\"}, {\"price\": 1250, \"room_type\": \"DBL\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-10-01\"}, {\"price\": 1520, \"room_type\": \"TRPL\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-10-01\"}, {\"price\": 1790, \"room_type\": \"QUAD\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-10-01\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `products` VALUES (49, 'HTL-AZKA-AL-MAQAM', 'azka-al-maqam-mekkah', 'Azka Al Maqam', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 540, \"room_type\": \"DBL\", \"period_end\": \"2026-07-01\", \"period_start\": \"2026-06-20\"}, {\"price\": 610, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-01\", \"period_start\": \"2026-06-20\"}, {\"price\": 680, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-01\", \"period_start\": \"2026-06-20\"}, {\"price\": 590, \"room_type\": \"DBL\", \"period_end\": \"2026-08-01\", \"period_start\": \"2026-07-01\"}, {\"price\": 680, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-01\", \"period_start\": \"2026-07-01\"}, {\"price\": 770, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-01\", \"period_start\": \"2026-07-01\"}, {\"price\": 620, \"room_type\": \"DBL\", \"period_end\": \"2026-09-01\", \"period_start\": \"2026-08-01\"}, {\"price\": 720, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-01\", \"period_start\": \"2026-08-01\"}, {\"price\": 820, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-01\", \"period_start\": \"2026-08-01\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `products` VALUES (50, 'HTL-OLAYAN-AJYAD', 'olayan-ajyad-mekkah', 'Olayan Ajyad', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 580, \"room_type\": \"DBL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-16\"}, {\"price\": 680, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-16\"}, {\"price\": 780, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-16\"}, {\"price\": 660, \"room_type\": \"DBL\", \"period_end\": \"2026-10-04\", \"period_start\": \"2026-07-31\"}, {\"price\": 760, \"room_type\": \"TRPL\", \"period_end\": \"2026-10-04\", \"period_start\": \"2026-07-31\"}, {\"price\": 860, \"room_type\": \"QUAD\", \"period_end\": \"2026-10-04\", \"period_start\": \"2026-07-31\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `products` VALUES (51, 'HTL-SNOOD-AJYAD', 'snood-ajyad-mekkah', 'Snood Ajyad', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 380, \"room_type\": \"DBL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-16\"}, {\"price\": 425, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-16\"}, {\"price\": 470, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-16\"}, {\"price\": 430, \"room_type\": \"DBL\", \"period_end\": \"2026-10-04\", \"period_start\": \"2026-08-01\"}, {\"price\": 475, \"room_type\": \"TRPL\", \"period_end\": \"2026-10-04\", \"period_start\": \"2026-08-01\"}, {\"price\": 520, \"room_type\": \"QUAD\", \"period_end\": \"2026-10-04\", \"period_start\": \"2026-08-01\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `products` VALUES (52, 'HTL-SAWAED-AL-KHAIER', 'sawaed-al-khaier-mekkah', 'Sawaed Al Khaier', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 420, \"room_type\": \"DBL\", \"period_end\": \"2026-07-19\", \"period_start\": \"2026-06-16\"}, {\"price\": 465, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-19\", \"period_start\": \"2026-06-16\"}, {\"price\": 510, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-19\", \"period_start\": \"2026-06-16\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `products` VALUES (53, 'HTL-MAYSAN-AL-MAQAM', 'maysan-al-maqam-mekkah', 'Maysan Al Maqam', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 390, \"room_type\": \"DBL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-16\"}, {\"price\": 440, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-16\"}, {\"price\": 490, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-16\"}, {\"price\": 450, \"room_type\": \"DBL\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-08-01\"}, {\"price\": 500, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-08-01\"}, {\"price\": 550, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-08-01\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `products` VALUES (54, 'HTL-PRESTIGE-AJYAD', 'prestige-ajyad-mekkah', 'Prestige Ajyad', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 475, \"room_type\": \"DBL\", \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-16\"}, {\"price\": 550, \"room_type\": \"TRPL\", \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-16\"}, {\"price\": 625, \"room_type\": \"QUAD\", \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-16\"}, {\"price\": 500, \"room_type\": \"DBL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-07-01\"}, {\"price\": 575, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-07-01\"}, {\"price\": 650, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-07-01\"}, {\"price\": 625, \"room_type\": \"DBL\", \"period_end\": \"2026-10-04\", \"period_start\": \"2026-08-01\"}, {\"price\": 725, \"room_type\": \"TRPL\", \"period_end\": \"2026-10-04\", \"period_start\": \"2026-08-01\"}, {\"price\": 825, \"room_type\": \"QUAD\", \"period_end\": \"2026-10-04\", \"period_start\": \"2026-08-01\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `products` VALUES (55, 'HTL-WAHAT-AJYAD', 'wahat-ajyad-mekkah', 'Wahat Ajyad', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 290, \"room_type\": \"DBL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-16\"}, {\"price\": 330, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-16\"}, {\"price\": 370, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-16\"}, {\"price\": 310, \"room_type\": \"DBL\", \"period_end\": \"2026-10-04\", \"period_start\": \"2026-08-01\"}, {\"price\": 350, \"room_type\": \"TRPL\", \"period_end\": \"2026-10-04\", \"period_start\": \"2026-08-01\"}, {\"price\": 390, \"room_type\": \"QUAD\", \"period_end\": \"2026-10-04\", \"period_start\": \"2026-08-01\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `products` VALUES (56, 'HTL-NADA-AJYAD', 'nada-ajyad-mekkah', 'Nada Ajyad', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 520, \"room_type\": \"DBL\", \"period_end\": \"2026-07-15\", \"period_start\": \"2026-06-16\"}, {\"price\": 430, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-15\", \"period_start\": \"2026-06-16\"}, {\"price\": 480, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-15\", \"period_start\": \"2026-06-16\"}, {\"price\": 530, \"room_type\": \"DBL\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-07-15\"}, {\"price\": 420, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-07-15\"}, {\"price\": 470, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-07-15\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `products` VALUES (57, 'HTL-AL-MASSA-GRAND', 'al-massa-grand-mekkah', 'Al Massa Grand', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 470, \"room_type\": \"DBL\", \"period_end\": \"2026-07-15\", \"period_start\": \"2026-06-16\"}, {\"price\": 390, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-15\", \"period_start\": \"2026-06-16\"}, {\"price\": 440, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-15\", \"period_start\": \"2026-06-16\"}, {\"price\": 490, \"room_type\": \"DBL\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-07-15\"}, {\"price\": 370, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-07-15\"}, {\"price\": 420, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-07-15\"}, {\"price\": 575, \"room_type\": \"DBL\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-09-12\"}, {\"price\": 475, \"room_type\": \"TRPL\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-09-12\"}, {\"price\": 525, \"room_type\": \"QUAD\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-09-12\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `products` VALUES (58, 'HTL-AL-MASSA-DAR-FAYZE', 'al-massa-dar-fayzeen-mekkah', 'Al Massa Dar Fayzeen', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 370, \"room_type\": \"DBL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-30\"}, {\"price\": 310, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-30\"}, {\"price\": 350, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-30\"}, {\"price\": 390, \"room_type\": \"DBL\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-08-01\"}, {\"price\": 290, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-08-01\"}, {\"price\": 330, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-08-01\"}, {\"price\": 520, \"room_type\": \"DBL\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-09-12\"}, {\"price\": 420, \"room_type\": \"TRPL\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-09-12\"}, {\"price\": 470, \"room_type\": \"QUAD\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-09-12\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `products` VALUES (59, 'HTL-MAATHER-AL-JIWAAR', 'maather-al-jiwaar-mekkah', 'Maather Al Jiwaar', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 330, \"room_type\": \"DBL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-30\"}, {\"price\": 370, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-30\"}, {\"price\": 410, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-30\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:35', '2026-05-28 17:24:35', NULL, NULL);
INSERT INTO `products` VALUES (60, 'HTL-TARA-AL-HIJRA', 'tara-al-hijra-mekkah', 'Tara Al Hijra', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 260, \"room_type\": \"DBL\", \"period_end\": \"2026-07-15\", \"period_start\": \"2026-06-16\"}, {\"price\": 300, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-15\", \"period_start\": \"2026-06-16\"}, {\"price\": 340, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-15\", \"period_start\": \"2026-06-16\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `products` VALUES (61, 'HTL-BADR-AL-MASSA', 'badr-al-massa-mekkah', 'Badr Al Massa', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 285, \"room_type\": \"DBL\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-07-15\"}, {\"price\": 325, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-07-15\"}, {\"price\": 365, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-12\", \"period_start\": \"2026-07-15\"}, {\"price\": 300, \"room_type\": \"DBL\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-09-12\"}, {\"price\": 340, \"room_type\": \"TRPL\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-09-12\"}, {\"price\": 380, \"room_type\": \"QUAD\", \"period_end\": \"2026-12-16\", \"period_start\": \"2026-09-12\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `products` VALUES (62, 'HTL-SAIF-AL-YAMANI', 'saif-al-yamani-mekkah', 'Saif Al Yamani', 'hotel', NULL, '{\"city\": \"Mekkah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 170, \"room_type\": \"DBL\", \"period_end\": \"2026-08-01\", \"period_start\": \"2026-07-01\"}, {\"price\": 170, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-01\", \"period_start\": \"2026-07-01\"}, {\"price\": 170, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-01\", \"period_start\": \"2026-07-01\"}, {\"price\": 200, \"room_type\": \"DBL\", \"period_end\": \"2026-09-01\", \"period_start\": \"2026-08-01\"}, {\"price\": 200, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-01\", \"period_start\": \"2026-08-01\"}, {\"price\": 200, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-01\", \"period_start\": \"2026-08-01\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `products` VALUES (63, 'HTL-TAIBAH-FRONT', 'taibah-front-madinah', 'Taibah Front', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 700, \"room_type\": \"DBL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 825, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 950, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 750, \"room_type\": \"DBL\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}, {\"price\": 875, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}, {\"price\": 1000, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `products` VALUES (64, 'HTL-DAR-AL-EIMAN-AL-HA', 'dar-al-eiman-al-haram-madinah', 'Dar Al Eiman Al Haram', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 800, \"room_type\": \"DBL\", \"period_end\": \"2026-08-15\", \"period_start\": \"2026-06-30\"}, {\"price\": 925, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-15\", \"period_start\": \"2026-06-30\"}, {\"price\": 1050, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-15\", \"period_start\": \"2026-06-30\"}, {\"price\": 900, \"room_type\": \"DBL\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}, {\"price\": 1025, \"room_type\": \"TRPL\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}, {\"price\": 1150, \"room_type\": \"QUAD\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `products` VALUES (65, 'HTL-MILLINEUM-AL-AQEEQ', 'millineum-al-aqeeq-madinah', 'Millineum Al Aqeeq', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 750, \"room_type\": \"DBL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 875, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 1000, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 800, \"room_type\": \"DBL\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}, {\"price\": 925, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}, {\"price\": 1050, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}, {\"price\": 1100, \"room_type\": \"DBL\", \"period_end\": \"2026-12-10\", \"period_start\": \"2026-11-11\"}, {\"price\": 1225, \"room_type\": \"TRPL\", \"period_end\": \"2026-12-10\", \"period_start\": \"2026-11-11\"}, {\"price\": 1350, \"room_type\": \"QUAD\", \"period_end\": \"2026-12-10\", \"period_start\": \"2026-11-11\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `products` VALUES (66, 'HTL-RUVE', 'ruve-madinah', 'Ruve', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 700, \"room_type\": \"DBL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 825, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 950, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 725, \"room_type\": \"DBL\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}, {\"price\": 850, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}, {\"price\": 975, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `products` VALUES (67, 'HTL-GRAND-PLAZA', 'grand-plaza-madinah', 'Grand Plaza', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 500, \"room_type\": \"DBL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 570, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 640, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 525, \"room_type\": \"DBL\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}, {\"price\": 595, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}, {\"price\": 665, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `products` VALUES (68, 'HTL-AL-ANSAR-GOLDEN-TU', 'al-ansar-golden-tuilp-madinah', 'Al Ansar Golden Tuilp', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 490, \"room_type\": \"DBL\", \"period_end\": \"2026-08-01\", \"period_start\": \"2026-07-15\"}, {\"price\": 535, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-01\", \"period_start\": \"2026-07-15\"}, {\"price\": 580, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-01\", \"period_start\": \"2026-07-15\"}, {\"price\": 510, \"room_type\": \"DBL\", \"period_end\": \"2026-09-01\", \"period_start\": \"2026-08-01\"}, {\"price\": 555, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-01\", \"period_start\": \"2026-08-01\"}, {\"price\": 600, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-01\", \"period_start\": \"2026-08-01\"}, {\"price\": 530, \"room_type\": \"DBL\", \"period_end\": \"2026-10-01\", \"period_start\": \"2026-09-01\"}, {\"price\": 575, \"room_type\": \"TRPL\", \"period_end\": \"2026-10-01\", \"period_start\": \"2026-09-01\"}, {\"price\": 620, \"room_type\": \"QUAD\", \"period_end\": \"2026-10-01\", \"period_start\": \"2026-09-01\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `products` VALUES (69, 'HTL-JIWAR-AL-SAHA', 'jiwar-al-saha-madinah', 'Jiwar Al Saha', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 440, \"room_type\": \"DBL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-30\"}, {\"price\": 490, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-30\"}, {\"price\": 540, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-31\", \"period_start\": \"2026-06-30\"}, {\"price\": 430, \"room_type\": \"DBL\", \"period_end\": \"2026-09-01\", \"period_start\": \"2026-08-01\"}, {\"price\": 480, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-01\", \"period_start\": \"2026-08-01\"}, {\"price\": 530, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-01\", \"period_start\": \"2026-08-01\"}, {\"price\": 450, \"room_type\": \"DBL\", \"period_end\": \"2026-10-05\", \"period_start\": \"2026-09-01\"}, {\"price\": 500, \"room_type\": \"TRPL\", \"period_end\": \"2026-10-05\", \"period_start\": \"2026-09-01\"}, {\"price\": 550, \"room_type\": \"QUAD\", \"period_end\": \"2026-10-05\", \"period_start\": \"2026-09-01\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `products` VALUES (70, 'HTL-ZOWAR-INTERNATIONA', 'zowar-international-madinah', 'Zowar International', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 485, \"room_type\": \"DBL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 530, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 575, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 460, \"room_type\": \"DBL\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}, {\"price\": 505, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}, {\"price\": 550, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `products` VALUES (71, 'HTL-ODEST', 'odest-madinah', 'Odest', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 460, \"room_type\": \"DBL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 505, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 550, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 430, \"room_type\": \"DBL\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}, {\"price\": 475, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}, {\"price\": 520, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-20\", \"period_start\": \"2026-08-15\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `products` VALUES (72, 'HTL-DEYAR-AL-EIMAN', 'deyar-al-eiman-madinah', 'Deyar Al Eiman', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 525, \"room_type\": \"DBL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 575, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 625, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 475, \"room_type\": \"DBL\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}, {\"price\": 525, \"room_type\": \"TRPL\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}, {\"price\": 575, \"room_type\": \"QUAD\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}, {\"price\": 575, \"room_type\": \"DBL\", \"period_end\": \"2026-12-10\", \"period_start\": \"2026-11-11\"}, {\"price\": 625, \"room_type\": \"TRPL\", \"period_end\": \"2026-12-10\", \"period_start\": \"2026-11-11\"}, {\"price\": 675, \"room_type\": \"QUAD\", \"period_end\": \"2026-12-10\", \"period_start\": \"2026-11-11\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:36', '2026-05-28 17:24:36', NULL, NULL);
INSERT INTO `products` VALUES (73, 'HTL-DURRAT-EL-EIMAN', 'durrat-el-eiman-madinah', 'Durrat El Eiman', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 475, \"room_type\": \"DBL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 525, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 575, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 425, \"room_type\": \"DBL\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}, {\"price\": 475, \"room_type\": \"TRPL\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}, {\"price\": 525, \"room_type\": \"QUAD\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}, {\"price\": 525, \"room_type\": \"DBL\", \"period_end\": \"2026-12-10\", \"period_start\": \"2026-11-11\"}, {\"price\": 575, \"room_type\": \"TRPL\", \"period_end\": \"2026-12-10\", \"period_start\": \"2026-11-11\"}, {\"price\": 625, \"room_type\": \"QUAD\", \"period_end\": \"2026-12-10\", \"period_start\": \"2026-11-11\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `products` VALUES (74, 'HTL-GOLDEN-TULIP-ALSHA', 'golden-tulip-alshakereen-madinah', 'Golden Tulip Alshakereen', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 420, \"room_type\": \"DBL\", \"period_end\": \"2026-07-25\", \"period_start\": \"2026-06-20\"}, {\"price\": 465, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-25\", \"period_start\": \"2026-06-20\"}, {\"price\": 510, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-25\", \"period_start\": \"2026-06-20\"}, {\"price\": 390, \"room_type\": \"DBL\", \"period_end\": \"2026-08-23\", \"period_start\": \"2026-07-25\"}, {\"price\": 435, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-23\", \"period_start\": \"2026-07-25\"}, {\"price\": 480, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-23\", \"period_start\": \"2026-07-25\"}, {\"price\": 450, \"room_type\": \"DBL\", \"period_end\": \"2026-09-15\", \"period_start\": \"2026-08-23\"}, {\"price\": 495, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-15\", \"period_start\": \"2026-08-23\"}, {\"price\": 540, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-15\", \"period_start\": \"2026-08-23\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `products` VALUES (75, 'HTL-MANAZEL-AL-SAFIYAH', 'manazel-al-safiyah-madinah', 'Manazel Al Safiyah', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 410, \"room_type\": \"DBL\", \"period_end\": \"2026-07-25\", \"period_start\": \"2026-06-20\"}, {\"price\": 455, \"room_type\": \"TRPL\", \"period_end\": \"2026-07-25\", \"period_start\": \"2026-06-20\"}, {\"price\": 500, \"room_type\": \"QUAD\", \"period_end\": \"2026-07-25\", \"period_start\": \"2026-06-20\"}, {\"price\": 380, \"room_type\": \"DBL\", \"period_end\": \"2026-08-23\", \"period_start\": \"2026-07-25\"}, {\"price\": 425, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-23\", \"period_start\": \"2026-07-25\"}, {\"price\": 470, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-23\", \"period_start\": \"2026-07-25\"}, {\"price\": 440, \"room_type\": \"DBL\", \"period_end\": \"2026-09-15\", \"period_start\": \"2026-08-23\"}, {\"price\": 485, \"room_type\": \"TRPL\", \"period_end\": \"2026-09-15\", \"period_start\": \"2026-08-23\"}, {\"price\": 530, \"room_type\": \"QUAD\", \"period_end\": \"2026-09-15\", \"period_start\": \"2026-08-23\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `products` VALUES (76, 'HTL-AL-MOKHTARA-AL-GHA', 'al-mokhtara-al-gharbi-madinah', 'Al Mokhtara Al Gharbi', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 360, \"room_type\": \"DBL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 400, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 440, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 340, \"room_type\": \"DBL\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}, {\"price\": 380, \"room_type\": \"TRPL\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}, {\"price\": 420, \"room_type\": \"QUAD\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}, {\"price\": 420, \"room_type\": \"DBL\", \"period_end\": \"2026-12-10\", \"period_start\": \"2026-11-11\"}, {\"price\": 460, \"room_type\": \"TRPL\", \"period_end\": \"2026-12-10\", \"period_start\": \"2026-11-11\"}, {\"price\": 500, \"room_type\": \"QUAD\", \"period_end\": \"2026-12-10\", \"period_start\": \"2026-11-11\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `products` VALUES (77, 'HTL-NUSK-AL-EIMAN', 'nusk-al-eiman-madinah', 'Nusk Al Eiman', 'hotel', NULL, '{\"city\": \"Madinah\", \"country\": \"Arab Saudi\", \"pricing\": [{\"price\": 460, \"room_type\": \"DBL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 510, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 560, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-14\", \"period_start\": \"2026-06-30\"}, {\"price\": 370, \"room_type\": \"DBL\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}, {\"price\": 415, \"room_type\": \"TRPL\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}, {\"price\": 480, \"room_type\": \"QUAD\", \"period_end\": \"2026-11-11\", \"period_start\": \"2026-08-15\"}], \"currency\": \"IDR\"}', 1, '2026-05-28 17:24:37', '2026-05-28 17:24:37', NULL, NULL);
INSERT INTO `products` VALUES (78, 'HTL-TEST-HOTEL-2', 'test-hotel-2-test-kota', 'TEST HOTEL 2', 'hotel', NULL, '{\"city\": \"TEST KOTA\", \"country\": \"TEST NEGARA\", \"pricing\": [{\"price\": 500000, \"room_type\": \"DBL\", \"period_end\": \"2026-06-30\", \"period_start\": \"2026-05-01\"}, {\"price\": 600000, \"room_type\": \"TRPL\", \"period_end\": \"2026-06-30\", \"period_start\": \"2026-05-01\"}, {\"price\": 700000, \"room_type\": \"QUAD\", \"period_end\": \"2026-06-30\", \"period_start\": \"2026-05-01\"}, {\"price\": 600000, \"room_type\": \"DBL\", \"period_end\": \"2026-08-30\", \"period_start\": \"2026-07-01\"}, {\"price\": 700000, \"room_type\": \"TRPL\", \"period_end\": \"2026-08-30\", \"period_start\": \"2026-07-01\"}, {\"price\": 800000, \"room_type\": \"QUAD\", \"period_end\": \"2026-08-30\", \"period_start\": \"2026-07-01\"}], \"currency\": \"IDR\"}', 0, '2026-05-30 13:42:26', '2026-05-30 13:42:49', NULL, NULL);
INSERT INTO `products` VALUES (83, 'HTL-TEST-HOTEL-123', 'test-hotel-123-test-kota', 'test hotel 123', 'hotel', NULL, '{\"city\": \"TEST KOTA\", \"country\": \"TEST NEGARA\", \"pricing\": [{\"price\": 1, \"room_type\": \"DBL\", \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\"}, {\"price\": 2, \"room_type\": \"TRPL\", \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\"}, {\"price\": 3, \"room_type\": \"QUAD\", \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\"}, {\"price\": 2, \"room_type\": \"DBL\", \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\"}, {\"price\": 3, \"room_type\": \"TRPL\", \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\"}, {\"price\": 4, \"room_type\": \"QUAD\", \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\"}], \"currency\": \"IDR\"}', 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, NULL);
INSERT INTO `products` VALUES (84, 'HTL-TEST-HOTEL-1234', 'test-hotel-1234-test-kota', 'test hotel 1234', 'hotel', NULL, '{\"city\": \"TEST KOTA\", \"country\": \"TEST NEGARA\", \"pricing\": [{\"price\": 2, \"room_type\": \"DBL\", \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\"}, {\"price\": 3, \"room_type\": \"TRPL\", \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\"}, {\"price\": 4, \"room_type\": \"QUAD\", \"period_end\": \"2026-05-30\", \"period_start\": \"2026-05-01\"}, {\"price\": 3, \"room_type\": \"DBL\", \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\"}, {\"price\": 4, \"room_type\": \"TRPL\", \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\"}, {\"price\": 5, \"room_type\": \"QUAD\", \"period_end\": \"2026-06-30\", \"period_start\": \"2026-06-01\"}], \"currency\": \"IDR\"}', 1, '2026-05-30 15:30:30', '2026-05-30 15:30:30', NULL, NULL);

-- ----------------------------
-- Table structure for role_has_permissions
-- ----------------------------
DROP TABLE IF EXISTS `role_has_permissions`;
CREATE TABLE `role_has_permissions`  (
  `permission_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`permission_id`, `role_id`) USING BTREE,
  INDEX `role_has_permissions_role_id_foreign`(`role_id` ASC) USING BTREE,
  CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of role_has_permissions
-- ----------------------------
INSERT INTO `role_has_permissions` VALUES (1, 1);
INSERT INTO `role_has_permissions` VALUES (2, 1);
INSERT INTO `role_has_permissions` VALUES (3, 1);
INSERT INTO `role_has_permissions` VALUES (4, 1);
INSERT INTO `role_has_permissions` VALUES (5, 1);
INSERT INTO `role_has_permissions` VALUES (6, 1);
INSERT INTO `role_has_permissions` VALUES (7, 1);
INSERT INTO `role_has_permissions` VALUES (8, 1);
INSERT INTO `role_has_permissions` VALUES (9, 1);
INSERT INTO `role_has_permissions` VALUES (10, 1);
INSERT INTO `role_has_permissions` VALUES (11, 1);
INSERT INTO `role_has_permissions` VALUES (12, 1);
INSERT INTO `role_has_permissions` VALUES (13, 1);
INSERT INTO `role_has_permissions` VALUES (14, 1);
INSERT INTO `role_has_permissions` VALUES (15, 1);
INSERT INTO `role_has_permissions` VALUES (16, 1);
INSERT INTO `role_has_permissions` VALUES (17, 1);
INSERT INTO `role_has_permissions` VALUES (18, 1);
INSERT INTO `role_has_permissions` VALUES (19, 1);
INSERT INTO `role_has_permissions` VALUES (20, 1);
INSERT INTO `role_has_permissions` VALUES (21, 1);
INSERT INTO `role_has_permissions` VALUES (22, 1);
INSERT INTO `role_has_permissions` VALUES (23, 1);
INSERT INTO `role_has_permissions` VALUES (24, 1);
INSERT INTO `role_has_permissions` VALUES (25, 1);
INSERT INTO `role_has_permissions` VALUES (26, 1);
INSERT INTO `role_has_permissions` VALUES (27, 1);
INSERT INTO `role_has_permissions` VALUES (28, 1);
INSERT INTO `role_has_permissions` VALUES (29, 1);
INSERT INTO `role_has_permissions` VALUES (30, 1);
INSERT INTO `role_has_permissions` VALUES (31, 1);
INSERT INTO `role_has_permissions` VALUES (32, 1);
INSERT INTO `role_has_permissions` VALUES (33, 1);
INSERT INTO `role_has_permissions` VALUES (34, 1);
INSERT INTO `role_has_permissions` VALUES (35, 1);
INSERT INTO `role_has_permissions` VALUES (36, 1);
INSERT INTO `role_has_permissions` VALUES (37, 1);
INSERT INTO `role_has_permissions` VALUES (38, 1);
INSERT INTO `role_has_permissions` VALUES (39, 1);
INSERT INTO `role_has_permissions` VALUES (40, 1);
INSERT INTO `role_has_permissions` VALUES (41, 1);
INSERT INTO `role_has_permissions` VALUES (42, 1);
INSERT INTO `role_has_permissions` VALUES (43, 1);
INSERT INTO `role_has_permissions` VALUES (44, 1);
INSERT INTO `role_has_permissions` VALUES (45, 1);
INSERT INTO `role_has_permissions` VALUES (46, 1);
INSERT INTO `role_has_permissions` VALUES (47, 1);
INSERT INTO `role_has_permissions` VALUES (48, 1);
INSERT INTO `role_has_permissions` VALUES (49, 1);
INSERT INTO `role_has_permissions` VALUES (50, 1);
INSERT INTO `role_has_permissions` VALUES (51, 1);
INSERT INTO `role_has_permissions` VALUES (52, 1);
INSERT INTO `role_has_permissions` VALUES (53, 1);
INSERT INTO `role_has_permissions` VALUES (54, 1);
INSERT INTO `role_has_permissions` VALUES (55, 1);
INSERT INTO `role_has_permissions` VALUES (56, 1);
INSERT INTO `role_has_permissions` VALUES (65, 1);
INSERT INTO `role_has_permissions` VALUES (66, 1);
INSERT INTO `role_has_permissions` VALUES (67, 1);
INSERT INTO `role_has_permissions` VALUES (68, 1);
INSERT INTO `role_has_permissions` VALUES (69, 1);
INSERT INTO `role_has_permissions` VALUES (70, 1);
INSERT INTO `role_has_permissions` VALUES (71, 1);
INSERT INTO `role_has_permissions` VALUES (72, 1);
INSERT INTO `role_has_permissions` VALUES (73, 1);
INSERT INTO `role_has_permissions` VALUES (74, 1);
INSERT INTO `role_has_permissions` VALUES (75, 1);
INSERT INTO `role_has_permissions` VALUES (76, 1);
INSERT INTO `role_has_permissions` VALUES (77, 1);
INSERT INTO `role_has_permissions` VALUES (78, 1);
INSERT INTO `role_has_permissions` VALUES (79, 1);
INSERT INTO `role_has_permissions` VALUES (80, 1);
INSERT INTO `role_has_permissions` VALUES (81, 1);
INSERT INTO `role_has_permissions` VALUES (82, 1);
INSERT INTO `role_has_permissions` VALUES (83, 1);
INSERT INTO `role_has_permissions` VALUES (84, 1);
INSERT INTO `role_has_permissions` VALUES (85, 1);
INSERT INTO `role_has_permissions` VALUES (86, 1);
INSERT INTO `role_has_permissions` VALUES (87, 1);
INSERT INTO `role_has_permissions` VALUES (88, 1);
INSERT INTO `role_has_permissions` VALUES (89, 1);
INSERT INTO `role_has_permissions` VALUES (90, 1);
INSERT INTO `role_has_permissions` VALUES (91, 1);
INSERT INTO `role_has_permissions` VALUES (92, 1);
INSERT INTO `role_has_permissions` VALUES (93, 1);
INSERT INTO `role_has_permissions` VALUES (94, 1);
INSERT INTO `role_has_permissions` VALUES (95, 1);
INSERT INTO `role_has_permissions` VALUES (96, 1);
INSERT INTO `role_has_permissions` VALUES (97, 1);
INSERT INTO `role_has_permissions` VALUES (98, 1);
INSERT INTO `role_has_permissions` VALUES (99, 1);
INSERT INTO `role_has_permissions` VALUES (100, 1);
INSERT INTO `role_has_permissions` VALUES (101, 1);
INSERT INTO `role_has_permissions` VALUES (102, 1);
INSERT INTO `role_has_permissions` VALUES (103, 1);
INSERT INTO `role_has_permissions` VALUES (104, 1);
INSERT INTO `role_has_permissions` VALUES (105, 1);
INSERT INTO `role_has_permissions` VALUES (106, 1);
INSERT INTO `role_has_permissions` VALUES (107, 1);
INSERT INTO `role_has_permissions` VALUES (108, 1);
INSERT INTO `role_has_permissions` VALUES (109, 1);
INSERT INTO `role_has_permissions` VALUES (110, 1);
INSERT INTO `role_has_permissions` VALUES (111, 1);
INSERT INTO `role_has_permissions` VALUES (112, 1);
INSERT INTO `role_has_permissions` VALUES (113, 1);
INSERT INTO `role_has_permissions` VALUES (114, 1);
INSERT INTO `role_has_permissions` VALUES (115, 1);
INSERT INTO `role_has_permissions` VALUES (116, 1);
INSERT INTO `role_has_permissions` VALUES (117, 1);
INSERT INTO `role_has_permissions` VALUES (118, 1);
INSERT INTO `role_has_permissions` VALUES (119, 1);
INSERT INTO `role_has_permissions` VALUES (120, 1);
INSERT INTO `role_has_permissions` VALUES (121, 1);
INSERT INTO `role_has_permissions` VALUES (122, 1);
INSERT INTO `role_has_permissions` VALUES (123, 1);
INSERT INTO `role_has_permissions` VALUES (124, 1);
INSERT INTO `role_has_permissions` VALUES (125, 1);
INSERT INTO `role_has_permissions` VALUES (126, 1);
INSERT INTO `role_has_permissions` VALUES (127, 1);
INSERT INTO `role_has_permissions` VALUES (128, 1);
INSERT INTO `role_has_permissions` VALUES (129, 1);
INSERT INTO `role_has_permissions` VALUES (130, 1);
INSERT INTO `role_has_permissions` VALUES (131, 1);
INSERT INTO `role_has_permissions` VALUES (132, 1);
INSERT INTO `role_has_permissions` VALUES (133, 1);
INSERT INTO `role_has_permissions` VALUES (134, 1);
INSERT INTO `role_has_permissions` VALUES (135, 1);
INSERT INTO `role_has_permissions` VALUES (136, 1);
INSERT INTO `role_has_permissions` VALUES (137, 1);
INSERT INTO `role_has_permissions` VALUES (138, 1);
INSERT INTO `role_has_permissions` VALUES (139, 1);
INSERT INTO `role_has_permissions` VALUES (140, 1);
INSERT INTO `role_has_permissions` VALUES (141, 1);
INSERT INTO `role_has_permissions` VALUES (142, 1);
INSERT INTO `role_has_permissions` VALUES (143, 1);
INSERT INTO `role_has_permissions` VALUES (144, 1);
INSERT INTO `role_has_permissions` VALUES (145, 1);
INSERT INTO `role_has_permissions` VALUES (146, 1);
INSERT INTO `role_has_permissions` VALUES (147, 1);
INSERT INTO `role_has_permissions` VALUES (148, 1);
INSERT INTO `role_has_permissions` VALUES (149, 1);
INSERT INTO `role_has_permissions` VALUES (150, 1);
INSERT INTO `role_has_permissions` VALUES (151, 1);
INSERT INTO `role_has_permissions` VALUES (152, 1);
INSERT INTO `role_has_permissions` VALUES (153, 1);
INSERT INTO `role_has_permissions` VALUES (154, 1);
INSERT INTO `role_has_permissions` VALUES (155, 1);
INSERT INTO `role_has_permissions` VALUES (156, 1);
INSERT INTO `role_has_permissions` VALUES (157, 1);
INSERT INTO `role_has_permissions` VALUES (158, 1);
INSERT INTO `role_has_permissions` VALUES (159, 1);
INSERT INTO `role_has_permissions` VALUES (160, 1);
INSERT INTO `role_has_permissions` VALUES (161, 1);
INSERT INTO `role_has_permissions` VALUES (162, 1);
INSERT INTO `role_has_permissions` VALUES (163, 1);
INSERT INTO `role_has_permissions` VALUES (164, 1);
INSERT INTO `role_has_permissions` VALUES (165, 1);
INSERT INTO `role_has_permissions` VALUES (166, 1);
INSERT INTO `role_has_permissions` VALUES (167, 1);
INSERT INTO `role_has_permissions` VALUES (168, 1);
INSERT INTO `role_has_permissions` VALUES (169, 1);
INSERT INTO `role_has_permissions` VALUES (170, 1);
INSERT INTO `role_has_permissions` VALUES (171, 1);
INSERT INTO `role_has_permissions` VALUES (172, 1);
INSERT INTO `role_has_permissions` VALUES (173, 1);
INSERT INTO `role_has_permissions` VALUES (174, 1);
INSERT INTO `role_has_permissions` VALUES (175, 1);
INSERT INTO `role_has_permissions` VALUES (176, 1);
INSERT INTO `role_has_permissions` VALUES (177, 1);
INSERT INTO `role_has_permissions` VALUES (178, 1);
INSERT INTO `role_has_permissions` VALUES (179, 1);
INSERT INTO `role_has_permissions` VALUES (180, 1);
INSERT INTO `role_has_permissions` VALUES (181, 1);
INSERT INTO `role_has_permissions` VALUES (182, 1);
INSERT INTO `role_has_permissions` VALUES (183, 1);
INSERT INTO `role_has_permissions` VALUES (184, 1);
INSERT INTO `role_has_permissions` VALUES (185, 1);
INSERT INTO `role_has_permissions` VALUES (186, 1);
INSERT INTO `role_has_permissions` VALUES (187, 1);
INSERT INTO `role_has_permissions` VALUES (188, 1);
INSERT INTO `role_has_permissions` VALUES (189, 1);
INSERT INTO `role_has_permissions` VALUES (190, 1);
INSERT INTO `role_has_permissions` VALUES (191, 1);
INSERT INTO `role_has_permissions` VALUES (192, 1);
INSERT INTO `role_has_permissions` VALUES (193, 1);
INSERT INTO `role_has_permissions` VALUES (194, 1);
INSERT INTO `role_has_permissions` VALUES (195, 1);
INSERT INTO `role_has_permissions` VALUES (196, 1);
INSERT INTO `role_has_permissions` VALUES (197, 1);
INSERT INTO `role_has_permissions` VALUES (198, 1);
INSERT INTO `role_has_permissions` VALUES (199, 1);
INSERT INTO `role_has_permissions` VALUES (200, 1);
INSERT INTO `role_has_permissions` VALUES (201, 1);
INSERT INTO `role_has_permissions` VALUES (202, 1);
INSERT INTO `role_has_permissions` VALUES (203, 1);
INSERT INTO `role_has_permissions` VALUES (204, 1);
INSERT INTO `role_has_permissions` VALUES (205, 1);
INSERT INTO `role_has_permissions` VALUES (206, 1);
INSERT INTO `role_has_permissions` VALUES (207, 1);
INSERT INTO `role_has_permissions` VALUES (208, 1);
INSERT INTO `role_has_permissions` VALUES (209, 1);
INSERT INTO `role_has_permissions` VALUES (210, 1);
INSERT INTO `role_has_permissions` VALUES (211, 1);
INSERT INTO `role_has_permissions` VALUES (212, 1);
INSERT INTO `role_has_permissions` VALUES (213, 1);
INSERT INTO `role_has_permissions` VALUES (214, 1);
INSERT INTO `role_has_permissions` VALUES (215, 1);
INSERT INTO `role_has_permissions` VALUES (216, 1);
INSERT INTO `role_has_permissions` VALUES (217, 1);
INSERT INTO `role_has_permissions` VALUES (218, 1);
INSERT INTO `role_has_permissions` VALUES (219, 1);
INSERT INTO `role_has_permissions` VALUES (220, 1);
INSERT INTO `role_has_permissions` VALUES (221, 1);
INSERT INTO `role_has_permissions` VALUES (222, 1);
INSERT INTO `role_has_permissions` VALUES (223, 1);
INSERT INTO `role_has_permissions` VALUES (224, 1);
INSERT INTO `role_has_permissions` VALUES (1, 2);
INSERT INTO `role_has_permissions` VALUES (2, 2);
INSERT INTO `role_has_permissions` VALUES (3, 2);
INSERT INTO `role_has_permissions` VALUES (4, 2);
INSERT INTO `role_has_permissions` VALUES (5, 2);
INSERT INTO `role_has_permissions` VALUES (6, 2);
INSERT INTO `role_has_permissions` VALUES (7, 2);
INSERT INTO `role_has_permissions` VALUES (8, 2);
INSERT INTO `role_has_permissions` VALUES (9, 2);
INSERT INTO `role_has_permissions` VALUES (10, 2);
INSERT INTO `role_has_permissions` VALUES (11, 2);
INSERT INTO `role_has_permissions` VALUES (12, 2);
INSERT INTO `role_has_permissions` VALUES (13, 2);
INSERT INTO `role_has_permissions` VALUES (14, 2);
INSERT INTO `role_has_permissions` VALUES (15, 2);
INSERT INTO `role_has_permissions` VALUES (16, 2);
INSERT INTO `role_has_permissions` VALUES (17, 2);
INSERT INTO `role_has_permissions` VALUES (18, 2);
INSERT INTO `role_has_permissions` VALUES (19, 2);
INSERT INTO `role_has_permissions` VALUES (20, 2);
INSERT INTO `role_has_permissions` VALUES (21, 2);
INSERT INTO `role_has_permissions` VALUES (22, 2);
INSERT INTO `role_has_permissions` VALUES (23, 2);
INSERT INTO `role_has_permissions` VALUES (24, 2);
INSERT INTO `role_has_permissions` VALUES (25, 2);
INSERT INTO `role_has_permissions` VALUES (26, 2);
INSERT INTO `role_has_permissions` VALUES (27, 2);
INSERT INTO `role_has_permissions` VALUES (28, 2);
INSERT INTO `role_has_permissions` VALUES (29, 2);
INSERT INTO `role_has_permissions` VALUES (30, 2);
INSERT INTO `role_has_permissions` VALUES (31, 2);
INSERT INTO `role_has_permissions` VALUES (32, 2);
INSERT INTO `role_has_permissions` VALUES (33, 2);
INSERT INTO `role_has_permissions` VALUES (34, 2);
INSERT INTO `role_has_permissions` VALUES (35, 2);
INSERT INTO `role_has_permissions` VALUES (36, 2);
INSERT INTO `role_has_permissions` VALUES (37, 2);
INSERT INTO `role_has_permissions` VALUES (38, 2);
INSERT INTO `role_has_permissions` VALUES (39, 2);
INSERT INTO `role_has_permissions` VALUES (40, 2);
INSERT INTO `role_has_permissions` VALUES (41, 2);
INSERT INTO `role_has_permissions` VALUES (42, 2);
INSERT INTO `role_has_permissions` VALUES (43, 2);
INSERT INTO `role_has_permissions` VALUES (44, 2);
INSERT INTO `role_has_permissions` VALUES (45, 2);
INSERT INTO `role_has_permissions` VALUES (46, 2);
INSERT INTO `role_has_permissions` VALUES (47, 2);
INSERT INTO `role_has_permissions` VALUES (48, 2);
INSERT INTO `role_has_permissions` VALUES (49, 2);
INSERT INTO `role_has_permissions` VALUES (50, 2);
INSERT INTO `role_has_permissions` VALUES (51, 2);
INSERT INTO `role_has_permissions` VALUES (52, 2);
INSERT INTO `role_has_permissions` VALUES (53, 2);
INSERT INTO `role_has_permissions` VALUES (54, 2);
INSERT INTO `role_has_permissions` VALUES (55, 2);
INSERT INTO `role_has_permissions` VALUES (56, 2);
INSERT INTO `role_has_permissions` VALUES (65, 2);
INSERT INTO `role_has_permissions` VALUES (66, 2);
INSERT INTO `role_has_permissions` VALUES (67, 2);
INSERT INTO `role_has_permissions` VALUES (68, 2);
INSERT INTO `role_has_permissions` VALUES (69, 2);
INSERT INTO `role_has_permissions` VALUES (70, 2);
INSERT INTO `role_has_permissions` VALUES (71, 2);
INSERT INTO `role_has_permissions` VALUES (72, 2);
INSERT INTO `role_has_permissions` VALUES (73, 2);
INSERT INTO `role_has_permissions` VALUES (74, 2);
INSERT INTO `role_has_permissions` VALUES (75, 2);
INSERT INTO `role_has_permissions` VALUES (76, 2);
INSERT INTO `role_has_permissions` VALUES (77, 2);
INSERT INTO `role_has_permissions` VALUES (78, 2);
INSERT INTO `role_has_permissions` VALUES (79, 2);
INSERT INTO `role_has_permissions` VALUES (80, 2);
INSERT INTO `role_has_permissions` VALUES (81, 2);
INSERT INTO `role_has_permissions` VALUES (82, 2);
INSERT INTO `role_has_permissions` VALUES (83, 2);
INSERT INTO `role_has_permissions` VALUES (84, 2);
INSERT INTO `role_has_permissions` VALUES (85, 2);
INSERT INTO `role_has_permissions` VALUES (86, 2);
INSERT INTO `role_has_permissions` VALUES (87, 2);
INSERT INTO `role_has_permissions` VALUES (88, 2);
INSERT INTO `role_has_permissions` VALUES (89, 2);
INSERT INTO `role_has_permissions` VALUES (90, 2);
INSERT INTO `role_has_permissions` VALUES (91, 2);
INSERT INTO `role_has_permissions` VALUES (92, 2);
INSERT INTO `role_has_permissions` VALUES (93, 2);
INSERT INTO `role_has_permissions` VALUES (94, 2);
INSERT INTO `role_has_permissions` VALUES (95, 2);
INSERT INTO `role_has_permissions` VALUES (96, 2);
INSERT INTO `role_has_permissions` VALUES (97, 2);
INSERT INTO `role_has_permissions` VALUES (98, 2);
INSERT INTO `role_has_permissions` VALUES (99, 2);
INSERT INTO `role_has_permissions` VALUES (100, 2);
INSERT INTO `role_has_permissions` VALUES (101, 2);
INSERT INTO `role_has_permissions` VALUES (102, 2);
INSERT INTO `role_has_permissions` VALUES (103, 2);
INSERT INTO `role_has_permissions` VALUES (104, 2);
INSERT INTO `role_has_permissions` VALUES (105, 2);
INSERT INTO `role_has_permissions` VALUES (106, 2);
INSERT INTO `role_has_permissions` VALUES (107, 2);
INSERT INTO `role_has_permissions` VALUES (108, 2);
INSERT INTO `role_has_permissions` VALUES (109, 2);
INSERT INTO `role_has_permissions` VALUES (110, 2);
INSERT INTO `role_has_permissions` VALUES (111, 2);
INSERT INTO `role_has_permissions` VALUES (112, 2);
INSERT INTO `role_has_permissions` VALUES (113, 2);
INSERT INTO `role_has_permissions` VALUES (114, 2);
INSERT INTO `role_has_permissions` VALUES (115, 2);
INSERT INTO `role_has_permissions` VALUES (116, 2);
INSERT INTO `role_has_permissions` VALUES (117, 2);
INSERT INTO `role_has_permissions` VALUES (118, 2);
INSERT INTO `role_has_permissions` VALUES (119, 2);
INSERT INTO `role_has_permissions` VALUES (120, 2);
INSERT INTO `role_has_permissions` VALUES (121, 2);
INSERT INTO `role_has_permissions` VALUES (122, 2);
INSERT INTO `role_has_permissions` VALUES (123, 2);
INSERT INTO `role_has_permissions` VALUES (124, 2);
INSERT INTO `role_has_permissions` VALUES (125, 2);
INSERT INTO `role_has_permissions` VALUES (126, 2);
INSERT INTO `role_has_permissions` VALUES (127, 2);
INSERT INTO `role_has_permissions` VALUES (128, 2);
INSERT INTO `role_has_permissions` VALUES (129, 2);
INSERT INTO `role_has_permissions` VALUES (130, 2);
INSERT INTO `role_has_permissions` VALUES (131, 2);
INSERT INTO `role_has_permissions` VALUES (132, 2);
INSERT INTO `role_has_permissions` VALUES (133, 2);
INSERT INTO `role_has_permissions` VALUES (134, 2);
INSERT INTO `role_has_permissions` VALUES (135, 2);
INSERT INTO `role_has_permissions` VALUES (136, 2);
INSERT INTO `role_has_permissions` VALUES (137, 2);
INSERT INTO `role_has_permissions` VALUES (138, 2);
INSERT INTO `role_has_permissions` VALUES (139, 2);
INSERT INTO `role_has_permissions` VALUES (140, 2);
INSERT INTO `role_has_permissions` VALUES (141, 2);
INSERT INTO `role_has_permissions` VALUES (142, 2);
INSERT INTO `role_has_permissions` VALUES (143, 2);
INSERT INTO `role_has_permissions` VALUES (144, 2);
INSERT INTO `role_has_permissions` VALUES (145, 2);
INSERT INTO `role_has_permissions` VALUES (146, 2);
INSERT INTO `role_has_permissions` VALUES (147, 2);
INSERT INTO `role_has_permissions` VALUES (148, 2);
INSERT INTO `role_has_permissions` VALUES (149, 2);
INSERT INTO `role_has_permissions` VALUES (150, 2);
INSERT INTO `role_has_permissions` VALUES (151, 2);
INSERT INTO `role_has_permissions` VALUES (152, 2);
INSERT INTO `role_has_permissions` VALUES (153, 2);
INSERT INTO `role_has_permissions` VALUES (154, 2);
INSERT INTO `role_has_permissions` VALUES (155, 2);
INSERT INTO `role_has_permissions` VALUES (156, 2);
INSERT INTO `role_has_permissions` VALUES (157, 2);
INSERT INTO `role_has_permissions` VALUES (158, 2);
INSERT INTO `role_has_permissions` VALUES (159, 2);
INSERT INTO `role_has_permissions` VALUES (160, 2);
INSERT INTO `role_has_permissions` VALUES (161, 2);
INSERT INTO `role_has_permissions` VALUES (162, 2);
INSERT INTO `role_has_permissions` VALUES (163, 2);
INSERT INTO `role_has_permissions` VALUES (164, 2);
INSERT INTO `role_has_permissions` VALUES (165, 2);
INSERT INTO `role_has_permissions` VALUES (166, 2);
INSERT INTO `role_has_permissions` VALUES (167, 2);
INSERT INTO `role_has_permissions` VALUES (168, 2);
INSERT INTO `role_has_permissions` VALUES (169, 2);
INSERT INTO `role_has_permissions` VALUES (170, 2);
INSERT INTO `role_has_permissions` VALUES (171, 2);
INSERT INTO `role_has_permissions` VALUES (172, 2);
INSERT INTO `role_has_permissions` VALUES (173, 2);
INSERT INTO `role_has_permissions` VALUES (174, 2);
INSERT INTO `role_has_permissions` VALUES (175, 2);
INSERT INTO `role_has_permissions` VALUES (176, 2);
INSERT INTO `role_has_permissions` VALUES (177, 2);
INSERT INTO `role_has_permissions` VALUES (178, 2);
INSERT INTO `role_has_permissions` VALUES (179, 2);
INSERT INTO `role_has_permissions` VALUES (180, 2);
INSERT INTO `role_has_permissions` VALUES (181, 2);
INSERT INTO `role_has_permissions` VALUES (182, 2);
INSERT INTO `role_has_permissions` VALUES (183, 2);
INSERT INTO `role_has_permissions` VALUES (184, 2);
INSERT INTO `role_has_permissions` VALUES (185, 2);
INSERT INTO `role_has_permissions` VALUES (186, 2);
INSERT INTO `role_has_permissions` VALUES (187, 2);
INSERT INTO `role_has_permissions` VALUES (188, 2);
INSERT INTO `role_has_permissions` VALUES (189, 2);
INSERT INTO `role_has_permissions` VALUES (190, 2);
INSERT INTO `role_has_permissions` VALUES (191, 2);
INSERT INTO `role_has_permissions` VALUES (192, 2);
INSERT INTO `role_has_permissions` VALUES (193, 2);
INSERT INTO `role_has_permissions` VALUES (194, 2);
INSERT INTO `role_has_permissions` VALUES (195, 2);
INSERT INTO `role_has_permissions` VALUES (196, 2);
INSERT INTO `role_has_permissions` VALUES (197, 2);
INSERT INTO `role_has_permissions` VALUES (198, 2);
INSERT INTO `role_has_permissions` VALUES (199, 2);
INSERT INTO `role_has_permissions` VALUES (200, 2);
INSERT INTO `role_has_permissions` VALUES (201, 2);
INSERT INTO `role_has_permissions` VALUES (202, 2);
INSERT INTO `role_has_permissions` VALUES (203, 2);
INSERT INTO `role_has_permissions` VALUES (204, 2);
INSERT INTO `role_has_permissions` VALUES (205, 2);
INSERT INTO `role_has_permissions` VALUES (206, 2);
INSERT INTO `role_has_permissions` VALUES (207, 2);
INSERT INTO `role_has_permissions` VALUES (208, 2);
INSERT INTO `role_has_permissions` VALUES (209, 2);
INSERT INTO `role_has_permissions` VALUES (210, 2);
INSERT INTO `role_has_permissions` VALUES (211, 2);
INSERT INTO `role_has_permissions` VALUES (212, 2);
INSERT INTO `role_has_permissions` VALUES (213, 2);
INSERT INTO `role_has_permissions` VALUES (214, 2);
INSERT INTO `role_has_permissions` VALUES (215, 2);
INSERT INTO `role_has_permissions` VALUES (216, 2);
INSERT INTO `role_has_permissions` VALUES (217, 2);
INSERT INTO `role_has_permissions` VALUES (218, 2);
INSERT INTO `role_has_permissions` VALUES (219, 2);
INSERT INTO `role_has_permissions` VALUES (220, 2);
INSERT INTO `role_has_permissions` VALUES (221, 2);
INSERT INTO `role_has_permissions` VALUES (222, 2);
INSERT INTO `role_has_permissions` VALUES (223, 2);
INSERT INTO `role_has_permissions` VALUES (224, 2);
INSERT INTO `role_has_permissions` VALUES (25, 3);
INSERT INTO `role_has_permissions` VALUES (33, 3);
INSERT INTO `role_has_permissions` VALUES (35, 3);
INSERT INTO `role_has_permissions` VALUES (41, 3);
INSERT INTO `role_has_permissions` VALUES (42, 3);
INSERT INTO `role_has_permissions` VALUES (43, 3);
INSERT INTO `role_has_permissions` VALUES (44, 3);
INSERT INTO `role_has_permissions` VALUES (49, 3);
INSERT INTO `role_has_permissions` VALUES (51, 3);
INSERT INTO `role_has_permissions` VALUES (65, 3);
INSERT INTO `role_has_permissions` VALUES (66, 3);
INSERT INTO `role_has_permissions` VALUES (67, 3);
INSERT INTO `role_has_permissions` VALUES (1, 4);
INSERT INTO `role_has_permissions` VALUES (6, 4);
INSERT INTO `role_has_permissions` VALUES (7, 4);
INSERT INTO `role_has_permissions` VALUES (8, 4);
INSERT INTO `role_has_permissions` VALUES (9, 4);
INSERT INTO `role_has_permissions` VALUES (14, 4);
INSERT INTO `role_has_permissions` VALUES (25, 4);
INSERT INTO `role_has_permissions` VALUES (121, 4);
INSERT INTO `role_has_permissions` VALUES (127, 4);
INSERT INTO `role_has_permissions` VALUES (128, 4);
INSERT INTO `role_has_permissions` VALUES (161, 4);
INSERT INTO `role_has_permissions` VALUES (169, 4);
INSERT INTO `role_has_permissions` VALUES (170, 4);
INSERT INTO `role_has_permissions` VALUES (171, 4);
INSERT INTO `role_has_permissions` VALUES (172, 4);
INSERT INTO `role_has_permissions` VALUES (174, 4);
INSERT INTO `role_has_permissions` VALUES (209, 4);
INSERT INTO `role_has_permissions` VALUES (210, 4);
INSERT INTO `role_has_permissions` VALUES (211, 4);
INSERT INTO `role_has_permissions` VALUES (212, 4);
INSERT INTO `role_has_permissions` VALUES (217, 4);
INSERT INTO `role_has_permissions` VALUES (218, 4);
INSERT INTO `role_has_permissions` VALUES (219, 4);
INSERT INTO `role_has_permissions` VALUES (221, 4);

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `roles_name_guard_name_unique`(`name` ASC, `guard_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'Super Admin', 'web', '2026-05-06 03:04:01', '2026-05-06 03:04:01');
INSERT INTO `roles` VALUES (2, 'Operasional', 'web', '2026-05-06 03:04:01', '2026-05-06 03:04:01');
INSERT INTO `roles` VALUES (3, 'ContentEditor', 'web', '2026-05-06 03:04:01', '2026-05-06 03:04:01');
INSERT INTO `roles` VALUES (4, 'CS', 'web', '2026-05-06 03:04:01', '2026-05-06 03:04:01');
INSERT INTO `roles` VALUES (5, 'NoAccess', 'web', '2026-05-06 03:04:02', '2026-05-06 03:04:02');
INSERT INTO `roles` VALUES (6, 'staff', 'web', '2026-05-20 12:46:54', '2026-05-20 12:46:54');

-- ----------------------------
-- Table structure for services
-- ----------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `services_sort_order_is_active_index`(`sort_order` ASC, `is_active` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of services
-- ----------------------------
INSERT INTO `services` VALUES (1, 'Legalitas Terjamin', 'Travel berizin resmi dengan informasi keberangkatan yang jelas.', 1, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04');
INSERT INTO `services` VALUES (2, 'Pembimbing Profesional', 'Ustadz berpengalaman mendampingi jamaah sejak manasik hingga pulang.', 2, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04');
INSERT INTO `services` VALUES (3, 'Akomodasi Terbaik', 'Pilihan hotel nyaman yang menyesuaikan kelas paket.', 3, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04');
INSERT INTO `services` VALUES (4, 'Layanan Menyeluruh', 'Visa, tiket, manasik, perlengkapan, dan dokumen ditangani satu tim.', 4, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04');

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions`  (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED NULL DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `sessions_user_id_index`(`user_id` ASC) USING BTREE,
  INDEX `sessions_last_activity_index`(`last_activity` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sessions
-- ----------------------------
INSERT INTO `sessions` VALUES ('YoBjqSn6OItbiBbCSBNRttHZZx3ysVJzhSO0v4kY', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'YTo2OntzOjY6Il90b2tlbiI7czo0MDoiY1JBVnV4OHdrb0tiMzhUT0lLbEpUMVFIaWtrMFBvS01WNjU1M2w5OCI7czo5OiJhbmFseXRpY3MiO2E6Mjp7czo2OiJwdWJsaWMiO2E6MTp7czo3OiJ2aXNpdGVkIjthOjE6e3M6MTA6IjIwMjYtMDUtMzAiO2I6MTt9fXM6NzoibGFuZGluZyI7YToxOntzOjc6InZpc2l0ZWQiO2E6MTp7czoxMDoiMjAyNi0wNS0zMCI7YjoxO319fXM6OToiX3ByZXZpb3VzIjthOjI6e3M6MzoidXJsIjtzOjM1OiJodHRwOi8vdHJhdmVsLXByb3Bvc2FsLnRlc3QvbGFuZGluZyI7czo1OiJyb3V0ZSI7czoxNDoicHVibGljLmxhbmRpbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjM6InVybCI7YTowOnt9czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9', 1780160268);

-- ----------------------------
-- Table structure for team_members
-- ----------------------------
DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `team_members_sort_order_is_active_index`(`sort_order` ASC, `is_active` ASC) USING BTREE,
  INDEX `team_members_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `team_members_updated_by_index`(`updated_by` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of team_members
-- ----------------------------
INSERT INTO `team_members` VALUES (1, 'Direktur Operasional', 'Direktur Operasional', 'Mengawal operasional keberangkatan, hotel, dan kenyamanan jamaah.', '/images/dummy.jpg', 1, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `team_members` VALUES (2, 'Pembimbing Ibadah', 'Pembimbing Ibadah', 'Mendampingi manasik dan pelaksanaan ibadah selama perjalanan.', '/images/dummy.jpg', 2, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `team_members` VALUES (3, 'Customer Care', 'Customer Care', 'Menangani konsultasi, dokumen, dan tindak lanjut seat.', '/images/dummy.jpg', 3, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);

-- ----------------------------
-- Table structure for testimonials
-- ----------------------------
DROP TABLE IF EXISTS `testimonials`;
CREATE TABLE `testimonials`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_id` bigint UNSIGNED NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `origin_city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `package_id` bigint UNSIGNED NULL DEFAULT NULL,
  `departure_schedule_id` bigint UNSIGNED NULL DEFAULT NULL,
  `quote` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `photos` json NULL,
  `rating` tinyint UNSIGNED NOT NULL DEFAULT 5,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `testimonials_booking_id_unique`(`booking_id` ASC) USING BTREE,
  INDEX `testimonials_package_id_foreign`(`package_id` ASC) USING BTREE,
  INDEX `testimonials_is_featured_is_active_index`(`is_featured` ASC, `is_active` ASC) USING BTREE,
  INDEX `testimonials_departure_schedule_id_foreign`(`departure_schedule_id` ASC) USING BTREE,
  INDEX `testimonials_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `testimonials_updated_by_index`(`updated_by` ASC) USING BTREE,
  CONSTRAINT `testimonials_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `testimonials_departure_schedule_id_foreign` FOREIGN KEY (`departure_schedule_id`) REFERENCES `departure_schedules` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `testimonials_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of testimonials
-- ----------------------------
INSERT INTO `testimonials` VALUES (1, NULL, 'Bapak Hendra S.', 'Jakarta', NULL, NULL, 'Alhamdulillah, paket hemat tapi pelayanannya tidak murahan. Pembimbing sangat sabar dan hotel cukup nyaman.', NULL, 5, 1, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `testimonials` VALUES (2, NULL, 'Ibu Sari W.', 'Bekasi', NULL, NULL, 'Pertama kali umroh dan sangat terbantu dengan manasik yang lengkap. Harga terjangkau untuk kualitas ini.', NULL, 4, 0, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `testimonials` VALUES (3, NULL, 'Keluarga Pak Ridwan', 'Surabaya', NULL, NULL, 'Kami sekeluarga 4 orang sangat puas. Hotel dekat, pembimbing profesional, dan semua urusan dibantu tim Asfar.', NULL, 5, 1, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `testimonials` VALUES (4, NULL, 'Ibu Dewi R.', 'Malang', NULL, NULL, 'Sudah 2x umroh bersama Asfar dan selalu memuaskan. Paket reguler ini sangat worth it untuk harganya.', NULL, 5, 1, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `testimonials` VALUES (5, NULL, 'Bapak Fauzi A.', 'Sidoarjo', NULL, NULL, 'Pelayanan ramah dan responsif. Sedikit masukan untuk jadwal manasik yang bisa lebih fleksibel.', NULL, 4, 0, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `testimonials` VALUES (6, NULL, 'Bapak Drs. Santoso', 'Jakarta', NULL, NULL, 'Luar biasa. Hotel 5 bintang benar-benar walking distance ke Masjidil Haram. Ibadah jadi lebih khusyuk dan nyaman.', NULL, 5, 1, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `testimonials` VALUES (7, NULL, 'Ibu Prof. Aminah', 'Bandung', NULL, NULL, 'Paket premium yang benar-benar premium. Setiap detail diperhatikan, dari makanan hingga pembimbing senior yang berpengalaman.', NULL, 5, 1, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `testimonials` VALUES (8, NULL, 'Keluarga Ibu Nabila', 'Jakarta', NULL, NULL, 'Kami butuh perjalanan yang lebih private untuk orang tua, dan tim Asfar menyiapkan semuanya dengan sangat rapi.', NULL, 5, 1, 1, '2026-05-06 03:04:04', '2026-05-06 03:04:04', NULL, NULL);
INSERT INTO `testimonials` VALUES (9, NULL, 'Bapak Hendra S.', 'Jakarta', NULL, NULL, 'Paket basic-nya rapi, jelas, dan sangat membantu untuk jamaah pertama kali.', NULL, 5, 1, 1, '2026-05-28 17:33:42', '2026-05-28 17:33:42', NULL, NULL);
INSERT INTO `testimonials` VALUES (10, NULL, 'Keluarga Pak Ridwan', 'Surabaya', NULL, NULL, 'Paket regular paling pas untuk keluarga kami, layanan tim sangat responsif.', NULL, 5, 1, 1, '2026-05-28 17:33:42', '2026-05-28 17:33:42', NULL, NULL);
INSERT INTO `testimonials` VALUES (11, NULL, 'Ibu Prof. Aminah', 'Bandung', NULL, NULL, 'Pengalaman premium sangat terasa, dari hotel sampai pendampingan ibadah.', NULL, 5, 1, 1, '2026-05-28 17:33:42', '2026-05-28 17:33:42', NULL, NULL);
INSERT INTO `testimonials` VALUES (12, NULL, 'Bapak Hendra S.', 'Jakarta', 9, NULL, 'Paket basic-nya rapi, jelas, dan sangat membantu untuk jamaah pertama kali.', NULL, 5, 1, 1, '2026-05-29 01:37:40', '2026-05-29 01:37:40', NULL, NULL);
INSERT INTO `testimonials` VALUES (13, NULL, 'Keluarga Pak Ridwan', 'Surabaya', 10, NULL, 'Paket regular paling pas untuk keluarga kami, layanan tim sangat responsif.', NULL, 5, 1, 1, '2026-05-29 01:37:40', '2026-05-29 01:37:40', NULL, NULL);
INSERT INTO `testimonials` VALUES (14, NULL, 'Ibu Prof. Aminah', 'Bandung', 11, NULL, 'Pengalaman premium sangat terasa, dari hotel sampai pendampingan ibadah.', NULL, 5, 1, 1, '2026-05-29 01:37:40', '2026-05-29 01:37:40', NULL, NULL);

-- ----------------------------
-- Table structure for user_accesses
-- ----------------------------
DROP TABLE IF EXISTS `user_accesses`;
CREATE TABLE `user_accesses`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `access` json NOT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_accesses_user_id_unique`(`user_id` ASC) USING BTREE,
  INDEX `user_accesses_created_by_foreign`(`created_by` ASC) USING BTREE,
  INDEX `user_accesses_updated_by_foreign`(`updated_by` ASC) USING BTREE,
  INDEX `user_accesses_user_id_index`(`user_id` ASC) USING BTREE,
  CONSTRAINT `user_accesses_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `user_accesses_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `user_accesses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_accesses
-- ----------------------------

-- ----------------------------
-- Table structure for user_profiles
-- ----------------------------
DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE `user_profiles`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `gender` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `birth_place` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `birth_date` date NULL DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `photo_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_profiles_user_id_unique`(`user_id` ASC) USING BTREE,
  INDEX `user_profiles_created_by_index`(`created_by` ASC) USING BTREE,
  INDEX `user_profiles_updated_by_index`(`updated_by` ASC) USING BTREE,
  CONSTRAINT `user_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_profiles
-- ----------------------------
INSERT INTO `user_profiles` VALUES (1, 1, 'Administrator Asfar Tour', '08137892647', NULL, NULL, NULL, 'Casa pesanggrahan, 2 no B6, Jl. H. Sulaiman, Petukangan Utara, Kec. Pesanggrahan, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12260', NULL, '2026-05-06 03:04:03', '2026-05-06 03:04:03', NULL, NULL);
INSERT INTO `user_profiles` VALUES (2, 2, 'Tim Operasional Asfar Tour', '08137892647', NULL, NULL, NULL, 'Casa pesanggrahan, 2 no B6, Jl. H. Sulaiman, Petukangan Utara, Kec. Pesanggrahan, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12260', NULL, '2026-05-06 03:04:03', '2026-05-06 03:04:03', NULL, NULL);
INSERT INTO `user_profiles` VALUES (3, 3, 'Tim Marketing Asfar Tour', '08137892647', NULL, NULL, NULL, 'Casa pesanggrahan, 2 no B6, Jl. H. Sulaiman, Petukangan Utara, Kec. Pesanggrahan, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12260', NULL, '2026-05-06 03:04:03', '2026-05-06 03:04:03', NULL, NULL);
INSERT INTO `user_profiles` VALUES (4, 4, 'Admin Customer Care', '08137892647', NULL, NULL, NULL, 'Casa pesanggrahan, 2 no B6, Jl. H. Sulaiman, Petukangan Utara, Kec. Pesanggrahan, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12260', NULL, '2026-05-06 03:04:03', '2026-05-06 03:04:03', NULL, NULL);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `two_factor_secret` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `two_factor_recovery_codes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `users_email_unique`(`email` ASC) USING BTREE,
  UNIQUE INDEX `users_username_unique`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', 'Administrator', 'Administrator Asfar Tour', 'admin@asfartour.co.id', '2026-05-24 12:40:15', '$2y$12$ZwXyjiOTZrN6Xhf6bSU5y.xaTvTh.Jgw1W44kgY8yQZYZiO4wF6xC', NULL, NULL, NULL, NULL, '2026-05-06 03:04:03', '2026-05-24 12:40:18');
INSERT INTO `users` VALUES (2, 'operasional', 'Operasional', 'Tim Operasional Asfar Tour', 'operasional@asfartour.co.id', '2026-05-24 12:40:16', '$2y$12$P9C3e6.oISSV8HjDkC9T1OZs1aDG53x8K2Ujvqib/KT0CSfqZTMZ6', NULL, NULL, NULL, NULL, '2026-05-06 03:04:03', '2026-05-24 12:40:18');
INSERT INTO `users` VALUES (3, 'marketing', 'Marketing', 'Tim Marketing Asfar Tour', 'marketing@asfartour.co.id', '2026-05-24 12:40:16', '$2y$12$MV6o6DwKToGBdTEVt9.2ZONURIXbWCWum2bZhU0y/WkI99ptm/cPW', NULL, NULL, NULL, NULL, '2026-05-06 03:04:03', '2026-05-24 12:40:18');
INSERT INTO `users` VALUES (4, 'admincs', 'Customer Care', 'Admin Customer Care', 'cs@asfartour.co.id', '2026-05-24 12:40:17', '$2y$12$.XvEp9K1s/koeN2yR2cQFe2pP18FnXyvfSpzuOXY5khVL4XohwGme', NULL, NULL, NULL, NULL, '2026-05-06 03:04:03', '2026-05-24 12:40:18');
INSERT INTO `users` VALUES (5, NULL, 'Test Asrama', NULL, 'firosmalik.job@gmail.com', '2026-05-20 12:45:37', '$2y$12$WIEtQ1Rzw.up7rKUVVO9weGs6isCvZeDkTJ4aJXXXgBzhQc1rqARy', NULL, NULL, NULL, NULL, '2026-05-20 12:45:37', '2026-05-20 12:45:37');

SET FOREIGN_KEY_CHECKS = 1;
