import { Store } from 'vuex'
import { supportedLogoMimeTypes } from '../../../defaults'
import { computed, VNodeRef, unref } from 'vue'
import { Action } from 'web-pkg/src/composables/actions'
import { useAbility, useClientService, useRouter, useStore } from 'web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'

export const useGeneralActionsUploadLogo = ({
  store,
  imageInput
}: {
  store?: Store<any>
  imageInput: VNodeRef
}) => {
  store = store || useStore()
  const { $gettext } = useGettext()
  const ability = useAbility()
  const clientService = useClientService()
  const router = useRouter()

  const uploadImage = async (ev: InputEvent) => {
    const file = (ev.currentTarget as HTMLInputElement).files[0]

    if (!file) {
      return
    }

    if (!supportedLogoMimeTypes.includes(file.type)) {
      return store.dispatch('showMessage', {
        title: $gettext('The file type is unsupported'),
        status: 'danger'
      })
    }

    try {
      const httpClient = clientService.httpAuthenticated
      const formData = new FormData()
      formData.append('logo', file)
      await httpClient.post('/branding/logo', formData as never, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      store.dispatch('showMessage', {
        title: $gettext('Logo was uploaded successfully')
      })
      setTimeout(() => {
        router.go(0)
      }, 1000)
    } catch (e) {
      console.error(e)
      store.dispatch('showMessage', {
        title: $gettext('Failed to upload logo'),
        status: 'danger'
      })
    }
  }

  const actions = computed((): Action[] => [
    {
      name: 'upload-logo',
      icon: 'image-add',
      label: () => {
        return $gettext('Upload logo')
      },
      isEnabled: () => {
        return ability.can('update-all', 'Logo')
      },
      handler: () => {
        unref(imageInput).click()
      },
      componentType: 'button',
      class: 'oc-general-actions-upload-logo-trigger'
    }
  ])

  return {
    actions,
    uploadImage
  }
}
