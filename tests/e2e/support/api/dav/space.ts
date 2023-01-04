import {User} from '../../types'
import {checkResponseStatus, request} from '../http'
import {Response} from 'node-fetch'
import join from 'join-path'
import convert from 'xml-js'

const _ = require('lodash/object')


export const createFolderInsideSpace = async ({
                                                  spaceAdmin,
                                                  spaceId,
                                                  folderName
                                              }: {
    spaceAdmin: User
    spaceId: string
    folderName: string
}): Promise<void> => {
    const response = await request({
        method: 'MKCOL',
        path: join('remote.php', 'dav', 'spaces', spaceId , folderName),
        user: spaceAdmin
    })
    checkResponseStatus(response, `Failed while creating a ${folderName} inside space project`)
}

export const uploadFileInsideSpace = async ({
                                                  spaceAdmin,
                                                  spaceId,
                                                fileName
                                              }: {
    spaceAdmin: User
    spaceId: string
    fileName: string
}): Promise<void> => {
    const response = await request({
        method: 'PUT',
        path: join('remote.php', 'dav', 'spaces', spaceId , fileName),
        user: spaceAdmin
    })
    checkResponseStatus(response, `Failed while creating a ${fileName} inside space project`)
}

export const getDataOfFileInsideSpace = async ({
                                                spaceAdmin,
                                                spaceId,
                                                fileName
                                            }: {
    spaceAdmin: User
    spaceId: string
    fileName: string
}): Promise<Response> => {
    const body = '<?xml version="1.0"?>\n' +
        '<d:propfind  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">\n' +
        '  <d:prop>\n' +
        '    <oc:permissions />\n' +
        '    <oc:favorite />\n' +
        '    <oc:fileid />\n' +
        '    <oc:file-parent />\n' +
        '    <oc:name />\n' +
        '    <oc:owner-id />\n' +
        '    <oc:owner-display-name />\n' +
        '    <oc:shareid />\n' +
        '    <oc:shareroot />\n' +
        '    <oc:share-types />\n' +
        '    <oc:privatelink />\n' +
        '    <d:getcontentlength />\n' +
        '    <oc:size />\n' +
        '    <d:getlastmodified />\n' +
        '    <d:getetag />\n' +
        '    <d:getcontenttype />\n' +
        '    <d:resourcetype />\n' +
        '    <oc:downloadURL />\n' +
        '  </d:prop>\n' +
        '</d:propfind>'
    const response = await request({
        method: 'PROPFIND',
        path: join('remote.php', 'dav', 'spaces', spaceId , fileName),
        body: body,
        user: spaceAdmin
    })
    checkResponseStatus(response, `Failed while getting information of file ${fileName}`)
    const fileData = JSON.parse(convert.xml2json(await response.text(), { compact: true }))
    return _.get(
        fileData,
        "[d:multistatus][d:response][d:propstat]"
    )
}

export const getFileId = async ({
                                                   spaceAdmin,
                                                   spaceId,
                                                   fileName
                                               }: {
    spaceAdmin: User
    spaceId: string
    fileName: string
}): Promise<string> => {
    const fileDataResponse = await getDataOfFileInsideSpace({spaceAdmin, spaceId: spaceId, fileName: fileName})
    // extract file id form the response
    return _.get(
        fileDataResponse,
        "[0][d:prop][oc:fileid]"
    )._text
}
