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
    '{DAV:}getcontentlength',
    '{http://owncloud.org/ns}size',
    '{DAV:}getlastmodified',
    '{DAV:}getetag',
    '{DAV:}resourcetype'
  ],
  dropzone: false
}
