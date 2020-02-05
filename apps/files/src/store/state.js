export default {
  currentFolder: null,
  files: [],
  filesSearched: [],
  fileSortMode: 'name',
  selected: [],
  inProgress: [],
  searchTermGlobal: '',
  davProperties: [
    '{http://owncloud.org/ns}permissions',
    '{http://owncloud.org/ns}favorite',
    '{http://owncloud.org/ns}fileid',
    '{http://owncloud.org/ns}owner-id',
    '{http://owncloud.org/ns}owner-display-name',
    '{http://owncloud.org/ns}share-types',
    '{http://owncloud.org/ns}privatelink',
    '{DAV:}getcontentlength',
    '{http://owncloud.org/ns}size',
    '{DAV:}getlastmodified',
    '{DAV:}getetag',
    '{DAV:}resourcetype'
  ],
  dropzone: false,
  shareOpen: null,

  /**
   * Outgoing shares from currently highlighted element
   */
  shares: [],
  sharesError: null,
  sharesLoading: false,

  /**
   * Incoming shares from currently highlighted element
   */
  incomingShares: [],
  incomingSharesError: null,
  incomingSharesLoading: false,

  /**
   * Link shares from currently highlighted element
   */
  links: [],
  linksError: null,
  linksLoading: false,

  /**
   * Shares from parent folders
   **/
  sharesTree: {},
  sharesTreeError: null,
  sharesTreeLoading: false,

  loadingFolder: false,
  quota: {},
  trashbinDeleteMessage: '',
  overwriteDialogTitle: null,
  overwriteDialogMessage: null,
  highlightedFile: null,
  collaboratorSaving: false,
  publicLinkPassword: null,
  collaboratorsEditInProgress: false,
  uploaded: [],
  actionsInProgress: [],

  // rename dialog
  renameDialogOpen: false,
  renameDialogNewName: '',
  renameDialogOriginalName: null,
  renameDialogSelectedFile: null,

  // delete dialog
  deleteDialogOpen: false,
  deleteDialogSelectedFiles: null,
  deleteDialogMessage: ''
}
