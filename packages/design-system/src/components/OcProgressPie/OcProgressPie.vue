<template>
  <div class="oc-progress-pie" :data-fill="_fill">
    <div class="oc-progress-pie-container" />
    <label v-if="showLabel" class="oc-progress-pie-label oc-text-muted" v-text="_label" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Show progress to the users in a pie shape.
 */
export default defineComponent({
  name: 'OcProgressPie',
  status: 'ready',
  release: '1.0.0',
  props: {
    /**
     * Current value of the progress
     */
    progress: {
      type: Number,
      default: 0,
      required: true,
      validator: (value: number) => {
        return value >= 0 && value <= 100
      }
    },
    /**
     * Maximum value.
     */
    max: {
      type: Number,
      default: 100
    },
    /**
     * Defines if the label shall be shown.
     */
    showLabel: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    _fill() {
      return Math.round((100 / this.max) * this.progress)
    },
    _label() {
      if (this.max === 100) {
        return this.progress + '%'
      } else {
        return `${this.progress}/${this.max}`
      }
    }
  }
})
</script>
<style lang="scss">
$default-size: 64px;

.oc-progress-pie {
  float: left;
  height: $default-size;
  margin: 15px;
  position: relative;
  width: $default-size;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  // Shadow
  &::after {
    border: calc($default-size / 10) solid var(--oc-color-swatch-passive-hover);
    border-radius: 50%;
    box-sizing: border-box;
    content: '';
    display: block;
    height: 100%;
    width: 100%;
  }

  &-container {
    clip: rect(0, $default-size, $default-size, calc($default-size / 2));
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;

    &::before,
    &::after {
      border: calc($default-size / 10) solid var(--oc-color-primary);
      border-color: var(--oc-color-primary);
      border-radius: 50%;
      clip: rect(0, calc($default-size / 2), $default-size, 0);
      content: '';
      display: block;
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
    }
  }

  &-label {
    color: var(--oc-color-onSurfaceVariant) !important;
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

@for $i from 0 through 100 {
  .oc-progress-pie[data-fill='#{$i}'] {
    .oc-progress-pie-container::before {
      transform: rotate($i * 3.6deg);
    }

    @if $i <= 50 {
      .oc-progress-pie-container::after {
        display: none;
      }
    } @else {
      .oc-progress-pie-container {
        clip: rect(auto, auto, auto, auto);
      }

      .oc-progress-pie-container::after {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
<docs>
```js
<section>
  <h3 class="oc-heading-divider">
    Pie shape progress
  </h3>
  <oc-progress-pie :progress="33" />
  <oc-progress-pie :progress="33" show-label/>
  <oc-progress-pie :progress="2" :max="4" />
  <oc-progress-pie :progress="4" :max="6" show-label />
</section>
```
</docs>
