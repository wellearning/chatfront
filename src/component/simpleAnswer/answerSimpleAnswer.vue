<template>
  <div class="answer">
    <div class="choiceQuestion">
      <div class="question"><span v-if="question.Label !== undefined && question.Label !== null && question.Label !== ''">{{question.Label}}&nbsp;&nbsp;</span>{{question.Description}}</div>
      <el-input class="textAreaWithLine" v-model="question.value" type="textarea" :autosize="{ minRows: 3, maxRows: 20}"></el-input>
    </div>
  </div>
</template>

<script>
export default {
  name: 'answerSimpleAnswer',
  props: {
    question: {
      type: Object
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
