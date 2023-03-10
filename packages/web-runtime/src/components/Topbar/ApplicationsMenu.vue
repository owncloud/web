<template>
  <nav
    id="applications-menu"
    :aria-label="$gettext('Main navigation')"
    class="oc-flex oc-flex-middle"
  >
    <oc-expanding-dropdown>
		<oc-list class="applications-list">
        <li v-for="(n, nid) in applicationsList" :key="`apps-menu-${nid}`" @click="clickApp(n)">
          <oc-button
            :key="n.url ? 'apps-menu-external-link' : 'apps-menu-internal-link'"
            :type="n.url ? 'a' : 'router-link'"
            :target="n.target"
            :href="n.url"
            :to="n.path"
            :appearance="n.active ? 'raw-inverse' : 'raw'"
            :variation="n.active ? 'primary' : 'passive'"
            :class="{ 'oc-background-primary-gradient router-link-active': n.active }"
          >
            <span class="icon-box">
              <oc-icon :name="n.icon" variation="inherit" />
            </span>
            <span v-text="$gettext(n.title)" />
            <oc-icon v-if="n.active" name="check" class="active-check" variation="inherit" />
          </oc-button>
        </li>
      </oc-list>
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
      return this.$clientService.httpAuthenticated.post(url, { isDefault: false })
    }
  }
})
</script>

<style lang="scss" scoped>
.applications-list {
  padding: 10px;
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
