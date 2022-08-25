<template>
  <div>
    <p v-translate>Please wait while you're being logged out.</p>
  </div>
</template>
<script>
import { authService } from '../services/auth'
export default {
  name: 'LogoutPage',
  async created() {
    await authService.logoutUser()
    this.router.push({ name: 'login' })
  }
}
</script>
