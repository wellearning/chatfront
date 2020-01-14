<template>
  <div class="answer">
    <div class="choiceQuestion">
      <div class="question">{{question.Description}}</div>
      <div class="questionTips">{{question.Tips}}</div>
      <div class="choice">
        <el-radio-group v-model="question.value" @change="resetAdditionContent">
          <el-radio v-for="item in question.options" :label="item.ChoiceOptionID" :key="item.ChoiceOptionID">
            <span class="choiceTitle">{{item.Content}}<i class="choiceTips">{{item.Tips}}</i></span>
            <!--todo: v-model中的答案未定义-->
            <el-input class="additionContent" v-if="item.NeedAddition" v-model="item.AdditionContent" :disabled="question.value !== item.ChoiceOptionID" size="mini" @blur="changeVal(question.value)"></el-input>
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
      this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, this.question.value)
    },
    changeVal: function (value) {
      this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, value)
    }
  }
}
</script>

<style scoped>

</style>
