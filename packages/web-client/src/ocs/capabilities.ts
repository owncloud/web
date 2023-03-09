import { AxiosInstance } from 'axios'
import get from 'lodash-es/get'

/* eslint-disable camelcase */
export interface Capabilities {
  capabilities: {
    notifications: {
      ocs_endpoints: string[]
    }
    core: {
      pollinterval: number
      status: {
        edition: string
        installed: boolean
        maintenance: boolean
        needsDbUpgrade: boolean
        product: string
        productname?: string
        productversion?: string
        version: string
        versionstring: string
      }
      'support-url-signing': boolean
      'webdav-root': string
    }
    dav: {
      reports: string[]
    }
    files: {
      app_providers?: {
        apps_url: string
        enabled: boolean
        new_url: string
        open_url: string
        version: string
      }[]
      archivers?: {
        archiver_url: string
        enabled: boolean
        formats: string[]
        max_num_files: string
        max_size: string
        version: string
      }[]
      favorites: boolean
      privateLinks: boolean
      tus_support?: {
        extension: string
        http_method_override: string
        max_chunk_size: number
        resumable: string
        version: string
      }
      undelete: boolean
      versioning: true
    }
    files_sharing: {
      api_enabled: boolean
      default_permissions: number
      federation: {
        incoming: boolean
        outgoing: boolean
      }
      group_sharing: boolean
      public: {
        alias?: boolean
        can_edit: boolean
        enabled: boolean
        expire_date: {
          enabled: boolean
        }
        multiple: boolean
        password: {
          enforced: boolean
          enforced_for: {
            read_only: boolean
            read_write: boolean
            upload_only: boolean
          }
        }
        send_mail: boolean
        supports_upload_only: boolean
        upload: boolean
      }
      resharing: boolean
      search_min_length: number
      user: {
        profile_picture: boolean
        send_mail: boolean
        settings: {
          enabled: boolean
          version: string
        }[]
      }
    }
    spaces?: {
      enabled?: boolean
      projects?: boolean
      share_jail?: boolean
      version?: string
    }
  }
  version: {
    edition: string
    major: string
    minor: string
    micro: string
    product: string
    productversion?: string
    string: string
  }
}
/* eslint-enable camelcase */

export const GetCapabilitiesFactory = (baseURI: string, axios: AxiosInstance) => {
  const url = new URL(baseURI)
  url.pathname = [...url.pathname.split('/'), 'cloud', 'capabilities'].filter(Boolean).join('/')
  url.searchParams.append('format', 'json')
  const endpoint = url.href
  return {
    async getCapabilities(): Promise<Capabilities> {
      const response = await axios.get(endpoint)

      //trick
      const ocmAccessToken = response.headers['x-access-token']
      sessionStorage.setItem('ocmAccessToken', ocmAccessToken)

      const cap = get(response, 'data.ocs.data', { capabilities: null, version: null })
      cap.capabilities.spaces.enabled = false
      return cap
    }
  }
}
