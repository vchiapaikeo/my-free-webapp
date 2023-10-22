const { Pool, Client } = require("pg");

let dbPool;

try {
  const dbConfig = {
    database: "postgres",
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
  };
  dbConfig.host = "127.0.0.1";
  dbConfig.user = process.env.DB_USER;
  dbConfig.password = process.env.DB_PASS;
  dbPool = new Pool(dbConfig);
} catch (err) {
  console.error("Could not connect to database", err);
}

async function query(text, values) {
  try {
    return await dbPool.query({ text, values });
  } catch (err) {
    console.error(err);
  }
}

async function getItems(mallKey) {
  const text = "SELECT * FROM items";
  const res = await query(text);
  return res.rows;
}

async function updateItemWithImageURIs(itemID, uris) {
  const text = `
    UPDATE items
      SET
        image_uri = $1
    WHERE id = $2
  `;
  const values = [uris, itemID];
  const res = await query(text, values);
  return res.rows;
}

module.exports = {
  getItems,
  updateItemWithImageURIs,
};
