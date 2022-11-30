import { Cache } from 'web-pkg'
describe('cache', () => {
	describe('CacheElement', () => {
		let cache
		let key
		let value
		let evictSpy
		beforeEach(() => {
			const options = {ttl: 0, opacity: 0}
			evictSpy = jest.spyOn(Cache.prototype, 'evict');
			cache = new Cache<string, string>(options)
			key = 'key'
			value = 'value'
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
			expect(cache.delete(key)).toBeTruthy()
			expect(cache.get(key)).toBe(undefined)
		})
		it('should clear cache', () => {
			cache.set(key, value)
			expect(cache.clear())
			expect(cache.keys().length).toBe(0)
		})
	})
})
