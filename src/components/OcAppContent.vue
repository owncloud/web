<template>
  <div class="oc-app-content">
    <slot name="content"></slot>
  </div>
</template>
<script>
export default {
  data: () => ({})
}
</script>
<style scoped>
.oc-app-content {
  overflow-y: scroll;
}
</style>
