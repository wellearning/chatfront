<template>
  <div class="answer">
    <div class="choiceQuestion">
      <div class="question">{{question.Description}}</div>
      <div class="questionTips">{{question.Tips}}</div>
      <div class="choice">
        <el-checkbox-group v-model="question.value" @change="resetAdditionContent">
          <el-checkbox v-for="item in question.options" :label="item.ChoiceOptionID" :key="item.ChoiceOptionID">
            <span class="choiceTitle">{{item.Content}}<i class="choiceTips">{{item.Tips}}</i></span>
            <el-input class="additionContent" v-if="item.NeedAddition" v-model="item.AdditionContent" :disabled="question.value.indexOf(item.ChoiceOptionID) === -1" size="mini"></el-input>
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
    }
  },
  methods: {
    resetAdditionContent: function () {
      this.question.options.forEach(item => { this.question.value.indexOf(item.ChoiceOptionID) === -1 ? item.AdditionContent = null : item.AdditionContent = item.AdditionContent })
    }
  }
}
</script>

<style scoped>

</style>
