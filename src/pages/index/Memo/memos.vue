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
        <el-table-column label="MemoID" prop="MemoID" width="80" fixed="left"></el-table-column>
        <el-table-column label="Policy Change Type" prop="Title" min-width="320"></el-table-column>
        <el-table-column label="EffectiveDate" min-width="150">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="User" prop="Author" min-width="150"></el-table-column>
        <el-table-column label="Corp" prop="CorpName" min-width="100"></el-table-column>
        <el-table-column label="PolicyNumber" prop="PolicyNumber" min-width="160"></el-table-column>
        <el-table-column label="Named Insured(s)" prop="NameInsured" min-width="250"></el-table-column>
        <el-table-column label="UWScore" prop="Score" min-width="100"></el-table-column>
        <el-table-column label="Q-Score" prop="QualityScore" min-width="100"></el-table-column>
        <!--el-table-column label="Print" prop="PrintTimes" min-width="100"></el-table-column-->
        <el-table-column label="PrintPS" prop="PrintPSTimes" min-width="100"></el-table-column>
        <el-table-column label="RequestDate" min-width="150">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.RequestDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="480" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-view" type="primary" @click="showViewMemo(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">View</el-button>
            <el-button icon="el-icon-view" v-if="scope.row.NeedPinkSlip" type="primary" @click="showPinkSlip(scope.row.MemoID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Pink Slip</el-button>
            <el-button icon="el-icon-view" v-if="scope.row.NeedCOI" type="primary" @click="showCOI(scope.row.MemoID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">COI</el-button>
            <el-button icon="el-icon-view" v-if="scope.row.StatusID !== 0" type="primary" @click="showSheet(scope.row.MemoID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">FORM</el-button>
            <el-button icon="el-icon-edit" v-if="scope.row.StatusID === 1 " type="primary" @click="showUnderWriter(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">U/W</el-button>
            <el-button icon="el-icon-edit" v-if="scope.row.StatusID === 2 " type="success" @click="showUnderWriter(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">U/W</el-button>
            <el-button icon="el-icon-delete" v-if="scope.row.StatusID !== 2 " type="danger" @click="del(scope.row.MemoID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Del</el-button>
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
import EditMemoProcessing from '@/component/parts/editMemoProcessing'
import ViewSheet from '@/component/window/sheet'
import ViewMemo from '@/component/window/viewMemo'

export default {
  components: {
    EditMemoProcessing,
    PinkSlip,
    COI,
    ViewSheet,
    ViewMemo
  },
  data: function () {
    return {
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      Author: JSON.parse(this.$store.getters.getAccount).Name,
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
      processingVisible: false
    }
  },
  mounted: function () {
    this.search(null, 0)
    this.initInsuranceCompany()
  },
  methods: {
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
      this.axios.post('/api/Services/memoservice.asmx/SearchMemoes', {query: this.searchName, start: start}).then(res => {
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

    // 查阅弹窗
    view: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetMemo', {memoid: id}).then(res => {
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
    showSheet: function (memoid) {
      this.currentMemoID = memoid
      this.sheetFormVisible = true
      if (this.$refs.vs !== undefined) {
        this.$refs.vs.loadBusinessObj(memoid)
      }
    },
    // Pink Slip弹窗
    pinkSlip: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetViewMemo', {memoid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
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
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    // 关闭Pink Slip
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
