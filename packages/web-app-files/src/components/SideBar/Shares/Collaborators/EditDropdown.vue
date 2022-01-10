<template>
  <span class="oc-flex oc-flex-middle">
    <oc-button :id="editShareBtnId" class="collaborator-edit-dropdown-options-btn" appearance="raw">
      <oc-icon name="more-2" />
    </oc-button>
    <oc-drop
      ref="expirationDateDrop"
      :toggle="'#' + editShareBtnId"
      mode="click"
      padding-size="remove"
    >
      <oc-list class="collaborator-edit-dropdown-options-list" :aria-label="shareEditOptions">
        <li v-if="isExpirationSupported" class="oc-px-s oc-py-xs">
          <oc-datepicker
            v-model="enteredExpirationDate"
            :min-date="minExpirationDate"
            :max-date="maxExpirationDate"
            :locale="$language.current"
            :is-required="isExpirationDateEnforced"
            class="files-recipient-expiration-datepicker"
            data-testid="recipient-datepicker"
          >
            <template #default="{ togglePopover }">
              <oc-button
                class="files-collaborators-expiration-button"
                data-testid="recipient-datepicker-btn"
                appearance="raw"
                @click="togglePopover"
              >
                <span v-if="isExpirationDateSet" v-text="$gettext('Edit expiration date')" />
                <span v-else v-text="$gettext('Set expiration date')" />
              </oc-button>
            </template>
          </oc-datepicker>
        </li>
        <li v-for="(option, i) in options" :key="i" class="oc-px-s oc-py-xs">
          <oc-button
            appearance="raw"
            :class="option.class"
            v-bind="option.additionalAttributes || {}"
            @click="option.method()"
          >
            <span v-text="option.title" />
          </oc-button>
        </li>
      </oc-list>
    </oc-drop>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import { DateTime } from 'luxon'
import Mixins from '../../../../mixins'

export default {
  name: 'EditDropdown',
  mixins: [Mixins],
  props: {
    expirationDate: {
      type: Date,
      required: false,
      default: undefined
    },
    shareCategory: {
      type: String,
      required: false,
      default: null,
      validator: function (value) {
        return ['user', 'group'].includes(value) || !value
      }
    }
  },
  data: function () {
    return {
      enteredExpirationDate: null
    }
  },
  computed: {
    ...mapGetters(['capabilities']),

    options() {
      const result = []
      if (this.isRemoveExpirationPossible) {
        result.push({
          title: this.$gettext('Remove expiration date'),
          method: this.removeExpirationDate,
          class: 'remove-expiration-date',
          additionalAttributes: {
            'data-testid': 'collaborator-remove-expiration-btn'
          }
        })
      }
      return [
        ...result,
        {
          title: this.$gettext('Remove share'),
          method: this.removeShare,
          class: 'remove-share',
          additionalAttributes: {
            variation: 'danger',
            'data-testid': 'collaborator-remove-share-btn'
          }
        }
      ]
    },

    editShareBtnId() {
      return 'files-collaborators-edit-button-' + this._uid
    },
    shareEditOptions() {
      return this.$gettext('Context menu of the share')
    },

    editingUser() {
      return this.shareCategory === 'user'
    },

    editingGroup() {
      return this.shareCategory === 'group'
    },

    isExpirationSupported() {
      return (
        (this.editingUser && this.userExpirationDate) ||
        (this.editingGroup && this.groupExpirationDate)
      )
    },

    isExpirationDateSet() {
      return !!this.expirationDate
    },

    isRemoveExpirationPossible() {
      return (
        this.isExpirationSupported && this.isExpirationDateSet && !this.isExpirationDateEnforced
      )
    },

    isDefaultExpirationEnabled() {
      if (this.editingUser) {
        return this.userExpirationDate.enabled
      }

      if (this.editingGroup) {
        return this.groupExpirationDate.enabled
      }

      return this.userExpirationDate.enabled || this.groupExpirationDate.enabled
    },

    userExpirationDate() {
      return this.capabilities.files_sharing.user.expire_date
    },

    groupExpirationDate() {
      return this.capabilities.files_sharing.group?.expire_date
    },

    defaultExpirationDate() {
      if (!this.isDefaultExpirationEnabled) {
        return null
      }

      const userMaxExpirationDays = parseInt(this.userExpirationDate.days)
      const groupMaxExpirationDays = parseInt(this.groupExpirationDate.days)
      let days = 0

      if (this.editingUser) {
        days = userMaxExpirationDays
      } else if (this.editingGroup) {
        days = groupMaxExpirationDays
      } else if (userMaxExpirationDays && groupMaxExpirationDays) {
        days = Math.min(userMaxExpirationDays, groupMaxExpirationDays)
      } else {
        days = userMaxExpirationDays || groupMaxExpirationDays
      }

      const date = new Date()
      date.setDate(new Date().getDate() + days)
      return date
    },

    isExpirationDateEnforced() {
      if (this.editingUser) {
        return this.userExpirationDate.enforced
      }

      if (this.editingGroup) {
        return this.groupExpirationDate.enforced
      }

      return this.userExpirationDate.enforced || this.groupExpirationDate.enforced
    },

    maxExpirationDate() {
      if (!this.isExpirationDateEnforced) {
        return null
      }
      return this.defaultExpirationDate
    },

    minExpirationDate() {
      const date = new Date()
      date.setDate(new Date().getDate() + 1)
      return date
    },

    relativeExpirationDate() {
      return DateTime.fromJSDate(this.enteredExpirationDate)
        .setLocale(this.$language.current)
        .endOf('day')
        .toRelative()
    }
  },
  watch: {
    enteredExpirationDate: {
      handler: 'updateExpirationDate'
    }
  },
  methods: {
    updateExpirationDate() {
      this.$emit('expirationDateChanged', {
        expirationDate: DateTime.fromJSDate(this.enteredExpirationDate).endOf('day').toISO()
      })
      this.$refs.expirationDateDrop.hide()
    },
    removeExpirationDate() {
      this.$emit('expirationDateChanged', {
        expirationDate: null
      })
      this.$refs.expirationDateDrop.hide()
    },
    removeShare() {
      this.$emit('removeShare')
    }
  }
}
</script>
