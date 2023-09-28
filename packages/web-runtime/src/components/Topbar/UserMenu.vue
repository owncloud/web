<template>
  <nav :aria-label="$gettext('Account menu')">
    <oc-button
      id="_userMenuButton"
      ref="menuButton"
      v-oc-tooltip="$gettext('User Menu')"
      class="oc-topbar-personal"
      appearance="raw"
      :aria-label="$gettext('User Menu')"
    >
      <avatar-image
        v-if="userId"
        class="oc-topbar-personal-avatar oc-flex-inline oc-flex-center oc-flex-middle"
        :width="32"
        :userid="userId"
        :user-name="user.displayname"
      />
      <oc-avatar-item
        v-else
        class="oc-topbar-unauthenticated-avatar oc-flex-inline oc-flex-center oc-flex-middle"
        :name="$gettext('User Menu login')"
        :width="32"
        icon="user-add"
        icon-fill-type="line"
        icon-color="var(--oc-color-swatch-brand-default)"
        background="var(--oc-color-swatch-brand-contrast)"
      />
    </oc-button>
    <oc-drop
      ref="menu"
      drop-id="account-info-container"
      toggle="#_userMenuButton"
      mode="click"
      close-on-click
      padding-size="small"
      class="oc-overflow-hidden"
    >
      <oc-list class="user-menu-list">
        <template v-if="!userId">
          <li>
            <oc-button
              id="oc-topbar-account-login"
              appearance="raw"
              type="router-link"
              :to="loginLink"
            >
              <oc-icon name="login-box" fill-type="line" class="oc-p-xs" />
              <span v-text="$gettext('Log in')" />
            </oc-button>
          </li>
        </template>
        <template v-else>
          <li>
            <oc-button
              id="oc-topbar-account-manage"
              type="router-link"
              :to="{ path: '/account' }"
              appearance="raw"
            >
              <avatar-image :width="32" :userid="userId" :user-name="user.displayname" />
              <span class="profile-info-wrapper" :class="{ 'oc-py-xs': !user.email }">
                <span class="oc-display-block" v-text="user.displayname" />
                <span v-if="user.email" class="oc-text-small" v-text="user.email" />
              </span>
            </oc-button>
          </li>
          <li v-for="(app, index) in applicationsList" :key="`user-menu-${index}`">
            <oc-button
              v-if="app.url"
              type="a"
              appearance="raw"
              :target="app.target"
              :href="app.url"
            >
              <oc-icon :name="app.icon" class="oc-p-xs" />
              <span v-text="$gettext(app.title)" />
            </oc-button>
            <oc-button v-else type="router-link" appearance="raw" :to="{ path: app.path }">
              <oc-icon :name="app.icon" class="oc-p-xs" />
              <span v-text="$gettext(app.title)" />
            </oc-button>
          </li>
          <li>
            <oc-button id="oc-topbar-account-logout" appearance="raw" @click="logout">
              <oc-icon name="logout-box-r" fill-type="line" class="oc-p-xs" />
              <span v-text="$gettext('Log out')" />
            </oc-button>
          </li>
          <li v-if="quotaEnabled" class="storage-wrapper oc-pl-s">
            <oc-icon name="cloud" fill-type="line" class="oc-p-xs" />
            <div class="storage-wrapper-text oc-width-1-1">
              <p class="oc-my-rm">
                <span class="oc-display-block" v-text="personalStorageLabel" />
                <span class="oc-text-small" v-text="personalStorageDetailsLabel" />
              </p>
              <oc-progress
                v-if="limitedPersonalStorage"
                :value="quotaUsagePercent"
                :max="100"
                size="small"
                :variation="quotaProgressVariant"
              />
            </div>
          </li>
        </template>
      </oc-list>
      <div v-if="imprintUrl || privacyUrl" class="imprint-footer oc-py-s oc-mt-m oc-text-center">
        <oc-button v-if="imprintUrl" type="a" appearance="raw" :href="imprintUrl" target="_blank"
          ><span v-text="$gettext('Imprint')"
        /></oc-button>
        <span v-if="privacyUrl">·</span>
        <oc-button v-if="privacyUrl" type="a" appearance="raw" :href="privacyUrl" target="_blank"
          ><span v-text="$gettext('Privacy')"
        /></oc-button>
      </div>
    </oc-drop>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType, ComponentPublicInstance, computed, unref } from 'vue'
import { mapGetters, mapState } from 'vuex'
import filesize from 'filesize'
import isNil from 'lodash-es/isNil'
import { authService } from '../../services/auth'
import { useCapabilitySpacesEnabled, useRoute, useStore } from 'web-pkg/src/composables'
import { OcDrop } from 'design-system/src/components'

export default defineComponent({
  props: {
    applicationsList: {
      type: Array as PropType<any>,
      required: false,
      default: () => []
    }
  },
  setup() {
    const route = useRoute()
    const loginLink = computed(() => {
      return {
        name: 'login',
        query: { redirectUrl: unref(route).fullPath }
      }
    })
    const store = useStore()
    const imprintUrl = computed(() => {
      return (
        store.getters.configuration.currentTheme.general?.imprintUrl ||
        store.getters.configuration.options.imprintUrl
      )
    })
    const privacyUrl = computed(() => {
      return (
        store.getters.configuration.currentTheme.general?.privacyUrl ||
        store.getters.configuration.options.privacyUrl
      )
    })
    return {
      hasSpaces: useCapabilitySpacesEnabled(),
      loginLink,
      imprintUrl,
      privacyUrl
    }
  },
  computed: {
    ...mapGetters(['quota', 'user']),
    ...mapGetters({ legacyQuota: 'quota' }),
    ...mapState('runtime/spaces', ['spaces']),

    quota() {
      return this.hasSpaces
        ? this.spaces.find((s) => s.driveType === 'personal')?.spaceQuota
        : this.legacyQuota
    },
    useLegacyQuota() {
      return !this.hasSpaces
    },

    userId() {
      return this.user.username || this.user.id
    },
    personalStorageLabel() {
      if (!this.limitedPersonalStorage) {
        return this.$gettext('Personal storage')
      }
      return this.$gettext('Personal storage (%{percentage}% used)', {
        percentage: (this.quotaUsagePercent || 0).toString()
      })
    },
    personalStorageDetailsLabel() {
      const total = this.quota.definition === 'none' ? 0 : this.quota.total || 0
      const used = this.quota.used || 0
      return total
        ? this.$gettext('%{used} of %{total} used', {
            used: filesize(used),
            total: filesize(total)
          })
        : this.$gettext('%{used} used', {
            used: filesize(used),
            total: filesize(total)
          })
    },
    limitedPersonalStorage() {
      if (!this.useLegacyQuota) {
        return this.quota.total !== 0
      }

      return !isNil(this.quota.relative) && this.quota.definition !== 'none'
    },
    quotaEnabled() {
      return !!this.quota
    },
    quotaUsagePercent() {
      return this.useLegacyQuota
        ? parseFloat(this.quota.relative.toFixed(2))
        : parseFloat(((this.quota.used / this.quota.total) * 100).toFixed(2))
    },

    quotaProgressVariant() {
      if ((this.quotaUsagePercent || 0) < 80) {
        return 'primary'
      }
      if ((this.quotaUsagePercent || 0) < 90) {
        return 'warning'
      }
      return 'danger'
    }
  },
  mounted() {
    ;(this.$refs.menu as InstanceType<typeof OcDrop>)?.tippy?.setProps({
      onHidden: () => (this.$refs.menuButton as ComponentPublicInstance).$el.focus(),
      onShown: () =>
        (this.$refs.menu as ComponentPublicInstance).$el.querySelector('a:first-of-type').focus()
    })
  },
  methods: {
    logout() {
      authService.logoutUser()
    }
  }
})
</script>

<style lang="scss" scoped>
.user-menu-list li {
  align-items: center;
  display: flex;
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
    min-height: 3rem;
    padding-left: var(--oc-space-small);
    width: 100%;

    &:focus,
    &:hover {
      background-color: var(--oc-color-background-hover);
      color: var(--oc-color-swatch-passive-default);
      text-decoration: none;
    }

    .profile-info-wrapper {
      text-align: left;
      word-break: break-all;
      line-height: initial;
    }
  }

  &.storage-wrapper {
    gap: var(--oc-space-medium);
    min-height: 3rem;

    .storage-wrapper-text {
      align-self: flex-end;
    }
  }
}

.imprint-footer {
  background-color: var(--oc-color-background-hover);
  margin-left: calc(var(--oc-space-small) * -1);
  width: calc(100% + var(--oc-space-small) * 2);
  margin-bottom: calc(var(--oc-space-small) * -1) !important;
  a {
    font-size: var(--oc-font-size-medium) !important;
    color: var(--oc-color-text-default);
  }
}
</style>
