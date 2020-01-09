<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Fill In Question</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small"></el-input>
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
        <el-table-column label="Question ID" prop="QuestionID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Question" min-width="950">
          <template slot-scope="scope">
            <AnswerFillInQuestion :question="scope.row"></AnswerFillInQuestion>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row.QuestionID)" :loading="isLoading" size="small"></el-button>
            <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.QuestionID)" :loading="isLoading" size="small"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Fill In Question" :visible.sync="addFormVisible" width="1000px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form choiceQuestionForm">
          <div v-for="(item, index) in addForm.fillinParts" :key="index" class="choice">
            <!--todo 修改时数字表单校验失败-->
            <!--<el-form-item label="Part" :prop="'fillinParts.' + index + '.Part'" :rules="item.IsFillin ? [{ required: true, message: 'Please Enter', trigger: 'blur'}, { type: 'number', message: 'Number Only', trigger: 'blur'}] : [{ required: true, message: 'Please Enter', trigger: 'blur'}]">-->
              <!--<el-input v-model="item.Part" clearable></el-input>-->
            <!--</el-form-item>-->
            <el-form-item label="Part">
              <el-input v-model="item.Part" clearable></el-input>
            </el-form-item>
            <el-form-item style="margin-left: 20%;">
              <el-checkbox v-model="item.IsFillin">Is Fill In</el-checkbox>
              <!--<el-checkbox v-model="item.isNextLine">Is Next Line</el-checkbox>-->
              <el-button icon="el-icon-arrow-up" v-if="index !== 0" type="primary" @click="upChoice('addForm', index)" :loading="isLoading" plain size="small" style="float: right; margin-left: 10px;"></el-button>
              <el-button icon="el-icon-arrow-down" v-if="index !== addForm.fillinParts.length - 1" type="primary" @click="downChoice('addForm', index)" :loading="isLoading" plain size="small" style="float: right;"></el-button>
            </el-form-item>
            <el-form-item style="margin-left: 20%;">
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('addForm', index)" :loading="isLoading" plain size="small" style="float: right;"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('addForm')" :loading="isLoading" plain size="small" style="float: right; margin-right: 10%;"></el-button>
          </el-form-item>
          <el-form-item label="Question Tips" prop="Tips">
            <el-input v-model="addForm.Tips" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="Edit Choice Question" :visible.sync="editFormVisible" width="1000px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form choiceQuestionForm">
          <div v-for="(item, index) in editForm.fillinParts" :key="index" class="choice">
            <el-form-item label="Part">
              <el-input v-model.number="item.Part" clearable></el-input>
            </el-form-item>
            <el-form-item style="margin-left: 20%;">
              <el-checkbox v-model="item.IsFillin">Is Fill In</el-checkbox>
              <!--<el-checkbox v-model="item.isNextLine">Is Next Line</el-checkbox>-->
              <el-button icon="el-icon-arrow-up" v-if="index !== 0" type="primary" @click="upChoice('editForm', index)" :loading="isLoading" plain size="small" style="float: right; margin-left: 10px;"></el-button>
              <el-button icon="el-icon-arrow-down" v-if="index !== editForm.fillinParts.length - 1" type="primary" @click="downChoice('editForm', index)" :loading="isLoading" plain size="small" style="float: right;"></el-button>
            </el-form-item>
            <el-form-item style="margin-left: 20%;">
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('editForm', index)" :loading="isLoading" plain size="small" style="float: right;"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('editForm')" :loading="isLoading" plain size="small" style="float: right; margin-right: 10%;"></el-button>
          </el-form-item>
          <el-form-item label="Question Tips" prop="Tips">
            <el-input v-model="editForm.Tips" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import AnswerFillInQuestion from '@/component/fillInQuestion/answerFillInQuestion'

export default {
  components: {
    AnswerFillInQuestion
  },
  data: function () {
    return {
      isLoading: false,
      // 新增
      addFormVisible: false,
      addForm: {
        TypeID: 5,
        Description: null,
        Tips: null,
        OutputModeID: 1,
        StatusID: 1,
        Integration: null,
        fillinParts: [],
        options: null
      },
      addFormRules: {
        Tips: [
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ]
      },
      // 修改
      editFormVisible: false,
      editForm: {
        QuestionID: null,
        TypeID: 5,
        Description: null,
        Tips: null,
        OutputModeID: 1,
        StatusID: 1,
        Integration: null,
        fillinParts: [],
        options: null
      },
      editFormRules: {
        Tips: [
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ]
      },
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      // 列表
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  mounted: function () {
    this.search(null)
  },
  methods: {
    // 添加一行
    addChoice: function (form) {
      if (form === 'addForm') {
        this.addForm.fillinParts.push({Part: null, IsFillin: false, SequenceNo: 0})
      } else if (form === 'editForm') {
        this.editForm.fillinParts.push({Part: null, IsFillin: false, SequenceNo: 0})
      }
    },
    // 删除一行
    delChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.fillinParts.splice(index, 1)
      } else if (form === 'editForm') {
        this.editForm.fillinParts.splice(index, 1)
      }
    },
    // 上移一行
    upChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.fillinParts[index] = this.addForm.fillinParts.splice(index - 1, 1, this.addForm.fillinParts[index])[0]
      } else if (form === 'editForm') {
        this.editForm.fillinParts[index] = this.editForm.fillinParts.splice(index - 1, 1, this.editForm.fillinParts[index])[0]
      }
    },
    // 下移一行
    downChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.fillinParts[index] = this.addForm.fillinParts.splice(index + 1, 1, this.addForm.fillinParts[index])[0]
      } else if (form === 'editForm') {
        this.editForm.fillinParts[index] = this.editForm.fillinParts.splice(index + 1, 1, this.editForm.fillinParts[index])[0]
      }
    },
    // 查询
    search: function (name) {
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetQuestionsByType', {typeid: 5}).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          if (name !== null) {
            this.searchName = name
            this.list = this.list.filter(item => item.Integration.indexOf(this.searchName) !== -1)
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
        this.addForm.fillinParts = []
        done()
      }).catch(() => {})
    },
    // 新增
    add: function () {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          for (let i = 0; i < this.addForm.fillinParts.length; i++) {
            this.addForm.fillinParts[i].SequenceNo = i + 1
          }
          this.axios.post('/api/Services/memoservice.asmx/SaveQuestion', {question: JSON.stringify(this.addForm)}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addForm.fillinParts = []
              this.addFormVisible = false
              // 如果新增记录符合查询条件，将新增的记录添加到数组最后，总数加1
              if (this.searchName === null || (this.searchName !== null && res.data.Integration.indexOf(this.searchName) !== -1)) {
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
    },
    // 修改弹窗
    showEdit: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetQuestion', {questionid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.editFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.editForm = res.data
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    // 关闭修改
    closeEdit: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$refs['editForm'].resetFields()
        this.editForm.fillinParts = []
        done()
      }).catch(() => {})
    },
    // 修改
    edit: function () {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          for (let i = 0; i < this.editForm.fillinParts.length; i++) {
            this.editForm.fillinParts[i].SequenceNo = i + 1
          }
          this.axios.post('/api/Services/memoservice.asmx/SaveQuestion', {question: JSON.stringify(this.editForm)}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['editForm'].resetFields()
              this.editForm.fillinParts = []
              this.editFormVisible = false
              // 如果修改记录符合查询条件，更新该记录；如果不符合，删除该记录，总数减1
              if (this.searchName === null || (this.searchName !== null && res.data.Integration.indexOf(this.searchName) !== -1)) {
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
        } else {
          this.$message({
            type: 'error',
            message: 'Format Error'
          })
        }
      })
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
    }
  }
}
</script>

<style scoped>

</style>
