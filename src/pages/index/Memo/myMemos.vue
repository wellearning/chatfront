<!--
FileName: Memo/myMemos.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show my personal line memo list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span id="mymemo" class="inPageNav">My Memos</span>
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
      <el-table height="560" :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="MemoID" width="100" fixed="left" sortable="custom"></el-table-column>
        <el-table-column label="Policy Change Type" prop="Title" min-width="250" sortable="custom"></el-table-column>
        <el-table-column label="EffectiveDate" prop="EffectiveDate" min-width="150" sortable="custom">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="RequDate" prop="RequestDate" min-width="150" sortable="custom">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.RequestDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="CorpName" prop="CorpName" min-width="150" sortable="custom"></el-table-column>
        <el-table-column label="PolicyNumber" prop="PolicyNumber" min-width="150" sortable="custom"></el-table-column>
        <el-table-column label="Named Insured(s)" prop="NameInsured" min-width="300" sortable="custom"></el-table-column>
        <el-table-column label="Action" width="340" fixed="right">
          <template slot-scope="scope">
            <el-button-group>
              <el-button icon="el-icon-view" type="primary" @click="showViewMemo(scope.row)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">View</el-button>
              <el-button icon="el-icon-view" v-if="scope.row.StatusID !== 0" type="primary" @click="showSheet(scope.row.MemoID)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Form</el-button>
              <el-button icon="el-icon-edit" type="primary" @click="showEditMemo(scope.row)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Edit</el-button>
              <el-button icon="el-icon-view" v-if="scope.row.NeedPinkSlip" type="primary" @click="showPinkSlip(scope.row.MemoID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Pink Slip</el-button>
              <el-button icon="el-icon-view" v-if="scope.row.NeedCOI" type="primary" @click="showCOI(scope.row.MemoID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">COI</el-button>
              <!--<el-button icon="el-icon-delete" type="danger" @click="del(scope.row.MemoID)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Delete</el-button>-->
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="editMemoWindowVisible" width="1184.56px" center :before-close="closeEdit">
        <EditMemo ref="eacl" :memoid="currentMemoID" :templateList="templateList" :insuranceCorps="insuranceCompanyList" @close="closeEditMemo"></EditMemo>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------查阅弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewFormVisible" width="1184.56px" center :before-close="closeViewMemo">
        <ViewMemo ref="vm" :memoid="currentMemoID" :insuranceCorps="insuranceCompanyList"></ViewMemo>
      </el-dialog>
      <!----------------------------------------------查阅弹窗结束----------------------------------------------------->
      <!----------------------------------------------Pink Slip 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="pinkSlipFormVisible" width="1184.56px"  height="2184.56px" center >
        <PinkSlip ref="ps" :memoid="currentMemoID" :insuranceCorps="insuranceCompanyList"></PinkSlip>
      </el-dialog>
      <!----------------------------------------------Pink Slip弹窗结束----------------------------------------------------->
      <!----------------------------------------------COI 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="coiFormVisible" width="1184.56px"  height="2184.56px" center >
        <COI ref="co" :memoid="currentMemoID" :insuranceCorps="insuranceCompanyList"></COI>
      </el-dialog>
      <!----------------------------------------------Pink Slip弹窗结束----------------------------------------------------->
      <!----------------------------------------------Sheet 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="sheetFormVisible" width="1184.56px"  height="2184.56px" center >
        <ViewSheet ref="vs" :businessObjId="currentMemoID" :businessTypeId="1"></ViewSheet>
      </el-dialog>
      <!----------------------------------------------COI 弹窗结束----------------------------------------------------->

    </div>
  </div>
</template>

<script>
import moment from 'moment'
import PinkSlip from '@/component/window/pinkSlip'
import COI from '@/component/window/coi'
import ViewMemo from '@/component/window/viewMemo'
import EditMemo from '@/component/parts/editMemo'
import ViewSheet from '@/component/window/sheet'

export default {
  components: {
    PinkSlip,
    COI,
    EditMemo,
    ViewSheet,
    ViewMemo
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
      sheetFormVisible: false,
      currentMemoID: null,
      currentMemo: null,
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
      templateList: [],
      insuranceCompanyList: [],
      currentTemplates: [],
      coiFormVisible: false,
      memoFormVisible: false,
      memoForm: {
        MemoID: null,
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        ClientCode: null,
        StatusID: 0,
        RequestDate: moment(new Date()),
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        Templates: null
      },
      memoFormRules: {
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
      editMemoWindowVisible: false,
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
        memoTemplates: [{
          memoBlocks: [{
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
    if (this.$store.state.MemoID !== undefined && this.$store.state.MemoID !== '') {
      // this.view(this.$store.state.MemoID)
      this.$store.state.MemoID = ''
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
    setCurrent: function (memo) {
      this.currentMemo = memo
      this.currentMemoID = memo.MemoID
    },
    showMemo: function (id) {
      this.viewFormVisible = true
      if (this.$refs.vm !== undefined) {
        this.$refs.vm.loadMemo(id)
      }
    },
    showViewMemo: function (memo) {
      this.setCurrent(memo)
      this.showMemo(memo.MemoID)
    },
    closeViewMemo: function (done) {
      this.viewFormVisible = false
      if (this.$refs.ps !== undefined) {
        this.$refs.ps.close(done)
      }
    },
    showEditMemo: function (memo) {
      let id = memo.MemoID
      this.setCurrent(memo)
      this.editMemoWindowVisible = true
      if (this.$refs.eacl !== undefined) {
        this.$refs.eacl.loadMemo(id)
      }
    },
    closeEditMemo: function (id, type) {
      this.editMemoWindowVisible = false
      if (type === 'saveAndPrint') {
        this.showMemo(id)
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
      this.axios.post('/api/Services/MemoService.asmx/GetMyMemoes', {query: name}).then(res => {
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
        this.axios.post('/api/Services/MemoService.asmx/RemoveMemo', {memoid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.MemoID !== id)
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
      this.axios.post('/api/Services/MemoService.asmx/SearchTemplates', {query: ''}).then(res => {
        if (res) {
          console.log('Templates列表', res)
          this.templateList = res.data
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
      this.axios.post('/api/Services/baseservice.asmx/GetBrokageInsuranceCorps', {}).then(res => {
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
    // 选择EffectiveDate
    changeEffectiveDate: function (date) {
      // 获取变量值，用于之后回答时routing比对
      this.EffectiveDate = moment(date).format('YYYY-MM-DD')
    },
    // 显示PinkSlip
    showPinkSlip: function (memoid) {
      this.currentMemoID = memoid
      this.pinkSlipFormVisible = true
      if (this.$refs.ps !== undefined) {
        this.$refs.ps.loadMemo(memoid)
      }
    },
    showSheet: function (memoid) {
      this.currentMemoID = memoid
      this.sheetFormVisible = true
      if (this.$refs.vs !== undefined) {
        this.$refs.vs.loadBusinessObj(memoid)
      }
    },
    showCOI: function (memoid) {
      this.currentMemoID = memoid
      this.coiFormVisible = true
      if (this.$refs.co !== undefined) {
        this.$refs.co.loadMemo(memoid)
      }
    },
    // 转pdf
    pdf: function (title, EffectiveDate) {
      this.htmlTitle = title + ' ' + EffectiveDate
      this.getPdf('#pdfDom')
      this.axios.post('/api/Services/MemoService.asmx/CreatePrintRecord', {memoid: this.viewForm.MemoID, typeid: 1}).then(res => {
        if (res) {
          console.log('create printRecord', res)
        }
      }).catch(err => {
        console.log('导出Memo PDF出错', err)
      })
    },
    // 添加memo
    showAdd: function () {
      this.$router.push({path: '/newMemo'})
    }
  }
}
</script>

<style scoped>

</style>
