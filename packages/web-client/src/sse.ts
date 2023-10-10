import { fetchEventSource, FetchEventSourceInit } from '@microsoft/fetch-event-source'

export enum MESSAGE_TYPE {
  NOTIFICATION = 'userlog-notification',
  POSTPROCESSING = 'postprocessing'
}

export class SseAdapter implements EventSource {
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
      onclose() {
        // if the server closes the connection unexpectedly, retry:
        // throw new RetriableError()
      },
      onerror(err) {
        // if (err instanceof FatalError) {
        //   throw err // rethrow to stop the operation
        // } else {
        //   // do nothing to automatically retry. You can also
        //   // return a specific retry interval here.
        // }
        const event = new CustomEvent('error', { detail: err })
        this.onerror?.bind(this)(event)
      }
    })
  }

  close() {
    this.abortController.abort('closed 123')
  }

  addEventListener(type: string, listener: (this: EventSource, event: MessageEvent) => any): void {
    console.log('add event listener')
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

let eventSource: SseAdapter = null

export const sse = (baseURI: string, fetchOptions: FetchEventSourceInit): EventSource => {
  if (!eventSource) {
    eventSource = new SseAdapter(
      new URL('ocs/v2.php/apps/notifications/api/v1/notifications/sse', baseURI).href,
      fetchOptions
    )
  }

  return eventSource
}
