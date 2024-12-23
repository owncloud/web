<template>
  <div :class="$attrs.class">
    <slot name="label">
      <label class="oc-label" :for="id" v-text="label" />
    </slot>
    <div class="oc-position-relative">
      <oc-icon
        v-if="readOnly"
        name="lock"
        size="small"
        class="oc-mt-s oc-ml-s oc-position-absolute"
      />
      <component
        :is="inputComponent"
        :id="id"
        v-bind="additionalAttributes"
        ref="input"
        :aria-invalid="ariaInvalid"
        class="oc-text-input oc-input oc-rounded"
        :class="{
          'oc-text-input-warning': !!warningMessage,
          'oc-text-input-danger': !!errorMessage,
          'oc-pl-l': !!readOnly,
          'clear-action-visible': showClearButton
        }"
        :type="type"
        :value="displayValue"
        :disabled="disabled || readOnly"
        v-on="additionalListeners"
        @change="onChange(($event.target as HTMLInputElement).value)"
        @input="onInput(($event.target as HTMLInputElement).value)"
        @password-challenge-completed="$emit('passwordChallengeCompleted')"
        @password-challenge-failed="$emit('passwordChallengeFailed')"
        @focus="onFocus($event.target)"
      />
      <oc-button
        v-if="showClearButton"
        :aria-label="clearButtonAccessibleLabelValue"
        class="oc-pr-s oc-position-center-right oc-text-input-btn-clear"
        :class="{ 'oc-mr-l': type === 'date' }"
        appearance="raw"
        @click="onClear"
      >
        <oc-icon name="close" size="small" variation="passive" />
      </oc-button>
    </div>
    <div
      v-if="showMessageLine"
      class="oc-text-input-message"
      :class="{
        'oc-text-input-description': !!descriptionMessage,
        'oc-text-input-warning': !!warningMessage,
        'oc-text-input-danger': !!errorMessage
      }"
    >
      <oc-icon
        v-if="messageText !== null && !!descriptionMessage"
        name="information"
        size="small"
        fill-type="line"
        accessible-label="info"
        aria-hidden="true"
      />

      <span
        :id="messageId"
        :class="{
          'oc-text-input-description': !!descriptionMessage,
          'oc-text-input-warning': !!warningMessage,
          'oc-text-input-danger': !!errorMessage
        }"
        v-text="messageText"
      />
    </div>
    <portal-target v-if="type === 'password'" name="app.design-system.password-policy" />
  </div>
</template>

<script lang="ts">
import { defineComponent, HTMLAttributes, PropType, nextTick } from 'vue'

import { uniqueId } from '../../helpers'
import OcButton from '../OcButton/OcButton.vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import OcTextInputPassword from '../_OcTextInputPassword/_OcTextInputPassword.vue'
import { PasswordPolicy } from '../../helpers'

/**
 * Form Inputs are used to allow users to provide text input when the expected
 * input is short. Form Input has a range of options and supports several text
 * formats including numbers. For longer input, use the form `Textarea` element.*
 *
 * ## Accessibility
 * The label is required and represents the name of the input.
 *
 * The description-message can be used additionally to give further information about the input field. When a
 * description is given, it will be automatically referenced via the `aria-describedby` property.
 * An error or warning will replace the description as well as the `aria-describedby` property until the error
 * or warning is fixed.
 */
export default defineComponent({
  name: 'OcTextInput',
  components: { OcIcon, OcButton, OcTextInputPassword },
  status: 'ready',
  release: '1.0.0',
  inheritAttrs: false,
  props: {
    /**
     * The ID of the element.
     */
    id: {
      type: String,
      required: false,
      default: () => uniqueId('oc-textinput-')
    },
    /**
     * The type of the form input field.
     * `text, number, email, password`
     */
    type: {
      type: String,
      default: 'text',
      validator: (value: string) => {
        return ['text', 'number', 'email', 'password'].includes(value)
      }
    },
    /**
     * Text value of the form input field.
     * @model
     */
    modelValue: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Selection range to accomplish partial selection
     */
    selectionRange: {
      type: Array as unknown as PropType<[number, number]>,
      required: false,
      default: null
    },
    /**
     * Whether or not the input element should have a dedicated button for clearing the input content.
     */
    clearButtonEnabled: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * The aria label for the clear button. Only used if it's enabled at all.
     */
    clearButtonAccessibleLabel: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * Value to show when no value is provided
     * This does not set `value` automatically.
     * The user needs to explicitly enter a text to set it as `value`.
     */
    defaultValue: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Disables the input field
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Accessible label of the form input field.
     **/
    label: {
      type: String,
      required: true,
      default: null
    },
    /**
     * A warning message which is shown below the input.
     */
    warningMessage: {
      type: String,
      default: null
    },
    /**
     * An error message which is shown below the input.
     */
    errorMessage: {
      type: String,
      default: null
    },
    /**
     * Whether or not vertical space below the input should be reserved for a one line message,
     * so that content actually appearing there doesn't shift the layout.
     */
    fixMessageLine: {
      type: Boolean,
      default: false
    },
    /**
     * A description text which is shown below the input field.
     */
    descriptionMessage: {
      type: String,
      default: null
    },
    /**
     * Determines if the input field is read only.
     *
     * Read only field will be visualized by a lock item and additionally behaves like a disabled field.
     * Read only takes effect if the server won't allow to change the value at all,
     * disabled should be used instead, if the value can't be changed in a specific context.
     *
     * For example: If the backend doesn't allow to set the login states for users in general, use read only.
     * If it's not allowed to change for the current logged-in User, use disabled.
     *
     */
    readOnly: {
      type: Boolean,
      default: false
    },
    /**
     * Array of password policy rules, if type is password and password policy is given,
     * the entered value will be checked against these rules.
     *
     * Password policy rules must be compliant with auth0/password-sheriff
     * https://github.com/auth0/password-sheriff
     *
     */
    passwordPolicy: {
      type: Object as PropType<PasswordPolicy>,
      default: () => ({})
    },
    /**
     * Method to generate random password
     */
    generatePasswordMethod: {
      type: Function as PropType<(...args: unknown[]) => string>,
      required: false,
      default: null
    }
  },
  emits: [
    'change',
    'update:modelValue',
    'focus',
    'passwordChallengeCompleted',
    'passwordChallengeFailed'
  ],
  computed: {
    showMessageLine() {
      return (
        this.fixMessageLine ||
        !!this.warningMessage ||
        !!this.errorMessage ||
        !!this.descriptionMessage
      )
    },
    messageId() {
      return `${this.id}-message`
    },
    additionalListeners() {
      if (this.type === 'password') {
        return { passwordGenerated: this.onInput }
      }

      return {}
    },
    additionalAttributes() {
      const additionalAttrs: Record<string, unknown> = {}
      if (!!this.warningMessage || !!this.errorMessage || !!this.descriptionMessage) {
        additionalAttrs['aria-describedby'] = this.messageId
      }
      // FIXME: placeholder usage is discouraged, we need to find a better UX concept
      if (this.defaultValue) {
        additionalAttrs['placeholder'] = this.defaultValue
      }
      if (this.type === 'password') {
        additionalAttrs['password-policy'] = this.passwordPolicy
        additionalAttrs['generate-password-method'] = this.generatePasswordMethod
        additionalAttrs['has-warning'] = !!this.warningMessage
        additionalAttrs['has-error'] = !!this.errorMessage
      }
      // Exclude listeners for events which are handled via methods in this component

      const { change, input, focus, class: classes, ...attrs } = this.$attrs

      return { ...attrs, ...additionalAttrs }
    },
    ariaInvalid() {
      return (!!this.errorMessage).toString() as HTMLAttributes['aria-invalid']
    },
    messageText() {
      if (this.errorMessage) {
        return this.errorMessage
      }

      if (this.warningMessage) {
        return this.warningMessage
      }

      return this.descriptionMessage
    },
    showClearButton() {
      return !this.disabled && this.clearButtonEnabled && !!this.modelValue
    },
    clearButtonAccessibleLabelValue() {
      return this.clearButtonAccessibleLabel || this.$gettext('Clear input')
    },
    displayValue() {
      return this.modelValue || ''
    },
    inputComponent() {
      return this.type === 'password' ? 'oc-text-input-password' : 'input'
    }
  },
  methods: {
    /**
     * Puts focus on this input element
     * @public
     */
    focus() {
      ;(this.$refs.input as HTMLInputElement).focus()
    },
    onClear() {
      this.focus()

      this.onInput(null)
      this.onChange(null)
    },
    onChange(value: string) {
      /**
       * Change event
       * @type {event}
       **/
      this.$emit('change', value)
    },
    onInput(value: string) {
      /**
       * Input event
       * @type {event}
       **/
      this.$emit('update:modelValue', value)
    },
    async onFocus(target: HTMLInputElement) {
      await nextTick()
      target.select()
      if (this.selectionRange && this.selectionRange.length > 1) {
        target.setSelectionRange(this.selectionRange[0], this.selectionRange[1])
      }
      /**
       * Focus event - emitted as soon as the input field is focused
       * @type {event}
       **/
      this.$emit('focus', target.value)
    }
  }
})
</script>

<style lang="scss">
.oc-text-input-message.oc-text-input-description {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: var(--oc-space-large);
  padding-top: calc(var(--oc-space-xsmall) - 2px);

  .oc-icon {
    position: absolute;
    left: var(--oc-space-xsmall);
    top: var(--oc-space-xsmall);
  }
}

.oc-text-input {
  &-description {
    color: var(--oc-color-text-muted);
  }

  &-success,
  &-success:focus {
    border-color: var(--oc-color-swatch-success-default) !important;
    color: var(--oc-color-swatch-success-default) !important;
  }

  &-warning,
  &-warning:focus {
    border-color: var(--oc-color-swatch-warning-default) !important;
    color: var(--oc-color-swatch-warning-default) !important;
  }

  &-danger,
  &-danger:focus {
    border-color: var(--oc-color-swatch-danger-default) !important;
    color: var(--oc-color-swatch-danger-default) !important;
  }

  &-message {
    display: flex;
    align-items: center;
    margin-top: var(--oc-space-xsmall);
    min-height: $oc-font-size-default * 1.5;
  }

  &.clear-action-visible {
    padding-right: ($oc-size-icon-default * 0.7) + 7px;
  }
}
</style>

<docs>
```js
<template>
  <section>
    <h3 class="oc-heading-divider">
      Input Types
    </h3>
    <oc-text-input class="oc-mb-s" label="Text"/>
    <oc-text-input class="oc-mb-s" disabled label="Disabled" value="I am disabled"/>
    <oc-text-input class="oc-mb-s" read-only="true" label="Read only" value="I am read only"/>
    <oc-text-input class="oc-mb-s" type="number" label="Number"/>
    <oc-text-input class="oc-mb-s" type="email" label="Email"/>
    <oc-text-input class="oc-mb-s" type="password" label="Password"/>
    <h3 class="oc-heading-divider">
      Binding
    </h3>
    <oc-text-input label="Text" v-model="inputValue"/>
    <oc-text-input disabled label="Text" v-model="inputValue"/>
    <h3 class="oc-heading-divider">
      Interactions
    </h3>
    <oc-button @click="_focus" class="oc-my-m">Focus input below</oc-button>
    <oc-text-input label="Focus field" ref="inputForFocus"/>
    <oc-button @click="_focusAndSelect" class="oc-my-m">Focus and select input below</oc-button>
    <oc-text-input label="Select field" value="Will you select this existing text?" ref="inputForFocusSelect"/>
    <oc-text-input label="Clear input" v-model="inputValueForClearing" :clear-button-enabled="true"/>
    <oc-text-input label="Input with default" v-model="inputValueWithDefault" :clear-button-enabled="true"
                   default-value="Some default"/>
    <p>
      Value: {{ inputValueWithDefault !== null ? inputValueWithDefault : "null" }}
    </p>
    <h3 class="oc-heading-divider">
      Messages
    </h3>
    <oc-text-input
      label="Input with description message below"
      class="oc-mb-s"
      description-message="This is a description message."
      :fix-message-line="true"
    />
    <oc-text-input
      label="Input with error and warning messages with reserved space below"
      class="oc-mb-s"
      v-model="valueForMessages"
      :error-message="errorMessage"
      :warning-message="warningMessage"
      :fix-message-line="true"
    />
    <oc-text-input
      label="Input with error and warning messages without reserved space below"
      class="oc-mb-s"
      v-model="valueForMessages"
      :error-message="errorMessage"
      :warning-message="warningMessage"
    />
  </section>
</template>
<script>
  export default {
    data: () => {
      return {
        inputValue: 'initial',
        valueForMessages: '',
        inputValueForClearing: 'clear me',
        inputValueWithDefault: null,
      }
    },
    computed: {
      errorMessage() {
        return this.valueForMessages.length === 0 ? 'Value is required.' : ''
      },
      warningMessage() {
        return this.valueForMessages.endsWith(' ') ? 'Trailing whitespace should be avoided.' : ''
      }
    },
    methods: {
      _focus() {
        this.$refs.inputForFocus.focus()
      },
      _focusAndSelect() {
        this.$refs.inputForFocusSelect.focus()
      }
    }
  }
</script>
```
</docs>
