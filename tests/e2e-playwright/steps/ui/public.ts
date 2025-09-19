import { objects } from '../../../e2e/support'
import { ActorsEnvironment, LinksEnvironment } from '../../../e2e/support/environment'

export async function openPublicLink({
  actorsEnvironment,
  linksEnvironment,
  stepUser,
  name
}: {
  actorsEnvironment: ActorsEnvironment
  linksEnvironment: LinksEnvironment
  stepUser: string
  name: string
}): Promise<void> {
  const { page } = await actorsEnvironment.createActor({
    key: stepUser,
    namespace: actorsEnvironment.generateNamespace(stepUser, stepUser)
  })

  const { url } = linksEnvironment.getLink({ name })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.open({ url })
}
