import pino from 'pino';
import 'dotenv/config';

const logger = pino({
    level: process.env.PINO_LOG_LEVEL || 'info',
    formatters: {
        level: (label: string) => ({ level: label.toUpperCase() }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});

if (!process.env.ENABLE_LOG) {
    logger.level = 'silent';
}

export default logger;
