const files = {
  ocs: {
    data: [
      {
        id: '38',
        share_type: 3,
        uid_owner: 'admin',
        displayname_owner: 'admin',
        permissions: 1,
        stime: 1623242657,
        parent: null,
        expiration: null,
        token: 'sADy5cUdrz931MV',
        uid_file_owner: 'admin',
        displayname_file_owner: 'admin',
        additional_info_owner: null,
        additional_info_file_owner: null,
        path: '/Documents',
        mimetype: 'httpd/unix-directory',
        state: 0,
        storage_id: 'home::admin',
        storage: 2,
        item_type: 'folder',
        item_source: 3009,
        file_source: 3009,
        file_parent: 6,
        file_target: '/Documents',
        name: 'Quick action link',
        url: 'http://host.docker.internal:8080/s/sADy5cUdrz931MV',
        mail_send: 0,
        attributes: null,
        tags: [],
        sharedWith: [
          {
            name: 'Quick action link',
            link: true
          }
        ]
      },
      {
        id: '64',
        share_type: 3,
        uid_owner: 'admin',
        displayname_owner: 'admin',
        permissions: 1,
        stime: 1623242657,
        parent: null,
        expiration: null,
        token: 'sADy5cUdrz931MV',
        uid_file_owner: 'admin',
        displayname_file_owner: 'admin',
        additional_info_owner: null,
        additional_info_file_owner: null,
        path: '/.hidden-folder',
        mimetype: 'httpd/unix-directory',
        storage_id: 'home::admin',
        storage: 2,
        item_type: 'folder',
        item_source: 3010,
        file_source: 3010,
        file_parent: 6,
        file_target: '/.hidden-folder',
        name: 'Quick action link',
        url: 'http://host.docker.internal:8080/s/sADy5cUdrz931MV',
        mail_send: 0,
        attributes: null,
        tags: [],
        sharedWith: [
          {
            name: 'Quick action link',
            link: true
          }
        ]
      },
      {
        id: '39',
        share_type: 3,
        uid_owner: 'admin',
        displayname_owner: 'admin',
        permissions: 1,
        stime: 1623242657,
        parent: null,
        expiration: null,
        token: 'sADy5cUdrz931MV',
        uid_file_owner: 'admin',
        displayname_file_owner: 'admin',
        additional_info_owner: null,
        additional_info_file_owner: null,
        path: '/Photos',
        mimetype: 'httpd/unix-directory',
        storage_id: 'home::admin',
        storage: 2,
        item_type: 'folder',
        item_source: 3010,
        file_source: 3010,
        file_parent: 6,
        file_target: '/Photos',
        name: 'Quick action link',
        url: 'http://host.docker.internal:8080/s/sADy5cUdrz931MV',
        mail_send: 0,
        attributes: null,
        tags: [],
        sharedWith: [
          {
            name: 'Quick action link',
            link: true
          }
        ]
      },
      {
        id: '30',
        share_type: 0,
        uid_owner: 'admin',
        displayname_owner: 'admin',
        permissions: 19,
        stime: 1623242244,
        parent: null,
        expiration: null,
        token: null,
        uid_file_owner: 'admin',
        displayname_file_owner: 'admin',
        additional_info_owner: null,
        additional_info_file_owner: null,
        path: '/ownCloud Manual.pdf',
        mimetype: 'text/plain',
        storage_id: 'home::admin',
        storage: 2,
        item_type: 'file',
        item_source: 3011,
        file_source: 3011,
        file_parent: 3039,
        file_target: '/ownCloud Manual.pdf',
        share_with: 'bob',
        share_with_displayname: 'bob',
        share_with_additional_info: null,
        mail_send: 0,
        attributes: null,
        tags: ['_$!<Favorite>!$_'],
        sharedWith: [
          {
            username: 'bob',
            displayName: 'bob'
          },
          {
            name: 'Quick action link',
            link: true
          }
        ]
      }
    ]
  }
}

export default {
  json: () => files
}
