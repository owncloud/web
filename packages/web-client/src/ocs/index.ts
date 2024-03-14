import { Capabilities, GetCapabilitiesFactory } from './capabilities'
import { AxiosInstance } from 'axios'
import { UrlSign } from './urlSign'
import { Ref } from 'vue'
import { User } from '../generated'

export type { Capabilities } from './capabilities'

export interface OCS {
  getCapabilities: () => Promise<Capabilities>
  signUrl: (url: string) => Promise<string>
}

export const ocs = (baseURI: string, axiosClient: AxiosInstance, user: Ref<User>): OCS => {
  const url = new URL(baseURI)
  url.pathname = [...url.pathname.split('/'), 'ocs', 'v1.php'].filter(Boolean).join('/')
  const ocsV1BaseURI = url.href

  const capabilitiesFactory = GetCapabilitiesFactory(ocsV1BaseURI, axiosClient)

  const urlSign = new UrlSign({ baseURI, axiosClient, user })

  return {
    getCapabilities: () => {
      return capabilitiesFactory.getCapabilities()
    },
    signUrl: (url: string) => {
      return urlSign.signUrl(url)
    }
  }
}
