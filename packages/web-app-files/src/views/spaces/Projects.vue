<template>
  <div>
    <app-bar
      class="oc-border-b"
      :breadcrumbs="breadcrumbs"
      :has-view-options="false"
      :has-sidebar-toggle="false"
      :show-actions-on-selection="true"
    >
      <template #actions>
        <create-space v-if="hasCreatePermission" />
      </template>
      <template #content>
        <p v-text="spacesHint" />
      </template>
    </app-bar>
    <app-loading-spinner v-if="areResourcesLoading" />
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
          <li v-for="space in spaces" :key="space.getDomSelector()" class="oc-mb-m">
            <div
              class="spaces-list-card oc-card oc-card-default oc-rounded"
              :data-space-id="space.id"
              :class="getSpaceCardAdditionalClass(space)"
            >
              <div class="oc-card-media-top oc-border-b">
                <component
                  :is="space.disabled ? 'oc-button' : 'router-link'"
                  v-bind="getSpaceLinkProps(space)"
                  v-on="getSpaceLinkListeners(space)"
                >
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
                </component>
              </div>
              <div class="oc-card-body oc-p-s">
                <div class="oc-flex oc-flex-between oc-flex-middle">
                  <div class="oc-flex oc-flex-middle">
                    <oc-icon class="oc-mr-s" name="layout-grid" />
                    <component
                      :is="space.disabled ? 'oc-button' : 'router-link'"
                      v-bind="getSpaceLinkProps(space)"
                      class="space-name oc-text-left"
                      v-on="getSpaceLinkListeners(space)"
                    >
                      <span v-text="space.name"> </span>
                    </component>
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
                        :id="`space-context-btn-${space.getDomSelector()}`"
                        v-oc-tooltip="$gettext('Show context menu')"
                        :aria-label="$gettext('Show context menu')"
                        appearance="raw"
                      >
                        <oc-icon name="more-2" />
                      </oc-button>
                      <oc-drop
                        :drop-id="`space-context-drop-${space.getDomSelector()}`"
                        :toggle="`#space-context-btn-${space.getDomSelector()}`"
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
import { computed, defineComponent, unref } from '@vue/composition-api'
import { useAccessToken, useStore } from 'web-pkg/src/composables'
import { useTask } from 'vue-concurrency'
import { createLocationSpaces } from '../../router'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { buildResource, buildSpace, buildWebDavSpacesPath } from '../../helpers/resources'
import { loadPreview } from '../../helpers/resource'
import { ImageDimension } from '../../constants'
import SpaceContextActions from '../../components/Spaces/SpaceContextActions.vue'
import { useGraphClient } from 'web-client/src/composables'
import { configurationManager } from 'web-pkg/src/configuration'

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
    const accessToken = useAccessToken({ store })
    const { graphClient } = useGraphClient()

    const loadResourcesTask = useTask(function* (signal, ref) {
      ref.CLEAR_FILES_SEARCHED()
      ref.CLEAR_CURRENT_FILES_LIST()

      const response = yield unref(graphClient).drives.listMyDrives(
        'name asc',
        'driveType eq project'
      )
      let loadedSpaces = response.data?.value || []

      loadedSpaces = loadedSpaces.map(buildSpace)
      ref.LOAD_FILES({ currentFolder: null, files: loadedSpaces })
    })

    return {
      spaces,
      graphClient,
      loadResourcesTask,
      accessToken
    }
  },
  data: function () {
    return {
      imageContentObject: {}
    }
  },
  computed: {
    ...mapGetters(['user']),
    breadcrumbs() {
      return [{ text: this.$gettext('Spaces') }]
    },
    spacesHint() {
      return this.$gettext('Store your project related files in Spaces for seamless collaboration.')
    },
    hasCreatePermission() {
      return this.$permissionManager.hasSpaceManagement()
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

          const decodedUri = decodeURI(space.spaceImageData.webDavUrl)
          const webDavPathComponents = decodedUri.split('/')
          const idComponent = webDavPathComponents.find((c) => c.startsWith(space.id))
          if (!idComponent) {
            return
          }
          const path = webDavPathComponents
            .slice(webDavPathComponents.indexOf(idComponent) + 1)
            .join('/')

          this.$client.files
            .fileInfo(buildWebDavSpacesPath(idComponent, decodeURIComponent(path)))
            .then((fileInfo) => {
              const resource = buildResource(fileInfo)
              loadPreview({
                resource,
                isPublic: false,
                dimensions: ImageDimension.Preview,
                server: configurationManager.serverUrl,
                userId: this.user.id,
                token: this.accessToken
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
    ...mapActions(['showMessage']),
    ...mapMutations('Files', [
      'SET_CURRENT_FOLDER',
      'LOAD_FILES',
      'CLEAR_CURRENT_FILES_LIST',
      'CLEAR_FILES_SEARCHED',
      'SET_FILE_SELECTION'
    ]),

    getSpaceProjectRoute({ id, name, disabled }) {
      return disabled
        ? '#'
        : createLocationSpaces('files-spaces-project', {
            params: { storageId: id, name }
          })
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
    },

    getSpaceLinkProps(space) {
      if (space.disabled) {
        return {
          appearance: 'raw'
        }
      }
      return { to: this.getSpaceProjectRoute(space) }
    },

    getSpaceLinkListeners(space) {
      if (!space.disabled) {
        return {}
      }

      return {
        click: () => {
          this.showMessage({
            title: this.$gettext('Disabled spaces cannot be entered'),
            status: 'warning'
          })
        }
      }
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
    aspect-ratio: 16/9;
  }

  .oc-card-media-top a {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .oc-card-media-top button {
    width: 100%;
    height: 100%;
  }

  .oc-tag {
    color: var(--oc-color-text-default);
  }

  .space-image {
    width: 100%;
    aspect-ratio: 16/9;
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

  .spaces-list-projects {
    aspect-ratio: 16/9;
  }
}
</style>
