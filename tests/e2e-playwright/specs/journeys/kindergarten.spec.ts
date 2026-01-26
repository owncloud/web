import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment/index.js'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as api from '../../steps/api/api.js'
import * as ui from '../../steps/ui/index'

test.describe('Kindergarten can use web to organize a day', { tag: '@predefined-users' }, () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const filesEnvironment = new FilesEnvironment()

  test.beforeEach(async ({ browser }) => {
    actorsEnvironment = new ActorsEnvironment({
      context: {
        acceptDownloads: config.acceptDownloads,
        reportDir: config.reportDir,
        tracingReportDir: config.tracingReportDir,
        reportHar: config.reportHar,
        reportTracing: config.reportTracing,
        reportVideo: config.reportVideo,
        failOnUncaughtConsoleError: config.failOnUncaughtConsoleError
      },
      browser: browser
    })

    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    //   | Carol |
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Carol' })

    // And "Admin" creates following group using API
    //   | id       |
    //   | sales    |
    //   | security |
    await api.userHasCreatedGroup({ usersEnvironment, stepUser: 'Admin', groupName: 'sales' })
    await api.userHasCreatedGroup({ usersEnvironment, stepUser: 'Admin', groupName: 'security' })

    // And "Admin" adds user to the group using API
    //   | user  | group |
    //   | Brian | sales |
    await api.addUserToGroup({
      usersEnvironment,
      stepUser: 'Admin',
      groupName: 'sales',
      userToAdd: 'Brian'
    })

    await setAccessAndRefreshToken(usersEnvironment)
  })

  test.afterEach(async () => {
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('Alice can share this weeks meal plan with all parents', async () => {
    // When "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" navigates to the personal space page
    await ui.navigateToPersonalSpacePage({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" creates the following resources
    //   | resource                             | type   |
    //   | groups/Kindergarten Koalas/meal plan | folder |
    //   | groups/Pre-Schools Pirates/meal plan | folder |
    //   | groups/Teddy Bear Daycare/meal plan  | folder |
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'groups/Kindergarten Koalas/meal plan',
      type: 'folder'
    })
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'groups/Pre-Schools Pirates/meal plan',
      type: 'folder'
    })
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'groups/Teddy Bear Daycare/meal plan',
      type: 'folder'
    })

    // And "Alice" uploads the following resources
    //   | resource          | to                                   |
    //   | PARENT/parent.txt | groups/Kindergarten Koalas/meal plan |
    //   | lorem.txt         | groups/Kindergarten Koalas/meal plan |
    //   | lorem-big.txt     | groups/Kindergarten Koalas/meal plan |
    //   | data.zip          | groups/Pre-Schools Pirates/meal plan |
    //   | lorem.txt         | groups/Pre-Schools Pirates/meal plan |
    //   | lorem-big.txt     | groups/Pre-Schools Pirates/meal plan |
    //   | data.zip          | groups/Teddy Bear Daycare/meal plan  |
    //   | lorem.txt         | groups/Teddy Bear Daycare/meal plan  |
    //   | lorem-big.txt     | groups/Teddy Bear Daycare/meal plan  |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'PARENT/parent.txt',
      to: 'groups/Kindergarten Koalas/meal plan'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'PARENT/parent.txt',
      to: 'groups/Kindergarten Koalas/meal plan'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'lorem-big.txt',
      to: 'groups/Kindergarten Koalas/meal plan'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'data.zip',
      to: 'groups/Pre-Schools Pirates/meal plan'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      to: 'groups/Pre-Schools Pirates/meal plan'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'lorem-big.txt',
      to: 'groups/Pre-Schools Pirates/meal plan'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'data.zip',
      to: 'groups/Teddy Bear Daycare/meal plan'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      to: 'groups/Teddy Bear Daycare/meal plan'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'lorem-big.txt',
      to: 'groups/Teddy Bear Daycare/meal plan'
    })

    // And "Alice" shares the following resources using the sidebar panel
    //   | resource                                           | recipient | type  | role                      | resourceType |
    //   | groups/Pre-Schools Pirates/meal plan               | Brian     | user  | Can edit without versions | folder       |
    //   | groups/Pre-Schools Pirates/meal plan               | Carol     | user  | Can edit without versions | folder       |
    //   | groups/Pre-Schools Pirates/meal plan/lorem-big.txt | sales     | group | Can view                  | file         |
    //   | groups/Pre-Schools Pirates/meal plan/lorem-big.txt | Carol     | user  | Can view                  | file         |
    //   | groups/Kindergarten Koalas/meal plan               | sales     | group | Can view                  | folder       |
    //   | groups/Kindergarten Koalas/meal plan               | security  | group | Can edit without versions | folder       |
    //   | groups/Kindergarten Koalas/meal plan/lorem.txt     | sales     | group | Can view                  | file         |
    //   | groups/Kindergarten Koalas/meal plan/lorem.txt     | security  | group | Can view                  | file         |
    //   | groups/Teddy Bear Daycare/meal plan                | Brian     | user  | Can edit without versions | folder       |
    //   | groups/Teddy Bear Daycare/meal plan                | Carol     | user  | Can edit without versions | folder       |
    //   | groups/Teddy Bear Daycare/meal plan/data.zip       | Brian     | user  | Can edit without versions | file         |
    //   | groups/Teddy Bear Daycare/meal plan/data.zip       | Carol     | user  | Can edit without versions | file         |



    // # update share
    // And "Alice" updates following sharee role
    //   | resource                                           | recipient | type  | role                      | resourceType |
    //   | groups/Pre-Schools Pirates/meal plan               | Carol     | user  | Can view                  | folder       |
    //   | groups/Pre-Schools Pirates/meal plan/lorem-big.txt | sales     | group | Can edit without versions | file         |
    //   | groups/Kindergarten Koalas/meal plan               | sales     | group | Can edit without versions | folder       |
    //   | groups/Teddy Bear Daycare/meal plan/data.zip       | Carol     | user  | Can edit without versions | file         |

    // Then what do we check for to be confident that the above things done by Alice have worked?
    // When "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    // And "Brian" navigates to the shared with me page
    await ui.userHasNavigatedToSharesWithMe({actorsEnvironment,stepUser:'Brian'})

    // And "Brian" downloads the following resources using the sidebar panel
    //   | resource | from      | type |
    //   | data.zip | meal plan | file |

    // Then what do we check for to be confident that the above things done by Brian have worked?
    // Then the downloaded zip should contain... ?
    // When "Carol" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Carol' })

    // When "Brian" downloads the following resources using the sidebar panel
    //   | resource      | from      | type   |
    //   | lorem.txt     | meal plan | file   |
    //   | lorem-big.txt | meal plan | file   |
    //   | meal plan     |           | folder |
    // # Then what do we check for to be confident that the above things done by Brian have worked?
    // # Then the downloaded files should have content "abc..."

    // And "Brian" logs out
    // And "Alice" downloads the following resources using the sidebar panel
    //   | resource            | from                                 | type   |
    //   | parent.txt          | groups/Kindergarten Koalas/meal plan | file   |
    //   | lorem.txt           | groups/Kindergarten Koalas/meal plan | file   |
    //   | lorem-big.txt       | groups/Kindergarten Koalas/meal plan | file   |
    //   | data.zip            | groups/Pre-Schools Pirates/meal plan | file   |
    //   | lorem.txt           | groups/Pre-Schools Pirates/meal plan | file   |
    //   | lorem-big.txt       | groups/Pre-Schools Pirates/meal plan | file   |
    //   | data.zip            | groups/Teddy Bear Daycare/meal plan  | file   |
    //   | lorem.txt           | groups/Teddy Bear Daycare/meal plan  | file   |
    //   | lorem-big.txt       | groups/Teddy Bear Daycare/meal plan  | file   |
    //   | meal plan           | groups/Kindergarten Koalas           | folder |
    //   | meal plan           | groups/Pre-Schools Pirates           | folder |
    //   | meal plan           | groups/Teddy Bear Daycare            | folder |
    //   | Kindergarten Koalas | groups                               | folder |
    //   | Pre-Schools Pirates | groups                               | folder |
    //   | Teddy Bear Daycare  | groups                               | folder |
    //   | groups              |                                      | folder |
    // And "Alice" deletes the following resources using the batch action
    //   | resource            | from                                 |
    //   | lorem.txt           | groups/Kindergarten Koalas/meal plan |
    //   | lorem-big.txt       | groups/Kindergarten Koalas/meal plan |
    //   | data.zip            | groups/Pre-Schools Pirates/meal plan |
    //   | lorem.txt           | groups/Pre-Schools Pirates/meal plan |
    //   | lorem-big.txt       | groups/Pre-Schools Pirates/meal plan |
    //   | data.zip            | groups/Teddy Bear Daycare/meal plan  |
    //   | lorem.txt           | groups/Teddy Bear Daycare/meal plan  |
    //   | lorem-big.txt       | groups/Teddy Bear Daycare/meal plan  |
    //   | Kindergarten Koalas | groups                               |
    //   | Pre-Schools Pirates | groups                               |
    //   | Teddy Bear Daycare  | groups                               |
    // # Then what do we check for to be confident that the above things done by Alice have worked?
    // # Then the downloaded files should have content "abc..."
    // And "Alice" logs out
  })
})
