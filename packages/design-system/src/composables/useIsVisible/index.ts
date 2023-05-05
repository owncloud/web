import { onBeforeUnmount, ref, watch } from 'vue'

/**
 *
 * @param {Ref<Element>} target - ref with element to be observed
 * @param {('show'|'showHide')} mode - showHide shows and hides the element on screen enter or leave, show only detects entering the screen and the keeps it rendered
 * @param {string} rootMargin - margin that will be added around the element to detect visibility
 * @returns {{isVisible: Ref<boolean>}}
 */
export const useIsVisible = ({ target, mode = 'show', rootMargin = '100px' }) => {
  const isSupported = window && 'IntersectionObserver' in window
  if (!isSupported) {
    return {
      isVisible: ref(true)
    }
  }

  const isVisible = ref(false)
  const observer = new IntersectionObserver(
    (intersectionObserverEntries: IntersectionObserverEntry[]) => {
      /**
       * In some edge cases intersectionObserverEntries contains 2 entries with the first one having wrong rootBounds.
       * This happens for some reason when the table is being re-sorted immediately after being rendered.
       * Therefore we always check the last entry for isIntersecting.
       */
      const isIntersecting = intersectionObserverEntries.at(-1).isIntersecting

      isVisible.value = isIntersecting
      /**
       * if given mode is `showHide` we need to keep the observation alive.
       */
      if (mode === 'showHide') {
        return
      }
      /**
       * if the mode is `show` which is the default, the implementation needs to unsubscribe the target from the observer
       */
      if (!isVisible.value) {
        return
      }

      observer.unobserve(target.value)
    },
    {
      rootMargin
    }
  )

  watch(target, () => {
    observer.observe(target.value)
  })

  onBeforeUnmount(() => observer.disconnect())

  return {
    isVisible
  }
}
