<template>
  <section class="files-embed-actions">
    <oc-button data-testid="button-cancel" appearance="raw-inverse" @click="emitCancel">{{
      $gettext('Cancel')
    }}</oc-button>
    <oc-button
      v-if="!isLocationPicker"
      key="btn-share"
      data-testid="button-share"
      variation="inverse"
      appearance="filled"
      :disabled="areSelectActionsDisabled || !canCreatePublicLinks"
      @click="sharePublicLinks"
      >{{ $gettext('Share links') }}</oc-button
    >
    <oc-button
      data-testid="button-select"
      variation="inverse"
      appearance="filled"
      :disabled="areSelectActionsDisabled"
      @click="emitSelect"
      >{{ selectLabel }}</oc-button
    >
  </section>
</template>

<script lang="ts">
import { computed } from 'vue'
import {
  createQuicklink,
  getDefaultLinkPermissions,
  showQuickLinkPasswordModal,
  useAbility,
  useClientService,
  useEmbedMode,
  usePasswordPolicyService,
  useStore
} from '@ownclouders/web-pkg'
import { Resource } from '@ownclouders/web-client'
import { useGettext } from 'vue3-gettext'
import { SharePermissionBit } from '@ownclouders/web-client/src/helpers'

export default {
  setup() {
    const store = useStore()
    const ability = useAbility()
    const clientService = useClientService()
    const passwordPolicyService = usePasswordPolicyService()
    const language = useGettext()
    const { isLocationPicker, postMessage } = useEmbedMode()

    const selectedFiles = computed<Resource[]>(() => {
      if (isLocationPicker.value) {
        return [store.getters['Files/currentFolder']]
      }

      return store.getters['Files/selectedFiles']
    })

    const areSelectActionsDisabled = computed<boolean>(() => selectedFiles.value.length < 1)

    const canCreatePublicLinks = computed<boolean>(() => ability.can('create-all', 'PublicLink'))

    const selectLabel = computed<string>(() =>
      isLocationPicker.value ? language.$gettext('Choose') : language.$gettext('Attach as copy')
    )

    const emitSelect = (): void => {
      postMessage<Resource[]>(
        'owncloud-embed:select',
        JSON.parse(JSON.stringify(selectedFiles.value))
      )
    }

    const emitCancel = (): void => {
      postMessage<null>('owncloud-embed:cancel', null)
    }

    const emitShare = (links: string[]): void => {
      if (!canCreatePublicLinks.value) return

      postMessage<string[]>('owncloud-embed:share', links)
    }

    const sharePublicLinks = async (): Promise<string[]> => {
      if (!canCreatePublicLinks.value) return

      try {
        const passwordEnforced: boolean =
          store.getters.capabilities?.files_sharing?.public?.password?.enforced_for?.read_only ===
          true

        const permissions = getDefaultLinkPermissions({ ability, store })

        if (passwordEnforced && permissions > SharePermissionBit.Internal) {
          showQuickLinkPasswordModal(
            { store, $gettext: language.$gettext, passwordPolicyService },
            async (password) => {
              const links: string[] = await Promise.all(
                selectedFiles.value.map(
                  async (resource) =>
                    (
                      await createQuicklink({
                        ability,
                        resource,
                        clientService,
                        language,
                        store,
                        password
                      })
                    ).url
                )
              )

              emitShare(links)
            }
          )

          return
        }

        const links: string[] = await Promise.all(
          selectedFiles.value.map(
            async (resource) =>
              (await createQuicklink({ ability, resource, clientService, language, store })).url
          )
        )

        emitShare(links)
      } catch (error) {
        console.error(error)
        store.dispatch('showErrorMessage', {
          title: language.$gettext('Sharing links failed...'),
          error
        })
      }
    }

    return {
      areSelectActionsDisabled,
      canCreatePublicLinks,
      isLocationPicker,
      selectLabel,
      sharePublicLinks,
      emitCancel,
      emitSelect
    }
  }
}
</script>

<style scoped>
.files-embed-actions {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  gap: var(--oc-space-medium);
  justify-content: flex-end;
  padding: var(--oc-space-medium) 0;
  padding-right: var(--oc-space-small);
  width: 100%;
}
</style>
