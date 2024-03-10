<!--
FileName: clNewApplication.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Create new commercial application.
-->
<template>
  <div v-loading="isLoading || isLoadingTemplates" element-loading-background="rgba(0, 0, 0, 0)">
    <EditDirectionBlock v-if="isDirecting" :busiTypeID=4 @directReady="directReady"></EditDirectionBlock>
    <div v-else>
      <el-form :model="applicationForm" ref="applicationForm" class="newMemo" :rules="applicationFormRules">
        <el-row :gutter="20" class="title">
          <el-col :span="6">&#12288;</el-col>
          <el-col :span="12">
            <el-form-item prop="Title">
              <el-input v-model="applicationForm.Title" placeholder="Title" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">&#12288;</el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="7">
            <el-form-item label="Effective Date" prop="EffectiveDate">
              <el-date-picker v-model="EffectiveDate" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Client Code" prop="ClientCode">
              <el-input v-model="applicationForm.ClientCode" placeholder="Client Code" title=""></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="Producer" prop="ProducerID">
              <el-select v-model="applicationForm.ProducerID" placeholder="Producer" no-data-text="No Record" filterable>
                <el-option v-for="item in producerList" :key="item.StaffID" :label="item.Name" :value="item.StaffID"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="Application" prop="Templates">
              <el-select v-model="currentTemplateID" placeholder="Application Type" no-data-text="No Record" filterable collapse-tags :disabled="applicationForm.NameInsured === null" @change="changeTemplates()">
                <el-option v-for="item in templateList" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="5">
            <el-form-item label="Applicant" prop="NameInsured">
              <el-input v-model="applicationForm.NameInsured" placeholder="Last, First Name or Business Name" title="Last Name, First Name or Business Name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="Owner/Principal" prop="PersonContact">
              <el-input v-model="applicationForm.PersonContact" placeholder="Last name, First name" title=""></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="DOB" prop="DateOfBirth">
              <el-date-picker v-model="applicationForm.DateOfBirth" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="Phone" prop="PhoneNumber">
              <el-input v-model="applicationForm.PhoneNumber" placeholder="" title=""></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="Email" prop="Email">
              <el-input v-model="applicationForm.Email" placeholder="" title=""></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="7">
            <el-form-item label="Mailing Address" prop="Address">
              <el-input v-model="applicationForm.Address" placeholder="Street No" title=""></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="City" prop="City">
              <el-input v-model="applicationForm.City" placeholder="City" title=""></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="Province" prop="Province">
              <el-input v-model="applicationForm.Province" placeholder="" title=""></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="PostCode" prop="PostCode">
              <el-input v-model="applicationForm.MailingAddress" placeholder="" title=""></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="newMemo-submit">
        <el-button icon="el-icon-check" type="primary" @click="beginToAnswer()" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="!isAnswering" :disabled="currentTemplateID === null">Start</el-button>
      </div>
      <EditApplicationBody v-if="isAnswering" :applicTemplate="applicationForm.applicationTemplate" @checkOver="checkOver()"></EditApplicationBody>
      <div class="newMemo-submit">
        <el-button icon="el-icon-check" type="primary" @click="submit('save')" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="isAnswering">Save</el-button>
        <el-button icon="el-icon-check" type="primary" @click="submit('finish')" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="isAnswering && applicationForm.StatusID === 1">Finish</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import EditDirectionBlock from '@/component/parts/editDirectionBlock'
import EditApplicationBody from '@/component/parts/editApplicationTemplate'
import moment from 'moment'

export default {
  components: {
    EditDirectionBlock,
    EditApplicationBody
  },
  data: function () {
    return {
      isDirecting: true,
      EffectiveDate: null,
      isAnswering: false,
      isLoading: false,
      isLoadingTemplates: false,
      isLoadingInsuranceCompany: false,
      isLoadingProducer: false,
      isLoadingBlockQuestions: false,
      applicationForm: {
        Title: null,
        // EffectiveDate: null,
        ClientCode: '',
        Address: '',
        City: '',
        Province: 'ON',
        PostCode: '',
        PersonContact: '',
        DateOfBirth: null,
        PhoneNumber: '',
        Email: '',
        StatusID: 0,
        ProducerID: JSON.parse(this.$store.getters.getAccount).StaffID,
        RequestDate: moment(new Date()),
        NameInsured: null,
        TemplateType: null,
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        Author: JSON.parse(this.$store.getters.getAccount).Name,
        corp: null,
        applicationTemplate: null
        // applicationTemplates: []
      },
      applicationFormRules: {
        Title: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        RequestDate: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        DateOfBirth: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        ClientCode: [
          { required: false, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        TemplateType: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        NameInsured: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ]
      },
      TemplateTypeID: 2,
      templateList: [],
      currentTemplateID: null,
      currentTemplate: null,
      currentTemplates: [],
      insuranceCompanyList: [],
      producerList: [],
      blockQuestions: [],
      properties: [],
      directionBlock: null
    }
  },
  mounted: function () {
    this.initTemplates()
    this.initInsuranceCompany()
    this.initProducers()
    // this.getMakerList()
  },
  watch: {
  },
  methods: {
    directReady: function (templateid) {
      if (templateid !== undefined) this.currentTemplateID = templateid
      this.changeTemplates()
      this.isDirecting = false
    },
    loadBlockQuestions: function () {
      this.isLoadingBlockQuestions = true
      this.axios.post('/api/Services/BaseService.asmx/GetBlockQuestionsByTemplate', {templateid: this.currentTemplateID}).then(res => {
        if (res) {
          console.log('BlockQuestions', res)
          this.blockQuestions = res.data
          if (!this.isLoading) this.matchAnswerBlockQuestion()
        }
        this.isLoadingBlockQuestions = false
      }).catch(err => {
        console.log('loadBlockQuestions出错', err)
        this.isLoadingBlockQuestions = false
      })
    },
    loadApplicationTemplate: function (templateid, start) {
      this.axios.post('/api/Services/CommerceService.asmx/GetNewApplicationTemplateShell', {templateid: templateid}).then(res => {
        if (res) {
          console.log('GetNewApplicationTemplateShell', res)
          let ctemplate = res.data
          this.applicationForm.applicationTemplate = ctemplate
          this.isAnswering = true
          this.isLoading = false
          // this.applicationForm.applicationTemplates.push(ctemplate)
          // this.currentTemplate.templateBlocks.forEach(tb => {
          // let start = tb.BlockID === this.currentTemplate.templateBlocks[0].BlockID
          // this.loadApplicationBlock(tb.TemplateBlockID, start)
          // })
        }
      }).catch(err => {
        console.log('GetNewApplicationTemplateShell列表出错', err)
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
    // 初始化保险公司列表
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorpsByBusinessLine', {lineid: 2}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          this.insuranceCompanyList = res.data.filter(c => c.BusinessLineID !== 1)
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // 初始化Producer列表
    initProducers: function () {
      this.isLoadingProducer = true
      this.axios.post('/api/Services/baseservice.asmx/GetProducers', {}).then(res => {
        if (res) {
          console.log('Producer列表', res)
          this.producerList = res.data
        }
        this.isLoadingProducer = false
      }).catch(err => {
        console.log('producer列表出错', err)
        this.isLoadingProducer = false
      })
    },
    // 重置Memo
    clearApplication: function () {
      this.isAnswering = false
      this.applicationForm.StatusID = 0
      this.applicationForm.applicationTemplate = null
      // this.currentTemplates = []
      this.totalQuestionNum = 1
    },
    // 选择EffectiveDate
    changeEffectiveDate: function (date) {
      // 获取变量值，用于之后回答时routing比对
      this.EffectiveDate = moment(date).format('YYYY-MM-DD')
    },
    // 选择保险公司
    changeInsuranceCompany: function () {
      if (this.isAnswering) this.clearApplication()
    },
    // 选择Templates
    changeTemplates: function () {
      if (this.isAnswering) this.clearApplication()
      this.currentTemplate = this.templateList.find(item => item.TemplateID === this.currentTemplateID)
      if (this.currentTemplate !== undefined) this.applicationForm.Title = this.currentTemplate.Title
    },
    // 开始回答
    beginToAnswer: function () {
      this.isLoading = true
      // this.loadBlockQuestions()
      this.loadApplicationTemplate(this.currentTemplateID)
    },
    checkOver: function () {
      if (this.applicationForm.applicationTemplate.StatusID === 1) this.applicationForm.StatusID = 1
      else this.applicationForm.StatusID = 0
    },
    // 提交
    submit: function (type) {
      this.$refs['applicationForm'].validate((valid) => {
        if (valid) {
          let application = JSON.parse(JSON.stringify(this.applicationForm))
          if (this.EffectiveDate !== null) application.EffectiveDate = this.EffectiveDate
          application.InsuranceTypeID = this.TemplateTypeID
          let sequenceno = 0
          let template = application.applicationTemplate
          template.blockQuestions = null
          template.templateBlocks = null
          template.SequenceNo = sequenceno
          sequenceno++
          template.applicationBlocks.forEach(block => {
            block.answers.forEach(answer => {
              answer.blockQuestion = null
              answer.QuestionDesc = ''
              if (answer.TypeID === 6) answer.optionAnswers = null
              else if (answer.TypeID === 7) {
                answer.optionAnswers = answer.optionAnswers.filter(oa => { return oa.IsChecked })
              }
            })
          })
          let value = JSON.stringify(application)
          if (type === 'save' || (type === 'finish')) {
            // console.log('提交问题', form)
            this.isLoading = true
            this.axios.post('/api/Services/CommerceService.asmx/SaveApplication', {application: value}).then(res => {
              if (res) {
                console.log('修改', res)
                this.$message({
                  type: 'success',
                  message: 'Operation Succeeded'
                })
                this.$refs['applicationForm'].resetFields()
                this.currentTemplates = []
                this.applicationFormVisible = false
                if (type === 'finish') {
                  // this.$store.state.ApplicationID = res.data.ApplicationID
                }
                this.$router.push({path: '/clMyApplications'})
              }
              this.isLoading = false
            }).catch(err => {
              console.log('保存出错', err)
              this.isLoading = false
            })
          } else {
            this.$message({
              type: 'warning',
              message: 'Please Answer All Questions'
            })
          }
        } else {
          this.$message({
            type: 'error',
            message: 'Format Error'
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
