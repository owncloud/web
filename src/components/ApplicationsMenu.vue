<template>
  <div v-if="!!applicationsList.length">
    <oc-button
      id="_appSwitcherButton"
      ref="menubutton"
      icon="apps"
      variation="primary"
      class="oc-topbar-menu-burger uk-height-1-1"
      :aria-label="$gettext('Application Switcher')"
    />
    <oc-drop
      ref="menu"
      drop-id="app-switcher-dropdown"
      toggle="#_appSwitcherButton"
      mode="click"
      :options="{ pos: 'bottom-right', delayHide: 0 }"
      class="uk-width-large"
      close-on-click
    >
      <div class="uk-grid-small uk-text-center" uk-grid>
        <div v-for="(n, nid) in $_applicationsList" :key="nid" class="uk-width-1-3">
          <a v-if="n.url" key="external-link" target="_blank" :href="n.url">
            <oc-icon v-if="n.iconMaterial" :name="n.iconMaterial" size="large" />
            <oc-icon v-if="n.iconUrl" :url="n.iconUrl" size="large" />
            <div>{{ n.title }}</div>
          </a>
          <router-link v-else key="internal-link" :to="n.path">
            <oc-icon v-if="n.iconMaterial" :name="n.iconMaterial" size="large" />
            <oc-icon v-if="n.iconUrl" :url="n.iconUrl" size="large" />
            <div v-text="n.title" />
          </router-link>
        </div>
      </div>
    </oc-drop>
  </div>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: false,
      default: false
    },
    applicationsList: {
      type: Array,
      required: false,
      default: () => null
    }
  },
  computed: {
    $_applicationsList() {
      return this.applicationsList.map(item => {
        const lang = this.$language.current
        // TODO: move language resolution to a common function
        // FIXME: need to handle logic for variants like en_US vs en_GB
        let title = item.title ? item.title.en : item.name
        let iconMaterial
        let iconUrl
        if (item.title && item.title[lang]) {
          title = item.title[lang]
        }

        if (!item.icon) {
          iconMaterial = 'deprecated' // broken icon
        } else if (item.icon.indexOf('.') < 0) {
          // not a file name or URL, treat as a material icon name instead
          iconMaterial = item.icon
        } else {
          iconUrl = item.icon
        }

        const app = {
          iconMaterial: iconMaterial,
          iconUrl: iconUrl,
          title: title
        }

        if (item.url) {
          app.url = item.url
        } else if (item.path) {
          app.path = item.path
        } else {
          app.path = `/${item.id}`
        }

        return app
      })
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.focusFirstLink()
      } else {
        this.$emit('closed')
      }
    }
  },
  methods: {
    logout() {
      this.visible = false
      this.$store.dispatch('logout')
    },
    focusFirstLink() {
      /*
       * Delay for two reasons:
       * - for screen readers Virtual buffer
       * - to outsmart uikit's focus management
       */
      setTimeout(() => {
        this.$refs.menu.$el.querySelector('a:first-of-type').focus()
      }, 500)
    }
  }
}
</script>
