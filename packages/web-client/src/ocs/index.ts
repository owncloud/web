import { Capabilities, GetCapabilitiesFactory } from './capabilities'
import { AxiosInstance } from 'axios'

export { Capabilities } from './capabilities'

export interface OCS {
  getCapabilities: () => Promise<Capabilities>
}

export const ocs = (baseURI: string, axiosClient: AxiosInstance): OCS => {
  const url = new URL(baseURI)
  url.pathname = [...url.pathname.split('/'), 'ocs', 'v1.php'].filter(Boolean).join('/')
  const ocsV1BaseURI = url.href

  const capabilitiesFactory = GetCapabilitiesFactory(ocsV1BaseURI, axiosClient)

  return <OCS>{
    getCapabilities: () => {
      return capabilitiesFactory.getCapabilities()
    }
  }
}
