let redis = null;
let memoryCache = new Map();
let useRedis = false;

const initRedis = async () => {
  if (redis) return;
  try {
    const IORedis = (await import('ioredis')).default;
    const client = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 1000);
      }
    });

    await new Promise((resolve, reject) => {
      client.on('connect', resolve);
      client.on('error', (err) => {
        console.warn('Redis unavailable, using in-memory cache:', err.message);
        reject(err);
      });
      setTimeout(() => reject(new Error('Redis connection timeout')), 3000);
    });

    redis = client;
    useRedis = true;
    console.log('Redis connected successfully');
  } catch {
    console.warn('Redis not available, falling back to in-memory cache');
    useRedis = false;
  }
};

const PREFIX = 'medcare:';

export const get = async (key) => {
  try {
    if (useRedis && redis) {
      const value = await redis.get(`${PREFIX}${key}`);
      return value ? JSON.parse(value) : null;
    }
    const entry = memoryCache.get(`${PREFIX}${key}`);
    if (!entry) return null;
    if (entry.expiry && Date.now() > entry.expiry) {
      memoryCache.delete(`${PREFIX}${key}`);
      return null;
    }
    return entry.value;
  } catch (err) {
    console.error('Cache get error:', err.message);
    return null;
  }
};

export const set = async (key, value, ttlSeconds = 300) => {
  try {
    if (useRedis && redis) {
      await redis.set(`${PREFIX}${key}`, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    }
    memoryCache.set(`${PREFIX}${key}`, {
      value,
      expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
    });
  } catch (err) {
    console.error('Cache set error:', err.message);
  }
};

export const del = async (key) => {
  try {
    if (useRedis && redis) {
      await redis.del(`${PREFIX}${key}`);
      return;
    }
    memoryCache.delete(`${PREFIX}${key}`);
  } catch (err) {
    console.error('Cache delete error:', err.message);
  }
};

export const invalidatePattern = async (pattern) => {
  try {
    if (useRedis && redis) {
      const keys = await redis.keys(`${PREFIX}${pattern}`);
      if (keys.length > 0) await redis.del(...keys);
      return;
    }
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of memoryCache.keys()) {
      const raw = key.startsWith(PREFIX) ? key.slice(PREFIX.length) : key;
      if (regex.test(raw)) memoryCache.delete(key);
    }
  } catch (err) {
    console.error('Cache invalidatePattern error:', err.message);
  }
};

export const getOrSet = async (key, fetchFn, ttlSeconds = 300) => {
  try {
    const cached = await get(key);
    if (cached !== null) return cached;

    const value = await fetchFn();
    await set(key, value, ttlSeconds);
    return value;
  } catch (err) {
    console.error('Cache getOrSet error:', err.message);
    try {
      return await fetchFn();
    } catch (fetchErr) {
      console.error('Cache getOrSet fetchFn error:', fetchErr.message);
      return null;
    }
  }
};

// Try to init Redis at module load, but don't block
initRedis().catch(() => {});
