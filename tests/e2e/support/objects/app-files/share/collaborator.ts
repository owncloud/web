import { Page } from '@playwright/test'
import { startCase, difference } from 'lodash'
import util from 'util'
import { Group, User } from '../../../types'
import { getActualExpiryDate } from '../../../utils/datePicker'

export interface ICollaborator {
  collaborator: User | Group
  role?: string
  type?: CollaboratorType
  resourceType?: string
  expirationDate?: string
}

export interface InviteCollaboratorsArgs {
  page: Page
  collaborators: ICollaborator[]
}

export interface CollaboratorArgs {
  page: Page
  collaborator: ICollaborator
}

export interface RemoveCollaboratorArgs extends Omit<CollaboratorArgs, 'collaborator'> {
  collaborator: Omit<ICollaborator, 'role'>
  removeOwnSpaceAccess?: boolean
}

export interface SetExpirationDateForCollaboratorArgs
  extends Omit<CollaboratorArgs, 'collaborator'> {
  collaborator: Omit<ICollaborator, 'role'>
  expirationDate: any
}

export interface RemoveExpirationDateFromCollaboratorArgs
  extends Omit<CollaboratorArgs, 'collaborator'> {
  collaborator: Omit<ICollaborator, 'role'>
}

export interface SetDenyShareForCollaboratorArgs extends Omit<CollaboratorArgs, 'collaborator'> {
  collaborator: Omit<ICollaborator, 'role'>

  deny: boolean
}

export interface IAccessDetails {
  Name?: string
  'Additional info'?: string
  Type?: string
  'Access expires'?: string
  'Shared on'?: string
  'Invited by'?: string
}

export type CollaboratorType = 'user' | 'group'
export type CustomPermissionType = 'read' | 'update' | 'create' | 'delete'

export const shareRoles: Readonly<{
  'Invited people': string
  'Can upload': string
  'Can manage': string
  'Can edit': string
  'Can view': string
  'Secret File Drop': string
}> = {
  'Invited people': 'internal',
  'Can upload': 'contributor',
  'Can manage': 'manager',
  'Can edit': 'editor',
  'Can view': 'viewer',
  'Secret File Drop': 'uploader'
}

export default class Collaborator {
  private static readonly invitePanel = '//*[@id="oc-files-sharing-sidebar"]'
  private static readonly inviteInput = '#files-share-invite-input'
  private static readonly newCollaboratorRoleDropdown =
    '//*[@id="files-collaborators-role-button-new"]'
  private static readonly newCollaboratorRoleItemSelector = '//*[@id="files-role-%s"]'
  private static readonly sendInvitationButton = '#new-collaborators-form-create-button'
  private static readonly collaboratorRoleDropdownButton =
    '%s//button[contains(@class,"files-recipient-role-select-btn")]'
  private static readonly collaboratorRoleItemSelector =
    '%s//ul[contains(@class,"files-recipient-role-drop-list")]//button[@id="files-recipient-role-drop-btn-%s"]'
  private static readonly collaboratorEditDropdownButton =
    '%s//button[contains(@class,"collaborator-edit-dropdown-options-btn")]'
  private static readonly collaboratorUserSelector = '//*[@data-testid="collaborator-user-item-%s"]'
  private static readonly collaboratorGroupSelector =
    '//*[@data-testid="collaborator-group-item-%s" or @data-testid="collaborator-group-item-%s"]'
  private static readonly collaboratorRoleSelector =
    '%s//button[contains(@class,"files-recipient-role-select-btn")]/span[text()="%s"]'
  private static readonly removeCollaboratorButton =
    '%s//ul[contains(@class,"collaborator-edit-dropdown-options-list")]//button[contains(@class,"remove-share")]'
  private static readonly denyShareCollaboratorButton =
    '%s//ul[contains(@class,"collaborator-edit-dropdown-options-list")]//span[contains(@class,"deny-share")]//button[contains(@aria-checked,"%s")]'
  private static readonly setExpirationDateCollaboratorButton =
    '%s//ul[contains(@class,"collaborator-edit-dropdown-options-list")]//button[contains(@class,"files-collaborators-expiration-button")]'
  private static readonly removeExpirationDateCollaboratorButton =
    '%s//ul[contains(@class,"collaborator-edit-dropdown-options-list")]//button[contains(@class,"remove-expiration-date")]'
  private static readonly showAccessDetailsButton =
    '%s//ul[contains(@class,"collaborator-edit-dropdown-options-list")]//button[contains(@class,"show-access-details")]'
  private static readonly removeCollaboratorConfirmationButton = '.oc-modal-body-actions-confirm'
  private static readonly customPermissionCheckbox = '//*[@id="files-collaborators-permission-%s"]'
  private static readonly customPermissionApplyButton =
    '//*[contains(@class, "files-recipient-custom-permissions-drop-cancel-confirm-btns")]//button[text()="Apply"]'
  private static readonly collaboratorExpirationDatepicker =
    '.collaborator-edit-dropdown-options-list .files-recipient-expiration-datepicker:not(.vc-container)'
  private static readonly expirationDatepickerDaySelect = '.vc-day.id-%s'

  static readonly FOLDER_CUSTOM_PERMISSIONS: readonly CustomPermissionType[] = [
    'read',
    'update',
    'create',
    'delete'
  ]

  static readonly FILE_CUSTOM_PERMISSIONS: Omit<CustomPermissionType[], 'create' | 'delete'> = [
    'read',
    'update'
  ]

  static async addCollaborator(args: CollaboratorArgs): Promise<void> {
    const {
      page,
      collaborator: { collaborator }
    } = args
    const collaboratorInputLocator = page.locator(Collaborator.inviteInput)
    await collaboratorInputLocator.click()
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('sharees') && resp.status() === 200),
      collaboratorInputLocator.pressSequentially(collaborator.id)
    ])
    await collaboratorInputLocator.focus()
    await page.locator('.vs--open').waitFor()
    await page.locator('.vs__dropdown-option').click()
  }

  static async sendInvitation(page: Page, collaborators: string[]): Promise<void> {
    const checkResponses = []
    for (const collaborator of collaborators) {
      checkResponses.push(
        page.waitForResponse((resp) => {
          if (
            resp.url().endsWith('shares') &&
            resp.status() === 200 &&
            resp.request().method() === 'POST'
          ) {
            return resp.request().postDataJSON().shareWith.startsWith(collaborator)
          }
          return false
        })
      )
    }
    await Promise.all([...checkResponses, page.locator(Collaborator.sendInvitationButton).click()])
  }

  static async inviteCollaborators(args: InviteCollaboratorsArgs): Promise<void> {
    const { page, collaborators } = args
    // When adding multiple users/groups at once
    // the role of the first collaborator is used as the collaborators role
    const role = collaborators[0].role
    const resourceType = collaborators[0].resourceType
    const collaboratorNames = []
    for (const collaborator of collaborators) {
      await Collaborator.addCollaborator({ page, collaborator })
      collaboratorNames.push(collaborator.collaborator.id)
    }
    await Collaborator.setCollaboratorRole(page, role, resourceType)
    await Collaborator.sendInvitation(page, collaboratorNames)
  }

  static async setCustomPermissions(
    page: Page,
    permissions: CustomPermissionType[],
    resourceType: string
  ): Promise<void> {
    const CUSTOM_PERMISSIONS: readonly CustomPermissionType[] =
      resourceType === 'folder'
        ? Collaborator.FOLDER_CUSTOM_PERMISSIONS
        : Collaborator.FILE_CUSTOM_PERMISSIONS
    for (const permission of permissions) {
      if (!CUSTOM_PERMISSIONS.includes(permission)) {
        throw new Error(
          `Invalid custom permission: ${permission}\nAvailable permissions: ${CUSTOM_PERMISSIONS}`
        )
      }

      await page.check(util.format(Collaborator.customPermissionCheckbox, permission))
    }

    // uncheck others
    const removePermissions = difference(CUSTOM_PERMISSIONS, permissions)

    for (const permission of removePermissions) {
      await page.uncheck(util.format(Collaborator.customPermissionCheckbox, permission))
    }
  }

  static async setCollaboratorRole(
    page: Page,
    role: string,
    resourceType: string,
    dropdownSelector?: string,
    itemSelector?: string
  ): Promise<void> {
    if (!dropdownSelector) {
      dropdownSelector = Collaborator.newCollaboratorRoleDropdown
      itemSelector = Collaborator.newCollaboratorRoleItemSelector
    }
    await page.click(dropdownSelector)

    // custom permissions should be set as below
    // custom_permissions:read,share
    if (role.includes('custom_permissions')) {
      await page.click(util.format(itemSelector, 'custom'))
      const custom_permissions = role.split(':')[1]

      if (!custom_permissions) {
        throw new Error('No custom permissions provided: ' + custom_permissions)
      }

      const permissions = custom_permissions.split(',')
      await Collaborator.setCustomPermissions(
        page,
        permissions as CustomPermissionType[],
        resourceType
      )

      return await page.click(Collaborator.customPermissionApplyButton)
    }
    return await page.click(util.format(itemSelector, shareRoles[role]))
  }

  static async changeCollaboratorRole(args: CollaboratorArgs): Promise<void> {
    const {
      page,
      collaborator: { collaborator, type, role, resourceType }
    } = args

    const collaboratorRow = Collaborator.getCollaboratorUserOrGroupSelector(collaborator, type)
    const roleDropdownSelector = util.format(
      Collaborator.collaboratorRoleDropdownButton,
      collaboratorRow
    )
    const roleItemSelector = util.format(Collaborator.collaboratorRoleItemSelector, collaboratorRow)
    await Collaborator.setCollaboratorRole(
      page,
      role,
      resourceType,
      roleDropdownSelector,
      roleItemSelector
    )
  }

  static async removeCollaborator(args: RemoveCollaboratorArgs): Promise<void> {
    const {
      page,
      collaborator: { collaborator, type },
      removeOwnSpaceAccess
    } = args
    const collaboratorRow = Collaborator.getCollaboratorUserOrGroupSelector(collaborator, type)

    await page
      .locator(util.format(Collaborator.collaboratorEditDropdownButton, collaboratorRow))
      .click()
    await page.locator(util.format(Collaborator.removeCollaboratorButton, collaboratorRow)).click()

    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('shares') &&
          resp.status() === 200 &&
          resp.request().method() === 'DELETE'
      ),
      page.locator(Collaborator.removeCollaboratorConfirmationButton).click()
    ])
    if (removeOwnSpaceAccess) {
      await page.waitForNavigation()
    }
  }

  static async checkCollaborator(args: CollaboratorArgs): Promise<void> {
    const {
      page,
      collaborator: { collaborator, type, role }
    } = args
    const collaboratorRow = Collaborator.getCollaboratorUserOrGroupSelector(collaborator, type)

    await page.locator(collaboratorRow).waitFor()

    if (role) {
      const parts = role.split(' ')
      const collaboratorRole = `${startCase(parts[0].toLowerCase())} ${
        parts[1] ? `${parts[1].toLowerCase()}` : ''
      }`
      const roleSelector = util.format(
        Collaborator.collaboratorRoleSelector,
        collaboratorRow,
        collaboratorRole
      )
      await page.locator(roleSelector).waitFor()
    }
  }

  static async setExpirationDateForCollaborator(
    args: SetExpirationDateForCollaboratorArgs
  ): Promise<void> {
    const {
      page,
      collaborator: { collaborator, type },
      expirationDate
    } = args
    const collaboratorRow = Collaborator.getCollaboratorUserOrGroupSelector(collaborator, type)
    await page.locator(collaboratorRow).waitFor()

    await page
      .locator(util.format(Collaborator.collaboratorEditDropdownButton, collaboratorRow))
      .click()
    await page
      .locator(util.format(Collaborator.setExpirationDateCollaboratorButton, collaboratorRow))
      .click()

    await Collaborator.setExpirationDate(page, expirationDate)
  }

  static async setExpirationDate(page: Page, expirationDate: any): Promise<void> {
    const newExpiryDate = getActualExpiryDate(
      expirationDate.toLowerCase().match(/[dayrmonthwek]+/)[0],
      expirationDate
    )
    await page.locator(Collaborator.collaboratorExpirationDatepicker).evaluate(
      (datePicker: any, { newExpiryDate }): any => {
        datePicker.__datePicker.$refs.calendar.move(newExpiryDate)
      },
      { newExpiryDate }
    )
    await page
      .locator(
        util.format(
          Collaborator.expirationDatepickerDaySelect,
          newExpiryDate.toISOString().split('T')[0]
        )
      )
      .first()
      .click()
  }

  static async removeExpirationDateFromCollaborator(
    args: RemoveExpirationDateFromCollaboratorArgs
  ): Promise<void> {
    const {
      page,
      collaborator: { collaborator, type }
    } = args
    const collaboratorRow = Collaborator.getCollaboratorUserOrGroupSelector(collaborator, type)
    await page.locator(collaboratorRow).waitFor()
    await page
      .locator(util.format(Collaborator.collaboratorEditDropdownButton, collaboratorRow))
      .click()
    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('shares') &&
          resp.status() === 200 &&
          resp.request().method() === 'POST'
      ),
      page
        .locator(util.format(Collaborator.removeExpirationDateCollaboratorButton, collaboratorRow))
        .click()
    ])
  }

  static waitForInvitePanel(page: Page): Promise<void> {
    return page.locator(Collaborator.invitePanel).waitFor()
  }

  static getCollaboratorUserOrGroupSelector = (collaborator: User | Group, type = 'user') => {
    return type === 'group'
      ? util.format(
          Collaborator.collaboratorGroupSelector,
          collaborator.displayName,
          collaborator.id
        )
      : util.format(Collaborator.collaboratorUserSelector, collaborator.id)
  }

  static async setDenyShareForCollaborator(args: SetDenyShareForCollaboratorArgs): Promise<void> {
    const {
      page,
      collaborator: { collaborator, type },
      deny
    } = args
    const collaboratorRow = Collaborator.getCollaboratorUserOrGroupSelector(collaborator, type)
    await page.locator(collaboratorRow).waitFor()

    await page
      .locator(util.format(Collaborator.collaboratorEditDropdownButton, collaboratorRow))
      .click()

    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('shares') &&
          resp.status() === 200 &&
          resp.request().method() === (deny ? 'POST' : 'DELETE')
      ),
      page
        .locator(
          util.format(
            Collaborator.denyShareCollaboratorButton,
            collaboratorRow,
            deny ? 'false' : 'true'
          )
        )
        .click()
    ])
  }

  static async getAccessDetails(
    page: Page,
    recipient: Omit<ICollaborator, 'role'>
  ): Promise<IAccessDetails> {
    const { collaborator, type } = recipient
    const collaboratorRow = Collaborator.getCollaboratorUserOrGroupSelector(collaborator, type)
    await page
      .locator(util.format(Collaborator.collaboratorEditDropdownButton, collaboratorRow))
      .click()
    await page.locator(util.format(Collaborator.showAccessDetailsButton, collaboratorRow)).click()

    return page.locator('.share-access-details-drop dl').evaluate((el) => {
      const nodes = el.childNodes
      const details = {}
      nodes.forEach((node) => {
        if (node.nodeName === 'DT') {
          details[node.textContent] = node.nextSibling.textContent
        }
      })
      return details
    })
  }
}
