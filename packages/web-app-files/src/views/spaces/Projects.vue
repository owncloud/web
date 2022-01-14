<template>
  <div class="oc-p-s">
    <h2 v-text="$gettext('Spaces')" />
    <span v-text="$gettext('Access all project related files in one place.')" />
    <a href="#" v-text="$gettext('Learn more about spaces.')" />
    <h3 v-text="$gettext('Your spaces')" />
    <hr class="oc-mb-s" />
    <list-loader v-if="loadSpacesTask.isRunning" />
    <template v-else>
      <no-content-message
        v-if="!spaces.length"
        id="files-spaces-empty"
        class="files-empty"
        icon="layout-grid"
      >
        <template #message>
          <span v-translate>You don't have access to any spaces</span>
        </template>
      </no-content-message>
      <div v-else class="spaces-list">
        <div
          class="
            oc-grid
            oc-grid-match
            oc-grid-column-small
            oc-grid-row-large
            oc-text-center
            oc-child-width-1-3@s
          "
        >
          <a v-for="space in spaces" :key="space.id" href="#" class="oc-mb-m">
            <span class="spaces-list-card oc-border oc-card oc-card-default">
              <span class="oc-card-media-top oc-border-b">
                <img v-if="space.image" :src="space.image" alt="" />
                <oc-icon v-else name="layout-grid" size="xxlarge" class="oc-px-m oc-py-m" />
              </span>
              <span class="oc-card-body">
                <span class="oc-card-title" v-text="space.name" />
              </span>
            </span>
          </a>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import NoContentMessage from '../../components/FilesList/NoContentMessage.vue'
import ListLoader from '../../components/FilesList/ListLoader.vue'
import { client } from 'web-client'
import { ref } from '@vue/composition-api'
import { useStore } from '../../composables'
import { useTask } from 'vue-concurrency'

export default {
  components: {
    NoContentMessage,
    ListLoader
  },
  setup() {
    const store = useStore()
    const spaces = ref([])
    const { graph } = client(store.getters.configuration.server, store.getters.getToken)

    const loadSpacesTask = useTask(function* () {
      const response = yield graph.drives.listMyDrives()
      spaces.value = (response.data?.value || [])
        .filter((drive) => drive.driveType === 'project')
        .sort((a, b) => a.name.localeCompare(b.name))
    })

    loadSpacesTask.perform()

    return {
      spaces,
      loadSpacesTask
    }
  }
}
</script>

<style lang="scss">
#files-spaces-empty {
  height: 50vh;
}

.spaces-list {
  &-card {
    box-shadow: none !important;
  }

  .oc-card-media-top {
    display: inline-block;
    width: 100%;
    background-color: var(--oc-color-background-muted);
    max-height: 150px;
  }
}
</style>
