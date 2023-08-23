import { BodyInit, Response } from 'node-fetch'
import { request as httpRequest } from '../http'
import { User } from '../../types'

export const realmBasePath = 'admin/realms/oCIS'

export const request = async (args: {
  method: 'POST' | 'DELETE' | 'PUT' | 'GET' | 'MKCOL' | 'PROPFIND' | 'PATCH'
  path: string
  body?: BodyInit
  user?: User
  header?: object
}): Promise<Response> => {
  return httpRequest({ ...args, isKeycloakRequest: true })
}

export const getUserIdFromResponse = (response: Response): string => {
  return response.headers.get('location').split('/').pop()
}
