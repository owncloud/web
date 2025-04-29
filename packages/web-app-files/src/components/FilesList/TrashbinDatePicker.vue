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
      label="Deleted between"
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

<script lang="ts" setup>
import { DateTime } from 'luxon'
import { ref, computed, watch, unref } from 'vue'
import { getLocaleFromLanguage } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { useRouter } from 'vue-router'

const emit = defineEmits<{ rangeChanged: [{ range: { from: string; to: string } | null }] }>()

const language = useGettext()
const router = useRouter()

const dateMin = DateTime.now().setLocale(language.current).minus({ months: 6 })

const dateNow = computed(() => DateTime.now().setLocale(getLocaleFromLanguage(language.current)))

function formatDate(date: Date) {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear().toString().slice(-2)

  return `${day}-${month}-${year}`
}

const rangeSelected =
  router.currentRoute.value.query.from && router.currentRoute.value.query.to
    ? ref({
        start: new Date(router.currentRoute.value.query.from as string),
        end: new Date(router.currentRoute.value.query.to as string)
      })
    : ref(null)

function formatRange(range) {
  return `${formatDate(new Date(range.start))} - ${formatDate(new Date(range.end))}`
}
const dateMax = computed(() => unref(dateNow))

watch(rangeSelected, (newRange) => {
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
    emit('rangeChanged', { range: { from: query.from as string, to: query.to as string } })
  }
})
</script>

<style lang="scss" scoped>
.trashbin-datepicker {
  width: fit-content;
}
</style>
