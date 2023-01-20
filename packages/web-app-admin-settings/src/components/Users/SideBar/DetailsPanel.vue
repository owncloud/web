<template>
  <div class="oc-mt-xl">
    <div v-if="noUsers" class="oc-flex user-info">
      <oc-icon name="user" size="xxlarge" />
      <p v-translate>Select a user to view details</p>
    </div>
    <div v-if="multipleUsers" class="oc-flex group-info">
      <oc-icon name="group" size="xxlarge" />
      <p>{{ multipleUsersSelectedText }}</p>
    </div>
    <div v-if="user">
      <UserInfoBox :user="user" />
      <table
        class="details-table"
        :aria-label="$gettext('Overview of the information about the selected user')"
      >
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('User name')" />
          <td v-text="user.onPremisesSamAccountName" />
        </tr>
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('Display name')" />
          <td v-text="user.displayName" />
        </tr>
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('Email')" />
          <td>
            <span v-text="user.mail" />
          </td>
        </tr>
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('Role')" />
          <td>
            <span v-if="user.role" v-text="user.role.displayName" />
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import UserInfoBox from './UserInfoBox.vue'
import { PropType } from 'vue'
import { User } from 'web-client/src/generated'

export default defineComponent({
  name: 'DetailsPanel',
  components: {
    UserInfoBox
  },
  props: {
    user: {
      type: Object as PropType<User>,
      required: false
    },
    users: {
      type: Array,
      required: true
    }
  },
  computed: {
    noUsers() {
      return !this.users.length
    },
    multipleUsers() {
      return this.users.length > 1
    },
    multipleUsersSelectedText() {
      return this.$gettextInterpolate('%{count} users selected', {
        count: this.users.length
      })
    }
  }
})
</script>
<style lang="scss">
.details-table {
  text-align: left;

  tr {
    height: 1.5rem;
  }

  th {
    font-weight: 600;
  }
}
</style>
