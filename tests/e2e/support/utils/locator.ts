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

export const buildXpathLiteral = (value) => {
  switch (true) {
    case !value.includes("'"):
      // if we don't have any single quotes, then wrap them with single quotes
      return "'" + value + "'"
    case !value.includes('"'):
      // if we don't have any double quotes, then wrap them with double quotes
      return '"' + value + '"'
    default:
      // use concat to find the literal in the xpath if they contain both quotes
      return "concat('" + value.replace(/'/g, "',\"'\",'") + "')"
  }
}
