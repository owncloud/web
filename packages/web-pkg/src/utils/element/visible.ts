enum state {
  created,
  entered,
  exited
}

export default class Visible {
  private intersectionObserver: IntersectionObserver
  private observing: boolean
  private state: state
  private readonly element: Element
  private readonly options: IntersectionObserverInit
  private readonly onEnter: (ElementIsVisible) => void
  private readonly onExit: (ElementIsVisible) => void

  constructor(
    element: Element,
    {
      onEnter,
      onExit
    }: {
      onEnter?: (ElementIsVisible?) => void
      onExit?: (ElementIsVisible?) => void
    },
    { root, rootMargin, threshold }: IntersectionObserverInit = {}
  ) {
    this.element = element
    this.options = {
      root,
      rootMargin,
      threshold: threshold || 0
    }
    this.onEnter = onEnter
    this.onExit = onExit
    this.state = state.created
    this.observe()
  }

  public observe(): void {
    if (this.observing || (!this.onEnter && !this.onExit)) {
      return
    }

    if (!this.intersectionObserver) {
      this.intersectionObserver = new IntersectionObserver(this.callback.bind(this), this.options)
    }

    this.intersectionObserver.observe(this.element)
    this.observing = true
  }

  public unobserve(): void {
    if (!this.observing) {
      return
    }

    this.intersectionObserver.unobserve(this.element)
    this.observing = false
  }

  public disconnect(): void {
    if (!this.observing) {
      return
    }

    this.intersectionObserver.disconnect()
    this.observing = false
  }

  private entered(): void {
    this.state = state.entered

    if (!this.onEnter) {
      return
    }

    this.onEnter(this)
  }

  private exited(): void {
    this.state = state.exited

    if (!this.onExit) {
      return
    }

    this.onExit(this)
  }

  private callback(entries) {
    if (!this.observing) {
      return
    }

    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > this.options.threshold) {
        ;(this.state === state.created || this.state === state.exited) && this.entered()
      } else {
        this.state === state.entered && this.exited()
      }
    })
  }
}
