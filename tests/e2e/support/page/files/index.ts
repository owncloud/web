import { Actor } from '../../types'
import { AllFilesPage } from './allFiles'
import { SharedWithMePage } from './sharedWithMe'

export class FilesPage {
  allFiles: AllFilesPage
  sharedWithMe: SharedWithMePage

  constructor({ actor }: { actor: Actor }) {
    this.allFiles = new AllFilesPage({ actor })
    this.sharedWithMe = new SharedWithMePage({ actor })
  }
}
