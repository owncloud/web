import * as uuid from 'uuid'

export class EventBus {
  private topics: Map<string, { callback: (data?: unknown) => void; token: string }[]>

  constructor() {
    this.topics = new Map()
  }

  public subscribe(topic: string, callback: (data?: unknown) => void): string {
    const subscription = {
      token: uuid.v4(),
      callback
    }
    const subscriptions = [subscription, ...(this.topics.get(topic) || [])]

    this.topics.set(topic, subscriptions)

    return subscription.token
  }

  public publish(topic: string, data?: unknown): void {
    const subscriptions = this.topics.get(topic) || []

    subscriptions.forEach((subscription) => subscription.callback(data))
  }

  public unsubscribe(topic: string, token: string): void {
    if (!this.topics.has(topic)) {
      return
    }

    this.topics.set(
      topic,
      this.topics.get(topic).filter((subscription) => subscription.token !== token)
    )
  }
}
