<template>
  <div class="link-details oc-flex oc-flex-between oc-flex-middle oc-pl-s">
    <div v-if="isModifiable">
      <oc-button
        :id="`edit-public-link-role-dropdown-toggl-${link.id}`"
        appearance="raw"
        class="edit-public-link-role-dropdown-toggl oc-text-left"
        gap-size="none"
      >
        <span class="oc-invisible-sr" v-text="currentLinkRoleLabel" />
        <span v-text="visibilityHint" />
        <oc-icon name="arrow-down-s" />
      </oc-button>
      <oc-drop
        ref="editPublicLinkRoleDropdown"
        :drop-id="`edit-public-link-role-dropdown`"
        :toggle="`#edit-public-link-role-dropdown-toggl-${link.id}`"
        padding-size="remove"
        mode="click"
      >
        <oc-list class="roleDropdownList">
          <li
            v-for="roleOption in availableRoleOptions"
            :key="`role-dropdown-${roleOption.label.toLowerCase()}`"
          >
            <oc-button
              :id="`files-role-${roleOption.label.toLowerCase()}`"
              :class="{ selected: parseInt(link.permissions) === roleOption.bitmask(false) }"
              appearance="raw"
              justify-content="space-between"
              class="oc-py-xs oc-px-s"
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
              <span>
                <span
                  class="oc-text-bold oc-display-block oc-width-1-1"
                  v-text="roleOption.label"
                />
                <span>{{ roleOption.description() }}</span>
              </span>
              <oc-icon
                v-if="parseInt(link.permissions) === roleOption.bitmask(false)"
                name="check"
              />
            </oc-button>
          </li>
        </oc-list>
      </oc-drop>
    </div>
    <p v-else class="oc-my-rm">
      <span class="oc-invisible-sr" v-text="currentLinkRoleLabel" />
      <span v-text="visibilityHint" />
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
        class="oc-files-public-link-expires"
        :data-testid="`files-link-id-${link.id}-expiration-date`"
        :aria-label="expirationDateTooltip"
        name="calendar"
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
          mode="click"
        >
          <oc-list>
            <li v-for="(option, i) in editOptions" :key="`public-link-edit-option-${i}`">
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
                    :variation="option.variation"
                    @click="togglePopover"
                    v-text="option.title"
                  />
                </template>
              </oc-datepicker>
              <oc-button
                v-else
                appearance="raw"
                :data-testid="`files-link-id-${link.id}-edit-${option.id}`"
                :variation="option.variation"
                @click="option.method"
                v-text="option.title"
              />
            </li>
          </oc-list>
        </oc-drop>
      </div>
    </div>
  </div>
</template>

<script>
import { basename } from 'path'
import { DateTime } from 'luxon'
import { mapActions } from 'vuex'
import Mixins from '../../../../mixins'
import { createLocationSpaces, isLocationSpacesActive } from '../../../../router'
import { LinkShareRoles } from '../../../../helpers/share'

export default {
  name: 'DetailsAndEdit',
  mixins: [Mixins],
  props: {
    availableRoleOptions: {
      type: Array,
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
  data() {
    return {
      newExpiration: this.link.expiration
    }
  },
  computed: {
    visibilityHint() {
      return LinkShareRoles.getByBitmask(
        parseInt(this.link.permissions),
        this.isFolderShare
      ).description()
    },

    currentLinkRoleLabel() {
      return LinkShareRoles.getByBitmask(parseInt(this.link.permissions), this.isFolderShare).label
    },

    editButtonLabel() {
      return this.$gettext('Edit link')
    },

    editOptions() {
      const result = []

      if (this.canRename) {
        result.push({
          id: 'rename',
          title: this.$gettext('Rename'),
          method: this.showRenameModal
        })
      }

      if (this.link.expiration) {
        result.push({
          id: 'edit-expiration',
          title: this.$gettext('Edit expiration date'),
          method: this.updateLink,
          showDatepicker: true
        })
        if (!this.expirationDate.enforced) {
          result.push({
            id: 'remove-expiration',
            title: this.$gettext('Remove expiration date'),
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
          showDatepicker: true
        })
      }

      if (this.link.password) {
        result.push({
          id: 'edit-password',
          title: this.$gettext('Edit password'),
          method: this.showPasswordModal
        })

        if (!this.isPasswordEnforced) {
          result.push({
            id: 'remove-password',
            title: this.$gettext('Remove password'),
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
      if (!this.isPasswordEnforced && !this.link.password) {
        result.push({
          id: 'add-password',
          title: this.$gettext('Add password'),
          method: this.showPasswordModal
        })
      }

      return [
        ...result,
        {
          id: 'delete',
          title: this.$gettext('Delete link'),
          method: this.deleteLink,
          variation: 'danger'
        }
      ]
    },

    viaRouterParams() {
      const viaPath = this.link.path
      const locationName = isLocationSpacesActive(this.$router, 'files-spaces-project')
        ? 'files-spaces-project'
        : 'files-spaces-personal'

      return createLocationSpaces(locationName, {
        params: {
          item: viaPath || '/',
          storageId: this.$route.params.storageId
        },
        query: {
          scrollTo: basename(viaPath)
        }
      })
    },

    localExpirationDate() {
      return DateTime.fromISO(this.link.expiration)
        .setLocale(this.$language.current)
        .endOf('day')
        .toLocaleString(DateTime.DATETIME_FULL)
    },

    expirationDateRelative() {
      return DateTime.fromISO(this.link.expiration)
        .setLocale(this.$language.current)
        .endOf('day')
        .toRelative()
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
        inputType: 'password',
        inputLabel: this.$gettext('Password'),
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
    }
  }
}
</script>

<style lang="scss" scoped>
.details-buttons {
  min-width: 5rem !important;
  display: flex;
  justify-content: flex-end;
}

.roleDropdownList li {
  .oc-button {
    text-align: left;
    border-radius: 0;
    width: 100%;

    &:hover,
    &:focus {
      color: var(--oc-color-text-default) !important;
    }

    &.selected,
    &:hover,
    &:focus {
      background-color: var(--oc-color-swatch-primary-default) !important;
      color: var(--oc-color-text-inverse) !important;

      ::v-deep .oc-icon > svg {
        fill: var(--oc-color-text-inverse) !important;
      }
    }
  }
}
</style>
