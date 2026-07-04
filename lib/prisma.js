import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  return new PrismaClient();
}

function getPrismaClient() {
  const cached = globalThis.prisma;
  if (cached?.advisorSession) {
    return cached;
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = client;
  }

  return client;
}

export const db = getPrismaClient();
