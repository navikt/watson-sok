class Logger {
  info(message: string, data?: Record<string, unknown>) {
    console.info(JSON.stringify({ level: "info", message, ...data }));
  }

  warn(message: string, data?: Record<string, unknown>) {
    console.warn(JSON.stringify({ level: "warn", message, ...data }));
  }

  error(message: string, data?: Record<string, unknown>) {
    console.error(JSON.stringify({ level: "error", message, ...data }));
  }
}

export const logger = new Logger();
