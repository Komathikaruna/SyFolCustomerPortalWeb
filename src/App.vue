<template>
  <v-app id="inspire" style="background:#ebeff3">
      <v-app-bar v-if="true"
      app
      color="#0184e2"
      :shrink-on-scroll="$route.path === '/landing'"
      :extended="$route.path === '/landing'"
      :extension-height="$route.path === '/landing' ? '40px': ''"
    >
      <v-app-bar-nav-icon dark></v-app-bar-nav-icon>
      <span class="pt-1 white--text">SYFol</span>
      <v-spacer></v-spacer>
      <v-btn icon dark>
        <v-icon>mdi-translate</v-icon>
      </v-btn>
      <v-btn icon dark @click="$router.push('/login')">
        <v-icon>mdi-logout-variant</v-icon>
      </v-btn>
      <template v-slot:extension v-if="$route.path === '/landing'">
        <v-row align="center" justify="center" no-gutters>
          <v-col cols="12" md="12" lg="12" class="centered-search">
            <span class="white--text pl-10">Hi Ruban, Welcome back!!</span>
            <v-row class="pt-3">
              <v-col>
                <v-text-field
                  solo
                  flat
                  hide-details
                  prepend-inner-icon="mdi-magnify"
                  placeholder="Search"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" class="extra-space"></v-col>
        </v-row>
      </template>
    </v-app-bar>
    <v-main>
      <router-view :key="$route.fullPath"></router-view>
    </v-main>
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

<style>
.centered-search {
  max-width: 600px; /* Adjust the width as needed */
  width: 100%;
}
.extra-space {
  height: 100px; /* Adjust the height for extra space */
}
.welcome-text {
  font-size: 24px;
  color: white; /* or any other color you'd like */
  margin-bottom: 16px; /* Adjust to add space below the welcome text */
  text-align: center; /* Center the text horizontally */
}
</style>
