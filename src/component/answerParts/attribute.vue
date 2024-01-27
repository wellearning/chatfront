<template>
  <div class="answer">
    <div class="propertyQuestion">
      <span class="question">{{answer.QuestionDesc}}</span>
      <span v-if="disabled" style="text-decoration:underline">{{answer.AnswerDesc}}&nbsp;&nbsp;</span>
      <el-input v-else-if="answer.InputType === 'text'" class="additionContent" v-model="answer.AnswerDesc" size="mini" @keydown.native.tab="changeVal()"  @change="changeVal()"  placeholder="Text" style="width: 300px;"></el-input>
      <el-date-picker v-else-if="answer.InputType === 'date'" class="additionContent" v-model="answer.AnswerDesc" type="date" size="mini" @keydown.native.tab="changeVal()" @change="changeVal(answer.AnswerDesc, 'date')" placeholder="yyyy-mm-dd"></el-date-picker>
      <el-input v-else-if="answer.InputType === 'number'" class="additionContent" v-model="answer.AnswerDesc" type="number" size="mini" @keydown.native.tab="changeVal()" @change="changeVal(answer.AnswerDesc, 'number')" placeholder="Number"></el-input>
      <el-input v-else-if="answer.InputType === 'money'" class="additionContent" v-model="answer.AnswerDesc"
                @keydown.native.enter="changeVal()" @change="changeVal(answer.AnswerDesc, 'number')" type="number" placeholder="Number">
      </el-input>
      <el-input v-else-if="answer.InputType === 'computed'" class="additionContent" v-model="answer.AnswerDesc" type="text" size="mini" readonly placeholder=""></el-input>
      <el-select v-else-if="answer.InputType === 'list'" style="width:300px" class="additionContent" v-model="answer.AnswerDesc" size="mini" @focus="loadDataSource(answer)" @keydown.native.tab="changeVal()" @change="changeVal(answer, 'list')" placeholder="Please Select" no-data-text="No Data" filterable>
        <el-option class="questionOption" v-for="item in dataList" :key="item.ItemValue" :label="item.Name" :value="item.ItemValue"></el-option>
      </el-select>
      <el-select v-else-if="answer.InputType === 'children'" class="additionContent"  v-model="answer.AnswerDesc" size="mini" @focus="loadChildren(answer)" @keydown.native.tab="changeVal()" @change="changeVal(answer.AnswerDesc, 'list')" placeholder="Please Select" no-data-text="No Data" filterable>
        <el-option class="questionOption" v-for="item in dataList" :key="item.Name" :label="item.Name" :value="item.Name"></el-option>
      </el-select>
      <div v-else-if="answer.InputType === 'array'" style="padding-left:20px">
        <el-row v-for="(item, i) in answerItems"  v-bind:key="i" style="padding-top:20px">
          <div v-for="p in dataList" v-bind:key="p.ItemID">
            <span class="question">{{p.Name}}</span>
            <el-date-picker v-if="p.type === 'date'" class="additionContent" v-model="item[p.ItemValue]" type="date" size="mini" @change="changeArray()" placeholder="yyyy-mm-dd"></el-date-picker>
            <el-select v-else-if="p.type === 'list'" style="width:300px" class="additionContent" v-model="item[p.ItemValue]" size="mini" @change="changeArray()" placeholder="Please Select" no-data-text="No Data" filterable>
              <el-option class="questionOption" v-for="item in p.datasource" :key="item.ItemValue" :label="item.Name" :value="item.Name"></el-option>
            </el-select>
            <el-input v-else class="additionContent" v-model="item[p.ItemValue]" :type="p.type" size="mini" placeholder="" style="width: 300px;" @change="changeArray()"></el-input>
          </div>
        </el-row>
        <el-button icon="el-icon-plus" type="primary" plain size="small" @click="addItem()">Add</el-button>
        <el-button icon="el-icon-minus" type="primary" plain size="small" @click="removeItem()">Remove</el-button>
        <el-button icon="el-icon-plus" type="primary" plain size="small" @click="changeVal()">Done</el-button>
      </div>
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
      isLoading: false,
      dataList: [], // 从DataSource中获取的数据列表，在list,children, array等类型中用到
      answerItems: [], // array中回答的对象数组
      operands: [],
      busiItems: [],
      rates: [],
      rateTypes: [],
      rate: null,
      rateType: null
    }
  },
  props: {
    answer: {
      type: Object
    },
    businessObj: {
      type: Object
    },
    objectId: {
      type: Number
    },
    disabled: {
      type: Boolean
    }
  },
  mounted: function () {
    this.parseAnswer(this.answer)
  },
  methods: {
    addItem: function () {
      let item = {}
      this.dataList.forEach(function (p) {
        item[p.ItemValue] = ''
      })
      this.answerItems.push(item)
      this.changeArray()
    },
    removeItem: function () {
      this.answerItems.pop()
      this.changeArray()
    },
    changeArray: function () {
      let value = JSON.stringify(this.answerItems)
      this.answer.AnswerDesc = value
    },
    changeVal: function () {
      if (this.answer.InputType === 'array') {
        let value = JSON.stringify(this.answerItems)
        this.answer.AnswerDesc = value
      }
      this.$emit('changeValue')
    },
    parseAnswer: function (answer) {
      if (answer.InputType === 'array') {
        this.loadDataSource(answer)
        if (answer.AnswerDesc !== null && answer.AnswerDesc !== '') this.answerItems = JSON.parse(answer.AnswerDesc)
      } else if (answer.InputType === 'computed') {
        this.computeVal(answer)
      }
    },
    loadDataSource: function (answer) {
      // this.isLoadingDataSource = true
      if (this.dataList.length > 0) return
      let service = '/api/Services/baseservice.asmx/GetDataItems'
      let param = { datatype: answer.DataSource }
      if (answer.InputType === 'array') {
        service = '/api/Services/baseservice.asmx/GetObjectProperties'
        param = { parenttype: answer.DataSource }
      }
      // let question = answer.blockQuestion.question
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadDataSource', res)
          this.dataList = res.data
          if (answer.InputType === 'array') {
            res.data.forEach(da => {
              if (da.children.length > 0) da.type = da.children[0].Name
              else da.type = 'text'
              if (da.type === 'list') da.datasource = da.children.slice(1)
            })
          }
        }
        // this.isLoadingDataSource = false
      }).catch(err => {
        console.log('GetDictionary', err)
        // this.isLoadingDataSource = false
      })
    },
    loadChildren: function (answer) {
      let parent = this.$parent.getAttributeByName(answer.DataSource) // answer.blockQuestion.Question
      this.axios.post('/api/Services/baseservice.asmx/GetChildrenDictionary', { parenttype: parent.DataSource, parentvalue: parent.AnswerDesc }).then(res => {
        if (res) {
          console.log('GetChildrenDictionary', res)
          this.dataList = res.data
        }
        // this.isLoadingDataSource = false
      }).catch(err => {
        console.log('GetChildrenDictionary', err)
        // this.isLoadingDataSource = false
      })
    },
    computeVal: function (answer) {
      // this.loadRateTypes(answer)
    }
  }
}
</script>

<style scoped>

</style>
