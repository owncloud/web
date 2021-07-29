export class EventBus {
  private listeners: Map<string, (event?: unknown) => void>

  constructor() {
    this.listeners = new Map()
  }

  public on(selector: string, cb: (event?: unknown) => void): void {
    this.listeners.set(selector, cb)
  }

  public emit(selector: string, evt?: unknown): void {
    const listener = this.listeners.get(selector)

    if (!listener) {
      return
    }

    listener(evt)
  }
}
