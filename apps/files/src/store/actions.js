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
    permissions: file['fileInfo']['{http://owncloud.org/ns}permissions'],
    etag: file['fileInfo']['{DAV:}getetag'],
    sharePermissions: file['fileInfo']['{http://open-collaboration-services.org/ns}share-permissions'],
    privateLink: file['fileInfo']['{http://owncloud.org/ns}privatelink'],
    owner: {
      username: file['fileInfo']['{http://owncloud.org/ns}owner-id'],
      displayName: file['fileInfo']['{http://owncloud.org/ns}owner-display-name']
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
    basename: (function () {
      const fullName = file['fileInfo']['{http://owncloud.org/ns}trashbin-original-filename']
      const pathList = fullName.split('/').filter(e => e !== '')
      const name = pathList.length === 0 ? '' : pathList[pathList.length - 1]
      if (ext) {
        return name.substring(0, name.length - ext.length - 1)
      }
      return name
    })(),
    name: (function () {
      const fullName = file['fileInfo']['{http://owncloud.org/ns}trashbin-original-filename']
      const pathList = fullName.split('/').filter(e => e !== '')
      return pathList.length === 0 ? '' : pathList[pathList.length - 1]
    })(),
    originalLocation: file['fileInfo']['{http://owncloud.org/ns}trashbin-original-location'],
    id: (function () {
      const pathList = file.name.split('/').filter(e => e !== '')
      return pathList.length === 0 ? '' : pathList[pathList.length - 1]
    })()
  })
}

function _buildLink (l) {
  const link = l.shareInfo
  let description = ''

  switch (link.permissions) {
    case ('1'):
      description = 'Viewer' // hover: Recipients can view or download contents.
      break
    case ('15'):
      description = 'Contributor' // hover: Recipients can view, download, edit, delete and upload contents.
      break
    case ('4'):
      description = 'Uploader' // TODO hover: Receive files from multiple recipients without revealing the contents of the folder.
      break
    case ('5'):
      description = 'Editor' // TODO hover: Receive files from multiple recipients without revealing the contents of the folder.
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
    expiration: moment(link.expiration).format('YYYY-MM-DD'),
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
    case ('1'): // group share
      share.role = 'editor' // TODO: Switch to custom role when implemented
      if (s.permissions === '1' || s.permissions === '17') {
        share.role = 'viewer'
      }
      if (s.permissions === '2' || s.permissions === '7' || s.permissions === '23') {
        share.role = 'editor'
      }
      // Co-Owner dropped for now until we get displaying of reshares working also for him
      // if (s.permissions === '31') {
      //   share.role = 'coowner'
      // }
      share.permissions = s.permissions
      share.canReshare = s.permissions === '16' || s.permissions === '17' || s.permissions === '19' || s.permissions === '23' || s.permissions === '31'
      share.avatar = 'https://picsum.photos/64/64?image=1075' // TODO where do we get the avatar from? by uid? remote.php/dav/avatars/admin/128.png
      share.name = s.share_with // this is the recipient userid, rename to uid or subject? add separate field userName?
      share.displayName = s.share_with_displayname
      share.customPermissions = {
        create: s.permissions === '5' || s.permissions === '21',
        change: s.permissions === '3' || s.permissions === '19',
        delete: s.permissions === '9' || s.permissions === '25'
      }
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

    return new Promise((resolve, reject) => {
      let promise
      const favorite = routeName === 'files-favorites'

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
        context.dispatch('setHighlightedFile', null)
        if (context.getters.searchTerm !== '') {
          context.dispatch('resetSearch')
        }
      }).catch((e) => {
        context.dispatch('showMessage', {
          title: $gettext('Loading folder failed…'),
          desc: e.message,
          status: 'danger'
        }, { root: true })
        reject(e)
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
      context.dispatch('setHighlightedFile', null)
    }).catch((e) => {
      context.dispatch('showMessage', {
        title: $gettext('Loading trashbin failed…'),
        desc: e.message,
        status: 'danger'
      }, { root: true })
    }).finally(() => {
      context.commit('UPDATE_FOLDER_LOADING', false)
    })
  },
  updateFileProgress ({ commit }, progress) {
    if (progress.progress === 100) {
      commit('REMOVE_FILE_FROM_PROGRESS', { name: progress.fileName })
    } else {
      commit('UPDATE_FILE_PROGRESS', progress)
    }
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
  deleteFiles (context, payload) {
    const files = payload.files
    const client = payload.client
    const promises = []
    for (const file of files) {
      const promise = client.files.delete(file.path).then(() => {
        context.commit('REMOVE_FILE', file)
        context.commit('REMOVE_FILE_SELECTION', file)
      }).catch(error => {
        console.log('error: ' + file.path + ' not deleted: ' + error)
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
  renameFile (context, payload) {
    const file = payload.file
    const newValue = payload.newValue
    const client = payload.client
    if (file !== undefined && newValue !== undefined && newValue !== file.name) {
      const newPath = file.path.substr(1, file.path.lastIndexOf('/'))
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
  shareSetOpen (context, payload) {
    context.commit('SHARE_SET_OPEN', payload.index)
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
  changeShare (context, { client, share, reshare }) {
    const params = {}
    switch (share.role) {
      case ('coowner'):
        params.perms = 31
        break
      case ('editor'):
        if (share.info.item_type === 'file') {
          params.perms = reshare ? 19 : 2
          break
        }
        params.perms = reshare ? 23 : 7
        break
      case ('viewer'):
        console.log(reshare)
        params.perms = reshare ? 17 : 1
        console.log(params.perms)
        break
      case ('custom'):
        params.perms = 31
        break
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
  addShare (context, { client, path, $gettext, shareWith, shareType, permissions }) {
    context.commit('SHARES_LOADING', true)

    if (shareType === 0) {
      client.shares.shareFileWithUser(path, shareWith, permissions)
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
      client.shares.shareFileWithGroup(path, shareWith, permissions)
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
  //
  // Link shares
  // ...........

  loadLinks (context, { client, path }) {
    context.commit('LINKS_PURGE')
    context.commit('LINKS_ERROR', null)
    context.commit('LINKS_LOADING', true)

    client.shares.getShares(path, {})
      .then(data => {
        data.forEach(share => {
          if (share.shareInfo.share_type === '3') {
            context.commit('LINKS_ADD', _buildLink(share))
          }
        })
      })
      .catch(error => {
        context.commit('LINKS_ERROR', error.message)
      })
      .finally(context.commit('LINKS_LOADING', false))
  },

  purgeLinks (context) {
    context.commit('LINKS_PURGE')
  },

  addLink (context, { path, client, $gettext, params }) {
    return new Promise((resolve, reject) => {
      context.commit('LINKS_LOADING', true)

      client.shares.shareFileWithLink(path, params)
        .then(data => {
          const link = _buildLink(data)
          context.commit('LINKS_ADD', link)
          context.commit('LINKS_LOADING', false)
          resolve(link)
        })
        .catch(e => {
          context.dispatch('showMessage', {
            title: $gettext('Error while sharing.'),
            desc: e,
            status: 'danger'
          }, { root: true })
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
          const link = _buildLink(data)
          context.commit('LINKS_UPDATE', link)
          context.commit('LINKS_LOADING', false)
          resolve(link)
        })
        .catch(e => {
          context.dispatch('showMessage', {
            title: $gettext('Error while sharing.'),
            desc: e,
            status: 'danger'
          }, { root: true })
          context.commit('LINKS_LOADING', false)
          reject(e)
        })
    })
  },
  removeLink (context, { id, client }) {
    client.shares.deleteShare(id).then(() => {
      context.commit('LINKS_REMOVE', id)
    }).catch(e => console.log(e))
  }
}
