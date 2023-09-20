<template>
  <div id="oc-space-details-sidebar">
    <div class="oc-space-details-sidebar-image oc-text-center">
      <oc-spinner v-if="loadImageTask.isRunning" />
      <div v-else-if="spaceImage" class="oc-position-relative">
        <img :src="spaceImage" alt="" class="oc-mb-s" />
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
      class="oc-flex oc-flex-middle oc-space-details-sidebar-members oc-mb-s oc-text-small"
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
    <table class="details-table oc-width-1-1" :aria-label="detailsTableLabel">
      <col class="oc-width-1-3" />
      <col class="oc-width-2-3" />
      <tr>
        <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Last activity')" />
        <td v-text="lastModifiedDate" />
      </tr>
      <tr v-if="resource.description">
        <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Subtitle')" />
        <td v-text="resource.description" />
      </tr>
      <tr>
        <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Manager')" />
        <td>
          <span v-text="ownerUsernames" />
        </td>
      </tr>
      <tr v-if="!resource.disabled">
        <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Quota')" />
        <td>
          <space-quota :space-quota="resource.spaceQuota" />
        </td>
      </tr>
      <tr v-if="showSpaceId">
        <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Space ID')" />
        <td class="oc-flex oc-flex-middle">
          <div class="oc-text-truncate" v-text="resource.id" />
          <oc-button class="oc-ml-s" appearance="raw" size="small" @click="copySpaceIdToClipboard">
            <oc-icon :name="copySpaceIdIcon" />
          </oc-button>
        </td>
      </tr>
    </table>
  </div>
</template>
<script lang="ts">
import { defineComponent, inject, ref, computed, unref } from 'vue'
import { mapGetters } from 'vuex'
import { useTask } from 'vue-concurrency'
import { buildResource, buildWebDavSpacesPath, SpaceResource } from 'web-client/src/helpers'
import { spaceRoleManager } from 'web-client/src/helpers/share'
import { ImageDimension } from 'web-pkg/src/constants'
import { useStore, usePreviewService } from 'web-pkg/src/composables'
import SpaceQuota from '../../../SpaceQuota.vue'
import { formatDateFromISO } from 'web-pkg/src/helpers'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'

export default defineComponent({
  name: 'SpaceDetails',
  components: { SpaceQuota },
  props: {
    showSpaceImage: {
      type: Boolean,
      required: false,
      default: true
    },
    showSpaceId: {
      type: Boolean,
      required: false,
      default: false
    },
    showShareIndicators: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  setup(props) {
    const store = useStore()
    const previewService = usePreviewService()
    const resource = inject<SpaceResource>('resource')
    const spaceImage = ref('')
    const copySpaceIdIconInitial = 'file-copy'
    const copySpaceIdIcon = ref(copySpaceIdIconInitial)

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
      const imageResource = buildResource(fileInfo)

      spaceImage.value = yield previewService.loadPreview({
        space: resource,
        resource: imageResource,
        dimensions: ImageDimension.Preview
      })
    })

    const linkShareCount = computed(() => {
      return store.getters['Files/outgoingLinks'].length
    })

    const copySpaceIdToClipboard = () => {
      navigator.clipboard.writeText(unref(resource).id.toString())
      copySpaceIdIcon.value = 'check'
      setTimeout(() => (copySpaceIdIcon.value = copySpaceIdIconInitial), 500)
    }

    return {
      loadImageTask,
      spaceImage,
      resource,
      linkShareCount,
      copySpaceIdIcon,
      copySpaceIdToClipboard
    }
  },
  computed: {
    ...mapGetters('runtime/spaces', ['spaceMembers']),
    ...mapGetters(['user']),
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
          return this.$ngettext(
            'This space has one member and %{linkShareCount} link.',
            'This space has one member and %{linkShareCount} links.',
            this.linkShareCount,
            { linkShareCount: this.linkShareCount }
          )
        default:
          if (this.linkShareCount === 1) {
            return this.$gettext('This space has %{memberShareCount} members and one link.', {
              memberShareCount: this.memberShareCount
            })
          }
          return this.$gettext(
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
      return this.resource.spaceRoles[spaceRoleManager.name]
        .map((share) => {
          if (share.id === this.user?.uuid) {
            return this.$gettext('%{displayName} (me)', { displayName: share.displayName })
          }
          return share.displayName
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
    memberShareLabel() {
      return this.$ngettext(
        'This space has %{memberShareCount} member.',
        'This space has %{memberShareCount} members.',
        this.memberShareCount,
        { memberShareCount: this.memberShareCount }
      )
    },
    linkShareLabel() {
      return this.$ngettext(
        '%{linkShareCount} link giving access.',
        '%{linkShareCount} links giving access.',
        this.linkShareCount,
        { linkShareCount: this.linkShareCount }
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
  table-layout: fixed;

  tr {
    height: 1.5rem;
  }
}
</style>
