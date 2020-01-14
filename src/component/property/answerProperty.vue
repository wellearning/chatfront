<template>
  <div class="answer">
    <div class="propertyQuestion">
      <span class="question">{{question.Description}}</span>
      <el-input class="additionContent" v-model="question.value" size="mini" @input="changeVal(question.value)"></el-input>
    </div>
  </div>
</template>

<script>
export default {
  name: 'answerProperty',
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
