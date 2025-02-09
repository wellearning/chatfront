<!--
FileName: Application/PLProcessingRecords.vue
Author: Ge Chen
Update Date: 2025/2/4
Function: Show all the questionnaire record list and download the records.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">C/L Questionnaire Records</span>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" clearable @change="search" @keyup.enter.native="search"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search" :loading="isLoadingAll" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading" size="small">Reset</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-arrow-right" type="default" title="Next Month" @click="nextMonth()" :loading="isLoading "></el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="exportExcel()" :loading="isDownloading" size="small">ToExcel</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table height="500" :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="ApplicationID" width="70" fixed="left"></el-table-column>
        <el-table-column label="ObtainDate" min-width="120">
          <template v-slot="scope">
            <span>{{scope.row.ObtainDate.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column>
        <el-table-column label="ExpiryDate" min-width="120">
          <template v-slot="scope">
            <span>{{dateFormat(scope.row.ExpiryDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="ClientCode" prop="ClientCode" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="PolicyNum" prop="PolicyNumber" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="Applicant" prop="Applicant" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="Brief" prop="Brief" min-width="200" sortable="custom"></el-table-column>
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
      isLoadingAll: false,
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      // 列表
      tempList: [],
      list: [],
      totalList: [],
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
    this.loadObtainRecords(0)
    // this.search(null, 0)
  },
  methods: {
    // 日期格式
    dateFormat (date) {
      if (date === undefined) return ''
      else return moment(date).format('YYYY-MM-DD')
    },
    exportExcel: function () {
      this.isDownloading = true
      let tablename = 'obtainrecords.xlsx'
      this.downloadData('ClObtainRecords', 0, 0, tablename, this)
    },
    loadObtainRecords: function (start) {
      if (start === 0) {
        this.totalList = []
        this.isLoadingApplications = true
        this.isLoadingAll = true
      }
      this.axios.post('/api/Services/CommerceService.asmx/GetQuestionnaireObtainRecords', {start: start}).then(res => {
        if (res) {
          console.log('loadObtainRecords', res)
          this.attachObtainRecords(res.data)
          if (start === 0) {
            this.total = res.count
            this.totalList = res.data
            this.list = this.totalList
            this.pageCount = Math.ceil(this.total / this.pageSize)
            this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            this.isLoadingApplications = false
          } else {
            this.totalList = this.totalList.concat(res.data)
          }
          if (this.totalList.length === this.total) {
            this.totalList.sort(this.bydesc('ObtainDate'))
            this.list = this.totalList
            this.pageCount = Math.ceil(this.total / this.pageSize)
            this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            this.isLoadingAll = false
          } else this.loadObtainRecords(this.totalList.length)
        }
      }).catch(err => {
        console.log('loadObtainRecords', err)
        this.isLoading = false
        this.isLoadingAll = false
      })
    },
    attachObtainRecords: function (records) {
      records.forEach(a => {
        a.ObtainDate = moment(a.ObtainDate)
      })
    },
    search: function () {
      let query = this.searchForm.name.toLowerCase().trim()
      if (query === '') {
        this.list = this.totalList
      } else {
        this.list = this.totalList.filter(r =>
          r.ApplicationID === Number(query) ||
          (r.Applicant !== null && r.Applicant.toLowerCase().indexOf(query) >= 0) ||
          (r.PolicyNumber !== null && r.PolicyNumber.toLowerCase().indexOf(query) >= 0) ||
          (r.ClientCode !== null && r.ClientCode.toLowerCase().indexOf(query) >= 0) ||
          r.ObtainDate.format('YYYY-MM-DD').indexOf(query) >= 0
        )
      }
      this.total = this.list.length
      this.pageCount = Math.ceil(this.total / this.pageSize)
      this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
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
