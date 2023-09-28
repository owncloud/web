<template>
  <portal to="app.runtime.modal">
    <oc-modal
      :title="modalTitle"
      :button-cancel-text="$gettext('Cancel')"
      :button-confirm-text="$gettext('Confirm')"
      :button-confirm-disabled="confirmButtonDisabled"
      @confirm="editQuota"
      @cancel="cancel"
    >
      <template #content>
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
    </oc-modal>
  </portal>
</template>

<script lang="ts">
import { computed, defineComponent, unref, PropType, ref, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import QuotaSelect from '../QuotaSelect.vue'
import { SpaceResource } from '@ownclouders/web-client/src'
import { useClientService, useRouter } from '../../composables'
import { eventBus } from '../../services'
import { useStore, useLoadingService } from '../../composables'
import { Drive } from '@ownclouders/web-client/src/generated'

export default defineComponent({
  name: 'SpaceQuotaModal',
  components: {
    QuotaSelect
  },
  props: {
    spaces: {
      type: Array as PropType<SpaceResource[]>,
      required: true
    },
    cancel: {
      type: Function as PropType<(...args: any) => unknown>,
      required: true
    },
    maxQuota: {
      type: Number,
      default: 0
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
  setup(props) {
    const store = useStore()
    const { $gettext, $ngettext } = useGettext()
    const clientService = useClientService()
    const loadingService = useLoadingService()
    const router = useRouter()
    const selectedOption = ref(0)

    const modalTitle = computed(() => {
      if (props.resourceType === 'space') {
        if (props.spaces.length === 1) {
          return $gettext('Change quota for Space "%{name}"', {
            name: props.spaces[0].name
          })
        }
        return $gettext('Change quota for %{count} Spaces', {
          count: props.spaces.length.toString()
        })
      }
      if (props.resourceType === 'user') {
        if (props.spaces.length === 1) {
          return $gettext('Change quota for user "%{name}"', {
            name: props.spaces[0].name
          })
        }
        return $gettext('Change quota for %{count} users', {
          count: props.spaces.length.toString()
        })
      }
      return $gettext('Change quota')
    })
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

    const changeSelectedQuotaOption = (option) => {
      selectedOption.value = option.value
    }

    const editQuota = async (): Promise<void> => {
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
      const results = await loadingService.addTask(() => {
        return Promise.allSettled<Array<unknown>>(requests)
      })
      const succeeded = results.filter((r) => r.status === 'fulfilled')
      if (succeeded.length) {
        store.dispatch('showMessage', { title: getSuccessMessage(succeeded.length) })
      }
      const errors = results.filter((r) => r.status === 'rejected')
      if (errors.length) {
        errors.forEach(console.error)
        store.dispatch('showErrorMessage', {
          title: getErrorMessage(errors.length),
          errors: (errors as PromiseRejectedResult[]).map((f) => f.reason)
        })
      }

      props.cancel()
    }

    onMounted(() => {
      selectedOption.value = props.spaces[0]?.spaceQuota?.total || 0
    })

    return {
      selectedOption,
      modalTitle,
      confirmButtonDisabled,
      changeSelectedQuotaOption,
      editQuota
    }
  }
})
</script>
