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
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record">
        <el-table-column label="Question ID" prop="QuestionID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Question" min-width="300">
          <template slot-scope="scope">
            <el-input v-model="scope.row.Description" :disabled="!(scope.row.QuestionID === currentId)"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button v-if="currentId === null && !(scope.row.QuestionID === currentId)" icon="el-icon-edit" type="primary" @click="showEdit(scope.row.QuestionID, scope.row.Description)" :loading="isLoading" size="small">Edit</el-button>
            <el-button v-if="currentId === null && !(scope.row.QuestionID === currentId)" icon="el-icon-delete" type="danger" @click="del(scope.row.QuestionID)" :loading="isLoading" size="small">Delete</el-button>
            <el-button v-if="scope.row.QuestionID === currentId" icon="el-icon-check" type="primary" @click="edit(scope.row)" :loading="isLoading" size="small">Confirm</el-button>
            <el-button v-if="scope.row.QuestionID === currentId" icon="el-icon-close" type="primary" @click="cancel(scope.row.QuestionID)" :loading="isLoading" plain size="small">Cancel</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Question" :visible.sync="addFormVisible" width="1000px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="Question" prop="Description">
            <el-input v-model="addForm.Description" clearable></el-input>
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
      currentDescription: null,
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      // 列表
      tempList: [],
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 新增
      addFormVisible: false,
      addForm: {
        TypeID: 4,
        Description: null,
        Tips: null,
        OutputModeID: 1,
        StatusID: 1,
        Integration: null,
        fillinParts: null,
        options: null
      },
      addFormRules: {
        Description: [
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
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetQuestionsByType', {typeid: 4}).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          if (name !== null) {
            this.searchName = name
            this.list = this.list.filter(item => item.Description.indexOf(this.searchName) !== -1)
          }
          this.total = this.list.length
          this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search(null)
    },
    // 显示修改
    showEdit: function (id, description) {
      this.currentId = id
      this.currentDescription = description
    },
    // 删除
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/memoservice.asmx/RemoveQuestion', {questionid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.QuestionID !== id)
            this.total = this.list.length
          }
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
      if (!new RegExp(rule).test(obj.Description)) {
        this.$message({
          type: 'error',
          message: 'Format Error'
        })
      } else {
        this.isLoading = true
        this.axios.post('/api/Services/memoservice.asmx/SaveQuestion', {question: JSON.stringify(obj)}).then(res => {
          if (res) {
            console.log('修改', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.currentId = null
            this.currentDescription = null
            // 如果修改记录符合查询条件，更新该记录；如果不符合，删除该记录，总数减1
            if (this.searchName === null || (this.searchName !== null && res.data.Description.indexOf(this.searchName) !== -1)) {
              this.list = this.list.map(item => { return item.QuestionID === res.data.QuestionID ? res.data : item })
            } else {
              this.list = this.list.filter(item => item.QuestionID !== res.data.QuestionID)
              this.total = this.list.length
            }
          }
          this.isLoading = false
        }).catch(err => {
          console.log('修改出错', err)
          this.isLoading = false
        })
      }
    },
    // 取消修改
    cancel: function (id) {
      this.currentId = null
      this.list.find(item => item.QuestionID === id).Description = this.currentDescription
      this.currentDescription = null
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
          this.axios.post('/api/Services/memoservice.asmx/SaveQuestion', {question: JSON.stringify(this.addForm)}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addFormVisible = false
              // 如果新增记录符合查询条件，将新增的记录添加到数组最后，总数加1
              if (this.searchName === null || (this.searchName !== null && res.data.Description.indexOf(this.searchName) !== -1)) {
                this.list.push(res.data)
                this.total = this.list.length
              }
            }
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
