<template>
  <div>
    <h2 class="oc-px-m oc-py-s" v-text="$gettext('Apperance')" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, unref } from 'vue'
import { useStore } from 'web-pkg/src/composables'

export default defineComponent({
  name: 'Appearance Settings',
  setup() {
    const store = useStore()
    const currentTheme = computed(() => store.getters.configuration.currentTheme)
    console.log(unref(currentTheme))
  }
})
</script>
