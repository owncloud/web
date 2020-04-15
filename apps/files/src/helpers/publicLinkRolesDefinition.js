// Return original string in case no translate function is provided
function returnOriginal(string) {
  return string
}

// TODO: see comment about default role and roles API in collaboratorRolesDefinition.js
/**
 * Returns object with public link roles
 * @param {boolean} isFolder  Defines if the item is folder
 * @param {function} $gettext  Function to translate necessary strings
 * @returns {object}  Public link roles
 */
export default ({ isFolder = false, $gettext = returnOriginal }) => {
  const roles = {
    viewer: {
      name: 'viewer',
      label: $gettext('Viewer'),
      description: $gettext('Recipients can view and download contents.'),
      permissions: 1
    }
  }
  if (isFolder) {
    roles.contributor = {
      name: 'contributor',
      label: $gettext('Contributor'),
      description: $gettext('Recipients can view, download and upload contents.'),
      permissions: 5
    }
    roles.editor = {
      name: 'editor',
      label: $gettext('Editor'),
      description: $gettext('Recipients can view, download, edit, delete and upload contents.'),
      permissions: 15
    }
    roles.uploader = {
      name: 'uploader',
      label: $gettext('Uploader'),
      description: $gettext('Recipients can upload but existing contents are not revealed.'),
      permissions: 4
    }
  }
  return roles
}
