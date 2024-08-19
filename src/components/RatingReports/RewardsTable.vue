<template>
  <div>
    <!-- <v-simple-table class="custom-table">
      <template v-slot:default>
        <tbody>
          <tr>
            <th></th>
            <th colspan="5" style="background-color: #303F9F;color:white">Bob</th>
            <th colspan="5" style="background-color: #303F9F;color:white">Alice</th>
            <th></th>
          </tr>
          <tr class="apply-bg-color">
            <th rowspan="2">Bugs</th>
            <th>Understanding</th>
            <th>Communication</th>
            <th>Deadline</th>
            <th>Work</th>
            <th>Understanding</th>
            <th>Communication</th>
            <th>Deadline</th>
            <th>Work</th>
            <th>Total</th>
          </tr>
          <tr>
            <td>17</td>
            <td>16</td>
            <td>15</td>
            <td>14</td>
            <td>13</td>
            <td>12</td>
            <td>11</td>
            <td>18</td>
            <td>18</td>
          </tr>
          <tr>
            <th rowspan="2" class="apply-bg-color">Tasks</th>
            <td>17</td>
            <td>16</td>
            <td>15</td>
            <td>14</td>
            <td>13</td>
            <td>12</td>
            <td>11</td>
            <td>18</td>
            <td>18</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table> -->
    <span>{{payload.GroupByHeader}}</span>
    <table border="2" cellpadding="10" style="width:50%">
    <thead>
       <tr>
        <th :rowspan="columnMainHeader.length"></th>
      </tr>
      <tr></tr>
      <tr>
        <th colspan="2" v-for="(colName, index) in columnMainHeader" :key="index">{{colName}}</th>
      </tr>
    </thead>
  </table>
  <!-- <table border="3">
  <colgroup>
    <col style="width: 100px;">
    <col style="width: 200px;">
    <col style="width: 150px;">
  </colgroup>
  <tr>
    <th>Header 1</th>
    <th>Header 2</th>
    <th>Header 3</th>
  </tr>
  <tr>
    <td>Data 1</td>
    <td>Data 2</td>
    <td>Data 3</td>
  </tr>
</table> -->

  </div>
</template>
<script>
export default {
  props: {
    payload: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      headers: [
        { label: 'Header 1', colspan: 2 },
        { label: 'Header 2', colspan: 1 },
        { label: 'Header 3', colspan: 1 }
      ],
      groupedData: [
        [
          {
            value: 'Group 1',
            groupLevel2: [
              {
                value: 'Group 2',
                groupLevel3: [
                  { value: 'Group 3-1' },
                  { value: 'Group 3-2' }
                ]
              },
              {
                value: 'Group 2',
                groupLevel3: [
                  { value: 'Group 3-3' },
                  { value: 'Group 3-4' }
                ]
              }
            ]
          },
          {
            value: 'Group 1',
            groupLevel2: [
              {
                value: 'Group 2',
                groupLevel3: [
                  { value: 'Group 3-5' },
                  { value: 'Group 3-6' }
                ]
              }
            ]
          }
        ]
      ]
    }
  },
  methods: {
    getData (row, status, assignedTo, type) {
      // Perform your dynamic logic to fetch or generate data for each cell
      // You can access the necessary values based on the provided parameters
      // Return the data to be displayed in the cell
    }
  },
  computed: {
    columnMainHeader () {
      let getHeaders = Object.keys(this.payload.GroupByHeader.col)
      let getFirstElement = getHeaders[0]
      let result = this.payload.GroupByHeader.col[getFirstElement]
      return result
    }
  }
}
</script>

<style>
.custom-table table {
  border-collapse: collapse;
}

.custom-table th,
.custom-table td {
  /* border: 2px solid #e0e0e0; */
   border: 2px solid #BDBDBD;
}
.apply-bg-color {
  background-color: #E8EAF6 !important;
}
</style>
