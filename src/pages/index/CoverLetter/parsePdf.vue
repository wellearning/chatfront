<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Parse PDF</span>
      <div class="rightBtnBox">
        <el-upload
          class=""
          :headers="headerObj"
          :data="dataObj"
          :action="handleUrl"
          accept=".pdf"
          :before-upload="beforeUpload"
          :on-success="handleSuccess"
        >
          <el-button icon="el-icon-upload" type="primary">import</el-button>
        </el-upload>
      </div>
      <div class="rightBtnBox">
        <el-select v-model="pdfname" placeholder="" class="" no-data-text="No Record" filterable @change="showPdfData()">
          <el-option v-for="item in pdfdatas" :key="item.Name" :label="item.Name" :value="item.Name"></el-option>
        </el-select>
        <el-link :href="pdfUrl" target="_blank" class="">show pdf in new tab</el-link>
      </div>
      <div class="rightBtnBox">
      </div>
    </div>
    <div class="inPageContent">
      <el-table height="500" :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <!--el-table-column label="ID" prop="TransactionRecordID" width="100" fixed="left" sortable="custom"></el-table-column-->
        <el-table-column label="PropertyName" prop="StruName" width="400" fixed="left" sortable="custom"></el-table-column>
        <el-table-column label="Value" prop="Value" min-width="400" sortable="custom"></el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template v-slot="scope">
            <!--el-button-group>
              <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row)" :loading="isLoading" size="small">Edit</el-button>
              <el-button icon="el-icon-delete" type="danger" @click="del(scope.row)" :loading="isLoading" size="small">Delete</el-button>
            </el-button-group-->
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
    </div>
  </div>
</template>

<script>

import store from '../../../store'

export default {
  components: {
  },
  name: 'parsePdf',
  data: function () {
    return {
      isDev: false,
      isLoading: false,
      rootUrl: '',
      handleUrl: '',
      headerObj: {
        Authorization: JSON.parse(store.getters.getAccount).Token
      },
      dataObj: {
        itemType: 'transaction'
      },
      pdfname: null,
      pdfdatas: [],
      selectPdfData: null,
      pdfUrl: '',
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  mounted: function () {
    this.rootUrl = this.isDev ? 'http://localhost:65033' : 'http://18.225.254.140:8085'
    this.handleUrl = this.rootUrl + '/Services/basehandle.ashx'
    // this.setComputedAttributes()
    // this.setRateTypes()
    // this.viewCoverLetter()
    // this.initial()
  },
  methods: {
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
    },
    rank: function (name) {
      this.list.sort(this.by(name))
    },
    rankdesc: function (name) {
      this.list.sort(this.bydesc(name))
    },
    beforeUpload: function (file) {
      console.log('file', file)
    },
    handleSuccess: function (res, file, fileList) {
      console.log('response', res.data)
      if (res.code > 0) {
        this.$message({
          showClose: true,
          type: 'warning',
          message: res.message,
          duration: 3000
        })
        return
      }
      let message = 'The file has been successfully imported.'
      let duration = 6000
      if (res.data !== undefined) {
        let datanode = res.data
        let exist = this.pdfdatas.find(node => node.Name === datanode.Name)
        if (exist !== undefined) {
          message = 'The file has been imported.'
        } else {
          this.pdfdatas.push(datanode)
          this.pdfname = datanode.Name
          this.showPdfData()
        }
      }
      // 文件上传成功的回调
      this.$message({
        showClose: true,
        type: 'success',
        message: message,
        duration: duration
      })
    },
    showPdfData: function () {
      let nodename = this.pdfname
      let datanode = this.pdfdatas.find(node => node.Name === nodename)
      if (datanode !== undefined) {
        this.selectPdfData = datanode
        this.pdfUrl = this.selectPdfData === null ? '' : this.rootUrl + this.selectPdfData.Value
        this.list = datanode.Leafs
        this.total = this.list.length
        this.pageCount = Math.ceil(this.total / this.pageSize)
        this.currentPage = 1
        this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
      }
    }
  }
}
</script>

<style scoped>

</style>
