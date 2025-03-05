<template>
  <form autocomplete="off" @submit.prevent="$emit('confirm')">
    <oc-text-input
      id="create-user-input-user-name"
      v-model="user.onPremisesSamAccountName"
      class="oc-mb-s"
      :label="$gettext('User name') + '*'"
      :error-message="formData.userName.errorMessage"
      :fix-message-line="true"
      @update:model-value="validateUserName"
    />
    <oc-text-input
      id="create-user-input-display-name"
      v-model="user.displayName"
      class="oc-mb-s"
      :label="$gettext('First and last name') + '*'"
      :error-message="formData.displayName.errorMessage"
      :fix-message-line="true"
      @update:model-value="validateDisplayName"
    />
    <oc-text-input
      id="create-user-input-email"
      v-model="user.mail"
      class="oc-mb-s"
      :label="$gettext('Email') + '*'"
      :error-message="formData.email.errorMessage"
      type="email"
      :fix-message-line="true"
      @update:model-value="onInputEmail"
      @change="validateEmail"
    />
    <oc-text-input
      id="create-user-input-password"
      v-model="user.passwordProfile.password"
      autocomplete="new-password"
      class="oc-mb-s"
      :label="$gettext('Password') + '*'"
      :error-message="formData.password.errorMessage"
      type="password"
      :fix-message-line="true"
      @update:model-value="validatePassword"
    />
    <input type="submit" class="oc-hidden" />
  </form>
</template>

<script lang="ts">
import { useGettext } from 'vue3-gettext'
import { computed, defineComponent, ref, unref, PropType, watch } from 'vue'
import * as EmailValidator from 'email-validator'
import { Modal, useClientService, useMessages } from '@ownclouders/web-pkg'
import { useUserSettingsStore } from '../../composables/stores/userSettings'

export default defineComponent({
  name: 'CreateUserModal',
  props: { modal: { type: Object as PropType<Modal>, required: true } },
  emits: ['confirm', 'update:confirmDisabled'],
  setup(props, { emit, expose }) {
    const { showMessage, showErrorMessage } = useMessages()
    const clientService = useClientService()
    const { $gettext } = useGettext()
    const userSettingsStore = useUserSettingsStore()

    const formData = ref<Record<string, { errorMessage: string; valid: boolean }>>({
      userName: {
        errorMessage: '',
        valid: false
      },
      displayName: {
        errorMessage: '',
        valid: false
      },
      email: {
        errorMessage: '',
        valid: false
      },
      password: {
        errorMessage: '',
        valid: false
      }
    })

    const user = ref({
      onPremisesSamAccountName: '',
      displayName: '',
      mail: '',
      passwordProfile: {
        password: ''
      }
    })

    const isFormInvalid = computed(() => {
      return Object.keys(unref(formData))
        .map((k) => !!unref(formData)[k].valid)
        .includes(false)
    })

    watch(
      isFormInvalid,
      () => {
        emit('update:confirmDisabled', unref(isFormInvalid))
      },
      { immediate: true }
    )

    const onConfirm = async () => {
      if (unref(isFormInvalid)) {
        return Promise.reject()
      }

      try {
        const client = clientService.graphAuthenticated
        const { id: createdUserId } = await client.users.createUser(unref(user))
        const createdUser = await client.users.getUser(createdUserId)
        showMessage({ title: $gettext('User was created successfully') })
        userSettingsStore.upsertUser(createdUser)
      } catch (error) {
        console.error(error)
        showErrorMessage({
          title: $gettext('Failed to create user'),
          errors: [error]
        })
      }
    }

    expose({ onConfirm })

    return {
      clientService,
      formData,
      user,
      isFormInvalid,

      // unit tests
      onConfirm
    }
  },
  methods: {
    onInputEmail() {
      if (!EmailValidator.validate(this.user.mail)) {
        return
      }

      this.formData.email.errorMessage = ''
      this.formData.email.valid = true
    },
    async validateUserName() {
      if (this.user.onPremisesSamAccountName.trim() === '') {
        this.formData.userName.errorMessage = this.$gettext('User name cannot be empty')
        this.formData.userName.valid = false
        return false
      }

      if (this.user.onPremisesSamAccountName.includes(' ')) {
        this.formData.userName.errorMessage = this.$gettext('User name cannot contain white spaces')
        this.formData.userName.valid = false
        return false
      }

      if (this.user.onPremisesSamAccountName.length > 255) {
        this.formData.userName.errorMessage = this.$gettext(
          'User name cannot exceed 255 characters'
        )
        this.formData.userName.valid = false
        return false
      }

      // validate username against regex
      // shouldn't contain special characters except . and _
      // shouldn't start with a number
      // matching regex from server side
      const pattern =
        "^[a-zA-Z_][a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*(@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)*$"
      if (!new RegExp(pattern).test(this.user.onPremisesSamAccountName)) {
        this.formData.userName.errorMessage = this.$gettext(
          'User name cannot contain special characters'
        )
        this.formData.userName.valid = false
        return false
      }

      if (
        this.user.onPremisesSamAccountName.length &&
        !isNaN(parseInt(this.user.onPremisesSamAccountName[0]))
      ) {
        this.formData.userName.errorMessage = this.$gettext('User name cannot start with a number')
        this.formData.userName.valid = false
        return false
      }

      try {
        // Validate username by fetching the user. If the request succeeds, we throw a validation error
        const client = this.clientService.graphAuthenticated
        await client.users.getUser(this.user.onPremisesSamAccountName)
        this.formData.userName.errorMessage = this.$gettext('User "%{userName}" already exists', {
          userName: this.user.onPremisesSamAccountName
        })
        this.formData.userName.valid = false
        return false
      } catch {}

      this.formData.userName.errorMessage = ''
      this.formData.userName.valid = true
      return true
    },
    validateDisplayName() {
      this.formData.displayName.valid = false

      if (this.user.displayName.trim() === '') {
        this.formData.displayName.errorMessage = this.$gettext(
          'First and last name cannot be empty'
        )
        return false
      }

      if (this.user.displayName.length > 255) {
        this.formData.displayName.errorMessage = this.$gettext(
          'First and last name cannot exceed 255 characters'
        )
        return false
      }

      this.formData.displayName.errorMessage = ''
      this.formData.displayName.valid = true
      return true
    },
    validateEmail() {
      this.formData.email.valid = false

      if (!EmailValidator.validate(this.user.mail)) {
        this.formData.email.errorMessage = this.$gettext('Please enter a valid email')
        return false
      }

      this.formData.email.errorMessage = ''
      this.formData.email.valid = true
      return true
    },
    validatePassword() {
      this.formData.password.valid = false

      if (this.user.passwordProfile.password.trim() === '') {
        this.formData.password.errorMessage = this.$gettext('Password cannot be empty')
        return false
      }

      this.formData.password.errorMessage = ''
      this.formData.password.valid = true
      return true
    }
  }
})
</script>
