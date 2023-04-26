<template>
  <app-loading-spinner v-if="isLoading" />
  <main v-else id="account" class="oc-height-1-1 oc-m">
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
          v-if="accountEditLink"
          variation="primary"
          type="a"
          :href="accountEditLink.href"
          target="_blank"
          data-testid="account-page-edit-url-btn"
        >
          <oc-icon name="edit" />
          <span v-text="$gettext('Edit')" />
        </oc-button>
      </div>
    </div>
    <h2 class="oc-text-bold oc-mb" v-text="$gettext('Account Information')" />
    <dl class="account-page-info oc-flex oc-flex-wrap">
      <div class="account-page-info-username oc-mb oc-width-1-2@s">
        <dt class="oc-text-normal oc-text-muted" v-text="$gettext('Username')" />
        <dd>
          {{ user.username || user.id }}
        </dd>
      </div>
      <div v-if="user.username && user.id" class="account-page-info-userid">
        <dt class="oc-text-normal oc-text-muted" v-text="$gettext('User ID')" />
        <dd>
          {{ user.id }}
        </dd>
      </div>
      <div class="account-page-info-displayname oc-mb oc-width-1-2@s">
        <dt class="oc-text-normal oc-text-muted" v-text="$gettext('Display name')" />
        <dd>
          {{ user.displayname }}
        </dd>
      </div>
      <div class="account-page-info-email oc-mb oc-width-1-2@s">
        <dt class="oc-text-normal oc-text-muted" v-text="$gettext('Email')" />
        <dd>
          <template v-if="user.email">{{ user.email }}</template>
          <span v-else v-text="$gettext('No email has been set up')" />
        </dd>
      </div>
      <div class="account-page-info-groups oc-mb oc-width-1-2@s">
        <dt class="oc-text-normal oc-text-muted" v-text="$gettext('Group memberships')" />
        <dd data-testid="group-names">
          <span v-if="groupNames">{{ groupNames }}</span>
          <span
            v-else
            data-testid="group-names-empty"
            v-text="$gettext('You are not part of any group')"
          />
        </dd>
      </div>
      <div
        v-if="isSettingsServiceSupported"
        class="account-page-info-language oc-mb oc-width-1-2@s"
      >
        <dt class="oc-text-normal oc-text-muted" v-text="$gettext('Language')" />
        <dd data-testid="language">
          <oc-select
            v-if="languageOptions"
            :model-value="selectedLanguageValue"
            :clearable="false"
            :options="languageOptions"
            @update:model-value="updateSelectedLanguage"
          />
        </dd>
      </div>
      <div v-if="logoutUrl" class="account-page-logout-all-devices oc-mb oc-width-1-2@s">
        <dt class="oc-text-normal oc-text-muted" v-text="$gettext('Logout from active devices')" />
        <dd data-testid="logout">
          <oc-button
            appearance="raw"
            type="a"
            :href="logoutUrl"
            target="_blank"
            data-testid="account-page-logout-url-btn"
          >
            <span v-text="$gettext('Account security')" />
          </oc-button>
        </dd>
      </div>
      <div v-if="showGdprExport" class="account-page-gdpr-export oc-mb oc-width-1-2@s">
        <dt class="oc-text-normal oc-text-muted" v-text="$gettext('GDPR export')" />
        <dd data-testid="gdpr-export">
          <gdpr-export />
        </dd>
      </div>
      <div class="account-page-notification oc-mb oc-width-1-2@s">
        <dt class="oc-text-normal oc-text-muted" v-text="$gettext('Notifications')" />
        <dd data-testid="notification-mails">
          <oc-checkbox
            :model-value="disableEmailNotificationsValue"
            size="large"
            :label="$gettext('Receive notification mails')"
            data-testid="account-page-notification-mails-checkbox"
            @update:model-value="updateDisableEmailNotifications"
          />
        </dd>
      </div>
    </dl>
  </main>
</template>

<script lang="ts">
import { mapActions } from 'vuex'
import EditPasswordModal from '../components/EditPasswordModal.vue'
import { computed, defineComponent, onMounted, unref, ref } from 'vue'
import {
  useAccessToken,
  useCapabilityGraphPersonalDataExport,
  useCapabilitySpacesEnabled,
  useClientService,
  useStore
} from 'web-pkg/src/composables'
import { useTask } from 'vue-concurrency'
import axios from 'axios'
import { v4 as uuidV4 } from 'uuid'
import { useGettext } from 'vue3-gettext'
import { setCurrentLanguage } from 'web-runtime/src/helpers/language'
import GdprExport from 'web-runtime/src/components/Account/GdprExport.vue'
import { useConfigurationManager } from 'web-pkg/src/composables/configuration'
import { isPersonalSpaceResource } from 'web-client/src/helpers'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'

export default defineComponent({
  name: 'Personal',
  components: {
    AppLoadingSpinner,
    EditPasswordModal,
    GdprExport
  },
  setup() {
    const store = useStore()
    const accessToken = useAccessToken({ store })
    const language = useGettext()
    const { $gettext } = language
    const clientService = useClientService()
    const configurationManager = useConfigurationManager()
    const valuesList = ref()
    const bundlesList = ref()
    const selectedLanguageValue = ref()

    // FIXME: Use graph capability when we have it
    const isSettingsServiceSupported = useCapabilitySpacesEnabled()
    const isChangePasswordEnabled = useCapabilitySpacesEnabled()
    const isPersonalDataExportEnabled = useCapabilityGraphPersonalDataExport()
    const user = computed(() => {
      return store.getters.user
    })

    const showGdprExport = computed(() => {
      return (
        unref(isPersonalDataExportEnabled) &&
        store.getters['runtime/spaces/spaces'].some((s) => isPersonalSpaceResource(s))
      )
    })

    const loadValuesList = useTask(function* () {
      try {
        const {
          data: { values }
        } = yield axios.post(
          '/api/v0/settings/values-list',
          { account_uuid: 'me' },
          {
            headers: {
              authorization: `Bearer ${unref(accessToken)}`,
              'X-Request-ID': uuidV4()
            }
          }
        )
        valuesList.value = values || []
      } catch (e) {
        console.error(e)
        store.dispatch('showMessage', {
          title: $gettext('Unable to load account data…'),
          status: 'danger'
        })
        valuesList.value = []
      }
    }).restartable()

    const loadBundlesList = useTask(function* () {
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
        bundlesList.value = bundles.find((b) => b.extension === 'ocis-accounts')
        return bundles.find((b) => b.extension === 'ocis-accounts')
      } catch (e) {
        console.error(e)
        store.dispatch('showMessage', {
          title: $gettext('Unable to load account data…'),
          status: 'danger'
        })
        bundlesList.value = []
      }
    }).restartable()

    const isLoading = computed(() => {
      if (!isSettingsServiceSupported) {
        return false
      }
      return (
        loadValuesList.isRunning ||
        !loadValuesList.last ||
        loadBundlesList.isRunning ||
        !loadBundlesList.last
      )
    })

    const disableEmailNotificationsSettings = computed(() => {
      return unref(valuesList).find(
        (configurationValue) =>
          configurationValue.identifier?.setting === 'disable email notifications'
      )?.value
    })

    const disableEmailNotificationsValue = computed(() => {
      return unref(disableEmailNotificationsSettings)
        ? !unref(disableEmailNotificationsSettings).boolValue
        : true
    })

    const languageOptions = computed(() => {
      const languageOptions = unref(bundlesList).settings.find((s) => s.name === 'language')
        ?.singleChoiceValue.options
      return languageOptions?.map((l) => ({
        label: l.displayValue,
        value: l.value.stringValue,
        default: l.default
      }))
    })

    const accountEditLink = computed(() => {
      return store.getters.configuration?.options?.accountEditLink
    })

    const groupNames = computed(() => {
      if (unref(useCapabilitySpacesEnabled())) {
        return unref(user)
          .groups.map((group) => group.displayName)
          .join(', ')
      }

      return unref(user).groups.join(', ')
    })

    const logoutUrl = computed(() => {
      return configurationManager.logoutUrl
    })

    const updateSelectedLanguage = async (option) => {
      const settingsId = unref(valuesList).find((cV) => cV.identifier.setting === 'language')?.value
        ?.id

      const value = {
        bundleId: unref(bundlesList)?.id,
        settingId: unref(bundlesList)?.settings.find((s) => s.name === 'language')?.id,
        resource: { type: 'TYPE_USER' },
        listValue: { values: [{ stringValue: option.value }] },
        ...(settingsId && { id: settingsId })
      }

      try {
        await axios.post(
          '/api/v0/settings/values-save',
          { value: { ...value, accountUuid: 'me' } },
          {
            headers: {
              authorization: `Bearer ${unref(accessToken)}`,
              'X-Request-ID': uuidV4()
            }
          }
        )

        selectedLanguageValue.value = option
        setCurrentLanguage({
          language,
          languageSetting: {
            identifier: {
              extension: 'ocis-accounts',
              bundle: 'profile',
              setting: 'language'
            },
            value
          }
        })

        /**
         * Edge case: we need to reload the values list to retrieve the settingsId if not set,
         * otherwise the backend saves multiple entries
         */
        if (!settingsId) {
          loadValuesList.perform()
        }
      } catch (e) {
        console.error(e)
        store.dispatch('showMessage', {
          title: $gettext('Unable to save language…'),
          status: 'danger'
        })
      }
    }

    const updateDisableEmailNotifications = async (option) => {
      const bundle = loadBundlesList.last?.value
      const value = {
        bundleId: bundle?.id,
        settingId: bundle?.settings.find((s) => s.name === 'disable email notifications')?.id,
        resource: { type: 'TYPE_USER' },
        boolValue: !option,
        ...(unref(disableEmailNotificationsSettings) && {
          id: unref(disableEmailNotificationsSettings).id
        })
      }

      await axios.post(
        '/api/v0/settings/values-save',
        { value: { ...value, accountUuid: 'me' } },
        {
          headers: {
            authorization: `Bearer ${unref(accessToken)}`,
            'X-Request-ID': uuidV4()
          }
        }
      )
    }

    onMounted(async () => {
      if (unref(isSettingsServiceSupported)) {
        await loadBundlesList.perform()
        await loadValuesList.perform()

        const languageConfiguration = unref(valuesList).find(
          (cV) => cV.identifier.setting === 'language'
        )
        selectedLanguageValue.value = languageConfiguration
          ? unref(languageOptions).find(
              (lO) => lO.value === languageConfiguration.value?.listValue?.values?.[0]?.stringValue
            )
          : unref(languageOptions).find((o) => o.default)
      }
    })

    return {
      clientService,
      languageOptions,
      selectedLanguageValue,
      updateSelectedLanguage,
      updateDisableEmailNotifications,
      accountEditLink,
      isChangePasswordEnabled,
      showGdprExport,
      isSettingsServiceSupported,
      groupNames,
      user,
      logoutUrl,
      isLoading,
      disableEmailNotificationsValue
    }
  },
  data() {
    return {
      editPasswordModalOpen: false
    }
  },
  computed: {
    pageTitle() {
      return this.$gettext(this.$route.meta.title)
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
      return this.clientService.graphAuthenticated.users
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
