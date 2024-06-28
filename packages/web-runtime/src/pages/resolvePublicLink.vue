<template>
  <div
    class="oc-link-resolve oc-height-viewport oc-flex oc-flex-column oc-flex-center oc-flex-middle"
  >
    <div class="oc-card oc-text-center oc-width-large">
      <template v-if="errorMessage">
        <div class="oc-card-header oc-link-resolve-error-title">
          <h2 key="public-link-error">
            <span v-text="$gettext('An error occurred while loading the public link')" />
          </h2>
        </div>
        <div class="oc-card-body oc-link-resolve-error-message">
          <p class="oc-text-xlarge">{{ errorMessage }}</p>
        </div>
      </template>
      <template v-else-if="isPasswordRequired">
        <form @submit.prevent="resolvePublicLinkTask.perform(true)">
          <div class="oc-card-header">
            <h2>
              <span v-text="$gettext('This resource is password-protected')" />
            </h2>
          </div>
          <div class="oc-card-body">
            <oc-text-input
              ref="passwordInput"
              v-model="password"
              :error-message="wrongPasswordMessage"
              :label="passwordFieldLabel"
              type="password"
              class="oc-mb-s"
            />
            <oc-button
              variation="primary"
              appearance="filled"
              class="oc-login-authorize-button"
              :disabled="!password"
              submit="submit"
            >
              <span v-text="$gettext('Continue')" />
            </oc-button>
          </div>
        </form>
      </template>
      <template v-else>
        <div class="oc-card-header">
          <h2 key="public-link-loading">
            <span v-text="$gettext('Loading public link…')" />
          </h2>
        </div>
        <div class="oc-card-body">
          <oc-spinner :aria-hidden="true" />
        </div>
      </template>
      <div class="oc-card-footer oc-pt-rm">
        <p>{{ footerSlogan }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { SharePermissionBit } from '@ownclouders/web-client/src/helpers/share'
import { authService } from '../services/auth'

import {
  queryItemAsString,
  useClientService,
  useConfigurationManager,
  useRoute,
  useRouteParam,
  useRouteQuery,
  useRouter,
  useStore,
  useThemeStore,
  useUserContext
} from '@ownclouders/web-pkg'
import { useTask } from 'vue-concurrency'
import { ref, unref, computed, defineComponent, onMounted } from 'vue'
import {
  buildPublicSpaceResource,
  isPublicSpaceResource,
  PublicSpaceResource
} from '@ownclouders/web-client/src/helpers'
import isEmpty from 'lodash-es/isEmpty'
import { useGettext } from 'vue3-gettext'
// full import is needed here so it can be overwritten via CERN config
import { useLoadTokenInfo } from 'web-runtime/src/composables/tokenInfo'
import { urlJoin } from '@ownclouders/web-client/src/utils'
import { RouteLocationNamedRaw } from 'vue-router'
import { dirname } from 'path'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'ResolvePublicLink',
  setup() {
    const configurationManager = useConfigurationManager()
    const clientService = useClientService()
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const { $gettext } = useGettext()
    const token = useRouteParam('token')
    const redirectUrl = useRouteQuery('redirectUrl')
    const themeStore = useThemeStore()

    const { currentTheme } = storeToRefs(themeStore)
    const password = ref('')

    const isOcmLink = computed(() => {
      const split = unref(route).path.split('/')?.[1]
      return split === 'o'
    })

    const publicLinkType = computed(() => {
      return unref(isOcmLink) ? 'ocm' : 'public-link'
    })

    const publicLinkSpace = computed(() =>
      buildPublicSpaceResource({
        id: unref(token),
        driveType: 'public',
        publicLinkType: unref(publicLinkType),
        ...(unref(password) && { publicLinkPassword: unref(password) })
      })
    )

    const item = computed(() => {
      return queryItemAsString(unref(route).params.driveAliasAndItem)
    })

    const isUserContext = useUserContext({ store })

    const detailsQuery = useRouteQuery('details')
    const details = computed(() => {
      return queryItemAsString(unref(detailsQuery))
    })

    // token info
    const { loadTokenInfoTask } = useLoadTokenInfo({ clientService, isUserContext })
    const tokenInfo = ref(null)

    // generic public link loading
    const isPasswordRequired = ref<boolean>()
    const isPasswordRequiredTask = useTask(function* () {
      if (!isEmpty(unref(tokenInfo))) {
        return unref(tokenInfo).password_protected
      }
      try {
        let space: PublicSpaceResource = {
          ...unref(publicLinkSpace),
          publicLinkPassword: null
        }
        yield clientService.webdav.getFileInfo(space)
        return false
      } catch (error) {
        if (error.statusCode === 401) {
          return true
        }
        if (error.statusCode === 404) {
          throw new Error($gettext('The resource could not be located, it may not exist anymore.'))
        }
        throw error
      }
    })
    const loadPublicLinkTask = useTask(function* () {
      try {
        const resource = yield clientService.webdav.getFileInfo(unref(publicLinkSpace))
        if (!isPublicSpaceResource(resource)) {
          const e: any = new Error($gettext('The resource is not a public link.'))
          e.resource = resource
          throw e
        }
        return resource
      } catch (e) {
        if (e.statusCode === 401) {
          throw e
        }
        throw new Error($gettext('The resource could not be located, it may not exist anymore.'))
      }
    })
    const wrongPassword = computed(() => {
      if (loadPublicLinkTask.isError) {
        return loadPublicLinkTask.last.error.statusCode === 401
      }
      return false
    })

    // resolve public link. resolve into authenticated context if possible.
    const redirectToPrivateLink = (fileId: string | number) => {
      return router.push({
        name: 'resolvePrivateLink',
        params: { fileId: `${fileId}` },
        ...(unref(details) && {
          query: {
            details: unref(details)
          }
        })
      })
    }
    const resolvePublicLinkTask = useTask(function* (signal, passwordRequired: boolean) {
      if (unref(isOcmLink) && !configurationManager.options.ocm.openRemotely) {
        throw new Error($gettext('Opening files from remote is disabled'))
      }

      if (!isEmpty(unref(tokenInfo)) && unref(tokenInfo)?.alias_link) {
        redirectToPrivateLink(unref(tokenInfo).id)
        return
      }

      const publicLink = yield loadPublicLinkTask.perform()
      if (loadPublicLinkTask.isError) {
        const e = loadPublicLinkTask.last.error
        console.error(e, e.resource)
        return
      }

      yield authService.resolvePublicLink(
        unref(token),
        unref(passwordRequired),
        unref(passwordRequired) ? unref(password) : '',
        unref(publicLinkType)
      )

      const url = queryItemAsString(unref(redirectUrl))
      if (url) {
        router.push({ path: url })
        return
      }

      let fileId: string
      const { resource, children } = yield clientService.webdav.listFiles(unref(publicLinkSpace), {
        path: unref(item)
      })
      if (children.length === 1) {
        // single shared file which means the actual resource is the first and only child element
        fileId = children[0].fileId
      } else {
        fileId = resource.fileId
      }

      if (publicLink.publicLinkPermission === SharePermissionBit.Create) {
        router.push({
          name: 'files-public-upload',
          params: { token: unref(token) },
          query: { ...(!!fileId && { fileId }) }
        })
        return
      }

      let scrollTo: string
      let path: string

      if (['folder', 'space'].includes(resource.type)) {
        fileId = resource.fileId
        path = unref(item)
      } else {
        fileId = resource.parentFolderId
        scrollTo = resource.fileId
        path = dirname(unref(item))
      }

      const driveAliasAndItem = urlJoin(unref(isOcmLink) ? `ocm/` : `public/`, unref(token), path)
      const targetLocation: RouteLocationNamedRaw = {
        name: 'files-public-link',
        query: {
          ...(configurationManager.options.openLinksWithDefaultApp && {
            openWithDefaultApp: 'true'
          }),
          ...(!!fileId && { fileId }),
          ...(!!scrollTo && { scrollTo }),
          ...(unref(details) && { details: unref(details) })
        },
        params: {
          driveAliasAndItem
        }
      }

      router.push(targetLocation)
    })

    const errorMessage = computed<string>(() => {
      if (resolvePublicLinkTask.isError && resolvePublicLinkTask.last.error.statusCode !== 401) {
        return resolvePublicLinkTask.last.error.message
      }
      if (loadTokenInfoTask.isError) {
        return loadTokenInfoTask.last.error.message
      }
      if (isPasswordRequiredTask.isError) {
        return isPasswordRequiredTask.last.error.message
      }
      return null
    })

    onMounted(async () => {
      if (unref(isOcmLink)) {
        await resolvePublicLinkTask.perform(false)
        return
      }

      tokenInfo.value = await loadTokenInfoTask.perform(unref(token))
      isPasswordRequired.value = await isPasswordRequiredTask.perform()
      if (!unref(isPasswordRequired)) {
        await resolvePublicLinkTask.perform(false)
      }
    })

    const footerSlogan = computed(() => currentTheme.value.common.slogan)
    const passwordFieldLabel = computed(() => {
      return $gettext('Enter password for public link')
    })
    const wrongPasswordMessage = computed(() => {
      if (unref(wrongPassword)) {
        return $gettext('Incorrect password')
      }
      return null
    })

    return {
      token,
      isPasswordRequired,
      password,
      wrongPassword,
      passwordFieldLabel,
      wrongPasswordMessage,
      errorMessage,
      footerSlogan,
      loadTokenInfoTask,
      resolvePublicLinkTask,
      isPasswordRequiredTask
    }
  }
})
</script>

<style lang="scss">
.oc-link-resolve {
  .oc-card {
    background: var(--oc-color-background-highlight);
    border-radius: 15px;
  }

  .oc-text-input-message {
    justify-content: center;
  }

  .oc-card-header h2,
  .oc-card-footer p {
    margin: 0;
  }
}
</style>
