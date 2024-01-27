<template>
  <div>
    <el-row :gutter="20" class="inPageNav">
      <el-col :span="16">
        <div class="welcome">
          <img src="../../../assets/images/welcome.png">
          <p>Welcome, {{JSON.parse(this.$store.getters.getAccount).Name}}</p>
          <!--<p>You can record and view memos here.</p>-->
        </div>
      </el-col>
      <el-col :span="8" v-if="files.length > 0">
        <div>Useful files:</div>
        <div v-for="(item, index) in files" :key="index">
          <a :href="'/api' + 'upload/' + subPath + '/' + item">{{item}}</a>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      subPath: 'usefulFiles',
      files: [],
      isLoading: false
    }
  },
  mounted: function () {
    this.loadDownloadFiles()
  },
  methods: {
    loadDownloadFiles () {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetFiles', {subpath: this.subPath}).then(res => {
        if (res) {
          console.log('loadDownloadFiles', res)
          this.files = res.data
          this.isLoading = false
        }
      }).catch(err => {
        console.log('loadDownloadFiles出错', err)
        this.isLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
