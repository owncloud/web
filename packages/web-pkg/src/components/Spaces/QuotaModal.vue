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
import { SpaceResource } from '@ownclouders/web-client'
import {
  Modal,
  useClientService,
  useMessages,
  useSpacesStore,
  useCapabilityStore,
  useResourcesStore
} from '../../composables'
import { useRouter } from '../../composables/router'
import { eventBus } from '../../services'
import { storeToRefs } from 'pinia'
import { ContextualHelperData } from 'design-system/src/helpers'

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
      type: Object as PropType<ContextualHelperData>,
      default: (): ContextualHelperData => ({})
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
    const { showMessage, showErrorMessage } = useMessages()
    const capabilityStore = useCapabilityStore()
    const capabilityRefs = storeToRefs(capabilityStore)
    const { $gettext, $ngettext } = useGettext()
    const clientService = useClientService()
    const router = useRouter()
    const spacesStore = useSpacesStore()
    const { updateResourceField } = useResourcesStore()

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

    const changeSelectedQuotaOption = (option: { value: number }) => {
      selectedOption.value = option.value
    }

    const onConfirm = async () => {
      const client = clientService.graphAuthenticated
      const requests = props.spaces.map(async (space): Promise<void> => {
        const updatedSpace = await client.drives.updateDrive(
          space.id,
          { name: space.name, quota: { total: unref(selectedOption) } },
          {}
        )
        if (unref(router.currentRoute).name === 'admin-settings-spaces') {
          eventBus.publish('app.admin-settings.spaces.space.quota.updated', {
            spaceId: space.id,
            quota: updatedSpace.spaceQuota
          })
        }
        if (unref(router.currentRoute).name === 'admin-settings-users') {
          eventBus.publish('app.admin-settings.users.user.quota.updated', {
            spaceId: space.id,
            quota: updatedSpace.spaceQuota
          })
        }
        spacesStore.updateSpaceField({
          id: space.id,
          field: 'spaceQuota',
          value: updatedSpace.spaceQuota
        })
        updateResourceField<SpaceResource>({
          id: space.id,
          field: 'spaceQuota',
          value: updatedSpace.spaceQuota
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
      maxQuota: capabilityRefs.spacesMaxQuota,

      // unit tests
      onConfirm
    }
  }
})
</script>
