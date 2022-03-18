<template>
  <main id="account" class="oc-height-1-1 oc-m">
    <div class="oc-flex oc-flex-between oc-flex-bottom oc-width-1-1 oc-border-b oc-py">
      <h1 id="account-page-title" class="oc-page-title oc-m-rm">{{ pageTitle }}</h1>
      <div>
        <oc-button
          v-if="editUrl"
          variation="primary"
          type="a"
          :href="editUrl"
          data-testid="account-page-edit-url-btn"
        >
          <oc-icon name="edit" />
          <translate>Edit</translate>
        </oc-button>
        <oc-button
          v-else-if="editRoute"
          variation="primary"
          type="router-link"
          :to="editRoute"
          data-testid="account-page-edit-route-btn"
        >
          <oc-icon name="edit" />
          <translate>Edit</translate>
        </oc-button>
      </div>
    </div>
    <h2 v-translate class="oc-text-bold oc-text-initial oc-mb">Account Information</h2>
    <dl class="account-page-info oc-flex oc-flex-wrap">
      <div class="account-page-info-username oc-mb oc-width-1-2@s">
        <dt v-translate class="oc-text-normal oc-text-muted">Username</dt>
        <dd>
          {{ user.username || user.id }}
        </dd>
      </div>
      <div v-if="user.username && user.id" class="account-page-info-userid">
        <dt v-translate class="oc-text-normal oc-text-muted">User ID</dt>
        <dd>
          {{ user.id }}
        </dd>
      </div>
      <div class="account-page-info-displayname oc-mb oc-width-1-2@s">
        <dt v-translate class="oc-text-normal oc-text-muted">Display name</dt>
        <dd>
          {{ user.displayname }}
        </dd>
      </div>
      <div class="account-page-info-email oc-mb oc-width-1-2@s">
        <dt v-translate class="oc-text-normal oc-text-muted">Email</dt>
        <dd>
          <template v-if="user.email">{{ user.email }}</template>
          <span v-else v-translate>No email has been set up</span>
        </dd>
      </div>
      <div class="account-page-info-groups oc-mb oc-width-1-2@s">
        <dt v-translate class="oc-text-normal oc-text-muted" @click="loadGroups">
          Group memberships
        </dt>
        <dd data-testid="group-names">
          <oc-spinner
            v-if="loadingGroups"
            :aria-label="$gettext('Loading group membership information')"
          />
          <span v-else-if="groupNames">{{ groupNames }}</span>
          <span v-else v-translate data-testid="group-names-empty"
            >You are not part of any group</span
          >
        </dd>
      </div>
    </dl>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Personal',
  data() {
    return {
      loadingGroups: true,
      groups: []
    }
  },
  computed: {
    ...mapGetters(['user', 'configuration', 'getNavItemsByExtension', 'apps']),
    isAccountEditingEnabled() {
      return !this.apps.settings
    },
    pageTitle() {
      return this.$gettext(this.$route.meta.title)
    },
    editUrl() {
      if (!this.isAccountEditingEnabled) {
        return null
      }
      return this.configuration.server.replace(/\/$/, '') + '/index.php/settings/personal'
    },
    editRoute() {
      const navItems = this.getNavItemsByExtension('settings')
      if (navItems.length > 0) {
        return navItems[0].route || {}
      }
      return null
    },
    groupNames() {
      return this.groups.join(', ')
    }
  },
  mounted() {
    this.loadGroups()
  },
  methods: {
    async loadGroups() {
      this.groups = await this.$client.users.getUserGroups(this.user.id)
      this.loadingGroups = false
    }
  }
}
</script>
<style lang="scss">
.account-page-info dd {
  margin-left: 0;
}
</style>
