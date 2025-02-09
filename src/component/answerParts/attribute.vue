<template>
  <div class="answer">
    <div class="propertyQuestion" :title="answer.Tips">
      <span class="question">{{answer.QuestionDesc}}</span>
      <span v-if="disabled" style="text-decoration:underline">{{answer.AnswerDesc}}&nbsp;&nbsp;</span>
      <el-input v-else-if="answer.InputType === 'text'" class="additionContent" v-model="answer.AnswerDesc" size="mini" @keydown.native.tab="changeVal()"  @change="changeVal()"  placeholder="Text" style="width: 300px;"></el-input>
      <el-date-picker v-else-if="answer.InputType === 'date'" class="additionContent" v-model="answer.AnswerDesc" ref="name" type="date" size="mini" @keydown.native.tab="changeVal()" @change="changeVal(answer.AnswerDesc, 'date')" placeholder="yyyy-mm-dd"></el-date-picker>
      <el-input v-else-if="answer.InputType === 'number'" class="additionContent" v-model="answer.AnswerDesc" type="number" size="mini" @keydown.native.tab="changeVal()" @change="changeVal(answer.AnswerDesc, 'number')" placeholder="Number"></el-input>
      <el-input v-else-if="answer.InputType === 'money'" class="additionContent" v-model="currencyValue" type="text" size="mini" @focus="setNumeric" @blur="setCurrency" @keydown.native.tab="changeVal()" @change="changeVal(answer.AnswerDesc, 'number')" placeholder="Currency"></el-input>
      <el-input v-else-if="answer.InputType === 'computed'" class="additionContent" v-model="answer.AnswerDesc" type="text" size="mini" readonly placeholder=""></el-input>
      <el-select v-else-if="answer.InputType === 'list' || answer.InputType === 'sublist'" style="width:300px" class="additionContent" v-model="answer.AnswerDesc" ref="name" size="mini" @focus="loadDataSource(answer)" @keydown.native.tab="changeVal()" @change="changeVal(answer, 'list')" placeholder="Please Select" no-data-text="No Data" filterable>
        <el-option class="questionOption" v-for="item in dataList" :key="item.Name" :label="item.Name" :value="item.Name"></el-option>
      </el-select>
      <el-select v-else-if="answer.InputType === 'children'" class="additionContent"  v-model="answer.AnswerDesc" ref="name" size="mini" @focus="loadChildren(answer)" @keydown.native.tab="changeVal()" @change="changeVal(answer.AnswerDesc, 'list')" placeholder="Please Select" no-data-text="No Data" filterable>
        <el-option class="questionOption" v-for="item in dataList" :key="item.Name" :label="item.Name" :value="item.Name"></el-option>
      </el-select>
      <div v-else-if="answer.InputType === 'array'" style="padding-left:20px">
        <el-row v-for="(item, i) in answerItems"  v-bind:key="i" style="padding-top:20px">
          <div v-for="p in dataList" v-bind:key="p.ItemID">
            <span class="question">{{p.Name}}</span>
            <el-date-picker v-if="p.type === 'date'" class="additionContent" v-model="item[p.ItemValue]" type="date" size="mini" @change="changeArray()" placeholder="yyyy-mm-dd"></el-date-picker>
            <el-select v-else-if="p.type === 'list'" style="width:300px" class="additionContent" v-model="item[p.ItemValue]" size="mini" @change="changeArrayList(item, p)" placeholder="Please Select" no-data-text="No Data" filterable>
              <el-option class="questionOption" v-for="item in p.datasource" :key="item.ItemValue" :label="item.Name" :value="item.Name"></el-option>
            </el-select>
            <el-select v-else-if="p.type === 'children'" style="width:300px" class="additionContent" v-model="item[p.ItemValue]" size="mini" @change="changeArray()" placeholder="Please Select" no-data-text="No Data" filterable>
              <el-option class="questionOption" v-for="item in p.datasource" :key="item.ItemValue" :label="item.Name" :value="item.Name"></el-option>
            </el-select>
            <el-select v-else-if="p.type === 'bit'" style="width:300px" class="additionContent" v-model="item[p.ItemValue]" size="mini" @change="changeArray()" placeholder="Please Select" no-data-text="No Data" filterable>
              <el-option class="questionOption" key="0" label="No" value="0"></el-option>
              <el-option class="questionOption" key="1" label="Yes" value="1"></el-option>
            </el-select>
            <el-input v-else-if="p.type === 'money'" class="additionContent" v-model="item[p.Name+'_c']" type="text" size="mini" style="width: 200px;" @blur="setItemCurrency(item,p)" @focus="setItemNumeric(item,p)"></el-input>
            <span v-else-if="p.type === 'moneyplus'">
              <el-input class="additionContent" v-model="item[p.Name+'_c']" type="text" size="mini" style="width: 200px;" @blur="setItemCurrency(item,p)"  @focus="setItemNumeric(item,p)"></el-input>
              <el-checkbox v-model="item[p.Name+'_p']" @change="moneyplusCheck(item, p)">{{p.ItemValue}}</el-checkbox>
            </span>
            <el-input v-else class="additionContent" v-model="item[p.Name]" :type="p.type" size="mini" placeholder="" style="width: 300px;" @change="changeArray()"></el-input>
          </div>
          <el-button icon="el-icon-minus" type="danger" plain size="small" @click="removeItem(i)">Remove</el-button>
        </el-row>
        <el-button icon="el-icon-plus" type="primary" plain size="small" @click="addItem()">Add</el-button>
        <el-button icon="el-icon-sunset" type="primary" plain size="small" @click="changeVal()">Done</el-button>
      </div>
      <div v-else-if="answer.InputType === 'address'" style="padding-left:20px">
        <GmapAutocomplete v-if="!enableEdit" style="width: 500px; height: 25px;"
                          :options="{
            componentRestrictions: { country: 'ca' },
          }"
                          :value="answer.AnswerDesc"
                          @place_changed="setPlace">
        </GmapAutocomplete>
        <el-input v-else-if="enableEdit" class="additionContent" v-model="answer.AnswerDesc" size="mini" @change="changeVal()"  placeholder="Text" style="width: 490px;"></el-input>
        <el-checkbox v-model="enableEdit">need edit</el-checkbox>
      </div>
      <!--<el-input-number v-else-if="question.InputType === 'number'" class="additionContent" v-model="question.value" size="mini" @input="changeVal(question.value)" placeholder="Number"></el-input-number>-->
      <!--div class="questionTips">{{answer.Tips}}</div-->
    </div>
  </div>
</template>

<script>
// import {isNumeric} from 'echarts/lib/util/number'

export default {
  name: 'answerProperty',
  data: function () {
    return {
      input: '',
      currencyValue: '',
      isLoading: false,
      enableEdit: false,
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
    // if (this.$refs.name !== undefined) this.$refs.name.focus()
  },
  methods: {
    addItem: function () {
      let item = {}
      this.dataList.forEach(function (p) {
        if (p.type === 'moneyplus') {
          item[p.Name] = ''
          item[p.Name + '_c'] = ''
          item[p.Name + '_p'] = false
        } else if (p.type === 'money') {
          item[p.Name] = ''
          item[p.Name + '_c'] = ''
        } else item[p.ItemValue] = ''
      })
      this.answerItems.push(item)
      this.changeArray()
    },
    removeItem: function (i) {
      this.$confirm('Are you sure to remove this item?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.answerItems.splice(i, 1)
        this.changeArray()
      })
      // this.answerItems.pop()
    },
    changeArrayList: function (item, p) {
      let childp = this.dataList.find(cp => cp.type === 'children')
      if (childp === undefined) {
        this.changeArray()
        return
      }
      let source = p.datasource.find(ds => ds.ItemValue === item[p.ItemValue])
      if (source !== undefined) {
        if (source.children === null) source.children = []
        childp.datasource = source.children
        if (source.children.length > 0) item[childp.ItemValue] = source.children[0].Name
      }
      this.changeArray()
    },
    changeArray: function () {
      /*
      console.log('changeArray: ')
      if (item !== undefined) {
        if (p.type === 'money' || p.type === 'moneyplus') {
          item[p.Name] = Number(item[p.Name + '_c'])
        }
      }
       */
      let value = JSON.stringify(this.answerItems)
      this.answer.AnswerDesc = value
    },
    changeVal: function () {
      if (this.answer.InputType === 'array') {
        let value = JSON.stringify(this.answerItems)
        this.answer.AnswerDesc = value
      } else if (this.answer.InputType === 'money') {
        if (!isNaN(this.currencyValue)) {
          this.answer.AnswerDesc = Number(this.currencyValue)
          // this.currencyValue = this.answer.AnswerDesc.toLocaleString('ja-JP', { style: 'currency', currency: 'USD' })
          this.currencyValue = this.answer.AnswerDesc.toLocaleString()
        } else return
      }
      this.$emit('changeValue')
    },
    setCurrency: function () {
      if (!isNaN(this.currencyValue)) {
        this.answer.AnswerDesc = Number(this.currencyValue)
        this.currencyValue = this.answer.AnswerDesc.toLocaleString()
      } else {
        // this.currencyValue = ''
      }
    },
    setNumeric: function () {
      this.currencyValue = this.answer.AnswerDesc
    },
    setItemCurrency: function (item, p) {
      if (item[p.Name + '_c'] === undefined) return
      if (p.type === 'moneyplus') {
        if (item[p.Name + '_p']) return
      }
      console.log('setItemCurrency: ' + item[p.Name + '_c'])
      if (!isNaN(item[p.Name + '_c'])) {
        item[p.Name] = Number(item[p.Name + '_c'])
        item[p.Name + '_c'] = '$' + item[p.Name].toLocaleString()
      } else {
        item[p.Name] = 0
        item[p.Name + '_c'] = ''
      }
      this.changeArray()
      /*
      */
    },
    setItemNumeric: function (item, p) {
      if (item[p.Name] === undefined || item[p.Name] === '') return
      if (p.type === 'moneyplus' && item[p.Name + '_p']) return
      console.log('setItemNumeric: ' + p.Name)
      item[p.Name + '_c'] = item[p.Name]
      /*
      if (p.type === 'moneyplus') {
        if (item[p.Name] === p.ItemValue) {
          item[p.Name + '_c'] = ''
          item[p.Name + '_p'] = true
        } else {
          item[p.Name + '_c'] = item[p.Name]
          item[p.Name + '_p'] = false
        }
      } else if (p.type === 'money') {
        console.log(item[p.Name + '_c'])
        if (isNaN(item[p.Name])) {
          item[p.Name + '_c'] = ''
        } else {
          item[p.Name + '_c'] = item[p.Name]
        }
      }
      */
    },
    moneyplusCheck: function (item, p) {
      if (item[p.Name + '_p']) {
        item[p.Name] = p.ItemValue
        item[p.Name + '_c'] = ''
      } else {
        item[p.Name] = 0
      }
      this.changeArray()
    },
    parseAnswer: function (answer) {
      this.enableEdit = false
      if (answer.InputType === 'array') {
        this.loadDataSource(answer)
        if (answer.AnswerDesc !== null && answer.AnswerDesc !== '') {
          this.answerItems = JSON.parse(answer.AnswerDesc)
        }
      } else if (answer.InputType === 'computed') {
        this.computeVal(answer)
      } else if (answer.InputType === 'money') {
        if (isNaN(answer.AnswerDesc)) {
          this.currencyValue = ''
        } else {
          let value = Number(answer.AnswerDesc)
          this.currencyValue = value.toLocaleString()
        }
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
      } else if (answer.InputType === 'sublist') {
        service = '/api/Services/baseservice.asmx/GetSubDataItems'
        param = {questionid: answer.QuestionID}
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
              if (da.type === 'list' || da.type === 'sublist') da.datasource = da.children.slice(1)
              else if (da.type === 'money') {
                this.answerItems.forEach(item => {
                  if (isNaN(item[da.Name])) {
                    item[da.Name + '_c'] = ''
                  } else {
                    item[da.Name + '_c'] = '$' + Number(item[da.Name]).toLocaleString()
                  }
                })
              } else if (da.type === 'moneyplus') {
                this.answerItems.forEach(item => {
                  if (item[da.Name] === da.ItemValue) {
                    item[da.Name + '_c'] = ''
                    item[da.Name + '_p'] = true
                  } else {
                    item[da.Name + '_p'] = false
                    item[da.Name + '_c'] = '$' + Number(item[da.Name]).toLocaleString()
                  }
                })
              }
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
    },
    setPlace (place) {
      let value = place.formatted_address.replace(/加拿大|Canada/, '')
      if (value.endsWith(' ')) value = value.substring(0, value.length - 1)
      if (value.endsWith(',')) value = value.substring(0, value.length - 1)
      this.answer.AnswerDesc = value
      this.$emit('changeValue')
    }
  }
}
</script>

<style scoped>

</style>
