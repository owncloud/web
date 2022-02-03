import { Actor } from '../../types'
import { AllFilesPage } from './allFiles'
import { SharedWithMePage } from './sharedWithMe'
import { VersionPage } from './version'

export class FilesPage {
  allFiles: AllFilesPage
  sharedWithMe: SharedWithMePage
  versions: VersionPage

  constructor({ actor }: { actor: Actor }) {
    this.allFiles = new AllFilesPage({ actor })
    this.sharedWithMe = new SharedWithMePage({ actor })
    this.versions = new VersionPage({ actor })
  }
}
