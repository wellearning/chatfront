<!--
FileName: clMyApplications.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show my commercial application list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">My Policies</span>
      <div class="rightBtnBox">
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
      <el-table height="500" :data="currentlist" empty-text="No Record" @expand-change="loadApplication" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="ApplicationID" width="60" fixed="left" sortable="custom"></el-table-column>
        <el-table-column width="20" type="expand" :loading="isLoading" >
          <template slot-scope="props">
            <el-table :data="props.row.blocks" row-key="id" default-expand-all :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
              <el-table-column prop="BlockName" label="Block Name" min-width="300"/>
              <el-table-column prop="Status" label="Status" min-width="100"/>
              <el-table-column label="Sub-Action" width="380">
                <template slot-scope="scope">
                  <el-button-group>
                    <el-button v-if="scope.row.TypeID === 0" icon="el-icon-view" type="primary" @click="showViewApplicationBlock(scope.row)" :loading="isLoading" size="small">View</el-button>
                    <!--el-button v-if="scope.row.TypeID === 0" icon="el-icon-edit"  type="primary" :disabled="props.row.StatusID > 1" @click="showEditBlock(scope.row)" :loading="isLoadingApplicationBlock" size="small">Edit</el-button>
                    <el-button v-if="scope.row.TypeID === 1" icon="el-icon-delete" type="danger" :disabled="props.row.StatusID > 1" @click="removeSubApplicationTemplate(scope.row)" :loading="isLoading" size="small">Del</el-button>
                    <el-button v-if="scope.row.TypeID === 2" icon="el-icon-plus" type="primary" :disabled="props.row.StatusID > 1" @click="addSubApplicationTemplate(scope.row)" :loading="isLoading" size="small">Add</el-button-->
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="Title" prop="Title" min-width="150" sortable="custom"></el-table-column>
        <el-table-column label="ClientCode" prop="ClientCode" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="PolicyNum" prop="PolicyNumber" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="Applicant" prop="NameInsured" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="InsuCorp" prop="CorpName" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="EffectiveDate" prop="EffectiveDate" min-width="150" sortable="custom">
          <template slot-scope="scope">
            <span>{{scope.row.EffectiveDate.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column>
        <!--el-table-column label="RequestDate" prop="RequestDate" min-width="150" sortable="custom">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.RequestDate)}}</span>
          </template>
        </el-table-column-->
        <el-table-column label="Status" prop="PolicyStatus" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Action" width="400">
          <template slot-scope="scope">
            <el-button-group>
              <el-icon><CopyDocument /></el-icon>
              <el-button icon="el-icon-view" type="primary" @click="showViewApplication(scope.row)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">View</el-button>
              <!--el-button icon="el-icon-edit" type="primary" :disabled="scope.row.StatusID > 1" @click="showEditApplication(scope.row)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Edit</el-button>
              <el-button icon="el-icon-edit" v-if="scope.row.StatusID !== 6"  type="primary" @click="showEdition(scope.row)"  size="small">BaseInfo</el-button-->
              <el-button icon="el-icon-view" v-if="scope.row.StatusID !== 6 && scope.row.QuestionnaireID > 0" type="primary" @click="showQuestionnaire(scope.row.ApplicationID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Quesnaire</el-button>
              <el-button icon="el-icon-view"  type="primary" @click="showSheet(scope.row.ApplicationID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">FORM</el-button>
              <el-button icon="el-icon-circle-plus" type="primary" @click="duplicate(scope.row)"  size="small">Duplicate</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList" @current-change="handleCurrentChange">
      </el-pagination>
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog z-index="5" title="" :visible.sync="editApplicationWindowVisible" width="1550px" center :before-close="closeEdit">
        <EditApplication ref="eacl" :applicationid="currentApplicationID" :templateList="templatesList" @close="closeEditApplication"></EditApplication>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------查阅弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewApplicationVisible" width="1184.56px" center :before-close="closeViewApplication">
        <ViewApplication ref="ps" :applicationid="currentApplicationID" :insuranceCorps="insuranceCorpList"></ViewApplication>
      </el-dialog>
      <!----------------------------------------------查阅弹窗结束----------------------------------------------------->
      <!----------------------------------------------Sheet 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="sheetFormVisible" width="1184.56px"  height="2184.56px" center >
        <ViewSheet ref="vs" :businessObjId="currentApplicationID" :businessTypeId="4"></ViewSheet>
      </el-dialog>
      <!----------------------------------------------Sheet 弹窗结束----------------------------------------------------->
      <!----------------------------------------------查阅applicationBlock弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewApplicationBlockVisible" width="984.56px" center>
        <ViewApplicationBlock ref="vab" :applicationBlockId="currentApplicationBlockID" :blockName="currentBlockName"></ViewApplicationBlock>
      </el-dialog>
      <!----------------------------------------------查阅applicationBlock弹窗结束----------------------------------------------------->
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
        <ViewQuestionnaire ref="vq" :applicationid="currentApplicationID" :insuranceCorps="insuranceCorpList"></ViewQuestionnaire>
      </el-dialog>
      <!----------------------------------------------Questionnaire 弹窗结束----------------------------------------------------->
      <!----------------------------------------------BaseInfo Edition 弹窗开始----------------------------------------------------->
      <el-dialog z-index="5" title="Application Base Info Edition" :visible.sync="applicationFormVisible" width="600px" center>
        <EditApplicationBase ref="eab" :application="currentApplication" @hideEdition="hideEdition()"></EditApplicationBase>
      </el-dialog>
      <!----------------------------------------------BaseInfo弹窗结束----------------------------------------------------->

    </div>
  </div>
</template>

<script>
import moment from 'moment'
import ViewSheet from '@/component/window/sheet'
import ViewApplication from '@/component/window/viewApplication'
import EditApplicationBase from '@/component/parts/editApplicationBase'
import ViewQuestionnaire from '@/component/window/questionnaire'
import EditApplication from '@/component/parts/editApplication'
import ViewApplicationBlock from '@/component/window/viewApplicationBlock'
import editApplicationBlock from '@/component/parts/editApplicationBlock'

export default {
  components: {
    ViewSheet,
    editApplicationBlock,
    ViewApplicationBlock,
    EditApplication,
    ViewApplication,
    ViewQuestionnaire,
    EditApplicationBase
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
      questionnaireFormVisible: false,
      pinkSlipFormVisible: false,
      RepeatedID: -1,
      currentApplicationID: null,
      currentApplication: null,
      currentApplicationTemplate: null,
      currentApplicationBlock: null,
      currentBlockName: '',
      currentApplicationBlockID: 0,
      // 列表
      tempList: [],
      currentlist: [],
      list: [],
      totalList: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 修改
      isLoadingTemplates: false,
      isLoadingApplicationBlock: false,
      isLoadingInsuranceCompany: false,
      templatesList: [],
      statusList: [],
      renewalStatusList: [],
      insuranceCorpList: [],
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
      viewApplicationBlockVisible: false,
      viewApplicationVisible: false,
      editApplicationBlockVisible: false
    }
  },
  mounted: function () {
    // this.loadProducers()
    this.loadApplicationStatus()
    this.loadRenewalStatus()
    this.initInsuranceCompany()
    this.loadApplications(0)
    this.initTemplates()
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
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
    },
    rank: function (name) {
      this.currentlist.sort(this.by(name))
    },
    rankdesc: function (name) {
      this.currentlist.sort(this.bydesc(name))
    },
    setCurrent: function (application) {
      this.currentApplication = application
      this.currentApplicationID = application.ApplicationID
    },
    showNextBlock: function () {},
    showSkipBlock: function () {},
    resetLeftChildren: function () {},
    skipLeftChildren: function () {},
    checkOver: function () {},
    saveApplicationBlock: function () {
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
    showViewApplicationBlock: function (blockItem) {
      let id = blockItem.applicationBlock.ApplicationBlockID
      this.currentApplicationBlockID = id
      this.currentBlockName = blockItem.BlockName
      this.viewApplicationBlockVisible = true
      if (this.$refs.vab !== undefined) {
        this.$refs.vab.loadApplicationBlock(id, blockItem.BlockName)
      }
    },
    showEditBlock: function (blockItem) {
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
    showApplication: function (id) {
      this.viewApplicationVisible = true
      if (this.$refs.ps !== undefined) {
        this.$refs.ps.loadApplication(id)
      }
    },
    showViewApplication: function (application) {
      this.setCurrent(application)
      this.showApplication(application.ApplicationID)
    },
    closeViewApplication: function (done) {
      this.viewApplicationVisible = false
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
    showQuestionnaire: function (applicationid) {
      this.currentApplicationID = applicationid
      this.RepeatedID = -1
      this.questionnaireFormVisible = true
      if (this.$refs.vq !== undefined) {
        this.$refs.vq.loadApplication(applicationid, -1)
      }
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
    loadApplications: function (start) {
      this.isLoading = true
      if (start === 0) this.totalList = []
      this.axios.post('/api/Services/CommerceService.asmx/GetMyPolicies', {start: start}).then(res => {
        if (res) {
          console.log('Policies查询', res)
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
              let status = this.statusList.find(s => s.key === a.Status)
              let renewalStatus = this.renewalStatusList.find(s => s.key === a.RenewalStatus)
              if (status.value !== 'Bound') {
                a.PolicyStatus = status.value
              } else {
                if (renewalStatus.value === 'Opened') {
                  let dateline = moment().add(2, 'M')
                  if (a.ExpiryDate < dateline) a.PolicyStatus = 'Open Renewal'
                  else a.PolicyStatus = 'NB'
                } else if (renewalStatus.value === 'Pending') a.PolicyStatus = 'Pending Renewal'
                else a.PolicyStatus = renewalStatus.value
              }
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
        this.search(null, this.total)
      } else {
      }
      this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
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
    loadRenewalStatus: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'ApplicationRenewalStatus'}).then(res => {
        if (res) {
          console.log('loadRenewalStatus', res)
          this.renewalStatusList = res.data
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('loadRenewalStatus', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // 保险公司列表
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps', {}).then(res => {
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
      if (this.currentApplication.applicationTemplate !== null) {
        this.loadApplication(this.currentApplication)
      }
    },
    duplicate: function (application) {
      this.$confirm('Are you sure to duplicate a new application? The new application will be shown in my applications', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        let id = application.ApplicationID
        this.isLoading = true
        this.axios.post('/api/Services/CommerceService.asmx/DuplicateApplication', {applicationid: id}).then(res => {
          if (res) {
            console.log('duplicate', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded. The new ApplicationID is ' + res.data
            })
          }
          this.isLoading = false
        }).catch(err => {
          console.log('duplicate error', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
