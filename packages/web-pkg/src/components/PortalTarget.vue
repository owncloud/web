<template>
  <portal-target v-bind="properties" />
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { eventBus } from '../services'
import { PortalTargetEventTopics } from '../composables/portalTarget'
import { PortalTarget } from 'portal-vue'

export default defineComponent({
  name: 'PortalTarget',
  components: { PortalTarget },
  props: {
    ...PortalTarget.props
  },
  setup(props) {
    const properties = computed(() => props)
    onMounted(() => {
      eventBus.publish(PortalTargetEventTopics.mounted, props)
    })
    return { properties }
  }
})
</script>
