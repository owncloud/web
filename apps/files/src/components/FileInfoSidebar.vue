<template>
    <div>
      <p>file info sidebar</p>
  </div>
</template>

<script>
import Mixins from '../mixins'
import { reduce } from 'lodash'
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
      return reduce(this.selectedFiles, (sum, n) => {
        return sum + n.size
      }, 0)
    }
  }

}
</script>
