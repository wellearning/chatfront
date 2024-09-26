<!--
FileName: Application/PLProcessingRecords.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all the processing record list and download the records.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">C/L Processing Records</span>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <!--el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name, 0)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Go</el-button>
          </el-form-item-->
          <el-form-item>
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
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="exportExcel()" :loading="isDownloading" size="small">ToExcel</el-button>
            <el-button icon="el-icon-refresh" @click="exportExcel(0)" :loading="isDownloading" size="small">AllToExcel</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table height="500" :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingInsuranceCompany" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="ApplicationID" width="70" fixed="left"></el-table-column>
        <el-table-column label="EffectiveDate" min-width="120">
          <template v-slot="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="ExpiryDate" min-width="120">
          <template v-slot="scope">
            <span>{{dateFormat(scope.row.ExpiryDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="ClientCode" prop="ClientCode" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="PolicyNum" prop="PolicyNumber" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="Applicant" prop="NameInsured" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="InsuCorp" prop="CorpName" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="A/D" prop="AgenDir" min-width="70" sortable="custom"></el-table-column>
        <el-table-column label="Producer" prop="Producer" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Status" prop="PolicyStatus" min-width="100" sortable="custom"></el-table-column>
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
      isDownloading: false,
      isLoading: false,
      // isLoadingStaffs: false,
      isLoadingInsuranceCompany: false,
      // staffsList: [],
      insuranceCorpList: [],
      producerList: [],
      statusList: [],
      renewalStatusList: [],
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
          {name: 'December', value: 12},
          {name: 'All Year', value: 0}
        ]
      },
      searchName: null,
      // 列表
      tempList: [],
      list: [],
      currentApplication: null,
      currentApplicationID: 0,
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      pageCount: 0,
      isAll: false,
      viewFormVisible: false,
      // processing
      ProcessingTypeID: null,
      ProcessingTitle: '',
      processingVisible: false
    }
  },
  mounted: function () {
    this.loadProducers(0)
    this.loadInsuranceCorps()
    this.loadApplicationStatus()
    this.loadRenewalStatus()
    this.searchForm.Year = new Date().getFullYear()
    this.searchForm.Month = new Date().getMonth() + 1
    for (let i = 2020; i <= this.searchForm.Year; i++) {
      this.searchForm.years.push(i)
    }
    this.showMain()
    // this.search(null, 0)
  },
  methods: {
    // 日期格式
    dateFormat (date) {
      if (date === undefined) return ''
      else return moment(date).format('YYYY-MM-DD')
    },
    exportExcel: function (year) {
      this.isDownloading = true
      let month = String(this.searchForm.Month)
      if (this.searchForm.Month < 10) month = '0' + month
      let tablename = 'clStatistics_all.xlsx'
      if (year === undefined) {
        year = this.searchForm.Year
        tablename = 'clStatistics' + this.searchForm.Year + month + '.xlsx'
      }
      this.downloadData('ClProcessingMonth', year, this.searchForm.Month, tablename, this)
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
    loadProducers: function (start) {
      this.isLoadingProducers = true
      this.axios.post('/api/Services/baseservice.asmx/GetAllProducers', {start: start}).then(res => {
        if (res) {
          console.log('producerList', res)
          if (start === 0) {
            this.producerCount = res.count
            this.producerList = res.data
          } else {
            this.producerList = this.producerList.concat(res.data)
          }
          if (this.producerList.length < this.producerCount) {
            this.loadProducers(this.producerList.length)
          } else {
            this.isLoadingProducers = false
            this.attachProducers()
          }
        }
      }).catch(err => {
        console.log('producerList', err)
        this.isLoadingProducers = false
      })
    },
    attachProducers: function () {
      if (!this.isLoadingApplications && !this.isLoadingProducers) {
        this.totalList.forEach(a => {
          let producer = this.producerList.find(p => p.StaffID === a.ProducerID)
          if (producer !== undefined) a.Producer = producer.Name
          else a.Producer = ''
          if (a.StaffID === a.ProducerID) a.Author = a.Producer
          else {
            let author = this.producerList.find(p => p.StaffID === a.StaffID)
            if (producer !== undefined) a.Author = author.Name
            else a.Author = ''
          }
        })
      }
    },
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
          this.statusList = res.data
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    loadRenewalStatus: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'ApplicationRenewalStatus'}).then(res => {
        if (res) {
          console.log('loadRenewalStatus', res)
          this.renewalStatusList = res.data
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('loadRenewalStatus', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    showMain: function () {
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationStatistic_month', {year: this.searchForm.Year, month: this.searchForm.Month}).then(res => {
        if (res) {
          console.log('查询', res)
          this.attachApplications((res.data))
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
    attachApplications: function (applications) {
      applications.forEach(a => {
        a.EffectiveDate = moment(a.EffectiveDate)
        a.ExpiryDate = moment(a.ExpiryDate)
        a.RequestDate = moment(a.RequestDate)
        a.DateOfBirth = moment(a.DateOfBirth)
        let status = this.statusList.find(s => s.key === a.Status)
        let renewalStatus = this.renewalStatusList.find(s => s.key === a.RenewalStatus)
        if (status.value !== 'Bound') {
          a.PolicyStatus = status.value
        } else {
          if (renewalStatus.value === 'Opened') {
            let dateline = moment().add(2, 'M')
            if (a.ExpiryDate < dateline) a.PolicyStatus = 'Open Renewal'
            else a.PolicyStatus = 'NB'
          } else if (renewalStatus.value === 'Pending') a.PolicyStatus = 'Pending Renewal'
          else a.PolicyStatus = renewalStatus.value
        }
        let producer = this.producerList.find(p => p.StaffID === a.ProducerID)
        if (producer !== undefined) a.Producer = producer.Name
        else a.Producer = ''
        let corp = this.insuranceCorpList.find(p => p.InsuranceCorpID === a.InsuranceCorpID)
        if (corp !== undefined) a.CorpName = corp.ShortName
        else a.CorpName = ''
        if (a.BillWayID === 1) a.AgenDir = 'A'
        else if (a.BillWayID === 2) a.AgenDir = 'D'
        else a.AgenDir = ''
      })
    },
    handleCurrentChange: function (val) {
      console.log(`当前页: ${val}`)
      if (val === this.pageCount && !this.isAll) {
        this.search(null, this.total)
      }
    }

  }
}
</script>

<style scoped>

</style>
