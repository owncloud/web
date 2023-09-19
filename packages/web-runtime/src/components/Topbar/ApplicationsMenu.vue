<template>
  <nav
    id="applications-menu"
    :aria-label="$gettext('Main navigation')"
    class="oc-flex oc-flex-middle"
  >
    <oc-button
      id="_appSwitcherButton"
      ref="menubutton"
      v-oc-tooltip="applicationSwitcherLabel"
      appearance="raw-inverse"
      variation="brand"
      class="oc-topbar-menu-burger"
      :aria-label="applicationSwitcherLabel"
    >
      <oc-icon name="grid" size="large" class="oc-flex" />
    </oc-button>
    <oc-drop
      ref="menu"
      drop-id="app-switcher-dropdown"
      toggle="#_appSwitcherButton"
      mode="click"
      padding-size="small"
      close-on-click
    >
      <div style="display: block; position: relative">
        <oc-list class="applications-list">
          <li v-for="(n, nid) in applicationsList" :key="`apps-menu-${nid}`" @click="clickApp(n)">
            <oc-button
              :key="n.url ? 'apps-menu-external-link' : 'apps-menu-internal-link'"
              :type="n.url ? 'a' : 'router-link'"
              :target="n.target"
              :href="n.url"
              :to="n.path"
              :appearance="'raw'"
              :variation="'passive'"
            >
              <oc-application-icon :icon="n.icon" :color-primary="n.color" />
              <span v-text="$gettext(n.title)" />
            </oc-button>
          </li>
        </oc-list>
      </div>
    </oc-drop>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType, ComponentPublicInstance } from 'vue'
import { configurationManager } from 'web-pkg/src/configuration'
import { urlJoin } from 'web-client/src/utils'
import { OcDrop } from 'design-system/src/components'
import OcApplicationIcon from 'design-system/src/components/OcApplicationIcon/OcApplicationIcon.vue'

export default defineComponent({
  components: {
    OcApplicationIcon
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
    }
  },
  mounted() {
    ;(this.$refs.menu as InstanceType<typeof OcDrop>)?.tippy?.setProps({
      onHidden: () => (this.$refs.menubutton as ComponentPublicInstance).$el.focus(),
      onShown: () =>
        (this.$refs.menu as ComponentPublicInstance).$el.querySelector('a:first-of-type').focus()
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
.applications-list li {
  margin: var(--oc-space-xsmall) 0;

  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }

  a,
  button {
    gap: var(--oc-space-medium);
    justify-content: flex-start;
    width: 100%;

    &.oc-button-primary-raw-inverse {
      &:focus,
      &:hover {
        color: var(--oc-color-swatch-primary-contrast) !important;
      }
    }
    &.oc-button-passive-raw {
      &:focus,
      &:hover {
        color: var(--oc-color-swatch-passive-default) !important;
      }
    }

    &:focus,
    &:hover {
      background-color: var(--oc-color-background-hover);
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
      right: 1rem;
    }
  }
}
</style>
