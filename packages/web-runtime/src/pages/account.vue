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
      <div v-if="isLanguageSupported" class="account-page-info-language oc-mb oc-width-1-2@s">
        <dt v-translate class="oc-text-normal oc-text-muted">Language</dt>
        <dd data-testid="language">
          <oc-select
            v-if="languageOptions"
            :model-value="selectedLanguageOption"
            :clearable="false"
            :options="languageOptions"
            @update:model-value="updateSelectedLanguage"
          />
        </dd>
      </div>
    </dl>
  </main>
</template>

<script lang="ts">
import { mapActions } from 'vuex'
import EditPasswordModal from '../components/EditPasswordModal.vue'
import { computed, defineComponent, onMounted, unref } from 'vue'
import {
  useAccessToken,
  useCapabilitySpacesEnabled,
  useClientService,
  useStore
} from 'web-pkg/src/composables'
import { useTask } from 'vue-concurrency'
import axios from 'axios'
import { v4 as uuidV4 } from 'uuid'
import { useGettext } from 'vue3-gettext'
import { setCurrentLanguage } from 'web-runtime/src/helpers/language'

export default defineComponent({
  name: 'Personal',
  components: {
    EditPasswordModal
  },
  setup() {
    const store = useStore()
    const accessToken = useAccessToken({ store })
    const language = useGettext()
    const clientService = useClientService()

    // FIXME: Use graph capability when we have it
    const isLanguageSupported = useCapabilitySpacesEnabled()
    const isChangePasswordEnabled = useCapabilitySpacesEnabled()
    const user = computed(() => {
      return store.getters.user
    })

    const loadAccountBundleTask = useTask(function* () {
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
        return bundles.find((b) => b.extension === 'ocis-accounts')
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
      const languageOptions = loadAccountBundleTask.last?.value?.settings.find(
        (s) => s.name === 'language'
      )?.singleChoiceValue.options
      return languageOptions?.map((l) => ({
        label: l.displayValue,
        value: l.value.stringValue,
        default: l.default
      }))
    })
    const selectedLanguageOption = computed(() => {
      const current = unref(languageSetting)?.listValue.values[0].stringValue
      if (!current) {
        return unref(languageOptions).find((o) => o.default)
      }
      return unref(languageOptions).find((o) => o.value === current)
    })
    const updateSelectedLanguage = (option) => {
      const bundle = loadAccountBundleTask.last?.value
      const value = {
        bundleId: bundle?.id,
        settingId: bundle?.settings.find((s) => s.name === 'language')?.id,
        resource: { type: 'TYPE_USER' },
        listValue: { values: [{ stringValue: option.value }] },
        ...(unref(languageSetting) && { id: unref(languageSetting).id })
      }

      axios.post(
        '/api/v0/settings/values-save',
        { value: { ...value, accountUuid: 'me' } },
        {
          headers: {
            authorization: `Bearer ${unref(accessToken)}`,
            'X-Request-ID': uuidV4()
          }
        }
      )

      const newSetting = { identifier: accountSettingIdentifier, value }
      store.commit('SET_SETTINGS_VALUE', newSetting)
      setCurrentLanguage({ language, languageSetting: newSetting })
    }
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

    onMounted(() => {
      if (unref(isLanguageSupported)) {
        loadAccountBundleTask.perform()
      }
    })

    return {
      clientService,
      languageOptions,
      selectedLanguageOption,
      updateSelectedLanguage,
      accountEditLink,
      isChangePasswordEnabled,
      isLanguageSupported,
      groupNames,
      user
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
