<!--
FileName: Reports/auditReport.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show audit report as administrator role.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav"  style="color:darkblue" title="">Audit Report</span>
      <a v-if="reportGrade > 0" style="color:darkblue" class="inPageNav" href="#" @click="showMain()" title="Click here to return to the audit report.">  - {{currentItem.Name}}</a>
      <!--span v-if="currentItem.id > -1" style="color:darkblue" class="inPageNav" href="#" title="">  - {{currentItem.Name}} Report</span-->
      <span v-if="reportGrade > 1" class="inPageNav"> - {{currentAudit.Name}}</span>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="Report" prop="ReportItem"  v-loading="isLoadingReportItems" >
            <el-select v-model="searchForm.ReportItem" placeholder="" class="middleWidth" no-data-text="No Record" filterable @change="showMain()">
              <el-option v-for="item in reportItems" :key="item.id" :label="item.Name" :value="item.id"></el-option>
            </el-select>
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
          <el-form-item>
            <!--el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingInsuranceCompany" size="small">Reset</el-button-->
            <el-button icon="el-icon-refresh" @click="exportExcel()" :loading="isDownloading" size="small">ToExcel</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-if="currentItem.id > -1" class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoading">
            <!--el-col :span="4" class="">Summary of {{currentItem.Name}}: </el-col>
            <el-col :span="4">Members of Audit: {{total}}</el-col>
            <el-col :span="4">Total Counts: {{totalAuditCounts}}</el-col>
            <el-col :span="4">Total Score: {{totalQualityScore}}</el-col-->
            <el-col v-for="s in summary" :span="4" :key="s.Name">
              {{s.Name}}: {{s.Value}}
            </el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column v-for="(col, index) in tableColumns" :key="index" :label="col.Name" :prop="col.Prop" min-width="100" sortable="custom" >
          <template v-slot="scope" >
            <span v-if="col.Prop.indexOf('Percent')>=0">{{scope.row[col.Prop]}}%</span>
            <span v-else>{{scope.row[col.Prop]}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="reportGrade === 1" label="Detail" prop="" min-width="80">
          <template v-slot="scope" >
            <a @click = "showAuditRecords(scope.row)" href="#" style="color:darkblue" title="Click here to show the details.">detail</a>
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
      isDownloading: false,
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
      reportItems: [{'id': 2, 'Name': 'Uploaded Audit'}, {'id': 4, 'Name': 'Underwriting Audit'}],
      currentItem: {id: -1, Name: ''},
      reportID: '0',
      tableColumns: [],
      summary: [],
      businessParameters: [],
      currentAudit: null,
      currentCoverLetter: null,
      // adminVisible: true,
      reportGrade: 0, // identify audit report(grade 1) or audit detail (grade 2)
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
        // this.currentTemplates = this.currentTemplates.sort((a, b) => { return a.orderId - b.orderId })
        this.setNumber()
        this.totalNum = 0
        this.finishNum = 0
        this.isPost = false
        this.isLoading = false
      }
    }
  },
  methods: {
    exportExcel: function () {
      this.isDownloading = true
      let startDate = this.dateFormat(this.periodDates[0])
      let endDate = this.dateFormat(this.periodDates[1])
      let audittype = 'PlAuditUW'
      if (this.currentItem.id === 2) audittype = 'PlAuditUpload'
      let tablename = 'auditRecords.xlsx'
      this.downloadData(audittype, startDate, endDate, tablename, this)
    },
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
    },
    rank: function (name) {
      if (this.reportGrade === 1) this.list.sort(this.by(name))
      else {
        if (name.indexOf('Institution') >= 0) name = name.replace('Institution', 'Producer')
        this.producers.sort(this.by(name))
      }
    },
    rankdesc: function (name) {
      // this.list.sort(this.bydesc(name))
      if (this.reportGrade === 1) this.list.sort(this.bydesc(name))
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
    loadBusinessParameters: function () {
      this.isLoadingReportItems = true
      let service = '/api/Services/BaseService.asmx/GetFiguredBusinessParameters'
      let param = {businesstypeid: 2, processingtypeid: this.currentItem.id}
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('查询', res)
          this.businessParameters = res.data
          this.isLoadingReportItems = false
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingReportItems = false
      })
    },
    compute: function () {
      let totalAuditCounts = 0
      let totalCounts = 0
      let totalQualityScore = 0
      this.list.forEach(function (r) {
        totalAuditCounts += r.AuditCounts
        totalCounts += r.Counts
        totalQualityScore += r.QualityScore
      })
      if (this.currentItem.id === 2) {
        this.summary = [
          {'Name': 'Summary of ' + this.currentItem.Name, 'Value': ''},
          {'Name': 'Members of Audit', 'Value': this.total},
          {'Name': 'Total AuditCounts', 'Value': totalAuditCounts},
          {'Name': 'Total Score', 'Value': totalQualityScore}
        ]
      } else if (this.currentItem.id === 4) {
        this.summary = [
          {'Name': 'Summary of ' + this.currentItem.Name, 'Value': ''},
          {'Name': 'Members of Audit', 'Value': this.total},
          {'Name': 'Total Counts', 'Value': totalCounts},
          {'Name': 'Total AuditCounts', 'Value': totalAuditCounts},
          {'Name': 'Total Score', 'Value': totalQualityScore}
        ]
      }
    },
    showMain: function () {
      // this.adminVisible = true
      this.reportGrade = 1
      if (this.reportItems.length === 0) return
      if (this.searchForm.ReportItem === null) return
      this.currentItem = this.reportItems.find(i => i.id === this.searchForm.ReportItem)
      this.setColumns(this.currentItem)
      this.loadBusinessParameters()
      this.search()
      // this.$forceUpdate()
    },
    showAuditRecords: function (row) {
      // this.adminVisible = false
      this.reportGrade = 2
      this.currentAudit = row
      this.setDetailColumns()
      this.loadAuditRecords(row)
      this.summary = [
        {'Name': 'Summary of ' + this.currentAudit.Name, 'Value': ''},
        {'Name': 'Counts', 'Value': this.currentAudit.Counts},
        {'Name': 'Audit Counts', 'Value': this.currentAudit.AuditCounts},
        {'Name': 'Total Score', 'Value': this.currentAudit.QualityScore},
        {'Name': 'Average Score', 'Value': this.currentAudit.f}
      ]
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    setColumns: function (reportitem) {
      if (reportitem === undefined) return
      if (reportitem.id === 2) {
        this.tableColumns = [{'Name': 'Uploaded by ', 'Prop': 'Name'},
          {'Name': 'Counts', 'Prop': 'Counts'},
          {'Name': 'Audit Counts', 'Prop': 'AuditCounts'},
          {'Name': 'Total Score', 'Prop': 'QualityScore'},
          {'Name': 'Average Score', 'Prop': 'AverageScore'}]
        // this.summary = [{'Name': 'Summary of Upload', 'Counts': 0, 'Percent': 0}]
      } else if (reportitem.id === 4) {
        this.tableColumns = [{'Name': 'Underwriting by ', 'Prop': 'Name'},
          {'Name': 'Counts', 'Prop': 'Counts'},
          {'Name': 'Audit Counts', 'Prop': 'AuditCounts'},
          {'Name': 'Total Score', 'Prop': 'QualityScore'},
          {'Name': 'Average Score', 'Prop': 'AverageScore'}]
        // this.summary = [{'Name': 'Summary of Underwriting', 'Counts': 0, 'Percent': 0}]
      }
    },
    setDetailColumns: function () {
      let columns = [
        {'Name': 'CoverLetterID', 'Prop': 'CoverLetterID'},
        {'Name': 'Score', 'Prop': 'QualityScore'}]
      this.businessParameters.forEach(function (p) {
        let col = {'Name': p.Name, 'Prop': p.Name}
        columns.push(col)
      })
      this.tableColumns = columns
    },
    // 查询
    search: function () {
      if (this.currentItem === undefined) return
      this.isLoading = true
      let startDate = this.dateFormat(this.periodDates[0])
      let endDate = this.dateFormat(this.periodDates[1])
      let service = '/api/Services/NewBusinessService.asmx/GetAuditReport'
      let param = {processingtypeid: this.currentItem.id, startdate: startDate, enddate: endDate}
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          this.total = this.list.length
          this.currentPage = 1
          this.compute()
          this.isLoading = false
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    loadAuditRecords: function (row) {
      if (row === undefined) return
      this.isLoading = true
      let startDate = this.dateFormat(this.periodDates[0])
      let endDate = this.dateFormat(this.periodDates[1])
      let service = '/api/Services/NewBusinessService.asmx/GetAuditRecords'
      let param = {name: row.Name, processingtypeid: this.currentItem.id, startdate: startDate, enddate: endDate}
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          this.list.forEach(function (r) {
            r.properties.forEach(function (p) {
              r[p.Name] = p.QualityScore
            })
          })
          this.total = this.list.length
          this.currentPage = 1
          // this.compute()
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
