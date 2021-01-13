<template>
<div>
  <el-form :model="coverLetterForm" ref="coverLetterForm" class="newMemo" :rules="coverLetterFormRules">
    <el-row :gutter="20" class="title">
      <el-col :span="6">&#12288;</el-col>
      <el-col :span="12">
        <el-form-item prop="Title">
          <el-input v-model="coverLetterForm.Title" placeholder="Title"></el-input>
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
    </el-row>
  </el-form>
  <div class="newMemo-content" v-for="ctemplate in coverLetterForm.coverLetterTemplates" :key="ctemplate.CoverLetterTemplateID">
    <div class="newMemo-content-template-title">{{ctemplate.Title}}</div>
    <div v-for="cblock in ctemplate.coverLetterBlocks" :key="cblock.CoverLetterBlockID">
      <!--<div class="newMemo-content-block-title">{{item.BlockName}}</div>-->
      <div v-for="answer in cblock.answers" :key="answer.QuestionID">
        <div class="answerMemo" v-if="answer.TypeID === 1 && answer.StatusID === 1">
          <div class="typeTitle">
            <span v-if="answer.blockQuestion.Label !== undefined && answer.blockQuestion.Label !== null && answer.blockQuestion.Label !== ''">{{answer.blockQuestion.Label}}&nbsp;&nbsp;</span>
            {{answer.QuestionDesc}}
          </div>
        </div>
        <div class="answerMemo" v-else-if="answer.TypeID === 2 && answer.StatusID === 1">
          <div class="typeReminder">
            <span v-if="answer.blockQuestion.Label !== undefined && answer.blockQuestion.Label !== null && answer.blockQuestion.Label !== ''">{{answer.blockQuestion.Label}}&nbsp;&nbsp;</span>
            {{answer.QuestionDesc}}
          </div>
        </div>
        <div class="answerMemo" v-else-if="answer.TypeID === 3 && answer.StatusID === 1">
          <AnswerProperty :answer="answer"  @changeValue="showNextQuestion(ctemplate, cblock, answer)"></AnswerProperty>
        </div>
        <div class="answerMemo" v-else-if="answer.TypeID === 4 && answer.StatusID === 1">
          <AnswerSimpleAnswer :answer="answer"  @changeValue="showNextQuestion(ctemplate, cblock, answer)"></AnswerSimpleAnswer>
        </div>
        <div class="answerMemo" v-else-if="answer.TypeID === 5 && answer.StatusID === 1">
          <AnswerFillInQuestion :answer="answer"  @changeValue="showNextQuestion(ctemplate, cblock, answer)"></AnswerFillInQuestion>
        </div>
        <div class="answerMemo" v-else-if="answer.TypeID === 6 && answer.StatusID === 1">
          <AnswerSingleChoiceQuestion :answer="answer" @changeValue="showNextQuestion(ctemplate, cblock, answer)"></AnswerSingleChoiceQuestion>
        </div>
        <div class="answerMemo" v-else-if="answer.TypeID === 7 && answer.StatusID === 1">
          <AnswerMultipleChoiceQuestion :answer="answer"  @changeValue="showNextQuestion(ctemplate, cblock, answer)"></AnswerMultipleChoiceQuestion>
        </div>
      </div>
    </div>
  </div>
  <div class="newMemo-submit">
    <el-button icon="el-icon-check" type="primary" @click="submit('save')" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany">Save</el-button>
    <el-button icon="el-icon-check" type="primary" @click="submit('saveAndPrint')" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="coverLetterForm.StatusID === 1">Save & Print</el-button>
  </div>
</div>
</template>

<script>
import moment from 'moment'
import AnswerProperty from '@/component/property/CL_PropertyAnswer'
import AnswerSimpleAnswer from '@/component/simpleAnswer/CL_SimpleAnswer'
import AnswerFillInQuestion from '@/component/fillInQuestion/CL_FillInQuestionAnswer'
import AnswerSingleChoiceQuestion from '@/component/choiceQuestion/CL_SingleChoiceQuestionAnswer'
import AnswerMultipleChoiceQuestion from '@/component/choiceQuestion/CL_MultipleChoiceQuestionAnswer'

export default {
  components: {
    AnswerProperty,
    AnswerSimpleAnswer,
    AnswerFillInQuestion,
    AnswerSingleChoiceQuestion,
    AnswerMultipleChoiceQuestion
  },
  name: 'editAutoCoverLetter',
  data: function () {
    return {
      printDate: null,
      isLoading: false,
      isLoadingTemplates: false,
      isLoadingInsuranceCompany: false,
      insuranceCompanyList: [],
      templatesList: [],
      currentTemplates: [],
      coverLetterFormVisible: false,
      coverLetterForm: {
        CoverLetterID: null,
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        ClientCode: null,
        StatusID: 0,
        RequestDate: moment(new Date()),
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
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
    }
  },
  mounted: function () {
    this.loadCoverLetter(this.coverletterid)
  },
  methods: {
    loadCoverLetter: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.initTemplates()
      this.initInsuranceCompany()
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetter', {coverletterid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.coverLetterForm = res.data
            this.coverLetterForm.InsuranceCorp = this.insuranceCorps.find(item => item.InsuranceCorpID === res.data.InsuranceCorpID).Name
            this.coverLetterForm.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
            this.coverLetterForm.RequestDate = moment(res.data.RequestDate).format('YYYY-MM-DD')
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
    // 选择Templates
    changeTemplates: function (array, isAnswer) {
      this.isPost = true
      this.totalNum = array.length
      for (let i = 0; i < array.length; i++) {
        this.isLoading = true
        this.axios.post('/api/Services/NewBusinessService.asmx/GetTemplate', {templateid: array[i]}).then(res => {
          if (res) {
            console.log('添加Templates', res)
            let temp = res.data
            // 对所有问题赋值value、isSkip，选择题的每个选项赋值AdditionContent
            // 修改相对于新增，需要的额外字段
            temp.IsNew = true
            // 修改相对于新增，需要的额外字段
            for (let p = 0; p < temp.templateBlocks.length; p++) {
              // 修改相对于新增，需要的额外字段
              temp.templateBlocks[p].block.IsNew = true
              // 修改相对于新增，需要的额外字段
              for (let q = 0; q < temp.templateBlocks[p].block.blockQuestions.length; q++) {
                temp.templateBlocks[p].block.blockQuestions[q].question.Label = temp.templateBlocks[p].block.blockQuestions[q].Label
                if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 6) {
                  temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = true
                  temp.templateBlocks[p].block.blockQuestions[q].question.value = null
                  temp.templateBlocks[p].block.blockQuestions[q].question.options.forEach(item => { item.AdditionContent = null })
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
                  temp.templateBlocks[p].block.blockQuestions[q].question.fillinParts.forEach(item => { item.FillinContent = null })
                } else {
                  temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = true
                  temp.templateBlocks[p].block.blockQuestions[q].question.value = null
                }
              }
            }
            // 将答案填充
            if (isAnswer === 'Answer') {
              if (this.coverLetterForm.coverLetterTemplates.find(item => item.TemplateID === array[i]) !== undefined) {
                // 修改相对于新增，需要的额外字段
                temp.IsNew = false
                temp.CoverLetterTemplateID = this.coverLetterForm.coverLetterTemplates.find(item => item.TemplateID === array[i]).CoverLetterTemplateID
                temp.CoverLetterID = this.coverLetterForm.coverLetterTemplates.find(item => item.TemplateID === array[i]).CoverLetterID
                // 修改相对于新增，需要的额外字段
              }
              let blocks = this.coverLetterForm.coverLetterTemplates.find(item => item.TemplateID === array[i]).coverLetterBlocks
              for (let p = 0; p < blocks.length; p++) {
                let matchBlock = temp.templateBlocks.find(item => item.BlockID === blocks[p].BlockID).block
                // 修改相对于新增，需要的额外字段
                matchBlock.IsNew = false
                matchBlock.CoverLetterBlockID = blocks[p].CoverLetterBlockID
                matchBlock.CoverLetterTemplateID = blocks[p].CoverLetterTemplateID
                matchBlock.SequenceNo = blocks[p].SequenceNo
                matchBlock.answers = blocks[p].answers
                // 修改相对于新增，需要的额外字段
                // 将此block中，GetCoverLetter有回答的问题赋予回答
                for (let q = 0; q < blocks[p].answers.length; q++) {
                  let matchQuestion = matchBlock.blockQuestions.find(item => item.QuestionID === blocks[p].answers[q].QuestionID)
                  let answer = true
                  if (blocks[p].answers[q].AnswerDesc === '' || blocks[p].answers[q].AnswerDesc === null) {
                    answer = false
                  }
                  this.AnsweredArr.push({template: temp.TemplateID, block: temp.templateBlocks.find(item => item.BlockID === blocks[p].BlockID).SequenceNo, question: matchQuestion.SequenceNo, answer: answer})
                  // 修改相对于新增，需要的额外字段
                  matchQuestion.question.isSkip = false
                  matchQuestion.question.AnswerID = blocks[p].answers[q].AnswerID
                  matchQuestion.question.CoverLetterBlockID = blocks[p].answers[q].CoverLetterBlockID
                  // 修改相对于新增，需要的额外字段
                  // if (blocks[p].answers[q].TypeName === 'Title') {
                  // } else if (blocks[p].answers[q].TypeName === 'Reminder') {
                  if (blocks[p].answers[q].TypeName === 'Property') {
                    matchQuestion.question.value = blocks[p].answers[q].AnswerDesc
                  } else if (blocks[p].answers[q].TypeName === 'SimpleAnswer') {
                    matchQuestion.question.value = blocks[p].answers[q].AnswerDesc
                  } else if (blocks[p].answers[q].TypeName === 'Fillin') {
                    for (let a = 0; a < blocks[p].answers[q].fillinAnswers.length; a++) {
                      if (blocks[p].answers[q].fillinAnswers[a].IsFillin) {
                        matchQuestion.question.fillinParts.find(it => it.FillinPartID === blocks[p].answers[q].fillinAnswers[a].FillinPartID).FillinContent = blocks[p].answers[q].fillinAnswers[a].FillinContent
                      }
                    }
                  } else if (blocks[p].answers[q].TypeName === 'SingleChoice') {
                    if (blocks[p].answers[q].optionAnswer !== null) {
                      matchQuestion.question.value = blocks[p].answers[q].optionAnswer.ChoiceOptionID
                      matchQuestion.question.options.find(it => it.ChoiceOptionID === blocks[p].answers[q].optionAnswer.ChoiceOptionID).AdditionContent = blocks[p].answers[q].optionAnswer.AdditionContent
                    }
                  } else if (blocks[p].answers[q].TypeName === 'MultipleChoice') {
                    matchQuestion.question.value = blocks[p].answers[q].optionAnswers.map(it => it.ChoiceOptionID)
                    for (let a = 0; a < matchQuestion.question.value.length; a++) {
                      let option = matchQuestion.question.options.find(it => it.ChoiceOptionID === matchQuestion.question.value[a])
                      let optionanswer = blocks[p].answers[q].optionAnswers.find(it => it.ChoiceOptionID === matchQuestion.question.value[a])
                      option.AdditionContent = optionanswer.AdditionContent
                      if (option.childQuestion !== null) {
                        option.childQuestion.answer = optionanswer.childAnswer
                        option.childQuestion.fillinParts = optionanswer.partAnswers
                      }
                      // matchQuestion.question.options.find(it => it.ChoiceOptionID === matchQuestion.question.value[a]).AdditionContent = blocks[p].answers[q].optionAnswers.find(it => it.ChoiceOptionID === matchQuestion.question.value[a]).AdditionContent
                    }
                  }
                }
              }
            }
            temp.orderId = i
            this.currentTemplates.push(temp)
            // this.currentTemplates = this.currentTemplates.sort((a, b) => { return a.orderId - b.orderId })
            this.finishNum = this.finishNum + 1
          }
          // this.isLoading = false
        }).catch(err => {
          console.log('添加Templates出错', err)
          this.isLoading = false
        })
      }
    },
    // 标序
    setNumber: function () {
      // 执行routes
      // for (let a = 0; a < this.currentTemplates.length; a++) {
      //   for (let b = 0; b < this.currentTemplates[a].templateBlocks.length; b++) {
      //     for (let c = 0; c < this.currentTemplates[a].templateBlocks[b].block.blockQuestions.length; c++) {
      //       if (this.currentTemplates[a].templateBlocks[b].block.blockQuestions[c].question.TypeID === 3 || this.currentTemplates[a].templateBlocks[b].block.blockQuestions[c].question.TypeID === 6) {
      //         this.countShipNumber(this.currentTemplates[a].TemplateID, this.currentTemplates[a].templateBlocks[b].SequenceNo, this.currentTemplates[a].templateBlocks[b].block.blockQuestions[c].SequenceNo, this.currentTemplates[a].templateBlocks[b].block.blockQuestions[c].question.value)
      //       }
      //     }
      //   }
      // }
      // 找到最后一个问答的问题
      this.AnsweredArr = this.AnsweredArr.sort((a, b) => { return b.template - a.template })
      this.AnsweredArr = this.AnsweredArr.filter(item => item.template === this.AnsweredArr[0].template)
      this.AnsweredArr = this.AnsweredArr.sort((a, b) => { return b.block - a.block })
      this.AnsweredArr = this.AnsweredArr.filter(item => item.block === this.AnsweredArr[0].block)
      this.AnsweredArr = this.AnsweredArr.sort((a, b) => { return b.question - a.question })
      if (this.AnsweredArr.find(item => item.answer) !== undefined) {
        this.AnsweredArr = this.AnsweredArr.find(item => item.answer)
      } else {
        this.AnsweredArr = []
      }
      // 自动填充title
      let array = this.coverLetterForm.Templates
      if (array.length === 0) {
        this.coverLetterForm.Title = null
      } else if (array.length === 1) {
        this.coverLetterForm.Title = this.templatesList.find(item => item.TemplateID === array[0]).Title
      } else {
        this.coverLetterForm.Title = 'Multiple Changes'
      }
      // 所有的问题标序（num，numType【noAnswer，byStep】），并确定第一个问题
      let num = 1
      let numFirst = 0
      for (let i = 0; i < this.currentTemplates.length; i++) {
        for (let j = 0; j < this.currentTemplates[i].templateBlocks.length; j++) {
          for (let k = 0; k < this.currentTemplates[i].templateBlocks[j].block.blockQuestions.length; k++) {
            let curQuestion = this.currentTemplates[i].templateBlocks[j].block.blockQuestions[k].question
            curQuestion.num = num
            if (this.AnsweredArr.length > 0 && (this.currentTemplates[i].TemplateID + '|' + this.currentTemplates[i].templateBlocks[j].SequenceNo + '|' + this.currentTemplates[i].templateBlocks[j].block.blockQuestions[k].SequenceNo === this.AnsweredArr[0].template + '|' + this.AnsweredArr[0].block + '|' + this.AnsweredArr[0].question)) {
              numFirst = curQuestion.num + 1
            }
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
            }
            num = num + 1
          }
        }
      }
      this.totalQuestionNum = num - 1
    },
    // 更新跳过个数
    countShipNumber: function (answer) {
      let question = answer.blockQuestion
      if (!question.IsRoute) return 1
      let sign = answer.InputType
      let value = answer.AnswerDesc
      if (answer.TypeID === 6) value = answer.checkvalue
      let routes = question.routes.filter(item => item.InsuranceCorpID === this.coverLetterForm.InsuranceCorpID)
      if (routes.length === 0) {
        routes = question.routes.filter(item => item.InsuranceCorpID === 0)
      }
      let skipNumber = 1
      if (question.RouteTypeID === 1) { // baseOnQuestion
        skipNumber = routes[0].MoveStep
      } else if (question.RouteTypeID === 2 && answer.TypeID === 3) { // baseOnAnswer property
        for (let i = 0; i < routes.length; i++) {
          // 变量转换为具体值，定义OperandCurrent，避免修改EffectiveDate时，无法再次匹配到{EffectiveDate}
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
            } else if (routes[i].Operator === '<=' && parseInt(value) <= parseInt(Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else {
              skipNumber = 1
            }
          }
        }
      } else if (question.IsRoute && question.RouteTypeID === 2 && answer.TypeID === 6) { // baseOnAnswer singleChoice
        // 单选题判断答案所属routes，得出跳过个数
        if (routes.find(item => parseFloat(item.Operand) === value) !== undefined) {
          skipNumber = routes.find(item => parseFloat(item.Operand) === value).MoveStep
        } else {
          skipNumber = 1
        }
      }
      return skipNumber
    },
    // 解析操作数
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
          /*
            exp = exp.replace('{AutoBindingAuthority}', corp.AutoBindingAuthority)
            exp = exp.replace('{PropertyBindingAuthority}', corp.PropertyBindingAuthority)
            exp = exp.replace('{HomeMinimum}', corp.HomeMinimum)
            exp = exp.replace('{RentedDwelling}', corp.RentedDwelling) */
        }
        /*
          if (corp !== undefined) {
            exp = exp.replace('{AutoBindingAuthority}', corp.AutoBindingAuthority)
            exp = exp.replace('{PropertyBindingAuthority}', corp.PropertyBindingAuthority)
            exp = exp.replace('{HomeMinimum}', corp.HomeMinimum)
            exp = exp.replace('{RentedDwelling}', corp.RentedDwelling)
          } */
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
    showNextQuestion: function (ctemplate, cblock, answer) {
      let skipsteps = this.countShipNumber(answer)
      if (skipsteps !== 0) {
        for (let i = 0; i < cblock.answers.length; i++) {
          if (cblock.answers[i].QuestionID === answer.QuestionID) {
            for (let j = i + 1; j < i + skipsteps; j++) {
              if (i + j > cblock.answers.length) break
              cblock.answers[j].StatusID = 2
            }
            if (i + skipsteps >= cblock.answers.length) this.showNextBlock(ctemplate, cblock)
            else cblock.answers[i + skipsteps].StatusID = 1
            break
          }
        }
      } else {
        // 完成答卷
        this.coverLetterForm.StatusID = 1
      }
    },
    showNextBlock: function (ctemplate, cblock) {
      for (let i = 0; ctemplate.coverLetterBlocks.length > i; i++) {
        if (ctemplate.coverLetterBlocks[i].BlockID === cblock.BlockID) {
          if (i === ctemplate.coverLetterBlocks.length - 1) {
            this.showNextTemplate(ctemplate)
            break
          }
          let block = ctemplate.coverLetterBlocks[i + 1]
          if (block.answers.length > 0) block.answers[0].StatusID = 1
          else this.showNextBlock(ctemplate, block)
          break
        }
      }
    },
    showNextTemplate: function (ctemplate) {
      for (let i = 0; this.coverLetterForm.coverLetterTemplates.length > i; i++) {
        if (this.coverLetterForm.coverLetterTemplates[i].TemplateID === ctemplate.TemplateID) {
          if (i === this.coverLetterForm.coverLetterTemplates.length - 1) {
            this.coverLetterForm.StatusID = 1
            return
          }
          let template = this.coverLetterForm.coverLetterTemplates[i + 1]
          if (template.coverLetterBlocks.length > 0) {
            if (template.coverLetterBlocks[0].answers.length > 0) template.coverLetterBlocks[0].answers[0].StatusID = 1
            else {
              this.showNextBlock(template, template.coverLetterBlocks[0])
            }
          }
          break
        }
      }
    },
    // 修改弹窗
    showEdit: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetter', {coverletterid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.coverLetterFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.coverLetterForm = res.data
            this.coverLetterForm.EffectiveDate = moment(res.data.EffectiveDate)
            this.coverLetterForm.RequestDate = moment(res.data.RequestDate)
            this.coverLetterForm.Templates = res.data.coverLetterTemplates.map(item => { return item.TemplateID })
            this.changeTemplates(this.coverLetterForm.Templates, 'Answer')
            this.initTemplates()
            this.initInsuranceCompany()
            this.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
            // this.AutoBindingAuthority = res.data.corpbroker.corp.AutoBindingAuthority
            // this.PropertyBindingAuthority = res.data.corpbroker.corp.PropertyBindingAuthority
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    // 关闭修改
    closeEdit: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$refs['coverLetterForm'].resetFields()
        this.currentTemplates = []
        this.AnsweredArr = []
        this.totalQuestionNum = 1
        this.EffectiveDate = null
        this.AutoBindingAuthority = null
        this.PropertyBindingAuthority = null
        done()
      }).catch(() => {})
    },
    // 提交
    submit: function (type) {
      this.$refs['coverLetterForm'].validate((valid) => {
        if (valid) {
          let coverletter = JSON.parse(JSON.stringify(this.coverLetterForm))
          coverletter.coverLetterTemplates.forEach(template => {
            template.coverLetterBlocks.forEach(block => {
              block.answers.forEach(answer => {
                answer.blockQuestion = null
                if (answer.TypeID === 5) {
                  // answer.AnswerDesc = JSON.stringify(answer.partAnswers)
                } else if (answer.TypeID === 6 || answer.TypeID === 7) {
                  // answer.AnswerDesc = JSON.stringify(answer.optionAnswers)
                } else {}
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
                this.EffectiveDate = null
                this.AutoBindingAuthority = null
                this.PropertyBindingAuthority = null
                this.coverLetterFormVisible = false
                if (type === 'saveAndPrint') {
                  this.showCoverLetter(res.data.CoverLetterID)
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
