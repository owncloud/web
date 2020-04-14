<template>
  <oc-dialog :name="name" v-model="ocActive" :title="ocTitle">
    <template slot="content">
      <span v-if="ocContent" class="uk-text-break">{{ ocContent }}</span>
      <oc-text-input v-if="ocHasInput"
        :disabled="ocLoading"
        :placeholder="ocInputPlaceholder"
        :label="ocInputLabel"
        autofocus
        :id="ocInputId"
        v-model="inputValue"
        ref="input"
        @keydown.enter.native="onConfirm"
        :error-message="ocErrorDelayed"
        :fix-message-line="true"
        class="oc-dialog-prompt-input-offset"
      ></oc-text-input>
      <oc-loader v-if="ocLoading"></oc-loader>
    </template>
    <template slot="footer">
        <oc-button :id="ocCancelId" :disabled="ocLoading" @click.stop="onCancel">{{ _ocCancelText }}</oc-button>
        <oc-button :disabled="ocLoading || !!ocError || inputValue === '' || clicked"
               :id="ocConfirmId"
               ref="confirmButton"
               :autofocus="!ocHasInput"
               @click.stop="onConfirm">{{ _ocConfirmText }}</oc-button>
    </template>
  </oc-dialog>
</template>

<script>
import debounce from 'lodash/debounce'
export default {
  name: 'OcDialogPrompt',
  props: {
    name: { type: String },
    ocActive: { type: Boolean, default: false },
    value: {},
    ocTitle: String,
    ocHasInput: { type: Boolean, default: true },
    ocInputId: String,
    ocInputName: String,
    ocInputMaxlength: [String, Number],
    ocInputPlaceholder: [String, Number],
    ocInputLabel: [String, Number],
    ocContent: String,
    ocError: {
      type: String,
      default: null
    },
    ocLoading: { type: Boolean, default: false },
    ocCancelId: String,
    ocConfirmId: String,
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
    _ocConfirmText () {
      return this.ocConfirmText ? this.ocConfirmText : this.$gettext('Ok')
    },
    _ocCancelText () {
      return this.ocCancelText ? this.ocConfirmText : this.$gettext('Cancel')
    }
  },
  watch: {
    value () {
      this.inputValue = this.value
    },
    inputValue () {
      this.$emit('input', this.inputValue)
    },
    ocActive (isActive) {
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
    ocError: debounce(function (error) {
      this.ocErrorDelayed = error
    }, 400)
  },
  created () {
    this.inputValue = this.value
  },
  methods: {
    onCancel () {
      this.$emit('oc-cancel')
    },
    onConfirm () {
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
