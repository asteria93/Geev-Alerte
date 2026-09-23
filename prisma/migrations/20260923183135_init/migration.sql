-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "categories" JSONB NOT NULL,
    "keywords" JSONB NOT NULL,
    "keywordMode" TEXT NOT NULL,
    "locationType" TEXT NOT NULL,
    "locationValue" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "radiusKm" INTEGER NOT NULL,
    "frequencyMinutes" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastCheckedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ListingSeen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceName" TEXT NOT NULL,
    "stableId" TEXT NOT NULL,
    "listingUrl" TEXT NOT NULL,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DetectedListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "stableId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT,
    "listingUrl" TEXT NOT NULL,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DetectedListing_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "discordWebhookUrl" TEXT,
    "webPushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "discordEnabled" BOOLEAN NOT NULL DEFAULT false,
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WebPushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WorkerState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "lastRunAt" DATETIME,
    "lastSuccessAt" DATETIME,
    "lastError" TEXT
);

-- CreateTable
CREATE TABLE "ExecutionLock" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "owner" TEXT,
    "lockedUntil" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MockListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stableId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT,
    "listingUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingSeen_sourceName_stableId_key" ON "ListingSeen"("sourceName", "stableId");

-- CreateIndex
CREATE INDEX "DetectedListing_alertId_idx" ON "DetectedListing"("alertId");

-- CreateIndex
CREATE INDEX "DetectedListing_detectedAt_idx" ON "DetectedListing"("detectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebPushSubscription_endpoint_key" ON "WebPushSubscription"("endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "MockListing_stableId_key" ON "MockListing"("stableId");
