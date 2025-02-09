<!--
FileName: Library/questions/multipleChoice.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show multiple choice list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Multiple Choice for {{businessTypes[btypeId]}}</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">New</el-button>
        <el-button icon="el-icon-plus" type="primary" @click="showQuestionList()" :loading="isLoading">Print</el-button>
      </div>
    </div>
    <div class="inPageContent" id="">
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
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Question ID" prop="QuestionID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Use Times" prop="UseTimes" width="100" fixed="left">
          <template slot-scope="scope">
            <a href="#" @click="showBlocksDetail(scope.row.QuestionID)">{{scope.row.UseTimes}}</a>
          </template>
        </el-table-column>
        <el-table-column label="Question" min-width="950">
          <template slot-scope="scope">
            <AnswerMultipleChoiceQuestion :question="scope.row"></AnswerMultipleChoiceQuestion>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row.QuestionID)" :loading="isLoading" size="small">Edit</el-button>
            <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.QuestionID)" :loading="isLoading" size="small">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Multiple Choice Question" :visible.sync="addFormVisible" width="1000px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form choiceQuestionForm">
          <el-form-item label="Output Way" prop="OutputModeID">
            <el-radio-group v-model="addForm.OutputModeID">
              <el-radio v-for="item in outputWayList" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Question" prop="Description">
            <el-input v-model="addForm.Description" clearable></el-input>
          </el-form-item>
          <el-form-item label="Question Tips" prop="Tips">
            <el-input v-model="addForm.Tips" clearable></el-input>
          </el-form-item>
          <div v-for="(item, index) in addForm.options" :key="index" class="choice">
            <el-form-item label="Choice">
              <el-input v-model="item.Content" clearable size="small"></el-input>
            </el-form-item>
            <el-form-item label="Choice Tips">
              <el-input v-model="item.Tips" clearable size="small"></el-input>
            </el-form-item>
            <!--el-form-item label="Child Question">
              <el-select v-model="item.ChildQuestionID" placeholder="Questions" size="small" class="" no-data-text="No Record" filterable>
                <el-option class="questionOption" v-for="child in fillinQuestions" :key="child.QuestionID" :label="child.QuestionID + '. ' + child.Description" :value="child.QuestionID"></el-option>
              </el-select>
            </el-form-item-->
            <el-form-item label="Child Question" class="confirmBtn smallLine">
              <el-select v-model="item.ChildQuestionID" style="width:312px" placeholder="Question" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
                <el-option class="questionOption" v-for="child in item.questionList" :key="child.QuestionID" :label="child.QuestionID + '. ' + child.Description" :value="child.QuestionID"></el-option>
              </el-select>
              <el-select v-model="item.ChildQuestionTypeID" placeholder="Question Type" size="small" class="questionType questionRightBtn" @change="changeQuestionType(item)" style="width: 207px;">
                <el-option v-for="type in questionTypeList" :key="type.id" :label="type.name" :value="type.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Output">
              <el-input v-model="item.Outputs" clearable size="small"></el-input>
            </el-form-item>
            <el-form-item class="marginLeft20">
              <el-checkbox v-model="item.NeedAddition">Addition</el-checkbox>
              <el-checkbox v-model="item.SingleFlag">SingleFlag</el-checkbox>
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('addForm', index)" :loading="isLoading" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-up" v-if="index !== 0" type="primary" @click="upChoice('addForm', index)" :loading="isLoading" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-down" v-if="index !== addForm.options.length - 1" type="primary" @click="downChoice('addForm', index)" :loading="isLoading" plain size="small" class="questionRightBtnGroup"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('addForm')" :loading="isLoading" plain size="small" class="questionRightBtnSingle">Option</el-button>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="Edit Multiple Choice Question" :visible.sync="editFormVisible" width="1000px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form choiceQuestionForm">
          <el-form-item label="Output Way" prop="OutputModeID">
            <el-radio-group v-model="editForm.OutputModeID">
              <el-radio v-for="item in outputWayList" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Question" prop="Description">
            <el-input v-model="editForm.Description" clearable></el-input>
          </el-form-item>
          <el-form-item label="Question Tips" prop="Tips">
            <el-input v-model="editForm.Tips" clearable></el-input>
          </el-form-item>
          <div v-for="(item, index) in editForm.options" :key="index" class="choice">
            <el-form-item label="Choice">
              <el-input v-model="item.Content" clearable size="small"></el-input>
            </el-form-item>
            <el-form-item label="Choice Tips">
              <el-input v-model="item.Tips" clearable size="small"></el-input>
            </el-form-item>
            <!--el-form-item label="Child Question">
              <el-select v-model="item.ChildQuestionID" placeholder="Questions" size="small" class="" no-data-text="No Record" filterable>
                <el-option class="questionOption" v-for="child in fillinQuestions" :key="child.QuestionID" :label="child.QuestionID + '. ' + child.Description" :value="child.QuestionID"></el-option>
              </el-select>
            </el-form-item-->
            <el-form-item label="Child Question" class="confirmBtn smallLine">
              <el-select v-model="item.ChildQuestionID" style="width:312px" placeholder="Question" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
                <el-option class="questionOption" v-for="child in item.questionList" :key="child.QuestionID" :label="child.QuestionID + '. ' + child.Description" :value="child.QuestionID"></el-option>
              </el-select>
              <el-select v-model="item.ChildQuestionTypeID" placeholder="Question Type" size="small" class="questionType questionRightBtn" @change="changeQuestionType(item)" style="width: 207px;">
                <el-option v-for="type in questionTypeList" :key="type.id" :label="type.name" :value="type.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Output">
              <el-input v-model="item.Outputs" clearable size="small"></el-input>
            </el-form-item>
            <el-form-item class="marginLeft20">
              <el-checkbox v-model="item.NeedAddition">Addition</el-checkbox>
              <el-checkbox v-model="item.SingleFlag">SingleFlag</el-checkbox>
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('editForm', index)" :loading="isLoading" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-up" v-if="index !== 0" type="primary" @click="upChoice('editForm', index)" :loading="isLoading" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-down" v-if="index !== editForm.options.length - 1" type="primary" @click="downChoice('editForm', index)" :loading="isLoading" plain size="small" class="questionRightBtnGroup"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('editForm')" :loading="isLoading" plain size="small" class="questionRightBtnSingle">Option</el-button>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------BlockQuestionDetail弹窗开始----------------------------------------------------->
      <el-dialog title="Blocks Used Detail" :visible.sync="blocksDetailVisible" width="800px" center :before-close="closeBlocksDetail">
        <UsedBlockList ref="bl" :questionID="currentId" ></UsedBlockList>
      </el-dialog>
      <!----------------------------------------------BlockQuestionDetail弹窗结束----------------------------------------------------->
      <!----------------------------------------------QuestionList弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="questionListVisible" width="1200px" center :before-close="closeQuestionList">
        <QuestionList ref="ql" :typeID="typeId" :typeName="typeName" :btypeID="btypeId"></QuestionList>
      </el-dialog>
      <!----------------------------------------------QuestionList弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import AnswerMultipleChoiceQuestion from '@/component/choiceQuestion/answerMultipleChoiceQuestion'
import UsedBlockList from '@/component/window/usedBlockList'
import QuestionList from '@/component/window/multipleChoiceQuestionList'

export default {
  components: {
    AnswerMultipleChoiceQuestion,
    UsedBlockList,
    QuestionList
  },
  data: function () {
    return {
      isLoading: false,
      currentId: null,
      blocksDetailVisible: false,
      typeName: ' Multple Choice Question List',
      typeId: 7,
      btypeId: 2,
      businessTypes: ['', 'PL Memo', 'NB CoverLetter', 'IRCA Memo', 'CL Application'],
      questionListVisible: false,
      questionTypeList: [{id: 0, name: 'No Type'}, {id: 2, name: 'Reminder'}, {id: 3, name: 'Property'}, {id: 4, name: 'Simple Answer'}, {id: 5, name: 'Fill In Question'}],
      reminders: [],
      properties: [],
      simples: [],
      fillins: [],
      // questionList: [],
      outputWayList: [{id: 1, name: 'Normal'}, {id: 2, name: 'Case Choice'}, {id: 3, name: 'None'}],
      // fillinQuestions: null,
      addFormVisible: false,
      addForm: {
        TypeID: 7,
        Description: null,
        Tips: null,
        OutputModeID: 1,
        StatusID: 1,
        InputType: null,
        // fillinParts: [],
        options: []
      },
      addFormRules: {
        Description: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        Tips: [
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ]
      },
      // 修改
      editFormVisible: false,
      editForm: {
        QuestionID: null,
        TypeID: 7,
        Description: null,
        Tips: null,
        OutputModeID: 1,
        StatusID: 1,
        InputType: null,
        // fillinParts: [],
        options: []
      },
      editFormRules: {
        Description: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
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
    this.loadQuestions(2)
    this.loadQuestions(3)
    this.loadQuestions(4)
    this.loadQuestions(5)
  },
  methods: {
    // show question list
    showQuestionList: function () {
      this.questionListVisible = true
      if (this.$refs.ql !== undefined) {
        this.$refs.ql.loadQuestions(this.typeId, this.btypeId)
      }
    },
    closeQuestionList: function () {
      this.questionListVisible = false
    },
    getQuestionList: function (typeid) {
      if (typeid === 2) return this.reminders
      else if (typeid === 3) return this.properties
      else if (typeid === 4) return this.simples
      else if (typeid === 5) return this.fillins
      else return null
    },
    // 选择问题类型
    changeQuestionType: function (option) {
      option.questionList = this.getQuestionList(option.ChildQuestionTypeID)
      /*
      this.currentQuestion = null
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetQuestionsByType', {typeid: option.ChildQuestionTypeID, btypeid: this.btypeId}).then(res => {
        if (res) {
          console.log('查询', res)
          let all = [{QuestionID: 0, Description: 'No Child Question'}]
          option.questionList = [...all, ...res.data]
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      }) */
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
    // 添加一行
    addChoice: function (form) {
      if (form === 'addForm') {
        this.addForm.options.push({Content: null, Tips: null, Outputs: null, NeedAddition: false, SequenceNo: 0})
      } else if (form === 'editForm') {
        this.editForm.options.push({Content: null, Tips: null, Outputs: null, NeedAddition: false, SequenceNo: 0})
      }
    },
    // 删除一行
    delChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.options.splice(index, 1)
      } else if (form === 'editForm') {
        this.editForm.options.splice(index, 1)
      }
    },
    // 上移一行
    upChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.options[index] = this.addForm.options.splice(index - 1, 1, this.addForm.options[index])[0]
      } else if (form === 'editForm') {
        this.editForm.options[index] = this.editForm.options.splice(index - 1, 1, this.editForm.options[index])[0]
      }
    },
    // 下移一行
    downChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.options[index] = this.addForm.options.splice(index + 1, 1, this.addForm.options[index])[0]
      } else if (form === 'editForm') {
        this.editForm.options[index] = this.editForm.options.splice(index + 1, 1, this.editForm.options[index])[0]
      }
    },
    loadQuestions: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetQuestionsByType', {typeid: id, btypeid: this.btypeId}).then(res => {
        if (!res) {
        } else {
          let all = [{QuestionID: 0, Description: 'No Child Question'}]
          if (id === 2) this.reminders = [...all, ...res.data]
          else if (id === 3) this.properties = [...all, ...res.data]
          else if (id === 4) this.simples = [...all, ...res.data]
          else if (id === 5) this.fillins = [...all, ...res.data]
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    // 查询
    search: function (name) {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetQuestionsByTypeQuery', {typeid: 7, query: name, btypeid: this.btypeId}).then(res => {
        if (res) {
          console.log('查询', res)
          // 声明value，AdditionContent，防止输入框无法输入
          let listWidthAdditionContent = res.data
          for (let i = 0; i < listWidthAdditionContent.length; i++) {
            listWidthAdditionContent[i].value = []
            listWidthAdditionContent[i].options.forEach(item => { item.AdditionContent = null })
          }
          this.list = listWidthAdditionContent
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
        this.addForm.options = []
        done()
      }).catch(() => {})
    },
    // 新增
    add: function () {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          for (let i = 0; i < this.addForm.options.length; i++) {
            let option = this.addForm.options[i]
            this.addForm.options[i].SequenceNo = i + 1
            option.questionList = null
            option.childQuestion = null
          }
          let value = JSON.stringify(this.addForm)
          console.log('new multiplechoice', value)
          this.axios.post('/api/Services/BaseService.asmx/SaveQuestion', {question: JSON.stringify(this.addForm), btypeid: this.btypeId}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addForm.options = []
              this.addFormVisible = false
              // 如果新增记录符合查询条件，将新增的记录添加到数组最后，总数加1
              if (this.searchName === null || (this.searchName !== null && res.data.Description.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)) {
                // 声明value，AdditionContent，防止输入框无法输入
                let listWidthAdditionContent = res.data
                listWidthAdditionContent.value = []
                listWidthAdditionContent.options.forEach(item => { item.AdditionContent = null })
                this.list.push(listWidthAdditionContent)
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
      this.axios.post('/api/Services/BaseService.asmx/GetQuestion', {questionid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.editFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.editForm = res.data
            for (let i = 0; i < this.editForm.options.length; i++) {
              let option = this.editForm.options[i]
              if (option.ChildQuestionTypeID === 2) option.questionList = this.reminders
              else if (option.ChildQuestionTypeID === 3) option.questionList = this.properties
              else if (option.ChildQuestionTypeID === 4) option.questionList = this.simples
              else if (option.ChildQuestionTypeID === 5) option.questionList = this.fillins
            }
            // this.editForm.options.forEach(function (option) {
            //   changeQuestionType(option)
            // })
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
        this.editForm.options = []
        done()
      }).catch(() => {})
    },
    // 修改
    edit: function () {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          for (let i = 0; i < this.editForm.options.length; i++) {
            this.editForm.options[i].SequenceNo = i + 1
          }
          this.editForm.options.forEach(function (option) {
            option.questionList = null
            option.childQuestion = null
          })
          let value = JSON.stringify(this.editForm)
          console.log('update multipleChoice', value)
          this.axios.post('/api/Services/BaseService.asmx/SaveQuestion', {question: value, btypeid: this.btypeId}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['editForm'].resetFields()
              this.editForm.options = []
              this.editFormVisible = false
              // 如果修改记录符合查询条件，更新该记录；如果不符合，删除该记录，总数减1
              if (this.searchName === null || (this.searchName !== null && res.data.Description.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)) {
                // 声明value，AdditionContent，防止输入框无法输入
                let listWidthAdditionContent = res.data
                listWidthAdditionContent.value = []
                listWidthAdditionContent.options.forEach(item => { item.AdditionContent = null })
                this.list = this.list.map(item => { return item.QuestionID === listWidthAdditionContent.QuestionID ? listWidthAdditionContent : item })
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
    toPDF: function () {
      this.htmlTitle = this.typeName + this.currentPage
      this.getPdf('#questionListDom')
    }
  }
}
</script>

<style scoped>

</style>
