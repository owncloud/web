<template>
  <form autocomplete="off" @submit.prevent="$emit('confirm')">
    <oc-text-input
      id="create-group-input-display-name"
      v-model="group.displayName"
      class="oc-mb-s"
      :label="$gettext('Group name') + '*'"
      :error-message="formData.displayName.errorMessage"
      :fix-message-line="true"
      @update:model-value="validateDisplayName"
    />
    <input type="submit" class="oc-hidden" />
  </form>
</template>

<script lang="ts">
import { useGettext } from 'vue3-gettext'
import { computed, defineComponent, ref, PropType, unref, watch } from 'vue'
import { Group } from '@ownclouders/web-client/src/generated'
import { MaybeRef, Modal, useClientService, useEventBus, useStore } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'CreateGroupModal',
  props: {
    modal: { type: Object as PropType<Modal>, required: true }
  },
  emits: ['confirm', 'update:confirmDisabled'],
  setup(props, { emit, expose }) {
    const { $gettext } = useGettext()
    const store = useStore()
    const eventBus = useEventBus()
    const clientService = useClientService()

    const group: MaybeRef<Group> = ref({ displayName: '' })
    const formData = ref({
      displayName: {
        errorMessage: '',
        valid: false
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
        const response = await client.groups.createGroup(unref(group))
        store.dispatch('showMessage', {
          title: $gettext('Group was created successfully')
        })
        eventBus.publish('app.admin-settings.groups.add', { ...response?.data, members: [] })
      } catch (error) {
        console.error(error)
        store.dispatch('showErrorMessage', {
          title: $gettext('Failed to create group'),
          error
        })
      }
    }

    expose({ onConfirm })

    return {
      clientService,
      group,
      formData,
      isFormInvalid,

      // unit tests
      onConfirm
    }
  },
  methods: {
    async validateDisplayName() {
      if (this.group.displayName.trim() === '') {
        this.formData.displayName.errorMessage = this.$gettext('Group name cannot be empty')
        this.formData.displayName.valid = false
        return false
      }

      if (this.group.displayName.length > 255) {
        this.formData.displayName.errorMessage = this.$gettext(
          'Group name cannot exceed 255 characters'
        )
        this.formData.displayName.valid = false
        return false
      }

      try {
        const client = this.clientService.graphAuthenticated
        await client.groups.getGroup(this.group.displayName)
        this.formData.displayName.errorMessage = this.$gettext(
          'Group "%{groupName}" already exists',
          {
            groupName: this.group.displayName
          }
        )
        this.formData.displayName.valid = false
        return false
      } catch (e) {}

      this.formData.displayName.errorMessage = ''
      this.formData.displayName.valid = true
      return true
    }
  }
})
</script>
