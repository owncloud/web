<template>
  <div id="files-upload-progress" class="uk-clearfix uk-padding-remove-vertical">
    <div class="uk-margin-remove uk-position-relative uk-width-expand">
      <oc-progress
        ref="progressbar"
        :aria-hidden="true"
        :max="100"
        :value="totalUploadProgress"
        class="uk-width-expand uk-margin-remove"
      />
      <span :aria-hidden="true" class="uk-position-center oc-progress-text">
        {{ totalUploadProgress | roundNumber }} %
      </span>
      <oc-hidden-announcer :announcement="announcement" level="assertive" />
    </div>
    <oc-grid
      flex
      class="uk-margin-small-top uk-margin-small-bottom uk-text-meta oc-cursor-pointer"
      :aria-label="$gettext('Click row to toggle upload progress details')"
      @click.native="$_toggleExpanded"
    >
      <oc-icon
        class="uk-width-auto"
        :name="expanded ? 'expand_less' : 'expand_more'"
        size="small"
      />
      <div class="uk-width-expand uk-text-truncate">
        <translate
          v-if="count === 1"
          key="upload-progress-single"
          :translate-params="{ fileName: inProgress[0].name }"
          translate-comment="Upload progress when only uploading one file shows the name of the file."
        >
          Uploading "%{ fileName }"
        </translate>
        <translate
          v-else
          key="upload-progress-multi"
          :translate-n="count"
          translate-plural="Uploading %{ count } items"
          translate-comment="Upload progress when uploading multiple files only shows the number of uploads."
        >
          Uploading %{ count } item
        </translate>
      </div>
      <div class="uk-width-auto">
        <translate
          v-if="expanded"
          key="upload-progress-collapse-details"
          translate-comment="Hide details panel of upload progress"
        >
          Hide Details
        </translate>
        <translate
          v-else
          key="upload-progress-expand-details"
          translate-comment="Show details panel of upload progress"
        >
          Show Details
        </translate>
      </div>
    </oc-grid>
    <upload-menu
      v-if="expanded"
      :items="inProgress"
      class="uk-width-expand oc-upload-menu-scrollable"
    />
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
  mixins: [Mixins],
  data() {
    return {
      expanded: false,
      announcement: '',
      announcementOnComplete: this.$gettext('Upload complete')
    }
  },
  computed: {
    ...mapGetters('Files', ['inProgress', 'uploaded']),

    count() {
      return this.inProgress.length
    },

    totalUploadProgress() {
      let totalSizeSum = 0
      let progressSizeSum = 0

      for (const item of this.inProgress) {
        totalSizeSum += item.size
        progressSizeSum += (item.size * item.progress) / 100
      }

      for (const item of this.uploaded) {
        totalSizeSum += item.size
        progressSizeSum += item.size
      }

      if (this.inProgress.length > 0 && totalSizeSum > 0) {
        return (progressSizeSum / totalSizeSum) * 100
      } else {
        return 100
      }
    }
  },
  watch: {
    totalUploadProgress(value) {
      if (value === 100) {
        this.expanded = false
        this.announcement = this.announcementOnComplete
      }
    }
  },
  created() {
    this.$root.$on('upload-start', () => {
      this.$nextTick(() => {
        this.delayForScreenreader(() => this.$refs.progressbar.$el.focus())
      })
    })
  },
  methods: {
    $_toggleExpanded() {
      this.expanded = !this.expanded
    }
  }
}
</script>

<style>
/* FIXME: move whole text part to ODS. it is useful to have a text component available for the progress bar. */
#files-upload-progress .oc-progress-text {
  font-size: 0.75em;
  color: #aaa;
}
#files-upload-progress .uk-progress {
  box-shadow: 0 0 2px #ccc;
}
</style>
<style scoped>
/* FIXME: move to ODS somehow? with the very specific max-height it probably doesn't make a generic css class from it... */
.oc-upload-menu-scrollable {
  max-height: 200px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  resize: both;
}
</style>
