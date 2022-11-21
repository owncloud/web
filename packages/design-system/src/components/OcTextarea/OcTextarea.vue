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
      :value="value"
      :aria-invalid="ariaInvalid"
      @input="onInput($event.target.value)"
      @focus="onFocus($event.target.value)"
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

<script>
import uniqueId from '../../utils/uniqueId'

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
export default {
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
    value: {
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
      const additionalAttrs = {}
      if (!!this.warningMessage || !!this.errorMessage || !!this.descriptionMessage) {
        additionalAttrs['aria-describedby'] = this.messageId
      }
      return { ...this.$attrs, ...additionalAttrs }
    },
    ariaInvalid() {
      return (!!this.errorMessage).toString()
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
      this.$refs.input.focus()
    },
    onInput(value) {
      /**
       * Input event
       * @type {event}
       **/
      this.$emit('input', value)
    },
    onFocus(value) {
      /**
       * Focus event - emitted as soon as the input field is focused
       * @type {event}
       **/
      this.$emit('focus', value)
    },
    onKeyDown(e) {
      const enterKey = e.key === 'Enter'
      if (this.submitOnEnter && enterKey && !e.ctrlKey && !e.shiftKey) {
        /**
         * Change event - emitted as soon as the user hits enter (without ctrl or shift)
         * Only applies if submitOnEnter is set to true
         * @type {string}
         */
        this.$emit('change', e.target.value)
      }

      /**
       * KeyDown event - emitted as soon as the user hits a key
       * @type {event}
       */
      this.$emit('keydown', e)
    }
  }
}
</script>

<style lang="scss">
@import '../../styles/styles';

.oc-textarea {
  background-color: var(--oc-color-input-bg);
  border: 1px solid var(--oc-color-input-border);
  box-sizing: border-box;
  color: var(--oc-color-input-text-muted);
  font-family: initial;
  margin: 0;
  max-width: 100%;
  overflow: auto;
  padding: var(--oc-space-xsmall) var(--oc-space-small);

  transition: 0.2s ease-in-out;
  transition-property: color, background-color, border;
  width: 100%;
  -webkit-appearance: none;

  &:disabled {
    color: var(--oc-color-input-text-muted);
  }

  &:focus {
    background-color: var(--oc-color-input-bg);
    border-color: var(--oc-color-input-text-default);
    color: var(--oc-color-input-text-default);
  }

  &-warning,
  &-warning:focus {
    border-color: var(--oc-color-swatch-warning-default);
    color: var(--oc-color-swatch-warning-default);
  }

  &-danger,
  &-danger:focus {
    border-color: var(--oc-color-swatch-danger-default);
    color: var(--oc-color-swatch-danger-default);
  }

  &-description {
    color: var(--oc-color-text-muted);
  }

  &-message {
    @extend .oc-flex;
    @extend .oc-flex-middle;
    @extend .oc-mt-xs;

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
