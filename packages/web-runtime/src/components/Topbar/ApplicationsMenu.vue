<template>
  <nav
    id="applications-menu"
    :aria-label="$gettext('Main navigation')"
    class="oc-flex oc-flex-middle"
  >
    <oc-expanding-dropdown
      :expand-head="true"
      :close-on-click="true"
      @dropdown-open="closeSidebar"
      @dropdown-close="reopenSidebar"
    >
      <template #toggle>
        <oc-icon name="grid" size="large" class="oc-flex" />
      </template>
      <template #head>
        <router-link ref="navigationSidebarLogo" to="/">
          <oc-img :src="logoImage" :alt="sidebarLogoAlt" class="oc-logo-image oc-flex" />
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
              :class="[`${n.gradient}`, { 'router-link-active': n.active }]"
              :variation="n.active ? 'inverse' : 'inverse'"
            >
              <span class="icon-box">
                <oc-icon size="medium" :name="n.icon" />
              </span>
              <span v-text="$gettext(n.title.slice(0, 5))" />
              <!--<oc-icon v-if="n.active" name="check" class="active-check" />-->
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
import { mapActions, mapGetters, mapState } from 'vuex'
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
  data: () => {
    return {
      sidebarClosedBefore: false
    }
  },
  computed: {
    ...mapState(['navigation']),
    ...mapGetters(['configuration', 'user']),
    ...mapGetters('runtime/auth', ['accessToken']),

    applicationSwitcherLabel() {
      return this.$gettext('Application Switcher')
    },

    logoImage() {
      return this.configuration.currentTheme.logo.topbar
    },

    sidebarLogoAlt() {
      return this.$gettext('Navigate to personal files page')
    }
  },
  mounted() {
    this.$refs.menu?.tippy?.setProps({
      onHidden: () => this.$refs.menubutton.$el.focus(),
      onShown: () => this.$refs.menu.$el.querySelector('a:first-of-type').focus()
    })
  },
  methods: {
    ...mapActions(['openNavigation', 'closeNavigation']),

    closeSidebar() {
      this.closeNavigation()
    },
    reopenSidebar() {
      this.openNavigation()
    },
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
  height: 35px;
  padding-left: 20px;
}
.applications-list {
  width: 320px;
  padding: 10px;
  display: flex;
  gap: 10px;
  li {
    margin: var(--oc-space-xsmall) 0;
    border-radius: 13px;
    display: inline-flex;
    overflow: hidden;
    gap: 10px;
    a,
    button {
      display: inline-block;
      gap: var(--oc-space-medium);
      justify-content: flex-start;
      width: 50px;
      overflow: hidden;
      text-align: center;
      font-size: 12px;

      &:focus,
      &:hover {
        background-color: rgba(0, 0, 0, 0.15);
        color: var(--oc-color-swatch-passive-default);
        text-decoration: none;
        .icon-box {
          box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
        }
      }

      .icon-box {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 50px;
        border-radius: 12px;
        color: var(--oc-color-swatch-inverse-default);
        margin-bottom: 2px;
        transition: all 0.2s ease-in-out;
        //background: radial-gradient(circle at 18.7% 37.8%, rgb(250, 250, 250) 0%, rgb(225, 234, 238) 90%);
      }
      &:hover > .icon-box {
        transform: scale(0.9);
      }

      &.router-link-active {
        .icon-box {
          box-shadow: inset 0 0 1px 3px rgba(255,255,255, 0.6);
        }
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

      }
    }
  }
}
.gradient-files {
  .icon-box {
    filter: drop-shadow(0px 1px 5px rgba(0, 0, 0, 0.25));
    overflow: hidden;
    background:
    linear-gradient(90deg,
      var(--oc-color-swatch-primary-muted) 0%,
      var(--oc-color-swatch-primary-gradient) 100%);
  }
}
.gradient-admin {
  .icon-box {
    filter: drop-shadow(0px 1px 5px rgba(0, 0, 0, 0.25));
    overflow: hidden;
    background-color: #afafaf;
    background-image: linear-gradient(-45deg, #2d2d2d 0%, #3e3e3e 100%);

  }
}
</style>
