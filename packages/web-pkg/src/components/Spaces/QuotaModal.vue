<template>
  <quota-select
    id="quota-select-batch-action-form"
    :label="$gettext('Quota')"
    :total-quota="selectedOption"
    :max-quota="maxQuota"
    @selected-option-change="changeSelectedQuotaOption"
  />
  <div v-if="warningMessage" class="oc-mt-s">
    <span class="oc-text-input-warning" v-text="warningMessage" />
    <oc-contextual-helper
      v-if="warningMessageContextualHelperData"
      class="oc-pl-xs"
      v-bind="warningMessageContextualHelperData"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, unref, PropType, ref, onMounted, watch } from 'vue'
import { useGettext } from 'vue3-gettext'
import QuotaSelect from '../QuotaSelect.vue'
import { SpaceResource } from '@ownclouders/web-client/src'
import {
  Modal,
  useCapabilitySpacesMaxQuota,
  useClientService,
  useMessages
} from '../../composables'
import { useRouter } from '../../composables/router'
import { eventBus } from '../../services'
import { useStore } from '../../composables'
import { Drive } from '@ownclouders/web-client/src/generated'

export default defineComponent({
  name: 'SpaceQuotaModal',
  components: {
    QuotaSelect
  },
  props: {
    modal: { type: Object as PropType<Modal>, required: true },
    spaces: {
      type: Array as PropType<SpaceResource[]>,
      required: true
    },
    warningMessage: {
      type: String,
      default: ''
    },
    warningMessageContextualHelperData: {
      type: Object,
      default: () => {}
    },
    resourceType: {
      type: String,
      required: false,
      default: 'space',
      validator: (value: string) => {
        return ['space', 'user'].includes(value)
      }
    }
  },
  emits: ['update:confirmDisabled'],
  setup(props, { emit, expose }) {
    const store = useStore()
    const { showMessage, showErrorMessage } = useMessages()
    const { $gettext, $ngettext } = useGettext()
    const clientService = useClientService()
    const router = useRouter()
    const maxQuota = useCapabilitySpacesMaxQuota()

    const selectedOption = ref(0)

    const getSuccessMessage = (count: number) => {
      if (props.resourceType === 'space') {
        return $ngettext(
          'Space quota was changed successfully',
          'Quota of %{count} spaces was changed successfully',
          count,
          { count: count.toString() }
        )
      }
      if (props.resourceType === 'user') {
        return $ngettext(
          'User quota was changed successfully',
          'Quota of %{count} users was changed successfully',
          count,
          { count: count.toString() }
        )
      }
      return $gettext('Quota was changed successfully')
    }
    const getErrorMessage = (count: number) => {
      if (props.resourceType === 'space') {
        return $ngettext(
          'Failed to change space quota',
          'Failed to change quota for %{count} spaces',
          count,
          { count: count.toString() }
        )
      }
      if (props.resourceType === 'user') {
        return $ngettext(
          'Failed to change user quota',
          'Failed to change quota for %{count} users',
          count,
          { count: count.toString() }
        )
      }
      return $gettext('Failed to change quota')
    }

    const confirmButtonDisabled = computed(() => {
      return !props.spaces.some((space) => space.spaceQuota.total !== unref(selectedOption))
    })

    watch(
      confirmButtonDisabled,
      () => {
        emit('update:confirmDisabled', unref(confirmButtonDisabled))
      },
      { immediate: true }
    )

    const changeSelectedQuotaOption = (option) => {
      selectedOption.value = option.value
    }

    const onConfirm = async () => {
      const client = clientService.graphAuthenticated
      const requests = props.spaces.map(async (space): Promise<void> => {
        const { data: driveData } = await client.drives.updateDrive(
          space.id.toString(),
          { quota: { total: unref(selectedOption) } } as Drive,
          {}
        )
        if (unref(router.currentRoute).name === 'admin-settings-spaces') {
          eventBus.publish('app.admin-settings.spaces.space.quota.updated', {
            spaceId: space.id,
            quota: driveData.quota
          })
        }
        if (unref(router.currentRoute).name === 'admin-settings-users') {
          eventBus.publish('app.admin-settings.users.user.quota.updated', {
            spaceId: space.id,
            quota: driveData.quota
          })
        }
        store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
          id: space.id,
          field: 'spaceQuota',
          value: driveData.quota
        })
        store.commit('Files/UPDATE_RESOURCE_FIELD', {
          id: space.id,
          field: 'spaceQuota',
          value: driveData.quota
        })
      })
      const results = await Promise.allSettled<Array<unknown>>(requests)
      const succeeded = results.filter((r) => r.status === 'fulfilled')
      if (succeeded.length) {
        showMessage({ title: getSuccessMessage(succeeded.length) })
      }
      const errors = results.filter((r) => r.status === 'rejected')
      if (errors.length) {
        console.error(errors)
        errors.forEach(console.error)
        showErrorMessage({
          title: getErrorMessage(errors.length),
          errors: (errors as PromiseRejectedResult[]).map((f) => f.reason)
        })
      }
    }

    expose({ onConfirm })

    onMounted(() => {
      selectedOption.value = props.spaces[0]?.spaceQuota?.total || 0
    })

    return {
      selectedOption,
      confirmButtonDisabled,
      changeSelectedQuotaOption,
      maxQuota,

      // unit tests
      onConfirm
    }
  }
})
</script>
