<template>
  <div class="uk-flex uk-flex-nowrap uk-flex-middle">
    <oc-spinner v-if="removalInProgress" :aria-label="$gettext('Removing public link')" />
    <template v-else>
      <oc-button
        v-oc-tooltip="editButtonLabel"
        :aria-label="editButtonLabel"
        appearance="raw"
        class="oc-files-file-link-edit oc-mr-xs"
        @click="editLink"
      >
        <oc-icon name="edit" />
      </oc-button>
      <oc-button
        v-oc-tooltip="deleteButtonLabel"
        :aria-label="deleteButtonLabel"
        appearance="raw"
        class="oc-files-file-link-delete"
        @click="$_removeLink"
      >
        <oc-icon name="delete" />
      </oc-button>
    </template>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'

export default {
  name: 'LinkActions',

  props: {
    link: {
      type: Object,
      required: true
    }
  },

  data: () => ({
    removalInProgress: false
  }),

  computed: {
    editButtonLabel() {
      return this.$gettext('Edit public link')
    },

    deleteButtonLabel() {
      return this.$gettext('Delete public link')
    }
  },

  methods: {
    ...mapActions('Files', ['removeLink']),
    ...mapMutations('Files', ['TRIGGER_PUBLIC_LINK_EDIT']),

    $_removeLink() {
      this.removeLink({
        client: this.$client,
        share: this.link
      })
    },

    editLink() {
      this.TRIGGER_PUBLIC_LINK_EDIT(this.link)
    }
  }
}
</script>
