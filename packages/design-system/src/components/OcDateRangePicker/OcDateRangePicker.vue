<template>
  <fieldset>
    <legend v-text="label" />

    <oc-text-input
      :value="model.startDate.toISODate()"
      label="Start date"
      type="date"
      :min="minDate?.toISODate()"
      clear-button-enabled
      :clear-button-accessible-label="$gettext('Clear date')"
      class="oc-date-picker"
      @change="handleStartDateChange"
    />

    <oc-text-input
      :value="model.endDate.toISODate()"
      label="End date"
      type="date"
      :min="endDateMinDate?.toISODate()"
      clear-button-enabled
      :clear-button-accessible-label="$gettext('Clear date')"
      class="oc-date-picker"
      @change="handleEndDateChange"
    />
  </fieldset>
</template>

<script lang="ts" setup>
import { DateTime } from 'luxon'
import { computed, unref } from 'vue'

const props = defineProps<{
  label: string
  minDate: DateTime
}>()

const model = defineModel<{ startDate: DateTime; endDate: DateTime }>()

const endDateMinDate = computed<DateTime>(() => unref(model).startDate || props.minDate)

const handleStartDateChange = (value: string) => {
  model.value.startDate = DateTime.fromISO(value)
}

const handleEndDateChange = (value: string) => {
  model.value.endDate = DateTime.fromISO(value)
}
</script>

<style lang="scss" scoped></style>
