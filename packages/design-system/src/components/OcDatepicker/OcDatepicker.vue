<template>
  <oc-text-input
    v-model="dateInputString"
    v-bind="$attrs"
    :label="label"
    type="date"
    :min="minDate?.toISODate()"
    :fix-message-line="true"
    :error-message="errorMessage"
    :clear-button-enabled="isClearable"
    :clear-button-accessible-label="$gettext('Clear date')"
    class="oc-date-picker"
  />
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, unref, watch } from 'vue'
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
    minDate: { type: Object as PropType<DateTime>, required: false, default: null }
  },
  emits: ['dateChanged'],
  setup(props, { emit }) {
    const { $gettext, current } = useGettext()
    const dateInputString = ref<string>('')

    const date = computed(() => {
      const date = DateTime.fromISO(unref(dateInputString)).endOf('day')
      return date.isValid ? date : null
    })

    const isMinDateUndercut = computed(() => {
      if (!props.minDate || !unref(date)) {
        return false
      }
      return unref(date) < props.minDate
    })

    const errorMessage = computed(() => {
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

    watch(
      () => props.currentDate,
      () => {
        if (props.currentDate) {
          dateInputString.value = props.currentDate.toISODate()
          return
        }

        dateInputString.value = undefined
      },
      { immediate: true }
    )

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
      errorMessage
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
