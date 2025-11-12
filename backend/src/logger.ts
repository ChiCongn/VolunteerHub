import pino from 'pino';

const logger = pino({
    level: process.env.PINO_LOG_LEVEL || 'info',
    formatters: {
        level: (label: string) => ({ level: label.toUpperCase() }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});

// if (process.env.NODE_ENV === 'test') {
//     logger.level = 'silent';
// }

export default logger;
