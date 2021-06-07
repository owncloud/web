enum States {
  enter,
  exit
}

type Callback = ({
  element,
  callCount,
  unobserve
}: {
  element: Element
  callCount: number
  unobserve: () => void
}) => void

type Options = {
  root?: Element | Document | null
  rootMargin?: string
  threshold?: number
}

type Unobserver = (element: Element) => void

class Target {
  private state: States
  private observeEnter: boolean
  private observeExit: boolean
  private onEnterCallCount: number
  private onExitCallCount: number
  private readonly onEnter: Callback
  private readonly onExit: Callback
  public readonly threshold: number
  public readonly unobserver: Unobserver

  constructor(
    unobserver: Unobserver,
    threshold: number,
    {
      onEnter,
      onExit
    }: {
      onEnter?: Callback
      onExit?: Callback
    }
  ) {
    this.unobserver = unobserver
    this.threshold = threshold
    this.onEnter = onEnter
    this.onExit = onExit
    this.observeEnter = true
    this.observeExit = true
    this.onEnterCallCount = 0
    this.onExitCallCount = 0
  }

  public propagateEvent(state: States, element: Element) {
    const sharedProps = {
      element: element,
      unobserve: () => this.unobserve(state, element)
    }

    if (state === States.enter && this.observeEnter && this.onEnter) {
      this.onEnterCallCount++
      this.onEnter({
        callCount: this.onEnterCallCount,
        ...sharedProps
      })
    } else if (
      this.state === States.enter &&
      state === States.exit &&
      this.observeExit &&
      this.onExit
    ) {
      this.onExitCallCount++
      this.onExit({
        callCount: this.onExitCallCount,
        ...sharedProps
      })
    }

    this.state = state
  }

  private unobserve(state: States, element: Element) {
    if (state === States.enter) {
      this.observeEnter = false
    } else if (state === States.exit) {
      this.observeExit = false
    }

    if (!this.observeEnter && !this.observeExit) {
      this.unobserver(element)
    }
  }
}

export class VisibilityObserver {
  private targets: WeakMap<Element, Target>
  private readonly intersectionObserver: IntersectionObserver
  private readonly options: Options

  constructor({ root, rootMargin, threshold }: Options = {}) {
    this.options = {
      root,
      rootMargin,
      threshold: threshold || 0
    }
    this.targets = new WeakMap<Element, Target>()
    this.intersectionObserver = new IntersectionObserver(this.trigger.bind(this), this.options)
  }

  public observe(
    element: Element,
    {
      onEnter,
      onExit
    }: {
      onEnter?: Callback
      onExit?: Callback
    } = {},
    threshold?: number
  ): void {
    if (!onEnter && !onExit) {
      return
    }

    this.targets.set(
      element,
      new Target(this.unobserve, threshold || this.options.threshold, {
        onEnter,
        onExit
      })
    )
    this.intersectionObserver.observe(element)
  }

  public unobserve(element: Element): void {
    if (this.targets.delete(element)) {
      this.intersectionObserver.unobserve(element)
    }
  }

  public disconnect(): void {
    this.targets = new WeakMap<Element, Target>()
    this.intersectionObserver.disconnect()
  }

  private trigger(entries) {
    entries.forEach((entry: IntersectionObserverEntry) => {
      const observedElement = this.targets.get(entry.target)

      if (!observedElement) {
        return
      }

      observedElement.propagateEvent(
        entry.isIntersecting && entry.intersectionRatio > observedElement.threshold
          ? States.enter
          : States.exit,
        entry.target
      )
    })
  }
}
