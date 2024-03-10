<!--
FileName: CoverLetter/PLProcessing.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show the needed processing cover letter list and do the processing job on the cover letter of the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">P/L Processing</span>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name, 0)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingInsuranceCompany" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table height="600" :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingInsuranceCompany" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="CoverLetterID" width="70" fixed="left" sortable="custom"></el-table-column>
        <el-table-column label="ClieCode" prop="ClientCode" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="ReviewedBy" prop="UWReviewedBy" min-width="130" sortable="custom"></el-table-column>
        <!--el-table-column label="User" prop="Author" min-width="100"></el-table-column-->
        <el-table-column label="Producer" prop="Producer" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="Named Insured(s)" prop="NameInsured" min-width="180" sortable="custom"></el-table-column>
        <el-table-column label="Line of Business" prop="Title" min-width="180" sortable="custom"></el-table-column>
        <el-table-column label="Company" prop="CorpName" min-width="130" sortable="custom"></el-table-column>
        <el-table-column label="EffeDate" prop="EffectiveDate" min-width="120" sortable="custom">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="RequDate" prop="RequestDate" min-width="110" sortable="custom">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.RequestDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="UWScore" prop="Score" min-width="70"></el-table-column>
        <el-table-column label="Q-Score" prop="QualityScore" min-width="70"></el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template v-slot="scope">
            <el-button-group>
              <el-button icon="el-icon-view" type="primary" @click="showCoverLetter(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">View</el-button>
              <el-button icon="el-icon-edit" v-if="scope.row.Status === 1 " type="primary" @click="showUnderWriter(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">U/W</el-button>
              <el-button icon="el-icon-edit" v-if="scope.row.Status === 2 || scope.row.Status === 3" type="success" @click="showUnderWriter(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">U/W</el-button>
              <el-button icon="el-icon-edit" v-if="scope.row.Status === 2" type="primary" @click="showUpload(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Upload</el-button>
              <el-button icon="el-icon-edit" v-if="scope.row.Status === 3" type="success" @click="showUpload(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Upload</el-button>
              <el-button icon="el-icon-delete" v-if="scope.row.Status !== 4" type="danger" @click="showDecline(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Decline</el-button>
              <el-button icon="el-icon-edit" v-if="scope.row.Status === 4" type="danger" @click="reinstate(scope.row)" :loading="isLoading" size="small">Reinstate</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList" @current-change="handleCurrentChange">
      </el-pagination>
      <!----------------------------------------------Processing弹窗开始----------------------------------------------------->
      <el-dialog :title="ProcessingTitle" :visible.sync="processingVisible" width="1184.56px" center :before-close="beforeCloseProcessing" :after-close="closeProcessing">
        <EditNBProcessing ref="enbp" :coverLetter="currentCoverLetter" :processingtypeid="ProcessingTypeID" @close="closeProcessing"></EditNBProcessing>
      </el-dialog>
      <!----------------------------------------------Processing弹窗结束----------------------------------------------------->
      <!----------------------------------------------查阅弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewFormVisible" width="1184.56px" center :before-close="closeViewCoverLetter">
        <ViewCoverLetter ref="ps" :coverletterid="currentCoverLetterID" :coverletter="currentCoverLetter" :insuranceCorps="insuranceCompanyList"></ViewCoverLetter>
      </el-dialog>
      <!----------------------------------------------查阅弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import EditNBProcessing from '@/component/parts/editNBProcessing'
import ViewCoverLetter from '@/component/window/viewCoverLetter'

export default {
  components: {
    EditNBProcessing,
    ViewCoverLetter
  },
  data: function () {
    return {
      roleName: JSON.parse(this.$store.getters.getAccount).role.Name,
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      printObj: {
        id: 'pdfDom',
        popTitle: ''
      },
      isLoading: false,
      // isLoadingStaffs: false,
      isLoadingInsuranceCompany: false,
      // staffsList: [],
      insuranceCompanyList: [],
      // 搜索
      searchForm: {
        name: null
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
    this.search(null, 0)
  },
  methods: {
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
    },
    rank: function (name) {
      this.list.sort(this.by(name))
    },
    rankdesc: function (name) {
      this.list.sort(this.bydesc(name))
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
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
      this.ProcessingTypeID = 5
      this.ProcessingTitle = 'Uploading Processing'
      this.processingVisible = true
      if (this.$refs.enbp !== undefined) {
        this.$refs.enbp.loadProperties(5, coverletter.CoverLetterID)
      }
    },
    showDecline: function (coverletter) {
      this.currentCoverLetter = coverletter
      this.currentCoverLetterID = coverletter.CoverLetterID
      this.ProcessingTypeID = 3
      this.ProcessingTitle = 'Decline Processing'
      this.processingVisible = true
      if (this.$refs.enbp !== undefined) {
        this.$refs.enbp.loadProperties(3, coverletter.CoverLetterID)
      }
    },
    reinstate: function (coverletter) {
      this.isLoading = true
      this.axios.post('/api/Services/NewBusinessService.asmx/ReinstateCoverLetter', {coverletterid: coverletter.CoverLetterID}).then(res => {
        if (res) {
          coverletter.Status = res.data.Status
          coverletter.StatusID = res.data.StatusID
          console.log('修改', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('修改出错', err)
        this.isLoading = false
      })
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
      this.axios.post('/api/Services/NewBusinessService.asmx/GetProcessingCoverLetters', {query: this.searchName, start: start}).then(res => {
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
          // let total = this.list.length
          // let pagesize = this.pageSize
          // let count = Math.ceil(total / pagesize)
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
