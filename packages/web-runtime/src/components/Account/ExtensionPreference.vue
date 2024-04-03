<template>
  <oc-select
    v-model="model"
    class="extension-preference"
    :multiple="extensionPoint.multiple"
    :options="extensions"
    option-label="displayName"
  >
    <template #selected-option="{ userPreference }">
      <span>{{ userPreference?.optionLabel }}</span>
    </template>
    <template #option="{ userPreference }">
      <span>{{ userPreference?.optionLabel }}</span>
    </template>
  </oc-select>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, unref } from 'vue'
import {
  Extension,
  ExtensionPoint,
  useExtensionPreferencesStore,
  useExtensionRegistry
} from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'ExtensionRegistry',
  props: {
    extensionPoint: {
      type: Object as PropType<ExtensionPoint>,
      required: true
    }
  },
  setup(props) {
    const extensionRegistry = useExtensionRegistry()
    const extensionPreferences = useExtensionPreferencesStore()

    const allExtensions = computed<Extension[]>(() =>
      extensionRegistry.requestExtensions<Extension>(props.extensionPoint.type, {
        extensionPointIds: [props.extensionPoint.id]
      })
    )
    const defaultExtensionIds = computed(() => {
      return extensionPreferences.extractDefaultExtensionIds(
        props.extensionPoint,
        unref(allExtensions)
      )
    })
    const extensions = computed<Extension[]>(() => {
      return unref(allExtensions).sort((extension1, extension2) => {
        // default extension first
        if (
          unref(defaultExtensionIds).length &&
          (unref(defaultExtensionIds).includes(extension1.id) ||
            unref(defaultExtensionIds).includes(extension2.id))
        ) {
          return extension1.id === props.extensionPoint.defaultExtensionId ? -1 : 1
        }
        // all other extension sorted by id
        return extension1.id.localeCompare(extension2.id)
      })
    })

    const modelSingleSelect = computed({
      get(): Extension {
        const preference = extensionPreferences.getExtensionPreference(
          props.extensionPoint.id,
          unref(defaultExtensionIds)
        )
        return unref(extensions).find((extension) =>
          preference.selectedExtensionIds.includes(extension.id)
        )
      },
      set(extension) {
        extensionPreferences.setSelectedExtensionIds(props.extensionPoint.id, [extension.id])
      }
    })
    const modelMultiSelect = computed({
      get(): Extension[] {
        const preference = extensionPreferences.getExtensionPreference(
          props.extensionPoint.id,
          unref(defaultExtensionIds)
        )
        return unref(extensions).filter((extension) =>
          preference.selectedExtensionIds.includes(extension.id)
        )
      },
      set(extensions) {
        extensionPreferences.setSelectedExtensionIds(
          props.extensionPoint.id,
          extensions.map((extension) => extension.id)
        )
      }
    })

    return {
      extensions,
      model: props.extensionPoint.multiple ? modelMultiSelect : modelSingleSelect
    }
  }
})
</script>
