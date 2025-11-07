import "dotenv/config";
import { PrismaClient } from "./generated/client";

const prisma = new PrismaClient();

async function testPrimsma() {
    try {
        //const users = await prisma.users.findMany();
        const users = await prisma.$queryRawUnsafe(
            `SELECT * FROM users
            WHERE id = '70cc9a01-9d4c-4d2a-a6a9-68b9888bf5ce'`
        );

        console.log("✅ Found users:", users);
    } catch (error) {
        console.error("❌ Error querying database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testPrimsma();
