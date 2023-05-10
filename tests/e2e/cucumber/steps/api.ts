import { Given, DataTable } from '@cucumber/cucumber'
import { World } from '../environment'
import { config } from '../../config'
import { api } from '../../support'
import fs from 'fs'

Given(
  '{string} creates following user(s) using API',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const admin = this.usersEnvironment.getUser({ key: stepUser })

    for (const info of stepTable.hashes()) {
      const user = this.usersEnvironment.getUser({ key: info.id })
      if (config.ocis) {
        await api.graph.createUser({ user, admin })
      } else {
        await api.user.createUser({ user, admin })
      }
    }
  }
)

Given(
  '{string} assigns following roles to the users using API',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const admin = this.usersEnvironment.getUser({ key: stepUser })
    for await (const info of stepTable.hashes()) {
      const user = this.usersEnvironment.getUser({ key: info.id })
      const { id } = await api.graph.me({ user })
      await api.graph.assignRole(admin, id, info.role)
    }
  }
)

Given(
  '{string} sets the default folder for received shares to {string}',
  async function (this: World, stepUser: string, value: string): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: stepUser })

    if (!config.ocis) {
      await api.config.setShareFolder({ value, user })
    }
  }
)

Given(
  /^"([^"]*)" (disables|enables) share auto accepting$/,
  async function (this: World, stepUser: string, actionType: string): Promise<void> {
    if (config.ocis) {
      return
    }

    const user = this.usersEnvironment.getUser({ key: stepUser })

    await api.config.disableShareAutoAccept({
      user,
      action: actionType === 'disables' ? 'disable' : 'enable'
    })
  }
)

Given(
  '{string} creates following group(s) using API',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const admin = this.usersEnvironment.getUser({ key: stepUser })

    for (const info of stepTable.hashes()) {
      const group = this.usersEnvironment.getGroup({ key: info.id })
      if (config.ocis) {
        await api.graph.createGroup({ group, admin })
      } else {
        await api.user.createGroup({ group, admin })
      }
    }
  }
)

Given(
  '{string} adds user(s) to the group(s) using API',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const admin = this.usersEnvironment.getUser({ key: stepUser })

    for (const info of stepTable.hashes()) {
      const group = this.usersEnvironment.getGroup({ key: info.group })
      const user = this.usersEnvironment.getUser({ key: info.user })
      if (config.ocis) {
        await api.graph.addUserToGroup({ user, group, admin })
      } else {
        await api.user.addUserToGroup({ user, group, admin })
      }
    }
  }
)

Given(
  '{string} creates the following folder(s) in personal space using API',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: stepUser })
    for (const info of stepTable.hashes()) {
      await api.dav.createFolderInsidePersonalSpace({ user, folder: info.name })
    }
  }
)

Given(
  '{string} creates {int} folder(s) in personal space using API',
  async function (this: World, stepUser: string, numberOfFolders: number): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: stepUser })
    for (let i = 1; i <= numberOfFolders; i++) {
      const folderName = 'testFolder' + i
      await api.dav.createFolderInsidePersonalSpace({ user, folder: folderName })
    }
  }
)

Given(
  '{string} shares the following resource using API',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: stepUser })
    for (const info of stepTable.hashes()) {
      await api.share.createShare({
        user,
        path: info.resource,
        shareType: info.type,
        shareWith: info.recipient,
        role: info.role,
        name: info.name
      })
    }
  }
)

Given(
  '{string} accepts the following share(s) using API',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: stepUser })
    for (const info of stepTable.hashes()) {
      await api.share.acceptShare({
        user,
        path: info.name
      })
    }
  }
)

Given(
  '{string} creates the following file(s) into personal space using API',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: stepUser })
    for (const info of stepTable.hashes()) {
      await api.dav.uploadFileInPersonalSpace({
        user,
        pathToFile: info.pathToFile,
        content: info.content
      })
    }
  }
)

Given(
  '{string} creates {int} file(s) in personal space using API',
  async function (this: World, stepUser: string, numberOfFiles: number): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: stepUser })
    for (let i = 1; i <= numberOfFiles; i++) {
      const fileName = 'testfile' + i + '.txt'
      const content = 'This is a test file' + i
      await api.dav.uploadFileInPersonalSpace({
        user,
        pathToFile: fileName,
        content: content
      })
    }
  }
)

Given(
  '{string} uploads the following local file(s) into personal space using API',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: stepUser })
    for (const info of stepTable.hashes()) {
      const fileInfo = this.filesEnvironment.getFile({ name: info.localFile.split('/').pop() })
      const content = fs.readFileSync(fileInfo.path)
      await api.dav.uploadFileInPersonalSpace({
        user,
        pathToFile: info.to,
        content: content.toString()
      })
    }
  }
)

Given(
  '{string} creates the following project space(s) using API',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: stepUser })
    for (const space of stepTable.hashes()) {
      const spaceId = await api.graph.createSpace({ user, space })
      this.spacesEnvironment.createSpace({
        key: space.id || space.name,
        space: { name: space.name, id: spaceId }
      })
    }
  }
)

Given(
  '{string} creates the following file(s) in space {string} using API',
  async function (
    this: World,
    stepUser: string,
    space: string,
    stepTable: DataTable
  ): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: stepUser })
    for (const info of stepTable.hashes()) {
      await api.dav.uploadFileInsideSpaceBySpaceName({
        user,
        pathToFile: info.name,
        spaceName: space,
        content: info.content
      })
    }
  }
)

Given(
  '{string} creates the following folder(s) in space {string} using API',
  async function (
    this: World,
    stepUser: string,
    space: string,
    stepTable: DataTable
  ): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: stepUser })
    for (const info of stepTable.hashes()) {
      await api.dav.createFolderInsideSpaceBySpaceName({
        user,
        folder: info.name,
        spaceName: space
      })
    }
  }
)

Given(
  '{string} adds the following member(s) to the space {string} using API',
  async function (
    this: World,
    stepUser: string,
    space: string,
    stepTable: DataTable
  ): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: stepUser })
    for (const info of stepTable.hashes()) {
      await api.dav.addMembersToTheProjectSpace({
        user,
        spaceName: space,
        shareWith: info.user,
        shareType: info.shareType,
        role: info.role
      })
    }
  }
)
