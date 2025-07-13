<!--
FileName: Reports/adminFigureReport.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show figure report as administrator role.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav"  style="color:darkblue" title="">Producer Quality Report</span>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item>
            <el-date-picker @change="showMain()"
              v-model="periodDates" class="middleWidth"
              type="daterange"
              unlink-panels
              placeholder="StartDate">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="Frequently Used" prop="Year">
            <el-select v-model="period" placeholder="" class="middleWidth" no-data-text="No Record" filterable @change="changePeriod()">
              <el-option v-for="item in searchForm.periods" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="inPageContent">
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading"
                element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable"
                row-key="ProducerID" :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
        <el-table-column label="ID" prop="ProducerID" width="200" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column label="Name" prop="ProducerName" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column label="Counts" prop="RemarketCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="Total Counts" prop="NBCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="Percentage" prop="Percentage" min-width="100" sortable="custom">
          <template v-slot="scope"><span>{{scope.row.Percentage === '-' ? '-' : scope.row.Percentage + '%'}}</span></template>
        </el-table-column>
        <!--el-table-column label="Avg Counts" prop="RemarketPremium" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="Avg Total Counts" prop="NBPremium" min-width="100" sortable="custom">
        </el-table-column-->
        <el-table-column label="Avg Percentage" prop="Percentage_avg" min-width="100" sortable="custom">
          <template v-slot="scope"><span>{{scope.row.Percentage_avg === '-' ? '-' : scope.row.Percentage_avg + '%'}}</span></template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  components: {
  },
  data: function () {
    return {
      viewMonthly: 'View Monthly',
      isLoading: false,
      periodDates: '',
      endDate: '2023-2-1',
      period: 1,
      // 搜索
      searchForm: {
        name: null,
        ReportItem: null,
        periods: [
          {name: 'Month to Date', value: 1},
          {name: 'Year to Date', value: 2},
          {name: 'Last 30 Days', value: 30},
          {name: 'Last 90 Days', value: 90},
          {name: 'Last 182 Days', value: 182},
          {name: 'Last 365 Days', value: 365}]
      },
      businessParameters: [],
      // 列表
      list: [],
      summary: [],
      summaryCounts: 0,
      currentProducer: null,
      currentCoverLetter: null,
      adminVisible: true,
      pageSize: 10,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  mounted: function () {
    this.period = 1
    this.changePeriod()
  },
  watch: {
    finishNum (val) {
      if (val === this.totalNum && this.isPost) {
        this.currentTemplates = this.currentTemplates.sort((a, b) => { return a.orderId - b.orderId })
        this.setNumber()
        this.totalNum = 0
        this.finishNum = 0
        this.isPost = false
        this.isLoading = false
      }
    }
  },
  methods: {
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
    },
    rank: function (name) {
      if (this.adminVisible) this.list.sort(this.by(name))
      else {
        if (name.indexOf('Institution') >= 0) name = name.replace('Institution', 'Producer')
        this.producers.sort(this.by(name))
      }
    },
    rankdesc: function (name) {
      // this.list.sort(this.bydesc(name))
      if (this.adminVisible) this.list.sort(this.bydesc(name))
      else {
        if (name.indexOf('Institution') >= 0) name = name.replace('Institution', 'Producer')
        this.producers.sort(this.bydesc(name))
      }
    },
    changePeriod: function () {
      if (this.period === 1) {
        let year = new Date().getFullYear()
        let month = new Date().getMonth()
        let startDate = new Date(year, month, 1)
        let endDate = new Date()
        this.periodDates = [startDate, endDate]
      } else if (this.period === 2) {
        let year = new Date().getFullYear()
        let startDate = new Date(year, 0, 1)
        let endDate = new Date()
        this.periodDates = [startDate, endDate]
      } else {
        let now = new Date().getTime()
        let startDate = new Date(now - this.period * 24 * 60 * 60 * 1000)
        let endDate = new Date()
        this.periodDates = [startDate, endDate]
      }
      this.showMain()
    },
    showMain: function () {
      this.adminVisible = true
      this.search()
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    loadBusinessParameters: function () {
      this.isLoadingReportItems = true
      let service = '/api/Services/BaseService.asmx/GetFiguredBusinessParameters'
      let param = {businesstypeid: 2, processingtypeid: 1}
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('GetFiguredBusinessParameters', res)
          this.businessParameters = res.data
          this.isLoadingReportItems = false
        }
      }).catch(err => {
        console.log('GetFiguredBusinessParameters出错', err)
        this.isLoadingReportItems = false
      })
    },
    setChildren: function (records) {
      records.forEach(r => {
        r.Percentage = r.NBCounts === 0 ? '-' : r.QualityScore
        r.Percentage_avg = r.NBPremium === 0 ? '-' : r.ScoreAverage
        if (r.listValueRecords === null) return
        r.children = []
        let index = 0
        r.listValueRecords.forEach(lvr => {
          // r.RemarketCounts += lvr.Count
          index++
          let child = {
            ProducerID: r.ProducerID + '_' + index,
            ProducerName: lvr.Name,
            RemarketCounts: lvr.Count,
            NBCounts: r.NBCounts,
            Percentage: r.NBCounts === 0 ? '-' : lvr.Percentage,
            RemarketPremium: lvr.Premium,
            NBPremium: r.NBPremium,
            Percentage_avg: r.NBPremium === 0 ? '-' : lvr.Score
          }
          r.children.push(child)
        })
      })
    },
    // 查询
    search: function () {
      this.isLoading = true
      let startDate = this.dateFormat(this.periodDates[0])
      let endDate = this.dateFormat(this.periodDates[1])
      let service = '/api/Services/NewBusinessService.asmx/GetProducerFigureReport_period'
      let param = {startdate: startDate, enddate: endDate}
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('查询', res)
          this.setChildren(res.data)
          this.list = res.data
          this.total = this.list.length
          this.currentPage = 1
          this.isLoading = false
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    loadAverageData: function () {
      this.isLoading = true
      let startDate = this.dateFormat(this.periodDates[0])
      let endDate = this.dateFormat(this.periodDates[1])
      let service = '/api/Services/NewBusinessService.asmx/GetAvgFigureReport_period'
      let param = {startdate: startDate, enddate: endDate}
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('查询', res)
          this.setChildren(res.data)
          this.isLoading = false
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    }

  }
}
</script>

<style scoped>

</style>
