<template>
  <div class="answer">
    <div class="choiceQuestion">
      <div class="question"><span v-if="question.Label !== undefined && question.Label !== null && question.Label !== ''">{{question.Label}}&nbsp;&nbsp;</span>{{question.Description}}</div>
      <div class="questionTips">{{question.Tips}}</div>
      <div class="choice">
        <el-radio-group v-model="question.value" @change="resetAdditionContent">
          <el-radio v-for="item in question.options" :label="item.ChoiceOptionID" :key="item.ChoiceOptionID">
            <span class="choiceTitle">{{item.Content}}<i class="choiceTips">{{item.Tips}}</i></span>
            <el-input class="additionContent" v-if="item.NeedAddition" v-model="item.AdditionContent" :disabled="question.value !== item.ChoiceOptionID" size="mini" @input="changeVal(question.value)"></el-input>
          </el-radio>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'answerSingleChoiceQuestion',
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
      this.question.options.forEach(item => { this.question.value !== item.ChoiceOptionID ? item.AdditionContent = null : item.AdditionContent = item.AdditionContent })
      if (this.question.options.find(item => item.ChoiceOptionID === this.question.value).NeedAddition && this.question.options.find(item => item.ChoiceOptionID === this.question.value).AdditionContent === null) {
        this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, this.question.value, 'emptyAddition')
      } else {
        this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, this.question.value)
      }
    },
    changeVal: function (value) {
      this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, value)
    }
  }
}
</script>

<style scoped>

</style>
