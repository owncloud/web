import join from 'join-path'
import fetch, { BodyInit, Response } from 'node-fetch'
import { User } from '../types'
import { config } from '../config'
import _ from 'lodash'

export const request = async ({
  method,
  path,
  body,
  user,
  versionApi = 'v2.php'
}: {
  method: 'POST' | 'DELETE' | 'PUT' | 'GET'
  path: string
  body?: BodyInit
  user?: User
  versionApi?: string
}): Promise<Response> => {
  return await fetch(
    join(
      config.backendUrl,
      'ocs',
      versionApi,
      path + (path.includes('?') ? '&' : '?') + 'format=json'
    ),
    {
      method,
      body,
      headers: {
        'OCS-APIREQUEST': true as any,
        ...(user && {
          Authorization: 'Basic ' + Buffer.from(user.id + ':' + user.password).toString('base64')
        })
      }
    }
  )
}

export const checkResponseStatus = (response: Response, message = ''): void => {
  // response.status >= 200 && response.status < 300
  if (!response.ok) {
    throw Error(`HTTP Request Failed: ${message}, Status: ${response.status}`)
  }
}

export const checkOCJsonStatus = (json: JSON, message = ''): void => {
  const statusCode = _.get(json, 'ocs.meta.statuscode')
  const ocsMessage = _.get(json, 'ocs.meta.message')

  if (statusCode !== 200) {
    throw Error(`OCS Request Failed: ${message}, Status: ${statusCode}, Message: ${ocsMessage}`)
  }
}
