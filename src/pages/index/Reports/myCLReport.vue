<!--
FileName: Reports/myCLReport.vue
Author: Ge Chen
Update Date: 2024/5/25
Function: Show my report.
-->
<template>
  <div>
    <div class="inPageTitle">
      <!--span class="inPageNav">My Report</span-->
      <a class="inPageNav" href="#" @click="showMain" style="color:darkblue" title="Click here to return to the main report.">My Commercial Report</a>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
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
            <el-select v-model="searchForm.Month" placeholder="" class="yearMonthSelection" no-data-text="No Record" filterable @change="changeYearMonth()">
              <el-option v-for="item in searchForm.months" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-arrow-right" type="default" title="Next Month" @click="nextMonth()" :loading="isLoading "></el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-if="mainVisible" class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoadingMonthToDate">
            <el-col :span="3" class="">Month to Date: </el-col>
            <el-col :span="3">NB Counts: {{monthSummary.NBCounts}}</el-col>
            <el-col :span="4">NB Premium: ${{monthSummary.NBPremium.toLocaleString()}}</el-col>
            <el-col :span="3">Remarket Counts: {{monthSummary.RemarketCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{monthSummary.RemarketPremium.toLocaleString()}}</el-col>
            <el-col :span="3">Renewal Counts: {{monthSummary.RenewalCounts}}</el-col>
            <el-col :span="4">Renewal Premium: ${{monthSummary.RenewalPremium.toLocaleString()}}</el-col>
          </el-row>
          <el-row :gutter="20" class="title" v-loading="isLoadingYearToDate">
            <el-col :span="3" class="">Year to Date: </el-col>
            <el-col :span="3">NB Counts: {{yearSummary.NBCounts}}</el-col>
            <el-col :span="4">NB Premium: ${{yearSummary.NBPremium.toLocaleString()}}</el-col>
            <el-col :span="3">Remarket Counts: {{yearSummary.RemarketCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{yearSummary.RemarketPremium.toLocaleString()}}</el-col>
            <el-col :span="3">Renewal Counts: {{yearSummary.RenewalCounts}}</el-col>
            <el-col :span="4">Renewal Premium: ${{yearSummary.RenewalPremium.toLocaleString()}}</el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="ApplicationID" width="60" fixed="left"></el-table-column>
        <el-table-column label="Client Code" prop="ClientCode" min-width="100"></el-table-column>
        <el-table-column label="Applicant" prop="NameInsured" min-width="150"></el-table-column>
        <el-table-column label="App Type" prop="AppType" min-width="100"></el-table-column>
        <el-table-column label="Company" prop="CorpName" min-width="150"></el-table-column>
        <el-table-column label="Effective Date" min-width="120">
          <template v-slot="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" prop="Status" min-width="80"></el-table-column>
        <el-table-column label="Premium" prop="Premium" min-width="120">
          <template v-slot="scope" >
            <span>${{scope.row.Premium.toLocaleString()}}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
    </div>
    <div v-else class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoading">
            <el-col :span="4" class="">ApplicationID: {{currentApplication.ApplicationID}} </el-col>
            <el-col :span="4">Client Code: {{currentApplication.ClientCode}}</el-col>
            <el-col :span="4">Name Insured: {{currentApplication.NameInsured}}</el-col>
            <el-col :span="4">Premium: ${{currentApplication.Premium.toLocaleString()}}</el-col>
            <el-col :span="4">UW Score: {{currentApplication.Score}}</el-col>
            <el-col :span="4">Quality Score: {{currentApplication.QualityScore}}</el-col>
          </el-row>
        </el-main>
      </div>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=coverlettercurrentPage layout="prev, pager, next" :total=coverlettertotal class="pageList">
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
      viewMonthly: 'Month to Date',
      totalPremium: 0,
      NBCounts: 0,
      NBPremium: 1,
      RemarketCounts: 0,
      RemarketPremium: 0,
      ScoreAverage: 0,
      EffectiveDate: null,
      isAnswering: false,
      isPost: false,
      totalNum: 0,
      finishNum: 0,
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      // printObj: {
      //   id: 'pdfDom',
      //   popTitle: ''
      // },
      htmlTitle: 'null', // pdf文件名
      isLoading: false,
      isLoadingYearToDate: false,
      isLoadingMonthToDate: false,
      // 搜索
      searchForm: {
        name: null,
        Year: 2022,
        Month: 1,
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
      searchName: null,
      mainVisible: true,
      // 列表
      tempList: [],
      list: [],
      yearSummary: {
        NBCounts: 0,
        NBPremium: 0,
        RemarketCounts: 0,
        RemarketPremium: 0,
        RenewalCounts: 0,
        RenewalPremium: 0
      },
      monthSummary: {
        NBCounts: 0,
        NBPremium: 0,
        RemarketCounts: 0,
        RemarketPremium: 0,
        RenewalCounts: 0,
        RenewalPremium: 0
      },
      showRecord: 'Show Year',
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  mounted: function () {
    this.searchForm.Year = new Date().getFullYear()
    this.searchForm.Month = new Date().getMonth() + 1
    for (var i = 2020; i <= this.searchForm.Year; i++) {
      this.searchForm.years.push(i)
    }
    this.search()
    this.loadYearToDate()
    this.loadMonthToDate()
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
    switchRecords: function () {
      this.search()
    },
    prevMonth: function () {
      if (this.searchForm.Month === 1) {
        this.searchForm.Month = 12
        this.searchForm.Year--
        this.loadYearToDate()
      } else this.searchForm.Month--
      this.search()
      this.loadMonthToDate()
    },
    nextMonth: function () {
      if (this.searchForm.Month === 12) {
        this.searchForm.Month = 1
        this.searchForm.Year++
        this.loadYearToDate()
      } else this.searchForm.Month++
      this.search()
      this.loadMonthToDate()
    },
    changeYear: function () {
      this.loadYearToDate()
      this.loadMonthToDate()
      this.search()
    },
    changeYearMonth: function () {
      this.search()
      this.loadMonthToDate()
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    showMain: function () {
      this.mainVisible = true
      this.search()
    },
    loadMonthToDate: function () {
      this.isLoadingMonthToDate = true
      this.axios.post('/api/Services/CommerceService.asmx/GetProducerRecord_producermonthsummary', {year: this.searchForm.Year, month: this.searchForm.Month}).then(res => {
        if (res) {
          console.log('查询', res)
          this.monthSummary = res.data
        }
        this.isLoadingMonthToDate = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingMonthToDate = false
      })
    },

    loadYearToDate: function () {
      this.isLoadingYearToDate = true
      this.axios.post('/api/Services/CommerceService.asmx/GetProducerRecord_produceryearsummary', {year: this.searchForm.Year}).then(res => {
        if (res) {
          console.log('查询', res)
          this.yearSummary = res.data
        }
        this.isLoadingYearToDate = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingYearToDate = false
      })
    },
    // 查询
    search: function () {
      this.isLoading = true
      let service = '/api/Services/CommerceService.asmx/GetMyApplications_month'
      let param = {year: this.searchForm.Year, month: this.searchForm.Month}
      if (this.viewMonthly === 'Year to Date') {
        service = '/api/Services/CommerceService.asmx/GetMyApplications_year'
        param = {year: this.searchForm.Year}
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          this.total = this.list.length
          this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search(null)
    }

  }
}
</script>

<style scoped>

</style>
