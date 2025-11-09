import "dotenv/config";
import { PrismaClient } from "./generated/client";
import logger from "../../logger";

const prisma = new PrismaClient();

async function testPrimsma() {
    try {
        logger.info("something");
        //const users = await prisma.users.findMany();
        const users = await prisma.$queryRawUnsafe(
            `SELECT * FROM users`
        );

        console.log("✅ Found users:", users);
    } catch (error) {
        console.error("❌ Error querying database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testPrimsma();
