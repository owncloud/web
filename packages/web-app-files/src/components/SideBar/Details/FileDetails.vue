<template>
  <div id="oc-file-details-sidebar">
    <oc-loader v-if="loading" />
    <div v-if="!loading">
      <div
        v-if="highlightedFile.preview"
        class="details-preview uk-flex uk-flex-middle uk-flex-center oc-mb-m"
      >
        <oc-img :src="highlightedFile.preview" alt="" />
      </div>
      <div
        v-if="highlightedFile.shareTypes.length > 0 && !isPublicFilesRoute"
        class="uk-flex uk-flex-middle oc-my-m"
      >
        <oc-button
          v-if="highlightedFile.shareTypes.includes(0)"
          v-oc-tooltip="sharesLabel"
          appearance="raw"
          class="oc-mr-xs"
          :aria-label="sharesLabel"
          @click="expandPeoplesAccordion()"
        >
          <oc-icon name="group" />
        </oc-button>
        <oc-button
          v-if="highlightedFile.shareTypes.includes(3)"
          v-oc-tooltip="linksLabel"
          appearance="raw"
          class="oc-mr-xs"
          :aria-label="linksLabel"
          @click="expandLinksAccordion()"
        >
          <oc-icon name="link" />
        </oc-button>
        <p class="oc-my-rm oc-ml-s" v-text="detailSharingInformation" />
      </div>
      <table class="details-table">
        <tr>
          <th class="oc-pr-s" v-text="lastModifiedTitle" />
          <td>
            <oc-button
              v-if="versions.length > 0 && !isPublicFilesRoute"
              v-oc-tooltip="seeVersionsLabel"
              appearance="raw"
              :aria-label="seeVersionsLabel"
              @click="expandVersionsAccordion()"
              v-text="capitalizedModifiedDate"
            />
            <span v-else v-text="capitalizedModifiedDate" />
          </td>
        </tr>
        <tr v-if="!isPublicFilesRoute">
          <th class="oc-pr-s" v-text="ownerTitle" />
          <td v-text="highlightedFile.ownerDisplayName" />
        </tr>
        <tr>
          <th class="oc-pr-s" v-text="sizeTitle" />
          <td v-text="getResourceSize(highlightedFile.size)" />
        </tr>
        <tr v-if="versions.length > 0 && !isPublicFilesRoute">
          <th class="oc-pr-s" v-text="versionsTitle" />
          <td>
            <oc-button
              v-oc-tooltip="seeVersionsLabel"
              appearance="raw"
              :aria-label="seeVersionsLabel"
              @click="expandVersionsAccordion()"
              v-text="versions.length"
            />
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
import Mixins from '../../../mixins'
import MixinResources from '../../../mixins/resources'
import MixinRoutes from '../../../mixins/routes'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { ImageDimension } from '../../../constants'

export default {
  mixins: [Mixins, MixinResources, MixinRoutes],
  title: $gettext => {
    return $gettext('Details')
  },
  data: () => ({
    versions: [],
    loading: false
  }),
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['getToken']),

    detailSharingInformation() {
      return this.$gettext(
        'This file has been shared. Manage people and links by clicking on the icons on the left or on the sections below'
      )
    },
    sharesLabel() {
      return this.$gettext('Show invited people')
    },
    linksLabel() {
      return this.$gettext('Show links')
    },
    lastModifiedTitle() {
      return this.$gettext('Last modified:')
    },
    ownerTitle() {
      return this.$gettext('Owner:')
    },
    sizeTitle() {
      return this.$gettext('Size:')
    },
    versionsTitle() {
      return this.$gettext('Versions:')
    },
    seeVersionsLabel() {
      return this.$gettext('See all versions')
    },
    capitalizedModifiedDate() {
      const lastModifiedDate = this.formDateFromNow(this.highlightedFile.mdate)
      return lastModifiedDate.charAt(0).toUpperCase() + lastModifiedDate.slice(1)
    },
    currentFile() {
      return this.highlightedFile
    }
  },
  watch: {
    currentFile() {
      this.getFileVersions()
    }
  },
  mounted() {
    this.getFileVersions()
    this.setPreviewImg()
  },
  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadPreview']),

    ...mapMutations('Files', ['SET_APP_SIDEBAR_EXPANDED_ACCORDION']),
    getFileVersions() {
      this.loading = true
      this.$client.fileVersions
        .listVersions(this.currentFile.id)
        .then(res => {
          if (res) this.versions = res
        })
        .finally(_ => {
          this.loading = false
        })
    },
    setPreviewImg() {
      const resource = this.highlightedFile
      this.loadPreview({
        resource,
        isPublic: this.isPublicFilesRoute,
        dimensions: ImageDimension.Preview
      })
    },
    expandPeoplesAccordion() {
      this.SET_APP_SIDEBAR_EXPANDED_ACCORDION('sharing-item')
    },
    expandLinksAccordion() {
      this.SET_APP_SIDEBAR_EXPANDED_ACCORDION('links-item')
    },
    expandVersionsAccordion() {
      this.SET_APP_SIDEBAR_EXPANDED_ACCORDION('versions-item')
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
    object-fit: cover;
    height: 100%;
    max-height: 100%;
  }
}
</style>
