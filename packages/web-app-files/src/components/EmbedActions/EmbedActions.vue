<template>
  <section class="files-embed-actions">
    <oc-button data-testid="button-cancel" appearance="raw-inverse" @click="emitCancel">{{
      $gettext('Cancel')
    }}</oc-button>
    <oc-button
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
      >{{ $gettext('Attach as copy') }}</oc-button
    >
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  createQuicklink,
  showQuickLinkPasswordModal,
  useAbility,
  useClientService,
  usePasswordPolicyService,
  useStore
} from '@ownclouders/web-pkg'
import { Resource } from '@ownclouders/web-client'
import { useGettext } from 'vue3-gettext'

const store = useStore()
const ability = useAbility()
const clientService = useClientService()
const passwordPolicyService = usePasswordPolicyService()
const language = useGettext()

const selectedFiles = computed<Resource[]>(() => {
  return store.getters['Files/selectedFiles']
})

const areSelectActionsDisabled = computed<boolean>(() => selectedFiles.value.length < 1)

const canCreatePublicLinks = computed<boolean>(() => ability.can('create-all', 'PublicLink'))

const emitSelect = (): void => {
  const event: CustomEvent<Resource[]> = new CustomEvent('owncloud-embed:select', {
    detail: selectedFiles.value
  })

  window.parent.dispatchEvent(event)
}

const emitCancel = (): void => {
  const event: CustomEvent<void> = new CustomEvent('owncloud-embed:cancel')

  window.parent.dispatchEvent(event)
}

const emitShare = (links: string[]): void => {
  if (!canCreatePublicLinks.value) return

  const event: CustomEvent<string[]> = new CustomEvent('owncloud-embed:share', {
    detail: links
  })

  window.parent.dispatchEvent(event)
}

const sharePublicLinks = async (): Promise<string[]> => {
  if (!canCreatePublicLinks.value) return

  try {
    const passwordEnforced: boolean =
      store.getters.capabilities?.files_sharing?.public?.password?.enforced_for?.read_only === true

    if (passwordEnforced) {
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
          (
            await createQuicklink({ ability, resource, clientService, language, store })
          ).url
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
