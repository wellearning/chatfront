<template>
    <div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Template ID" prop="TemplateID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Title" prop="Title" min-width="300"></el-table-column>
      </el-table>

    </div>
</template>

<script>
export default {
  name: 'usedTemplateList',
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
    blockID: {
      type: Number
    }
  },
  mounted: function () {
    this.loadTemplates(this.blockID)
  },
  methods: {
    start: function () {
      console.log('start')
    },
    loadTemplates: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetTemplatesByBlock', {blockid: id}).then(res => {
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
    // 关闭
    close: function (done) {
      this.list = []
    }

  }

}
</script>

<style scoped>

</style>
