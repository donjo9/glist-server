const { Pool } = require("pg");

const pgConfig = {
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
};
const pool = new Pool(pgConfig);

const db = {
    query: (query, args) => {
        return pool.query(query, args)
    }
}

module.exports = db;