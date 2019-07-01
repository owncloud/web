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
    id: file['fileInfo']['{http://owncloud.org/ns}fileid'],
    starred: file['fileInfo']['{http://owncloud.org/ns}favorite'] !== '0',
    mdate: file['fileInfo']['{DAV:}getlastmodified'],
    size: (function () {
      if (file.type === 'dir') {
        return file['fileInfo']['{http://owncloud.org/ns}size']
      } else {
        return file['fileInfo']['{DAV:}getcontentlength']
      }
    }()),
    extension: (function () {
      return ext
    }()),
    name: (function () {
      let pathList = file.name.split('/').filter(e => e !== '')
      return pathList.length === 0 ? '' : pathList[pathList.length - 1]
    }()),
    basename: (function () {
      let pathList = file.name.split('/').filter(e => e !== '')
      let name = pathList.length === 0 ? '' : pathList[pathList.length - 1]
      if (ext) {
        return name.substring(0, name.length - ext.length - 1)
      }
      return name
    }()),
    path: file.name,
    permissions: file['fileInfo']['{http://owncloud.org/ns}permissions'],
    sharePermissions: file['fileInfo']['{http://open-collaboration-services.org/ns}share-permissions'],
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
    }
  })
}

function _buildFileInTrashbin (file) {
  let ext = ''
  if (file.type !== 'dir') {
    const ex = file['fileInfo']['{http://owncloud.org/ns}trashbin-original-filename'].match(/\.[0-9a-z]+$/i)
    if (ex !== null) {
      ext = ex[0].substr(1)
    }
  }
  return ({
    type: (file.type === 'dir') ? 'folder' : file.type,
    deleteTimestamp: file['fileInfo']['{http://owncloud.org/ns}trashbin-delete-datetime'],
    extension: (function () {
      return ext
    }()),
    name: (function () {
      let fullName = file['fileInfo']['{http://owncloud.org/ns}trashbin-original-filename']
      let pathList = fullName.split('/').filter(e => e !== '')
      let name = pathList.length === 0 ? '' : pathList[pathList.length - 1]
      if (ext) {
        return name.substring(0, name.length - ext.length - 1)
      }
      return name
    })(),
    originalLocation: file['fileInfo']['{http://owncloud.org/ns}trashbin-original-location'],
    id: (function () {
      let pathList = file.name.split('/').filter(e => e !== '')
      return pathList.length === 0 ? '' : pathList[pathList.length - 1]
    })()
  })
}

function _buildShare (s) {
  let share = {
    info: s
  }
  switch (s.share_type) {
    case ('0'): // user share
    // TODO differentiate groups from users?
    // fall through
    case ('1'): // group share
      share.role = 'legacy'
      if (s.permissions & 1) {
        share.role = 'viewer'
      }
      if (s.permissions & 2) {
        share.role = 'editor'
      }
      if (s.permissions & 16) {
        share.role = 'coowner'
      }
      share.avatar = 'https://picsum.photos/64/64?image=1075' // TODO where do we get the avatar from? by uid? remote.php/dav/avatars/admin/128.png
      share.name = s.share_with // this is the recipient userid, rename to uid or subject? add separate field userName?
      share.displayName = s.share_with_displayname
      // share.email = 'foo@djungle.com' // hm, where do we get the mail from? share_with_additional_info:Object?
      break
    case ('3'): // public link
      share.role = 'public'
      share.name = s.name
      switch (s.permissions) {
        case ('1'):
          share.displayName = 'Download / View' // hover: Recipients can view or download contents.
          break
        case ('15'):
          share.displayName = 'Download / View / Upload' // hover: Recipients can view, download, edit, delete and upload contents.
          break
        case ('4'):
          share.displayName = 'Upload only (File Drop)' // TODO hover: Receive files from multiple recipients without revealing the contents of the folder.
          break
        default:
          share.role = 'legacy'
      }
      share.avatar = 'link' // TODO de we have to give a path? remote.php/dav/avatars/admin/128.png or is an icon enough?
      share.email = s.url // TODO add optional url to card, we are kind of misusing this
      // TODO password
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

    let promise
    let favorite = routeName === 'files-favorites'

    if (favorite) {
      promise = client.files.getFavoriteFiles(context.getters.davProperties)
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
            rootFolder['fileInfo']['{http://owncloud.org/ns}permissions'] = 'R'
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
      if (context.getters.searchTerm !== '') {
        context.dispatch('resetSearch')
      }
    }).catch((e) => {
      context.dispatch('showMessage', {
        title: $gettext('Loading folder failed…'),
        desc: e.message,
        status: 'danger'
      }, { root: true })
    }).finally(() => {
      context.commit('UPDATE_FOLDER_LOADING', false)
      client.users.getUser(context.rootGetters.user.id).then(res => {
        let enoughSpace
        if (res.quota.relative >= 100) {
          enoughSpace = false
        } else {
          enoughSpace = true
        }
        context.commit('CHECK_QUOTA', enoughSpace)
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
        context.dispatch('showNotification', {
          title: $gettext('Loading trashbin failed…'),
          status: 'danger'
        }, { root: true })
      } else {
        context.dispatch('loadDeletedFiles', {
          currentFolder: res[0],
          files: res.splice(1)
        })
      }
      context.dispatch('resetFileSelection')
    }).catch((e) => {
      context.dispatch('showNotification', {
        title: $gettext('Loading trashbin failed…'),
        desc: e.message,
        status: 'danger'
      }, { root: true })
    }).finally(() => {
      context.commit('UPDATE_FOLDER_LOADING', false)
    })
  },
  updateFileProgress ({ commit }, progress) {
    if (progress.progress === 100) commit('REMOVE_FILE_FROM_PROGRESS', { name: progress.fileName })
    else commit('UPDATE_FILE_PROGRESS', progress)
  },
  addFileToProgress ({ commit }, file) {
    commit('ADD_FILE_TO_PROGRESS', file)
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
    let file = payload.file
    let client = payload.client
    let newValue = !file.starred
    client.files.favorite(file.path, newValue)
      .then(() => {
        context.commit('FAVORITE_FILE', file)
      })
      .catch(error => {
        console.log(error)
      })
  },
  addFiles (context, payload) {
    let files = payload.files
    for (let file of files) {
      context.commit('ADD_FILE', _buildFile(file))
    }
  },
  deleteFiles (context, payload) {
    let files = payload.files
    let client = payload.client
    for (let file of files) {
      client.files.delete(file.path).then(() => {
        context.commit('REMOVE_FILE', file)
        context.commit('REMOVE_FILE_SELECTION', file)
      }).catch(error => {
        console.log('error: ' + file.path + ' not deleted: ' + error)
      })
    }
  },
  removeFilesFromTrashbin (context, files) {
    for (let file of files) {
      context.commit('REMOVE_FILE', file)
    }
  },
  renameFile (context, payload) {
    let file = payload.file
    let newValue = payload.newValue
    let client = payload.client
    if (file !== undefined && newValue !== undefined && newValue !== file.name) {
      let newPath = file.path.substr(1, file.path.lastIndexOf('/'))
      client.files.move(file.path, (newPath + newValue)).then(() => {
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
      let client = payload.client
      let searchTerm = payload.searchTerm
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
  shareSetOpen (context, payload) {
    context.commit('SHARE_SET_OPEN', payload.index)
  },
  loadShares (context, payload) {
    context.commit('SHARES_LOAD', [])
    context.commit('SHARES_ERROR', null)
    context.commit('SHARES_LOADING', true)

    // see https://owncloud.github.io/js-owncloud-client/Shares.html
    let client = payload.client
    let path = payload.path
    client.shares.getShares(path)
      .then(data => {
        context.commit('SHARES_LOAD', data.map(element => {
          return _buildShare(element.shareInfo)
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
  changeShare (context, { client, share }) {
    const params = {}
    // needs better mechanism ...
    if (share.role === 'coowner') {
      params.perms = 31
    }
    if (share.role === 'editor') {
      params.perms = 15
    }
    if (share.role === 'viewer') {
      params.perms = 1
    }
    if (share.info.item_type === 'file') {
      params.perms &= ~4 // CREATE permission
      params.perms &= ~8 // DELETE permission
    }

    if (!params.perms) {
      return new Promise((resolve, reject) => {
        reject(new Error('Nothing changed'))
      })
    }

    return client.shares.updateShare(share.info.id, params)
      .then(() => {
        // TODO: work with response once it is available: https://github.com/owncloud/owncloud-sdk/issues/208
        share.info.permissions = params.perms
        context.commit('SHARES_UPDATE_SHARE', share)
      })
      .catch(e => {
        console.log(e)
      })
  },
  addShare (context, { client, path, $gettext, shareWith, shareType }) {
    context.commit('SHARES_LOADING', true)

    if (shareType === 0) {
      client.shares.shareFileWithUser(path, shareWith)
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
    } else {
      client.shares.shareFileWithGroup(path, shareWith)
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
    }
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
  }
}
