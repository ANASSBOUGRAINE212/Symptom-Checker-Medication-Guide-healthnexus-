-- DropIndex
DROP INDEX `users_email_key` ON `users`;

-- AlterTable
-- Step 1: Add new columns (passwordHash as nullable first)
ALTER TABLE `users` 
    ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `failedLoginAttempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `lastLoginAt` DATETIME(3) NULL,
    ADD COLUMN `lastLoginIp` VARCHAR(191) NULL,
    ADD COLUMN `lockedUntil` DATETIME(3) NULL,
    ADD COLUMN `passwordHash` VARCHAR(191) NULL,
    ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- Step 2: Set temporary password hash for existing users
UPDATE `users` 
SET `passwordHash` = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.oaZQJa'
WHERE `passwordHash` IS NULL;

-- Step 3: Make passwordHash required
ALTER TABLE `users` 
    MODIFY COLUMN `passwordHash` VARCHAR(191) NOT NULL;

-- Step 4: Add unique constraint back on email
CREATE UNIQUE INDEX `users_email_key` ON `users`(`email`);

-- DropTable
DROP TABLE `admins`;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `isRevoked` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `refresh_tokens_userId_idx`(`userId`),
    INDEX `refresh_tokens_token_idx`(`token`(255)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_token_key`(`token`),
    INDEX `password_reset_tokens_userId_idx`(`userId`),
    INDEX `password_reset_tokens_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_verification_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `email_verification_tokens_token_key`(`token`),
    INDEX `email_verification_tokens_userId_idx`(`userId`),
    INDEX `email_verification_tokens_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_verification_tokens` ADD CONSTRAINT `email_verification_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
