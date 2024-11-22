const winston = require("winston");
const expressWinston = require("express-winston");


const expressWinstonErrorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      filename: "log/errors.log",
      level: "error",
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  format: winston.format.combine(
    winston.format.prettyPrint()
  ),
});



module.exports = {
  expressWinstonErrorLogger,
};
