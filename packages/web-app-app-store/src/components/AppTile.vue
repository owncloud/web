<template>
  <li class="app-tile oc-card oc-card-default oc-card-rounded">
    <div class="app-cover-image">
      <oc-img v-if="app.coverImage?.url" :src="app.coverImage?.url" />
      <oc-icon v-else name="computer" size="xlarge" />
    </div>
    <div class="app-tile-body oc-card-body oc-p">
      <div class="app-content">
        <div class="oc-flex oc-flex-middle">
          <h3 class="oc-my-s oc-text-truncate mark-element">{{ app.name }}</h3>
          <span class="oc-ml-s oc-text-muted oc-text-small">
            v{{ app.mostRecentVersion.version }}
          </span>
        </div>
        <p class="oc-my-s mark-element">{{ app.subtitle }}</p>
      </div>
      <div class="app-tags">
        <oc-tag
          v-for="tag in app.tags"
          :key="`app-tag-${app.id}-${tag}`"
          size="small"
          class="oc-text-nowrap"
          type="button"
          @click="emitSearchTerm(tag)"
        >
          <span class="mark-element">{{ tag }}</span>
        </oc-tag>
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
  emits: ['search'],
  setup(props, { emit }) {
    const { downloadAppAction } = useAppActionsDownload()

    const actions = computed(() => {
      return [downloadAppAction]
    })

    const emitSearchTerm = (term: string) => {
      emit('search', term)
    }

    return {
      actions,
      emitSearchTerm
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

    .app-tags {
      display: flex;
      gap: 0.5rem;
    }

    .app-actions {
      display: flex;
      justify-content: flex-start;
      gap: 1rem;
    }
  }
}
</style>
