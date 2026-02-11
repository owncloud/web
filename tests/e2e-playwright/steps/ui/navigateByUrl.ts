import { objects } from '../../../e2e/support'
import { ActorsEnvironment, UsersEnvironment, FilesEnvironment } from '../../../e2e/support/environment'

export async function userNavigatesToNonExistingPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.navigateToNonExistingPage()
}

export async function userShouldSeeNotFoundPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.waitForNotFoundPageToBeVisible()
}

export async function userNavigatesToResourceOfSpaceViaUrl({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  resource,
  space
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  resource: string
  space: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const user = usersEnvironment.getUser({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.openResourceViaUrl({ resource, user, space })
}

// When(
//   '{string} restores following resource(s) version',
//   async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
//     const { page } = this.actorsEnvironment.getActor({ key: stepUser })
//     const resourceObject = new objects.applicationFiles.Resource({ page })
//     const fileInfo = stepTable.hashes().reduce<Record<string, any>>((acc, stepRow) => {
//       const { to, resource, version, openDetailsPanel } = stepRow

//       if (!acc[to]) {
//         acc[to] = []
//       }

//       acc[to].push(this.filesEnvironment.getFile({ name: resource }))

//       if (version !== '1') {
//         throw new Error('restoring is only supported for the most recent version')
//       }
//       acc[to]['openDetailsPanel'] = openDetailsPanel === 'true'

//       return acc
//     }, {})
//     for (const folder of Object.keys(fileInfo)) {
//       await resourceObject.restoreVersion({
//         folder,
//         files: fileInfo[folder],
//         openDetailsPanel: fileInfo[folder]['openDetailsPanel']
//       })
//     }
//   }
// )

// Then "Alice" restores following resources version
//   | resource  | to | version | openDetailsPanel |
//   | lorem.txt | /  | 1       | false            |

// {
//   '/': [
//     {
//       name: 'lorem.txt',
//       path: '/home/nabin/www/web/tests/e2e/filesForUpload/lorem.txt'
//     },
//     openDetailsPanel: false
//   ]
// }

export async function userRestoresVersionOfResource({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  resource,
  to,
  version,
  openDetailsPanel
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  resource: string
  to: string
  version: string
  openDetailsPanel: boolean
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const path = filesEnvironment.getFile({ name: resource })
  await resourceObject.restoreVersion({
    to,
    resource: [{ name: resource, path : path }, openDetailsPanel],
    openDetailsPanel
  })
} 