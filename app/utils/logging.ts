class Logger {
  info(message: string, data?: Record<string, unknown>) {
    console.info({ level: "info", message, ...data });
  }

  warn(message: string, data?: Record<string, unknown>) {
    console.warn({ level: "warn", message, ...data });
  }

  error(message: string, data?: Record<string, unknown>) {
    console.error({ level: "error", message, ...data });
  }
}

export const logger = new Logger();
