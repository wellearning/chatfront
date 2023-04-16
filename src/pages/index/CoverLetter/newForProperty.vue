<template>
  <div v-loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" element-loading-background="rgba(0, 0, 0, 0)">
    <el-form :model="coverLetterForm" ref="coverLetterForm" class="newMemo" :rules="coverLetterFormRules">
      <el-row :gutter="20" class="title">
        <el-col :span="6">&#12288;</el-col>
        <el-col :span="12">
          <el-form-item prop="Title">
            <el-input v-model="coverLetterForm.Title" placeholder="Title" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">&#12288;</el-col>
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-col :span="12">
          <el-form-item label="Client Code" prop="ClientCode">
            <el-input v-model="coverLetterForm.ClientCode" placeholder="Client Code"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Named Insured(s)" prop="NameInsured">
            <el-input v-model="coverLetterForm.NameInsured" placeholder="Last Name, First Name" title="Last Name, First Name"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-col :span="12">
          <el-form-item label="Effective Date" prop="EffectiveDate">
            <el-date-picker v-model="coverLetterForm.EffectiveDate" type="date" placeholder="yyyy-mm-dd" @change="changeEffectiveDate(coverLetterForm.EffectiveDate)"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Insurance Company" prop="InsuranceCorpID">
            <el-select v-model="coverLetterForm.InsuranceCorpID" placeholder="Insurance Company" no-data-text="No Record" filterable @change="changeInsuranceCompany()">
              <el-option v-for="item in insuranceCompanyList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-col :span="12">
          <el-form-item label="Cover Letter Type" prop="Templates">
            <el-select v-model="currentTemplateID" placeholder="Cover Letter Type" no-data-text="No Record" filterable :disabled="coverLetterForm.InsuranceCorpID === null || coverLetterForm.ClientCode === null" @change="changeTemplates()">
              <el-option v-for="item in templatesList" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Producer" prop="ProducerID">
            <el-select v-model="coverLetterForm.ProducerID" placeholder="Producer" no-data-text="No Record" filterable>
              <el-option v-for="item in producerList" :key="item.StaffID" :label="item.Name" :value="item.StaffID"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-col :span="12">
          <el-form-item label="AppPremium" prop="PremiumOnApp">
            <el-input v-model="coverLetterForm.PremiumOnApp" type="number" placeholder="App Premium" title="AppPremium"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="newMemo-submit">
      <el-button icon="el-icon-check" type="primary" @click="beginToAnswer()" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="!isAnswering" :disabled="currentTemplateID === null">Start</el-button>
    </div>
    <EditCoverLetterBody v-if="isAnswering" :coverLetter="coverLetterForm"></EditCoverLetterBody>
    <div class="newMemo-submit">
      <el-button icon="el-icon-check" type="primary" @click="submit('save')" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="isAnswering">Save</el-button>
      <el-button icon="el-icon-check" type="primary" @click="submit('saveAndPrint')" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="isAnswering && coverLetterForm.StatusID === 1">Save & Print</el-button>
    </div>
  </div>
</template>

<script>
import EditCoverLetterBody from '@/component/parts/editCoverLetterBody'
import moment from 'moment'

export default {
  components: {
    EditCoverLetterBody
  },
  data: function () {
    return {
      EffectiveDate: null,
      isAnswering: false,
      isLoading: false,
      isLoadingTemplates: false,
      isLoadingInsuranceCompany: false,
      isLoadingProducer: false,
      isLoadingMakers: false,
      isLoadingBlockQuestions: false,
      coverLetterForm: {
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        ClientCode: null,
        StatusID: 0,
        ProducerID: JSON.parse(this.$store.getters.getAccount).StaffID,
        RequestDate: moment(new Date()),
        NameInsured: null,
        PremiumOnApp: null,
        TemplateType: null,
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        Author: JSON.parse(this.$store.getters.getAccount).Name,
        corp: null,
        coverLetterTemplates: []
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
        TemplateType: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        NameInsured: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ],
        PremiumOnApp: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ]
      },
      TemplateTypeID: 2,
      templatesList: [],
      currentTemplateID: null,
      currentTemplate: null,
      currentTemplates: [],
      insuranceCompanyList: [],
      producerList: [],
      blockQuestions: []
    }
  },
  mounted: function () {
    this.initTemplates(2)
    this.initInsuranceCompany()
    this.initProducers()
    // this.getMakerList()
  },
  watch: {
  },
  methods: {
    loadBlockQuestions: function () {
      this.isLoadingBlockQuestions = true
      // let value = JSON.stringify(this.currentTemplates)
      this.axios.post('/api/Services/NewBusinessService.asmx/GetBlockQuestionsByTemplate', {templateid: this.currentTemplateID}).then(res => {
        if (res) {
          console.log('NewCoverLetterTemplates', res)
          this.blockQuestions = res.data
          if (!this.isLoading) this.matchAnswerBlockQuestion()
        }
        this.isLoadingBlockQuestions = false
      }).catch(err => {
        console.log('Templates列表出错', err)
        this.isLoadingBlockQuestions = false
      })
    },
    loadCoverLetterTemplate: function (templateid, start) {
      this.axios.post('/api/Services/NewBusinessService.asmx/GetNewCoverLetterTemplateShell', {templateid: templateid}).then(res => {
        if (res) {
          console.log('NewCoverLetterTemplates', res)
          let ctemplate = res.data
          this.coverLetterForm.coverLetterTemplates.push(ctemplate)
          this.currentTemplate.templateBlocks.forEach(tb => {
            let start = tb.BlockID === this.currentTemplate.templateBlocks[0].BlockID
            this.loadCoverLetterBlock(tb.TemplateBlockID, start)
          })
        }
        /*
        if (this.coverLetterForm.coverLetterTemplates.length === this.currentTemplates.length) {
          this.isLoading = false
          this.isAnswering = true
          if (!this.isLoadingBlockQuestions) this.matchAnswerBlockQuestion()
        }
        */
      }).catch(err => {
        console.log('Templates列表出错', err)
        this.isLoading = false
      })
    },
    loadCoverLetterBlock: function (templateblockid, start) {
      this.axios.post('/api/Services/NewBusinessService.asmx/GetNewCoverLetterBlock', {templateblockid: templateblockid, start: start}).then(res => {
        if (res) {
          console.log('NewCoverLetterTemplates', res)
          let ctemplate = this.coverLetterForm.coverLetterTemplates[0]
          let cblock = res.data
          ctemplate.coverLetterBlocks.push(cblock)
          if (ctemplate.coverLetterBlocks.length === this.currentTemplate.templateBlocks.length) {
            ctemplate.coverLetterBlocks = ctemplate.coverLetterBlocks.sort((a, b) => { return a.SequenceNo - b.SequenceNo })
            if (!this.isLoadingBlockQuestions) this.matchAnswerBlockQuestion()
            this.isLoading = false
            this.isAnswering = true
          }
        }
        if (this.coverLetterForm.coverLetterTemplates.length === this.currentTemplates.length) {
          this.isLoading = false
          this.isAnswering = true
          if (!this.isLoadingBlockQuestions) this.matchAnswerBlockQuestion()
        }
      }).catch(err => {
        console.log('Templates列表出错', err)
        this.isLoading = false
      })
    },
    matchAnswerBlockQuestion: function () {
      this.coverLetterForm.coverLetterTemplates.forEach(ct => {
        ct.coverLetterBlocks.forEach(cb => {
          cb.answers.forEach(a => {
            if (a.IsRoute) {
              a.blockQuestion = this.blockQuestions.find(bq => bq.BlockQuestionID === a.BlockQuestionID)
            }
          })
        })
      })
    },
    // Templates列表
    initTemplates: function (typeid) {
      this.isLoadingTemplates = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetTemplatesByType', {typeid: typeid}).then(res => {
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
    // 初始化保险公司列表
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorpsByBusinessLine', {lineid: 1}).then(res => {
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
    clearMemo: function () {
      this.isAnswering = false
      this.coverLetterForm.StatusID = 0
      this.coverLetterForm.coverLetterTemplates = []
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
      if (this.isAnswering) this.clearMemo()
    },
    // 选择Templates
    changeTemplates: function () {
      // this.clearMemo()
      /*
      if (this.currentTemplates.length === 1) {
        let template = this.templatesList.find(item => item.TemplateID === this.currentTemplates[0])
        this.coverLetterForm.Title = template.Title
      } else {
        this.coverLetterForm.Title = 'Multiple Changes'
      }
      */
      if (this.isAnswering) this.clearMemo()
      this.currentTemplate = this.templatesList.find(item => item.TemplateID === this.currentTemplateID)
      this.coverLetterForm.Title = this.currentTemplate.Title
    },
    // 开始回答
    beginToAnswer: function () {
      this.isLoading = true
      this.loadBlockQuestions()
      this.loadCoverLetterTemplate(this.currentTemplateID)
      /*
      this.currentTemplates.forEach(id => {
        let start = (id === this.currentTemplates[0])
        this.loadCoverLetterTemplate(id, start)
      })
      */
    },
    // 提交
    submit: function (type) {
      this.$refs['coverLetterForm'].validate((valid) => {
        if (valid) {
          let coverletter = JSON.parse(JSON.stringify(this.coverLetterForm))
          coverletter.InsuranceTypeID = this.TemplateTypeID
          let sequenceno = 0
          coverletter.coverLetterTemplates.forEach(template => {
            template.SequenceNo = sequenceno
            sequenceno++
            template.coverLetterBlocks.forEach(block => {
              block.answers.forEach(answer => {
                answer.blockQuestion = null
                answer.QuestionDesc = ''
                if (answer.TypeID === 6) answer.optionAnswers = null
                else if (answer.TypeID === 7) {
                  answer.optionAnswers = answer.optionAnswers.filter(oa => { return oa.IsChecked })
                }
              })
            })
          })
          let value = JSON.stringify(coverletter)
          if (type === 'save' || (type === 'saveAndPrint')) {
            // console.log('提交问题', form)
            this.isLoading = true
            this.axios.post('/api/Services/NewBusinessService.asmx/SaveCoverLetter', {coverLetter: value}).then(res => {
              if (res) {
                console.log('修改', res)
                this.$message({
                  type: 'success',
                  message: 'Operation Succeeded'
                })
                this.$refs['coverLetterForm'].resetFields()
                this.currentTemplates = []
                this.coverLetterFormVisible = false
                if (type === 'saveAndPrint') {
                  this.$store.state.CoverLetterID = res.data.CoverLetterID
                  // this.showCoverLetter(res.data.CoverLetterID)
                  // this.view(res.data.CoverLetterID)
                }
                this.$router.push({path: '/myCoverLetters'})
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
