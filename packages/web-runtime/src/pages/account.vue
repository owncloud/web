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
      <!--<div class="account-page-info-groups oc-mb oc-width-1-2@s">
        <dt v-translate class="oc-text-normal oc-text-muted">Group memberships</dt>
        <dd data-testid="group-names">
          <span v-if="groupNames">{{ groupNames }}</span>
          <span v-else v-translate data-testid="group-names-empty"
            >You are not part of any group</span
          >
        </dd>
      </div>-->
      <div class="account-page-info-language oc-mb oc-width-1-2@s">
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
import { computed, defineComponent, getCurrentInstance, onMounted, unref } from 'vue'
import {
  useAccessToken,
  useCapabilitySpacesEnabled,
  useGraphClient,
  useStore
} from 'web-pkg/src/composables'
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
      const lang = getCurrentInstance()?.proxy?.$language.available
      if (lang) {
        return Object.entries(lang).map(([l,n]) => ({
          label: n,
          value: l,
          default: l === 'en'
        }))
      }
      return []

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
      const current = user.value.language
      if (!current) {
        return unref(languageOptions).find((o) => o.default)
      }
      return unref(languageOptions).find((o) => o.value === current)
    })
    const updateSelectedLanguage = (option) => {
      const headers = new Headers()
      headers.append('Authorization', `Bearer ${unref(accessToken)}`)
      headers.append('X-Requested-With', 'XMLHttpRequest')

      fetch('/ocs/v1.php/cloud/user', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ language: option.value })
      })
        .then((response) => {
          if (response.ok) {
            store.commit('SET_LANGUAGE', option.value)
          } else {
            throw new Error('Language could not be changed')
          }
        })
        .catch((err) => {
          store.dispatch('showMessage', {
            title: 'An error occurred',
            desc: err || 'Language could not be changed',
            status: 'danger'
          })
        })
      return

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

      store.commit('SET_SETTINGS_VALUE', {
        identifier: accountSettingIdentifier,
        value
      })
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
      ...useGraphClient(),
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
