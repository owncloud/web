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
    <div v-if="hasShares" class="oc-flex oc-flex-middle oc-mb-m oc-text-small" style="gap: 15px">
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
      <tr>
        <th scope="col" class="oc-pr-s" v-text="$gettext('Last activity')" />
        <td v-text="lastModifiedDate" />
      </tr>
      <tr v-if="space.description">
        <th scope="col" class="oc-pr-s" v-text="$gettext('Subtitle')" />
        <td v-text="space.description" />
      </tr>
      <tr>
        <th scope="col" class="oc-pr-s" v-text="$gettext('Manager')" />
        <td>
          <span v-text="ownerUsernames" />
        </td>
      </tr>
      <tr>
        <th scope="col" class="oc-pr-s" v-text="$gettext('Quota')" />
        <td>
          <space-quota :space-quota="space.spaceQuota" />
        </td>
      </tr>
    </table>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, unref } from 'vue'
import { mapGetters } from 'vuex'
import { useTask } from 'vue-concurrency'
import { buildResource } from 'web-client/src/helpers'
import { loadPreview } from 'web-pkg/src/helpers/preview'
import { spaceRoleManager } from 'web-client/src/helpers/share'
import { buildWebDavSpacesPath } from 'web-client/src/helpers'
import { ImageDimension } from '../../../constants'
import { useAccessToken, useStore } from 'web-pkg/src/composables'
import SpaceQuota from '../../SpaceQuota.vue'
import { formatDateFromISO } from 'web-pkg/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from '../../../composables/sideBar'

export default defineComponent({
  name: 'SpaceDetails',
  components: { SpaceQuota },
  setup() {
    const store = useStore()
    const accessToken = useAccessToken({ store })
    const spaceImage = ref('')

    const loadImageTask = useTask(function* (signal, ref) {
      if (!ref.space?.spaceImageData) {
        spaceImage.value = undefined
        return
      }

      const webDavPathComponents = decodeURI(ref.space.spaceImageData.webDavUrl).split('/')
      const idComponent = webDavPathComponents.find((c) => c.startsWith(ref.space.id))
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

    return { loadImageTask, spaceImage }
  },
  computed: {
    ...mapGetters('Files', ['currentFileOutgoingLinks', 'highlightedFile']),
    ...mapGetters('runtime/spaces', ['spaceMembers']),
    ...mapGetters(['user']),
    space() {
      return this.highlightedFile
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
      return formatDateFromISO(this.space.mdate, this.$language.current)
    },
    ownerUsernames() {
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
    'space.spaceImageData': {
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
  }

  th {
    font-weight: 600;
  }
}
</style>
