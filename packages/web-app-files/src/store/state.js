export default {
  currentFolder: null,
  files: [],
  filesSearched: null,
  selectedIds: [],
  clipboardResources: [],
  clipboardAction: null,
  versions: [],
  spaces: [],

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

  publicLinkPassword: null,

  /**
   * View settings
   */
  areHiddenFilesShown: true,
  areFileExtensionsShown: true
}
