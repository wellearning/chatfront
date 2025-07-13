<!--
FileName: Reports/adminCoverLetterReport.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show cover letter report as administrator role.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav" href="#" style="color:darkblue" title="Click here to return to the main report.">{{reportTitle}}</span>
      <span v-if="adminVisible" style="color:darkblue" class="inPageNav" href="#" title="Click here to return to the branch report.">  - {{currentItem.value}} Report</span>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="Report" prop="ReportItem">
            <el-select v-model="searchForm.ReportItem" placeholder="" class="yearMonthSelection" no-data-text="No Record" filterable @change="showMain()">
              <el-option v-for="item in reportItems" :key="item.key" :label="item.value" :value="item.key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-radio-group v-model="viewMonthly" size="large" @change="switchRecords()" :loading="isLoading" style="margin-top: -3px">
              <el-radio-button label="Month to Date" />
              <el-radio-button label="Year to Date" />
            </el-radio-group>
            <el-button icon="el-icon-arrow-left" type="default" title="Prev Month" @click="prevMonth()" :loading="isLoading "></el-button>
          </el-form-item>
          <el-form-item label="Year" prop="Year">
            <el-select v-model="searchForm.Year" placeholder="" class="yearMonthSelection" no-data-text="No Record" filterable @change="changeYear()">
              <el-option v-for="item in searchForm.years" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Month" prop="Month">
            <el-select v-model="searchForm.Month" class="yearMonthSelection" placeholder="" no-data-text="No Record" filterable @change="changeYearMonth()">
              <el-option v-for="item in searchForm.months" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-arrow-right" type="default" title="Next Month" @click="nextMonth()" :loading="isLoading "></el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-if="adminVisible" class="inPageContent">
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="ID" width="60" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column label="Name" prop="Name" min-width="200" sortable="custom">
          <!--template slot-scope="scope" >
            <a @click = "showBranch(scope.row)" style="color:darkblue" href="#" title="Click here to show the branch detail.">{{scope.row.Name}}</a>
          </template-->
        </el-table-column>
        <el-table-column label="NB Counts" prop="NBCounts" min-width="100" sortable="custom">
          <!--template slot="header" >
            <span @click = "rank('NBCounts')" @dblclick="rankdesc('NBCounts')" title="Click to rank, double click to rank desc">NB Counts</span>
          </template-->
        </el-table-column>
        <el-table-column label="NB Premium" prop="NBPremium" min-width="150" sortable="custom">
          <template slot-scope="scope" >
            <span>${{scope.row.NBPremium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Remarket Counts" prop="RemarketCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="Remarket Premium" prop="RemarketPremium" min-width="150" sortable="custom">
          <template slot-scope="scope" >
            <span>${{scope.row.RemarketPremium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="businessLineID===2" label="Renewal Counts" prop="RenewalCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column v-if="businessLineID===2" label="Renewal Premium" prop="RenewalPremium" min-width="150" sortable="custom">
          <template slot-scope="scope" >
            <span>${{scope.row.RenewalPremium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Total Counts" prop="Counts" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column label="Total Premium" prop="Premium" min-width="150" sortable="custom">
          <template slot-scope="scope" >
            <span>${{scope.row.Premium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="businessLineID === 2" label="Action" min-width="100">
          <template v-slot="scope">
            <el-button-group>
              <el-button icon="el-icon-view" type="primary" @click="showReportDetail(scope.row)" :loading="isLoading" size="small">Detail</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------CSIO List 弹窗开始----------------------------------------------------->
      <el-dialog z-index="5" title="Report Detail" :visible.sync="reportDetailVisible" width="1500px" center>
        <ReportDetail ref="rd" :reportItem="reportItem" :itemID="itemID" :year="searchForm.Year" :month="searchForm.Month"></ReportDetail>
      </el-dialog>
      <!----------------------------------------------SCSIO List弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import ReportDetail from '@/component/window/clReportDetail'

export default {
  components: {
    ReportDetail
  },
  data: function () {
    return {
      reportTitle: 'P/L Business Report',
      viewMonthly: 'Month to Date',
      isLoading: false,
      isLoadingYearToDate: false,
      isLoadingMonthToDate: false,
      reportDetailVisible: false,
      reportItem: 'Company',
      itemID: 0,
      businessLineID: 1,
      // 搜索
      searchForm: {
        name: null,
        Year: 2022,
        Month: 1,
        ReportItem: 'Corperation',
        years: [],
        months: [
          {name: 'January', value: 1},
          {name: 'February', value: 2},
          {name: 'March', value: 3},
          {name: 'April', value: 4},
          {name: 'May', value: 5},
          {name: 'June', value: 6},
          {name: 'July', value: 7},
          {name: 'August', value: 8},
          {name: 'September', value: 9},
          {name: 'October', value: 10},
          {name: 'November', value: 11},
          {name: 'December', value: 12}]
      },
      // 列表
      list: [],
      reportItems: [ {key: 'Corperation', value: 'Company'}, {key: 'InsuranceType', value: 'Business Line'}, {key: 'Template', value: 'Template'}, {key: 'Portfolio', value: 'RemarkFrom'} ],
      currentItem: {key: 'Corperation', value: 'Company'},
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
    this.presets()
    this.loadReportItems()
    this.searchForm.Year = new Date().getFullYear()
    this.searchForm.Month = new Date().getMonth() + 1
    for (let i = 2020; i <= this.searchForm.Year; i++) {
      this.searchForm.years.push(i)
    }
    this.search()
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
    rankbranch: function (name) {
      this.producers.sort(this.by(name))
    },
    rankdescbranch: function (name) {
      this.producers.sort(this.bydesc(name))
    },
    crank: function (name) {
      this.coverletters.sort(this.by(name))
    },
    crankdesc: function (name) {
      this.coverletters.sort(this.bydesc(name))
    },
    prevMonth: function () {
      if (this.searchForm.Month === 1) {
        this.searchForm.Month = 12
        this.searchForm.Year--
      } else this.searchForm.Month--
      this.showMain()
    },
    nextMonth: function () {
      if (this.searchForm.Month === 12) {
        this.searchForm.Month = 1
        this.searchForm.Year++
      } else this.searchForm.Month++
      this.showMain()
    },
    changeYear: function () {
      this.showMain()
    },
    changeYearMonth: function () {
      this.showMain()
    },
    switchRecords: function () {
      this.search()
    },
    showMain: function () {
      this.adminVisible = true
      this.currentItem = this.reportItems.find(i => i.key === this.searchForm.ReportItem)
      this.search()
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    loadReportItems: function () {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetReportItem', {businesslineid: this.businessLineID}).then(res => {
        if (res) {
          console.log('reportItems', res)
          // this.reportItems = res.data
          if (res.data.length > 0) {
            let list = []
            res.data.forEach(item => {
              list.push({key: item.ItemValue, value: item.Name})
            })
            this.reportItems = list
          }
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadReportItems error', err)
        this.isLoading = false
      })
    },

    presets: function () {
      this.businessLineID = Number(this.$route.params.id)
      if (this.businessLineID === 2) this.reportTitle = 'C/L Business Report'
      if (this.businessLineID === 1) {
        this.reportItems = [{key: 'Corperation', value: 'Company'}, {key: 'InsuranceType', value: 'Business Line'}, {key: 'Template', value: 'Template'}, {key: 'RemarketFrom', value: 'Portfolio'}]
      } else if (this.businessLineID === 2) {
        this.reportItems = [{key: 'Corperation', value: 'Company'}, {key: 'Template', value: 'Template'}]
      }
    },
    // 查询
    search: function () {
      this.isLoading = true
      // let service = '/api/Services/NewBusinessService.asmx/Get' + this.searchForm.ReportItem + 'Records'
      // let param = {year: this.searchForm.Year, month: this.searchForm.Month}
      let service = '/api/Services/NewBusinessService.asmx/GetReportItemRecords'
      let param = {reportitem: this.searchForm.ReportItem, year: this.searchForm.Year, month: this.searchForm.Month}
      let lineId = this.businessLineID
      if (lineId === 2) {
        service = '/api/Services/CommerceService.asmx/Get' + this.searchForm.ReportItem + 'Records'
        param = {year: this.searchForm.Year, month: this.searchForm.Month}
        // service = service.replace('NewBusinessService', 'CommerceService')
      }
      if (this.viewMonthly === 'Year to Date') {
        service += '_year'
        param = {year: this.searchForm.Year}
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('查询', res)
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
          this.isLoading = false
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    showReportDetail: function (row) {
      this.itemID = row.ID
      this.reportItem = this.currentItem.value
      this.reportDetailVisible = true
      if (this.$refs.rd !== undefined) {
        this.$refs.rd.loadRecords(this.reportItem, this.itemID, this.searchForm.Year, this.searchForm.Month)
      }
    }
  }
}
</script>

<style scoped>

</style>
