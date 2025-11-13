CREATE TABLE IF NOT EXISTS `groups` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_id` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_group_id` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `families` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_id` VARCHAR(32) NOT NULL,
  `family_name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_group` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `members` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_id` VARCHAR(32) NOT NULL,
  `family_id` INT UNSIGNED DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` ENUM('adult','child','staff','manager') NOT NULL,
  `weight` FLOAT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_group` (`group_id`),
  KEY `idx_family` (`family_id`),
  CONSTRAINT `fk_members_family` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_id` VARCHAR(32) NOT NULL,
  `payer_id` INT UNSIGNED NOT NULL,
  `amount` INT NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_group` (`group_id`),
  KEY `idx_payer` (`payer_id`),
  CONSTRAINT `fk_expenses_member` FOREIGN KEY (`payer_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `expense_weights` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `expense_id` INT UNSIGNED NOT NULL,
  `member_id` INT UNSIGNED NOT NULL,
  `weight` FLOAT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_expense` (`expense_id`),
  KEY `idx_member` (`member_id`),
  CONSTRAINT `fk_weight_expense` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_weight_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
