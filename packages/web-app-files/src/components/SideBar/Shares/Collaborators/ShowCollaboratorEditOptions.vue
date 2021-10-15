<template>
  <div>
    <oc-button
      :id="roleButtonId"
      data-testid="files-recipient-role-select-btn"
      appearance="raw"
      justify-content="left"
      gap-size="xsmall"
      ><oc-icon name="more_vert"></oc-icon></oc-button
    >
    <oc-drop
      ref="rolesDrop"
      data-testid="files-recipient-roles-drop"
      :toggle="'#' + roleButtonId"
      mode="click"
      close-on-click
    >
      <template #special>
        <oc-list class="show-collaborators-edit-options oc-p-xs" :aria-label="rolesListAriaLabel">
          <li v-for="(option, i) in options" :key="i" class="oc-p-s">
            <oc-button class="edit-option" appearance="raw" @click="option.method()">
              <oc-icon :name="option.icon" />
              {{ option.title }}
            </oc-button>
          </li>
        </oc-list>
      </template>
    </oc-drop>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { shareTypes } from '../../../../helpers/shareTypes'
import { basename } from 'path'
import CollaboratorsMixins from '../../../../mixins/collaborators'
import Mixins from '../../../../mixins'
import { DateTime } from 'luxon'

export default {
  name: 'ShowCollaboratorEditOptions',
  mixins: [Mixins, CollaboratorsMixins],
  props: {},
  data: function () {
    return {
      options: [
        {
          title: 'Expiration Date',
          icon: 'text-calendar'
        },
        {
          title: 'Remove',
          icon: 'delete',
          method: this.test
        }
      ]
    }
  },
  computed: {
    roleButtonId() {
      return 'files-collaborators-role-button-' + this._uid
    }
  },
  methods: {
    test() {
      alert('hi')
    }
  }
}
</script>

<style lang="scss" scoped="scoped">
.oc-drop {
  background-color: var(--oc-color-swatch-inverse-default);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}
.show-collaborators-edit-options .edit-option:hover {
  color: black !important;
}
</style>
