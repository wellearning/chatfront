<!--
FileName: clApplicationProcessing.vue
Author: Ge Chen
Update Date: 2024/1/8
Function: Show all commercial application list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Application Renewals</span>
    </div>
    <div class="inPageContent">
      <el-table height="600" :data="currentlist" empty-text="No Record" @expand-change="loadApplication" :loading="isLoading || isLoadingInsuranceCompany" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="ApplicationID" width="60" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column width="20" type="expand" :loading="isLoading" >
          <template slot-scope="props">
            <el-table :data="props.row.blocks" row-key="id" default-expand-all :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
              <el-table-column prop="BlockName" label="Block Name" min-width="300"/>
              <el-table-column prop="Status" label="Status" min-width="100"/>
              <el-table-column label="Sub-Action" width="380">
                <template slot-scope="scope">
                  <el-button v-if="scope.row.TypeID === 0" icon="el-icon-view" type="primary" @click="showViewApplicationBlock(scope.row)" :loading="isLoading" size="small">View</el-button>
                  <el-button v-if="scope.row.TypeID === 0" icon="el-icon-edit"  type="primary" @click="showEditBlock(scope.row)" :loading="isLoadingApplicationBlock" size="small">Edit</el-button>
                  <el-button v-if="scope.row.TypeID === 1" icon="el-icon-delete" type="danger" @click="removeSubApplicationTemplate(scope.row)" :loading="isLoading" size="small">Del</el-button>
                  <el-button v-if="scope.row.TypeID === 2" icon="el-icon-plus" type="primary" @click="addSubApplicationTemplate(scope.row)" :loading="isLoading" size="small">Add</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="ExpiryDate" prop="ExpiryDate" min-width="90" sortable="custom">
          <template v-slot="scope">
            <span>{{dateFormat(scope.row.ExpiryDate)}}</span>
          </template>
        </el-table-column>
        <!--el-table-column label="Title" prop="Title" min-width="200" sortable="custom"></el-table-column-->
        <el-table-column label="Applicant" prop="NameInsured" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Producer" prop="Producer" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Company" prop="CorpName" min-width="150" sortable="custom"></el-table-column>
        <el-table-column label="Premium" prop="Premium" min-width="80" sortable="custom"></el-table-column>
        <el-table-column label="EffecDate" prop="EffectiveDate" min-width="90" sortable="custom">
          <template v-slot="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" prop="Status" min-width="60" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="Action" width="360" >
          <template slot-scope="scope">
            <el-button-group>
              <el-button icon="el-icon-view" v-if="scope.row.StatusID === 6" type="info" plain @click="showViewApplication(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">View</el-button>
              <el-button icon="el-icon-edit" v-if="scope.row.StatusID !== 6" type="primary" @click="showEditApplication(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Edit</el-button>
              <el-button icon="el-icon-view" v-if="scope.row.StatusID !== 6"  type="primary" @click="showSheet(scope.row.ApplicationID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">FORM</el-button>
              <el-button icon="el-icon-view" v-if="scope.row.StatusID !== 6"  :type="processType(scope.row)" @click="showQuotation(scope.row)"  size="small">Process</el-button>
              <el-button icon="el-icon-delete" v-if="scope.row.StatusID !== 6" type="danger" @click="voidApplication(scope.row.ApplicationID)" :loading="isLoading" size="small">Void</el-button>
              <el-button icon="el-icon-unlock" v-if="scope.row.StatusID === 6" type="warning" @click="reinstateApplication(scope.row.ApplicationID)" :loading="isLoading" size="small">Reinstate</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList" @current-change="handleCurrentChange">
      </el-pagination>
      <!----------------------------------------------查阅弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewApplicationVisible" width="1184.56px" center :before-close="closeView">
        <ViewApplication ref="vm" :applicationid="currentApplicationID" :insuranceCorps="insuranceCorpList"></ViewApplication>
      </el-dialog>
      <!----------------------------------------------查阅弹窗结束----------------------------------------------------->
      <!----------------------------------------------查阅applicationBlock弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewApplicationBlockVisible" width="984.56px" center>
        <ViewApplicationBlock ref="vab" :applicationBlockId="currentApplicationBlockID" :blockName="currentBlockName"></ViewApplicationBlock>
      </el-dialog>
      <!----------------------------------------------查阅applicationBlock弹窗结束----------------------------------------------------->
      <!----------------------------------------------Sheet 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="sheetFormVisible" width="1184.56px"  height="2184.56px" center >
        <ViewSheet ref="vs" :businessObjId="currentApplicationID" :businessTypeId="4"></ViewSheet>
      </el-dialog>
      <!----------------------------------------------Sheet 弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="editApplicationWindowVisible" width="1550px" top="10px" center :before-close="closeEdit">
        <EditApplication ref="eacl" :applicationid="currentApplicationID" :templateList="templateList" @close="closeEditApplication"></EditApplication>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改ApplicationBlock弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="editApplicationBlockVisible" width="984.56px" center :before-close="closeEdit">
        <editApplicationBlock :applicationBlock="currentApplicationBlock" :applicationTemplate="currentApplicationTemplate"
                              @showNextBlock="showNextBlock"
                              @showSkipBlock="showSkipBlock"
                              @resetLeft="resetLeftChildren"
                              @skipLeft="skipLeftChildren"
                              @checkOver="checkOver"
        >
        </editApplicationBlock>
        <div class="newMemo-submit">
          <el-button icon="el-icon-check" type="primary" @click="saveApplicationBlock()" :loading="isLoading">Save</el-button>
        </div>
      </el-dialog>
      <!----------------------------------------------修改ApplicationBlock弹窗结束----------------------------------------------------->
      <!----------------------------------------------报价弹窗开始----------------------------------------------------->
      <el-dialog v-if="currentApplication !== null" title="Request Quote" :visible.sync="quotationVisible" width="900px" center>
        <el-form  class="newMemo">
          <el-row :gutter="20" class="subtitle">
            <el-col :span="18">
              <el-form-item label="Insurance Company" prop="InsuranceCorpID">
                <el-select v-model="multipleSelection" placeholder="Insurance Company" no-data-text="No Record" multiple filterable >
                  <el-option v-for="item in currentApplication.unselectedCorps" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <div class="newMemo-submit">
                <el-button icon="el-icon-check" type="primary" @click="saveQuotations()" :loading="isLoading">Request</el-button>
              </div>
            </el-col>
          </el-row>
        </el-form>

        <el-table
          :data="currentApplication.quotations"
          tooltip-effect="dark"
          style="width: 100%">
          <el-table-column
            prop="CorpName"
            label="Insurance Corporation"
            width="300">
          </el-table-column>
          <el-table-column
            prop="Premium"
            label="Premium"
            width="100">
          </el-table-column>
          <el-table-column label="Status" prop="StatusName" min-width="100"></el-table-column>
          <el-table-column label="Action" width="300">
            <template v-slot="scope">
              <el-button icon="el-icon-view" type="primary" @click="showQuotationBind(scope.row)" :loading="isLoadingInsuranceCompany" size="small">Bind</el-button>
              <el-button icon="el-icon-view" type="primary" @click="showQuotationProcessing(scope.row)" :loading="isLoadingInsuranceCompany" size="small">Action</el-button>
              <el-button icon="el-icon-delete" type="danger" @click="delQuotation(scope.row.InsuranceCorpQuotationID)" :loading="isLoadingInsuranceCompany" size="small">Del</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
      <!----------------------------------------------报价弹窗结束----------------------------------------------------->
      <!----------------------------------------------InsuranceCorp Bind 弹窗开始----------------------------------------------------->
      <el-dialog title="Insurance Corporation Quotation Binding" :visible.sync="quotationBindVisible" width="600px" center>
        <el-form :model="quotationBindForm" ref="quotationBindForm" class="newMemo" :rules="quotationBindFormRules">
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Effective Date" prop="EffectiveDate">
                <el-date-picker v-model="quotationBindForm.EffectiveDate" @change="effectiveDateChange" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Expiry Date" prop="ExpiryDate">
                <el-date-picker v-model="quotationBindForm.ExpiryDate" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="AppType" prop="TypeID">
                <el-select v-model="quotationBindForm.TypeID" placeholder="App Type" no-data-text="No Record" filterable >
                  <el-option v-for="item in appTypes" :key="item.ID" :label="item.Name" :value="item.ID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="quotationBindForm.TypeID === 2" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Remarket From" prop="LeadFromCorpID">
                <el-select v-model="quotationBindForm.LeadFromCorpID" placeholder="Lead From" no-data-text="No Record" filterable >
                  <el-option v-for="item in insuranceCorpList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Client Code" prop="ClientCode">
                <el-input v-model="quotationBindForm.ClientCode" placeholder="Client Code" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Policy Number" prop="PolicyNumber">
                <el-input v-model="quotationBindForm.PolicyNumber" placeholder="Policy Number" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Premium" prop="Premium">
                <el-input v-model="quotationBindForm.Premium" type="number" placeholder="Premium" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Renewal Questionnaire" prop="Questionnaire">
                <el-select v-model="quotationBindForm.Questionnaire" placeholder="Questionnaire" no-data-text="No Record" filterable >
                  <el-option v-for="item in questionnaires" :key="item.ID" :label="item.Name" :value="item.Name"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="newMemo-submit">
            <el-button icon="el-icon-check" type="primary" @click="quotationBind()" :loading="isLoading">Bind</el-button>
          </div>
        </el-form>
      </el-dialog>
      <!----------------------------------------------InsuranceCorp Bind弹窗结束----------------------------------------------------->
      <!----------------------------------------------InsuranceCorpQuotation Processing 弹窗开始----------------------------------------------------->
      <el-dialog title="Insurance Corporation Quotation Processing" :visible.sync="quotationProcessingVisible" width="600px" center>
        <el-form :model="quotationProcessingForm" ref="quotationBindForm" class="newMemo" :rules="quotationProcessingFormRules">
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Processing Type" prop="StatusID">
                <el-select v-model="quotationProcessingForm.StatusID" placeholder="Processing Type" no-data-text="No Record" filterable >
                  <el-option v-for="item in quotationProcessings" :key="item.StatusID" :label="item.Name" :value="item.StatusID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Premium" prop="Premium">
                <el-input v-model="quotationProcessingForm.Premium" type="number" placeholder="Premium" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Description" prop="Brief">
                <el-input v-model="quotationProcessingForm.Brief" type="textarea" :rows="3" placeholder="Description" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="newMemo-submit">
            <el-button icon="el-icon-check" type="primary" @click="quotationProcess" :loading="isLoading">Confirm</el-button>
          </div>
        </el-form>
      </el-dialog>
      <!----------------------------------------------InsuranceCorpQuotation Processing弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import ViewSheet from '@/component/window/sheet'
import ViewApplication from '@/component/window/viewApplication'
import ViewApplicationBlock from '@/component/window/viewApplicationBlock'
import editApplicationBlock from '@/component/parts/editApplicationBlock'
import EditApplication from '@/component/parts/editApplication'

export default {
  components: {
    editApplicationBlock,
    ViewSheet,
    EditApplication,
    ViewApplicationBlock,
    ViewApplication
  },
  data: function () {
    return {
      EffectiveDate: null,
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      Author: JSON.parse(this.$store.getters.getAccount).Name,
      printObj: {
        id: 'pdfDom',
        popTitle: ''
      },
      htmlTitle: 'null', // pdf文件名
      isLoading: false,
      isLoadingTemplateBlockQuestions: false,
      isLoadingApplicationBlock: false,
      isLoadingApplicationQuotations: false,
      // isLoadingStaffs: false,
      isLoadingInsuranceCompany: false,
      templateList: [],
      producerList: [],
      statusList: [],
      insuranceCorpList: [],
      questionnaires: [],
      appTypes: [{ID: 1, Name: 'New Business'}, {ID: 2, Name: 'Remarket'}, {ID: 3, Name: 'LOA'}, {ID: 4, Name: 'Rewrite'}],
      quotationProcessings: [
        {StatusID: 2, Name: 'Quote', Status: 'Quoted'},
        {StatusID: 3, Name: 'Decline', Status: 'Declined'}
      ],
      currentInsuranceCorpID: null,
      currentBlockItem: null,
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      // 列表
      tempList: [],
      totalList: [],
      list: [],
      currentlist: [],
      currentApplication: null,
      currentApplicationID: 0,
      currentApplicationTemplate: null,
      currentApplicationBlockID: 0,
      currentBlockName: null,
      currentApplicationBlock: null,
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      isAll: false,
      quotationVisible: false,
      quotationBindVisible: false,
      quotationProcessingVisible: false,
      quotationProcessingForm: {
        InsuranceCorpQuotationID: null,
        ApplicationID: 0,
        InsuranceCorpID: 0,
        StatusID: null,
        Brief: null,
        Premium: null
      },
      quotationProcessingFormRules: {
        StatusID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        Brief: [
          { required: false, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        Premium: [
          { required: false, message: 'Please Enter', trigger: 'blur' }
        ]
      },
      quotationBindForm: {
        InsuranceCorpQuotationID: null,
        EffectiveDate: null,
        TypeID: null,
        LeadFromCorpID: 0,
        ExpiryDate: null,
        ClientCode: null,
        PolicyNumber: null,
        Premium: null,
        Questionnaire: null
      },
      quotationBindFormRules: {
        PolicyNumber: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 50, message: 'Within 50 Characters', trigger: 'blur' }
        ],
        EffectiveDate: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        ExpiryDate: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        TypeID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        ClientCode: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        Premium: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ]
      },
      editApplicationWindowVisible: false,
      editApplicationBlockVisible: false,
      multipleSelection: [],
      // 查阅
      viewApplicationBlockVisible: false,
      viewApplicationVisible: false,
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
        DateOfBirth: null,
        applicationTemplates: [{
          applicationBlocks: [{
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
    // this.loadProducers()
    this.loadApplicationStatus()
    this.initInsuranceCompany()
    this.loadApplications(0)
  },
  methods: {
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
      this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    rank: function (name) {
      this.list.sort(this.by(name))
    },
    rankdesc: function (name) {
      this.list.sort(this.bydesc(name))
    },
    processType: function (app) {
      if (app.StatusID === 4) return 'success'
      else return 'primary'
    },
    showQuotationBind: function (quotation) {
      this.quotationBindForm.InsuranceCorpQuotationID = quotation.InsuranceCorpQuotationID
      let effdate = moment(this.currentApplication.EffectiveDate)
      if (effdate.year() > 2020) this.quotationBindForm.EffectiveDate = effdate
      else this.quotationBindForm.EffectiveDate = null
      let expdate = moment(this.currentApplication.ExpiryDate)
      if (expdate.year() > 2020) this.quotationBindForm.ExpiryDate = expdate
      else this.quotationBindForm.ExpiryDate = null
      this.quotationBindForm.ClientCode = this.currentApplication.ClientCode
      this.quotationBindForm.PolicyNumber = this.currentApplication.PolicyNumber
      if (this.currentApplication.TypeID > 0) this.quotationBindForm.TypeID = this.currentApplication.TypeID
      else this.quotationBindForm.TypeID = null
      this.quotationBindForm.LeadFromCorpID = this.currentApplication.LeadFromCorpID
      this.quotationBindForm.Premium = quotation.Premium
      this.quotationBindVisible = true
    },
    showQuotationProcessing: function (quotation) {
      console.log('quotation', quotation)
      this.quotationProcessingForm = quotation
      this.quotationProcessingForm.StatusID = null
      this.quotationProcessingVisible = true
      /*
      this.quotationBindForm.InsuranceCorpQuotationID = quotation.InsuranceCorpQuotationID
      this.quotationBindForm.ApplicationID = quotation.ApplicationID
      this.quotationBindForm.InsuranceCorpID = quotation.InsuranceCorpID
      this.quotationBindForm.Premium = quotation.Premium
      this.quotationProcessingForm.Brief = quotation.Brief
      */
    },
    quotationBind: function () {
      this.$confirm('Are you sure to bind it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        let id = this.quotationBindForm.InsuranceCorpQuotationID
        this.isLoadingApplicationQuotations = true
        let value = JSON.stringify(this.quotationBindForm)
        this.axios.post('/api/Services/CommerceService.asmx/BindQuotation', {id: id, jsonvalue: value}).then(res => {
          if (res) {
            console.log('bind', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.currentApplication.StatusID = res.data
            this.setApplicationStatus(this.currentApplication)
            this.currentApplication.EffectiveDate = this.quotationBindForm.EffectiveDate
            this.currentApplication.Premium = this.quotationBindForm.Premium
            let quotation = this.currentApplication.quotations.find(q => q.InsuranceCorpQuotationID === id)
            quotation.StatusID = 4
            quotation.StatusName = 'Bound'
            quotation.Premium = this.quotationBindForm.Premium
          }
          this.isLoadingApplicationQuotations = false
        }).catch(err => {
          console.log('删除出错', err)
          this.isLoadingApplicationQuotations = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    effectiveDateChange: function () {
      this.quotationBindForm.ExpiryDate = moment(this.quotationBindForm.EffectiveDate).add(1, 'year')
    },
    setApplicationStatus: function (app) {
      let astatus = this.applicationStatuses.find(s => s.StatusID === app.StatusID)
      app.Status = astatus.Name
    },
    quotationProcess: function () {
      this.$confirm('Are you sure to process it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        let id = this.quotationProcessingForm.InsuranceCorpQuotationID
        this.isLoadingApplicationQuotations = true
        let value = JSON.stringify(this.quotationProcessingForm)
        console.log('quotationProcessingForm', value)
        this.axios.post('/api/Services/CommerceService.asmx/QuotationProcess', {jsonvalue: value}).then(res => {
          if (res) {
            console.log('quotationProcess', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            let appStatusID = res.data
            let quotation = this.currentApplication.quotations.find(q => q.InsuranceCorpQuotationID === id)
            quotation.StatusID = this.quotationProcessingForm.StatusID
            let qstatus = this.quotationProcessings.find(s => s.StatusID === quotation.StatusID)
            quotation.StatusName = qstatus.Status
            this.currentApplication.StatusID = appStatusID
            this.setApplicationStatus(this.currentApplication)
          }
          this.isLoadingApplicationQuotations = false
        }).catch(err => {
          console.log('删除出错', err)
          this.isLoadingApplicationQuotations = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    resetQuotations: function (app) {
      app.unselectedCorps = this.insuranceCorpList.filter(c => app.quotations.find(q => q.InsuranceCorpID === c.InsuranceCorpID) === undefined)
      this.multipleSelection = []
    },
    showQuotation: function (application) {
      this.setCurrent(application)
      this.multipleSelection = []
      this.loadApplicationQuotation(application)
    },
    loadApplicationQuotation: function (app) {
      this.isLoadingApplicationQuotations = true
      this.axios.post('/api/Services/CommerceService.asmx/GetQuotations', {applicationid: app.ApplicationID}).then(res => {
        if (res) {
          console.log('GetQuotations', res.data)
          app.quotations = res.data
          app.unselectedCorps = this.insuranceCorpList.filter(c => app.quotations.find(q => q.InsuranceCorpID === c.InsuranceCorpID) === undefined)
          console.log('selectables', app.unselectedCorps)
          this.isLoadingApplicationQuotations = false
          this.quotationVisible = true
        }
      }).catch(err => {
        console.log('GetQuotations列表出错', err)
        this.isLoadingApplicationQuotations = false
      })
    },
    saveQuotations: function () {
      let ids = []
      this.multipleSelection.forEach(id => {
        ids.push(id)
      })
      if (ids.length === 0) return
      let corpids = JSON.stringify(ids)
      let appid = this.currentApplicationID
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/ApplyQuotations', {applicationid: appid, corpids: corpids}).then(res => {
        if (res) {
          console.log('修改', res)
          let app = this.currentApplication
          if (app.quotations === undefined) app.quotations = []
          app.quotations = app.quotations.concat(res.data)
          this.resetQuotations(app)
          if (app.StatusID === 1) {
            app.StatusID = 2
            this.setApplicationStatus(app)
          }
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
        }
        this.isLoading = false
        // this.quotationBindForm = null
      }).catch(err => {
        console.log('修改出错', err)
        this.$message({
          type: 'error',
          message: 'Operation failed'
        })
        this.isLoading = false
      })
    },
    // 删除
    delQuotation: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoadingApplicationQuotations = true
        this.axios.post('/api/Services/CommerceService.asmx/RemoveQuotation', {id: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.currentApplication.StatusID = res.data
            this.setApplicationStatus(this.currentApplication)
            this.currentApplication.quotations = this.currentApplication.quotations.filter(item => item.InsuranceCorpQuotationID !== id)
            this.resetQuotations(this.currentApplication)
          }
          this.isLoadingApplicationQuotations = false
        }).catch(err => {
          console.log('删除出错', err)
          this.isLoadingApplicationQuotations = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    saveApplicationBlock: function () {
      let blockitem = this.currentBlockItem
      let ablock = JSON.parse(JSON.stringify(this.currentApplicationBlock))
      ablock.answers.forEach(answer => {
        answer.blockQuestion = null
        answer.QuestionDesc = ''
        if (answer.TypeID === 6) answer.optionAnswers = null
        else if (answer.TypeID === 7) {
          answer.optionAnswers = answer.optionAnswers.filter(oa => { return oa.IsChecked })
        }
      })
      let value = JSON.stringify(ablock)
      console.log('SaveApplicationBlock', ablock)
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/SaveApplicationBlock', {applicationblock: value}).then(res => {
        if (res) {
          console.log('修改', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          let appBlock = res.data
          blockitem.applicationBlock = res.data
          blockitem.Status = appBlock.StatusID === 0 ? 'Not Answer' : (appBlock.StatusID === 1 ? 'Answered' : (appBlock.StatusID === 2 ? 'Skipped' : 'Answering'))
        }
        this.isLoading = false
      }).catch(err => {
        console.log('修改出错', err)
        this.$message({
          type: 'error',
          message: 'Operation failed'
        })
        this.isLoading = false
      })
    },
    closeEditApplication: function (id, type) {
      this.editApplicationWindowVisible = false
      if (type === 'saveAndPrint') {
        this.showApplication(id)
      }
      this.search(this.searchForm.name, 0)
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
    showNextBlock: function () {},
    showSkipBlock: function () {},
    resetLeftChildren: function () {},
    skipLeftChildren: function () {},
    checkOver: function () {},
    /**
     * @return {boolean}
     */
    IsDate (dateval) {
      return dateval.length > 20 && isNaN(dateval) && !isNaN(Date.parse(dateval))
      // if (dateval.length > 20 && isNaN(dateval) && !isNaN(Date.parse(dateval))) return true
      // else return false
    },
    // 日期格式
    dateFormat (date) {
      let result = moment(date)
      if (result.year() > 2020) return result.format('YYYY-MM-DD')
      else return ''
      // return moment(date).format('YYYY-MM-DD')
    },
    setCurrent: function (application) {
      this.currentApplication = application
      this.currentApplicationID = application.ApplicationID
    },
    showViewApplicationBlock: function (blockItem) {
      let id = blockItem.applicationBlock.ApplicationBlockID
      this.currentApplicationBlockID = id
      this.currentBlockName = blockItem.BlockName
      this.viewApplicationBlockVisible = true
      if (this.$refs.vab !== undefined) {
        this.$refs.vab.loadApplicationBlock(id, blockItem.BlockName)
      }
    },
    showApplication: function (id) {
      this.viewApplicationVisible = true
      if (this.$refs.vm !== undefined) {
        this.$refs.vm.loadApplication(id)
      }
    },
    showViewApplication: function (application) {
      if (application !== undefined) this.setCurrent(application)
      this.showApplication(this.currentApplication.ApplicationID)
    },
    showEditApplication: function (application) {
      let id = application.ApplicationID
      this.currentApplicationID = id
      this.editApplicationWindowVisible = true
      if (this.$refs.eacl !== undefined) {
        this.$refs.eacl.loadApplication(id)
      }
    },
    showEditBlock: function (blockItem) {
      this.currentBlockItem = blockItem
      let aTemplate = blockItem.applicationTemplate
      let aBlock = blockItem.applicationBlock
      this.loadApplicationBlock(aTemplate, aBlock)
    },
    loadApplication: function (app) {
      if (app.applicationTemplate !== null) return
      let id = app.ApplicationID
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationFrame', {applicationid: id}).then(res => {
        if (res) {
          app.applicationTemplate = res.data.applicationTemplate
          // build application tree
          app.blocks = []
          let id = 0
          app.applicationTemplate.templateBlocks.forEach(tb => {
            if (tb.ChildTypeID === 0) {
              let appBlock = app.applicationTemplate.applicationBlocks.find(ab => ab.TemplateBlockID === tb.TemplateBlockID)
              tb.applicationBlock = appBlock
              tb.applicationBlock.topTemplateBlockID = tb.applicationBlock.TemplateBlockID
              // appBlock.BlockName = tb.BlockName
              // appBlock.id = id++
              // appBlock.TypeID = 0
              let blockItem = {
                id: id++,
                TypeID: 0,
                BlockID: tb.BlockID,
                BlockName: tb.BlockName,
                Status: appBlock.StatusID === 0 ? 'Not Answer' : (appBlock.StatusID === 1 ? 'Answered' : (appBlock.StatusID === 2 ? 'Skipped' : 'Answering')),
                applicationBlock: appBlock,
                applicationTemplate: app.applicationTemplate
              }
              app.blocks.push(blockItem)
              return
            }
            // tb.applicationBlocks = []
            let appb = {
              id: id++,
              BlockID: tb.BlockID,
              BlockName: tb.BlockName,
              TypeID: 2,
              ApplicationID: app.ApplicationID,
              applicationTemplate: app.applicationTemplate,
              templateBlock: tb,
              children: []
            }
            app.blocks.push(appb)
            tb.applicationTemplates = []
            app.applicationTemplate.applicationBlocks.forEach(ab => {
              let templateBlock = tb.subTemplateBlocks.find(subtb => subtb.TemplateBlockID === ab.TemplateBlockID)
              if (templateBlock === undefined) return
              // tb.applicationBlocks.push(ab)
              let subatemplate = tb.applicationTemplates.find(at => at.RepeatedID === ab.RepeatedID)
              if (subatemplate === undefined) {
                subatemplate = {
                  BlockName: tb.BlockName,
                  RepeatedID: ab.RepeatedID,
                  applicationBlocks: []
                }
                tb.applicationTemplates.push(subatemplate)
              }
              subatemplate.applicationBlocks.push(ab)
              ab.topTemplateBlockID = tb.TemplateBlockID
              ab.BlockName = templateBlock.BlockName
            })
            tb.applicationTemplates.forEach(at => {
              let childat = {
                id: id++,
                ApplicationID: app.ApplicationID,
                BlockID: appb.BlockID,
                RepeatedID: at.RepeatedID,
                Parent: appb,
                BlockName: at.BlockName + ':' + at.RepeatedID,
                TypeID: 1,
                applicationTemplate: app.applicationTemplate,
                children: []
              }
              appb.children.push(childat)
              at.applicationBlocks.forEach(ab => {
                let childab = {
                  id: id++,
                  TypeID: 0,
                  BlockID: ab.BlockID,
                  BlockName: ab.BlockName + ':' + at.RepeatedID,
                  Status: ab.StatusID === 0 ? 'Not Answer' : (ab.StatusID === 1 ? 'Answered' : (ab.StatusID === 2 ? 'Skipped' : 'Answering')),
                  applicationBlock: ab,
                  applicationTemplate: app.applicationTemplate
                }
                childat.children.push(childab)
              })
            })
          })
          this.loadTemplateBlockQuestions(app.applicationTemplate)
          console.log('ApplicationFrame', app)
        }
        this.isLoading = false
      }).catch(err => {
        console.log('ApplicationFrame', err)
        this.isLoading = false
      })
    },
    loadApplicationBlock: function (aTemplate, aBlock) {
      this.isLoadingApplicationBlock = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationBlock', {id: aBlock.ApplicationBlockID}).then(res => {
        if (res) {
          console.log('GetApplicationBlock', res.data)
          aBlock.answers = res.data.answers
          this.matchBlockQuestions(aTemplate, aBlock)
          this.isLoadingApplicationBlock = false
          if (aBlock.answers[0].StatusID !== 1) {
            aBlock.answers[0].StatusID = 1
            aBlock.StatusID = 1
          }
          this.currentApplicationBlock = aBlock
          this.currentApplicationTemplate = aTemplate
          this.editApplicationBlockVisible = true
        }
      }).catch(err => {
        console.log('GetApplicationBlock列表出错', err)
        this.isLoadingApplicationBlock = false
      })
    },
    loadTemplateBlockQuestions: function (atemplate) {
      console.log('loadTemplateBlockQuestions start from', atemplate)
      this.isLoadingTemplateBlockQuestions = true
      this.axios.post('/api/Services/BaseService.asmx/GetBlockQuestionsByTemplate_all', {templateid: atemplate.TemplateID}).then(res => {
        if (res) {
          console.log('GetBlockQuestionsByTemplate_all', res)
          atemplate.blockQuestions = res.data
          // console.log('isLoadingTemplateBlockQuestions:', this.isLoadingTemplateBlockQuestions)
        }
        this.isLoadingTemplateBlockQuestions = false
      }).catch(err => {
        console.log('GetBlockQuestionsByTemplate出错', err)
        this.isLoadingTemplateBlockQuestions = false
      })
    },
    matchBlockQuestions: function (aTemplate, aBlock) {
      console.log('applicationTemplate', aTemplate)
      aBlock.answers.forEach(a => {
        if (a.IsRoute) {
          // console.log('answer.QuestionID:', a.QuestionID)
          a.blockQuestion = aTemplate.blockQuestions.find(bq => bq.BlockQuestionID === a.BlockQuestionID)
          if (a.blockQuestion === null) {
            console.log('The unmatched answer:', a)
          }
          if (a.QuestionID === 824) {
            // console.log('answer:', a)
          }
        }
      })
    },
    addSubApplicationTemplate: function (blockItem) {
      this.$confirm('Are you sure to add new?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        let id = blockItem.ApplicationID
        this.isLoading = true
        this.axios.post('/api/Services/CommerceService.asmx/AddSubApplicationTemplate', {applicationid: id, templateid: blockItem.BlockID}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            let id = blockItem.children.length * 100
            let atBlockItem = {
              id: id++,
              BlockID: blockItem.BlockID,
              BlockName: blockItem.BlockName + ':',
              TypeID: 1,
              children: []
            }
            blockItem.children.push(atBlockItem)
            let repeatedid = 0
            res.data.forEach(ab => {
              repeatedid = ab.RepeatedID
              // let templateblock = blockItem.applicationTemplate.templateBlocks.find(tb => tb.BlockID === ab.BlockID)
              let templateblock = blockItem.templateBlock.subTemplateBlocks.find(subtb => subtb.BlockID === ab.BlockID)
              let blockname = ''
              if (templateblock !== undefined) blockname = templateblock.BlockName
              let child = {
                id: id++,
                ApplicationBlockID: ab.ApplicationBlockID,
                applicationBlock: ab,
                applicationTemplate: blockItem.applicationTemplate,
                RepeatedID: repeatedid,
                BlockID: ab.BlockID,
                BlockName: blockname + ':' + ab.RepeatedID,
                TypeID: 0
              }
              atBlockItem.children.push(child)
            })
            atBlockItem.BlockName += repeatedid
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
    removeSubApplicationTemplate: function (blockItem) {
      this.$confirm('Are you sure to remove it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        let id = blockItem.ApplicationID
        this.isLoading = true
        this.axios.post('/api/Services/CommerceService.asmx/RemoveSubApplicationTemplate', {applicationid: id, templateid: blockItem.BlockID, repeatedid: blockItem.RepeatedID}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            let parent = blockItem.Parent
            let index = blockItem.RepeatedID
            parent.children.splice(index, 1)
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
          this.templateList = res.data
        }
        this.isLoadingTemplates = false
      }).catch(err => {
        console.log('Templates列表出错', err)
        this.isLoadingTemplates = false
      })
    },
    // 保险公司列表
    loadQuestionnaires: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/commerialservice.asmx/GetQuestionnaires', {}).then(res => {
        if (res) {
          console.log('Questionnaires', res)
          let nocorp = [{ID: 0, Name: 'No Need'}]
          this.questionnaires = nocorp.concat(res.data)
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // 保险公司列表
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps', {}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          let nocorp = [{InsuranceCorpID: 0, Name: 'No Company'}]
          this.insuranceCorpList = nocorp.concat(res.data.filter(c => c.BusinessLineID !== 1))
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // 删除
    voidApplication: function (id) {
      this.$confirm('Are you sure to void it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/CommerceService.asmx/VoidApplication', {applicationid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            console.log('void', this.list)
            let app = this.list.find(item => item.ApplicationID === id)
            app.StatusID = res.data
            this.setApplicationStatus(app)
            // this.list.splice(index, 1)
            // this.list = this.list.filter(item => item.ApplicationID !== id)

            this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
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
    reinstateApplication: function (id) {
      this.$confirm('Are you sure to reinstate it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/CommerceService.asmx/UnvoidApplication', {applicationid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            console.log('Unvoid', this.list)
            let app = this.list.find(item => item.ApplicationID === id)
            app.StatusID = res.data
            this.setApplicationStatus(app)

            // this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            // this.total = this.list.length
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
    loadProducers: function (start) {
      this.isLoadingInsuranceCompany = true
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
            this.isLoadingInsuranceCompany = false
          }
        }
      }).catch(err => {
        console.log('producerList', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    loadApplications: function (start) {
      this.isLoading = true
      if (start === 0) this.totalList = []
      this.axios.post('/api/Services/CommerceService.asmx/GetRenewals', {start: start}).then(res => {
        if (res) {
          console.log('Application查询', res)
          if (start === 0) {
            this.total = res.count
            this.totalList = res.data
          } else {
            this.totalList = this.totalList.concat(res.data)
          }
          if (this.totalList.length === this.total) {
            this.totalList.forEach(a => {
              a.EffectiveDate = moment(a.EffectiveDate)
              a.ExpiryDate = moment(a.ExpiryDate)
              a.RequestDate = moment(a.RequestDate)
              a.DateOfBirth = moment(a.DateOfBirth)
              let status = this.statusList.find(s => s.key === a.StatusID)
              if (status !== undefined) a.Status = status.value
              else a.Status = ''
              // let producer = this.producerList.find(p => p.StaffID === a.ProducerID)
              // if (producer !== undefined) a.Producer = producer.Name
              // else a.Producer = ''
              let corp = this.insuranceCorpList.find(p => p.InsuranceCorpID === a.InsuranceCorpID)
              if (corp !== undefined) a.CorpName = corp.Name
              else a.CorpName = ''
            })
            this.list = this.totalList
            this.pageCount = Math.ceil(this.total / this.pageSize)
            this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            this.isLoading = false
          } else this.loadApplications(this.totalList.length)
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },

    // 查询
    search: function () {
      let query = this.searchForm.name
      if (query === '') {
        this.list = this.totalList
      } else {
        this.list = this.totalList.filter(r => r.Title.indexOf(query) >= 0 ||
          r.ApplicationID === Number(query) ||
          r.Producer.indexOf(query) >= 0 ||
          r.NameInsured.indexOf(query) >= 0 ||
          r.EffectiveDate.format('YYYY-MM-DD').indexOf(query) >= 0 ||
          r.ExpiryDate.format('YYYY-MM-DD').indexOf(query) >= 0
        )
      }
      this.total = this.list.length
      this.pageCount = Math.ceil(this.total / this.pageSize)
      this.currentPage = 1
      this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    handleCurrentChange: function (val) {
      console.log(`当前页: ${val}`)
      if (val === this.pageCount && !this.isAll) {
      } else {
        this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
      }
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search(null, 0)
    },
    // UW弹窗
    showUnderWriter: function (application) {
      this.currentApplication = application
      this.currentApplicationID = application.ApplicationID
      this.ProcessingTypeID = 1
      this.ProcessingTitle = 'Underwriting Processing'
      this.processingVisible = true
      if (this.$refs.enbp !== undefined) {
        this.$refs.enbp.loadProperties(1, application.ApplicationID)
      }
    },
    // 查阅弹窗
    view: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplication', {applicationid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.viewApplicationVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.viewForm = res.data
            this.viewForm.InsuranceCorp = this.insuranceCorpList.find(item => item.InsuranceCorpID === res.data.InsuranceCorpID).Name
            this.viewForm.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
            this.viewForm.RequestDate = moment(res.data.RequestDate).format('YYYY-MM-DD')
            this.viewForm.DateOfBirth = moment(res.data.DateOfBirth).format('YYYY-MM-DD')
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
        DateOfBirth: null,
        applicationTemplates: [{
          applicationBlocks: [{
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
      this.axios.post('/api/Services/CommerceService.asmx/CreatePrintRecord', {applicationid: this.viewForm.ApplicationID, typeid: 1}).then(res => {
        if (res) {
          console.log('create printRecord', res)
        }
      }).catch(err => {
        console.log('导出Application PDF出错', err)
      })
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
