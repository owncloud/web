<template>
  <v-dialog
    v-model="show"
    hide-overlay
    persistent
  >
    <v-card
      color="primary"
      dark
    >
      <v-card-text>
        <span v-if="uploading" class="text-truncate" style="display: block">
          Uploading {{ FileName }}
        </span>
        <span v-if="!uploading" class="text-truncate" style="display: block">
          Finalizing upload of {{ FileName }}
        </span>
        <v-progress-linear
          color="secondary"
          :value="value"
          :indeterminate="!uploading"
        ></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'FileUploadProgress',
  props: {
    value: { type: Number, default: 0 },
    FileName: String
  },
  computed: {
    uploading () {
      return this.p < 100
    },
    show () {
      return this.FileName.length > 0
    }
  }
}
</script>
