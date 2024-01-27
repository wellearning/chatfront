<template>
  <div class="answer">
    <div class="propertyQuestion">
      <span class="question"><span v-if="question.Label !== undefined && question.Label !== null && question.Label !== ''">{{question.Label}}&nbsp;&nbsp;</span>{{question.Description}}</span>
      <el-input v-if="question.InputType === 'text'" class="additionContent" v-model="question.value" size="mini" @change="changeVal('alreadyAnswer', 'text')" placeholder="Text" style="width: 300px;"></el-input>
      <el-date-picker v-else-if="question.InputType === 'date'" class="additionContent" v-model="question.value" type="date" size="mini" @change="changeVal(question.value, 'date')" placeholder="yyyy-mm-dd"></el-date-picker>
      <el-input v-else-if="question.InputType === 'number'" class="additionContent" v-model="question.value" size="mini" @change="changeVal(question.value, 'number')" placeholder="Number"></el-input>
      <el-select v-else-if="question.InputType === 'list'" class="additionContent"  v-model="question.value" size="mini" @focus="loadDataSource(question)" @change="changeVal(question, 'list')" placeholder="Please Select" no-data-text="No Data" filterable>
        <el-option class="questionOption" v-for="item in dataList" :key="item.ItemValue" :label="item.Name" :value="item.ItemValue"></el-option>
      </el-select>
      <el-select v-else-if="question.InputType === 'children'" class="additionContent"  v-model="question.value" size="mini" @focus="loadChildren(question)" @change="changeVal(question.value, 'list')" placeholder="Please Select" no-data-text="No Data" filterable>
        <el-option class="questionOption" v-for="item in dataList" :key="item.Name" :label="item.Name" :value="item.Name"></el-option>
      </el-select>
      <span v-else-if="question.InputType === 'computed'"  class="additionContent">{{question.value}}</span>
      <el-form v-else-if="question.InputType === 'array'">
        <el-form-item v-for="item in question.dataSourceItems" :key="item.ItemID" :label="item.Name">
          <el-input class="additionContent" v-model="item.value" size="mini" @change="changeVal('alreadyAnswer', 'text')" placeholder="Text" style="width: 300px;"></el-input>
        </el-form-item>
      </el-form>
      <!--<el-input-number v-else-if="question.InputType === 'number'" class="additionContent" v-model="question.value" size="mini" @input="changeVal(question.value)" placeholder="Number"></el-input-number>-->
      <div class="questionTips">{{question.Tips}}</div>
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
    },
    blockQuestions: {
      type: Array
    }
  },
  methods: {
    changeVal: function (value, sign) {
      this.$emit('changeValue', this.templateId, this.blockSequenceNo, this.questionSequenceNo, value, sign)
    },
    loadDataSource: function (question) {
      // this.isLoadingDataSource = true
      if (this.dataList.length > 0) return
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
    loadChildren: function (question) {
      // if (this.dataList.length > 0) return
      if (this.blockQuestions.length === 0) return
      let parent = null
      this.blockQuestions.forEach(function (bq) {
        if (bq.question.InputType === 'list' && bq.question.Description.indexOf(question.DataSource) >= 0) {
          parent = bq.question
        }
      })
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
