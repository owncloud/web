<template>
  <div class="oc-flex oc-button-justify-content-space-between oc-pb-s">
    <div v-if="advancedMode" class="oc-flex oc-flex-middle">
      <oc-icon class="oc-mr-s" :name="getLinkRoleByType(selectedType).icon" fill-type="line" />
      <link-role-dropdown
        :model-value="selectedType"
        :available-link-type-options="availableLinkTypes"
        @update:model-value="updateSelectedLinkType"
      />
    </div>
    <div v-else class="oc-flex oc-flex-middle">
      <oc-icon class="oc-mr-s" :name="getLinkRoleByType(selectedType).icon" fill-type="line" />
      <span v-text="$gettext(getLinkRoleByType(selectedType).description)" />
    </div>
    <oc-button
      v-if="!advancedMode"
      gap-size="xsmall"
      appearance="raw"
      variation="primary"
      @click="setAdvancedMode()"
    >
      <oc-icon name="settings-3" size="small" fill-type="fill" />
      <span v-text="$gettext('Options')" />
    </oc-button>
  </div>
  <div v-if="!onlyInternalLinksAllowed" class="link-modal-password">
    <oc-text-input
      v-if="advancedMode"
      :key="passwordInputKey"
      :model-value="password.value"
      type="password"
      :password-policy="!selectedLinkTypeIsInternal ? passwordPolicy : null"
      :generate-password-method="generatePasswordMethod"
      :error-message="password.error"
      :description-message="
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
      <span v-text="$gettext('Password: ')" />
      <span v-text="password.value" />
    </div>
  </div>
  <div class="link-modal-actions oc-flex oc-flex-right oc-flex-middle oc-mt-s">
    <div v-if="advancedMode" class="link-modal-actions-advanced">
      <oc-icon
        v-if="selectedExpiry"
        v-oc-tooltip="expirationDateTooltip"
        class="oc-mr-s"
        :aria-label="expirationDateTooltip"
        name="calendar-event"
        fill-type="line"
      />
      <oc-button
        v-if="!onlyInternalLinksAllowed"
        id="link-modal-context-menu-toggle"
        :aria-label="$gettext('More options')"
        appearance="raw"
      >
        <oc-icon name="more-2" />
      </oc-button>
      <oc-drop
        v-if="!onlyInternalLinksAllowed"
        X
        ref="contextMenuDrop"
        drop-id="link-modal-context-menu-drop"
        toggle="#link-modal-context-menu-toggle"
        padding-size="small"
        mode="click"
      >
        <oc-list class="link-modal-context-menu">
          <li class="oc-rounded oc-menu-item-hover">
            <oc-datepicker
              v-model="selectedExpiry"
              class="link-expiry-picker oc-flex oc-width-1-1"
              :min-date="expirationRules.min"
              :max-date="expirationRules.max"
              :locale="$language.current"
              :is-required="expirationRules.enforced"
            >
              <template #default="{ togglePopover }">
                <oc-button
                  appearance="raw"
                  class="oc-p-s action-menu-item link-expiry-picker-btn"
                  :disabled="selectedLinkTypeIsInternal"
                  @click="togglePopover"
                >
                  <oc-icon name="calendar-event" fill-type="line" size="medium" />
                  <span
                    v-text="
                      selectedExpiry
                        ? $gettext('Edit expiration date')
                        : $gettext('Set expiration date')
                    "
                  />
                </oc-button>
                <oc-button
                  v-if="selectedExpiry"
                  :aria-label="$gettext('Remove expiration date')"
                  appearance="raw"
                  @click="selectedExpiry = undefined"
                >
                  <oc-icon name="close" />
                </oc-button>
              </template>
            </oc-datepicker>
          </li>
        </oc-list>
      </oc-drop>
    </div>
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
  onMounted,
  watch
} from 'vue'
import {
  usePasswordPolicyService,
  useEmbedMode,
  useExpirationRules,
  useLinkTypes,
  Modal,
  useSharesStore,
  useClientService
} from '../composables'
import { LinkShare, SpaceResource } from '@ownclouders/web-client'
import { Resource } from '@ownclouders/web-client'
import { formatRelativeDateFromDateTime } from '../helpers'
import { OcButton, OcDrop } from 'design-system/src/components'
import { SharingLinkType } from '@ownclouders/web-client/graph/generated'
import { $gettext } from '../router/utils'
import LinkRoleDropdown from './LinkRoleDropdown.vue'

type RoleRef = ComponentPublicInstance<typeof OcButton>

export default defineComponent({
  name: 'CreateLinkModal',
  components: { LinkRoleDropdown },
  props: {
    modal: { type: Object as PropType<Modal>, required: true },
    resources: { type: Array as PropType<Resource[]>, required: true },
    space: { type: Object as PropType<SpaceResource>, default: undefined },
    isQuickLink: { type: Boolean, default: false },
    callbackFn: {
      type: Function as PropType<
        (result: PromiseSettledResult<LinkShare>[], password: string) => Promise<void> | void
      >,
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
    const { expirationRules } = useExpirationRules()
    const {
      defaultLinkType,
      getAvailableLinkTypes,
      getLinkRoleByType,
      isPasswordEnforcedForLinkType
    } = useLinkTypes()
    const { addLink } = useSharesStore()
    const contextMenuDrop = ref<InstanceType<typeof OcDrop>>()
    const advancedMode = ref(false)

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

    const password = reactive({ value: '', error: undefined })
    const selectedType = ref(unref(defaultLinkType))
    const selectedExpiry = ref<Date>()

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

    const selectedExpiryDateRelative = computed(() =>
      formatRelativeDateFromDateTime(
        DateTime.fromJSDate(unref(selectedExpiry)).endOf('day'),
        language.current
      )
    )

    const selectedExpiryDate = computed(() =>
      formatRelativeDateFromDateTime(
        DateTime.fromJSDate(unref(selectedExpiry)).endOf('day'),
        language.current
      )
    )

    const expirationDateTooltip = computed(() => {
      return $gettext(
        'Expires %{timeToExpiry} (%{expiryDate})',
        { timeToExpiry: unref(selectedExpiryDateRelative), expiryDate: unref(selectedExpiryDate) },
        true
      )
    })

    const setAdvancedMode = () => {
      advancedMode.value = true
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
              expirationDateTime: DateTime.fromJSDate(unref(selectedExpiry)).endOf('day').toISO(),
              displayName: $gettext('Link')
            }
          })
        )
      )
    }

    const onConfirm = async () => {
      if (!unref(selectedLinkTypeIsInternal)) {
        if (!passwordPolicy.check(unref(password).value)) {
          password.error = $gettext('Password must fulfill the password policy')
          return Promise.reject()
        }
      }

      const result = await createLinks()

      const succeeded = result.filter(({ status }) => status === 'fulfilled')
      if (succeeded.length && unref(isEmbedEnabled)) {
        postMessage<string[]>(
          'owncloud-embed:share',
          (succeeded as PromiseFulfilledResult<LinkShare>[]).map(({ value }) => value.webUrl)
        )
      }

      let userFacingErrors: Error[] = []
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
        props.callbackFn(result, password.value)
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

    watch(selectedExpiry, () => {
      unref(contextMenuDrop).hide()
    })

    return {
      roleRefs,
      contextMenuDrop,
      password,
      passwordEnforced,
      passwordPolicy,
      generatePasswordMethod: () => passwordPolicyService.generatePassword(),
      passwordInputKey,
      selectedExpiry,
      expirationDateTooltip,
      expirationRules,
      availableLinkTypes,
      selectedType,
      selectedLinkTypeIsInternal,
      onlyInternalLinksAllowed,
      isSelectedLinkType,
      updateSelectedLinkType,
      updatePassword,
      getLinkRoleByType,
      confirmButtonText,
      advancedMode,
      setAdvancedMode,

      // unit tests
      onConfirm
    }
  },
  methods: { $gettext }
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
