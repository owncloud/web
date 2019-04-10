<template>
  <div>
    <oc-collaboration-status :owner="owner" :collaborators="collaborators" :roles="roles" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import OcCollaborationStatus from './OcCollaborationStatus.vue'
export default {
  components: {
    OcCollaborationStatus
  },
  name: 'FileSharingSidebar',
  watch: {
    selectedFiles: function (selectedFiles) {
      if (selectedFiles.length === 1) {
        this.loadShares({
          client: this.$client,
          path: this.selectedFiles[0].path
        })
      } else {
        this.sharesClearState()
      }
    },
  },
  data () {
    return {
      owner: {
        avatar: 'https://picsum.photos/64/64?image=1074',
        name: 'simba1',
        displayName: 'Simba',
        email: 'simba@djungle.com'
      },
      roles: {
        viewer: { name: 'Viewer', description: 'Download and preview' },
        editor: { name: 'Editor', description: 'Upload, edit, delete, download and preview' },
        coowner: {
          name: 'Co-owner',
          description: 'Share, upload, edit, delete, download and preview'
        },
        legacy: {
          name: "Legacy",
          description: "Yet unmapped combinaton of permissions",
        },
        public: {
          name: "Public",
          description: "Public link",
        },
        hammer: { name: 'MC Hammer', description: 'U Can\'t touch this' }
      }
    }
  },
  computed: {
    ...mapGetters('Files', ['selectedFiles', 'shareOpen', 'shares', 'sharesError', 'sharesLoading']),
    collaborators () {
      return this.shares
    }
  },
  methods: {
    ...mapActions('Files', ['shareSetOpen', 'loadShares', 'sharesClearState', 'changeShare']),
  }
}
</script>
