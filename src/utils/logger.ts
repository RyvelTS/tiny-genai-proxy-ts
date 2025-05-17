enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

const C_RESET = '\x1b[0m';
const C_RED = '\x1b[31m';
const C_GREEN = '\x1b[32m';
const C_YELLOW = '\x1b[33m';
const C_BLUE = '\x1b[34m';

const getTimestamp = () => new Date().toISOString();

const log = (level: LogLevel, color: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'test' || level === LogLevel.ERROR) {
        console.log(`${color}[${level}]${C_RESET} ${getTimestamp()}:`, ...args);
    }
};

export const logger = {
    debug: (...args: any[]) => log(LogLevel.DEBUG, C_BLUE, ...args),
    info: (...args: any[]) => log(LogLevel.INFO, C_GREEN, ...args),
    warn: (...args: any[]) => log(LogLevel.WARN, C_YELLOW, ...args),
    error: (...args: any[]) => log(LogLevel.ERROR, C_RED, ...args),
};

export default logger;