<template>
  <div>
    <oc-collaboration-status :owner="owner" :collaborators="collaborators" :roles="roles" />
  </div>
</template>

<script>
import OcCollaborationStatus from './OcCollaborationStatus.vue'
export default {
  components: {
    OcCollaborationStatus
  },
  name: 'FileSharingSidebar',
  data () {
    return {
      owner: {
        avatar: 'https://picsum.photos/64/64?image=1074',
        name: 'simba1',
        displayName: 'Simba',
        email: 'simba@djungle.com'
      },
      collaborators: [
        {
          avatar: 'https://picsum.photos/64/64?image=1075',
          name: 'foo',
          displayName: 'Foo',
          email: 'foo@djungle.com',
          role: 'editor',
          expires: 1554391618281
        }, {
          avatar: 'https://picsum.photos/64/64?image=1076',
          name: 'bar',
          displayName: 'Bar',
          email: 'bar@djungle.com',
          role: 'viewer',
          expires: 1554491618281
        }
      ],
      roles: {
        viewer: { name: 'Viewer', description: 'Download and preview' },
        editor: { name: 'Editor', description: 'Upload, edit, delete, download and preview' },
        coowner: {
          name: 'Co-owner',
          description: 'Share, upload, edit, delete, download and preview'
        },
        hammer: { name: 'MC Hammer', description: 'U Can\'t touch this' }
      }
    }
  }
}
</script>
