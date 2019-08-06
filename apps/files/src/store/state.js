import { fileFilters } from '../fileFilters.js'
export default {
  currentFolder: null,
  files: [],
  filesSearched: [],
  fileFilter: fileFilters,
  selected: [],
  inProgress: [],
  searchTermGlobal: '',
  searchTermFilter: '',
  davProperties: [
    '{http://owncloud.org/ns}permissions',
    '{http://owncloud.org/ns}favorite',
    '{http://owncloud.org/ns}fileid',
    '{http://owncloud.org/ns}owner-id',
    '{http://owncloud.org/ns}owner-display-name',
    '{http://owncloud.org/ns}privatelink',
    '{DAV:}getcontentlength',
    '{http://owncloud.org/ns}size',
    '{DAV:}getlastmodified',
    '{DAV:}getetag',
    '{DAV:}resourcetype'
  ],
  dropzone: false,
  shareOpen: null,
  shares: [],
  sharesError: null,
  sharesLoading: false,

  links: [],
  linksError: null,
  linksLoading: false,

  loadingFolder: false,
  freeSpace: 0,
  trashbinDeleteMessage: '',
  filesDeleteMessage: '',
  overwriteDialogTitle: null,
  overwriteDialogMessage: null,
  highlightedFile: null,
  collaboratorSaving: false,
  publicLinkPassword: null,
  collaboratorsEditInProgress: false
}
