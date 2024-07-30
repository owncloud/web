<template>
  <li class="app-list-item oc-flex oc-flex-row oc-flex-middle">
    <div class="app-cover-image">
      <oc-img v-if="app.coverImage?.url" :src="app.coverImage?.url" />
      <oc-icon v-else name="computer" size="xlarge" />
    </div>
    <div class="app-content">
      <h3 class="oc-my-s">{{ app.name }}</h3>
      <p class="oc-my-s">{{ app.subtitle }}</p>
    </div>
    <oc-list class="app-actions">
      <action-menu-item
        v-for="action in actions"
        :key="`app-action-${action.name}`"
        :action="action"
        :action-options="{ app }"
      />
    </oc-list>
  </li>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import { App } from '../types'
import { ActionMenuItem } from '@ownclouders/web-pkg'
import { useAppActionsDownload } from '../composables'

export default defineComponent({
  name: 'AppListItem',
  components: { ActionMenuItem },
  props: {
    app: {
      type: Object as PropType<App>,
      required: true
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
.app-list-item {
  gap: 1rem;

  .app-cover-image {
    width: 100px;
    height: 80px;

    img {
      object-fit: contain;
      width: 100%;
      max-width: 100px;
      height: 100%;
      max-height: 80px;
    }
  }

  .app-content {
    flex-grow: 1;
  }

  .app-actions {
    flex-shrink: 1;
  }
}
</style>
