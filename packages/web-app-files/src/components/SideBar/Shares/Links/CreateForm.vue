<template>
  <div class="oc-files-edit-public-link oc-files-file-link-form" data-testid="new-files-link">
    <form @submit.prevent>
      <div class="oc-mb">
        <oc-text-input
          id="oc-files-file-link-name"
          ref="nameInput"
          v-model="link.name"
          :label="nameLabel"
        />
      </div>
      <oc-select
        id="files-file-link-role-button"
        v-model="link.role"
        :options="availableRoleOptions"
        :clearable="false"
        :label="roleLabel"
        class="oc-mb files-file-link-role-button-wrapper"
      >
        <template #option="option">
          <role-item :role="option.role" :allow-share-permission="false" />
        </template>
        <template #no-options v-translate> No matching role found </template>
      </oc-select>
      <div v-if="expirationDate" class="oc-mb">
        <label for="files-links-expiration-btn" v-text="expirationDateLabel" />
        <oc-datepicker
          id="oc-files-file-link-expire-date"
          :key="'oc-datepicker-' + link.expiration"
          v-model="link.expiration"
          :min-date="expirationDate.min"
          :max-date="expirationDate.max"
          :locale="$language.current"
          :is-required="expirationDate.enforced"
          class="files-recipient-expiration-datepicker"
          data-testid="recipient-datepicker"
        >
          <template #default="{ togglePopover }">
            <oc-button
              id="files-links-expiration-btn"
              data-testid="recipient-datepicker-btn"
              class="oc-width-1-1 expiration-dialog-btn"
              justify-content="space-between"
              gap-size="xsmall"
              @click="togglePopover"
            >
              <translate v-if="!link.expiration" key="no-expiration-date-label"
                >Set expiration date</translate
              >
              <translate
                v-else
                key="set-expiration-date-label"
                :translate-params="{ expires: relativeExpirationDate }"
              >
                Expires %{expires}
              </translate>
              <oc-icon name="arrow-down-s" fill-type="line" />
            </oc-button>
          </template>
        </oc-datepicker>
        <oc-button
          v-if="!expirationDate.enforced && link.expiration"
          id="oc-files-file-link-expire-date-delete"
          class="oc-mt-s"
          appearance="raw"
          data-testid="files-link-remove-expiration-date"
          @click="link.expiration = null"
          v-text="$gettext('Remove expiration date')"
        />
      </div>
      <div>
        <oc-text-input
          id="oc-files-file-link-password"
          v-model="link.password"
          type="password"
          :label="passwordLabel"
        />
        <oc-button
          v-if="!passwordEnforcedForRole && link.password"
          id="oc-files-file-link-password-delete"
          class="oc-mt-s"
          appearance="raw"
          @click="link.password = null"
          v-text="$gettext('Remove password')"
        />
      </div>
      <hr class="divider" />
      <div class="oc-mb">
        <oc-button id="oc-files-file-link-cancel" :disabled="isSaving" @click="closeForm">
          <translate>Cancel</translate>
        </oc-button>
        <oc-button
          v-if="isSaving"
          id="oc-files-file-link-saving"
          variation="primary"
          appearance="filled"
          disabled
        >
          <oc-spinner :aria-label="$gettext('Creating Public Link')" size="small" />
          <span v-translate data-testid="files-link-being-created" :aria-hidden="true"
            >Creating</span
          >
        </oc-button>
        <template v-else>
          <oc-button
            id="oc-files-file-link-create"
            data-testid="new-files-link-btn"
            :disabled="!isValid"
            variation="primary"
            appearance="filled"
            submit="submit"
            @click="createLink"
          >
            <translate>Create</translate>
          </oc-button>
        </template>
      </div>
    </form>
  </div>
</template>
<script>
import { DateTime } from 'luxon'
import RoleItem from '../Shared/RoleItem.vue'
import { SharePermissions } from '../../../../helpers/share'

export default {
  components: {
    RoleItem
  },
  props: {
    availableRoleOptions: {
      type: Array,
      required: true
    },
    defaultLinkName: {
      type: String,
      required: true
    },
    expirationDate: {
      type: Object,
      default: () => {},
      required: false
    },
    passwordEnforced: {
      type: Object,
      default: () => {},
      required: false
    }
  },
  data() {
    return {
      isSaving: false,
      link: {
        name: this.defaultLinkName,
        role: this.availableRoleOptions[0],
        expiration: this.expirationDate.default,
        password: null
      }
    }
  },
  computed: {
    expirationDateLabel() {
      if (this.expirationDate.enforced) {
        return this.$gettext('Expiration date (required)')
      }

      return this.$gettext('Expiration date')
    },
    nameLabel() {
      return this.$gettext('Name')
    },
    passwordLabel() {
      if (this.passwordEnforcedForRole) {
        return this.$gettext('Password (required)')
      }

      return this.$gettext('Password')
    },
    roleLabel() {
      return this.$gettext('Role')
    },

    passwordEnforcedForRole() {
      const currentRole = this.availableRoleOptions.find(({ role }) => {
        return this.link.role.name === role.name
      })

      const canRead = currentRole.role.hasPermission(SharePermissions.read)
      const canCreate = currentRole.role.hasPermission(SharePermissions.create)
      const canDelete = currentRole.role.hasPermission(SharePermissions.delete)

      if (this.passwordEnforced.read_only === true) {
        return canRead && !canCreate && !canDelete
      }
      if (this.passwordEnforced.upload_only === true) {
        return !canRead && canCreate && !canDelete
      }
      if (this.passwordEnforced.read_write === true) {
        return canRead && canCreate && !canDelete
      }
      if (this.passwordEnforced.read_write_delete === true) {
        return canRead && canCreate && canDelete
      }
      return false
    },

    isValid() {
      // passwordEnforcedForRole seems not reactive & doesn't deactivate "save" btn
      const passwordValid = !(this.passwordEnforcedForRole && !this.link.password)
      const expireDateValid = !(this.expirationDate.enforced && !this.link.expiration)

      return passwordValid && expireDateValid
    },

    relativeExpirationDate() {
      return DateTime.fromJSDate(this.link.expiration)
        .setLocale(this.$language.current)
        .endOf('day')
        .toRelative()
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.nameInput.focus()
    })
  },
  methods: {
    createLink() {
      this.isSaving = true
      this.$emit('createPublicLink', {
        link: {
          ...this.link,
          permissions: this.link.role.role.bitmask(false).toString()
        },
        showError: (e) => {
          this.error = e
          this.isSaving = false
        }
      })
    },
    closeForm() {
      this.$emit('cancelLinkCreation')
    }
  }
}
</script>
