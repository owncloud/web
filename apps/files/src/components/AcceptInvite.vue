  <template>
    <div id="files" class="uk-flex uk-flex-column">
     <accept-invite-bar/>
  <div name="accept-invite-dialog">
      <oc-text-input
        :disabled="$_ocLoading"
        :placeholder="$_acceptInviteDialogPlaceholder"
        :label="$_acceptInviteDialogLabel"
        autofocus
        id="accept-invite-input"
        v-model="inputValue"
        ref="input"
        @keydown.enter.native="onConfirm"
      ></oc-text-input>
        <oc-button id="accept-invite-cancel" @click.stop="onCancel">{{ _ocCancelText }}</oc-button>
        <oc-button :disabled="$_ocLoading || inputValue === '' || clicked"
               id="accept-invite-ok"
               ref="confirmButton"
               @click.stop="onConfirm">{{ _ocConfirmText }}</oc-button>
  </div>
  </div>
</template>
<script>
import AcceptInviteBar from './AcceptInviteBar.vue'
import { mapActions } from 'vuex'

export default {
  components: {
    AcceptInviteBar
  },
  data: () => ({
    acceptInviteName: '',
    inputValue: null,
    clicked: false,
    fileFolderCreationLoading: false
  }),
  computed: {
    $_ocLoading () {
      return this.fileFolderCreationLoading
    },
    $_acceptInviteDialogLabel () {
      return this.$gettext('Token')
    },
    $_acceptInviteDialogPlaceholder () {
      return this.$gettext('Enter your token…')
    },
    _ocConfirmText () {
      return this.ocConfirmText
        ? this.ocConfirmText
        : this.$gettext('Accept invite')
    },
    _ocCancelText () {
      return this.ocCancelText ? this.ocConfirmText : this.$gettext('Cancel')
    }
  },
  watch: {
    inputValue () {
      this.$emit('input', this.inputValue)
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    onCancel () {
      console.log('on cancel clicked')
      this.$emit('oc-cancel')
    },
    onConfirm () {
      if (this.inputValue !== '') {
        this.clicked = true
        console.log('on confirm clicked' + this.inputValue)
        this.$emit('oc-confirm', this.inputValue)
        this.showMessage({
          title: this.$gettext('This feature is not yet implemented') // TODO: Update to "You have now accepted the invite" when featuer is implemented
        })
      }
    }
  }
}
</script>
