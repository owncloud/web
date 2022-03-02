<template>
  <div id="oc-space-details-sidebar">
    <div class="oc-space-details-sidebar-image oc-text-center">
      <oc-spinner v-if="loadImageTask.isRunning" />
      <div v-else-if="spaceImage" class="oc-position-relative">
        <img :src="'data:image/jpeg;base64,' + spaceImage" alt="" class="oc-mb-m" />
      </div>
      <oc-icon
        v-else
        name="layout-grid"
        size="xxlarge"
        class="space-default-image oc-px-m oc-py-m"
      />
    </div>
    <div v-if="hasPeopleShares || hasLinkShares" class="oc-flex oc-flex-middle oc-mb-m">
      <oc-button
        v-if="hasPeopleShares"
        appearance="raw"
        :aria-label="$gettext('Open the people panel')"
        @click="expandPeoplePanel"
      >
        <oc-icon name="group" class="oc-mr-s" />
      </oc-button>
      <oc-icon v-if="hasLinkShares" name="link" class="oc-mr-s" />
      <span class="oc-text-small" v-text="shareLabel" />
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
import { buildWebDavSpacesPath } from '../../../helpers/resources'
import { spaceManager } from '../../../helpers/share'
import SpaceQuota from '../../SpaceQuota.vue'

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

      const fileContents = yield ref.$client.files.getFileContents(
        buildWebDavSpacesPath(ref.space.id, path),
        { responseType: 'arrayBuffer' }
      )

      spaceImage.value = Buffer.from(fileContents).toString('base64')
    })

    return { loadImageTask, spaceImage }
  },
  computed: {
    ...mapGetters('Files', [
      'highlightedFile',
      'currentFileOutgoingCollaborators',
      'currentFileOutgoingLinks'
    ]),
    ...mapGetters(['user']),

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
        .filter((share) => share.role.name === spaceManager.name)
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
    hasPeopleShares() {
      return this.peopleShareCount > 1
    },
    hasLinkShares() {
      return this.linkShareCount > 1
    },
    peopleShareCount() {
      return this.currentFileOutgoingCollaborators.length
    },
    linkShareCount() {
      return this.currentFileOutgoingLinks.length
    },
    shareLabel() {
      let peopleString, linksString

      if (this.hasPeopleShares) {
        peopleString = this.$gettextInterpolate(
          this.$ngettext(
            'This space has been shared with %{peopleShareCount} person.',
            'This space has been shared with %{peopleShareCount} people.',
            this.peopleShareCount
          ),
          {
            peopleShareCount: this.peopleShareCount
          }
        )
      }

      if (this.hasLinkShares) {
        linksString = this.$gettextInterpolate(
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

      if (peopleString && linksString) {
        return `${peopleString} ${linksString}`
      }

      if (peopleString) {
        return peopleString
      }

      if (linksString) {
        return linksString
      }

      return ''
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

    expandPeoplePanel() {
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
