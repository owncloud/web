import { mapActions, mapGetters } from 'vuex'
import queryString from 'query-string'
import { basename, dirname } from 'path'

// TODO: this file is a first attempt to separate file/folder loading logic out of the mediaviewer
// Discussion how to progress from here can be found in this issue:
// https://github.com/owncloud/phoenix/issues/3301

export default {
  computed: {
    ...mapGetters('Files', ['publicLinkPassword']),
    $_loader_publicContext() {
      // TODO: Can we rely on not being "authenticated" while viewing a public link?
      // Currently it works. We cannot use publicPage() because that will still return
      // true when opening the mediaviewer from authenticated routes
      return !this.isAuthenticated
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
    ...mapActions('Files', ['loadFolder']),

    // This methods ensures the folder is loaded if we don't have a folder loaded currently
    $_loader_loadFolder(contextRouteName, filePath) {
      // FIXME: handle public-files with passwords and everything, until then we redirect to the main public link page
      if (this.$store.getters.activeFile.path === '' && contextRouteName === 'public-files') {
        const path = this.$route.params.filePath.substring(1)
        const token = path.substr(0, path.indexOf('/'))
        this.$nextTick(() => {
          this.$router.push({
            name: 'publicLink',
            params: {
              token
            }
          })
        })
        throw new Error('public-files')
      }

      // load files
      if (this.$store.getters.activeFile.path === '') {
        const absolutePath = filePath.substring(1, filePath.lastIndexOf('/'))

        return this.loadFolder({
          client: this.$client,
          absolutePath: absolutePath,
          $gettext: this.$gettext,
          routeName: contextRouteName,
          loadSharesTree: !this.publicPage()
        })
          .then(() => {
            this.$data.$_internal_loader_folderLoading = false
          })
          .catch(error => {
            // FIXME: Loading of public link folders doesn't work at all and is disabled hence, so this code should be unreachable

            // // password for public link shares is missing -> this is handled on the caller side
            // if (this.$_loader_publicContext && error.statusCode === 401) {
            //   this.$router.push({
            //     name: 'public-link',
            //     params: {
            //       token: this.$route.params.item
            //     }
            //   })
            //   return
            // }

            this.showMessage({
              title: this.$gettext('Loading folder failed…'),
              desc: error.message,
              status: 'danger',
              autoClose: {
                enabled: true
              }
            })
          })
      }

      // folder already loaded, nothing to do …
      this.$data.$_internal_loader_folderLoading = false
    },

    $_loader_getDavFilePath(filePath, query = null) {
      let path = ['..', 'dav', 'public-files', filePath].join('/')

      if (!this.$_loader_publicContext) {
        path = ['..', 'dav', 'files', this.$store.getters.user.id, filePath].join('/')
      }

      const queryStr = !query ? '' : '?' + queryString.stringify(query)
      return this.$client.files.getFileUrl(path) + queryStr
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
