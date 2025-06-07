import { Redis } from 'ioredis'
import { CustomError, ErrorCode } from './error-handler'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export class Cache {
  private static instance: Cache
  private readonly defaultTTL = 3600 // 1時間

  private constructor() {}

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache()
    }
    return Cache.instance
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      throw new CustomError(ErrorCode.CACHE_ERROR, 'キャッシュの取得に失敗しました', {
        originalError: error,
      })
    }
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttl)
    } catch (error) {
      throw new CustomError(ErrorCode.CACHE_ERROR, 'キャッシュの設定に失敗しました', {
        originalError: error,
      })
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      throw new CustomError(ErrorCode.CACHE_ERROR, 'キャッシュの削除に失敗しました', {
        originalError: error,
      })
    }
  }

  async clear(): Promise<void> {
    try {
      await redis.flushall()
    } catch (error) {
      throw new CustomError(ErrorCode.CACHE_ERROR, 'キャッシュのクリアに失敗しました', {
        originalError: error,
      })
    }
  }
} 