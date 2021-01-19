import filesize from 'filesize'
import fileIconMappings from '../fileTypeIconMappings.json'

/**
 * Returns formatted size of given resource
 * @param {Number} size Unformatted size of the resource
 * @returns {String} formatted size
 */
export function getResourceSize(size) {
  if (size < 0) {
    return ''
  }

  if (isNaN(size)) {
    return '?'
  }

  const mb = 1048576

  // TODO: Pass current language as locale to display correct separator
  return filesize(size, {
    round: size < mb ? 0 : 1
  })
}

// Should we move this to ODS?
function getFileIcon(extension) {
  const icon = fileIconMappings[extension.toLowerCase()]

  if (icon) {
    return icon
  }

  return 'file'
}

function getFileExtension(name) {
  const dotIndex = name.lastIndexOf('.')

  return name.substring(dotIndex + 1)
}

export function buildResource(resource) {
  return {
    id: resource.fileInfo['{http://owncloud.org/ns}fileid'],
    icon: resource.type === 'dir' ? 'folder' : getFileIcon(getFileExtension(resource.name)),
    name: () => {
      const name = resource.name

      return name.includes('/') ? name.substring(name.lastIndexOf('/') + 1) : name
    },
    path: resource.name,
    type: resource.type === 'dir' ? 'folder' : resource.type,
    mdate: resource.fileInfo['{DAV:}getlastmodified'],
    size:
      resource.type === 'dir'
        ? resource.fileInfo['{http://owncloud.org/ns}size']
        : resource.fileInfo['{DAV:}getcontentlength'],
    indicators: []
  }
}
