export type OwnCloudSdk = {
  files: {
    createFolder(...args): any
    fileInfo(...args): any
    getFileUrl(...args): any
    list(...args): any
    getFileContents(...args): any
    putFileContents(...args): any
    getFavoriteFiles(...args): any
    search(...args): any
    copy(...args): any
    move(...args): any
  }
  fileTrash: {
    list(...args): any
  }
  publicFiles: {
    createFolder(...args): any
    download(...args): any
    list(...args): any
    getFileContents(...args): any
    getFileInfo(...args): any
    getFileUrl(...args): any
    putFileContents(...args): any
    copy(...args): any
    move(...args): any
  }
  settings: {
    getSettingsValues(...args): any
  }
  shares: {
    getShare(...args): any
    getShares(...args): any
  }
  users: {
    getUser(...args): any
    getUserGroups(...args): any
  }
  getCurrentUser(...args): any
  init(...args): any
  signUrl(...args): any
}
