<template>
    <div>
      <p>file info sidebar</p>
  </div>
</template>

<script>
import Mixins from '../mixins'
import { mapGetters } from 'vuex'

export default {
  mixins: [
    Mixins
  ],
  title: ($gettext) => {
    return $gettext('File Details')
  },
  computed: {
    ...mapGetters('Files', ['selectedFiles']),
    accumulatedFilesSize () {
      return this.selectedFiles.reduce((sum, n) => {
        return sum + n.size
      }, 0)
    }
  }

}
</script>
