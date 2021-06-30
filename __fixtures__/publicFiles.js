export default {
  link: [
    {
      name: '/link',
      type: 'dir',
      fileInfo: {
        '{http://owncloud.org/ns}permissions': '',
        '{DAV:}resourcetype': ['{DAV:}collection'],
        '{http://owncloud.org/ns}public-link-item-type': 'folder',
        '{http://owncloud.org/ns}public-link-permission': '1',
        '{http://owncloud.org/ns}public-link-share-datetime': 'Wed, 09 Jun 2021 12:44:17 GMT',
        '{http://owncloud.org/ns}public-link-share-owner': 'admin'
      },
      tusSupport: null,
      getProperty: function(prop) {
        return this.fileInfo[prop]
      }
    },
    {
      name: '/link/.hidden-folder',
      type: 'dir',
      fileInfo: {
        '{http://owncloud.org/ns}permissions': '',
        '{http://owncloud.org/ns}fileid': '3834',
        '{http://owncloud.org/ns}owner-id': 'admin',
        '{http://owncloud.org/ns}owner-display-name': 'admin',
        '{http://owncloud.org/ns}size': '0',
        '{DAV:}getlastmodified': 'Mon, 14 Jun 2021 12:59:12 GMT',
        '{DAV:}resourcetype': ['{DAV:}collection']
      },
      tusSupport: null
    },
    {
      name: '/link/Documents',
      type: 'dir',
      fileInfo: {
        '{http://owncloud.org/ns}permissions': '',
        '{http://owncloud.org/ns}fileid': '3874',
        '{http://owncloud.org/ns}owner-id': 'admin',
        '{http://owncloud.org/ns}owner-display-name': 'admin',
        '{http://owncloud.org/ns}size': '0',
        '{DAV:}getlastmodified': 'Mon, 14 Jun 2021 12:59:12 GMT',
        '{DAV:}resourcetype': ['{DAV:}collection']
      },
      tusSupport: null
    },
    {
      name: '/link/Photos',
      type: 'dir',
      fileInfo: {
        '{http://owncloud.org/ns}permissions': '',
        '{http://owncloud.org/ns}fileid': '3875',
        '{http://owncloud.org/ns}owner-id': 'admin',
        '{http://owncloud.org/ns}owner-display-name': 'admin',
        '{http://owncloud.org/ns}size': '0',
        '{DAV:}getlastmodified': 'Mon, 14 Jun 2021 12:59:12 GMT',
        '{DAV:}resourcetype': ['{DAV:}collection']
      },
      tusSupport: null
    },
    {
      name: '/link/ownCloud Manual.pdf',
      type: 'file',
      fileInfo: {
        '{http://owncloud.org/ns}permissions': '',
        '{http://owncloud.org/ns}fileid': '3012',
        '{http://owncloud.org/ns}owner-id': 'admin',
        '{http://owncloud.org/ns}owner-display-name': 'admin',
        '{DAV:}getcontentlength': '0',
        '{http://owncloud.org/ns}size': '0',
        '{DAV:}getlastmodified': 'Mon, 10 May 2021 11:15:05 GMT',
        '{DAV:}getetag': '"c5383f85b730ac10a5817efbc469bcb2"',
        '{DAV:}resourcetype': '',
        '{http://owncloud.org/ns}downloadURL':
          'http://host.docker.internal:8080/remote.php/dav/public-files/link/ownCloud Manual.pdf'
      },
      tusSupport: null
    }
  ]
}
