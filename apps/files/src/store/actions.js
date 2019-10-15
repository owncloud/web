import moment from 'moment'

function _buildFile (file) {
  let ext = ''
  if (file.type !== 'dir') {
    const ex = file.name.match(/\.[0-9a-z]+$/i)
    if (ex !== null) {
      ext = ex[0].substr(1)
    }
  }
  return ({
    type: (file.type === 'dir') ? 'folder' : file.type,
    id: file.fileInfo['{http://owncloud.org/ns}fileid'],
    starred: file.fileInfo['{http://owncloud.org/ns}favorite'] !== '0',
    mdate: file.fileInfo['{DAV:}getlastmodified'],
    size: (function () {
      if (file.type === 'dir') {
        return file.fileInfo['{http://owncloud.org/ns}size']
      } else {
        return file.fileInfo['{DAV:}getcontentlength']
      }
    }()),
    extension: (function () {
      return ext
    }()),
    name: (function () {
      const pathList = file.name.split('/').filter(e => e !== '')
      return pathList.length === 0 ? '' : pathList[pathList.length - 1]
    }()),
    basename: (function () {
      const pathList = file.name.split('/').filter(e => e !== '')
      const name = pathList.length === 0 ? '' : pathList[pathList.length - 1]
      if (ext) {
        return name.substring(0, name.length - ext.length - 1)
      }
      return name
    }()),
    path: file.name,
    permissions: file.fileInfo['{http://owncloud.org/ns}permissions'] || '',
    etag: file.fileInfo['{DAV:}getetag'],
    sharePermissions: file.fileInfo['{http://open-collaboration-services.org/ns}share-permissions'],
    privateLink: file.fileInfo['{http://owncloud.org/ns}privatelink'],
    owner: {
      username: file.fileInfo['{http://owncloud.org/ns}owner-id'],
      displayName: file.fileInfo['{http://owncloud.org/ns}owner-display-name']
    },
    canUpload: function () {
      return this.permissions.indexOf('C') >= 0
    },
    canDownload: function () {
      return this.type !== 'folder'
    },
    canBeDeleted: function () {
      return this.permissions.indexOf('D') >= 0
    },
    canRename: function () {
      return this.permissions.indexOf('N') >= 0
    },
    canShare: function () {
      return this.permissions.indexOf('R') >= 0
    },
    isMounted: function () {
      return this.permissions.indexOf('M') >= 0
    }
  })
}

function _buildFileInTrashbin (file) {
  let ext = ''
  if (file.type !== 'dir') {
    const ex = file.fileInfo['{http://owncloud.org/ns}trashbin-original-filename'].match(/\.[0-9a-z]+$/i)
    if (ex !== null) {
      ext = ex[0].substr(1)
    }
  }
  return ({
    type: (file.type === 'dir') ? 'folder' : file.type,
    deleteTimestamp: file.fileInfo['{http://owncloud.org/ns}trashbin-delete-datetime'],
    extension: (function () {
      return ext
    }()),
    basename: (function () {
      const fullName = file.fileInfo['{http://owncloud.org/ns}trashbin-original-filename']
      const pathList = fullName.split('/').filter(e => e !== '')
      const name = pathList.length === 0 ? '' : pathList[pathList.length - 1]
      if (ext) {
        return name.substring(0, name.length - ext.length - 1)
      }
      return name
    })(),
    name: (function () {
      const fullName = file.fileInfo['{http://owncloud.org/ns}trashbin-original-filename']
      const pathList = fullName.split('/').filter(e => e !== '')
      return pathList.length === 0 ? '' : pathList[pathList.length - 1]
    })(),
    originalLocation: file.fileInfo['{http://owncloud.org/ns}trashbin-original-location'],
    id: (function () {
      const pathList = file.name.split('/').filter(e => e !== '')
      return pathList.length === 0 ? '' : pathList[pathList.length - 1]
    })()
  })
}

function _buildSharedFile (file) {
  let ext = ''
  if (file.item_type !== 'dir') {
    const ex = file.path.substr(file.path.lastIndexOf('/')).match(/\.[0-9a-z]+$/i)
    if (ex !== null) {
      ext = ex[0].substr(1)
    }
  }
  return {
    id: file.item_source,
    shareId: file.id,
    type: file.item_type,
    extension: (function () {
      return ext
    }()),
    name: (function () {
      const name = file.path.substr(file.path.lastIndexOf('/'))
      return name.substr(1)
    }()),
    basename: (function () {
      const name = file.path.substr(file.path.lastIndexOf('/'))
      if (ext) {
        return name.substring(1, name.length - ext.length - 1)
      }
      return name.substr(1)
    }()),
    path: file.path,
    shareTime: file.stime * 1000,
    owner: file.uid_file_owner,
    ownerDisplayname: file.displayname_file_owner,
    shareOwner: file.uid_owner,
    shareOwnerDisplayname: file.displayname_owner,
    sharedWith: file.share_with_displayname,
    shareType: file.share_type,
    status: (function () {
      if (file.state) return file.state
    }()),
    canUpload: function () {
      // TODO: Find a way how to read permissions for file and not for share
      // return file.permissions >= 4
      return true
    },
    canDownload: function () {
      return file.item_type !== 'folder'
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

function _buildShare (s) {
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
      share.role = 'custom'
      if (s.permissions === '1' || s.permissions === '17') {
        share.role = 'viewer'
      }
      if (s.permissions === '3' || s.permissions === '15' || s.permissions === '19' || s.permissions === '31') {
        share.role = 'editor'
      }
      share.permissions = s.permissions
      share.canShare = s.permissions === '17' || s.permissions === '19' || s.permissions === '21' || s.permissions === '25' || s.permissions === '31'
      share.avatar = 'https://picsum.photos/64/64?image=1075' // TODO where do we get the avatar from? by uid? remote.php/dav/avatars/admin/128.png
      share.name = s.share_with // this is the recipient userid, rename to uid or subject? add separate field userName?
      share.displayName = s.share_with_displayname
      share.customPermissions = {
        change: s.permissions === '3' || s.permissions === '15' || s.permissions === '19' || s.permissions === '31',
        create: s.permissions === '5' || s.permissions === '15' || s.permissions === '21' || s.permissions === '31',
        delete: s.permissions === '9' || s.permissions === '15' || s.permissions === '25' || s.permissions === '31'
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
        promise = client.files.getFavoriteFiles(context.getters.davProperties)
      } else if (publicFiles) {
        const password = context.getters.publicLinkPassword
        promise = client.publicFiles.list(absolutePath, password, context.getters.davProperties)
      } else {
        promise = client.files.list(absolutePath, 1, context.getters.davProperties)
      }
      promise.then(res => {
        if (res === null) {
          context.dispatch('showMessage', {
            title: $gettext('Loading folder failed…'),
            status: 'danger'
          }, { root: true })
        } else {
          if (favorite) {
            client.files.fileInfo('', context.getters.davProperties).then(rootFolder => {
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

    client.fileTrash.list('', '1', [
      '{http://owncloud.org/ns}trashbin-original-filename',
      '{http://owncloud.org/ns}trashbin-original-location',
      '{http://owncloud.org/ns}trashbin-delete-datetime',
      '{DAV:}getcontentlength',
      '{DAV:}resourcetype'
    ]).then(res => {
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
      client.files.search(searchTerm, null, context.state.davProperties).then((filesSearched) => {
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
          return _buildShare(element.shareInfo)
        }))
      })
      .catch(error => {
        context.commit('SHARES_ERROR', error.message)
      })
      .finally(context.commit('SHARES_LOADING', false))
  },
  sharesClearState (context, payload) {
    context.commit('SHARES_LOAD', [])
    context.commit('SHARES_ERROR', null)
  },
  changeShare (context, { client, share, role, canShare, canChange, canCreate, canDelete }) {
    context.commit('TOGGLE_COLLABORATOR_SAVING', true)
    const params = {}
    let perms = 1
    const changePerm = 2
    const createPerm = 4
    const deletePerm = 8
    const resharePerm = 16
    switch (role) {
      case ('viewer'):
        params.permissions = canShare ? 17 : 1
        break
      case ('editor'):
        if (share.info.item_type === 'file') {
          params.permissions = canShare ? 19 : 3
          break
        }
        params.permissions = canShare ? 31 : 15
        break
      case ('custom'):
        if (canChange) perms += changePerm
        if (canCreate) perms += createPerm
        if (canDelete) perms += deletePerm
        if (canShare) perms += resharePerm
        params.permissions = perms

        if (perms === 1 || perms === 17) {
          role = 'viewer'
        }
        if (perms === 3 || perms === 15 || perms === 19 || perms === 31) {
          role = 'editor'
        }
        break
    }

    if (!params.permissions) {
      return new Promise((resolve, reject) => {
        reject(new Error('Nothing changed'))
      })
    }

    client.shares.updateShare(share.info.id, params)
      .then(() => {
        // TODO: work with response once it is available: https://github.com/owncloud/owncloud-sdk/issues/208
        context.commit('SHARES_UPDATE_SHARE', { share, role })
      })
      .catch(e => {
        console.log(e)
      })
      .finally(_ => {
        context.commit('TOGGLE_COLLABORATOR_SAVING', false)
      })
  },
  addShare (context, { client, path, $gettext, shareWith, shareType, permissions }) {
    context.commit('SHARES_LOADING', true)

    if (shareType === 1) {
      client.shares.shareFileWithGroup(path, shareWith, { permissions: permissions })
        .then(share => {
          context.commit('SHARES_ADD_SHARE', _buildShare(share.shareInfo))
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
        context.commit('SHARES_ADD_SHARE', _buildShare(share.shareInfo))
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
  setFilesDeleteMessage (context, message) {
    context.commit('SET_FILES_DELETE_CONFIRMATION', message)
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
