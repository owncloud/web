import { AxiosInstance } from 'axios'
import { urlJoin } from '../utils'
import convert from 'xml-js'
import { User } from '../generated'
import { pbkdf2Sync } from 'crypto'

export interface UrlSignOptions {
  axiosClient: AxiosInstance
  baseURI: string
  user: User
}

export class UrlSign {
  private axiosClient: AxiosInstance
  private baseURI: string
  private user: User

  private signingKey: string

  private ALGORITHM = 'sha512'
  private TTL = 1200
  private HASH_LENGTH = 32
  private ITERATION_COUNT = 10000

  constructor({ axiosClient, baseURI, user }: UrlSignOptions) {
    this.axiosClient = axiosClient
    this.baseURI = baseURI
    this.user = user
  }

  public async signUrl(url: string) {
    const signedUrl = new URL(url)
    signedUrl.searchParams.set('OC-Credential', this.user.onPremisesSamAccountName)
    signedUrl.searchParams.set('OC-Date', new Date().toISOString())
    signedUrl.searchParams.set('OC-Expires', this.TTL.toString())
    signedUrl.searchParams.set('OC-Verb', 'GET')

    const hashedKey = await this.createHashedKey(signedUrl.toString())

    signedUrl.searchParams.set('OC-Algo', `PBKDF2/${this.ITERATION_COUNT}-SHA512`)
    signedUrl.searchParams.set('OC-Signature', hashedKey)

    return signedUrl.toString()
  }

  private async getSignKey() {
    if (this.signingKey) {
      return this.signingKey
    }

    const data = await this.axiosClient.get(
      urlJoin(this.baseURI, 'ocs/v1.php/cloud/user/signing-key'),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    )

    const parsedXML = convert.xml2js(data.data, { compact: true }) as any
    this.signingKey = parsedXML.ocs.data['signing-key']._text
    return this.signingKey
  }

  private async createHashedKey(url: string) {
    const signignKey = await this.getSignKey()
    const hashedKey = pbkdf2Sync(
      url,
      signignKey,
      this.ITERATION_COUNT,
      this.HASH_LENGTH,
      this.ALGORITHM
    )

    return hashedKey.toString('hex')
  }
}
