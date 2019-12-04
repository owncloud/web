<template>
  <div v-if="!!applicationsList.length">
    <oc-button id="_appSwitcherButton" icon="apps" variation="primary" class="oc-topbar-menu-burger uk-height-1-1"  aria-label="$gettext('Application Switcher')" ref="menubutton" />
    <oc-drop toggle="#_appSwitcherButton" mode="click" :options="{pos:'bottom-right'}" class="uk-width-large" ref="menu">
      <div class="uk-grid-small uk-text-center" uk-grid>
        <div class="uk-width-1-3" v-for="(n, nid) in $_applicationsList" :key="nid">
          <a target="_blank" :href="n.url">
            <oc-icon v-if="n.iconMaterial" :name="n.iconMaterial" size="large" />
            <oc-icon v-if="n.iconUrl" :url="n.iconUrl" size="large" />
            <div>{{ n.title }}</div>
          </a>
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
  watch: {
    visible (val) {
      if (val) {
        this.focusFirstLink()
      } else {
        this.$emit('closed')
      }
    }
  },
  computed: {
    $_applicationsList () {
      return this.applicationsList.map((item) => {
        const lang = this.$language.current
        // TODO: move language resolution to a common function
        // FIXME: need to handle logic for variants like en_US vs en_GB
        let title = item.title.en
        let iconMaterial
        let iconUrl
        if (item.title[lang]) {
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
        return {
          iconMaterial: iconMaterial,
          iconUrl: iconUrl,
          title: title,
          url: item.url
        }
      })
    }
  },
  methods: {
    logout () {
      this.visible = false
      this.$store.dispatch('logout')
    },
    focusFirstLink () {
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
