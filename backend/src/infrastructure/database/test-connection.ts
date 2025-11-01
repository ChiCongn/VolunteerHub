import db from './db';

async function testDB() {
    try {
        const res = await db.query('SELECT NOW() as now, version()');
        console.log('Neon DB Connected!');
        console.log('Time:', res.rows[0].now);
        console.log('Version:', res.rows[0].version.split(',')[0]);

        const users = await db.query('SELECT COUNT(*) as total FROM users');
        console.log('Total users:', users.rows[0].total);
    } catch (err: any) {
        console.error('Connection failed:', err.message);
    } finally {
        process.exit();
    }
}

testDB();