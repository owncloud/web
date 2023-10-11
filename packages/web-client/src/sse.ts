import { fetchEventSource, FetchEventSourceInit } from '@microsoft/fetch-event-source'

export enum MESSAGE_TYPE {
  NOTIFICATION = 'userlog-notification',
  POSTPROCESSING_FINISHED = 'postprocessing-finished'
}

const myFetch = async (...args) => {
  let [resource, config] = args
  config.headers['Authorization'] = 'Bearer Pimmel'

  return window.fetch(resource, config)
}

class RetriableError extends Error {}

const RECONNECT_RANDOM_OFFSET = 15000

export class SSEAdapter implements EventSource {
  private abortController: AbortController
  private eventListenerMap: Record<string, ((event: MessageEvent) => any)[]>

  readonly readyState: number
  readonly url: string
  readonly withCredentials: boolean

  readonly CONNECTING: 0
  readonly OPEN: 1
  readonly CLOSED: 2

  onerror: ((this: EventSource, ev: Event) => any) | null
  onmessage: ((this: EventSource, ev: MessageEvent) => any) | null
  onopen: ((this: EventSource, ev: Event) => any) | null

  constructor(url: string, fetchOptions: FetchEventSourceInit) {
    this.abortController = new AbortController()
    this.eventListenerMap = {}

    fetchEventSource(url, {
      ...fetchOptions,
      signal: this.abortController.signal,
      fetch: myFetch,
      onopen: async (response) => {
        // if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
        //   return // everything's good
        // } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        //   // client-side errors are usually non-retriable:
        //   throw new FatalError()
        // } else {
        //   throw new RetriableError()
        // }
        const event = new Event('open')
        this.onopen?.bind(this)(event)
      },
      onmessage: (msg) => {
        // // if the server emits an error message, throw an exception
        // // so it gets handled by the onerror callback below:
        // if (msg.event === 'FatalError') {
        //   throw new FatalError(msg.data)
        // }
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
        return 30000 + Math.floor(Math.random() * RECONNECT_RANDOM_OFFSET)
      }
    })
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
    throw new Error('not implemented')
  }
}

let eventSource: SSEAdapter = null

export const sse = (baseURI: string, fetchOptions: FetchEventSourceInit): EventSource => {
  // TODO: shouldn't be using capabilities but should also not be used if sse is disabled
  //const sseEnabled = useCapabilityCoreSSE()
  //if (unref(sseEnabled)) {
  if (!eventSource) {
    eventSource = new SSEAdapter(
      new URL('ocs/v2.php/apps/notifications/api/v1/notifications/sse', baseURI).href,
      fetchOptions
    )
  }

  return eventSource
}
