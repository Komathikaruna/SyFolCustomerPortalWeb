<template>
  <div>
    <v-app-bar v-if="true"
      app
      color="#0184e2"
      shrink-on-scroll
      extended
      extension-height="40px"
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
      <template v-slot:extension>
        <v-row align="center" justify="center" no-gutters>
          <v-col cols="12" md="12" lg="12" class="centered-search">
            <!-- Added v-row and v-col for welcome text and search box -->
            <!-- <v-row no-gutters>
              <v-col>
                <div class="welcome-text">Welcome to SYFol!</div>
              </v-col>
            </v-row> -->
            <span class="white--text pl-10">Hi Ruban, Welcome back!!</span>
            <v-row>
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
          <!-- Extra space after search box -->
          <v-col cols="12" class="extra-space"></v-col>
        </v-row>
      </template>
    </v-app-bar>

    <v-main>
      <!-- Content goes here -->
       <v-row no-gutters class="mt-4">
        <v-col cols="12" class="text-center">
          <code>Our Incident Management Portal allows you to easily report, track, and resolve issues with real-time updates and comprehensive support</code>
        </v-col>
       </v-row>
      <v-row class="justify-center align-center mt-2 pa-5">
        <v-col cols="12" sm="6" md="3" v-for="incident in listOfIncidents" :key="incident._id">
          <v-card  class="pa-2" @click="incident.name === 'Ticket' ? '' : goToIncidentList(incident)">
            <v-row>
              <v-col cols="2" class="text-left pt-8 pl-8">
                <v-icon large color="#1c3e59">{{ incident.icon }}</v-icon>
              </v-col>
              <v-col cols="10" class="pa-1">
                <v-card-title class="text-h6">{{ incident.name }}</v-card-title>
                <v-card-subtitle>
                  {{ incident.description }}
                </v-card-subtitle>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </div>
</template>
<script>
export default {
  data () {
    return {
      listOfIncidents: []
    }
  },
  mounted () {
    this.getAllIncidents()
  },
  methods: {
    getAllIncidents () {
      this.$api.execute('get', 'incidentcustomerportal/get_all_incidents').then(response => {
        this.listOfIncidents = response.data
      })
    },
    goToIncidentList (incident) {
      this.$router.push(`/incident/${incident.name}/${incident._id}`)
    }
  }
}
</script>
<style scoped>
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