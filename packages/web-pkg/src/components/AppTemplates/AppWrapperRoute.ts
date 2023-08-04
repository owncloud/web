import { defineComponent, h } from 'vue'
import AppWrapper, { AppWrapperSlotArgs } from './AppWrapper.vue'
import { UrlForResourceOptions } from 'web-pkg/src/composables'

export function AppWrapperRoute(
  fileEditor: ReturnType<typeof defineComponent>,
  options: { applicationId: string; urlForResourceOptions?: UrlForResourceOptions }
) {
  return defineComponent({
    render() {
      return h(
        AppWrapper,
        {
          wrappedComponent: fileEditor,
          ...options
        },
        {
          default: (slotArgs: AppWrapperSlotArgs) => {
            const { currentContent, ...restArgs } = slotArgs
            return h(fileEditor, {
              currentContent: currentContent.value,
              'onUpdate:currentContent': (value) => {
                currentContent.value = value
              },
              ...restArgs
            })
          }
        }
      )
    }
  })
}
