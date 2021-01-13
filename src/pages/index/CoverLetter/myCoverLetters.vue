<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">My CoverLetters</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany">New</el-button>
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
        <el-table-column label="ID" prop="CoverLetterID" width="60" fixed="left"></el-table-column>
        <el-table-column label="Client Code" prop="ClientCode" min-width="100"></el-table-column>
        <el-table-column label="Producer" prop="Producer" min-width="100"></el-table-column>
        <el-table-column label="Named Insured(s)" prop="NameInsured" min-width="200"></el-table-column>
        <el-table-column label="Line of Business" prop="Title" min-width="200"></el-table-column>
        <el-table-column label="Company" prop="CorpName" min-width="150"></el-table-column>
        <el-table-column label="EffectiveDate" min-width="150">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="RequestDate" min-width="150">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.RequestDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" prop="Status" min-width="100"></el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-view" type="primary" @click="showCoverLetter(scope.row)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">View</el-button>
            <el-button icon="el-icon-edit" type="primary" :disabled="scope.row.StatusID > 1" @click="showEditCoverLetter(scope.row)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Edit</el-button>
            <!--el-button icon="el-icon-edit" type="primary" v-if="scope.row.StatusID < 2 " @click="voidCoverLetter(scope.row.CoverLetterID)" :loading="isLoading" size="small">Void</el-button>
            <el-button icon="el-icon-edit" type="primary" v-if="scope.row.StatusID === 5" @click="unvoidCoverLetter(scope.row.CoverLetterID)" :loading="isLoading" size="small">Unvoid</el-button-->
            <!--<el-button icon="el-icon-view" v-if="scope.row.NeedPinkSlip" type="primary" @click="showPinkSlip(scope.row.CoverLetterID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Pink Slip</el-button>
            <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.CoverLetterID)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Delete</el-button>-->
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="editAutoCoverLetterWindowVisible" width="1184.56px" center :before-close="closeEdit">
        <EditAutoCoverLetter ref="eacl" :coverletterid="currentCoverLetterID" :insuranceCorps="insuranceCompanyList" @close="closeEditCoverLetter"></EditAutoCoverLetter>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
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
import PinkSlip from '@/component/window/pinkSlip'
import ViewCoverLetter from '@/component/window/viewCoverLetter'
import EditAutoCoverLetter from '@/component/parts/editAutoCoverLetter'

export default {
  components: {
    PinkSlip,
    EditAutoCoverLetter,
    ViewCoverLetter
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
      currentCoverLetterID: null,
      currentCoverLetter: null,
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
      coverLetterFormVisible: false,
      coverLetterForm: {
        CoverLetterID: null,
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        ClientCode: null,
        StatusID: 0,
        RequestDate: moment(new Date()),
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        Templates: null
      },
      coverLetterFormRules: {
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
      editAutoCoverLetterWindowVisible: false,
      viewFormVisible: false,
      viewForm: {
        Title: null,
        EffectiveDate: null,
        InsuranceCorp: null,
        ClientCode: null,
        Author: null,
        StatusID: 0,
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
    }
  },
  mounted: function () {
    this.search(null)
    this.initTemplates()
    this.initInsuranceCompany()
    if (this.$store.state.CoverLetterID !== undefined && this.$store.state.CoverLetterID !== '') {
      this.view(this.$store.state.CoverLetterID)
      this.$store.state.CoverLetterID = ''
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
      this.isLoading = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetMyCoverLetters', {query: name}).then(res => {
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
    // Templates列表
    initTemplates: function () {
      this.isLoadingTemplates = true
      this.axios.post('/api/Services/NewBusinessService.asmx/SearchTemplates', {query: ''}).then(res => {
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
    voidCoverLetter: function (id) {
      this.$confirm('Are you sure to void it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/NewBusinessService.asmx/VoidCoverLetter', {coverletterid: id}).then(res => {
          if (res) {
            console.log('Void', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            let cl = this.list.find(item => item.CoverLetterID === id)
            cl.StatusID = 5
            cl.Status = 'Void'
          }
          this.isLoading = false
        }).catch(err => {
          console.log('Void出错', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    unvoidCoverLetter: function (id) {
      this.$confirm('Are you sure to unvoid it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/NewBusinessService.asmx/UnvoidCoverLetter', {coverletterid: id}).then(res => {
          if (res) {
            console.log('Unvoid', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            let cl = this.list.find(item => item.CoverLetterID === id)
            cl.StatusID = Number(res.data)
            if (cl.StatusID === 0) cl.Status = 'Draft'
            else cl.Status = 'Finished'
          }
          this.isLoading = false
        }).catch(err => {
          console.log('Void出错', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },

    // 选择EffectiveDate
    changeEffectiveDate: function (date) {
      // 获取变量值，用于之后回答时routing比对
      this.EffectiveDate = moment(date).format('YYYY-MM-DD')
    },
    // 修改弹窗
    showEdit: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetter', {coverletterid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.coverLetterFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.coverLetterForm = res.data
            this.coverLetterForm.EffectiveDate = moment(res.data.EffectiveDate)
            this.coverLetterForm.RequestDate = moment(res.data.RequestDate)
            this.coverLetterForm.Templates = res.data.coverLetterTemplates.map(item => { return item.TemplateID })
            this.changeTemplates(this.coverLetterForm.Templates, 'Answer')
            this.initTemplates()
            this.initInsuranceCompany()
            this.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
            this.AutoBindingAuthority = res.data.corpbroker.corp.AutoBindingAuthority
            this.PropertyBindingAuthority = res.data.corpbroker.corp.PropertyBindingAuthority
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
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
            // this.printObj.popTitle = this.viewForm.Title // + '( ' + this.viewForm.Author + ')'
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
      /*
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
      */
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
    },
    // 添加coverLetter
    showAdd: function () {
      this.$router.push({path: '/newCoverLetter'})
    }
  }
}
</script>

<style scoped>

</style>
