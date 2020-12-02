<template>
  <div class="files-file-links-link">
    <div class="files-file-links-link-table-row-info">
      <link-info :link="link" />
      <link-actions v-if="!link.indirect" :link="link" />
    </div>
    <div v-if="$_viaLabel" class="files-file-links-link-table-row-bottom uk-text-meta">
      <oc-button
        type="router-link"
        variation="raw"
        justify-content="left"
        gap-size="xsmall"
        :to="$_viaRouterParams"
        :aria-label="$gettext('Navigate to parent')"
        class="oc-files-file-link-via"
      >
        <oc-icon name="exit_to_app" aria-hidden="true" />
        <span
          class="oc-file-name oc-p-rm uk-text-truncate files-file-links-link-via-label"
          v-text="$_viaLabel"
        />
      </oc-button>
    </div>
  </div>
</template>

<script>
import { basename, dirname } from 'path'

import LinkInfo from './LinkInfo.vue'
import LinkActions from './LinkActions.vue'

export default {
  name: 'PublicLinkListItem',
  components: {
    LinkInfo,
    LinkActions
  },
  props: {
    link: {
      type: Object,
      required: true
    }
  },
  computed: {
    $_viaLabel() {
      if (!this.link.indirect) {
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
