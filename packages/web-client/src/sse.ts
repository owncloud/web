import { SSEOptions } from './index'
import { fetchEventSource, FetchEventSourceInit } from '@microsoft/fetch-event-source'

export enum MESSAGE_TYPE {
  NOTIFICATION = 'notification',
  POSTPROCESSING = 'postprocessing'
}

export class SseAdapter implements EventSource {
  private abortController: AbortController
  private eventListenerMap: Record<string, ((event: MessageEvent) => any)[]>

  readonly readyState: number
  readonly url: string
  readonly withCredentials: boolean

  readonly CLOSED: number
  readonly CONNECTING: number
  readonly OPEN: number

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
        const event = new Event('opened')
        this.onopen?.bind(this)(event)
      },
      onmessage: (msg) => {
        // // if the server emits an error message, throw an exception
        // // so it gets handled by the onerror callback below:
        // if (msg.event === 'FatalError') {
        //   throw new FatalError(msg.data)
        // }
        const event = new CustomEvent('message', { detail: msg })
        this.onmessage?.bind(this)(event)

        const type = msg.event
        const eventListeners = this.eventListenerMap[type]
        // FIXME
        eventListeners.forEach((l) => l(msg.data as any))
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
    console.log('TODO: remove event listener')
  }

  dispatchEvent(event: Event): boolean {
    throw new Error('not implemented')
  }
}

export interface SSE {
  eventSource: SseAdapter
}

let eventSource: SseAdapter = null

export const sse = (baseURI: string, sseOptions: SSEOptions): SSE => {
  if (!eventSource) {
    eventSource = new SseAdapter(
      new URL('ocs/v2.php/apps/notifications/api/v1/notifications/sse', baseURI).href,
      { ...sseOptions }
    )

    eventSource.onmessage = (event) => {
      console.log(event)
    }

    eventSource.addEventListener(MESSAGE_TYPE.NOTIFICATION, () => {
      console.log('got notifications event')
    })
  }

  return <SSE>{
    eventSource
  }
}
