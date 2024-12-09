<template>
  <span :key="`oc-switch-${checked.toString()}`" class="oc-switch">
    <span :id="labelId" v-text="label" />
    <button
      data-testid="oc-switch-btn"
      class="oc-switch-btn"
      role="switch"
      :aria-checked="checked"
      :aria-labelledby="labelId"
      @click="toggle"
    />
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { uniqueId } from '../../helpers'

/**
 * The switch has two states between users can choose.
 */
export default defineComponent({
  name: 'OcSwitch',
  status: 'ready',
  release: '1.0.0',
  props: {
    /**
     * Value of the switch
     *
     * @model
     **/
    checked: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Accessible name of the switch
     **/
    label: {
      type: String,
      required: true,
      default: null
    },
    /**
     * ID of the label element
     * If not set, unique ID is used instead with format `oc-switch-label-{number}`
     */
    labelId: {
      type: String,
      required: false,
      default: () => uniqueId('oc-switch-label-')
    }
  },
  emits: ['update:checked'],
  methods: {
    toggle() {
      /**
       * Change event
       * @event update:checked
       * @type {boolean}
       */
      this.$emit('update:checked', !this.checked)
    }
  }
})
</script>

<style lang="scss">
.oc-switch {
  align-items: center;
  display: inline-flex;
  gap: var(--oc-space-small);

  &-btn {
    border: 1px solid var(--oc-color-input-bg);
    border-radius: 20px;
    cursor: pointer;
    display: block;
    height: 18px;
    margin: 0;
    padding: 0;
    position: relative;
    transition: background-color 0.25s;
    width: 31px;

    &::before {
      background-color: var(--oc-color-swatch-inverse-hover);
      box-shadow: rgb(0 0 0 / 25%) 0px 0px 2px 1px;
      border-radius: 50%;
      content: '';
      height: 12px;
      left: 1px;
      position: absolute;
      top: 2px;
      transition: transform 0.25s;
      width: 12px;
    }

    &[aria-checked='false'] {
      background-color: var(--oc-color-swatch-inverse-muted);

      &::before {
        transform: translateX(0);
        left: 2px;
      }
    }

    &[aria-checked='true'] {
      background-color: var(--oc-color-primary);

      &::before {
        transform: translateX(calc(100% + 2px));
        left: 1px;
      }
    }
  }
}
</style>

<docs>
```js
<template>
  <section>
    <h3>Switcher behavior</h3>
    <oc-switch label="Darkmode" v-model="state" />
    <p>
      The switch is turned <strong v-if="state">on</strong><strong v-else="state">off</strong>.
    </p>
  </section>
</template>
<script>
  export default {
    data: () => {
      return {
        state: true
      }
    }
  }
</script>
```
</docs>
