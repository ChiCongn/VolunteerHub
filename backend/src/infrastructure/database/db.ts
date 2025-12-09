import pool from './pool';

class Database {
    async query(text: string, params?: any[]) {
        const start = Date.now();
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Query executed:', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
        return res;
    }

    async getClient() {
        return await pool.connect();
    }
}

export default new Database();