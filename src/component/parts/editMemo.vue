<template>
<div>
  <el-form :model="memoForm" ref="memoForm" class="newMemo" :rules="memoFormRules">
    <el-row :gutter="20" class="title">
      <el-col :span="6">&#12288;</el-col>
      <el-col :span="12">
        <el-form-item prop="Title">
          <el-input v-model="memoForm.Title" placeholder="Title"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">&#12288;</el-col>
    </el-row>
    <el-row :gutter="20" class="subtitle">
      <el-col :span="12">
        <el-form-item label="Effective Date" prop="EffectiveDate">
          <el-date-picker v-model="memoForm.EffectiveDate" type="date" placeholder="yyyy-mm-dd" @change="changeEffectiveDate(memoForm.EffectiveDate)"></el-date-picker>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Insurance Company" prop="InsuranceCorpID">
          <el-select v-model="memoForm.InsuranceCorpID" placeholder="Insurance Company" no-data-text="No Record" filterable disabled>
            <el-option v-for="item in insuranceCorps" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="subtitle">
      <el-col :span="12">
        <el-form-item label="Policy Number" prop="PolicyNumber">
          <el-input v-model="memoForm.PolicyNumber" placeholder="Policy Number"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Policy Change Type" prop="Templates">
          <el-select v-model="memoForm.Templates" placeholder="Policy Change Type" no-data-text="No Record" filterable multiple collapse-tags disabled>
            <el-option v-for="item in templateList" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
  <EditMemoBody :memo="memoForm" :insuranceCorps="insuranceCorps" :disabled="false"></EditMemoBody>
  <div v-if="isAnswering" class="newMemo-submit">
    <el-button icon="el-icon-check" type="primary" @click="submit('save')" :loading="isLoading || isLoadingTemplates">Save</el-button>
    <el-button icon="el-icon-check" type="primary" @click="submit('saveAndPrint')" :loading="isLoading || isLoadingTemplates" v-if="memoForm.StatusID === 1">Save & Print</el-button>
  </div>
</div>
</template>

<script>
import moment from 'moment'
import EditMemoBody from '@/component/parts/editMemoBody'

export default {
  components: {
    EditMemoBody
  },
  name: 'editMemo',
  data: function () {
    return {
      printDate: null,
      isLoading: false,
      loadingCount: 0,
      isLoadingTemplates: false,
      isLoadingBlockQuestions: false,
      isLoadingChoiceOptions: false,
      isLoadingProducer: false,
      insuranceCompanyList: [],
      // templatesList: [],
      currentTemplates: [],
      blockQuestions: [],
      choiceOptions: [],
      producerList: [],
      isAnswering: false,
      memoForm: {
        MemoID: null,
        Title: '',
        EffectiveDate: null,
        InsuranceCorpID: null,
        ClientCode: null,
        StatusID: 0,
        RequestDate: moment(new Date()),
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        ProducerID: 0,
        PremiumOnApp: null,
        Templates: null
      },
      memoFormRules: {
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
    memoid: {
      type: Number
    },
    insuranceCorps: {
      type: Array
    },
    templateList: {
      type: Array
    },
    memoFormVisible: {type: Boolean}
  },
  mounted: function () {
    this.loadMemo(this.memoid)
  },
  methods: {
    loadBlockQuestions: function (id) {
      this.isLoadingBlockQuestions = true
      this.axios.post('/api/Services/MemoService.asmx/GetBlockQuestionsByMemo', {memoid: id}).then(res => {
        if (res) {
          console.log('GetBlockQuestionsByMemo', res)
          this.blockQuestions = res.data
          // if (!this.isLoading) this.matchAnswerBlockQuestion()
        }
        this.isLoadingBlockQuestions = false
      }).catch(err => {
        console.log('GetBlockQuestionsByMemo列表出错', err)
        this.isLoadingBlockQuestions = false
      })
    },
    loadChoiceOptions: function (id) {
      this.isLoadingChoiceOptions = true
      this.axios.post('/api/Services/BaseService.asmx/GetChoiceOptionsByTemplate', {templateid: id}).then(res => {
        if (res) {
          console.log('GetChoiceOptionsByTemplate', res)
          this.choiceOptions = res.data
          // if (!this.isLoading) this.matchAnswerBlockQuestion()
        }
        this.isLoadingChoiceOptions = false
      }).catch(err => {
        console.log('GetChoiceOptionsByTemplate出错', err)
        this.isLoadingBlockQuestions = false
      })
    },
    matchAnswerBlockQuestion: function () {
      this.memoForm.memoTemplates.forEach(ct => {
        ct.memoBlocks.forEach(cb => {
          cb.answers.forEach(a => {
            /*
            if (a.TypeID === 6) {
              a.optionAnswers = []
              let options = this.choiceOptions.filter(co => co.QuestionID === a.QuestionID)
              options.forEach(co => {
                let oa = Object()
                oa.Content = co.Content
                oa.NeedAddition = co.NeedAddition
                oa.Tips = co.Tips
                oa.SequenceNo = co.SequenceNo
                oa.ChoiceOptionID = co.ChoiceOptionID
                oa.QuestionID = co.QuestionID
                if (a.checkvalue === oa.ChoiceOptionID) oa.IsChecked = true
                a.optionAnswers.push(oa)
              })
            }
            */
            a.blockQuestion = this.blockQuestions.find(bq => bq.BlockQuestionID === a.BlockQuestionID)
            if (a.blockQuestion !== undefined) {
              a.IsRoute = a.blockQuestion.IsRoute
            }
          })
        })
      })
      console.log('memoForm', this.memoForm)
      this.isAnswering = true
      if (this.$refs.memobody !== undefined) {
        this.$refs.memobody.setMemo(this.memoForm)
      }
    },
    loadMemoTemplate: function (ct, startFlag) {
      this.axios.post('/api/Services/MemoService.asmx/GetMemoTemplate', {memotemplateid: ct.MemoTemplateID, start: startFlag}).then(res => {
        if (res) {
          console.log('GetMemoTemplate', res)
          ct.memoBlocks = res.data.memoBlocks
          this.loadingCount++
          if (this.memoForm.memoTemplates.length === this.loadingCount) this.isLoading = false
          else this.isLoading = true
          if (!this.isLoading) this.matchAnswerBlockQuestion()
        }
      }).catch(err => {
        console.log('GetMemoTemplate', err)
      })
    },
    loadMemo: function (id) {
      this.loadBlockQuestions(id)
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      // this.initTemplates()
      // this.initInsuranceCompany()
      this.axios.post('/api/Services/MemoService.asmx/GetMemoFrame', {memoid: id}).then(res => {
        if (res) {
          console.log('MemoFrame', res)
          this.memoForm = res.data
          this.memoForm.Templates = []
          let effdate = moment(res.data.EffectiveDate)
          this.memoForm.EffectiveDate = effdate
          this.loadingCount = 0
          let startFlag = true
          this.memoForm.memoTemplates.forEach(ct => {
            this.memoForm.Templates.push(ct.TemplateID)
            this.loadChoiceOptions(ct.TemplateID)
            this.loadMemoTemplate(ct, startFlag)
            startFlag = false
          })
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.memoForm.InsuranceCorp = this.insuranceCorps.find(item => item.InsuranceCorpID === res.data.InsuranceCorpID).Name
            // this.memoForm.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
            this.memoForm.RequestDate = moment(res.data.RequestDate).format('YYYY-MM-DD')
            // this.matchAnswerBlockQuestion()
            // this.memoForm.Templates = res.data.memoTemplates.map(item => { return item.TemplateID })
            // this.changeTemplates(this.memoForm.Templates, 'Answer')
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('MemoFrame', err)
        this.isLoading = false
      })
    },
    // 关闭Pink Slip
    close: function (done) {
      this.viewForm = {
        MemoID: null,
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
    // 选择EffectiveDate
    changeEffectiveDate: function (date) {
      // 获取变量值，用于之后回答时routing比对
      this.EffectiveDate = moment(date).format('YYYY-MM-DD')
    },
    // 提交
    submit: function (type) {
      this.$refs['memoForm'].validate((valid) => {
        if (valid) {
          let memo = JSON.parse(JSON.stringify(this.memoForm))
          console.log('submit memo:', memo)
          memo.memoTemplates.forEach(template => {
            template.memoBlocks.forEach(block => {
              block.answers = block.answers.filter(a => a.StatusID === 1)
              block.answers.forEach(answer => {
                answer.blockQuestion = null
                // answer.QuestionDesc = ''
                if (answer.TypeID < 3) answer.AnswerDesc = ''
                if (answer.TypeID === 5) {
                  let parts = answer.partAnswers.filter(p => p.IsFillin)
                  let fillins = parts.map(p => p.Part)
                  let answers = fillins.join('|')
                  answer.AnswerDesc = answers
                } else if (answer.TypeID === 6) {
                  let optionAnswer = answer.optionAnswers.find(oa => { return oa.IsChecked })
                  if (optionAnswer !== undefined) {
                    answer.AnswerDesc = optionAnswer.ChoiceOptionID + '::' + optionAnswer.Content
                    answer.Addition = optionAnswer.Addition
                    answer.Outputs = optionAnswer.Outputs
                  }
                  answer.optionAnswers = null
                } else if (answer.TypeID === 7) {
                  let optionAnswers = answer.optionAnswers.filter(oa => { return oa.IsChecked })
                  let answerDesc = ''
                  let addition = ''
                  let Outputs = ''
                  optionAnswers.forEach(function (optionAnswer) {
                    answerDesc += '|' + optionAnswer.ChoiceOptionID + '::' + optionAnswer.Content
                    if (optionAnswer.NeedAddition) {
                      addition += '|' + (optionAnswer.Addition === null ? '' : optionAnswer.Addition)
                    }
                    Outputs += '|' + (optionAnswer.Outputs === null ? '' : optionAnswer.Outputs)
                  })
                  if (optionAnswers.length > 0) {
                    answer.AnswerDesc = answerDesc.substring(1)
                    answer.Outputs = Outputs.substring(1)
                  }
                  if (addition.length > 0) answer.Addition = addition.substring(1)
                  else answer.Addition = ''
                }
              })
            })
          })
          // console.log('submit memo:', memo)
          if (type === 'save' || (type === 'saveAndPrint')) {
            let value = JSON.stringify(memo)
            console.log('SaveMemo', memo)
            this.isLoading = true
            this.axios.post('/api/Services/MemoService.asmx/SaveMemo', {memo: value}).then(res => {
              if (res) {
                console.log('修改', res)
                this.$message({
                  type: 'success',
                  message: 'Operation Succeeded'
                })
                this.$refs['memoForm'].resetFields()
                this.currentTemplates = []
                this.AnsweredArr = []
                this.totalQuestionNum = 1
                // this.EffectiveDate = null
                // this.AutoBindingAuthority = null
                // this.PropertyBindingAuthority = null
                // this.memoFormVisible = false
                this.$emit('close', res.data.MemoID, type)
                if (type === 'saveAndPrint') {
                  // this.showMemo(res.data.MemoID)
                  // this.view(res.data.MemoID)
                }
              }
              this.isLoading = false
              // this.memoForm = null
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
