<!--
FileName: clMyApplications.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show my commercial application list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">My Applications</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany">New Application</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="ApplicationID" width="60" fixed="left"></el-table-column>
        <el-table-column label="Title" prop="Title" min-width="300"></el-table-column>
        <el-table-column label="Producer" prop="Producer" min-width="100"></el-table-column>
        <el-table-column label="Applicant" prop="NameInsured" min-width="200"></el-table-column>
        <el-table-column label="RequestDate" min-width="150">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.RequestDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" prop="Status" min-width="100"></el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-view" type="primary" @click="showViewApplication(scope.row)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">View</el-button>
            <el-button icon="el-icon-edit" type="primary" :disabled="scope.row.StatusID > 1" @click="showEditApplication(scope.row)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Edit</el-button>
            <el-button icon="el-icon-view"  type="primary" @click="showSheet(scope.row.ApplicationID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">FORM</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="editApplicationWindowVisible" width="1550px" center :before-close="closeEdit">
        <EditApplication ref="eacl" :applicationid="currentApplicationID" :templateList="templatesList" @close="closeEditApplication"></EditApplication>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------查阅弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewFormVisible" width="1184.56px" center :before-close="closeViewApplication">
        <ViewApplication ref="ps" :applicationid="currentApplicationID" :insuranceCorps="insuranceCompanyList"></ViewApplication>
      </el-dialog>
      <!----------------------------------------------查阅弹窗结束----------------------------------------------------->
      <!----------------------------------------------Sheet 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="sheetFormVisible" width="1184.56px"  height="2184.56px" center >
        <ViewSheet ref="vs" :businessObjId="currentApplicationID" :businessTypeId="4"></ViewSheet>
      </el-dialog>
      <!----------------------------------------------Sheet 弹窗结束----------------------------------------------------->

    </div>
  </div>
</template>

<script>
import moment from 'moment'
import ViewSheet from '@/component/window/sheet'
import ViewApplication from '@/component/window/viewApplication'
import EditApplication from '@/component/parts/editApplication'

export default {
  components: {
    ViewSheet,
    EditApplication,
    ViewApplication
  },
  data: function () {
    return {
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
        name: null
      },
      searchName: null,
      pinkSlipFormVisible: false,
      currentApplicationID: null,
      currentApplication: null,
      // 列表
      tempList: [],
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 修改
      isLoadingTemplates: false,
      isLoadingInsuranceCompany: false,
      templatesList: [],
      insuranceCompanyList: [],
      currentTemplates: [],
      applicationFormVisible: false,
      applicationForm: {
        ApplicationID: null,
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        ClientCode: null,
        StatusID: 0,
        RequestDate: moment(new Date()),
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        Templates: null
      },
      applicationFormRules: {
        Title: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        EffectiveDate: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        InsuranceCorpID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        ClientCode: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        Templates: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ]
      },
      // 查阅
      editApplicationWindowVisible: false,
      sheetFormVisible: false,
      viewFormVisible: false
    }
  },
  mounted: function () {
    this.search(null)
    this.initTemplates()
    this.initInsuranceCompany()
    if (this.$store.state.ApplicationID !== undefined && this.$store.state.ApplicationID !== '') {
      this.view(this.$store.state.ApplicationID)
      this.$store.state.ApplicationID = ''
    }
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
    setCurrent: function (application) {
      this.currentApplication = application
      this.currentApplicationID = application.ApplicationID
    },
    showApplication: function (id) {
      this.viewFormVisible = true
      if (this.$refs.ps !== undefined) {
        this.$refs.ps.loadApplication(id)
      }
    },
    showViewApplication: function (application) {
      this.setCurrent(application)
      this.showApplication(application.ApplicationID)
    },
    closeViewApplication: function (done) {
      this.viewFormVisible = false
      if (this.$refs.ps !== undefined) {
        this.$refs.ps.close(done)
      }
    },
    showEditApplication: function (application) {
      let id = application.ApplicationID
      this.currentApplicationID = id
      this.editApplicationWindowVisible = true
      if (this.$refs.eacl !== undefined) {
        this.$refs.eacl.loadApplication(id)
      }
    },
    closeEditApplication: function (id, type) {
      this.editApplicationWindowVisible = false
      if (type === 'saveAndPrint') {
        this.showApplication(id)
      }
      this.search(this.searchForm.name)
    },
    // 关闭修改
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

    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    // 查询
    search: function (name) {
      if (name === undefined) name = ''
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetMyApplications', {query: name}).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
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
    },
    // 删除
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/CommerceService.asmx/RemoveApplication', {applicationid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.ApplicationID !== id)
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
    // Templates列表
    initTemplates: function () {
      this.isLoadingTemplates = true
      this.axios.post('/api/Services/BaseService.asmx/GetTemplatesByBusinessType', {btypeid: 4}).then(res => {
        if (res) {
          console.log('Templates列表', res)
          this.templatesList = res.data
        }
        this.isLoadingTemplates = false
      }).catch(err => {
        console.log('Templates列表出错', err)
        this.isLoadingTemplates = false
      })
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

    // 关闭查阅
    closeView: function (done) {
    },
    // 转pdf
    pdf: function (title, EffectiveDate) {
      this.htmlTitle = title + ' ' + EffectiveDate
      this.getPdf('#pdfDom')
      this.axios.post('/api/Services/BaseService.asmx/CreatePrintRecord', {applicationid: this.viewForm.ApplicationID, typeid: 1}).then(res => {
        if (res) {
          console.log('create printRecord', res)
        }
      }).catch(err => {
        console.log('导出Application PDF出错', err)
      })
    },
    // 添加application
    showAdd: function () {
      this.$router.push({path: '/clNewApplication'})
    },
    showSheet: function (applicationid) {
      this.currentApplicationID = applicationid
      this.sheetFormVisible = true
      if (this.$refs.vs !== undefined) {
        this.$refs.vs.loadBusinessObj(applicationid)
      }
    }
  }
}
</script>

<style scoped>

</style>
