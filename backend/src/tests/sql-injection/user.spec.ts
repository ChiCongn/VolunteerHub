import { PrismaClient, Prisma } from "../../infrastructure/prisma/generated/client";
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import "dotenv/config";

const prisma = new PrismaClient();
const repo = new UserRepository(prisma);

export async function inject() {
    const count = await repo.count({ search: 'theresia ; DROP TABLE users;' });
    console.log("count: " + count);
}

inject();