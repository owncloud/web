import { Resource } from '../resource'
import { ShareResource, OutgoingShareResource, IncomingShareResource } from './types'

export const isShareResource = (resource: Resource): resource is ShareResource => {
  return Object.hasOwn(resource, 'sharedWith')
}

export const isOutgoingShareResource = (resource: Resource): resource is OutgoingShareResource => {
  return isShareResource(resource) && resource.outgoing
}

export const isIncomingShareResource = (resource: Resource): resource is IncomingShareResource => {
  return isShareResource(resource) && !resource.outgoing
}
