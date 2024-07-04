<template>
  <div class="oc-modal-background" aria-labelledby="oc-modal-title">
    <focus-trap
      :active="false"
      :initial-focus="initialFocusRef"
      :tabbable-options="tabbableOptions"
    >
      <div
        :id="elementId"
        ref="ocModal"
        :class="classes"
        tabindex="0"
        role="dialog"
        aria-modal="true"
        @keydown.esc="cancelModalAction"
      >
        <div class="oc-modal-title">
          <oc-icon v-if="iconName !== ''" :name="iconName" :variation="variation" />
          <h2 id="oc-modal-title" class="oc-text-truncate" v-text="title" />
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
              :label="inputLabel"
              :type="inputType"
              :description-message="inputDescription"
              :fix-message-line="true"
              :selection-range="inputSelectionRange"
              @update:model-value="inputOnInput"
              @keydown.enter.prevent="confirm"
            />
          </template>
        </div>

        <div v-if="!hideActions" class="oc-modal-body-actions oc-flex oc-flex-right">
          <div class="oc-modal-body-actions-grid">
            <oc-button
              class="oc-modal-body-actions-cancel"
              variation="passive"
              appearance="outline"
              :disabled="isLoading"
              @click="cancelModalAction"
              >{{ $gettext(buttonCancelText) }}
            </oc-button>
            <oc-button
              v-if="!hideConfirmButton"
              class="oc-modal-body-actions-confirm oc-ml-s"
              variation="primary"
              :appearance="buttonConfirmAppearance"
              :disabled="isLoading || buttonConfirmDisabled || !!inputError"
              :show-spinner="showSpinner"
              @click="confirm"
              >{{ $gettext(buttonConfirmText) }}
            </oc-button>
          </div>
        </div>
      </div>
    </focus-trap>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ComponentPublicInstance, ref, watch, computed } from 'vue'
import OcButton from '../OcButton/OcButton.vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import OcTextInput from '../OcTextInput/OcTextInput.vue'
import { FocusTrap } from 'focus-trap-vue'
import { FocusTargetOrFalse, FocusTargetValueOrFalse, FocusTrapTabbableOptions } from 'focus-trap'

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
    OcIcon,
    OcTextInput,
    FocusTrap
  },

  props: {
    /**
     * Optional modal id
     */
    elementId: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Optional modal class
     */
    elementClass: {
      type: String,
      required: false,
      default: null
    },
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
     * Text of the confirm button
     */
    buttonConfirmText: {
      type: String,
      required: false,
      default: 'Confirm'
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
    hideConfirmButton: {
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
     * Overwrite default focused element
     * Can be `#id, .class`.
     */
    focusTrapInitial: {
      type: [String, Boolean],
      required: false,
      default: null,
      validator: (focusTrapInitial: string | boolean) => {
        return !(typeof focusTrapInitial === 'boolean' && focusTrapInitial === true)
      }
    },
    /**
     * Hide the actions at the bottom of the modal
     */
    hideActions: {
      type: Boolean,
      default: false
    },
    /**
     * Sets the loading state
     * if enabled, confirm and cancel buttons are disabled,
     * loading spinner will be shown in confirm button after a certain timeout
     */
    isLoading: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ['cancel', 'confirm', 'input'],
  setup(props) {
    const showSpinner = ref(false)
    const buttonConfirmAppearance = ref('filled')

    const tabbableOptions = computed((): FocusTrapTabbableOptions => {
      // Enable shadow DOM support for e.g. emoji-picker
      return {
        getShadowRoot: true
      }
    })

    const resetLoadingState = () => {
      showSpinner.value = false
      buttonConfirmAppearance.value = 'filled'
    }

    const setLoadingState = () => {
      showSpinner.value = true
      buttonConfirmAppearance.value = 'outline'
    }

    watch(
      () => props.isLoading,
      () => {
        if (!props.isLoading) {
          return resetLoadingState()
        }
        setTimeout(() => {
          if (!props.isLoading) {
            return resetLoadingState()
          }
          setLoadingState()
        }, 700)
      },
      { immediate: true }
    )

    return {
      showSpinner,
      buttonConfirmAppearance,
      tabbableOptions
    }
  },
  data() {
    return {
      userInputValue: null
    }
  },
  computed: {
    initialFocusRef(): FocusTargetOrFalse {
      if (this.focusTrapInitial || this.focusTrapInitial === false) {
        return this.focusTrapInitial as FocusTargetOrFalse
      }
      return () => {
        // FIXME: according to the types it's incorrect to pass this.$refs.ocModalInput
        // but passing this.$refs.ocModalInput?.$el does not work …
        return ((this.$refs.ocModalInput as ComponentPublicInstance as unknown as HTMLElement) ||
          (this.$refs.ocModal as HTMLElement)) as FocusTargetValueOrFalse
      }
    },
    classes() {
      return ['oc-modal', `oc-modal-${this.variation}`, this.elementClass]
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
    }
  },
  methods: {
    cancelModalAction() {
      /**
       * The user clicked on the cancel button or hit the escape key
       */
      this.$emit('cancel')
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
    inputOnInput(value: string) {
      /**
       * The user typed into the input
       *
       * @property {String} value Value of the input
       */
      this.$emit('input', value)
    },
    inputAssignPropAsValue(value: string) {
      this.userInputValue = value
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
  background-color: var(--oc-color-background-default);
  border: 1px solid var(--oc-color-input-border);
  border-radius: 15px;
  box-shadow: 5px 0 25px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  max-width: 500px;
  overflow: auto;
  width: 100%;

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

      &-grid {
        display: inline-grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
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
