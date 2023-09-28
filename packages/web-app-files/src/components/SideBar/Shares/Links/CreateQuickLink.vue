<template>
  <div class="oc-mb-s oc-width-1-1 oc-mb-l">
    <h4
      class="oc-text-truncate oc-text-normal oc-files-file-link-name oc-my-rm"
      v-text="$gettext('Link')"
    />
    <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1 oc-p-xs link-name-container">
      <div class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon name="link" fill-type="line" />
        <p
          class="oc-files-file-link-url oc-ml-s oc-text-truncate oc-my-rm"
          v-text="$gettext('No link')"
        />
      </div>
      <oc-button
        v-oc-tooltip="$gettext('Create link')"
        class="oc-ml-s"
        size="small"
        :aria-label="$gettext('Create link')"
        @click="createQuickLink"
      >
        <span v-text="$gettext('Create link')" />
      </oc-button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, unref } from 'vue'
import {
  useAbility,
  useCapabilityFilesSharingPublicAlias,
  useCapabilityFilesSharingPublicCanContribute,
  useCapabilityFilesSharingPublicCanEdit,
  useCapabilityFilesSharingQuickLinkDefaultRole,
  useCapabilityFilesSharingResharing
} from '@ownclouders/web-pkg'
import { Resource } from '@ownclouders/web-client/src'
import { useGettext } from 'vue3-gettext'
import {
  LinkShareRoles,
  linkRoleInternalFolder,
  linkRoleViewerFolder
} from '@ownclouders/web-client/src/helpers/share'

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
    const allowResharing = useCapabilityFilesSharingResharing()
    const canEdit = useCapabilityFilesSharingPublicCanEdit()
    const canContribute = useCapabilityFilesSharingPublicCanContribute()
    const alias = useCapabilityFilesSharingPublicAlias()
    const capabilitiesRoleName = useCapabilityFilesSharingQuickLinkDefaultRole()
    const createQuickLink = () => {
      const roleName = !unref(canCreatePublicLinks)
        ? linkRoleInternalFolder.name
        : unref(capabilitiesRoleName) || linkRoleViewerFolder.name
      const emitData = {
        link: {
          name: $gettext('Link'),
          permissions: LinkShareRoles.getByName(
            roleName,
            unref(resource).isFolder,
            unref(canEdit),
            unref(canContribute),
            unref(alias)
          )
            .bitmask(unref(allowResharing))
            .toString(),
          expiration: props.expirationDate.enforced ? props.expirationDate.default : null,
          quicklink: true,
          password: false
        }
      }
      emit('createPublicLink', emitData)
    }
    return {
      createQuickLink
    }
  }
})
</script>
