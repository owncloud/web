<template>
  <div class="oc-p-s">
    <oc-button
      v-if="hasCreatePermission"
      id="new-space-menu-btn"
      ref="createNewSpaceButton"
      key="new-space-menu-btn-enabled"
      :aria-label="$gettext('Create a new space')"
      variation="primary"
      appearance="filled"
      class="oc-mb-xs"
      data-testid="spaces-list-create-space-btn"
      @click="showCreateSpaceModal"
    >
      <oc-icon name="add" />
      <translate>Create Space</translate>
    </oc-button>
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
        <ul
          class="
            oc-grid
            oc-grid-match
            oc-grid-column-small
            oc-grid-row-large
            oc-text-center
            oc-child-width-1-3@s
          "
        >
          <li v-for="space in spaces" :key="space.id" class="oc-mb-m">
            <div class="spaces-list-card oc-border oc-card oc-card-default">
              <div class="oc-card-media-top oc-border-b">
                <oc-button
                  :id="`space-context-btn-${space.id}`"
                  v-oc-tooltip="$gettext('Show context menu')"
                  :aria-label="$gettext('Show context menu')"
                  class="oc-position-absolute oc-position-top-right oc-mr-s oc-mt-s"
                >
                  <oc-icon name="more-2" />
                </oc-button>
                <oc-drop
                  :drop-id="`space-context-drop-${space.id}`"
                  :toggle="`#space-context-btn-${sanitizeSpaceId(space.id)}`"
                  mode="click"
                  close-on-click
                  :options="{ delayHide: 0 }"
                  padding-size="small"
                  position="bottom-end"
                >
                  <ul class="oc-list oc-files-context-actions">
                    <li
                      v-for="(action, actionIndex) in contextMenuActions"
                      :key="`action-${actionIndex}`"
                      class="oc-spaces-context-action oc-py-xs oc-px-s"
                    >
                      <oc-button
                        appearance="raw"
                        justify-content="left"
                        @click="action.handler(space)"
                      >
                        <oc-icon :name="action.icon" />
                        {{ action.label() }}
                      </oc-button>
                    </li>
                  </ul>
                </oc-drop>
                <router-link :to="getSpaceProjectRoute(space.id)">
                  <img v-if="space.image" :src="space.image" alt="" />
                  <oc-icon v-else name="layout-grid" size="xxlarge" class="oc-px-m oc-py-m" />
                </router-link>
              </div>
              <span class="oc-card-body">
                <router-link
                  :to="getSpaceProjectRoute(space.id)"
                  class="oc-card-title"
                  v-text="space.name"
                />
              </span>
            </div>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script>
import NoContentMessage from '../../components/FilesList/NoContentMessage.vue'
import ListLoader from '../../components/FilesList/ListLoader.vue'
import { client } from 'web-client'
import { ref } from '@vue/composition-api'
import { useStore } from 'web-pkg/src/composables'
import { useTask } from 'vue-concurrency'
import { createLocationSpaces } from '../../router'
import Rename from '../../mixins/spaces/actions/rename'
import { mapActions } from 'vuex'
import Delete from '../../mixins/spaces/actions/delete'

export default {
  components: {
    NoContentMessage,
    ListLoader
  },
  mixins: [Rename, Delete],
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
      graph,
      loadSpacesTask
    }
  },
  computed: {
    hasCreatePermission() {
      // @TODO
      return true
    },
    contextMenuActions() {
      return [...this.$_rename_items, ...this.$_delete_items].filter((item) => item.isEnabled())
    }
  },
  methods: {
    ...mapActions(['createModal', 'hideModal', 'setModalInputErrorMessage']),

    getSpaceProjectRoute(spaceId) {
      return createLocationSpaces('files-spaces-project', {
        params: { spaceId }
      })
    },

    showCreateSpaceModal() {
      const modal = {
        variation: 'passive',
        title: this.$gettext('Create a new space'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Create'),
        hasInput: true,
        inputLabel: this.$gettext('Space name'),
        inputValue: this.$gettext('New space'),
        onCancel: this.hideModal,
        onConfirm: this.addNewSpace,
        onInput: this.checkSpaceName
      }

      this.createModal(modal)
    },

    checkSpaceName(name) {
      if (name.trim() === '') {
        this.setModalInputErrorMessage(this.$gettext('Space name cannot be empty'))
      }
    },

    addNewSpace(name) {
      this.$refs.createNewSpaceButton.$el.blur()

      return this.graph.drives
        .createDrive({ name }, {})
        .then(() => {
          this.hideModal()
          this.loadSpacesTask.perform(this)
        })
        .catch((error) => {
          this.showMessage({
            title: this.$gettext('Creating space failed…'),
            desc: error,
            status: 'danger'
          })
        })
    },

    sanitizeSpaceId(id) {
      return id.replace('!', '\\!')
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

    .oc-card-media-top button {
      top: 0;
      right: 0;
    }
  }

  .oc-card-media-top {
    display: inline-block;
    width: 100%;
    background-color: var(--oc-color-background-muted);
    max-height: 150px;
  }
}
</style>
