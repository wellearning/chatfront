<template>
  <div v-loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" element-loading-background="rgba(0, 0, 0, 0)">
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
            <el-date-picker v-model="memoForm.EffectiveDate" type="date" placeholder="Effective Date"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Request Date" prop="RequestDate">
            <el-date-picker v-model="memoForm.RequestDate" type="date" placeholder="Request Date" disabled></el-date-picker>
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
          <el-form-item label="NameInsured(s)" prop="NameInsured">
            <el-input v-model="memoForm.NameInsured" placeholder="NameInsured(s)"></el-input>
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
        <el-col :span="12">
          <el-form-item label="Templates" prop="Templates">
            <el-select v-model="memoForm.Templates" placeholder="Templates" no-data-text="No Record" filterable multiple collapse-tags :disabled="memoForm.InsuranceCorpID === null" @change="changeTemplates(memoForm.Templates)">
              <el-option v-for="item in templatesList" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="newMemo-content" v-for="item in currentTemplates" :key="item.TemplateID">
      <div v-if="memoForm.Templates.length > 1" class="newMemo-content-template-title">{{item.Title}}</div>
      <div v-for="it in item.templateBlocks" :key="it.BlockID">
        <!--<div class="newMemo-content-block-title">{{item.BlockName}}</div>-->
        <div v-for="i in it.block.blockQuestions" :key="i.BlockQuestionID">
          <div class="answerMemo" v-if="i.question.TypeID === 1 && !i.question.isSkip">
            <div class="typeTitle"><span v-if="i.question.Label !== undefined && i.question.Label !== null && i.question.Label !== ''">{{i.question.Label}}&nbsp;&nbsp;</span>{{i.question.Description}}</div>
          </div>
          <div class="answerMemo" v-else-if="i.question.TypeID === 2 && !i.question.isSkip">
            <div class="typeReminder"><span v-if="i.question.Label !== undefined && i.question.Label !== null && i.question.Label !== ''">{{i.question.Label}}&nbsp;&nbsp;</span>{{i.question.Description}}</div>
          </div>
          <div class="answerMemo" v-else-if="i.question.TypeID === 3 && !i.question.isSkip">
            <AnswerProperty :question="i.question" :templateId="item.TemplateID" :blockSequenceNo="it.SequenceNo" :questionSequenceNo="i.SequenceNo" @changeValue="countShipNumber"></AnswerProperty>
          </div>
          <div class="answerMemo" v-else-if="i.question.TypeID === 4 && !i.question.isSkip">
            <AnswerSimpleAnswer :question="i.question"></AnswerSimpleAnswer>
          </div>
          <div class="answerMemo" v-else-if="i.question.TypeID === 5 && !i.question.isSkip">
            <AnswerFillInQuestion :question="i.question"></AnswerFillInQuestion>
          </div>
          <div class="answerMemo" v-else-if="i.question.TypeID === 6 && !i.question.isSkip">
            <AnswerSingleChoiceQuestion :question="i.question" :templateId="item.TemplateID" :blockSequenceNo="it.SequenceNo" :questionSequenceNo="i.SequenceNo" @changeValue="countShipNumber"></AnswerSingleChoiceQuestion>
          </div>
          <div class="answerMemo" v-else-if="i.question.TypeID === 7 && !i.question.isSkip">
            <AnswerMultipleChoiceQuestion :question="i.question"></AnswerMultipleChoiceQuestion>
          </div>
        </div>
      </div>
    </div>
    <div class="newMemo-submit">
      <el-button icon="el-icon-check" type="primary" @click="submit()" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany">Confirm</el-button>
    </div>
  </div>
</template>

<script>
import AnswerProperty from '@/component/property/answerProperty'
import AnswerSimpleAnswer from '@/component/simpleAnswer/answerSimpleAnswer'
import AnswerFillInQuestion from '@/component/fillInQuestion/answerFillInQuestion'
import AnswerSingleChoiceQuestion from '@/component/choiceQuestion/answerSingleChoiceQuestion'
import AnswerMultipleChoiceQuestion from '@/component/choiceQuestion/answerMultipleChoiceQuestion'
import moment from 'moment'

export default {
  components: {
    AnswerProperty,
    AnswerSimpleAnswer,
    AnswerFillInQuestion,
    AnswerSingleChoiceQuestion,
    AnswerMultipleChoiceQuestion
  },
  data: function () {
    return {
      isLoading: false,
      isLoadingTemplates: false,
      isLoadingInsuranceCompany: false,
      currentTemplates: [],
      memoForm: {
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        PolicyNumber: null,
        StatusID: 1,
        RequestDate: moment(new Date()),
        NameInsured: null,
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        Author: JSON.parse(this.$store.getters.getAccount).Name,
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
        PolicyNumber: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
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
    this.initTemplates()
    this.initInsuranceCompany()
  },
  methods: {
    // Templates列表
    initTemplates: function () {
      this.isLoadingTemplates = true
      this.axios.post('/api/Services/memoservice.asmx/SearchTemplates', {query: ''}).then(res => {
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
    // 选择保险公司
    changeInsuranceCompany: function () {
      this.memoForm.Templates = []
      this.currentTemplates = []
    },
    // 选择Templates
    changeTemplates: function (array) {
      let oldArray = this.currentTemplates.map(it => { return it.TemplateID })
      // 比对新旧数组，添加template
      for (let i = 0; i < array.length; i++) {
        if (oldArray.find(item => item === array[i]) === undefined) {
          this.isLoading = true
          this.axios.post('/api/Services/memoservice.asmx/GetTemplate', {templateid: array[i]}).then(res => {
            if (res) {
              console.log('添加Templates', res)
              let temp = res.data
              // 对所有问题赋值value、isSkip，选择题的每个选项赋值AdditionContent
              for (let p = 0; p < temp.templateBlocks.length; p++) {
                for (let q = 0; q < temp.templateBlocks[p].block.blockQuestions.length; q++) {
                  temp.templateBlocks[p].block.blockQuestions[q].question.Label = temp.templateBlocks[p].block.blockQuestions[q].Label
                  if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 6) {
                    temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = false
                    temp.templateBlocks[p].block.blockQuestions[q].question.value = null
                    temp.templateBlocks[p].block.blockQuestions[q].question.options.forEach(item => { item.AdditionContent = null })
                  } else if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 7) {
                    temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = false
                    temp.templateBlocks[p].block.blockQuestions[q].question.value = []
                    temp.templateBlocks[p].block.blockQuestions[q].question.options.forEach(item => { item.AdditionContent = null })
                  } else {
                    temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = false
                    temp.templateBlocks[p].block.blockQuestions[q].question.value = null
                  }
                }
              }
              // 根据保险公司，跳过baseOnQuestion的问题
              for (let p = 0; p < temp.templateBlocks.length; p++) {
                for (let q = 0; q < temp.templateBlocks[p].block.blockQuestions.length; q++) {
                  if (temp.templateBlocks[p].block.blockQuestions[q].RouteTypeID === 1) {
                    let skipNumber = 1
                    let routes = temp.templateBlocks[p].block.blockQuestions[q].routes.find(item => item.InsuranceCorpID === this.memoForm.InsuranceCorpID)
                    if (routes !== undefined) {
                      skipNumber = routes.MoveStep
                      if (skipNumber > 1) { // 如果跳过个数（n）大于1，isSkip属性赋true值
                        for (let i = 1; i < skipNumber; i++) {
                          temp.templateBlocks[p].block.blockQuestions[q + i].question.isSkip = true
                        }
                      }
                    }
                  }
                }
              }
              this.currentTemplates.push(temp)
            }
            this.isLoading = false
          }).catch(err => {
            console.log('添加Templates出错', err)
            this.isLoading = false
          })
        }
      }
      // 比对新旧数组，删除template
      for (let i = 0; i < oldArray.length; i++) {
        if (array.find(item => item === oldArray[i]) === undefined) {
          this.currentTemplates = this.currentTemplates.filter(item => item.TemplateID !== oldArray[i])
        }
      }
      // 自动填充title
      if (array.length === 0) {
        this.memoForm.Title = null
      } else if (array.length === 1) {
        this.memoForm.Title = this.templatesList.find(item => item.TemplateID === array[0]).Title
      } else {
        this.memoForm.Title = 'Multiple Changes'
      }
    },
    // 更新跳过个数
    countShipNumber: function (TemplateID, blockSequenceNo, questionSequenceNo, value) {
      let template = this.currentTemplates.find(item => item.TemplateID === TemplateID)
      let block = template.templateBlocks.find(item => item.SequenceNo === blockSequenceNo)
      let question = block.block.blockQuestions.find(item => item.SequenceNo === questionSequenceNo)
      let routes = question.routes.filter(item => item.InsuranceCorpID === this.memoForm.InsuranceCorpID)
      let skipNumber = 1
      // property
      if (question.question.TypeID === 3) {
        for (let i = 0; i < routes.length; i++) {
          if (isNaN(routes[i].Operand)) { // true代表非数字，字符串比较
            if (routes[i].Operator === '=' && value === routes[i].Operand) {
              skipNumber = routes[i].MoveStep
              break
            } else {
              skipNumber = 1
            }
          } else { // false代表是有效数字，数字比较
            if (routes[i].Operator === '=' && parseFloat(value) === parseFloat(routes[i].Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '>' && parseFloat(value) > parseFloat(routes[i].Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '<' && parseFloat(value) < parseFloat(routes[i].Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '>=' && parseFloat(value) >= parseFloat(routes[i].Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '<=' && parseFloat(value) <= parseFloat(routes[i].Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else {
              skipNumber = 1
            }
          }
        }
      }
      // singleChoice
      if (question.question.TypeID === 6) {
        // 单选题判断答案所属routes，得出跳过个数
        if (routes.find(item => parseFloat(item.Operand) === value) !== undefined) {
          skipNumber = routes.find(item => parseFloat(item.Operand) === value).MoveStep
        } else {
          skipNumber = 1
        }
      }
      if (skipNumber > 1) { // 如果跳过个数（n）大于1，对后面（n - 1）个问题赋null值（多选为[]），isSkip属性赋true值，同时执行countShipNumber发放，将这（n - 1）个问题处理的isSkip属性赋true值的问题，isSkip属性赋false值
        for (let i = 1; i < skipNumber; i++) {
          if (block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.TypeID === 7) {
            block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.value = []
            this.countShipNumber(TemplateID, blockSequenceNo, block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).SequenceNo, [])
          } else {
            block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.value = null
            this.countShipNumber(TemplateID, blockSequenceNo, block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).SequenceNo, null)
          }
          block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.isSkip = true
        }
      } else { // 如果跳过个数（n）等于1，对后面连续的n个SequenceNo大于当前SequenceNo且isSkip为true的问题，isSkip属性赋false值，如果SequenceNo大于当前SequenceNo且isSkip为false，跳出循环，避免影响后续的跳过（1跳过2，4跳过5,3的时候停止，不然5会被恢复可见）
        for (let i = 0; i < block.block.blockQuestions.length; i++) {
          if (block.block.blockQuestions[i].SequenceNo > questionSequenceNo) {
            if (block.block.blockQuestions[i].question.isSkip === true) {
              block.block.blockQuestions[i].question.isSkip = false
            } else {
              break
            }
          }
        }
      }
    },
    // 提交
    submit: function () {
      this.$refs['memoForm'].validate((valid) => {
        if (valid) {
          // 校验全部回答
          let allAnswer = true
          // form
          let form = JSON.parse(JSON.stringify(this.memoForm))
          // templates
          let templates = JSON.parse(JSON.stringify(this.currentTemplates))
          templates = templates.map(item => { return { TemplateID: item.TemplateID, Title: item.Title, memoBlocks: item.templateBlocks } })
          for (let i = 0; i < templates.length; i++) {
            // 过滤掉被隐藏的问题
            templates[i].memoBlocks = templates[i].memoBlocks.map(item => { return { BlockID: item.BlockID, normalAnswers: item.block.blockQuestions.filter(it => it.question.isSkip === false) } })
            for (let j = 0; j < templates[i].memoBlocks.length; j++) {
              for (let k = 0; k < templates[i].memoBlocks[j].normalAnswers.length; k++) {
                if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 1) {
                  // 问题类型为：Title
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: null,
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'Title'
                  }
                } else if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 2) {
                  // 问题类型为：Reminder
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: null,
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'Reminder'
                  }
                } else if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 3) {
                  // 问题类型为：Property
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: templates[i].memoBlocks[j].normalAnswers[k].question.value,
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'Property'
                  }
                  // 未回答
                  if (templates[i].memoBlocks[j].normalAnswers[k].AnswerDesc === '' || templates[i].memoBlocks[j].normalAnswers[k].AnswerDesc === null) {
                    allAnswer = false
                  }
                } else if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 4) {
                  // 问题类型为：SimpleAnswer
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: templates[i].memoBlocks[j].normalAnswers[k].question.value,
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'SimpleAnswer'
                  }
                  // 未回答
                  if (templates[i].memoBlocks[j].normalAnswers[k].AnswerDesc === '' || templates[i].memoBlocks[j].normalAnswers[k].AnswerDesc === null) {
                    allAnswer = false
                  }
                } else if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 5) {
                  // 问题类型为：Fillin
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    fillinAnswers: templates[i].memoBlocks[j].normalAnswers[k].question.fillinParts.map(it => {
                      return { FillinPartID: it.FillinPartID, IsFillin: it.IsFillin, Part: it.Part, FillinContent: it.FillinContent !== undefined ? it.FillinContent : '' }
                    }),
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: '',
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'Fillin'
                  }
                  // 未回答
                  if (templates[i].memoBlocks[j].normalAnswers[k].fillinAnswers.find(item => item.IsFillin + '|' + item.FillinContent === 'true|') !== undefined || templates[i].memoBlocks[j].normalAnswers[k].fillinAnswers.find(item => item.IsFillin + '|' + item.FillinContent === 'true|null') !== undefined) {
                    allAnswer = false
                  }
                } else if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 6) {
                  // 问题类型为：SingleChoice
                  let optionAnswer = {}
                  if (templates[i].memoBlocks[j].normalAnswers[k].question.value !== null) {
                    optionAnswer = {
                      ChoiceOptionID: templates[i].memoBlocks[j].normalAnswers[k].question.value,
                      OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                      Content: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(it => it.ChoiceOptionID === templates[i].memoBlocks[j].normalAnswers[k].question.value).Content,
                      Outputs: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(it => it.ChoiceOptionID === templates[i].memoBlocks[j].normalAnswers[k].question.value).Outputs,
                      AdditionContent: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(it => it.ChoiceOptionID === templates[i].memoBlocks[j].normalAnswers[k].question.value).AdditionContent
                    }
                    // NeedAddition为true但是未填写AdditionContent
                    let NeedAddition = templates[i].memoBlocks[j].normalAnswers[k].question.options.find(it => it.ChoiceOptionID === templates[i].memoBlocks[j].normalAnswers[k].question.value).NeedAddition
                    let AdditionContent = templates[i].memoBlocks[j].normalAnswers[k].question.options.find(it => it.ChoiceOptionID === templates[i].memoBlocks[j].normalAnswers[k].question.value).AdditionContent
                    if (NeedAddition && (AdditionContent === null || AdditionContent === '')) {
                      allAnswer = false
                    }
                  } else { // 未回答
                    allAnswer = false
                  }
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    optionAnswer: optionAnswer,
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: '',
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'SingleChoice'
                  }
                } else if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 7) {
                  // 问题类型为：MultipleChoice
                  let optionAnswers = []
                  if (templates[i].memoBlocks[j].normalAnswers[k].question.value.length > 0) {
                    optionAnswers = templates[i].memoBlocks[j].normalAnswers[k].question.value.map(it => {
                      return {
                        ChoiceOptionID: it,
                        OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                        Content: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(i => i.ChoiceOptionID === it).Content,
                        Outputs: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(i => i.ChoiceOptionID === it).Outputs,
                        AdditionContent: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(i => i.ChoiceOptionID === it).AdditionContent,
                        SequenceNo: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(i => i.ChoiceOptionID === it).SequenceNo,
                        NeedAddition: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(i => i.ChoiceOptionID === it).NeedAddition
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
                        ChoiceOptionID: it.ChoiceOptionID,
                        OutputModeID: it.OutputModeID,
                        Content: it.Content,
                        Outputs: it.Outputs,
                        AdditionContent: it.AdditionContent
                      }
                    })
                  } else { // 未回答
                    allAnswer = false
                  }
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    optionAnswers: optionAnswers,
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: '',
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'MultipleChoice'
                  }
                }
              }
            }
          }
          if (allAnswer) {
            form.memoTemplates = templates
            this.isLoading = true
            this.axios.post('/api/Services/memoservice.asmx/SaveMemo', {memo: JSON.stringify(form)}).then(res => {
              if (res) {
                console.log('新增', res)
                this.$message({
                  type: 'success',
                  message: 'Operation Succeeded'
                })
                this.$refs['memoForm'].resetFields()
                this.currentTemplates = []
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
