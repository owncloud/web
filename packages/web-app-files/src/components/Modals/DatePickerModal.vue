<template>
  {{ minDate }}
  --
  {{ maxDate }}
  <oc-text-input
    v-model="date"
    :label="$gettext('Expiration date')"
    type="date"
    :min="minDate?.toISODate()"
    :max="maxDate?.toISODate()"
    :fix-message-line="true"
    :error-message="errorMessage"
  />
  <oc-button @click="$emit('confirm', dateTime)">REAL CONFIRM</oc-button>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, unref, watch } from 'vue'
import { Modal } from '@ownclouders/web-pkg'
import { DateTime } from 'luxon'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'DatePickerModal',
  props: {
    modal: { type: Object as PropType<Modal>, required: true },
    currentDate: { type: Object as PropType<DateTime>, required: false, default: null },
    minDate: { type: Object as PropType<DateTime>, required: false, default: null },
    maxDate: { type: Object as PropType<DateTime>, required: false, default: null }
  },
  emits: ['confirm', 'update:confirmDisabled'],
  setup(props, { emit, expose }) {
    const { $gettext, current } = useGettext()
    const date = ref<string>('')
    const errorMessage = ref<string>('')

    const dateTime = computed(() => {
      const dateTime = DateTime.fromISO(unref(date)).endOf('day')
      return dateTime.isValid ? dateTime : null
    })

    onMounted(() => {
      if (props.currentDate) {
        date.value = props.currentDate.toISODate()
      }
    })

    watch(
      dateTime,
      () => {
        emit('update:confirmDisabled', true)

        if (!unref(dateTime)) {
          return
        }

        if (props.minDate && unref(dateTime) < props.minDate) {
          return (errorMessage.value = $gettext('The date must be after %{date}', {
            date: props.minDate
              .minus({ day: 1 })
              .setLocale(current)
              .toLocaleString(DateTime.DATE_SHORT)
          }))
        }

        if (props.maxDate && unref(dateTime) > props.maxDate) {
          return (errorMessage.value = $gettext('The date must be before %{date}', {
            date: props.maxDate
              .plus({ day: 1 })
              .setLocale(current)
              .toLocaleString(DateTime.DATE_SHORT)
          }))
        }

        errorMessage.value = ''
        emit('update:confirmDisabled', false)
      },
      { immediate: true, deep: true }
    )

    const onConfirm = () => {
      console.log('???')
      ///emit('confirm', unref(dateTime))
    }

    return {
      date,
      errorMessage,
      dateTime,
      onConfirm
    }
  }
})
</script>
