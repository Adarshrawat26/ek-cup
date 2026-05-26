-- CreateTable
CREATE TABLE "CreatorPayout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "upiId" TEXT,
    "accountHolder" TEXT,
    "accountNumber" TEXT,
    "ifsc" TEXT,
    "bankName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreatorPayout_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Creator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "instagramUrl" TEXT,
    "youtubeUrl" TEXT,
    "twitterUrl" TEXT,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "totalSupporters" INTEGER NOT NULL DEFAULT 0,
    "handle" TEXT NOT NULL,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Creator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Creator" ("avatarUrl", "bio", "createdAt", "handle", "id", "instagramUrl", "name", "tags", "totalEarned", "totalSupporters", "twitterUrl", "updatedAt", "userId", "username", "youtubeUrl") SELECT "avatarUrl", "bio", "createdAt", "handle", "id", "instagramUrl", "name", "tags", "totalEarned", "totalSupporters", "twitterUrl", "updatedAt", "userId", "username", "youtubeUrl" FROM "Creator";
DROP TABLE "Creator";
ALTER TABLE "new_Creator" RENAME TO "Creator";
CREATE UNIQUE INDEX "Creator_userId_key" ON "Creator"("userId");
CREATE UNIQUE INDEX "Creator_username_key" ON "Creator"("username");
CREATE UNIQUE INDEX "Creator_handle_key" ON "Creator"("handle");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CreatorPayout_creatorId_key" ON "CreatorPayout"("creatorId");
