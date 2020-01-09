<template>
  <div class="answer">
    <div class="fillInQuestion">
      <div class="question">
        <span v-for="item in question.fillinParts" :key="item.FillinPartID" class="part"><!--排序.slice().sort((a,b) => { return a.SequenceNo - b.SequenceNo })-->
          <!--<i :class="{'nextLine' : item.isNextLine}"></i>-->
          <template v-if="item.IsFillin === false">{{item.Part}}</template>
          <!--todo: v-model中的答案未定义-->
          <template v-else><el-input class="additionContent" v-model="item.FillinContent" size="mini" @blur="changeAdditionContent" :style="{width: item.Part * 10 + 'px'}"></el-input></template>
        </span>
      </div>
      <div class="questionTips">{{question.Tips}}</div>
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
