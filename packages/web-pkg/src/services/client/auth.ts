export interface AuthParameters {
  accessToken?: string
  publicLinkToken?: string
  publicLinkPassword?: string
  ocmToken?: string
}

export class Auth {
  accessToken?: string
  publicLinkToken?: string
  ocmToken?: string
  publicLinkPassword?: string

  constructor(params: AuthParameters = {}) {
    this.accessToken = params.accessToken
    this.publicLinkToken = params.publicLinkToken
    this.ocmToken = params.ocmToken
    this.publicLinkPassword = params.publicLinkPassword
  }

  getHeaders(): any {
    return {
      ...(this.ocmToken && { 'ocm-token': this.ocmToken }),
      ...(this.publicLinkToken && { 'public-token': this.publicLinkToken }),
      ...(this.publicLinkPassword && {
        Authorization:
          'Basic ' + Buffer.from(['public', this.publicLinkPassword].join(':')).toString('base64')
      }),
      ...(this.accessToken && {
        Authorization: 'Bearer ' + this.accessToken
      })
    }
  }
}
