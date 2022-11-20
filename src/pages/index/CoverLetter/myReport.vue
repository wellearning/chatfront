<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">My Report</span>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item>
            <el-button icon="el-icon-minus" type="primary" @click="prevMonth()" :loading="isLoading ">Prev Month</el-button>
          </el-form-item>
          <el-form-item label="Year" prop="Year">
            <el-select v-model="searchForm.Year" placeholder="" no-data-text="No Record" filterable @change="changeYearMonth()">
              <el-option v-for="item in searchForm.years" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Month" prop="Month">
            <el-select v-model="searchForm.Month" placeholder="" no-data-text="No Record" filterable @change="changeYearMonth()">
              <el-option v-for="item in searchForm.months" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-plus" type="primary" @click="nextMonth()" :loading="isLoading ">Next Month</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title">
            <el-col :span="4" class="">Monthly Summary: </el-col>
            <el-col :span="4">NB Counts: {{NBCounts}}</el-col>
            <el-col :span="4">NB Premium: ${{NBPremium.toLocaleString()}}</el-col>
            <el-col :span="4">Remarket Counts: {{RemarketCounts}}</el-col>
            <el-col :span="4">Remarket Premium: ${{RemarketPremium.toLocaleString()}}</el-col>
            <!--el-col :span="4">Score Average: {{ScoreAverage}}</el-col-->
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
        <!--el-table-column label="Score" prop="Score" min-width="80"></el-table-column-->
        <el-table-column label="Submit Premium" prop="Premium" min-width="120">
          <template slot-scope="scope" >
            <span>${{scope.row.Premium.toLocaleString()}}</span>
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
      AnsweredArr: [],
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      // printObj: {
      //   id: 'pdfDom',
      //   popTitle: ''
      // },
      htmlTitle: 'null', // pdf文件名
      isLoading: false,
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
      pinkSlipFormVisible: false,
      currentCoverLetterID: null,
      currentCoverLetter: null,
      // 列表
      tempList: [],
      list: [],
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
    prevMonth: function () {
      if (this.searchForm.Month === 1) {
        this.searchForm.Month = 12
        this.searchForm.Year--
      } else this.searchForm.Month--
      this.search()
    },
    nextMonth: function () {
      if (this.searchForm.Month === 12) {
        this.searchForm.Month = 1
        this.searchForm.Year++
      } else this.searchForm.Month++
      this.search()
    },
    changeYearMonth: function () {
      this.search()
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    loadYearToDate: function () {
      this.isLoadingYearToDate = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetMyYearToDate', {year: this.searchForm.Year}).then(res => {
        if (res) {
          console.log('查询', res)
          this.totalPremium = res.data
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
      this.axios.post('/api/Services/NewBusinessService.asmx/GetMyCoverLetters_month', {year: this.searchForm.Year, month: this.searchForm.Month}).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          let sumofnb = 0
          let nbcounts = 0
          let remarketcounts = 0
          let sumofremarket = 0
          let sumofscore = 0
          this.list.forEach(function (c) {
            if (c.LeadsFrom === 'New' || c.LeadsFrom === 'X-New' || c.LeadsFrom === 'LOA') {
              sumofnb += c.Premium
              nbcounts++
            } else {
              sumofremarket += c.Premium
              remarketcounts++
            }
            sumofscore += c.Score
          })
          if (this.list.length > 0) this.averageScore = Math.round(100 * sumofscore / this.list.length) / 100
          this.NBPremium = sumofnb
          this.RemarketPremium = sumofremarket
          this.NBCounts = nbcounts
          this.RemarketCounts = remarketcounts
          /*
            if (name !== null) {
              this.searchName = name
              this.list = this.list.filter(item => item.Title.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)
            }
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
