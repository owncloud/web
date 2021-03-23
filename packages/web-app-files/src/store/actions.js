import moment from 'moment'
import uniqueId from 'lodash-es/uniqueId'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import filter from 'lodash/fp/filter'
import reduce from 'lodash/fp/reduce'
import values from 'lodash/fp/values'
import { getParentPaths } from '../helpers/path'
import { bitmaskToRole, permissionsBitmask, checkPermission } from '../helpers/collaborators'
import { shareTypes } from '../helpers/shareTypes'
import path from 'path'
import SidebarQuota from '../components/SidebarQuota.vue'
import PQueue from 'p-queue'

function _extName(fileName) {
  let ext = ''
  const ex = fileName.match(/\.[0-9a-z]+$/i)
  if (ex) {
    ext = ex[0].substr(1)
  }
  return ext
}

function _buildFile(file) {
  const ext = file.type !== 'dir' ? _extName(file.name) : ''
  return {
    type: file.type === 'dir' ? 'folder' : file.type,
    // actual file id (string)
    id: file.fileInfo['{http://owncloud.org/ns}fileid'],
    // temporary list id, to be used for view only and for uniqueness inside the list
    viewId: uniqueId('file-'),
    starred: file.fileInfo['{http://owncloud.org/ns}favorite'] !== '0',
    mdate: file.fileInfo['{DAV:}getlastmodified'],
    mdateMoment: moment(file.fileInfo['{DAV:}getlastmodified']),
    size: (function() {
      if (file.type === 'dir') {
        return file.fileInfo['{http://owncloud.org/ns}size']
      } else {
        return file.fileInfo['{DAV:}getcontentlength']
      }
    })(),
    extension: (function() {
      return ext
    })(),
    name: (function() {
      const pathList = file.name.split('/').filter(e => e !== '')
      return pathList.length === 0 ? '' : pathList[pathList.length - 1]
    })(),
    basename: (function() {
      const pathList = file.name.split('/').filter(e => e !== '')
      const name = pathList.length === 0 ? '' : pathList[pathList.length - 1]
      // FIXME: this is really just a view/formatting thing, should better
      // be processed at render time instead of storing an extra value
      if (ext) {
        return name.substring(0, name.length - ext.length - 1)
      }
      return name
    })(),
    path: file.name,
    permissions: file.fileInfo['{http://owncloud.org/ns}permissions'] || '',
    etag: file.fileInfo['{DAV:}getetag'],
    sharePermissions: file.fileInfo['{http://open-collaboration-services.org/ns}share-permissions'],
    shareTypes: (function() {
      let shareTypes = file.fileInfo['{http://owncloud.org/ns}share-types']
      if (shareTypes) {
        shareTypes = flow(
          filter(
            xmlvalue =>
              xmlvalue.namespaceURI === 'http://owncloud.org/ns' &&
              xmlvalue.nodeName.split(':')[1] === 'share-type'
          ),
          map(xmlvalue => parseInt(xmlvalue.textContent || xmlvalue.text, 10))
        )(shareTypes)
      }

      return shareTypes || []
    })(),
    privateLink: file.fileInfo['{http://owncloud.org/ns}privatelink'],
    owner: {
      username: file.fileInfo['{http://owncloud.org/ns}owner-id'],
      displayName: file.fileInfo['{http://owncloud.org/ns}owner-display-name']
    },
    canUpload: function() {
      return this.permissions.indexOf('C') >= 0
    },
    canDownload: function() {
      return this.type !== 'folder'
    },
    canBeDeleted: function() {
      return this.permissions.indexOf('D') >= 0
    },
    canRename: function() {
      return this.permissions.indexOf('N') >= 0
    },
    canShare: function() {
      return this.permissions.indexOf('R') >= 0
    },
    canCreate: function() {
      return this.permissions.indexOf('C') >= 0
    },
    isMounted: function() {
      return this.permissions.indexOf('M') >= 0
    },
    isReceivedShare: function() {
      return this.permissions.indexOf('S') >= 0
    },
    isChunkedUploadSupported: !!(file.getTusSupport && file.getTusSupport()),
    downloadURL: file.fileInfo['{http://owncloud.org/ns}downloadURL']
  }
}

function _buildFileInTrashbin(file) {
  let ext = ''
  if (file.type !== 'dir') {
    const ex = file.fileInfo['{http://owncloud.org/ns}trashbin-original-filename'].match(
      /\.[0-9a-z]+$/i
    )
    if (ex !== null) {
      ext = ex[0].substr(1)
    }
  }
  return {
    type: file.type === 'dir' ? 'folder' : file.type,
    deleteTimestamp: file.fileInfo['{http://owncloud.org/ns}trashbin-delete-datetime'],
    deleteTimestampMoment: moment(
      file.fileInfo['{http://owncloud.org/ns}trashbin-delete-datetime']
    ),
    extension: (function() {
      return ext
    })(),
    basename: (function() {
      const fullName = file.fileInfo['{http://owncloud.org/ns}trashbin-original-filename']
      const pathList = fullName.split('/').filter(e => e !== '')
      const name = pathList.length === 0 ? '' : pathList[pathList.length - 1]
      if (ext) {
        return name.substring(0, name.length - ext.length - 1)
      }
      return name
    })(),
    name: (function() {
      const fullName = file.fileInfo['{http://owncloud.org/ns}trashbin-original-filename']
      const pathList = fullName.split('/').filter(e => e !== '')
      return pathList.length === 0 ? '' : pathList[pathList.length - 1]
    })(),
    originalLocation: file.fileInfo['{http://owncloud.org/ns}trashbin-original-location'],
    id: (function() {
      const pathList = file.name.split('/').filter(e => e !== '')
      return pathList.length === 0 ? '' : pathList[pathList.length - 1]
    })()
  }
}

function _aggregateFileShares(data, incomingShares = false, allowSharePerm) {
  // borrowed from owncloud's apps/files_sharing/js/sharedfilelist.js#_makeFilesFromShares(data)
  return flow(
    // convert share data to file data
    map(share => {
      var file = {
        id: share.item_source,
        type: share.item_type
      }

      if (incomingShares) {
        file.owner = {
          username: share.uid_file_owner,
          displayName: share.displayname_file_owner
        }
        file.shareOwner = {
          username: share.uid_owner,
          displayName: share.displayname_owner
        }
        file.status = share.state
        file.name = path.basename(share.file_target)
        file.basename = path.basename(share.file_target, file.extension)
        file.path = share.file_target
        file.isReceivedShare = () => true
      } else {
        file.shareOwner = share.uid_owner
        file.shareOwnerDisplayname = share.displayname_owner
        file.name = path.basename(share.path)
        file.basename = path.basename(share.path, file.extension)
        file.path = share.path
        // permissions irrelevant here
        file.isReceivedShare = () => false
      }

      // FIXME: add actual permission parsing
      file.canUpload = () => true
      file.canBeDeleted = () => true
      file.canRename = () => true
      file.canShare = () => {
        return checkPermission(share.permissions, 'share')
      }
      file.isMounted = () => false
      file.canDownload = () => file.type !== 'folder'
      file.extension = file.type !== 'folder' ? _extName(file.name) : ''
      if (file.extension) {
        // remove extension from basename like _buildFile does
        file.basename = file.basename.substring(0, file.basename.length - file.extension.length - 1)
      }
      file.share = _buildShare(share, file, allowSharePerm)

      return file
    }),
    // Group all files and have a "shares" array with
    // the share info for each file.
    //
    // This uses a hash memo to cumulate share information
    // inside the same file object (by file id).
    reduce((memo, file) => {
      var data = memo[file.id]
      if (!data) {
        data = memo[file.id] = file
        data.shares = [file.share]
        data.shareTime = file.share.stime * 1000
        data.shareTimeMoment = moment(file.share.stime * 1000)
        if (incomingShares) {
          data.shareId = file.share.id
        }
      } else {
        // always take the most recent stime
        if (file.share.stime * 1000 > data.shareTime) {
          data.shareTime = file.share.stime * 1000
          data.shareTimeMoment = moment(file.share.stime * 1000)
        }
        data.shares.push(file.share)
      }

      delete file.share
      return memo
    }, {}),
    // Retrieve only the values of the returned hash
    values
  )(data)
}

function _buildShare(s, file, $gettext, allowSharePerm) {
  if (parseInt(s.share_type, 10) === shareTypes.link) {
    return _buildLink(s, $gettext)
  }
  return _buildCollaboratorShare(s, file, allowSharePerm)
}

function _buildLink(link, $gettext) {
  let description = ''

  // FIXME: use bitmask matching with constants
  switch (link.permissions) {
    case '1': // read (1)
      description = $gettext('Viewer')
      break
    case '5': // read (1) + create (4)
      description = $gettext('Contributor')
      break
    case '4': // create (4)
      description = $gettext('Uploader')
      break
    case '15': // read (1) + update (2) + create (4) + delete (8)
      description = $gettext('Editor')
      break
  }

  return {
    shareType: parseInt(link.share_type, 10),
    id: link.id,
    token: link.token,
    url: link.url,
    path: link.path,
    permissions: link.permissions,
    description,
    stime: link.stime,
    name: typeof link.name === 'string' ? link.name : '',
    password: !!(link.share_with && link.share_with_displayname),
    expiration:
      typeof link.expiration === 'string' ? moment(link.expiration).format('YYYY-MM-DD') : null,
    itemSource: link.item_source,
    file: {
      parent: link.file_parent,
      source: link.file_source,
      target: link.file_target
    }
  }
}

function _fixAdditionalInfo(data) {
  if (typeof data !== 'string') {
    return null
  }
  return data
}

function _buildCollaboratorShare(s, file, allowSharePerm) {
  const share = {
    shareType: parseInt(s.share_type, 10),
    id: s.id
  }
  switch (share.shareType) {
    case shareTypes.user: // user share
    // TODO differentiate groups from users?
    // fall through
    case shareTypes.remote:
    // fall through
    case shareTypes.group: // group share
      share.role = bitmaskToRole(s.permissions, file.type === 'folder', allowSharePerm)
      share.permissions = s.permissions
      // FIXME: SDK is returning empty object for additional info when empty
      share.collaborator = {
        name: s.share_with,
        displayName: s.share_with_displayname,
        additionalInfo: _fixAdditionalInfo(s.share_with_additional_info)
      }
      share.owner = {
        name: s.uid_owner,
        displayName: s.displayname_owner,
        additionalInfo: _fixAdditionalInfo(s.additional_info_owner)
      }
      share.fileOwner = {
        name: s.uid_file_owner,
        displayName: s.displayname_file_owner,
        additionalInfo: _fixAdditionalInfo(s.additional_info_file_owner)
      }
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
    share.expires = new Date(s.expiration)
  }
  share.path = s.path
  share.stime = s.stime

  return share
}

export default {
  loadFolder(
    context,
    { client, absolutePath, $gettext, routeName, loadSharesTree = false, isPublicPage = false }
  ) {
    context.commit('UPDATE_FOLDER_LOADING', true)
    context.commit('CLEAR_CURRENT_FILES_LIST')

    return new Promise((resolve, reject) => {
      let promise
      const favorite = routeName === 'files-favorites'

      if (favorite) {
        promise = client.files.getFavoriteFiles(context.getters.davProperties)
      } else if (isPublicPage) {
        const password = context.getters.publicLinkPassword
        promise = client.publicFiles.list(absolutePath, password, context.getters.davProperties)
      } else {
        promise = client.files.list(absolutePath, 1, context.getters.davProperties)
      }
      promise
        .then(res => {
          if (res === null) {
            context.dispatch(
              'showMessage',
              {
                title: $gettext('Loading folder failed…'),
                status: 'danger',
                autoClose: {
                  enabled: true
                }
              },
              { root: true }
            )
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
              if (loadSharesTree) {
                context.dispatch('loadSharesTree', {
                  client,
                  path: absolutePath,
                  $gettext
                })
              }
            }
          }
          context.dispatch('resetFileSelection')
          context.dispatch('setHighlightedFile', null)
          if (context.getters.searchTerm !== '') {
            context.dispatch('resetSearch')
          }
          context.commit('UPDATE_FOLDER_LOADING', false)
        })
        .catch(error => {
          context.commit('UPDATE_FOLDER_LOADING', false)
          reject(error)
        })
        .finally(() => {
          client.users.getUser(context.rootGetters.user.id).then(res => {
            const quota = res.quota

            context.commit('CHECK_QUOTA', quota)

            // Display quota in the sidebar
            if (
              !isPublicPage &&
              !context.getters.currentFolder.isMounted() &&
              quota.definition !== 'default' &&
              quota.definition !== 'none'
            ) {
              context.commit('SET_SIDEBAR_FOOTER_CONTENT_COMPONENT', SidebarQuota, { root: true })
            } else {
              context.commit('SET_SIDEBAR_FOOTER_CONTENT_COMPONENT', null, { root: true })
            }

            resolve()
          })
        })
    })
  },
  loadTrashbin(context, { client, $gettext }) {
    context.commit('UPDATE_FOLDER_LOADING', true)
    context.commit('CLEAR_CURRENT_FILES_LIST')

    client.fileTrash
      .list('', '1', [
        '{http://owncloud.org/ns}trashbin-original-filename',
        '{http://owncloud.org/ns}trashbin-original-location',
        '{http://owncloud.org/ns}trashbin-delete-datetime',
        '{DAV:}getcontentlength',
        '{DAV:}resourcetype'
      ])
      .then(res => {
        if (res === null) {
          context.dispatch(
            'showMessage',
            {
              title: $gettext('Loading list of deleted files has failed…'),
              status: 'danger',
              autoClose: {
                enabled: true
              }
            },
            { root: true }
          )
        } else {
          context.dispatch('loadDeletedFiles', {
            currentFolder: res[0],
            files: res.splice(1)
          })
        }
        context.dispatch('resetFileSelection')
        context.dispatch('setHighlightedFile', null)
        context.commit('UPDATE_FOLDER_LOADING', false)
      })
      .catch(e => {
        context.dispatch(
          'showMessage',
          {
            title: $gettext('Loading list of deleted files has failed…'),
            desc: e.message,
            status: 'danger',
            autoClose: {
              enabled: true
            }
          },
          { root: true }
        )
        context.commit('UPDATE_FOLDER_LOADING', false)
      })
  },
  loadFolderSharedFromMe(context, { client, $gettext }) {
    context.commit('UPDATE_FOLDER_LOADING', true)
    context.commit('CLEAR_CURRENT_FILES_LIST')

    // TODO: Move request to owncloud-sdk
    client.requests
      .ocs({
        service: 'apps/files_sharing',
        action: '/api/v1/shares?format=json&reshares=true&include_tags=false',
        method: 'GET'
      })
      .then(res => {
        res.json().then(json => {
          if (json.ocs.data.length < 1) {
            context.commit('UPDATE_FOLDER_LOADING', false)
            return
          }

          const files = json.ocs.data
          const uniqueFiles = _aggregateFileShares(files, false, !context.rootGetters.isOcis)
          context.dispatch('buildFilesSharedFromMe', uniqueFiles)
          context.commit('UPDATE_FOLDER_LOADING', false)
        })
      })
      .catch(e => {
        context.dispatch(
          'showMessage',
          {
            title: $gettext('Loading shared files failed…'),
            desc: e.message,
            status: 'danger',
            autoClose: {
              enabled: true
            }
          },
          { root: true }
        )
        context.commit('UPDATE_FOLDER_LOADING', false)
      })
  },
  loadFolderSharedWithMe(context, { client, $gettext }) {
    context.commit('UPDATE_FOLDER_LOADING', true)
    context.commit('CLEAR_CURRENT_FILES_LIST')

    // TODO: Move request to owncloud-sdk
    // TODO: Load remote shares as well
    client.requests
      .ocs({
        service: 'apps/files_sharing',
        action: '/api/v1/shares?format=json&shared_with_me=true&state=all&include_tags=false',
        method: 'GET'
      })
      .then(res => {
        res.json().then(json => {
          if (json.ocs.data.length < 1) {
            context.commit('UPDATE_FOLDER_LOADING', false)
            return
          }
          const files = json.ocs.data
          const uniqueFiles = _aggregateFileShares(files, true, !context.rootGetters.isOcis)
          context.dispatch('buildFilesSharedFromMe', uniqueFiles)
          context.commit('UPDATE_FOLDER_LOADING', false)
        })
      })
      .catch(e => {
        context.dispatch(
          'showMessage',
          {
            title: $gettext('Loading shared files failed…'),
            desc: e.message,
            status: 'danger',
            autoClose: {
              enabled: true
            }
          },
          { root: true }
        )
        context.commit('UPDATE_FOLDER_LOADING', false)
      })
  },
  updateFileProgress({ commit, getters }, progress) {
    commit('UPDATE_FILE_PROGRESS', progress)
  },
  addFileToProgress({ commit }, file) {
    commit('ADD_FILE_TO_PROGRESS', file)
  },

  removeFileFromProgress({ commit }, file) {
    commit('REMOVE_FILE_FROM_PROGRESS', file)
  },

  loadFiles(context, { currentFolder, files }) {
    if (currentFolder) {
      currentFolder = _buildFile(currentFolder)
    }
    files = files.map(_buildFile)
    context.commit('LOAD_FILES', { currentFolder, files })
  },
  loadDeletedFiles(context, { currentFolder, files }) {
    currentFolder = _buildFile(currentFolder)
    files = files.map(_buildFileInTrashbin)
    context.commit('LOAD_FILES', { currentFolder, files })
  },
  buildFilesSharedFromMe(context, files) {
    const currentFolder = files[0]
    context.commit('LOAD_FILES', { currentFolder, files })
  },
  setFilesSort(context, { field, directionIsDesc }) {
    context.commit('SET_FILES_SORT', { field, directionIsDesc })
  },
  addFileSelection(context, file) {
    context.commit('ADD_FILE_SELECTION', file)
  },
  removeFileSelection(context, file) {
    context.commit('REMOVE_FILE_SELECTION', file)
  },
  toggleFileSelection(context, file) {
    if (context.state.selected.includes(file)) {
      context.commit('REMOVE_FILE_SELECTION', file)
    } else {
      context.commit('ADD_FILE_SELECTION', file)
    }
  },
  resetFileSelection(context) {
    context.commit('RESET_SELECTION')
  },
  markFavorite(context, payload) {
    const file = payload.file
    const client = payload.client
    const newValue = !file.starred
    client.files
      .favorite(file.path, newValue)
      .then(() => {
        context.commit('FAVORITE_FILE', file)
      })
      .catch(error => {
        console.log(error)
      })
  },
  addFiles(context, payload) {
    const files = payload.files
    for (const file of files) {
      context.commit('ADD_FILE', _buildFile(file))
    }
  },
  deleteFiles(context, { files, client, publicPage, $gettext, $gettextInterpolate }) {
    const promises = []
    for (const file of files) {
      let p = null
      if (publicPage) {
        p = client.publicFiles.delete(file.path, null, context.getters.publicLinkPassword)
      } else {
        p = client.files.delete(file.path)
      }
      const promise = p
        .then(() => {
          context.commit('REMOVE_FILE', file)
          context.commit('REMOVE_FILE_SELECTION', file)
          context.commit('REMOVE_FILE_FROM_SEARCHED', file)
        })
        .catch(error => {
          let translated = $gettext('Error while deleting "%{file}"')
          if (error.statusCode === 423) {
            translated = $gettext('Error while deleting "%{file}" - the file is locked')
          }
          const title = $gettextInterpolate(translated, { file: file.name }, true)
          context.dispatch(
            'showMessage',
            {
              title: title,
              status: 'danger',
              autoClose: {
                enabled: true
              }
            },
            { root: true }
          )
        })
      promises.push(promise)
    }
    return Promise.all(promises)
  },
  removeFilesFromTrashbin(context, files) {
    for (const file of files) {
      context.commit('REMOVE_FILE', file)
    }
  },
  renameFile(context, { file, newValue, client, publicPage }) {
    if (file !== undefined && newValue !== undefined && newValue !== file.name) {
      const newPath = file.path.substr(1, file.path.lastIndexOf('/'))
      if (publicPage) {
        return client.publicFiles
          .move(file.path, newPath + newValue, context.getters.publicLinkPassword)
          .then(() => {
            context.commit('RENAME_FILE', { file, newValue, newPath })
          })
      }
      return client.files.move(file.path, newPath + newValue).then(() => {
        context.commit('RENAME_FILE', { file, newValue, newPath })
      })
    }
  },
  searchForFile(context, payload) {
    return new Promise(function(resolve, reject) {
      const client = payload.client
      const searchTerm = payload.searchTerm
      context.commit('SET_SEARCH_TERM', searchTerm)
      // TODO respect user selected listSize from state.config
      // do not search for empty strings
      if (!searchTerm) return
      client.files
        .search(searchTerm, null, context.state.davProperties)
        .then(filesSearched => {
          filesSearched = filesSearched.map(f => {
            return _buildFile(f)
          })
          context.commit('LOAD_FILES_SEARCHED', filesSearched)
          resolve(filesSearched)
        })
        .catch(error => {
          // TODO notification missing
          context.dispatch(
            'showMessage',
            {
              title: this.$gettext('Error while searching.'),
              desc: error.message,
              status: 'danger',
              autoClose: {
                enabled: true
              }
            },
            { root: true }
          )
          reject(error)
        })
    })
  },
  loadCurrentFileOutgoingShares(context, { client, path, $gettext }) {
    context.commit('CURRENT_FILE_OUTGOING_SHARES_SET', [])
    context.commit('CURRENT_FILE_OUTGOING_SHARES_ERROR', null)
    context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', true)

    // see https://owncloud.github.io/js-owncloud-client/Shares.html
    client.shares
      .getShares(path, { reshares: true })
      .then(data => {
        context.commit(
          'CURRENT_FILE_OUTGOING_SHARES_SET',
          data.map(element => {
            return _buildShare(
              element.shareInfo,
              context.getters.highlightedFile,
              $gettext,
              !context.rootGetters.isOcis
            )
          })
        )
        context.commit('UPDATE_CURRENT_FILE_SHARE_TYPES')
        context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', false)
      })
      .catch(error => {
        context.commit('CURRENT_FILE_OUTGOING_SHARES_ERROR', error.message)
        context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', false)
      })
  },
  loadIncomingShares(context, payload) {
    context.commit('INCOMING_SHARES_LOAD', [])
    context.commit('INCOMING_SHARES_ERROR', null)
    context.commit('INCOMING_SHARES_LOADING', true)

    // see https://owncloud.github.io/js-owncloud-client/Shares.html
    const client = payload.client
    const path = payload.path
    client.shares
      .getShares(path, { shared_with_me: true })
      .then(data => {
        context.commit(
          'INCOMING_SHARES_LOAD',
          data.map(element => {
            return _buildCollaboratorShare(
              element.shareInfo,
              context.getters.highlightedFile,
              !context.rootGetters.isOcis
            )
          })
        )
        context.commit('INCOMING_SHARES_LOADING', false)
      })
      .catch(error => {
        context.commit('INCOMING_SHARES_ERROR', error.message)
        context.commit('INCOMING_SHARES_LOADING', false)
      })
  },
  sharesClearState(context, payload) {
    context.commit('CURRENT_FILE_OUTGOING_SHARES_SET', [])
    context.commit('CURRENT_FILE_OUTGOING_SHARES_ERROR', null)
  },
  incomingSharesClearState(context, payload) {
    context.commit('INCOMING_SHARES_LOAD', [])
    context.commit('INCOMING_SHARES_ERROR', null)
  },
  changeShare(
    { commit, getters, rootGetters },
    { client, share, role, permissions, expirationDate }
  ) {
    const params = {
      permissions: permissions,
      expireDate: expirationDate
    }

    if (!params.permissions) {
      return new Promise((resolve, reject) => {
        reject(new Error('Nothing changed'))
      })
    }

    return new Promise((resolve, reject) => {
      client.shares
        .updateShare(share.id, params)
        .then(updatedShare => {
          const share = _buildCollaboratorShare(
            updatedShare.shareInfo,
            getters.highlightedFile,
            !rootGetters.isOcis
          )
          commit('CURRENT_FILE_OUTGOING_SHARES_UPDATE', share)
          resolve(share)
        })
        .catch(e => {
          reject(e)
        })
    })
  },
  addShare(context, { client, path, $gettext, shareWith, shareType, permissions, expirationDate }) {
    if (shareType === shareTypes.group) {
      client.shares
        .shareFileWithGroup(path, shareWith, {
          permissions: permissions,
          expirationDate: expirationDate
        })
        .then(share => {
          context.commit(
            'CURRENT_FILE_OUTGOING_SHARES_ADD',
            _buildCollaboratorShare(
              share.shareInfo,
              context.getters.highlightedFile,
              !context.rootGetters.isOcis
            )
          )
          context.commit('UPDATE_CURRENT_FILE_SHARE_TYPES')
        })
        .catch(e => {
          context.dispatch(
            'showMessage',
            {
              title: $gettext('Error while sharing.'),
              desc: e,
              status: 'danger',
              autoClose: {
                enabled: true
              }
            },
            { root: true }
          )
        })
      return
    }

    const remoteShare = shareType === shareTypes.remote
    client.shares
      .shareFileWithUser(path, shareWith, {
        permissions: permissions,
        remoteUser: remoteShare,
        expirationDate: expirationDate
      })
      .then(share => {
        context.commit(
          'CURRENT_FILE_OUTGOING_SHARES_ADD',
          _buildCollaboratorShare(
            share.shareInfo,
            context.getters.highlightedFile,
            !context.rootGetters.isOcis
          )
        )
        context.commit('UPDATE_CURRENT_FILE_SHARE_TYPES')
      })
      .catch(e => {
        context.dispatch(
          'showMessage',
          {
            title: $gettext('Error while sharing.'),
            desc: e,
            status: 'danger',
            autoClose: {
              enabled: true
            }
          },
          { root: true }
        )
      })
  },
  deleteShare(context, { client, share }) {
    client.shares
      .deleteShare(share.id)
      .then(() => {
        context.commit('CURRENT_FILE_OUTGOING_SHARES_REMOVE', share)
        context.commit('UPDATE_CURRENT_FILE_SHARE_TYPES')
      })
      .catch(e => {
        console.log(e)
      })
  },
  resetSearch(context) {
    context.commit('SET_SEARCH_TERM', '')
  },
  /**
   * Prune all branches of the shares tree that are
   * unrelated to the given path
   */
  pruneSharesTreeOutsidePath(context, path) {
    context.commit('SHARESTREE_PRUNE_OUTSIDE_PATH', path)
  },
  /**
   * Load shares for each parent of the given path.
   * This will add new entries into the shares tree and will
   * not remove unrelated existing ones.
   */
  loadSharesTree(context, { client, path, $gettext }) {
    context.commit('SHARESTREE_ERROR', null)
    // prune shares tree cache for all unrelated paths, keeping only
    // existing relevant parent entries
    context.dispatch('pruneSharesTreeOutsidePath', path)

    const parentPaths = getParentPaths(path, true)
    const sharesTree = {}

    if (!parentPaths.length) {
      return Promise.resolve()
    }

    // remove last entry which is the root folder
    parentPaths.pop()

    context.commit('SHARESTREE_LOADING', true)

    const shareQueriesQueue = new PQueue({ concurrency: 2 })
    const shareQueriesPromises = []
    parentPaths.forEach(queryPath => {
      // skip already cached paths
      if (context.getters.sharesTree[queryPath]) {
        return Promise.resolve()
      }
      sharesTree[queryPath] = []
      // query the outgoing share information for each of the parent paths
      shareQueriesPromises.push(
        shareQueriesQueue.add(() =>
          client.shares
            .getShares(queryPath, { reshares: true })
            .then(data => {
              data.forEach(element => {
                sharesTree[queryPath].push({
                  ..._buildShare(
                    element.shareInfo,
                    { type: 'folder' },
                    $gettext,
                    !context.rootGetters.isOcis
                  ),
                  outgoing: true,
                  indirect: true
                })
              })
            })
            .catch(error => {
              console.error('SHARESTREE_ERROR', error)
              context.commit('SHARESTREE_ERROR', error.message)
              context.commit('SHARESTREE_LOADING', false)
            })
        )
      )
      // query the incoming share information for each of the parent paths
      shareQueriesPromises.push(
        shareQueriesQueue.add(() =>
          client.shares
            .getShares(queryPath, { shared_with_me: true })
            .then(data => {
              data.forEach(element => {
                sharesTree[queryPath].push({
                  ..._buildCollaboratorShare(
                    element.shareInfo,
                    { type: 'folder' },
                    !context.rootGetters.isOcis
                  ),
                  incoming: true,
                  indirect: true
                })
              })
            })
            .catch(error => {
              console.error('SHARESTREE_ERROR', error)
              context.commit('SHARESTREE_ERROR', error.message)
              context.commit('SHARESTREE_LOADING', false)
            })
        )
      )
    })

    return Promise.all(shareQueriesPromises).then(() => {
      context.commit('SHARESTREE_ADD', sharesTree)
      context.commit('SHARESTREE_LOADING', false)
    })
  },
  dragOver(context, value) {
    context.commit('DRAG_OVER', value)
  },
  setHighlightedFile(context, file) {
    context.commit('SET_HIGHLIGHTED_FILE', file)
  },
  setPublicLinkPassword(context, password) {
    context.commit('SET_PUBLIC_LINK_PASSWORD', password)
  },

  addLink(context, { path, client, $gettext, params }) {
    return new Promise((resolve, reject) => {
      client.shares
        .shareFileWithLink(path, params)
        .then(data => {
          const link = _buildShare(data.shareInfo, null, $gettext, !context.rootGetters.isOcis)
          context.commit('CURRENT_FILE_OUTGOING_SHARES_ADD', link)
          context.commit('UPDATE_CURRENT_FILE_SHARE_TYPES')
          resolve(link)
        })
        .catch(e => {
          reject(e)
        })
    })
  },
  updateLink(context, { id, client, $gettext, params }) {
    return new Promise((resolve, reject) => {
      client.shares
        .updateShare(id, params)
        .then(data => {
          const link = _buildShare(data.shareInfo, null, $gettext, !context.rootGetters.isOcis)
          context.commit('CURRENT_FILE_OUTGOING_SHARES_UPDATE', link)
          resolve(link)
        })
        .catch(e => {
          reject(e)
        })
    })
  },
  removeLink(context, { share, client }) {
    client.shares
      .deleteShare(share.id)
      .then(() => {
        context.commit('CURRENT_FILE_OUTGOING_SHARES_REMOVE', share)
        context.commit('UPDATE_CURRENT_FILE_SHARE_TYPES')
      })
      .catch(e => context.commit('CURRENT_FILE_OUTGOING_SHARES_ERROR', e.message))
  },

  // TODO: Think of a better name
  pendingShare(context, { client, item, type, $gettext }) {
    // TODO: Move request to owncloud-sdk
    client.requests
      .ocs({
        service: 'apps/files_sharing',
        action: `/api/v1/shares/pending/${item.shareId}`,
        method: type
      })
      .then(_ => {
        context.dispatch('loadFolderSharedWithMe', {
          client: client,
          $gettext: $gettext
        })
      })
      .catch(e => {
        context.dispatch(
          'showMessage',
          {
            title: $gettext('Error while changing share state'),
            desc: e.message,
            status: 'danger',
            autoClose: {
              enabled: true
            }
          },
          { root: true }
        )
      })
  },

  addActionToProgress({ commit }, item) {
    commit('ADD_ACTION_TO_PROGRESS', item)
  },

  removeActionFromProgress({ commit }, item) {
    commit('REMOVE_ACTION_FROM_PROGRESS', item)
  },

  pushResourcesToDeleteList({ commit }, resources) {
    commit('PUSH_RESOURCES_TO_DELETE_LIST', resources)
  },

  clearResourcesToDeleteList({ commit }) {
    commit('CLEAR_RESOURCES_TO_DELETE_LIST')
  }
}
