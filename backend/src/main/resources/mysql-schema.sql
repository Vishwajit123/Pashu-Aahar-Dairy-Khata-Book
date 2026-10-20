-- ========================================================
-- Expense Tracker MySQL Schema
-- ========================================================

CREATE DATABASE IF NOT EXISTS `expense_tracker_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `expense_tracker_db`;

CREATE TABLE IF NOT EXISTS `expenses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `expense_name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) DEFAULT '',
    `amount` DECIMAL(12, 2) NOT NULL,
    `expense_date` DATE NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `mode_of_payment` VARCHAR(50) NOT NULL,
    INDEX `idx_expense_date` (`expense_date`),
    INDEX `idx_category` (`category`),
    INDEX `idx_payment_mode` (`mode_of_payment`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
