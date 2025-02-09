<template>
  <div class="answer">
    <div class="fillInQuestion">
      <div class="question">
        <span :title="answer.Tips">{{answer.AnswerDesc}}&nbsp;&nbsp;</span>
        <span v-for="item in answer.partAnswers" :key="item.FillinPartID" class="part"><!--排序.slice().sort((a,b) => { return a.SequenceNo - b.SequenceNo })-->
          <!--<i :class="{'nextLine' : item.isNextLine}"></i>-->
          <template v-if="item.IsFillin === false">{{item.Part}}</template>
          <template v-else>
            <span v-if="disabled">{{item.Part}}&nbsp;&nbsp;</span>
            <el-input v-else-if="item.InputType === 'text'" v-bind:disabled="disabled" class="additionContent" v-model="item.Part" size="mini" :style="{width: item.InputLength * 10 + 'px'}" placeholder="Text" @input="changeVal('alreadyAnswer')"></el-input>
            <el-date-picker v-else-if="item.InputType === 'date'" v-bind:disabled="disabled" class="additionContent" v-model="item.Part" type="date" size="mini" :style="{width: item.InputLength * 10 + 'px'}" placeholder="yyyy-mm-dd" @change="changeVal('alreadyAnswer')"></el-date-picker>
            <el-input v-else-if="item.InputType === 'number'" v-bind:disabled="disabled" class="additionContent" v-model="item.Part" size="mini" :style="{width: item.InputLength * 10 + 'px'}" placeholder="Number" @input="changeVal('alreadyAnswer')"></el-input>
            <!--<el-input-number v-else-if="item.InputType === 'number'" class="additionContent" v-model="item.FillinContent" size="mini" :style="{width: item.Part * 10 + 'px'}" placeholder="Number"></el-input-number>-->
          </template>
        </span>
      </div>
      <!--div class="questionTips">{{answer.Tips}}</div-->
    </div>
  </div>
</template>

<script>
export default {
  name: 'answerFillInQuestion',
  props: {
    answer: {
      type: Object
    },
    disabled: {
      type: Boolean
    }
  },
  methods: {
    changeVal: function (value) {
      let hasanswer = true
      this.answer.partAnswers.forEach(pa => {
        if (pa.IsFillin && pa.Part === '') {
          hasanswer = false
        }
      })
      this.answer.hasAnswer = hasanswer
      if (this.answer.hasAnswer) this.$emit('changeValue')
    }
  }
}
</script>

<style scoped>

</style>
