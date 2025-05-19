import { Page } from '@playwright/test'
import { startCase } from 'lodash-es'
import util from 'util'
import { Group, User } from '../../../types'
import { getActualExpiryDate } from '../../../utils/datePicker'
import { locatorUtils } from '../../../utils'

export interface ICollaborator {
  collaborator: User | Group
  role?: string
  type?: CollaboratorType
  resourceType?: string
  expirationDate?: string
  shareType?: string
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

export default class Collaborator {
  private static readonly invitePanel = '//*[@id="oc-files-sharing-sidebar"]'
  private static readonly inviteInput = '#files-share-invite-input'
  private static readonly newCollaboratorRoleDropdown =
    '//*[@id="files-collaborators-role-button-new"]'
  private static readonly sendInvitationButton = '#new-collaborators-form-create-button'
  public static readonly collaboratorRoleDropdownButton =
    '%s//button[contains(@class,"files-recipient-role-select-btn")]'
  private static readonly collaboratorRoleItemSelector = '%s//button[contains(@id, "%s")]'
  private static readonly collaboratorRoleButton = '//button[contains(@id, "%s")]'
  public static readonly collaboratorEditDropdownButton =
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
    '%s//ul[contains(@class,"collaborator-edit-dropdown-options-list")]//button[contains(@class,"recipient-datepicker-btn")]'
  private static readonly removeExpirationDateCollaboratorButton =
    '%s//ul[contains(@class,"collaborator-edit-dropdown-options-list")]//button[contains(@class,"remove-expiration-date")]'
  private static readonly showAccessDetailsButton =
    '%s//ul[contains(@class,"collaborator-edit-dropdown-options-list")]//button[contains(@class,"show-access-details")]'
  private static readonly removeCollaboratorConfirmationButton = '.oc-modal-body-actions-confirm'
  private static readonly collaboratorExpirationDatepicker = '.oc-modal-body .oc-date-picker input'
  private static readonly collaboratorExpirationDatepickerConfirmButton =
    '.oc-modal-body-actions-confirm'
  private static readonly collaboratorDropdownItem =
    'div[data-testid="new-collaborators-form"] div[data-testid="recipient-autocomplete-item-%s"]'

  static async addCollaborator(args: CollaboratorArgs): Promise<void> {
    const {
      page,
      collaborator: { collaborator }
    } = args
    const collaboratorInputLocator = page.locator(Collaborator.inviteInput)
    await collaboratorInputLocator.click()
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('users') && resp.status() === 200),
      collaboratorInputLocator.fill(collaborator.displayName)
    ])
    await collaboratorInputLocator.focus()
    await page.locator('.vs--open').waitFor()
    await page
      .locator(util.format(Collaborator.collaboratorDropdownItem, collaborator.displayName))
      .click()
  }

  static async sendInvitation(page: Page, collaborators: string[]): Promise<void> {
    const checkResponses = []
    for (let i = 0; i < collaborators.length; i++) {
      checkResponses.push(
        page.waitForResponse((resp) => {
          return (
            resp.url().endsWith('invite') &&
            resp.status() === 200 &&
            resp.request().method() === 'POST'
          )
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
      collaboratorNames.push(collaborator.collaborator.displayName)
    }
    await Collaborator.setCollaboratorRole(page, role, resourceType)
    await Collaborator.sendInvitation(page, collaboratorNames)
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
      itemSelector = Collaborator.collaboratorRoleButton
    }
    await page.locator(dropdownSelector).click()

    await page.locator(util.format(itemSelector, role)).click()
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
      .first()
      .click()
    await page.locator(util.format(Collaborator.removeCollaboratorButton, collaboratorRow)).click()

    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('permissions') &&
          resp.status() === 204 &&
          resp.request().method() === 'DELETE'
      ),
      page.locator(Collaborator.removeCollaboratorConfirmationButton).click()
    ])
    if (removeOwnSpaceAccess) {
      await page.waitForURL(/.*\/files\/spaces.*/)
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

    const panel = page.locator(Collaborator.invitePanel)
    await Promise.all([
      locatorUtils.waitForEvent(panel, 'transitionend'),
      page
        .locator(util.format(Collaborator.setExpirationDateCollaboratorButton, collaboratorRow))
        .click()
    ])

    await Collaborator.setExpirationDate(page, expirationDate)
  }

  static async setExpirationDate(page: Page, expirationDate: any): Promise<void> {
    const newExpiryDate = getActualExpiryDate(
      expirationDate.toLowerCase().match(/[dayrmonthwek]+/)[0],
      expirationDate
    )

    await page
      .locator(Collaborator.collaboratorExpirationDatepicker)
      .fill(newExpiryDate.toISOString().split('T')[0])
    await page.locator(Collaborator.collaboratorExpirationDatepickerConfirmButton).click()
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
          resp.url().includes('permissions') &&
          resp.status() === 200 &&
          resp.request().method() === 'PATCH'
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
          collaborator.displayName
        )
      : util.format(Collaborator.collaboratorUserSelector, collaborator.displayName)
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
      const details: Record<string, string> = {}
      nodes.forEach((node) => {
        if (node.nodeName === 'DT') {
          details[node.textContent] = node.nextSibling.textContent
        }
      })
      return details
    })
  }
}
