import "dotenv/config";
import { PrismaClient } from "./generated/client";
import logger from "../../logger";

const prisma = new PrismaClient();

async function testPrismaConnection() {
    try {
        logger.info("Testing database connection...");

        // Simple query to check connection
        const result = await prisma.$queryRawUnsafe(`SELECT 1 AS connected`);
        console.log("✅ Database connection is working:", result);

        // Optional: check list of schemas
        const schemas = await prisma.$queryRawUnsafe(
            `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
        );
        console.log("Tablename in DB:", schemas);

    } catch (error) {
        console.error("❌ Error connecting to database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

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

await testPrismaConnection();
testPrimsma();
