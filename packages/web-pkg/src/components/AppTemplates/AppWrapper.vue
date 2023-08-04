<template>
  <main :id="applicationId" class="oc-height-1-1" @keydown.esc="closeAppAction">
    <app-top-bar
      v-if="!loading && !loadingError"
      :main-actions="fileActions"
      :resource="resource"
      @close="closeAppAction"
    >
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
import { Action, ActionOptions } from 'web-pkg/src/composables/actions'
import { isProjectSpaceResource } from 'web-client/src/helpers'

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
    const { $gettext, interpolate: $gettextInterpolate } = useGettext()
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
      putFileContents,
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

    const errorPopup = (error) => {
      store.dispatch('showErrorMessage', {
        title: $gettext('An error occurred'),
        desc: error,
        error
      })
    }

    const autosavePopup = () => {
      store.dispatch('showMessage', {
        title: $gettext('File autosaved')
      })
    }

    const saveFileTask = useTask(function* () {
      const newContent = unref(currentContent)
      try {
        const putFileContentsResponse = yield putFileContents(currentFileContext, {
          content: newContent,
          previousEntityTag: unref(currentETag)
        })
        serverContent.value = newContent
        currentETag.value = putFileContentsResponse.etag
      } catch (e) {
        switch (e.statusCode) {
          case 412:
            errorPopup(
              $gettext(
                'This file was updated outside this window. Please refresh the page (all changes will be lost).'
              )
            )
            break
          case 500:
            errorPopup($gettext('Error when contacting the server'))
            break
          case 507:
            const space = store.getters['runtime/spaces/spaces'].find(
              (space) => space.id === unref(resource).storageId && isProjectSpaceResource(space)
            )
            if (space) {
              errorPopup(
                $gettextInterpolate(
                  $gettext('There is not enough quota on "%{spaceName}" to save this file'),
                  { spaceName: space.name }
                )
              )
              break
            }
            errorPopup($gettext('There is not enough quota to save this file'))
            break
          case 401:
            errorPopup($gettext("You're not authorized to save this file"))
            break
          default:
            errorPopup(e.message || e)
        }
      }
    }).restartable()

    const save = async function () {
      await saveFileTask.perform()
    }

    const handleSKey = function (e) {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault()
        save()
      }
    }

    const handleUnload = function (e) {
      if (unref(isDirty)) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    const fileActions: Action<ActionOptions>[] = [
      {
        name: 'save-file',
        disabledTooltip: () => '',
        isEnabled: () => true,
        isDisabled: () => isReadOnly.value || !isDirty.value,
        componentType: 'button',
        icon: 'save',
        id: 'text-editor-controls-save',
        label: () => 'Save',
        handler: () => {
          save()
        }
      }
    ]

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
        renderCloseModal(async () => {
          await save()
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
      fileActions,
      loading,
      loadingError,
      resource,
      slotAttrs
    }
  }
})
</script>
