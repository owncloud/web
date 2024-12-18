<template>
  <div>
    <label class="oc-label" :for="id" v-text="label" />
    <textarea
      :id="id"
      v-bind="additionalAttributes"
      class="oc-textarea oc-rounded"
      :class="{
        'oc-textarea-warning': !!warningMessage,
        'oc-textarea-danger': !!errorMessage
      }"
      :value="modelValue"
      :aria-invalid="ariaInvalid"
      @input="onInput(($event.target as HTMLInputElement).value)"
      @focus="onFocus(($event.target as HTMLInputElement).value)"
      @keydown="onKeyDown($event)"
    />
    <div v-if="showMessageLine" class="oc-textarea-message">
      <span
        :id="messageId"
        :class="{
          'oc-textarea-description': !!descriptionMessage,
          'oc-textarea-warning': !!warningMessage,
          'oc-textarea-danger': !!errorMessage
        }"
        v-text="messageText"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, HTMLAttributes } from 'vue'
import { uniqueId } from '../../helpers'

/**
 * Textareas are used to allow users to provide text input when the expected
 * input is long. Textarea has a range of options. For shorter input,
 * use the `Input` element.
 *
 * ## Accessibility
 * The label is required and represents the name of the textarea.
 *
 * The description-message can be used additionally to give further information about the textarea . When a
 * description is given, it will be automatically referenced via the `aria-describedby` property.
 * An error or warning will replace the description as well as the `aria-describedby` property until the error
 * or warning is fixed.
 */
export default defineComponent({
  name: 'OcTextarea',
  status: 'ready',
  release: '1.0.0',
  props: {
    /**
     * The ID of the element.
     */
    id: {
      type: String,
      required: false,
      default: () => uniqueId('oc-textarea-')
    },
    /**
     * Text value of the form textarea.
     */
    modelValue: {
      type: String,
      default: null
    },
    /**
     * Label of the textarea.
     **/
    label: {
      type: String,
      required: true,
      default: null
    },
    /**
     * A warning message which is shown below the textarea.
     */
    warningMessage: {
      type: String,
      default: null
    },
    /**
     * An error message which is shown below the textarea.
     */
    errorMessage: {
      type: String,
      default: null
    },
    /**
     * A description text which is shown below the textarea.
     */
    descriptionMessage: {
      type: String,
      default: null
    },
    /**
     * Whether or not vertical space below the textarea should be reserved for a one line message,
     * so that content actually appearing there doesn't shift the layout.
     */
    fixMessageLine: {
      type: Boolean,
      default: false
    },
    /**
     * Configure if the value should be emitted on 'enter' or if it should do a linebreak
     * if true: 'enter' emits value, ctrl + enter and shift + enter creates linebreak
     * if false: 'enter' creates linebreak
     */
    submitOnEnter: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  emits: ['update:modelValue', 'focus', 'change', 'keydown'],
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
    additionalAttributes() {
      const additionalAttrs: Record<string, unknown> = {}
      if (!!this.warningMessage || !!this.errorMessage || !!this.descriptionMessage) {
        additionalAttrs['aria-describedby'] = this.messageId
      }
      return { ...this.$attrs, ...additionalAttrs }
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
    onInput(value: string) {
      /**
       * Input event
       * @type {event}
       **/
      this.$emit('update:modelValue', value)
    },
    onFocus(value: boolean) {
      /**
       * Focus event - emitted as soon as the input field is focused
       * @type {event}
       **/
      this.$emit('focus', value)
    },
    onKeyDown(e: KeyboardEvent) {
      const enterKey = e.key?.toLowerCase() === 'enter'
      if (this.submitOnEnter && enterKey && !e.ctrlKey && !e.shiftKey) {
        /**
         * Change event - emitted as soon as the user hits enter (without ctrl or shift)
         * Only applies if submitOnEnter is set to true
         * @type {string}
         */
        this.$emit('change', (e.target as HTMLInputElement).value)
      }

      /**
       * KeyDown event - emitted as soon as the user hits a key
       * @type {event}
       */
      this.$emit('keydown', e)
    }
  }
})
</script>

<style lang="scss">
.oc-textarea {
  padding-bottom: var(--oc-space-xsmall);
  padding-top: var(--oc-space-xsmall);
  box-sizing: border-box;
  background: var(--oc-color-surfaceDim);
  border: 0 none;
  margin: 0;
  color: var(--oc-color-onSurface);
  max-width: 100%;
  width: 100%;
  overflow: auto;

  &:disabled {
    color: var(--oc-color-input-text-muted);
  }

  &:focus {
    border-color: var(--oc-color-input-text-default);
    background-color: var(--oc-color-surfaceDim);
    color: var(--oc-color-onSurface);
  }

  &-warning,
  &-warning:focus {
    border-color: var(--oc-color-error);
    color: var(--oc-color-error);
  }

  &-danger,
  &-danger:focus {
    border-color: var(--oc-color-error);
    color: var(--oc-color-error);
  }

  &-description {
    color: var(--oc-color-onSurfaceVariant);
  }

  &-message {
    display: flex;
    align-items: center;
    margin-top: var(--oc-space-xsmall);

    min-height: $oc-font-size-default * 1.5;
  }
}
</style>

<docs>
```js
<template>
  <div>
    <h3 class="oc-heading-divider">
      Textarea fields
    </h3>
    <oc-textarea class="oc-mb-s" label="A simple textarea" />
    <oc-textarea disabled value="I am disabled" label="Disabled Textarea" />
    <h3 class="oc-heading-divider">
      Messages
    </h3>
    <oc-textarea
      label="Textarea with description message below"
      class="oc-mb-s"
      description-message="This is a description message."
      :fix-message-line="true"
    />
    <oc-textarea
      label="Textarea with error and warning messages with reserved space below"
      class="oc-mb-s"
      v-model="valueForMessages"
      :error-message="errorMessage"
      :warning-message="warningMessage"
      :fix-message-line="true"
    />
    <oc-textarea
      label="Textarea with error and warning messages without reserved space below"
      class="oc-mb-s"
      v-model="valueForMessages"
      :error-message="errorMessage"
      :warning-message="warningMessage"
    />
  </div>
</template>
<script>
  export default {
    data: () => {
      return {
        inputValue: 'initial',
        valueForMessages: '',
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
