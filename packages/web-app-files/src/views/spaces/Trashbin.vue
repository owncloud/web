<template><Trashbin :no-content-message="$gettext('Space have no deleted files')" /></template>

<script>
import Trashbin from '../../components/Trashbin.vue'

export default {
  components: { Trashbin }
}
</script>
