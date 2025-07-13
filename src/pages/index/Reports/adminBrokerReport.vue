<!--
FileName: Reports/adminBrokerReport.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show broker report as administrator role.
-->
<template>
  <div>
    <div class="inPageTitle">
      <!--span class="inPageNav" href="#" style="color:darkblue" title="Click here to return to the main report.">{{reportTitle}}</span-->
      <a class="inPageNav" href="#" @click="showMain" style="color:darkblue" title="Click here to return to the main report.">{{reportTitle}}</a>
      <a v-if="producerVisible" style="color:darkblue" class="inPageNav" href="#" @click="showProducer()" title="Click here to return to the branch report.">  - {{currentProducer.ProducerName}}</a>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item>
            <el-radio-group v-model="searchForm.viewMonthly" size="large" @change="switchRecords()" :loading="isLoading" style="margin-top: -3px">
              <el-radio-button label="Month to Date" />
              <el-radio-button label="Year to Date" />
            </el-radio-group>
            <el-button icon="el-icon-arrow-left" type="default" title="Prev Month" @click="prevMonth()" :loading="isLoading "></el-button>
          </el-form-item>
          <el-form-item label="Year" prop="Year">
            <el-select v-model="searchForm.Year" placeholder="" class="yearMonthSelection" no-data-text="No Record" filterable @change="changeYear()">
              <el-option v-for="item in years" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Month" prop="Month">
            <el-select v-model="searchForm.Month" class="yearMonthSelection" placeholder="" no-data-text="No Record" filterable @change="changeYearMonth()">
              <el-option v-for="item in months" :key="item.value" :label="item.name" :value="item.value"></el-option>
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
        <el-table-column label="ID" prop="ProducerID" width="60" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column label="Producer Name" prop="ProducerName" min-width="150" sortable="custom">
          <template v-slot="scope" >
            <a @click = "showProducer(scope.row)" style="color:darkblue" href="#" title="Click here to show the detail.">{{scope.row.ProducerName}}</a>
          </template>
        </el-table-column>
        <el-table-column label="NB Counts" prop="NBCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="NB Premium" prop="NBPremium" class="" min-width="150" sortable="custom">
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
        <el-table-column v-if="btypeId===4" label="Renewal Counts" prop="RenewalCounts" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===4" label="Renewal Premium" prop="RenewalPremium" min-width="150" sortable="custom">
          <template slot-scope="scope" >
            <span>${{scope.row.RenewalPremium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="btypeId===2" label="UW Score" prop="UWScore" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===2" label="Quality Score" prop="QualityScore" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column v-if="btypeId===2" label="Score Average" prop="ScoreAverage" min-width="150" sortable="custom">
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
    </div>
    <div v-else-if="producerVisible">
      <ProducerDetail ref="producerD" :btypeId="btypeId" :searchForm="searchForm" :producer="currentProducer"></ProducerDetail>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import ProducerDetail from '@/component/window/producerDetail'

export default {
  components: {
    ProducerDetail
  },
  data: function () {
    return {
      btypeId: 2,
      reportTitle: 'P/L Broker Report',
      // viewMonthly: 'Month to Date',
      isLoading: false,
      isLoadingYearToDate: false,
      isLoadingMonthToDate: false,
      // businessLineID: 1,
      // 搜索
      searchForm: {
        viewMonthly: 'Month to Date',
        name: null,
        Year: 2022,
        Month: 1
      },
      // 列表
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
        {name: 'December', value: 12}],
      list: [],
      producers: [],
      coverletters: [],
      coverletterproperties: [],
      currentProducer: null,
      currentCoverLetter: null,
      adminVisible: true,
      producerVisible: false,
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
    let id = this.$route.params.id === undefined ? 2 : Number(this.$route.params.id)
    if (id !== undefined) {
      this.btypeId = id
    }
    // this.businessLineID = Number(this.$route.params.id)
    if (this.btypeId === 4) this.reportTitle = 'C/L Broker Report'
    this.searchForm.Year = new Date().getFullYear()
    this.searchForm.Month = new Date().getMonth() + 1
    for (var i = 2020; i <= this.searchForm.Year; i++) {
      this.years.push(i)
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
      this.producerVisible = false
      this.search()
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    // 查询
    search: function () {
      this.isLoading = true
      let service = '/api/Services/NewBusinessService.asmx/GetProducerRecords_all'
      let param = {year: this.searchForm.Year, month: this.searchForm.Month}
      if (this.searchForm.viewMonthly === 'Year to Date') {
        service = '/api/Services/NewBusinessService.asmx/GetProducerRecords_all_year'
        param = {year: this.searchForm.Year}
      }
      if (this.btypeId === 4) {
        service = service.replace('NewBusinessService', 'CommerceService')
        param = {year: this.searchForm.Year, month: this.searchForm.Month}
        if (this.searchForm.viewMonthly === 'Year to Date') param = {year: this.searchForm.Year}
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          this.total = this.list.length
          this.currentPage = 1
          this.isLoading = false
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    showProducer: function (producer) {
      this.currentProducer = producer
      this.adminVisible = false
      this.producerVisible = true
      this.coverLetterVisible = false
      if (this.$refs.producerD !== undefined) {
        this.$refs.producerD.loadProducer(producer.ProducerID, this.searchForm)
      }
    }
  }
}
</script>

<style scoped>

</style>
