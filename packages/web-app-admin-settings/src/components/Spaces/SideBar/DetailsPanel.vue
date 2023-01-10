<template>
  <div class="oc-mt-xl">
    <div v-if="spaceCount === 0" class="oc-flex space-info">
      <oc-icon name="layout-grid" size="xxlarge" />
      <p v-translate>Select a space to view details</p>
    </div>
    <div v-if="spaceCount > 1" class="oc-flex group-info">
      <oc-icon name="layout-grid" size="xxlarge" />
      <p v-translate>Multiple spaces selected</p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'DetailsPanel',
  props: {
    spaceCount: {
      type: Number,
      required: true,
      default: 0
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
