<template>
  <main id="account" class="oc-height-1-1 oc-m">
    <div class="oc-flex oc-flex-between oc-flex-bottom oc-width-1-1 oc-border-b oc-py">
      <h1 id="account-page-title" class="oc-page-title oc-m-rm">{{ pageTitle }}</h1>
      <div>
        <edit-password-modal
          v-if="editPasswordModalOpen"
          @cancel="closeEditPasswordModal"
          @confirm="editPassword"
        ></edit-password-modal>
        <oc-button
          v-if="isChangePasswordEnabled"
          variation="primary"
          data-testid="account-page-edit-url-btn"
          @click="showEditPasswordModal"
        >
          <oc-icon name="lock" />
          <span v-text="$gettext('Change Password')" />
        </oc-button>
        <oc-button
          v-if="editUrl"
          variation="primary"
          type="a"
          :href="editUrl"
          data-testid="account-page-edit-url-btn"
        >
          <oc-icon name="edit" />
          <span v-text="$gettext('Edit')" />
        </oc-button>
        <oc-button
          v-else-if="editRoute"
          variation="primary"
          type="router-link"
          :to="editRoute"
          data-testid="account-page-edit-route-btn"
        >
          <oc-icon name="edit" />
          <span v-text="$gettext('Edit')" />
        </oc-button>
      </div>
    </div>
    <h2 v-translate class="oc-text-bold oc-mb">Account Information</h2>
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
        <dt v-translate class="oc-text-normal oc-text-muted">Group memberships</dt>
        <dd data-testid="group-names">
          <span v-if="groupNames">{{ groupNames }}</span>
          <span v-else v-translate data-testid="group-names-empty"
            >You are not part of any group</span
          >
        </dd>
      </div>
      <div class="account-page-info-language oc-mb oc-width-1-2@s">
        <dt v-translate class="oc-text-normal oc-text-muted">Language</dt>
        <dd data-testid="language">
          <oc-select
            v-if="languageOptions"
            :model-value="selectedLanguageOption"
            :clearable="false"
            :options="languageOptions"
            @update:modelValue="updateSelectedLanguage"
          />
        </dd>
      </div>
    </dl>
  </main>
</template>

<script lang="ts">
import { mapActions, mapGetters } from 'vuex'
import EditPasswordModal from '../components/EditPasswordModal.vue'
import { computed, defineComponent, onMounted, unref } from 'vue'
import { useAccessToken, useGraphClient, useStore } from 'web-pkg/src/composables'
import { urlJoin } from 'web-client/src/utils'
import { configurationManager } from 'web-pkg/src/configuration'
import { useTask } from 'vue-concurrency'
import axios from 'axios'
import { v4 as uuidV4 } from 'uuid'

export default defineComponent({
  name: 'Personal',
  components: {
    EditPasswordModal
  },
  setup() {
    const store = useStore()
    const accessToken = useAccessToken({ store })
    const loadLanguagesTask = useTask(function* () {
      try {
        const {
          data: { bundles }
        } = yield axios.post(
          '/api/v0/settings/bundles-list',
          {},
          {
            headers: {
              authorization: `Bearer ${unref(accessToken)}`,
              'X-Request-ID': uuidV4()
            }
          }
        )

        const accountBundle = bundles.find((b) => b.extension === 'ocis-accounts')
        return accountBundle.settings.find((s) => s.name === 'language')?.singleChoiceValue.options
      } catch (e) {
        console.error(e)
        return []
      }
    }).restartable()

    const accountSettingIdentifier = {
      extension: 'ocis-accounts',
      bundle: 'profile',
      setting: 'language'
    }
    const languageSetting = computed(() => {
      return store.getters.getSettingsValue(accountSettingIdentifier)
    })
    const languageOptions = computed(() => {
      return loadLanguagesTask.last?.value?.map((l) => ({
        label: l.displayValue,
        value: l.value.stringValue
      }))
    })
    const selectedLanguageOption = computed(() => {
      const current = unref(languageSetting).listValue.values[0].stringValue
      return unref(languageOptions).find((o) => o.value === current)
    })
    const updateSelectedLanguage = (option) => {
      axios.post(
        '/api/v0/settings/values-save',
        {
          value: {
            ...unref(languageSetting),
            listValue: { values: [{ stringValue: option.value }] },
            accountUuid: 'me'
          }
        },
        {
          headers: {
            authorization: `Bearer ${unref(accessToken)}`,
            'X-Request-ID': uuidV4()
          }
        }
      )

      store.commit('SET_SETTINGS_VALUE', {
        identifier: accountSettingIdentifier,
        value: {
          ...unref(languageSetting),
          listValue: { values: [{ stringValue: option.value }] }
        }
      })
    }
    onMounted(() => {
      loadLanguagesTask.perform()
    })
    return {
      ...useGraphClient(),
      languageOptions,
      selectedLanguageOption,
      updateSelectedLanguage
    }
  },
  data() {
    return {
      editPasswordModalOpen: false
    }
  },
  computed: {
    ...mapGetters(['user', 'getNavItemsByExtension', 'apps', 'capabilities']),
    isAccountEditingEnabled() {
      return !this.apps.settings
    },
    isChangePasswordEnabled() {
      // FIXME: spaces capability is not correct here, we need to retrieve an appropriate capability
      return this.capabilities.spaces?.enabled
    },
    pageTitle() {
      return this.$gettext(this.$route.meta.title)
    },
    editUrl() {
      if (!this.isAccountEditingEnabled) {
        return null
      }
      return urlJoin(configurationManager.serverUrl, '/index.php/settings/personal')
    },
    editRoute() {
      const navItems = this.getNavItemsByExtension('settings')
      if (navItems.length > 0) {
        return navItems[0].route || {}
      }
      return null
    },
    groupNames() {
      if (this.capabilities.spaces?.enabled) {
        return this.user.groups.map((group) => group.displayName).join(', ')
      }

      return this.user.groups.join(', ')
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    showEditPasswordModal() {
      this.editPasswordModalOpen = true
    },
    closeEditPasswordModal() {
      this.editPasswordModalOpen = false
    },
    editPassword(currentPassword, newPassword) {
      return this.graphClient.users
        .changeOwnPassword(currentPassword.trim(), newPassword.trim())
        .then(() => {
          this.closeEditPasswordModal()
          this.showMessage({
            title: this.$gettext('Password was changed successfully')
          })
        })
        .catch((error) => {
          console.error(error)
          this.showMessage({
            title: this.$gettext('Failed to change password'),
            status: 'danger'
          })
        })
    }
  }
})
</script>
<style lang="scss">
.account-page-info dd {
  margin-left: 0;
}
</style>
