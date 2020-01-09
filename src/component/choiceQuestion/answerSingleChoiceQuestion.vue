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
            <el-input class="additionContent" v-if="item.NeedAddition" v-model="item.AdditionContent" :disabled="question.value !== item.ChoiceOptionID" size="mini" @blur="changeAdditionContent"></el-input>
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
    }
  },
  methods: {
    resetAdditionContent: function () {
      this.question.options.forEach(item => { this.question.value !== item.ChoiceOptionID ? item.AdditionContent = null : item.AdditionContent = item.AdditionContent })
      this.$emit('finishAnswer', this.question)
    },
    changeAdditionContent: function () {
      this.$emit('finishAnswer', this.question)
    }
  }
}
</script>

<style scoped>

</style>
