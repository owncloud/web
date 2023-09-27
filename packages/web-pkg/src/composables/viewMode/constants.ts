import { ViewMode } from '@ownclouders/web-pkg/src/ui/types'

function $gettext(msg: string): string {
  return msg
}

export abstract class ViewModeConstants {
  static readonly defaultModeName: string = 'resource-table'
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
  static readonly tilesView: ViewMode = {
    name: 'resource-tiles',
    label: $gettext('Switch to tiles view'),
    icon: {
      name: 'apps-2',
      fillType: 'line'
    }
  }
  static readonly queryName: string = 'view-mode'
  static readonly tilesSizeDefault: number = 1
  static readonly tilesSizeQueryName: string = 'tiles-size'
}
