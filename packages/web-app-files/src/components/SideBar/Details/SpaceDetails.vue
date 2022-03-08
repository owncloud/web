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
      v-if="hasMemberShares || hasLinkShares"
      class="oc-flex oc-flex-middle oc-mb-m oc-text-small"
    >
      <div v-if="hasMemberShares" class="oc-flex oc-flex-middle">
        <oc-button
          appearance="raw"
          :aria-label="$gettext('Open the member panel')"
          @click="expandMemberPanel"
        >
          <oc-icon name="group" class="oc-mr-s" />
        </oc-button>
        <span class="oc-mr-xs" v-text="memberShareLabel" />
        <oc-button
          appearance="raw"
          :aria-label="$gettext('Open the member panel')"
          size="small"
          @click="expandMemberPanel"
        >
          <span class="oc-text-small" v-text="$gettext('Show')"></span>
        </oc-button>
      </div>
      <div v-if="hasLinkShares" class="oc-flex oc-flex-middle">
        <oc-icon name="link" class="oc-mr-s" />
        <span v-text="linkShareLabel" />
      </div>
    </div>
    <div>
      <table class="details-table" :aria-label="detailsTableLabel">
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('Last activity')" />
          <td v-text="lastModifyDate" />
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
  </div>
</template>
<script>
import { ref } from '@vue/composition-api'
import Mixins from '../../../mixins'
import MixinResources from '../../../mixins/resources'
import { mapActions, mapGetters } from 'vuex'
import { useTask } from 'vue-concurrency'
import { buildResource, buildWebDavSpacesPath } from '../../../helpers/resources'
import { spaceRoleManager } from '../../../helpers/share'
import SpaceQuota from '../../SpaceQuota.vue'
import { loadPreview } from '../../../helpers/resource'
import { ImageDimension } from '../../../constants'

export default {
  name: 'SpaceDetails',
  components: { SpaceQuota },
  mixins: [Mixins, MixinResources],
  inject: ['displayedItem'],
  title: ($gettext) => {
    return $gettext('Details')
  },
  setup() {
    const spaceImage = ref('')

    const loadImageTask = useTask(function* (signal, ref) {
      if (!ref.space?.spaceImageData) {
        return
      }

      const webDavPathComponents = ref.space.spaceImageData.webDavUrl.split('/')
      const path = webDavPathComponents
        .slice(webDavPathComponents.indexOf(ref.space.id) + 1)
        .join('/')

      const fileInfo = yield ref.$client.files.fileInfo(buildWebDavSpacesPath(ref.space.id, path))
      const resource = buildResource(fileInfo)

      spaceImage.value = yield loadPreview({
        resource,
        isPublic: false,
        dimensions: ImageDimension.Preview,
        server: ref.configuration.server,
        userId: ref.user.id,
        token: ref.getToken
      })
    })

    return { loadImageTask, spaceImage }
  },
  computed: {
    ...mapGetters('Files', [
      'highlightedFile',
      'currentFileOutgoingCollaborators',
      'currentFileOutgoingLinks'
    ]),
    ...mapGetters(['user', 'getToken']),

    space() {
      return this.displayedItem.value
    },
    detailsTableLabel() {
      return this.$gettext('Overview of the information about the selected space')
    },
    lastModifyDate() {
      return this.formDateFromISO(this.space.mdate)
    },
    ownerUsernames() {
      const userId = this.user?.id
      return this.currentFileOutgoingCollaborators
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
      return this.memberShareCount > 1
    },
    hasLinkShares() {
      return this.linkShareCount > 0
    },
    memberShareCount() {
      return this.currentFileOutgoingCollaborators.length
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
      handler(val) {
        if (!val) {
          return
        }
        this.loadImageTask.perform(this)
      },
      deep: true
    }
  },
  mounted() {
    this.loadImageTask.perform(this)
  },
  methods: {
    ...mapActions('Files/sidebar', {
      setSidebarPanel: 'setActivePanel',
      closeSidebar: 'close'
    }),

    expandMemberPanel() {
      this.setSidebarPanel('space-share-item')
    }
  }
}
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
