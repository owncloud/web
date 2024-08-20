<template>
  <div class="oc-flex oc-flex-middle oc-flex-nowrap">
    <oc-button
      data-testid="recipient-datepicker-btn"
      class="files-collaborators-expiration-button oc-p-s action-menu-item"
      appearance="raw"
      gap-size="none"
      :aria-label="dateCurrent ? $gettext('Edit expiration date') : $gettext('Set expiration date')"
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
    v-if="dateCurrent"
    class="recipient-edit-expiration-btn-remove"
    appearance="raw"
    :aria-label="$gettext('Remove expiration date')"
    @click="dateCurrent = null"
  >
    <oc-icon name="close" />
  </oc-button>
</template>

<script lang="ts">
import { DateTime } from 'luxon'
import { computed, watch, defineComponent, customRef, PropType, unref } from 'vue'
import { useModals } from '@ownclouders/web-pkg'
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
    const { dispatchModal } = useModals()

    const dateCurrent = customRef<DateTime>((track, trigger) => {
      let date: DateTime = null
      return {
        get() {
          track()
          return date
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
        hideActions: true,
        customComponent: DatePickerModal,
        customComponentAttrs: () => ({
          currentDate: unref(dateCurrent),
          minDate: DateTime.now()
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

    return {
      language,
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
