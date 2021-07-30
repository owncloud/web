const meta = {
  files: {
    name: 'Files',
    id: 'files',
    icon: 'folder'
  },
  mediaviewer: {
    name: 'Mediaviewer',
    id: 'mediaviewer',
    icon: 'image'
  },
  'draw-io': {
    name: 'Draw.io',
    id: 'draw-io',
    icon: 'grid_on'
  },
  'markdown-editor': {
    name: 'MarkdownEditor',
    id: 'markdown-editor',
    icon: 'text'
  }
}

const routes = [
  'files-personal',
  'files-favorites',
  'files-shared-with-others',
  'files-shared-with-me',
  'files-public-list'
]

const editors = [
  {
    app: 'draw-io',
    extension: 'drawio',
    handler: null,
    icon: null,
    newTab: true,
    routeName: 'draw-io-edit',
    routes
  },
  {
    app: 'mediaviewer',
    extension: 'png',
    handler: null,
    icon: null,
    newTab: false,
    routeName: 'mediaviewer-media',
    routes
  },
  {
    app: 'markdown-editor',
    extension: 'md',
    handler: null,
    icon: null,
    newTab: false,
    routeName: 'markdown-editor',
    routes
  }
]

const sideBars = [
  {
    app: 'details-item',
    enabled: jest.fn(),
    icon: 'info_outline'
  },
  {
    app: 'actions-item',
    enabled: jest.fn(),
    icon: 'info_outline'
  }
]

exports.apps = {
  customFileListIndicators: [],
  file: {
    edit: false,
    path: ''
  },
  fileEditors: editors,
  fileSideBars: sideBars,
  newFileHandlers: editors,
  meta
}

const basicActions = {
  download: {
    class: 'oc-files-actions-sidebar-download-trigger',
    selector: '.oc-files-actions-sidebar-download-trigger',
    handler: jest.fn()
  },
  copy: {
    class: 'oc-files-actions-sidebar-copy-trigger',
    selector: '.oc-files-actions-sidebar-copy-trigger',
    handler: jest.fn()
  },
  rename: {
    class: 'oc-files-actions-sidebar-rename-trigger',
    selector: '.oc-files-actions-sidebar-rename-trigger',
    handler: jest.fn()
  },
  move: {
    class: 'oc-files-actions-sidebar-move-trigger',
    selector: '.oc-files-actions-sidebar-move-trigger',
    handler: jest.fn()
  },
  delete: {
    class: 'oc-files-actions-sidebar-delete-trigger',
    selector: '.oc-files-actions-sidebar-delete-trigger',
    handler: jest.fn()
  }
}

const extraActions = {
  'markdown-editor': {
    class: 'oc-files-actions-sidebar-markdown-editor-trigger',
    selector: '.oc-files-actions-sidebar-markdown-editor-trigger',
    handler: jest.fn()
  },
  'draw-io': {
    class: 'oc-files-actions-sidebar-draw-io-trigger',
    selector: '.oc-files-actions-sidebar-draw-io-trigger',
    handler: jest.fn()
  },
  mediaviewer: {
    class: 'oc-files-actions-sidebar-mediaviewer-trigger',
    selector: '.oc-files-actions-sidebar-mediaviewer-trigger',
    handler: jest.fn()
  },
  'open-folder': {
    class: 'oc-files-actions-sidebar-navigate-trigger',
    selector: '.oc-files-actions-sidebar-navigate-trigger',
    handler: jest.fn()
  }
}

exports.basicActions = basicActions
exports.extraActions = extraActions

exports.getActions = function(extractions = []) {
  const actions = []
  for (const key in basicActions) {
    const action = basicActions[key]

    const actionObj = {
      icon: key,
      handler: action.handler,
      isEnabled: () => true,
      label: () => key,
      componentType: 'oc-button',
      class: action.class
    }
    if (key === 'download') {
      actionObj.canBeDefault = true
    }
    actions.push(actionObj)
  }
  for (const key of extractions) {
    const action = extraActions[key]
    actions.push({
      icon: key,
      handler: action.handler,
      isEnabled: () => true,
      label: () => key,
      componentType: 'oc-button',
      class: action.class,
      canBeDefault: true
    })
  }
  return actions
}

exports.filesPersonalRoute = { name: 'files-personal' }
