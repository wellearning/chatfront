<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Choice Question</span>
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
        <el-table-column label="Question ID" prop="id" width="100" fixed="left"></el-table-column>
        <el-table-column label="Question" min-width="950">
          <template slot-scope="scope">
            <AnswerChoiceQuestion :question="scope.row"></AnswerChoiceQuestion>
          </template>
        </el-table-column>
        <!--<el-table-column label="Question" prop="content"></el-table-column>-->
        <!--<el-table-column label="Type">-->
          <!--<template slot-scope="scope">-->
            <!--<span>{{showType(scope.row.type)}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column label="Choice">-->
          <!--<template slot-scope="scope">-->
            <!--<div v-for="item in scope.row.choice" :key="item.id">{{item.content}}</div>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column label="NeedAddition">-->
          <!--<template slot-scope="scope">-->
            <!--<span>{{scope.row.choice.find(item => item.addition === true) !== undefined ? 'Yes' : 'No'}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column label="Action" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-view" type="primary" @click="showView(scope.row.id)" :loading="isLoading" size="small"></el-button>
            <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row.id)" :loading="isLoading" size="small"></el-button>
            <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.id)" :loading="isLoading" size="small"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="handleCurrentChange" :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Choice Question" :visible.sync="addFormVisible" width="1000px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form choiceQuestionForm">
          <el-form-item label="Type" prop="type">
            <el-radio-group v-model="addForm.type">
              <el-radio v-for="item in typeList" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Output Way" prop="outputWay">
            <el-radio-group v-model="addForm.outputWay">
              <el-radio v-for="item in outputWayList" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Question" prop="content">
            <el-input v-model="addForm.content" clearable></el-input>
          </el-form-item>
          <el-form-item label="Question Tips" prop="tips">
            <el-input v-model="addForm.tips" clearable></el-input>
          </el-form-item>
          <div v-for="(item, index) in addForm.choice" :key="index" class="choice">
            <el-form-item label="Choice">
              <el-input v-model="item.content" clearable></el-input>
            </el-form-item>
            <el-form-item label="Choice Tips">
              <el-input v-model="item.tips" clearable></el-input>
            </el-form-item>
            <el-form-item label="Output">
              <el-input v-model="item.output" clearable></el-input>
            </el-form-item>
            <el-form-item label="Addition">
              <el-checkbox v-model="item.addition"></el-checkbox>
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('addForm', index)" :loading="isLoading" plain size="small" style="float: right;"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('addForm')" :loading="isLoading" plain size="small" style="float: right; margin-right: 10%;"></el-button>
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
          <el-form-item label="Id" prop="id" v-show="false">
            <el-input v-model="editForm.id" disabled></el-input>
          </el-form-item>
          <el-form-item label="Type" prop="type">
            <el-radio-group v-model="editForm.type">
              <el-radio v-for="item in typeList" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Output Way" prop="outputWay">
            <el-radio-group v-model="editForm.outputWay">
              <el-radio v-for="item in outputWayList" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Question" prop="content">
            <el-input v-model="editForm.content" clearable></el-input>
          </el-form-item>
          <el-form-item label="Question Tips" prop="tips">
            <el-input v-model="editForm.tips" clearable></el-input>
          </el-form-item>
          <div v-for="(item, index) in editForm.choice" :key="index" class="choice">
            <el-form-item label="Choice">
              <el-input v-model="item.content" clearable></el-input>
            </el-form-item>
            <el-form-item label="Choice Tips">
              <el-input v-model="item.tips" clearable></el-input>
            </el-form-item>
            <el-form-item label="Output">
              <el-input v-model="item.output" clearable></el-input>
            </el-form-item>
            <el-form-item label="Addition">
              <el-checkbox v-model="item.addition"></el-checkbox>
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('editForm', index)" :loading="isLoading" plain size="small" style="float: right;"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('editForm')" :loading="isLoading" plain size="small" style="float: right; margin-right: 10%;"></el-button>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------预览弹窗开始----------------------------------------------------->
      <el-dialog title="View Choice Question" :visible.sync="viewFormVisible" width="1000px" center>
        <AnswerChoiceQuestion :question="viewChoiceQuestion"></AnswerChoiceQuestion>
      </el-dialog>
      <!----------------------------------------------预览弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import AnswerChoiceQuestion from '@/component/choiceQuestion/answerChoiceQuestion'

export default {
  components: {
    AnswerChoiceQuestion
  },
  data: function () {
    return {
      isLoading: false,
      // 新增
      outputWayList: [{id: 1, name: 'Normal'}, {id: 2, name: 'Case Choice'}, {id: 3, name: 'None'}],
      addFormVisible: false,
      addForm: {
        type: 1,
        outputWay: 1,
        content: null,
        tips: null,
        choice: []
      },
      addFormRules: {
        content: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        tips: [
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ]
      },
      // 修改
      editFormVisible: false,
      editForm: {
        id: null,
        type: 1,
        outputWay: 1,
        content: null,
        tips: null,
        choice: []
      },
      editFormRules: {
        content: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        tips: [
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ]
      },
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      // 列表
      typeList: [{id: 1, name: 'Single Choice'}, {id: 2, name: 'Multiple Choice'}],
      list: [],
      pageSize: 10,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 预览
      viewFormVisible: false,
      viewChoiceQuestion: {}
      // viewChoiceQuestionAnswer: []
    }
  },
  mounted: function () {
    this.search(null)
  },
  methods: {
    // 表格中显示类型
    showType: function (id) {
      return this.typeList.find(item => item.id === id).name
    },
    // 添加一行
    addChoice: function (form) {
      if (form === 'addForm') {
        this.addForm.choice.push({})
      } else if (form === 'editForm') {
        this.editForm.choice.push({})
      }
    },
    // 删除一行
    delChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.choice.splice(index, 1)
      } else if (form === 'editForm') {
        this.editForm.choice.splice(index, 1)
      }
    },
    // 查询
    search: function (name) {
      // todo: 查询接口
      // this.isLoading = true
      // this.axios.post('/api/', {}).then(res => {
      //   console.log('查询', res)
      //   this.list = res.data.data.list
      //   this.total = res.data.data.total
      //   this.currentPage = res.data.data.pageNum
      //   this.isLoading = false
      // }).catch(err => {
      //   console.log('查询出错', err)
      //   this.isLoading = false
      // })
      this.list = [
        {id: 1, type: 1, outputWay: 1, content: 'which is your favorite?', tips: 'this is tips', choice: [{id: 1, content: 'plan A', tips: 'this is inner tips A', output: 'inner output A', addition: false, additionContent: null}, {id: 2, content: 'plan B', tips: 'this is inner tips B', output: 'inner output B', addition: false, additionContent: null}, {id: 3, content: 'other', tips: 'this is inner tips C', output: 'inner output C', addition: true, additionContent: null}]}
      ]
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
            this.handleCurrentChange(this.currentPage)
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
      // this.isLoading = true
      // this.axios.get('/api/get?id=' + id).then(res => { // todo: 根据id查询单个信息接口
      //   console.log('查询单个', res)
      //   this.editFormVisible = true
      //   this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
      //     this.editForm = res.data.data
      //   })
      //   this.isLoading = false
      // }).catch(err => {
      //   console.log('查询单个出错', err)
      //   this.isLoading = false
      // })
      this.editFormVisible = true
      this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
        this.editForm = {id: 1, type: 1, outputWay: 1, content: 'which is your favorite?', tips: 'this is tips', choice: [{id: 1, content: 'plan A', tips: 'this is inner tips A', output: 'inner output A', addition: false, additionContent: null}, {id: 2, content: 'plan B', tips: 'this is inner tips B', output: 'inner output B', addition: false, additionContent: null}, {id: 3, content: 'other', tips: 'this is inner tips C', output: 'inner output C', addition: true, additionContent: null}]}
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
        done()
      }).catch(() => {})
    },
    // 修改
    edit: function () {
      console.log('hello', this.editForm)
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.axios.post('/api/', this.editForm).then(res => { // todo: 修改接口
            console.log('修改', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.$refs['editForm'].resetFields()
            this.editFormVisible = false
            this.handleCurrentChange(this.currentPage)
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
        this.axios.post('/api/?id=' + id).then(res => { // todo: 删除接口
          console.log('删除', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          this.handleCurrentChange(this.currentPage)
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
    // 预览
    showView: function (id) {
      // this.isLoading = true
      // this.axios.get('/api/get?id=' + id).then(res => { // todo: 根据id查询单个信息接口
      //   console.log('查询单个', res)
      //   this.viewFormVisible = true
      //   this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
      //     this.editForm = res.data.data
      //   })
      //   this.isLoading = false
      // }).catch(err => {
      //   console.log('查询单个出错', err)
      //   this.isLoading = false
      // })
      this.viewFormVisible = true
      this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
        this.viewChoiceQuestion = {id: 1, type: 2, singleValue: null, multipleValue: [], outputWay: 1, content: 'which is your favorite?', tips: 'this is tips', choice: [{id: 1, content: 'plan A', tips: 'this is inner tips A', output: 'inner output A', addition: false, additionContent: null}, {id: 2, content: 'plan B', tips: 'this is inner tips B', output: 'inner output B', addition: false, additionContent: null}, {id: 3, content: 'other', tips: 'this is inner tips C', output: 'inner output C', addition: true, additionContent: null}]}
      })
    }
    // updateAnswer: function (data) {
    //   if (this.viewChoiceQuestionAnswer.find(item => item.id === data.id) === undefined) {
    //     this.viewChoiceQuestionAnswer.push(data)
    //   } else {
    //     this.viewChoiceQuestionAnswer = this.viewChoiceQuestionAnswer.filter(item => item.id !== data.id)
    //     this.viewChoiceQuestionAnswer.push(data)
    //   }
    // }
  }
}
</script>

<style scoped>

</style>
