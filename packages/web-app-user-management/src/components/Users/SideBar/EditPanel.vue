<template><div>Edit in progress</div></template>
<script>
export default {
  name: 'EditPanel',
  props: {
    user: {
      type: Object,
      required: false,
      default: () => {
        return {}
      }
    }
  }
}
</script>
<style lang="scss">
.user-info {
  align-items: center;
  flex-direction: column;
}
.user-info-display-name {
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
