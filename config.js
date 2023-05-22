const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  dbUser: process.env.USER,
  dbPassword: process.env.PASSWORD,
  dbName: process.env.DB_NAME,
  port: process.env.PORT,
};
