<template>
  <div class="question">
    <div v-if="answer.InputType ==='array'">
      <el-table :data="answerItems" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column v-for="(item, i) in dataList" :key="i" :label="item.Name" :prop="item.ItemValue" min-width="150"></el-table-column>
      </el-table>

    </div>
    <div v-else>
      <span>{{answer.QuestionDesc}}</span>
      <span class="answer marginLeft10px">
                <span class="content" v-if="answer.AnswerDesc === null || answer.AnswerDesc === ''"></span>
                <span class="content" v-else-if="IsDate(answer.AnswerDesc)">{{dateFormat(answer.AnswerDesc)}}</span>
                <span class="content" v-else>{{answer.AnswerDesc}}</span>
              </span>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'viewAttribute',
  data: function () {
    return {
      isLoading: false,
      busiItems: [],
      rates: [],
      rateTypes: [],
      dataList: [], // 从DataSource中获取的数据列表，在list,children, array等类型中用到
      answerItems: [] // array中回答的对象数组
    }
  },
  props: {
    answer: {
      type: Object
    }
  },
  mounted: function () {
    this.parseAnswer(this.answer)
  },
  methods: {
    IsDate (dateVal) {
      if (dateVal.length > 12 && isNaN(dateVal) && !isNaN(Date.parse(dateVal))) return true
      else return false
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    loadDataSource: function (answer) {
      // this.isLoadingDataSource = true
      if (this.dataList.length > 0) return
      // let question = answer.blockQuestion.question
      this.axios.post('/api/Services/baseservice.asmx/GetDictionaryWithChildren', { parenttype: answer.DataSource, childtype: 'InputType' }).then(res => {
        if (res) {
          console.log('GetDictionary', res)
          res.data.forEach(da => {
            if (da.children.length > 0) da.type = da.children[0].Name
            else da.type = 'text'
          })

          this.dataList = res.data
          this.dataList.forEach(ds => {
            if (ds.type === 'date') {
              this.answerItems.forEach(item => {
                let value = moment(item[ds.ItemValue])
                item[ds.ItemValue] = moment(value).format('YYYY-MM-DD')
              })
            }
          })
        }
        // this.isLoadingDataSource = false
      }).catch(err => {
        console.log('GetDictionary', err)
        // this.isLoadingDataSource = false
      })
    },

    parseAnswer: function (answer) {
      if (answer.InputType === 'array') {
        this.loadDataSource(answer)
        if (answer.AnswerDesc !== undefined && answer.AnswerDesc !== '') this.answerItems = JSON.parse(answer.AnswerDesc)
      }
    }
  }
}
</script>

<style scoped>

</style>
