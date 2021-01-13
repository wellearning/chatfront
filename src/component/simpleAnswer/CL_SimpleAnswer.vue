<template>
  <div class="answer">
    <div class="choiceQuestion">
      <div class="question">{{answer.QuestionDesc}}</div>
      <el-input class="textAreaWithLine" v-model="answer.AnswerDesc" type="textarea" :autosize="{ minRows: 3, maxRows: 20}" @input="changeVal()"></el-input>
    </div>
  </div>
</template>

<script>
export default {
  name: 'answerSimpleAnswer',
  props: {
    answer: {
      type: Object
    },
    disabled: {
      type: Boolean
    }
  },
  methods: {
    changeVal: function () {
      this.$emit('changeValue')
    }
  }
}
</script>

<style scoped>

</style>
