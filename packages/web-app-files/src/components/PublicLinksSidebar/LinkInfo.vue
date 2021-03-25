<template>
  <div class="uk-width-expand">
    <div class="oc-mb-s uk-width-1-1">
      <div class="oc-text-bold uk-text-truncate oc-files-file-link-name" v-text="linkName" />
      <div class="uk-flex uk-flex-middle uk-width-1-1">
        <a
          :href="link.url"
          target="_blank"
          class="oc-files-file-link-url oc-mr-xs uk-text-truncate"
          v-text="link.url"
        />
        <oc-button
          :aria-label="copyLabel"
          :uk-tooltip="copyLabel"
          variation="raw"
          class="oc-files-file-link-copy-url"
        >
          <oc-icon
            v-if="linkCopied"
            key="copy-link-icon-copied"
            name="ready"
            class="oc-files-file-link-copied-url _clipboard-success-animation"
          />
          <oc-icon
            v-else
            key="copy-link-icon"
            v-clipboard:copy="link.url"
            v-clipboard:success="clipboardSuccessHandler"
            name="copy_to_clipboard"
          />
        </oc-button>
      </div>
    </div>
    <oc-grid gutter="small">
      <div>
        <oc-tag class="oc-files-file-link-role">
          <oc-icon :name="roleTagIcon" aria-hidden="true" />
          {{ link.description }}
        </oc-tag>
      </div>
      <div v-if="link.expiration">
        <oc-tag>
          <oc-icon name="text-calendar" aria-hidden="true" />
          <translate :translate-params="{ expires: formDateFromNow(link.expiration) }">
            Expires %{expires}
          </translate>
        </oc-tag>
      </div>
      <div v-if="link.password">
        <oc-tag>
          <oc-icon name="lock" aria-hidden="true" />
          <translate>Password protected</translate>
        </oc-tag>
      </div>
      <div v-if="link.indirect">
        <oc-tag
          type="router-link"
          class="oc-files-file-link-via"
          :to="viaRouterParams"
          :uk-tooltip="viaTooltip"
        >
          <oc-icon name="exit_to_app" aria-hidden="true" />
          <span class="uk-text-truncate files-file-links-link-via-label" v-text="viaLabel" />
        </oc-tag>
      </div>
    </oc-grid>
  </div>
</template>

<script>
import { basename, dirname } from 'path'
import Mixins from '../../mixins'

export default {
  name: 'LinkInfo',

  mixins: [Mixins],

  props: {
    link: {
      type: Object,
      required: true
    }
  },

  data: () => ({
    linkCopied: false
  }),

  computed: {
    linkName() {
      return this.link.name ? this.link.name : this.link.token
    },

    copyLabel() {
      return this.linkCopied
        ? this.$gettext('Public link successfully copied')
        : this.$gettext('Copy public link url')
    },

    roleTagIcon() {
      switch (this.link.description) {
        case 'Viewer':
          return 'remove_red_eye'

        case 'Contributor':
          return 'edit'

        case 'Editor':
          return 'edit'

        case 'Uploader':
          return 'file_upload'

        default:
          return 'key'
      }
    },

    viaLabel() {
      if (!this.link.indirect) {
        return null
      }

      const translated = this.$gettext('Via %{folderName}')

      return this.$gettextInterpolate(translated, { folderName: basename(this.link.path) }, true)
    },

    viaRouterParams() {
      const viaPath = this.link.path

      return {
        name: 'files-personal',
        params: {
          item: dirname(viaPath) || '/'
        },
        query: {
          scrollTo: basename(viaPath)
        }
      }
    },

    viaTooltip() {
      return this.$gettext('Navigate to the parent')
    }
  },

  methods: {
    clipboardSuccessHandler() {
      this.linkCopied = true

      setTimeout(() => {
        this.linkCopied = false
      }, 550)
    }
  }
}
</script>
