import fixtureFiles from '../__fixtures__/files'
import fixtureUsers from '../__fixtures__/users'
import fixtureFavoriteFiles from '../__fixtures__/favoriteFiles'
import fixtureSharedFiles from '../__fixtures__/sharedFiles'
import fixtureSharedViaLinksFiles from '../__fixtures__/sharedViaLinkFiles'
import fixtureSharedWithMeFiles from '../__fixtures__/sharedWithMeFiles'
import fixtureDeletedFiles from '../__fixtures__/deletedFiles'
import fixturePublicFiles from '../__fixtures__/publicFiles'
import fixtureRecipients from '../__fixtures__/recipients'
import { DateTime } from 'luxon'

const mockPath = (path) => {
  if (path.startsWith('/files/')) {
    path = '/' + path.split('/').splice(3).join('/')
  }
  return path
}

export default {
  files: {
    list: (path = '/') => {
      return fixtureFiles[mockPath(path)]
    },
    getFavoriteFiles: () => fixtureFavoriteFiles,
    fileInfo: (path) => {
      return fixtureFiles[mockPath(path)][0]
    }
  },
  users: {
    getUser: (id) => fixtureUsers[id]
  },
  requests: {
    ocs: ({ service, action, method }) => {
      if (action.includes('share_types=3')) {
        return fixtureSharedViaLinksFiles
      }

      if (action.includes('shared_with_me=true')) {
        return fixtureSharedWithMeFiles
      }

      return fixtureSharedFiles
    }
  },
  fileTrash: {
    list: () => fixtureDeletedFiles
  },
  publicFiles: {
    PUBLIC_LINK_ITEM_TYPE: '{http://owncloud.org/ns}public-link-item-type',
    PUBLIC_LINK_PERMISSION: '{http://owncloud.org/ns}public-link-permission',
    PUBLIC_LINK_EXPIRATION: '{http://owncloud.org/ns}public-link-expiration',
    PUBLIC_LINK_SHARE_DATETIME: '{http://owncloud.org/ns}public-link-share-datetime',
    PUBLIC_LINK_SHARE_OWNER: '{http://owncloud.org/ns}public-link-share-owner',
    list: (path) => fixturePublicFiles[path]
  },
  shares: {
    getShares: () => Promise.resolve(),
    getRecipients,
    shareFileWithUser: (path, id, params) =>
      Promise.resolve({
        shareInfo: {
          id: '1',
          share_type: 0,
          uid_owner: 'alice', // TODO: get user dynamically
          displayname_owner: 'alice', // TODO: get user dynamically
          permissions: params.permissions,
          stime: new Date().getTime(),
          expiration: params.expirationDate,
          uid_file_owner: 'alice', // TODO: get user dynamically
          displayname_file_owner: 'alice', // TODO: get user dynamically
          path,
          item_type: 'folder', // TODO: get item type dynamically
          item_source: 10,
          file_source: 10,
          file_parent: 6,
          file_target: path,
          share_with: id,
          share_with_displayname: id
        }
      }),
    shareFileWithGroup: () => Promise.resolve(),
    updateShare: (id, params) => {
      let shareInfo

      if (params.name === 'Public link') {
        shareInfo = {
          id: 1,
          share_type: 3,
          permissions: params.permissions,
          stime: new Date().getTime(),
          expiration: params.expirationDate,
          uid_file_owner: 'alice', // TODO: get user dynamically
          displayname_file_owner: 'alice', // TODO: get user dynamically
          path: '/Documents',
          item_type: 'folder', // TODO: get item type dynamically
          item_source: 10,
          file_source: 10,
          file_parent: 6,
          file_target: '/Documents',
          token: 'token',
          url: 'url',
          name: 'Public link'
        }

        if (params.expireDate) {
          shareInfo.expiration = DateTime.fromISO(params.expireDate).toFormat('yyyy-MM-dd HH:mm:ss')
        }
      } else {
        shareInfo = {
          id,
          share_type: 0,
          uid_owner: 'alice', // TODO: get user dynamically
          displayname_owner: 'alice', // TODO: get user dynamically
          permissions: params.permissions,
          stime: new Date().getTime(),
          uid_file_owner: 'alice', // TODO: get user dynamically
          displayname_file_owner: 'alice', // TODO: get user dynamically
          path: '/Documents', // TODO: get path dynamically
          item_type: 'folder', // TODO: get item type dynamically
          item_source: 10,
          file_source: 10,
          file_parent: 6,
          file_target: '/Documents', // TODO: get path dynamically
          share_with: 'bob', // TODO: get user dynamically
          share_with_displayname: 'bob' // TODO: get user dynamically
        }

        if (params.expireDate) {
          shareInfo.expiration = params.expireDate
        }
      }

      const share = { shareInfo }

      return Promise.resolve(share)
    },
    shareFileWithLink: (path, params) => {
      const share = {
        shareInfo: {
          id: '1',
          share_type: 3,
          permissions: params.permissions,
          stime: new Date().getTime(),
          expiration: params.expirationDate,
          uid_file_owner: 'alice', // TODO: get user dynamically
          displayname_file_owner: 'alice', // TODO: get user dynamically
          path,
          item_type: 'folder', // TODO: get item type dynamically
          item_source: 10,
          file_source: 10,
          file_parent: 6,
          file_target: path,
          token: 'token',
          url: 'url',
          name: 'Public link'
        }
      }

      if (params.expireDate) {
        share.shareInfo.expiration = DateTime.fromISO(params.expireDate).toFormat(
          'yyyy-MM-dd HH:mm:ss'
        )
      }

      return Promise.resolve(share)
    }
  }
}

function getRecipients(query) {
  const users = fixtureRecipients.users.filter((user) => user.label.includes(query))

  return { exact: { users, groups: [], remotes: [] }, users: [], groups: [], remotes: [] }
}
