<template>
  <div>
    <v-app>
      <v-alert
        :value="true"
        color="error"
        icon="error">
        Error in initializing the application ....<br>
        {{ error}}
      </v-alert>
    </v-app>
  </div>
</template>

<script>
export default {
  name: 'errorPage',

  data () {
    return {
    }
  },
  computed: {
    error () {
      return this.$parent.$options.data().error.message
    }
  },
  methods: {
  }
}
</script>
