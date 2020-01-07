<template>
  <div class="answer">
    <div class="choiceQuestion">
      <div class="question">{{question.content}}</div>
      <div class="questionTips">{{question.tips}}</div>
      <div class="choice" v-if="question.type === 1">
        <el-radio-group v-model="question.singleValue" @change="resetAdditionContent">
          <el-radio v-for="item in question.choice" :label="item.id" :key="item.id">
            <span class="choiceTitle">{{item.content}}<i class="choiceTips">{{item.tips}}</i></span>
            <el-input class="additionContent" v-if="item.addition" v-model="item.additionContent" :disabled="question.singleValue !== item.id" size="mini" @blur="changeAdditionContent" maxlength="50" show-word-limit></el-input>
          </el-radio>
        </el-radio-group>
      </div>
      <div class="choice"  v-else>
        <el-checkbox-group v-model="question.multipleValue" @change="resetAdditionContent">
          <el-checkbox v-for="item in question.choice" :label="item.id" :key="item.id">
            <span class="choiceTitle">{{item.content}}<i class="choiceTips">{{item.tips}}</i></span>
            <el-input class="additionContent" v-if="item.addition" v-model="item.additionContent" :disabled="question.multipleValue.indexOf(item.id) === -1" size="mini" @blur="changeAdditionContent" maxlength="50" show-word-limit></el-input>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'answerChoiceQuestion',
  props: {
    question: {
      type: Object
    }
  },
  methods: {
    resetAdditionContent: function () {
      this.question.choice.forEach(item => { item.additionContent = null })
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
