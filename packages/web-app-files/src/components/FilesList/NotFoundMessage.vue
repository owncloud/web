<template>
  <div
    id="files-list-not-found-message"
    class="oc-text-center oc-flex-middle oc-flex oc-flex-center oc-flex-column"
  >
    <oc-icon name="cloud" type="div" size="xxlarge" />
    <div class="oc-text-muted oc-text-large">
      <translate>Resource not found</translate>
    </div>
    <div class="oc-text-muted">
      <translate>
        We went looking everywhere, but were unable to find the selected resource.
      </translate>
    </div>
    <div class="oc-mt-s">
      <oc-button
        v-if="showHomeButton"
        id="files-list-not-found-button-go-home"
        type="router-link"
        appearance="raw"
        :to="homeRoute"
      >
        <translate>Go to »All files«</translate>
      </oc-button>
      <oc-button
        v-if="showPublicLinkButton"
        id="files-list-not-found-button-reload-link"
        type="router-link"
        appearance="raw"
        :to="publicLinkRoute"
      >
        <translate>Reload public link</translate>
      </oc-button>
    </div>
  </div>
</template>

<script>
import { useRouter, useStore } from '../../composables'
import {
  createLocationPublic,
  createLocationSpaces,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../router'

export default {
  name: 'NotFoundMessage',
  setup() {
    const router = useRouter()
    const store = useStore()

    return {
      showPublicLinkButton: isLocationPublicActive(router, 'files-public-files'),
      showHomeButton: isLocationSpacesActive(router, 'files-spaces-personal-home'),
      homeRoute: createLocationSpaces('files-spaces-personal-home', {
        params: { item: store.getters.homeFolder }
      }),
      publicLinkRoute: createLocationPublic('files-public-files', {
        params: { item: router.currentRoute.params?.item?.split('/')[0] }
      })
    }
  }
}
</script>
