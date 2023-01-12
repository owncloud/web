<template>
  <div class="oc-mt-xl">
    <div class="oc-flex space-info">
      <oc-icon name="layout-grid" size="xxlarge" />
      <p v-translate>Multiple spaces selected</p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SpaceDetailsMultiple'
}
</script>
<style lang="scss">
.space-info {
  align-items: center;
  flex-direction: column;
}
</style>
