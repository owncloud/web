<template>
  <li class="app-tile oc-card oc-card-default oc-card-rounded">
    <router-link :to="{ name: 'app-store-details', params: { appId: encodeURIComponent(app.id) } }">
      <app-cover :app="app" />
    </router-link>
    <div class="app-tile-body oc-card-body oc-p">
      <div class="app-content">
        <div class="oc-flex oc-flex-middle">
          <h3 class="oc-my-s oc-text-truncate mark-element">
            <router-link
              :to="{ name: 'app-store-details', params: { appId: encodeURIComponent(app.id) } }"
            >
              {{ app.name }}
            </router-link>
          </h3>
          <span class="oc-ml-s oc-text-muted oc-text-small">
            v{{ app.mostRecentVersion.version }}
          </span>
        </div>
        <p class="oc-my-s mark-element">{{ app.subtitle }}</p>
      </div>
      <app-tags :app="app" @search="emitSearchTerm" />
      <app-actions :app="app" />
    </div>
  </li>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { App } from '../types'
import AppCover from './AppCover.vue'
import AppTags from './AppTags.vue'
import AppActions from './AppActions.vue'

export default defineComponent({
  name: 'AppTile',
  components: { AppActions, AppTags, AppCover },
  props: {
    app: {
      type: Object as PropType<App>,
      required: true
    }
  },
  emits: ['search'],
  setup(props, { emit }) {
    const emitSearchTerm = (term: string) => {
      emit('search', term)
    }

    return {
      emitSearchTerm
    }
  }
})
</script>

<style lang="scss">
.app-tile {
  overflow: hidden;
  background-color: var(--oc-color-background-highlight) !important;
  box-shadow: none;
  height: 100%;
  display: flex;
  flex-flow: column;
  outline: 1px solid var(--oc-color-border);

  .app-tile-body {
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    height: 100%;
  }
}
</style>
