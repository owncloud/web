import { Capabilities, GetCapabilitiesFactory } from './capabilities'
import { AxiosInstance } from 'axios'

export type { Capabilities } from './capabilities'

export class OCSError extends Error {
  public response: any
  constructor(response, message = null) {
    super(message)
    this.response = response
  }
}

export interface OCS {
  getCapabilities: () => Promise<Capabilities>
}

export const ocs = (baseURI: string, axiosClient: AxiosInstance): OCS => {
  const url = new URL(baseURI)
  url.pathname = [...url.pathname.split('/'), 'ocs', 'v1.php'].filter(Boolean).join('/')
  const ocsV1BaseURI = url.href

  const capabilitiesFactory = GetCapabilitiesFactory(ocsV1BaseURI, axiosClient)

  return {
    getCapabilities: () => {
      return capabilitiesFactory.getCapabilities()
    }
  }
}
