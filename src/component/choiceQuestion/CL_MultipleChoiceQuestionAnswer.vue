<template>
  <div class="answer">
    <div class="choiceQuestion">
      <div class="question" :title="answer.Tips">{{answer.QuestionDesc}}</div>
      <!--div class="questionTips" v-if="answer.Tips !==  null">{{answer.Tips}}</div-->
      <div class="choice">
        <el-checkbox-group v-bind:disabled="disabled" v-model="answer.checklist" @change="changeVal">
          <el-checkbox v-for="item in answer.optionAnswers" v-model="item.IsChecked" :label="item.ChoiceOptionID" :key="item.ChoiceOptionID" @change="checkClick()">
            <span class="choiceTitle" :title="item.Tips">{{item.Content}}</span>
            <span v-if="disabled && item.NeedAddition" style="text-decoration:underline">{{part.Part}}&nbsp;&nbsp;</span>
            <el-input v-else-if="item.NeedAddition" class="additionContent" v-model="item.Addition"  size="mini" @input="changeVal"></el-input>
            <div v-if="disabled && item.IsChecked">
              <div class="answerMemo" v-if="item.ChildQuestionTypeID === 5">
                <span v-for="part in item.partAnswers" :key="part.FillinPartID" class="part"><!--排序.slice().sort((a,b) => { return a.SequenceNo - b.SequenceNo })-->
                <template v-if="part.IsFillin === false">{{part.Part}}</template>
                <span v-else style="text-decoration:underline">{{part.Part}}&nbsp;&nbsp;</span>
               </span>
              </div>
              <pre class="answerMemo" v-if="item.ChildQuestionTypeID === 2" style="word-wrap: break-word">
                {{item.childAnswer.QuestionDesc}}
              </pre>
              <div class="answerMemo" v-if="item.ChildQuestionTypeID === 3">
                <span class="">{{item.childAnswer.QuestionDesc}}</span>
                <span class="" style="text-decoration:underline">{{item.childAnswer.AnswerDesc}}</span>
                <div class="questionTips">{{item.childAnswer.Tips}}</div>
              </div>
              <div class="answerMemo" v-if="item.ChildQuestionTypeID === 4">
                <div class="question" style="word-wrap: break-word; width:800px;" >{{item.childAnswer.QuestionDesc}}</div>
                <el-input class="textAreaWithLine" readonly="readonly" style="word-wrap: break-word; width:800px;" v-model="item.childAnswer.AnswerDesc" type="textarea" :autosize="{ minRows: 3, maxRows: 20}"></el-input>
              </div>
            </div>
            <div v-else-if="item.IsChecked">
              <div class="answerMemo" v-if="item.ChildQuestionTypeID === 5">
                <span v-for="part in item.partAnswers" :key="part.FillinPartID" class="part"><!--排序.slice().sort((a,b) => { return a.SequenceNo - b.SequenceNo })-->
                <!--<i :class="{'nextLine' : item.isNextLine}"></i>-->
                <template v-if="part.IsFillin === false">{{part.Part}}</template>
                <span v-else-if="disabled" style="text-decoration:underline">{{part.Part}}&nbsp;&nbsp;</span>
                <template v-else>
                  <el-input v-if="part.InputType === 'text'" class="additionContent" v-model="part.Part" size="mini" :style="{width: part.InputLength * 10 + 'px'}" placeholder="Text" @input="changeVal"></el-input>
                  <el-date-picker v-else-if="part.InputType === 'date'" class="additionContent" v-model="part.Part" type="date" size="mini" :style="{width: part.InputLength * 10 + 'px'}" placeholder="yyyy-mm-dd" @change="changeVal"></el-date-picker>
                  <el-input v-else-if="part.InputType === 'number'" class="additionContent" v-model="part.Part" size="mini" :style="{width: part.InputLength * 10 + 'px'}" placeholder="Number" @input="changeVal"></el-input>
                  <!--<el-input-number v-else-if="item.InputType === 'number'" class="additionContent" v-model="item.FillinContent" size="mini" :style="{width: item.Part * 10 + 'px'}" placeholder="Number"></el-input-number>-->
                </template>
              </span>
              </div>
              <pre class="answerMemo" v-if="item.ChildQuestionTypeID === 2" style="word-wrap: break-word">
                {{item.childAnswer.QuestionDesc}}
              </pre>
              <div class="answerMemo" v-if="item.ChildQuestionTypeID === 3">
                <span class="">{{item.childAnswer.QuestionDesc}}</span>
                <el-input v-if="item.childAnswer.InputType === 'text'" class="additionContent" v-model="item.childQuestion.answer.AnswerDesc" size="mini" placeholder="Text" style="width: 300px;"></el-input>
                <el-date-picker v-else-if="item.childAnswer.InputType === 'date'" class="additionContent" v-model="item.childQuestion.answer.AnswerDesc" type="date" size="mini" placeholder="yyyy-mm-dd"></el-date-picker>
                <el-input v-else-if="item.childAnswer.InputType === 'number'" class="additionContent" v-model="item.childQuestion.answer.AnswerDesc" size="mini" placeholder="Number"></el-input>
                <div class="questionTips">{{item.childAnswer.Tips}}</div>
              </div>
              <div class="answerMemo" v-if="item.ChildQuestionTypeID === 4">
                <div class="question" style="">{{item.childAnswer.QuestionDesc}}</div>
                <el-input class="textAreaWithLine" v-model="item.childAnswer.AnswerDesc" type="textarea" :autosize="{ minRows: 3, maxRows: 20}"></el-input>
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
  name: 'MultipleChoiceQuestionAnswer',
  data: function () {
    return {
      checklist: []
    }
  },
  props: {
    answer: {
      type: Object
    },
    templateId: {
      type: Number
    },
    disabled: {
      type: Boolean
    }
  },
  methods: {
    checkClick: function () {
      let options = this.answer.optionAnswers.filter(item => this.answer.checklist.indexOf(item.ChoiceOptionID) !== -1)
      for (let i = 0; i < options.length; i++) {
        if (options[i].SingleFlag) {
          this.answer.checklist = []
          this.answer.checklist.push(options[i].ChoiceOptionID)
        }
      }
      // let leftoptions = this.answer.optionAnswers.filter(item => this.answer.checklist.indexOf(item.ChoiceOptionID) !== -1)
      for (const option of this.answer.optionAnswers) {
        option.IsChecked = this.answer.checklist.indexOf(option.ChoiceOptionID) !== -1
      }
    },
    resetAdditionContent: function () {
      this.$emit('changeValue')
    },
    changeVal: function (value) {
      let hasanswer = false
      let secondcheck = true
      this.answer.optionAnswers.forEach(option => {
        if (option.IsChecked) {
          hasanswer = true
          if (option.NeedAddition && option.Addition === '') {
            secondcheck = false
          }
          if (option.ChildQuestionTypeID === 5) {
            option.partAnswers.forEach(pa => {
              if (pa.IsFillin && pa.Part === '') secondcheck = false
            })
          } else if (option.ChildQuestionTypeID === 3 || option.ChildQuestionTypeID === 4) {
            if (option.childAnswer.AnswerDesc === '') secondcheck = false
          }
        }
      })
      this.answer.hasAnswer = hasanswer && secondcheck
      if (this.answer.hasAnswer) this.$emit('changeValue')
    },
    fillin_changeVal: function (value) {
      // this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, value)
    }
  }
}
</script>

<style scoped>

</style>
