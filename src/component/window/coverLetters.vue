<template>
    <div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Block ID" prop="BlockID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Name" prop="Name" min-width="300"></el-table-column>
      </el-table>

    </div>
</template>

<script>
export default {
  name: 'usedBlockList',
  data: function () {
    return {
      list: [],
      isLoading: false,
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  props: {
    questionID: {
      type: Number
    }
  },
  mounted: function () {
    this.loadBlocks(this.questionID)
  },
  methods: {
    start: function () {
      console.log('start')
    },
    loadBlocks: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetBlocksByQuestion', {questionid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.list = res.data
          this.total = this.list.length
          this.currentPage = 1
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
    }

  }

}
</script>

<style scoped>

</style>
