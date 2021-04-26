<template>
  <div class="uk-width-1-1 uk-container oc-p">
    <div v-if="loading" class="uk-flex uk-flex-between uk-flex-middle">
      <h1 class="oc-page-title">{{ pageTitle }}</h1>
      <oc-loader />
    </div>
    <template v-else>
      <div class="uk-flex uk-flex-between uk-flex-middle">
        <h1 id="account-page-title" v-translate class="oc-page-title">Account</h1>
        <oc-button v-if="editUrl" variation="primary" type="a" :href="editUrl">
          <oc-icon name="edit" />
          <translate>Edit</translate>
        </oc-button>
        <oc-button v-else-if="editRoute" variation="primary" type="router-link" :to="editRoute">
          <oc-icon name="edit" />
          <translate>Edit</translate>
        </oc-button>
      </div>
      <hr />
      <h2 v-translate class="oc-text-bold oc-text-initial oc-mb">Account Information</h2>

      <dl class="account-page-info uk-flex uk-flex-wrap">
        <div class="oc-mb uk-width-1-2@s">
          <dt v-translate class="account-page-info-username uk-text-normal oc-text-muted">
            Username
          </dt>
          <dd>
            {{ user.username || user.id }}
          </dd>
        </div>
        <div v-if="user.username && user.id">
          <dt v-translate class="account-page-info-userid uk-text-normal oc-text-muted">
            User ID
          </dt>
          <dd>
            {{ user.id }}
          </dd>
        </div>
        <div class="oc-mb uk-width-1-2@s">
          <dt v-translate class="account-page-info-displayname uk-text-normal oc-text-muted">
            Display name
          </dt>
          <dd>
            {{ user.displayname }}
          </dd>
        </div>
        <div class="oc-mb uk-width-1-2@s">
          <dt v-translate class="account-page-info-email uk-text-normal oc-text-muted">
            Email
          </dt>
          <dd>
            <template v-if="user.email">{{ user.email }}</template>
            <span v-else v-translate>No email has been set up</span>
          </dd>
        </div>
        <div class="oc-mb uk-width-1-2@s">
          <dt
            v-translate
            class="account-page-info-groups uk-text-normal oc-text-muted"
            @click="$_oc_settingsAccount_getGroup"
          >
            Group memberships
          </dt>
          <dd>
            <span v-if="groupNames">{{ groupNames }}</span>
            <span v-else v-translate>You are not part of any group</span>
          </dd>
        </div>
      </dl>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Personal',
  data() {
    return {
      loading: true,
      groups: []
    }
  },
  computed: {
    ...mapGetters(['user', 'configuration', 'getNavItemsByExtension', 'isOcis']),
    pageTitle() {
      return this.$gettext(this.$route.meta.title)
    },
    editUrl() {
      if (this.isOcis) {
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
    this.$_oc_settingsAccount_getGroup()
  },
  methods: {
    $_oc_settingsAccount_getGroup() {
      this.$client.users.getUserGroups(this.user.id).then(groups => {
        this.groups = groups
        this.loading = false
      })
    }
  }
}
</script>
