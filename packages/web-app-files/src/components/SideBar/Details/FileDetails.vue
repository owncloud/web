<template>
  <div id="oc-file-details-sidebar">
    <div v-if="hasContent">
      <div
        v-if="highlightedFile.thumbnail"
        :style="{
          'background-image': $asyncComputed.preview.updating ? 'none' : `url(${preview})`
        }"
        class="details-preview uk-flex uk-flex-middle uk-flex-center oc-mb"
        data-testid="preview"
      >
        <oc-spinner v-if="$asyncComputed.preview.updating" />
      </div>
      <div v-if="showShares" data-testid="sharingInfo" class="uk-flex uk-flex-middle oc-my-m">
        <oc-button
          v-if="hasPeopleShares"
          v-oc-tooltip="peopleSharesLabel"
          appearance="raw"
          class="oc-mr-xs"
          :aria-label="peopleSharesLabel"
          @click="expandPeoplesAccordion"
        >
          <oc-icon name="group" />
        </oc-button>
        <oc-button
          v-if="hasLinkShares"
          v-oc-tooltip="linkSharesLabel"
          appearance="raw"
          class="oc-mr-xs"
          :aria-label="linkSharesLabel"
          @click="expandLinksAccordion"
        >
          <oc-icon name="link" />
        </oc-button>
        <p class="oc-my-rm oc-mx-s" v-text="detailSharingInformation" />
      </div>
      <table class="details-table" :aria-label="detailsTableLabel">
        <tr v-if="hasTimestamp" data-testid="timestamp">
          <th scope="col" class="oc-pr-s" v-text="timestampTitle" />
          <td>
            <oc-button
              v-if="showVersions"
              v-oc-tooltip="seeVersionsLabel"
              appearance="raw"
              :aria-label="seeVersionsLabel"
              @click="expandVersionsAccordion"
              v-text="capitalizedTimestamp"
            />
            <span v-else v-text="capitalizedTimestamp" />
          </td>
        </tr>
        <tr v-if="ownerName" data-testid="ownerName">
          <th scope="col" class="oc-pr-s" v-text="ownerTitle" />
          <td>
            <p class="oc-m-rm">
              {{ ownerName }}
              <span v-if="ownedByCurrentUser" v-translate>(me)</span>
              <span v-if="!ownedByCurrentUser && ownerAdditionalInfo"
                >({{ ownerAdditionalInfo }})</span
              >
            </p>
          </td>
        </tr>
        <tr v-if="showSize" data-testid="sizeInfo">
          <th scope="col" class="oc-pr-s" v-text="sizeTitle" />
          <td v-text="getResourceSize(highlightedFile.size)" />
        </tr>
        <tr v-if="showVersions" data-testid="versionsInfo">
          <th scope="col" class="oc-pr-s" v-text="versionsTitle" />
          <td>
            <oc-button
              v-oc-tooltip="seeVersionsLabel"
              appearance="raw"
              :aria-label="seeVersionsLabel"
              @click="expandVersionsAccordion"
              v-text="versions.length"
            />
          </td>
        </tr>
      </table>
    </div>
    <p v-else data-testid="noContentText" v-text="noContentText" />
  </div>
</template>
<script>
import Mixins from '../../../mixins'
import MixinResources from '../../../mixins/resources'
import MixinRoutes from '../../../mixins/routes'
import { shareTypes, userShareTypes } from '../../../helpers/shareTypes'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { ImageDimension } from '../../../constants'
import { loadPreview } from '../../../helpers/resource'
import intersection from 'lodash-es/intersection'
import upperFirst from 'lodash-es/upperFirst'

export default {
  mixins: [Mixins, MixinResources, MixinRoutes],
  title: $gettext => {
    return $gettext('Details')
  },
  data: () => ({
    loading: false
  }),
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'versions']),
    ...mapGetters(['user', 'getToken', 'configuration']),

    hasContent() {
      return (
        this.hasTimestamp || this.ownerName || this.showSize || this.showShares || this.showVersions
      )
    },
    noContentText() {
      return this.$gettext('No information to display')
    },
    detailsTableLabel() {
      return this.$gettext('Overview of the information about the selected file')
    },
    showShares() {
      return this.hasAnyShares && !this.isPublicPage
    },
    detailSharingInformation() {
      const isFolder = this.highlightedFile.type === 'folder'
      if (isFolder) {
        return this.$gettext('This folder has been shared.')
      }
      return this.$gettext('This file has been shared.')
    },
    peopleSharesLabel() {
      return this.$gettext('Show invited people')
    },
    linkSharesLabel() {
      return this.$gettext('Show links')
    },
    hasTimestamp() {
      return this.highlightedFile.mdate?.length > 0 || this.highlightedFile.sdate?.length > 0
    },
    timestampTitle() {
      if (this.highlightedFile.mdate) {
        return this.$gettext('Last modified:')
      }
      return this.$gettext('Shared:')
    },
    ownerTitle() {
      return this.$gettext('Owner:')
    },
    ownerName() {
      return (
        this.highlightedFile.ownerDisplayName ||
        this.highlightedFile.shareOwnerDisplayname ||
        this.highlightedFile.owner?.[0].displayName
      )
    },
    ownerAdditionalInfo() {
      return this.highlightedFile.owner?.[0].additionalInfo
    },
    showSize() {
      return this.getResourceSize(this.highlightedFile.size) !== '?'
    },
    sizeTitle() {
      return this.$gettext('Size:')
    },
    showVersions() {
      if (this.highlightedFile.type === 'folder') {
        return
      }
      return this.versions.length > 0 && !this.isPublicPage
    },
    versionsTitle() {
      return this.$gettext('Versions:')
    },
    seeVersionsLabel() {
      return this.$gettext('See all versions')
    },
    capitalizedTimestamp() {
      let displayDate = ''
      if (this.highlightedFile.mdate) {
        displayDate = this.formDateFromNow(this.highlightedFile.mdate, 'Http')
      } else {
        displayDate = this.formDateFromNow(this.highlightedFile.sdate, 'Http')
      }
      return upperFirst(displayDate)
    },
    hasAnyShares() {
      return (
        this.highlightedFile.shareTypes?.length > 0 || this.highlightedFile.indicators?.length > 0
      )
    },
    hasPeopleShares() {
      return (
        intersection(this.highlightedFile.shareTypes, userShareTypes).length > 0 ||
        this.highlightedFile.indicators?.filter(e => e.icon === 'group').length > 0
      )
    },
    hasLinkShares() {
      return (
        this.highlightedFile.shareTypes.includes(shareTypes.link) ||
        this.highlightedFile.indicators?.filter(e => e.icon === 'link').length > 0
      )
    },
    ownedByCurrentUser() {
      return (
        this.highlightedFile.ownerId === this.user.id ||
        this.highlightedFile.owner?.[0].username === this.user.id ||
        this.highlightedFile.shareOwner === this.user.id
      )
    }
  },
  watch: {
    highlightedFile() {
      this.loadData()
    }
  },
  mounted() {
    this.loadData()
  },
  asyncComputed: {
    preview: {
      async get() {
        // TODO: this timeout resolves flickering of the preview because it's rendered multiple times. Needs a better solution.
        await new Promise(resolve => setTimeout(resolve, 500))
        return loadPreview({
          resource: this.highlightedFile,
          isPublic: this.isPublicPage,
          dimensions: ImageDimension.Preview,
          server: this.configuration.server,
          userId: this.user.id,
          token: this.getToken
        })
      },
      lazy: true,
      watch: ['highlightedFile.thumbnail']
    }
  },
  methods: {
    ...mapActions('Files', ['loadPreview', 'loadVersions']),
    ...mapMutations('Files', ['SET_APP_SIDEBAR_ACTIVE_PANEL']),
    expandPeoplesAccordion() {
      this.SET_APP_SIDEBAR_ACTIVE_PANEL('sharing-item')
    },
    expandLinksAccordion() {
      this.SET_APP_SIDEBAR_ACTIVE_PANEL('links-item')
    },
    expandVersionsAccordion() {
      this.SET_APP_SIDEBAR_ACTIVE_PANEL('versions-item')
    },
    async loadData() {
      this.loading = true
      const calls = []
      if (this.highlightedFile.type === 'file' && !this.isPublicPage) {
        calls.push(this.loadVersions({ client: this.$client, fileId: this.highlightedFile.id }))
      }
      await Promise.all(calls.map(p => p.catch(e => e)))
      this.loading = false
    }
  }
}
</script>
<style lang="scss" scoped>
.details-table {
  text-align: left;

  tr {
    height: 1.5rem;
  }

  th {
    font-weight: 600;
  }
}

.details-preview {
  background-color: var(--oc-color-background-muted);
  border: 10px solid var(--oc-color-background-muted);
  height: 230px;

  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
