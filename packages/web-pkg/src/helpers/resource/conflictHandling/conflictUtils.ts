import { extractNameWithoutExtension, Resource } from 'web-client/src/helpers'

export const resolveFileNameDuplicate = (name, extension, existingFiles, iteration = 1) => {
  let potentialName
  if (extension.length === 0) {
    potentialName = `${name} (${iteration})`
  } else {
    const nameWithoutExtension = extractNameWithoutExtension({ name, extension } as Resource)
    potentialName = `${nameWithoutExtension} (${iteration}).${extension}`
  }
  const hasConflict = existingFiles.some((f) => f.name === potentialName)
  if (!hasConflict) {
    return potentialName
  }
  return resolveFileNameDuplicate(name, extension, existingFiles, iteration + 1)
}
