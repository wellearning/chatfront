<template>
  <div class="answer">
    <div class="propertyQuestion">
      <span class="question"><span v-if="question.Label !== undefined && question.Label !== null && question.Label !== ''">{{question.Label}}&nbsp;&nbsp;</span>{{question.Description}}</span>
      <el-input v-if="question.InputType === 'text'" class="additionContent" v-model="question.value" size="mini" placeholder="Text"></el-input>
      <el-date-picker v-else-if="question.InputType === 'date'" class="additionContent" v-model="question.value" type="datetime" size="mini" placeholder="Date"></el-date-picker>
      <el-input v-else-if="question.InputType === 'number'" class="additionContent" v-model="question.value" size="mini" @input="changeVal(question.value)" placeholder="Number"></el-input>
      <!--<el-input-number v-else-if="question.InputType === 'number'" class="additionContent" v-model="question.value" size="mini" @input="changeVal(question.value)" placeholder="Number"></el-input-number>-->
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
