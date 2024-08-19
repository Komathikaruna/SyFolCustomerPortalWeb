<template>
  <div>
    <v-container class="d-flex justify-center align-center fill-height">
      <v-card class="pa-5" max-width="600">
        <div class="text-center">
          <img src="../../../public/img/logo.png" alt="Logo" height="35px" class="mr-5">
          <!-- <span>SYFol</span> -->
        </div>
        <v-card-title class="text-h5">Login</v-card-title>
        <v-card-subtitle>Manage all your incidents here</v-card-subtitle>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Email"
                  v-model="email" hide-details dense
                  :rules="[rules.required]"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="text-end">      
                <v-text-field class="pb-2"
                  label="Password"
                  v-model="password"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  @click:append="showPassword = !showPassword" hide-details dense
                  :rules="[rules.required]"
                  outlined
                ></v-text-field>
                <v-btn text color="primary">Forgot password?</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="#0184e2" dark block @click="loginIn" rounded>
            Login
            <v-icon small class="pr-2">mdi-arrow-right</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      rules: {
        required: value => !!value || 'Required.',
      },
    };
  },
  methods: {
    loginIn () {
      const model = {
        userName: 'string',
        email: 'string',
        password: 'string',
        otp: 'string',
        company: 'string'
      }
      this.$api.execute('post', 'incidentportalauth/login_normal_user', model).then(response => {
        this.$store.dispatch('login', response.data)
        .then(() => {
          this.$router.push('/landing')
        })
      })
    }
  }
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>