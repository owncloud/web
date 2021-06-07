class CacheElement<T> {
  public value: T
  public expires: number

  constructor(value: T, ttl: number) {
    this.value = value
    this.expires = ttl === 0 ? 0 : new Date().getTime() + ttl
  }

  get expired(): boolean {
    return this.expires > 0 && this.expires < new Date().getTime()
  }
}

export default class Cache<K, V> {
  private map: Map<K, CacheElement<V>>
  private readonly ttl: number
  private readonly capacity: number

  constructor({ ttl, capacity }: { ttl?: number; capacity?: number } = {}) {
    this.ttl = ttl || 0
    this.capacity = capacity || 0

    this.map = new Map<K, CacheElement<V>>()
  }

  public set(key: K, value: V, ttl?: number): V {
    this.map.set(key, new CacheElement<V>(value, ttl || ttl === 0 ? 0 : this.ttl))

    if (this.capacity && this.map.size > this.capacity) {
      const itemsToDelete = this.map.size - this.capacity
      let i = 1
      for (const [mk] of this.map.entries()) {
        if (i > itemsToDelete) {
          break
        }
        this.delete(mk)
        i++
      }
    }

    return value
  }

  public get(key: K): V {
    const entry = this.map.get(key)
    if (!entry || entry.expired) {
      this.delete(key)
      return undefined
    }

    return entry.value
  }

  public delete(key: K): boolean {
    return this.map.delete(key)
  }

  public clear(): void {
    return this.map.clear()
  }

  public entries(): [K, V][] {
    const kv: [K, V][] = []

    this.map.forEach((mv, mk) => {
      if (mv.expired) {
        this.delete(mk)
        return
      }
      kv.push([mk, mv.value])
    })

    return kv
  }

  public keys(): K[] {
    const k: K[] = []
    this.entries().forEach(e => k.push(e[0]))

    return k
  }

  public values(): V[] {
    const v: V[] = []
    this.entries().forEach(e => v.push(e[1]))

    return v
  }
}
