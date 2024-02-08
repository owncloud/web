<template>
  <div>
    <oc-select
      :model-value="selectedOption"
      :label="$gettext('Login')"
      :options="options"
      :placeholder="$gettext('Select...')"
      :warning-message="
        currentUserSelected ? $gettext('Your own login status will remain unchanged.') : ''
      "
      @update:model-value="changeSelectedOption"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, unref, watch } from 'vue'
import { useGettext } from 'vue3-gettext'
import { User } from '@ownclouders/web-client/src/generated'
import {
  useClientService,
  useEventBus,
  useUserStore,
  Modal,
  useMessages
} from '@ownclouders/web-pkg'

type LoginOption = {
  label: string
  value: boolean
}

export default defineComponent({
  name: 'LoginModal',
  props: {
    modal: { type: Object as PropType<Modal>, required: true },
    users: {
      type: Array as PropType<User[]>,
      required: true
    }
  },
  emits: ['update:confirmDisabled'],
  setup(props, { emit, expose }) {
    const { showMessage, showErrorMessage } = useMessages()
    const clientService = useClientService()
    const eventBus = useEventBus()
    const { $gettext, $ngettext } = useGettext()
    const userStore = useUserStore()

    const selectedOption = ref<LoginOption>()
    const options = ref([
      { label: $gettext('Allowed'), value: true },
      { label: $gettext('Forbidden'), value: false }
    ])

    watch(
      selectedOption,
      () => {
        emit('update:confirmDisabled', !unref(selectedOption))
      },
      { immediate: true }
    )

    const changeSelectedOption = (option: LoginOption) => {
      selectedOption.value = option
    }

    const currentUserSelected = computed(() => {
      return props.users.some((u) => u.id === userStore.user.id)
    })

    onMounted(() => {
      if (props.users.every((u) => u.accountEnabled !== false)) {
        selectedOption.value = unref(options).find(({ value }) => !!value)
      } else if (props.users.every((u) => u.accountEnabled === false)) {
        selectedOption.value = unref(options).find(({ value }) => !value)
      }
    })

    const onConfirm = async () => {
      const affectedUsers = props.users.filter(({ id }) => userStore.user.id !== id)
      const client = clientService.graphAuthenticated
      const promises = affectedUsers.map(({ id }) =>
        client.users.editUser(id, { accountEnabled: unref(selectedOption).value })
      )
      const results = await Promise.allSettled(promises)

      const succeeded = results.filter((r) => r.status === 'fulfilled')
      if (succeeded.length) {
        const title =
          succeeded.length === 1 && affectedUsers.length === 1
            ? $gettext('Login for user "%{user}" was edited successfully', {
                user: affectedUsers[0].displayName
              })
            : $ngettext(
                '%{userCount} user login was edited successfully',
                '%{userCount} users logins edited successfully',
                succeeded.length,
                { userCount: succeeded.length.toString() },
                true
              )
        showMessage({ title })
      }

      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length) {
        failed.forEach(console.error)

        const title =
          failed.length === 1 && affectedUsers.length === 1
            ? $gettext('Failed edit login for user "%{user}"', {
                user: affectedUsers[0].displayName
              })
            : $ngettext(
                'Failed to edit %{userCount} user login',
                'Failed to edit %{userCount} user logins',
                failed.length,
                { userCount: failed.length.toString() },
                true
              )
        showErrorMessage({
          title,
          errors: (failed as PromiseRejectedResult[]).map((f) => f.reason)
        })
      }

      try {
        const usersResponse = await Promise.all(
          (succeeded as any[]).map(({ value }) => client.users.getUser(value.data.id))
        )

        eventBus.publish(
          'app.admin-settings.users.update',
          usersResponse.map(({ data }) => data)
        )
      } catch (e) {
        console.error(e)
      }
    }

    expose({ onConfirm })

    return {
      selectedOption,
      options,
      changeSelectedOption,
      currentUserSelected,

      // unit tests
      onConfirm
    }
  }
})
</script>
