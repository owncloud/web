<template>
  <div class="link-details oc-flex oc-flex-between oc-flex-middle">
    <div v-if="isModifiable">
      <link-role-dropdown
        :model-value="currentLinkType"
        :available-link-type-options="availableLinkTypeOptions"
        drop-offset="0"
        @update:model-value="updateSelectedType"
      />
    </div>
    <p v-else class="oc-my-rm">
      <span
        v-oc-tooltip="$gettext(currentLinkRoleDescription)"
        class="link-current-role"
        v-text="$gettext(currentLinkRoleLabel)"
      />
    </p>
    <oc-checkbox
      v-if="isRunningOnEos && isUploaderLink"
      :model-value="currentLinkNotifyUploads"
      :label="$gettext('Notify me about uploads')"
      @input="toggleNotifyUploads"
    />
    <div :class="{ 'oc-pr-s': !isModifiable }" class="details-buttons">
      <oc-button
        v-if="linkShare.indirect"
        v-oc-tooltip="viaTooltip"
        :area-label="viaTooltip"
        type="router-link"
        class="oc-files-file-link-via"
        appearance="raw"
        :to="viaRouterParams"
      >
        <oc-icon name="folder-shared" fill-type="line" />
      </oc-button>
      <oc-icon
        v-if="linkShare.hasPassword"
        v-oc-tooltip="passwortProtectionTooltip"
        name="lock-password"
        class="oc-files-file-link-has-password"
        fill-type="line"
        :aria-label="passwortProtectionTooltip"
      />
      <oc-icon
        v-if="linkShare.expirationDateTime"
        v-oc-tooltip="expirationDateTooltip"
        class="oc-files-public-link-expires oc-ml-xs"
        :data-testid="`files-link-id-${linkShare.id}-expiration-date`"
        :aria-label="expirationDateTooltip"
        name="calendar-event"
        fill-type="line"
      />
      <oc-icon
        v-if="isRunningOnEos && currentLinkNotifyUploadsExtraRecipients"
        v-oc-tooltip="$gettext('Uploads will be notified to a third party')"
        :aria-label="$gettext('Uploads will be notified to a third party')"
        name="mail-add"
        fill-type="line"
      />
      <div v-if="isModifiable">
        <oc-button
          :id="`edit-public-link-dropdown-toggl-${linkShare.id}`"
          :aria-label="$gettext('More options')"
          appearance="raw"
          class="edit-drop-trigger"
          :data-testid="`files-link-id-${linkShare.id}-btn-edit`"
        >
          <oc-icon name="more-2" />
        </oc-button>
        <oc-drop
          ref="editPublicLinkDropdown"
          :drop-id="`edit-public-link-dropdown`"
          :toggle="`#edit-public-link-dropdown-toggl-${linkShare.id}`"
          padding-size="small"
          mode="click"
        >
          <oc-list
            v-if="editOptions.length > 0"
            class="edit-public-link-dropdown-menu oc-pb-s oc-files-context-actions-border"
          >
            <li
              v-for="(option, i) in editOptions"
              :key="`public-link-edit-option-${i}`"
              class="oc-rounded oc-menu-item-hover"
            >
              <oc-datepicker
                v-if="option.showDatepicker"
                v-model="newExpiration"
                class="link-expiry-picker oc-flex oc-width-1-1"
                :min-date="expirationRules.min"
                :max-date="expirationRules.max"
                :locale="$language.current"
                :is-required="expirationRules.enforced"
              >
                <template #default="{ togglePopover }">
                  <oc-button
                    :data-testid="`files-link-id-${linkShare.id}-edit-${option.id}`"
                    appearance="raw"
                    class="oc-p-s action-menu-item"
                    :variation="option.variation"
                    @click="togglePopover"
                  >
                    <oc-icon :name="option.icon" fill-type="line" size="medium" />
                    <span v-text="option.title" />
                  </oc-button>
                  <oc-button
                    v-if="option.remove && option.remove.isRemovable"
                    :data-testid="`files-link-id-${linkShare.id}-edit-${option.id}`"
                    :aria-label="option.remove.title"
                    appearance="raw"
                    @click="option.remove.method"
                  >
                    <oc-icon :name="option.remove.icon" />
                  </oc-button>
                </template>
              </oc-datepicker>
              <oc-button
                v-else
                appearance="raw"
                class="oc-p-s action-menu-item"
                :data-testid="`files-link-id-${linkShare.id}-edit-${option.id}`"
                @click="option.method"
              >
                <oc-icon :name="option.icon" fill-type="line" size="medium" />
                <span v-text="option.title" />
              </oc-button>
            </li>
          </oc-list>
          <oc-list
            class="edit-public-link-dropdown-menu"
            :class="{ 'oc-pt-s': editOptions.length > 0 }"
          >
            <li class="oc-rounded oc-menu-item-hover">
              <oc-button
                appearance="raw"
                class="oc-p-s action-menu-item"
                :data-testid="`files-link-id-${linkShare.id}-edit-${deleteOption.id}`"
                @click="deleteOption.method"
              >
                <oc-icon :name="deleteOption.icon" fill-type="line" size="medium" />
                <span v-text="deleteOption.title" />
              </oc-button>
            </li>
          </oc-list>
        </oc-drop>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { basename } from 'path'
import { DateTime } from 'luxon'
import * as EmailValidator from 'email-validator'
import {
  createLocationSpaces,
  LinkRoleDropdown,
  useAbility,
  useConfigStore,
  useGetMatchingSpace,
  useLinkTypes,
  useModals,
  useResourcesStore
} from '@ownclouders/web-pkg'
import { LinkShare, ShareTypes } from '@ownclouders/web-client'
import { computed, defineComponent, inject, PropType, Ref, ref, unref } from 'vue'
import { formatDateFromDateTime, formatRelativeDateFromDateTime } from '@ownclouders/web-pkg'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { createFileRouteOptions } from '@ownclouders/web-pkg'
import { OcDrop } from 'design-system/src/components'
import { usePasswordPolicyService, ExpirationRules } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import SetLinkPasswordModal from '../../../Modals/SetLinkPasswordModal.vue'
import { storeToRefs } from 'pinia'
import { SharingLinkType } from '@ownclouders/web-client/graph/generated'

type EditOption = {
  id: string
  title: string
  icon: string
  method: () => void
  variation?: string
  remove?: any
  showDatepicker?: boolean
}

export default defineComponent({
  name: 'DetailsAndEdit',
  components: { LinkRoleDropdown },
  props: {
    canRename: {
      type: Boolean,
      default: false
    },
    expirationRules: {
      type: Object as PropType<ExpirationRules>,
      required: true
    },
    isFolderShare: {
      type: Boolean,
      default: false
    },
    isModifiable: {
      type: Boolean,
      default: false
    },
    isPasswordEnforced: {
      type: Boolean,
      default: false
    },
    isPasswordRemovable: {
      type: Boolean,
      default: false
    },
    linkShare: {
      type: Object as PropType<LinkShare>,
      required: true
    }
  },
  emits: ['removePublicLink', 'updateLink'],
  setup(props, { emit }) {
    const { dispatchModal } = useModals()
    const { $gettext, current } = useGettext()
    const configStore = useConfigStore()
    const passwordPolicyService = usePasswordPolicyService()
    const { can } = useAbility()
    const { getMatchingSpace } = useGetMatchingSpace()
    const { getAvailableLinkTypes, getLinkRoleByType, isPasswordEnforcedForLinkType } =
      useLinkTypes()

    const resourcesStore = useResourcesStore()
    const { ancestorMetaData } = storeToRefs(resourcesStore)

    const space = inject<Ref<SpaceResource>>('space')
    const resource = inject<Ref<Resource>>('resource')

    const currentLinkType = ref<SharingLinkType>(props.linkShare.type)

    const canDeleteReadOnlyPublicLinkPassword = computed(() =>
      can('delete-all', 'ReadOnlyPublicLinkPassword')
    )

    const dateExpire = computed(() => {
      return formatDateFromDateTime(
        DateTime.fromISO(props.linkShare.expirationDateTime).endOf('day'),
        current
      )
    })

    const updateSelectedType = (type: SharingLinkType) => {
      currentLinkType.value = type
      const linkShare = props.linkShare
      linkShare.type = type

      const needsNoPw =
        type === SharingLinkType.Internal ||
        (unref(canDeleteReadOnlyPublicLinkPassword) && type === SharingLinkType.View)

      if (!linkShare.hasPassword && !needsNoPw && isPasswordEnforcedForLinkType(type)) {
        showPasswordModal(() => emit('updateLink', { linkShare: { ...linkShare, type } }))
        return
      }

      emit('updateLink', { linkShare })
    }

    const showPasswordModal = (callbackFn: () => void = undefined) => {
      dispatchModal({
        title: props.linkShare.hasPassword ? $gettext('Edit password') : $gettext('Add password'),
        customComponent: SetLinkPasswordModal,
        customComponentAttrs: () => ({
          space: unref(space),
          resource: unref(resource),
          link: props.linkShare,
          ...(callbackFn && { callbackFn })
        })
      })
    }

    const availableLinkTypeOptions = computed(() =>
      getAvailableLinkTypes({ isFolder: props.isFolderShare })
    )

    const isAliasLink = computed(() => {
      return props.linkShare.type === SharingLinkType.Internal
    })

    const isUploaderLink = computed(() => {
      return props.linkShare.type === SharingLinkType.Upload
    })

    const currentLinkRoleDescription = computed(() => {
      return getLinkRoleByType(unref(currentLinkType))?.description || ''
    })

    const currentLinkRoleLabel = computed(() => {
      return getLinkRoleByType(unref(currentLinkType))?.label || ''
    })

    const sharedAncestor = computed(() => {
      const ancestorPath = Object.keys(unref(ancestorMetaData)).find((key) =>
        unref(ancestorMetaData)[key].shareTypes.includes(ShareTypes.link.value)
      )
      return ancestorPath ? unref(ancestorMetaData)[ancestorPath] : undefined
    })

    const viaRouterParams = computed(() => {
      const matchingSpace = getMatchingSpace(unref(resource))
      if (!matchingSpace || !unref(sharedAncestor)) {
        return {}
      }

      return createLocationSpaces(
        'files-spaces-generic',
        createFileRouteOptions(matchingSpace, {
          path: unref(sharedAncestor).path,
          fileId: unref(sharedAncestor).id
        })
      )
    })

    const viaTooltip = computed(() => {
      if (!props.linkShare.indirect || !unref(sharedAncestor)) {
        return null
      }

      return $gettext('Navigate to the parent (%{folderName})', {
        folderName: basename(unref(sharedAncestor).path)
      })
    })

    return {
      space,
      passwordPolicyService,
      dateExpire,
      updateSelectedType,
      currentLinkType,
      isRunningOnEos: computed(() => configStore.options.isRunningOnEos),
      showPasswordModal,
      dispatchModal,
      availableLinkTypeOptions,
      getLinkRoleByType,
      isAliasLink,
      isUploaderLink,
      currentLinkRoleDescription,
      currentLinkRoleLabel,
      viaRouterParams,
      viaTooltip
    }
  },
  data() {
    return {
      newExpiration: this.linkShare.expirationDateTime
    }
  },
  computed: {
    editOptions(): EditOption[] {
      const result: EditOption[] = []

      if (this.canRename) {
        result.push({
          id: 'rename',
          title: this.$gettext('Rename'),
          icon: 'pencil',
          method: this.showRenameModal
        })
      }

      if (this.linkShare.expirationDateTime) {
        result.push({
          id: 'edit-expiration',
          title: this.$gettext('Expires %{expires}', { expires: this.expirationDateRelative }),
          method: () => {
            this.$emit('updateLink', {
              linkShare: { ...this.linkShare, expirationDateTime: this.dateExpire }
            })
          },
          icon: 'calendar-event',
          showDatepicker: true,
          remove: {
            id: 'remove-expiration',
            title: this.$gettext('Remove expiration date'),
            icon: 'close',
            isRemovable: !this.expirationRules.enforced,
            method: () =>
              this.$emit('updateLink', {
                linkShare: { ...this.linkShare, expirationDateTime: null }
              })
          }
        })
      } else if (!this.isAliasLink) {
        result.push({
          id: 'add-expiration',
          title: this.$gettext('Set expiration date'),
          method: () => {
            this.$emit('updateLink', {
              linkShare: { ...this.linkShare, expirationDateTime: this.dateExpire }
            })
          },
          icon: 'calendar-event',
          showDatepicker: true
        })
      }

      if (this.linkShare.hasPassword) {
        result.push({
          id: 'edit-password',
          title: this.$gettext('Edit password'),
          icon: 'lock-password',
          method: () => this.showPasswordModal()
        })

        if (this.isPasswordRemovable) {
          result.push({
            id: 'remove-password',
            title: this.$gettext('Remove password'),
            icon: 'lock-unlock',
            method: () => this.$emit('updateLink', { linkShare: this.linkShare, password: '' })
          })
        }
      }
      if (!this.linkShare.hasPassword && !this.isAliasLink) {
        result.push({
          id: 'add-password',
          title: this.$gettext('Add password'),
          icon: 'lock-password',
          method: () => this.showPasswordModal()
        })
      }

      // FIXME cern code
      // if (this.isCurrentLinkRoleUploader && this.currentLinkNotifyUploads) {
      //   result.push({
      //     id: 'add-notify-uploads-extra-recipients',
      //     title: this.notifyUploadsExtraRecipientsMenuEntry,
      //     icon: 'mail-add',
      //     method: this.showNotifyUploadsExtraRecipientsModal
      //   })
      // }
      // if (this.currentLinkNotifyUploadsExtraRecipients) {
      //   result.push({
      //     id: 'remove-notify-uploads-extra-recipients',
      //     title: this.$gettext('Remove third party notification'),
      //     icon: 'mail-close',
      //     method: () =>
      //       this.updateLink({
      //         link: {
      //           ...this.linkShare,
      //           notifyUploadsExtraRecipients: ''
      //         }
      //       })
      //   })
      // }

      return result
    },

    deleteOption(): EditOption {
      return {
        id: 'delete',
        title: this.$gettext('Delete link'),
        method: this.deleteLink,
        icon: 'delete-bin-5',
        variation: 'danger'
      }
    },

    expirationDateRelative() {
      return formatRelativeDateFromDateTime(
        DateTime.fromISO(this.linkShare.expirationDateTime).endOf('day'),
        this.$language.current
      )
    },

    expirationDateTooltip() {
      return this.$gettext(
        'Expires %{timeToExpiry} (%{expiryDate})',
        { timeToExpiry: this.expirationDateRelative, expiryDate: this.dateExpire },
        true
      )
    },

    passwortProtectionTooltip() {
      return this.$gettext('This link is password-protected')
    },

    currentLinkNotifyUploads() {
      // FIXME cern code
      return undefined
    },
    currentLinkNotifyUploadsExtraRecipients() {
      // FIXME cern code
      return undefined
    },
    notifyUploadsExtraRecipientsMenuEntry() {
      if (this.currentLinkNotifyUploadsExtraRecipients) {
        return this.$gettext('Edit third party notification')
      }
      return this.$gettext('Notify a third party about uploads')
    }
  },
  watch: {
    newExpiration(expirationDateTime: string) {
      const date = DateTime.fromJSDate(new Date(expirationDateTime))
      this.$emit('updateLink', {
        linkShare: { ...this.linkShare, expirationDateTime: date.toString() }
      })
    }
  },
  methods: {
    deleteLink() {
      this.$emit('removePublicLink', { link: this.linkShare })
      ;(this.$refs.editPublicLinkDropdown as InstanceType<typeof OcDrop>).hide()
    },
    showRenameModal() {
      this.dispatchModal({
        title: this.$gettext('Edit name'),
        confirmText: this.$gettext('Save'),
        hasInput: true,
        inputValue: this.linkShare.displayName,
        inputLabel: this.$gettext('Link name'),
        onInput: (name, setError) => {
          if (name.length > 255) {
            return setError(this.$gettext('Link name cannot exceed 255 characters'))
          }
          return setError(null)
        },
        onConfirm: (displayName: string) => {
          const linkShare = this.linkShare
          linkShare.displayName = displayName
          this.$emit('updateLink', { linkShare })
        }
      })
    },

    toggleNotifyUploads() {
      if (this.currentLinkNotifyUploads) {
        this.$emit('updateLink', {
          link: { ...this.linkShare, notifyUploads: false, notifyUploadsExtraRecipients: '' }
        })
      } else {
        this.$emit('updateLink', { linkShare: { ...this.linkShare, notifyUploads: true } })
      }
    },
    showNotifyUploadsExtraRecipientsModal() {
      this.dispatchModal({
        icon: 'mail-add',
        title: this.$gettext('Notify a third party about uploads'),
        confirmText: this.$gettext('Apply'),
        hasInput: true,
        inputDescription: this.$gettext(
          'When a file is uploaded, this address will be notified as well.'
        ),
        inputValue: this.currentLinkNotifyUploadsExtraRecipients,
        inputLabel: this.$gettext('Email address'),
        inputType: 'email',
        onInput: (value, setError) => setError(this.getEmailValidationMsg(value)),
        onConfirm: () => {
          this.$emit('updateLink', { linkShare: { ...this.linkShare } })
        }
      })
    },
    getEmailValidationMsg(email: string) {
      if (!EmailValidator.validate(email)) {
        return this.$gettext('Email is invalid')
      }
      if (email === '') {
        return this.$gettext("Email can't be empty")
      }
      return null
    }
  }
})
</script>

<style lang="scss" scoped>
.details-buttons {
  min-width: 5rem !important;
  display: flex;
  justify-content: flex-end;
}

.edit-public-link-dropdown-menu {
  .action-menu-item {
    width: 100%;
    justify-content: flex-start;
  }
}

.oc-files-public-link-expires {
  margin-top: 1px; // to align with the other elements
}
</style>
