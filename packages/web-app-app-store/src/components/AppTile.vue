<template>
  <li class="app-tile oc-card oc-card-default oc-card-rounded">
    <div class="app-cover-image">
      <oc-img v-if="app.coverImage?.url" :src="app.coverImage?.url" />
      <oc-icon v-else name="computer" size="xlarge" />
    </div>
    <div class="app-tile-body oc-card-body oc-p">
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
    </div>
  </li>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import { App } from '../types'
import { ActionMenuItem } from '@ownclouders/web-pkg'
import { useAppActionsDownload } from '../composables'

export default defineComponent({
  name: 'AppTile',
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
.app-tile {
  background-color: var(--oc-color-background-highlight) !important;
  box-shadow: none;
  height: 100%;
  display: flex;
  flex-flow: column;
  outline: 1px solid var(--oc-color-border);

  .app-cover-image {
    img {
      object-fit: contain;
      width: 100%;
      height: 200px;
      max-height: 200px;
    }
  }

  .app-tile-body {
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    height: 100%;

    .app-actions {
      display: flex;
      justify-content: flex-start;
      gap: 1rem;
    }
  }
}
</style>
