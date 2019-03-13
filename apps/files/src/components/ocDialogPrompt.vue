<template>
  <v-dialog v-model="ocActive" persistent max-width="290">
    <v-card>
      <v-card-title class="headline" v-if="ocTitle">{{ ocTitle }}</v-card-title>
      <v-card-text v-if="ocContent">{{ ocContent }}</v-card-text>
      <v-card-text v-if="ocHasInput">
        <v-text-field
          :loading="ocLoading"
          :disabled="ocLoading"
          autofocus
          :id="ocInputId"
          v-model="inputValue"
          ref="input"
          @keydown.enter.native="onConfirm"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="ocLoading" flat @click="onCancel">{{ ocCancelText }}</v-btn>
        <v-btn :disabled="ocLoading" flat
               :id="ocConfirmId"
               @click="onConfirm">{{ ocConfirmText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'OcDialogPrompt',
  props: {
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
      default: 'Ok'
    },
    ocCancelText: {
      type: String,
      default: 'Cancel'
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
  created () {
    this.inputValue = this.value
  }
}
</script>
