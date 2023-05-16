<template>
  <div>
    <div class="printDiv" >
      <el-button icon="el-icon-document" type="primary" @click="toPDF()" size="small">To PDF</el-button>
    </div>
    <div id="questionListDom">
      <h2 class="">{{ typeName }}</h2>
      <el-table :data="list" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Question ID" prop="QuestionID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Description" prop="Description" min-width="600">

        </el-table-column>
      </el-table>

    </div>
  </div>
</template>

<script>
export default {
  name: 'questionList',
  data: function () {
    return {
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
    this.loadQuestions(this.typeID)
  },
  methods: {
    start: function () {
      console.log('start')
    },
    loadQuestions: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetQuestionsByType', {typeid: id, btypeid: this.btypeID}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.list = res.data
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
      this.htmlTitle = this.typeName
      this.getPdf('#questionListDom')
    }
  }
}
</script>

<style scoped>

</style>
