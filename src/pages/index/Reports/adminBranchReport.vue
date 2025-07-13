<!--
FileName: Reports/adminBranchReport.vue
Author: Ge Chen
Create Date: 2023/9/20
Function: Show branch report as administrator role.
-->
<template>
  <div>
    <div class="inPageTitle">
      <a class="inPageNav" href="#" @click="showMain" style="color:darkblue" title="Click here to return to the main report.">{{reportTitle}}</a>
      <a v-if="branchVisible||producerVisible||coverLetterVisible" style="color:darkblue" class="inPageNav" href="#" @click="showBranch()" title="Click here to return to the branch report.">  - {{currentBranch.InstitutionName}}</a>
      <a v-if="producerVisible||coverLetterVisible" href="#" style="color:darkblue" class="inPageNav" @click="showProducer()" title="Click here to return to the producer report."> - {{currentProducer.ProducerName}}</a>
      <span v-if="coverLetterVisible" class="inPageNav"> - {{currentCoverLetter.ClientCode}}</span>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <!--el-form-item label="BusinessLine" prop="BusinessLineID">
            <el-select v-model="btypeId" placeholder="" class="yearMonthSelection" no-data-text="No Record" filterable @change="showMain()">
              <el-option v-for="item in businessLines" :key="item.key" :label="item.value" :value="item.key"></el-option>
            </el-select>
          </el-form-item-->
          <el-form-item>
            <!--el-checkbox v-if="branchVisible" v-model="showAll" label="Show All" size="large" border @change="switchRecords()"/-->
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
            <el-select v-model="searchForm.Month" class="yearMonthSelection" placeholder="" no-data-text="No Record" filterable @change="changeYearMonth()">
              <el-option v-for="item in searchForm.months" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-arrow-right" type="default" title="Next Month" @click="nextMonth()" :loading="isLoading "></el-button>
            <!--el-button icon="el-icon-plus" type="primary" @click="nextMonth()" :loading="isLoading ">Next Month</el-button-->
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-if="adminVisible" class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoadingMonthToDate">
            <el-col :span="2" class="">Month to Date: </el-col>
            <el-col :span="3">NB(including LOA, X-New) Counts: {{monthSummary.NBCounts}}</el-col>
            <el-col :span="3">NB Premium: ${{monthSummary.NBPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Remarket(including rewrite) Counts: {{monthSummary.RemarketCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{monthSummary.RemarketPremium.toLocaleString()}}</el-col>
            <el-col :span="4" v-if="btypeId === 4">Renewal Counts: {{monthSummary.RenewalCounts}}</el-col>
            <el-col :span="4" v-if="btypeId === 4">Renewal Premium: ${{monthSummary.RenewalPremium.toLocaleString()}}</el-col>
            <el-col :span="4" v-if="btypeId === 2">Score Average: {{monthSummary.ScoreAverage}}</el-col>
          </el-row>
          <el-row :gutter="20" class="title" v-loading="isLoadingYearToDate">
            <el-col :span="2" class="">Year to Date: </el-col>
            <el-col :span="3">NB Counts: {{yearSummary.NBCounts}}</el-col>
            <el-col :span="3">NB Premium: ${{yearSummary.NBPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Remarket Counts: {{yearSummary.RemarketCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{yearSummary.RemarketPremium.toLocaleString()}}</el-col>
            <el-col :span="4" v-if="btypeId === 4">Renewal Counts: {{yearSummary.RenewalCounts}}</el-col>
            <el-col :span="4" v-if="btypeId === 4">Renewal Premium: ${{yearSummary.RenewalPremium.toLocaleString()}}</el-col>
            <el-col :span="4" v-if="btypeId === 2">Score Average: {{yearSummary.ScoreAverage}}</el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="InstitutionID" width="60" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column label="Name" prop="InstitutionName" min-width="150" sortable="custom">
          <template v-slot="scope" >
            <a @click = "showBranch(scope.row)" style="color:darkblue" href="#" title="Click here to show the branch detail.">{{scope.row.InstitutionName}}</a>
          </template>
        </el-table-column>
        <el-table-column label="Counts" prop="Counts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="Premium" prop="Premium" min-width="150" sortable="custom">
          <template v-slot="scope" >
            <span>${{scope.row.Premium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column label="NB Counts" prop="NBCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="NB Premium"  prop="NBPremium" min-width="150" sortable="custom">
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
        <el-table-column v-if="btypeId===4" label="Renewal Counts" prop="RenewalCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===4" label="Renewal Premium" prop="RenewalPremium" min-width="150" sortable="custom">
          <template v-slot="scope" >
            <span>${{scope.row.RenewalPremium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="btypeId===2" label="UW Score" prop="UWScore" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===2" label="Quality Score" prop="QualityScore" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===2" label="Score Average" prop="ScoreAverage" min-width="150" sortable="custom">
          <!--template slot="header" >
            <span @click = "rank('ScoreAverage')" @dblclick="rankdesc('ScoreAverage')" title="Click to rank, double click to rank desc">Score Average</span>
          </template-->
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
    </div>
    <div v-if="branchVisible" class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoading">
            <el-col :span="4" class="">{{currentBranch.InstitutionName}} Summary: </el-col>
            <el-col :span="4">NB Counts: {{currentBranch.NBCounts}}</el-col>
            <el-col :span="4">NB Premium: ${{currentBranch.NBPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Remarket Counts: {{currentBranch.RemarketCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{currentBranch.RemarketPremium.toLocaleString()}}</el-col>
            <el-col :span="4" v-if="btypeId===4">Renewal Counts: {{currentBranch.RenewalCounts}}</el-col>
            <el-col :span="4" v-if="btypeId===4">Renewal Premium: ${{currentBranch.RenewalPremium.toLocaleString()}}</el-col>
            <el-col :span="4" v-if="btypeId===2">Score Average: {{currentBranch.ScoreAverage}}</el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="producers.slice((branchcurrentPage - 1) * branchPageSize, branchcurrentPage * branchPageSize)" empty-text="No Record" v-loading="isLoadingBranch" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttablebranch">
        <el-table-column label="ID" prop="ProducerID" width="60" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column label="Producer Name" prop="ProducerName" min-width="150" sortable="custom">
          <template v-slot="scope"  sortable="custom">
            <a @click = "showProducer(scope.row)" style="color:darkblue" href="#" title="Double Click here to show the detail.">{{scope.row.ProducerName}}</a>
          </template>
        </el-table-column>
        <el-table-column label="NB Counts" prop="NBCounts" min-width="100" sortable="custom">
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
        <el-table-column v-if="btypeId===4" label="Renewal Counts" prop="RenewalCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===4" label="Renewal Premium" prop="RenewalPremium" min-width="150" sortable="custom">
          <template v-slot="scope" >
            <span>${{scope.row.RenewalPremium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="btypeId===2" label="UW Score" prop="UWScore" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===2" label="Quality Score" prop="QualityScore" min-width="150" sortable="custom">
          <!--template slot="header" >
            <span @click = "rank('QualityScore')" @dblclick="rankdesc('QualityScore')" title="Click to rank, double click to rank desc">Quality Score</span>
          </template-->
        </el-table-column>
        <el-table-column v-if="btypeId===2" label="Score Average" prop="ScoreAverage" min-width="150" sortable="custom">
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=branchPageSize :pager-count=pagerCount :current-page.sync=branchcurrentPage layout="prev, pager, next" :total=branchtotal class="pageList">
      </el-pagination>
    </div>
    <div v-if="producerVisible" class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoadingProducer">
            <el-col :span="4" class="">Summary of {{currentProducer.ProducerName}}: </el-col>
            <el-col :span="4">NB Counts: {{currentProducer.NBCounts}}</el-col>
            <el-col :span="4">NB Premium: ${{currentProducer.NBPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Remarket Counts: {{currentProducer.RemarketCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{currentProducer.RemarketPremium.toLocaleString()}}</el-col>
            <el-col v-if="btypeId===4" :span="4">Renewal Counts: {{currentProducer.RenewalCounts}}</el-col>
            <el-col v-if="btypeId===4" :span="4">Renewal Premium: ${{currentProducer.RenewalPremium.toLocaleString()}}</el-col>
            <el-col v-if="btypeId===2" :span="4">Score Average: {{currentProducer.ScoreAverage}}</el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="coverletters.slice((producercurrentPage - 1) * pageSize, producercurrentPage * pageSize)" empty-text="No Record" v-loading="isLoadingProducer" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="csorttable">
        <el-table-column v-if="btypeId===2" label="ID" prop="CoverLetterID" width="80" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===4" label="ID" prop="BusinessID" width="80" fixed="left" sortable="custom">
        </el-table-column>
        <!--el-table-column label="" prop="ClientCode" min-width="1"></el-table-column-->
        <el-table-column label="Client Code" prop="ClientCode" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="Named Insured(s)" prop="NameInsured" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===2" label="App Type" prop="LeadsFrom" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===4" label="App Type" prop="TypeName" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="Company" prop="CorpName" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column label="Line of Business" prop="Title" min-width="150" sortable="custom"></el-table-column>
        <el-table-column label="Effective Date" prop="EffectiveDate" min-width="120" sortable="custom">
        </el-table-column>
        <el-table-column label="Status" prop="StatusName" min-width="120" sortable="custom"></el-table-column>
        <el-table-column v-if="btypeId===2" label="APP Premium" prop="PremiumOnApp" min-width="120" sortable="custom">
        </el-table-column>
        <el-table-column label="Submit Premium" prop="Premium" min-width="120" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===2" label="UW Score" prop="Score" min-width="80" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===2" label="Quality Score" prop="QualityScore" min-width="80" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===2" label="Detail" prop="" min-width="80">
          <template v-slot="scope" >
            <a v-if="scope.row.Score>0||scope.row.QualityScore>0" @click = "showCoverLetter(scope.row)" href="#" style="color:darkblue" title="Click here to show the details.">detail</a>
          </template>
        </el-table-column>

      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=producercurrentPage layout="prev, pager, next" :total=producertotal class="pageList">
      </el-pagination>
    </div>
    <div v-if="coverLetterVisible" class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoadingCoverLetter">
            <el-col :span="4" class="">CoverLetterID: {{currentCoverLetter.CoverLetterID}} </el-col>
            <el-col :span="4">Client Code: {{currentCoverLetter.ClientCode}}</el-col>
            <el-col :span="4">Name Insured: {{currentCoverLetter.NameInsured}}</el-col>
            <el-col :span="4">Premium: ${{currentCoverLetter.Premium.toLocaleString()}}</el-col>
            <el-col v-if="btypeId===2" :span="4">UW Score: {{currentCoverLetter.Score}}</el-col>
            <el-col v-if="btypeId===2" :span="4">Quality Score: {{currentCoverLetter.QualityScore}}</el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="coverletterproperties.slice((coverlettercurrentPage - 1) * pageSize, coverlettercurrentPage * pageSize)" empty-text="No Record" v-loading="isLoadingCoverLetter" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="PropertyID" width="100" fixed="left"></el-table-column>
        <!--el-table-column label="" prop="Name" min-width="1"></el-table-column-->
        <el-table-column label="Name" prop="Name" min-width="150"></el-table-column>
        <el-table-column label="Value" prop="Value" min-width="250"></el-table-column>
        <el-table-column v-if="btypeId===2" label="UW Score" prop="Score" min-width="80"></el-table-column>
        <el-table-column v-if="btypeId===2" label="Quality Score" prop="QualityScore" min-width="80"></el-table-column>

      </el-table>
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
      btypeId: 2,
      reportTitle: 'P/L Branch Report',
      viewMonthly: 'Month to Date',
      showAll: false,
      totalPremium: 0,
      NBCounts: 0,
      NBPremium: 1,
      RemarketCounts: 0,
      RemarketPremium: 2,
      ScoreAverage: 3,
      AutoBindingAuthority: null,
      PropertyBindingAuthority: null,
      EffectiveDate: null,
      isAnswering: false,
      isPost: false,
      totalNum: 0,
      finishNum: 0,
      totalQuestionNum: 1,
      appStatusList: [],
      appTypeList: [],
      insuranceCorpList: [],
      isLoading: false,
      isLoadingYearToDate: false,
      isLoadingMonthToDate: false,
      isLoadingBranch: false,
      isLoadingProducer: false,
      isLoadingCoverLetter: false,
      // businessLineID: 1,
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
        RenewalPremium: 0,
        ScoreAverage: 0
      },
      monthSummary: {
        NBCounts: 0,
        NBPremium: 0,
        RemarketCounts: 0,
        RemarketPremium: 0,
        RenewalCounts: 0,
        RenewalPremium: 0,
        ScoreAverage: 0
      },

      currentBranch: null,
      // currentBranchID: 0,
      businessLines: [{key: 1, value: 'Personal'}, {key: 2, value: 'Commercial'}],
      branches: [],
      branch: {
        InstitutionID: 0,
        InstitutionName: '',
        producerList: [],
        branchSummary: {
          NBCounts: 0,
          NBPremium: 0,
          RemarketCounts: 0,
          RemarketPremium: 0,
          RenewalCounts: 0,
          RenewalPremium: 0,
          ScoreAverage: 0
        }
      },
      producers: [],
      coverletters: [],
      coverletterproperties: [],
      currentProducer: null,
      currentCoverLetter: null,
      adminVisible: true,
      branchVisible: false,
      producerVisible: false,
      coverLetterVisible: false,
      branchcurrentPage: 1,
      branchPageSize: 6,
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
    let id = this.$route.params.id === undefined ? 2 : Number(this.$route.params.id)
    if (id !== undefined) {
      this.btypeId = Number(id)
    }
    if (this.btypeId === 4) this.reportTitle = 'C/L Branch Report'
    // this.btypeId = Number(this.$route.params.id)
    // if (this.btypeId === 4) this.reportTitle = 'C/L Branch Report'
    this.loadAppTypes()
    this.loadApplicationStatus()
    this.loadInsuranceCorps()
    this.searchForm.Year = new Date().getFullYear()
    this.searchForm.Month = new Date().getMonth() + 1
    for (let i = 2020; i <= this.searchForm.Year; i++) {
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
      if (this.adminVisible) this.search()
      else if (this.branchVisible) this.loadBranch()
      else this.loadProducerCoverLetters(0)
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
    },
    rankdesc: function (name) {
      // this.list.sort(this.bydesc(name))
      if (this.adminVisible) this.list.sort(this.bydesc(name))
      else {
        if (name.indexOf('Institution') >= 0) name = name.replace('Institution', 'Producer')
        this.producers.sort(this.bydesc(name))
      }
    },
    sorttablebranch: function (column) {
      if (column.order === 'descending') this.rankdescbranch(column.prop)
      else this.rankbranch(column.prop)
    },
    rankbranch: function (name) {
      this.producers.sort(this.by(name))
    },
    rankdescbranch: function (name) {
      this.producers.sort(this.bydesc(name))
    },
    csorttable: function (column) {
      if (column.order === 'descending') this.crankdesc(column.prop)
      else this.crank(column.prop)
    },
    crank: function (name) {
      this.coverletters.sort(this.by(name))
    },
    crankdesc: function (name) {
      this.coverletters.sort(this.bydesc(name))
    },
    // 保险公司列表
    loadInsuranceCorps: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetBrokageInsuranceCorps', {}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          this.insuranceCorpList = res.data
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    loadApplicationStatus: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'ApplicationStatus'}).then(res => {
        if (res) {
          console.log('statusList', res)
          this.appStatusList = res.data
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    loadAppTypes: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'AppType'}).then(res => {
        if (res) {
          console.log('statusList', res)
          this.appTypeList = res.data
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
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
    showBranch: function (branch) {
      this.adminVisible = false
      this.branchVisible = true
      this.producerVisible = false
      this.coverLetterVisible = false
      if (branch !== undefined) {
        this.currentBranch = branch
        this.loadBranch()
      }
    },
    showMain: function () {
      this.adminVisible = true
      this.branchVisible = false
      this.producerVisible = false
      this.coverLetterVisible = false
      this.loadMonthToDate()
      this.search()
    },
    showProducer: function (producer) {
      this.adminVisible = false
      this.branchVisible = true
      this.producerVisible = true
      this.coverLetterVisible = false
      if (producer !== undefined) {
        // this.currentProducer = this.producers.find(p => p.ProducerID === producer.ProducerID)
        this.currentProducer = producer
        this.loadProducerCoverLetters(0)
      }
    },
    showCoverLetter: function (letter) {
      this.adminVisible = false
      this.branchVisible = true
      this.producerVisible = true
      this.coverLetterVisible = true
      if (letter !== undefined) {
        this.currentCoverLetter = letter
        this.loadCoverLetter()
      }
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    loadYearToDate: function () {
      this.isLoadingYearToDate = true
      let service = '/api/Services/NewBusinessService.asmx/GetInstitutionRecords_yearsummary'
      if (this.btypeId === 4) service = '/api/Services/CommerceService.asmx/GetInstitutionRecords_yearsummary'
      this.axios.post(service, {year: this.searchForm.Year}).then(res => {
        if (res) {
          console.log('loadYearToDate', res)
          this.yearSummary = res.data
        }
        this.isLoadingYearToDate = false
      }).catch(err => {
        console.log('loadYearToDate error', err)
        this.isLoadingYearToDate = false
      })
    },
    loadMonthToDate: function () {
      this.isLoadingMonthToDate = true
      let service = '/api/Services/NewBusinessService.asmx/GetInstitutionRecords_monthsummary'
      if (this.btypeId === 4) service = '/api/Services/CommerceService.asmx/GetInstitutionRecords_monthsummary'
      this.axios.post(service, {year: this.searchForm.Year, month: this.searchForm.Month}).then(res => {
        if (res) {
          console.log('loadMonthToDate', res)
          this.monthSummary = res.data
        }
        this.isLoadingMonthToDate = false
      }).catch(err => {
        console.log('loadMonthToDate error', err)
        this.isLoadingMonthToDate = false
      })
    },

    getBranch: function (branchid) {
      return this.branches.find(b => b.InstitutionID === branchid)
    },
    // 查询
    search: function () {
      this.isLoading = true
      let service = '/api/Services/NewBusinessService.asmx/GetInstitutionRecords'
      let param = {year: this.searchForm.Year, month: this.searchForm.Month}
      if (this.viewMonthly === 'Year to Date') {
        service = '/api/Services/NewBusinessService.asmx/GetInstitutionRecords_year'
        param = {year: this.searchForm.Year}
      }
      if (this.btypeId === 4) service = service.replace('NewBusinessService', 'CommerceService')
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('InstitutionRecords', res)
          this.list = res.data
          if (this.btypeId === 4) {
            this.list.forEach(r => {
              this.appTypeList.forEach(t => {
                r[t.value + 'Count'] = r.CountList[t.key - 1]
                r[t.value + 'Premium'] = r.PremiumList[t.key - 1]
              })
            })
          } else {
            this.list.forEach(r => {
              r.Premium = r.NBPremium + r.RemarketPremium
              r.Counts = r.NBCounts + r.RemarketCounts
            })
          }
          /*
          let sumofnb = 0
          let nbcounts = 0
          let remarketcounts = 0
          let sumofremarket = 0
          let sumofscore = 0
          this.list.forEach(function (c) {
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
          this.isLoading = false
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    loadBranch: function () {
      let branchid = this.currentBranch.InstitutionID
      this.isLoadingBranch = true
      let service = '/api/Services/NewBusinessService.asmx/GetProducerRecords_branch'
      let param = {branchid: branchid, year: this.searchForm.Year, month: this.searchForm.Month}
      if (this.viewMonthly === 'Year to Date') {
        service = '/api/Services/NewBusinessService.asmx/GetProducerRecords_branch_year'
        param = {branchid: branchid, year: this.searchForm.Year}
      }
      if (this.showAll) {
        service = service.replace('branch', 'all')
        param = {year: this.searchForm.Year, month: this.searchForm.Month}
      }
      if (this.btypeId === 4) service = service.replace('NewBusinessService', 'CommerceService')
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadBranch', res)
          this.producers = res.data
          this.producers.forEach(function (c) {
            c.nbPremium = '$' + c.NBPremium.toLocaleString()
            c.remarketPremium = '$' + c.RemarketPremium.toLocaleString()
            // c.nbPremium = c.NBPremium
            // c.remarketPremium = c.RemarketPremium
          })
          this.branchtotal = this.producers.length
          this.branchcurrentPage = 1
          this.isLoadingBranch = false
        }
      }).catch(err => {
        console.log('loadBranch error', err)
        this.isLoadingBranch = false
      })
    },
    loadProducer: function () {
      let producerid = this.currentProducer.ProducerID
      let btypeId = this.btypeId
      this.isLoadingProducer = true
      let service = '/api/Services/NewBusinessService.asmx/GetCoverLetters_producer'
      let param = {producerid: producerid, year: this.searchForm.Year, month: this.searchForm.Month}
      if (this.viewMonthly === 'Year to Date') {
        service = '/api/Services/NewBusinessService.asmx/GetCoverLetters_producer_year'
        param = {producerid: producerid, year: this.searchForm.Year}
      }
      if (btypeId === 4) {
        // service = service.replace('NewBusinessService', 'CommerceService')
        // service = service.replace('CoverLetter', 'Application')
        service = '/api/Services/CommerceService.asmx/GetProducerDetails'
        if (this.viewMonthly === 'Year to Date') {
          service = '/api/Services/CommerceService.asmx/GetProducerDetails_year'
        }
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadProducer', res)
          this.coverletters = res.data
          this.coverletters.forEach(c => {
            if (c.appPremium !== undefined) c.appPremium = '$' + c.PremiumOnApp.toLocaleString()
            c.submitPremium = '$' + c.Premium.toLocaleString()
            c.EffectiveDate = moment(c.EffectiveDate).format('YYYY-MM-DD')
            if (btypeId === 4) {
              let corp = this.insuranceCorpList.find(co => co.InsuranceCorpID === c.InsuranceCorpID)
              if (corp !== undefined) c.CorpName = corp.ShortName
              else c.CorpName = ''
              let status = this.appStatusList.find(co => co.key === c.Status)
              if (status !== undefined) c.StatusName = status.value
              else c.StatusName = ''
              let type = this.appTypeList.find(co => co.key === c.TypeID)
              if (type !== undefined) c.TypeName = type.value
              else c.TypeName = ''
            }
          })
          this.producertotal = this.coverletters.length
          this.producercurrentPage = 1
        }
        this.isLoadingProducer = false
      }).catch(err => {
        console.log('loadProducer error', err)
        this.isLoadingProducer = false
      })
    },
    loadProducerCoverLetters: function (start) {
      let producerid = this.currentProducer.ProducerID
      let btypeId = this.btypeId
      this.isLoadingProducer = true
      let service = '/api/Services/NewBusinessService.asmx/GetCoverLetters_producer_start'
      let param = {producerid: producerid, year: this.searchForm.Year, month: this.searchForm.Month, start: start}
      if (this.viewMonthly === 'Year to Date') {
        service = '/api/Services/NewBusinessService.asmx/GetCoverLetters_producer_year_start'
        param = {producerid: producerid, year: this.searchForm.Year, start: start}
      }
      if (btypeId === 4) {
        service = '/api/Services/CommerceService.asmx/GetProducerDetails'
        if (this.viewMonthly === 'Year to Date') {
          service = '/api/Services/CommerceService.asmx/GetProducerDetails_year'
        }
        // service = service.replace('NewBusinessService', 'CommerceService')
        // service = service.replace('CoverLetter', 'Application')
        // service = service.replace('_start', '')
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadProducerCoverLetters:' + start, res)
          if (start === 0) {
            this.coverletters = res.data
            this.producertotal = res.count
            this.producercurrentPage = 1
          } else {
            this.coverletters = this.coverletters.concat(res.data)
          }
          if (this.coverletters.length < this.producertotal) {
            this.loadProducerCoverLetters(this.coverletters.length)
          } else {
            this.coverletters.forEach(c => {
              if (c.appPremium !== undefined) c.appPremium = '$' + c.PremiumOnApp.toLocaleString()
              c.submitPremium = '$' + c.Premium.toLocaleString()
              c.EffectiveDate = moment(c.EffectiveDate).format('YYYY-MM-DD')
              let corp = this.insuranceCorpList.find(ic => ic.InsuranceCorpID === c.InsuranceCorpID)
              if (corp === undefined) c.CorpName = ''
              else c.CorpName = corp.ShortName
              if (btypeId === 4) {
                let status = this.appStatusList.find(co => co.key === c.Status)
                if (status !== undefined) c.StatusName = status.value
                else c.StatusName = ''
                let type = this.appTypeList.find(co => co.key === c.AppTypeID)
                if (type !== undefined) c.TypeName = type.value
                else c.TypeName = ''
              }
            })
            this.isLoading = false
          }
        }
        this.isLoadingProducer = false
      }).catch(err => {
        console.log('loadProducerCoverLetters', err)
        this.isLoadingProducer = false
      })
    },
    loadCoverLetter: function () {
      let coverletterid = this.currentCoverLetter.CoverLetterID
      this.isLoadingCoverLetter = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetterProperties_score', {coverletterid: coverletterid, processingtypeid: 1}).then(res => {
        if (res) {
          console.log('loadCoverLetter', res)
          this.coverletterproperties = res.data
          this.coverlettertotal = this.coverletterproperties.length
          this.coverlettercurrentPage = 1
          this.isLoadingCoverLetter = false
        }
      }).catch(err => {
        console.log('loadCoverLetter error', err)
        this.isLoadingCoverLetter = false
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
