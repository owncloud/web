<template>
  <div class="sciencemesh-app">
    <div>
      <div class="oc-flex oc-flex-middle oc-px-m oc-py-s">
        <oc-icon name="user-shared" />
        <h2 class="oc-px-s" v-text="$gettext('Invite users')"></h2>
        <oc-contextual-helper class="oc-pl-xs" v-bind="helperContent" />
      </div>
      <div class="oc-flex oc-flex-middle oc-flex-center oc-p-m">
        <oc-button
          :aria-label="
            $gettext('Generate invitation link that can be shared with one or more invitees')
          "
          @click="openInviteModal"
        >
          <oc-icon name="add" />
          <span v-text="$gettext('Generate invitation')" />
        </oc-button>
      </div>
      <oc-modal
        v-if="showInviteModal"
        :title="$gettext('Generate new invitation')"
        :button-cancel-text="$gettext('Cancel')"
        :button-confirm-text="$gettext('Generate')"
        :button-confirm-disabled="!!descriptionErrorMessage"
        focus-trap-initial="#invite_token_description"
        @cancel="resetGenerateInviteToken"
        @confirm="generateToken"
      >
        <template #content>
          <form autocomplete="off" @submit.prevent="generateToken">
            <oc-text-input
              id="invite_token_description"
              v-model="formInput.description"
              class="oc-mb-s"
              :error-message="descriptionErrorMessage"
              :label="$gettext('Add a description (optional)')"
              :clear-button-enabled="true"
              :description-message="
                !descriptionErrorMessage && `${formInput.description?.length || 0}/${50}`
              "
            />
            <oc-text-input
              id="invite_token_recipient"
              ref="inputForFocusEmail"
              v-model="formInput.recipient"
              class="oc-mb-s"
              type="email"
              :clear-button-enabled="true"
              :error-message="emailErrorMessage"
              :label="$gettext('Email to send the invitation (optional)')"
            />
            <!-- <oc-text-input label="Add an recipient to sent the token (optional)"/> -->
            <input type="submit" class="oc-hidden" />
          </form> </template
      ></oc-modal>
      <app-loading-spinner v-if="loading" />
      <template v-else>
        <no-content-message
          v-if="!sortedTokens.length"
          id="invite-tokens-empty"
          class="files-empty"
          icon="user-shared"
        >
          <template #message>
            <span v-text="$gettext('You have no invitation links')" />
          </template>
        </no-content-message>
        <oc-table v-else :fields="fields" :data="sortedTokens" :highlighted="lastCreatedToken">
          <template #token="rowData">
            <div class="invite-code-wrapper oc-flex">
              <span class="oc-display-inline-block oc-text-truncate">{{ rowData.item.token }}</span>
              <oc-button
                id="oc-sciencemesh-copy-token"
                v-oc-tooltip="$gettext('Copy invite token')"
                :aria-label="$gettext('Copy invite token')"
                appearance="raw"
                class="oc-ml-s"
                @click="copyToken(rowData)"
              >
                <oc-icon name="file-copy" />
              </oc-button>
            </div>
          </template>
          <template #link="rowData">
            <a :href="rowData.item.link" v-text="$gettext('Link')" />
            <oc-button
              id="oc-sciencemesh-copy-token"
              v-oc-tooltip="$gettext('Copy invitation link')"
              :aria-label="$gettext('Copy invitation link')"
              appearance="raw"
              @click="copyLink(rowData)"
            >
              <oc-icon name="file-copy" />
            </oc-button>
          </template>
          <template #expiration="rowData">
            <span
              v-oc-tooltip="formatDate(rowData.item.expiration)"
              tabindex="0"
              v-text="formatDateRelative(rowData.item.expiration)"
            />
          </template>
        </oc-table>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, unref } from 'vue'
import * as EmailValidator from 'email-validator'
import {
  NoContentMessage,
  AppLoadingSpinner,
  useClientService,
  useMessages,
  formatDateFromJSDate,
  formatRelativeDateFromJSDate
} from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { inviteListSchema, inviteSchema } from '../schemas'

type Token = {
  id: string
  token: string
  link?: string
  expiration?: Date
  expirationSeconds?: number
  description?: string
}

export default defineComponent({
  components: {
    NoContentMessage,
    AppLoadingSpinner
  },
  setup() {
    const { showMessage, showErrorMessage } = useMessages()
    const clientService = useClientService()
    const { $gettext, current: currentLanguage } = useGettext()

    const lastCreatedToken = ref('')
    const showInviteModal = ref(false)
    const formInput = ref({
      description: '',
      recipient: ''
    })
    const tokens = ref<Token[]>([])
    const loading = ref(true)
    const emailErrorMessage = ref(null)
    const descriptionErrorMessage = ref<string>()
    const inputForFocusEmail = ref<HTMLInputElement>()
    const fields = computed(() => {
      const haveLinks = unref(sortedTokens)[0]?.link

      return [
        haveLinks && {
          name: 'link',
          title: $gettext('Invitation link'),
          alignH: 'left',
          type: 'slot'
        },
        {
          name: 'token',
          title: $gettext('Invite code'),
          alignH: haveLinks ? 'right' : 'left',
          type: 'slot'
        },
        {
          name: 'description',
          title: $gettext('Description'),
          alignH: 'right'
        },
        {
          name: 'expiration',
          title: $gettext('Expires'),
          alignH: 'right',
          type: 'slot'
        }
      ].filter(Boolean)
    })
    const sortedTokens = computed(() => {
      return [...unref(tokens)].sort((a, b) => (a.expirationSeconds < b.expirationSeconds ? 1 : -1))
    })
    const helperContent = computed(() => {
      return {
        text: $gettext(
          'Create an invitation link and send it to the person you want to share with.'
        )
      }
    })

    const generateToken = async () => {
      const { description, recipient } = unref(formInput)
      if (recipient.length > 0 && !EmailValidator.validate(recipient)) {
        emailErrorMessage.value = $gettext('Please enter a valid email address!')
        unref(inputForFocusEmail).focus()
        return
      }

      if (unref(descriptionErrorMessage)) {
        return
      }

      try {
        const { data: tokenInfo } = await clientService.httpAuthenticated.post(
          '/sciencemesh/generate-invite',
          {
            params: {
              ...(description && { description }),
              ...(recipient && { recipient })
            }
          },
          {
            schema: inviteSchema
          }
        )

        if (tokenInfo.token) {
          tokens.value.push({
            id: tokenInfo.token,
            link: tokenInfo.invite_link,
            token: tokenInfo.token,
            ...(tokenInfo.expiration && {
              expiration: toDateTime(tokenInfo.expiration)
            }),
            ...(tokenInfo.expiration && {
              expirationSeconds: tokenInfo.expiration
            }),
            ...(tokenInfo.description && { description: tokenInfo.description })
          })
          showMessage({
            title: $gettext('Success'),
            status: 'success',
            desc: recipient
              ? $gettext('New invitation link has been created and sent to %{recipient}.', {
                  recipient
                })
              : $gettext(
                  'New invitation link has been created and copied to your clipboard. Send it to the invitee(s).'
                )
          })
          lastCreatedToken.value = tokenInfo.token
          if (!recipient) {
            navigator.clipboard.writeText(tokenInfo.invite_link)
          }
        }
      } catch (error) {
        lastCreatedToken.value = ''
        errorPopup(error)
      } finally {
        resetGenerateInviteToken()
      }
    }

    const listTokens = async () => {
      const url = '/sciencemesh/list-invite'
      try {
        const { data } = await clientService.httpAuthenticated.get(url, {
          schema: inviteListSchema
        })
        data.forEach((t) => {
          tokens.value.push({
            id: t.token,
            token: t.token,
            ...(t.expiration && {
              expiration: toDateTime(t.expiration)
            }),
            ...(t.expiration && {
              expirationSeconds: t.expiration
            }),
            ...(t.description && { description: t.description })
          })
        })
      } catch (error) {
        console.log(error)
      } finally {
        loading.value = false
      }
    }

    const copyLink = (rowData: { item: { link: string; token: string } }) => {
      navigator.clipboard.writeText(rowData.item.link)
      showMessage({
        title: $gettext('Invition link copied'),
        desc: $gettext('Invitation link has been copied to your clipboard.')
      })
    }
    const copyToken = (rowData: { item: { link: string; token: string } }) => {
      navigator.clipboard.writeText(rowData.item.token)
      showMessage({
        title: $gettext('Invite token copied'),
        desc: $gettext('Invite token has been copied to your clipboard.')
      })
    }
    const errorPopup = (error: Error) => {
      console.error(error)
      showErrorMessage({
        title: $gettext('Error'),
        desc: $gettext('An error occurred when generating the token'),
        errors: [error]
      })
    }

    const openInviteModal = () => {
      showInviteModal.value = true
    }

    const resetGenerateInviteToken = () => {
      showInviteModal.value = false
      formInput.value = {
        description: '',
        recipient: ''
      }
    }

    const toDateTime = (secs: number) => {
      const d = new Date(Date.UTC(1970, 0, 1))
      d.setUTCSeconds(secs)
      return d
    }

    onMounted(() => {
      listTokens()
    })

    const formatDate = (date: Date) => {
      return formatDateFromJSDate(date, currentLanguage)
    }
    const formatDateRelative = (date: Date) => {
      return formatRelativeDateFromJSDate(date, currentLanguage)
    }

    return {
      helperContent,
      openInviteModal,
      showInviteModal,
      descriptionErrorMessage,
      resetGenerateInviteToken,
      generateToken,
      formInput,
      emailErrorMessage,
      loading,
      sortedTokens,
      copyToken,
      copyLink,
      lastCreatedToken,
      fields,
      inputForFocusEmail,
      formatDate,
      formatDateRelative
    }
  }
})
</script>

<style lang="scss">
.sciencemesh-app {
  .invite-code-wrapper {
    max-width: 100%;
    @media (max-width: $oc-breakpoint-xlarge) {
      max-width: 200px;
    }
  }
  #invite-tokens-empty {
    height: 100%;
  }
}
</style>
