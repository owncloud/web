export type OwnCloudSdk = {
  helpers: {
    _davPath: string
  }
  /** @deprecated */
  files: {
    createFolder(...args): any
    fileInfo(...args): any
    getFileUrl(...args): any
    list(...args): any
    getFileContents(...args): any
    putFileContents(...args): any
    getFavoriteFiles(...args): any
    getPathForFileId(fileId: string | number): Promise<string>
    search(...args): any
    copy(...args): any
    move(...args): any
    delete(...args): any
  }
  /** @deprecated */
  fileTrash: {
    list(...args): any
    restore(...args): any
    clearTrashBin(...args): any
  }
  /** @deprecated */
  fileVersions: {
    getFileVersionUrl(...args): any
    restoreFileVersion(...args): any
  }
  /** @deprecated */
  publicFiles: {
    PUBLIC_LINK_SHARE_OWNER: string

    createFolder(...args): any
    delete(...args): any
    download(...args): any
    list(...args): any
    getFileContents(...args): any
    getFileInfo(...args): any
    getFileUrl(...args): any
    putFileContents(...args): any
    copy(...args): any
    move(...args): any
  }
  requests: {
    ocs(options: Record<string, any>): ReturnType<typeof fetch>
  }
  settings: {
    getSettingsValues(...args): any
  }
  shares: {
    getShare(...args): any
    getShares(...args): any
    getProtectedTokenInfo(...args): any
    getRecipients(...args): any
    getUnprotectedTokenInfo(...args): any
    shareFileWithGroup(...args): any
    shareFileWithUser(...args): any
    shareFileWithLink(...args): any
    deleteShare(...args): any
    updateShare(...args): any
    notifyShare(...args): any
  }
  /** @deprecated */
  tags: {
    addResourceTag(...args): any
    removeResourceTag(...args): any
  }
  /** @deprecated */
  users: {
    getUser(...args): any
    getUserGroups(...args): any
  }
  /** @deprecated */
  getCurrentUser(...args): any
  init(...args): any
  signUrl(...args): any
}
