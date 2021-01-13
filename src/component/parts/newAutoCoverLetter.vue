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
      <!--<el-row :gutter="20" class="subtitle">
        <el-col :span="12">
          <el-form-item label="Cover Letter Type" prop="Templates">
            <el-select v-model="coverLetterForm.Templates" placeholder="Cover Letter Type" no-data-text="No Record" filterable multiple collapse-tags :disabled="coverLetterForm.InsuranceCorpID === null || coverLetterForm.ClientCode === null" @change="changeTemplates()">
              <el-option v-for="item in templatesList" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>-->
    </el-form>
    <div class="newMemo-submit">
      <el-button icon="el-icon-check" type="primary" @click="beginToAnswer()" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="!isAnswering">Start</el-button>
    </div>
    <EditCoverLetterBody :coverLetter="coverLetterForm"></EditCoverLetterBody>
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
      AutoBindingAuthority: null,
      PropertyBindingAuthority: null,
      EffectiveDate: null,
      isAnswering: false,
      isPost: false,
      totalNum: 0,
      finishNum: 0,
      totalQuestionNum: 1,
      isLoading: false,
      isLoadingTemplates: false,
      isLoadingInsuranceCompany: false,
      isLoadingMakers: false,
      coverLetterForm: {
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        ClientCode: null,
        StatusID: 0,
        RequestDate: moment(new Date()),
        NameInsured: null,
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        Author: JSON.parse(this.$store.getters.getAccount).Name,
        TemplateType: null,
        coverLetterTemplates: null
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
        ]
      },
      templatesList: [],
      insuranceCompanyList: []
    }
  },
  mounted: function () {
    this.initTemplates(1)
    this.initInsuranceCompany()
    // this.getMakerList()
  },
  watch: {
    finishNum (val) {
      if (val === this.totalNum && this.isPost) {
        // this.currentTemplates = this.currentTemplates.sort((a, b) => { return a.orderId - b.orderId })
        this.setNumber()
        this.totalNum = 0
        this.finishNum = 0
        this.isPost = false
        this.isLoading = false
      }
    }
  },
  methods: {
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
      this.coverLetterForm.Templates = this.templatesList.filter(item => item.InsuranceCorpID === this.coverLetterForm.InsuranceCorpID)
      this.clearMemo()
      // 获取变量值，用于之后回答时routing比对
      this.AutoBindingAuthority = this.insuranceCompanyList.find(item => item.InsuranceCorpID === this.coverLetterForm.InsuranceCorpID).AutoBindingAuthority
      this.PropertyBindingAuthority = this.insuranceCompanyList.find(item => item.InsuranceCorpID === this.coverLetterForm.InsuranceCorpID).PropertyBindingAuthority
    },
    // 选择Templates类型
    changeTemplateType: function (typeid) {
      this.coverLetterForm.Templates = []
      this.clearMemo()
      this.initTemplates(typeid)
    },
    // 选择Templates
    changeTemplates: function () {
      this.clearMemo()
    },
    // 开始回答
    beginToAnswer: function () {
      let array = this.coverLetterForm.Templates
      // 添加template
      if (array !== null && array.length > 0) {
        this.isAnswering = true
        this.isPost = true
        this.totalNum = array.length
        for (let i = 0; i < array.length; i++) {
          this.isLoading = true
          this.axios.post('/api/Services/newbusinessservice.asmx/GetTemplate', {templateid: array[i].TemplateID}).then(res => {
            if (res) {
              console.log('添加Templates', res)
              let temp = res.data
              // 对所有问题赋值value、isSkip，选择题的每个选项赋值AdditionContent
              for (let p = 0; p < temp.templateBlocks.length; p++) {
                for (let q = 0; q < temp.templateBlocks[p].block.blockQuestions.length; q++) {
                  temp.templateBlocks[p].block.blockQuestions[q].question.Label = temp.templateBlocks[p].block.blockQuestions[q].Label
                  if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 6) {
                    temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = true
                    temp.templateBlocks[p].block.blockQuestions[q].question.value = null
                    temp.templateBlocks[p].block.blockQuestions[q].question.options.forEach(item => {
                      item.AdditionContent = null
                    })
                  } else if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 7) {
                    temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = true
                    temp.templateBlocks[p].block.blockQuestions[q].question.value = []
                    temp.templateBlocks[p].block.blockQuestions[q].question.options.forEach(item => {
                      item.AdditionContent = null
                      if (item.ChildQuestionTypeID === 5) {
                        item.childQuestion.fillinParts.forEach(fp => {
                          if (fp.IsFillin) {
                            fp.Width = Number(fp.Part)
                            fp.Part = ''
                          }
                        })
                      } else if (item.ChildQuestionTypeID > 0) {
                        item.childQuestion.answer = {
                          QuestionID: item.childQuestion.QuestionID,
                          QuestionDesc: item.childQuestion.Description,
                          TypeID: item.ChildQuestionTypeID,
                          AnswerDesc: ''
                        }
                      }
                    })
                  } else if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 5) {
                    temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = true
                    temp.templateBlocks[p].block.blockQuestions[q].question.value = null
                    temp.templateBlocks[p].block.blockQuestions[q].question.fillinParts.forEach(item => {
                      item.FillinContent = null
                    })
                  } else {
                    temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = true
                    temp.templateBlocks[p].block.blockQuestions[q].question.value = null
                  }
                }
              }
              temp.orderId = i
              this.currentTemplates.push(temp)
              console.log(this.finishNum)
              this.finishNum = this.finishNum + 1
            }
            // this.isLoading = false
          }).catch(err => {
            console.log('添加Templates出错', err)
            this.isLoading = false
          })
        }
      } else {
        this.$message({
          type: 'warning',
          message: 'Please Select Cover Letter Type'
        })
      }
    },
    // 标序
    setNumber: function () {
      // 自动填充title
      let array = this.coverLetterForm.Templates
      if (array.length === 0) {
        this.coverLetterForm.Title = null
      } else if (array.length === 1) {
        this.coverLetterForm.Title = this.templatesList.find(item => item.TemplateID === array[0].TemplateID).Title
      } else {
        this.coverLetterForm.Title = 'Multiple Changes'
      }
      // 所有的问题标序（num，numType【noAnswer，byStep】），并确定第一个问题
      let num = 1
      let numFirst = 1
      for (let i = 0; i < this.currentTemplates.length; i++) {
        for (let j = 0; j < this.currentTemplates[i].templateBlocks.length; j++) {
          for (let k = 0; k < this.currentTemplates[i].templateBlocks[j].block.blockQuestions.length; k++) {
            let curQuestion = this.currentTemplates[i].templateBlocks[j].block.blockQuestions[k].question
            curQuestion.num = num
            if (curQuestion.TypeID === 1 || curQuestion.TypeID === 2) {
              curQuestion.numType = 'noAnswer'
            } else {
              curQuestion.numType = 'byStep'
            }
            if (curQuestion.num === numFirst) {
              if (curQuestion.numType === 'noAnswer') {
                curQuestion.isSkip = false
                numFirst = numFirst + 1
              } else {
                curQuestion.isSkip = false
              }
            } else {
              curQuestion.isSkip = true
            }
            num = num + 1
          }
        }
      }
      this.totalQuestionNum = num - 1
    },
    // 更新跳过个数
    countShipNumber: function (TemplateID, blockSequenceNo, questionSequenceNo, value, sign) {
      let template = this.currentTemplates.find(item => item.TemplateID === TemplateID)
      let block = template.templateBlocks.find(item => item.SequenceNo === blockSequenceNo)
      let question = block.block.blockQuestions.find(item => item.SequenceNo === questionSequenceNo)
      let routes = question.routes.filter(item => item.InsuranceCorpID === this.coverLetterForm.InsuranceCorpID)
      if (routes.length === 0) {
        routes = question.routes.filter(item => item.InsuranceCorpID === 0)
      }
      let skipNumber = 1
      if (question.IsRoute && question.RouteTypeID === 1) { // baseOnQuestion
        skipNumber = routes[0].MoveStep
      } else if (!(question.IsRoute && question.RouteTypeID === 2 && question.question.TypeID === 3)) {
        if (question.IsRoute && question.RouteTypeID === 2 && question.question.TypeID === 6) { // baseOnAnswer singleChoice
          // 单选题判断答案所属routes，得出跳过个数
          if (routes.find(item => parseFloat(item.Operand) === value) !== undefined) {
            skipNumber = routes.find(item => parseFloat(item.Operand) === value).MoveStep
          } else {
            skipNumber = 1
          }
        }
      } else { // baseOnAnswer property
        for (let i = 0; i < routes.length; i++) {
          // 变量转换为具体值，定义OperandCurrent，避免修改EffectiveDate时，无法再次匹配到{EffectiveDate}
          // let Operand = routes[i].Operand
          let Operand = this.parseOperand(routes[i].Operand, sign)
          // 日期型property把operand和value转成时间戳
          if (sign === 'date') {
            Operand = moment(Operand).valueOf()
            value = moment(value).valueOf()
          }
          if (isNaN(Operand)) { // true代表非数字，字符串比较
            if (routes[i].Operator === '=' && value === Operand) {
              skipNumber = routes[i].MoveStep
              break
            } else {
              skipNumber = 1
            }
          } else { // false代表是有效数字，数字比较
            if (routes[i].Operator === '=' && parseFloat(value) === parseFloat(Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '>' && parseFloat(value) > parseFloat(Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '<' && parseFloat(value) < parseFloat(Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '>=' && parseFloat(value) >= parseFloat(Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '<=' && parseFloat(value) <= parseFloat(Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else {
              skipNumber = 1
            }
          }
        }
      }
      // 隐藏当前问题之后的所有问题
      for (let i = 0; i < this.currentTemplates.length; i++) {
        for (let j = 0; j < this.currentTemplates[i].templateBlocks.length; j++) {
          for (let k = 0; k < this.currentTemplates[i].templateBlocks[j].block.blockQuestions.length; k++) {
            let curQuestion = this.currentTemplates[i].templateBlocks[j].block.blockQuestions[k].question
            if (curQuestion.num > question.question.num) {
              curQuestion.isSkip = true
              if (curQuestion.TypeID === 7) {
                curQuestion.value = []
                curQuestion.options.forEach(item => { item.AdditionContent = null })
              } else if (curQuestion.TypeID === 6) {
                curQuestion.value = null
                curQuestion.options.forEach(item => { item.AdditionContent = null })
              } else if (curQuestion.TypeID === 5) {
                curQuestion.value = null
                curQuestion.fillinParts.forEach(item => { item.FillinContent = null })
              } else {
                curQuestion.value = null
              }
            }
          }
        }
      }
      if (sign !== 'emptyAddition' && skipNumber === -1) { // 到coverLetter底
        this.coverLetterForm.StatusID = 1
      } else if (sign !== 'emptyAddition') {
        if (this.totalQuestionNum === question.question.num) {
          this.coverLetterForm.StatusID = 1
        } else {
          this.coverLetterForm.StatusID = 0
        }
        let curNum = question.question.num + skipNumber - 1
        this.showNext(curNum)
      }
    },
    parseOperand: function (exp, sign) {
      // return exp
      if (sign === 'number') {
        let ed = new Date(this.EffectiveDate)
        exp = exp.replace('{EffectiveDate}.Year', ed.getFullYear())
        let corpid = this.coverLetterForm.InsuranceCorpID
        let corp = this.insuranceCompanyList.find(c => c.InsuranceCorpID === corpid)
        if (corp !== undefined) {
          let starti = exp.indexOf('{')
          let endi = exp.indexOf('}')
          if (starti >= 0 && endi >= 0 && endi > starti + 1) {
            let replaced = exp.substr(starti + 1, endi - starti - 1)
            if (corp[replaced] !== undefined) {
              exp = exp.replace('{' + replaced + '}', corp[replaced])
            }
          }
        }
        let operands = exp.split(/\+|-/g)
        let operators = exp.split(/\d+/)
        let result = 0
        for (let i = 0; i < operands.length; i++) {
          if (operators[i] === '') result = Number(operands[i])
          else if (operators[i] === '+') result += Number(operands[i])
          else if (operators[i] === '-') result -= Number(operands[i])
        }
        return result
      } else if (sign === 'date') {
        exp = exp.replace('{EffectiveDate}', this.EffectiveDate)
        return exp
      } else {
        return exp
      }
    },
    // 显示下一个问题
    showNext: function (curNum) {
      let nextNum = curNum + 1
      let setNext = false
      for (let i = 0; i < this.currentTemplates.length; i++) {
        if (setNext) {
          break
        }
        for (let j = 0; j < this.currentTemplates[i].templateBlocks.length; j++) {
          if (setNext) {
            break
          }
          for (let k = 0; k < this.currentTemplates[i].templateBlocks[j].block.blockQuestions.length; k++) {
            if (setNext) {
              break
            }
            let curQuestion = this.currentTemplates[i].templateBlocks[j].block.blockQuestions[k].question
            if (curQuestion.num === nextNum) {
              if (curQuestion.numType === 'noAnswer') {
                curQuestion.isSkip = false
                nextNum = nextNum + 1
                if (this.totalQuestionNum === curQuestion.num) {
                  this.coverLetterForm.StatusID = 1
                }
              } else {
                curQuestion.isSkip = false
                setNext = true
                break
              }
            }
          }
        }
      }
    },
    // 提交
    submit: function (type) {
      this.$refs['coverLetterForm'].validate((valid) => {
        if (valid) {
          // 校验全部回答
          let allAnswer = true
          // form
          let form = JSON.parse(JSON.stringify(this.coverLetterForm))
          // templates
          let templates = JSON.parse(JSON.stringify(this.currentTemplates))
          templates = templates.map(item => { return { TemplateID: item.TemplateID, Title: item.Title, coverLetterBlocks: item.templateBlocks } })
          for (let i = 0; i < templates.length; i++) {
            // 过滤掉被隐藏的问题
            templates[i].coverLetterBlocks = templates[i].coverLetterBlocks.map(item => { return { BlockID: item.BlockID, answers: item.block.blockQuestions.filter(it => it.question.isSkip === false) } })
            for (let j = 0; j < templates[i].coverLetterBlocks.length; j++) {
              for (let k = 0; k < templates[i].coverLetterBlocks[j].answers.length; k++) {
                if (templates[i].coverLetterBlocks[j].answers[k].question.TypeID === 1) {
                  // 问题类型为：Title
                  templates[i].coverLetterBlocks[j].answers[k] = {
                    StatusID: 1,
                    QuestionID: templates[i].coverLetterBlocks[j].answers[k].QuestionID,
                    BlockQuestionID: templates[i].coverLetterBlocks[j].answers[k].BlockQuestionID,
                    QuestionDesc: templates[i].coverLetterBlocks[j].answers[k].question.Description,
                    AnswerDesc: null,
                    OutputModeID: templates[i].coverLetterBlocks[j].answers[k].question.OutputModeID,
                    QuestionType: 'Title'
                  }
                } else if (templates[i].coverLetterBlocks[j].answers[k].question.TypeID === 2) {
                  // 问题类型为：Reminder
                  templates[i].coverLetterBlocks[j].answers[k] = {
                    StatusID: 1,
                    QuestionID: templates[i].coverLetterBlocks[j].answers[k].QuestionID,
                    BlockQuestionID: templates[i].coverLetterBlocks[j].answers[k].BlockQuestionID,
                    QuestionDesc: templates[i].coverLetterBlocks[j].answers[k].question.Description,
                    AnswerDesc: null,
                    OutputModeID: templates[i].coverLetterBlocks[j].answers[k].question.OutputModeID,
                    QuestionType: 'Reminder'
                  }
                } else if (templates[i].coverLetterBlocks[j].answers[k].question.TypeID === 3) {
                  // 问题类型为：Property
                  templates[i].coverLetterBlocks[j].answers[k] = {
                    StatusID: 1,
                    QuestionID: templates[i].coverLetterBlocks[j].answers[k].QuestionID,
                    BlockQuestionID: templates[i].coverLetterBlocks[j].answers[k].BlockQuestionID,
                    QuestionDesc: templates[i].coverLetterBlocks[j].answers[k].question.Description,
                    AnswerDesc: templates[i].coverLetterBlocks[j].answers[k].question.value,
                    OutputModeID: templates[i].coverLetterBlocks[j].answers[k].question.OutputModeID,
                    QuestionType: 'Property'
                  }
                  // 未回答
                  if (templates[i].coverLetterBlocks[j].answers[k].AnswerDesc === '' || templates[i].coverLetterBlocks[j].answers[k].AnswerDesc === null) {
                    allAnswer = false
                  }
                } else if (templates[i].coverLetterBlocks[j].answers[k].question.TypeID === 4) {
                  // 问题类型为：SimpleAnswer
                  templates[i].coverLetterBlocks[j].answers[k] = {
                    StatusID: 1,
                    QuestionID: templates[i].coverLetterBlocks[j].answers[k].QuestionID,
                    BlockQuestionID: templates[i].coverLetterBlocks[j].answers[k].BlockQuestionID,
                    QuestionDesc: templates[i].coverLetterBlocks[j].answers[k].question.Description,
                    AnswerDesc: templates[i].coverLetterBlocks[j].answers[k].question.value,
                    OutputModeID: templates[i].coverLetterBlocks[j].answers[k].question.OutputModeID,
                    QuestionType: 'SimpleAnswer'
                  }
                  // 未回答
                  if (templates[i].coverLetterBlocks[j].answers[k].AnswerDesc === '' || templates[i].coverLetterBlocks[j].answers[k].AnswerDesc === null) {
                    allAnswer = false
                  }
                } else if (templates[i].coverLetterBlocks[j].answers[k].question.TypeID === 5) {
                  // 问题类型为：Fillin
                  templates[i].coverLetterBlocks[j].answers[k] = {
                    StatusID: 1,
                    fillinAnswers: templates[i].coverLetterBlocks[j].answers[k].question.fillinParts.map(it => {
                      return { FillinPartID: it.FillinPartID, IsFillin: it.IsFillin, Part: it.Part, FillinContent: it.FillinContent !== undefined ? it.FillinContent : '' }
                    }),
                    QuestionID: templates[i].coverLetterBlocks[j].answers[k].QuestionID,
                    BlockQuestionID: templates[i].coverLetterBlocks[j].answers[k].BlockQuestionID,
                    QuestionDesc: templates[i].coverLetterBlocks[j].answers[k].question.Description,
                    AnswerDesc: '',
                    OutputModeID: templates[i].coverLetterBlocks[j].answers[k].question.OutputModeID,
                    QuestionType: 'Fillin'
                  }
                  // 未回答
                  if (templates[i].coverLetterBlocks[j].answers[k].fillinAnswers.find(item => item.IsFillin + '|' + item.FillinContent === 'true|') !== undefined || templates[i].coverLetterBlocks[j].answers[k].fillinAnswers.find(item => item.IsFillin + '|' + item.FillinContent === 'true|null') !== undefined) {
                    allAnswer = false
                  }
                } else if (templates[i].coverLetterBlocks[j].answers[k].question.TypeID === 6) {
                  // 问题类型为：SingleChoice
                  let optionAnswer = {}
                  if (templates[i].coverLetterBlocks[j].answers[k].question.value !== null) {
                    optionAnswer = {
                      IsChecked: true,
                      ChoiceOptionID: templates[i].coverLetterBlocks[j].answers[k].question.value,
                      // OutputModeID: templates[i].coverLetterBlocks[j].answers[k].question.OutputModeID,
                      Content: templates[i].coverLetterBlocks[j].answers[k].question.options.find(it => it.ChoiceOptionID === templates[i].coverLetterBlocks[j].answers[k].question.value).Content,
                      Outputs: templates[i].coverLetterBlocks[j].answers[k].question.options.find(it => it.ChoiceOptionID === templates[i].coverLetterBlocks[j].answers[k].question.value).Outputs,
                      NeedAddition: templates[i].coverLetterBlocks[j].answers[k].question.options.find(it => it.ChoiceOptionID === templates[i].coverLetterBlocks[j].answers[k].question.value).NeedAddition,
                      Addition: templates[i].coverLetterBlocks[j].answers[k].question.options.find(it => it.ChoiceOptionID === templates[i].coverLetterBlocks[j].answers[k].question.value).AdditionContent
                    }
                    // NeedAddition为true但是未填写AdditionContent
                    let NeedAddition = templates[i].coverLetterBlocks[j].answers[k].question.options.find(it => it.ChoiceOptionID === templates[i].coverLetterBlocks[j].answers[k].question.value).NeedAddition
                    let AdditionContent = templates[i].coverLetterBlocks[j].answers[k].question.options.find(it => it.ChoiceOptionID === templates[i].coverLetterBlocks[j].answers[k].question.value).AdditionContent
                    if (NeedAddition && (AdditionContent === null || AdditionContent === '')) {
                      allAnswer = false
                    }
                  } else { // 未回答
                    optionAnswer = null
                    allAnswer = false
                  }
                  templates[i].coverLetterBlocks[j].answers[k] = {
                    optionAnswer: optionAnswer,
                    StatusID: 1,
                    QuestionID: templates[i].coverLetterBlocks[j].answers[k].QuestionID,
                    BlockQuestionID: templates[i].coverLetterBlocks[j].answers[k].BlockQuestionID,
                    QuestionDesc: templates[i].coverLetterBlocks[j].answers[k].question.Description,
                    // AnswerDesc: JSON.stringify(optionAnswer),
                    OutputModeID: templates[i].coverLetterBlocks[j].answers[k].question.OutputModeID,
                    TypeID: templates[i].coverLetterBlocks[j].answers[k].question.TypeID,
                    QuestionType: 'SingleChoice'
                  }
                } else if (templates[i].coverLetterBlocks[j].answers[k].question.TypeID === 7) {
                  // 问题类型为：MultipleChoice
                  let optionAnswers = []
                  if (templates[i].coverLetterBlocks[j].answers[k].question.value.length > 0) {
                    optionAnswers = templates[i].coverLetterBlocks[j].answers[k].question.value.map(it => {
                      let option = templates[i].coverLetterBlocks[j].answers[k].question.options.find(i => i.ChoiceOptionID === it)
                      let canswer = null
                      let panswer = null
                      if (option.childQuestion !== null) {
                        canswer = option.childQuestion.answer
                        panswer = option.childQuestion.fillinParts
                      }
                      return {
                        ChoiceOptionID: it,
                        OutputModeID: templates[i].coverLetterBlocks[j].answers[k].question.OutputModeID,
                        Content: templates[i].coverLetterBlocks[j].answers[k].question.options.find(i => i.ChoiceOptionID === it).Content,
                        Outputs: templates[i].coverLetterBlocks[j].answers[k].question.options.find(i => i.ChoiceOptionID === it).Outputs,
                        AdditionContent: templates[i].coverLetterBlocks[j].answers[k].question.options.find(i => i.ChoiceOptionID === it).AdditionContent,
                        SequenceNo: templates[i].coverLetterBlocks[j].answers[k].question.options.find(i => i.ChoiceOptionID === it).SequenceNo,
                        NeedAddition: templates[i].coverLetterBlocks[j].answers[k].question.options.find(i => i.ChoiceOptionID === it).NeedAddition,
                        childAnswer: canswer,
                        // templates[i].coverLetterBlocks[j].answers[k].question.options.find(i => i.ChoiceOptionID === it).childQuestion.answer,
                        partAnswers: panswer// templates[i].coverLetterBlocks[j].answers[k].question.options.find(i => i.ChoiceOptionID === it).childQuestion.fillinParts
                      }
                    })
                    // 按SequenceNo排序
                    optionAnswers = optionAnswers.slice().sort((a, b) => { return a.SequenceNo - b.SequenceNo })
                    // NeedAddition为true但是未填写AdditionContent
                    if (optionAnswers.find(item => item.NeedAddition + '|' + item.AdditionContent === 'true|') !== undefined || optionAnswers.find(item => item.NeedAddition + '|' + item.AdditionContent === 'true|null') !== undefined) {
                      allAnswer = false
                    }
                    optionAnswers = optionAnswers.map(it => {
                      return {
                        IsChecked: true,
                        ChoiceOptionID: it.ChoiceOptionID,
                        OutputModeID: it.OutputModeID,
                        Content: it.Content,
                        Outputs: it.Outputs,
                        AdditionContent: it.AdditionContent,
                        childAnswer: it.childAnswer,
                        partAnswers: it.partAnswers
                      }
                    })
                  } else { // 未回答
                    allAnswer = false
                  }
                  templates[i].coverLetterBlocks[j].answers[k] = {
                    optionAnswers: optionAnswers,
                    StatusID: 1,
                    QuestionID: templates[i].coverLetterBlocks[j].answers[k].QuestionID,
                    BlockQuestionID: templates[i].coverLetterBlocks[j].answers[k].BlockQuestionID,
                    QuestionDesc: templates[i].coverLetterBlocks[j].answers[k].question.Description,
                    // AnswerDesc: JSON.stringify(optionAnswers),
                    OutputModeID: templates[i].coverLetterBlocks[j].answers[k].question.OutputModeID,
                    QuestionType: 'MultipleChoice'
                  }
                }
              }
            }
          }
          if (type === 'save' || (type === 'saveAndPrint' && allAnswer)) {
            form.coverlettertemplates = templates
            this.isLoading = true
            let value = JSON.stringify(form)
            console.log(value)
            this.axios.post('/api/Services/NewBusinessService.asmx/SaveCoverLetter', {coverLetter: value}).then(res => {
              if (res) {
                console.log('新增', res)
                this.$message({
                  type: 'success',
                  message: 'Operation Succeeded'
                })
                this.$refs['coverLetterForm'].resetFields()
                this.clearMemo()
                this.EffectiveDate = null
                this.AutoBindingAuthority = null
                this.PropertyBindingAuthority = null
                if (type === 'saveAndPrint') {
                  this.$store.state.CoverLetterID = res.data.CoverLetterID
                }
                this.$router.push({path: '/myCoverLetters'})
              }
              this.isLoading = false
            }).catch(err => {
              console.log('新增出错', err)
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
