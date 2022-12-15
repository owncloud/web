import { $gettext } from 'web-app-files/src/router/utils'
import { ViewMode } from 'web-pkg/src/ui/types'

export abstract class ViewModeConstants {
  static readonly default: ViewMode = {
    name: 'resource-table',
    label: $gettext('Switch to default table view'),
    icon: {
      name: 'menu-line',
      fillType: 'none'
    }
  }
  static readonly condensedTable: ViewMode = {
    name: 'resource-table-condensed',
    label: $gettext('Switch to condensed table view'),
    icon: {
      name: 'menu-line-condensed',
      fillType: 'none'
    }
  }
  static readonly queryName: string = 'view-mode'
}
