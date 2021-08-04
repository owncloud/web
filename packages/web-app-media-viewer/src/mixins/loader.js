import { mapGetters, mapMutations } from 'vuex'
import queryString from 'query-string'
import { basename, dirname } from 'path'
import { buildResource } from '../../../web-app-files/src/helpers/resources' // TODO: place the helper in more global space not to create dep on files app

// TODO: this file is a first attempt to separate file/folder loading logic out of the mediaviewer
// Discussion how to progress from here can be found in this issue:
// https://github.com/owncloud/web/issues/3301

export default {
  computed: {
    ...mapGetters('Files', ['publicLinkPassword', 'davProperties']),
    ...mapGetters(['configuration']),
    $_loader_publicContext() {
      return this.$route.params.contextRouteName === 'files-public-list'
    },
    $_loader_folderLoading() {
      return this.$_internal_loader_folderLoading
    }
  },

  data() {
    return {
      $_internal_loader_folderLoading: true
    }
  },

  methods: {
    ...mapMutations('Files', ['CLEAR_CURRENT_FILES_LIST', 'LOAD_FILES', 'SET_CURRENT_FOLDER']),

    // This methods ensures the folder is loaded if we don't have a folder loaded currently
    async $_loader_loadItems(filePath) {
      if (this.$store.getters.activeFile.path !== '') {
        return
      }

      this.$_internal_loader_folderLoading = true

      this.CLEAR_CURRENT_FILES_LIST()

      try {
        const properties = this.davProperties.concat([
          this.$client.publicFiles.PUBLIC_LINK_ITEM_TYPE,
          this.$client.publicFiles.PUBLIC_LINK_PERMISSION,
          this.$client.publicFiles.PUBLIC_LINK_EXPIRATION,
          this.$client.publicFiles.PUBLIC_LINK_SHARE_DATETIME,
          this.$client.publicFiles.PUBLIC_LINK_SHARE_OWNER
        ])
        const absolutePath = filePath.substring(0, filePath.lastIndexOf('/'))
        const promise = this.$_loader_publicContext
          ? this.$client.publicFiles.list(absolutePath, this.publicLinkPassword, properties)
          : this.$client.files.list(absolutePath, 1, this.davProperties)
        let resources = await promise

        resources = resources.map(buildResource)
        this.LOAD_FILES({
          currentFolder: resources[0],
          files: resources.slice(1)
        })
      } catch (error) {
        this.SET_CURRENT_FOLDER(null)
        console.error(error)
      }

      this.$_internal_loader_folderLoading = false
    },

    $_loader_getDavFilePath(mediaFile, query = null) {
      const queryStr = !query ? '' : queryString.stringify(query)
      if (!this.$_loader_publicContext) {
        const path = ['..', 'dav', 'files', this.$store.getters.user.id, mediaFile.path].join('/')
        return [this.$client.files.getFileUrl(path), queryStr].filter(Boolean).join('?')
      }

      // If the mediaFile does not contain the downloadURL we fallback to the normal
      // public files path.
      if (!mediaFile.downloadURL) {
        const path = ['..', 'dav', 'public-files', mediaFile.path].join('/')
        return [this.$client.files.getFileUrl(path), queryStr].filter(Boolean).join('?')
      }

      // In a public context, i.e. public shares, the downloadURL contains a pre-signed url to
      // download the file.
      const [url, signedQuery] = mediaFile.downloadURL.split('?')

      // Since the pre-signed url contains query parameters and the caller of this method
      // can also provide query parameters we have to combine them.
      const combinedQuery = [queryStr, encodeURIComponent(signedQuery)].filter(Boolean).join('&')
      return [url, combinedQuery].filter(Boolean).join('?')
    },

    $_loader_headers() {
      if (!this.$_loader_publicContext) {
        return null
      }

      const headers = new Headers()
      headers.append('X-Requested-With', 'XMLHttpRequest')

      const password = this.publicLinkPassword
      if (password) {
        headers.append(
          'Authorization',
          'Basic ' + Buffer.from('public:' + password).toString('base64')
        )
      }
      return headers
    },

    $_loader_navigateToContextRoute(contextRouteName, filePath) {
      this.$router.push({
        name: contextRouteName,
        params: {
          item: dirname(filePath) || '/'
        },
        query: {
          scrollTo: basename(filePath)
        }
      })
    }
  }
}
