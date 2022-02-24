import { Actor } from '../../types'
import { AllFilesPage } from './allFiles'
import { SharedWithMePage } from './sharedWithMe'
import { VersionPage } from './version'
import { PublicLink } from './publicLink'

export class FilesPage {
  allFiles: AllFilesPage
  sharedWithMe: SharedWithMePage
  versions: VersionPage
  publicLink: PublicLink

  constructor({ actor }: { actor: Actor }) {
    this.allFiles = new AllFilesPage({ actor })
    this.sharedWithMe = new SharedWithMePage({ actor })
    this.versions = new VersionPage({ actor })
    this.publicLink = new PublicLink({ actor })
  }
}
