import { Given } from '@cucumber/cucumber'
import { World } from '../environment'
import * as tempFs from '../../support/utils/runtimeFs'

Given(
  'the user creates a file {string} of {string} size in the temp upload directory',
  function (this: World, fileName: string, fileSize: string): Promise<void> {
    return tempFs.createFileWithSize(fileName, tempFs.getBytes(fileSize))
  }
)
