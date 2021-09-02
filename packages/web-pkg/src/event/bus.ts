export class EventBus {
  private listeners: Map<string, ((event?: unknown) => void)[]>

  constructor() {
    this.listeners = new Map()
  }

  public on(selector: string, cb: (event?: unknown) => void): void {
    let allListeners = []
    if (this.listeners.has(selector)) {
      allListeners = this.listeners.get(selector)
    }
    allListeners.push(cb)
    this.listeners.set(selector, allListeners)
  }

  public emit(selector: string, evt?: unknown): void {
    if (!this.listeners.has(selector)) return
    const listeners = this.listeners.get(selector)

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      if (!listener) continue
      listener(evt)
    }
  }
}
