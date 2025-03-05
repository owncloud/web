<template>
  <component
    :is="toRaw(extension.content)"
    v-for="extension in extensions"
    :key="`custom-component-${extension.id}`"
  />
</template>

<script lang="ts">
import { computed, defineComponent, PropType, unref, toRaw } from 'vue'
import {
  CustomComponentExtension,
  ExtensionPoint,
  useExtensionPreferencesStore,
  useExtensionRegistry
} from '../composables'

export default defineComponent({
  name: 'CustomComponentTarget',
  props: {
    extensionPoint: {
      type: Object as PropType<ExtensionPoint<CustomComponentExtension>>,
      required: true
    }
  },
  setup(props) {
    const extensionRegistry = useExtensionRegistry()
    const extensionPreferences = useExtensionPreferencesStore()

    const allExtensions = computed(() => {
      return extensionRegistry.requestExtensions(props.extensionPoint)
    })

    const defaultExtensionIds = extensionPreferences.extractDefaultExtensionIds(
      props.extensionPoint,
      unref(allExtensions)
    )

    const extensions = computed<CustomComponentExtension[]>(() => {
      // TODO: for `multiple` we want to respect the selected extensions as well in the future.
      if (props.extensionPoint.multiple || unref(allExtensions).length <= 1) {
        return unref(allExtensions)
      }

      const preference = extensionPreferences.getExtensionPreference(
        props.extensionPoint.id,
        defaultExtensionIds
      )
      if (preference.selectedExtensionIds.length) {
        return [
          unref(allExtensions).find((extension) =>
            preference.selectedExtensionIds.includes(extension.id)
          ) || unref(allExtensions)[0]
        ]
      }

      // if no user preference and no default provided, return the first one.
      return [unref(allExtensions)[0]]
    })

    return {
      extensions,
      toRaw
    }
  }
})
</script>
