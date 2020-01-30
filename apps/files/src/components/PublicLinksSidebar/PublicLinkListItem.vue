<template>
  <oc-table middle class="files-file-links-link">
    <oc-table-row v-if="$_viaLabel" class="files-file-links-link-table-row-extra">
      <oc-table-cell shrink></oc-table-cell>
      <oc-table-cell colspan="2">
        <div class="uk-text-meta">
          <router-link :to="$_viaRouterParams" :aria-label="$gettext('Navigate to parent')"
                       class="oc-files-file-link-via uk-flex uk-flex-middle">
            <oc-icon name="exit_to_app" size="small" class="uk-preserve-width" />
            <span class="oc-file-name uk-padding-remove uk-margin-xsmall-left uk-text-truncate files-file-links-link-via-label">{{ $_viaLabel }}</span>
          </router-link>
        </div>
      </oc-table-cell>
    </oc-table-row>
    <oc-table-row class="files-file-links-link-table-row-info">
      <oc-table-cell shrink>
        <oc-button v-if="modifiable" :aria-label="$_deleteButtonLabel" @click="$emit('onDelete', link)" variation="raw" class="oc-files-file-link-delete">
          <oc-icon name="close" />
        </oc-button>
        <oc-icon v-else name="lock" />
      </oc-table-cell>
      <oc-table-cell>
        <a :href="link.url" target="_blank" :uk-tooltip="$_tooltipTextLink" class="uk-text-bold uk-text-truncate oc-files-file-link-url">{{ link.name }}</a>
        <br>
        <span class="uk-text-meta uk-text-break">
                      <span class="oc-files-file-link-role">{{ link.description }}</span>
                      <template v-if="link.expiration"> |
                        <span v-translate>Expires</span> {{ formDateFromNow(link.expiration) }}
                      </template>
                      <template v-if="link.password"> |
                        <span v-translate>Password protected</span>
                      </template>
                    </span>
      </oc-table-cell>
      <oc-table-cell shrink class="uk-text-nowrap">
        <oc-button :aria-label="$_publicLinkCopyLabel" variation="raw" class="oc-files-file-link-copy-url">
          <oc-icon v-if="!linksCopied[link.url]"  name="copy_to_clipboard" size="small"
                   v-clipboard:copy="link.url" v-clipboard:success="$_clipboardSuccessHandler"/>
          <oc-icon v-else name="ready" size="small" class="oc-files-file-link-copied-url _clipboard-success-animation"/>
        </oc-button>
        <oc-button v-if="modifiable" :aria-label="$_editButtonLabel" @click="$emit('onEdit', link)" variation="raw" class="oc-files-file-link-edit">
          <oc-icon name="edit" size="small"/>
        </oc-button>
      </oc-table-cell>
    </oc-table-row>
  </oc-table>
</template>

<script>
import { basename, dirname } from 'path'

export default {
  name: 'PublicLinkListItem',
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
  computed: {
    $_viaLabel () {
      if (!this.indirect) {
        return null
      }
      const translated = this.$gettext('Via %{folderName}')
      return this.$gettextInterpolate(translated, { folderName: basename(this.link.info.path) }, false)
    },
    $_viaRouterParams () {
      const viaPath = this.link.info.path
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
    $_tooltipTextLink () {
      return `title: ${this.$gettext('Click to open the link')}; pos: bottom`
    },
    $_deleteButtonLabel () {
      return this.$gettext('Delete public link')
    },
    $_editButtonLabel () {
      return this.$gettext('Edit public link')
    },
    $_publicLinkCopyLabel () {
      return this.$gettext('Copy public link url')
    }
  },
  methods: {
    $_clipboardSuccessHandler (event) {
      this.$emit('onCopy', event)
    }
  }
}
</script>

<style scoped="scoped">
  /* FIXME: Move to ODS somehow */
  .files-file-links-link-table-row-extra > td {
    padding: 0 10px 5px 0;
  }
  .files-file-links-link-table-row-info > td {
    padding: 0 10px 0 0;
  }
  .files-file-links-link-via-label {
    max-width: 65%;
  }
</style>
