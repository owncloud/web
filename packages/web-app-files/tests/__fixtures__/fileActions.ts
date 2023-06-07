export const meta = {
  files: {
    name: 'Files',
    id: 'files',
    icon: 'folder'
  },
  preview: {
    name: 'Preview',
    id: 'preview',
    icon: 'image'
  },
  'draw-io': {
    name: 'Draw.io',
    id: 'draw-io',
    icon: 'grid'
  },
  'text-editor': {
    name: 'Text Editor',
    id: 'text-editor',
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

export const editors = [
  {
    app: 'draw-io',
    extension: 'drawio',
    handler: null,
    icon: null,
    routeName: 'draw-io-edit',
    routes
  },
  {
    app: 'preview',
    extension: 'png',
    handler: null,
    icon: null,
    routeName: 'preview-media',
    routes
  },
  {
    app: 'text-editor',
    extension: 'md',
    handler: null,
    icon: null,
    routeName: 'text-editor',
    routes
  }
]

const sideBars = [
  {
    app: 'details',
    enabled: jest.fn(),
    icon: 'information'
  },
  {
    app: 'actions',
    enabled: jest.fn(),
    icon: 'information'
  }
]

export const apps = {
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

export const fileActions = {
  download: {
    name: 'download-file',
    icon: 'file-download',
    handler: jest.fn(),
    label: () => 'Download',
    componentType: 'button',
    class: 'oc-files-actions-download-file-trigger',
    selector: '.oc-files-actions-download-file-trigger'
  },
  copy: {
    name: 'copy',
    icon: 'file-copy',
    handler: jest.fn(),
    label: () => 'Copy',
    componentType: 'button',
    class: 'oc-files-actions-copy-trigger',
    selector: '.oc-files-actions-copy-trigger'
  },
  rename: {
    name: 'rename',
    icon: 'pencil',
    handler: jest.fn(),
    label: () => 'Rename',
    componentType: 'button',
    class: 'oc-files-actions-rename-trigger',
    selector: '.oc-files-actions--rename-trigger'
  },
  move: {
    name: 'move',
    icon: 'folder-shared',
    handler: jest.fn(),
    label: () => 'Move',
    componentType: 'button',
    class: 'oc-files-actions-move-trigger',
    selector: '.oc-files-actions-move-trigger'
  },
  delete: {
    name: 'delete',
    icon: 'delete-bin-5',
    handler: jest.fn(),
    label: () => 'Delete',
    componentType: 'button',
    class: 'oc-files-actions-delete-trigger',
    selector: '.oc-files-actions-delete-trigger'
  },

  'text-editor': {
    handler: jest.fn(),
    label: () => 'Open in Text Editor',
    componentType: 'button',
    class: 'oc-files-actions-text-editor-trigger',
    selector: '.oc-files-actions-text-editor-trigger',
    opensInNewWindow: true
  },
  'draw-io': {
    handler: jest.fn(),
    label: () => 'Open in DrawIO',
    componentType: 'button',
    class: 'oc-files-actions-draw-io-trigger',
    selector: '.oc-files-actions-draw-io-trigger',
    opensInNewWindow: true
  },
  preview: {
    handler: jest.fn(),
    label: () => 'Open in Preview',
    componentType: 'button',
    class: 'oc-files-actions-preview-trigger',
    selector: '.oc-files-actions-preview-trigger'
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

export const getActions = function (actions = []) {
  const defaultActions = ['download', 'text-editor', 'draw-io', 'preview', 'navigate']

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
      hasPriority: defaultActions.indexOf(key) > -1,
      opensInNewWindow: action.opensInNewWindow || false
    }
    res.push(actionObj)
  }
  return res
}

export const filesPersonalRoute = { name: 'files-personal' }
