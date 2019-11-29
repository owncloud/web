import { fileFilters } from '../fileFilters.js'
export default {
  currentFolder: null,
  files: [],
  filesSearched: [],
  fileFilter: fileFilters,
  fileSortMode: 'name',
  selected: [],
  inProgress: [],
  searchTermGlobal: '',
  searchTermFilter: '',
  dropzone: false,
  shareOpen: null,
  shares: [],
  sharesError: null,
  sharesLoading: false,

  links: [],
  linksError: null,
  linksLoading: false,

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
