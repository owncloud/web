<template>
  <div id="oc-notifications">
    <notification-bell :notification-count="notifications.length" />
    <oc-drop
      id="oc-notifications-drop"
      drop-id="notifications-dropdown"
      toggle="#oc-notifications-bell"
      mode="click"
      :options="{ pos: 'bottom-right', delayHide: 0 }"
      class="oc-overflow-auto"
      @hide-drop="hideDrop"
      @show-drop="showDrop"
    >
      <div class="oc-flex oc-flex-between oc-flex-middle oc-mb-s">
        <span class="oc-text-bold oc-text-large oc-m-rm" v-text="$gettext('Notifications')" />
        <oc-button
          v-if="notifications.length"
          class="oc-notifications-mark-all"
          appearance="raw"
          @click="deleteNotifications(notifications.map((n) => n.notification_id))"
          ><span v-text="$gettext('Mark all as read')"
        /></oc-button>
      </div>
      <hr />
      <div class="oc-position-relative">
        <div v-if="loading" class="oc-notifications-loading">
          <div class="oc-notifications-loading-background oc-width-1-1 oc-height-1-1" />
          <oc-spinner class="oc-notifications-loading-spinner" size="large" />
        </div>
        <span
          v-if="!notifications.length"
          class="oc-notifications-no-new"
          v-text="$gettext('Nothing new')"
        />
        <oc-list v-else>
          <li v-for="(el, index) in notifications" :key="index" class="oc-notifications-item">
            <component
              :is="el.computedLink ? 'router-link' : 'div'"
              class="oc-flex oc-flex-middle oc-my-xs"
              :to="el.computedLink"
            >
              <avatar-image
                class="oc-mr-m"
                :width="32"
                :userid="el.messageRichParameters?.user?.name || el.user"
                :user-name="el.messageRichParameters?.user?.displayname || el.user"
              />
              <div>
                <div v-if="!el.message && !el.messageRich" class="oc-notifications-subject">
                  <span v-text="el.subject" />
                </div>
                <div v-if="el.computedMessage" class="oc-notifications-message">
                  <span v-bind="{ innerHTML: el.computedMessage }" />
                </div>
                <div
                  v-if="el.link && el.object_type !== 'local_share'"
                  class="oc-notifications-link"
                >
                  <a :href="el.link" target="_blank" v-text="el.link" />
                </div>
                <div v-if="el.actions?.length" class="oc-notifications-actions oc-my-s">
                  <oc-button
                    v-for="(action, actionIndex) in el.actions"
                    :key="index + '-' + actionIndex"
                    size="small"
                    :variation="action.primary ? 'primary' : 'passive'"
                    @click.prevent="
                      executeAction(el.app, action.link, action.type, el.notification_id)
                    "
                    >{{ action.label }}
                  </oc-button>
                </div>
                <div v-if="el.datetime" class="oc-text-small oc-text-muted oc-mt-xs">
                  <span
                    v-oc-tooltip="formatDate(el.datetime)"
                    tabindex="0"
                    v-text="formatDateRelative(el.datetime)"
                  />
                </div>
              </div>
            </component>
            <hr v-if="index + 1 !== notifications.length" class="oc-my-m" />
          </li>
        </oc-list>
      </div>
    </oc-drop>
  </div>
</template>
<script lang="ts">
import { onMounted, onUnmounted, ref, unref } from 'vue'
import isEmpty from 'lodash-es/isEmpty'
import { eventBus, useCapabilityCoreSSE } from '@ownclouders/web-pkg'
import { ShareStatus } from '@ownclouders/web-client/src/helpers/share'
import NotificationBell from './NotificationBell.vue'
import { Notification } from '../../helpers/notifications'
import {
  formatDateFromISO,
  formatRelativeDateFromISO,
  useClientService,
  useRoute,
  useStore
} from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { useTask } from 'vue-concurrency'
import { createFileRouteOptions } from '@ownclouders/web-pkg'
import { MESSAGE_TYPE } from '@ownclouders/web-client/src/sse'
import { buildSpace } from '@ownclouders/web-client/src/helpers'

const POLLING_INTERVAL = 30000

export default {
  components: {
    NotificationBell
  },
  setup() {
    const store = useStore()
    const clientService = useClientService()
    const { current: currentLanguage } = useGettext()
    const route = useRoute()

    const notifications = ref<Notification[]>([])
    const loading = ref(false)
    const notificationsInterval = ref()
    const dropdownOpened = ref(false)
    const sseEnabled = useCapabilityCoreSSE()

    const formatDate = (date) => {
      return formatDateFromISO(date, currentLanguage)
    }
    const formatDateRelative = (date) => {
      return formatRelativeDateFromISO(date, currentLanguage)
    }

    const messageParameters = [
      { name: 'user', labelAttribute: 'displayname' },
      { name: 'resource', labelAttribute: 'name' },
      { name: 'space', labelAttribute: 'name' },
      { name: 'virus', labelAttribute: 'name' }
    ]
    const getMessage = ({ message, messageRich, messageRichParameters }: Notification) => {
      if (messageRich && !isEmpty(messageRichParameters)) {
        let interpolatedMessage = messageRich
        for (const param of messageParameters) {
          if (interpolatedMessage.includes(`{${param.name}}`)) {
            const richParam = messageRichParameters[param.name] ?? undefined
            if (!richParam) {
              return message
            }
            const label = richParam[param.labelAttribute] ?? undefined
            if (!label) {
              return message
            }
            interpolatedMessage = interpolatedMessage.replace(
              `{${param.name}}`,
              `<strong>${label}</strong>`
            )
          }
        }
        return interpolatedMessage
      }
      return message
    }
    const getLink = async ({ messageRichParameters, object_type, subject }: Notification) => {
      if (!messageRichParameters) {
        return null
      }
      if (object_type === 'share') {
        return {
          name: 'files-shares-with-me',
          ...(!!messageRichParameters?.share?.id && {
            query: { scrollTo: messageRichParameters.share.id }
          })
        }
      }
      if (object_type === 'storagespace' && messageRichParameters?.space?.id) {
        const space = store.getters['runtime/spaces/spaces'].find(
          (s) => s.fileId === messageRichParameters?.space?.id.split('!')[0] && !s.disabled
        )

        if (space && subject === 'Removed from Space') {
          store.commit('runtime/spaces/REMOVE_SPACE', space)
          return null
        } else if (space) {
          return {
            name: 'files-spaces-generic',
            ...createFileRouteOptions(space, { path: '', fileId: space.fileId })
          }
        }

        try {
          const { data } = await clientService.graphAuthenticated.drives.getDrive(
            messageRichParameters.space.id
          )

          const space = buildSpace(data)
          if (!space.isMember(store.getters.user)) {
            return null
          }

          store.commit('runtime/spaces/UPSERT_SPACE', space)

          return {
            name: 'files-spaces-generic',
            ...createFileRouteOptions(space, { path: '', fileId: space.fileId })
          }
        } catch (error) {
          // user has probably been removed from space
          console.error(error)
          return null
        }
      }
      return null
    }

    const setAdditionalData = async () => {
      loading.value = true
      for (const notification of unref(notifications)) {
        notification.computedMessage = getMessage(notification)
        notification.computedLink = await getLink(notification)
      }
      loading.value = false
    }

    const fetchNotificationsTask = useTask(function* (signal) {
      loading.value = true
      try {
        const response = yield clientService.owncloudSdk.requests.ocs({
          service: 'apps/notifications',
          action: 'api/v1/notifications'
        })

        if (response.headers.get('Content-Length') === '0') {
          return
        }

        const {
          ocs: { data = [] }
        } = yield response.json()
        notifications.value =
          data?.sort((a, b) => (new Date(b.datetime) as any) - (new Date(a.datetime) as any)) || []
      } catch (e) {
        console.error(e)
      } finally {
        if (unref(dropdownOpened)) {
          yield setAdditionalData()
        }
        loading.value = false
      }
    }).restartable()

    const deleteNotifications = async (ids: string[]) => {
      loading.value = true
      try {
        const { status } = await clientService.owncloudSdk.requests.ocs({
          service: 'apps/notifications',
          action: `api/v1/notifications`,
          method: 'DELETE',
          data: { ids }
        })
        if (status === 405) {
          // oC10
          const promises = []
          for (const id of ids) {
            promises.push(
              clientService.owncloudSdk.requests.ocs({
                service: 'apps/notifications',
                action: `api/v1/notifications/${id}`,
                method: 'DELETE'
              })
            )
          }
          return Promise.resolve(promises)
        }
      } catch (e) {
        console.error(e)
      } finally {
        notifications.value = unref(notifications).filter((n) => !ids.includes(n.notification_id))
        loading.value = false
      }
    }

    const executeAction = async (app, link, type, notificationId) => {
      try {
        const response = await clientService.owncloudSdk.requests.ocs({
          service: 'apps/' + app,
          action: link.slice(link.lastIndexOf('api')),
          method: type
        })
        const {
          ocs: { data }
        } = await response.json()

        await deleteNotifications([notificationId])

        for (const item in data) {
          const currentPath = unref(route).params.item ? `/${unref(route).params.item}` : '/'
          const { state, path, file_target: fileTarget } = item as any

          // accepted federated share
          if (state === ShareStatus.accepted && fileTarget) {
            eventBus.publish('app.files.list.load')
            return
          }

          const itemPath = path?.slice(0, path.lastIndexOf('/') + 1)
          if (itemPath === currentPath) {
            eventBus.publish('app.files.list.load')
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

    const onSSENotificationEvent = (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification
        if (!notification || !notification.notification_id) {
          return
        }
        notifications.value = [notification, ...unref(notifications)]
      } catch (_) {
        console.error('Unable to parse sse notification data')
      }
    }

    const hideDrop = () => {
      dropdownOpened.value = false
    }
    const showDrop = () => {
      dropdownOpened.value = true
      setAdditionalData()
    }

    onMounted(async () => {
      fetchNotificationsTask.perform()
      if (unref(sseEnabled)) {
        clientService.sseAuthenticated.addEventListener(
          MESSAGE_TYPE.NOTIFICATION,
          onSSENotificationEvent
        )
      } else {
        notificationsInterval.value = setInterval(() => {
          fetchNotificationsTask.perform()
        }, POLLING_INTERVAL)
      }
    })

    onUnmounted(() => {
      if (unref(sseEnabled)) {
        clientService.sseAuthenticated.removeEventListener(
          MESSAGE_TYPE.NOTIFICATION,
          onSSENotificationEvent
        )
      } else {
        clearInterval(unref(notificationsInterval))
      }
    })

    return {
      notifications,
      fetchNotificationsTask,
      loading,
      dropdownOpened,
      deleteNotifications,
      executeAction,
      formatDate,
      formatDateRelative,
      getMessage,
      getLink,
      hideDrop,
      showDrop
    }
  }
}
</script>

<style lang="scss" scoped>
#oc-notifications-drop {
  width: 400px;
  max-width: 100%;
  max-height: 400px;
}

.oc-notifications {
  &-item {
    > a {
      color: var(--oc-color-text-default);
    }
  }

  &-loading {
    * {
      position: absolute;
    }

    &-background {
      background-color: var(--oc-color-background-secondary);
      opacity: 0.6;
    }

    &-spinner {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 1;
    }
  }

  &-actions {
    button:not(:last-child) {
      margin-right: var(--oc-space-small);
    }
  }

  &-link {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 300px;
  }
}
</style>
