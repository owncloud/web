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
    icon: 'grid'
  },
  'markdown-editor': {
    name: 'MarkdownEditor',
    id: 'markdown-editor',
    icon: 'file-text'
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
    icon: 'information'
  },
  {
    app: 'actions-item',
    enabled: jest.fn(),
    icon: 'information'
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

const fileActions = {
  download: {
    name: 'download-file',
    icon: 'file-download',
    handler: jest.fn(),
    label: () => 'Download',
    componentType: 'oc-button',
    class: 'oc-files-actions-download-file-trigger',
    selector: '.oc-files-actions-download-file-trigger'
  },
  copy: {
    name: 'copy',
    icon: 'file-copy',
    handler: jest.fn(),
    label: () => 'Copy',
    componentType: 'oc-button',
    class: 'oc-files-actions-copy-trigger',
    selector: '.oc-files-actions-copy-trigger'
  },
  rename: {
    name: 'rename',
    icon: 'pencil',
    handler: jest.fn(),
    label: () => 'Rename',
    componentType: 'oc-button',
    class: 'oc-files-actions-rename-trigger',
    selector: '.oc-files-actions--rename-trigger'
  },
  move: {
    name: 'move',
    icon: 'folder-shared',
    handler: jest.fn(),
    label: () => 'Move',
    componentType: 'oc-button',
    class: 'oc-files-actions-move-trigger',
    selector: '.oc-files-actions-move-trigger'
  },
  delete: {
    name: 'delete',
    icon: 'delete-bin-5',
    handler: jest.fn(),
    label: () => 'Delete',
    componentType: 'oc-button',
    class: 'oc-files-actions-delete-trigger',
    selector: '.oc-files-actions-delete-trigger'
  },

  'markdown-editor': {
    handler: jest.fn(),
    label: () => 'Open in Markdown Editor',
    class: 'oc-files-actions-markdown-editor-trigger',
    selector: '.oc-files-actions-markdown-editor-trigger',
    opensInNewWindow: true
  },
  'draw-io': {
    handler: jest.fn(),
    label: () => 'Open in DrawIO',
    class: 'oc-files-actions-draw-io-trigger',
    selector: '.oc-files-actions-draw-io-trigger',
    opensInNewWindow: true
  },
  mediaviewer: {
    handler: jest.fn(),
    label: () => 'Open in MediaViewer',
    class: 'oc-files-actions-mediaviewer-trigger',
    selector: '.oc-files-actions-mediaviewer-trigger'
  },
  navigate: {
    name: 'navigate',
    icon: 'folder-open',
    route: () => ({ name: 'files-personal' }),
    label: () => 'Open Folder',
    componentType: 'router-link',
    class: 'oc-files-actions-navigate-trigger',
    selector: '.oc-files-actions-navigate-trigger'
  }
}

exports.fileActions = fileActions

exports.getActions = function (actions = []) {
  const defaultActions = ['download', 'markdown-editor', 'draw-io', 'mediaviewer', 'navigate']

  const res = []
  for (const key of actions) {
    const action = fileActions[key]

    const actionObj = {
      name: action.name,
      icon: action.icon || key,
      handler: action.handler,
      label: action.label,
      isEnabled: () => true,
      componentType: action.componentType || 'oc-button',
      class: action.class,
      canBeDefault: defaultActions.indexOf(key) > -1,
      opensInNewWindow: action.opensInNewWindow || false
    }
    res.push(actionObj)
  }
  return res
}

exports.filesPersonalRoute = { name: 'files-personal' }
