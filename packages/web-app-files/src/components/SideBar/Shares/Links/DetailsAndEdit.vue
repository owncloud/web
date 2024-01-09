<template>
  <div class="link-details oc-flex oc-flex-between oc-flex-middle">
    <div v-if="isModifiable">
      <link-role-dropdown
        :model-value="currentLinkRole"
        :available-role-options="availableRoleOptions"
        drop-offset="0"
        @update:model-value="updateSelectedRole"
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
      v-if="isRunningOnEos && isCurrentLinkRoleUploader()"
      :model-value="currentLinkNotifyUploads"
      :label="$gettext('Notify me about uploads')"
      @input="toggleNotifyUploads"
    />
    <div :class="{ 'oc-pr-s': !isModifiable }" class="details-buttons">
      <oc-button
        v-if="link.indirect"
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
        v-if="link.password"
        v-oc-tooltip="passwortProtectionTooltip"
        name="lock-password"
        fill-type="line"
        :aria-label="passwortProtectionTooltip"
      />
      <oc-icon
        v-if="link.expiration"
        v-oc-tooltip="expirationDateTooltip"
        class="oc-files-public-link-expires oc-ml-xs"
        :data-testid="`files-link-id-${link.id}-expiration-date`"
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
          :id="`edit-public-link-dropdown-toggl-${link.id}`"
          appearance="raw"
          class="edit-drop-trigger"
          :data-testid="`files-link-id-${link.id}-btn-edit`"
        >
          <oc-icon name="more-2" />
        </oc-button>
        <oc-drop
          ref="editPublicLinkDropdown"
          :drop-id="`edit-public-link-dropdown`"
          :toggle="`#edit-public-link-dropdown-toggl-${link.id}`"
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
                    :data-testid="`files-link-id-${link.id}-edit-${option.id}`"
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
                    :data-testid="`files-link-id-${link.id}-edit-${option.id}`"
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
                :data-testid="`files-link-id-${link.id}-edit-${option.id}`"
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
                :data-testid="`files-link-id-${link.id}-edit-${deleteOption.id}`"
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
  useConfigurationManager,
  LinkRoleDropdown,
  useModals,
  useSpacesStore
} from '@ownclouders/web-pkg'
import {
  linkRoleInternalFile,
  linkRoleInternalFolder,
  linkRoleUploaderFolder,
  LinkShareRoles,
  ShareRole
} from '@ownclouders/web-client/src/helpers/share'
import { computed, defineComponent, inject, PropType, Ref, ref } from 'vue'
import { formatDateFromDateTime, formatRelativeDateFromDateTime } from '@ownclouders/web-pkg'
import { Resource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { createFileRouteOptions } from '@ownclouders/web-pkg'
import { OcDrop } from 'design-system/src/components'
import { usePasswordPolicyService, ExpirationRules } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import SetLinkPasswordModal from '../../../Modals/SetLinkPasswordModal.vue'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'DetailsAndEdit',
  components: { LinkRoleDropdown },
  props: {
    availableRoleOptions: {
      type: Array as PropType<ShareRole[]>,
      required: true
    },
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
    link: {
      type: Object,
      required: true
    }
  },
  emits: ['removePublicLink', 'updateLink'],
  setup(props, { emit }) {
    const { dispatchModal } = useModals()
    const { $gettext, current } = useGettext()
    const configurationManager = useConfigurationManager()
    const passwordPolicyService = usePasswordPolicyService()
    const spacesStore = useSpacesStore()
    const { spaces } = storeToRefs(spacesStore)

    const currentLinkRole = ref<ShareRole>(
      LinkShareRoles.getByBitmask(props.link.permissions, props.isFolderShare)
    ) as Ref<ShareRole>

    const dateExpire = computed(() => {
      return formatRelativeDateFromDateTime(
        DateTime.fromISO(props.link.expiration).endOf('day'),
        current
      )
    })

    const updateLink = ({ link, onSuccess = () => {} }) => {
      link = link || props.link
      emit('updateLink', { link, onSuccess })
    }
    const updateSelectedRole = (role: ShareRole) => {
      currentLinkRole.value = role
      updateLink({
        link: { ...props.link, permissions: role.bitmask(false) }
      })
    }

    const showPasswordModal = () => {
      dispatchModal({
        title: props.link.password ? $gettext('Edit password') : $gettext('Add password'),
        customComponent: SetLinkPasswordModal,
        customComponentAttrs: () => ({ link: props.link })
      })
    }

    return {
      space: inject<Ref<SpaceResource>>('space'),
      resource: inject<Ref<Resource>>('resource'),
      spaces,
      passwordPolicyService,
      dateExpire,
      updateLink,
      updateSelectedRole,
      currentLinkRole,
      isRunningOnEos: computed(() => configurationManager.options.isRunningOnEos),
      showPasswordModal,
      dispatchModal
    }
  },
  data() {
    return {
      newExpiration: this.link.expiration
    }
  },
  computed: {
    currentLinkRoleDescription() {
      return this.currentLinkRole?.description(false) || ''
    },

    currentLinkRoleLabel() {
      if (this.currentLinkRole?.longLabel !== '') {
        return this.$gettext(this.currentLinkRole.longLabel)
      }
      return this.$gettext(this.currentLinkRole?.label || '')
    },

    editOptions() {
      const result = []

      if (this.canRename) {
        result.push({
          id: 'rename',
          title: this.$gettext('Rename'),
          icon: 'pencil',
          method: this.showRenameModal
        })
      }

      if (this.link.expiration) {
        result.push({
          id: 'edit-expiration',
          title: this.$gettext('Expires %{expires}', { expires: this.dateExpire }),
          method: this.updateLink,
          icon: 'calendar-event',
          showDatepicker: true,
          remove: {
            id: 'remove-expiration',
            title: this.$gettext('Remove expiration date'),
            icon: 'close',
            isRemovable: !this.expirationRules.enforced,
            method: () =>
              this.updateLink({
                link: {
                  ...this.link,
                  expiration: ''
                }
              })
          }
        })
      } else if (!this.isAliasLink) {
        result.push({
          id: 'add-expiration',
          title: this.$gettext('Set expiration date'),
          method: this.updateLink,
          icon: 'calendar-event',
          showDatepicker: true
        })
      }

      if (this.link.password) {
        result.push({
          id: 'edit-password',
          title: this.$gettext('Edit password'),
          icon: 'lock-password',
          method: this.showPasswordModal
        })

        if (this.isPasswordRemovable) {
          result.push({
            id: 'remove-password',
            title: this.$gettext('Remove password'),
            icon: 'lock-unlock',
            method: () =>
              this.updateLink({
                link: {
                  ...this.link,
                  password: ''
                }
              })
          })
        }
      }
      if (!this.link.password && !this.isAliasLink) {
        result.push({
          id: 'add-password',
          title: this.$gettext('Add password'),
          icon: 'lock-password',
          method: this.showPasswordModal
        })
      }

      if (this.isCurrentLinkRoleUploader && this.currentLinkNotifyUploads) {
        result.push({
          id: 'add-notify-uploads-extra-recipients',
          title: this.notifyUploadsExtraRecipientsMenuEntry,
          icon: 'mail-add',
          method: this.showNotifyUploadsExtraRecipientsModal
        })
      }
      if (this.currentLinkNotifyUploadsExtraRecipients) {
        result.push({
          id: 'remove-notify-uploads-extra-recipients',
          title: this.$gettext('Remove third party notification'),
          icon: 'mail-close',
          method: () =>
            this.updateLink({
              link: {
                ...this.link,
                notifyUploadsExtraRecipients: ''
              }
            })
        })
      }

      return result
    },

    deleteOption() {
      return {
        id: 'delete',
        title: this.$gettext('Delete link'),
        method: this.deleteLink,
        icon: 'delete-bin-5',
        variation: 'danger'
      }
    },

    viaRouterParams() {
      const matchingSpace = (this.space ||
        this.spaces.find((space) => space.id === this.resource.storageId)) as SpaceResource
      if (!matchingSpace) {
        return {}
      }

      return createLocationSpaces(
        'files-spaces-generic',
        createFileRouteOptions(matchingSpace, {
          path: this.link.path,
          fileId: this.link.file.source
        })
      )
    },

    localExpirationDate() {
      return formatDateFromDateTime(
        DateTime.fromISO(this.link.expiration).endOf('day'),
        this.$language.current
      )
    },

    expirationDateRelative() {
      return formatRelativeDateFromDateTime(
        DateTime.fromISO(this.link.expiration).endOf('day'),
        this.$language.current
      )
    },

    expirationDateTooltip() {
      return this.$gettext(
        'Expires %{timeToExpiry} (%{expiryDate})',
        { timeToExpiry: this.expirationDateRelative, expiryDate: this.localExpirationDate },
        true
      )
    },

    viaTooltip() {
      if (!this.link.indirect) {
        return null
      }
      return (
        this.$gettext('Navigate to the parent (%{folderName})'),
        { folderName: basename(this.link.path) },
        true
      )
    },

    passwortProtectionTooltip() {
      return this.$gettext('This link is password-protected')
    },

    isAliasLink() {
      if (this.isFolderShare) {
        return parseInt(this.link.permissions) == linkRoleInternalFolder.bitmask(false)
      }
      return parseInt(this.link.permissions) == linkRoleInternalFile.bitmask(false)
    },

    currentLinkNotifyUploads() {
      return this.link.notifyUploads
    },
    currentLinkNotifyUploadsExtraRecipients() {
      return this.link.notifyUploadsExtraRecipients
    },
    notifyUploadsExtraRecipientsMenuEntry() {
      if (this.currentLinkNotifyUploadsExtraRecipients) {
        return this.$gettext('Edit third party notification')
      }
      return this.$gettext('Notify a third party about uploads')
    }
  },
  watch: {
    newExpiration(expiration) {
      this.updateLink({
        link: {
          ...this.link,
          expiration
        }
      })
    }
  },
  methods: {
    deleteLink() {
      this.$emit('removePublicLink', { link: this.link })
      ;(this.$refs.editPublicLinkDropdown as InstanceType<typeof OcDrop>).hide()
    },
    showRenameModal() {
      this.dispatchModal({
        title: this.$gettext('Edit name'),
        confirmText: this.$gettext('Save'),
        hasInput: true,
        inputValue: this.link.name,
        inputLabel: this.$gettext('Link name'),
        onInput: (name, setError) => {
          if (name.length > 255) {
            return setError(this.$gettext('Link name cannot exceed 255 characters'))
          }
          return setError(null)
        },
        onConfirm: (name: string) =>
          Promise.resolve(
            this.updateLink({
              link: {
                ...this.link,
                name
              }
            })
          )
      })
    },

    toggleNotifyUploads() {
      if (this.currentLinkNotifyUploads) {
        this.$emit('updateLink', {
          link: { ...this.link, notifyUploads: false, notifyUploadsExtraRecipients: '' }
        })
      } else {
        this.$emit('updateLink', { link: { ...this.link, notifyUploads: true } })
      }
    },
    isCurrentLinkRoleUploader() {
      return (
        LinkShareRoles.getByBitmask(parseInt(this.link.permissions), this.isFolderShare).bitmask(
          false
        ) === linkRoleUploaderFolder.bitmask(false)
      )
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
        onConfirm: (value: string) =>
          Promise.resolve(
            this.updateLink({
              link: {
                ...this.link,
                notifyUploadsExtraRecipients: value
              }
            })
          )
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
