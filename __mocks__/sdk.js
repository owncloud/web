import fixtureFiles from '../__fixtures__/files'
import fixtureUsers from '../__fixtures__/users'
import fixtureFavoriteFiles from '../__fixtures__/favoriteFiles'
import fixtureSharedFiles from '../__fixtures__/sharedFiles'
import fixtureSharedViaLinksFiles from '../__fixtures__/sharedViaLinkFiles'
import fixtureSharedWithMeFiles from '../__fixtures__/sharedWithMeFiles'
import fixtureDeletedFiles from '../__fixtures__/deletedFiles'
import fixturePublicFiles from '../__fixtures__/publicFiles'

export default {
  files: {
    list: (path = '/') => fixtureFiles[path],
    getFavoriteFiles: () => fixtureFavoriteFiles,
    fileInfo: path => fixtureFiles[path][0]
  },
  users: {
    getUser: id => fixtureUsers[id]
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
    list: path => fixturePublicFiles[path]
  },
  shares: {
    getShares: () => new Promise(resolve => resolve())
  }
}
