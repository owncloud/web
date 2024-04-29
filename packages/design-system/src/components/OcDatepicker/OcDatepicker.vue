<template>
  <date-picker ref="datePicker" class="oc-datepicker" v-bind="$attrs" :popover="popperOpts">
    <template #default="args">
      <!-- @slot Default slot to use as the popover anchor for datepicker -->
      <!-- args is undefined during initial render, hence we check it here -->
      <slot
        v-if="args"
        :input-value="args.inputValue"
        :toggle-popover="args.togglePopover"
        :hide-popover="args.hidePopover"
      />
    </template>
  </date-picker>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { Modifier } from '@popperjs/core'

// @ts-ignore
import { DatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'

/**
 * Datepicker component based on [v-calendar](https://vcalendar.io/). For detailed documentation, please visit https://vcalendar.io/vue-3.html
 */
export default defineComponent({
  name: 'OcDatepicker',
  status: 'ready',
  release: '1.0.0',

  components: { DatePicker },

  inheritAttrs: true,
  setup() {
    const popperOpts = computed(() => {
      return {
        modifiers: [
          {
            name: 'fixVerticalPosition',
            enabled: true,
            phase: 'beforeWrite',
            requiresIfExists: ['offset', 'flip'],
            fn({ state }) {
              const dropHeight =
                state.modifiersData.fullHeight || state.elements.popper.offsetHeight
              const rect = state.elements.popper.getBoundingClientRect()
              const neededScreenSpace =
                (state.elements.reference as HTMLElement).offsetHeight + rect.top + dropHeight

              if (state.placement !== 'top-start' && neededScreenSpace > window.innerHeight) {
                state.styles.popper.top = `-${150}px`
              }
            }
          } as Modifier<'fixVerticalPosition', unknown>
        ]
      }
    })

    return { popperOpts }
  },
  mounted() {
    this.$el.__datePicker = this.$refs.datePicker
  }
})
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
  font-weight: var(--oc-font-weight-bold);
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
  background: none;
  cursor: not-allowed;
  font-weight: var(--oc-font-weight-extralight);
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
