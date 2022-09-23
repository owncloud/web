export default {
  currentFolder: null,
  files: [],
  filesSearched: null,
  selectedIds: [],
  latestSelectedId: null,
  clipboardSpace: null,
  clipboardResources: [],
  clipboardAction: null,
  versions: [],

  /**
   * Outgoing shares and links from currently highlighted element
   */
  currentFileOutgoingShares: [],

  /**
   * Incoming shares from currently highlighted element
   */
  incomingShares: [],

  /**
   * Shares from parent folders
   **/
  sharesTree: {},
  sharesTreeError: null,
  sharesTreeLoading: false,

  /**
   * View settings
   */
  areHiddenFilesShown: true,
  areFileExtensionsShown: true
}
