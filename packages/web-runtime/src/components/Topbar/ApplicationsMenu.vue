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
      appearance="raw"
      variation="inverse"
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
      <oc-list class="applications-list">
        <li v-for="(n, nid) in applicationsList" :key="`apps-menu-${nid}`" @click="clickApp(n)">
          <oc-button
            :key="n.url ? 'apps-menu-external-link' : 'apps-menu-internal-link'"
            :type="n.url ? 'a' : 'router-link'"
            :target="n.target"
            :href="n.url"
            :to="n.path"
            appearance="raw"
            :class="{ 'oc-background-primary-gradient': n.active }"
            :variation="n.active ? 'inverse' : 'passive'"
          >
            <span class="icon-box">
              <img v-if="n.iconUrl" :src="n.iconUrl" />
              <oc-icon v-else :name="n.icon" />
            </span>
            <span v-text="$gettext(n.title)" />
            <oc-icon v-if="n.active" name="check" class="active-check" />
          </oc-button>
        </li>
      </oc-list>
    </oc-drop>
  </nav>
</template>

<script lang="ts">
import { clientService } from 'web-pkg/src/services'
import { configurationManager } from 'web-pkg/src/configuration'
import { mapGetters } from 'vuex'
import { urlJoin } from 'web-client/src/utils'
import { defineComponent, PropType } from '@vue/composition-api'
import { Link } from '../../store/config'

export default defineComponent({
  props: {
    applicationsList: {
      type: Array as PropType<Link[]>,
      required: false,
      default: () => []
    }
  },
  computed: {
    ...mapGetters('runtime/auth', ['accessToken']),

    applicationSwitcherLabel() {
      return this.$gettext('Application Switcher')
    }
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
      const httpClient = clientService.httpAuthenticated(this.accessToken)
      return httpClient.post(url, { isDefault: false })
    }
  }
})
</script>

<style lang="scss" scoped>
.applications-list li {
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
      right: 1rem;
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
</style>
