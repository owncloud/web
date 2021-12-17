import { Locator } from '@playwright/test'

export const waitForEvent = (locator: Locator, type: keyof SVGElementEventMap): Promise<void> =>
  locator.evaluate(
    (element, arg) =>
      new Promise<void>((resolve) => {
        const finalizer = () => {
          element.removeEventListener(arg.type, finalizer)
          resolve()
        }

        element.addEventListener(arg.type, finalizer)
      }),
    { type }
  )
