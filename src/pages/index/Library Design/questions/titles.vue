<!--
FileName: Library/questions/titles.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show titles list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Titles for {{businessTypes[btypeId]}}</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">New</el-button>
        <el-button icon="el-icon-plus" type="primary" @click="showQuestionList()" :loading="isLoading">Print</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Title" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name)" :loading="isLoading" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Title ID" prop="QuestionID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Use Times" prop="UseTimes" width="100" fixed="left">
          <template slot-scope="scope">
            <a href="#" @click="showBlocksDetail(scope.row.QuestionID)">{{scope.row.UseTimes}}</a>
          </template>
        </el-table-column>
        <el-table-column label="Title" min-width="300">
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
      <el-dialog title="Add New Title" :visible.sync="addFormVisible" width="1000px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="Title" prop="Description">
            <el-input v-model="addForm.Description" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------BlockQuestionDetail弹窗开始----------------------------------------------------->
      <el-dialog title="Blocks Used Detail" :visible.sync="blocksDetailVisible" width="800px" center :before-close="closeBlocksDetail">
        <UsedBlockList ref="bl" :questionID="currentId" ></UsedBlockList>
      </el-dialog>
      <!----------------------------------------------BlockQuestionDetail弹窗结束----------------------------------------------------->
      <!----------------------------------------------QuestionList弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="questionListVisible" width="800px" center :before-close="closeQuestionList">
        <QuestionList ref="ql" :typeID="typeId" :typeName="typeName" :btypeID="btypeId"></QuestionList>
      </el-dialog>
      <!----------------------------------------------QuestionList弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import UsedBlockList from '@/component/window/usedBlockList'
import QuestionList from '@/component/window/questionList'

export default {
  components: {
    UsedBlockList,
    QuestionList
  },
  data: function () {
    return {
      isLoading: false,
      typeId: 1,
      btypeId: 2,
      businessTypes: ['', 'PL Memo', 'NB CoverLetter', 'IRCA Memo', 'CL Application'],
      typeName: ' Title Question List',
      questionListVisible: false,
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
      blocksDetailVisible: false,
      // 新增
      addFormVisible: false,
      addForm: {
        TypeID: 1,
        Description: null,
        Tips: null,
        OutputModeID: 1,
        StatusID: 1,
        InputType: null,
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
  watch: {
    $route (to, from) {
      console.log(to.params.id)
      this.btypeId = parseInt(this.$route.params.id)
      this.typeName = this.businessTypes[this.btypeId] + this.typeName
      this.search(null)
    }
  },
  mounted: function () {
    this.btypeId = parseInt(this.$route.params.id)
    this.typeName = this.businessTypes[this.btypeId] + this.typeName
    this.search(null)
  },
  methods: {
    // show used block list
    showQuestionList: function () {
      this.questionListVisible = true
      if (this.$refs.ql !== undefined) {
        this.$refs.ql.loadQuestions(this.typeId)
      }
    },
    closeQuestionList: function () {
      this.questionListVisible = false
    },
    // show used block list
    showBlocksDetail: function (id) {
      this.currentId = id
      this.blocksDetailVisible = true
      if (this.$refs.bl !== undefined) {
        this.$refs.bl.loadBlocks(id)
      }
    },
    closeBlocksDetail: function () {
      this.blocksDetailVisible = false
      this.currentId = null
    },
    // 查询
    search: function (name) {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetQuestionsByTypeQuery', {typeid: 1, query: name, btypeid: this.btypeId}).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          if (name !== null) {
            this.searchName = name
            // this.list = this.list.filter(item => item.Description.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)
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
        this.axios.post('/api/Services/BaseService.asmx/RemoveQuestion', {questionid: id}).then(res => {
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
        this.axios.post('/api/Services/BaseService.asmx/SaveQuestion', {question: JSON.stringify(obj), btypeid: this.btypeId}).then(res => {
          if (res) {
            console.log('修改', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.currentId = null
            this.currentDescription = null
            // 如果修改记录符合查询条件，更新该记录；如果不符合，删除该记录，总数减1
            if (this.searchName === null || (this.searchName !== null && res.data.Description.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)) {
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
          this.axios.post('/api/Services/BaseService.asmx/SaveQuestion', {question: JSON.stringify(this.addForm), btypeid: this.btypeId}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addFormVisible = false
              // 如果新增记录符合查询条件，将新增的记录添加到数组最后，总数加1
              if (this.searchName === null || (this.searchName !== null && res.data.Description.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)) {
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
