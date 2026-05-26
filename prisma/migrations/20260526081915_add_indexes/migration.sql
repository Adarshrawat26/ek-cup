-- CreateIndex
CREATE INDEX "CreatorPost_creatorId_createdAt_idx" ON "CreatorPost"("creatorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Membership_creatorId_idx" ON "Membership"("creatorId");

-- CreateIndex
CREATE INDEX "ShopItem_creatorId_idx" ON "ShopItem"("creatorId");

-- CreateIndex
CREATE INDEX "Support_creatorId_createdAt_idx" ON "Support"("creatorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Transaction_creatorId_createdAt_idx" ON "Transaction"("creatorId", "createdAt" DESC);
