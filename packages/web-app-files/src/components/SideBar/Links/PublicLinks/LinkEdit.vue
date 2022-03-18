<template>
  <div class="oc-files-edit-public-link oc-files-file-link-form" data-testid="new-files-link">
    <form @submit.prevent>
      <oc-alert v-if="errors" class="oc-files-file-link-error-alert" variation="danger">
        {{ errors }}
      </oc-alert>
      <div class="oc-mb">
        <oc-text-input
          id="oc-files-file-link-name"
          ref="nameInput"
          v-model="name"
          :label="$gettext('Name')"
        />
      </div>
      <oc-select
        id="files-file-link-role-button"
        v-model="selectedRoleOption"
        :options="availableRoleOptions"
        :clearable="false"
        :label="selectedRoleLabel"
        class="oc-mb files-file-link-role-button-wrapper"
      >
        <template #option="option">
          <role-item :role="getRoleFromSelectOption(option)" :allow-share-permission="false" />
        </template>
        <template #no-options v-translate> No matching role found </template>
      </oc-select>
      <div v-if="$_expirationDate" class="oc-mb">
        <label for="files-links-expiration-btn" v-text="expirationDateLabel" />
        <oc-datepicker
          id="oc-files-file-link-expire-date"
          :key="'oc-datepicker-' + expireDate"
          v-model="expireDate"
          :min-date="minExpirationDate"
          :max-date="maxExpirationDate"
          :locale="$language.current"
          :is-required="$_expirationDate.enforced"
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
              <translate v-if="!expireDate" key="no-expiration-date-label"
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
          v-if="!$_expirationDate.enforced && !!expireDate"
          id="oc-files-file-link-expire-date-delete"
          class="oc-mt-s"
          appearance="raw"
          data-testid="files-link-remove-expiration-date"
          @click="expireDate = null"
          v-text="$gettext('Remove expiration date')"
        />
      </div>
      <div>
        <oc-text-input
          id="oc-files-file-link-password"
          v-model="password"
          type="password"
          :label="passwordLabel"
        />
        <oc-button
          v-if="!$_passwordEnforced && (password || hasPassword)"
          id="oc-files-file-link-password-delete"
          class="oc-mt-s"
          appearance="raw"
          @click="removePassword"
          v-text="$gettext('Remove password')"
        />
      </div>
      <!-- @TODO: Enable Mail API to use the following
                  ++++++++++++++++++++++++++++++++++++
        <template v-if="$_sendMailEnabled">
            <h4 class="oc-mt-top oc-heading-divider">
                Send mail notification
            </h4>
            <div class="oc-mb">
                <input type="text" class="oc-input" :placeholder="placeholder.mailTo" />
            </div>
            <div class="oc-mb">
                <textarea class="oc-textarea" :placeholder="placeholder.mailBody rows="4"></textarea>
            </div>
            <div class="oc-mb">
                <label><input type="checkbox" class="oc-checkbox oc-mr-s" v-translate>Send a copy to myself</label>
            </div>
        </template>
        -->
      <hr class="divider" />
      <div class="oc-mb">
        <oc-button id="oc-files-file-link-cancel" :disabled="saving" @click="$_closeForm">
          <translate>Cancel</translate>
        </oc-button>
        <oc-button
          v-if="saving"
          id="oc-files-file-link-saving"
          variation="primary"
          appearance="filled"
          disabled
        >
          <template v-if="$_isNew">
            <oc-spinner :aria-label="$gettext('Creating Public Link')" size="small" />
            <span v-translate data-testid="files-link-being-created" :aria-hidden="true"
              >Creating</span
            >
          </template>
          <template v-else>
            <oc-spinner :aria-label="$gettext('Saving Public Link')" size="small" />
            <span v-translate data-testid="files-link-being-saved" :aria-hidden="true">Saving</span>
          </template>
        </oc-button>
        <template v-else>
          <oc-button
            v-if="$_isNew"
            id="oc-files-file-link-create"
            data-testid="new-files-link-btn"
            :disabled="!$_isValid"
            variation="primary"
            appearance="filled"
            submit="submit"
            @click="$_addLink"
          >
            <translate>Create</translate>
          </oc-button>
          <oc-button
            v-else
            id="oc-files-file-link-save"
            data-testid="save-files-link-btn"
            :disabled="!$_isValid || !$_hasChanges"
            variation="primary"
            appearance="filled"
            submit="submit"
            @click="$_updateLink"
          >
            <translate>Save</translate>
          </oc-button>
        </template>
      </div>
    </form>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import mixins from '../../../../mixins'
import { DateTime } from 'luxon'
import RoleItem from '../../Shared/RoleItem.vue'
import { LinkShareRoles, SharePermissions } from '../../../../helpers/share'

export default {
  components: {
    RoleItem
  },
  mixins: [mixins],
  inject: ['changeView'],
  data() {
    return {
      saving: false,
      password: null,
      errors: false,
      name: null,
      hasPassword: false,
      expireDate: null,
      placeholder: {
        mailTo: this.$gettext('Mail recipients'),
        mailBody: this.$gettext('Personal note')
      },
      selectedRoleOption: null
    }
  },
  title: ($gettext) => {
    return $gettext('Links')
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['getToken', 'capabilities', 'isOcis']),
    ...mapState('Files', ['publicLinkInEdit']),

    selectedRole() {
      return this.getRoleFromSelectOption(this.selectedRoleOption)
    },

    $_isNew() {
      return !this.publicLinkInEdit.id
    },

    $_hasChanges() {
      const expireDateBefore = this.publicLinkInEdit.expireDate
      const expireDateNow = this.expireDate
      return (
        expireDateNow !== expireDateBefore ||
        this.name !== this.publicLinkInEdit.name ||
        this.selectedRole.bitmask(false) !== this.publicLinkInEdit.permissions ||
        (this.publicLinkInEdit.hasPassword
          ? this.password !== null
          : this.password !== null && this.password.trim().length > 0)
      )
    },

    $_sendMailEnabled() {
      return Object.keys(this.capabilities.files_sharing.public.send_mail).length > 0
    },

    availableRoleOptions() {
      return LinkShareRoles.list(this.highlightedFile.isFolder, this.isOcis).map((r) =>
        this.convertRoleToSelectOption(r)
      )
    },

    $_expirationDate() {
      const expireDate = this.capabilities.files_sharing.public.expire_date

      return {
        enabled: !!expireDate.enabled,
        days: expireDate.days ? expireDate.days : false,
        enforced: !!expireDate.enforced
      }
    },

    minExpirationDate() {
      return DateTime.now().setLocale(this.$language.current).toJSDate()
    },

    maxExpirationDate() {
      if (!this.$_expirationDate.enforced) {
        return null
      }

      const days = parseInt(this.$_expirationDate.days, 10)
      return DateTime.now().setLocale(this.$language.current).plus({ days }).toJSDate()
    },

    $_expirationIsValid() {
      return !(this.$_expirationDate.enforced && !this.expireDate)
    },

    $_passwordIsValid() {
      if (this.hasPassword) {
        return true
      }

      return !(this.$_passwordEnforced && (this.password === '' || this.password === null))
    },

    $_isValid() {
      return this.$_expirationIsValid && this.$_passwordIsValid
    },

    $_passwordEnforced() {
      const password = this.capabilities.files_sharing.public.password.enforced_for

      if (password.read_only === '1') {
        return (
          this.selectedRole.hasPermission(SharePermissions.read) &&
          !this.selectedRole.hasPermission(SharePermissions.create)
        )
      }
      if (password.upload_only === '1') {
        return (
          !this.selectedRole.hasPermission(SharePermissions.read) &&
          this.selectedRole.hasPermission(SharePermissions.create)
        )
      }
      if (password.read_write === '1') {
        return (
          this.selectedRole.hasPermission(SharePermissions.read) &&
          this.selectedRole.hasPermission(SharePermissions.create)
        )
      }

      return false
    },

    expirationDateLabel() {
      if (this.$_expirationDate.enforced) {
        return this.$gettext('Expiration date (required)')
      }

      return this.$gettext('Expiration date')
    },

    passwordLabel() {
      if (this.$_passwordEnforced) {
        return this.$gettext('Password (required)')
      }

      return this.$gettext('Password')
    },
    selectedRoleLabel() {
      return this.$gettext('Role')
    },

    relativeExpirationDate() {
      return DateTime.fromJSDate(this.expireDate)
        .setLocale(this.$language.current)
        .endOf('day')
        .toRelative()
    },

    defaultExpireDate() {
      if (!this.$_expirationDate.days) {
        return null
      }

      const days = parseInt(this.$_expirationDate.days)
      return DateTime.now().setLocale(this.$language.current).plus({ days }).toJSDate()
    }
  },
  created() {
    const link = this.publicLinkInEdit

    this.name = link?.name
    this.hasPassword = link?.hasPassword
    const expireDateOrNull = link.expireDate ? new Date(this.publicLinkInEdit.expireDate) : null
    this.expireDate = link?.id ? expireDateOrNull : this.defaultExpireDate
    this.setRole()
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.nameInput.focus()
    })
  },
  methods: {
    ...mapActions('Files', ['addLink', 'updateLink']),

    setRole() {
      const permissions = parseInt(this.publicLinkInEdit.permissions)

      if (permissions) {
        const role = LinkShareRoles.getByBitmask(permissions, this.highlightedFile.isFolder)
        if (role) {
          this.selectedRoleOption = this.convertRoleToSelectOption(role)
          return
        }
      }

      this.selectedRoleOption = this.availableRoleOptions[0]
    },

    $_addLink() {
      this.saving = true

      const expireDate = DateTime.fromJSDate(this.expireDate)
        .setLocale(this.$language.current)
        .endOf('day')

      const params = {
        expireDate: expireDate.isValid ? expireDate.toFormat("yyyy-MM-dd'T'HH:mm:ssZZZ") : '',
        permissions: this.selectedRole.bitmask(false),
        name: this.name
      }

      if (this.password !== null) {
        params.password = this.password
      }

      this.addLink({
        path: this.highlightedFile.path,
        client: this.$client,
        $gettext: this.$gettext,
        params
      })
        .then((e) => {
          this.saving = false
          this.errors = false
          this.$_closeForm()
        })
        .catch((e) => {
          this.saving = false
          this.errors = e
        })
    },

    $_updateLink() {
      this.saving = true

      const expireDate = DateTime.fromJSDate(this.expireDate)
        .setLocale(this.$language.current)
        .endOf('day')

      const params = {
        expireDate: expireDate.isValid ? expireDate.toFormat("yyyy-MM-dd'T'HH:mm:ssZZZ") : '',
        permissions: this.selectedRole.bitmask(false),
        name: this.name
      }

      if (this.password !== null) {
        params.password = this.password
      }

      this.updateLink({
        id: this.publicLinkInEdit.id,
        client: this.$client,
        $gettext: this.$gettext,
        params
      })
        .then(() => {
          this.saving = false
          this.errors = false
          this.$_closeForm()
        })
        .catch((e) => {
          this.saving = false
          this.errors = e
        })
    },

    $_closeForm() {
      this.changeView('showLinks')
    },

    removePassword: function () {
      this.password = ''
      this.hasPassword = false
    },

    getRoleFromSelectOption(option) {
      return option.role
    },

    convertRoleToSelectOption(role) {
      return {
        role: role,
        name: role.name,
        label: this.$gettext(role.label)
      }
    }
  }
}
</script>
