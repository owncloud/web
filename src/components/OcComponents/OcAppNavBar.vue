<template>
  <div class="oc-app-navbar">
    <div class="content">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({

  })
}
</script>
<style scoped>
.content {
  width: 20vw;
}
</style>
