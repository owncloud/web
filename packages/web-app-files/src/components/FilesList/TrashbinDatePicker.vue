<template>
  <div class="oc-flex oc-flex-row trashbin-datepicker">
    <oc-datepicker
      v-model="rangeSelected"
      :min-date="dateMin"
      :max-date="dateMax"
      :locale="language.current"
      :is-range="true"
      class="trashbin-datepicker oc-width-1-1"
      data-testid="trashbin-datepicker"
    >
      <template #default="{ togglePopover }">
        <oc-button
          class="oc-p-m action-menu-item"
          data-testid="trashbin-datepicker-btn"
          appearance="raw"
          :aria-label="
            rangeSelected ? $gettext('Edit time interval') : $gettext('Set time interval')
          "
          @click="togglePopover"
        >
          <oc-icon name="calendar-event" fill-type="line" size="medium" variation="passive" />
          <span
            v-if="!rangeSelected"
            key="no-selected-date-label"
            v-text="$gettext('Set time interval')"
          />
          <span v-else key="set-selected-date-label" v-text="formatRange(rangeSelected)" />
        </oc-button>
      </template>
    </oc-datepicker>
    <oc-button
      v-if="rangeSelected"
      class="recipient-edit-expiration-btn-remove"
      appearance="raw"
      :aria-label="$gettext('Remove time interval')"
      @click="rangeSelected = null"
    >
      <oc-icon name="close" />
    </oc-button>
  </div>
</template>

<script lang="ts">
import { DateTime } from 'luxon'
import { ref, computed, watch, defineComponent } from 'vue'
import { useStore } from 'web-pkg/src/composables'
import { getLocaleFromLanguage } from 'web-pkg/src/helpers'
import { useGettext } from 'vue3-gettext'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'TrashbinDatePicker',
  props: {},
  emits: ['rangeChanged'],
  setup(props, { emit }) {
    const language = useGettext()
    const store = useStore()
    const router = useRouter()

    const dateMin = DateTime.now().setLocale(language.current).minus({ months: 6 }).toJSDate()

    const dateNow = computed(() =>
      DateTime.now().setLocale(getLocaleFromLanguage(language.current)).toJSDate()
    )

    function formatDate(date: Date) {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear().toString().slice(-2)

      return `${day}-${month}-${year}`
    }

    // const dateSelected = customRef<Date>((track, trigger) => {
    //   let date = dateNow.value
    //   return {
    //     get() {
    //       track()
    //       return date
    //     },
    //     set(val) {
    //       date = val
    //       trigger()
    //     }
    //   }
    // })

    const rangeSelected =
      router.currentRoute.value.query.from && router.currentRoute.value.query.to
        ? ref({
            start: new Date(router.currentRoute.value.query.from),
            end: new Date(router.currentRoute.value.query.to)
          })
        : ref(null)

    function formatRange(range) {
      return `${formatDate(new Date(range.start))} - ${formatDate(new Date(range.end))}`
    }
    const dateMax = computed(() => dateNow.value)

    // watch(dateSelected, (val) => {
    //   const dateSelected = DateTime.fromJSDate(val)
    //     .setLocale(getLocaleFromLanguage(language.current))
    //     .endOf('day')
    //   emit('dateChanged', {
    //     expirationDate: dateSelected.isValid
    //       ? dateSelected.toFormat("yyyy-MM-dd'T'HH:mm:ssZZZ")
    //       : null
    //   })
    // })

    watch(rangeSelected, (newRange, oldRange) => {
      const query = { ...router.currentRoute.value.query }

      if (!newRange) {
        delete query.from
        delete query.to
        router.replace({ query })
        emit('rangeChanged', { range: null })
      }
      if (newRange?.start && newRange.end) {
        query.from = newRange.start.toISOString().slice(0, 10)
        query.to = newRange.end.toISOString().slice(0, 10)

        router.push({ query })
        emit('rangeChanged', { range: { from: query.from, to: query.to } })
      }
    })

    return {
      language,
      rangeSelected,
      dateMin,
      dateMax,
      formatDate,
      formatRange
    }
  }
})
</script>

<style lang="scss" scoped>
.trashbin-datepicker {
  width: fit-content;
}
</style>
