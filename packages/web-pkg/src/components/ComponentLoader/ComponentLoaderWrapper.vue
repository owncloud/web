<template>
  <template v-if="component">
    <component :is="component" />
  </template>
  <app-loading-spinner v-else-if="!component && showSpinner" />
</template>

<script lang="ts">
import { PropType, defineComponent, ref, onMounted, Component } from 'vue'
import AppLoadingSpinner from '../AppLoadingSpinner.vue'
import { LoadComponent } from './ComponentLoader'
import { debounce } from 'lodash-es'

export default defineComponent({
  components: { AppLoadingSpinner },
  props: {
    loadComponent: {
      type: Object as PropType<LoadComponent>,
      required: true
    }
  },
  setup(props) {
    const component = ref<Component>()
    const showSpinner = ref(false)

    const spinnerDebounce = debounce(() => {
      showSpinner.value = true
    }, 250)

    onMounted(async () => {
      spinnerDebounce()
      component.value = await props.loadComponent()
    })

    return { component, showSpinner }
  }
})
</script>
