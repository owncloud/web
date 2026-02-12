import * as tempFs from '../../e2e/support/utils/runtimeFs'

export function userCreatesAFileWithSize({
  fileName,
  fileSize
}: {
  fileName: string
  fileSize: string
}) {
  return tempFs.createFileWithSize(fileName, tempFs.getBytes(fileSize))
}
