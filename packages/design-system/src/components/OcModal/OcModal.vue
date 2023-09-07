<template>
  <div class="oc-modal-background" aria-labelledby="oc-modal-title">
    <focus-trap :active="true" :initial-focus="initialFocusRef">
      <div
        ref="ocModal"
        :class="classes"
        tabindex="0"
        role="dialog"
        aria-modal="true"
        @keydown.esc="cancelModalAction"
      >
        <div class="oc-modal-title">
          <oc-icon v-if="iconName !== ''" :name="iconName" :variation="variation" />
          <h2 id="oc-modal-title" v-text="title" />
        </div>
        <div class="oc-modal-body">
          <div v-if="$slots.content" key="modal-slot-content" class="oc-modal-body-message">
            <slot name="content" />
          </div>
          <template v-else>
            <p
              v-if="message"
              key="modal-message"
              class="oc-modal-body-message oc-mt-rm"
              :class="{ 'oc-mb-rm': !hasInput || contextualHelperData }"
              v-text="message"
            />
            <div
              v-if="contextualHelperData"
              class="oc-modal-body-contextual-helper"
              :class="{ 'oc-mb-rm': !hasInput }"
            >
              <span class="text" v-text="contextualHelperLabel" />
              <oc-contextual-helper class="oc-pl-xs" v-bind="contextualHelperData" />
            </div>
            <oc-text-input
              v-if="hasInput"
              key="modal-input"
              ref="ocModalInput"
              v-model="userInputValue"
              class="oc-modal-body-input"
              :error-message="inputError"
              :placeholder="inputPlaceholder"
              :label="inputLabel"
              :type="inputType"
              :password-policy="inputPasswordPolicy"
              :description-message="inputDescription"
              :disabled="inputDisabled"
              :fix-message-line="true"
              :selection-range="inputSelectionRange"
              @password-challenge-completed="$emit('passwordChallengeCompleted')"
              @password-challenge-failed="$emit('passwordChallengeFailed')"
              @update:model-value="inputOnInput"
              @keydown.enter.prevent="confirm"
            />
          </template>
          <div v-if="checkboxLabel" class="oc-modal-body-actions oc-flex oc-flex-left">
            <oc-checkbox
              v-model="checkboxValue"
              size="medium"
              :label="checkboxLabel"
              :aria-label="checkboxLabel"
            />
          </div>
        </div>

        <div class="oc-modal-body-actions oc-flex oc-flex-right">
          <oc-button
            class="oc-modal-body-actions-cancel"
            ref="cancelButton"
            :variation="buttonCancelVariation"
            :appearance="buttonCancelAppearance"
            @click="cancelModalAction"
            v-text="buttonCancelText"
          />
          <oc-button
            v-if="buttonSecondaryText"
            ref="secondaryButton"
            class="oc-modal-body-actions-secondary oc-ml-s"
            :variation="buttonSecondaryVariation"
            :appearance="buttonSecondaryAppearance"
            @click="secondaryModalAction"
            v-text="buttonSecondaryText"
          />
          <oc-button
            v-if="!withoutButtonConfirm"
            ref="primaryButton"
            class="oc-modal-body-actions-confirm oc-ml-s"
            variation="primary"
            :appearance="buttonConfirmAppearance"
            :disabled="buttonConfirmDisabled || !!inputError"
            @click="confirm"
            v-text="buttonConfirmText"
          />
        </div>
      </div>
    </focus-trap>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ComponentPublicInstance, ref, onMounted, unref } from 'vue'
import OcButton from '../OcButton/OcButton.vue'
import OcCheckbox from '../OcCheckbox/OcCheckbox.vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import OcTextInput from '../OcTextInput/OcTextInput.vue'
import { FocusTrap } from 'focus-trap-vue'
import { FocusTargetOrFalse, FocusTargetValueOrFalse } from 'focus-trap'
import { PasswordPolicy } from '../_OcTextInputPassword/_OcTextInputPassword.vue'

/**
 * Modals are generally used to force the user to focus on confirming or completing a single action.
 *
 * ## Background and position
 * Every modal gets automatically added a background which spans the whole width and height.
 * The modal itself is aligned to center both vertically and horizontally.
 *
 * ## Variations
 * Only use the `danger` variation if the action cannot be undone.
 *
 * The overall variation defines the modal's top border, heading (including an optional item) text color and the
 * variation of the confirm button, while the cancel buttons defaults to the `passive` variation. Both button's
 * variations and appearances can be targeted individually (see examples and API docs below).
 *
 */
export default defineComponent({
  name: 'OcModal',
  status: 'ready',
  release: '1.3.0',

  components: {
    OcButton,
    OcCheckbox,
    OcIcon,
    OcTextInput,
    FocusTrap
  },

  props: {
    /**
     * Modal variation
     * Defaults to `passive`.
     * Can be `passive, primary, danger, success, warning`.
     */
    variation: {
      type: String,
      required: false,
      default: 'passive',
      validator: (value: string) => {
        return ['passive', 'primary', 'danger', 'success', 'warning', 'info'].includes(value)
      }
    },
    /**
     * Optional icon to be displayed next to the title
     */
    icon: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Modal title
     */
    title: {
      type: String,
      required: true
    },
    /**
     * Modal message. Can be replaced by content slot
     */
    message: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Modal checkbox label
     */
    checkboxLabel: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * Contextual helper label
     */
    contextualHelperLabel: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * Contextual helper data
     */
    contextualHelperData: {
      type: Object,
      required: false,
      default: null
    },
    /**
     * Text of the cancel button
     */
    buttonCancelText: {
      type: String,
      required: false,
      default: 'Cancel'
    },
    /**
     * Variation type of the cancel button
     */
    buttonCancelVariation: {
      type: String,
      required: false,
      default: 'passive',
      validator: (value: string) => {
        return ['passive', 'primary', 'danger', 'success', 'warning'].includes(value)
      }
    },
    /**
     * Appearance of the cancel button
     */
    buttonCancelAppearance: {
      type: String,
      required: false,
      default: 'outline',
      validator: (value: string) => {
        return ['outline', 'filled', 'raw'].includes(value)
      }
    },
    /**
     * Text of the secondary button
     */
    buttonSecondaryText: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * Variation type of the secondary button
     */
    buttonSecondaryVariation: {
      type: String,
      required: false,
      default: 'passive',
      validator: (value: string) => {
        return ['passive', 'primary', 'danger', 'success', 'warning'].includes(value)
      }
    },
    /**
     * Appearance of the secondary button
     */
    buttonSecondaryAppearance: {
      type: String,
      required: false,
      default: 'outline',
      validator: (value: string) => {
        return ['outline', 'filled', 'raw'].includes(value)
      }
    },
    /**
     * Text of the confirm button
     */
    buttonConfirmText: {
      type: String,
      required: false,
      default: 'Confirm'
    },
    /**
     * Appearance of the confirm button
     */
    buttonConfirmAppearance: {
      type: String,
      required: false,
      default: 'filled',
      validator: (value: string) => {
        return ['outline', 'filled', 'raw'].includes(value)
      }
    },
    /**
     * Asserts whether the confirm action is disabled
     */
    buttonConfirmDisabled: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Asserts whether the modal should render a confirm button
     */
    withoutButtonConfirm: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Asserts whether the modal should render a text input
     */
    hasInput: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Type of the input field
     */
    inputType: {
      type: String,
      default: 'text'
    },
    /**
     * Value of the input
     */
    inputValue: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Selection range for input to accomplish partial selection
     */
    inputSelectionRange: {
      type: Array as unknown as PropType<[number, number]>,
      required: false,
      default: null
    },
    /**
     * Label of the text input field
     */
    inputLabel: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Placeholder of the text input field
     */
    inputPlaceholder: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Additional description message for the input field
     */
    inputDescription: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Error message for the input field
     */
    inputError: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Asserts whether the input is disabled
     */
    inputDisabled: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Password policy for the input
     */
    inputPasswordPolicy: {
      type: Object as PropType<PasswordPolicy>,
      required: false,
      default: () => ({})
    },
    /**
     * Overwrite default focused element
     * Can be `#id, .class`.
     */
    focusTrapInitial: {
      type: String,
      required: false,
      default: null
    }
  },
  emits: [
    'cancel',
    'confirm',
    'confirm-secondary',
    'input',
    'checkbox-changed',
    'passwordChallengeCompleted',
    'passwordChallengeFailed'
  ],
  data() {
    return {
      userInputValue: null,
      checkboxValue: false
    }
  },
  setup() {
    const primaryButton = ref(null)
    const secondaryButton = ref(null)
    const cancelButton = ref(null)

    const setButtonsEqualWidth = () => {
      const _primaryButton = unref(primaryButton)
      const _secondaryButton = unref(secondaryButton)
      const _cancelButton = unref(cancelButton)

      const primaryWidth = _primaryButton?.$el?.offsetWidth || 0
      const secondaryWidth = _secondaryButton?.$el?.offsetWidth || 0
      const cancelWidth = _cancelButton?.$el?.offsetWidth || 0
      const maxWidth = Math.max(primaryWidth, secondaryWidth, cancelWidth)

      if (_primaryButton?.$el) {
        _primaryButton.$el.style.minWidth = `${maxWidth}px`
      }
      if (_secondaryButton?.$el) {
        _secondaryButton.$el.style.minWidth = `${maxWidth}px`
      }
      if (_cancelButton?.$el) {
        _cancelButton.$el.style.minWidth = `${maxWidth}px`
      }
    }
    onMounted(() => {
      setButtonsEqualWidth()
    })

    return {
      primaryButton,
      secondaryButton,
      cancelButton
    }
  },
  computed: {
    initialFocusRef(): FocusTargetOrFalse {
      if (this.focusTrapInitial) {
        return this.focusTrapInitial
      }
      return () => {
        // FIXME: according to the types it's incorrect to pass this.$refs.ocModalInput
        // but passing this.$refs.ocModalInput?.$el does not work …
        return ((this.$refs.ocModalInput as ComponentPublicInstance as unknown as HTMLElement) ||
          (this.$refs.ocModal as HTMLElement)) as FocusTargetValueOrFalse
      }
    },
    classes() {
      return ['oc-modal', `oc-modal-${this.variation}`]
    },
    iconName() {
      if (this.icon) {
        return this.icon
      }

      switch (this.variation) {
        case 'danger':
          return 'alert'
        case 'warning':
          return 'error-warning'
        case 'success':
          return 'checkbox-circle'
        case 'info':
          return 'information'
        default:
          return ''
      }
    }
  },
  watch: {
    inputValue: {
      handler: 'inputAssignPropAsValue',
      immediate: true
    },
    checkboxValue: {
      handler: 'checkboxValueChanged',
      immediate: true
    }
  },
  methods: {
    cancelModalAction() {
      /**
       * The user clicked on the cancel button or hit the escape key
       */
      this.$emit('cancel')
    },
    secondaryModalAction() {
      this.$emit('confirm-secondary')
    },
    confirm() {
      if (this.buttonConfirmDisabled || this.inputError) {
        return
      }
      /**
       * The user clicked on the confirm button. If input exists, emits its value
       *
       * @property {String} value Value of the input
       */
      this.$emit('confirm', this.userInputValue)
    },
    inputOnInput(value) {
      /**
       * The user typed into the input
       *
       * @property {String} value Value of the input
       */
      this.$emit('input', value)
    },
    inputAssignPropAsValue(value) {
      this.userInputValue = value
    },
    checkboxValueChanged(value) {
      this.$emit('checkbox-changed', value)
    }
  }
})
</script>

<style lang="scss">
@mixin oc-modal-variation($color) {
  span {
    color: $color;
  }
}

.oc-modal {
  max-width: 500px;
  width: 100%;
  box-shadow: 5px 0 25px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--oc-color-input-border);
  border-radius: 15px;
  background-color: var(--oc-color-background-default);

  &:focus {
    outline: none;
  }

  &-background {
    align-items: center;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    flex-flow: row wrap;
    height: 100%;
    justify-content: center;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: var(--oc-z-index-modal);
  }

  &-primary {
    @include oc-modal-variation(var(--oc-color-swatch-primary-default));
  }

  &-success {
    @include oc-modal-variation(var(--oc-color-swatch-success-default));
  }

  &-warning {
    @include oc-modal-variation(var(--oc-color-swatch-warning-default));
  }

  &-danger {
    @include oc-modal-variation(var(--oc-color-swatch-danger-default));
  }

  &-title {
    align-items: center;
    border-bottom: 1px solid var(--oc-color-input-border);
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    display: flex;
    flex-flow: row wrap;
    line-height: 1.625;
    padding: var(--oc-space-medium) var(--oc-space-medium);

    > .oc-icon {
      margin-right: var(--oc-space-small);
    }

    > h2 {
      font-size: 1rem;
      font-weight: bold;
      margin: 0;
    }
  }

  &-body {
    color: var(--oc-color-text-default);
    line-height: 1.625;
    padding: var(--oc-space-medium) var(--oc-space-medium) 0;
    span {
      color: var(--oc-color-text-default);
    }

    &-message {
      margin-bottom: var(--oc-space-medium);
      margin-top: var(--oc-space-small);
    }

    &-contextual-helper {
      margin-bottom: var(--oc-space-medium);
    }

    .oc-input {
      line-height: normal;
    }

    &-input {
      /* FIXME: this is ugly, but required so that the bottom padding doesn't look off when reserving vertical space for error messages below the input. */
      margin-bottom: -20px;
      padding-bottom: var(--oc-space-medium);

      .oc-text-input-message {
        margin-bottom: var(--oc-space-xsmall);
      }
    }

    &-actions {
      text-align: right;
      background: var(--oc-color-background-default);
      border-bottom-right-radius: 15px;
      border-bottom-left-radius: 15px;
      padding: var(--oc-space-medium);

      .oc-button {
        border-radius: 4px;
      }
    }
  }

  .oc-text-input-password-wrapper {
    button {
      background-color: var(--oc-color-background-highlight) !important;
    }
  }
}
</style>

<docs>
```js
<div>
  <oc-modal
    icon="information"
    title="Accept terms of use"
    message="Do you accept our terms of use?"
    button-cancel-text="Decline"
    button-confirm-text="Accept"
    class="oc-mb-l oc-position-relative"
  />
</div>
```
```js
<div>
  <oc-modal
    variation="danger"
    icon="alert"
    title="Delete file lorem.txt"
    message="Are you sure you want to delete this file? All its content will be permanently removed. This action cannot be undone."
    button-cancel-text="Cancel"
    button-confirm-text="Delete"
    button-confirm-appearance="filled"
    button-confirm-variation="danger"
    class="oc-mb-l oc-position-relative"
  />
</div>
```
```js
<div>
  <oc-modal
    title="Create new folder"
    button-cancel-text="Cancel"
    button-confirm-text="Create"
    :has-input="true"
    input-value="New folder"
    input-label="Folder name"
    input-description="Enter a folder name"
    input-error="This name is already taken, please choose another one"
    class="oc-mb-l oc-position-relative"
  />
</div>
```

```js
<div>
  <oc-modal
    title="Rename file lorem.txt"
    button-cancel-text="Cancel"
    button-cancel-variation="warning"
    button-confirm-text="Rename"
    class="oc-position-relative"
  >
    <template v-slot:content>
      <oc-text-input
        value="lorem.txt"
        label="File name"
      />
    </template>
  </oc-modal>
</div>
```

```js
<div>
  <oc-modal
    icon="information"
    title="Accept terms of use"
    message="Do you accept our terms of use?"
    button-cancel-text="Decline"
    button-confirm-text="Accept"
    checkbox-label="I accept the terms of use"
    class="oc-mb-l oc-position-relative"
  />
</div>
```

```js
<div>
  <oc-modal
    icon="information"
    title="Accept terms of use"
    message="Do you accept our terms of use?"
    button-cancel-text="Decline"
    button-confirm-text="Accept"
    button-secondary-text="Accept some"
    class="oc-mb-l oc-position-relative"
  />
</div>
```

```js
<div>
  <oc-modal
    icon="information"
    title="Accept terms of use"
    message="Do you accept our terms of use?"
    button-cancel-text="Decline"
    button-confirm-text="Accept"
    contextual-helper-label="I need more information?"
    :contextual-helper-data="{ title: 'This is more information' }"
    class="oc-mb-l oc-position-relative"
  />
</div>
```

```js
<div>
	<oc-modal
			icon="info"
			title="Accept terms of use"
			message="Do you accept our terms of use?"
			button-cancel-text="Decline"
			button-confirm-text="Accept"
			class="oc-mb-l oc-position-relative"
	/>
</div>
```
</docs>
