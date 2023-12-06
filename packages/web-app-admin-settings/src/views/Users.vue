<template>
  <div>
    <app-template
      ref="template"
      :breadcrumbs="breadcrumbs"
      :side-bar-active-panel="sideBarActivePanel"
      :side-bar-available-panels="sideBarAvailablePanels"
      :side-bar-panel-context="sideBarPanelContext"
      :is-side-bar-open="isSideBarOpen"
      :side-bar-loading="sideBarLoading"
      :show-batch-actions="!!selectedUsers.length"
      :batch-actions="batchActions"
      :batch-action-items="selectedUsers"
      :show-view-options="true"
    >
      <template #topbarActions>
        <div>
          <oc-button
            v-if="!createUsersDisabled"
            id="create-user-btn"
            class="oc-mr-s"
            variation="primary"
            appearance="filled"
            @click="onToggleCreateUserModal"
          >
            <oc-icon name="add" />
            <span v-text="$gettext('New user')" />
          </oc-button>
        </div>
      </template>
      <template #mainContent>
        <app-loading-spinner v-if="loadResourcesTask.isRunning || !loadResourcesTask.last" />
        <div v-else>
          <UsersList
            :users="users"
            :roles="roles"
            :class="{ 'users-table-squashed': isSideBarOpen }"
            :selected-users="selectedUsers"
            @toggle-select-user="toggleSelectUser"
            @select-users="selectUsers"
            @un-select-all-users="unselectAllUsers"
          >
            <template #contextMenu>
              <context-actions :items="selectedUsers" />
            </template>
            <template #filter>
              <div class="oc-flex oc-flex-middle">
                <div class="oc-mr-m oc-flex oc-flex-middle">
                  <oc-icon name="filter-2" class="oc-mr-xs" />
                  <span v-text="$gettext('Filter:')" />
                </div>
                <item-filter
                  :allow-multiple="true"
                  :filter-label="$gettext('Groups')"
                  :filterable-attributes="['displayName']"
                  :items="groups"
                  :option-filter-label="$gettext('Filter groups')"
                  :show-option-filter="true"
                  class="oc-mr-s"
                  display-name-attribute="displayName"
                  filter-name="groups"
                  @selection-change="filterGroups"
                >
                  <template #image="{ item }">
                    <avatar-image :width="32" :userid="item.id" :user-name="item.displayName" />
                  </template>
                  <template #item="{ item }">
                    <div v-text="item.displayName" />
                  </template>
                </item-filter>
                <item-filter
                  :allow-multiple="true"
                  :filter-label="$gettext('Roles')"
                  :filterable-attributes="['displayName']"
                  :items="roles"
                  :option-filter-label="$gettext('Filter roles')"
                  :show-option-filter="true"
                  display-name-attribute="displayName"
                  filter-name="roles"
                  @selection-change="filterRoles"
                >
                  <template #image="{ item }">
                    <avatar-image
                      :width="32"
                      :userid="item.id"
                      :user-name="$gettext(item.displayName)"
                    />
                  </template>
                  <template #item="{ item }">
                    <div v-text="$gettext(item.displayName)" />
                  </template>
                </item-filter>
              </div>
              <div class="oc-flex oc-flex-middle">
                <oc-text-input
                  id="users-filter"
                  v-model.trim="filterTermDisplayName"
                  :label="$gettext('Search')"
                  autocomplete="off"
                  @keypress.enter="filterDisplayName"
                />
                <oc-button
                  id="users-filter-confirm"
                  class="oc-ml-xs"
                  appearance="raw"
                  @click="filterDisplayName"
                >
                  <oc-icon name="search" fill-type="line" />
                </oc-button>
              </div>
            </template>
            <template #noResults>
              <no-content-message
                v-if="isFilteringMandatory && !isFilteringActive"
                icon="error-warning"
              >
                <template #message>
                  <span v-text="$gettext('Please specify a filter to see results')" />
                </template>
              </no-content-message>
              <no-content-message v-else icon="user">
                <template #message>
                  <span v-text="$gettext('No users in here')" />
                </template>
              </no-content-message>
            </template>
          </UsersList>
        </div>
      </template>
    </app-template>
    <groups-modal
      v-if="addToGroupsModalIsOpen"
      :title="addToGroupsModalTitle"
      :groups="writableGroups"
      :users="selectedUsers"
      @cancel="() => (addToGroupsModalIsOpen = false)"
      @confirm="addUsersToGroups"
    />
    <groups-modal
      v-if="removeFromGroupsModalIsOpen"
      :title="removeFromGroupsModalTitle"
      :groups="writableGroups"
      :users="selectedUsers"
      @cancel="() => (removeFromGroupsModalIsOpen = false)"
      @confirm="removeUsersFromGroups"
    />
    <login-modal
      v-if="editLoginModalIsOpen"
      :users="selectedUsers"
      @cancel="() => (editLoginModalIsOpen = false)"
      @confirm="editLoginForUsers"
    />
    <create-user-modal
      v-if="createUserModalOpen"
      @cancel="onToggleCreateUserModal"
      @confirm="onCreateUser"
    />
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :spaces="selectedPersonalDrives"
      :max-quota="maxQuota"
      :warning-message="quotaModalWarningMessage"
      :warning-message-contextual-helper-data="quotaWarningMessageContextualHelperData"
      resource-type="user"
    />
  </div>
</template>

<script lang="ts">
import AppTemplate from '../components/AppTemplate.vue'
import UsersList from '../components/Users/UsersList.vue'
import CreateUserModal from '../components/Users/CreateUserModal.vue'
import ContextActions from '../components/Users/ContextActions.vue'
import DetailsPanel from '../components/Users/SideBar/DetailsPanel.vue'
import EditPanel from '../components/Users/SideBar/EditPanel.vue'
import GroupsModal from '../components/Users/GroupsModal.vue'
import LoginModal from '../components/Users/LoginModal.vue'
import {
  useUserActionsDelete,
  useUserActionsRemoveFromGroups,
  useUserActionsAddToGroups,
  useUserActionsEditLogin,
  useUserActionsEditQuota
} from '../composables'
import { SpaceResource } from '@ownclouders/web-client'
import { Drive } from '@ownclouders/web-client/src/generated'
import { isPersonalSpaceResource, User, Group } from '@ownclouders/web-client/src/helpers'
import {
  AppLoadingSpinner,
  ItemFilter,
  NoContentMessage,
  QuotaModal,
  eventBus,
  queryItemAsString,
  useAccessToken,
  useCapabilityCreateUsersDisabled,
  useCapabilitySpacesMaxQuota,
  useClientService,
  useConfigurationManager,
  useLoadingService,
  useRoute,
  useRouteQuery,
  useRouter,
  useSideBar,
  useStore,
  SideBarPanel,
  SideBarPanelContext
} from '@ownclouders/web-pkg'
import {
  computed,
  defineComponent,
  ref,
  onBeforeUnmount,
  onMounted,
  toRaw,
  unref,
  watch,
  nextTick
} from 'vue'
import { useTask } from 'vue-concurrency'
import { useGettext } from 'vue3-gettext'
import { diff } from 'deep-object-diff'
import Mark from 'mark.js'
import { format } from 'util'
import { isEqual, isEmpty, omit } from 'lodash-es'

export default defineComponent({
  name: 'UsersView',
  components: {
    NoContentMessage,
    AppLoadingSpinner,
    AppTemplate,
    UsersList,
    CreateUserModal,
    ContextActions,
    ItemFilter,
    QuotaModal,
    GroupsModal,
    LoginModal
  },
  setup() {
    const { $gettext, $ngettext } = useGettext()
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const accessToken = useAccessToken({ store })
    const clientService = useClientService()
    const loadingService = useLoadingService()
    const configurationManager = useConfigurationManager()
    const createUsersDisabled = useCapabilityCreateUsersDisabled()

    const currentPageQuery = useRouteQuery('page', '1')
    const currentPage = computed(() => {
      return parseInt(queryItemAsString(unref(currentPageQuery)))
    })

    const itemsPerPageQuery = useRouteQuery('admin-settings-items-per-page', '1')
    const itemsPerPage = computed(() => {
      return parseInt(queryItemAsString(unref(itemsPerPageQuery)))
    })

    const { actions: deleteActions } = useUserActionsDelete({ store })
    const { actions: removeFromGroupsActions } = useUserActionsRemoveFromGroups()
    const { actions: addToGroupsActions } = useUserActionsAddToGroups()
    const { actions: editLoginActions } = useUserActionsEditLogin()
    const {
      actions: editQuotaActions,
      modalOpen: quotaModalIsOpen,
      closeModal: closeQuotaModal
    } = useUserActionsEditQuota()

    const users = ref([])
    const groups = ref([])
    const roles = ref([])
    const selectedUsers = ref<User[]>([])
    const additionalUserDataLoadedForUserIds = ref([])
    const applicationId = ref()
    const selectedUserIds = computed(() =>
      unref(selectedUsers).map((selectedUser) => selectedUser.id)
    )
    const isFilteringMandatory = ref(configurationManager.options.userListRequiresFilter)
    const sideBarLoading = ref(false)
    const createUserModalOpen = ref(false)
    const addToGroupsModalIsOpen = ref(false)
    const removeFromGroupsModalIsOpen = ref(false)
    const editLoginModalIsOpen = ref(false)
    const template = ref()
    const displayNameQuery = useRouteQuery('q_displayName')
    const filterTermDisplayName = ref(queryItemAsString(unref(displayNameQuery)))
    const markInstance = ref(null)
    let loadResourcesEventToken
    let addToGroupsActionEventToken
    let removeFromGroupsActionEventToken
    let editLoginActionEventToken
    let editQuotaActionEventToken
    const addToGroupsModalTitle = computed(() => {
      return $ngettext(
        'Add user "%{user}" to groups',
        'Add %{userCount} users to groups ',
        unref(selectedUsers).length,
        {
          user: unref(selectedUsers)[0].displayName,
          userCount: unref(selectedUsers).length.toString()
        }
      )
    })
    const removeFromGroupsModalTitle = computed(() => {
      return $ngettext(
        'Remove user "%{user}" from groups',
        'Remove %{userCount} users from groups ',
        unref(selectedUsers).length,
        {
          user: unref(selectedUsers)[0].displayName,
          userCount: unref(selectedUsers).length.toString()
        }
      )
    })

    const loadGroupsTask = useTask(function* (signal) {
      const groupsResponse = yield clientService.graphAuthenticated.groups.listGroups('displayName')
      groups.value = groupsResponse.data.value
    })

    const loadAppRolesTask = useTask(function* (signal) {
      const applicationsResponse =
        yield clientService.graphAuthenticated.applications.listApplications()
      roles.value = applicationsResponse.data.value[0].appRoles
      applicationId.value = applicationsResponse.data.value[0].id
    })

    const loadUsersTask = useTask(function* (signal) {
      if (unref(isFilteringMandatory) && !unref(isFilteringActive)) {
        return (users.value = [])
      }

      const filter = Object.values(filters)
        .reduce((acc, f: any) => {
          if ('value' in f) {
            if (unref(f.value)) {
              acc.push(format(f.query, unref(f.value)))
            }
            return acc
          }

          const str = unref(f.ids)
            .map((id) => format(f.query, id))
            .join(' or ')
          if (str) {
            acc.push(`(${str})`)
          }
          return acc
        }, [])
        .filter(Boolean)
        .join(' and ')

      const usersResponse = yield clientService.graphAuthenticated.users.listUsers(
        'displayName',
        filter
      )
      users.value = usersResponse.data.value || []
    })

    const loadResourcesTask = useTask(function* (signal) {
      yield loadUsersTask.perform()
      yield loadGroupsTask.perform()
      yield loadAppRolesTask.perform()
    })

    /**
     * This function reloads the user with expanded attributes,
     * this is necessary as we don't load all the data while listing the users
     * for performance reasons
     */
    const loadAdditionalUserDataTask = useTask(function* (signal, user, forceReload = false) {
      /**
       * Prevent load additional user data multiple times if not needed
       */
      if (!forceReload && unref(additionalUserDataLoadedForUserIds).includes(user.id)) {
        return
      }

      const { data } = yield clientService.graphAuthenticated.users.getUser(user.id)
      unref(additionalUserDataLoadedForUserIds).push(user.id)

      Object.assign(user, data)
    })

    const currentUser = computed(() => {
      return store.state.user
    })

    const resetPagination = () => {
      return router.push({ ...unref(route), query: { ...unref(route).query, page: '1' } })
    }

    const filters = {
      groups: {
        param: useRouteQuery('q_groups'),
        query: `memberOf/any(m:m/id eq '%s')`,
        ids: ref([])
      },
      roles: {
        param: useRouteQuery('q_roles'),
        query: `appRoleAssignments/any(m:m/appRoleId eq '%s')`,
        ids: ref([])
      },
      displayName: {
        param: useRouteQuery('q_displayName'),
        query: `contains(displayName,'%s')`,
        value: ref('')
      }
    }

    const isFilteringActive = computed(() => {
      return (
        unref(filters.groups.ids)?.length ||
        unref(filters.roles.ids)?.length ||
        unref(filters.displayName.value)?.length
      )
    })
    const filterGroups = (groups) => {
      filters.groups.ids.value = groups.map((g) => g.id)
      loadUsersTask.perform()
      selectedUsers.value = []
      additionalUserDataLoadedForUserIds.value = []
      return resetPagination()
    }
    const filterRoles = (roles) => {
      filters.roles.ids.value = roles.map((r) => r.id)
      loadUsersTask.perform()
      selectedUsers.value = []
      additionalUserDataLoadedForUserIds.value = []
      return resetPagination()
    }
    const filterDisplayName = async () => {
      await router.push({
        ...unref(route),
        query: {
          ...omit(unref(route).query, 'q_displayName'),
          ...(unref(filterTermDisplayName) && { q_displayName: unref(filterTermDisplayName) })
        }
      })
      filters.displayName.value.value = unref(filterTermDisplayName)
      loadUsersTask.perform()
      selectedUsers.value = []
      additionalUserDataLoadedForUserIds.value = []
      return resetPagination()
    }

    const selectedPersonalDrives = ref([])
    watch(selectedUserIds, async () => {
      sideBarLoading.value = true
      // Load additional user data
      const requests = unref(selectedUsers).map((user) => loadAdditionalUserDataTask.perform(user))
      const results = await loadingService.addTask(() => {
        return Promise.allSettled<Array<unknown>>(requests)
      })
      const failedRequests = results.filter((result) => result.status === 'rejected')
      if (failedRequests.length > 0) {
        console.debug('Failed to load additional user data', failedRequests)
      }

      selectedPersonalDrives.value.splice(0, unref(selectedPersonalDrives).length)
      unref(selectedUsers).forEach((user) => {
        const drive = toRaw(user.drive)
        if (drive === undefined || drive.id === undefined) {
          return
        }
        const spaceResource = {
          id: drive.id,
          name: user.displayName,
          spaceQuota: drive.quota
        } as SpaceResource
        selectedPersonalDrives.value.push(spaceResource)
      })

      sideBarLoading.value = false
    })

    const batchActions = computed(() => {
      return [
        ...unref(deleteActions),
        ...unref(editQuotaActions),
        ...unref(addToGroupsActions),
        ...unref(removeFromGroupsActions),
        ...unref(editLoginActions)
      ].filter((item) => item.isEnabled({ resources: unref(selectedUsers) }))
    })

    const updateSpaceQuota = ({ spaceId, quota }) => {
      const userIndex = unref(users).findIndex((u) => u.drive?.id === spaceId)
      if (userIndex) {
        unref(users)[userIndex].drive.quota = quota
      }

      const selectedIndex = unref(selectedUsers).findIndex((u) => u.drive?.id === spaceId)
      if (selectedIndex) {
        unref(selectedUsers)[selectedIndex].drive.quota = quota
      }
    }

    const usersWithoutDrive = computed(() => {
      return unref(selectedUsers).filter(
        ({ drive }) => !isPersonalSpaceResource(drive as SpaceResource)
      )
    })

    const quotaModalWarningMessage = computed(() => {
      return usersWithoutDrive.value.length
        ? $gettext('Quota will only be applied to users who logged in at least once.')
        : ''
    })

    const quotaWarningMessageContextualHelperData = computed(() => {
      return usersWithoutDrive.value.length
        ? {
            title: $gettext('Unaffected users'),
            text: [...usersWithoutDrive.value]
              .sort((u1, u2) => u1.displayName.localeCompare(u2.displayName))
              .map((user) => user.displayName)
              .join(', ')
          }
        : {}
    })

    onMounted(async () => {
      for (const f in filters) {
        if (unref(filters[f]).hasOwnProperty('ids')) {
          filters[f].ids.value = queryItemAsString(unref(filters[f].param))?.split('+') || []
        }
        if (unref(filters[f]).hasOwnProperty('value')) {
          filters[f].value.value = queryItemAsString(unref(filters[f].param))
        }
      }

      await loadResourcesTask.perform()
      loadResourcesEventToken = eventBus.subscribe('app.admin-settings.list.load', async () => {
        await loadResourcesTask.perform()
        selectedUsers.value = []

        const pageCount = Math.ceil(unref(users).length / unref(itemsPerPage))
        if (unref(currentPage) > 1 && unref(currentPage) > pageCount) {
          // reset pagination to avoid empty lists (happens when deleting all items on the last page)
          currentPageQuery.value = pageCount.toString()
        }
      })

      watch(
        [users, displayNameQuery],
        async () => {
          await nextTick()
          markInstance.value = new Mark('.mark-element')
          unref(markInstance)?.unmark()
          unref(markInstance)?.mark(queryItemAsString(unref(displayNameQuery)) || '', {
            element: 'span',
            className: 'mark-highlight'
          })
        },
        {
          immediate: true
        }
      )

      addToGroupsActionEventToken = eventBus.subscribe(
        'app.admin-settings.users.actions.add-to-groups',
        () => {
          addToGroupsModalIsOpen.value = true
        }
      )
      removeFromGroupsActionEventToken = eventBus.subscribe(
        'app.admin-settings.users.actions.remove-from-groups',
        () => {
          removeFromGroupsModalIsOpen.value = true
        }
      )
      editLoginActionEventToken = eventBus.subscribe(
        'app.admin-settings.users.actions.edit-login',
        () => {
          editLoginModalIsOpen.value = true
        }
      )
      editQuotaActionEventToken = eventBus.subscribe(
        'app.admin-settings.users.user.quota.updated',
        updateSpaceQuota
      )
    })

    onBeforeUnmount(() => {
      eventBus.unsubscribe('app.admin-settings.list.load', loadResourcesEventToken)
      eventBus.unsubscribe(
        'app.admin-settings.users.actions.add-to-groups',
        addToGroupsActionEventToken
      )
      eventBus.unsubscribe(
        'app.admin-settings.users.actions.remove-from-groups',
        removeFromGroupsActionEventToken
      )
      eventBus.unsubscribe('app.admin-settings.users.actions.edit-login', editLoginActionEventToken)
      eventBus.unsubscribe('app.admin-settings.users.user.quota.updated', editQuotaActionEventToken)
    })

    const updateLocalUsers = (usersToUpdate: User[]) => {
      for (const _user of usersToUpdate) {
        const userIndex = unref(users).findIndex((user) => user.id === _user.id)
        unref(users)[userIndex] = _user
        const selectedUserIndex = unref(selectedUsers).findIndex((user) => user.id === _user.id)
        if (selectedUserIndex >= 0) {
          // FIXME: why do we need to update selectedUsers?
          unref(selectedUsers)[selectedUserIndex] = _user
        }
      }
    }

    const addUsersToGroups = async ({ users: affectedUsers, groups: groupsToAdd }) => {
      const client = clientService.graphAuthenticated
      const usersToFetch = []
      const promises = groupsToAdd.reduce((acc, group) => {
        for (const user of affectedUsers) {
          if (!user.memberOf.find((userGroup) => userGroup.id === group.id)) {
            acc.push(client.groups.addMember(group.id, user.id, configurationManager.serverUrl))
            if (!usersToFetch.includes(user.id)) {
              usersToFetch.push(user.id)
            }
          }
        }
        return acc
      }, [])
      if (!promises.length) {
        const title = $ngettext(
          'Group assignment already added',
          'Group assignments already added',
          affectedUsers.length * groupsToAdd.length
        )
        store.dispatch('showMessage', { title })
        addToGroupsModalIsOpen.value = false
        return
      }

      const results = await loadingService.addTask(() => {
        return Promise.allSettled(promises)
      })

      const succeeded = results.filter((r) => r.status === 'fulfilled')
      if (succeeded.length) {
        const title =
          succeeded.length === 1 && groupsToAdd.length === 1 && affectedUsers.length === 1
            ? $gettext('Group assignment "%{group}" was added successfully', {
                group: groupsToAdd[0].displayName
              })
            : $ngettext(
                '%{groupAssignmentCount} group assignment was added successfully',
                '%{groupAssignmentCount} group assignments were added successfully',
                succeeded.length,
                { groupAssignmentCount: succeeded.length.toString() },
                true
              )
        store.dispatch('showMessage', { title })
      }

      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length) {
        failed.forEach(console.error)

        const title =
          failed.length === 1 && groupsToAdd.length === 1 && affectedUsers.length === 1
            ? $gettext('Failed to add group assignment "%{group}"', {
                group: groupsToAdd[0].displayName
              })
            : $ngettext(
                'Failed to add %{groupAssignmentCount} group assignment',
                'Failed to add %{groupAssignmentCount} group assignments',
                failed.length,
                { groupAssignmentCount: failed.length.toString() },
                true
              )
        store.dispatch('showErrorMessage', {
          title,
          errors: (failed as PromiseRejectedResult[]).map((f) => f.reason)
        })
      }

      addToGroupsModalIsOpen.value = false

      try {
        const usersResponse = await Promise.all(
          usersToFetch.map((userId) => client.users.getUser(userId))
        )
        updateLocalUsers(usersResponse.map((r) => r.data))
      } catch (e) {
        console.error(e)
      }
    }

    const removeUsersFromGroups = async ({ users: affectedUsers, groups: groupsToRemove }) => {
      const client = clientService.graphAuthenticated
      const usersToFetch = []
      const promises = groupsToRemove.reduce((acc, group) => {
        for (const user of affectedUsers) {
          if (user.memberOf.find((userGroup) => userGroup.id === group.id)) {
            acc.push(client.groups.deleteMember(group.id, user.id))
            if (!usersToFetch.includes(user.id)) {
              usersToFetch.push(user.id)
            }
          }
        }
        return acc
      }, [])

      if (!promises.length) {
        const title = $ngettext(
          'Group assignment already removed',
          'Group assignments already removed',
          affectedUsers.length * groupsToRemove.length
        )
        store.dispatch('showMessage', { title })
        removeFromGroupsModalIsOpen.value = false
        return
      }

      const results = await loadingService.addTask(() => {
        return Promise.allSettled(promises)
      })

      const succeeded = results.filter((r) => r.status === 'fulfilled')
      if (succeeded.length) {
        const title =
          succeeded.length === 1 && groupsToRemove.length === 1 && affectedUsers.length === 1
            ? $gettext('Group assignment "%{group}" was deleted successfully', {
                group: groupsToRemove[0].displayName
              })
            : $ngettext(
                '%{groupAssignmentCount} group assignment was deleted successfully',
                '%{groupAssignmentCount} group assignments were deleted successfully',
                succeeded.length,
                { groupAssignmentCount: succeeded.length.toString() },
                true
              )
        store.dispatch('showMessage', { title })
      }

      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length) {
        failed.forEach(console.error)

        const title =
          failed.length === 1 && groupsToRemove.length === 1 && affectedUsers.length === 1
            ? $gettext('Failed to delete group assignment "%{group}"', {
                group: groupsToRemove[0].displayName
              })
            : $ngettext(
                'Failed to delete %{groupAssignmentCount} group assignment',
                'Failed to delete %{groupAssignmentCount} group assignments',
                failed.length,
                { groupAssignmentCount: failed.length.toString() },
                true
              )
        store.dispatch('showErrorMessage', {
          title,
          errors: (failed as PromiseRejectedResult[]).map((f) => f.reason)
        })
      }

      removeFromGroupsModalIsOpen.value = false

      try {
        const usersResponse = await Promise.all(
          usersToFetch.map((userId) => client.users.getUser(userId))
        )
        updateLocalUsers(usersResponse.map((r) => r.data))
      } catch (e) {
        console.error(e)
      }
    }

    const editLoginForUsers = async ({
      users: affectedUsers,
      value
    }: {
      users: User[]
      value: boolean
    }) => {
      affectedUsers = affectedUsers.filter(({ id }) => store.getters.user.uuid !== id)
      const client = clientService.graphAuthenticated
      const promises = affectedUsers.map((u) =>
        client.users.editUser(u.id, { accountEnabled: value })
      )
      const results = await loadingService.addTask(() => {
        return Promise.allSettled(promises)
      })

      const succeeded = results.filter((r) => r.status === 'fulfilled') as any
      if (succeeded.length) {
        const title =
          succeeded.length === 1 && affectedUsers.length === 1
            ? $gettext('Login for user "%{user}" was edited successfully', {
                user: affectedUsers[0].displayName
              })
            : $ngettext(
                '%{userCount} user login was edited successfully',
                '%{userCount} users logins edited successfully',
                succeeded.length,
                { userCount: succeeded.length.toString() },
                true
              )
        store.dispatch('showMessage', { title })
      }

      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length) {
        failed.forEach(console.error)

        const title =
          failed.length === 1 && affectedUsers.length === 1
            ? $gettext('Failed edit login for user "%{user}"', {
                user: affectedUsers[0].displayName
              })
            : $ngettext(
                'Failed to edit %{userCount} user login',
                'Failed to edit %{userCount} user logins',
                failed.length,
                { userCount: failed.length.toString() },
                true
              )
        store.dispatch('showErrorMessage', {
          title,
          errors: (failed as PromiseRejectedResult[]).map((f) => f.reason)
        })
      }

      editLoginModalIsOpen.value = false

      try {
        const usersResponse = await loadingService.addTask(async () => {
          return Promise.all(succeeded.map(({ value }) => client.users.getUser(value.data.id)))
        })
        updateLocalUsers(usersResponse.map((r) => r.data))
      } catch (e) {
        console.error(e)
      }
    }

    const writableGroups = computed<Group[]>(() => {
      return unref(groups).filter((g) => !g.groupTypes?.includes('ReadOnly'))
    })

    const onToggleCreateUserModal = () => {
      createUserModalOpen.value = !unref(createUserModalOpen)
    }
    const onCreateUser = async (user) => {
      try {
        const client = clientService.graphAuthenticated
        const { id: createdUserId } = (await client.users.createUser(user))?.data
        const { data: createdUser } = await client.users.getUser(createdUserId)
        users.value.push(createdUser)

        onToggleCreateUserModal()
        store.dispatch('showMessage', {
          title: $gettext('User was created successfully')
        })
      } catch (error) {
        console.error(error)
        store.dispatch('showErrorMessage', {
          title: $gettext('Failed to create user'),
          error
        })
      }
    }
    const onEditUser = async ({ user, editUser }) => {
      try {
        const client = clientService.graphAuthenticated
        const graphEditUserPayloadExtractor = (user) => {
          return omit(user, ['drive', 'appRoleAssignments', 'memberOf'])
        }
        const graphEditUserPayload = diff(
          graphEditUserPayloadExtractor(user),
          graphEditUserPayloadExtractor(editUser)
        )

        if (!isEmpty(graphEditUserPayload)) {
          await client.users.editUser(editUser.id, graphEditUserPayload)
        }

        if (!isEqual(user.drive?.quota?.total, editUser.drive?.quota?.total)) {
          await onUpdateUserDrive(editUser)
        }

        if (!isEqual(user.memberOf, editUser.memberOf)) {
          await onUpdateUserGroupAssignments(user, editUser)
        }

        if (
          !isEqual(user.appRoleAssignments[0]?.appRoleId, editUser.appRoleAssignments[0]?.appRoleId)
        ) {
          await onUpdateUserAppRoleAssignments(user, editUser)
        }

        const { data: updatedUser } = await client.users.getUser(user.id)
        const userIndex = unref(users).findIndex((user) => user.id === updatedUser.id)
        users.value[userIndex] = updatedUser
        const selectedUserIndex = unref(selectedUsers).findIndex(
          (user) => user.id === updatedUser.id
        )
        if (selectedUserIndex >= 0) {
          // FIXME: why do we need to update selectedUsers?
          selectedUsers.value[selectedUserIndex] = updatedUser
        }

        eventBus.publish('sidebar.entity.saved')

        return updatedUser
      } catch (error) {
        console.error(error)
        store.dispatch('showErrorMessage', {
          title: $gettext('Failed to edit user'),
          error
        })
      }
    }

    const onUpdateUserDrive = async (editUser: User) => {
      const client = clientService.graphAuthenticated
      const updateDriveResponse = await client.drives.updateDrive(
        editUser.drive.id,
        { quota: { total: editUser.drive.quota.total } } as Drive,
        {}
      )

      if (editUser.id === unref(currentUser).uuid) {
        // Load current user quota
        store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
          id: editUser.drive.id,
          field: 'spaceQuota',
          value: updateDriveResponse.data.quota
        })
      }
    }
    const onUpdateUserAppRoleAssignments = (user: User, editUser: User) => {
      const client = clientService.graphAuthenticated
      return client.users.createUserAppRoleAssignment(user.id, {
        appRoleId: editUser.appRoleAssignments[0].appRoleId,
        resourceId: unref(applicationId),
        principalId: editUser.id
      })
    }
    const onUpdateUserGroupAssignments = (user: User, editUser: User) => {
      const client = clientService.graphAuthenticated
      const groupsToAdd = editUser.memberOf.filter(
        (editUserGroup) => !user.memberOf.some((g) => g.id === editUserGroup.id)
      )
      const groupsToDelete = user.memberOf.filter(
        (editUserGroup) => !editUser.memberOf.some((g) => g.id === editUserGroup.id)
      )
      const requests = []

      for (const groupToAdd of groupsToAdd) {
        requests.push(
          client.groups.addMember(groupToAdd.id, user.id, configurationManager.serverUrl)
        )
      }
      for (const groupToDelete of groupsToDelete) {
        requests.push(client.groups.deleteMember(groupToDelete.id, user.id))
      }

      return Promise.all(requests)
    }

    const sideBarPanelContext = computed<SideBarPanelContext<unknown, unknown, User>>(() => {
      return {
        parent: null,
        items: unref(selectedUsers)
      }
    })
    const sideBarAvailablePanels = [
      {
        name: 'DetailsPanel',
        icon: 'user',
        title: () => $gettext('User details'),
        component: DetailsPanel,
        componentAttrs: ({ items }) => ({
          user: items.length === 1 ? items[0] : null,
          users: items,
          roles: unref(roles)
        }),
        isRoot: () => true,
        isVisible: () => true
      },
      {
        name: 'EditPanel',
        icon: 'pencil',
        title: () => $gettext('Edit user'),
        component: EditPanel,
        isVisible: ({ items }) => items.length === 1,
        componentAttrs: ({ items }) => ({
          user: items.length === 1 ? items[0] : null,
          roles: unref(roles),
          groups: unref(groups),
          onConfirm: onEditUser
        })
      }
    ] satisfies SideBarPanel<unknown, unknown, User>[]

    return {
      ...useSideBar(),
      maxQuota: useCapabilitySpacesMaxQuota(),
      template,
      selectedUsers,
      sideBarLoading,
      users,
      roles,
      groups,
      applicationId,
      loadResourcesTask,
      loadAdditionalUserDataTask,
      clientService,
      accessToken,
      createUserModalOpen,
      addToGroupsModalTitle,
      addToGroupsModalIsOpen,
      removeFromGroupsModalTitle,
      removeFromGroupsModalIsOpen,
      editLoginModalIsOpen,
      editLoginForUsers,
      batchActions,
      filterGroups,
      filterRoles,
      filterDisplayName,
      filterTermDisplayName,
      quotaModalIsOpen,
      quotaModalWarningMessage,
      quotaWarningMessageContextualHelperData,
      closeQuotaModal,
      selectedPersonalDrives,
      addUsersToGroups,
      removeUsersFromGroups,
      writableGroups,
      isFilteringActive,
      isFilteringMandatory,
      createUsersDisabled,
      sideBarPanelContext,
      sideBarAvailablePanels,
      onToggleCreateUserModal,
      onCreateUser
    }
  },
  computed: {
    breadcrumbs() {
      return [
        { text: this.$gettext('Administration Settings'), to: { path: '/admin-settings' } },
        {
          text: this.$gettext('Users'),
          onClick: () => eventBus.publish('app.admin-settings.list.load')
        }
      ]
    }
  },
  methods: {
    selectUsers(users) {
      this.selectedUsers.splice(0, this.selectedUsers.length, ...users)
    },
    toggleSelectUser(toggledUser, deselect = false) {
      if (deselect) {
        this.selectedUsers.splice(0, this.selectedUsers.length)
      }
      const isUserSelected = this.selectedUsers.find((user) => user.id === toggledUser.id)

      if (!isUserSelected) {
        return this.selectedUsers.push(this.users.find((u) => u.id === toggledUser.id))
      }

      const index = this.selectedUsers.findIndex((user) => user.id === toggledUser.id)
      this.selectedUsers.splice(index, 1)
    },
    unselectAllUsers() {
      this.selectedUsers.splice(0, this.selectedUsers.length)
    }
  }
})
</script>
<style lang="scss" scoped>
#users-filter {
  width: 16rem;

  &-confirm {
    margin-top: calc(0.2rem + var(--oc-font-size-default));
  }
}
</style>
