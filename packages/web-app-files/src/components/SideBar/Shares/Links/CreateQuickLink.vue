<template>
  <div class="oc-mb-s oc-width-1-1 oc-mb-l">
    <h4
      class="oc-text-truncate oc-text-normal oc-files-file-link-name oc-my-rm"
      v-text="$gettext('Quick link')"
    />
    <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1 oc-p-s link-name-container">
      <div class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon name="link" fill-type="line" />
        <p
          class="oc-files-file-link-url oc-ml-s oc-text-truncate oc-my-rm"
          v-text="$gettext('No link')"
        />
      </div>
      <oc-button
        v-oc-tooltip="$gettext('Create quick link')"
        appearance="raw"
        :aria-label="$gettext('Create quick link')"
        @click="createQuickLink"
      >
        <span v-text="$gettext('Create link')" />
      </oc-button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useAbility } from 'web-pkg'
import { inject } from 'vue'
import { Resource } from 'web-client/src'
import { useGettext } from 'vue3-gettext'
import {
  linkRoleInternalFile,
  linkRoleInternalFolder,
  linkRoleViewerFile,
  linkRoleViewerFolder
} from 'web-client/src/helpers/share'
import { Capabilities } from 'web-client/src/ocs'

export default defineComponent({
  name: 'CreateQuickLink',
  props: {
    expirationDate: {
      type: Object,
      default: () => {},
      required: true
    }
  },
  emits: ['createPublicLink'],
  setup(props, { emit }) {
    const { can } = useAbility()
    const { $gettext } = useGettext()

    const canCreatePublicLinks = computed(() => can('create-all', 'PublicLink'))
    const resource = inject<Resource>('resource')
    const capabilities = inject<Capabilities>('capabilities')
    const createQuickLink = () => {
      const allowResharing = capabilities.capabilities.files_sharing?.resharing
      const isDefaultRoleViewer = capabilities.capabilities.files_sharing?.quickLink?.default_role
      const internalPerm = (resource.isFolder ? linkRoleInternalFolder : linkRoleInternalFile)
        .bitmask
      const viewerPerm = (resource.isFolder ? linkRoleViewerFolder : linkRoleViewerFile).bitmask(
        allowResharing
      )
      emit('createPublicLink', {
        link: {
          name: $gettext('Quicklink'),
          permissions:
            canCreatePublicLinks.value && isDefaultRoleViewer === 'viewer'
              ? viewerPerm
              : internalPerm,
          expiration: props.expirationDate.enforced ? props.expirationDate.default : null,
          quicklink: true,
          password: false
        }
      })
    }
    return {
      createQuickLink
    }
  }
})
</script>
