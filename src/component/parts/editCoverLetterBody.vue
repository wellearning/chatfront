<!--
FileName: editCoverLetterBody.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: The main edit part of the cover letter edition.
-->
<template>
<div>
  <div class="newMemo-content" v-for="ctemplate in coverLetter.coverLetterTemplates" :key="ctemplate.TemplateID">
    <div v-for="cblock in ctemplate.coverLetterBlocks" :key="cblock.BlockID">
      <!--<div class="newMemo-content-block-title">{{item.BlockName}}</div>-->
      <div v-for="answer in cblock.answers" :key="answer.QuestionID">
        <div v-if="answer.StatusID === 1">
          <div class="answerMemo" v-if="answer.TypeID === 1 && answer.StatusID === 1">
            <div class="typeTitle">
              <span v-if="answer.blockQuestion.Label !== undefined && answer.blockQuestion.Label !== null && answer.blockQuestion.Label !== ''">{{answer.blockQuestion.Label}}&nbsp;&nbsp;</span>
              {{answer.QuestionDesc}}
            </div>
          </div>
          <div clueass="answerMemo" v-else-if="answer.TypeID === 2 && answer.StatusID === 1">
            <div class="typeReminder">
              <span v-if="answer.blockQuestion.Label !== undefined && answer.blockQuestion.Label !== null && answer.blockQuestion.Label !== ''">{{answer.blockQuestion.Label}}&nbsp;&nbsp;</span>
              {{answer.QuestionDesc}}
            </div>
          </div>
          <div class="answerMemo" disabled="disabled" v-else-if="answer.TypeID === 3 && answer.StatusID === 1">
            <AnswerProperty :answer="answer" :disabled="disabled" @changeValue="showNextQuestion(ctemplate, cblock, answer)"></AnswerProperty>
          </div>
          <div class="answerMemo" v-else-if="answer.TypeID === 4 && answer.StatusID === 1">
            <AnswerSimpleAnswer :answer="answer" :disabled="disabled"  @changeValue="showNextQuestion(ctemplate, cblock, answer)"></AnswerSimpleAnswer>
          </div>
          <div class="answerMemo" v-else-if="answer.TypeID === 5 && answer.StatusID === 1">
            <AnswerFillInQuestion :answer="answer" :disabled="disabled"  @changeValue="showNextQuestion(ctemplate, cblock, answer)"></AnswerFillInQuestion>
          </div>
          <div class="answerMemo" v-else-if="answer.TypeID === 6 && answer.StatusID === 1">
            <AnswerSingleChoiceQuestion :answer="answer" :disabled="disabled" @changeValue="showNextQuestion(ctemplate, cblock, answer)"></AnswerSingleChoiceQuestion>
          </div>
          <div class="answerMemo" v-else-if="answer.TypeID === 7 && answer.StatusID === 1">
            <AnswerMultipleChoiceQuestion :answer="answer" :disabled="disabled"  @changeValue="showNextQuestion(ctemplate, cblock, answer)"></AnswerMultipleChoiceQuestion>
          </div>
        </div>
      </div>
    </div>
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
  name: 'editCoverLetterBody',
  data: function () {
    return {
      isLoading: false
    }
  },
  props: {
    coverLetter: {
      type: Object
    },
    disabled: Boolean
  },
  mounted: function () {
    this.viewCoverLetter()
  },
  methods: {
    viewCoverLetter: function () {
      console.log('disabled:' + this.disabled)
    },
    // 更新跳过个数
    countShipNumber: function (answer) {
      if (!answer.IsRoute) return 1
      let question = answer.blockQuestion
      if (question === null) {
        return 1
      }
      let sign = answer.InputType
      let value = answer.AnswerDesc
      if (answer.TypeID === 6) value = answer.checkvalue
      let routes = question.routes.filter(item => item.InsuranceCorpID === this.coverLetter.InsuranceCorpID)
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
      } else if (answer.IsRoute && question.RouteTypeID === 2 && answer.TypeID === 6) { // baseOnAnswer singleChoice
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
        let corpid = this.coverLetter.InsuranceCorpID
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
        exp = exp.replace('{RequestDate}', this.RequestDate)
        return exp
      } else {
        return exp
      }
    },
    resetLeftAnswer: function (ctemplate, cblock, answer) {
      let currentTID = 0
      currentTID = this.coverLetter.coverLetterTemplates.findIndex(function (e) { return e.TemplateID === ctemplate.TemplateID })
      for (let i = currentTID + 1; i < this.coverLetter.coverLetterTemplates.length; i++) {
        let ct = this.coverLetter.coverLetterTemplates[i]
        this.resetTemplate(ct)
      }
      let currentBID = ctemplate.coverLetterBlocks.findIndex(function (e) { return e.BlockID === cblock.BlockID })
      for (let i = currentBID + 1; i < ctemplate.coverLetterBlocks.length; i++) {
        let cb = ctemplate.coverLetterBlocks[i]
        this.resetBlock(cb)
      }
      let currentAID = cblock.answers.findIndex(function (e) { return e.QuestionID === answer.QuestionID })
      for (let i = currentAID + 1; i < cblock.answers.length; i++) {
        let ca = cblock.answers[i]
        ca.StatusID = 0
        if (ca.IsRoute && ca.TypeID === 6) {
          ca.checkvalue = 0
          ca.hasAnswer = false
          // ca.StatusID = 0
        }
        /*
        if (ca.StatusID > 0) {
          if (ca.hasAnswer === undefined) ca.StatusID = 0
          else if (!ca.hasAnswer) ca.StatusID = 0
          else ca.StatusID = 1
        }
        */
      }
    },
    resetTemplate: function (ct) {
      for (const cb of ct.coverLetterBlocks) { this.resetBlock(cb) }
    },
    resetBlock: function (cb) {
      cb.answers.forEach(ca => {
        ca.StatusID = 0
        if (ca.IsRoute && ca.TypeID === 6) {
          ca.checkvalue = 0
          ca.hasAnswer = false
          // ca.StatusID = 0
        }
        /*
        if (ca.StatusID > 2) {
          if (ca.hasAnswer !== undefined) ca.StatusID = 0
          else if (!ca.hasAnswer) ca.StatusID = 0
          else ca.StatusID = 1
        }
        */
      })
    },
    checkOver: function () {
      this.coverLetter.StatusID = 1
      this.coverLetter.coverLetterTemplates.forEach(ct => {
        ct.coverLetterBlocks.forEach(cb => {
          cb.answers.forEach(ca => {
            if (ca.StatusID === 2) return
            if (ca.StatusID === 0) this.coverLetter.StatusID = 0
            if ((ca.TypeID === 3 || ca.TypeID === 4) && (ca.AnswerDesc === null || ca.AnswerDesc.length === 0)) this.coverLetter.StatusID = 0
            if (ca.TypeID === 5) {
              ca.partAnswers.forEach(pa => {
                if (pa.IsFillin && pa.Part.length === 0) {
                  this.coverLetter.StatusID = 0
                }
              })
            } else if (ca.TypeID === 6 && ca.checkvalue === 0) this.coverLetter.StatusID = 0
            else if (ca.TypeID === 7 && ca.checklist.length === 0) this.coverLetter.StatusID = 0
          })
        })
      })
    },
    skipLeft: function (ctemplate, cblock, answer) {
      let currentTID = this.coverLetter.coverLetterTemplates.findIndex(function (e) { return e.TemplateID === ctemplate.TemplateID })
      for (let i = currentTID + 1; i < this.coverLetter.coverLetterTemplates.length; i++) {
        let ct = this.coverLetter.coverLetterTemplates[i]
        this.skipTemplate(ct)
      }
      let currentBID = ctemplate.coverLetterBlocks.findIndex(function (e) { return e.BlockID === cblock.BlockID })
      for (let i = currentBID + 1; i < ctemplate.coverLetterBlocks.length; i++) {
        let cb = ctemplate.coverLetterBlocks[i]
        this.skipBlock(cb)
      }
      this.skipBlockLeft(cblock, answer)
    },
    skipBlockLeft: function (cblock, answer) {
      let currentAID = cblock.answers.findIndex(function (e) { return e.QuestionID === answer.QuestionID })
      for (let i = currentAID + 1; i < cblock.answers.length; i++) {
        let ca = cblock.answers[i]
        ca.StatusID = 2
      }
    },
    skipBlock: function (cb) {
      cb.answers.forEach(ca => {
        ca.StatusID = 2
      })
    },
    skipTemplate: function (ct) {
      ct.coverLetterBlocks.forEach(cb => {
        this.skipBlock(cb)
      })
    },
    // 显示下一个问题
    showNextQuestion: function (ctemplate, cblock, answer) {
      if (answer.hasAnswer === false) return
      answer.hasAnswer = true
      if (answer.IsRoute) this.resetLeftAnswer(ctemplate, cblock, answer)
      let skipsteps = this.countShipNumber(answer)
      // if (skipsteps !== 0) {
      if (skipsteps > 0) {
        for (let i = 0; i < cblock.answers.length; i++) {
          if (cblock.answers[i].QuestionID === answer.QuestionID) {
            for (let j = i + 1; j < i + skipsteps; j++) {
              if (j >= cblock.answers.length) break
              cblock.answers[j].StatusID = 2
            }
            if (i + skipsteps >= cblock.answers.length) this.showNextBlock(ctemplate, cblock)
            else {
              // cblock.answers[i + skipsteps].StatusID = 1
              let ca = cblock.answers[i + skipsteps]
              ca.StatusID = 1
              if (ca.hasAnswer) this.showNextQuestion(ctemplate, cblock, ca)
            }
            break
          }
        }
      } else if (skipsteps === -2) {
        // 完成答卷
        this.skipBlock(cblock, answer)
        // this.coverLetter.StatusID = 1
      } else if (skipsteps === -1) {
        // 完成答卷
        this.skipLeft(ctemplate, cblock, answer)
        // this.coverLetter.StatusID = 1
      }
      this.checkOver()
    },
    showNextBlock: function (ctemplate, cblock) {
      for (let i = 0; ctemplate.coverLetterBlocks.length > i; i++) {
        if (ctemplate.coverLetterBlocks[i].BlockID === cblock.BlockID) {
          if (i === ctemplate.coverLetterBlocks.length - 1) {
            this.showNextTemplate(ctemplate)
            break
          }
          let block = ctemplate.coverLetterBlocks[i + 1]
          if (block.answers.length > 0) {
            let ca = block.answers[0]
            ca.StatusID = 1
            if (ca.hasAnswer) this.showNextQuestion(ctemplate, block, ca)
            // block.answers[0].StatusID = 1
          } else this.showNextBlock(ctemplate, block)
          break
        }
      }
    },
    showNextTemplate: function (ctemplate) {
      for (let i = 0; this.coverLetter.coverLetterTemplates.length > i; i++) {
        if (this.coverLetter.coverLetterTemplates[i].TemplateID === ctemplate.TemplateID) {
          if (i === this.coverLetter.coverLetterTemplates.length - 1) {
            this.coverLetter.StatusID = 1
            return
          }
          let template = this.coverLetter.coverLetterTemplates[i + 1]
          if (template.coverLetterBlocks.length > 0) {
            if (template.coverLetterBlocks[0].answers.length > 0) template.coverLetterBlocks[0].answers[0].StatusID = 1
            else {
              this.showNextBlock(template, template.coverLetterBlocks[0])
            }
          }
          break
        }
      }
    }

  }
}
</script>

<style scoped>

</style>
