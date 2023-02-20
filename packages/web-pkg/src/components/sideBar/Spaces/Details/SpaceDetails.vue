<template>
  <div id="oc-space-details-sidebar">
    <div class="oc-space-details-sidebar-image oc-text-center">
      <oc-spinner v-if="loadImageTask.isRunning" />
      <div v-else-if="spaceImage" class="oc-position-relative">
        <img :src="spaceImage" alt="" class="oc-mb-m" />
      </div>
      <oc-icon
        v-else
        name="layout-grid"
        size="xxlarge"
        class="space-default-image oc-px-m oc-py-m"
      />
    </div>
    <div
      v-if="showShareIndicators && hasShares"
      class="oc-flex oc-flex-middle oc-space-details-sidebar-members oc-mb-m oc-text-small"
      style="gap: 15px"
    >
      <oc-button
        v-if="hasMemberShares"
        appearance="raw"
        :aria-label="openSharesPanelMembersHint"
        @click="expandSharesPanel"
      >
        <oc-icon name="group" />
      </oc-button>
      <oc-button
        v-if="hasLinkShares"
        appearance="raw"
        :aria-label="openSharesPanelLinkHint"
        @click="expandSharesPanel"
      >
        <oc-icon name="link" />
      </oc-button>
      <p v-text="shareLabel" />
      <oc-button
        appearance="raw"
        :aria-label="openSharesPanelHint"
        size="small"
        @click="expandSharesPanel"
      >
        <span class="oc-text-small" v-text="$gettext('Show')" />
      </oc-button>
    </div>

    <table class="details-table" :aria-label="detailsTableLabel">
      <!--<tr>
        <th scope="col" class="oc-pr-s" v-text="$gettext('Last activity')" />
        <td v-text="lastModifiedDate" />
      </tr>-->
      <tr v-if="resource.description">
        <th scope="col" class="oc-pr-s" v-text="$gettext('Subtitle')" />
        <td v-text="resource.description" />
      </tr>
      <tr v-if="runningOnEos && !isPublicLinkContext">
        <th scope="col" class="oc-pr-s" v-text="eosPathLabel" />
        <td>
          <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1">
            <p
              ref="filePath"
              v-oc-tooltip="resource.driveAlias"
              class="oc-my-rm oc-text-truncate"
              v-text="resource.driveAlias"
            />
            <oc-button
              v-if="isClipboardCopySupported"
              v-oc-tooltip="copyEosPathLabel"
              :aria-label="copyEosPathLabel"
              appearance="raw"
              :variation="copiedEos ? 'success' : 'passive'"
              @click="copyEosPathToClipboard"
            >
              <oc-icon
                v-if="copiedEos"
                key="oc-copy-to-clipboard-copied"
                name="checkbox-circle"
                class="_clipboard-success-animation"
              />
              <oc-icon v-else key="oc-copy-to-clipboard-copy" name="clipboard" />
            </oc-button>
          </div>
        </td>
      </tr>
      <tr v-if="cernFeatures && getSambaPath(resource.driveAlias) && !isPublicLinkContext">
        <th scope="col" class="oc-pr-s" v-text="sambaPathLabel" />
        <td>
          <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1">
            <p
              ref="sambaFilePath"
              v-oc-tooltip="getSambaPath(resource.driveAlias)"
              class="oc-my-rm oc-text-truncate"
              v-text="getSambaPath(resource.driveAlias)"
            />
            <oc-button
              v-oc-tooltip="copySambaPathLabel"
              :aria-label="copySambaPathLabel"
              appearance="raw"
              :variation="copiedSamba ? 'success' : 'passive'"
              @click="copySambaPathToClipboard"
            >
              <oc-icon
                v-if="copiedSamba"
                key="oc-copy-to-clipboard-copied"
                name="checkbox-circle"
                class="_clipboard-success-animation"
              />
              <oc-icon v-else key="oc-copy-to-clipboard-copy" name="clipboard" />
            </oc-button>
          </div>
        </td>
      </tr>
      <tr v-if="runningOnEos">
        <th scope="col" class="oc-pr-s" v-text="directLinkLabel" />
        <td>
          <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1">
            <p v-oc-tooltip="directLink" class="oc-my-rm oc-text-truncate" v-text="directLink" />
            <oc-button
              v-if="isClipboardCopySupported"
              v-oc-tooltip="copyDirectLinkLabel"
              :aria-label="copyDirectLinkLabel"
              appearance="raw"
              :variation="copiedDirect ? 'success' : 'passive'"
              @click="copyDirectLinkToClipboard"
            >
              <oc-icon
                v-if="copiedDirect"
                key="oc-copy-to-clipboard-copied"
                name="checkbox-circle"
                class="_clipboard-success-animation"
              />
              <oc-icon v-else key="oc-copy-to-clipboard-copy" name="clipboard" />
            </oc-button>
          </div>
        </td>
      </tr>
      <!--<tr>
        <th scope="col" class="oc-pr-s" v-text="$gettext('Manager')" />
        <td>
          <span v-text="ownerUsernames" />
        </td>
      </tr>
      <tr v-if="!resource.disabled">
        <th scope="col" class="oc-pr-s" v-text="$gettext('Quota')" />
        <td>
          <space-quota :space-quota="resource.spaceQuota" />
        </td>
      </tr>-->
    </table>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, inject, ref, unref } from 'vue'
import { mapGetters } from 'vuex'
import { useTask } from 'vue-concurrency'
import { buildResource, Resource } from 'web-client/src/helpers'
import { loadPreview } from 'web-pkg/src/helpers/preview'
import { spaceRoleManager } from 'web-client/src/helpers/share'
import { buildWebDavSpacesPath } from 'web-client/src/helpers'
import { ImageDimension } from 'web-pkg/src/constants'
import { useAccessToken, useStore, usePublicLinkContext } from 'web-pkg/src/composables'
import SpaceQuota from '../../../SpaceQuota.vue'
import { formatDateFromISO } from 'web-pkg/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { useClipboard } from '@vueuse/core'
import { useGettext } from 'vue3-gettext'
import { encodePath } from '../../../../utils'

export default defineComponent({
  name: 'SpaceDetails',
  components: { SpaceQuota },
  props: {
    showSpaceImage: {
      type: Boolean,
      required: false,
      default: true
    },
    showShareIndicators: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  setup(props) {
    const store = useStore()
    const accessToken = useAccessToken({ store })
    const resource = inject<Resource>('resource')
    const spaceImage = ref('')

    const { $gettext } = useGettext()
    const copiedDirect = ref(false)
    const copiedEos = ref(false)
    const copiedSamba = ref(false)
    const {
      copy,
      copied,
      isSupported: isClipboardCopySupported
    } = useClipboard({ legacy: true, copiedDuring: 550 })
    const isPublicLinkContext = usePublicLinkContext({ store })

    const directLink = computed(() => {
      return !unref(isPublicLinkContext)
        ? `${store.getters.configuration.server}files/spaces${encodePath(
            unref(resource).driveAlias
          )}`
        : `${store.getters.configuration.server.replace(/\/+$/, '')}${unref(resource).downloadURL}`
    })

    const copyEosPathToClipboard = () => {
      copy(unref(resource).driveAlias)
      copiedEos.value = unref(copied)
      store.dispatch('showMessage', {
        title: $gettext('FUSE path copied'),
        desc: $gettext('The FUSE path has been copied to your clipboard.')
      })
    }

    const copySambaPathToClipboard = () => {
      copy(getSambaPath(unref(resource).driveAlias))
      copiedSamba.value = unref(copied)
      store.dispatch('showMessage', {
        title: $gettext('Windows path copied'),
        desc: $gettext('The Windows path has been copied to your clipboard.')
      })
    }

    const pathMapping = {
      project: '\\\\eosproject-smb\\eos\\project\\'
    }

    const getSambaPath = (path) => {
      const pathComponents = path?.split('/').filter(Boolean)
      if (pathComponents.length > 1 && pathComponents[0] === 'eos') {
        const translated = pathMapping[pathComponents[1]]
        return translated && `${translated}${pathComponents.slice(2).join('\\')}`
      }
    }

    const copyDirectLinkToClipboard = () => {
      copy(unref(directLink))
      copiedDirect.value = unref(copied)
      store.dispatch('showMessage', {
        title: $gettext('Direct link copied'),
        desc: $gettext('The direct link has been copied to your clipboard.')
      })
    }

    const loadImageTask = useTask(function* (signal, ref) {
      if (!ref.resource?.spaceImageData || !props.showSpaceImage) {
        spaceImage.value = undefined
        return
      }

      const webDavPathComponents = decodeURI(ref.resource.spaceImageData.webDavUrl).split('/')
      const idComponent = webDavPathComponents.find((c) => c.startsWith(ref.resource.id))
      if (!idComponent) {
        return
      }
      const path = webDavPathComponents
        .slice(webDavPathComponents.indexOf(idComponent) + 1)
        .join('/')

      const fileInfo = yield ref.$client.files.fileInfo(
        buildWebDavSpacesPath(idComponent, decodeURIComponent(path))
      )
      const resource = buildResource(fileInfo)

      spaceImage.value = yield loadPreview({
        resource,
        isPublic: false,
        dimensions: ImageDimension.Preview,
        server: configurationManager.serverUrl,
        userId: ref.user.id,
        token: unref(accessToken)
      })
    })

    return {
      loadImageTask,
      spaceImage,
      resource,
      copyEosPathToClipboard,
      copySambaPathToClipboard,
      getSambaPath,
      copiedEos,
      copiedSamba,
      copiedDirect,
      directLink,
      copyDirectLinkToClipboard,
      isClipboardCopySupported,
      isPublicLinkContext
    }
  },
  computed: {
    ...mapGetters('Files', ['currentFileOutgoingLinks']),
    ...mapGetters('runtime/spaces', ['spaceMembers']),
    ...mapGetters(['user']),
    ...mapGetters(['user', 'configuration']),
    runningOnEos() {
      return !!this.configuration?.options?.runningOnEos
    },
    cernFeatures() {
      return !!this.configuration?.options?.cernFeatures
    },
    directLinkLabel() {
      return this.$gettext('Direct link')
    },
    copyDirectLinkLabel() {
      return this.$gettext('Copy direct link')
    },
    eosPathLabel() {
      return this.$gettext('FUSE Path')
    },
    copyEosPathLabel() {
      return this.$gettext('Copy FUSE path')
    },
    sambaPathLabel() {
      return this.$gettext('Windows Path')
    },
    copySambaPathLabel() {
      return this.$gettext('Copy Windows path')
    },
    hasShares() {
      return this.hasMemberShares || this.hasLinkShares
    },
    shareLabel() {
      if (this.hasMemberShares && !this.hasLinkShares) {
        return this.memberShareLabel
      }
      if (!this.hasMemberShares && this.hasLinkShares) {
        return this.linkShareLabel
      }

      switch (this.memberShareCount) {
        case 1:
          return this.$gettextInterpolate(
            this.$ngettext(
              'This space has one member and %{linkShareCount} link.',
              'This space has one member and %{linkShareCount} links.',
              this.linkShareCount
            ),
            {
              linkShareCount: this.linkShareCount
            }
          )
        default:
          if (this.linkShareCount === 1) {
            return this.$gettextInterpolate(
              'This space has %{memberShareCount} members and one link.',
              {
                memberShareCount: this.memberShareCount
              }
            )
          }
          return this.$gettextInterpolate(
            'This space has %{memberShareCount} members and %{linkShareCount} links.',
            {
              memberShareCount: this.memberShareCount,
              linkShareCount: this.linkShareCount
            }
          )
      }
    },
    openSharesPanelHint() {
      return this.$gettext('Open share panel')
    },
    openSharesPanelLinkHint() {
      return this.$gettext('Open link list in share panel')
    },
    openSharesPanelMembersHint() {
      return this.$gettext('Open member list in share panel')
    },
    detailsTableLabel() {
      return this.$gettext('Overview of the information about the selected space')
    },
    lastModifiedDate() {
      return formatDateFromISO(this.resource.mdate, this.$language.current)
    },
    ownerUsernames() {
      /* TODO: Find a better solution for reactiveness
         Why: Currently we use a different logic for the admin-panel and we need a solution that works for both
      */
      if (this.spaceResource) {
        return this.resource.spaceRoles[spaceRoleManager.name]
          .map((share) => {
            if (share.displayName === this.user?.displayName) {
              return this.$gettextInterpolate(this.$gettext('%{displayName} (me)'), {
                displayName: share.displayName
              })
            }
            return share.displayName
          })
          .join(', ')
      }
      const userId = this.user?.id
      return this.spaceMembers
        .filter((share) => share.role.name === spaceRoleManager.name)
        .map((share) => {
          if (share.collaborator.name === userId) {
            return this.$gettextInterpolate(this.$gettext('%{displayName} (me)'), {
              displayName: share.collaborator.displayName
            })
          }
          return share.collaborator.displayName
        })
        .join(', ')
    },
    hasMemberShares() {
      return this.memberShareCount > 0
    },
    hasLinkShares() {
      return this.linkShareCount > 0
    },
    memberShareCount() {
      return this.spaceMembers.length
    },
    linkShareCount() {
      return this.currentFileOutgoingLinks.length
    },
    memberShareLabel() {
      return this.$gettextInterpolate(
        this.$ngettext(
          'This space has %{memberShareCount} member.',
          'This space has %{memberShareCount} members.',
          this.memberShareCount
        ),
        {
          memberShareCount: this.memberShareCount
        }
      )
    },
    linkShareLabel() {
      return this.$gettextInterpolate(
        this.$ngettext(
          '%{linkShareCount} link giving access.',
          '%{linkShareCount} links giving access.',
          this.linkShareCount
        ),
        {
          linkShareCount: this.linkShareCount
        }
      )
    }
  },
  watch: {
    'resource.spaceImageData': {
      handler() {
        this.loadImageTask.perform(this)
      },
      deep: true
    }
  },
  mounted() {
    this.loadImageTask.perform(this)
  },
  methods: {
    expandSharesPanel() {
      eventBus.publish(SideBarEventTopics.setActivePanel, 'space-share')
    }
  }
})
</script>
<style lang="scss" scoped>
.oc-space-details-sidebar {
  &-image img {
    max-height: 150px;
    object-fit: cover;
    width: 100%;
  }
}

.details-table {
  text-align: left;

  tr {
    height: 1.5rem;

    td {
      max-width: 0;
      width: 100%;
      overflow-wrap: break-word;

      div {
        min-width: 0;
      }
    }
  }

  th {
    font-weight: 600;
    white-space: nowrap;
  }
}
</style>
