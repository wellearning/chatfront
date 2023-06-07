<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">P/L Processing Records</span>
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
            <!--el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingInsuranceCompany" size="small">Reset</el-button-->
            <el-button icon="el-icon-refresh" @click="exportExcel()" :loading="isLoading" size="small">ToExcel</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingInsuranceCompany" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="CoverLetterID" width="70" fixed="left"></el-table-column>
        <!--el-table-column label="Enter Date" min-width="100">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.EnterDate)}}</span>
          </template>
        </el-table-column-->
        <el-table-column label="EffectiveDate" min-width="120">
          <template v-slot="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Score" prop="Score" min-width="70"></el-table-column>
        <el-table-column label="Producer" prop="Producer" min-width="100"></el-table-column>
        <el-table-column label="User" prop="User" min-width="100"></el-table-column>
        <el-table-column label="Branch Code" prop="BranchCode" min-width="100"></el-table-column>
        <el-table-column label="NameInsured" prop="NameInsured" min-width="200"></el-table-column>
        <el-table-column label="Client Code" prop="ClientCode" min-width="120"></el-table-column>
        <el-table-column label="Company" prop="Company" min-width="100"></el-table-column>
        <el-table-column label="Policy Status" prop="PolicyStatus" min-width="120"></el-table-column>
        <el-table-column label="Insurance Type" prop="InsuranceType" min-width="130"></el-table-column>
        <el-table-column label="Leads From" prop="LeadsFrom" min-width="120"></el-table-column>
        <el-table-column label="No prior" prop="NoPrior" min-width="100"></el-table-column>
        <el-table-column label="Underage/Senior" prop="Underage" min-width="100"></el-table-column>
        <el-table-column label="Gap" prop="InsuranceGap" min-width="100"></el-table-column>
        <el-table-column label="SoleDrivLicense" prop="SoleDriverLicense" min-width="130"></el-table-column>
        <el-table-column label="UBIProgram" prop="UBIProgram" min-width="130"></el-table-column>
        <el-table-column label="#Driver" prop="NumberOfDriver" min-width="100"></el-table-column>
        <el-table-column label="#Vehicle" prop="NumberOfVehicle" min-width="100"></el-table-column>
        <el-table-column label="HighValue" prop="HighValue" min-width="100"></el-table-column>
        <el-table-column label="VehicleUsage" prop="VehicleUsage" min-width="120"></el-table-column>
        <el-table-column label="PropertyType" prop="PropertyType" min-width="120"></el-table-column>
        <el-table-column label="PropPackage" prop="PropertyPackage" min-width="120"></el-table-column>
        <el-table-column label="SewerBackup" prop="SewerBackup" min-width="120"></el-table-column>
        <el-table-column label="MonoDual" prop="MonoDual" min-width="100"></el-table-column>
        <el-table-column label="Premium" prop="Premium" min-width="100"></el-table-column>
        <el-table-column label="MissReferral" prop="MissReferral" min-width="120"></el-table-column>
        <el-table-column label="UWPending" prop="UWPending" min-width="130"></el-table-column>
        <el-table-column label="UWComments" prop="UWComments" min-width="130"></el-table-column>
        <el-table-column label="UWFinishDate" min-width="130">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.UWFinishDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="UWFinishedBy" prop="UWFinishedBy" min-width="130"></el-table-column>
        <el-table-column label="NotMatch" prop="NotMatch" min-width="100"></el-table-column>
        <el-table-column label="ReasonOfMismatch" prop="ReasonOfMismatch" min-width="160"></el-table-column>
        <el-table-column label="UploadPending" prop="UploadPending" min-width="140"></el-table-column>
        <el-table-column label="UploadDate" min-width="120">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.UploadDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="UploadedBy" prop="UploadedBy" min-width="120"></el-table-column>
        <el-table-column label="DeclinationType" prop="DeclinationType" min-width="140"></el-table-column>
        <el-table-column label="DeclinationReason" prop="DeclinationReason" min-width="150"></el-table-column>
        <el-table-column label="AlternativeSulotion" prop="AlternativeSulotion" min-width="160"></el-table-column>
        <el-table-column label="DeclineDate" min-width="120">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.DeclineDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="DeclinedBy" prop="DeclinedBy" min-width="120"></el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList" @current-change="handleCurrentChange">
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
      isLoading: false,
      // isLoadingStaffs: false,
      isLoadingInsuranceCompany: false,
      // staffsList: [],
      insuranceCompanyList: [],
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
      tempList: [],
      list: [],
      currentCoverLetter: null,
      currentCoverLetterID: 0,
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
    exportExcel: function () {
      let month = String(this.searchForm.Month)
      if (this.searchForm.Month < 10) month = '0' + month
      let tablename = 'statistics' + this.searchForm.Year + month + '.xlsx'
      // this.downloadData('PlProcessing', '0', tablename)
      this.downloadData('PlProcessingMonth', this.searchForm.Year, this.searchForm.Month, tablename)
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
    showMain: function () {
      this.isLoading = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetterStatistic_month', {year: this.searchForm.Year, month: this.searchForm.Month}).then(res => {
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

    showCoverLetter: function (coverLetter) {
      this.currentCoverLetter = coverLetter
      this.currentCoverLetterID = coverLetter.CoverLetterID
      this.viewFormVisible = true
      if (this.$refs.ps !== undefined) {
        this.$refs.ps.loadCoverLetter(coverLetter.CoverLetterID)
      }
    },
    closeViewCoverLetter: function (done) {
      this.viewFormVisible = false
      if (this.$refs.ps !== undefined) {
        this.$refs.ps.close(done)
      }
    },
    showUnderWriter: function (coverletter) {
      this.currentCoverLetter = coverletter
      this.currentCoverLetterID = coverletter.CoverLetterID
      this.ProcessingTypeID = 1
      this.ProcessingTitle = 'Underwriting Processing'
      this.processingVisible = true
      if (this.$refs.enbp !== undefined) {
        this.$refs.enbp.loadProperties(1, coverletter.CoverLetterID)
      }
    },
    showUpload: function (coverletter) {
      this.currentCoverLetter = coverletter
      this.currentCoverLetterID = coverletter.CoverLetterID
      this.ProcessingTypeID = 2
      this.ProcessingTitle = 'Upload Processing'
      this.processingVisible = true
      if (this.$refs.enbp !== undefined) {
        this.$refs.enbp.loadProperties(2)
      }
    },
    showDecline: function (coverletter) {
      this.currentCoverLetter = coverletter
      this.currentCoverLetterID = coverletter.CoverLetterID
      this.ProcessingTypeID = 3
      this.ProcessingTitle = 'Decline Processing'
      this.processingVisible = true
      if (this.$refs.enbp !== undefined) {
        this.$refs.enbp.loadProperties(3)
      }
    },
    beforeCloseProcessing: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        done()
      }).catch(() => {})
    },
    closeProcessing: function () {
      this.$refs.enbp.closeview()
      // this.currentCoverLetter = null
      this.ProcessingTypeID = 0
      this.processingVisible = false
      if (this.$refs.enbp !== undefined) {
        this.$refs.enbp.close()
      }
    },
    // 查询
    search: function (name, start) {
      this.isLoading = true
      if (start === 0) this.list = []
      // 后端不支持null查询，把null转换成''
      if (name === null) {
        this.searchName = ''
      } else {
        this.searchName = name
      }
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetterStatistic', {start: start}).then(res => {
        if (res) {
          console.log('查询', res)
          if (res.data.length < this.pagerCount * this.pageSize) {
            this.isAll = true
          } else {
            this.isAll = false
          }
          this.list = this.list.concat(res.data)
          this.total = this.list.length
          this.pageCount = Math.ceil(this.total / this.pageSize)
          // this.list = res.data
          // this.total = this.list.length
          // this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    handleCurrentChange: function (val) {
      console.log(`当前页: ${val}`)
      if (val === this.pageCount && !this.isAll) {
        this.search(null, this.total)
      }
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search(null, 0)
    }
  }
}
</script>

<style scoped>

</style>
