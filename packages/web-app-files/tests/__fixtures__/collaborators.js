exports.roles = {
  viewer: {
    description: 'Download, preview and share',
    label: 'Viewer',
    name: 'viewer',
    inlineLabel: 'viewer',
    permissions: ['read', 'share']
  },

  editor: {
    description: 'Edit, download, preview and share',
    label: 'Editor',
    name: 'editor',
    inlineLabel: 'editor',
    permissions: ['read', 'update', 'share']
  },

  advancedPermissions: {
    name: 'advancedRole',
    label: 'Custom permissions',
    description: 'Set detailed permissions',
    permissions: ['read'],
    inlineLabel: 'custom permissions',
    additionalPermissions: {
      update: { name: 'update', description: 'Edit' },
      share: { name: 'share', description: 'Share' }
    }
  }
}
