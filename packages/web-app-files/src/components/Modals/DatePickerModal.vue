<template>
  <oc-datepicker
    :label="$gettext('Expiration date')"
    type="date"
    :min-date="minDate"
    :current-date="currentDate"
    :is-clearable="isClearable"
    @date-changed="onDateChanged"
  />

  <div class="link-modal-actions oc-flex oc-flex-right oc-flex-middle oc-mt-s">
    <oc-button
      class="oc-modal-body-actions-cancel oc-ml-s"
      appearance="outline"
      variation="passive"
      @click="$emit('cancel')"
      >{{ $gettext('Cancel') }}
    </oc-button>
    <oc-button
      :disabled="confirmDisabled"
      class="oc-modal-body-actions-confirm oc-ml-s"
      appearance="filled"
      variation="primary"
      @click="$emit('confirm', dateTime)"
      >{{ $gettext('Confirm') }}
    </oc-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { Modal } from '@ownclouders/web-pkg'
import { DateTime } from 'luxon'

export default defineComponent({
  name: 'DatePickerModal',
  props: {
    modal: { type: Object as PropType<Modal>, required: true },
    currentDate: { type: Object as PropType<DateTime>, required: false, default: null },
    minDate: { type: Object as PropType<DateTime>, required: false, default: null },
    isClearable: { type: Boolean, default: true }
  },
  emits: ['confirm', 'cancel'],
  setup() {
    const dateTime = ref<DateTime>()
    const confirmDisabled = ref(true)
    const onDateChanged = ({ date, error }: { date: DateTime; error: boolean }) => {
      confirmDisabled.value = error || !date
      dateTime.value = date
    }

    return {
      confirmDisabled,
      onDateChanged,
      dateTime
    }
  }
})
</script>
