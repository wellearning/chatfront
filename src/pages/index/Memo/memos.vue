<!--
FileName: Memo/memos.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all personal line memo list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">All Memos</span>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small" clearable @keyup.enter.native="search()"></el-input>
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
        <el-table-column label="ID" prop="MemoID" width="80" fixed="left" sortable="custom"></el-table-column>
        <el-table-column label="Policy Change Type" prop="Title" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="EffeDate" prop="EffectiveDate" min-width="120" sortable="custom">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="RequDate" prop="RequestDate" min-width="150" sortable="custom">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.RequestDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="User" prop="Author" min-width="150" sortable="custom"></el-table-column>
        <el-table-column label="Corp" prop="CorpName" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="PolicyNumber" prop="PolicyNumber" min-width="160" sortable="custom"></el-table-column>
        <el-table-column label="Named Insured(s)" prop="NameInsured" min-width="250" sortable="custom"></el-table-column>
        <el-table-column label="Status" prop="StatusName" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="UWScore" prop="Score" min-width="100"></el-table-column>
        <el-table-column label="Q-Score" prop="QualityScore" min-width="100"></el-table-column>
        <!--el-table-column label="Print" prop="PrintTimes" min-width="100"></el-table-column-->
        <el-table-column label="PrintPS" prop="PrintPSTimes" min-width="100"></el-table-column>
        <el-table-column label="Action" width="420" fixed="right">
          <template slot-scope="scope">
            <el-button-group>
              <el-button icon="el-icon-view" type="primary" @click="showViewMemo(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">View</el-button>
              <el-button icon="el-icon-edit" v-if="RoleName === 'Developer'" type="primary" @click="showEditMemo(scope.row)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Edit</el-button>
              <el-button icon="el-icon-view" v-if="scope.row.NeedPinkSlip" type="primary" @click="showPinkSlip(scope.row.MemoID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Pink Slip</el-button>
              <el-button icon="el-icon-view" v-if="scope.row.NeedCOI" type="primary" @click="showCOI(scope.row.MemoID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">COI</el-button>
              <el-button icon="el-icon-view" v-if="scope.row.Status !== 0" type="primary" @click="showSheet(scope.row.MemoID, 0)" :loading="isLoading || isLoadingInsuranceCompany" size="small">FORM</el-button>
              <el-button icon="el-icon-view" v-if="scope.row.Status !== 0" type="primary" @click="showSheet(scope.row.MemoID, 1)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Notes</el-button>
              <el-button icon="el-icon-edit" v-if="processingRight && scope.row.Status === 1 " type="primary" @click="showUnderWriter(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">U/W</el-button>
              <el-button icon="el-icon-edit" v-if="processingRight && scope.row.Status === 2 " type="success" @click="showUnderWriter(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">U/W</el-button>
              <el-button icon="el-icon-delete" v-if="processingRight && scope.row.Status !== 2 " type="danger" @click="del(scope.row.MemoID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Del</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList" @current-change="handleCurrentChange">
      </el-pagination>
      <!----------------------------------------------Processing弹窗开始----------------------------------------------------->
      <el-dialog :title="ProcessingTitle" :visible.sync="processingVisible" width="1184.56px" center :before-close="beforeCloseProcessing" :after-close="closeProcessing">
        <EditMemoProcessing ref="enbp" :memo="currentMemo" :processingtypeid="ProcessingTypeID" @close="closeProcessing"></EditMemoProcessing>
      </el-dialog>
      <!----------------------------------------------Processing弹窗结束----------------------------------------------------->
      <!----------------------------------------------查阅弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewFormVisible" width="1184.56px" center :before-close="closeView">
        <ViewMemo ref="vm" :memoid="currentMemoID" :insuranceCorps="insuranceCompanyList"></ViewMemo>
      </el-dialog>
      <!----------------------------------------------查阅弹窗结束----------------------------------------------------->
      <!----------------------------------------------Pink Slip 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="pinkSlipFormVisible" width="1184.56px"  height="2184.56px" center >
        <PinkSlip ref="ps" :memoid="currentMemoID" :insuranceCorps="insuranceCompanyList"></PinkSlip>
      </el-dialog>

      <!-- <el-dialog title="" :visible.sync="pinkSlipFormVisible" width="1184.56px"  height="2184.56px" center :before-close="closeView">
        <div class="printDiv" >
          <el-button icon="el-icon-document" type="primary" @click="pdfPinkSlip(pinkSlipForm.InsuredName, pinkSlipForm.EffectiveDate)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Print</el-button>
        </div>
        <div class="viewPinkSlip" id="pinkSlipDom">
          <el-row :gutter="20" style="margin-bottom:30px">
            <el-col :span="12">
              <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.InsuranceCorpName}}</i></div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-bottom:35px">
            <el-col :span="12">
              <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.InsuredName}}</i></div>
              <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.InsuredAddress}}</i></div>
              <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.InsuredCity}}</i></div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-bottom:60px">
            <el-col :span="4">
              <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.EffectiveDate}}</i></div>
            </el-col>
            <el-col :span="4">
              <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.ExpiryDate}}</i></div>
            </el-col>
            <el-col :span="4">
              <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.PolicyNumber}}</i></div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-bottom:60px">
            <el-col :span="8">
              <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.VehicleInfo}}</i></div>
            </el-col>
            <el-col :span="4">
            </el-col>
          </el-row>
        </div>
      </el-dialog> -->
      <!----------------------------------------------Pink Slip弹窗结束----------------------------------------------------->
      <!----------------------------------------------COI 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="coiFormVisible" width="1184.56px"  height="2184.56px" center >
        <COI ref="co" :memoid="currentMemoID" :insuranceCorps="insuranceCompanyList"></COI>
      </el-dialog>
      <!----------------------------------------------COI 弹窗结束----------------------------------------------------->
      <!----------------------------------------------Sheet 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="sheetFormVisible" width="1184.56px"  height="2184.56px" center >
        <ViewSheet ref="vs" :businessObjId="currentMemoID" :businessTypeId="1" :sheetTypeId="sheetTypeId"></ViewSheet>
      </el-dialog>
      <!----------------------------------------------COI 弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog z-index="5" title="" :visible.sync="editMemoWindowVisible" width="1184.56px" center >
        <EditMemo ref="eacl" :memoid="currentMemoID" :templateList="templateList" :insuranceCorps="insuranceCompanyList" @close="closeEditMemo"></EditMemo>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import PinkSlip from '@/component/window/pinkSlip'
import COI from '@/component/window/coi'
import EditMemoProcessing from '@/component/parts/editMemoProcessing'
import ViewSheet from '@/component/window/sheet'
import ViewMemo from '@/component/window/viewMemo'
import EditMemo from '@/component/parts/editMemo'

export default {
  components: {
    EditMemoProcessing,
    PinkSlip,
    COI,
    EditMemo,
    ViewSheet,
    ViewMemo
  },
  data: function () {
    return {
      RoleName: JSON.parse(this.$store.getters.getAccount).RoleName,
      processingRight: false,
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      Author: JSON.parse(this.$store.getters.getAccount).Name,
      printObj: {
        id: 'pdfDom',
        popTitle: ''
      },
      htmlTitle: 'null', // pdf文件名
      isLoading: false,
      // isLoadingStaffs: false,
      isLoadingTemplates: false,
      isLoadingInsuranceCompany: false,
      templateList: [],
      // staffsList: [],
      insuranceCompanyList: [],
      memoStatusList: [],
      sheetTypeId: 0,
      // 搜索
      searchForm: {
        name: ''
      },
      searchName: null,
      // 列表
      tempList: [],
      list: [],
      currentMemo: null,
      currentMemoID: 0,
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      isAll: false,
      // 查阅
      viewFormVisible: false,
      viewForm: {
        Title: null,
        EffectiveDate: null,
        InsuranceCorp: null,
        PolicyNumber: null,
        Author: null,
        // StatusID: 0,
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
      },
      pinkSlipFormVisible: false,
      coiFormVisible: false,
      sheetFormVisible: false,
      pinkSlipForm: {
        InsuranceCorpName: null,
        InsuranceCorpAddress: null,
        InsuredName: null,
        InsuredAddress: 'Not provide',
        InsuredCity: 'Not provide',
        VehicleInfo: 'Not provide',
        EffectiveDate: null,
        ExpiryDate: null,
        PolicyNumber: null,
        Broker: ''
      },
      // processing
      ProcessingTypeID: null,
      ProcessingTitle: '',
      editMemoWindowVisible: false,
      processingVisible: false
    }
  },
  mounted: function () {
    this.setProcessingRight()
    this.loadMemoStatus()
    this.initInsuranceCompany()
    this.search(null, 0)
  },
  methods: {
    setProcessingRight: function () {
      let typeid = JSON.parse(this.$store.getters.getAccount).institution.MemoProcessingType
      if (this.RoleName.indexOf('Branch') < 0) this.processingRight = true
      else {
        if (typeid === 2) this.processingRight = true
      }
    },
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
    /**
     * @return {boolean}
     */
    IsDate (dateval) {
      if (dateval.length > 20 && isNaN(dateval) && !isNaN(Date.parse(dateval))) return true
      else return false
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
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
      this.search(this.searchForm.name, 0)
    },
    // Templates
    initTemplates: function () {
      this.isLoadingTemplates = true
      this.axios.post('/api/Services/MemoService.asmx/SearchTemplates', {query: ''}).then(res => {
        if (res) {
          console.log('Templates', res)
          this.templateList = res.data
        }
        this.isLoadingTemplates = false
      }).catch(err => {
        console.log('Templates error', err)
        this.isLoadingTemplates = false
      })
    },
    loadMemoStatus: function () {
      this.isLoadingIMemoStatus = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'MemoStatus'}).then(res => {
        if (res) {
          console.log('loadMemoStatus', res)
          this.memoStatusList = res.data
        }
        this.isLoadingIMemoStatus = false
      }).catch(err => {
        console.log('loadMemoStatus error', err)
        this.isLoadingIMemoStatus = false
      })
    },

    // 保险公司列表
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetBrokageInsuranceCorps', {}).then(res => {
        if (res) {
          console.log('initInsuranceCompany', res)
          this.insuranceCompanyList = res.data.filter(c => c.BusinessLineID !== 2)
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('initInsuranceCompany error', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // 删除
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/memoservice.asmx/RemoveMemo', {memoid: id}).then(res => {
          if (res) {
            console.log('RemoveMemo', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.MemoID !== id)
            this.total = this.list.length
          }
          this.isLoading = false
        }).catch(err => {
          console.log('RemoveMemo error', err)
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
      if (name === undefined || name === null) name = this.searchForm.name
      if (start === undefined) start = 0
      this.isLoading = true
      if (start === 0) this.list = []
      this.axios.post('/api/Services/memoservice.asmx/SearchMemoes', {query: name, start: start}).then(res => {
        if (res) {
          console.log('SearchMemoes', res)
          if (res.data.length < this.pagerCount * this.pageSize) {
            this.isAll = true
          } else {
            this.isAll = false
          }
          res.data.forEach(r => {
            let status = this.memoStatusList.find(s => s.key === r.Status)
            if (status !== undefined) r.StatusName = status.value
            else r.StatusName = ''
          })
          this.list = this.list.concat(res.data)
          this.total = this.list.length
          this.pageCount = Math.ceil(this.total / this.pageSize)
          // this.list = res.data
          // this.total = this.list.length
          // this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('SearchMemoes error', err)
        this.isLoading = false
      })
    },
    handleCurrentChange: function (val) {
      console.log(`current page: ${val}`)
      if (val === this.pageCount && !this.isAll) {
        this.search(null, this.total)
      }
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search(null, 0)
    },
    // UW弹窗
    showUnderWriter: function (memo) {
      this.currentMemo = memo
      this.currentMemoID = memo.MemoID
      this.ProcessingTypeID = 1
      this.ProcessingTitle = 'Underwriting Processing'
      this.processingVisible = true
      if (this.$refs.enbp !== undefined) {
        this.$refs.enbp.loadProperties(1, memo.MemoID)
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
      // this.currentMemo = null
      this.ProcessingTypeID = 0
      this.processingVisible = false
      if (this.$refs.enbp !== undefined) {
        this.$refs.enbp.close()
      }
    },

    // show view window
    view: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetMemo', {memoid: id}).then(res => {
        if (res) {
          console.log('GetMemo', res)
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
        console.log('GetMemo error', err)
        this.isLoading = false
      })
    },
    // 关闭查阅
    closeView: function (done) {
      this.viewForm = {
        Title: null,
        EffectiveDate: null,
        InsuranceCorp: null,
        PolicyNumber: null,
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
        memoTemplates: [{
          memoBlocks: [{
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
      this.axios.post('/api/Services/memoservice.asmx/CreatePrintRecord', {memoid: this.viewForm.MemoID, typeid: 1}).then(res => {
        if (res) {
          console.log('create printRecord', res)
        }
      }).catch(err => {
        console.log('导出Memo PDF出错', err)
      })
    },
    // 显示PinkSlip
    showPinkSlip: function (memoid) {
      this.currentMemoID = memoid
      this.pinkSlipFormVisible = true
      if (this.$refs.ps !== undefined) {
        this.$refs.ps.loadMemo(memoid)
      }
    },
    showCOI: function (memoid) {
      this.currentMemoID = memoid
      this.coiFormVisible = true
      if (this.$refs.co !== undefined) {
        this.$refs.co.loadMemo(memoid)
      }
    },
    showSheet: function (memoid, sheetTypeId) {
      this.currentMemoID = memoid
      if (sheetTypeId !== undefined) this.sheetTypeId = sheetTypeId
      this.sheetFormVisible = true
      if (this.$refs.vs !== undefined) {
        this.$refs.vs.loadBusinessObj(memoid, sheetTypeId)
      }
    },
    // Pink Slip window
    pinkSlip: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetViewMemo', {memoid: id}).then(res => {
        if (res) {
          console.log('GetViewMemo', res)
          this.pinkSlipFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            let memo = res.data
            let insuranceCorp = this.insuranceCompanyList.find(item => item.InsuranceCorpID === memo.InsuranceCorpID)
            this.pinkSlipForm.InsuranceCorpName = insuranceCorp.Name
            this.pinkSlipForm.InsuranceCorpAddress = insuranceCorp.Address
            this.pinkSlipForm.EffectiveDate = moment(memo.EffectiveDate).format('DD/MM/YYYY')
            this.pinkSlipForm.ExpiryDate = moment(memo.EffectiveDate).add(30, 'days').format('DD/MM/YYYY')
            this.pinkSlipForm.PolicyNumber = memo.PolicyNumber
            this.pinkSlipForm.InsuredName = memo.NameInsured
            // this.pinkSlipForm.InsuredAddress = memo.AddressInsured
            this.pinkSlipForm.Broker = memo.branch.Name
            let vehicleYear = '2015'
            let vehicleModel = ''
            let vehicleMake = 'Toyota'
            let vin = ''
            let answer = memo.answers.find(a => a.QuestionDesc === 'Vehicle Year: ')
            if (answer !== undefined) vehicleYear = answer.AnswerDesc
            answer = memo.answers.find(a => a.QuestionDesc === 'Vehicle Make: ')
            if (answer !== undefined) vehicleMake = answer.AnswerDesc
            answer = memo.answers.find(a => a.QuestionDesc === 'Vehicle Model: ')
            if (answer !== undefined) vehicleModel = answer.AnswerDesc
            answer = memo.answers.find(a => a.QuestionDesc === 'VIN #: ')
            if (answer !== undefined) vin = answer.AnswerDesc
            this.pinkSlipForm.VehicleInfo = vehicleYear + ' ' + vehicleMake + ' ' + vehicleModel + ' ' + vin
            answer = memo.answers.find(a => a.QuestionDesc === 'Address Line 1:')
            if (answer !== undefined) this.pinkSlipForm.InsuredAddress = answer.AnswerDesc
            answer = memo.answers.find(a => a.QuestionDesc === 'Address Line 2:')
            if (answer !== undefined) this.pinkSlipForm.InsuredCity = answer.AnswerDesc
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('GetViewMemo error', err)
        this.isLoading = false
      })
    },
    // close Pink Slip
    closePinkSlip: function (done) {
      this.viewForm = {
        Title: null,
        EffectiveDate: null,
        InsuranceCorp: null,
        PolicyNumber: null,
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
        memoTemplates: [{
          memoBlocks: [{
            answers: []
          }]
        }],
        answerList: []
      }
      done()
    },
    // 关闭Pink Slip
    closeCOI: function (done) {
      this.viewForm = {
        Title: null,
        EffectiveDate: null,
        InsuranceCorp: null,
        PolicyNumber: null,
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
        memoTemplates: [{
          memoBlocks: [{
            answers: []
          }]
        }],
        answerList: []
      }
      done()
    },
    // 转pdf
    pdfPinkSlip: function (title, EffectiveDate) {
      this.htmlTitle = title + ' ' + EffectiveDate
      this.getPdf('#pinkSlipDom')
    }
  }
}
</script>

<style scoped>

</style>
