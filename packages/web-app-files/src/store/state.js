export default {
  currentFolder: null,
  files: [],
  filesSearched: null,
  selectedIds: [],
  versions: [],

  /**
   * Outgoing shares and links from currently highlighted element
   */
  currentFileOutgoingShares: [],
  currentFileOutgoingSharesError: null,
  currentFileOutgoingSharesLoading: false,

  /**
   * Incoming shares from currently highlighted element
   */
  incomingShares: [],
  incomingSharesError: null,
  incomingSharesLoading: false,

  /**
   * Shares from parent folders
   **/
  sharesTree: {},
  sharesTreeError: null,
  sharesTreeLoading: false,

  loadingFolder: false,
  publicLinkPassword: null,
  actionsInProgress: [],

  /**
   * View settings
   */
  areHiddenFilesShown: true,
  areFileExtensionsShown: true
}
