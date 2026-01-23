import { DataTable, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { World } from '../../environment'
import { objects } from '../../../support'
import { substitute } from '../../../support/utils/substitute'

When(
  '{string} creates a public link of following resource using the sidebar panel',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })

    for (const info of stepTable.hashes()) {
      await linkObject.create({
        resource: info.resource,
        role: info.role,
        password: substitute(info.password),
        name: 'Unnamed link'
      })
      const a11yObject = new objects.a11y.Accessibility({ page })
      const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
      this.currentStepData = {
        a11yViolations
      }
      expect(a11yViolations).toMatchObject([])
    }
  }
)

When(
  '{string} creates a public link for the space with password {string} using the sidebar panel',
  async function (this: World, stepUser: string, password: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spaceObject = new objects.applicationFiles.Spaces({ page })
    password = substitute(password)
    await spaceObject.createPublicLink({ password, world: this })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} renames the most recently created public link of resource {string} to {string}',
  async function (this: World, stepUser: string, resource: string, newName: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const linkName = await linkObject.changeName({ resource, newName, world: this })
    expect(linkName).toBe(newName)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} renames the most recently created public link of space to {string}',
  async function (this: World, stepUser: any, newName: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const linkName = await linkObject.changeName({ newName, space: true, world: this })
    expect(linkName).toBe(newName)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} sets the expiration date of the public link named {string} of resource {string} to {string}',
  async function (
    this: World,
    stepUser: string,
    linkName: string,
    resource: string,
    expireDate: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.addExpiration({ resource, linkName, expireDate, world: this })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} changes the password of the public link named {string} of resource {string} to {string}',
  async function (
    this: World,
    stepUser: string,
    linkName: string,
    resource: string,
    newPassword: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.addPassword({ resource, linkName, newPassword, world: this })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} tries to sets a new password {string} of the public link named {string} of resource {string}',
  async function (
    this: World,
    stepUser: string,
    newPassword: string,
    linkName: string,
    resource: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.fillPassword({ resource, linkName, newPassword, world: this })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  /^"([^"]*)" (reveals|hides) the password of the public link$/,
  async function (this: World, stepUser: string, showOrHide: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.showOrHidePassword({ showOrHide })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} closes the public link password dialog box',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.clickOnCancelButton()
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} copies the password of the public link',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.copyEnteredPassword()
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} generates the password for the public link',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.generatePassword()
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} sets the password of the public link',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.setPassword()
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} edits the public link named {string} of resource {string} changing role to {string}',
  async function (
    this: World,
    stepUser: string,
    linkName: any,
    resource: string,
    role: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const roleText = await linkObject.changeRole({ linkName, resource, role, world: this })
    expect(roleText.toLowerCase()).toBe(role.toLowerCase())
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} removes the public link named {string} of resource {string}',
  async function (this: World, stepUser: string, name: string, resource: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.delete({ resourceName: resource, name, world: this })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  'public link named {string} should be visible to {string}',
  async function (this: World, linkName: string, stepUser: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const expectedPublicLink = this.linksEnvironment.getLink({ name: linkName })
    const linkObject = new objects.applicationFiles.Link({ page })
    const actualPublicLink = await linkObject.getPublicLinkUrl({
      linkName,
      space: true,
      world: this
    })
    expect(actualPublicLink).toBe(expectedPublicLink)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  'public link named {string} of the resource {string} should be visible to {string}',
  async function (this: World, linkName: string, resource: string, stepUser: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const expectedPublicLink = this.linksEnvironment.getLink({ name: linkName })
    const linkObject = new objects.applicationFiles.Link({ page })
    const actualPublicLink = await linkObject.getPublicLinkUrl({ linkName, resource, world: this })
    expect(actualPublicLink).toBe(expectedPublicLink)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  /^"([^"]*)" (should|should not) be able to edit the public link named "([^"]*)"$/,
  async function (
    this: World,
    stepUser: any,
    shouldOrShouldNot: string,
    linkName: any
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const isVisible = await linkObject.islinkEditButtonVisibile(linkName, this)
    expect(isVisible).toBe(shouldOrShouldNot !== 'should not')
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  '{string} should see an error message',
  async function (this: World, stepUser: any, errorMessage: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const actualErrorMessage = await linkObject.checkErrorMessage()
    expect(actualErrorMessage).toBe(errorMessage)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} edits the public link named {string} of the space changing role to {string}',
  async function (this: World, stepUser: string, linkName: string, role: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const newPermission = await linkObject.changeRole({ linkName, role, space: true, world: this })
    expect(newPermission.toLowerCase()).toBe(role.toLowerCase())
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} opens shared-with-me page from the internal link',
  async function (this: World, stepUser: string): Promise<void> {
    const actor = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.shares.WithMe({ page: actor.page })
    await pageObject.openShareWithMeFromInternalLink(actor)
    const a11yObject = new objects.a11y.Accessibility({ page: actor.page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} copies the link {string} of resource {string}',
  async function (
    this: World,
    stepUser: string,
    linkName: string,
    resource: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const clipboard = await linkObject.copyLinkToClipboard({
      resource: resource,
      name: linkName,
      world: this
    })
    expect(clipboard).toBe(this.linksEnvironment.getLink({ name: linkName }).url)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} copies the link of password protected folder {string}',
  async function (this: World, stepUser: string, resource: string) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.copyLinkToClipboard({
      resource: resource,
      resourceType: 'passwordProtectedFolder',
      world: this
    })
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} closes the password protected folder modal',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.closeFolderModal()
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)
