<template>
  <div class="answer">
    <div class="propertyQuestion">
      <span class="question">{{answer.QuestionDesc}}</span>
      <span v-if="disabled" style="text-decoration:underline">{{answer.AnswerDesc}}&nbsp;&nbsp;</span>
      <el-input v-else-if="answer.InputType === 'text'" class="additionContent" v-model="answer.AnswerDesc" size="mini" @change="changeVal()" placeholder="Text" style="width: 300px;"></el-input>
      <el-date-picker v-else-if="answer.InputType === 'date'" class="additionContent" v-model="answer.AnswerDesc" type="date" size="mini" @change="changeVal(answer.AnswerDesc, 'date')" placeholder="yyyy-mm-dd"></el-date-picker>
      <el-input v-else-if="answer.InputType === 'number'" class="additionContent" v-model="answer.AnswerDesc" size="mini" @change="changeVal(answer.AnswerDesc, 'number')" placeholder="Number"></el-input>
      <el-select v-else-if="answer.InputType === 'list'" class="additionContent"  v-model="answer.AnswerDesc" size="mini" @focus="loadDataSource(answer)" @change="changeVal(answer, 'list')" placeholder="Please Select" no-data-text="No Data" filterable>
        <el-option class="questionOption" v-for="item in dataList" :key="item.ItemValue" :label="item.Name" :value="item.ItemValue"></el-option>
      </el-select>
      <el-select v-else-if="answer.InputType === 'children'" class="additionContent"  v-model="answer.AnswerDesc" size="mini" @focus="loadChildren(answer)" @change="changeVal(answer.AnswerDesc, 'list')" placeholder="Please Select" no-data-text="No Data" filterable>
        <el-option class="questionOption" v-for="item in dataList" :key="item.Name" :label="item.Name" :value="item.Name"></el-option>
      </el-select>
      <!--<el-input-number v-else-if="question.InputType === 'number'" class="additionContent" v-model="question.value" size="mini" @input="changeVal(question.value)" placeholder="Number"></el-input-number>-->
      <div class="questionTips">{{answer.Tips}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'answerProperty',
  data: function () {
    return {
      dataList: []
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
    changeVal: function (value, sign) {
      this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, value, sign)
    },
    loadDataSource: function (answer) {
      // this.isLoadingDataSource = true
      if (this.dataList.length > 0) return
      let question = answer.blockQuestion.question
      this.axios.post('/api/Services/baseservice.asmx/GetDictionary', { datatype: question.DataSource }).then(res => {
        if (res) {
          console.log('GetDictionary', res)
          this.dataList = res.data
        }
        // this.isLoadingDataSource = false
      }).catch(err => {
        console.log('GetDictionary', err)
        // this.isLoadingDataSource = false
      })
    },
    loadChildren: function (answer) {
      let parent = answer.blockQuestion.Question
      this.axios.post('/api/Services/baseservice.asmx/GetChildrenDictionary', { parenttype: parent.DataSource, parentvalue: parent.value }).then(res => {
        if (res) {
          console.log('GetChildrenDictionary', res)
          this.dataList = res.data
        }
        // this.isLoadingDataSource = false
      }).catch(err => {
        console.log('GetChildrenDictionary', err)
        // this.isLoadingDataSource = false
      })
    }
  }
}
</script>

<style scoped>

</style>
