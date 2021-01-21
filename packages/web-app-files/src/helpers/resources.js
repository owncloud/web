import filesize from 'filesize'
import fileIconMappings from '../fileTypeIconMappings.json'
import { getIndicators } from './statusIndicators'
import _ from 'lodash'

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
export function getFileIcon(extension) {
  const icon = fileIconMappings[extension.toLowerCase()]

  if (icon) {
    return icon
  }

  return 'file'
}

export function getFileExtension(name) {
  const dotIndex = name.lastIndexOf('.')

  return name.substring(dotIndex + 1)
}

export function buildResource(resource) {
  const builtResource = {
    id: resource.fileInfo['{http://owncloud.org/ns}fileid'],
    icon: resource.type === 'dir' ? 'folder' : getFileIcon(getFileExtension(resource.name)),
    name: (() => {
      const name = resource.name

      return name.includes('/') ? name.substring(name.lastIndexOf('/') + 1) : name
    })(),
    path: resource.name,
    type: resource.type === 'dir' ? 'folder' : resource.type,
    mdate: resource.fileInfo['{DAV:}getlastmodified'],
    size:
      resource.type === 'dir'
        ? resource.fileInfo['{http://owncloud.org/ns}size']
        : resource.fileInfo['{DAV:}getcontentlength'],
    indicators: [],
    permissions: resource.fileInfo['{http://owncloud.org/ns}permissions'] || '',
    starred: resource.fileInfo['{http://owncloud.org/ns}favorite'] !== '0',
    etag: resource.fileInfo['{DAV:}getetag'],
    sharePermissions:
      resource.fileInfo['{http://open-collaboration-services.org/ns}share-permissions'],
    shareTypes: (function() {
      let shareTypes = resource.fileInfo['{http://owncloud.org/ns}share-types']
      if (shareTypes) {
        shareTypes = _.chain(shareTypes)
          .filter(
            xmlvalue =>
              xmlvalue.namespaceURI === 'http://owncloud.org/ns' &&
              xmlvalue.nodeName.split(':')[1] === 'share-type'
          )
          .map(xmlvalue => parseInt(xmlvalue.textContent || xmlvalue.text, 10))
          .value()
      }
      return shareTypes || []
    })(),
    privateLink: resource.fileInfo['{http://owncloud.org/ns}privatelink'],
    canUpload: function() {
      return this.permissions.indexOf('C') >= 0
    },
    canDownload: function() {
      return this.type !== 'folder'
    },
    canBeDeleted: function() {
      return this.permissions.indexOf('D') >= 0
    },
    canRename: function() {
      return this.permissions.indexOf('N') >= 0
    },
    canShare: function() {
      return this.permissions.indexOf('R') >= 0
    },
    canCreate: function() {
      return this.permissions.indexOf('C') >= 0
    },
    isMounted: function() {
      return this.permissions.indexOf('M') >= 0
    },
    isReceivedShare: function() {
      return this.permissions.indexOf('S') >= 0
    }
  }

  return builtResource
}

export function attatchIndicators(resource, sharesTree) {
  return (resource.indicators = getIndicators(resource, sharesTree))
}
