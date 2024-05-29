import { defineAsyncComponent } from 'vue'

export * from './AppBar'
export * from './AppTemplates'
export * from './ContextActions'
export * from './FilesList'
export * from './Filters'
export * from './Modals'
export * from './SideBar'
export * from './Search'
export * from './Spaces'

export { default as AppLoadingSpinner } from './AppLoadingSpinner.vue'
export { default as AppTopBar } from './AppTopBar.vue'
export { default as BatchActions } from './BatchActions.vue'
export { default as CustomComponentTarget } from './CustomComponentTarget.vue'
export { default as ItemFilter } from './ItemFilter.vue'
export { default as ItemFilterToggle } from './ItemFilterToggle.vue'
export { default as LinkRoleDropdown } from './LinkRoleDropdown.vue'
export { default as LoadingIndicator } from './LoadingIndicator.vue'
export { default as NoContentMessage } from './NoContentMessage.vue'
export { default as Pagination } from './Pagination.vue'
export { default as QuotaSelect } from './QuotaSelect.vue'
export { default as SpaceQuota } from './SpaceQuota.vue'
export { default as SearchBarFilter } from './SearchBarFilter.vue'
export { default as ViewOptions } from './ViewOptions.vue'
export { default as PortalTarget } from './PortalTarget.vue'
export { default as CreateShortcutModal } from './CreateShortcutModal.vue'
export { default as CreateLinkModal } from './CreateLinkModal.vue'

// async component to avoid loading the huge toastjs package on page load
export const TextEditor = defineAsyncComponent(
  async () => (await import('./TextEditor.vue')).default
)
