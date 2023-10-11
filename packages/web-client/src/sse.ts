import { fetchEventSource, FetchEventSourceInit } from '@microsoft/fetch-event-source'

export enum MESSAGE_TYPE {
  NOTIFICATION = 'userlog-notification',
  POSTPROCESSING_FINISHED = 'postprocessing-finished'
}

class RetriableError extends Error {}

const RECONNECT_RANDOM_OFFSET = 15000

export class SSEAdapter implements EventSource {
  url: string
  private fetchOptions: FetchEventSourceInit
  private abortController: AbortController
  private eventListenerMap: Record<string, ((event: MessageEvent) => any)[]>

  readonly readyState: number
  readonly withCredentials: boolean

  readonly CONNECTING: 0
  readonly OPEN: 1
  readonly CLOSED: 2

  onerror: ((this: EventSource, ev: Event) => any) | null
  onmessage: ((this: EventSource, ev: MessageEvent) => any) | null
  onopen: ((this: EventSource, ev: Event) => any) | null

  constructor(url: string, fetchOptions: FetchEventSourceInit) {
    this.url = url
    this.fetchOptions = fetchOptions
    this.abortController = new AbortController()
    this.eventListenerMap = {}
    this.connect()
  }

  private connect() {
    return fetchEventSource(this.url, {
      openWhenHidden: true,
      signal: this.abortController.signal,
      fetch: this.fetchProvider.bind(this),
      onopen: async () => {
        const event = new Event('open')
        this.onopen?.bind(this)(event)
      },
      onmessage: (msg) => {
        const event = new MessageEvent('message', { data: msg.data })
        this.onmessage?.bind(this)(event)

        const type = msg.event
        const eventListeners = this.eventListenerMap[type]
        eventListeners?.forEach((l) => l(event))
      },
      onclose: () => {
        throw new RetriableError()
      },
      onerror: (err) => {
        console.error(err)
        const event = new CustomEvent('error', { detail: err })
        this.onerror?.bind(this)(event)

        /*
         * Try to reconnect after 30 seconds plus random time in seconds.
         * This prevents all clients try to reconnect concurrent on server error, to reduce load.
         */
        return 30000 + Math.floor(Math.random() * RECONNECT_RANDOM_OFFSET)
      }
    })
  }

  private fetchProvider(...args) {
    let [resource, config] = args
    config = { ...config, ...this.fetchOptions }
    return window.fetch(resource, config)
  }

  close() {
    this.abortController.abort('closed')
  }

  addEventListener(type: string, listener: (this: EventSource, event: MessageEvent) => any): void {
    this.eventListenerMap[type] = this.eventListenerMap[type] || []
    this.eventListenerMap[type].push(listener)
  }

  removeEventListener(
    type: string,
    listener: (this: EventSource, event: MessageEvent) => any
  ): void {
    this.eventListenerMap[type] = this.eventListenerMap[type]?.filter((func) => func !== listener)
  }

  dispatchEvent(event: Event): boolean {
    throw new Error('Method not implemented.')
  }

  updateAccessToken(token: string) {
    this.fetchOptions.headers['Authorization'] = `Bearer ${token}`
  }
}

let eventSource: SSEAdapter = null

export const sse = (baseURI: string, fetchOptions: FetchEventSourceInit): EventSource => {
  if (!eventSource) {
    eventSource = new SSEAdapter(
      new URL('ocs/v2.php/apps/notifications/api/v1/notifications/sse', baseURI).href,
      fetchOptions
    )
  }

  return eventSource
}
