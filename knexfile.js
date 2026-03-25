//knexfile.js
require("dotenv").config();

module.exports = {
  development: {
    client: process.env.DB_CLIENT || "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // ssl: { rejectUnauthorized: false },
    },
  },
  staging: {
    client: process.env.DB_CLIENT || "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // ssl: { rejectUnauthorized: false },
    },
  },
  production: {
    client: "pg",
    connection: process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        }
      : {
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          ssl: { rejectUnauthorized: false },
        },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "./migrations",
    },
  },
};
