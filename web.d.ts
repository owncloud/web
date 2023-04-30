/// <reference types="vite/client" />

import { Ability, ClientService, LoadingService } from 'web-pkg'
import { OwnCloudSdk } from 'web-client/src/types'
import { Language } from 'vue3-gettext'
import { Router, RouteRecordNormalizedLoaded } from 'vue-router'
import { Store } from 'vuex'
import { ClientService, LoadingService, PreviewService } from 'web-pkg/src/services'
import { UppyService } from 'web-runtime/src/services/uppyService'

// This file must have at least one export or import on top-level
export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    $ability: Ability
    $client: OwnCloudSdk
    $clientService: ClientService
    $gettext: Language['$gettext']
    $gettextInterpolate: Language['interpolate']
    $language: Language
    $loadingService: LoadingService
    $ngettext: Language['$ngettext']
    $previewService: PreviewService
    $route: RouteRecordNormalizedLoaded
    $router: Router
    $store: Store<any>
    $uppyService: UppyService
  }

  interface GlobalComponents {
    Portal: typeof import('portal-vue')['Portal']
    PortalTarget: typeof import('portal-vue')['PortalTarget']

    RouterLink: typeof import('vue-router')['RouterLink']
    RouterView: typeof import('vue-router')['RouterView']

    OcAvatar: typeof import('@ownclouders/design-system/src/components')['OcAvatar']
    OcAvatarCount: typeof import('@ownclouders/design-system/src/components')['OcAvatarCount']
    OcAvatarFederated: typeof import('@ownclouders/design-system/src/components')['OcAvatarFederated']
    OcAvatarGroup: typeof import('@ownclouders/design-system/src/components')['OcAvatarGroup']
    OcAvatarGuest: typeof import('@ownclouders/design-system/src/components')['OcAvatarGuest']
    OcAvatarItem: typeof import('@ownclouders/design-system/src/components')['OcAvatarItem']
    OcAvatarLink: typeof import('@ownclouders/design-system/src/components')['OcAvatarLink']
    OcAvatars: typeof import('@ownclouders/design-system/src/components')['OcAvatars']
    OcBreadcrumb: typeof import('@ownclouders/design-system/src/components')['OcBreadcrumb']
    OcButton: typeof import('@ownclouders/design-system/src/components')['OcButton']
    OcCheckbox: typeof import('@ownclouders/design-system/src/components')['OcCheckbox']
    OcContextualHelper: typeof import('@ownclouders/design-system/src/components')['OcContextualHelper']
    OcDatepicker: typeof import('@ownclouders/design-system/src/components')['OcDatepicker']
    OcDrop: typeof import('@ownclouders/design-system/src/components')['OcDrop']
    OcDropzone: typeof import('@ownclouders/design-system/src/components')['OcDropzone']
    OcFilterChip: typeof import('@ownclouders/design-system/src/components')['OcFilterChip']
    OcGrid: typeof import('@ownclouders/design-system/src/components')['OcGrid']
    OcHiddenAnnouncer: typeof import('@ownclouders/design-system/src/components')['OcHiddenAnnouncer']
    OcIcon: typeof import('@ownclouders/design-system/src/components')['OcIcon']
    OcImage: typeof import('@ownclouders/design-system/src/components')['OcImage']
    OcInfoDrop: typeof import('@ownclouders/design-system/src/components')['OcInfoDrop']
    OcList: typeof import('@ownclouders/design-system/src/components')['OcList']
    OcLoader: typeof import('@ownclouders/design-system/src/components')['OcLoader']
    OcLogo: typeof import('@ownclouders/design-system/src/components')['OcLogo']
    OcModal: typeof import('@ownclouders/design-system/src/components')['OcModal']
    OcNotificationMessage: typeof import('@ownclouders/design-system/src/components')['OcNotificationMessage']
    OcNotifications: typeof import('@ownclouders/design-system/src/components')['OcNotifications']
    OcPageSize: typeof import('@ownclouders/design-system/src/components')['OcPageSize']
    OcPagination: typeof import('@ownclouders/design-system/src/components')['OcPagination']
    OcProgress: typeof import('@ownclouders/design-system/src/components')['OcProgress']
    OcProgressPie: typeof import('@ownclouders/design-system/src/components')['OcProgressPie']
    OcRadio: typeof import('@ownclouders/design-system/src/components')['OcRadio']
    OcRecipient: typeof import('@ownclouders/design-system/src/components')['OcRecipient']
    OcResource: typeof import('@ownclouders/design-system/src/components')['OcResource']
    OcResourceIcon: typeof import('@ownclouders/design-system/src/components')['OcResourceIcon']
    OcResourceLink: typeof import('@ownclouders/design-system/src/components')['OcResourceLink']
    OcResourceName: typeof import('@ownclouders/design-system/src/components')['OcResourceName']
    OcResourceSize: typeof import('@ownclouders/design-system/src/components')['OcResourceSize']
    OcSearchBar: typeof import('@ownclouders/design-system/src/components')['OcSearchBar']
    OcSelect: typeof import('@ownclouders/design-system/src/components')['OcSelect']
    OcSpinner: typeof import('@ownclouders/design-system/src/components')['OcSpinner']
    OcStatusIndicators: typeof import('@ownclouders/design-system/src/components')['OcStatusIndicators']
    OcSwitch: typeof import('@ownclouders/design-system/src/components')['OcSwitch']
    OcTable: typeof import('@ownclouders/design-system/src/components')['OcTable']
    OcTableSimple: typeof import('@ownclouders/design-system/src/components')['OcTableSimple']
    OcTag: typeof import('@ownclouders/design-system/src/components')['OcTag']
    OcTextInput: typeof import('@ownclouders/design-system/src/components')['OcTextInput']
    OcTextarea: typeof import('@ownclouders/design-system/src/components')['OcTextarea']
    OcTile: typeof import('@ownclouders/design-system/src/components')['OcTile']
    OcGhostElement: typeof import('@ownclouders/design-system/src/components')['OcGhostElement']
    OcTableBody: typeof import('@ownclouders/design-system/src/components')['OcTableBody']
    OcTableCell: typeof import('@ownclouders/design-system/src/components')['OcTableCell']
    OcTableCellData: typeof import('@ownclouders/design-system/src/components')['OcTableCellData']
    OcTableCellHead: typeof import('@ownclouders/design-system/src/components')['OcTableCellHead']
    OcTableFooter: typeof import('@ownclouders/design-system/src/components')['OcTableFooter']
    OcTableHeader: typeof import('@ownclouders/design-system/src/components')['OcTableHeader']
    OcTableRow: typeof import('@ownclouders/design-system/src/components')['OcTableRow']
  }
}
