<template>
  <div
    v-if="isOpen"
    :id="id"
    uk-offcanvas="mode: slide"
    class="oc-file-actions uk-offcanvas-bottom uk-open"
    style="display: block !important;"
  >
    <div class="uk-offcanvas-bar">
      <oc-button
        icon="close"
        class="uk-position-top-right uk-position-absolute uk-margin-top uk-margin-right"
        :aria-label="$gettext('Close file actions menu')"
        @click="closeActions"
      />
      <div class="uk-margin-small-bottom" v-text="$_label" />
      <ul class="uk-nav">
        <li v-for="(action, i) in actions" :key="i">
          <a class="uk-inline" @click="selectAction(action)">
            <oc-icon
              v-if="action.icon || action.iconUrl"
              :name="action.icon"
              :url="action.iconUrl"
            />
            <span class="uk-text-top" v-text="action.label" />
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: false,
      default: 'oc-file-actions'
    }
  },
  data() {
    return {
      filename: '',
      actions: [],
      isOpen: false
    }
  },
  computed: {
    $_label() {
      const translated = this.$gettext('Open %{fileName} in')
      return this.$gettextInterpolate(translated, { fileName: this.filename }, true)
    }
  },
  watch: {
    $route() {
      this.closeActions()
    }
  },
  mounted() {
    this.$root.$on('oc-file-actions:open', file => {
      this.showActions(file)
    })
  },
  methods: {
    showActions(file) {
      this.filename = file.filename
      this.actions = file.actions
      this.isOpen = true
    },
    closeActions() {
      this.isOpen = false
      this.actions = []
      this.filename = ''
    },
    selectAction(action) {
      this.closeActions()
      action.onClick()
    }
  }
}
</script>
