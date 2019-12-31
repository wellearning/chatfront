<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Simple Answer</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Question" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name)" :loading="isLoading" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list" empty-text="No Record">
        <el-table-column label="Question ID" prop="id" width="100"></el-table-column>
        <el-table-column label="Question">
          <template slot-scope="scope">
            <el-input v-model="scope.row.name" :disabled="!(scope.row.id === currentId)"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button v-if="currentId === null && !(scope.row.id === currentId)" icon="el-icon-edit" type="primary" @click="showEdit(scope.row.id)" :loading="isLoading" size="small">Edit</el-button>
            <el-button v-if="currentId === null && !(scope.row.id === currentId)" icon="el-icon-delete" type="danger" @click="del(scope.row.id)" :loading="isLoading" size="small">Delete</el-button>
            <el-button v-if="scope.row.id === currentId" icon="el-icon-check" type="primary" @click="edit(scope.row)" :loading="isLoading" size="small">Confirm</el-button>
            <el-button v-if="scope.row.id === currentId" icon="el-icon-close" type="primary" @click="cancel()" :loading="isLoading" plain size="small">Cancel</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="handleCurrentChange" :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Property" :visible.sync="addFormVisible" width="600px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="Role Property" prop="property">
            <el-input v-model="addForm.property" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      isLoading: false,
      currentId: null,
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      // 列表
      list: [],
      pageSize: 10,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 新增
      addFormVisible: false,
      addForm: {
        name: null
      },
      addFormRules: {
        name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function () {
    this.search(null)
  },
  methods: {
    // 查询
    search: function (name) {
      // todo: 查询接口
      // this.isLoading = true
      // this.axios.post('/api/', {}).then(res => {
      //   console.log('查询', res)
      //   this.list = res.data.data
      //   this.isLoading = false
      // }).catch(err => {
      //   console.log('查询出错', err)
      //   this.isLoading = false
      // })
      this.list = [{id: 1, name: 'admin'}, {id: 2, name: 'manager'}, {id: 3, name: 'visitor'}, {id: 4, name: 'worker'}]
    },
    // 分页
    handleCurrentChange: function (currentPage) {
      // this.isLoading = true
      // this.axios.post('/api/', {}).then(res => { // todo: 分页查询接口
      //   console.log('分页', res)
      //   this.list = res.data.data.list
      //   this.total = res.data.data.total
      //   if (res.data.data.total > 0) {
      //     if (res.data.data.list.length > 0) {
      //       this.currentPage = res.data.data.pageNum
      //     } else {
      //       this.currentPage = res.data.data.pageNum - 1
      //     }
      //   } else {
      //     this.currentPage = 1
      //   }
      //   this.isLoading = false
      // }).catch(err => {
      //   console.log('分页出错', err)
      //   this.isLoading = false
      // })
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search(null)
    },
    // 显示修改
    showEdit: function (id) {
      this.currentId = id
    },
    // 删除
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/?id=' + id).then(res => { // todo: 删除接口
          console.log('删除', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          this.search()
          this.isLoading = false
        }).catch(err => {
          console.log('删除出错', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    // 修改
    edit: function (obj) {
      let rule = '^.{1,512}$'
      if (!new RegExp(rule).test(obj.name)) {
        this.$message({
          type: 'error',
          message: 'Format Error'
        })
      } else {
        this.isLoading = true
        this.axios.post('/api/', {id: obj.id, name: obj.name}).then(res => { // todo: 修改接口
          console.log('修改', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          this.currentId = null
          this.search()
          this.isLoading = false
        }).catch(err => {
          console.log('修改出错', err)
          this.isLoading = false
        })
      }
    },
    // 取消修改
    cancel: function () {
      this.currentId = null
    },
    // 显示新增弹窗
    showAdd: function () {
      this.addFormVisible = true
    },
    // 隐藏新增弹窗
    closeAdd: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$refs['addForm'].resetFields()
        done()
      }).catch(() => {})
    },
    // 新增
    add: function () {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.axios.post('/api/', this.addForm).then(res => { // todo: 新增接口
            console.log('新增', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.$refs['addForm'].resetFields()
            this.addFormVisible = false
            this.search()
            this.isLoading = false
          }).catch(err => {
            console.log('新增出错', err)
            this.isLoading = false
          })
        } else {
          this.$message({
            type: 'error',
            message: 'Format Error'
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
