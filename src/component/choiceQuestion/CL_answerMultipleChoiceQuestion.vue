<template>
  <div class="answer">
    <div class="choiceQuestion">
      <div class="question"><span v-if="question.Label !== undefined && question.Label !== null && question.Label !== ''">{{question.Label}}&nbsp;&nbsp;</span>{{question.Description}}</div>
      <div class="questionTips">{{question.Tips}}</div>
      <div class="choice">
        <el-checkbox-group v-model="question.value" @change="resetAdditionContent">
          <el-checkbox v-for="item in question.options" :label="item.ChoiceOptionID" :key="item.ChoiceOptionID" @change="checkClick">
            <span class="choiceTitle">{{item.Content}}<i class="choiceTips">{{item.Tips}}</i></span>
            <el-input class="additionContent" v-if="item.NeedAddition" v-model="item.AdditionContent" :disabled="question.value.indexOf(item.ChoiceOptionID) === -1" size="mini" @input="changeVal('alreadyAnswer')"></el-input>
            <div v-if="question.value.indexOf(item.ChoiceOptionID) > -1">
              <div class="answerMemo" v-if="item.ChildQuestionTypeID === 5">
                <span v-for="part in item.childQuestion.fillinParts" :key="part.FillinPartID" class="part"><!--排序.slice().sort((a,b) => { return a.SequenceNo - b.SequenceNo })-->
                <!--<i :class="{'nextLine' : item.isNextLine}"></i>-->
                <template v-if="part.IsFillin === false">{{part.Part}}</template>
                <template v-else>
                  <el-input v-if="part.InputType === 'text'" class="additionContent" v-model="part.Part" size="mini" :style="{width: part.Width * 10 + 'px'}" placeholder="Text" @input="fillin_changeVal('alreadyAnswer')"></el-input>
                  <el-date-picker v-else-if="part.InputType === 'date'" class="additionContent" v-model="part.Part" type="date" size="mini" :style="{width: part.Width * 10 + 'px'}" placeholder="yyyy-mm-dd" @change="fillin_changeVal('alreadyAnswer')"></el-date-picker>
                    <el-input v-else-if="part.InputType === 'number'" class="additionContent" v-model="part.Part" size="mini" :style="{width: part.Width * 10 + 'px'}" placeholder="Number" @input="fillin_changeVal('alreadyAnswer')"></el-input>
                  <!--<el-input-number v-else-if="item.InputType === 'number'" class="additionContent" v-model="item.FillinContent" size="mini" :style="{width: item.Part * 10 + 'px'}" placeholder="Number"></el-input-number>-->
                </template>
              </span>
              </div>
              <div class="answerMemo" v-if="item.ChildQuestionTypeID === 2">
                {{item.childQuestion.Description}}
              </div>
              <div class="answerMemo" v-if="item.ChildQuestionTypeID === 3">
                <span class="">{{item.childQuestion.Description}}</span>
                <el-input v-if="item.childQuestion.InputType === 'text'" class="additionContent" v-model="item.childQuestion.answer.AnswerDesc" size="mini" placeholder="Text" style="width: 300px;"></el-input>
                <el-date-picker v-else-if="item.childQuestion.InputType === 'date'" class="additionContent" v-model="item.childQuestion.answer.AnswerDesc" type="date" size="mini" placeholder="yyyy-mm-dd"></el-date-picker>
                <el-input v-else-if="item.childQuestion.InputType === 'number'" class="additionContent" v-model="item.childQuestion.answer.AnswerDesc" size="mini" placeholder="Number"></el-input>
                <div class="questionTips">{{item.childQuestion.Tips}}</div>
              </div>
              <div class="answerMemo" v-if="item.ChildQuestionTypeID === 4">
                <div class="">{{item.childQuestion.Description}}</div>
                <el-input class="textAreaWithLine" v-model="item.childQuestion.answer.AnswerDesc" type="textarea" :autosize="{ minRows: 3, maxRows: 20}"></el-input>
              </div>
            </div>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  components: {
  },
  name: 'answerMultipleChoiceQuestion',
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
    checkClick: function () {
      let options = this.question.options.filter(item => this.question.value.indexOf(item.ChoiceOptionID) !== -1)
      for (let i = 0; i < options.length; i++) {
        if (options[i].SingleFlag) {
          this.question.value = []
          this.question.value.push(options[i].ChoiceOptionID)
        }
      }
    },
    resetAdditionContent: function () {
      this.question.options.forEach(item => { this.question.value.indexOf(item.ChoiceOptionID) === -1 ? item.AdditionContent = null : item.AdditionContent = item.AdditionContent })
      if (this.question.options.filter(item => this.question.value.indexOf(item.ChoiceOptionID) !== -1).length > 0 && this.question.options.filter(item => this.question.value.indexOf(item.ChoiceOptionID) !== -1).filter(item => item.NeedAddition + '|' + item.AdditionContent === 'true|null').length === 0) {
        this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, 'alreadyAnswer')
      } else {
        this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, 'alreadyAnswer', 'emptyAddition')
      }
    },
    changeVal: function (value) {
      if (this.question.options.filter(item => this.question.value.indexOf(item.ChoiceOptionID) !== -1).length > 0 && this.question.options.filter(item => this.question.value.indexOf(item.ChoiceOptionID) !== -1).filter(item => item.NeedAddition + '|' + item.AdditionContent === 'true|null').length === 0) {
        this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, value)
      } else {
        this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, value, 'emptyAddition')
      }
    },
    fillin_changeVal: function (value) {
      // this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, value)
    }
  }
}
</script>

<style scoped>

</style>
