<!--
FileName: clApplications.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all commercial application list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">C/L Policies</span>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item>
            <el-date-picker @change="search()"
                            v-model="searchForm.periodDates" class="middleWidth"
                            type="daterange"
                            unlink-panels
                            placeholder="StartDate - EndDate">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="Frequently Used" prop="Year">
            <el-select v-model="searchForm.period" placeholder="" class="middleWidth" no-data-text="No Record" filterable @change="changePeriod()">
              <el-option v-for="item in periods" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
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
      <el-table height="640" :data="currentlist" empty-text="No Record" @expand-change="loadApplication" v-loading="isLoading || isLoadingInsuranceCompany" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="ApplicationID" width="60" fixed="left" sortable="custom"></el-table-column>
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
        <!--el-table-column label="Title" prop="Title" min-width="300" sortable="custom"></el-table-column-->
        <!--el-table-column label="ClientCode" prop="ClientCode" min-width="120" sortable="custom"></el-table-column-->
        <el-table-column label="PolicyNum" prop="PolicyNumber" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="Applicant" prop="NameInsured" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="InsuCorp" prop="CorpName" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="EffectiveDate" prop="EffectiveDate" min-width="150" sortable="custom">
          <template slot-scope="scope">
            <span>{{scope.row.EffectiveDate.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column>
        <!--el-table-column label="ExpiryDate" prop="ExpiryDate" min-width="150" sortable="custom">
          <template slot-scope="scope">
            <span>{{scope.row.ExpiryDate.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column-->
        <el-table-column label="Producer" prop="Producer" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Status" prop="Status" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Action" width="380">
          <template slot-scope="scope">
            <el-button-group>
              <!--el-button icon="el-icon-view" type="primary" @click="showViewApplication(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">View</el-button-->
              <el-button icon="el-icon-view"  type="primary" @click="showSheet(scope.row.ApplicationID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Form</el-button>
              <el-button icon="el-icon-view" v-if="scope.row.StatusID !== 6 && scope.row.QuestionnaireID > 0" type="primary" @click="showQuestionnaire(scope.row.ApplicationID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Quesnaire</el-button>
              <el-button icon="el-icon-edit" v-if="scope.row.StatusID !== 6"  type="primary" @click="showEdition(scope.row)"  size="small">BaseInfo</el-button>
              <el-button icon="el-icon-unlock" v-if="scope.row.StatusID === 6" type="warning" @click="reinstateApplication(scope.row.ApplicationID)" :loading="isLoading" size="small">Reinstate</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList" @current-change="handleCurrentChange">
      </el-pagination>
      <!----------------------------------------------查阅弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewFormVisible" width="1184.56px" center :before-close="closeView">
        <ViewApplication ref="vm" :applicationid="currentApplicationID" :insuranceCorps="insuranceCorpList"></ViewApplication>
      </el-dialog>
      <!----------------------------------------------查阅弹窗结束----------------------------------------------------->
      <!----------------------------------------------Sheet 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="sheetFormVisible" width="1184.56px"  height="2184.56px" center >
        <ViewSheet ref="vs" :businessObjId="currentApplicationID" :businessTypeId="4"></ViewSheet>
      </el-dialog>
      <!----------------------------------------------Sheet 弹窗结束----------------------------------------------------->
      <!----------------------------------------------Questionnaire 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="questionnaireFormVisible" width="1184.56px"  height="2184.56px" center >
        <ViewQuestionnaire ref="vq" :applicationid="currentApplicationID" :insuranceCorps="insuranceCorpList"></ViewQuestionnaire>
      </el-dialog>
      <!----------------------------------------------Questionnaire 弹窗结束----------------------------------------------------->
      <!----------------------------------------------BaseInfo Edition 弹窗开始----------------------------------------------------->
      <el-dialog title="Application Base Info Edition" :visible.sync="applicationFormVisible" width="600px" center>
        <EditApplicationBase ref="eab" :application="currentApplication" @hideEdition="hideEdition()"></EditApplicationBase>
        <!--el-form :model="applicationForm" ref="applicationForm" class="newMemo" :rules="applicationFormRules">
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Effective Date" prop="EffectiveDate">
                <el-date-picker v-model="applicationForm.EffectiveDate" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Expiry Date" prop="ExpiryDate">
                <el-date-picker v-model="applicationForm.ExpiryDate" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="AppType" prop="TypeID">
                <el-select v-model="applicationForm.TypeID" placeholder="App Type" no-data-text="No Record" filterable >
                  <el-option v-for="item in appTypes" :key="item.ID" :label="item.Name" :value="item.ID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="applicationForm.TypeID === 2" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Remarket From" prop="LeadFromCorpID">
                <el-select v-model="applicationForm.LeadFromCorpID" placeholder="Lead From" no-data-text="No Record" filterable >
                  <el-option v-for="item in insuranceCorpList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Client Code" prop="ClientCode">
                <el-input v-model="applicationForm.ClientCode" placeholder="Client Code" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Policy Number" prop="PolicyNumber">
                <el-input v-model="applicationForm.PolicyNumber" placeholder="Policy Number" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Premium" prop="Premium">
                <el-input v-model="applicationForm.Premium" type="number" placeholder="Premium" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Renewal Questionnaire" prop="QuestionnaireID">
                <el-select v-model="applicationForm.QuestionnaireID" placeholder="Questionnaire" no-data-text="No Record" filterable >
                  <el-option v-for="item in questionnaires" :key="item.BlockID" :label="item.Name" :value="item.BlockID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="ApplicationType" prop="TemplateID">
                <el-select v-model="applicationForm.TemplateID" placeholder="Questionnaire" no-data-text="No Record" filterable >
                  <el-option v-for="item in templateList" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="newMemo-submit">
            <el-button icon="el-icon-check" type="primary" @click="saveApplication()" :loading="isLoading">Save</el-button>
          </div>
        </el-form-->
      </el-dialog>
      <!----------------------------------------------InsuranceCorp Bind弹窗结束----------------------------------------------------->
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
      <!----------------------------------------------查阅applicationBlock弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewApplicationBlockVisible" width="984.56px" center>
        <ViewApplicationBlock ref="vab" :applicationBlockId="currentApplicationBlockID" :blockName="currentBlockName"></ViewApplicationBlock>
      </el-dialog>
      <!----------------------------------------------查阅applicationBlock弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import ViewSheet from '@/component/window/sheet'
import ViewApplication from '@/component/window/viewApplication'
import ViewQuestionnaire from '@/component/window/questionnaire'
import EditApplicationBase from '@/component/parts/editApplicationBase'
import ViewApplicationBlock from '@/component/window/viewApplicationBlock'
import EditApplicationBlock from '@/component/parts/editApplicationBlock'

export default {
  components: {
    EditApplicationBlock,
    ViewApplicationBlock,
    ViewSheet,
    ViewQuestionnaire,
    ViewApplication,
    EditApplicationBase
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
      isLoadingApplicationBlock: false,
      // staffsList: [],
      producerList: [],
      statusList: [],
      insuranceCorpList: [],
      questionnaires: [],
      periods: [
        {name: 'Month to Date', value: 1},
        {name: 'Year to Date', value: 2},
        {name: 'Last 30 Days', value: 30},
        {name: 'Last 90 Days', value: 90},
        {name: 'Last 182 Days', value: 182},
        {name: 'Last 365 Days', value: 365}],
      // appTypes: [{ID: 1, Name: 'New Business'}, {ID: 2, Name: 'Remarket'}, {ID: 3, Name: 'LOA'}, {ID: 4, Name: 'Rewrite'}],
      // 搜索
      searchForm: {
        name: null,
        periodDates: '',
        period: 1
      },
      searchName: null,
      // 列表
      templateList: [],
      currentlist: [],
      list: [],
      totalList: [],
      currentApplication: null,
      currentApplicationID: 0,
      currentApplicationBlockID: 0,
      currentBlockName: null,
      currentApplicationBlock: null,
      currentApplicationTemplate: null,
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      isAll: false,
      // 查阅
      editApplicationWindowVisible: false,
      editApplicationBlockVisible: false,
      viewApplicationBlockVisible: false,
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
      questionnaireFormVisible: false,
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
      processingVisible: false,
      applicationFormVisible: false,
      applicationForm: {
        ApplicationID: null,
        EffectiveDate: null,
        TypeID: null,
        LeadFromCorpID: 0,
        ExpiryDate: null,
        ClientCode: null,
        PolicyNumber: null,
        Premium: null,
        QuestionnaireID: 0,
        TemplateID: 0
      },
      applicationFormRules: {
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
      }

    }
  },
  mounted: function () {
    // this.loadProducers()
    this.loadApplicationStatus()
    this.initInsuranceCompany()
    // this.initTemplates()
    this.searchForm.period = 1
    this.changePeriod()
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
    changePeriod: function () {
      if (this.searchForm.period === 1) {
        let year = new Date().getFullYear()
        let month = new Date().getMonth()
        let startDate = new Date(year, month, 1)
        let endDate = new Date(year + 1, month, 1)
        this.searchForm.periodDates = [startDate, endDate]
      } else if (this.searchForm.period === 2) {
        let year = new Date().getFullYear()
        let month = new Date().getMonth()
        let startDate = new Date(year, 0, 1)
        let endDate = new Date(year + 1, month, 1)
        this.searchForm.periodDates = [startDate, endDate]
      } else {
        let now = new Date().getTime()
        let startDate = new Date(now - this.searchForm.period * 24 * 60 * 60 * 1000)
        let endDate = new Date()
        this.searchForm.periodDates = [startDate, endDate]
      }
      this.loadApplications(0)
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
      if (aBlock !== undefined) {
        this.loadApplicationBlock(aTemplate, aBlock)
      } else {
        this.loadNewApplicationBlock(aTemplate, blockItem.templateBlock)
      }
    },
    loadApplication: function (app) {
      if (app.applicationTemplate !== null) return
      let id = app.ApplicationID
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationFrame', {applicationid: id}).then(res => {
        if (res) {
          app.applicationTemplate = res.data.applicationTemplate
          app.applicationTemplate.applicationBlocks = app.applicationTemplate.applicationBlocks.filter(ab => ab !== null)
          // build application tree
          app.blocks = []
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
            // fill in subApplicationTemplate
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
    loadNewApplicationBlock: function (aTemplate, templateBlock) {
      let start = true
      this.isLoadingApplicationBlock = false
      this.axios.post('/api/Services/CommerceService.asmx/GetNewApplicationBlock', {templateblockid: templateBlock.TemplateBlockID, start: start}).then(res => {
        if (res) {
          console.log('GetNewApplicationBlock', res.data)
          let aBlock = res.data
          aBlock.ApplicationTemplateID = aTemplate.ApplicationTemplateID
          templateBlock.applicationBlock = aBlock
          aTemplate.applicationBlocks.push(res.data)
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
        console.log('GetNewApplicationBlock列表出错', err)
        this.isLoadingApplicationBlock = false
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
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps_all', {}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          this.insuranceCorpList = res.data
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // Questionnaire
    loadQuestionnaires: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetQuestionnaires', {}).then(res => {
        if (res) {
          console.log('Questionnaires', res)
          let nocorp = [{BlockID: 0, Name: 'No Need'}]
          this.questionnaires = nocorp.concat(res.data)
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
            this.totalList.remove(item => item.ApplicationID === id)
            this.list.remove(item => item.ApplicationID === id)
            console.log('reinstateApplication', this.list)
            // let app = this.list.find(item => item.ApplicationID === id)
            // app.StatusID = res.data
            // this.setApplicationStatus(app)

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
      this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
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
      let startDate = this.dateFormat(this.searchForm.periodDates[0])
      let endDate = this.dateFormat(this.searchForm.periodDates[1])
      this.axios.post('/api/Services/CommerceService.asmx/GetPolicies', {startdate: startDate, enddate: endDate, start: start}).then(res => {
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
          this.viewFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.viewForm = res.data
            this.viewForm.InsuranceCorp = this.insuranceCorpList.find(item => item.InsuranceCorpID === res.data.InsuranceCorpID).Name
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
    showNextBlock: function () {},
    showSkipBlock: function () {},
    resetLeftChildren: function () {},
    skipLeftChildren: function () {},
    checkOver: function () {},
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
    },
    showQuestionnaire: function (applicationid) {
      this.currentApplicationID = applicationid
      this.questionnaireFormVisible = true
      if (this.$refs.vq !== undefined) {
        this.$refs.vq.loadApplication(applicationid)
      }
    },
    showEdition: function (application) {
      this.currentApplication = application
      this.applicationFormVisible = true
      if (this.$refs.eab !== undefined) {
        this.$refs.eab.setForm(application)
      }
    },
    hideEdition: function () {
      this.applicationFormVisible = false
    }
  }
}
</script>

<style scoped>

</style>
