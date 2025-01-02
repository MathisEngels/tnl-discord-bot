import chalk from "chalk";
import winston from "winston";

const scopeColors = {
  MAIN: chalk.magenta,
  Sauroll: chalk.yellow,
  SaurollScheduler: chalk.cyan,
  Command: chalk.green,
  API: chalk.blue
};

const myFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const scope = (meta.scope as keyof typeof scopeColors) || "MAIN";
  const colorizeScope = scopeColors[scope];
  return `${timestamp} [${level}][${colorizeScope(scope)}]${meta.interactionId ? `(${chalk.grey(meta.interactionId)})` : ""}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format((info) => {
      info.level = info.level.toUpperCase();
      return info;
    })(),
    winston.format.colorize(),
    myFormat
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
