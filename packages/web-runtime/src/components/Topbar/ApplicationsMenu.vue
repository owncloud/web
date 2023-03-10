<template>
  <nav
    id="applications-menu"
    :aria-label="$gettext('Main navigation')"
    class="oc-flex oc-flex-middle"
  >
    <oc-expanding-dropdown :expand-head="true" :close-on-click="true">
      <template #toggle>
        <oc-icon name="grid" size="large" class="oc-flex" />
      </template>
      <template #head>
        <router-link ref="navigationSidebarLogo" to="/">
          <oc-img :src="logoImage" :alt="sidebarLogoAlt" class="oc-logo-image" />
        </router-link>
      </template>
      <template #body>
        <oc-list class="applications-list">
          <li v-for="(n, nid) in applicationsList" :key="`apps-menu-${nid}`" @click="clickApp(n)">
            <oc-button
              :key="n.url ? 'apps-menu-external-link' : 'apps-menu-internal-link'"
              :type="n.url ? 'a' : 'router-link'"
              :target="n.target"
              :href="n.url"
              :to="n.path"
              appearance="raw"
              :class="{ 'oc-background-primary-gradient router-link-active': n.active }"
              :variation="n.active ? 'inverse' : 'passive'"
            >
              <span class="icon-box">
                <oc-icon :name="n.icon" />
              </span>
              <span v-text="$gettext(n.title)" />
              <oc-icon v-if="n.active" name="check" class="active-check" />
            </oc-button>
          </li>
        </oc-list>
      </template>
    </oc-expanding-dropdown>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { configurationManager } from 'web-pkg/src/configuration'
import { urlJoin } from 'web-client/src/utils'
import OcExpandingDropdown from '../../../../design-system/src/components/OcExpandingDropdown/OcExpandingDropdown.vue'

export default defineComponent({
  components: {
    OcExpandingDropdown
  },
  props: {
    applicationsList: {
      type: Array as PropType<any[]>,
      required: false,
      default: () => []
    }
  },
  computed: {
    applicationSwitcherLabel() {
      return this.$gettext('Application Switcher')
    },

    logoImage() {
      return this.configuration.currentTheme.logo.topbar
    },

    sidebarLogoAlt() {
      return this.$gettext('Navigate to personal files page')
    },
  },
  mounted() {
    this.$refs.menu?.tippy?.setProps({
      onHidden: () => this.$refs.menubutton.$el.focus(),
      onShown: () => this.$refs.menu.$el.querySelector('a:first-of-type').focus()
    })
  },
  methods: {
    async clickApp(appEntry) {
      // @TODO use id or similar
      if (appEntry.url?.endsWith('/apps/files')) {
        await this.setClassicUIDefault()
      }
    },
    setClassicUIDefault() {
      const url = urlJoin(configurationManager.serverUrl, '/index.php/apps/web/settings/default')
      return this.$clientService.httpAuthenticated.post(url, { isDefault: false })
    }
  }
})
</script>

<style lang="scss" scoped>
.oc-logo-image {
  height: 38px;
  padding-left: 15px;
}
.applications-list {
  padding: 10px;
  width: 300px;
  li {
    margin: var(--oc-space-xsmall) 0;

    a,
    button {
      gap: var(--oc-space-medium);
      justify-content: flex-start;
      width: 100%;

      &:focus,
      &:hover {
        background-color: var(--oc-color-background-hover);
        color: var(--oc-color-swatch-passive-default);
        text-decoration: none;
      }

      .icon-box {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
      }

      .active-check {
        position: absolute;
        right: calc(1rem + 5px);
      }
    }

    a.router-link-active,
    button.router-link-active {
      &:focus,
      &:hover {
        color: var(--oc-color-swatch-inverse-default);
      }
    }
  }
}
</style>
