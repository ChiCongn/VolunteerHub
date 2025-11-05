import 'dotenv/config';
import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function testPrimsma() {
    try {
        const users = await prisma.users.findMany();

        console.log('✅ Found users:', users);
    } catch (error) {
        console.error('❌ Error querying database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPrimsma();
