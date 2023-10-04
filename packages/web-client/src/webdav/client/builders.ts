import { XMLBuilder } from 'fast-xml-parser'
import { DavProperties, DavPropertyValue } from '../constants'

export const buildPropFindBody = (
  properties: DavPropertyValue[] = [],
  { pattern, limit = 0 }: { pattern?: string; limit?: number } = {}
): string => {
  const bodyType = pattern ? 'oc:search-files' : 'd:propfind'
  const props = properties.reduce<Record<string, string>>((acc, val) => {
    const davNamespace = DavProperties.DavNamespace.includes(val)
    acc[davNamespace ? `d:${val}` : `oc:${val}`] = ''
    return acc
  }, {})

  const xmlObj = {
    [bodyType]: {
      'd:prop': props,
      '@@xmlns:d': 'DAV:',
      '@@xmlns:oc': 'http://owncloud.org/ns',
      ...(pattern && {
        'oc:search': { 'oc:pattern': pattern, 'oc:limit': limit }
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

export const buildPublicLinkAuthHeader = (password: string) => {
  return 'Basic ' + Buffer.from('public:' + password).toString('base64')
}
