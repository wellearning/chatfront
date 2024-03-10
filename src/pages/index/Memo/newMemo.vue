<!--
FileName: Memo/newMemos.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Create new personal line memo.
-->
<template>
  <div v-loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" element-loading-background="rgba(0, 0, 0, 0)">
    <el-form :model="memoForm" ref="memoForm" class="newMemo" :rules="memoFormRules">
      <el-row :gutter="20" class="title">
        <el-col :span="6">&#12288;</el-col>
        <el-col :span="12">
          <el-form-item prop="Title">
            <el-input v-model="memoForm.Title" placeholder="Title" disabled></el-input>
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
          <el-form-item label="Request Date" prop="RequestDate">
            <el-date-picker v-model="memoForm.RequestDate" type="date" placeholder="yyyy-mm-dd" disabled></el-date-picker>
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
          <el-form-item label="Named Insured(s)" prop="NameInsured">
            <el-input v-model="memoForm.NameInsured" placeholder="Last Name, First Name" title="Last Name, First Name"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-col :span="12">
          <el-form-item label="Insurance Company" prop="InsuranceCorpID">
            <el-select v-model="memoForm.InsuranceCorpID" placeholder="Insurance Company" no-data-text="No Record" filterable @change="changeInsuranceCompany()">
              <el-option v-for="item in insuranceCompanyList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!--<el-col :span="12">
          <el-form-item label="Address Insured(s)" prop="AddressInsured">
            <el-input v-model="memoForm.AddressInsured" placeholder="Address Insured(s)"></el-input>
          </el-form-item>
        </el-col>-->
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-col :span="12">
          <el-form-item label="Category" prop="TemplateType">
            <el-select v-model="memoForm.TemplateType" placeholder="Category" no-data-text="No Record" filterable @change="changeTemplateType(memoForm.TemplateType)">
              <el-option v-for="item in typeIdList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Policy Change Type" prop="Templates">
            <el-select v-model="memoForm.TemplateID" placeholder="Policy Change Type" no-data-text="No Record" filterable :disabled="memoForm.InsuranceCorpID === null || memoForm.TemplateType === null" @change="changeTemplates()">
              <el-option v-for="item in templatesList" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="newMemo-submit">
      <el-button icon="el-icon-check" type="primary" @click="beginToAnswer()" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="!isAnswering">Start</el-button>
    </div>
    <EditMemoBody v-if="isAnswering" :memo="memoForm" :insuranceCorps="insuranceCompanyList"></EditMemoBody>
    <div class="newMemo-submit">
      <el-button icon="el-icon-check" type="primary" @click="submit('save')" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="isAnswering">Save</el-button>
      <el-button icon="el-icon-check" type="primary" @click="submit('saveAndPrint')" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="isAnswering && memoForm.StatusID === 1">Save & Print</el-button>
    </div>
  </div>
</template>

<script>
import EditMemoBody from '@/component/parts/editMemoBody'
import moment from 'moment'

export default {
  components: {
    EditMemoBody
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
      // curQuestionNum: 0,
      totalQuestionNum: 1,
      isLoading: false,
      isLoadingTemplates: false,
      isLoadingInsuranceCompany: false,
      isLoadingMakers: false,
      typeIdList: [{id: 1, name: 'Vehicle Template'}, {id: 2, name: 'Property Template'}],
      currentTemplates: [],
      memoForm: {
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        PolicyNumber: null,
        memoTemplates: [],
        StatusID: 0,
        RequestDate: moment(new Date()),
        NameInsured: null,
        AddressInsured: null,
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        Author: JSON.parse(this.$store.getters.getAccount).Name,
        TemplateType: null,
        TemplateID: null,
        Templates: []
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
        PolicyNumber: [
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
        AddressInsured: [
          { required: false, message: 'Please Enter', trigger: 'blur' }
        ]
      },
      templatesList: [],
      insuranceCompanyList: []
    }
  },
  mounted: function () {
    // this.initTemplates()
    this.initInsuranceCompany()
    // this.getMakerList()
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
    loadBlockQuestions: function () {
      this.isLoadingBlockQuestions = true
      let ids = JSON.stringify(this.memoForm.Templates)
      this.axios.post('/api/Services/BaseService.asmx/GetBlockQuestionsByTemplates', {templateids: ids}).then(res => {
        if (res) {
          console.log('BlockQuestions', res)
          this.blockQuestions = res.data
          this.matchAnswerBlockQuestion()
        }
        this.isLoadingBlockQuestions = false
        this.isLoading = false
        this.isAnswering = true
      }).catch(err => {
        console.log('loadBlockQuestions出错', err)
        this.isLoadingBlockQuestions = false
      })
    },
    loadMemoTemplates: function () {
      let ids = JSON.stringify(this.memoForm.Templates)
      this.axios.post('/api/Services/MemoService.asmx/GetNewMemoTemplateShells', {templateids: ids}).then(res => {
        if (res) {
          console.log('NewMemoTemplates', res)
          let ctemplates = res.data
          this.memoForm.memoTemplates = ctemplates
          this.loadBlockQuestions()
          /*
          this.currentTemplate.templateBlocks.forEach(tb => {
            let start = tb.BlockID === this.currentTemplate.templateBlocks[0].BlockID
            this.loadMemoBlock(tb.TemplateBlockID, start)
          })
          */
        }
      }).catch(err => {
        console.log('Templates列表出错', err)
        this.isLoading = false
      })
    },
    loadMemoBlock: function (templateblockid, start) {
      this.axios.post('/api/Services/MemoService.asmx/GetNewMemoBlock', {templateblockid: templateblockid, start: start}).then(res => {
        if (res) {
          console.log('NewMemoTemplates', res)
          let ctemplate = this.memoForm.memoTemplates[0]
          let cblock = res.data
          ctemplate.memoBlocks.push(cblock)
          if (ctemplate.memoBlocks.length === this.currentTemplate.templateBlocks.length) {
            ctemplate.memoBlocks = ctemplate.memoBlocks.sort((a, b) => { return a.SequenceNo - b.SequenceNo })
            if (!this.isLoadingBlockQuestions) this.matchAnswerBlockQuestion()
            this.isLoading = false
            this.isAnswering = true
          }
        }
        if (this.memoForm.memoTemplates.length === this.currentTemplates.length) {
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
      let corpid = this.memoForm.InsuranceCorpID
      this.memoForm.memoTemplates.forEach(ct => {
        ct.memoBlocks.forEach(cb => {
          cb.answers.forEach(a => {
            if (a.IsRoute) {
              a.blockQuestion = this.blockQuestions.find(bq => bq.BlockQuestionID === a.BlockQuestionID)
              let rlist = a.blockQuestion.routes.filter(r => r.InsuranceCorpID === corpid)
              if (rlist.length === 0) rlist = a.blockQuestion.routes.filter(r => r.InsuranceCorpID === 0)
              a.blockQuestion.routes = rlist
            }
          })
        })
      })
    },
    // Templates列表
    initTemplates: function (typeid) {
      this.isLoadingTemplates = true
      this.axios.post('/api/Services/memoservice.asmx/GetTemplatesByType', {typeid: typeid}).then(res => {
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
    // 重置Memo
    clearMemo: function () {
      this.isAnswering = false
      this.memoForm.StatusID = 0
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
      this.memoForm.Templates = []
      this.clearMemo()
      // 获取变量值，用于之后回答时routing比对
      this.AutoBindingAuthority = this.insuranceCompanyList.find(item => item.InsuranceCorpID === this.memoForm.InsuranceCorpID).AutoBindingAuthority
      this.PropertyBindingAuthority = this.insuranceCompanyList.find(item => item.InsuranceCorpID === this.memoForm.InsuranceCorpID).PropertyBindingAuthority
    },
    // 选择Templates类型
    changeTemplateType: function (typeid) {
      this.memoForm.Templates = []
      this.clearMemo()
      this.initTemplates(typeid)
    },
    // 选择Templates
    changeTemplates: function () {
      this.memoForm.Templates = [this.memoForm.TemplateID]
      let array = this.memoForm.Templates
      // let array = [this.memoForm.TemplateID]
      if (array.length === 0) {
        this.memoForm.Title = null
      } else if (array.length === 1) {
        this.memoForm.Title = this.templatesList.find(item => item.TemplateID === array[0]).Title
      } else {
        this.memoForm.Title = 'Multiple Changes'
      }
      this.clearMemo()
    },
    // 开始回答
    beginToAnswer: function () {
      this.isLoading = true
      this.loadMemoTemplates()
      // this.loadBlockQuestions()
    },
    // 提交
    submit: function (type) {
      this.$refs['memoForm'].validate((valid) => {
        if (valid) {
          let memo = JSON.parse(JSON.stringify(this.memoForm))
          console.log('memo', memo)
          memo.InsuranceTypeID = this.TemplateTypeID
          let sequenceno = 0
          memo.memoTemplates.forEach(template => {
            template.SequenceNo = sequenceno
            sequenceno++
            template.memoBlocks.forEach(block => {
              block.answers = block.answers.filter(a => a.StatusID === 1)
              block.answers.forEach(answer => {
                answer.blockQuestion = null
                // answer.QuestionDesc = ''
                if (answer.TypeID < 3) answer.AnswerDesc = ''
                else if (answer.TypeID === 5) {
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
                  // let Addition = ''
                  let Outputs = ''
                  optionAnswers.forEach(function (optionAnswer) {
                    answerDesc += '|' + optionAnswer.ChoiceOptionID + '::' + optionAnswer.Content
                    if (optionAnswer.NeedAddition) {
                      addition += '|' + (optionAnswer.Addition === null ? '' : optionAnswer.Addition)
                    }
                    // Addition = '|' + optionAnswer.Addition
                    // Outputs = '|' + optionAnswer.Outputs
                    Outputs += '|' + (optionAnswer.Outputs === null ? '' : optionAnswer.Outputs)
                  })
                  if (optionAnswers.length > 0) {
                    answer.AnswerDesc = answerDesc.substring(1)
                    // answer.Addition = Addition.substring(1)
                    answer.Outputs = Outputs.substring(1)
                  }
                  if (addition.length > 0) answer.Addition = addition.substring(1)
                  else answer.Addition = ''
                }
              })
            })
          })
          let value = JSON.stringify(memo)
          if (type === 'save' || (type === 'saveAndPrint')) {
            // console.log('提交问题', form)
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
                this.memoFormVisible = false
                if (type === 'saveAndPrint') {
                  this.$store.state.MemoID = res.data.MemoID
                }
                this.$router.push({path: '/myMemos'})
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
