import moment from 'moment'
import { bitmaskToRole, permissionsBitmask } from '../helpers/collaborators'

// TODO so many thing are similar.. we prob don't need these functions to change the object and
// instead we could reuse what we get from oc-sdk
function _buildFile (file) {
  return ({
    type: file.isDir ? 'folder' : file.type,
    id: file.id,
    starred: file.isStarred,
    mdate: file.lastModified,
    size: file.size,
    extension: file.extension,
    name: file.name,
    basename: file.baseName,
    path: file.fullPath,
    permissions: file.permissions,
    etag: file.eTag,
    // TODO is this part of a normal file?
    // sharePermissions: file.fileInfo['{http://open-collaboration-services.org/ns}share-permissions'],
    // privateLink: file.fileInfo['{http://owncloud.org/ns}privatelink'],
    owner: {
      username: file.owner.uid,
      displayName: file.owner.name
    },
    canUpload: function () {
      return this.permissions.canUpload
    },
    canDownload: function () {
      return this.permissions.canDownload
    },
    canBeDeleted: function () {
      return this.permissions.canBeDeleted
    },
    canRename: function () {
      return this.permissions.canRename
    },
    canShare: function () {
      return this.permissions.canShare
    },
    isMounted: function () {
      return this.permissions.isMounted
    }
  })
}

function _buildFileInTrashbin (file) {
  return ({
    type: file.isDir ? 'folder' : file.type,
    deleteTimestamp: file.deletionTimestamp,
    extension: file.extension,
    basename: (function () {
      const name = file.name
      if (file.extension) {
        return name.substring(0, name.length - file.extension.length - 1)
      }
      return name
    })(),
    name: file.name,
    originalLocation: file.originalLocation,
    id: file.name
  })
}

function _buildSharedFile (share) {
  return {
    id: share.getFile().getItemSource(),
    shareId: share.id,
    type: share.file.type,
    extension: share.file.extension,
    name: share.file.name,
    basename: (function () {
      const name = share.file.name
      if (share.file.extension) {
        return name.substring(0, name.length - share.file.extension.length - 1)
      }
      return name
    }()),
    path: share.file.fullPath,
    shareTime: share.shareTime * 1000,
    owner: share.file.owner.uid,
    ownerDisplayname: share.file.owner.name,
    shareOwner: share.sharer.uid,
    shareOwnerDisplayname: share.sharer.name,
    sharedWith: share.sharedWith,
    shareType: share.type,
    status: share.status,
    canUpload: function () {
      // TODO: Find a way how to read permissions for file and not for share
      // return file.permissions >= 4
      return true
    },
    canDownload: function () {
      return share.file.type !== 'folder'
    },
    canBeDeleted: function () {
      // return file.permissions >= 8
      return true
    },
    canRename: function () {
      // return file.permissions >= 2
      return true
    },
    canShare: function () {
      // return file.permissions >= 16
      return true
    },
    isMounted: function () {
      return false
    }
  }
}

function _buildLink (l, $gettext) {
  const link = l.shareInfo
  let description = ''

  // FIXME: use bitmask matching with constants
  switch (link.permissions) {
    case ('1'): // read (1)
      description = $gettext('Viewer')
      break
    case ('5'): // read (1) + create (4)
      description = $gettext('Contributor')
      break
    case ('4'): // create (4)
      description = $gettext('Uploader')
      break
    case ('15'): // read (1) + update (2) + create (4) + delete (8)
      description = $gettext('Editor')
      break
  }

  return {
    id: link.id,
    token: link.token,
    url: link.url,
    path: link.path,
    permissions: link.permissions,
    description,
    stime: link.stime,
    name: link.name,
    password: !!(link.share_with && link.share_with_displayname),
    expiration: (typeof link.expiration === 'string') ? moment(link.expiration).format('YYYY-MM-DD') : null,
    itemSource: link.item_source,
    file: {
      parent: link.file_parent,
      source: link.file_source,
      target: link.file_target
    }
  }
}

function _buildShare (s, file) {
  const share = {
    info: s
  }
  switch (s.share_type) {
    case ('0'): // user share
    // TODO differentiate groups from users?
    // fall through
    case ('6'):
    // fall through
    case ('1'): // group share
      share.role = bitmaskToRole(s.permissions, file.type === 'folder')
      share.permissions = s.permissions
      share.avatar = 'https://picsum.photos/64/64?image=1075' // TODO where do we get the avatar from? by uid? remote.php/dav/avatars/admin/128.png
      share.name = s.share_with // this is the recipient userid, rename to uid or subject? add separate field userName?
      share.displayName = s.share_with_displayname
      // TODO: Refactor to work with roles / prepare for roles API
      share.customPermissions = {
        update: s.permissions & permissionsBitmask.update,
        create: s.permissions & permissionsBitmask.create,
        delete: s.permissions & permissionsBitmask.delete,
        share: s.permissions & permissionsBitmask.share
      }
      // share.email = 'foo@djungle.com' // hm, where do we get the mail from? share_with_additional_info:Object?
      break
  }

  // expiration:Object if unset, or string "2019-04-24 00:00:00"
  if (typeof s.expiration === 'string' || s.expiration instanceof String) {
    share.expires = Date.parse(s.expiration)
  }

  return share
}

export default {
  loadFolder (context, { client, absolutePath, $gettext, routeName }) {
    context.commit('UPDATE_FOLDER_LOADING', true)

    return new Promise((resolve, reject) => {
      let promise
      const favorite = routeName === 'files-favorites'
      const publicFiles = routeName === 'public-files'

      if (favorite) {
        promise = client.files.getFavoriteFiles()
      } else if (publicFiles) {
        const password = context.getters.publicLinkPassword
        promise = client.publicFiles.listExtended(absolutePath, password)
      } else {
        promise = client.files.list(absolutePath, 1)
      }
      promise.then(res => {
        if (res === null) {
          context.dispatch('showMessage', {
            title: $gettext('Loading folder failed4…'),
            status: 'danger'
          }, { root: true })
        } else {
          if (favorite) {
            client.files.fileInfo('').then(rootFolder => {
              rootFolder.fileInfo['{http://owncloud.org/ns}permissions'] = 'R'
              context.dispatch('loadFiles', {
                currentFolder: rootFolder,
                files: res
              })
            })
          } else {
            context.dispatch('loadFiles', {
              currentFolder: res[0],
              files: res.splice(1)
            })
          }
        }
        context.dispatch('resetFileSelection')
        context.dispatch('setHighlightedFile', null)
        if (context.getters.searchTerm !== '') {
          context.dispatch('resetSearch')
        }
      }).catch(error => {
        reject(error)
      }).finally(() => {
        context.commit('UPDATE_FOLDER_LOADING', false)
        client.users.getUser(context.rootGetters.user.id).then(res => {
          context.commit('CHECK_QUOTA', res.quota)
          resolve()
        })
      })
    })
  },
  loadTrashbin (context, { client, $gettext }) {
    context.commit('UPDATE_FOLDER_LOADING', true)

    client.fileTrash.list('', '1').then(res => {
      if (res === null) {
        context.dispatch('showMessage', {
          title: $gettext('Loading trash bin failed…'),
          status: 'danger'
        }, { root: true })
      } else {
        context.dispatch('loadDeletedFiles', {
          currentFolder: res[0],
          files: res.splice(1)
        })
      }
      context.dispatch('resetFileSelection')
      context.dispatch('setHighlightedFile', null)
    }).catch((e) => {
      context.dispatch('showMessage', {
        title: $gettext('Loading trash bin failed…'),
        desc: e.message,
        status: 'danger'
      }, { root: true })
    }).finally(() => {
      context.commit('UPDATE_FOLDER_LOADING', false)
    })
  },
  loadFolderSharedFromMe (context, { client, $gettext }) {
    context.commit('UPDATE_FOLDER_LOADING', true)

    // TODO: Move request to owncloud-sdk
    client.requests.ocs({
      service: 'apps/files_sharing',
      action: '/api/v1/shares?format=json&include_tags=true',
      method: 'GET'
    }).then(res => {
      res.json().then(json => {
        if (json.ocs.data.length < 1) {
          context.commit('UPDATE_FOLDER_LOADING', false)
          return
        }

        const files = json.ocs.data
        const uniqueFiles = Array.from(new Set(files.map(file => file.item_source))).map(id => {
          return files.find(file => file.item_source === id)
        })
        context.dispatch('buildFilesSharedFromMe', uniqueFiles)
      })
    }).catch((e) => {
      context.dispatch('showMessage', {
        title: $gettext('Loading shared files failed…'),
        desc: e.message,
        status: 'danger'
      }, { root: true })
    }).finally(() => {
      context.commit('UPDATE_FOLDER_LOADING', false)
    })
  },
  loadFolderSharedWithMe (context, { client, $gettext }) {
    context.commit('UPDATE_FOLDER_LOADING', true)

    // TODO: Move request to owncloud-sdk
    // TODO: Load remote shares as well
    client.requests.ocs({
      service: 'apps/files_sharing',
      action: '/api/v1/shares?format=json&shared_with_me=true&state=all&include_tags=true',
      method: 'GET'
    }).then(res => {
      res.json().then(json => {
        if (json.ocs.data.length < 1) {
          context.commit('UPDATE_FOLDER_LOADING', false)
          return
        }
        const files = json.ocs.data
        const uniqueFiles = Array.from(new Set(files.map(file => file.id))).map(id => {
          return files.find(file => file.id === id)
        })
        context.dispatch('buildFilesSharedFromMe', uniqueFiles)
      })
    }).catch((e) => {
      context.dispatch('showMessage', {
        title: $gettext('Loading shared files failed…'),
        desc: e.message,
        status: 'danger'
      }, { root: true })
    }).finally(() => {
      context.commit('UPDATE_FOLDER_LOADING', false)
    })
  },
  updateFileProgress ({ commit, getters }, progress) {
    commit('UPDATE_FILE_PROGRESS', progress)
  },
  addFileToProgress ({ commit }, file) {
    commit('ADD_FILE_TO_PROGRESS', file)
  },

  removeFileFromProgress ({ commit }, file) {
    commit('REMOVE_FILE_FROM_PROGRESS', file)
  },

  loadFiles (context, { currentFolder, files }) {
    currentFolder = _buildFile(currentFolder)
    files = files.map(_buildFile)
    context.commit('LOAD_FILES', { currentFolder, files })
  },
  loadDeletedFiles (context, { currentFolder, files }) {
    currentFolder = _buildFile(currentFolder)
    files = files.map(_buildFileInTrashbin)
    context.commit('LOAD_FILES', { currentFolder, files })
  },
  buildFilesSharedFromMe (context, files) {
    const currentFolder = _buildSharedFile(files[0])
    files = files.map(_buildSharedFile)
    context.commit('LOAD_FILES', { currentFolder, files })
  },
  addFileSelection (context, file) {
    context.commit('ADD_FILE_SELECTION', file)
  },
  removeFileSelection (context, file) {
    context.commit('REMOVE_FILE_SELECTION', file)
  },
  toggleFileSelection (context, file) {
    if (context.state.selected.includes(file)) {
      context.commit('REMOVE_FILE_SELECTION', file)
    } else {
      context.commit('ADD_FILE_SELECTION', file)
    }
  },
  resetFileSelection (context) {
    context.commit('RESET_SELECTION')
  },
  markFavorite (context, payload) {
    const file = payload.file
    const client = payload.client
    const newValue = !file.starred
    client.files.favorite(file.path, newValue)
      .then(() => {
        context.commit('FAVORITE_FILE', file)
      })
      .catch(error => {
        console.log(error)
      })
  },
  addFiles (context, payload) {
    const files = payload.files
    for (const file of files) {
      context.commit('ADD_FILE', _buildFile(file))
    }
  },
  deleteFiles (context, { files, client, publicPage, $gettext, $gettextInterpolate }) {
    const promises = []
    for (const file of files) {
      let p = null
      if (publicPage) {
        p = client.publicFiles.delete(file.path, null, context.getters.publicLinkPassword)
      } else {
        p = client.files.delete(file.path)
      }
      const promise = p.then(() => {
        context.commit('REMOVE_FILE', file)
        context.commit('REMOVE_FILE_SELECTION', file)
      }).catch(error => {
        let translated = $gettext('Error while deleting "%{file}"')
        if (error.statusCode === 423) {
          translated = $gettext('Error while deleting "%{file}" - the file is locked')
        }
        const title = $gettextInterpolate(translated, { file: file.name }, true)
        context.dispatch('showMessage', {
          title: title,
          status: 'danger'
        }, { root: true })
      })
      promises.push(promise)
    }
    return Promise.all(promises)
  },
  removeFilesFromTrashbin (context, files) {
    for (const file of files) {
      context.commit('REMOVE_FILE', file)
    }
  },
  renameFile (context, { file, newValue, client, publicPage }) {
    if (file !== undefined && newValue !== undefined && newValue !== file.name) {
      const newPath = file.path.substr(1, file.path.lastIndexOf('/'))
      if (publicPage) {
        return client.publicFiles.move(file.path, (newPath + newValue), context.getters.publicLinkPassword).then(() => {
          context.commit('RENAME_FILE', { file, newValue, newPath })
        })
      }
      return client.files.move(file.path, (newPath + newValue)).then(() => {
        context.commit('RENAME_FILE', { file, newValue, newPath })
      })
    }
  },
  setFilterTerm (context, filterTerm) {
    context.commit('SET_FILTER_TERM', filterTerm)
  },
  setFileFilter (context, filter) {
    context.commit('SET_FILE_FILTER', filter)
  },
  searchForFile (context, payload) {
    return new Promise(function (resolve, reject) {
      const client = payload.client
      const searchTerm = payload.searchTerm
      context.commit('SET_SEARCH_TERM', searchTerm)
      // TODO respect user selected listSize from state.config
      // do not search for empty strings
      if (!searchTerm) return
      client.files.search(searchTerm, null).then((filesSearched) => {
        filesSearched = filesSearched.map((f) => {
          return _buildFile(f)
        })
        context.commit('LOAD_FILES_SEARCHED', filesSearched)
        resolve(filesSearched)
      }).catch((error) => {
        // TODO notification missing
        context.dispatch('showMessage', {
          title: this.$gettext('Error while searching.'),
          desc: error.message,
          status: 'danger'
        }, { root: true })
        reject(error)
      })
    })
  },
  loadShares (context, payload) {
    context.commit('SHARES_LOAD', [])
    context.commit('SHARES_ERROR', null)
    context.commit('SHARES_LOADING', true)

    // see https://owncloud.github.io/js-owncloud-client/Shares.html
    const client = payload.client
    const path = payload.path
    client.shares.getShares(path, { reshares: true })
      .then(data => {
        context.commit('SHARES_LOAD', data.map(element => {
          return _buildShare(element.shareInfo, context.getters.highlightedFile)
        }))
        context.commit('SHARES_LOADING', false)
      })
      .catch(error => {
        context.commit('SHARES_ERROR', error.message)
        context.commit('SHARES_LOADING', false)
      })
  },
  sharesClearState (context, payload) {
    context.commit('SHARES_LOAD', [])
    context.commit('SHARES_ERROR', null)
  },
  changeShare ({ commit, getters }, { client, share, role, permissions }) {
    commit('TOGGLE_COLLABORATOR_SAVING', true)

    const params = {
      permissions: permissions
    }

    if (!params.permissions) {
      return new Promise((resolve, reject) => {
        reject(new Error('Nothing changed'))
      })
    }

    client.shares.updateShare(share.info.id, params)
      .then((updatedShare) => {
        commit('SHARES_UPDATE_SHARE', _buildShare(updatedShare.shareInfo, getters.highlightedFile))
        commit('TOGGLE_COLLABORATOR_SAVING', false)
      })
      .catch(e => {
        commit('TOGGLE_COLLABORATOR_SAVING', false)
        console.log(e)
      })
  },
  addShare (context, { client, path, $gettext, shareWith, shareType, permissions }) {
    context.commit('SHARES_LOADING', true)

    if (shareType === 1) {
      client.shares.shareFileWithGroup(path, shareWith, { permissions: permissions })
        .then(share => {
          context.commit('SHARES_ADD_SHARE', _buildShare(share.shareInfo, context.getters.highlightedFile))
          context.commit('SHARES_LOADING', false)
        })
        .catch(e => {
          context.dispatch('showMessage', {
            title: $gettext('Error while sharing.'),
            desc: e,
            status: 'danger'
          }, { root: true })
          context.commit('SHARES_LOADING', false)
        })
      return
    }

    let remoteShare

    if (shareType === 6) {
      remoteShare = true
    } else {
      remoteShare = false
    }

    client.shares.shareFileWithUser(path, shareWith, { permissions: permissions, remoteUser: remoteShare })
      .then(share => {
        context.commit('SHARES_ADD_SHARE', _buildShare(share.shareInfo, context.getters.highlightedFile))
        context.commit('SHARES_LOADING', false)
      })
      .catch(e => {
        context.dispatch('showMessage', {
          title: $gettext('Error while sharing.'),
          desc: e,
          status: 'danger'
        }, { root: true })
        context.commit('SHARES_LOADING', false)
      })
  },
  deleteShare (context, { client, share }) {
    client.shares.deleteShare(share.info.id)
      .then(() => {
        context.commit('SHARES_REMOVE_SHARE', share)
      })
      .catch(e => {
        console.log(e)
      })
  },
  resetSearch (context) {
    context.commit('SET_SEARCH_TERM', '')
  },
  dragOver (context, value) {
    context.commit('DRAG_OVER', value)
  },
  setTrashbinDeleteMessage (context, message) {
    context.commit('SET_TRASHBIN_DELETE_CONFIRMATION', message)
  },
  promptFileRename (context, item) {
    context.commit('PROMPT_FILE_RENAME', item)
  },
  closePromptFileRename (context) {
    context.commit('CLOSE_PROMPT_FILE_RENAME')
  },
  promptFileDelete (context, { message, items }) {
    context.commit('PROMPT_FILE_DELETE', { message, items })
  },
  closePromptFileDelete (context) {
    context.commit('CLOSE_PROMPT_FILE_DELETE')
  },
  setOverwriteDialogTitle (context, title) {
    context.commit('SET_OVERWRITE_DIALOG_TITLE', title)
  },
  setOverwriteDialogMessage (context, message) {
    context.commit('SET_OVERWRITE_DIALOG_MESSAGE', message)
  },
  setHighlightedFile (context, file) {
    context.commit('SET_HIGHLIGHTED_FILE', file)
  },
  toggleCollaboratorSaving (context, saving) {
    context.commit('TOGGLE_COLLABORATOR_SAVING', saving)
  },
  setPublicLinkPassword (context, password) {
    context.commit('SET_PUBLIC_LINK_PASSWORD', password)
  },
  toggleCollaboratorsEdit (context, inProgress) {
    context.commit('TOGGLE_COLLABORATORS_EDIT', inProgress)
  },
  loadLinks (context, { client, path, $gettext }) {
    context.commit('LINKS_PURGE')
    context.commit('LINKS_ERROR', null)
    context.commit('LINKS_LOADING', true)

    client.shares.getShares(path, {})
      .then(data => {
        data.forEach(share => {
          if (share.shareInfo.share_type === '3') {
            context.commit('LINKS_ADD', _buildLink(share, $gettext))
          }
        })
      })
      .catch(e => context.commit('LINKS_ERROR', e.message))
      .finally(() => context.commit('LINKS_LOADING', false))
  },

  purgeLinks (context) {
    context.commit('LINKS_PURGE')
  },

  addLink (context, { path, client, $gettext, params }) {
    return new Promise((resolve, reject) => {
      context.commit('LINKS_LOADING', true)
      client.shares.shareFileWithLink(path, params)
        .then(data => {
          const link = _buildLink(data, $gettext)
          context.commit('LINKS_ADD', link)
          context.commit('LINKS_LOADING', false)
          resolve(link)
        })
        .catch(e => {
          context.commit('LINKS_LOADING', false)
          reject(e)
        })
    })
  },
  updateLink (context, { id, client, $gettext, params }) {
    return new Promise((resolve, reject) => {
      context.commit('LINKS_LOADING', true)
      client.shares.updateShare(id, params)
        .then(data => {
          const link = _buildLink(data, $gettext)
          context.commit('LINKS_UPDATE', link)
          context.commit('LINKS_LOADING', false)
          resolve(link)
        })
        .catch(e => {
          context.commit('LINKS_LOADING', false)
          reject(e)
        })
    })
  },
  removeLink (context, { id, client }) {
    context.commit('LINKS_LOADING', true)
    client.shares.deleteShare(id)
      .then(() => {
        context.commit('LINKS_REMOVE', id)
        context.commit('LINKS_LOADING', false)
      })
      .catch(e => context.commit('LINKS_ERROR', e.message))
      .finally(() => context.commit('LINKS_LOADING', false))
  },

  // TODO: Think of a better name
  pendingShare (context, { client, item, type, translate }) {
    // TODO: Move request to owncloud-sdk
    client.requests.ocs({
      service: 'apps/files_sharing',
      action: `/api/v1/shares/pending/${item.shareId}`,
      method: type
    })
      .then(_ => {
        context.dispatch('loadFolderSharedWithMe', {
          client: client,
          $gettext: translate
        })
      })
      .catch(e => {
        context.dispatch('showMessage', {
          title: translate('Error while changing share state'),
          desc: e.message,
          status: 'danger'
        }, { root: true })
      })
  },

  addActionToProgress ({ commit }, item) {
    commit('ADD_ACTION_TO_PROGRESS', item)
  },

  removeActionFromProgress ({ commit }, item) {
    commit('REMOVE_ACTION_FROM_PROGRESS', item)
  }
}
