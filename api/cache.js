const redis = require('ioredis');

let client = null;
const CACHE_KEY_PREFIX = "20231017_";

async function instantiateClient() {
  try {
    client = new redis.Redis({
      port: 6379, // Redis port
      host: "127.0.0.1", // Redis host
      username: "default", // needs Redis >= 6
      password: process.env.REDIS_PASS,
      db: 0, // Defaults to 0
      maxRetriesPerRequest: 3,
    });
  }  catch (err) {
    console.error(err);
  }
}

async function getBuffer(key) {
  if (client === null) {
    await instantiateClient();
  }
  try {
    const value = await client.getBuffer(`${CACHE_KEY_PREFIX}-${key}`);
    return value;
  } catch (err) {
    console.error(err);
  }
}

async function setValue(key, value, ttl) {
  if (client === null) {
    await instantiateClient();
  }
  try {
    await client.set(`${CACHE_KEY_PREFIX}-${key}`, value, 'EX', ttl || 3600 * 24);
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  getBuffer,
  setValue,
};
