<!--
FileName: editMemoBody.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: The main edit part of the memo edition.
-->
<template>
<div>
  <div class="newMemo-content" v-for="ctemplate in memo.memoTemplates" :key="ctemplate.TemplateID">
    <div v-for="cblock in ctemplate.memoBlocks" :key="cblock.BlockID">
      <div v-for="answer in cblock.answers" :key="answer.QuestionID">
        <div v-if="answer.StatusID === 1">
          <div class="answerMemo" v-if="answer.TypeID === 1 && answer.StatusID === 1">
            <div class="typeTitle">
              <!--span v-if="answer.blockQuestion !== undefined && answer.blockQuestion.Label !== null && answer.blockQuestion.Label !== ''">{{answer.blockQuestion.Label}}&nbsp;&nbsp;</span-->
              {{answer.QuestionDesc}}
            </div>
          </div>
          <div clueass="answerMemo" v-else-if="answer.TypeID === 2 && answer.StatusID === 1">
            <div class="typeReminder">
              <!--span v-if="answer.blockQuestion !== undefined && answer.blockQuestion.Label !== null && answer.blockQuestion.Label !== ''">{{answer.blockQuestion.Label}}&nbsp;&nbsp;</span-->
              {{answer.QuestionDesc}}
            </div>
          </div>
          <div class="answerMemo" onloadstart="showAttribute(answer)" disabled="disabled" v-else-if="answer.TypeID === 3 && answer.StatusID === 1">
            <AnswerAttribute  ref="editAttribute" :answer="answer" :disabled="disabled" @changeValue="showNextQuestion(ctemplate, cblock, answer)"></AnswerAttribute>
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
import AnswerAttribute from '@/component/answerParts/attribute'
import AnswerSimpleAnswer from '@/component/simpleAnswer/CL_SimpleAnswer'
import AnswerFillInQuestion from '@/component/answerParts/FillInQuestion'
import AnswerSingleChoiceQuestion from '@/component/answerParts/SingleChoice'
import AnswerMultipleChoiceQuestion from '@/component/answerParts/MultipleChoice'

export default {
  components: {
    AnswerAttribute,
    AnswerSimpleAnswer,
    AnswerFillInQuestion,
    AnswerSingleChoiceQuestion,
    AnswerMultipleChoiceQuestion
  },
  name: 'editMemoBody',
  data: function () {
    return {
      isLoading: false
    }
  },
  props: {
    memo: {
      type: Object
    },
    insuranceCorps: {
      type: Array
    },
    disabled: Boolean
  },
  mounted: function () {
    this.viewMemo()
  },
  methods: {
    getAttribute: function (name) {
      for (let i = 0; i < this.memo.memoTemplates.length; i++) {
        let appTemp = this.memo.memoTemplates[i]
        for (let j = 0; j < appTemp.memoBlocks.length; j++) {
          let appBlock = appTemp.memoBlocks[j]
          let answer = appBlock.answers.find(a => a.DataSource === name)
          if (answer !== undefined) return answer.AnswerDesc
        }
      }
      return ''
    },
    getAttributeByName: function (name) {
      for (let i = 0; i < this.memo.memoTemplates.length; i++) {
        let appTemp = this.memo.memoTemplates[i]
        for (let j = 0; j < appTemp.memoBlocks.length; j++) {
          let appBlock = appTemp.memoBlocks[j]
          let answer = appBlock.answers.find(a => a.QuestionDesc === name)
          if (answer !== undefined) return answer
        }
      }
      return undefined
    },
    setMemo: function (m) {
      // this.memo = m
      console.log('setMemo,memo:' + m.Title)
    },
    showAttribute: function (answer) {
      if (this.$refs.editAttribute !== undefined) {
        // this.$refs.as.createNewSheet()
        this.$refs.editAttribute.parseAnswer(answer)
      }
    },
    viewMemo: function () {
      let value = this.memo.Title
      console.log('memo:' + value)
    },
    // 更新跳过个数
    countShipNumber: function (answer) {
      let question = answer.blockQuestion
      if (!answer.IsRoute) return 1
      let sign = answer.InputType
      let value = answer.AnswerDesc
      if (answer.TypeID === 6) value = answer.checkvalue
      let routes = question.routes.filter(item => item.InsuranceCorpID === this.memo.InsuranceCorpID)
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
            console.log('Operand=' + Operand + ', value=' + value)
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
      if (sign === 'number') {
        if (exp.indexOf('{EffectiveDate}.Year') >= 0) {
          let ed = new Date(this.memo.EffectiveDate)
          exp = exp.replace('{EffectiveDate}.Year', ed.getFullYear())
        }
        let corpid = this.memo.InsuranceCorpID
        let corp = this.insuranceCorps.find(c => c.InsuranceCorpID === corpid)
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
        exp = exp.replace('{EffectiveDate}', this.memo.EffectiveDate)
        return exp
      } else {
        return exp
      }
    },
    resetLeftAnswer: function (ctemplate, cblock, answer) {
      let currentTID = 0
      currentTID = this.memo.memoTemplates.findIndex(function (e) { return e.TemplateID === ctemplate.TemplateID })
      for (let i = currentTID + 1; i < this.memo.memoTemplates.length; i++) {
        let ct = this.memo.memoTemplates[i]
        this.resetTemplate(ct)
      }
      let currentBID = ctemplate.memoBlocks.findIndex(function (e) { return e.BlockID === cblock.BlockID })
      for (let i = currentBID + 1; i < ctemplate.memoBlocks.length; i++) {
        let cb = ctemplate.memoBlocks[i]
        this.resetBlock(cb)
      }
      let currentAID = cblock.answers.findIndex(function (e) { return e.QuestionID === answer.QuestionID })
      for (let i = currentAID + 1; i < cblock.answers.length; i++) {
        let ca = cblock.answers[i]
        ca.StatusID = 0
        if (ca.IsRoute && ca.TypeID === 6) {
          ca.checkvalue = 0
          ca.hasAnswer = false
        }
      }
    },
    resetTemplate: function (ct) {
      for (const cb of ct.memoBlocks) { this.resetBlock(cb) }
    },
    resetBlock: function (cb) {
      cb.answers.forEach(ca => {
        ca.StatusID = 0
        if (ca.IsRoute && ca.TypeID === 6) {
          ca.checkvalue = 0
          ca.hasAnswer = false
          // ca.StatusID = 0
        }
      })
    },
    checkOver: function () {
      this.memo.StatusID = 1
      this.memo.memoTemplates.forEach(ct => {
        ct.memoBlocks.forEach(cb => {
          cb.answers.forEach(ca => {
            if (ca.StatusID === 2 || ca.TypeID < 3) return
            if (ca.StatusID === 0) {
              this.memo.StatusID = 0
            }
            if ((ca.TypeID === 3 || ca.TypeID === 4) && (ca.AnswerDesc === null || ca.AnswerDesc.length === 0)) {
              this.memo.StatusID = 0
            }
            if (ca.TypeID === 5) {
              ca.partAnswers.forEach(pa => {
                if (pa.IsFillin && pa.Part.length === 0) {
                  this.memo.StatusID = 0
                }
              })
            } else if (ca.TypeID === 6 && ca.checkvalue === 0) {
              this.memo.StatusID = 0
            } else if (ca.TypeID === 7 && ca.checklist.length === 0) {
              this.memo.StatusID = 0
            }
          })
        })
      })
    },
    skipLeft: function (ctemplate, cblock, answer) {
      let currentTID = this.memo.memoTemplates.findIndex(function (e) { return e.TemplateID === ctemplate.TemplateID })
      for (let i = currentTID + 1; i < this.memo.memoTemplates.length; i++) {
        let ct = this.memo.memoTemplates[i]
        this.skipTemplate(ct)
      }
      let currentBID = ctemplate.memoBlocks.findIndex(function (e) { return e.BlockID === cblock.BlockID })
      for (let i = currentBID + 1; i < ctemplate.memoBlocks.length; i++) {
        let cb = ctemplate.memoBlocks[i]
        this.skipBlock(cb)
      }
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
      ct.memoBlocks.forEach(cb => {
        this.skipBlock(cb)
      })
    },
    // 显示下一个问题
    showNextQuestion: function (ctemplate, cblock, answer) {
      if (answer.hasAnswer === false) return
      answer.hasAnswer = true
      if (answer.IsRoute) this.resetLeftAnswer(ctemplate, cblock, answer)
      let skipsteps = this.countShipNumber(answer)
      if (skipsteps > 0) {
        for (let i = 0; i < cblock.answers.length; i++) {
          if (cblock.answers[i].QuestionID === answer.QuestionID) {
            for (let j = i + 1; j < i + skipsteps; j++) {
              if (j >= cblock.answers.length) break
              cblock.answers[j].StatusID = 2
            }
            if (i + skipsteps >= cblock.answers.length) {
              this.showNextBlock(ctemplate, cblock)
            } else {
              let ca = cblock.answers[i + skipsteps]
              ca.StatusID = 1
              if (ca.hasAnswer || ca.TypeID < 3) this.showNextQuestion(ctemplate, cblock, ca)
            }
            break
          }
        }
      } else if (skipsteps === -1) {
        // 完成答卷
        this.skipLeft(ctemplate, cblock, answer)
      }
      this.checkOver()
    },
    showNextBlock: function (ctemplate, cblock) {
      for (let i = 0; ctemplate.memoBlocks.length > i; i++) {
        if (ctemplate.memoBlocks[i].BlockID === cblock.BlockID) {
          if (i === ctemplate.memoBlocks.length - 1) {
            this.showNextTemplate(ctemplate)
            break
          }
          let block = ctemplate.memoBlocks[i + 1]
          if (block.answers.length > 0) {
            let ca = block.answers[0]
            ca.StatusID = 1
            if (ca.TypeID < 3) ca.hasAnswer = true
            if (ca.hasAnswer) this.showNextQuestion(ctemplate, block, ca)
            // block.answers[0].StatusID = 1
          } else this.showNextBlock(ctemplate, block)
          break
        }
      }
    },
    showNextTemplate: function (ctemplate) {
      for (let i = 0; this.memo.memoTemplates.length > i; i++) {
        if (this.memo.memoTemplates[i].TemplateID === ctemplate.TemplateID) {
          if (i === this.memo.memoTemplates.length - 1) {
            this.memo.StatusID = 1
            return
          }
          let template = this.memo.memoTemplates[i + 1]
          if (template.memoBlocks.length > 0) {
            if (template.memoBlocks[0].answers.length > 0) template.memoBlocks[0].answers[0].StatusID = 1
            else {
              this.showNextBlock(template, template.memoBlocks[0])
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
