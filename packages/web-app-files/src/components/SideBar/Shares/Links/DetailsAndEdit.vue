<template>
  <div class="link-details oc-flex oc-flex-between oc-flex-middle">
    <div v-if="isModifiable">
      <oc-button
        :id="`edit-public-link-role-dropdown-toggle-${link.id}`"
        appearance="raw"
        class="edit-public-link-role-dropdown-toggle oc-text-left"
        gap-size="none"
      >
        <span
          class="link-current-role"
          v-text="currentLinkRoleLabel || $gettext('Select a role')"
        />
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
        <oc-list class="role-dropdown-list">
          <li v-for="roleOption in availableRoleOptions" :key="`role-dropdown-${roleOption.key}`">
            <oc-button
              :id="`files-role-${roleOption.name}`"
              :class="{
                selected: isSelectedRole(roleOption),
                'oc-background-primary-gradient': isSelectedRole(roleOption)
              }"
              :appearance="isSelectedRole(roleOption) ? 'raw-inverse' : 'raw'"
              :variation="isSelectedRole(roleOption) ? 'primary' : 'passive'"
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
                <oc-icon :name="roleOption.icon" class="oc-pl-s oc-pr-m" variation="inherit" />
                <span>
                  <span
                    class="oc-text-bold oc-display-block oc-width-1-1"
                    v-text="$gettext(roleOption.label)"
                  />
                  <span class="oc-text-small">{{ $gettext(roleOption.description(false)) }}</span>
                </span>
              </span>
              <span class="oc-flex">
                <oc-icon v-if="isSelectedRole(roleOption)" name="check" variation="inherit" />
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
                class="link-expiry-picker oc-flex oc-width-1-1"
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
import { basename } from 'path'
import { DateTime } from 'luxon'
import { mapActions, mapGetters } from 'vuex'
import { createLocationSpaces } from 'web-pkg/src/router'
import {
  linkRoleInternalFile,
  linkRoleInternalFolder,
  LinkShareRoles,
  ShareRole
} from 'web-client/src/helpers/share'
import { computed, defineComponent, inject, PropType, Ref } from 'vue'
import { formatDateFromDateTime, formatRelativeDateFromDateTime } from 'web-pkg/src/helpers'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { OcDrop } from 'design-system/src/components'
import { usePasswordPolicyService } from 'web-pkg/src/composables/passwordPolicyService'
import { useGettext } from 'vue3-gettext'

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
  setup(props) {
    const { current } = useGettext()
    const passwordPolicyService = usePasswordPolicyService()
    const dateExpire = computed(() => {
      return formatRelativeDateFromDateTime(
        DateTime.fromISO(props.link.expiration).endOf('day'),
        current
      )
    })

    return {
      space: inject<Ref<SpaceResource>>('space'),
      resource: inject<Ref<Resource>>('resource'),
      passwordPolicyService,
      dateExpire
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
            isRemovable: !this.expirationDate.enforced,
            method: () =>
              this.updateLink({
                link: {
                  ...this.link,
                  expiration: ''
                }
              })
          }
        })
      } else {
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
      return [linkRoleInternalFolder, linkRoleInternalFile].includes(this.currentLinkRole)
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
    ...mapActions([
      'createModal',
      'hideModal',
      'setModalInputErrorMessage',
      'setModalConfirmButtonDisabled'
    ]),

    isSelectedRole(role: ShareRole) {
      return this.link.permissions === role.bitmask(false)
    },
    updateLink({ link, dropRef = undefined, onSuccess = () => {} }) {
      link = link || this.link
      dropRef = dropRef || this.$refs.editPublicLinkDropdown
      dropRef.hide()
      this.$emit('updateLink', { link, onSuccess })
    },
    deleteLink() {
      this.$emit('removePublicLink', { link: this.link })
      ;(this.$refs.editPublicLinkDropdown as InstanceType<typeof OcDrop>).hide()
    },
    checkInputValue(value) {
      if (value.length > 255) {
        return this.setModalInputErrorMessage(
          this.$gettext('Link name cannot exceed 255 characters')
        )
      }
      this.setModalInputErrorMessage(null)
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
        onInput: this.checkInputValue,
        onConfirm: (name) =>
          this.updateLink({
            link: {
              ...this.link,
              name
            }
          })
      }

      this.createModal(modal)
    },

    showPasswordModal() {
      const modal = {
        variation: 'passive',
        title: this.link.password ? this.$gettext('Edit password') : this.$gettext('Add password'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.link.password ? this.$gettext('Apply') : this.$gettext('Set'),
        hasInput: true,
        confirmDisabled: true,
        inputLabel: this.$gettext('Password'),
        inputPasswordPolicy: this.passwordPolicyService.getPolicy(),
        inputGeneratePasswordMethod: () => this.passwordPolicyService.generatePassword(),
        inputPlaceholder: this.link.password ? '●●●●●●●●' : null,
        inputType: 'password',
        onCancel: this.hideModal,
        onInput: () => this.setModalInputErrorMessage(''),
        onPasswordChallengeCompleted: () => this.setModalConfirmButtonDisabled(false),
        onPasswordChallengeFailed: () => this.setModalConfirmButtonDisabled(true),
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

@media (max-width: $oc-breakpoint-medium-default) {
  .edit-public-link-role-dropdown {
    width: 100%;
  }
}
@media (min-width: $oc-breakpoint-medium-default) {
  .edit-public-link-role-dropdown {
    width: 400px;
  }
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
