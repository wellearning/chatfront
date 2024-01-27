<template>
  <div>
    <div v-if="dataReady" class="newMemo-content" v-for="ctemplate in application.applicationTemplates" :key="ctemplate.TemplateID">
      <div v-for="cblock in ctemplate.applicationBlocks" :key="cblock.BlockID">
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
            <div class="answerMemo" onloadstart="showAttribute(answer)" disabled="disabled" v-else-if="answer.TypeID === 3 && answer.StatusID === 1">
              <AnswerAttribute ref="editAttribute" :answer="answer" :disabled="disabled" @changeValue="changeVal(ctemplate, cblock, answer)"></AnswerAttribute>
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
import AnswerFillInQuestion from '@/component/fillInQuestion/CL_FillInQuestionAnswer'
import AnswerSingleChoiceQuestion from '@/component/choiceQuestion/CL_SingleChoiceQuestionAnswer'
import AnswerMultipleChoiceQuestion from '@/component/choiceQuestion/CL_MultipleChoiceQuestionAnswer'
import {isNumeric} from 'echarts/lib/util/number'

export default {
  components: {
    AnswerAttribute,
    AnswerSimpleAnswer,
    AnswerFillInQuestion,
    AnswerSingleChoiceQuestion,
    AnswerMultipleChoiceQuestion
  },
  name: 'editCoverLetterBody',
  data: function () {
    return {
      isLoading: false,
      dataReady: true,
      rateTypes: [],
      computedAttributes: [], // 需要计算的属性
      computableAttributes: [], // 可参与计算的属性
      operandAttributes: [], // 实际参与计算的属性
      operandRateTypes: [], // 实际参与计算的系数表
      ratableAttributes: [], // 可参与检索系数表的属性，是list类的属性
      rateItems: [], // 系数表涉及参数值列表集
      rateAttributes: [] // 系数表涉及的属性
    }
  },
  props: {
    application: {
      type: Object
    },
    disabled: Boolean
  },
  mounted: function () {
    this.setComputedAttributes()
    this.setRateTypes()
    // this.viewCoverLetter()
  },
  methods: {
    // 加载计算环境
    setComputedAttributes: function () {
      this.computedAttributes = []
      for (let i = 0; i < this.application.applicationTemplates.length; i++) {
        let appTemp = this.application.applicationTemplates[i]
        for (let j = 0; j < appTemp.applicationBlocks.length; j++) {
          let appBlock = appTemp.applicationBlocks[j]
          for (let k = 0; k < appBlock.answers.length; k++) {
            let answer = appBlock.answers[k]
            if (answer.InputType === 'computed') {
              let oprands = this.getOperands(answer.DataSource)
              answer.operands = oprands
              this.computedAttributes.push(answer)
            }
            if (answer.InputType === 'number' || answer.InputType === 'money' || answer.InputType === 'computed') {
              this.computableAttributes.push(answer)
            } else if (answer.InputType === 'list') {
              this.ratableAttributes.push(answer)
            }
          }
        }
      }
      console.log('computableAttributes', this.computableAttributes)
      for (let i = 0; i < this.computedAttributes.length; i++) {
        let attr = this.computedAttributes[i]
        for (let j = 0; j < attr.operands.length; j++) {
          let oper = attr.operands[j]
          let operAttr = this.computableAttributes.find(a => a.QuestionDesc === oper)
          if (operAttr === undefined) {
            this.operandRateTypes.push(oper)
          } else {
            let operAttr1 = this.operandAttributes.find(a => a.QuestionDesc === oper)
            if (operAttr1 === undefined) this.operandAttributes.push(operAttr)
          }
        }
      }
    },
    setRateTypes: function () {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetDataItems', {datatype: 'RateType'}).then(res => {
        if (res) {
          console.log('Load RateTypes', res)
          let types = res.data
          this.rateTypes = types
          for (let i = 0; i < types.length; i++) {
            let type = types[i]
            let typename = this.operandRateTypes.find(t => t === type.Name)
            if (typename === undefined) continue
            this.loadRateType(type)
          }
        }
        this.isLoading = false
      }).catch(err => {
        console.log('Load RateTypes出错', err)
        this.isLoading = false
      })
    },
    loadRateType: function (rateType) {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetBusiRateType', {typeid: rateType.ItemID}).then(res => {
        if (res) {
          console.log('loadRateType查询', res)
          rateType.type = res.data
          let busiItems = res.data.busiItems
          for (let i = 0; i < busiItems.length; i++) {
            let itemName = busiItems[i].Name
            let attr = this.ratableAttributes.find(a => a.DataSource === itemName)
            if (attr !== undefined) {
              this.rateAttributes.push(attr)
              let rateItem = {name: itemName, itemValues: res.data.busiItemValues[i]}
              this.rateItems.push(rateItem)
            }
          }
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadRateType出错', err)
        this.isLoading = false
      })
    },
    computeAttribute: function (answer) {
      let express = answer.DataSource
      console.log('express: ' + express)
      let operds = this.getOperands(express)
      for (let i = 0; i < operds.length; i++) {
        let op = operds[i]
        let operand = this.getOperandValue(op)
        express = express.replace(op, operand)
      }
      console.log('express: ' + express)
      let value = this.evalNPN(express)
      console.log('express value: ' + value)
      answer.AnswerDesc = '' + value
    },
    getOperandValue: function (op) {
      if (isNumeric(op)) return op
      let attr = this.operandAttributes.find(a => a.QuestionDesc === op)
      if (attr !== undefined) return attr.AnswerDesc
      let rateType = this.rateTypes.find(t => t.Name === op)
      if (rateType === undefined) return '0'
      let busiItems = rateType.type.busiItems
      let busiItemValues = rateType.type.busiItemValues
      let rates = rateType.type.rates
      let ids = ''
      for (let i = 0; i < busiItems.length; i++) {
        let busiItem = busiItems[i]
        if (busiItem.ItemValue === 'list') {
          let itemName = busiItems[i].Name
          let itemValue = this.rateAttributes.find(a => a.DataSource === itemName) // this.getAttribute(itemName)
          if (itemValue === undefined) {
            console.log('itemValue is undefined, itemName is' + itemName)
            return '0'
          }
          let colValue = busiItemValues[i].find(bi => bi.Name === itemValue.AnswerDesc)
          if (colValue === undefined) {
            console.log('colValue is undefined, itemName is' + itemName)
            return '0'
          }
          ids = colValue.ItemID + ids
        } else if (busiItem.ItemValue === 'interval') {
          // 取值区间数值
          let itemValues = busiItemValues[i]
          let attribute = this.computableAttributes.find(a => a.QuestionDesc === busiItem.Name)
          if (attribute === undefined) return 0
          let attrValue = Number(attribute.AnswerDesc)
          for (let j = 0; j < itemValues.length; j++) {
            let interval = this.retrieveInterval(itemValues[j].ItemValue)
            if (this.compareInterval(interval, attrValue)) {
              ids = itemValues[j].ItemID + ids
              break
            }
          }
        }
      }
      ids = Number(ids)
      let rate = rates.find(r => r.BusiItemIDs === ids)
      if (rate === undefined) return '0'
      return rate.Rate
    },
    getAttribute: function (name) {
      for (let i = 0; i < this.application.applicationTemplates.length; i++) {
        let appTemp = this.application.applicationTemplates[i]
        for (let j = 0; j < appTemp.applicationBlocks.length; j++) {
          let appBlock = appTemp.applicationBlocks[j]
          let answer = appBlock.answers.find(a => a.DataSource === name)
          if (answer !== undefined) return answer.AnswerDesc
        }
      }
      return ''
    },
    showAttribute: function (answer) {
      if (this.$refs.editAttribute !== undefined) {
        for (let i = 0; i < this.$refs.editAttribute.length; i++) {
          let ref = this.$refs.editAttribute[i]
          if (ref.answer.QuestionID !== answer.QuestionID) continue
          ref.parseAnswer(answer)
        }
      }
    },
    viewCoverLetter: function () {
      console.log('disabled:' + this.disabled)
    },
    // 更新跳过个数
    countShipNumber: function (answer) {
      let question = answer.blockQuestion
      if (!answer.IsRoute) return {skipNumber: 1, routeLevel: 0}
      let sign = answer.InputType
      let value = answer.AnswerDesc
      if (answer.TypeID === 6) value = answer.checkvalue
      let routes = question.routes.filter(item => item.InsuranceCorpID === this.application.InsuranceCorpID)
      if (routes.length === 0) {
        routes = question.routes.filter(item => item.InsuranceCorpID === 0)
      }
      let skipNumber = 1
      let routeLevel = 0
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
        let route = routes.find(item => parseFloat(item.Operand) === value)
        if (route !== undefined) {
          skipNumber = route.MoveStep
          routeLevel = route.RouteLevel
        } else {
          skipNumber = 1
        }
      }
      let skip = {skipNumber: skipNumber, routeLevel: routeLevel}
      return skip
    },
    // 解析操作数
    parseOperand: function (exp, sign) {
      if (sign === 'number') {
        let ed = new Date(this.EffectiveDate)
        exp = exp.replace('{EffectiveDate}.Year', ed.getFullYear())
        let corpid = this.application.InsuranceCorpID
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
    resetLeftAnswer: function (ctemplate, cblock, answer) {
      let currentTID = 0
      currentTID = this.application.applicationTemplates.findIndex(function (e) { return e.TemplateID === ctemplate.TemplateID })
      for (let i = currentTID + 1; i < this.application.applicationTemplates.length; i++) {
        let ct = this.application.applicationTemplates[i]
        this.resetTemplate(ct)
      }
      let currentBID = ctemplate.applicationBlocks.findIndex(function (e) { return e.BlockID === cblock.BlockID })
      for (let i = currentBID + 1; i < ctemplate.applicationBlocks.length; i++) {
        let cb = ctemplate.applicationBlocks[i]
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
      for (const cb of ct.applicationBlocks) { this.resetBlock(cb) }
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
      this.application.StatusID = 1
      this.application.applicationTemplates.forEach(ct => {
        ct.applicationBlocks.forEach(cb => {
          cb.answers.forEach(ca => {
            if (ca.StatusID === 2) return
            if (ca.StatusID === 0) this.application.StatusID = 0
            if ((ca.TypeID === 3 || ca.TypeID === 4) && (ca.AnswerDesc === null || ca.AnswerDesc.length === 0)) this.application.StatusID = 0
            if (ca.TypeID === 5) {
              ca.partAnswers.forEach(pa => {
                if (pa.IsFillin && pa.Part.length === 0) {
                  this.application.StatusID = 0
                }
              })
            } else if (ca.TypeID === 6 && ca.checkvalue === 0) this.application.StatusID = 0
            else if (ca.TypeID === 7 && ca.checklist.length === 0) this.application.StatusID = 0
          })
        })
      })
    },
    skipLeft: function (ctemplate, cblock, answer) {
      let currentTID = this.application.applicationTemplates.findIndex(function (e) { return e.TemplateID === ctemplate.TemplateID })
      for (let i = currentTID + 1; i < this.application.applicationTemplates.length; i++) {
        let ct = this.application.applicationTemplates[i]
        this.skipTemplate(ct)
      }
      let currentBID = ctemplate.applicationBlocks.findIndex(function (e) { return e.BlockID === cblock.BlockID })
      for (let i = currentBID + 1; i < ctemplate.applicationBlocks.length; i++) {
        let cb = ctemplate.applicationBlocks[i]
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
      ct.applicationBlocks.forEach(cb => {
        this.skipBlock(cb)
      })
    },
    recomputeAttributes: function () {
      for (let i = 0; i < this.computedAttributes.length; i++) {
        let answer = this.computedAttributes[i]
        if (answer.StatusID === 1) this.computeAttribute(answer)
        // this.showAttribute(answer)
      }
      /*
      for (let i = 0; i < this.application.applicationTemplates.length; i++) {
        let at = this.application.applicationTemplates[i]
        for (let j = 0; j < at.applicationBlocks.length; j++) {
          let ab = at.applicationBlocks[j]
          let computedAttributes = ab.answers.filter(a => a.InputType === 'computed')
          for (let k = 0; k < computedAttributes.length; k++) {
            let answer = computedAttributes[k]
            this.showAttribute(answer)
          }
        }
      }
      */
    },
    changeVal: function (ctemplate, cblock, answer) {
      if (answer.InputType !== 'computed') this.recomputeAttributes()
      this.showNextQuestion(ctemplate, cblock, answer)
    },
    // 显示下一个问题
    showNextQuestion: function (ctemplate, cblock, answer) {
      if (answer.hasAnswer === false) return
      answer.hasAnswer = true
      if (answer.IsRoute) this.resetLeftAnswer(ctemplate, cblock, answer)
      let skip = this.countShipNumber(answer)
      if (skip.routeLevel === 1) {
        let skipBlockId = skip.skipNumber
        let passLine = false
        skip.routeLevel = 0
        skip.skipNumber = 1
        for (let i = 0; i < ctemplate.applicationBlocks.length; i++) {
          let block = ctemplate.applicationBlocks[i]
          if (block.BlockID === skipBlockId) {
            if (passLine) {
              // 只有在当前Block之后的Block才有效
              this.showSkipBlock(ctemplate, block)
              skip.routeLevel = 1
            }
            break
          }
          if (block.BlockID === cblock.BlockID) passLine = true
        }
      }
      if (skip.routeLevel === 0) {
        let skipsteps = skip.skipNumber
        if (skipsteps > 0) {
          for (let i = 0; i < cblock.answers.length; i++) {
            if (cblock.answers[i].QuestionID === answer.QuestionID) {
              for (let j = i + 1; j < i + skipsteps; j++) {
                if (j >= cblock.answers.length) break
                cblock.answers[j].StatusID = 2
              }
              if (i + skipsteps >= cblock.answers.length) this.showNextBlock(ctemplate, cblock)
              else {
                let ca = cblock.answers[i + skipsteps]
                ca.StatusID = 1
                if (ca.hasAnswer) this.showNextQuestion(ctemplate, cblock, ca)
                if (ca.InputType === 'computed') {
                  this.computeAttribute(ca)
                  this.showNextQuestion(ctemplate, cblock, ca)
                  // let ca0 = this.computedAttributes.find(a => a.QuestionID === ca.QuestionID)
                  // if (ca0 === undefined) this.computedAttributes.push(ca)
                }
              }
              break
            }
          }
        } else if (skipsteps === -1) {
          // 完成答卷
          this.skipLeft(ctemplate, cblock, answer)
        }
      }
      this.checkOver()
    },
    showSkipBlock: function (ctemplate, block) {
      if (block !== undefined) {
        if (block.answers.length > 0) {
          let ca = block.answers[0]
          ca.StatusID = 1
          if (ca.hasAnswer) this.showNextQuestion(ctemplate, block, ca)
        }
      }
    },
    showNextBlock: function (ctemplate, cblock) {
      for (let i = 0; ctemplate.applicationBlocks.length > i; i++) {
        if (ctemplate.applicationBlocks[i].BlockID === cblock.BlockID) {
          if (i === ctemplate.applicationBlocks.length - 1) {
            this.showNextTemplate(ctemplate)
            break
          }
          let block = ctemplate.applicationBlocks[i + 1]
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
      for (let i = 0; this.application.applicationTemplates.length > i; i++) {
        if (this.application.applicationTemplates[i].TemplateID === ctemplate.TemplateID) {
          if (i === this.application.applicationTemplates.length - 1) {
            this.application.StatusID = 1
            return
          }
          let template = this.application.applicationTemplates[i + 1]
          if (template.applicationBlocks.length > 0) {
            if (template.applicationBlocks[0].answers.length > 0) template.applicationBlocks[0].answers[0].StatusID = 1
            else {
              this.showNextBlock(template, template.applicationBlocks[0])
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
