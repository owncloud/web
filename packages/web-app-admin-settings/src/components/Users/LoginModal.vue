<template>
  <oc-modal
    :title="modalTitle"
    :button-cancel-text="$gettext('Cancel')"
    :button-confirm-text="$gettext('Confirm')"
    :button-confirm-disabled="!selectedOption"
    @cancel="$emit('cancel')"
    @confirm="$emit('confirm', { users, value: selectedOption.value })"
  >
    <template #content>
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
    </template>
  </oc-modal>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { User } from 'web-client/src/generated'
import { useStore } from '@ownclouders/web-pkg'

type LoginOption = {
  label: string
  value: boolean
}

export default defineComponent({
  name: 'LoginModal',
  props: {
    users: {
      type: Array as PropType<User[]>,
      required: true
    }
  },
  emits: ['confirm', 'cancel'],
  setup(props) {
    const store = useStore()
    const { $gettext, $ngettext } = useGettext()

    const selectedOption = ref()
    const options = ref([
      { label: $gettext('Allowed'), value: true },
      { label: $gettext('Forbidden'), value: false }
    ])

    const changeSelectedOption = (option: LoginOption) => {
      selectedOption.value = option
    }

    const currentUserSelected = computed(() => {
      return props.users.some((u) => u.id === store.getters.user.uuid)
    })

    const modalTitle = computed(() => {
      return $ngettext(
        'Edit login for "%{user}"',
        'Edit login for %{userCount} users',
        props.users.length,
        {
          user: props.users[0].displayName,
          userCount: props.users.length.toString()
        }
      )
    })

    onMounted(() => {
      if (props.users.every((u) => u.accountEnabled !== false)) {
        selectedOption.value = unref(options).find(({ value }) => !!value)
      } else if (props.users.every((u) => u.accountEnabled === false)) {
        selectedOption.value = unref(options).find(({ value }) => !value)
      }
    })

    return {
      selectedOption,
      options,
      changeSelectedOption,
      currentUserSelected,
      modalTitle
    }
  }
})
</script>
