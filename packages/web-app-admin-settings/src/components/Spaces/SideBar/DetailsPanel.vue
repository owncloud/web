<template>
  <div class="oc-mt-xl">
    <div v-if="noSpaces" class="oc-flex space-info">
      <oc-icon name="layout-grid" size="xxlarge" />
      <p v-translate>Select a group to view details</p>
    </div>
    <div v-if="multipleUsers" class="oc-flex group-info">
      <oc-icon name="layout-grid" size="xxlarge" />
      <p>{{ multipleSpacesSelectedText }}</p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'DetailsPanel',
  props: {
    spaces: {
      type: Array,
      required: true
    }
  },
  computed: {
    /*group() {
      return this.groups.length === 1 ? this.groups[0] : null
    },*/
    noSpaces() {
      return !this.spaces.length
    },/*
    multipleGroups() {
      return this.groups.length > 1
    },*/
    multipleSpacesSelectedText() {
      return this.$gettextInterpolate('%{count} spaces selected', {
        count: this.spaces.length
      })
    }
  }
}
</script>
<style lang="scss">
.space-info {
  align-items: center;
  flex-direction: column;
}
.group-info-display-name {
  font-size: 1.5rem;
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
