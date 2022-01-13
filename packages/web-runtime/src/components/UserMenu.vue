<template>
  <nav v-if="userId" :aria-label="$gettext('Account menu')">
    <oc-button
      id="_userMenuButton"
      ref="menuButton"
      class="oc-topbar-personal oc-height-1-1"
      appearance="raw"
      variation="inverse"
      :aria-label="$gettext('User Menu')"
    >
      <avatar-image
        class="oc-topbar-personal-avatar oc-flex-inline oc-flex-center oc-flex-middle"
        :width="32"
        :userid="userId"
        :user-name="userDisplayName"
      />
    </oc-button>
    <oc-drop
      ref="menu"
      drop-id="account-info-container"
      toggle="#_userMenuButton"
      mode="click"
      close-on-click
      :options="{ pos: 'bottom-right', delayHide: 0 }"
      class="oc-width-auto"
      padding-size="small"
    >
      <template #special>
        <oc-list :raw="true" class="oc-pb-l oc-pt-s oc-pl-s oc-pr-s">
          <li class="oc-text-nowrap">
            <oc-button
              id="oc-topbar-account-manage"
              type="router-link"
              :to="{ path: '/account' }"
              appearance="raw"
              variation="inverse"
              gap-size="xsmall"
              justify-content="left"
              class="row"
            >
              <div class="icon-wrapper oc-pr-s">
                <avatar-image
                  class="oc-personal-avatar uk-flex-inline uk-flex-center uk-flex-middle"
                  :width="32"
                  :userid="userId"
                  :user-name="userDisplayName"
                />
              </div>
              <div class="profile-info-wrapper">
                <span v-text="userDisplayName" />
                <span v-if="hasEmail" class="email" v-text="userEmail" />
              </div>
            </oc-button>
          </li>
          <li v-for="(n, nid) in menuItems" :key="`user-menu-${nid}`">
            <oc-button
              v-if="n.url"
              type="a"
              appearance="raw"
              variation="inverse"
              gap-size="xsmall"
              justify-content="left"
              :target="n.target"
              :href="n.url"
              class="row"
            >
              <div class="icon-wrapper oc-pr-s">
                <oc-icon :name="n.icon" />
              </div>
              <translate>{{ n.title }}</translate>
            </oc-button>
            <oc-button
              v-else
              type="router-link"
              appearance="raw"
              variation="inverse"
              gap-size="xsmall"
              justify-content="left"
              :to="{ path: n.path }"
              class="row"
            >
              <div class="icon-wrapper oc-pr-s">
                <oc-icon :name="n.icon" />
              </div>
              <translate>{{ n.title }}</translate>
            </oc-button>
          </li>
          <li>
            <oc-button
              id="oc-topbar-account-logout"
              appearance="raw"
              variation="inverse"
              gap-size="xsmall"
              justify-content="left"
              class="row"
              @click="logout"
            >
              <div class="icon-wrapper oc-pr-s">
                <oc-icon name="logout-box-r" fill-type="line" />
              </div>
              <translate>Log out</translate>
            </oc-button>
          </li>
          <li class="oc-text-nowrap no-hover">
            <oc-button
              id="oc-topbar-storage"
              appearance="raw"
              variation="inverse"
              gap-size="xsmall"
              justify-content="left"
              class="row"
            >
              <div class="icon-wrapper oc-pr-s">
                <oc-icon name="cloud" fill-type="line" />
              </div>
              <div class="storage-wrapper">
                <translate>Personal storage ({{ parseInt(quotaUsagePercent) }}% full)</translate>
                <translate class="usage">
                  {{ roundTwoDecimals(quotaUsageGb) }} GB of {{ roundTwoDecimals(quotaTotalGb) }} GB
                  used
                </translate>
                <oc-progress
                  :value="quotaUsagePercent"
                  :max="100"
                  size="small"
                  :variation="quotaProgressVariant"
                />
              </div>
            </oc-button>
          </li>
        </oc-list>
      </template>
    </oc-drop>
  </nav>
</template>

<script>
import NavigationMixin from '../mixins/navigationMixin'
import { mapGetters } from 'vuex'

export default {
  mixins: [NavigationMixin],
  props: {
    userId: {
      type: String,
      required: true
    },
    userDisplayName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: false,
      default: ''
    },
    applicationsList: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(['quota']),

    quotaTotal() {
      return this.quota.total
    },
    quotaUsed() {
      return this.quota.used
    },
    quotaTotalGb() {
      return this.byteToGb(this.quotaTotal)
    },
    quotaUsageGb() {
      return this.byteToGb(this.quotaUsed)
    },
    quotaUsagePercent() {
      return (this.quotaUsed / this.quotaTotal) * 100
    },
    quotaProgressVariant() {
      if (this.quotaUsagePercent < 80) return 'primary'
      if (this.quotaUsagePercent < 90) return 'warning'
      return 'danger'
    },
    hasEmail() {
      return this.userEmail !== ''
    },
    menuItems() {
      return this.navigation_getMenuItems(['user'])
    }
  },
  mounted() {
    this.$refs.menu?.tippy?.setProps({
      onHidden: () => this.$refs.menuButton.$el.focus(),
      onShown: () => this.$refs.menu.$el.querySelector('a:first-of-type').focus()
    })
  },
  methods: {
    byteToGb(value) {
      return value / 1024 / 1024 / 1024
    },
    roundTwoDecimals(value) {
      return Math.round(value * 100) / 100
    },
    logout() {
      // Use timeout to leave enough time for the dropdown to be hidden
      setTimeout(() => {
        this.$store.dispatch('logout')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/* TODO: Replace hard coded colors */
#oc-topbar-storage {
  text-align: left !important;
  width: 310px;
  padding-top: 8px;
}
.row {
  width: 100%;
  .icon-wrapper {
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    .oc-personal-avatar {
      width: 32px;
      height: 32px;
    }
  }
  .profile-info-wrapper {
    span {
      float: left;
      clear: left;
    }
    .email {
      font-size: 0.75rem;
      margin-top: -5px;
      font-weight: 200;
      color: #dadcdf !important;
    }
  }
  .storage-wrapper {
    span,
    progress {
      float: left;
      clear: left;
    }
    .usage {
      font-weight: 200;
      font-size: 0.75rem;
      color: #dadcdf !important;
      margin-top: -5px;
    }
  }
  .oc-icon {
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
  }
}
.oc-list {
  background-color: #4f4f4f;
  border-radius: 5px;
  span {
    color: white !important;
  }
  li {
    border-radius: 5px;
    height: 48px;
    span {
      text-decoration: none;
    }
    &:not(.no-hover) {
      cursor: pointer;
      &:hover {
        background-color: #3d3d3d;
      }
    }
  }
  .no-hover button {
    cursor: default !important;
  }
}
</style>
