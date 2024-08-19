<template>
  <v-app id="inspire" style="background:#ebeff3">
    <router-view :key="$route.fullPath"></router-view>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    user: {}
  }),
  mounted () {
    let authToken = this.$cookie.get(process.env.VUE_APP_TOKEN)
    console.log(authToken)
    if (authToken) {
      this.$store.dispatch('login', {token: authToken})
    } else 
    {
      this.$router.push('/login')
    }
  }
};
</script>

