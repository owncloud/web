<template>
  <div class="oc-flex oc-flex-center expiration-date-indicator">
    <oc-icon
      v-oc-tooltip="expirationDateTooltip"
      :aria-label="expirationDateTooltip"
      name="calendar-event"
      fill-type="line"
    />
    <span class="oc-invisible-sr" v-text="screenreaderShareExpiration" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, unref } from 'vue'
import { DateTime } from 'luxon'
import { formatDateFromDateTime, formatRelativeDateFromDateTime } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'ExpirationDateIndicator',
  props: {
    expirationDate: { type: Object as PropType<DateTime>, required: false, default: null }
  },
  emits: ['confirm', 'cancel'],
  setup(props) {
    const { $gettext, current: currentLanguage } = useGettext()

    const expirationDateRelative = computed(() => {
      return formatRelativeDateFromDateTime(props.expirationDate, currentLanguage)
    })

    const dateExpire = computed(() => {
      return formatDateFromDateTime(props.expirationDate, currentLanguage)
    })

    const expirationDateTooltip = computed(() => {
      return $gettext(
        'Expires %{timeToExpiry} (%{expiryDate})',
        { timeToExpiry: unref(expirationDateRelative), expiryDate: unref(dateExpire) },
        true
      )
    })

    const screenreaderShareExpiration = computed(() => {
      return $gettext('Share expires %{ expiryDateRelative } (%{ expiryDate })', {
        expiryDateRelative: unref(expirationDateRelative),
        expiryDate: unref(dateExpire)
      })
    })

    return {
      expirationDateTooltip,
      screenreaderShareExpiration
    }
  }
})
</script>
