<template>
  <oc-notifications :position="notificationPosition">
    <oc-notification-message
      v-for="item in limitedMessages"
      :key="item.id"
      :title="item.title"
      :message="item.desc"
      :status="item.status"
      :timeout="item.timeout"
      :error-log-content="item.errorLogContent"
      @close="deleteMessage(item)"
    />
  </oc-notifications>
</template>

<script lang="ts">
import { Message, useConfigurationManager, useMessages } from '@ownclouders/web-pkg'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'MessageBar',
  setup() {
    const messageStore = useMessages()
    const configurationManager = useConfigurationManager()

    const notificationPosition = computed(() => {
      if (configurationManager.options.topCenterNotifications) {
        return 'top-center'
      }
      return 'default'
    })

    const limitedMessages = computed(() => {
      return messageStore.messages ? messageStore.messages.slice(0, 5) : []
    })

    const deleteMessage = (message: Message) => {
      messageStore.removeMessage(message)
    }

    return { notificationPosition, limitedMessages, deleteMessage }
  }
})
</script>
