<!--
FileName: CoverLetter/myReport.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show my report.
-->
<template>
  <div>
    <div class="inPageTitle">
      <!--span class="inPageNav">My Report</span-->
      <a class="inPageNav" href="#" @click="showMain" style="color:darkblue" title="Click here to return to the main report.">My Report</a>
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
            <el-col :span="4" class="">Month to Date: </el-col>
            <el-col :span="4">NB Counts: {{monthSummary.NBCounts}}</el-col>
            <el-col :span="4">NB Premium: ${{monthSummary.NBPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Remarket Counts: {{monthSummary.RemarketCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{monthSummary.RemarketPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Score Average: {{monthSummary.ScoreAverage}}</el-col>
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
        <!--el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="Monthly Summary:  NB Counts:" prop="totalPremium">
            <el-input v-model="totalPremium" readonly="readonly"></el-input>
          </el-form-item>
          <el-form-item label="Sum of NB" prop="sumOfNB">
            <el-input v-model="sumOfNB" readonly="readonly"></el-input>
          </el-form-item>
          <el-form-item label="Sum of Remarket" prop="sumOfRemarket">
            <el-input v-model="sumOfRemarket" readonly="readonly"></el-input>
          </el-form-item>
          <el-form-item label="Average of Score" prop="averageOfScore">
            <el-input v-model="averageScore" readonly="readonly"></el-input>
          </el-form-item>
        </el-form-->
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="CoverLetterID" width="60" fixed="left"></el-table-column>
        <el-table-column label="Client Code" prop="ClientCode" min-width="100"></el-table-column>
        <el-table-column label="Named Insured(s)" prop="NameInsured" min-width="150"></el-table-column>
        <el-table-column label="App Type" prop="LeadsFrom" min-width="100"></el-table-column>
        <el-table-column label="Company" prop="CorpName" min-width="150"></el-table-column>
        <el-table-column label="Line of Business" prop="Title" min-width="150"></el-table-column>
        <el-table-column label="Effective Date" min-width="120">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" prop="Status" min-width="80"></el-table-column>
        <el-table-column label="APP Premium" prop="PremiumOnApp" min-width="120">
          <template slot-scope="scope" >
            <span>${{scope.row.PremiumOnApp.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Submit Premium" prop="Premium" min-width="120">
          <template slot-scope="scope" >
            <span>${{scope.row.Premium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column label="UW Score" prop="Score" min-width="80"></el-table-column>
        <el-table-column label="Q-Score" prop="QualityScore" min-width="80"></el-table-column>
        <el-table-column label="Detail" prop="" min-width="80">
          <template slot-scope="scope" >
            <a v-if="scope.row.Score>0||scope.row.QualityScore>0" @click = "showCoverLetter(scope.row)" href="#" style="color:darkblue" title="Click here to show the details.">detail</a>
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
            <el-col :span="4" class="">CoverLetterID: {{currentCoverLetter.CoverLetterID}} </el-col>
            <el-col :span="4">Client Code: {{currentCoverLetter.ClientCode}}</el-col>
            <el-col :span="4">Name Insured: {{currentCoverLetter.NameInsured}}</el-col>
            <el-col :span="4">Premium: ${{currentCoverLetter.Premium.toLocaleString()}}</el-col>
            <el-col :span="4">UW Score: {{currentCoverLetter.Score}}</el-col>
            <el-col :span="4">Quality Score: {{currentCoverLetter.QualityScore}}</el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="coverletterpropertylist.slice((coverlettercurrentPage - 1) * pageSize, coverlettercurrentPage * pageSize)" empty-text="No Record" v-loading="isLoadingCoverLetter" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="PropertyID" min-width="100" fixed="left"></el-table-column>
        <el-table-column label="Name" prop="Name" min-width="150"></el-table-column>
        <el-table-column label="" prop="" min-width="1"></el-table-column>
        <el-table-column label="Value" prop="Value" min-width="150"></el-table-column>
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
      btypeId: 2,
      viewMonthly: 'Month to Date',
      totalPremium: 0,
      NBCounts: 0,
      NBPremium: 1,
      RemarketCounts: 0,
      RemarketPremium: 0,
      ScoreAverage: 0,
      AutoBindingAuthority: null,
      PropertyBindingAuthority: null,
      EffectiveDate: null,
      isAnswering: false,
      isPost: false,
      totalNum: 0,
      finishNum: 0,
      totalQuestionNum: 1,
      AnsweredArr: [],
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
      coverLetterVisible: false,
      currentCoverLetterID: null,
      coverletterpropertylist: [],
      currentCoverLetter: {
        CoverLetterID: 0,
        ClientCode: '',
        NameInsured: '',
        Score: 0,
        QualityScore: 0
      },
      coverlettercurrentPage: 1,
      coverlettertotal: 0,
      // 列表
      tempList: [],
      list: [],
      yearSummary: {
        NBCounts: 0,
        NBPremium: 0,
        RemarketCounts: 0,
        RemarketPremium: 0,
        ScoreAverage: 0
      },
      monthSummary: {
        NBCounts: 0,
        NBPremium: 0,
        RemarketCounts: 0,
        RemarketPremium: 0,
        ScoreAverage: 0
      },
      showRecord: 'Show Year',
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  mounted: function () {
    let id = this.$route.params.id === undefined ? 2 : this.$route.params.id
    if (id !== undefined) {
      this.btypeId = id
    }
    this.searchForm.Year = new Date().getFullYear()
    this.searchForm.Month = new Date().getMonth() + 1
    for (let i = 2020; i <= this.searchForm.Year; i++) {
      this.searchForm.years.push(i)
    }
    this.showMain()
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
      this.showMain()
    },
    prevMonth: function () {
      if (this.searchForm.Month === 1) {
        this.searchForm.Month = 12
        this.searchForm.Year--
        this.loadYearToDate()
      } else this.searchForm.Month--
      this.showMain()
      this.loadMonthToDate()
    },
    nextMonth: function () {
      if (this.searchForm.Month === 12) {
        this.searchForm.Month = 1
        this.searchForm.Year++
        this.loadYearToDate()
      } else this.searchForm.Month++
      this.showMain()
      this.loadMonthToDate()
    },
    changeYear: function () {
      this.loadYearToDate()
      this.loadMonthToDate()
      this.showMain()
    },
    changeYearMonth: function () {
      this.showMain()
      this.loadMonthToDate()
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    showMain: function () {
      this.mainVisible = true
      this.coverLetterVisible = false
      this.loadCoverLetters(0)
    },
    showCoverLetter: function (letter) {
      this.mainVisible = false
      this.coverLetterVisible = true
      if (letter !== undefined) {
        this.currentCoverLetter = letter
        this.loadCoverLetter()
      }
    },
    loadMonthToDate: function () {
      this.isLoadingMonthToDate = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetProducerRecord_producermonthsummary', {btypeid: this.btypeId, year: this.searchForm.Year, month: this.searchForm.Month}).then(res => {
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
      this.axios.post('/api/Services/NewBusinessService.asmx/GetProducerRecord_produceryearsummary', {btypeid: this.btypeId, year: this.searchForm.Year}).then(res => {
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
    loadCoverLetters: function (start) {
      this.isLoading = true
      let service = '/api/Services/NewBusinessService.asmx/GetMyCoverLetters_month_start'
      let param = {btypeid: this.btypeId, year: this.searchForm.Year, month: this.searchForm.Month, start: start}
      if (this.viewMonthly === 'Year to Date') {
        service = '/api/Services/NewBusinessService.asmx/GetMyCoverLetters_year_start'
        param = {btypeid: this.btypeId, year: this.searchForm.Year, start: start}
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadCoverLetters', res)
          if (start === 0) {
            this.list = res.data
            this.total = res.count
            this.currentPage = 1
          } else {
            this.list = this.list.concat(res.data)
          }
          if (this.list.length < this.total) {
            this.loadCoverLetters(this.list.length)
          } else {
            this.isLoading = false
          }
        }
      }).catch(err => {
        console.log('loadCoverLetters', err)
        this.isLoading = false
      })
    },
    // 查询
    search: function () {
      this.isLoading = true
      let service = '/api/Services/NewBusinessService.asmx/GetMyCoverLetters_month'
      let param = {btypeid: this.btypeId, year: this.searchForm.Year, month: this.searchForm.Month}
      if (this.viewMonthly === 'Year to Date') {
        service = '/api/Services/NewBusinessService.asmx/GetMyCoverLetters_year'
        param = {btypeid: this.btypeId, year: this.searchForm.Year}
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
    // loading current coverletter properties
    loadCoverLetter: function () {
      let coverletterid = this.currentCoverLetter.CoverLetterID
      this.isLoadingCoverLetter = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetterProperties_score', {coverletterid: coverletterid, processingtypeid: 1}).then(res => {
        if (res) {
          console.log('查询', res)
          this.coverletterpropertylist = res.data
          this.coverlettertotal = this.coverletterpropertylist.length
          this.coverlettercurrentPage = 1
        }
        this.isLoadingCoverLetter = false
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
