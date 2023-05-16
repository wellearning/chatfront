<template>
  <div>
    <div class="printDiv" >
      <el-button icon="el-icon-document" type="primary" @click="toPDF()" size="small">To PDF</el-button>
    </div>
    <div id="questionListDom" style="margin-left: 20px">
      <h2 class="">{{ typeName }}</h2>
      <div>
        <el-table :data="list" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
          <el-table-column label="Question ID" prop="QuestionID" width="100" fixed="left"></el-table-column>
          <el-table-column label="Description" min-width="600">
            <template v-slot="scope">
              <AnswerChoiceQuestion :question="scope.row"></AnswerChoiceQuestion>
            </template>
          </el-table-column>
        </el-table>

      </div>
    </div>
  </div>
</template>

<script>
import AnswerChoiceQuestion from '@/component/choiceQuestion/answerMultipleChoiceQuestion'

export default {
  components: {
    AnswerChoiceQuestion
  },
  name: 'questionList',
  data: function () {
    return {
      pages: 0,
      isLoading: false,
      list: [],
      total: 0
    }
  },
  props: {
    typeID: {
      type: Number
    },
    btypeID: {
      type: Number
    },
    typeName: {
      type: String
    }
  },
  mounted: function () {
    this.loadQuestions(this.typeID, this.btypeID)
  },
  methods: {
    start: function () {
      console.log('start')
    },
    loadQuestions: function (id, btypeid) {
      this.isLoading = true
      this.list = []
      this.axios.post('/api/Services/baseservice.asmx/GetPages_GetQuestionsByType', {typeid: id, btypeid: btypeid}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.pages = Number(res.data)
          for (let i = 0; i < this.pages; i++) {
            this.loadPageQuestions(id, btypeid, i)
          }
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    loadPageQuestions: function (id, btypeid, page) {
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetQuestionsByType_page', {typeid: id, btypeid: btypeid, page: page}).then(res => {
        if (res) {
          console.log('查询单个', res)
          let pageList = res.data
          pageList.forEach(function (q) {
            q.value = []
          })
          let newList = this.list.concat(pageList)
          this.list = newList
          this.list.sort(this.by('QuestionID'))
          this.total = this.list.length
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    // 关闭Pink Slip
    close: function (done) {
      this.list = []
    },
    toPDF: function () {
      /*
      this.$printJS({
        printable: 'questionListDom',
        type: 'html',
        header: 'Single choice question list',
        style: ''
      })
      */
      this.isLoading = true
      this.htmlTitle = this.typeName
      this.getPdf('#questionListDom')
      this.isLoading = false
    }
  }
}
</script>

<style scoped>

</style>
