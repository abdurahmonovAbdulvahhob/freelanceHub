// const logger = require('../services/logger_sevice')


const errorHandler = (res,error) => {
  // logger.error(error)
  console.log(error);
  res.status(400).send({error: error.message})
}

module.exports = {
  errorHandler
}