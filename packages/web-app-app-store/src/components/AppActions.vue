<template>
  <oc-list class="app-actions">
    <action-menu-item
      v-for="action in actions"
      :key="`app-action-${action.name}`"
      size="small"
      :action="action"
      :action-options="{ app, ...(version && version) }"
    />
  </oc-list>
</template>
<script lang="ts">
import { ActionMenuItem } from '@ownclouders/web-pkg'
import { useAppActionsDownload } from '../composables'
import { computed, defineComponent, PropType } from 'vue'
import { App, AppVersion } from '../types'

export default defineComponent({
  name: 'AppActions',
  components: { ActionMenuItem },
  props: {
    app: {
      type: Object as PropType<App>,
      required: true,
      default: (): App => undefined
    },
    version: {
      type: Object as PropType<AppVersion>,
      required: false,
      default: null
    }
  },
  setup() {
    const { downloadAppAction } = useAppActionsDownload()

    const actions = computed(() => {
      return [downloadAppAction]
    })

    return {
      actions
    }
  }
})
</script>

<style lang="scss">
.app-actions {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
}
</style>
