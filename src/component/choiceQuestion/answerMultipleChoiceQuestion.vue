<template>
  <div class="answer">
    <div class="choiceQuestion">
      <div class="question"><span v-if="question.Label !== undefined && question.Label !== null && question.Label !== ''">{{question.Label}}&nbsp;&nbsp;</span>{{question.Description}}</div>
      <div class="questionTips">{{question.Tips}}</div>
      <div class="choice">
        <el-checkbox-group v-model="question.value" @change="resetAdditionContent">
          <el-checkbox v-for="item in question.options" :label="item.ChoiceOptionID" :key="item.ChoiceOptionID">
            <span class="choiceTitle">{{item.Content}}<i class="choiceTips">{{item.Tips}}</i></span>
            <el-input class="additionContent" v-if="item.NeedAddition" v-model="item.AdditionContent" :disabled="question.value.indexOf(item.ChoiceOptionID) === -1" size="mini" @input="changeVal('alreadyAnswer')"></el-input>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'answerMultipleChoiceQuestion',
  props: {
    question: {
      type: Object
    },
    templateId: {
      type: Number
    },
    blockSequenceNo: {
      type: Number
    },
    questionSequenceNo: {
      type: Number
    }
  },
  methods: {
    resetAdditionContent: function () {
      this.question.options.forEach(item => { this.question.value.indexOf(item.ChoiceOptionID) === -1 ? item.AdditionContent = null : item.AdditionContent = item.AdditionContent })
      if (this.question.options.filter(item => this.question.value.indexOf(item.ChoiceOptionID) !== -1).length > 0 && this.question.options.filter(item => this.question.value.indexOf(item.ChoiceOptionID) !== -1).filter(item => item.NeedAddition + '|' + item.AdditionContent === 'true|null').length === 0) {
        this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, 'alreadyAnswer')
      } else {
        this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, 'alreadyAnswer', 'emptyAddition')
      }
    },
    changeVal: function (value) {
      if (this.question.options.filter(item => this.question.value.indexOf(item.ChoiceOptionID) !== -1).length > 0 && this.question.options.filter(item => this.question.value.indexOf(item.ChoiceOptionID) !== -1).filter(item => item.NeedAddition + '|' + item.AdditionContent === 'true|null').length === 0) {
        this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, value)
      } else {
        this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, value, 'emptyAddition')
      }
    }
  }
}
</script>

<style scoped>

</style>
