import {
  Log,
  WebStorageStateStore,
  UserManager as OidcUserManager,
  UserManagerSettings,
  User,
  ErrorResponse
} from 'oidc-client-ts'
import { buildUrl, useAppsStore } from '@ownclouders/web-pkg'
import { getAbilities } from './abilities'
import { AuthStore, UserStore, CapabilityStore, ConfigStore } from '@ownclouders/web-pkg'
import { ClientService } from '@ownclouders/web-pkg'
import { Ability } from '@ownclouders/web-client'
import { Language } from 'vue3-gettext'
import { loadAppTranslations, setCurrentLanguage } from '../../helpers/language'
import { router } from '../../router'
import { SSEAdapter } from '@ownclouders/web-client/sse'
import { User as OcUser } from '@ownclouders/web-client/graph/generated'
import { SettingsBundle } from '../../helpers/settings'
import { WebWorkersStore } from '@ownclouders/web-pkg'

const postLoginRedirectUrlKey = 'oc.postLoginRedirectUrl'
type UnloadReason = 'authError' | 'logout'

export interface UserManagerOptions {
  clientService: ClientService
  configStore: ConfigStore
  ability: Ability
  language: Language
  userStore: UserStore
  authStore: AuthStore
  capabilityStore: CapabilityStore
  webWorkersStore: WebWorkersStore

  // number of seconds before an access token is to expire to raise the accessTokenExpiring event
  accessTokenExpiryThreshold: number
}

export class UserManager extends OidcUserManager {
  private clientService: ClientService
  private configStore: ConfigStore
  private userStore: UserStore
  private authStore: AuthStore
  private webWorkersStore: WebWorkersStore
  private capabilityStore: CapabilityStore
  private updateAccessTokenPromise: Promise<void> | null
  private _unloadReason: UnloadReason
  private ability: Ability
  private language: Language
  private browserStorage: Storage
  public areEventHandlersRegistered: boolean

  constructor(options: UserManagerOptions) {
    const browserStorage = options.configStore.options.tokenStorageLocal
      ? localStorage
      : sessionStorage
    const storePrefix = 'oc_oAuth.'
    const userStore = new WebStorageStateStore({
      prefix: storePrefix,
      store: browserStorage
    })
    const openIdConfig: UserManagerSettings = {
      userStore,
      redirect_uri: buildUrl(router, '/oidc-callback.html'),
      silent_redirect_uri: buildUrl(router, '/oidc-silent-redirect.html'),

      response_mode: 'query',
      response_type: 'code', // "code" triggers auth code grant flow

      post_logout_redirect_uri: buildUrl(router, '/'),
      accessTokenExpiringNotificationTimeInSeconds: options.accessTokenExpiryThreshold,
      authority: '',
      client_id: '',

      // we trigger the token renewal manually via a timer running in a web worker
      automaticSilentRenew: false
    }

    if (options.configStore.isOIDC) {
      Object.assign(openIdConfig, {
        scope: 'openid profile',
        loadUserInfo: false,
        ...options.configStore.openIdConnect,
        ...(options.configStore.openIdConnect.metadata_url && {
          metadataUrl: options.configStore.openIdConnect.metadata_url
        })
      })
    } else if (options.configStore.isOAuth2) {
      const oAuth2 = options.configStore.oAuth2
      Object.assign(openIdConfig, {
        authority: oAuth2.url,
        client_id: oAuth2.clientId,
        ...(oAuth2.clientSecret && {
          client_authentication: 'client_secret_basic',
          client_secret: oAuth2.clientSecret
        }),

        scope: 'profile',
        loadUserInfo: false,
        metadata: {
          issuer: oAuth2.url,
          authorization_endpoint: oAuth2.authUrl,
          token_endpoint: oAuth2.url,
          userinfo_endpoint: ''
        }
      })
    }

    Log.setLogger(console)
    Log.setLevel(Log.WARN)

    super(openIdConfig)
    this.browserStorage = browserStorage
    this.clientService = options.clientService
    this.configStore = options.configStore
    this.ability = options.ability
    this.language = options.language
    this.userStore = options.userStore
    this.authStore = options.authStore
    this.capabilityStore = options.capabilityStore
    this.webWorkersStore = options.webWorkersStore
  }

  /**
   * Looks up the access token of an already loaded user without enforcing a signin if no user exists.
   *
   * @return (string|null)
   */
  async getAccessToken(): Promise<string | null> {
    const user = await this.getUser()
    return user?.access_token
  }

  async removeUser(unloadReason: UnloadReason = 'logout') {
    this._unloadReason = unloadReason
    await super.removeUser()
  }

  get unloadReason(): UnloadReason {
    return this._unloadReason
  }

  getAndClearPostLoginRedirectUrl(): string {
    const url = this.browserStorage.getItem(postLoginRedirectUrlKey) || '/'
    this.browserStorage.removeItem(postLoginRedirectUrlKey)
    return url
  }

  setPostLoginRedirectUrl(url?: string): void {
    if (url) {
      this.browserStorage.setItem(postLoginRedirectUrlKey, url)
    } else {
      this.browserStorage.removeItem(postLoginRedirectUrlKey)
    }
  }

  updateContext(accessToken: string, fetchUserData: boolean) {
    const userKnown = !!this.userStore.user
    const accessTokenChanged = this.authStore.accessToken !== accessToken
    if (!accessTokenChanged) {
      return this.updateAccessTokenPromise
    }

    this.authStore.setAccessToken(accessToken)

    this.updateAccessTokenPromise = (async () => {
      if (!fetchUserData) {
        this.authStore.setIdpContextReady(true)
        return
      }

      if (this.capabilityStore.supportSSE) {
        ;(this.clientService.sseAuthenticated as SSEAdapter).updateAccessToken(accessToken)
      }

      this.webWorkersStore.updateAccessTokens(accessToken)

      if (!userKnown) {
        await this.fetchUserInfo()
        await this.updateUserAbilities(this.userStore.user)
        this.authStore.setUserContextReady(true)
      }
    })()
    return this.updateAccessTokenPromise
  }

  private async fetchUserInfo() {
    await this.fetchCapabilities()

    const graphClient = this.clientService.graphAuthenticated
    const [graphUser, roles] = await Promise.all([graphClient.users.getMe(), this.fetchRoles()])
    const role = await this.fetchRole({ graphUser, roles })

    this.userStore.setUser({
      id: graphUser.id,
      onPremisesSamAccountName: graphUser.onPremisesSamAccountName,
      displayName: graphUser.displayName,
      mail: graphUser.mail,
      memberOf: graphUser.memberOf,
      appRoleAssignments: role ? [role as any] : [], // FIXME
      preferredLanguage: graphUser.preferredLanguage || ''
    })

    if (graphUser.preferredLanguage) {
      const appsStore = useAppsStore()

      loadAppTranslations({
        apps: appsStore.apps,
        gettext: this.language,
        lang: graphUser.preferredLanguage
      })

      setCurrentLanguage({
        language: this.language,
        languageSetting: graphUser.preferredLanguage
      })
    }
  }

  private async fetchRoles() {
    const httpClient = this.clientService.httpAuthenticated
    try {
      const roles = [
        {
          id: '71881883-1768-46bd-a24d-a356a2afdf7f',
          name: 'admin',
          type: 'TYPE_ROLE',
          extension: 'ocis-roles',
          displayName: 'Admin',
          settings: [
            {
              id: '8e587774-d929-4215-910b-a317b1e80f73',
              name: 'Accounts.ReadWrite',
              displayName: 'Account Management',
              description:
                'This permission gives full access to everything that is related to account management.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_USER', id: 'all' }
            },
            {
              id: '4e41363c-a058-40a5-aec8-958897511209',
              name: 'AutoAcceptShares.ReadWriteDisabled',
              displayName: 'enable/disable auto accept shares',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'ec3ed4a3-3946-4efc-8f9f-76d38b12d3a9' }
            },
            {
              id: 'ed83fc10-1f54-4a9e-b5a7-fb517f5f3e01',
              name: 'Logo.Write',
              displayName: 'Change logo',
              description: 'This permission permits to change the system logo.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: '11516bbd-7157-49e1-b6ac-d00c820f980b',
              name: 'PublicLink.Write',
              displayName: 'Write publiclink',
              description: 'This permission allows creating public links.',
              permissionValue: { operation: 'OPERATION_WRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SHARE' }
            },
            {
              id: '069c08b1-e31f-4799-9ed6-194b310e7244',
              name: 'Shares.Write',
              displayName: 'Write share',
              description: 'This permission allows creating shares.',
              permissionValue: { operation: 'OPERATION_WRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SHARE' }
            },
            {
              id: '79e13b30-3e22-11eb-bc51-0b9f0bad9a58',
              name: 'Drives.Create',
              displayName: 'Create Space',
              description: 'This permission allows creating new spaces.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: '5de9fe0a-4bc5-4a47-b758-28f370caf169',
              name: 'Drives.DeletePersonal',
              displayName: 'Delete All Home Spaces',
              description: 'This permission allows deleting home spaces.',
              permissionValue: { operation: 'OPERATION_DELETE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: 'fb60b004-c1fa-4f09-bf87-55ce7d46ac61',
              name: 'Drives.DeleteProject',
              displayName: 'Delete AllSpaces',
              description: 'This permission allows deleting all spaces.',
              permissionValue: { operation: 'OPERATION_DELETE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: 'e9a697c5-c67b-40fc-982b-bcf628e9916d',
              name: 'ReadOnlyPublicLinkPassword.Delete',
              displayName: 'Delete Read-Only Public link password',
              description:
                'This permission permits to opt out of a public link password enforcement.',
              permissionValue: { operation: 'OPERATION_WRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SHARE' }
            },
            {
              id: 'ad5bb5e5-dc13-4cd3-9304-09a424564ea8',
              name: 'EmailNotifications.ReadWriteDisabled',
              displayName: 'Disable Email Notifications',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '33ffb5d6-cd07-4dc0-afb0-84f7559ae438' }
            },
            {
              id: '7dc204ee-799a-43b6-b85d-425fb3b1fa5a',
              name: 'EmailSendingInterval.ReadWrite',
              displayName: 'Email Sending Interval',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '08dec2fe-3f97-42a9-9d1b-500855e92f25' }
            },
            {
              id: '8a50540c-1cdd-481f-b85f-44654393c8f0',
              name: 'Event.ShareCreated.ReadWrite',
              displayName: 'Event Share Created',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '872d8ef6-6f2a-42ab-af7d-f53cc81d7046' }
            },
            {
              id: '5ef55465-8e39-4a6c-ba97-1d19f5b07116',
              name: 'Event.ShareRemoved.ReadWrite',
              displayName: 'Event Share Removed',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'd7484394-8321-4c84-9677-741ba71e1f80' }
            },
            {
              id: '7d4f961b-d471-451b-b1fd-ac6a9d59ce88',
              name: 'Event.ShareExpired.ReadWrite',
              displayName: 'Event Share Expired',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'e1aa0b7c-1b0f-4072-9325-c643c89fee4e' }
            },
            {
              id: 'feb16d2c-614c-4f79-ac37-755a028f5616',
              name: 'Event.SpaceShared.ReadWrite',
              displayName: 'Event Space Shared',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '694d5ee1-a41c-448c-8d14-396b95d2a918' }
            },
            {
              id: '4f979732-631b-4f27-9be7-a89fb223a6d2',
              name: 'Event.SpaceUnshared.ReadWrite',
              displayName: 'Event Space Unshared',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '26c20e0e-98df-4483-8a77-759b3a766af0' }
            },
            {
              id: 'a3cc45bf-9720-4e08-b403-b9133fe33f0b',
              name: 'Event.SpaceMembershipExpired.ReadWrite',
              displayName: 'Event Space Membership Expired',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '7275921e-b737-4074-ba91-3c2983be3edd' }
            },
            {
              id: '896194c2-5055-4ea3-94a3-0a1419187a00',
              name: 'Event.SpaceDisabled.ReadWrite',
              displayName: 'Event Space Disabled',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'eb5c716e-03be-42c6-9ed1-1105d24e109f' }
            },
            {
              id: '2083c280-b140-4b73-a931-9a4af2931531',
              name: 'Event.SpaceDeleted.ReadWrite',
              displayName: 'Event Space Deleted',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '094ceca9-5a00-40ba-bb1a-bbc7bccd39ee' }
            },
            {
              id: '27ba8e97-0bdf-4b18-97d4-df44c9568cda',
              name: 'Event.PostprocessingStepFinished.ReadWrite',
              displayName: 'Event Postprocessing Step Finished',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'fe0a3011-d886-49c8-b797-33d02fa426ef' }
            },
            {
              id: '522adfbe-5908-45b4-b135-41979de73245',
              name: 'Groups.ReadWrite',
              displayName: 'Group Management',
              description:
                'This permission gives full access to everything that is related to group management.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_GROUP', id: 'all' }
            },
            {
              id: '7d81f103-0488-4853-bce5-98dcce36d649',
              name: 'Language.ReadWrite',
              displayName: 'Permission to read and set the language',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SETTING', id: 'aa8cfbe5-95d4-4f7e-a032-c3c01f5f062f' }
            },
            {
              id: '4ebaa725-bfaa-43c5-9817-78bc9994bde4',
              name: 'Favorites.List',
              displayName: 'List Favorites',
              description: 'This permission allows listing favorites.',
              permissionValue: { operation: 'OPERATION_READ', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: '016f6ddd-9501-4a0a-8ebe-64a20ee8ec82',
              name: 'Drives.List',
              displayName: 'List All Spaces',
              description: 'This permission allows listing all spaces.',
              permissionValue: { operation: 'OPERATION_READ', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: 'b44b4054-31a2-42b8-bb71-968b15cfbd4f',
              name: 'Drives.ReadWrite',
              displayName: 'Manage space properties',
              description:
                'This permission allows managing space properties such as name and description.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: 'a53e601e-571f-4f86-8fec-d4576ef49c62',
              name: 'Roles.ReadWrite',
              displayName: 'Role Management',
              description:
                'This permission gives full access to everything that is related to role management.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_USER', id: 'all' }
            },
            {
              id: '4e6f9709-f9e7-44f1-95d4-b762d27b7896',
              name: 'Drives.ReadWritePersonalQuota',
              displayName: 'Set Personal Space Quota',
              description: 'This permission allows managing personal space quotas.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: '977f0ae6-0da2-4856-93f3-22e0a8482489',
              name: 'Drives.ReadWriteProjectQuota',
              displayName: 'Set Project Space Quota',
              description: 'This permission allows managing project space quotas.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: '3d58f441-4a05-42f8-9411-ef5874528ae1',
              name: 'Settings.ReadWrite',
              displayName: 'Settings Management',
              description:
                'This permission gives full access to everything that is related to settings management.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_USER', id: 'all' }
            },
            {
              id: 'cf3faa8c-50d9-4f84-9650-ff9faf21aa9d',
              name: 'Drives.ReadWriteEnabled',
              displayName: 'Space ability',
              description: 'This permission allows enabling and disabling spaces.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: 'a54778fd-1c45-47f0-892d-655caf5236f2',
              name: 'Favorites.Write',
              displayName: 'Write Favorites',
              description: 'This permission allows marking files as favorites.',
              permissionValue: { operation: 'OPERATION_WRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_FILE' }
            }
          ],
          resource: { type: 'TYPE_SYSTEM' }
        },
        {
          id: '2aadd357-682c-406b-8874-293091995fdd',
          name: 'spaceadmin',
          type: 'TYPE_ROLE',
          extension: 'ocis-roles',
          displayName: 'Space Admin',
          settings: [
            {
              id: '4e41363c-a058-40a5-aec8-958897511209',
              name: 'AutoAcceptShares.ReadWriteDisabled',
              displayName: 'enable/disable auto accept shares',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'ec3ed4a3-3946-4efc-8f9f-76d38b12d3a9' }
            },
            {
              id: '11516bbd-7157-49e1-b6ac-d00c820f980b',
              name: 'PublicLink.Write',
              displayName: 'Write publiclink',
              description: 'This permission allows creating public links.',
              permissionValue: { operation: 'OPERATION_WRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SHARE' }
            },
            {
              id: '069c08b1-e31f-4799-9ed6-194b310e7244',
              name: 'Shares.Write',
              displayName: 'Write share',
              description: 'This permission allows creating shares.',
              permissionValue: { operation: 'OPERATION_WRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SHARE' }
            },
            {
              id: '79e13b30-3e22-11eb-bc51-0b9f0bad9a58',
              name: 'Drives.Create',
              displayName: 'Create Space',
              description: 'This permission allows creating new spaces.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: 'fb60b004-c1fa-4f09-bf87-55ce7d46ac61',
              name: 'Drives.DeleteProject',
              displayName: 'Delete AllSpaces',
              description: 'This permission allows deleting all spaces.',
              permissionValue: { operation: 'OPERATION_DELETE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: 'e9a697c5-c67b-40fc-982b-bcf628e9916d',
              name: 'ReadOnlyPublicLinkPassword.Delete',
              displayName: 'Delete Read-Only Public link password',
              description:
                'This permission permits to opt out of a public link password enforcement.',
              permissionValue: { operation: 'OPERATION_WRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SHARE' }
            },
            {
              id: 'ad5bb5e5-dc13-4cd3-9304-09a424564ea8',
              name: 'EmailNotifications.ReadWriteDisabled',
              displayName: 'Disable Email Notifications',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '33ffb5d6-cd07-4dc0-afb0-84f7559ae438' }
            },
            {
              id: '7dc204ee-799a-43b6-b85d-425fb3b1fa5a',
              name: 'EmailSendingInterval.ReadWrite',
              displayName: 'Email Sending Interval',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '08dec2fe-3f97-42a9-9d1b-500855e92f25' }
            },
            {
              id: '8a50540c-1cdd-481f-b85f-44654393c8f0',
              name: 'Event.ShareCreated.ReadWrite',
              displayName: 'Event Share Created',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '872d8ef6-6f2a-42ab-af7d-f53cc81d7046' }
            },
            {
              id: '5ef55465-8e39-4a6c-ba97-1d19f5b07116',
              name: 'Event.ShareRemoved.ReadWrite',
              displayName: 'Event Share Removed',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'd7484394-8321-4c84-9677-741ba71e1f80' }
            },
            {
              id: '7d4f961b-d471-451b-b1fd-ac6a9d59ce88',
              name: 'Event.ShareExpired.ReadWrite',
              displayName: 'Event Share Expired',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'e1aa0b7c-1b0f-4072-9325-c643c89fee4e' }
            },
            {
              id: 'feb16d2c-614c-4f79-ac37-755a028f5616',
              name: 'Event.SpaceShared.ReadWrite',
              displayName: 'Event Space Shared',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '694d5ee1-a41c-448c-8d14-396b95d2a918' }
            },
            {
              id: '4f979732-631b-4f27-9be7-a89fb223a6d2',
              name: 'Event.SpaceUnshared.ReadWrite',
              displayName: 'Event Space Unshared',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '26c20e0e-98df-4483-8a77-759b3a766af0' }
            },
            {
              id: 'a3cc45bf-9720-4e08-b403-b9133fe33f0b',
              name: 'Event.SpaceMembershipExpired.ReadWrite',
              displayName: 'Event Space Membership Expired',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '7275921e-b737-4074-ba91-3c2983be3edd' }
            },
            {
              id: '896194c2-5055-4ea3-94a3-0a1419187a00',
              name: 'Event.SpaceDisabled.ReadWrite',
              displayName: 'Event Space Disabled',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'eb5c716e-03be-42c6-9ed1-1105d24e109f' }
            },
            {
              id: '2083c280-b140-4b73-a931-9a4af2931531',
              name: 'Event.SpaceDeleted.ReadWrite',
              displayName: 'Event Space Deleted',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '094ceca9-5a00-40ba-bb1a-bbc7bccd39ee' }
            },
            {
              id: '27ba8e97-0bdf-4b18-97d4-df44c9568cda',
              name: 'Event.PostprocessingStepFinished.ReadWrite',
              displayName: 'Event Postprocessing Step Finished',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'fe0a3011-d886-49c8-b797-33d02fa426ef' }
            },
            {
              id: '7d81f103-0488-4853-bce5-98dcce36d649',
              name: 'Language.ReadWrite',
              displayName: 'Permission to read and set the language',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'aa8cfbe5-95d4-4f7e-a032-c3c01f5f062f' }
            },
            {
              id: '4ebaa725-bfaa-43c5-9817-78bc9994bde4',
              name: 'Favorites.List',
              displayName: 'List Favorites',
              description: 'This permission allows listing favorites.',
              permissionValue: { operation: 'OPERATION_READ', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: '016f6ddd-9501-4a0a-8ebe-64a20ee8ec82',
              name: 'Drives.List',
              displayName: 'List All Spaces',
              description: 'This permission allows listing all spaces.',
              permissionValue: { operation: 'OPERATION_READ', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: 'b44b4054-31a2-42b8-bb71-968b15cfbd4f',
              name: 'Drives.ReadWrite',
              displayName: 'Manage space properties',
              description:
                'This permission allows managing space properties such as name and description.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: 'e03070e9-4362-4cc6-a872-1c7cb2eb2b8e',
              name: 'Self.ReadWrite',
              displayName: 'Self Management',
              description: 'This permission gives access to self management.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_USER', id: 'me' }
            },
            {
              id: '977f0ae6-0da2-4856-93f3-22e0a8482489',
              name: 'Drives.ReadWriteProjectQuota',
              displayName: 'Set Project Space Quota',
              description: 'This permission allows managing project space quotas.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: 'cf3faa8c-50d9-4f84-9650-ff9faf21aa9d',
              name: 'Drives.ReadWriteEnabled',
              displayName: 'Space ability',
              description: 'This permission allows enabling and disabling spaces.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: 'a54778fd-1c45-47f0-892d-655caf5236f2',
              name: 'Favorites.Write',
              displayName: 'Write Favorites',
              description: 'This permission allows marking files as favorites.',
              permissionValue: { operation: 'OPERATION_WRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_FILE' }
            }
          ],
          resource: { type: 'TYPE_SYSTEM' }
        },
        {
          id: 'd7beeea8-8ff4-406b-8fb6-ab2dd81e6b11',
          name: 'user',
          type: 'TYPE_ROLE',
          extension: 'ocis-roles',
          displayName: 'User',
          settings: [
            {
              id: '4e41363c-a058-40a5-aec8-958897511209',
              name: 'AutoAcceptShares.ReadWriteDisabled',
              displayName: 'enable/disable auto accept shares',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'ec3ed4a3-3946-4efc-8f9f-76d38b12d3a9' }
            },
            {
              id: '11516bbd-7157-49e1-b6ac-d00c820f980b',
              name: 'PublicLink.Write',
              displayName: 'Write publiclink',
              description: 'This permission allows creating public links.',
              permissionValue: { operation: 'OPERATION_WRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SHARE' }
            },
            {
              id: '069c08b1-e31f-4799-9ed6-194b310e7244',
              name: 'Shares.Write',
              displayName: 'Write share',
              description: 'This permission allows creating shares.',
              permissionValue: { operation: 'OPERATION_WRITE', constraint: 'CONSTRAINT_ALL' },
              resource: { type: 'TYPE_SHARE' }
            },
            {
              id: '79e13b30-3e22-11eb-bc51-0b9f0bad9a58',
              name: 'Drives.Create',
              displayName: 'Create Space',
              description: 'This permission allows creating new spaces.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: 'ad5bb5e5-dc13-4cd3-9304-09a424564ea8',
              name: 'EmailNotifications.ReadWriteDisabled',
              displayName: 'Disable Email Notifications',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '33ffb5d6-cd07-4dc0-afb0-84f7559ae438' }
            },
            {
              id: '7dc204ee-799a-43b6-b85d-425fb3b1fa5a',
              name: 'EmailSendingInterval.ReadWrite',
              displayName: 'Email Sending Interval',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '08dec2fe-3f97-42a9-9d1b-500855e92f25' }
            },
            {
              id: '8a50540c-1cdd-481f-b85f-44654393c8f0',
              name: 'Event.ShareCreated.ReadWrite',
              displayName: 'Event Share Created',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '872d8ef6-6f2a-42ab-af7d-f53cc81d7046' }
            },
            {
              id: '5ef55465-8e39-4a6c-ba97-1d19f5b07116',
              name: 'Event.ShareRemoved.ReadWrite',
              displayName: 'Event Share Removed',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'd7484394-8321-4c84-9677-741ba71e1f80' }
            },
            {
              id: '7d4f961b-d471-451b-b1fd-ac6a9d59ce88',
              name: 'Event.ShareExpired.ReadWrite',
              displayName: 'Event Share Expired',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'e1aa0b7c-1b0f-4072-9325-c643c89fee4e' }
            },
            {
              id: 'feb16d2c-614c-4f79-ac37-755a028f5616',
              name: 'Event.SpaceShared.ReadWrite',
              displayName: 'Event Space Shared',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '694d5ee1-a41c-448c-8d14-396b95d2a918' }
            },
            {
              id: '4f979732-631b-4f27-9be7-a89fb223a6d2',
              name: 'Event.SpaceUnshared.ReadWrite',
              displayName: 'Event Space Unshared',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '26c20e0e-98df-4483-8a77-759b3a766af0' }
            },
            {
              id: 'a3cc45bf-9720-4e08-b403-b9133fe33f0b',
              name: 'Event.SpaceMembershipExpired.ReadWrite',
              displayName: 'Event Space Membership Expired',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '7275921e-b737-4074-ba91-3c2983be3edd' }
            },
            {
              id: '896194c2-5055-4ea3-94a3-0a1419187a00',
              name: 'Event.SpaceDisabled.ReadWrite',
              displayName: 'Event Space Disabled',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'eb5c716e-03be-42c6-9ed1-1105d24e109f' }
            },
            {
              id: '2083c280-b140-4b73-a931-9a4af2931531',
              name: 'Event.SpaceDeleted.ReadWrite',
              displayName: 'Event Space Deleted',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '094ceca9-5a00-40ba-bb1a-bbc7bccd39ee' }
            },
            {
              id: '27ba8e97-0bdf-4b18-97d4-df44c9568cda',
              name: 'Event.PostprocessingStepFinished.ReadWrite',
              displayName: 'Event Postprocessing Step Finished',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'fe0a3011-d886-49c8-b797-33d02fa426ef' }
            },
            {
              id: '7d81f103-0488-4853-bce5-98dcce36d649',
              name: 'Language.ReadWrite',
              displayName: 'Permission to read and set the language',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'aa8cfbe5-95d4-4f7e-a032-c3c01f5f062f' }
            },
            {
              id: '4ebaa725-bfaa-43c5-9817-78bc9994bde4',
              name: 'Favorites.List',
              displayName: 'List Favorites',
              description: 'This permission allows listing favorites.',
              permissionValue: { operation: 'OPERATION_READ', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SYSTEM' }
            },
            {
              id: 'e03070e9-4362-4cc6-a872-1c7cb2eb2b8e',
              name: 'Self.ReadWrite',
              displayName: 'Self Management',
              description: 'This permission gives access to self management.',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_USER', id: 'me' }
            },
            {
              id: 'a54778fd-1c45-47f0-892d-655caf5236f2',
              name: 'Favorites.Write',
              displayName: 'Write Favorites',
              description: 'This permission allows marking files as favorites.',
              permissionValue: { operation: 'OPERATION_WRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_FILE' }
            }
          ],
          resource: { type: 'TYPE_SYSTEM' }
        },
        {
          id: '38071a68-456a-4553-846a-fa67bf5596cc',
          name: 'user-light',
          type: 'TYPE_ROLE',
          extension: 'ocis-roles',
          displayName: 'User Light',
          settings: [
            {
              id: '4e41363c-a058-40a5-aec8-958897511209',
              name: 'AutoAcceptShares.ReadWriteDisabled',
              displayName: 'enable/disable auto accept shares',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'ec3ed4a3-3946-4efc-8f9f-76d38b12d3a9' }
            },
            {
              id: 'ad5bb5e5-dc13-4cd3-9304-09a424564ea8',
              name: 'EmailNotifications.ReadWriteDisabled',
              displayName: 'Disable Email Notifications',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '33ffb5d6-cd07-4dc0-afb0-84f7559ae438' }
            },
            {
              id: '7dc204ee-799a-43b6-b85d-425fb3b1fa5a',
              name: 'EmailSendingInterval.ReadWrite',
              displayName: 'Email Sending Interval',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '08dec2fe-3f97-42a9-9d1b-500855e92f25' }
            },
            {
              id: '8a50540c-1cdd-481f-b85f-44654393c8f0',
              name: 'Event.ShareCreated.ReadWrite',
              displayName: 'Event Share Created',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '872d8ef6-6f2a-42ab-af7d-f53cc81d7046' }
            },
            {
              id: '5ef55465-8e39-4a6c-ba97-1d19f5b07116',
              name: 'Event.ShareRemoved.ReadWrite',
              displayName: 'Event Share Removed',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'd7484394-8321-4c84-9677-741ba71e1f80' }
            },
            {
              id: '7d4f961b-d471-451b-b1fd-ac6a9d59ce88',
              name: 'Event.ShareExpired.ReadWrite',
              displayName: 'Event Share Expired',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'e1aa0b7c-1b0f-4072-9325-c643c89fee4e' }
            },
            {
              id: 'feb16d2c-614c-4f79-ac37-755a028f5616',
              name: 'Event.SpaceShared.ReadWrite',
              displayName: 'Event Space Shared',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '694d5ee1-a41c-448c-8d14-396b95d2a918' }
            },
            {
              id: '4f979732-631b-4f27-9be7-a89fb223a6d2',
              name: 'Event.SpaceUnshared.ReadWrite',
              displayName: 'Event Space Unshared',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '26c20e0e-98df-4483-8a77-759b3a766af0' }
            },
            {
              id: 'a3cc45bf-9720-4e08-b403-b9133fe33f0b',
              name: 'Event.SpaceMembershipExpired.ReadWrite',
              displayName: 'Event Space Membership Expired',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '7275921e-b737-4074-ba91-3c2983be3edd' }
            },
            {
              id: '896194c2-5055-4ea3-94a3-0a1419187a00',
              name: 'Event.SpaceDisabled.ReadWrite',
              displayName: 'Event Space Disabled',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'eb5c716e-03be-42c6-9ed1-1105d24e109f' }
            },
            {
              id: '2083c280-b140-4b73-a931-9a4af2931531',
              name: 'Event.SpaceDeleted.ReadWrite',
              displayName: 'Event Space Deleted',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: '094ceca9-5a00-40ba-bb1a-bbc7bccd39ee' }
            },
            {
              id: '27ba8e97-0bdf-4b18-97d4-df44c9568cda',
              name: 'Event.PostprocessingStepFinished.ReadWrite',
              displayName: 'Event Postprocessing Step Finished',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'fe0a3011-d886-49c8-b797-33d02fa426ef' }
            },
            {
              id: '7d81f103-0488-4853-bce5-98dcce36d649',
              name: 'Language.ReadWrite',
              displayName: 'Permission to read and set the language',
              permissionValue: { operation: 'OPERATION_READWRITE', constraint: 'CONSTRAINT_OWN' },
              resource: { type: 'TYPE_SETTING', id: 'aa8cfbe5-95d4-4f7e-a032-c3c01f5f062f' }
            }
          ],
          resource: { type: 'TYPE_SYSTEM' }
        }
      ]

      // const {
      //   data: { bundles: roles }
      // } = await httpClient.post<{ bundles: SettingsBundle[] }>('/api/v0/settings/roles-list', {})
      return roles
    } catch (e) {
      console.error(e)
      return []
    }
  }

  private async fetchRole({ graphUser, roles }: { graphUser: OcUser; roles: SettingsBundle[] }) {
    const httpClient = this.clientService.httpAuthenticated
    // const userAssignmentResponse = await httpClient.post<{ assignments: SettingsBundle[] }>(
    //   '/api/v0/settings/assignments-list',
    //   { account_uuid: graphUser.id }
    // )
    const userAssignmentResponse = {
      data: {
        assignments: [
          {
            id: 'c933ceb4-d995-496e-b5d3-4ecfed192bb4',
            accountUuid: '534bb038-6f9d-4093-946f-133be61fa4e7',
            roleId: '2aadd357-682c-406b-8874-293091995fdd'
          }
        ]
      }
    }
    const assignments = userAssignmentResponse.data?.assignments
    const roleAssignment = assignments.find((assignment) => 'roleId' in assignment)
    return roleAssignment ? roles.find((role) => role.id === roleAssignment.roleId) : null
  }

  private async fetchCapabilities() {
    if (this.capabilityStore.isInitialized) {
      return
    }

    const capabilities = await this.clientService.ocs.getCapabilities()

    this.capabilityStore.setCapabilities(capabilities)
  }

  // copied from upstream oidc-client-ts UserManager with CERN customization
  protected async _signinEnd(url: string, verifySub?: string, ...args: any[]): Promise<User> {
    if (!this.configStore.options.isRunningOnEos) {
      return (super._signinEnd as any)(url, verifySub, ...args)
    }

    const logger = this._logger.create('_signinEnd')
    const signinResponse = await this._client.processSigninResponse(url)
    logger.debug('got signin response')

    const user = new User(signinResponse)
    if (verifySub) {
      if (verifySub !== user.profile.sub) {
        logger.debug(
          'current user does not match user returned from signin. sub from signin:',
          user.profile.sub
        )
        throw new ErrorResponse({ ...signinResponse, error: 'login_required' })
      }
      logger.debug('current user matches user returned from signin')
    }

    /* CERNBox customization
     * Do a call to the backend, as this will reply with the internal reva token.
     * Use that longer token in all calls to the backend (so, replace the default store token)
     */
    try {
      console.log('CERNBox: login successful, exchange sso token with reva token')
      const httpClient = this.clientService.httpAuthenticated
      const revaTokenReq = await httpClient.get('/ocs/v1.php/cloud/user')
      const revaToken = revaTokenReq.headers['x-access-token']
      const claims = JSON.parse(atob(revaToken.split('.')[1]))
      user.access_token = revaToken
      user.expires_at = claims.exp
    } catch (e) {
      console.error('Failed to get reva token, continue with sso one', e)
    }
    // end

    await this.storeUser(user)
    logger.debug('user stored')
    this._events.load(user)

    return user
  }

  private async fetchPermissions({ user }: { user: OcUser }) {
    const httpClient = this.clientService.httpAuthenticated
    try {
      // const {
      //   data: { permissions }
      // } = await httpClient.post<{ permissions: string[] }>('/api/v0/settings/permissions-list', {
      //   account_uuid: user.id
      // })
      const { permissions } = {
        permissions: [
          'Drives.Create.all',
          'Drives.DeleteProject.all',
          'Event.SpaceUnshared.ReadWrite.own',
          'ReadOnlyPublicLinkPassword.Delete.all',
          'EmailNotifications.ReadWriteDisabled.own',
          'Language.ReadWrite.own',
          'Favorites.List.own',
          'Event.SpaceMembershipExpired.ReadWrite.own',
          'EmailSendingInterval.ReadWrite.own',
          'Event.SpaceDisabled.ReadWrite.own',
          'Event.SpaceDeleted.ReadWrite.own',
          'Drives.List.all',
          'Drives.ReadWrite.all',
          'Self.ReadWrite.own',
          'Drives.ReadWriteProjectQuota.all',
          'Event.SpaceShared.ReadWrite.own',
          'Event.PostprocessingStepFinished.ReadWrite.own',
          'Drives.ReadWriteEnabled.all',
          'Favorites.Write.own',
          'Event.ShareCreated.ReadWrite.own',
          'Event.ShareRemoved.ReadWrite.own',
          'Event.ShareExpired.ReadWrite.own',
          'AutoAcceptShares.ReadWriteDisabled.own',
          'PublicLink.Write.all',
          'Shares.Write.all'
        ]
      }

      return permissions
    } catch (e) {
      console.error(e)
      return []
    }
  }

  private async updateUserAbilities(user: OcUser) {
    const permissions = await this.fetchPermissions({ user })
    const abilities = getAbilities(permissions)
    this.ability.update(abilities)
  }
}
