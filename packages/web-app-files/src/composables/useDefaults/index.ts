import { customRef, Ref } from '@vue/composition-api'

interface Defaults {
  pagination: {
    perPage: Ref
  }
}

let defaults: Defaults

/**
 * interim solution till options // configuration api is in place
 */
export const useDefaults = (): Defaults => {
  if (defaults) {
    return defaults
  }

  defaults = {
    pagination: {
      perPage: customRef<string>((track, trigger) => {
        const defaultValue = '100'
        return {
          get() {
            track()
            return window.localStorage.getItem('oc_filesPageLimit') || defaultValue
          },
          set(v) {
            window.localStorage.setItem('oc_filesPageLimit', v)
            trigger()
          }
        }
      })
    }
  }

  return defaults
}
