<template>
    <div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="ID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Name" prop="Name" min-width="150" sortable="custom"></el-table-column>
        <el-table-column label="NB Counts" prop="NBCounts" min-width="100" sortable="custom">
          <!--template slot="header" >
            <span @click = "rank('NBCounts')" @dblclick="rankdesc('NBCounts')" title="Click to rank, double click to rank desc">NB Counts</span>
          </template-->
        </el-table-column>
        <el-table-column label="NB Premium" prop="NBPremium" min-width="150" sortable="custom">
          <template v-slot="scope" >
            <span>${{scope.row.NBPremium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Remarket Counts" prop="RemarketCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="Remarket Premium" prop="RemarketPremium" min-width="150" sortable="custom">
          <template v-slot="scope" >
            <span>${{scope.row.RemarketPremium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="businessLineID===2" label="Renewal Counts" prop="RenewalCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column v-if="businessLineID===2" label="Renewal Premium" prop="RenewalPremium" min-width="150" sortable="custom">
          <template v-slot="scope" >
            <span>${{scope.row.RenewalPremium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Total Counts" prop="Counts" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column label="Total Premium" prop="Premium" min-width="150" sortable="custom">
          <template v-slot="scope" >
            <span>${{scope.row.Premium.toLocaleString()}}</span>
          </template>
        </el-table-column>
      </el-table>

    </div>
</template>

<script>
export default {
  name: 'usedBlockList',
  data: function () {
    return {
      list: [],
      businessLineID: 1,
      isLoading: false,
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  props: {
    reportItem: {
      type: String
    },
    itemID: {
      type: Number
    },
    year: {
      type: Number
    },
    month: {
      type: Number
    }
  },
  mounted: function () {
    this.businessLineID = Number(this.$route.params.id)
    this.loadRecords(this.reportItem, this.itemID, this.year, this.month)
  },
  methods: {
    start: function () {
      console.log('start')
    },
    loadRecords: function (reportitem, id, year, month) {
      this.isLoading = true
      let lineId = this.businessLineID
      this.axios.post('/api/Services/commerceservice.asmx/GetReportRecords_Corp', {reportitem: reportitem, itemid: id, year: year, month: month}).then(res => {
        if (res) {
          console.log('loadRecords', res)
          this.list = res.data
          this.list.forEach(function (item) {
            if (lineId === 2) {
              item.Counts = item.NBCounts + item.RemarketCounts + item.RenewalCounts
              item.Premium = item.NBPremium + item.RemarketPremium + item.RenewalPremium
            } else {
              item.Counts = item.NBCounts + item.RemarketCounts
              item.Premium = item.NBPremium + item.RemarketPremium
            }
          })
          this.total = this.list.length
          this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadRecords', err)
        this.isLoading = false
      })
    },
    // 关闭Pink Slip
    close: function (done) {
      this.list = []
    }

  }

}
</script>

<style scoped>

</style>
