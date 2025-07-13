<!--
FileName: Reports/adminFigureReport.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show figure report as administrator role.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav"  style="color:darkblue" title="">Admin Quality Report</span>
      <span v-if="currentItem.ParameterID > -1" style="color:darkblue" class="inPageNav" href="#" title="">  - {{currentItem.Name}} Report</span>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="Report" prop="ReportItem"  v-loading="isLoadingReportItems" >
            <el-select v-model="searchForm.ReportItem" placeholder="" class="middleWidth" no-data-text="No Record" filterable @change="showMain()">
              <el-option v-for="item in reportItems" :key="item.ParameterID" :label="item.Name" :value="item.ParameterID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Producer" style="width:100px;" size="" @change="search" @keyup.enter.native="search"></el-input>
          </el-form-item>
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
    <div v-if="currentItem.ParameterID > -1" class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoading">
            <el-col :span="4" class="">Summary of {{currentItem.Name+'(Counts --- Percent)'}}: </el-col>
            <el-col :span="4">Total Counts: {{summaryCounts}}</el-col>
            <el-col v-for="s in summary" :span="4" :key="s.Name">
              {{s.Name}}: ({{s.Counts}} --- {{s.Percent}}%)
            </el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="ProducerID" width="60" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column label="Name" prop="ProducerName" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column label="Total Counts" prop="NBCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column v-for="(col, index) in tableColumns" :key="index" :label="col.Name" :prop="col.Prop" min-width="100" sortable="custom" >
          <template slot-scope="scope" >
            <span v-if="col.Prop.indexOf('Percent')>=0">{{scope.row[col.Prop]}}%</span>
            <span v-else>{{scope.row[col.Prop]}}</span>
          </template>
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
      isLoadingReportItems: false,
      isLoadingYearToDate: false,
      isLoadingMonthToDate: false,
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
      // 列表
      list: [],
      totalList: [],
      reportItems: [],
      currentItem: {ParameterID: -1, Name: ''},
      reportID: '0',
      tableColumns: [],
      summary: [],
      summaryCounts: 0,
      coverletters: [],
      coverletterproperties: [],
      currentProducer: null,
      currentCoverLetter: null,
      adminVisible: true,
      branchcurrentPage: 1,
      branchtotal: 0,
      producercurrentPage: 1,
      producertotal: 0,
      coverlettercurrentPage: 1,
      coverlettertotal: 0,
      pageSize: 10,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  mounted: function () {
    this.period = 1
    this.changePeriod()
    this.loadReportItems()
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
      if (this.reportItems.length === 0) return
      this.currentItem = this.reportItems.find(i => i.ParameterID === this.searchForm.ReportItem)
      // this.setColumns(this.currentItem)
      this.loadReport()
      // this.$forceUpdate()
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    setColumns (parameter) {
      if (parameter === undefined) return
      if (parameter.DataType === 'Check') {
        this.tableColumns = [{'Name': 'Counts of ' + parameter.DisplayName, 'Prop': 'RemarketCounts'}, {'Name': 'Percentage', 'Prop': 'Percentage'}]
        this.summary = [{'Name': parameter.DisplayName, 'Counts': 0, 'Percent': 0}]
      } else if (parameter.DataType === 'List' || parameter.DataType === 'Number') {
        this.tableColumns = []
        this.summary = []
        for (var i = 0; i < parameter.listValues.length; i++) {
          this.tableColumns.push({'Name': 'Counts of ' + parameter.listValues[i].Name, 'Prop': 'ListCounts' + i})
          this.tableColumns.push({'Name': 'Percent of ' + parameter.listValues[i].Name, 'Prop': 'ListPercent' + i})
          this.summary.push({'Name': parameter.listValues[i].Name, 'Counts': 0, 'Percent': 0})
        }
      }
    },
    loadReportItems: function () {
      this.isLoadingReportItems = true
      let service = '/api/Services/BaseService.asmx/GetFiguredBusinessParameters'
      let param = {businesstypeid: 2, processingtypeid: 1}
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('GetFiguredBusinessParameters', res)
          this.reportItems = res.data
          this.isLoadingReportItems = false
        }
      }).catch(err => {
        console.log('GetFiguredBusinessParameters出错', err)
        this.isLoadingReportItems = false
      })
    },
    compute: function () {
      this.summaryCounts = 0
      if (this.currentItem.DataType === 'List' || this.currentItem.DataType === 'Number') {
        for (var j = 0; j < this.totalList.length; j++) {
          let item = this.totalList[j]
          for (var i = 0; i < item.listValueRecords.length; i++) {
            item['ListCounts' + i] = item.listValueRecords[i].Count
            if (item.NBCounts !== 0) item['ListPercent' + i] = Math.round(item.listValueRecords[i].Count / item.NBCounts * 100)
            else item['ListPercent' + i] = 0
            this.summary[i].Counts += item.listValueRecords[i].Count
          }
          this.summaryCounts += item.NBCounts
        }
      } else if (this.currentItem.DataType === 'Check') {
        for (j = 0; j < this.totalList.length; j++) {
          let item = this.totalList[j]
          if (item.NBCounts !== 0) item['Percentage'] = Math.round(item.RemarketCounts * 100 / item.NBCounts)
          else item['Percentage'] = 0
          this.summary[0].Counts += item.RemarketCounts
          this.summaryCounts += item.NBCounts
        }
      }
      for (i = 0; i < this.summary.length; i++) {
        if (this.summaryCounts > 0) this.summary[i].Percent = Math.round(10000 * this.summary[i].Counts / this.summaryCounts) / 100
      }
    },
    search: function () {
      let query = this.searchForm.name
      if (query === null || query === '') {
        this.list = this.totalList
      } else {
        query = query.toLowerCase().trim()
        this.list = this.totalList.filter(r => r.ProducerName.toLowerCase().indexOf(query) >= 0)
      }
      this.total = this.list.length
      this.pageCount = Math.ceil(this.total / this.pageSize)
    },
    // 查询
    loadReport: function () {
      if (this.searchForm.ReportItem === null) return
      this.isLoading = true
      let startDate = this.dateFormat(this.periodDates[0])
      let endDate = this.dateFormat(this.periodDates[1])
      let service = '/api/Services/NewBusinessService.asmx/GetFigureReport_period'
      let param = {parameterid: this.searchForm.ReportItem, startdate: startDate, enddate: endDate}
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadReport', res)
          this.totalList = res.data
          if (this.currentItem.DataType === 'Number' && this.totalList.length > 0) {
            let records = this.totalList[0].listValueRecords
            this.currentItem.listValues = []
            records.forEach(r => {
              this.currentItem.listValues.push({Name: r.Name})
            })
          }
          this.setColumns(this.currentItem)
          this.compute()
          this.search()
          /*
          if (this.currentItem.DataType === 'List') {
            this.list.forEach(function (item) {
              for (var i = 0; i < item.listValueRecords.length; i++) {
                item['ListCounts' + i] = item.listValueRecords[i].Count
                if (item.NBCounts !== 0) item['ListPercent' + i] = Math.round(item.listValueRecords[i].Count / item.NBCounts * 100)
                else item['ListPercent' + i] = 0
                this.summary[i].Counts += item.listValueRecords[i].Count
              }
              this.summaryCounts += item.NBCounts
            })
            for (var i = 0; i < this.currentItem.listValue.length; i++) {
              if (this.summaryCounts > 0) this.summary[i].Percent = Math.round(this.summary[i].Counts / this.summaryCounts * 100)
            }
          } else if (this.currentItem.DataType === 'Check') {
            this.list.forEach(function (item) {
              if (item.NBCounts !== 0) item['Percentage'] = Math.round(item.RemarketCounts * 100 / item.NBCounts)
              else item['Percentage'] = 0
              this.summary[0].Counts += item.RemarketCounts
              this.summaryCounts += item.NBCounts
            })
            if (this.summaryCounts > 0) this.summary[0].Percent = Math.round(this.summary[0].Counts / this.summaryCounts * 100)
          }
          */
          this.total = this.list.length
          this.currentPage = 1
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
