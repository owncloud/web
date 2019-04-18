<template>
  <vue-dropzone
    v-if="dropzone"
    ref="ocDropzone"
    id="oc-dropzone"
    :options="ocDropzone_options"
    @vdropzone-drop="$_ocUpload_addToQue"
    @vdropzone-files-added="$_ocDropzone_dragEnd"
    @vdropzone-file-added="$_ocDropzone_removeFiles"
    @vdropzone-drag-leave="$_ocDropzone_dragEnd"
    :useCustomSlot=true
    :includeStyling=false
    >
    <oc-dropzone>
      <translate>
        Drag and drop to upload content into current folder
      </translate>
    </oc-dropzone>
  </vue-dropzone>
</template>
<script>
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import Mixins from '../mixins'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    vueDropzone: vue2Dropzone
  },
  props: {
    url: { type: String, required: true },
    headers: {
      type: Object,
      default: () => {
        return {}
      }
    },
    additionalData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    requestType: { type: String, default: 'PUT' }
  },
  mixins: [
    Mixins
  ],
  data () {
    return {
      ocDropzone_options: {
        url: this.url,
        clickable: false,
        autoQueue: false
      }
    }
  },
  computed: {
    ...mapGetters('Files', ['dropzone'])
  },
  methods: {
    ...mapActions('Files', ['dragOver']),

    $_ocDropzone_dragEnd () {
      this.dragOver(false)
    },
    $_ocDropzone_removeFiles (file) {
      this.$refs.ocDropzone.removeFile(file)
    }
  }
}
</script>
