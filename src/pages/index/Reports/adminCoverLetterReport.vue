<template>
  <div>
    <div class="inPageTitle">
      <a class="inPageNav" href="#" style="color:darkblue" title="Click here to return to the main report.">Admin CoverLetter Report</a>
      <a v-if="adminVisible" style="color:darkblue" class="inPageNav" href="#" title="Click here to return to the branch report.">  - {{currentItem.value}} Report</a>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="Report" prop="ReportItem">
            <el-select v-model="searchForm.ReportItem" placeholder="" class="yearMonthSelection" no-data-text="No Record" filterable @change="showMain()">
              <el-option v-for="item in reportItems" :key="item.key" :label="item.value" :value="item.key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-radio-group v-model="viewMonthly" size="large" @change="switchRecords()" :loading="isLoading" style="margin-top: -3px">
              <el-radio-button label="View Monthly" />
              <el-radio-button label="View Yearly" />
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
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="" prop="ID" width="60" fixed="left">
          <template slot="header" >
            <span @click = "rank('ID')" @dblclick="rankdesc('ID')" title="Click to rank, double click to rank desc">ID</span>
          </template>
        </el-table-column>
        <el-table-column label="Name" prop="Name" min-width="150">
          <template slot="header" >
            <span @click = "rank('Name')" @dblclick="rankdesc('Name')" title="Click to rank, double click to rank desc">Name</span>
          </template>
          <!--template slot-scope="scope" >
            <a @click = "showBranch(scope.row)" style="color:darkblue" href="#" title="Click here to show the branch detail.">{{scope.row.Name}}</a>
          </template-->
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
        <el-table-column label="" prop="Counts" min-width="150">
          <template slot="header" >
            <span @click = "rank('Counts')" @dblclick="rankdesc('Counts')" title="Click to rank, double click to rank desc">Total Counts</span>
          </template>
        </el-table-column>
        <el-table-column label="" prop="Premium" min-width="150">
          <template slot="header" >
            <span @click = "rank('Premium')" @dblclick="rankdesc('Premium')" title="Click to rank, double click to rank desc">Total Premium</span>
          </template>
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
      viewMonthly: 'View Monthly',
      isLoading: false,
      isLoadingYearToDate: false,
      isLoadingMonthToDate: false,
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
      reportItems: [ {key: 'Corperation', value: 'Company'}, {key: 'InsuranceType', value: 'Business Line'}, {key: 'Template', value: 'Template'} ],
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
    // 查询
    search: function () {
      this.isLoading = true
      let service = '/api/Services/NewBusinessService.asmx/Get' + this.searchForm.ReportItem + 'Records'
      let param = {year: this.searchForm.Year, month: this.searchForm.Month}
      if (this.viewMonthly === 'View Yearly') {
        service += '_year'
        param = {year: this.searchForm.Year}
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          this.list.forEach(function (item) {
            item.Counts = item.NBCounts + item.RemarketCounts
            item.Premium = item.NBPremium + item.RemarketPremium
          })
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
