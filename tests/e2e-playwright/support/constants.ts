export const actions = {
  contextMenu: 'CONTEXT_MENU',
  batchAction: 'BATCH_ACTION',
  sideBarPanel: 'SIDEBAR_PANEL',
  quickAction: 'QUICK_ACTION',
  urlNavigation: 'URL_NAVIGATION',
  singleShareView: 'SINGLE_SHARE_VIEW',
  previewTopBar: 'PREVIEW_TOPBAR',
  keyboard: 'KEYBOARD',
  dropDownMenu: 'DROP_DOWN_MENU',
  dragDrop: 'DRAG_DROP',
  dragDropBreadcrumb: 'DRAG_DROP_BREADCRUMB'
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
  currentFolder: 'current folder',
  mediaType: 'mediaType',
  tags: 'tags',
  lastModified: 'lastModified',
  fullText: 'fullText'
} as const

export const displayedResources = {
  searchList: 'search list',
  filesList: 'files list',
  shares: 'Shares',
  trashbin: 'trashbin'
} as const

export const buttonLabels = {
  linkDirect: 'link-direct',
  linkIndirect: 'link-indirect',
  userDirect: 'user-direct',
  userIndirect: 'user-indirect'
} as const
