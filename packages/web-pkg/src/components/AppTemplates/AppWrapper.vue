<template>
  <main :id="applicationId" class="oc-height-1-1" @keydown.esc="closeAppAction">
    <app-top-bar v-if="!loading && !loadingError" :resource="resource" @close="closeAppAction">
      {{ slotAttrs.isDirty }}
    </app-top-bar>
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <div v-else class="oc-height-1-1">
      <slot v-bind="slotAttrs" />
    </div>
  </main>
</template>

<script lang="ts">
import { PropType, Ref, defineComponent, onBeforeUnmount, ref, unref, watch, computed } from 'vue'
import { useTask } from 'vue-concurrency'
import { useGettext } from 'vue3-gettext'
import { onBeforeRouteLeave } from 'vue-router'

import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import ErrorScreen from 'web-pkg/src/components/AppTemplates/PartialViews/ErrorScreen.vue'
import LoadingScreen from 'web-pkg/src/components/AppTemplates/PartialViews/LoadingScreen.vue'
import { UrlForResourceOptions, useAppDefaults, useStore } from 'web-pkg/src/composables'
import { Resource } from 'web-client'
import { DavPermission, DavProperty } from 'web-client/src/webdav/constants'
import { AppConfigObject } from 'web-pkg/src/apps/types'

export interface AppWrapperSlotArgs {
  applicationConfig: AppConfigObject
  resource: Resource
  currentContent: Ref<string>
  isDirty: boolean
  isReadOnly: boolean
  url: string
}

export default defineComponent({
  name: 'AppWrapper',
  components: {
    AppTopBar,
    ErrorScreen,
    LoadingScreen
  },
  props: {
    // TODO: Add app-top-bar-actions array prop and pass to AppTopBar
    applicationId: {
      type: String,
      required: true
    },
    urlForResourceOptions: {
      type: Object as PropType<UrlForResourceOptions>,
      default: () => null,
      required: false
    }
  },
  setup(props) {
    const { $gettext } = useGettext()
    const store = useStore()

    const resource: Ref<Resource> = ref()
    const currentETag = ref('')
    const url = ref('')
    const loading = ref(true)
    const loadingError = ref(false)
    const isReadOnly = ref(false)
    const serverContent = ref()
    const currentContent = ref()
    const isDirty = computed(() => {
      return unref(currentContent) !== unref(serverContent)
    })

    const {
      currentFileContext,
      getFileContents,
      getFileInfo,
      getUrlForResource,
      closeApp,
      revokeUrl,
      replaceInvalidFileRoute
    } = useAppDefaults({
      applicationId: props.applicationId
    })

    const loadFileTask = useTask(function* () {
      try {
        const tmpResource = yield getFileInfo(currentFileContext, {
          davProperties: [DavProperty.FileId, DavProperty.Permissions, DavProperty.Name]
        })

        replaceInvalidFileRoute(currentFileContext, tmpResource)
        isReadOnly.value = ![DavPermission.Updateable, DavPermission.FileUpdateable].some(
          (p) => (tmpResource.permissions || '').indexOf(p) > -1
        )

        const fileContentsResponse = yield getFileContents(currentFileContext)
        serverContent.value = currentContent.value = fileContentsResponse.body
        currentETag.value = fileContentsResponse.headers['OC-ETag']

        const currentSpace = unref(unref(currentFileContext).space)
        const tmpUrl = yield getUrlForResource(
          currentSpace,
          tmpResource,
          props.urlForResourceOptions
        )

        // update both at once
        resource.value = tmpResource
        url.value = tmpUrl
        console.log('resource', resource.value.id, 'url', url.value)
      } catch (e) {
        console.error(e)
        loadingError.value = true
      } finally {
        loading.value = false
      }
    }).restartable()

    watch(
      currentFileContext,
      () => {
        loadFileTask.perform()
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      revokeUrl(url.value)
    })

    const renderCloseModal = (onConfirm) => {
      const modal = {
        variation: 'danger',
        icon: 'warning',
        title: $gettext('Unsaved changes'),
        message: $gettext('Your changes were not saved. Do you want to save them?'),
        cancelText: $gettext("Don't Save"),
        confirmText: $gettext('Save'),
        onCancel: () => store.dispatch('hideModal'),
        onConfirm
      }

      store.dispatch('createModal', modal)
    }

    const closeAppAction = () => {
      if (unref(isDirty)) {
        renderCloseModal(closeApp())
      } else {
        closeApp()
      }
    }

    onBeforeRouteLeave((_to, _from, next) => {
      if (unref(isDirty)) {
        renderCloseModal(() => {
          // await this.save()
          store.dispatch('hideModal')
          next()
        })
      } else {
        next()
      }
    })

    const slotAttrs = computed(() => ({
      // these need to be unref'ed
      url: unref(url),
      resource: unref(resource),
      isDirty: unref(isDirty),
      isReadOnly: unref(isReadOnly),
      applicationConfig: {},

      // this must not be unref'ed, we are passing a Ref so it can be updated
      currentContent
    }))

    return {
      closeAppAction,
      loading,
      loadingError,
      resource,
      slotAttrs
    }
  }
})
</script>
