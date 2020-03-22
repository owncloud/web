// Return original string in case no translate function is provided
function returnOriginal(string) {
  return string
}

// TODO: Bring default role in here. Later might go to the roles API
/**
 * Returns object with collaborator roles
 * @param {boolean} isFolder  Defines if the item is folder
 * @param {function} $gettext  Function to translate neccessary strings
 * @returns {object}  Collaborator roles
 */
export default ({ isFolder = false, $gettext = returnOriginal }) => {
  if (isFolder) {
    return {
      viewer: {
        name: 'viewer',
        label: $gettext('Viewer'),
        description: $gettext('Download and preview'),
        permissions: ['read'],
        additionalPermissions: {
          share: {
            name: 'share',
            description: $gettext('Allow re-Sharing')
          }
        }
      },
      editor: {
        name: 'editor',
        label: $gettext('Editor'),
        description: $gettext('Upload, edit, delete, download and preview'),
        permissions: ['read', 'update', 'create', 'delete'],
        additionalPermissions: {
          share: {
            name: 'share',
            description: $gettext('Allow re-Sharing')
          }
        }
      }
    }
  }

  return {
    viewer: {
      name: 'viewer',
      label: $gettext('Viewer'),
      description: $gettext('Download and preview'),
      permissions: ['read'],
      additionalPermissions: {
        share: {
          name: 'share',
          description: $gettext('Allow re-Sharing')
        }
      }
    },
    editor: {
      name: 'editor',
      label: $gettext('Editor'),
      description: $gettext('Edit, download and preview'),
      permissions: ['read', 'update'],
      additionalPermissions: {
        share: {
          name: 'share',
          description: $gettext('Allow re-Sharing')
        }
      }
    }
  }
}
