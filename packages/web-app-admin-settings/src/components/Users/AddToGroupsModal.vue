<template>
  <group-select
    :selected-groups="selectedOptions"
    :group-options="groups"
    @selected-option-change="changeSelectedGroupOption"
  />
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
      :disabled="!selectedOptions.length"
      @click="onConfirm"
      >{{ $gettext('Confirm') }}
    </oc-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { Group, User } from '@ownclouders/web-client/src/generated'
import GroupSelect from './GroupSelect.vue'
import {
  useStore,
  useEventBus,
  useClientService,
  useConfigurationManager,
  useLoadingService
} from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'AddToGroupsModal',
  components: { GroupSelect },
  props: {
    groups: {
      type: Array as PropType<Group[]>,
      required: true
    },
    users: {
      type: Array as PropType<User[]>,
      required: true
    }
  },
  setup(props, { expose }) {
    const store = useStore()
    const clientService = useClientService()
    const configurationManager = useConfigurationManager()
    const loadingService = useLoadingService()
    const eventBus = useEventBus()
    const { $gettext, $ngettext } = useGettext()

    const selectedOptions = ref<Group[]>([])
    const changeSelectedGroupOption = (options: Group[]) => {
      selectedOptions.value = options
    }

    const onConfirm = async () => {
      const client = clientService.graphAuthenticated
      const usersToFetch = []
      const promises = unref(selectedOptions).reduce((acc, group) => {
        for (const user of props.users) {
          if (!user.memberOf.find((userGroup) => userGroup.id === group.id)) {
            acc.push(client.groups.addMember(group.id, user.id, configurationManager.serverUrl))
            if (!usersToFetch.includes(user.id)) {
              usersToFetch.push(user.id)
            }
          }
        }
        return acc
      }, [])

      if (!promises.length) {
        const title = $ngettext(
          'Group assignment already added',
          'Group assignments already added',
          props.users.length * unref(selectedOptions).length
        )
        store.dispatch('showMessage', { title })
        return
      }

      const results = await loadingService.addTask(() => {
        return Promise.allSettled(promises)
      })

      const succeeded = results.filter((r) => r.status === 'fulfilled')
      if (succeeded.length) {
        const title =
          succeeded.length === 1 && unref(selectedOptions).length === 1 && props.users.length === 1
            ? $gettext('Group assignment "%{group}" was added successfully', {
                group: unref(selectedOptions)[0].displayName
              })
            : $ngettext(
                '%{groupAssignmentCount} group assignment was added successfully',
                '%{groupAssignmentCount} group assignments were added successfully',
                succeeded.length,
                { groupAssignmentCount: succeeded.length.toString() },
                true
              )
        store.dispatch('showMessage', { title })
      }

      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length) {
        failed.forEach(console.error)

        const title =
          failed.length === 1 && unref(selectedOptions).length === 1 && props.users.length === 1
            ? $gettext('Failed to add group assignment "%{group}"', {
                group: unref(selectedOptions)[0].displayName
              })
            : $ngettext(
                'Failed to add %{groupAssignmentCount} group assignment',
                'Failed to add %{groupAssignmentCount} group assignments',
                failed.length,
                { groupAssignmentCount: failed.length.toString() },
                true
              )
        store.dispatch('showErrorMessage', {
          title,
          errors: (failed as PromiseRejectedResult[]).map((f) => f.reason)
        })
      }

      try {
        const usersResponse = await Promise.all(
          usersToFetch.map((userId) => client.users.getUser(userId))
        )
        eventBus.publish(
          'app.admin-settings.users.update',
          usersResponse.map(({ data }) => data)
        )
      } catch (e) {
        console.error(e)
      } finally {
        store.dispatch('hideModal')
      }
    }

    const onCancel = () => {
      store.dispatch('hideModal')
    }

    expose({ onConfirm, onCancel })

    return {
      selectedOptions,
      changeSelectedGroupOption,
      onConfirm,
      onCancel
    }
  }
})
</script>
