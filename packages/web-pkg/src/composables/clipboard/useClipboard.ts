import { useClipboard as _useClipboard } from '@vueuse/core'

export const useClipboard = () => {
  /**
   * Copies given text into clipboard
   *
   * @remarks the copy action uses the clipboard // clipboardItem api to work around the webkit limitations.(https://developer.apple.com/forums/thread/691873) if those apis not available (or like in firefox behind dom.events.asyncClipboard.clipboardItem). it has a fallback to the vue-use implementation. (https://webkit.org/blog/10855/)
   *
   * @param quickLinkUrl If the text is supposed to be resolved via a promise, pass the promise directly and resolve it to string
   * @returns resolves whether the text has been copied into clipboard (e.g. whether the quickLinkUrl function resolved into a string or not)
   */
  const copyToClipboard = (
    quickLinkUrl: string | (() => Promise<string | null | undefined>)
  ): Promise<boolean> => {
    return new Promise<boolean>(async (resolve) => {
      try {
        if (typeof ClipboardItem && navigator?.clipboard?.write) {
          const blob =
            typeof quickLinkUrl === 'function'
              ? quickLinkUrl().then((text) => {
                  if (!text) {
                    throw new EmptyTextError('No text received')
                  }

                  return new Blob([text], { type: 'text/plain' })
                })
              : new Blob([quickLinkUrl], { type: 'text/plain' })

          await navigator.clipboard.write([
            new ClipboardItem({
              'text/plain': blob
            })
          ])

          resolve(true)
          return
        }

        const { copy } = _useClipboard({ legacy: true })
        const text = typeof quickLinkUrl === 'function' ? await quickLinkUrl() : quickLinkUrl

        await copy(text)
        resolve(true)
      } catch (error) {
        if (error instanceof EmptyTextError) {
          resolve(false)

          return
        }

        // A real error happened
        throw error
      }
    })
  }

  return { copyToClipboard }
}

class EmptyTextError extends Error {
  constructor(msg) {
    super(msg)

    this.name = 'ClipboardEmptyTextError'
  }
}
