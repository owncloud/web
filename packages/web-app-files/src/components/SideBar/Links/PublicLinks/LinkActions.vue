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
    ...mapActions(['showMessage', 'createModal', 'hideModal']),
    ...mapActions('Files', ['removeLink']),
    ...mapMutations('Files', ['TRIGGER_PUBLIC_LINK_EDIT']),

    $_removeLink() {
      const modal = {
        variation: 'danger',
        title: this.$gettext('Delete public link'),
        message: this.$gettext(
          'Are you sure you want to delete this link? Recreating the same link again is not possible.'
        ),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Delete'),
        onCancel: this.hideModal,
        onConfirm: this.deleteLink
      }

      this.createModal(modal)
    },

    deleteLink() {
      this.hideModal()
      this.removeLink({
        client: this.$client,
        share: this.link
      })

      this.showMessage({
        title: this.$gettext('Public link was successfully deleted'),
        autoClose: {
          enabled: true
        }
      })
    },

    editLink() {
      this.TRIGGER_PUBLIC_LINK_EDIT(this.link)
    }
  }
}
</script>
