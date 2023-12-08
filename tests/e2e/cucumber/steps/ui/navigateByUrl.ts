import { Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { World } from '../../environment'
import { objects } from '../../../support'

When(
    '{string} navigates to {string} details panel of file {string} through the URL',
    async function (this: World, stepUser: string, detailsPanel: string, resource: string): Promise<void> {
        const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    }
)
