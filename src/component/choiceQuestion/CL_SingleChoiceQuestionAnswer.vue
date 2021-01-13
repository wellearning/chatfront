<template>
  <div class="answer">
    <div class="choiceQuestion">
      <div class="question">{{answer.QuestionDesc}}</div>
      <div class="questionTips" v-if="answer.Tips !==  null">{{answer.Tips}}</div>
      <div class="choice">
        <el-radio-group v-model="answer.checkvalue" v-bind:disabled="disabled" @change="resetAdditionContent">
          <el-radio v-for="item in answer.optionAnswers" :label="item.ChoiceOptionID" :key="item.ChoiceOptionID">
            <span class="choiceTitle">{{item.Content}}<i class="choiceTips">{{item.Tips}}</i></span>
            <span v-if="disabled && item.NeedAddition" style="text-decoration:underline">{{item.Addition}}&nbsp;&nbsp;</span>
            <el-input v-else-if="item.NeedAddition" class="additionContent" v-model="answer.Addition" :disabled="answer.checkvalue !== item.ChoiceOptionID" size="mini"  @change="changeVal(answer.AnswerDesc)"></el-input>
          </el-radio>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SingleChoiceQuestionAnswer',
  data: function () {
    return {
      checkvalue: null
    }
  },
  props: {
    answer: {
      type: Object
    },
    disabled: {
      type: Boolean
    }
  },
  methods: {
    resetAdditionContent: function () {
      this.answer.optionAnswers.forEach(option => {
        if (option.ChoiceOptionID === this.answer.checkvalue) option.IsChecked = true
        else option.IsChecked = false
      })
      this.updateHasAnswer()
      // this.$emit('changeValue')
      /*
      this.question.options.forEach(item => { this.question.value !== item.ChoiceOptionID ? item.AdditionContent = null : item.AdditionContent = item.AdditionContent })
      if (this.question.options.find(item => item.ChoiceOptionID === this.question.value).NeedAddition && this.question.options.find(item => item.ChoiceOptionID === this.question.value).AdditionContent === null) {
        this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, this.question.value, 'emptyAddition')
      } else {
        this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, this.question.value)
      }
      */
    },
    changeVal: function (value) {
      this.updateHasAnswer()
      // if (this.answer.hasAnswer) this.$emit('changeValue')
      // this.$emit('changeValue')
    },
    updateHasAnswer: function () {
      let hasanswer = false
      this.answer.optionAnswers.forEach(option => {
        if (option.IsChecked) {
          if (option.NeedAddition) {
            if (this.answer.Addition !== null && this.answer.Addition !== '') {
              hasanswer = true
            }
          } else hasanswer = true
        }
      })
      this.answer.hasAnswer = hasanswer
      if (hasanswer) this.$emit('changeValue')
    }
  }
}
</script>

<style scoped>

</style>
