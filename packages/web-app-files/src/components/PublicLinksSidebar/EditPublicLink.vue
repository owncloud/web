<template>
  <div class="oc-files-edit-public-link oc-files-file-link-form">
    <form @submit.prevent>
      <div class="oc-mb">
        <oc-text-input id="oc-files-file-link-name" v-model="name" :label="$gettext('Name')" />
      </div>
      <oc-select
        v-model="selectedRole"
        input-id="files-file-link-role-button"
        :options="roles"
        :clearable="false"
        :label="$gettext('Role')"
        class="oc-mb files-file-link-role-button-wrapper"
      >
        <template v-slot:option="option">
          <role-item :role="option" />
        </template>
        <template #no-options v-translate>
          No matching role found
        </template>
      </oc-select>
      <div v-if="$_expirationDate" class="oc-mb uk-width-1-1">
        <oc-text-input
          id="oc-files-file-link-expire-date"
          v-model="enteredExpirationDate"
          :label="expirationDateLabel"
          :description-message="expirationDateFormatHint"
          :error-message="expirationDateErrorMessage"
        />
      </div>
      <div class="oc-mb uk-width-1-1">
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
            <h4 class="oc-mt-top uk-heading-divider">
                Send mail notification
            </h4>
            <div class="oc-mb">
                <input type="text" class="uk-input" :placeholder="placeholder.mailTo" />
            </div>
            <div class="oc-mb">
                <textarea class="uk-textarea" :placeholder="placeholder.mailBody rows="4"></textarea>
            </div>
            <div class="oc-mb">
                <label><input type="checkbox" class="uk-checkbox oc-mr-s" v-translate>Send a copy to myself</label>
            </div>
        </template>
        -->
      <hr class="divider" />
      <oc-grid class="oc-mb" gutter="small">
        <div>
          <oc-button id="oc-files-file-link-cancel" :disabled="saving" @click="$_closeForm">
            <translate>Cancel</translate>
          </oc-button>
        </div>
        <div>
          <oc-button
            v-if="$_isNew"
            id="oc-files-file-link-create"
            :disabled="!$_isValid || saving"
            variation="primary"
            appearance="filled"
            @click="$_addLink"
          >
            <template v-if="saving">
              <oc-spinner :aria-label="$gettext('Creating Public Link')" size="small" />
              <span v-translate :aria-hidden="true">Creating</span>
            </template>
            <span v-else v-translate>Create</span>
          </oc-button>
          <oc-button
            v-else
            id="oc-files-file-link-save"
            :disabled="!$_isValid || !$_hasChanges || saving"
            variation="primary"
            appearance="filled"
            @click="$_updateLink"
          >
            <template v-if="saving">
              <oc-spinner :aria-label="$gettext('Saving Public Link')" size="small" />
              <span v-translate :aria-hidden="true">Saving</span>
            </template>
            <span v-else v-translate>Save</span>
          </oc-button>
        </div>
      </oc-grid>
    </form>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
import mixins from '../../mixins'
import publicLinkRoles from '../../helpers/publicLinkRolesDefinition'
import RoleItem from '../RoleItem.vue'
import { DateTime } from 'luxon'
const dateFormat = 'dd-MM-yyyy'

export default {
  components: {
    RoleItem
  },
  mixins: [mixins],
  data() {
    return {
      saving: false,
      password: null,
      name: null,
      hasPassword: false,
      enteredExpirationDate: null,
      placeholder: {
        mailTo: this.$gettext('Mail recipients'),
        mailBody: this.$gettext('Personal note')
      },
      selectedRole: null
    }
  },
  title: $gettext => {
    return $gettext('Links')
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['getToken', 'capabilities']),
    ...mapState('Files', ['publicLinkInEdit']),

    $_isNew() {
      return !this.publicLinkInEdit.id
    },

    $_isFolder() {
      return this.highlightedFile.type === 'folder'
    },

    $_isFile() {
      return !this.$_isFolder
    },

    $_hasChanges() {
      return (
        this.parsedExpirationDateString !== this.oldExpirationDateString ||
        this.name !== this.publicLinkInEdit.name ||
        this.selectedRole.permissions !== this.publicLinkInEdit.permissions ||
        (this.publicLinkInEdit.hasPassword
          ? this.password !== null
          : this.password !== null && this.password.trim().length > 0)
      )
    },

    $_sendMailEnabled() {
      return Object.keys(this.capabilities.files_sharing.public.send_mail).length > 0
    },

    roles() {
      const $gettext = this.$gettext
      return publicLinkRoles({
        $gettext,
        isFolder: this.$_isFolder
      })
    },

    isEnteredExpirationDateEmpty() {
      return !this.enteredExpirationDate || !this.enteredExpirationDate.trim()
    },

    isEnteredExpirationDateParsable() {
      if (this.isEnteredExpirationDateEmpty) {
        return false
      }
      return DateTime.fromFormat(this.enteredExpirationDate.trim(), dateFormat, {
        locale: this.$language.current
      }).isValid
    },

    isExpirationDateEnforced() {
      return this.$_expirationDate.enforced
    },

    isExpirationDateValid() {
      if (this.isEnteredExpirationDateEmpty) {
        return !this.isExpirationDateEnforced
      }
      if (!this.isEnteredExpirationDateParsable) {
        return false
      }
      if (this.minExpirationDateJS && this.parsedExpirationDateJS < this.minExpirationDateJS) {
        return false
      }
      if (this.maxExpirationDateJS && this.parsedExpirationDateJS > this.maxExpirationDateJS) {
        return false
      }
      return true
    },

    parsedExpirationDate() {
      if (!this.isEnteredExpirationDateParsable) {
        return null
      }
      return DateTime.fromFormat(this.enteredExpirationDate.trim(), dateFormat, {
        locale: this.$language.current
      })
    },

    parsedExpirationDateString() {
      if (!this.parsedExpirationDate) {
        return null
      }
      return this.parsedExpirationDate.toFormat(dateFormat)
    },

    parsedExpirationDateJS() {
      if (!this.parsedExpirationDate) {
        return null
      }
      return this.parsedExpirationDate.toJSDate()
    },

    oldExpirationDateString() {
      if (!this.publicLinkInEdit.expireDate) {
        return null
      }
      return DateTime.fromISO(this.publicLinkInEdit.expireDate)
        .setLocale(this.$language.current)
        .toFormat(dateFormat)
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
      return DateTime.now().setLocale(this.$language.current)
    },

    minExpirationDateString() {
      return this.minExpirationDate.toFormat(dateFormat)
    },

    minExpirationDateJS() {
      return this.minExpirationDate.toJSDate()
    },

    maxExpirationDate() {
      if (!this.isExpirationDateEnforced) {
        return null
      }
      const days = parseInt(this.$_expirationDate.days)
      return DateTime.now()
        .setLocale(this.$language.current)
        .plus({ days })
    },

    maxExpirationDateString() {
      if (!this.maxExpirationDate) {
        return null
      }
      return this.maxExpirationDate.toFormat(dateFormat)
    },

    maxExpirationDateJS() {
      if (!this.maxExpirationDate) {
        return null
      }
      return this.maxExpirationDate.toJSDate()
    },

    $_passwordIsValid() {
      if (this.hasPassword) {
        return true
      }

      return !(this.$_passwordEnforced && (this.password === '' || this.password === null))
    },

    $_isValid() {
      return this.isExpirationDateValid && this.$_passwordIsValid
    },

    $_passwordEnforced() {
      const permissions = parseInt(this.selectedRole.permissions, 10)
      const password = this.capabilities.files_sharing.public.password.enforced_for

      if (permissions === 1 && password.read_only === '1') {
        return true
      }
      if (permissions === 4 && password.upload_only === '1') {
        return true
      }
      if (permissions >= 5 && password.read_write === '1') {
        return true
      }

      return false
    },

    expirationDateLabel() {
      if (this.isExpirationDateEnforced) {
        return this.$gettext('Expiration date (required)')
      }
      return this.$gettext('Expiration date')
    },

    expirationDateFormatHint() {
      return this.$gettextInterpolate(this.$gettext('Format: %{ dateFormat }'), {
        dateFormat: dateFormat.toUpperCase()
      })
    },

    expirationDateErrorMessage() {
      if (this.isEnteredExpirationDateEmpty) {
        if (this.isExpirationDateEnforced) {
          return this.$gettextInterpolate(
            this.$gettext('An expiration date is required (format: %{ dateFormat })'),
            {
              dateFormat: dateFormat.toUpperCase()
            }
          )
        }
        // if the expiration date is empty and not enforced none of the other cases will be relevant
        return null
      }
      if (!this.isEnteredExpirationDateParsable) {
        return this.$gettextInterpolate(
          this.$gettext('The expiration date is invalid (format: %{ dateFormat })'),
          {
            dateFormat: dateFormat.toUpperCase()
          }
        )
      }
      if (this.minExpirationDateJS && this.parsedExpirationDateJS < this.minExpirationDateJS) {
        return this.$gettextInterpolate(
          this.$gettext('The expiration date must be after %{ minExpirationDate }'),
          {
            minExpirationDate: this.minExpirationDateString
          }
        )
      }
      if (this.maxExpirationDateJS && this.parsedExpirationDateJS > this.maxExpirationDateJS) {
        return this.$gettextInterpolate(
          this.$gettext('Expiration date must be before %{ maxExpirationDate }'),
          {
            maxExpirationDate: this.maxExpirationDateString
          }
        )
      }
      return null
    },

    passwordLabel() {
      if (this.$_passwordEnforced) {
        return this.$gettext('Password (required)')
      }
      return this.$gettext('Password')
    }
  },
  created() {
    this.name = this.publicLinkInEdit.name
    this.hasPassword = this.publicLinkInEdit.hasPassword
    this.enteredExpirationDate = this.oldExpirationDateString

    this.setRole()
  },
  mounted() {
    this.focus({
      to: document.getElementById('oc-files-file-link-name'),
      revert: false
    })
  },
  beforeDestroy() {
    this.focus({
      revert: true
    })
  },
  methods: {
    ...mapActions(['showMessage']),
    ...mapActions('Files', ['addLink', 'updateLink']),
    ...mapMutations('Files', ['SET_APP_SIDEBAR_ACCORDION_CONTEXT']),

    setRole() {
      const permissions = parseInt(this.publicLinkInEdit.permissions, 10)

      if (permissions) {
        const role = this.roles.find(r => r.permissions === permissions)

        if (role) {
          this.selectedRole = role

          return
        }
      }

      this.selectedRole = this.roles[0]
    },

    $_addLink() {
      this.saving = true

      const params = {
        expireDate: this.parsedExpirationDateString,
        permissions: this.selectedRole.permissions,
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
        .then(() => {
          this.saving = false
          this.$_closeForm()
        })
        .catch(e => {
          console.error(e)
          this.saving = false
          this.showMessage({
            title: this.$gettext('Failed to create public link'),
            status: 'danger'
          })
        })
    },

    $_updateLink() {
      this.saving = true

      const params = {
        expireDate: this.parsedExpirationDateString || '',
        permissions: this.selectedRole.permissions,
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
          this.$_closeForm()
        })
        .catch(e => {
          console.error(e)
          this.saving = false
          this.showMessage({
            title: this.$gettext('Failed to update public link'),
            status: 'danger'
          })
        })
    },

    $_closeForm() {
      this.SET_APP_SIDEBAR_ACCORDION_CONTEXT('showLinks')
    },

    removePassword: function() {
      this.password = ''
      this.hasPassword = false
      document.getElementById('oc-files-file-link-password').focus()
    }
  }
}
</script>
