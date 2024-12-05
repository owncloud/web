<template>
  <div class="oc-flex oc-button-justify-content-space-between oc-pb-s">
    <div v-if="isAdvancedMode" class="oc-flex oc-flex-middle">
      <oc-icon class="oc-mr-s" :name="selectedTypeIcon" fill-type="line" />
      <link-role-dropdown
        :model-value="selectedType"
        :available-link-type-options="availableLinkTypes"
        @update:model-value="updateSelectedLinkType"
      />
    </div>
    <div v-else class="oc-flex oc-flex-middle">
      <oc-icon class="oc-mr-s" :name="selectedTypeIcon" fill-type="line" />
      <div class="oc-flex oc-flex-column">
        <span class="oc-text-bold" v-text="selectedTypeDisplayName" />
        <span class="oc-text-small" v-text="selectedTypeDescription" />
      </div>
    </div>
    <oc-button
      v-if="!isAdvancedMode"
      class="link-modal-advanced-mode-button"
      gap-size="xsmall"
      appearance="raw"
      variation="primary"
      @click="setAdvancedMode()"
    >
      <oc-icon name="settings-3" size="small" fill-type="fill" />
      <span v-text="$gettext('Options')" />
    </oc-button>
  </div>
  <div class="link-modal-password oc-mb-m">
    <oc-text-input
      v-if="isAdvancedMode"
      :key="passwordInputKey"
      :model-value="password.value"
      type="password"
      :password-policy="passwordPolicy"
      :generate-password-method="generatePasswordMethod"
      :error-message="password.error"
      :label="passwordEnforced ? `${$gettext('Password')}*` : $gettext('Password')"
      class="link-modal-password-input"
      @update:model-value="updatePassword"
    />
    <div v-else-if="password.value" class="link-modal-password-text oc-text-small oc-text-muted">
      <span v-text="$gettext('Password:')" />
      <span v-text="password.value" />
    </div>
    <oc-datepicker
      v-if="isAdvancedMode"
      class="oc-mt-s"
      :min-date="DateTime.now()"
      :label="$gettext('Expiry date')"
      @date-changed="onExpiryDateChanged"
    />
  </div>
  <div class="link-modal-actions oc-flex oc-flex-right oc-flex-middle oc-mt-s">
    <oc-button
      class="link-modal-cancel oc-modal-body-actions-cancel oc-ml-s"
      appearance="outline"
      variation="passive"
      @click="$emit('cancel')"
      >{{ $gettext('Cancel') }}
    </oc-button>
    <div
      class="link-modal-confirm-button-group oc-ml-s"
      :class="{ 'oc-button-group': password.value }"
    >
      <oc-button
        class="link-modal-confirm oc-modal-body-actions-confirm"
        appearance="filled"
        variation="primary"
        :disabled="confirmButtonDisabled"
        @click="$emit('confirm')"
        >{{ confirmButtonText }}
      </oc-button>
      <oc-button
        v-if="password.value"
        class="link-modal-confirm oc-modal-body-actions-confirm-secondary-trigger"
        appearance="filled"
        variation="primary"
        :disabled="confirmButtonDisabled"
      >
        <oc-icon size="small" name="arrow-down-s" />
      </oc-button>
      <oc-drop
        v-if="password.value"
        drop-id="oc-modal-body-actions-confirm-secondary-drop"
        toggle=".oc-modal-body-actions-confirm-secondary-trigger"
        mode="click"
        padding-size="small"
        close-on-click
      >
        <oc-list class="oc-modal-body-actions-confirm-secondary-menu">
          <li class="oc-rounded oc-menu-item-hover">
            <oc-button
              class="oc-modal-body-actions-confirm-password action-menu-item"
              appearance="raw"
              @click="$emit('confirm', { copyPassword: true })"
              >{{ $gettext('Copy link and password') }}
            </oc-button>
          </li>
        </oc-list>
      </oc-drop>
    </div>
  </div>
</template>

<script lang="ts">
import { DateTime } from 'luxon'
import { v4 as uuidV4 } from 'uuid'
import { upperFirst } from 'lodash-es'
import { useGettext } from 'vue3-gettext'
import {
  ComponentPublicInstance,
  computed,
  defineComponent,
  PropType,
  ref,
  reactive,
  unref,
  onMounted
} from 'vue'
import {
  usePasswordPolicyService,
  useEmbedMode,
  useLinkTypes,
  Modal,
  useSharesStore,
  useClientService
} from '../composables'
import { LinkShare, SpaceResource } from '@ownclouders/web-client'
import { Resource } from '@ownclouders/web-client'
import { OcButton } from '@ownclouders/design-system/components'
import { SharingLinkType } from '@ownclouders/web-client/graph/generated'
import LinkRoleDropdown from './LinkRoleDropdown.vue'

type RoleRef = ComponentPublicInstance<typeof OcButton>

interface CallbackArgs {
  result: PromiseSettledResult<LinkShare>[]
  password: string
  options?: { copyPassword?: boolean }
}

export default defineComponent({
  name: 'CreateLinkModal',
  components: { LinkRoleDropdown },
  props: {
    modal: { type: Object as PropType<Modal>, required: true },
    resources: { type: Array as PropType<Resource[]>, required: true },
    space: { type: Object as PropType<SpaceResource>, default: undefined },
    callbackFn: {
      type: Function as PropType<(args: CallbackArgs) => Promise<void> | void>,
      default: undefined
    }
  },
  emits: ['cancel', 'confirm'],
  setup(props, { expose }) {
    const clientService = useClientService()
    const language = useGettext()
    const { $gettext } = language
    const passwordPolicyService = usePasswordPolicyService()
    const { isEnabled: isEmbedEnabled, postMessage } = useEmbedMode()
    const {
      defaultLinkType,
      getAvailableLinkTypes,
      getLinkRoleByType,
      isPasswordEnforcedForLinkType
    } = useLinkTypes()
    const { addLink } = useSharesStore()
    const isAdvancedMode = ref(false)
    const isInvalidExpiryDate = ref(false)

    const isFolder = computed(() => props.resources.every(({ isFolder }) => isFolder))

    const confirmButtonText = computed(() => {
      if (unref(isEmbedEnabled)) {
        return $gettext('Share link(s)')
      }

      return $gettext('Copy link')
    })

    const passwordInputKey = ref(uuidV4())
    const roleRefs = ref<Record<string, RoleRef>>({})

    const selectedExpiry = ref<DateTime>()
    const password = reactive({ value: '', error: undefined })
    const selectedType = ref(unref(defaultLinkType))

    const selectedTypeDescription = computed(() =>
      $gettext(getLinkRoleByType(unref(selectedType)).description)
    )

    const selectedTypeDisplayName = computed(() =>
      $gettext(getLinkRoleByType(unref(selectedType)).displayName)
    )

    const selectedTypeIcon = computed(() => getLinkRoleByType(unref(selectedType)).icon)

    const availableLinkTypes = computed(() => getAvailableLinkTypes({ isFolder: unref(isFolder) }))
    const passwordEnforced = computed(() => isPasswordEnforcedForLinkType(unref(selectedType)))

    const passwordPolicy = passwordPolicyService.getPolicy({
      enforcePassword: unref(passwordEnforced)
    })

    const setAdvancedMode = () => {
      isAdvancedMode.value = true
    }

    const onExpiryDateChanged = ({ date, error }: { date: DateTime; error: boolean }) => {
      selectedExpiry.value = date
      isInvalidExpiryDate.value = error
    }

    const createLinks = () => {
      return Promise.allSettled<LinkShare>(
        props.resources.map((resource) =>
          addLink({
            clientService,
            space: props.space,
            resource,
            options: {
              type: unref(selectedType),
              '@libre.graph.quickLink': false,
              password: unref(password).value,
              expirationDateTime: unref(selectedExpiry)?.toISO(),
              displayName: $gettext('Unnamed link')
            }
          })
        )
      )
    }

    const passwordPolicyFulfilled = computed(() => {
      if (!passwordPolicy.check(unref(password).value)) {
        return false
      }

      return true
    })

    const confirmButtonDisabled = computed(() => {
      if (unref(passwordPolicyFulfilled) && !unref(isInvalidExpiryDate)) {
        return false
      }

      return true
    })

    const onConfirm = async (options: { copyPassword?: boolean } = {}) => {
      const result = await createLinks()

      const succeeded = result.filter(({ status }) => status === 'fulfilled')
      if (succeeded.length && unref(isEmbedEnabled)) {
        postMessage<string[]>(
          'owncloud-embed:share',
          (succeeded as PromiseFulfilledResult<LinkShare>[]).map(({ value }) => value.webUrl)
        )
      }

      const userFacingErrors: Error[] = []
      const failed = result.filter(({ status }) => status === 'rejected')
      if (failed.length) {
        ;(failed as PromiseRejectedResult[])
          .map(({ reason }) => reason)
          .forEach((e) => {
            console.error(e)
            // Human-readable error message is provided, for example when password is on banned list
            if (e.response?.status === 400) {
              const error = e.response.data.error
              error.message = upperFirst(error.message)
              userFacingErrors.push(error)
            }
          })
      }

      if (userFacingErrors.length) {
        password.error = $gettext(userFacingErrors[0].message)
        return Promise.reject()
      }

      if (props.callbackFn) {
        props.callbackFn({ result, password: password.value, options })
      }
    }

    expose({ onConfirm })

    const isSelectedLinkType = (type: SharingLinkType) => {
      return unref(selectedType) === type
    }
    const updatePassword = (value: string) => {
      password.value = value
      password.error = undefined
    }

    const updateSelectedLinkType = (type: SharingLinkType) => {
      selectedType.value = type
    }

    onMounted(() => {
      const activeRoleOption = unref(roleRefs)[unref(selectedType)]
      if (activeRoleOption) {
        activeRoleOption.$el.focus()
      }

      if (unref(passwordEnforced)) {
        password.value = passwordPolicyService.generatePassword()
      }
    })

    return {
      roleRefs,
      password,
      passwordEnforced,
      passwordPolicy,
      generatePasswordMethod: () => passwordPolicyService.generatePassword(),
      passwordInputKey,
      selectedExpiry,
      availableLinkTypes,
      selectedType,
      selectedTypeIcon,
      selectedTypeDisplayName,
      selectedTypeDescription,
      isSelectedLinkType,
      updateSelectedLinkType,
      updatePassword,
      getLinkRoleByType,
      confirmButtonText,
      isAdvancedMode,
      setAdvancedMode,
      onExpiryDateChanged,
      confirmButtonDisabled,
      DateTime,

      // unit tests
      onConfirm
    }
  }
})
</script>

<style lang="scss" scoped>
.action-menu-item {
  width: 100%;
  justify-content: flex-start;
}

.link-modal-password {
  margin-left: calc(var(--oc-space-small) + 22px);
}

.link-modal-confirm-button-group {
  outline: 0;
}

.oc-modal-body-actions-confirm-secondary-menu {
  .action-menu-item {
    width: 100%;
    justify-content: flex-start;
  }
}

.oc-modal-body-actions-confirm-secondary-trigger {
  background: var(--oc-color-swatch-primary-gradient);
  padding: var(--oc-space-xsmall);
}

.role-dropdown-list span {
  line-height: 1.3;
}

.role-dropdown-list li {
  margin: var(--oc-space-xsmall) 0;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }

  .oc-button {
    text-align: left;
    width: 100%;
    gap: var(--oc-space-medium);

    &:hover,
    &:focus {
      background-color: var(--oc-color-background-hover);
      text-decoration: none;
    }
  }

  .selected span {
    color: var(--oc-color-swatch-primary-contrast);
  }
}
</style>
