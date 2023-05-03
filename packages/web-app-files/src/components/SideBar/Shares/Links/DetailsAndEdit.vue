<template>
  <div class="link-details oc-flex oc-flex-between oc-flex-middle oc-pl-s">
    <div v-if="isModifiable">
      <oc-button
        :id="`edit-public-link-role-dropdown-toggle-${link.id}`"
        appearance="raw"
        class="edit-public-link-role-dropdown-toggle oc-text-left"
        gap-size="none"
      >
        <span class="link-current-role" v-text="$gettext(currentLinkRoleLabel)" />
        <oc-icon name="arrow-down-s" />
      </oc-button>
      <oc-drop
        ref="editPublicLinkRoleDropdown"
        class="edit-public-link-role-dropdown"
        :drop-id="`edit-public-link-role-dropdown`"
        :toggle="`#edit-public-link-role-dropdown-toggle-${link.id}`"
        padding-size="small"
        offset="0"
        mode="click"
      >
        <oc-list class="roleDropdownList">
          <li
            v-for="roleOption in availableRoleOptions"
            :key="`role-dropdown-${roleOption.label.toLowerCase()}`"
          >
            <oc-button
              :id="`files-role-${roleOption.label.toLowerCase()}`"
              :class="{
                selected: link.permissions === roleOption.bitmask(false),
                'oc-background-primary-gradient': link.permissions === roleOption.bitmask(false)
              }"
              appearance="raw"
              :variation="link.permissions === roleOption.bitmask(false) ? 'inverse' : 'passive'"
              justify-content="space-between"
              class="oc-p-s"
              @click="
                updateLink({
                  link: {
                    ...link,
                    permissions: roleOption.bitmask(false)
                  },
                  dropRef: $refs.editPublicLinkRoleDropdown
                })
              "
            >
              <span class="oc-flex oc-flex-middle">
                <oc-icon :name="roleOption.icon" class="oc-pl-s oc-pr-m" />
                <span>
                  <span
                    class="oc-text-bold oc-display-block oc-width-1-1"
                    v-text="$gettext(roleOption.label)"
                  />
                  <span class="oc-text-small">{{ $gettext(roleOption.description(false)) }}</span>
                </span>
              </span>
              <span class="oc-flex">
                <oc-icon v-if="link.permissions === roleOption.bitmask(false)" name="check" />
              </span>
            </oc-button>
          </li>
        </oc-list>
      </oc-drop>
    </div>
    <p v-else class="oc-my-rm">
      <span
        v-oc-tooltip="$gettext(currentLinkRoleDescription)"
        class="link-current-role"
        v-text="$gettext(currentLinkRoleLabel)"
      />
    </p>
    <oc-checkbox
      v-if="hasNotifications && isCurrentLinkRoleUploader()"
      :model-value="currentLinkNotifyUploads"
      :label="notifyUploadsLabel"
      @input="toggleNotifyUploads()"
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
        class="oc-files-public-link-expires"
        :data-testid="`files-link-id-${link.id}-expiration-date`"
        :aria-label="expirationDateTooltip"
        name="calendar-event"
        fill-type="line"
      />
      <oc-icon
        v-if="currentLinkNotifyUploadsExtraRecipients"
        v-oc-tooltip="notifyUploadsExtraRecipientsTooltip"
        :aria-label="notifyUploadsExtraRecipientsTooltip"
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
          <oc-list class="edit-public-link-dropdown-menu oc-files-context-actions-border oc-pb-s">
            <li
              v-for="(option, i) in editOptions"
              :key="`public-link-edit-option-${i}`"
              class="oc-rounded oc-menu-item-hover"
            >
              <oc-datepicker
                v-if="option.showDatepicker"
                v-model="newExpiration"
                class="link-expiry-picker"
                :min-date="expirationDate.min"
                :max-date="expirationDate.max"
                :locale="$language.current"
                :is-required="expirationDate.enforce"
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
          <oc-list class="edit-public-link-dropdown-menu oc-pt-s">
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
import * as EmailValidator from 'email-validator'
import { basename } from 'path'
import { DateTime } from 'luxon'
import { mapActions, mapGetters } from 'vuex'
import { createLocationSpaces } from '../../../../router'
import {
  linkRoleInternalFile,
  linkRoleInternalFolder,
  linkRoleUploaderFolder,
  LinkShareRoles,
  ShareRole
} from 'web-client/src/helpers/share'
import { defineComponent, inject, PropType } from 'vue'
import { formatDateFromDateTime, formatRelativeDateFromDateTime } from 'web-pkg/src/helpers'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import { useCapabilityGroupBasedCapabilities } from 'web-pkg/src/composables'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'

export default defineComponent({
  name: 'DetailsAndEdit',
  props: {
    availableRoleOptions: {
      type: Array as PropType<ShareRole[]>,
      required: true
    },
    canRename: {
      type: Boolean,
      default: false
    },
    expirationDate: {
      type: Object,
      default: () => ({}),
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
    link: {
      type: Object,
      required: true
    }
  },
  emits: ['removePublicLink', 'updateLink'],
  setup() {
    return {
      space: inject<Resource>('space'),
      resource: inject<Resource>('resource'),
      hasNotifications: useCapabilityGroupBasedCapabilities().value.includes('notifications')
    }
  },
  data() {
    return {
      newExpiration: this.link.expiration
    }
  },
  computed: {
    ...mapGetters('runtime/spaces', ['spaces']),
    currentLinkRole() {
      return LinkShareRoles.getByBitmask(this.link.permissions, this.isFolderShare)
    },
    currentLinkRoleDescription() {
      return this.currentLinkRole.description(false)
    },

    currentLinkRoleLabel() {
      return this.currentLinkRole.label
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
          title: this.$gettext('Edit expiration date'),
          method: this.updateLink,
          icon: 'calendar-event',
          showDatepicker: true
        })
        if (!this.expirationDate.enforced) {
          result.push({
            id: 'remove-expiration',
            title: this.$gettext('Remove expiration date'),
            icon: 'calendar',
            method: () =>
              this.updateLink({
                link: {
                  ...this.link,
                  expiration: ''
                }
              })
          })
        }
      } else {
        result.push({
          id: 'add-expiration',
          title: this.$gettext('Add expiration date'),
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

        if (!this.isPasswordEnforced) {
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
      if (!this.isPasswordEnforced && !this.link.password && !this.isAliasLink) {
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
      return this.$gettextInterpolate(
        this.$gettext('Expires in %{timeToExpiry} (%{expiryDate})'),
        { timeToExpiry: this.expirationDateRelative, expiryDate: this.localExpirationDate },
        true
      )
    },

    viaTooltip() {
      if (!this.link.indirect) {
        return null
      }
      return this.$gettextInterpolate(
        this.$gettext('Navigate to the parent (%{folderName})'),
        { folderName: basename(this.link.path) },
        true
      )
    },

    passwortProtectionTooltip() {
      return this.$gettext('This link is password-protected')
    },

    isAliasLink() {
      return [linkRoleInternalFolder, linkRoleInternalFile].includes(this.currentLinkRole)
    },

    currentLinkNotifyUploads() {
      return this.link.notifyUploads
    },
    currentLinkNotifyUploadsExtraRecipients() {
      return this.link.notifyUploadsExtraRecipients
    },
    notifyUploadsLabel() {
      return this.$gettext('Notify me about uploads')
    },
    notifyUploadsExtraRecipientsTooltip() {
      return this.$gettext('Uploads will be notified to a third party')
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
    ...mapActions(['createModal', 'hideModal', 'setModalInputErrorMessage']),

    updateLink({
      link = this.link,
      dropRef = this.$refs.editPublicLinkDropdown,
      onSuccess = () => {}
    }) {
      this.$emit('updateLink', { link, onSuccess })
      dropRef.hide()
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
    deleteLink() {
      this.$emit('removePublicLink', { link: this.link })
      this.$refs.editPublicLinkDropdown.hide()
    },
    showRenameModal() {
      const modal = {
        variation: 'passive',
        title: this.$gettext('Edit name'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Save'),
        hasInput: true,
        inputValue: this.link.name,
        inputLabel: this.$gettext('Link name'),
        onCancel: this.hideModal,
        onConfirm: (name) =>
          this.updateLink({
            link: {
              ...this.link,
              name
            },
            onSuccess: () => {
              this.hideModal()
            }
          })
      }

      this.createModal(modal)
    },

    checkPasswordNotEmpty(password) {
      if (password === '') {
        return this.setModalInputErrorMessage(this.$gettext("Password can't be empty"))
      }
      return this.setModalInputErrorMessage(null)
    },

    showPasswordModal() {
      const modal = {
        variation: 'passive',
        title: this.link.password ? this.$gettext('Edit password') : this.$gettext('Add password'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.link.password ? this.$gettext('Apply') : this.$gettext('Set'),
        hasInput: true,
        inputDescription: this.$gettext("Password can't be empty"),
        inputLabel: this.$gettext('Password'),
        inputType: 'password',
        onCancel: this.hideModal,
        onInput: (password) => this.checkPasswordNotEmpty(password),
        onConfirm: (password) => {
          this.updateLink({
            link: {
              ...this.link,
              password
            },
            onSuccess: () => {
              this.hideModal()
            }
          })
        }
      }

      this.createModal(modal)
    },

    showNotifyUploadsExtraRecipientsModal() {
      const modal = {
        variation: 'passive',
        icon: 'mail-add',
        title: this.$gettext('Notify a third party about uploads'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Apply'),
        hasInput: true,
        inputDescription: this.$gettext(
          'When a file is uploaded, this address will be notified as well.'
        ),
        inputValue: this.currentLinkNotifyUploadsExtraRecipients,
        inputLabel: this.$gettext('Email address'),
        inputType: 'email',
        onCancel: this.hideModal,
        onInput: (value) => this.checkEmailValid(value),
        onConfirm: (value) => {
          this.updateLink({
            link: {
              ...this.link,
              notifyUploadsExtraRecipients: value
            },
            onSuccess: () => {
              this.hideModal()
            }
          })
        }
      }

      this.createModal(modal)
    },

    checkEmailValid(email) {
      if (!EmailValidator.validate(email)) {
        return this.setModalInputErrorMessage(this.$gettext('Email is invalid'))
      }

      if (email === '') {
        return this.setModalInputErrorMessage(this.$gettext("Email can't be empty"))
      }

      return this.setModalInputErrorMessage(null)
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

.edit-public-link-role-dropdown {
  width: 400px;
}

.roleDropdownList span {
  line-height: 1.3;
}

.roleDropdownList li {
  margin: var(--oc-space-xsmall) 0;

  .oc-button {
    text-align: left;
    width: 100%;
    gap: var(--oc-space-medium);

    &:hover,
    &:focus {
      background-color: var(--oc-color-background-hover);
      color: var(--oc-color-swatch-passive-default);
      text-decoration: none;
    }

    &.selected {
      color: var(--oc-color-swatch-inverse-default) !important;

      ::v-deep .oc-icon > svg {
        fill: var(--oc-color-swatch-inverse-default) !important;
      }
    }
  }
}

.edit-public-link-dropdown-menu {
  .action-menu-item {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
