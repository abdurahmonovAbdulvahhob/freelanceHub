const express = require("express");
const config = require("config");
const cookieParser = require("cookie-parser");
const sequelize = require('./config/db');


const mainRouter = require("./routes/index.routes");
const { expressWinstonErrorLogger } = require("./middleware/winston_middleware");
const error_handling_middleware = require("./middleware/error_handling_middleware");

const PORT = config.get("port") || 3003;

const app = express();

app.use(express.json());
app.use(cookieParser());


app.use("/api", mainRouter);

app.use(expressWinstonErrorLogger)

app.use(error_handling_middleware)

async function start() {
  try {
    await sequelize.sync({alter: true});
    app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}


start();
