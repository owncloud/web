<template>
  <span>
    <input
      :id="id"
      v-model="model"
      type="radio"
      name="radio"
      :class="classes"
      :aria-checked="option === modelValue"
      :value="option"
      :disabled="disabled"
    />
    <label :for="id" :class="labelClasses" v-text="label" />
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { getSizeClass } from '../../utils/sizeClasses'
import uniqueId from '../../utils/uniqueId'
/**
 * The radio element. Can be grouped to give the user to choose between different options.
 */
export default defineComponent({
  name: 'OcRadio',
  status: 'ready',
  release: '1.0.0',
  props: {
    /**
     * Id for the radio. If it's empty, a generated one will be used.
     */
    id: {
      type: String,
      required: false,
      default: () => uniqueId('oc-radio-')
    },
    /**
     * Disables the radio button
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * The model of the radio button or radio button group. It determines, based on the option this radio button
     * represents, whether or not this radio button is checked. Provide it as value or bind it with v-model.
     *
     * When used in a radio group, provide a variable that tracks which of the `option` values of the group is checked.
     *
     * Can be any type.
     **/

    modelValue: {
      type: [String, Number, Boolean, Object],
      required: false,
      default: false
    },
    /**
     * The value of this radio button. Can be omitted if the radio button is not used in a group.
     *
     * Can be of any type.
     */
    // eslint-disable-next-line vue/require-prop-types
    option: {
      required: false,
      default: null
    },
    /**
     * Label of the Radio.
     *
     * Always required for aria-label property. If you want to hide the label, use `hideLabel` property.
     **/
    label: {
      type: String,
      required: true,
      default: null
    },
    /**
     * Is the label of the Radio visually hidden?
     **/
    hideLabel: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Size of the Radio. Valid values are `small`, `medium` and `large`.
     * If not specified, defaults to `medium`
     */
    size: {
      type: String,
      required: false,
      default: 'medium',
      validator: (size: string) => ['small', 'medium', 'large'].includes(size)
    }
  },
  emits: ['update:modelValue'],
  computed: {
    model: {
      get() {
        return this.modelValue
      },
      set(value: unknown) {
        this.$emit('update:modelValue', value)
      }
    },
    classes() {
      return ['oc-radio', 'oc-radio-' + getSizeClass(this.size)]
    },
    labelClasses() {
      return {
        'oc-invisible-sr': this.hideLabel,
        'oc-cursor-pointer': !this.disabled
      }
    }
  }
})
</script>

<style lang="scss">
@mixin oc-form-check-size($factor) {
  height: $oc-size-form-check-default * $factor;
  width: $oc-size-form-check-default * $factor;
}

.oc-radio {
  -webkit-appearance: none;
  -moz-appearance: none;

  border: 1px solid var(--oc-color-swatch-brand-default);
  border-radius: 50%;
  box-sizing: border-box;
  background-color: var(--oc-color-input-bg);
  background-position: 50% 50%;
  background-repeat: no-repeat;

  display: inline-block;
  margin: 0;
  overflow: hidden;

  transition: 0.2s ease-in-out;
  transition-property: background-color, border;
  vertical-align: middle;
  width: 1rem;

  &:not(:disabled) {
    cursor: pointer;
  }

  &:checked {
    background-color: var(--oc-color-background-highlight) !important;
  }

  &.oc-radio-s {
    @include oc-form-check-size(0.7);
  }

  &.oc-radio-m {
    @include oc-form-check-size(1);
  }

  &.oc-radio-l {
    @include oc-form-check-size(1.5);
  }
}

label > .oc-radio + span {
  margin-left: var(--oc-space-xsmall);
}
</style>

<docs>
```js
<template>
  <div>
    <section>
      <h3 class="oc-heading-divider oc-mt-s">
        Radio button group
      </h3>
      <div class="oc-mb-s">
        <oc-radio
            v-for="o in availableOptions"
            :key="'option-' + o"
            v-model="selectedOption"
            :option="o"
            :label="o"
            class="oc-mr-s"
        />
      </div>
      Selected option: {{ selectedOption || "None" }}
    </section>
  </div>
</template>
<script>
  export default {
    data: () => ({
      availableOptions: ["Water", "Wine", "Beer"],
      selectedOption: null
    })
  }
</script>
```
</docs>
