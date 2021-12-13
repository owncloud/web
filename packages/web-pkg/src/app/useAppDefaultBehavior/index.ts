import { ref, computed, ComputedRef, unref, Ref } from '@vue/composition-api'
import { useRouter } from '../../../../web-app-files/src/composables/router/useRouter'
import { useStore } from '../../../../web-app-files/src/composables/store/useStore'
import { basename, dirname } from 'path'
import { FileContext } from './types'
import { buildResource } from '../../../../web-app-files/src/helpers/resources'
import { DavProperties } from 'web-pkg/src/constants'
import queryString from 'query-string'
import { MaybeRef } from 'web-pkg/src/utils'
import { useClient } from './useClient'


// TODO: this file contains file/folder loading logic extracted from mediaviewer and drawio extensions
// Discussion how to progress from here can be found in this issue:
// https://github.com/owncloud/web/issues/3301


interface LoadingOptions<T> {
  appName: string
}

interface LoadingResult<T> {
  isPublicContext: Ref<boolean>
  closeApp: Function
  isFolderLoading: Ref<boolean>
  loadFolderForFileContext: Function
  currentFileContext: Ref<FileContext>
  getUrlForResource: Function
  appConfig: ComputedRef<any>
  getFileInfo: Function
  putFileContents: Function
  getFileContents: Function
  activeFiles: ComputedRef<any> // Resource
}

interface Resource {
  path: string
  downloadURL?: string
}

export function useAppDefaultBehavior<T>(options: LoadingOptions<T>): LoadingResult<T> {
  const router = useRouter()
  const store = useStore()
  const client = useClient()

  const currentRoute = computed(() => {
    return router.currentRoute
  })

  const isPublicContext = computed(() => {
    return unref(currentRoute).params.contextRouteName === 'files-public-files'
  })

  const publicLinkPassword = computed(() => {
    if(!store.getters.Files) {
      return null
    }

    return store.getters['Files/publicLinkPassword']
  })

  const activeFiles = computed(() => {
    return store.getters['Files/activeFiles']
  })

  const currentFileContext = computed((): FileContext => {
    return {
      routeName: unref(currentRoute).params.contextRouteName,
      path: `/${unref(currentRoute).params.filePath.split('/').filter(Boolean).join('/')}`
    }
  })

  // file loading
  const getUrlForResource = ({ path, downloadURL} : Resource, query = null) => {
    const queryStr = !query ? '' : queryString.stringify(query)
    if (!unref(isPublicContext)) {
      const urlPath = [
        '..',
        'dav',
        'files',
        store.getters.user.id,
        path.replace(/^\//, '')
      ].join('/')
      return [client.files.getFileUrl(urlPath), queryStr].filter(Boolean).join('?')
    }

    // If the mediaFile does not contain the downloadURL we fallback to the normal
    // public files path.
    if (!downloadURL) {
      const urlPath = ['..', 'dav', 'public-files', path].join('/')
      return [client.files.getFileUrl(urlPath), queryStr].filter(Boolean).join('?')
    }

    // In a public context, i.e. public shares, the downloadURL contains a pre-signed url to
    // download the file.
    const [url, signedQuery] = downloadURL.split('?')

    // Since the pre-signed url contains query parameters and the caller of this method
    // can also provide query parameters we have to combine them.
    const combinedQuery = [queryStr, encodeURIComponent(signedQuery)].filter(Boolean).join('&')
    return [url, combinedQuery].filter(Boolean).join('?')
  }

  const getFileInfo = async (filePath, davProperties) => {
    if (unref(isPublicContext)) {
      const fileInfo = await client.publicFiles.getFileInfo(
        filePath,
        unref(publicLinkPassword),
        davProperties
      )
      return fileInfo
    }
    return client.files.fileInfo(filePath, davProperties)
  }

  const putFileContents = (filePath, content, options) => {
    if (unref(isPublicContext)) {
      return client.publicFiles.putFileContents(
        '',
        filePath,
        unref(publicLinkPassword),
        content,
        options
      )
    } else {
      return client.files.putFileContents(filePath, content, options)
    }
  }

  const getFileContents = async (filePath) => {
    if (unref(isPublicContext)) {
      const res = await client.publicFiles.download('', filePath, unref(publicLinkPassword))
      res.statusCode = res.status
      return {
        response: res,
        body: await res.text(),
        headers: {
          ETag: res.headers.get('etag'),
          'OC-FileId': res.headers.get('oc-fileid')
        }
      }
    } else {
      return client.files.getFileContents(filePath, {
        resolveWithResponseObject: true
      })
    }
  }

  // folder loading
  const isFolderLoading = ref(false)
  const loadFolder = async (absoluteDirPath: string) => {
    if (store.getters.activeFile.path !== '') {
      return
    }

    isFolderLoading.value = true
    store.commit('Files/CLEAR_CURRENT_FILES_LIST', null)
    try {
      const promise = unref(isPublicContext)
        ? client.publicFiles.list(
          absoluteDirPath,
            unref(publicLinkPassword),
            DavProperties.PublicLink
          )
        : client.files.list(absoluteDirPath, 1, DavProperties.Default)
      let resources = await promise

      resources = resources.map(buildResource)
      store.commit('Files/LOAD_FILES', {
        currentFolder: resources[0],
        files: resources.slice(1)
      })
    } catch (error) {
      store.commit('Files/SET_CURRENT_FOLDER', null)
      console.error(error)
    }
    isFolderLoading.value = false
  }
  const loadFolderForFileContext = async (context: MaybeRef<FileContext>) => {
    const { path } = unref(context)
    const absoluteDirPath = dirname(unref(path))
    return loadFolder(absoluteDirPath)
  }

  // app config
  const appConfig = computed(() => {
    return store.state.apps.fileEditors.find((editor) => editor.app === options.appName).config || {}
  })

  // routing
  const navigateToContext = (context: MaybeRef<FileContext>) => {
    const { path, routeName} = unref(context)
    return router.push({
      name: unref(routeName),
      params: {
        item: dirname(unref(path)) || '/'
      },
      query: {
        scrollTo: basename(unref(path))
      }
    })
  }
  const closeApp = () => {
    return navigateToContext(currentFileContext)
  }

  return {
    isPublicContext,
    currentFileContext,
    getUrlForResource,
    isFolderLoading,
    loadFolderForFileContext,
    activeFiles,
    closeApp,
    appConfig,

    getFileInfo,
    putFileContents,
    getFileContents
  }
}
