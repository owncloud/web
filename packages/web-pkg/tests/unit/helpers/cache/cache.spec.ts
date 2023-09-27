import { Cache } from '@ownclouders/web-pkg'
describe('cache', () => {
  describe('CacheElement', () => {
    let cache
    let key, value, key2, value2
    let evictSpy
    beforeEach(() => {
      const options = { ttl: 0, opacity: 0 }
      evictSpy = jest.spyOn(Cache.prototype, 'evict')
      cache = new Cache<string, string>(options)
      key = 'key'
      value = 'value'
      key2 = 'key2'
      value2 = 'value2'
    })
    it('should set value and be receivable with get', () => {
      expect(cache.set(key, value)).toBe(value)
      expect(cache.get(key)).toBe(value)
    })
    it('should evict before any access', () => {
      cache.set(key, value)
      cache.get(key)
      cache.entries()
      cache.keys()
      cache.values()
      cache.has(key)
      expect(evictSpy).toHaveBeenCalledTimes(6)
    })
    it('should delete key', () => {
      cache.set(key, value)
      cache.set(key2, value2)
      expect(cache.delete(key)).toBeTruthy()
      expect(cache.get(key)).toBe(undefined)
      expect(cache.get(key2)).toBe(value2)
    })
    it('should clear cache', () => {
      cache.set(key, value)
      cache.set(key2, value2)
      cache.clear()
      expect(cache.keys().length).toBe(0)
    })
    it('should return cache entries', () => {
      cache.set(key, value)
      cache.set(key2, value2)
      expect(cache.entries()).toStrictEqual([
        [key, value],
        [key2, value2]
      ])
    })
    it('should return keys', () => {
      cache.set(key, value)
      cache.set(key2, value2)
      expect(cache.keys()).toStrictEqual([key, key2])
    })
    it('should return values', () => {
      cache.set(key, value)
      cache.set(key2, value2)
      expect(cache.values()).toStrictEqual([value, value2])
    })
    it('should return if has key', () => {
      cache.set(key, value)
      expect(cache.has(key)).toBe(true)
      expect(cache.has(key2)).toBe(false)
    })
    it('should evict expired item', () => {
      const oldGetTime = Date.prototype.getTime
      Date.prototype.getTime = jest.fn(() => 1487076708000)
      cache.set(key, value, 1)
      Date.prototype.getTime = oldGetTime
      expect(cache.values().length).toBe(0)
    })
    it('should not evict item that has not expired', () => {
      cache.set(key, value, 1000)
      expect(cache.values().length).toBe(1)
    })
    it('should not evict item without ttl', () => {
      const oldGetTime = Date.prototype.getTime
      Date.prototype.getTime = jest.fn(() => 1487076708000)
      cache.set(key, value, 0)
      Date.prototype.getTime = oldGetTime
      expect(cache.values().length).toBe(1)
    })
  })
})
