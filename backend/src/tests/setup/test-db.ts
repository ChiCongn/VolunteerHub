import 'dotenv/config';
import { PrismaClient } from '../../infrastructure/prisma/generated/client';
import logger from '../../logger';
import { execSync } from 'child_process';
import path from 'path';

const prisma = new PrismaClient();
const DB_NAME = 'volunteerhub_test';
const DB_USER = 'chicongn';
const SNAPSHOT_PATH = 'src/tests/setup/events_snapshot.dump';

export async function resetDatabase(): Promise<void> {
    try {
        logger.info("reset database");
        // Get all tables in public schema except _prisma_migrations
        const tables = await prisma.$queryRaw<{ tablename: string }[]>`
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename != '_prisma_migrations';
        `;

        if (tables.length > 0) {
            const tableNames = tables.map((t: { tablename: string }) => `"${t.tablename}"`).join(', ');
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`);
        }

        console.log('✅ Database reset successfully.');
    } catch (error) {
        console.error('Failed to reset database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

export function restoreSnapshot() {
    try {
        console.log('Restoring database snapshot...');
        execSync(
            `pg_restore -h localhost -U ${DB_USER} -d ${DB_NAME} --clean --no-owner --no-acl "${SNAPSHOT_PATH}"`,
            { stdio: 'inherit', env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || '' } }
        );
        console.log('Database restored successfully!');
    } catch (err) {
        console.error('Failed to restore database snapshot:', err);
        throw err;
    }
}

//restoreSnapshot();
//resetDatabase();