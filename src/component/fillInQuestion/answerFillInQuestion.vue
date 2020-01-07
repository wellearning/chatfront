<template>
  <div class="answer">
    <div class="fillInQuestion">
      <div class="question">
        <span v-for="item in question.part" :key="item.id" class="part">
          <i :class="{'nextLine' : item.isNextLine}"></i>
          <template v-if="item.isFillIn === false">{{item.content}}</template>
          <template v-else><el-input class="additionContent" v-model="item.answerContent" size="mini" @blur="changeAdditionContent" :style="{width: item.content * 6 + 45 + 'px'}" :maxlength="item.content" show-word-limit></el-input></template>
        </span>
      </div>
      <div class="questionTips">{{question.tips}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'answerFillInQuestion',
  props: {
    question: {
      type: Object
    }
  },
  methods: {
    changeAdditionContent: function () {
      this.$emit('finishAnswer', this.question)
    }
  }
}
</script>

<style scoped>

</style>
