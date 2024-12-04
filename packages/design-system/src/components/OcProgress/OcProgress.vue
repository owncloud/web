<template>
  <div
    :class="classes"
    :aria-valuemax="max"
    :aria-valuenow="value"
    aria-busy="true"
    aria-valuemin="0"
    role="progressbar"
  >
    <div v-if="!indeterminate" class="oc-progress-current" :style="{ width: progressValue }"></div>
    <div v-else class="oc-progress-indeterminate">
      <div class="oc-progress-indeterminate-first"></div>
      <div class="oc-progress-indeterminate-second"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'OcProgress',
  status: 'ready',
  release: '1.0.0',
  props: {
    /**
     * The current progress.
     */
    value: {
      type: Number,
      required: false,
      default: 0
    },
    /**
     * The maximum value. This represents 100% completion.
     */
    max: {
      type: Number,
      required: false,
      default: undefined,
      validator: (value: number) => {
        return value > 0
      }
    },
    /**
     * The size of the progress bar.
     * Can be `default` or `small`
     */
    size: {
      type: String,
      required: false,
      default: 'default',
      validator: (value: string) => {
        return ['default', 'small'].includes(value)
      }
    },
    /**
     * The variation of the progress bar.
     * Defaults to `primary`.
     * Can be `passive, primary, danger, success, warning`.
     */
    variation: {
      type: String,
      required: false,
      default: 'primary',
      validator: (value: string) => {
        return ['primary', 'passive', 'success', 'warning', 'danger'].includes(value)
      }
    },
    /**
     * Determines if the progress bar should be displayed in an indeterminate state.
     */
    indeterminate: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    classes() {
      return `oc-progress oc-progress-${this.size} oc-progress-${this.variation}`
    },
    progressValue() {
      if (!this.max) {
        return '-'
      }
      const num = (this.value / this.max) * 100
      return `${num}%`
    }
  }
})
</script>

<style lang="scss">
$progress-height: 15px !default;
$progress-height-small: 5px !default;

.oc-progress {
  background-color: var(--oc-color-input-border);
  display: block;
  height: $progress-height;
  // Add the correct vertical alignment in Chrome, Firefox, and Opera.
  width: 100%;
  position: relative;
  overflow-x: hidden;

  &-small {
    height: $progress-height-small;
  }
  &-current {
    height: 100%;
    position: absolute;
    transition: width 0.5s;
  }
  &-indeterminate div {
    height: 100%;
    position: absolute;
  }
  &-indeterminate-first {
    animation-duration: 2s;
    animation-name: indeterminate-first;
    animation-iteration-count: infinite;
  }
  &-indeterminate-second {
    animation-duration: 2s;
    animation-delay: 0.5s;
    animation-name: indeterminate-second;
    animation-iteration-count: infinite;
  }

  @keyframes indeterminate-first {
    from {
      left: -10%;
      width: 10%;
    }
    to {
      left: 120%;
      width: 100%;
    }
  }

  @keyframes indeterminate-second {
    from {
      left: -100%;
      width: 80%;
    }
    to {
      left: 110%;
      width: 10%;
    }
  }

  &-primary &-current,
  &-primary &-indeterminate div {
    background-color: var(--oc-color-primary);
  }
  &-success &-current,
  &-success &-indeterminate div {
    background-color: var(--oc-color-swatch-success-default);
  }
  &-warning &-current,
  &-warning &-indeterminate div {
    background-color: var(--oc-color-error);
  }
  &-danger &-current,
  &-danger &-indeterminate div {
    background-color: var(--oc-color-error);
  }
}
</style>

<docs>
Show progress to the users.

```js
<div>
  <oc-progress :value="4" :max="10" class="oc-mb-s" />
  <oc-progress :value="8" :max="10" size="small" variation="warning" class="oc-mb-s"  />
  <oc-progress :max="10" :indeterminate="true" size="small" />

</div>
```
</docs>
