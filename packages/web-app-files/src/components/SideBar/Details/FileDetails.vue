<template>
  <div id="oc-file-details-sidebar">
    <oc-loader v-if="loading" />
    <div v-else-if="hasContent">
      <div
        v-if="highlightedFile.preview"
        class="details-preview uk-flex uk-flex-middle uk-flex-center oc-mb-m"
      >
        <oc-img :src="highlightedFile.preview" alt="" />
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
      <table class="details-table" aria-label="detailsTableLabel">
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
import { shareTypes, userShareTypes } from '../../../../../web-app-files/src/helpers/shareTypes'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { ImageDimension, ImageType } from '../../../constants'
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
    ...mapGetters(['getToken']),
    ...mapGetters(['user']),

    hasContent() {
      return (
        this.highlightedFile.preview ||
        this.hasTimestamp ||
        this.ownerName ||
        this.showSize ||
        this.showShares ||
        this.showVersions
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
  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadPreview', 'loadVersions']),
    ...mapMutations('Files', ['SET_APP_SIDEBAR_EXPANDED_ACCORDION']),
    expandPeoplesAccordion() {
      this.SET_APP_SIDEBAR_EXPANDED_ACCORDION('sharing-item')
    },
    expandLinksAccordion() {
      this.SET_APP_SIDEBAR_EXPANDED_ACCORDION('links-item')
    },
    expandVersionsAccordion() {
      this.SET_APP_SIDEBAR_EXPANDED_ACCORDION('versions-item')
    },
    async loadData() {
      this.loading = true
      const calls = [
        this.loadPreview({
          resource: this.highlightedFile,
          isPublic: this.isPublicPage,
          dimensions: ImageDimension.Preview,
          type: ImageType.Preview
        })
      ]
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
  background-color: var(--oc-color-background-highlight);
  border-radius: 3px;
  height: 300px;
  padding: 10px;

  img {
    object-fit: contain;
    height: 100%;
    max-height: 100%;
  }
}
</style>
