<template>
  <span class="oc-resource-size" v-text="formattedSize" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { formatFileSize } from '../../helpers'
import { useGettext } from 'vue3-gettext'

/**
 * Displays a formatted resource size
 */
export default defineComponent({
  name: 'ResourceSize',
  props: {
    /**
     * Number of bytes to display as a reasonable resource size string.
     * Value can be a non-formatted string or a number.
     */
    size: {
      type: [String, Number],
      required: true
    }
  },
  setup: (props) => {
    const { current: currentLanguage } = useGettext()
    const formattedSize = computed(() => formatFileSize(props.size, currentLanguage))

    return {
      formattedSize
    }
  }
})
</script>
