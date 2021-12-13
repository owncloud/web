<template>
  <div v-if="expirationSupported">
    <oc-datepicker
      v-model="enteredExpirationDate"
      :min-date="minExpirationDate"
      :max-date="maxExpirationDate"
      :locale="$language.current"
      :is-required="expirationDateEnforced"
      class="files-recipient-expiration-datepicker"
    >
      <template #default="{ togglePopover }">
        <oc-button
          class="files-collaborators-expiration-button"
          appearance="raw"
          gap-size="none"
          @click="togglePopover"
        >
          <translate v-if="!enteredExpirationDate" key="no-expiration-date-label"
            >Set expiration date</translate
          >
          <translate
            v-else
            key="set-expiration-date-label"
            :translate-params="{ expires: relativeExpirationDate }"
          >
            Expires %{expires}
          </translate>
          <oc-icon v-if="!enteredExpirationDate" name="expand_more" />
        </oc-button>
      </template>
    </oc-datepicker>
    <oc-button
      v-if="!expirationDateEnforced && enteredExpirationDate"
      class="recipient-edit-expiration-btn-remove"
      appearance="raw"
      :aria-label="$gettext('Remove expiration date')"
      @click="clearExpirationDate"
    >
      <oc-icon name="close" />
    </oc-button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { DateTime } from 'luxon'

export default {
  name: 'ExpirationDatepicker',
  props: {
    expirationDate: {
      type: Date,
      required: false,
      default: undefined
    }
  },

  data() {
    return {
      enteredExpirationDate: null
    }
  },

  computed: {
    ...mapGetters(['capabilities']),

    expirationSupported() {
      return this.userExpirationDate && this.groupExpirationDate
    },

    defaultExpirationDateSet() {
      return this.userExpirationDate.enabled || this.groupExpirationDate.enabled
    },

    userExpirationDate() {
      return this.capabilities.files_sharing.user.expire_date
    },

    groupExpirationDate() {
      return this.capabilities.files_sharing.group.expire_date
    },

    defaultExpirationDate() {
      if (!this.defaultExpirationDateSet) {
        return null
      }

      const userMaxExpirationDays = parseInt(this.userExpirationDate.days, 10)
      const groupMaxExpirationDays = parseInt(this.groupExpirationDate.days, 10)
      let days = 0

      if (userMaxExpirationDays && groupMaxExpirationDays) {
        days = Math.min(userMaxExpirationDays, groupMaxExpirationDays)
      } else {
        days = userMaxExpirationDays || groupMaxExpirationDays
      }

      return DateTime.now().setLocale(this.$language.current).plus({ days }).toJSDate()
    },

    expirationDateEnforced() {
      return this.userExpirationDate.enforced || this.groupExpirationDate.enforced
    },

    maxExpirationDate() {
      if (!this.expirationDateEnforced) {
        return null
      }

      return this.defaultExpirationDate
    },

    minExpirationDate() {
      return DateTime.now().setLocale(this.$language.current).toJSDate()
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
      handler: 'publishChange'
    }
  },

  methods: {
    publishChange() {
      const expirationDate = DateTime.fromJSDate(this.enteredExpirationDate)
        .setLocale(this.$language.current)
        .endOf('day')
      this.$emit('optionChange', {
        expirationDate: expirationDate.isValid
          ? expirationDate.toFormat("yyyy-MM-dd'T'HH:mm:ssZZZ")
          : null
      })
    },
    clearExpirationDate() {
      this.enteredExpirationDate = null
    }
  }
}
</script>

<style lang="scss" scoped>
.recipient-edit-expiration-btn-remove {
  vertical-align: middle;
}
</style>
