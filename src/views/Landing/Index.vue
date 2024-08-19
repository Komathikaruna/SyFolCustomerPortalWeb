<template>
  <div>
    <v-container class="d-flex justify-center align-center fill-height">
      <!-- Content goes here -->
       <v-row no-gutters class="mt-4">
        <v-col cols="12" class="text-center">
          <code>Our Incident Management Portal allows you to easily report, track, and resolve issues with real-time updates and comprehensive support</code>
        </v-col>
       </v-row>
      <v-row class="justify-center align-center mt-2 pa-5">
        <v-col cols="12" sm="6" md="3" lg="3" v-for="incident in listOfIncidents" :key="incident._id">
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
    </v-container>
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
