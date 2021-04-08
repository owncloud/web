// Return original string in case no translate function is provided
function returnOriginal(string) {
  return string
}

// TODO: Bring default role in here. Later might go to the roles API
/**
 * Returns object with collaborator roles
 * @param {boolean} isFolder  Defines if the item is folder
 * @param {function} $gettext  Function to translate necessary strings
 * @param {boolean} allowSharePerm Asserts whether share permission is allowed
 * @returns {object}  Collaborator roles
 */
export default ({ isFolder = false, $gettext = returnOriginal, allowSharePerm = false }) => {
  if (isFolder) {
    return [
      {
        name: 'viewer',
        label: $gettext('Viewer'),
        description: allowSharePerm
          ? $gettext('Download, preview and share')
          : $gettext('Download and preview'),
        permissions: allowSharePerm ? ['read', 'share'] : ['read']
      },
      {
        name: 'editor',
        label: $gettext('Editor'),
        description: allowSharePerm
          ? $gettext('Upload, edit, delete, download, preview and share')
          : $gettext('Upload, edit, delete, download and preview'),
        permissions: allowSharePerm
          ? ['read', 'update', 'create', 'delete', 'share']
          : ['read', 'update', 'create', 'delete']
      }
    ]
  }

  return [
    {
      name: 'viewer',
      label: $gettext('Viewer'),
      description: allowSharePerm
        ? $gettext('Download, preview and share')
        : $gettext('Download and preview'),
      permissions: allowSharePerm ? ['read', 'share'] : ['read']
    },
    {
      name: 'editor',
      label: $gettext('Editor'),
      description: allowSharePerm
        ? $gettext('Edit, download, preview and share')
        : $gettext('Edit, download and preview'),
      permissions: allowSharePerm ? ['read', 'update', 'share'] : ['read', 'update']
    }
  ]
}
