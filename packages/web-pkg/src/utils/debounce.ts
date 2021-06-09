type kback = (...args: any[]) => any

interface bouncer<T extends kback> {
  (this: ThisParameterType<T>, ...args: Parameters<T>)
  cancel: () => void
}

export const debounce = <T extends kback>(fn: T, ms = 250): bouncer<T> => {
  let timeoutId: ReturnType<typeof setTimeout>

  const bouncer = function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }

  bouncer.cancel = function() {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
  }

  return bouncer
}
