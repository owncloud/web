<template>
  <div id="oc-files-file-link">
    <FileLinkForm v-if="formOpen" v-bind:params="params" :linkId="linkId" />
    <div class="uk-text-right">
      <oc-button v-if="!formOpen" variation="primary" icon="add" @click="$_openForm()" translate>Add Link</oc-button>
    </div>

    <transition-group tag="ul" name="custom-classes-transition" enter-active-class="uk-animation-slide-left-medium" leave-active-class="uk-animation-slide-right-medium uk-animation-reverse" class="uk-list uk-list-divider">
      <li v-for="(link, index) in $_links" :key="'li-' + index">
        <oc-grid flex gutter="small">
          <div class="uk-width-auto">
            <oc-icon v-if="link.password" name="lock" class="uk-icon-button" />
            <oc-icon v-else name="link" class="uk-icon-button" />
          </div>
          <div class="uk-width-expand">
            <span class="uk-text-bold">{{ link.name }}</span><br>
            <span class="uk-text-meta">{{ link.description }} | Expires {{ formDateFromNow(link.expiration) }}</span>
          </div>
          <div class="uk-width-auto uk-button-group">
            <oc-button icon="edit" @click="$_editLink(link)"/>
            <oc-button icon="delete" @click="$_removeLink(link)" />
          </div>
        </oc-grid>
        <FileLinkForm v-if="linkId === link.id" class="uk-margin-top" v-bind:params="params" :context="'edit'" :linkId="linkId"/>
      </li>
      </transition-group>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import mixins from '../mixins'

import FileLinkForm from './FileLinkForm.vue'

export default {
  mixins: [mixins],
  components: { FileLinkForm },
  title: ($gettext) => {
    return $gettext('Links')
  },
  data () {
    return {
      // Render template only when needed
      formOpen: false,
      linkId: false,

      // group for easy payload
      params: {
        name: '',
        permissions: 1,
        password: '',
        expireDate: null
      }
    }
  },
  mounted () {
    if (this.highlightedFile) {
      this.loadLinks({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext
      })
    } else {
      this.purgeLinks()
    }

    this.$root.$on('oc-files-file-link', e => {
      switch (e.action) {
        case 'closeForm' :
          this.$_closeForm()
          break
      }
    })
  },
  watch: {
    highlightedFile (n, o) {
      if (n === o) { return }

      this.loadLinks({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext
      })
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'links', 'linksLoading', 'linksError']),
    ...mapGetters(['getToken', 'capabilities']),

    $_links () {
      return this.links.filter(link => {
        return parseInt(link.itemSource) === parseInt(this.highlightedFile.id)
      })
    },

    $_expirationDate () {
      const expireDate = this.capabilities.files_sharing.public.expire_date

      return {
        enabled: !!expireDate.enabled,
        days: (expireDate.days) ? expireDate.days : false,
        enforced: expireDate.enforced === '1'
      }
    }
  },
  methods: {
    ...mapActions('Files', ['loadLinks', 'purgeLinks', 'removeLink']),
    $_resetData () {
      this.params = {
        name: this.capabilities.files_sharing.public.defaultPublicLinkShareName,
        permissions: 1,
        hasPassword: false,
        expireDate: (this.$_expirationDate.days) ? moment().add(this.$_expirationDate.days, 'days').format('YYYY-MM-DD') : null
      }
    },
    $_removeLink (link) {
      this.removeLink({
        client: this.$client,
        id: link.id
      })
    },
    $_editLink (link) {
      this.linkId = link.id
      this.params = {
        name: link.name,
        permissions: parseInt(link.permissions),
        hasPassword: link.password,
        expireDate: moment(link.expiration).format('YYYY-MM-DD')
      }
    },
    $_openForm () {
      this.formOpen = true
      this.$_resetData()
    },
    $_closeForm () {
      this.formOpen = false
      this.linkId = false
    }
  }
}
</script>
