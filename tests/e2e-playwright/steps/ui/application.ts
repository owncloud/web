import { ActorsEnvironment } from '../../../e2e/support/environment/index.js'
import { objects } from '../../../e2e/support'

export async function openApplication({
  actorsEnvironment,
  stepUser,
  name
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  name: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const applicationObject = new objects.runtime.Application({ page })
  await applicationObject.open({ name })
}
