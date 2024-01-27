<!--
FileName: CoverLetter/coverLetters.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all cover letter list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">All CoverLetters</span>
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
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingInsuranceCompany" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="CoverLetterID" width="70" fixed="left"></el-table-column>
        <el-table-column label="Client Code" prop="ClientCode" min-width="100"></el-table-column>
        <el-table-column label="User" prop="Author" min-width="100"></el-table-column>
        <el-table-column label="Producer" prop="Producer" min-width="100"></el-table-column>
        <el-table-column label="Named Insured(s)" prop="NameInsured" min-width="200"></el-table-column>
        <el-table-column label="Line of Business" prop="Title" min-width="200"></el-table-column>
        <el-table-column label="Company" prop="CorpName" min-width="100"></el-table-column>
        <el-table-column label="EffectiveDate" min-width="100">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="RequestDate" min-width="100">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.RequestDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" prop="StatusName" min-width="100"></el-table-column>
        <el-table-column label="Action" width="450" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-view" type="primary" @click="showCoverLetter(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">View</el-button>
            <!--el-button icon="el-icon-delete" v-if="scope.row.StatusID >= 0 " type="danger" @click="del(scope.row.CoverLetterID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Delete</el-button-->
            <el-button icon="el-icon-edit" type="primary" :disabled="scope.row.Status > 1" @click="showEditCoverLetter(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Edit</el-button>
            <el-button icon="el-icon-edit-outline" v-if="isUploadAuditVisible && (scope.row.Status === 2) && !scope.row.UploadAudited" type="primary" @click="showUpload(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">UpAudit</el-button>
            <el-button icon="el-icon-edit-outline" v-if="isUploadAuditVisible && (scope.row.Status === 2) && scope.row.UploadAudited" type="success" @click="showUpload(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">UpAudit</el-button>
            <el-button icon="el-icon-edit-outline" v-if="isUWAuditVisible && scope.row.Status === 2 && scope.row.UWAuditNeeded && !scope.row.UWAudited" type="primary" @click="showUwAudit(scope.row)" :loading="isLoading" size="small">UwAudit</el-button>
            <el-button icon="el-icon-edit-outline" v-if="isUWAuditVisible && scope.row.Status === 2 && scope.row.UWAudited" type="success" @click="showUwAudit(scope.row)" :loading="isLoading" size="small">UwAudit</el-button>
            <el-button icon="el-icon-edit-outline" v-if="isUWAuditVisible && !scope.row.UWAuditNeeded " type="default" @click="setUwAudit(scope.row)" :loading="isLoading" size="small" title="click to set UwAudit needed"></el-button>
            <el-button icon="el-icon-edit-outline" v-if="isUWAuditVisible && scope.row.UWAuditNeeded " type="success" @click="setUwAudit(scope.row)" :loading="isLoading" size="small" title="click to remove UwAudit needed"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList" @current-change="handleCurrentChange">
      </el-pagination>
      <!----------------------------------------------查阅弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewFormVisible" width="1184.56px" center :before-close="closeViewCoverLetter">
        <ViewCoverLetter ref="ps" :coverletterid="currentCoverLetterID" :coverletter="currentCoverLetter" :insuranceCorps="insuranceCompanyList"></ViewCoverLetter>
      </el-dialog>
      <!----------------------------------------------查阅弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="editAutoCoverLetterWindowVisible" width="1184.56px" center :before-close="closeEdit">
        <EditAutoCoverLetter ref="eacl" :coverletterid="currentCoverLetterID" :insuranceCorps="insuranceCompanyList" @close="closeEditCoverLetter"></EditAutoCoverLetter>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------Processing弹窗开始----------------------------------------------------->
      <el-dialog :title="ProcessingTitle" :visible.sync="processingVisible" width="1184.56px" center :before-close="beforeCloseProcessing" :after-close="closeProcessing">
        <EditNBProcessing ref="enbp" :coverLetter="currentCoverLetter" :processingtypeid="ProcessingTypeID" @close="closeProcessing"></EditNBProcessing>
      </el-dialog>
      <!----------------------------------------------Processing弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import ViewCoverLetter from '@/component/window/viewCoverLetter'
import EditAutoCoverLetter from '@/component/parts/editAutoCoverLetter'
import EditNBProcessing from '@/component/parts/editNBProcessing'

export default {
  components: {
    EditNBProcessing,
    EditAutoCoverLetter,
    ViewCoverLetter
  },
  data: function () {
    return {
      roleName: JSON.parse(this.$store.getters.getAccount).role.Name,
      isUploadAuditVisible: false,
      isUWAuditVisible: false,
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      printObj: {
        id: 'pdfDom',
        popTitle: ''
      },
      htmlTitle: 'null', // pdf文件名
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
      currentCoverLetterID: null,
      currentCoverLetter: null,
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      pageCount: 0,
      isAll: false,
      editAutoCoverLetterWindowVisible: false,
      // 查阅
      viewFormVisible: false,
      pinkSlipFormVisible: false,
      // processing
      ProcessingTypeID: null,
      ProcessingTitle: '',
      processingVisible: false
    }
  },
  mounted: function () {
    this.isUploadAuditVisible = this.roleName === 'Processing Advanced Member' || this.roleName === 'Developer' || this.roleName === 'Admin'
    this.isUWAuditVisible = this.roleName === 'Developer' || this.roleName === 'Admin'
    this.initInsuranceCompany()
    this.search(null, 0)
  },
  methods: {
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    // 保险公司列表
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps', {}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          this.insuranceCompanyList = res.data
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    showUpload: function (coverletter) {
      this.currentCoverLetter = coverletter
      this.currentCoverLetterID = coverletter.CoverLetterID
      this.ProcessingTypeID = 2
      this.ProcessingTitle = 'Upload Audit'
      this.processingVisible = true
      if (this.$refs.enbp !== undefined) {
        this.$refs.enbp.loadProperties(2, coverletter.CoverLetterID)
      }
    },
    setUwAudit: function (coverletter) {
      let id = coverletter.CoverLetterID
      this.axios.post('/api/Services/NewBusinessService.asmx/SetAuditCoverLetter', {coverletterid: id}).then(res => {
        if (res) {
          console.log('删除', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          coverletter.UWAuditNeeded = res.data.UWAuditNeeded
        }
        this.isLoading = false
      }).catch(err => {
        console.log('删除出错', err)
        this.isLoading = false
      })
    },
    showUwAudit: function (coverletter) {
      this.currentCoverLetter = coverletter
      this.currentCoverLetterID = coverletter.CoverLetterID
      this.ProcessingTypeID = 4
      this.ProcessingTitle = 'Underwriting Audit'
      this.processingVisible = true
      if (this.$refs.enbp !== undefined) {
        this.$refs.enbp.loadProperties(4, coverletter.CoverLetterID)
      }
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
    showEditCoverLetter: function (coverletter) {
      let id = coverletter.CoverLetterID
      this.currentCoverLetterID = id
      this.editAutoCoverLetterWindowVisible = true
      if (this.$refs.eacl !== undefined) {
        this.$refs.eacl.loadCoverLetter(id)
      }
    },
    closeEditCoverLetter: function (id, type) {
      this.editAutoCoverLetterWindowVisible = false
      if (type === 'saveAndPrint') {
        this.showCoverLetter(this.currentCoverLetter)
      }
      this.search(this.searchForm.name, 0)
    },
    closeEdit: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        // this.$refs['editForm'].resetFields()
        // this.editForm.templateBlocks = []
        // this.currentBlock = null
        done()
      }).catch(() => {})
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

    // 删除
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/NewBusinessService.asmx/RemoveCoverLetter', {coverletterid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.CoverLetterID !== id)
            this.total = this.list.length
          }
          this.isLoading = false
        }).catch(err => {
          console.log('删除出错', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
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
      this.axios.post('/api/Services/NewBusinessService.asmx/SearchCoverLetters', {query: this.searchName, start: start}).then(res => {
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
          // his.list = res.data
          // this.total = this.list.length
          // this.currentPage = 1
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
      this.search(null, 0)
    },
    handleCurrentChange: function (val) {
      console.log(`当前页: ${val}`)
      if (val === this.pageCount && !this.isAll) {
        this.search(null, this.total)
      }
    },
    // 查阅弹窗
    view: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetter', {coverletterid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.viewFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.viewForm = res.data
            this.viewForm.InsuranceCorp = this.insuranceCompanyList.find(item => item.InsuranceCorpID === res.data.InsuranceCorpID).Name
            this.viewForm.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
            this.viewForm.RequestDate = moment(res.data.RequestDate).format('YYYY-MM-DD')
            this.printObj.popTitle = this.viewForm.Title // + '( ' + this.viewForm.Author + ')'
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    // 关闭查阅
    closeView: function (done) {
      this.viewForm = {
        Title: null,
        EffectiveDate: null,
        InsuranceCorp: null,
        ClientCode: null,
        Author: null,
        branch: {
          Name: null,
          Address: null,
          Telphone: null
        },
        corpbroker: {
          BrokerCode: null,
          corp: {
            Name: null
          }
        },
        RequestDate: null,
        coverLetterTemplates: [{
          coverLetterBlocks: [{
            answers: []
          }]
        }],
        answerList: []
      }
      done()
    },
    // 转pdf
    pdf: function (title, EffectiveDate) {
      this.htmlTitle = title + ' ' + EffectiveDate
      this.getPdf('#pdfDom')
      this.axios.post('/api/Services/NewBusinessService.asmx/CreatePrintRecord', {coverletterid: this.viewForm.CoverLetterID, typeid: 1}).then(res => {
        if (res) {
          console.log('create printRecord', res)
        }
      }).catch(err => {
        console.log('导出CoverLetter PDF出错', err)
      })
    }
  }
}
</script>

<style scoped>

</style>
