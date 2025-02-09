<template>
  <div v-if="directionBlock !== null">
    <div v-for="answer in directionBlock.answers" :key="answer.QuestionID">
      <!--div>answer: {{ answer.QuestionID}} StatusID: {{answer.StatusID}}</div-->
      <div v-if="answer.StatusID === 1">
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
        <div class="answerMemo" onloadstart="showAttribute(answer)" disabled="disabled" v-else-if="answer.TypeID === 3 && answer.StatusID === 1">
          <AnswerAttribute ref="editAttribute" :answer="answer"  @changeValue="changeVal(answer)"></AnswerAttribute>
        </div>
        <div class="answerMemo" v-else-if="answer.TypeID === 4 && answer.StatusID === 1">
          <AnswerSimpleAnswer :answer="answer"  @changeValue="showNextQuestion(answer)"></AnswerSimpleAnswer>
        </div>
        <div class="answerMemo" v-else-if="answer.TypeID === 5 && answer.StatusID === 1">
          <AnswerFillInQuestion :answer="answer"  @changeValue="showNextQuestion(answer)"></AnswerFillInQuestion>
        </div>
        <div class="answerMemo" v-else-if="answer.TypeID === 6 && answer.StatusID === 1">
          <AnswerSingleChoiceQuestion :answer="answer" @changeValue="showNextQuestion(answer)"></AnswerSingleChoiceQuestion>
        </div>
        <div class="answerMemo" v-else-if="answer.TypeID === 7 && answer.StatusID === 1">
          <AnswerMultipleChoiceQuestion :answer="answer"  @changeValue="showNextQuestion(answer)"></AnswerMultipleChoiceQuestion>
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

export default {
  components: {
    AnswerAttribute,
    AnswerSimpleAnswer,
    AnswerFillInQuestion,
    AnswerSingleChoiceQuestion,
    AnswerMultipleChoiceQuestion
  },
  name: 'editApplicationBlock',
  data: function () {
    return {
      isLoading: false,
      dataReady: true,
      directionBlock: null
    }
  },
  props: {
    busiTypeID: {
      type: Number
    }
  },
  mounted: function () {
    this.getDirectionBlock()
  },
  methods: {
    getDirectionBlock: function () {
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetNewDirectionBlock', {}).then(res => {
        if (res) {
          console.log('getDirectionBlock', res)
          if (res.data === null) {
            this.$emit('directReady')
            return
          }
          this.directionBlock = res.data
        }
        this.isLoading = false
      }).catch(err => {
        console.log('getDirectionBlock', err)
        this.isLoading = false
      })
    },
    // 更新跳过个数
    countShipNumber: function (answer) {
      if (!answer.IsRoute) return {skipNumber: 1, routeLevel: 0}
      let question = answer.blockQuestion
      if (question === null) {
        console.log('No blockquestion answer:', answer)
      }
      let sign = answer.InputType
      let value = answer.AnswerDesc
      if (answer.TypeID === 6) value = answer.checkvalue
      let routes = question.routes.filter(item => item.InsuranceCorpID === 0)
      let skipNumber = 1
      let routeLevel = 0
      if (question.RouteTypeID === 1) { // baseOnQuestion
        skipNumber = routes[0].MoveStep
        routeLevel = routes[0].RouteLevel
      } else if (question.RouteTypeID === 2 && answer.TypeID === 3) { // baseOnAnswer property
        for (let i = 0; i < routes.length; i++) {
          routeLevel = routes[i].RouteLevel
          // 变量转换为具体值，定义OperandCurrent，避免修改EffectiveDate时，无法再次匹配到{EffectiveDate}
          let Operand = routes[i].Operand // this.parseOperand(routes[i].Operand, sign)
          // 日期型property把operand和value转成时间戳
          if (sign === 'date') {
            Operand = moment(Operand).valueOf()
            value = moment(value).valueOf()
          }
          if (isNaN(Operand)) { // true代表非数字，字符串比较
            if (routes[i].Operator === '=' && value === Operand) {
              skipNumber = routes[i].MoveStep
              routeLevel = routes[i].RouteLevel
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
    resetLeftAnswer: function (answer) {
      let cblock = this.directionBlock
      let index = cblock.answers.indexOf(answer)
      for (let i = index + 1; i < cblock.answers.length; i++) {
        let ca = cblock.answers[i]
        ca.StatusID = 0
        ca.hasAnswer = false
        ca.AnswerDesc = ''
        if (ca.IsRoute && ca.TypeID === 6) {
          ca.checkvalue = 0
        }
      }
    },
    checkOver: function () {
      let cb = this.directionBlock
      cb.Finished = true
      cb.answers.forEach(ca => {
        if (ca.StatusID === 2) return
        if (ca.StatusID === 0) cb.Finished = false
        if ((ca.TypeID === 3 || ca.TypeID === 4) && (ca.AnswerDesc === null || ca.AnswerDesc.length === 0)) cb.Finished = false
        if (ca.TypeID === 5) {
          ca.partAnswers.forEach(pa => {
            if (pa.IsFillin && pa.Part.length === 0) {
              cb.Finished = false
            }
          })
        } else if (ca.TypeID === 6 && ca.checkvalue === 0) cb.Finished = false
        else if (ca.TypeID === 7 && ca.checklist.length === 0) cb.Finished = false
      })
      if (cb.Finished) this.$emit('directReady')
    },
    skipLeft: function (answer) {
      let cblock = this.directionBlock
      let currentAID = cblock.answers.findIndex(function (e) { return e.QuestionID === answer.QuestionID })
      for (let i = currentAID + 1; i < cblock.answers.length; i++) {
        let ca = cblock.answers[i]
        ca.StatusID = 2
        ca.AnswerDesc = ''
        ca.isAnswer = false
        if (ca.TypeID === 6) {
          ca.checkvalue = 0
        }
      }
    },
    startBlock: function () {
      let answer = this.directionBlock.answers[0]
      answer.StatusID = 1
      this.showNextQuestion(answer)
      console.log('The application Block ', this.directionBlock)
    },
    // 显示下一个问题
    showNextQuestion: function (answer) {
      let cblock = this.directionBlock
      // if (answer.hasAnswer === false) return
      answer.hasAnswer = true
      if (answer.IsRoute) this.resetLeftAnswer(answer)
      let skip = this.countShipNumber(answer)
      if (skip.routeLevel === 2) { // Template Route
        // skip blocks
        this.$emit('directReady', skip.skipNumber)
        return
      } else if (skip.routeLevel === 0) {
        let skipsteps = skip.skipNumber
        if (skipsteps > 0) {
          for (let i = 0; i < cblock.answers.length; i++) {
            if (cblock.answers[i].QuestionID === answer.QuestionID) {
              for (let j = i + 1; j < i + skipsteps; j++) {
                if (j >= cblock.answers.length) break
                cblock.answers[j].StatusID = 2
              }
              if (i + skipsteps >= cblock.answers.length) this.skipLeft(answer)
              else {
                let ca = cblock.answers[i + skipsteps]
                ca.StatusID = 1
                if (ca.hasAnswer) this.showNextQuestion(ca)
              }
              break
            }
          }
        } else if (skipsteps === -1) {
          // 完成答卷
          this.skipLeft(answer)
        }
      }
      this.checkOver()
    },
    changeVal: function (answer) {
      this.showNextQuestion(answer)
    }

  }
}
</script>

<style scoped>

</style>
