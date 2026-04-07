export const actions = {
  contextMenu: 'CONTEXT_MENU',
  batchAction: 'BATCH_ACTION',
  sideBarPanel: 'SIDEBAR_PANEL',
  singleShareView: 'SINGLE_SHARE_VIEW',
  previewTopBar: 'PREVIEW_TOPBAR'
} as const

export const clients = {
  mobile: 'mobile',
  desktop: 'desktop'
} as const

export const applications = {
  textEditor: 'texteditor',
  pdfViewer: 'pdfviewer',
  mediaViewer: 'mediaviewer',
  collabora: 'Collabora',
  onlyOffice: 'OnlyOffice'
} as const

export const searchFilters = {
  allfiles: 'all files',
  currentFolder: 'current folder'
} as const

export const displayedResources = {
  searchList: 'search list',
  filesList: 'files list',
  shares: 'Shares',
  trashbin: 'trashbin'
} as const