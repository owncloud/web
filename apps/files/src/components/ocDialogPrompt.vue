<template>
  <oc-dialog v-model="ocActive" :name="name" :title="ocTitle">
    <template slot="content">
      <span v-if="ocContent" class="uk-text-break">{{ ocContent }}</span>
      <oc-text-input
        v-if="ocHasInput"
        :id="ocInputId"
        ref="input"
        v-model="inputValue"
        :disabled="ocLoading"
        :placeholder="ocInputPlaceholder"
        :label="ocInputLabel"
        autofocus
        :error-message="ocErrorDelayed"
        :fix-message-line="true"
        class="oc-dialog-prompt-input-offset"
        @keydown.enter.native="onConfirm"
      ></oc-text-input>
      <oc-loader v-if="ocLoading"></oc-loader>
    </template>
    <template slot="footer">
      <oc-button :id="ocCancelId" :disabled="ocLoading" @click.stop="onCancel">{{
        _ocCancelText
      }}</oc-button>
      <oc-button
        :id="ocConfirmId"
        ref="confirmButton"
        :disabled="ocLoading || !!ocError || inputValue === '' || clicked"
        :autofocus="!ocHasInput"
        @click.stop="onConfirm"
        >{{ _ocConfirmText }}</oc-button
      >
    </template>
  </oc-dialog>
</template>

<script>
import debounce from 'lodash/debounce'
export default {
  name: 'OcDialogPrompt',
  props: {
    name: { type: String, required: true },
    ocActive: { type: Boolean, default: false },
    value: {
      type: [Object, String],
      default: undefined
    },
    ocTitle: {
      type: String,
      default: undefined
    },
    ocHasInput: { type: Boolean, default: true },
    ocInputId: {
      type: String,
      default: undefined
    },
    ocInputPlaceholder: {
      type: [String, Number],
      default: undefined
    },
    ocInputLabel: {
      type: [String, Number],
      default: undefined
    },
    ocContent: {
      type: String,
      default: undefined
    },
    ocError: {
      type: String,
      default: undefined
    },
    ocLoading: { type: Boolean, default: false },
    ocCancelId: {
      type: String,
      default: undefined
    },
    ocConfirmId: {
      type: String,
      default: undefined
    },
    ocConfirmText: {
      type: String,
      default: null
    },
    ocCancelText: {
      type: String,
      default: null
    }
  },
  data: () => ({
    inputValue: null,
    clicked: false,
    ocErrorDelayed: null
  }),
  computed: {
    _ocConfirmText() {
      return this.ocConfirmText ? this.ocConfirmText : this.$gettext('Ok')
    },
    _ocCancelText() {
      return this.ocCancelText ? this.ocConfirmText : this.$gettext('Cancel')
    }
  },
  watch: {
    value() {
      this.inputValue = this.value
    },
    inputValue() {
      this.$emit('input', this.inputValue)
    },
    ocActive(isActive) {
      this.clicked = false
      this.inputValue = this.value

      this.$nextTick().then(() => {
        if (isActive) {
          if (this.ocHasInput) {
            this.$refs.input.$el.focus()
            return
          }
          this.$refs.confirmButton.$el.focus()
        }
      })
    },
    ocError: debounce(function(error) {
      this.ocErrorDelayed = error
    }, 400)
  },
  created() {
    this.inputValue = this.value
  },
  methods: {
    onCancel() {
      this.$emit('oc-cancel')
    },
    onConfirm() {
      if (!this.ocError && this.inputValue !== '') {
        this.clicked = true
        this.$emit('oc-confirm', this.inputValue)
      }
    }
  }
}
</script>

<style scoped>
/* FIXME: this is ugly, but required so that the bottom padding doesn't look off when reserving vertical space for error messages below the input. */
.oc-dialog-prompt-input-offset {
  margin-bottom: -20px;
}
</style>
