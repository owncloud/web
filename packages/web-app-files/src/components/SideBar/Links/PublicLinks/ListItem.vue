<template>
  <oc-grid
    gutter="small"
    class="
      files-file-links-link files-file-links-link-table-row-info
      oc-flex oc-flex-top oc-flex-between
    "
  >
    <link-info :link="link" />
    <link-actions v-if="!link.indirect" :link="link" />
  </oc-grid>
</template>

<script>
import LinkActions from './LinkActions.vue'
import LinkInfo from './LinkInfo.vue'

export default {
  name: 'PublicLinkListItem',
  components: {
    LinkActions,
    LinkInfo
  },
  props: {
    link: {
      type: Object,
      required: true
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
