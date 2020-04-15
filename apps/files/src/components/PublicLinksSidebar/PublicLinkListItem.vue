<template>
  <oc-table middle class="files-file-links-link">
    <oc-table-row class="files-file-links-link-table-row-info">
      <oc-table-cell shrink>
        <oc-button
          v-if="$_deleteButtonVisible"
          :aria-label="$_deleteButtonLabel"
          variation="raw"
          class="oc-files-file-link-delete"
          @click="$_removeLink"
        >
          <oc-icon name="close" />
        </oc-button>
        <oc-spinner
          v-else-if="$_loadingSpinnerVisible"
          :aria-label="$gettext('Removing public link…')"
          size="small"
        />
        <oc-icon v-else name="lock" class="uk-invisible" />
      </oc-table-cell>
      <oc-table-cell>
        <a
          :href="link.url"
          target="_blank"
          :uk-tooltip="$_tooltipTextLink"
          class="uk-text-bold uk-text-truncate oc-files-file-link-url"
          >{{ link.name }}</a
        >
        <br />
        <span class="uk-text-meta uk-text-break">
          <span class="oc-files-file-link-role">{{ link.description }}</span>
          <template v-if="link.expiration">
            |
            <oc-icon
              size="xsmall"
              name="text-calendar"
              class="fix-icon-baseline"
              :aria-hidden="true"
            />
            <span v-translate>Expires</span> {{ formDateFromNow(link.expiration) }}
          </template>
          <template v-if="link.password">
            |
            <oc-icon size="xsmall" name="lock" class="fix-icon-baseline" :aria-hidden="true" />
            <span v-translate>Password protected</span>
          </template>
        </span>
      </oc-table-cell>
      <oc-table-cell shrink class="uk-text-nowrap">
        <oc-button
          v-if="$_editButtonVisible"
          :aria-label="$_editButtonLabel"
          variation="raw"
          class="oc-files-file-link-edit"
          @click="$emit('onEdit', link)"
        >
          <oc-icon name="edit" size="small" />
        </oc-button>
        <oc-button
          :aria-label="$_publicLinkCopyLabel"
          variation="raw"
          class="oc-files-file-link-copy-url"
        >
          <oc-icon
            v-if="!linksCopied[link.url]"
            v-clipboard:copy="link.url"
            v-clipboard:success="$_clipboardSuccessHandler"
            name="copy_to_clipboard"
            size="small"
          />
          <oc-icon
            v-else
            name="ready"
            size="small"
            class="oc-files-file-link-copied-url _clipboard-success-animation"
          />
        </oc-button>
      </oc-table-cell>
    </oc-table-row>
    <oc-table-row v-if="$_viaLabel" class="files-file-links-link-table-row-bottom">
      <oc-table-cell shrink></oc-table-cell>
      <oc-table-cell colspan="2">
        <div class="uk-text-meta">
          <router-link
            :to="$_viaRouterParams"
            :aria-label="$gettext('Navigate to parent')"
            class="oc-files-file-link-via uk-flex uk-flex-middle"
          >
            <oc-icon name="exit_to_app" size="small" class="uk-preserve-width" />
            <span
              class="oc-file-name uk-padding-remove uk-margin-xsmall-left uk-text-truncate files-file-links-link-via-label"
              >{{ $_viaLabel }}</span
            >
          </router-link>
        </div>
      </oc-table-cell>
    </oc-table-row>
  </oc-table>
</template>

<script>
import { basename, dirname } from 'path'
import mixins from '../../mixins'

export default {
  name: 'PublicLinkListItem',
  mixins: [mixins],
  props: {
    link: {
      type: Object,
      required: true
    },
    modifiable: {
      type: Boolean,
      default: false
    },
    indirect: {
      type: Boolean,
      default: false
    },
    linksCopied: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      removalInProgress: false
    }
  },
  computed: {
    $_loadingSpinnerVisible() {
      return this.modifiable && this.removalInProgress
    },
    $_deleteButtonVisible() {
      return this.modifiable && !this.removalInProgress
    },
    $_editButtonVisible() {
      return this.modifiable && !this.removalInProgress
    },
    $_viaLabel() {
      if (!this.indirect) {
        return null
      }
      const translated = this.$gettext('Via %{folderName}')
      return this.$gettextInterpolate(translated, { folderName: basename(this.link.path) }, true)
    },
    $_viaRouterParams() {
      const viaPath = this.link.path
      return {
        name: 'files-list',
        params: {
          item: dirname(viaPath) || '/'
        },
        query: {
          scrollTo: basename(viaPath)
        }
      }
    },
    $_tooltipTextLink() {
      return `title: ${this.$gettext('Click to open the link')}; pos: bottom`
    },
    $_deleteButtonLabel() {
      return this.$gettext('Delete public link')
    },
    $_editButtonLabel() {
      return this.$gettext('Edit public link')
    },
    $_publicLinkCopyLabel() {
      return this.$gettext('Copy public link url')
    }
  },
  methods: {
    $_clipboardSuccessHandler(event) {
      this.$emit('onCopy', event)
    },
    $_removeLink() {
      this.removalInProgress = true
      this.$emit('onDelete', this.link)
    }
  }
}
</script>

<style scoped="scoped">
/* FIXME: Move to ODS somehow */
.files-file-links-link-table-row-info > td {
  padding: 0 10px 0 0;
}
.files-file-links-link-table-row-bottom > td {
  padding: 3px 10px 0 0;
}
.files-file-links-link-via-label {
  max-width: 65%;
}
.fix-icon-baseline {
  margin-bottom: -2px;
}
</style>
