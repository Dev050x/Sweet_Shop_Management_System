/*
  Warnings:

  - Added the required column `totalCost` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Purchase" ADD COLUMN     "totalCost" INTEGER NOT NULL;
