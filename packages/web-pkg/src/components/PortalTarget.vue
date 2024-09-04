<template>
  <portal-target-vue v-bind="properties" />
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { eventBus } from '../services'
import { PortalTargetEventTopics } from '../composables/portalTarget'
import { PortalTarget as PortalTargetVue } from 'portal-vue'

export default defineComponent({
  name: 'PortalTarget',
  components: { PortalTargetVue },
  props: {
    ...PortalTargetVue.props
  },
  setup(props) {
    const properties = computed<typeof PortalTargetVue.props>(() => props)
    onMounted(() => {
      eventBus.publish(PortalTargetEventTopics.mounted, props)
    })
    return { properties }
  }
})
</script>
