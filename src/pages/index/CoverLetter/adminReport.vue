<template>
  <div>
    <div class="inPageTitle">
      <a class="inPageNav" href="#" @click="showMain" style="color:darkblue" title="Click here to return to the main report.">Admin Report</a>
      <a v-if="branchVisible||producerVisible||coverLetterVisible" style="color:darkblue" class="inPageNav" href="#" @click="showBranch()" title="Click here to return to the branch report.">  - {{currentBranch.InstitutionName}}</a>
      <a v-if="producerVisible||coverLetterVisible" href="#" style="color:darkblue" class="inPageNav" @click="showProducer()" title="Click here to return to the producer report."> - {{currentProducer.ProducerName}}</a>
      <span v-if="coverLetterVisible" class="inPageNav"> - {{currentCoverLetter.ClientCode}}</span>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item>
            <el-button icon="el-icon-minus" type="primary" @click="prevMonth()" :loading="isLoading ">Prev Month</el-button>
          </el-form-item>
          <el-form-item label="Year" prop="Year">
            <el-select v-model="searchForm.Year" placeholder="" class="yearMonthSelection" no-data-text="No Record" filterable @change="changeYearMonth()">
              <el-option v-for="item in searchForm.years" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Month" prop="Month">
            <el-select v-model="searchForm.Month" class="yearMonthSelection" placeholder="" no-data-text="No Record" filterable @change="changeYearMonth()">
              <el-option v-for="item in searchForm.months" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-plus" type="primary" @click="nextMonth()" :loading="isLoading ">Next Month</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-if="adminVisible" class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoading">
            <el-col :span="4" class="">Monthly Summary: </el-col>
            <el-col :span="4">NB Counts: {{NBCounts}}</el-col>
            <el-col :span="4">NB Premium: ${{NBPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Remarket Counts: {{RemarketCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{RemarketPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Score Average: {{ScoreAverage}}</el-col>
          </el-row>
          <el-row :gutter="20" class="title" v-loading="isLoadingYearToDate">
            <el-col :span="4" class="">Year to Date: </el-col>
            <el-col :span="4">NB Counts: {{yearSummary.NBCounts}}</el-col>
            <el-col :span="4">NB Premium: ${{yearSummary.NBPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Remarket Counts: {{yearSummary.RemarketCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{yearSummary.RemarketPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Score Average: {{yearSummary.ScoreAverage}}</el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="" prop="InstitutionID" width="60" fixed="left">
          <template slot="header" >
            <span @click = "rank('InstitutionID')" @dblclick="rankdesc('InstitutionID')" title="Click to rank, double click to rank desc">ID</span>
          </template>
        </el-table-column>
        <el-table-column label="" prop="InstitutionName" min-width="150">
          <template slot="header" >
            <span @click = "rank('InstitutionName')" @dblclick="rankdesc('InstitutionName')" title="Click to rank, double click to rank desc">Name</span>
          </template>
          <template slot-scope="scope" >
            <a @click = "showBranch(scope.row)" style="color:darkblue" href="#" title="Click here to show the branch detail.">{{scope.row.InstitutionName}}</a>
          </template>
        </el-table-column>
        <el-table-column label="" prop="NBCounts" min-width="100">
          <template slot="header" >
            <span @click = "rank('NBCounts')" @dblclick="rankdesc('NBCounts')" title="Click to rank, double click to rank desc">NB Counts</span>
          </template>
        </el-table-column>
        <el-table-column  prop="NBPremium" min-width="150">
          <template slot="header" >
            <span @click = "rank('NBPremium')" @dblclick="rankdesc('NBPremium')" title="Click to rank, double click to rank desc">NB Premium</span>
          </template>
          <template slot-scope="scope" >
            <span>${{scope.row.NBPremium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column label="" prop="RemarketCounts" min-width="100">
          <template slot="header" >
            <span @click = "rank('RemarketCounts')" @dblclick="rankdesc('RemarketCounts')" title="Click to rank, double click to rank desc">Remarket Counts</span>
          </template>
        </el-table-column>
        <el-table-column label="" prop="RemarketPremium" min-width="150">
          <template slot="header" >
            <span @click = "rank('RemarketPremium')" @dblclick="rankdesc('RemarketPremium')" title="Click to rank, double click to rank desc">Remarket Premium</span>
          </template>
          <template slot-scope="scope" >
            <span>${{scope.row.RemarketPremium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column label="" prop="UWScore" min-width="150">
          <template slot="header" >
            <span @click = "rank('UWScore')" @dblclick="rankdesc('UWScore')" title="Click to rank, double click to rank desc">UW Score</span>
          </template>
        </el-table-column>
        <el-table-column label="" prop="QualityScore" min-width="150">
          <template slot="header" >
            <span @click = "rank('QualityScore')" @dblclick="rankdesc('QualityScore')" title="Click to rank, double click to rank desc">Quality Score</span>
          </template>
        </el-table-column>
        <el-table-column label="" prop="ScoreAverage" min-width="150">
          <template slot="header" >
            <span @click = "rank('ScoreAverage')" @dblclick="rankdesc('ScoreAverage')" title="Click to rank, double click to rank desc">Score Average</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
    </div>
    <div v-else-if="branchVisible" class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoading">
            <el-col :span="4" class="">{{currentBranch.InstitutionName}} Monthly Summary: </el-col>
            <el-col :span="4">NB Counts: {{currentBranch.NBCounts}}</el-col>
            <el-col :span="4">NB Premium: ${{currentBranch.NBPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Remarket Counts: {{currentBranch.RemarketCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{currentBranch.RemarketPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Score Average: {{currentBranch.ScoreAverage}}</el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="producers.slice((branchcurrentPage - 1) * pageSize, branchcurrentPage * pageSize)" empty-text="No Record" v-loading="isLoadingBranch" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="ProducerID" width="60" fixed="left">
        </el-table-column>
        <el-table-column label="Producer Name" prop="ProducerName" min-width="150">
          <template slot-scope="scope" >
            <a @click = "showProducer(scope.row)" style="color:darkblue" href="#" title="Double Click here to show the detail.">{{scope.row.ProducerName}}</a>
          </template>
        </el-table-column>
        <el-table-column label="NB Counts" prop="NBCounts" min-width="100">
        </el-table-column>
        <el-table-column label="NB Premium" prop="nbPremium" min-width="150">
          <!--template slot-scope="scope" >
            <span>${{scope.row.NBPremium.toLocaleString()}}</span>
          </template-->
        </el-table-column>
        <el-table-column label="Remarket Counts" prop="RemarketCounts" min-width="100">
        </el-table-column>
        <el-table-column label="Remarket Premium" prop="remarketPremium" min-width="150">
          <!--template slot-scope="scope" >
            <span>${{scope.row.RemarketPremium.toLocaleString()}}</span>
          </template-->
        </el-table-column>
        <el-table-column label="UW Score" prop="UWScore" min-width="150">
          <template slot="header" >
            <span @click = "rank('UWScore')" @dblclick="rankdesc('UWScore')" title="Click to rank, double click to rank desc">UW Score</span>
          </template>
        </el-table-column>
        <el-table-column label="Quality Score" prop="QualityScore" min-width="150">
          <template slot="header" >
            <span @click = "rank('QualityScore')" @dblclick="rankdesc('QualityScore')" title="Click to rank, double click to rank desc">Quality Score</span>
          </template>
        </el-table-column>
        <el-table-column label="Score Average" prop="ScoreAverage" min-width="150">
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=branchcurrentPage layout="prev, pager, next" :total=branchtotal class="pageList">
      </el-pagination>
    </div>
    <div v-else-if="producerVisible" class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoadingProducer">
            <el-col :span="4" class="">Summary of {{currentProducer.ProducerName}}: </el-col>
            <el-col :span="4">NB Counts: {{currentProducer.NBCounts}}</el-col>
            <el-col :span="4">NB Premium: ${{currentProducer.NBPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Remarket Counts: {{currentProducer.RemarketCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{currentProducer.RemarketPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Score Average: {{currentProducer.ScoreAverage}}</el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="coverletters.slice((producercurrentPage - 1) * pageSize, producercurrentPage * pageSize)" empty-text="No Record" v-loading="isLoadingProducer" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="CoverLetterID" width="80" fixed="left">
          <template slot="header" >
            <span @click = "crank('CoverLetterID')" @dblclick="crankdesc('CoverLetterID')" title="Click to rank, double click to rank desc">ID</span>
          </template>
        </el-table-column>
        <el-table-column label="" prop="ClientCode" min-width="1"></el-table-column>
        <el-table-column label="Client Code" prop="ClientCode" min-width="100">
          <template slot="header" >
            <span @click = "crank('ClientCode')" @dblclick="crankdesc('ClientCode')" title="Click to rank, double click to rank desc">Client Code</span>
          </template>
        </el-table-column>
        <el-table-column label="Named Insured(s)" prop="NameInsured" min-width="150">
          <template slot="header" >
            <span @click = "crank('NameInsured')" @dblclick="crankdesc('NameInsured')" title="Click to rank, double click to rank desc">Named Insured(s)</span>
          </template>
        </el-table-column>
        <el-table-column label="App Type" prop="LeadsFrom" min-width="100">
          <template slot="header" >
            <span @click = "crank('LeadsFrom')" @dblclick="crankdesc('LeadsFrom')" title="Click to rank, double click to rank desc">App Type</span>
          </template>
        </el-table-column>
        <el-table-column label="Company" prop="CorpName" min-width="150">
          <template slot="header" >
            <span @click = "crank('CorpName')" @dblclick="crankdesc('CorpName')" title="Click to rank, double click to rank desc">Company</span>
          </template>
        </el-table-column>
        <el-table-column label="Line of Business" prop="Title" min-width="150"></el-table-column>
        <template slot="header" >
          <span @click = "crank('Title')" @dblclick="crankdesc('Title')" title="Click to rank, double click to rank desc">Line of Business</span>
        </template>
        <el-table-column label="Effective Date" min-width="120">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" prop="Status" min-width="80"></el-table-column>
        <el-table-column label="APP Premium" prop="appPremium" min-width="120">
          <!--template slot-scope="scope" >
            <span>${{scope.row.PremiumOnApp.toLocaleString()}}</span>
          </template-->
        </el-table-column>
        <el-table-column label="Submit Premium" prop="submitPremium" min-width="120">
          <!--template slot-scope="scope" >
            <span>${{scope.row.Premium.toLocaleString()}}</span>
          </template-->
        </el-table-column>
        <el-table-column label="UW Score" prop="Score" min-width="80">
        </el-table-column>
        <el-table-column label="Quality Score" prop="QualityScore" min-width="80">
        </el-table-column>
        <el-table-column label="Detail" prop="" min-width="80">
          <template slot-scope="scope" >
            <a v-if="scope.row.Score>0||scope.row.QualityScore>0" @click = "showCoverLetter(scope.row)" href="#" style="color:darkblue" title="Click here to show the details.">detail</a>
          </template>
        </el-table-column>

      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=producercurrentPage layout="prev, pager, next" :total=producertotal class="pageList">
      </el-pagination>
    </div>
    <div v-else-if="coverLetterVisible" class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoadingCoverLetter">
            <el-col :span="4" class="">CoverLetterID: {{currentCoverLetter.CoverLetterID}} </el-col>
            <el-col :span="4">Client Code: {{currentCoverLetter.ClientCode}}</el-col>
            <el-col :span="4">Name Insured: {{currentCoverLetter.NameInsured}}</el-col>
            <el-col :span="4">Premium: ${{currentCoverLetter.Premium.toLocaleString()}}</el-col>
            <el-col :span="4">UW Score: {{currentCoverLetter.Score}}</el-col>
            <el-col :span="4">Quality Score: {{currentCoverLetter.QualityScore}}</el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="coverletterproperties.slice((coverlettercurrentPage - 1) * pageSize, coverlettercurrentPage * pageSize)" empty-text="No Record" v-loading="isLoadingCoverLetter" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="PropertyID" width="100" fixed="left"></el-table-column>
        <el-table-column label="" prop="Name" min-width="1"></el-table-column>
        <el-table-column label="Name" prop="Name" min-width="150"></el-table-column>
        <el-table-column label="Value" prop="Value" min-width="250"></el-table-column>
        <el-table-column label="UW Score" prop="Score" min-width="80"></el-table-column>
        <el-table-column label="Quality Score" prop="QualityScore" min-width="80"></el-table-column>

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
      // AnsweredArr: [],
      // printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      // htmlTitle: 'null', // pdf文件名
      isLoading: false,
      isLoadingYearToDate: false,
      isLoadingBranch: false,
      isLoadingProducer: false,
      isLoadingCoverLetter: false,
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
        ScoreAverage: 0
      },
      currentBranch: null,
      // currentBranchID: 0,
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
    this.searchForm.Year = new Date().getFullYear()
    this.searchForm.Month = new Date().getMonth() + 1
    for (var i = 2020; i <= this.searchForm.Year; i++) {
      this.searchForm.years.push(i)
    }
    this.search()
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
      this.search()
    },
    showProducer: function (producer) {
      this.adminVisible = false
      this.branchVisible = false
      this.producerVisible = true
      this.coverLetterVisible = false
      if (producer !== undefined) {
        this.currentProducer = producer
        this.loadProducer()
      }
    },
    showCoverLetter: function (letter) {
      this.adminVisible = false
      this.branchVisible = false
      this.producerVisible = false
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
      this.axios.post('/api/Services/NewBusinessService.asmx/GetInstitutionRecords_yearsummary', {year: this.searchForm.Year}).then(res => {
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
    getBranch: function (branchid) {
      return this.branches.find(b => b.InstitutionID === branchid)
    },
    // 查询
    search: function () {
      this.isLoading = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetInstitutionRecords', {year: this.searchForm.Year, month: this.searchForm.Month}).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
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
      this.axios.post('/api/Services/NewBusinessService.asmx/GetProducerRecords_branch', {branchid: branchid, year: this.searchForm.Year, month: this.searchForm.Month}).then(res => {
        if (res) {
          console.log('查询', res)
          this.producers = res.data
          this.producers.forEach(function (c) {
            c.nbPremium = '$' + c.NBPremium.toLocaleString()
            c.remarketPremium = '$' + c.RemarketPremium.toLocaleString()
          })
          this.branchtotal = this.producers.length
          this.branchcurrentPage = 1
          this.isLoadingBranch = false
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingBranch = false
      })
    },
    loadProducer: function () {
      let producerid = this.currentProducer.ProducerID
      this.isLoadingProducer = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetters_producer', {producerid: producerid, year: this.searchForm.Year, month: this.searchForm.Month}).then(res => {
        if (res) {
          console.log('查询', res)
          this.coverletters = res.data
          this.coverletters.forEach(function (c) {
            c.appPremium = '$' + c.PremiumOnApp.toLocaleString()
            c.submitPremium = '$' + c.Premium.toLocaleString()
          })
          this.producertotal = this.coverletters.length
          this.producercurrentPage = 1
        }
        this.isLoadingProducer = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingProducer = false
      })
    },
    loadCoverLetter: function () {
      let coverletterid = this.currentCoverLetter.CoverLetterID
      this.isLoadingCoverLetter = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetterProperties', {coverletterid: coverletterid, processingtypeid: 1}).then(res => {
        if (res) {
          console.log('查询', res)
          this.coverletterproperties = res.data
          this.coverlettertotal = this.coverletterproperties.length
          this.coverlettercurrentPage = 1
          this.isLoadingCoverLetter = false
        }
      }).catch(err => {
        console.log('查询出错', err)
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
