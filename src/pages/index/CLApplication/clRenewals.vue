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
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name, 0)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Go</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="inPageContent">
      <el-table height="680" :data="currentlist" empty-text="No Record" @expand-change="loadApplication" v-loading="isLoadingApplications || isLoadingProducers" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
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
                  <el-button v-if="scope.row.TypeID === 1" icon="el-icon-edit" type="primary" plain @click="showSetBlockQuestionnaire(scope.row)" size="small">SetQuestionnaire</el-button>
                  <el-button v-if="scope.row.TypeID === 1" icon="el-icon-view" type="info" plain @click="showBlockQuestionnaire(scope.row)" :loading="isLoading" size="small">Questionnaire</el-button>
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
        <!--el-table-column label="EffecDate" prop="EffectiveDate" min-width="90" sortable="custom">
          <template v-slot="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column-->
        <el-table-column label="Questionnaire" prop="QuestionnaireStatus" min-width="60" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="Status" prop="RenewalStatus" min-width="60" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="Action" width="380" >
          <template slot-scope="scope">
            <el-button-group>
              <el-button icon="el-icon-edit" type="primary" @click="showEdition(scope.row)"  size="small">BaseInfo</el-button>
              <el-button icon="el-icon-view" :type="processType(scope.row)" @click="showRenewalProcessing(scope.row)"  size="small">Process</el-button>
              <el-button icon="el-icon-view" type="info" plain @click="showSheet(scope.row.ApplicationID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">FORM</el-button>
              <el-button icon="el-icon-view" v-if="scope.row.QuestionnaireID > 0" type="info" plain @click="showQuestionnaire(scope.row.ApplicationID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Quesnaire</el-button>
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
      <!----------------------------------------------修改ApplicationBlock弹窗开始----------------------------------------------------->
      <el-dialog z-index="5" title="" :visible.sync="editApplicationBlockVisible" width="984.56px" center :before-close="closeEdit">
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
      <!----------------------------------------------Questionnaire 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="questionnaireFormVisible" width="1184.56px"  height="2184.56px" center >
        <ViewQuestionnaire ref="vq" :applicationid="currentApplicationID"
                           :templateBlockID="TemplateBlockID"
                           :repeatedID="RepeatedID"
                           :objTypeID="ObjTypeID"
                           :questionnaireID="QuestionnaireID"
                           :insuranceCorps="insuranceCorpList"></ViewQuestionnaire>
      </el-dialog>
      <!----------------------------------------------Questionnaire 弹窗结束----------------------------------------------------->
      <!----------------------------------------------BaseInfo Edition 弹窗开始----------------------------------------------------->
      <el-dialog z-index="5" title="Application Base Info Edition" :visible.sync="applicationFormVisible" width="600px" center>
        <EditApplicationBase ref="eab" :application="currentApplication" @hideEdition="hideEdition()"></EditApplicationBase>
      </el-dialog>
      <!----------------------------------------------InsuranceCorp Bind弹窗结束----------------------------------------------------->
      <!----------------------------------------------Renewal Processing 弹窗开始----------------------------------------------------->
      <el-dialog title="Insurance Renewal Processing" :visible.sync="renewalProcessingVisible" width="600px" center>
        <el-form :model="renewalProcessingForm" class="newMemo" :rules="renewalProcessingFormRules">
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Processing Type" prop="StatusID">
                <el-select v-model="renewalProcessingForm.ProcessingTypeID" placeholder="Processing Type" no-data-text="No Record" filterable >
                  <el-option v-for="item in renewalProcessings" :key="item.ID" :label="item.Name" :value="item.ID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="renewalProcessingForm.ProcessingTypeID === 8"  class="subtitle">
            <el-col :span="24">
              <el-form-item label="Premium" prop="Premium">
                <el-input v-model="renewalProcessingForm.Premium" type="number" placeholder="Premium" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="renewalProcessingForm.ProcessingTypeID === 8" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Effective Date" prop="EffectiveDate">
                <el-date-picker v-model="renewalProcessingForm.EffectiveDate" @change="effectiveDateChange" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="renewalProcessingForm.ProcessingTypeID === 8" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Expiry Date" prop="ExpiryDate">
                <el-date-picker v-model="renewalProcessingForm.ExpiryDate" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Description" prop="Brief">
                <el-input v-model="renewalProcessingForm.Brief" type="textarea" :rows="3" placeholder="Description" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="newMemo-submit">
            <el-button icon="el-icon-check" type="primary" @click="renewalProcess" :loading="isLoading">Confirm</el-button>
          </div>
        </el-form>
      </el-dialog>
      <!----------------------------------------------InsuranceCorpRenewal Processing弹窗结束----------------------------------------------------->
      <!----------------------------------------------setBlockQuestionnaire弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="setBlockQuestionnaireVisible" width="984.56px" center>
        <el-form :model="setQuestionnaireForm" ref="setQuestionnaireForm" class="newMemo">
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Renewal Questionnaire" prop="QuestionnaireID">
                <el-select v-model="setQuestionnaireForm.QuestionnaireID" placeholder="Questionnaire" no-data-text="No Record" filterable >
                  <el-option v-for="item in questionnaires" :key="item.BlockID" :label="item.Name" :value="item.BlockID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="newMemo-submit">
          <el-button icon="el-icon-check" type="primary" @click="setBlockQuestionnaire()" :loading="isLoading">Save</el-button>
        </div>
      </el-dialog>
      <!----------------------------------------------setBlockQuestionnaire弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import ViewSheet from '@/component/window/sheet'
import ViewApplication from '@/component/window/viewApplication'
import ViewApplicationBlock from '@/component/window/viewApplicationBlock'
import editApplicationBlock from '@/component/parts/editApplicationBlock'
import ViewQuestionnaire from '@/component/window/questionnaire'
import EditApplicationBase from '@/component/parts/editApplicationBase'

export default {
  components: {
    editApplicationBlock,
    ViewSheet,
    ViewApplicationBlock,
    ViewQuestionnaire,
    ViewApplication,
    EditApplicationBase
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
      isLoadingProducers: false,
      isLoadingApplications: false,
      isLoadingInsuranceCompany: false,
      isLoadingStatus: false,
      applicationFormVisible: false,
      questionnaireFormVisible: false,
      templateList: [],
      producerList: [],
      renewalStatusList: [],
      emailStatusList: [],
      insuranceCorpList: [],
      questionnaires: [],
      renewalProcessings: [
        {ID: 6, Name: 'Update'},
        {ID: 7, Name: 'Pend'},
        {ID: 8, Name: 'Renew'},
        {ID: 9, Name: 'Cancel'}
      ],
      currentInsuranceCorpID: null,
      currentBlockItem: null,
      setQuestionnaireForm: {
        QuestionnaireID: 0,
        ApplicationBlockID: 0,
        blockItem: null
      },
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
      TemplateBlockID: 0,
      RepeatedID: 0,
      ObjTypeID: 0,
      QuestionnaireID: 0,
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      isAll: false,
      renewalProcessingVisible: false,
      renewalProcessingForm: {
        ApplicationID: 0,
        ProcessingTypeID: null,
        Brief: null,
        EffectiveDate: null,
        ExpiryDate: null,
        Premium: null
      },
      renewalProcessingFormRules: {
        ProcessingTypeID: [
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
      editApplicationWindowVisible: false,
      editApplicationBlockVisible: false,
      setBlockQuestionnaireVisible: false,
      viewBlockQuestionnaireVisible: false,
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
      // processing
      ProcessingTitle: '',
      processingVisible: false
    }
  },
  mounted: function () {
    this.loadProducers(0)
    this.loadRenewalStatus()
    this.loadEmailStatus()
    this.initInsuranceCompany()
    this.loadApplications(0)
    this.loadQuestionnaires()
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
      if (app.RenewalStatus === 3) return 'success'
      else return 'primary'
    },
    showRenewalProcessing: function (app) {
      console.log('Application', app)
      this.renewalProcessingForm.ApplicationID = app.ApplicationID
      this.renewalProcessingForm.Premium = app.Premium
      this.renewalProcessingForm.EffectiveDate = app.EffectiveDate.add(1, 'year')
      this.renewalProcessingForm.ExpiryDate = app.ExpiryDate.add(1, 'year')
      this.renewalProcessingVisible = true
    },
    effectiveDateChange: function () {
      this.quotationBindForm.ExpiryDate = moment(this.quotationBindForm.EffectiveDate).add(1, 'year')
    },
    setRenewalStatus: function (app) {
      let astatus = this.renewalStatusList.find(s => s.StatusID === app.RenewalStatus)
      app.RenewalStatus = astatus.Name
    },
    renewalProcess: function () {
      this.$confirm('Are you sure to process it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoadingApplicationQuotations = true
        let id = this.renewalProcessingForm.ApplicationID
        let typeid = this.renewalProcessingForm.ProcessingTypeID
        let brief = this.renewalProcessingForm.Brief
        if (typeid === 8) {
          let value = {
            EffectiveDate: this.renewalProcessingForm.EffectiveDate,
            ExpiryDate: this.renewalProcessingForm.ExpiryDate,
            Premium: this.renewalProcessingForm.Premium,
            Brief: this.renewalProcessingForm.Brief
          }
          brief = JSON.stringify(value)
        }
        // let value = JSON.stringify(this.renewalProcessingForm)
        // console.log('renewalProcessingForm', value)
        this.axios.post('/api/Services/CommerceService.asmx/RenewalProcess', {id: id, processtypeid: typeid, brief: brief}).then(res => {
          if (res) {
            console.log('renewalProcess', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            let appStatusID = res.data
            let status = this.renewalStatusList.find(s => s.StatusID === appStatusID)
            if (status !== undefined) this.currentApplication.RenewalStatus = status.Name
            else this.currentApplication.RenewalStatus = ''
            // this.setRenewalStatus(this.currentApplication)
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
      // if (app.applicationTemplate !== null && app.applicationTemplate.applicationBlocks !== null) return
      let id = app.ApplicationID
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationFrame', {applicationid: id}).then(res => {
        if (res) {
          console.log('GetApplicationFrame', res.data)
          app.applicationTemplate = res.data.applicationTemplate
          if (app.applicationTemplate !== null) {
            app.applicationTemplate.applicationBlocks = app.applicationTemplate.applicationBlocks.filter(ab => ab !== null)
            // build application tree
            app.blocks = []
            app.blockCount = 0
            let id = 0
            app.applicationTemplate.templateBlocks.forEach(tb => {
              if (tb.ChildTypeID === 0) {
                let appBlock = app.applicationTemplate.applicationBlocks.find(ab => ab.TemplateBlockID === tb.TemplateBlockID)
                if (appBlock !== undefined) {
                  tb.applicationBlock = appBlock
                  tb.applicationBlock.topTemplateBlockID = tb.applicationBlock.TemplateBlockID
                }
                let blockItem = {
                  id: id++,
                  TypeID: 0,
                  templateBlock: tb,
                  BlockID: tb.BlockID,
                  BlockName: tb.BlockName,
                  Status: appBlock === undefined ? 'Not Answer' : (appBlock.StatusID === 0 ? 'Not Answer' : (appBlock.StatusID === 1 ? 'Answered' : (appBlock.StatusID === 2 ? 'Skipped' : 'Answering'))),
                  applicationBlock: appBlock,
                  app: app,
                  applicationTemplate: app.applicationTemplate
                }
                app.blocks.push(blockItem)
                app.blockCount = id
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
                app: app,
                children: []
              }
              app.blocks.push(appb)
              // fill in subApplicationTemplate
              tb.applicationTemplates = app.applicationTemplate.children.filter(c => c.TemplateID === tb.BlockID)
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
                if (subatemplate.applicationBlocks === null) subatemplate.applicationBlocks = []
                subatemplate.applicationBlocks.push(ab)
                ab.topTemplateBlockID = tb.TemplateBlockID
                ab.BlockName = templateBlock.BlockName
              })
              tb.applicationTemplates.forEach(at => {
                let childat = {
                  id: id++,
                  ApplicationTemplateID: at.ApplicationTemplateID,
                  ApplicationID: app.ApplicationID,
                  BlockID: appb.BlockID,
                  TemplateBlockID: tb.TemplateBlockID,
                  RepeatedID: at.RepeatedID,
                  Parent: appb,
                  BlockName: tb.BlockName + ':' + (at.RepeatedID + 1),
                  TypeID: 1,
                  QuestionnaireID: at.QuestionnaireID,
                  app: app,
                  applicationTemplate: app.applicationTemplate,
                  children: []
                }
                appb.children.push(childat)
                at.applicationBlocks.forEach(ab => {
                  let childab = {
                    id: id++,
                    TypeID: 0,
                    BlockID: ab.BlockID,
                    BlockName: ab.BlockName + ':' + (at.RepeatedID + 1),
                    Status: ab.StatusID === 0 ? 'Not Answer' : (ab.StatusID === 1 ? 'Answered' : (ab.StatusID === 2 ? 'Skipped' : 'Answering')),
                    app: app,
                    applicationBlock: ab,
                    applicationTemplate: app.applicationTemplate
                  }
                  childat.children.push(childab)
                })
              })
            })
            app.blockCount = id
            this.loadTemplateBlockQuestions(app.applicationTemplate)
          }
          // console.log('ApplicationFrame', app)
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
      console.log('loadTemplateBlockQuestions', atemplate)
      if (atemplate.TemplateID === 0) {
        this.$message({
          type: 'error',
          message: 'Template is not exist'
        })
        return
      }
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
    // Questionnaire list
    loadQuestionnaires: function () {
      this.isLoadingQuestionnaires = true
      this.axios.post('/api/Services/baseservice.asmx/GetQuestionnaires', {}).then(res => {
        if (res) {
          console.log('Questionnaires', res)
          let nocorp = [{BlockID: 0, Name: 'No Need'}]
          this.questionnaires = nocorp.concat(res.data)
        }
        this.isLoadingQuestionnaires = false
      }).catch(err => {
        console.log('loadQuestionnaires出错', err)
        this.isLoadingQuestionnaires = false
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
    loadRenewalStatus: function () {
      this.isLoadingStatus = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'ApplicationRenewalStatus'}).then(res => {
        if (res) {
          console.log('statusList', res)
          this.renewalStatusList = res.data
        }
        this.isLoadingStatus = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingStatus = false
      })
    },
    loadEmailStatus: function () {
      this.isLoadingStatus = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'EmailStatus'}).then(res => {
        if (res) {
          console.log('statusList', res)
          this.emailStatusList = res.data
        }
        this.isLoadingStatus = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingStatus = false
      })
    },
    loadProducers: function (start) {
      this.isLoadingProducers = true
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
          } else {
            this.isLoadingProducers = false
            this.attachProducers()
          }
        }
      }).catch(err => {
        console.log('producerList', err)
        this.isLoadingProducers = false
      })
    },
    attachProducers: function () {
      if (!this.isLoadingApplications && !this.isLoadingProducers) {
        this.totalList.forEach(a => {
          let producer = this.producerList.find(p => p.StaffID === a.ProducerID)
          if (producer !== undefined) a.Producer = producer.Name
          else a.Producer = ''
          if (a.StaffID === a.ProducerID) a.Author = a.Producer
          else {
            let author = this.producerList.find(p => p.StaffID === a.StaffID)
            if (producer !== undefined) a.Author = author.Name
            else a.Author = ''
          }
        })
      }
    },
    loadApplications: function (start) {
      this.isLoadingApplications = true
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
              this.attachInfo(a)
            })
            this.list = this.totalList
            this.pageCount = Math.ceil(this.total / this.pageSize)
            this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            this.isLoadingApplications = false
          } else this.loadApplications(this.totalList.length)
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingApplications = false
      })
    },
    attachInfo: function (a) {
      a.EffectiveDate = moment(a.EffectiveDate)
      a.ExpiryDate = moment(a.ExpiryDate)
      a.RequestDate = moment(a.RequestDate)
      a.DateOfBirth = moment(a.DateOfBirth)
      let corp = this.insuranceCorpList.find(c => c.InsuranceCorpID === a.InsuranceCorpID)
      if (corp !== undefined) a.CorpName = corp.Name
      else a.CorpName = ''
      let status = this.renewalStatusList.find(s => s.key === a.RenewalStatus)
      if (status !== undefined) a.RenewalStatus = status.value
      else a.RenewalStatus = ''
      status = this.emailStatusList.find(s => s.key === a.QuestionnaireStatus)
      if (status !== undefined) a.QuestionnaireStatus = status.value
      else a.QuestionnaireStatus = ''
      this.attachProducers()
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
      }
      this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
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
    showQuestionnaire: function (applicationid) {
      this.currentApplicationID = applicationid
      this.questionnaireFormVisible = true
      if (this.$refs.vq !== undefined) {
        this.$refs.vq.loadApplication(applicationid)
      }
    },
    showBlockQuestionnaire: function (blockItem) {
      if (blockItem.QuestionnaireID === 0) return
      this.currentApplicationID = blockItem.ApplicationID
      this.TemplateBlockID = blockItem.TemplateBlockID
      this.RepeatedID = blockItem.RepeatedID
      this.ObjTypeID = 1
      this.QuestionnaireID = blockItem.QuestionnaireID
      this.questionnaireFormVisible = true
      if (this.$refs.vq !== undefined) {
        this.$refs.vq.loadApplicationTemplate(blockItem.ApplicationID, blockItem.TemplateBlockID, blockItem.RepeatedID, blockItem.QuestionnaireID)
      }
    },
    showSetBlockQuestionnaire: function (blockItem) {
      this.setBlockQuestionnaireVisible = true
      this.setQuestionnaireForm.blockItem = blockItem
      this.setQuestionnaireForm.QuestionnaireID = blockItem.QuestionnaireID
      this.setQuestionnaireForm.ApplicationTemplateID = blockItem.ApplicationTemplateID
    },
    showEdition: function (application) {
      this.currentApplication = application
      this.applicationFormVisible = true
      if (this.$refs.eab !== undefined) {
        this.$refs.eab.loadApplication(application.ApplicationID)
      }
    },
    hideEdition: function () {
      this.applicationFormVisible = false
      if (this.currentApplication.applicationTemplate !== null) {
        this.loadApplication(this.currentApplication)
      }
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
