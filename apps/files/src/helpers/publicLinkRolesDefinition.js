// Return original string in case no translate function is provided
function returnOriginal (string) {
  return string
}

// TODO: see comment about default role and roles API in collaboratorRolesDefinition.js
/**
 * Returns object with public link roles
 * @param {boolean} isFolder  Defines if the item is folder
 * @param {function} $gettext  Function to translate necessary strings
 * @returns {object}  Public link roles
 */
export default ({ isFolder = false, translate = returnOriginal }) => {
  const roles = {
    viewer: {
      name: 'viewer',
      label: translate('Viewer'),
      description: translate('Recipients can view and download contents.'),
      permissions: 1
    }
  }
  if (isFolder) {
    roles.contributor = {
      name: 'contributor',
      label: translate('Contributor'),
      description: translate('Recipients can view, download and upload contents.'),
      permissions: 5
    }
    roles.editor = {
      name: 'editor',
      label: translate('Editor'),
      description: translate('Recipients can view, download, edit, delete and upload contents.'),
      permissions: 15
    }
    roles.uploader = {
      name: 'uploader',
      label: translate('Uploader'),
      description: translate('Receive files from multiple recipients without revealing the contents of the folder.'),
      permissions: 4
    }
  }
  return roles
}
