<template>
  <div id="files-upload-progress" class="uk-clearfix">
    <oc-grid
      gutter="small"
      flex
      class="uk-margin-remove uk-align-right"
    >
      <oc-button
        id="files-upload-progress-dropdown-trigger"
        icon="expand_more"
      />
      <translate
        :translate-n="count"
        translate-plural="Uploading %{ count } items"
      >
        Uploading %{ count } item
      </translate>
      <oc-grid
        gutter="small"
        flex
        class="uk-width-1-1 uk-width-medium@s"
      >
        <oc-progress
          :value="totalUploadProgress"
          :max="100"
          class="uk-width-expand uk-margin-remove-bottom"
        />
        <span>
          {{ totalUploadProgress | roundNumber}} %
        </span>
      </oc-grid>
    </oc-grid>
    <oc-drop
      toggle="#files-upload-progress-dropdown-trigger"
      mode="click"
      :options="{ offset: 0 }"
    >
      <upload-menu class="uk-width-1-1" :items="inProgress" />
    </oc-drop>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UploadMenu from './UploadMenu.vue'
import Mixins from '../mixins'

export default {
  name: 'UploadProgress',

  components: {
    UploadMenu
  },

  mixins: [
    Mixins
  ],

  computed: {
    ...mapGetters('Files', ['inProgress', 'uploaded']),

    count () {
      return this.inProgress.length
    },

    totalUploadProgress () {
      let progressTotal = 0

      for (const item of this.inProgress) {
        progressTotal = progressTotal + item.progress
      }

      for (const item of this.uploaded) {
        progressTotal = progressTotal + item.progress
      }

      if (this.inProgress.length !== 0) {
        progressTotal = progressTotal / (this.inProgress.length + this.uploaded.length)
      } else {
        progressTotal = 100
      }

      return progressTotal
    }
  }
}
</script>
