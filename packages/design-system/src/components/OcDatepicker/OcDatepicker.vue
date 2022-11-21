<template>
  <date-picker class="oc-datepicker" v-bind="$attrs" v-on="$listeners">
    <template #default="{ inputValue, togglePopover, hidePopover }">
      <!-- @slot Default slot to use as the popover anchor for datepicker -->
      <slot :input-value="inputValue" :toggle-popover="togglePopover" :hide-popover="hidePopover" />
    </template>
  </date-picker>
</template>

<script>
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

/**
 * Datepicker component based on [v-calendar](https://vcalendar.io/). For detailed documentation (props, slots, events, etc.), please visit https://vcalendar.io/api/v2.0/calendar.html
 */
export default {
  name: 'OcDatepicker',
  status: 'ready',
  release: '1.0.0',

  components: { DatePicker },

  inheritAttrs: true
}
</script>

<style lang="scss">
.vc-pane-layout {
  color: var(--oc-color-text-default) !important;
  background-color: var(--oc-color-background-default) !important;
}
.vc-arrow svg path {
  fill: var(--oc-color-text-default) !important;
}
.vc-title {
  color: var(--oc-color-text-default) !important;
}
.vc-weekday {
  color: var(--oc-color-text-muted) !important;
}
.vc-day {
  color: var(--oc-color-text-default) !important;
}

.vc-highlights {
  .vc-highlight {
    background-color: var(--oc-color-swatch-primary-default) !important;
  }
  + span {
    color: var(--oc-color-text-inverse) !important;
  }
}

.vc-day-content.is-disabled {
  color: var(--oc-color-text-muted) !important;
}
</style>
<docs>
```js
<template>
<div>
  <oc-datepicker v-model="date">
    <template #default="{ togglePopover }">
      <oc-button @click="togglePopover">Open datepicker</oc-button>
    </template>
  </oc-datepicker>
  <p v-if="date" v-text="date" />
</div>
</template>
<script>
export default {
  data: () => ({ date: null })
}
</script>
```
</docs>
