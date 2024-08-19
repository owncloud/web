<template>
  <div class="oc-flex oc-flex-middle oc-flex-nowrap">
    <div>
      <oc-button
        class="files-collaborators-expiration-button oc-p-s action-menu-item"
        data-testid="recipient-datepicker-btn"
        appearance="raw"
        gap-size="none"
        :aria-label="
          dateCurrent ? $gettext('Edit expiration date') : $gettext('Set expiration date')
        "
        @click="showDatePickerModal"
      >
        <oc-icon name="calendar-event" fill-type="line" size="medium" variation="passive" />
        <span
          v-if="!dateCurrent"
          key="no-expiration-date-label"
          v-text="$gettext('Set expiration date')"
        />
        <span
          v-else
          key="set-expiration-date-label"
          v-text="$gettext('Expires %{expires}', { expires: dateExpire })"
        />
      </oc-button>
    </div>
    <oc-button
      v-if="!enforced && dateCurrent"
      class="recipient-edit-expiration-btn-remove"
      appearance="raw"
      :aria-label="$gettext('Remove expiration date')"
      @click="dateCurrent = null"
    >
      <oc-icon name="close" />
    </oc-button>
  </div>
</template>

<script lang="ts">
import { DateTime } from 'luxon'
import { computed, watch, defineComponent, customRef, PropType, unref } from 'vue'
import { useCapabilityStore, useModals } from '@ownclouders/web-pkg'
import { ShareTypes } from '@ownclouders/web-client'
import { formatRelativeDateFromDateTime } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import DatePickerModal from '../../../../Modals/DatePickerModal.vue'

export default defineComponent({
  name: 'DateCurrentpicker',
  props: {
    shareTypes: {
      type: Array as PropType<number[]>,
      required: false,
      default: (): number[] => []
    }
  },
  emits: ['optionChange'],
  setup(props, { emit }) {
    const language = useGettext()
    const capabilityStore = useCapabilityStore()
    const { dispatchModal } = useModals()

    const optionsUser = computed(() => capabilityStore.sharingUserExpireDate)
    const optionsGroup = computed(() => capabilityStore.sharingGroupExpireDate)
    const enforced = computed(() => optionsUser.value?.enforced || optionsGroup.value?.enforced)
    const dateMin = DateTime.now()

    const dateDefault = computed(() => {
      const hasUserCollaborators = props.shareTypes.includes(ShareTypes.user.value)
      const hasGroupCollaborators = props.shareTypes.includes(ShareTypes.group.value)
      const userMaxExpirationDays = parseInt(optionsUser.value?.days)
      const groupMaxExpirationDays = parseInt(optionsGroup.value?.days)

      if (!(optionsUser.value?.enabled || optionsGroup.value?.enabled)) {
        return null
      }

      let days = 0
      if (
        userMaxExpirationDays &&
        hasUserCollaborators &&
        groupMaxExpirationDays &&
        hasGroupCollaborators
      ) {
        days = Math.min(userMaxExpirationDays, groupMaxExpirationDays)
      } else if (userMaxExpirationDays && hasUserCollaborators) {
        days = userMaxExpirationDays
      } else if (groupMaxExpirationDays && hasGroupCollaborators) {
        days = groupMaxExpirationDays
      }

      if (!days) {
        return null
      }

      return DateTime.now().plus({ days })
    })
    const dateMax = computed(() => (enforced.value ? dateDefault.value : null))
    const dateCurrent = customRef<DateTime>((track, trigger) => {
      let date: DateTime = null
      return {
        get() {
          track()
          return date || dateDefault.value
        },
        set(val: DateTime) {
          date = val
          trigger()
        }
      }
    })
    const dateExpire = computed(() =>
      formatRelativeDateFromDateTime(dateCurrent.value.endOf('day'), language.current)
    )

    const showDatePickerModal = () => {
      dispatchModal({
        title: language.$gettext('Set expiration date'),
        customComponent: DatePickerModal,
        customComponentAttrs: () => ({
          currentDate: unref(dateCurrent),
          minDate: unref(dateMin),
          maxDate: unref(dateMax)
        }),
        onConfirm: (expirationDateTime) => {
          dateCurrent.value = expirationDateTime as any
        }
      })
    }

    watch(dateCurrent, (val) => {
      emit('optionChange', {
        expirationDate: unref(dateCurrent).isValid ? dateCurrent.value : null
      })
    })

    watch(dateMax, (val) => {
      if (!val || dateCurrent.value < val) {
        return
      }

      dateCurrent.value = val
    })

    return {
      language,
      enforced,
      dateCurrent,
      dateExpire,
      showDatePickerModal
    }
  }
})
</script>

<style lang="scss" scoped>
.recipient-edit-expiration-btn-remove {
  vertical-align: middle;
}
</style>
