<template>
  <div>
    <oc-list class="role-dropdown-list">
      <li
        v-for="(roleOption, index) in availableRoleOptions"
        :key="`role-dropdown-${roleOption.key}`"
      >
        <oc-button
          :id="`files-role-${roleOption.name}`"
          :ref="(el: ComponentPublicInstance) => (roleRefs[index] = el)"
          :class="{
            selected: isSelectedRole(roleOption),
            'oc-background-primary-gradient': isSelectedRole(roleOption)
          }"
          :appearance="isSelectedRole(roleOption) ? 'raw-inverse' : 'raw'"
          :variation="isSelectedRole(roleOption) ? 'primary' : 'passive'"
          justify-content="space-between"
          class="oc-p-s"
          @click="updateSelectedRole(roleOption)"
        >
          <span class="oc-flex oc-flex-middle">
            <oc-icon :name="roleOption.icon" class="oc-pl-s oc-pr-m" variation="inherit" />
            <span>
              <span
                class="role-dropdown-list-option-label oc-text-bold oc-display-block oc-width-1-1"
                v-text="$gettext(roleOption.label)"
              />
              <span v-if="isSelectedRole(roleOption)" class="oc-text-small">{{
                $gettext(roleOption.description(false))
              }}</span>
            </span>
          </span>
          <span class="oc-flex">
            <oc-radio v-model="selectedRole" :option="roleOption" :hide-label="true" />
          </span>
        </oc-button>
      </li>
    </oc-list>
  </div>
  <div>
    <oc-text-input
      v-if="!onlyInternalLinksAllowed"
      :key="passwordInputKey"
      :model-value="password.value"
      type="password"
      :password-policy="passwordPolicy"
      :generate-password-method="generatePasswordMethod"
      :error-message="password.error"
      :description-message="
        selectedRoleIsInternal ? $gettext('Password cannot be set for internal links') : undefined
      "
      :fix-message-line="true"
      :label="passwordEnforced ? `${$gettext('Password')}*` : $gettext('Password')"
      class="link-modal-password-input oc-mt-l"
      :disabled="selectedRoleIsInternal"
      @update:model-value="updatePassword"
    />
  </div>
  <div class="link-modal-actions oc-flex oc-flex-right oc-flex-middle oc-mt-m">
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
      appearance="raw"
    >
      <oc-icon name="more-2" />
    </oc-button>
    <oc-drop
      v-if="!onlyInternalLinksAllowed"
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
                :disabled="selectedRoleIsInternal"
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
    <oc-button
      class="link-modal-cancel oc-modal-body-actions-cancel oc-ml-s"
      appearance="outline"
      variation="passive"
      @click="cancel"
      >{{ $gettext('Cancel') }}
    </oc-button>
    <oc-button
      class="link-modal-confirm oc-modal-body-actions-confirm oc-ml-s"
      appearance="filled"
      variation="primary"
      @click="confirm"
      >{{ $gettext('Copy link') }}
    </oc-button>
  </div>
</template>

<script lang="ts">
import { DateTime } from 'luxon'
import { v4 as uuidV4 } from 'uuid'
import { useGettext } from 'vue3-gettext'
import {
  computed,
  defineComponent,
  PropType,
  ref,
  Ref,
  reactive,
  unref,
  onMounted,
  ComponentPublicInstance
} from 'vue'
import {
  useAbility,
  useCapabilityFilesSharingPublicAlias,
  useCapabilityFilesSharingPublicCanContribute,
  useCapabilityFilesSharingPublicCanEdit,
  useCapabilityFilesSharingPublicPasswordEnforcedFor,
  useLoadingService,
  usePasswordPolicyService,
  useStore,
  useEmbedMode,
  useExpirationRules,
  useDefaultLinkPermissions,
  useCreateLink
} from '../composables'
import { formatRelativeDateFromDateTime } from '../helpers'
import {
  LinkShareRoles,
  Share,
  ShareRole,
  SpaceResource,
  linkRoleContributorFolder,
  linkRoleEditorFolder,
  linkRoleInternalFolder,
  linkRoleUploaderFolder,
  linkRoleViewerFolder
} from '@ownclouders/web-client/src/helpers'
import { Resource } from '@ownclouders/web-client'

export default defineComponent({
  name: 'CreatePublicLinksModal',
  props: {
    resources: { type: Array as PropType<Resource[]>, required: true },
    space: { type: Object as PropType<SpaceResource>, default: undefined },
    isQuickLink: { type: Boolean, default: false },
    callbackFn: {
      type: Function as PropType<(result: PromiseSettledResult<Share>[]) => Promise<void> | void>,
      default: undefined
    }
  },
  setup(props) {
    const store = useStore()
    const { $gettext, current: currentLanguage } = useGettext()
    const loadingService = useLoadingService()
    const ability = useAbility()
    const passwordPolicyService = usePasswordPolicyService()
    const { isEnabled: isEmbedEnabled, postMessage } = useEmbedMode()
    const { expirationRules } = useExpirationRules()
    const { defaultLinkPermissions } = useDefaultLinkPermissions()
    const { createLink } = useCreateLink()

    const hasPublicLinkEditing = useCapabilityFilesSharingPublicCanEdit()
    const hasPublicLinkContribute = useCapabilityFilesSharingPublicCanContribute()
    const hasPublicLinkAliasSupport = useCapabilityFilesSharingPublicAlias()
    const canCreatePublicLinks = computed(() => ability.can('create-all', 'PublicLink'))
    const passwordEnforcedCapabilities = useCapabilityFilesSharingPublicPasswordEnforcedFor()
    const passwordPolicy = passwordPolicyService.getPolicy()

    const isFolder = computed(() => props.resources.every(({ isFolder }) => isFolder))

    const passwordInputKey = ref(uuidV4())
    const roleRefs = ref<Record<string, ComponentPublicInstance>>({})

    const password = reactive({ value: '', error: undefined })
    const selectedRole = ref<ShareRole>(
      LinkShareRoles.getByBitmask(unref(defaultLinkPermissions), unref(isFolder))
    ) as Ref<ShareRole>
    const selectedExpiry = ref<DateTime>()

    const availableRoleOptions = computed(() => {
      return LinkShareRoles.list(
        unref(isFolder),
        unref(hasPublicLinkEditing),
        unref(hasPublicLinkContribute),
        unref(hasPublicLinkAliasSupport),
        unref(canCreatePublicLinks)
      )
    })

    const passwordEnforced = computed(() => {
      return (
        (unref(passwordEnforcedCapabilities).read_only === true &&
          unref(selectedRole).name === linkRoleViewerFolder.name) ||
        (unref(passwordEnforcedCapabilities).upload_only === true &&
          unref(selectedRole).name === linkRoleUploaderFolder.name) ||
        (unref(passwordEnforcedCapabilities).read_write === true &&
          unref(selectedRole).name === linkRoleContributorFolder.name) ||
        (unref(passwordEnforcedCapabilities).read_write_delete === true &&
          unref(selectedRole).name === linkRoleEditorFolder.name)
      )
    })

    const selectedRoleIsInternal = computed(
      () => unref(selectedRole)?.bitmask(false) === linkRoleInternalFolder.bitmask(false)
    )
    const onlyInternalLinksAllowed = computed(
      () => unref(availableRoleOptions).length === 1 && unref(selectedRoleIsInternal)
    )

    const selectedExpiryDateRelative = computed(() =>
      formatRelativeDateFromDateTime(
        DateTime.fromJSDate(unref(selectedExpiry)).endOf('day'),
        currentLanguage
      )
    )

    const selectedExpiryDate = computed(() =>
      formatRelativeDateFromDateTime(
        DateTime.fromJSDate(unref(selectedExpiry)).endOf('day'),
        currentLanguage
      )
    )

    const expirationDateTooltip = computed(() => {
      return $gettext(
        'Expires %{timeToExpiry} (%{expiryDate})',
        { timeToExpiry: unref(selectedExpiryDateRelative), expiryDate: unref(selectedExpiryDate) },
        true
      )
    })

    const createLinks = () => {
      return loadingService.addTask(() =>
        Promise.allSettled<Share>(
          props.resources.map((resource) =>
            createLink({
              resource,
              space: props.space,
              quicklink: props.isQuickLink,
              permissions: unref(selectedRole).bitmask(false),
              password: unref(password).value,
              expireDate: unref(selectedExpiry)
            })
          )
        )
      )
    }

    const confirm = async () => {
      if (!unref(selectedRoleIsInternal)) {
        if (unref(passwordEnforced) && !unref(password).value) {
          password.error = $gettext('Password must not be empty')
          return
        }

        if (!passwordPolicy.check(unref(password).value)) {
          return
        }
      }

      const result = await createLinks()

      const succeeded = result.filter(({ status }) => status === 'fulfilled')
      if (succeeded.length && unref(isEmbedEnabled)) {
        postMessage<string[]>(
          'owncloud-embed:share',
          (succeeded as PromiseFulfilledResult<Share>[]).map(({ value }) => value.url)
        )
      }

      let userFacingErrors = []
      const failed = result.filter(({ status }) => status === 'rejected')
      if (failed.length) {
        ;(failed as PromiseRejectedResult[])
          .map(({ reason }) => reason)
          .forEach((e) => {
            console.error(e)
            // Human-readable error message is provided, for example when password is on banned list
            if (e.statusCode === 400) {
              userFacingErrors.push(e)
            }
          })
      }

      if (userFacingErrors.length) {
        password.error = $gettext(userFacingErrors[0].message)
        return
      }

      if (props.callbackFn) {
        props.callbackFn(result)
      }

      return store.dispatch('hideModal')
    }

    const cancel = () => {
      return store.dispatch('hideModal')
    }

    const isSelectedRole = (role: ShareRole) => {
      return unref(selectedRole)?.bitmask(false) === role.bitmask(false)
    }
    const updatePassword = (value: string) => {
      password.value = value
      password.error = undefined
    }

    const updateSelectedRole = (role: ShareRole) => {
      selectedRole.value = role
      if (unref(selectedRoleIsInternal)) {
        password.value = ''
        password.error = ''
        selectedExpiry.value = undefined

        // re-render password because it's the only way to remove policy messages
        passwordInputKey.value = uuidV4()
      }
    }

    onMounted(() => {
      const activeRoleOptionIdx = unref(availableRoleOptions).findIndex(
        ({ name }) => name === unref(selectedRole).name
      )

      const activeRoleOption = unref(roleRefs)[activeRoleOptionIdx]
      if (activeRoleOption) {
        ;(activeRoleOption as any).$el.focus()
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
      expirationDateTooltip,
      expirationRules,
      availableRoleOptions,
      selectedRole,
      selectedRoleIsInternal,
      onlyInternalLinksAllowed,
      isSelectedRole,
      updateSelectedRole,
      updatePassword,
      confirm,
      cancel
    }
  }
})
</script>

<style lang="scss" scoped>
.action-menu-item {
  width: 100%;
  justify-content: flex-start;
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
