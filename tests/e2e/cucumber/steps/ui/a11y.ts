import { Given, When, Then } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'

import { expect } from '@playwright/test'

// Scenario: check accessibility of files view
Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the files section in default table view',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })

    const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
      a11yObject.getSelectors().files
    )
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} switches to the condensed table view',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.switchToCondensedTableView()
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
  }
)

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the files section in condensed table view',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })

    const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
      a11yObject.getSelectors().filesSpaceTable
    )
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the files section in tiles view',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
      a11yObject.getSelectors().tilesView
    )
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Given(
  '{string} switches to the default table view',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.switchToDefaultTableView()
  }
)

When(
  '{string} selects the display options',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.showDisplayOptions()
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
  }
)

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the display options menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
      a11yObject.getSelectors().displayOptionsMenu
    )
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Given(
  '{string} closes the display options menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.closeDisplayOptions()
  }
)

When(
  '{string} opens the files context menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.openFilesContextMenu()
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
  }
)

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the files context menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
      a11yObject.getSelectors().filesContextMenu
    )
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Given(
  '{string} exits the files context menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.exitContextMenu()
  }
)

When('{string} selects new', async function (this: World, stepUser: string): Promise<void> {
  const { page } = this.actorsEnvironment.getActor({ key: stepUser })

  const a11yObject = new objects.a11y.Accessibility({ page })
  await a11yObject.selectNew()
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
  this.currentStepData = {
    a11yViolations
  }
})

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the new context menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
      a11yObject.getSelectors().newResourceContextMenu
    )
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} selects the folder option within the new context menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.selectFolderOptionWithinNew()
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
  }
)

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the create new folder popup',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
      a11yObject.getSelectors().ocModal
    )
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Given(
  '{string} cancels creating a new folder',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.cancelCreatingNewFolder()
  }
)

When('{string} selects upload', async function (this: World, stepUser: string): Promise<void> {
  const { page } = this.actorsEnvironment.getActor({ key: stepUser })

  const a11yObject = new objects.a11y.Accessibility({ page })
  await a11yObject.selectUpload()
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
  this.currentStepData = {
    a11yViolations
  }
})

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the upload context menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
      a11yObject.getSelectors().uploadContextMenu
    )
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Given(
  '{string} exits the upload menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.exitContextMenu()
  }
)

When(
  '{string} selects a file by selecting the corresponding checkbox',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.selectFileThroughCheckbox()
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
  }
)

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the file actions buttons for that file',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
      a11yObject.getSelectors().appbarBatchActions
    )
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

Given('{string} deselects the file', async function (this: World, stepUser: string): Promise<void> {
  const { page } = this.actorsEnvironment.getActor({ key: stepUser })

  const a11yObject = new objects.a11y.Accessibility({ page })
  await a11yObject.deselectFileThroughCheckbox()
})
