<!--
FileName: CoverLetter/newForAuto.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Create new auto cover letter.
-->
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
          <el-form-item label="Producer" prop="ProducerID">
            <el-select v-model="coverLetterForm.ProducerID" placeholder="Producer" no-data-text="No Record" filterable>
              <el-option v-for="item in producerList" :key="item.StaffID" :label="item.Name" :value="item.StaffID"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="AppPremium" prop="PremiumOnApp">
            <el-input v-model="coverLetterForm.PremiumOnApp" type="number" prefix-icon="$" placeholder="App Premium" title="AppPremium"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="newMemo-submit">
      <el-button icon="el-icon-check" type="primary" @click="beginToAnswer()" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="!isAnswering">Start</el-button>
    </div>
    <EditCoverLetterBody ref="enbp" v-if="isAnswering" :coverLetter="coverLetterForm"></EditCoverLetterBody>
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
      btypeId: 2,
      EffectiveDate: null,
      isAnswering: false,
      isLoading: false,
      isLoadingTemplates: false,
      isLoadingInsuranceCompany: false,
      isLoadingProducer: false,
      isLoadingMakers: false,
      saveBlockIndex: 0,
      saveBlockCount: 0,
      coverLetterForm: {
        BusinessTypeID: 2,
        InsuranceTypeID: 1,
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        ClientCode: null,
        StatusID: 0,
        RequestDate: moment(new Date()),
        NameInsured: null,
        PremiumOnApp: null,
        ProducerID: JSON.parse(this.$store.getters.getAccount).StaffID,
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
        Templates: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        NameInsured: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ],
        PremiumOnApp: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ]
      },
      TemplateTypeID: 1,
      templatesList: [],
      currentTemplates: [],
      insuranceCompanyList: [],
      producerList: [],
      blockQuestions: []
    }
  },
  mounted: function () {
    let id = this.$route.params.id === undefined ? 2 : this.$route.params.id
    if (id !== undefined) {
      this.btypeId = id
      this.coverLetterForm.BusinessTypeID = parseInt(id)
    }
    this.initTemplates(1)
    this.initInsuranceCompany()
    this.initProducers()
    // this.getMakerList()
  },
  watch: {
  },
  methods: {
    loadBlockQuestions: function () {
      this.isLoadingBlockQuestions = true
      let ids = []
      this.currentTemplates.forEach(ct => { ids.push(ct.TemplateID) })
      let value = JSON.stringify(ids)
      this.axios.post('/api/Services/NewBusinessService.asmx/GetBlockQuestionsByTemplates', {templateids: value}).then(res => {
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
      this.axios.post('/api/Services/NewBusinessService.asmx/GetNewCoverLetterTemplate', {templateid: templateid, start: start}).then(res => {
        if (res) {
          console.log('NewCoverLetterTemplates', res)
          let ctemplate = res.data
          this.coverLetterForm.coverLetterTemplates.push(ctemplate)
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
      this.axios.post('/api/Services/BaseService.asmx/GetTemplatesByType', {typeid: typeid, btypeid: this.btypeId}).then(res => {
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
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorpsByBusinessLine', {lineid: 1}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          this.insuranceCompanyList = res.data.filter(c => c.BusinessLineID !== 2)
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
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
      this.currentTemplates = []
      this.totalQuestionNum = 1
    },
    // 选择EffectiveDate
    changeEffectiveDate: function (date) {
      // 获取变量值，用于之后回答时routing比对
      this.EffectiveDate = moment(date).format('YYYY-MM-DD')
    },
    // 选择保险公司
    changeInsuranceCompany: function () {
      let producer = this.producerList.find(p => p.StaffID === this.coverLetterForm.ProducerID)
      this.coverLetterForm.coverLetterTemplates = []
      this.currentTemplates = this.templatesList.filter(item => (item.ProducerLevel === 0 || item.ProducerLevel === producer.ProducerLevel) && item.InsuranceCorpID === this.coverLetterForm.InsuranceCorpID)
      if (this.currentTemplates.length === 0) {
        // find it's parent corp template
        let corp = this.insuranceCompanyList.find(c => c.InsuranceCorpID === this.coverLetterForm.InsuranceCorpID)
        if (corp.ParentID > 0) {
          this.currentTemplates = this.templatesList.filter(item => (item.ProducerLevel === 0 || item.ProducerLevel === producer.ProducerLevel) && item.InsuranceCorpID === corp.ParentID)
        }
      }
      if (this.currentTemplates.length === 1) {
        this.coverLetterForm.Title = this.currentTemplates[0].Title
      } else if (this.currentTemplates.length === 0) {
        this.coverLetterForm.Title = ''
      } else {
        let tList = this.currentTemplates.filter(item => item.ProducerLevel === 0)
        if (tList.length > 1) {
          this.currentTemplates = tList
        }
        this.coverLetterForm.Title = this.currentTemplates[0].Title // 'Multiple Changes'
      }
      if (this.isAnswering) this.isAnswering = false
    },
    // 选择Templates
    changeTemplates: function () {
      // this.clearMemo()
    },
    // 开始回答
    beginToAnswer: function () {
      if (this.currentTemplates.length === 0) {
        this.$message({
          type: 'warning',
          message: 'No template available'
        })
        return
      }
      this.isLoading = true
      this.loadBlockQuestions()
      this.currentTemplates.forEach(ct => {
        let start = (ct.TemplateID === this.currentTemplates[0].TemplateID)
        this.loadCoverLetterTemplate(ct.TemplateID, start)
      })
      /*
      let ids = []
      this.currentTemplates.forEach(t => { ids.push(t.TemplateID) })
      let value = JSON.stringify(ids)
      this.axios.post('/api/Services/NewBusinessService.asmx/GetNewCoverLetterTemplates', {templateids: value}).then(res => {
        if (res) {
          console.log('NewCoverLetterTemplates', res)
          this.coverLetterForm.coverLetterTemplates = res.data
        }
        this.isLoading = false
        this.isAnswering = true
      }).catch(err => {
        console.log('Templates列表出错', err)
        this.isLoading = false
      })
      */
    },
    // 提交
    submit: function (type) {
      this.$refs['coverLetterForm'].validate((valid) => {
        if (valid) {
          let coverletter = JSON.parse(JSON.stringify(this.coverLetterForm))
          coverletter.PremiumOnApp = parseInt(coverletter.PremiumOnApp)
          coverletter.InsuranceTypeID = this.TemplateTypeID
          let blockCounts = 0
          let cblocks = []
          coverletter.coverLetterTemplates.forEach(template => {
            blockCounts += template.coverLetterBlocks.length
            template.coverLetterBlocks.forEach(block => {
              block.answers.forEach(answer => {
                answer.blockQuestion = null
              })
              cblocks.push(block)
            })
            template.coverLetterBlocks = null
          })
          let id = parseInt(this.btypeId)
          let value = JSON.stringify(coverletter)
          if (type === 'save' || (type === 'saveAndPrint')) {
            // console.log('提交问题', form)
            this.saveBlockIndex = 0
            this.saveBlockCount = blockCounts
            this.isLoading = true
            this.axios.post('/api/Services/NewBusinessService.asmx/SaveCoverLetter', {coverLetter: value}).then(res => {
              if (res) {
                console.log('修改', res)
                cblocks.forEach(cBlock => {
                  cBlock.CoverLetterTemplateID = res.data.coverLetterTemplates[0].CoverLetterTemplateID
                  this.saveCoverLetterBlock(cBlock)
                })

                this.$refs['coverLetterForm'].resetFields()
                this.currentTemplates = []
                this.coverLetterFormVisible = false
                if (type === 'saveAndPrint') {
                  this.$store.state.CoverLetterID = res.data.CoverLetterID
                  // this.showCoverLetter(res.data.CoverLetterID)
                  // this.view(res.data.CoverLetterID)
                }
                if (id === 2) {
                  this.$router.push({path: '/myCoverLetters'})
                } else if (id === 9) {
                  this.$router.push({path: '/myIrcaCoverLetters/9'})
                }
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
    },
    saveCoverLetterBlock: function (cblock) {
      let value = JSON.stringify(cblock)
      console.log('SaveCoverLetterBlock', cblock)
      this.axios.post('/api/Services/NewBusinessService.asmx/SaveCoverLetterBlock', {coverletterblock: value}).then(res => {
        if (res) {
          console.log('SaveCoverLetterBlock', res)
        }
        this.saveBlockIndex++
        if (this.saveBlockIndex === this.saveBlockCount) {
          this.isLoading = false
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
        }
      }).catch(err => {
        console.log('修改出错', err)
        this.$message({
          type: 'error',
          message: 'Operation failed'
        })
        this.isLoading = false
      })
    }

  }
}
</script>

<style scoped>

</style>
