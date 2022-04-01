<template>
  <div>
    <app-bar
      class="oc-border-b"
      :breadcrumbs="breadcrumbs"
      :has-view-options="false"
      :has-sidebar-toggle="false"
    >
      <template #actions>
        <create-space />
      </template>
      <template #content>
        <p v-text="spacesHint" />
      </template>
    </app-bar>
    <app-loading-spinner v-if="loadResourcesTask.isRunning" />
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
      <div v-else class="spaces-list oc-px-m oc-mt-l">
        <ul
          class="
            oc-grid
            oc-grid-match
            oc-grid-column-small
            oc-grid-row-large
            oc-text-center
            oc-child-width-1-3@m
            oc-child-width-1-4@l
            oc-child-width-1-5@xl
          "
        >
          <li v-for="space in spaces" :key="space.id" class="oc-mb-m">
            <div
              class="spaces-list-card oc-card oc-card-default oc-rounded"
              :data-space-id="space.id"
              :class="getSpaceCardAdditionalClass(space)"
            >
              <div class="oc-card-media-top oc-border-b">
                <router-link :to="getSpaceProjectRoute(space)">
                  <oc-tag
                    v-if="space.disabled"
                    class="oc-position-absolute space-disabled-indicator"
                    type="span"
                  >
                    <span v-translate>Disabled</span>
                  </oc-tag>
                  <img
                    v-if="imageContentObject[space.id]"
                    class="space-image oc-rounded-top"
                    :src="imageContentObject[space.id]['data']"
                    alt=""
                  />
                  <oc-icon
                    v-else
                    name="layout-grid"
                    size="xxlarge"
                    class="space-default-image oc-px-m oc-py-m"
                  />
                </router-link>
              </div>
              <div class="oc-card-body oc-p-s">
                <div class="oc-flex oc-flex-between oc-flex-middle">
                  <div class="oc-flex oc-flex-middle">
                    <oc-icon class="oc-mr-s" name="layout-grid" />
                    <router-link class="space-name oc-text-left" :to="getSpaceProjectRoute(space)">
                      <span v-text="space.name"> </span>
                    </router-link>
                  </div>
                  <div class="oc-flex oc-flex-middle">
                    <div>
                      <oc-button
                        v-oc-tooltip="$gettext('Show members')"
                        :aria-label="$gettext('Show members')"
                        appearance="raw"
                        @click="openSidebarSharePanel(space)"
                      >
                        <oc-icon name="group" />
                      </oc-button>
                    </div>
                    <div>
                      <oc-button
                        :id="`space-context-btn-${sanitizeStorageId(space.id)}`"
                        v-oc-tooltip="$gettext('Show context menu')"
                        :aria-label="$gettext('Show context menu')"
                        appearance="raw"
                      >
                        <oc-icon name="more-2" />
                      </oc-button>
                      <oc-drop
                        :drop-id="`space-context-drop-${space.id}`"
                        :toggle="`#space-context-btn-${sanitizeStorageId(space.id)}`"
                        mode="click"
                        close-on-click
                        :options="{ delayHide: 0 }"
                        padding-size="small"
                        position="bottom-end"
                      >
                        <space-context-actions :items="[space]" />
                      </oc-drop>
                    </div>
                  </div>
                </div>
                <p
                  v-if="space.description"
                  class="oc-text-left oc-ml-xs oc-mt-xs oc-mb-rm oc-text-truncate"
                >
                  <small v-text="space.description"></small>
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import AppBar from '../../components/AppBar/AppBar.vue'
import CreateSpace from '../../components/AppBar/CreateSpace.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import { computed, defineComponent } from '@vue/composition-api'
import { useStore } from 'web-pkg/src/composables'
import { useTask } from 'vue-concurrency'
import { createLocationSpaces } from '../../router'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { buildResource, buildSpace, buildWebDavSpacesPath } from '../../helpers/resources'
import { clientService } from 'web-pkg/src/services'
import { loadPreview } from '../../helpers/resource'
import { ImageDimension } from '../../constants'
import SpaceContextActions from '../../components/Spaces/SpaceContextActions.vue'

export default defineComponent({
  components: {
    AppBar,
    AppLoadingSpinner,
    CreateSpace,
    NoContentMessage,
    SpaceContextActions
  },
  setup() {
    const store = useStore()
    const spaces = computed(() => store.getters['Files/activeFiles'] || [])
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    const loadResourcesTask = useTask(function* (signal, ref) {
      ref.CLEAR_CURRENT_FILES_LIST()

      const response = yield graphClient.drives.listMyDrives('name asc', 'driveType eq project')
      let loadedSpaces = response.data?.value || []

      loadedSpaces = loadedSpaces.map(buildSpace)
      ref.LOAD_FILES({ currentFolder: null, files: loadedSpaces })
    })

    return {
      spaces,
      graphClient,
      loadResourcesTask
    }
  },
  data: function () {
    return {
      imageContentObject: {}
    }
  },
  computed: {
    ...mapGetters(['user', 'getToken']),
    breadcrumbs() {
      return [{ text: this.$gettext('Spaces') }]
    },
    spacesHint() {
      return this.$gettext('Store your project related files in Spaces for seamless collaboration.')
    },
    hasCreatePermission() {
      // @TODO
      return true
    }
  },
  watch: {
    spaces: {
      handler: function (val) {
        if (!val) return

        for (const space of this.spaces) {
          if (!space.spaceImageData) {
            continue
          }

          if (this.imageContentObject[space.id]?.fileId === space.spaceImageData?.id) {
            continue
          }

          const webDavPathComponents = space.spaceImageData.webDavUrl.split('/')
          const path = webDavPathComponents
            .slice(webDavPathComponents.indexOf(space.id) + 1)
            .join('/')

          this.$client.files.fileInfo(buildWebDavSpacesPath(space.id, path)).then((fileInfo) => {
            const resource = buildResource(fileInfo)
            loadPreview({
              resource,
              isPublic: false,
              dimensions: ImageDimension.Preview,
              server: this.configuration.server,
              userId: this.user.id,
              token: this.getToken
            }).then((imageBlob) => {
              this.$set(this.imageContentObject, space.id, {
                fileId: space.spaceImageData.id,
                data: imageBlob
              })
            })
          })
        }
      },
      deep: true
    }
  },
  created() {
    this.loadResourcesTask.perform(this)
  },
  methods: {
    ...mapActions('Files/sidebar', {
      openSidebarWithPanel: 'openWithPanel'
    }),
    ...mapMutations('Files', [
      'SET_CURRENT_FOLDER',
      'LOAD_FILES',
      'CLEAR_CURRENT_FILES_LIST',
      'SET_FILE_SELECTION'
    ]),

    getSpaceProjectRoute({ id, name }) {
      return createLocationSpaces('files-spaces-project', {
        params: { storageId: id, name }
      })
    },

    sanitizeStorageId(id) {
      return id.replace('!', '\\!').split('.')[0]
    },

    getSpaceCardAdditionalClass(space) {
      if (space.disabled) {
        return 'state-trashed'
      }
      return ''
    },

    openSidebarSharePanel(space) {
      this.SET_FILE_SELECTION([space])
      this.openSidebarWithPanel('space-share-item')
    }
  }
})
</script>

<style lang="scss">
#files-spaces-empty {
  height: 50vh;
}

.spaces-list {
  &-card {
    box-shadow: none !important;
    background-color: var(--oc-color-background-highlight) !important;
  }

  &-card.state-trashed {
    .space-image,
    .space-default-image > svg {
      filter: grayscale(100%);
      opacity: 80%;
    }
  }

  .oc-card-media-top {
    width: 100%;
    height: 150px;
  }

  .oc-card-media-top a {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .oc-tag {
    color: var(--oc-color-text-default);
  }

  .space-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }

  .space-name {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: var(--oc-color-text-default);
  }

  .space-disabled-indicator {
    z-index: 999;
  }
}
</style>
