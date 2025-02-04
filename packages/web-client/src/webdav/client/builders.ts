import { XMLBuilder } from 'fast-xml-parser'
import { DavProperties, DavPropertyValue } from '../constants'

const getNamespacedDavProps = (obj: Partial<Record<DavPropertyValue, unknown>>) => {
  return Object.keys(obj).reduce<Record<string, unknown>>((acc, val) => {
    if (val.includes(':')) {
      acc[val] = obj[val as DavPropertyValue] || ''
      return acc
    }
    const davNamespace = DavProperties.DavNamespace.includes(val as DavPropertyValue)
    acc[davNamespace ? `d:${val}` : `oc:${val}`] = obj[val as DavPropertyValue] || ''
    return acc
  }, {})
}

export const buildPropFindBody = (
  properties: DavPropertyValue[] = [],
  {
    pattern,
    filterRules,
    limit = 0
  }: {
    pattern?: string
    filterRules?: Partial<Record<DavPropertyValue, unknown>>
    limit?: number
  } = {}
): string => {
  let bodyType = 'd:propfind'
  if (pattern) {
    bodyType = 'oc:search-files'
  }

  if (filterRules) {
    bodyType = 'oc:filter-files'
  }

  const object = properties.reduce((obj, item) => Object.assign(obj, { [item]: null }), {})
  const props = getNamespacedDavProps(object)

  const xmlObj = {
    [bodyType]: {
      'd:prop': props,
      '@@xmlns:d': 'DAV:',
      '@@xmlns:oc': 'http://owncloud.org/ns',
      ...(pattern && {
        'oc:search': { 'oc:pattern': pattern, 'oc:limit': limit }
      }),
      ...(filterRules && {
        'oc:filter-rules': getNamespacedDavProps(filterRules)
      })
    }
  }

  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    attributeNamePrefix: '@@',
    suppressEmptyNode: true
  })

  return builder.build(xmlObj)
}

export const buildPropPatchBody = (
  properties: Partial<Record<DavPropertyValue, unknown>>
): string => {
  const xmlObj = {
    'd:propertyupdate': {
      'd:set': { 'd:prop': getNamespacedDavProps(properties) },
      '@@xmlns:d': 'DAV:',
      '@@xmlns:oc': 'http://owncloud.org/ns'
    }
  }

  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    attributeNamePrefix: '@@',
    suppressEmptyNode: true
  })

  return builder.build(xmlObj)
}
