<template>
  <div class="answer">
    <div class="choiceQuestion">
      <div class="question"><span v-if="question.Label !== undefined && question.Label !== null && question.Label !== ''">{{question.Label}}&nbsp;&nbsp;</span>{{question.Description}}</div>
      <div v-if="disabled" style="text-decoration:underline">{{answer.AnswerDesc}}&nbsp;&nbsp;</div>
      <el-input v-else class="textAreaWithLine" v-model="question.value" type="textarea" :autosize="{ minRows: 3, maxRows: 20}" @input="changeVal('alreadyAnswer')"></el-input>
    </div>
  </div>
</template>

<script>
export default {
  name: 'answerSimpleAnswer',
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
    changeVal: function (value) {
      this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, value)
    }
  }
}
</script>

<style scoped>

</style>
