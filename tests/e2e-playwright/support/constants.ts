import { sidebar } from '../../e2e/support/objects/app-files/utils'

export const actionTypes = {
  contextMenu: 'CONTEXT_MENU',
  batchActions: 'BATCH_ACTION',
  sideBarPanel: 'SIDEBAR_PANEL'
} as const

export const clients = {
  desktop: 'desktop',
  mobile: 'mobile'
} as const

export type Client = (typeof clients)[keyof typeof clients]

export const searchFilters = {
  allFiles: 'all files',
  currentFolder: 'current folder'
} as const

export type SearchFilters = typeof searchFilters.allFiles | typeof searchFilters.currentFolder

export const displayedResourceTypes = {
  searchList: 'search list',
  filesList: 'files list',
  shares: 'Shares',
  trashbin: 'trashbin'
} as const

export type DisplayedResourceTypes =
  | typeof displayedResourceTypes.searchList
  | typeof displayedResourceTypes.filesList
  | typeof displayedResourceTypes.shares
  | typeof displayedResourceTypes.trashbin

// editors

export const editors = {
  collabora: 'Collabora',
  onlyOffice: 'OnlyOffice'
} as const

export type Editor = (typeof editors)[keyof typeof editors]

export const applications = {
  mediaViewer: 'mediaviewer',
  pdfViewer: 'pdfviewer',
  textEditor: 'texteditor',
  collabora: 'Collabora',
  onlyOffice: 'OnlyOffice',
  audioviewer: 'audioviewer'
} as const

export type Applications =
  | typeof applications.mediaViewer
  | typeof applications.pdfViewer
  | typeof applications.textEditor
  | typeof applications.collabora
  | typeof applications.onlyOffice
  | typeof applications.audioviewer

export const fileViewerTypes = {
  textEditor: 'text-editor',
  pdfViewer: 'pdf-viewer',
  mediaViewer: 'media-viewer'
} as const
