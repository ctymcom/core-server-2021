import redis from "./redis";
/**
 * Set cache value
 *
 * @param {*} key
 * @param {*} value
 * @param {*} ttl seconds
 */
const set = async (key: string, value: any, ttl?: number) => {
  //  const lock = await redlock.lock(`redlock:${key}`, 500);

  let result;
  if (ttl) {
    result = await redis.setex(key, ttl, value);
  } else {
    result = await redis.set(key, value);
  }

  //  await lock.unlock();
  return result;
};

/**
 * Get value from key
 *
 * return true;
 * @param {*} key
 */
const get = async (key: string) => {
  //  const lock = await redlock.lock(`redlock:${key}`, 500);
  return new Promise<string>((resolve, reject) => {
    redis.get(key, async (err, result) => {
      //  await lock.unlock();
      if (err) reject(err);
      resolve(result);
    });
  });
};

/**
 *
 * Get value with TTL
 *
 * @param {*} key
 * @returns
 */
const getWithTTL = async (key: string) => {
  return new Promise<any[]>((resolve, reject) => {
    redis
      .multi()
      .ttl(key)
      .get(key)
      .exec((err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
  });
};

/**
 * Delete key
 *
 * @param {*} key
 */
const del = async (key: string) => {
  //  const lock = await redlock.lock(`redlock:${key}`, 500);
  const result = await redis.del(key);
  //  await lock.unlock();
  return result;
};

/**
 * Set cache value
 *
 * @param {*} key
 * @param {*} field
 * @param {*} value
 */
const hset = async (key: string, field: string, value: string) => {
  //  const lock = await redlock.lock(`redlock:${key}:${field}`, 500);
  const result = await redis.hset(key, field, value);
  //  await lock.unlock();
  return result;
};

/**
 * Get value from key
 *
 * @param {*} key
 * @param {*} field
 */
const hget = async (key: string, field: string) => {
  //  const lock = await redlock.lock(`redlock:${key}:${field}`, 500);
  const result = await hgetWithoutLock(key, field);
  //  await lock.unlock();
  return result;
};

/**
 * Get value from key wihtout lock
 * @param {*} key
 * @param {*} field
 * @returns
 */
const hgetWithoutLock = async (key: string, field: string) => {
  return new Promise<string>((resolve, reject) =>
    redis.hget(key, field, (err, reply) => {
      if (err) return reject(err);
      return resolve(reply);
    })
  );
};

/**
 * Get value from key
 *
 * @param {*} key
 */
const hgetall = async (key: string) => redis.hgetall(key);

/**
 * Delete key/field
 *
 * @param {*} key
 * @param {*} field
 */
const hdel = async (key: string, field: string) => {
  //  const lock = await redlock.lock(`redlock:${key}:${field}`, 500);
  const result = await redis.hdel(key, field);
  //  await lock.unlock();
  return result;
};

export default {
  set,
  get,
  getWithTTL,
  del,
  hset,
  hgetWithoutLock,
  hget,
  hgetall,
  hdel,
};
