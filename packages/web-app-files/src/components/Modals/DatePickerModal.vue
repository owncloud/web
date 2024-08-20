<template>
  <oc-text-input
    v-model="date"
    :label="$gettext('Expiration date')"
    type="date"
    :min="minDate?.toISODate()"
    :fix-message-line="true"
    :error-message="errorMessage"
  />

  <div class="link-modal-actions oc-flex oc-flex-right oc-flex-middle oc-mt-s">
    <oc-button
      class="link-modal-cancel oc-modal-body-actions-cancel oc-ml-s"
      appearance="outline"
      variation="passive"
      @click="$emit('cancel')"
      >{{ $gettext('Cancel') }}
    </oc-button>
    <oc-button
      class="link-modal-confirm oc-modal-body-actions-confirm oc-ml-s"
      appearance="filled"
      variation="primary"
      @click="$emit('confirm', dateTime)"
      >{{ $gettext('Confirm') }}
    </oc-button>
  </div>
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
    minDate: { type: Object as PropType<DateTime>, required: false, default: null }
  },
  emits: ['confirm', 'update:confirmDisabled', 'cancel'],
  setup(props, { emit }) {
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

        errorMessage.value = ''
        emit('update:confirmDisabled', false)
      },
      { immediate: true, deep: true }
    )

    return {
      date,
      errorMessage,
      dateTime
    }
  }
})
</script>
