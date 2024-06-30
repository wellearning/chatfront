<!--
FileName: Reports/managerReport.vue
Author: Ge Chen
Update Date: 2024/6/26
Function: Show manager report.
-->
<template>
  <div>
    <div class="inPageTitle">
      <a class="inPageNav" href="#" @click="showMain" style="color:darkblue" title="Click here to return to the main report.">Manager C/L Report</a>
      <a v-if="producerVisible" href="#" style="color:darkblue" class="inPageNav" @click="showProducer()" title="Click here to return to the producer report."> - {{currentProducer.ProducerName}}</a>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item>
            <el-radio-group v-model="viewMonthly" size="large" @change="switchRecords()" :loading="isLoading" style="margin-top: -3px">
              <el-radio-button label="Month to Date" />
              <el-radio-button label="Year to Date" />
            </el-radio-group>
            <!--el-switch  @change="switchRecords()" :loading="isLoading "
              v-model="viewMonthly"
              active-text="View Monthly"
              inactive-text="View Yearly">
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch-->
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
    <div v-if="managerVisible" class="inPageContent">
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
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="" prop="ProducerID" width="60" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column label="" prop="ProducerName" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column label="" prop="NBCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column  prop="NBPremium" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column label="" prop="RemarketCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="" prop="RemarketPremium" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column label="" prop="RenewalCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="" prop="RenewalPremium" min-width="150" sortable="custom">
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
    </div>
    <div v-else-if="producerVisible" class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoading">
            <el-col :span="3" class="">{{currentProducer.ProducerName}} Summary: </el-col>
            <el-col :span="3">NB Counts: {{currentProducer.NBCounts}}</el-col>
            <el-col :span="4">NB Premium: ${{currentProducer.NBPremium.toLocaleString()}}</el-col>
            <el-col :span="3">Remarket Counts: {{currentProducer.RemarketCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{currentProducer.RemarketPremium.toLocaleString()}}</el-col>
            <el-col :span="3">Remarket Counts: {{currentProducer.RenewalCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{currentProducer.RenewalPremium.toLocaleString()}}</el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="applicationlist.slice((producercurrentPage - 1) * pageSize, producercurrentPage * pageSize)" empty-text="No Record" v-loading="isLoadingProducer" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="ApplicationID" width="60" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column label="Client Code" prop="ClientCode" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="Named Insured(s)" prop="NameInsured" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column label="App Type" prop="AppType" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="Company" prop="CorpName" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column label="Line of Business" prop="Title" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column label="Effective Date" min-width="120" sortable="custom">
        </el-table-column>
        <el-table-column label="Status" prop="Status" min-width="80" sortable="custom"></el-table-column>
        <el-table-column label="Premium" prop="Premium" min-width="120" sortable="custom">
        </el-table-column>

      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=producercurrentPage layout="prev, pager, next" :total=producertotal class="pageList">
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
      RemarketPremium: 2,
      RenewalCounts: 0,
      RenewalPremium: 3,
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
      isLoadingProducer: false,
      isLoadingApplication: false,
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
      // 列表
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
      managerVisible: true,
      producerVisible: false,
      applicationVisible: false,
      producers: [],
      producer: {
        ProducerID: 0,
        ProducerName: '',
        applicationList: [],
        producerSummary: {
          NBCounts: 0,
          NBPremium: 0,
          RemarketCounts: 0,
          RemarketPremium: 0,
          RenewalCounts: 0,
          RenewalPremium: 0
        }
      },
      applicationlist: [],
      currentProducer: null,
      producerSummary: {
        NBCounts: 0,
        NBPremium: 0,
        RemarketCounts: 0,
        RemarketPremium: 0,
        RenewalCounts: 0,
        RenewalPremium: 0
      },
      producercurrentPage: 1,
      producertotal: 0,
      currentApplication: {
        ApplicationID: 0,
        ClientCode: '',
        NameInsured: '',
        Score: 0,
        QualityScore: 0
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
    for (let i = 2020; i <= this.searchForm.Year; i++) {
      this.searchForm.years.push(i)
    }
    this.showMain()
    this.loadYearToDate()
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
      if (this.managerVisible) this.search()
      else this.loadProducer()
    },
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
      // this.list.sort(this.by(name))
    },
    rankdesc: function (name) {
      if (this.adminVisible) this.list.sort(this.bydesc(name))
      else {
        if (name.indexOf('Institution') >= 0) name = name.replace('Institution', 'Producer')
        this.producers.sort(this.bydesc(name))
      }
      // this.list.sort(this.bydesc(name))
    },
    prevMonth: function () {
      if (this.searchForm.Month === 1) {
        this.searchForm.Month = 12
        this.searchForm.Year--
        this.loadYearToDate()
      } else this.searchForm.Month--
      this.showMain()
    },
    nextMonth: function () {
      if (this.searchForm.Month === 12) {
        this.searchForm.Month = 1
        this.searchForm.Year++
        this.loadYearToDate()
      } else this.searchForm.Month++
      this.showMain()
    },
    changeYear: function () {
      this.loadYearToDate()
      this.showMain()
    },
    changeYearMonth: function () {
      this.showMain()
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    showMain: function () {
      this.managerVisible = true
      this.producerVisible = false
      this.applicationVisible = false
      this.search()
      this.loadMonthToDate()
    },
    showProducer: function (producer) {
      this.managerVisible = false
      this.producerVisible = true
      this.applicationVisible = false
      if (producer !== undefined) {
        this.currentProducer = producer
        this.loadProducer()
      }
    },
    loadYearToDate: function () {
      this.isLoadingYearToDate = true
      this.axios.post('/api/Services/CommerceService.asmx/GetProducerRecord_yearsummary', {year: this.searchForm.Year}).then(res => {
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
    loadMonthToDate: function () {
      this.isLoadingMonthToDate = true
      this.axios.post('/api/Services/CommerceService.asmx/GetProducerRecord_monthsummary', {year: this.searchForm.Year, month: this.searchForm.Month}).then(res => {
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
    // 查询
    search: function () {
      this.isLoading = true
      let service = '/api/Services/CommerceService.asmx/GetProducerRecords'
      let param = {year: this.searchForm.Year, month: this.searchForm.Month}
      if (this.viewMonthly === 'Year to Date') {
        service = '/api/Services/CommerceService.asmx/GetProducerRecords_year'
        param = {year: this.searchForm.Year}
      }

      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          this.list.sort(this.bydesc('NBPremium'))
          /*
          let sumofnb = 0
          let nbcounts = 0
          let remarketcounts = 0
          let sumofremarket = 0
          let sumofscore = 0
          this.list.forEach(function (c) {
            c.nbPremium = '$' + c.NBPremium.toLocaleString()
            c.remarketPremium = '$' + c.RemarketPremium.toLocaleString()
            sumofnb += c.NBPremium
            nbcounts += c.NBCounts
            sumofremarket += c.RemarketPremium
            remarketcounts += c.RemarketCounts
            sumofscore += c.ScoreAverage * (c.NBCounts + c.RemarketCounts)
          })
          let counts = nbcounts + remarketcounts
          if (counts > 0) this.ScoreAverage = Math.round(100 * sumofscore / counts) / 100
          this.NBPremium = sumofnb
          this.RemarketPremium = sumofremarket
          this.NBCounts = nbcounts
          this.RemarketCounts = remarketcounts
          */
          this.total = this.list.length
          this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    getProducer: function (producerid) {
      return this.producers.find(b => b.ProducerID === producerid)
    },
    loadProducer: function () {
      let producerid = this.currentProducer.ProducerID
      this.isLoadingProducer = true
      let service = '/api/Services/CommerceService.asmx/GetApplications_producer'
      let param = {producerid: producerid, year: this.searchForm.Year, month: this.searchForm.Month}
      if (this.viewMonthly === 'Year to Date') {
        service = '/api/Services/CommerceService.asmx/GetApplications_producer_year'
        param = {producerid: producerid, year: this.searchForm.Year}
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('查询', res)
          this.applicationlist = res.data
          this.applicationlist.forEach(function (c) {
            c.appPremium = '$' + c.PremiumOnApp.toLocaleString()
            c.submitPremium = '$' + c.Premium.toLocaleString()
          })
          this.producertotal = this.applicationlist.length
          this.producercurrentPage = 1
        }
        this.isLoadingProducer = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingProducer = false
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
