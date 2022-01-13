<template>
  <div class="oc-width-expand">
    <div class="oc-mb-s oc-width-1-1">
      <h5
        class="oc-text-bold oc-text-truncate oc-files-file-link-name oc-my-rm oc-text-initial"
        v-text="linkName"
      />
      <div class="oc-flex oc-flex-middle oc-width-1-1">
        <a
          :href="link.url"
          target="_blank"
          class="oc-files-file-link-url oc-text-truncate"
          v-text="link.url"
        />
        <copy-to-clipboard-button
          class="oc-files-public-link-copy-url oc-ml-xs"
          :value="link.url"
          :label="copyToClipboardLabel"
          :success-msg-title="copyToClipboardSuccessMsgTitle"
          :success-msg-text="getCopyToClipboardSuccessMsgText(link)"
        />
      </div>
    </div>
    <oc-grid gutter="small">
      <div>
        <oc-tag class="oc-files-file-link-role">
          <oc-icon :name="roleTagIcon.name" :fill-type="roleTagIcon.fillType || 'fill'" />
          {{ link.description }}
        </oc-tag>
      </div>
      <div v-if="link.expiration">
        <oc-tag
          v-oc-tooltip="expirationDate"
          tabindex="0"
          class="oc-files-public-link-expires"
          :data-testid="`files-link-id-${link.id}-expiration-date`"
          :aria-label="expirationDateRelative + ' (' + expirationDate + ')'"
        >
          <oc-icon name="calendar-2" fill-type="line" />
          <translate :translate-params="{ expires: expirationDateRelative }">
            Expires %{expires}
          </translate>
        </oc-tag>
      </div>
      <div v-if="link.password">
        <oc-tag class="oc-files-file-link-password">
          <oc-icon name="lock" />
          <translate>Password protected</translate>
        </oc-tag>
      </div>
      <div v-if="link.indirect">
        <oc-tag
          v-oc-tooltip="viaTooltip"
          type="router-link"
          class="oc-files-file-link-via"
          :to="viaRouterParams"
        >
          <oc-icon name="close" />
          <span class="oc-text-truncate files-file-links-link-via-label" v-text="viaLabel" />
        </oc-tag>
      </div>
    </oc-grid>
  </div>
</template>

<script>
import { basename, dirname } from 'path'
import Mixins from '../../../../mixins'
import { createLocationSpaces } from '../../../../router'
import CopyToClipboardButton from '../CopyToClipboardButton.vue'
import { DateTime } from 'luxon'

export default {
  name: 'LinkInfo',
  components: { CopyToClipboardButton },
  mixins: [Mixins],

  props: {
    link: {
      type: Object,
      required: true
    }
  },

  computed: {
    linkName() {
      return this.link.name ? this.link.name : this.link.token
    },

    roleTagIcon() {
      switch (this.link.description) {
        case 'Viewer':
          return { name: 'eye' }

        case 'Contributor':
          return { name: 'pencil' }

        case 'Editor':
          return { name: 'pencil' }

        case 'Uploader':
          return { name: 'upload', fillType: 'line' }

        default:
          return { name: 'key' }
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
      return createLocationSpaces('files-spaces-personal-home', {
        params: {
          item: dirname(viaPath) || '/'
        },
        query: {
          scrollTo: basename(viaPath)
        }
      })
    },

    viaTooltip() {
      return this.$gettext('Navigate to the parent')
    },

    copyToClipboardLabel() {
      return this.$gettext('Copy link to clipboard')
    },

    copyToClipboardSuccessMsgTitle() {
      return this.$gettext('Public link copied')
    },

    expirationDate() {
      return DateTime.fromISO(this.link.expiration)
        .setLocale(this.$language.current)
        .endOf('day')
        .toLocaleString(DateTime.DATETIME_FULL)
    },

    expirationDateRelative() {
      return DateTime.fromISO(this.link.expiration)
        .setLocale(this.$language.current)
        .endOf('day')
        .toRelative()
    }
  },

  methods: {
    getCopyToClipboardSuccessMsgText(link) {
      const translated = this.$gettext(
        'The public link "%{linkName}" has been copied to your clipboard.'
      )
      return this.$gettextInterpolate(
        translated,
        {
          linkName: link.name ? link.name : ''
        },
        true
      )
    }
  }
}
</script>
