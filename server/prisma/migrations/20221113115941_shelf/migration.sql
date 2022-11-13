/*
  Warnings:

  - You are about to alter the column `shelf` on the `books` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `books` MODIFY `shelf` INTEGER NULL;
