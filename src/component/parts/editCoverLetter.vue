<template>
<div>
  <el-form :model="coverLetterForm" ref="coverLetterForm" class="newMemo" :rules="coverLetterFormRules">
    <el-row :gutter="20" class="title">
      <el-col :span="6">&#12288;</el-col>
      <el-col :span="12">
        <el-form-item prop="Title">
          <el-input v-model="coverLetterForm.Title" disabled placeholder="Title"></el-input>
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
        <el-form-item label="Name Insured" prop="NameInsured">
          <el-input v-model="coverLetterForm.NameInsured" placeholder="Name Insured"></el-input>
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
          <el-select v-model="coverLetterForm.InsuranceCorpID" placeholder="Insurance Company" no-data-text="No Record" filterable disabled>
            <el-option v-for="item in insuranceCompanyList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Premium on App" prop="PremiumOnApp">
          <el-input v-model="coverLetterForm.PremiumOnApp" type="number" placeholder="Premium on App" title="Premium on App"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
  <EditCoverLetterBody :coverLetter="coverLetterForm"></EditCoverLetterBody>
  <div class="newMemo-submit">
    <el-button icon="el-icon-check" type="primary" @click="submit('save')" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany">Save</el-button>
    <el-button icon="el-icon-check" type="primary" @click="submit('saveAndPrint')" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="coverLetterForm.StatusID === 1">Save & Print</el-button>
  </div>
</div>
</template>

<script>
import moment from 'moment'
import EditCoverLetterBody from '@/component/parts/editCoverLetterBody'

export default {
  components: {
    EditCoverLetterBody
  },
  name: 'editAutoCoverLetter',
  data: function () {
    return {
      printDate: null,
      isLoading: false,
      loadingCount: 0,
      blockCount: 0,
      isLoadingTemplates: false,
      isLoadingInsuranceCompany: false,
      isLoadingBlockQuestions: false,
      insuranceCompanyList: [],
      templatesList: [],
      currentTemplates: [],
      blockQuestions: [],
      coverLetterForm: {
        CoverLetterID: null,
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        ClientCode: null,
        StatusID: 0,
        RequestDate: moment(new Date()),
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        PremiumOnApp: null,
        Templates: null
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
        Templates: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        PremiumOnApp: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ]
      }
    }
  },
  props: {
    coverletterid: {
      type: Number
    },
    insuranceCorps: {
      type: Array
    },
    coverLetterFormVisible: {type: Boolean}
  },
  mounted: function () {
    this.loadCoverLetter(this.coverletterid)
  },
  methods: {
    loadBlockQuestions: function (id) {
      this.isLoadingBlockQuestions = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetBlockQuestionsByCoverLetter', {coverletterid: id}).then(res => {
        if (res) {
          console.log('loadBlockQuestions', res)
          this.blockQuestions = res.data
          // if (!this.isLoading) this.matchAnswerBlockQuestion()
        }
        this.isLoadingBlockQuestions = false
      }).catch(err => {
        console.log('loadBlockQuestions error', err)
        this.isLoadingBlockQuestions = false
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
    loadCoverLetterBlock: function (ct, cbid, index) {
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetterBlock', {coverletterblockid: cbid}).then(res => {
        if (res) {
          console.log('loadCoverLetterBlock', res)
          ct.coverLetterBlocks[index] = res.data
          this.loadingCount++
          if (this.blockCount === this.loadingCount) this.isLoading = false
          else this.isLoading = true
          if (!this.isLoading) this.matchAnswerBlockQuestion()
        }
      }).catch(err => {
        console.log('loadCoverLetterTemplate', err)
      })
    },
    loadCoverLetter: function (id) {
      this.loadBlockQuestions(id)
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.initTemplates()
      this.initInsuranceCompany()
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetterFrame', {coverletterid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.coverLetterForm = res.data
          this.loadingCount = 0
          this.coverLetterForm.coverLetterTemplates.forEach(ct => {
            this.blockCount += ct.coverLetterBlocks.length
            let index = -1
            ct.coverLetterBlocks.forEach(cb => {
              index++
              return this.loadCoverLetterBlock(ct, cb.CoverLetterBlockID, index)
            })
          })
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.coverLetterForm.InsuranceCorp = this.insuranceCorps.find(item => item.InsuranceCorpID === res.data.InsuranceCorpID).Name
            this.coverLetterForm.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
            this.coverLetterForm.RequestDate = moment(res.data.RequestDate).format('YYYY-MM-DD')
            this.coverLetterForm.UWDate = moment(res.data.UWDate).format('YYYY-MM-DD')
            // this.matchAnswerBlockQuestion()
            // this.coverLetterForm.Templates = res.data.coverLetterTemplates.map(item => { return item.TemplateID })
            // this.changeTemplates(this.coverLetterForm.Templates, 'Answer')
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    // 关闭Pink Slip
    close: function (done) {
      this.viewForm = {
        CoverLetterID: null,
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        ClientCode: null,
        StatusID: 0,
        RequestDate: moment(new Date()),
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        Templates: null
      }
      done()
    },
    // Templates列表
    initTemplates: function () {
      this.isLoadingTemplates = true
      this.axios.post('/api/Services/NewBusinessService.asmx/SearchTemplates', {query: ''}).then(res => {
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
    // 选择EffectiveDate
    changeEffectiveDate: function (date) {
      // 获取变量值，用于之后回答时routing比对
      this.EffectiveDate = moment(date).format('YYYY-MM-DD')
    },
    // 提交
    submit: function (type) {
      this.$refs['coverLetterForm'].validate((valid) => {
        if (valid) {
          let coverletter = JSON.parse(JSON.stringify(this.coverLetterForm))
          coverletter.PremiumOnApp = parseInt(coverletter.PremiumOnApp)
          coverletter.coverLetterTemplates.forEach(template => {
            template.coverLetterBlocks.forEach(block => {
              block.answers.forEach(answer => {
                answer.blockQuestion = null
                answer.QuestionDesc = ''
                if (answer.TypeID === 6) answer.optionAnswers = answer.optionAnswers.filter(oa => { return oa.IsChecked })
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
                this.AnsweredArr = []
                this.totalQuestionNum = 1
                let coverLetterId = res.data.CoverLetterID
                // this.EffectiveDate = null
                // this.AutoBindingAuthority = null
                // this.PropertyBindingAuthority = null
                // this.coverLetterFormVisible = false
                this.$emit('close', coverLetterId, type)
                if (type === 'saveAndPrint') {
                  // this.showCoverLetter(res.data.CoverLetterID)
                  // this.view(res.data.CoverLetterID)
                }
              }
              this.isLoading = false
            }).catch(err => {
              console.log('修改出错', err)
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
