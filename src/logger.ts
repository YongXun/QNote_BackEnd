import winston from "winston";
import "winston-daily-rotate-file";


export function createLogger(logPath: string): winston.Logger {
  return winston.createLogger({
    level:  "silly",
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
      }),
      winston.format.json(),
      winston.format.prettyPrint()
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`)
        )
      }),
      new winston.transports.DailyRotateFile({
        filename:  `${logPath}/qnote-%DATE%-combined.log`,
        auditFile: `${logPath}/qnote-combined-audit.json`,
        maxFiles:  "14d",
        maxSize:   "32mb"
      }),
      new winston.transports.DailyRotateFile({
        filename:  `${logPath}/qnote-%DATE%-error.log`,
        auditFile: `${logPath}/qnote-error-audit.json`,
        level:     "error",
        maxFiles:  "14d",
        maxSize:   "32mb"
      })
    ]
  });
}