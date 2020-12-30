
require('dotenv').config()
module.exports = {
  db: {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    },
  },
  app: {
    port: parseInt(process.env.PORT) || 3000,
  },
}
