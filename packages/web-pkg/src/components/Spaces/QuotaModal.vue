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
          :title="$gettext('Quota')"
          :total-quota="selectedOption"
          :max-quota="maxQuota"
          @selected-option-change="changeSelectedQuotaOption"
        />
      </template>
    </oc-modal>
  </portal>
</template>

<script lang="ts">
import { computed, defineComponent, unref, PropType } from 'vue'
import { mapActions, mapMutations } from 'vuex'
import { useGettext } from 'vue3-gettext'
import { useGraphClient } from 'web-pkg/src/composables'
import QuotaSelect from 'web-pkg/src/components/QuotaSelect.vue'
import { SpaceResource } from 'web-client/src'
import { eventBus } from 'web-pkg/src'

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
    resourceType: {
      type: String,
      required: false,
      default: 'space',
      validator: (value: string) => {
        return ['space', 'user'].includes(value)
      }
    }
  },
  emits: ['spaceQuotaUpdated'],
  setup(props) {
    const { $gettext, $ngettext } = useGettext()

    const modalTitle = computed(() => {
      if (props.resourceType === 'space') {
        if (props.spaces.length === 1) {
          return $gettext('Change quota for space "%{name}"', {
            name: props.spaces[0].name
          })
        }
        return $gettext('Change quota for %{count} spaces', {
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

    return {
      ...useGraphClient(),
      modalTitle,
      getSuccessMessage,
      getErrorMessage
    }
  },
  data: function () {
    return {
      selectedOption: 0
    }
  },
  computed: {
    confirmButtonDisabled() {
      return !this.spaces.some((space) => space.spaceQuota.total !== this.selectedOption)
    }
  },
  mounted() {
    this.selectedOption = this.spaces[0]?.spaceQuota?.total || 0
  },
  methods: {
    ...mapActions(['showMessage']),
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),
    ...mapMutations('runtime/spaces', ['UPDATE_SPACE_FIELD']),

    changeSelectedQuotaOption(option) {
      this.selectedOption = option.value
    },
    async editQuota(): Promise<void> {
      const requests = this.spaces.map(async (space): Promise<void> => {
        const { data: driveData } = await this.graphClient.drives.updateDrive(
          space.id,
          { quota: { total: this.selectedOption } },
          {}
        )
        this.cancel()
        if (unref(this.$router.currentRoute).name === 'admin-settings-spaces') {
          eventBus.publish('app.admin-settings.spaces.space.quota.updated', {
            spaceId: space.id,
            quota: driveData.quota
          })
        }
        this.UPDATE_SPACE_FIELD({
          id: space.id,
          field: 'spaceQuota',
          value: driveData.quota
        })
        this.UPDATE_RESOURCE_FIELD({
          id: space.id,
          field: 'spaceQuota',
          value: driveData.quota
        })
      })
      const results = await Promise.allSettled<Array<unknown>>(requests)
      const succeeded = results.filter((r) => r.status === 'fulfilled')
      if (succeeded.length) {
        this.showMessage({ title: this.getSuccessMessage(succeeded.length) })
      }
      const errors = results.filter((r) => r.status === 'rejected')
      if (errors.length) {
        errors.forEach(console.error)
        this.showMessage({ title: this.getErrorMessage(errors.length) })
      }
    }
  }
})
</script>
