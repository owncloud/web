import PQueue from 'p-queue'
import { basename, join } from 'path'

export const move = async (resourcesToMove, target, client) => {
    console.log("move")
    const errors = []
    const movePromises = []
    const moveQueue = new PQueue({ concurrency: 4 })
    const itemsInTarget = await client.files.list(target.webDavPath, 1)

    resourcesToMove.forEach((resource: any) => {
        movePromises.push(
            moveQueue.add(async () => {
            const exists = itemsInTarget.some((e) => basename(e.name) === resource.name)
            if (exists) {
                const message = `Resource with name ${resource.name} already exists`
                errors.push({
                    resourceName: resource.name,
                    message: message
                })
                return
            }

            try {
                await client.files.move(
                    resource.webDavPath,
                    join(target.webDavPath, resource.name)
                )
                /*this.REMOVE_FILE(resource)
                this.REMOVE_FILE_FROM_SEARCHED(resource)
                this.REMOVE_FILE_SELECTION(resource)*/
            } catch (error) {
                console.error(error)
                error.resourceName = resource.name
                errors.push(error)
            }
        }))
        console.log(errors)
    })
    await Promise.all(movePromises)
}