<template>
  <div v-if="isLoading" class="oc-flex oc-flex-center"><oc-spinner size="large" /></div>
  <div v-else ref="emojiPickerRef"></div>
</template>

<script lang="ts">
import { defineComponent, nextTick, ref, unref, watch } from 'vue'
import { useGettext } from 'vue3-gettext'

/**
 * Emoji Picker
 */
export default defineComponent({
  name: 'OcEmojiPicker',
  status: 'ready',
  release: '1.0.0',
  props: {
    theme: {
      type: String,
      default: 'light',
      validator: (value: string) => {
        return ['light', 'dark'].includes(value)
      }
    }
  },
  emits: ['emojiSelect', 'clickOutside'],
  setup(props, { emit }) {
    const language = useGettext()
    const { $gettext } = language
    const emojiPickerRef = ref<HTMLElement>()

    const isLoading = ref(true)

    watch(
      [() => props.theme, language.current],
      async () => {
        isLoading.value = true

        await nextTick()
        const i18n = {
          search: $gettext('Search'),
          search_no_results_1: $gettext('Oh no!'),
          search_no_results_2: $gettext('That emoji couldn’t be found'),
          pick: $gettext('Pick an emoji…'),
          add_custom: $gettext('Add custom emoji'),
          categories: {
            activity: $gettext('Activity'),
            custom: $gettext('Custom'),
            flags: $gettext('Flags'),
            foods: $gettext('Food & Drink'),
            frequent: $gettext('Frequently used'),
            nature: $gettext('Animals & Nature'),
            objects: $gettext('Objects'),
            people: $gettext('Smileys & People'),
            places: $gettext('Travel & Places'),
            search: $gettext('Search Results'),
            symbols: $gettext('Symbols')
          },
          skins: {
            choose: $gettext('Choose default skin tone'),
            '1': $gettext('Default'),
            '2': $gettext('Light'),
            '3': $gettext('Medium-Light'),
            '4': $gettext('Medium'),
            '5': $gettext('Medium-Dark'),
            '6': $gettext('Dark')
          }
        }

        const data = (await import('@emoji-mart/data')).default

        const pickerOptions = {
          onEmojiSelect: (emoji: any) => emit('emojiSelect', emoji.native),
          onClickOutside: () => emit('clickOutside'),
          i18n,
          theme: props.theme,
          data
        }

        // lazy loading to avoid loading the whole package on page load
        const { Picker } = await import('emoji-mart')
        const picker = new Picker(pickerOptions)

        isLoading.value = false
        await nextTick()

        unref(emojiPickerRef).innerHTML = ''
        unref(emojiPickerRef).appendChild(picker as any)
        unref(emojiPickerRef).focus()
      },
      { immediate: true }
    )

    return {
      emojiPickerRef,
      isLoading
    }
  }
})
</script>

<docs>
```js
<template>
  <h3>Light mode OcEmojiPicker</h3>
  <oc-emoji-picker theme="light" @emoji-select="alert"/>
  <h3>Dark mode OcEmojiPicker</h3>
  <oc-emoji-picker theme="dark" @emoji-select="alert"/>
</template>
<script>
  export default {
    methods: {
      alert(val) {
        alert(val)
      }
    }
  }
</script>
```
</docs>
