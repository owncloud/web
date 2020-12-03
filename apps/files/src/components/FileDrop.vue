<template>
  <vue-dropzone
    v-if="dropzone"
    id="oc-dropzone"
    ref="ocDropzone"
    :options="ocDropzone_options"
    :use-custom-slot="true"
    :include-styling="false"
    @vdropzone-drop="$_ocUpload_addDropToQue"
    @vdropzone-files-added="$_ocDropzone_dragEnd"
    @vdropzone-file-added="$_ocDropzone_removeFiles"
    @vdropzone-drag-leave="$_ocDropzone_dragEnd"
  >
    <oc-dropzone>
      <translate>
        Drag and drop to upload content into current folder
      </translate>
    </oc-dropzone>
  </vue-dropzone>
</template>
<script>
import vue2DropZone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import Mixins from '../mixins'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    vueDropzone: vue2DropZone
  },
  mixins: [Mixins],
  props: {
    rootPath: { type: String, required: true },
    path: { type: String, required: true },
    headers: {
      type: Object,
      default: () => {
        return {}
      }
    },
    requestType: { type: String, default: 'PUT' }
  },
  data() {
    return {
      ocDropzone_options: {
        url: '#', // FIXME: unused
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

    $_ocDropzone_dragEnd() {
      this.dragOver(false)
    },
    $_ocDropzone_removeFiles(file) {
      this.$refs.ocDropzone.removeFile(file)
    }
  }
}
</script>
