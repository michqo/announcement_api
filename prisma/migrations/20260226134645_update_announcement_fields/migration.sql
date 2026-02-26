-- CreateEnum
CREATE TYPE "Category" AS ENUM ('CITY', 'COMMUNITY_EVENTS', 'CRIME_SAFETY', 'CULTURE', 'DISCOUNTS_BENEFITS', 'EMERGENCIES', 'FOR_SENIORS', 'HEALTH', 'KIDS_FAMILY');

-- CreateTable
CREATE TABLE "Announcement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdate" TIMESTAMP(3) NOT NULL,
    "categories" "Category"[],

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);
