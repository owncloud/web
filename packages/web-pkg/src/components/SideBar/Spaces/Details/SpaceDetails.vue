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
      v-if="showShareIndicators && hasShares && !resource.disabled"
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
      <tr v-if="showSize" data-testid="sizeInfo">
        <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Size')" />
        <td v-text="size" />
      </tr>
      <web-dav-details v-if="showWebDavDetails" :space="resource" />
      <portal-target
        name="app.files.sidebar.space.details.table"
        :slot-props="{ space: resource, resource }"
        :multiple="true"
      />
    </table>
  </div>
</template>
<script lang="ts">
import { storeToRefs } from 'pinia'
import { defineComponent, inject, ref, Ref, computed, unref } from 'vue'
import { useTask } from 'vue-concurrency'
import {
  getRelativeSpecialFolderSpacePath,
  getSpaceManagers,
  SpaceResource
} from '@ownclouders/web-client'
import {
  usePreviewService,
  useClientService,
  useUserStore,
  useSharesStore,
  useResourcesStore,
  useResourceContents,
  useRouter
} from '../../../../composables'
import SpaceQuota from '../../../SpaceQuota.vue'
import WebDavDetails from '../../WebDavDetails.vue'
import { formatDateFromISO, formatFileSize } from '../../../../helpers'
import { eventBus } from '../../../../services/eventBus'
import { SideBarEventTopics } from '../../../../composables'
import { ImageDimension } from '../../../../constants'
import { ProcessorType } from '../../../../services'
import { isLocationSpacesActive } from '../../../../router'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'SpaceDetails',
  components: { SpaceQuota, WebDavDetails },
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
    const userStore = useUserStore()
    const previewService = usePreviewService()
    const clientService = useClientService()
    const resourcesStore = useResourcesStore()
    const { resourceContentsText } = useResourceContents({ showSizeInformation: false })
    const router = useRouter()
    const { current: currentLanguage } = useGettext()

    const sharesStore = useSharesStore()

    const resource = inject<Ref<SpaceResource>>('resource')
    const spaceImage = ref('')

    const { user } = storeToRefs(userStore)

    const loadImageTask = useTask(function* (signal, ref) {
      if (!ref.resource?.spaceImageData || !props.showSpaceImage) {
        spaceImage.value = undefined
        return
      }

      const imageResource = yield clientService.webdav.getFileInfo(unref(resource), {
        path: getRelativeSpecialFolderSpacePath(unref(resource), 'image')
      })

      spaceImage.value = yield previewService.loadPreview({
        space: unref(resource),
        resource: imageResource,
        dimensions: ImageDimension.Tile,
        processor: ProcessorType.enum.fit
      })
    })

    const linkShareCount = computed(() => sharesStore.linkShares.length)
    const showWebDavDetails = computed(() => resourcesStore.areWebDavDetailsShown)
    const showSize = computed(() => {
      return !isLocationSpacesActive(router, 'files-spaces-projects')
    })
    const size = computed(() => {
      return `${formatFileSize(unref(resource).size, currentLanguage)}, ${unref(
        resourceContentsText
      )}`
    })

    return {
      loadImageTask,
      spaceImage,
      resource,
      linkShareCount,
      showWebDavDetails,
      user,
      resourceContentsText,
      showSize,
      size
    }
  },
  computed: {
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
            { linkShareCount: this.linkShareCount.toString() }
          )
        default:
          if (this.linkShareCount === 1) {
            return this.$gettext('This space has %{memberShareCount} members and one link.', {
              memberShareCount: this.memberShareCount.toString()
            })
          }
          return this.$gettext(
            'This space has %{memberShareCount} members and %{linkShareCount} links.',
            {
              memberShareCount: this.memberShareCount.toString(),
              linkShareCount: this.linkShareCount.toString()
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
      const managers = getSpaceManagers(this.resource)
      return managers
        .map((share) => {
          const member = share.grantedTo.user || share.grantedTo.group
          if (member.id === this.user?.id) {
            return this.$gettext('%{displayName} (me)', { displayName: member.displayName })
          }
          return member.displayName
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
      return Object.keys(this.resource.members).length
    },
    memberShareLabel() {
      return this.$ngettext(
        'This space has %{memberShareCount} member.',
        'This space has %{memberShareCount} members.',
        this.memberShareCount,
        { memberShareCount: this.memberShareCount.toString() }
      )
    },
    linkShareLabel() {
      return this.$ngettext(
        '%{linkShareCount} link giving access.',
        '%{linkShareCount} links giving access.',
        this.linkShareCount,
        { linkShareCount: this.linkShareCount.toString() }
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
