import { IconType } from '../../helpers'

export type OcResourceIconMapping = Record<'mimeType' | 'extension', Record<string, IconType>>
export const ocResourceIconMappingInjectionKey = 'oc-resource-icon-mapping'
