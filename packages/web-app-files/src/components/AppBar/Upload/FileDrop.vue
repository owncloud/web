<template>
  <div v-if="dropzone" :class="[sidebarStateClass]">
    <vue-dropzone
      id="oc-dropzone"
      ref="ocDropzone"
      class="oc-dropzone-container"
      :class="[sidebarStateClass]"
      :options="ocDropzone_options"
      :use-custom-slot="true"
      :include-styling="false"
      @vdropzone-drop="$_ocUpload_addDropToQueue"
      @vdropzone-files-added="$_ocDropzone_dragEnd"
      @vdropzone-file-added="$_ocDropzone_removeFiles"
      @vdropzone-drag-leave="$_ocDropzone_dragEnd"
    >
      <oc-dropzone>
        <translate> Drag and drop to upload content into current folder </translate>
      </oc-dropzone>
    </vue-dropzone>
  </div>
</template>
<script>
import vue2DropZone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import Mixins from '../../../mixins'
import { mapActions, mapGetters, mapState } from 'vuex'
import { useActiveApp } from 'web-pkg/src/composables'

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
  setup() {
    return {
      activeApp: useActiveApp()
    }
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
    ...mapState(['navigation', 'user']),
    ...mapGetters(['getNavItemsByExtension']),
    ...mapGetters('Files', ['dropzone']),
    hasSidebarNavItems() {
      if (this.publicPage()) {
        return false
      }
      return (this.getNavItemsByExtension(this.activeApp) || []).length
    },
    sidebarStateClass() {
      if (!this.hasSidebarNavItems) {
        return 'oc-dropzone-navigation-hidden'
      }
      return this.navigation.closed
        ? 'oc-dropzone-navigation-collapsed'
        : 'oc-dropzone-navigation-expanded'
    }
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

<style lang="scss">
.oc-dropzone-navigation-hidden,
.oc-dropzone-navigation-collapsed,
.oc-dropzone-navigation-expanded {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.oc-dropzone-container {
  position: fixed;
  top: 60px;
  height: calc(100% - 60px - var(--oc-space-small));
  left: var(--oc-space-small);
  width: calc(100% - (2 * var(--oc-space-small)));
  z-index: 3;

  // TODO: Remove vue-dropzone
  .dz-message {
    height: 100%;
  }
  .oc-dropzone {
    border-radius: 15px;
    height: calc(100% - (2 * var(--oc-space-medium)));
  }
}
@media only screen and (min-width: 640px) {
  .oc-dropzone-navigation-collapsed > .oc-dropzone-container {
    left: calc(64px + var(--oc-space-small));
    width: calc(100% - 64px - (2 * var(--oc-space-small)));
  }
  .oc-dropzone-navigation-expanded > .oc-dropzone-container {
    left: calc(250px + var(--oc-space-small));
    width: calc(100% - 250px - (2 * var(--oc-space-small)));
  }
}
</style>
