-- CreateEnum
CREATE TYPE "FeedbackRating" AS ENUM ('HELPFUL', 'NOT_HELPFUL');

-- CreateTable
CREATE TABLE "advisor_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advisor_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advisor_feedback" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" "FeedbackRating" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advisor_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advisor_audit_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advisor_audit_events_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "advisor_messages" ADD COLUMN "sessionId" TEXT;

-- Backfill sessions for existing messages
INSERT INTO "advisor_sessions" ("id", "userId", "title", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "userId", 'Legacy conversation', MIN("createdAt"), MAX("createdAt")
FROM "advisor_messages"
GROUP BY "userId";

UPDATE "advisor_messages" m
SET "sessionId" = s."id"
FROM "advisor_sessions" s
WHERE m."userId" = s."userId" AND m."sessionId" IS NULL;

ALTER TABLE "advisor_messages" ALTER COLUMN "sessionId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "advisor_sessions_userId_idx" ON "advisor_sessions"("userId");
CREATE INDEX "advisor_messages_sessionId_idx" ON "advisor_messages"("sessionId");
CREATE UNIQUE INDEX "advisor_feedback_messageId_key" ON "advisor_feedback"("messageId");
CREATE INDEX "advisor_feedback_userId_idx" ON "advisor_feedback"("userId");
CREATE INDEX "advisor_audit_events_userId_idx" ON "advisor_audit_events"("userId");

-- AddForeignKey
ALTER TABLE "advisor_sessions" ADD CONSTRAINT "advisor_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "advisor_messages" ADD CONSTRAINT "advisor_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "advisor_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "advisor_feedback" ADD CONSTRAINT "advisor_feedback_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "advisor_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "advisor_feedback" ADD CONSTRAINT "advisor_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "advisor_audit_events" ADD CONSTRAINT "advisor_audit_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
