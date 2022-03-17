<template><Trashbin :no-content-message="$gettext('Space has no deleted files')" /></template>

<script>
import Trashbin from '../../components/Trashbin.vue'

export default {
  components: { Trashbin }
}
</script>
