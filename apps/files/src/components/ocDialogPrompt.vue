<template>
  <oc-dialog :name="name" v-model="ocActive" :title="ocTitle">
    <template slot="content">
      <span v-if="ocContent">{{ ocContent }}</span>
        <oc-text-input v-if="ocHasInput"
          :disabled="ocLoading"
          autofocus
          :id="ocInputId"
          v-model="inputValue"
          ref="input"
          @keydown.enter.native="onConfirm"
        ></oc-text-input>
      <oc-loader v-if="ocLoading"></oc-loader>
    </template>
    <template slot="footer">
        <oc-button :disabled="ocLoading" @click="onCancel" :text="_ocCancelText"></oc-button>
        <oc-button :disabled="ocLoading"
               :id="ocConfirmId" :text="_ocConfirmText"
               @click="onConfirm"></oc-button>
    </template>
  </oc-dialog>
</template>

<script>
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
    ocContent: String,
    ocLoading: { type: Boolean, default: false },
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
    inputValue: null
  }),
  watch: {
    value () {
      this.inputValue = this.value
    },
    ocActive (isActive) {
      this.inputValue = this.value
      this.$nextTick().then(() => {
        if (isActive && this.ocHasInput) {
          this.$refs.input.focus()
        }
      })
    }
  },
  methods: {
    onCancel () {
      this.$emit('oc-cancel')
    },
    onConfirm () {
      this.$emit('oc-confirm', this.inputValue)
    }
  },
  computed: {
    _ocConfirmText () {
      return this.ocConfirmText ? this.ocConfirmText : this.$gettext('Ok')
    },
    _ocCancelText () {
      return this.ocCancelText ? this.ocConfirmText : this.$gettext('Cancel')
    }
  },
  created () {
    this.inputValue = this.value
  }
}
</script>
