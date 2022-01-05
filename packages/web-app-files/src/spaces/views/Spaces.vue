<template>
  <div class="oc-p-s">
    <h2 v-text="$gettext('Spaces')" />
    <div>
      <span v-text="$gettext('Access all project related files in one place.')" />
      <a href="#" v-text="$gettext('Learn more about spaces.')" />
      <h3 v-text="$gettext('Your spaces')" />
      <hr class="oc-mb-s" />
    </div>
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
            uk-grid-match uk-grid-column-small uk-grid-row-large uk-text-center uk-child-width-1-3@s
          "
          uk-grid
        >
          <a v-for="space in spaces" :key="space.id" href="#">
            <span class="spaces-list-card oc-border uk-card uk-card-default">
              <span class="uk-card-media-top oc-border-b">
                <img
                  :src="space.image || defaultImg"
                  :class="{ 'oc-px-m': !space.image, 'oc-py-m': !space.image }"
                  alt=""
                />
              </span>
              <span class="uk-card-body">
                <h3 class="uk-card-title">{{ space.name }}</h3>
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
import { ref } from '@vue/composition-api'
import { useStore } from '../../composables'
import { spacesSDK } from '../sdk'
import { useTask } from 'vue-concurrency'

export default {
  components: {
    NoContentMessage,
    ListLoader
  },
  setup() {
    const store = useStore()
    const spaces = ref([])
    const defaultImg = store.getters.configuration.theme.spaces?.defaultImg

    const loadSpacesTask = useTask(function* (signal) {
      const localSDK = spacesSDK(store.getters.configuration.server, store.getters.getToken)
      const myDrives = (yield localSDK.drives.listMyDrives()).data?.value

      if (!myDrives) {
        return
      }

      spaces.value = myDrives.filter((drive) => drive.driveType === 'project')
    })

    loadSpacesTask.perform()

    return {
      spaces,
      defaultImg,
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

  .uk-card-media-top {
    display: inline-block;
    width: 100%;
    background-color: var(--oc-color-background-muted);
  }

  .uk-card-media-top img {
    max-height: 150px;
  }
}
</style>
