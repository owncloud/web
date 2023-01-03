import { useTask } from 'vue-concurrency'
import axios from 'axios'
import { unref, Ref } from 'vue'
import { v4 as uuidV4 } from 'uuid'

export const useLoadTasks = ({
  accessToken,
  roles,
  userAssignments
}: {
  accessToken: Ref<string>
  roles: Ref<any[]>
  userAssignments: Ref<any>
}) => {
  return {
    /**
     * Setting api calls are just temporary and will be replaced with the graph api,
     * as the backend supports it.
     */
    loadRolesTask: useTask(function* (signal) {
      const rolesResponse = yield axios.post(
        '/api/v0/settings/roles-list',
        {},
        {
          headers: {
            authorization: `Bearer ${unref(accessToken)}`,
            'X-Request-ID': uuidV4()
          }
        }
      )
      roles.value = rolesResponse.data.bundles
    }),

    /**
     * Setting api calls are just temporary and will be replaced with the graph api,
     * as the backend supports it.
     */
    loadUserRoleTask: useTask(function* (signal, ref) {
      const userAssignmentResponse = yield axios.post(
        '/api/v0/settings/assignments-list',
        {
          account_uuid: ref.user?.id
        },
        {
          headers: {
            authorization: `Bearer ${unref(accessToken)}`,
            'X-Request-ID': uuidV4()
          }
        }
      )
      const assignments = userAssignmentResponse.data?.assignments
      ref.user.role = {}
      const roleAssignment = assignments.find((assignment) => 'roleId' in assignment)

      if (roleAssignment) {
        const role = roles.value.find((role) => role.id === roleAssignment.roleId)
        if (role) {
          ref.user.role = role
        }
      }

      userAssignments.value[ref.user?.id] = userAssignmentResponse.data?.assignments
    }),

    addRoleAssignment(editUser: any) {
      return axios.post(
        '/api/v0/settings/assignments-add',
        {
          account_uuid: editUser.id,
          role_id: editUser.role.id
        },
        {
          headers: {
            authorization: `Bearer ${this.accessToken}`,
            'X-Request-ID': uuidV4()
          }
        }
      )
    }
  }
}
