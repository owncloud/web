<template>
  <form autocomplete="off" @submit.prevent="onConfirm">
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
      class="oc-mb-s"
      :label="$gettext('Password') + '*'"
      :error-message="formData.password.errorMessage"
      type="password"
      :fix-message-line="true"
      @update:model-value="validatePassword"
    />
    <input type="submit" class="oc-hidden" />
    <div class="oc-flex oc-flex-right oc-flex-middle oc-mt-m">
      <oc-button
        class="oc-modal-body-actions-cancel oc-ml-s"
        appearance="outline"
        variation="passive"
        @click="onCancel"
        >{{ $gettext('Cancel') }}
      </oc-button>
      <oc-button
        class="oc-modal-body-actions-confirm oc-ml-s"
        appearance="filled"
        variation="primary"
        :disabled="isFormInvalid"
        @click="onConfirm"
        >{{ $gettext('Confirm') }}
      </oc-button>
    </div>
  </form>
</template>

<script lang="ts">
import { useGettext } from 'vue3-gettext'
import { computed, defineComponent, ref, unref } from 'vue'
import * as EmailValidator from 'email-validator'
import { useClientService, useEventBus, useStore } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'CreateUserModal',
  setup(props, { expose }) {
    const store = useStore()
    const eventBus = useEventBus()
    const clientService = useClientService()
    const { $gettext } = useGettext()

    const formData = ref({
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

    const onConfirm = async () => {
      if (unref(isFormInvalid)) {
        return
      }

      try {
        const client = clientService.graphAuthenticated
        const { data } = await client.users.createUser(unref(user))
        const { id: createdUserId } = data
        const { data: createdUser } = await client.users.getUser(createdUserId)
        store.dispatch('showMessage', {
          title: $gettext('User was created successfully')
        })
        eventBus.publish('app.admin-settings.users.add', createdUser)
      } catch (error) {
        console.error(error)
        store.dispatch('showErrorMessage', {
          title: $gettext('Failed to create user'),
          error
        })
      } finally {
        store.dispatch('hideModal')
      }
    }

    const onCancel = () => {
      store.dispatch('hideModal')
    }

    expose({ onConfirm, onCancel })

    return {
      clientService,
      formData,
      user,
      isFormInvalid,
      onConfirm,
      onCancel
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
      this.formData.userName.valid = false

      if (this.user.onPremisesSamAccountName.trim() === '') {
        this.formData.userName.errorMessage = this.$gettext('User name cannot be empty')
        return false
      }

      if (this.user.onPremisesSamAccountName.includes(' ')) {
        this.formData.userName.errorMessage = this.$gettext('User name cannot contain white spaces')
        return false
      }

      if (this.user.onPremisesSamAccountName.length > 255) {
        this.formData.userName.errorMessage = this.$gettext(
          'User name cannot exceed 255 characters'
        )
        return false
      }

      // validate username against regex
      // shouldn't contain special characters except . and _
      // shouldn't start with a number
      // matching regex from server side
      const pattern =
        "^[a-zA-Z_][a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*(@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)*$"
      if (!new RegExp(pattern).test(this.user.onPremisesSamAccountName)) {
        this.formData.userName.errorMessage = this.$gettext(
          'User name cannot contain special characters'
        )
        return false
      }

      if (
        this.user.onPremisesSamAccountName.length &&
        !isNaN(parseInt(this.user.onPremisesSamAccountName[0]))
      ) {
        this.formData.userName.errorMessage = this.$gettext('User name cannot start with a number')
        return false
      }

      try {
        // Validate username by fetching the user. If the request succeeds, we throw a validation error
        const client = this.clientService.graphAuthenticated
        await client.users.getUser(this.user.onPremisesSamAccountName)
        this.formData.userName.errorMessage = this.$gettext('User "%{userName}" already exists', {
          userName: this.user.onPremisesSamAccountName
        })
        return false
      } catch (e) {}

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
