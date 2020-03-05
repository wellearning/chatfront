<template>
  <div class="answer">
    <div class="fillInQuestion">
      <div class="question">
        <span v-if="question.Label !== undefined && question.Label !== null && question.Label !== ''">{{question.Label}}&nbsp;&nbsp;</span>
        <span v-for="item in question.fillinParts" :key="item.FillinPartID" class="part"><!--排序.slice().sort((a,b) => { return a.SequenceNo - b.SequenceNo })-->
          <!--<i :class="{'nextLine' : item.isNextLine}"></i>-->
          <template v-if="item.IsFillin === false">{{item.Part}}</template>
          <template v-else>
            <el-input v-if="item.InputType === 'text'" class="additionContent" v-model="item.FillinContent" size="mini" :style="{width: item.Part * 10 + 'px'}" placeholder="Text" @input="changeVal('alreadyAnswer')"></el-input>
            <el-date-picker v-else-if="item.InputType === 'date'" class="additionContent" v-model="item.FillinContent" type="date" size="mini" :style="{width: item.Part * 10 + 'px'}" placeholder="yyyy-mm-dd" @change="changeVal('alreadyAnswer')"></el-date-picker>
              <el-input v-else-if="item.InputType === 'number'" class="additionContent" v-model="item.FillinContent" size="mini" :style="{width: item.Part * 10 + 'px'}" placeholder="Number" @input="changeVal('alreadyAnswer')"></el-input>
            <!--<el-input-number v-else-if="item.InputType === 'number'" class="additionContent" v-model="item.FillinContent" size="mini" :style="{width: item.Part * 10 + 'px'}" placeholder="Number"></el-input-number>-->
          </template>
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
