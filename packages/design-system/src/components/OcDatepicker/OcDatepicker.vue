<template>
  <oc-text-input
    v-model="dateInputString"
    v-bind="$attrs"
    :label="label"
    type="date"
    class="oc-date-picker"
    :min="minDate?.toISODate()"
    :fix-message-line="true"
    :clear-button-enabled="isClearable"
    :clear-button-accessible-label="$gettext('Clear date')"
    :error-message="inputErrorMessage"
    :description-message="inputDescriptionMessage"
  />
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, unref, watch } from 'vue'
import { useGettext } from 'vue3-gettext'
import { DateTime } from 'luxon'

export default defineComponent({
  name: 'OcDatepicker',
  status: 'ready',
  release: '1.0.0',
  props: {
    label: { type: String, required: true },
    isClearable: { type: Boolean, default: true },
    currentDate: { type: Object as PropType<DateTime>, required: false, default: null },
    minDate: { type: Object as PropType<DateTime>, required: false, default: null },
    errorMessage: { type: String, required: false, default: '' }
  },
  emits: ['dateChanged'],
  setup(props, { emit, attrs }) {
    const { $gettext, current } = useGettext()
    const dateInputString = ref<string>('')

    const date = computed(() => {
      const date = DateTime.fromISO(unref(dateInputString)).endOf('day')
      return date.isValid ? date : null
    })

    const inputDescriptionMessage = computed(() => {
      if (!unref(date) || unref(inputErrorMessage)) {
        return ''
      }

      return unref(date)
        .setLocale((current || '').split('_')[0])
        .toRelative()
    })

    const isMinDateUndercut = computed(() => {
      if (!props.minDate || !unref(date)) {
        return false
      }
      return unref(date) < props.minDate
    })

    const inputErrorMessage = computed(() => {
      if (props.errorMessage) {
        return props.errorMessage
      }

      if (unref(isMinDateUndercut)) {
        return $gettext('The date must be after %{date}', {
          date: props.minDate
            .minus({ day: 1 })
            .setLocale(current)
            .toLocaleString(DateTime.DATE_SHORT)
        })
      }
      return ''
    })

    onMounted(() => {
      if (props.currentDate) {
        dateInputString.value = props.currentDate.toISODate()
      }
    })

    watch(
      date,
      () => {
        emit('dateChanged', { date: unref(date), error: unref(isMinDateUndercut) })
      },
      {
        deep: true
      }
    )

    return {
      dateInputString,
      inputDescriptionMessage,
      inputErrorMessage
    }
  }
})
</script>
<style lang="scss">
.oc-date-picker {
  input::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
}
</style>
<docs>
```js
<template>
  <div>
    <oc-datepicker :current-date="currentDate" :min-date="minDate" label="Enter or pick a date"
                   @date-changed="onDateChanged"/>
    <p v-if="selectedDate" v-text="selectedDate"/>
  </div>
</template>
<script>
  import {DateTime} from "luxon";

  export default {
    data: () => ({
      minDate: DateTime.now(), currentDate: DateTime.now(), selectedDate: ''
    }),
    methods: {
      onDateChanged({date}) {
        this.selectedDate = date ? date.toLocaleString(DateTime.DATE_FULL) : ''
      }
    }
  }
</script>
```
</docs>
