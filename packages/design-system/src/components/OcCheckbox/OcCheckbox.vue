<template>
  <span @click="$emit('click', $event)">
    <input
      :id="id"
      v-model="model"
      type="checkbox"
      name="checkbox"
      :class="classes"
      :value="option"
      :disabled="disabled"
      :aria-label="labelHidden ? label : null"
      @keydown.enter="keydownEnter"
    />
    <label v-if="!labelHidden" :for="id" :class="labelClasses" v-text="label" />
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { isEqual } from 'lodash-es'
import { getSizeClass, uniqueId } from '../../helpers'

/**
 * A checkbox input element. The checkbox is either checked or unchecked.
 */
export default defineComponent({
  name: 'OcCheckbox',
  status: 'ready',
  release: '1.0.0',
  props: {
    /**
     * Id for the checkbox. If it's empty, a generated one will be used.
     */
    id: {
      type: String,
      required: false,
      default: () => uniqueId('oc-checkbox-')
    },
    /**
     * Disables the checkbox
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * The model of the checkbox. It determines, based on the option this checkbox represents, whether or not this
     * checkbox is checked. Provide it as value or bind it with v-model.
     *
     * Can be any type, but most common is boolean for singular checkbox use, or array when used in a group of checkboxes.
     **/

    modelValue: {
      type: [Boolean, Array] as PropType<boolean | unknown[]>,
      required: false,
      default: false
    },
    /**
     * The value/object this checkbox represents.
     *
     * Can be of any type. If `value` is an array, the type of the option needs to match the value item types. If the
     * checkbox is used standalone (not in a group on a shared model) the option can be omitted.
     **/
    // eslint-disable-next-line vue/require-prop-types
    option: {
      required: false,
      default: null
    },
    /**
     * Label of the Checkbox
     *
     * Always required for aria-label property. If you want to hide the label, use `hideLabel` property.
     **/
    label: {
      type: String,
      required: true,
      default: null
    },
    /**
     * Hide the label of the Checkbox
     */
    labelHidden: {
      type: Boolean,
      default: false
    },
    /**
     * Size of the Checkbox. Valid values are `small`, `medium` and `large`.
     * If not specified, defaults to `medium`
     */
    size: {
      type: String,
      required: false,
      default: 'medium',
      validator: (size: string) => ['small', 'medium', 'large'].includes(size)
    },
    /**
     * Show outline of checkbox
     **/
    outline: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ['click', 'update:modelValue'],
  computed: {
    model: {
      get() {
        return this.modelValue
      },
      set: function (value: boolean) {
        this.$emit('update:modelValue', value)
      }
    },
    classes() {
      return [
        'oc-checkbox',
        'oc-rounded',
        'oc-checkbox-' + getSizeClass(this.size),
        { 'oc-checkbox-checked': this.isChecked }
      ]
    },
    labelClasses() {
      return {
        'oc-cursor-pointer': !this.disabled
      }
    },
    isChecked() {
      if (typeof this.model === 'boolean') {
        return this.model
      }
      return this.model.some((m) => isEqual(m, this.option))
    }
  },
  methods: {
    keydownEnter(event: KeyboardEvent) {
      this.model = !this.model
      this.$emit('click', event)
    }
  }
})
</script>

<style lang="scss">
@mixin oc-form-check-size($factor) {
  height: $oc-size-form-check-default * $factor;
  width: $oc-size-form-check-default * $factor;
}

.oc-checkbox {
  @include oc-form-check-size(1);
  -webkit-appearance: none;
  -moz-appearance: none;

  background-position: 50% 50% !important;
  background-repeat: no-repeat !important;
  border: 2px solid var(--oc-color-input-border);
  display: inline-block;
  overflow: hidden;
  vertical-align: middle;
  background-color: transparent;
  outline: none;

  &-s {
    @include oc-form-check-size(0.7);
  }

  &-m {
    @include oc-form-check-size(1);
  }

  &-l {
    @include oc-form-check-size(1.5);
  }

  &:hover {
    cursor: pointer;
  }

  &:focus-visible {
    outline: var(--oc-color-primary) auto 1px;
  }

  &-checked,
  :checked,
  &:indeterminate {
    background-color: white;
  }

  &-checked,
  :checked {
    @include svg-fill($internal-form-checkbox-image, '#000', '#000');
  }

  &:indeterminate {
    @include svg-fill($internal-form-checkbox-indeterminate-image, '#000', '#000');
  }

  &:disabled {
    background-color: $form-radio-disabled-background;
  }

  &:disabled:checked {
    @include svg-fill($internal-form-checkbox-image, '#000', $form-radio-disabled-icon-color);
  }

  &:disabled:indeterminate {
    @include svg-fill(
      $internal-form-checkbox-indeterminate-image,
      '#000',
      $form-radio-disabled-icon-color
    );
  }
}

label > .oc-checkbox + span {
  margin-left: var(--oc-space-xsmall);
}
</style>

<docs>
```js
<template>
  <section>
    <h3 class="oc-heading-divider oc-mt-s">
      Checkboxes Types
    </h3>
    <div class="oc-mb-s">
      <oc-checkbox size="small" label="Small checkbox" aria-label="Small checkbox"/>
    </div>
    <div class="oc-mb-s">
      <oc-checkbox :value="true" label="Medium checkbox (default)"/>
    </div>
    <div>
      <oc-checkbox size="large" label="Large checkbox"/>
    </div>
  </section>
</template>
```
```js
<template>
  <section>
    <h3 class="oc-heading-divider oc-mt-s">
      Checkbox group with array model
    </h3>
    <div class="oc-mb-s">
      <oc-checkbox
        v-for="o in availableOptions"
        :key="'option-' + o"
        v-model="selectedOptions"
        :option="o"
        :label="o"
        class="oc-mr-s"
      />
    </div>
    Selected option: {{ selectedOptions || "None" }}
  </section>
</template>
<script>
  export default {
    data: () => ({
      availableOptions: ["Water", "Wine", "Beer"],
      selectedOptions: []
    })
  }
</script>
```
</docs>
