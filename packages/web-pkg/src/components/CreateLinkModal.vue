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
      <span v-text="selectedTypeDescription" />
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
  <div v-if="!onlyInternalLinksAllowed" class="link-modal-password oc-mb-m">
    <oc-text-input
      v-if="isAdvancedMode"
      :key="passwordInputKey"
      :model-value="password.value"
      type="password"
      :password-policy="!selectedLinkTypeIsInternal ? passwordPolicy : null"
      :generate-password-method="generatePasswordMethod"
      :error-message="
        selectedLinkTypeIsInternal
          ? $gettext('Password cannot be set for internal links')
          : undefined
      "
      :label="passwordEnforced ? `${$gettext('Password')}*` : $gettext('Password')"
      class="link-modal-password-input"
      :disabled="selectedLinkTypeIsInternal"
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
      :disabled="selectedLinkTypeIsInternal"
      :error-message="
        selectedLinkTypeIsInternal
          ? $gettext('Expiry date cannot be set for internal links')
          : undefined
      "
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
    <oc-button
      class="link-modal-confirm oc-modal-body-actions-confirm oc-ml-s"
      appearance="filled"
      variation="primary"
      :disabled="confirmButtonDisabled"
      @click="$emit('confirm')"
      >{{ confirmButtonText }}
    </oc-button>
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
import { OcButton } from 'design-system/src/components'
import { SharingLinkType } from '@ownclouders/web-client/graph/generated'
import LinkRoleDropdown from './LinkRoleDropdown.vue'

type RoleRef = ComponentPublicInstance<typeof OcButton>

interface CallbackArgs {
  result: PromiseSettledResult<LinkShare>[]
  password: string
}

export default defineComponent({
  name: 'CreateLinkModal',
  components: { LinkRoleDropdown },
  props: {
    modal: { type: Object as PropType<Modal>, required: true },
    resources: { type: Array as PropType<Resource[]>, required: true },
    space: { type: Object as PropType<SpaceResource>, default: undefined },
    isQuickLink: { type: Boolean, default: false },
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

      if (unref(selectedLinkTypeIsInternal)) {
        return $gettext('Copy link')
      }

      if (unref(passwordEnforced) || unref(password)) {
        return $gettext('Copy link and password')
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
    const selectedTypeIcon = computed(() => getLinkRoleByType(unref(selectedType)).icon)

    const availableLinkTypes = computed(() => getAvailableLinkTypes({ isFolder: unref(isFolder) }))
    const passwordEnforced = computed(() => isPasswordEnforcedForLinkType(unref(selectedType)))

    const passwordPolicy = passwordPolicyService.getPolicy({
      enforcePassword: unref(passwordEnforced)
    })

    const selectedLinkTypeIsInternal = computed(
      () => unref(selectedType) === SharingLinkType.Internal
    )
    const onlyInternalLinksAllowed = computed(
      () => unref(availableLinkTypes).length === 1 && unref(selectedLinkTypeIsInternal)
    )
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
              '@libre.graph.quickLink': props.isQuickLink,
              password: unref(password).value,
              expirationDateTime: unref(selectedExpiry)?.toISO(),
              displayName: $gettext('Link')
            }
          })
        )
      )
    }

    const passwordPolicyFulfilled = computed(() => {
      if (!unref(selectedLinkTypeIsInternal)) {
        if (!passwordPolicy.check(unref(password).value)) {
          return false
        }
      }

      return true
    })

    const confirmButtonDisabled = computed(() => {
      if (unref(passwordPolicyFulfilled) && !unref(isInvalidExpiryDate)) {
        return false
      }

      return true
    })

    const onConfirm = async () => {
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
        props.callbackFn({ result, password: password.value })
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
      if (unref(selectedLinkTypeIsInternal)) {
        password.value = ''
        password.error = ''
        selectedExpiry.value = undefined

        // re-render password because it's the only way to remove policy messages
        passwordInputKey.value = uuidV4()
      }
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
      selectedTypeDescription,
      selectedLinkTypeIsInternal,
      onlyInternalLinksAllowed,
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
