<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Blocks</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading || isLoadingInsuranceCompany">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Name" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingInsuranceCompany" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingInsuranceCompany" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Block ID" prop="BlockID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Name" prop="Name" min-width="300"></el-table-column>
        <el-table-column label="Action" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row.BlockID)" :loading="isLoading || isLoadingInsuranceCompany" size="small"></el-button>
            <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.BlockID)" :loading="isLoading || isLoadingInsuranceCompany" size="small"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Block" :visible.sync="addFormVisible" width="1000px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form choiceQuestionForm">
          <el-form-item label="Name" prop="Name">
            <el-input v-model="addForm.Name" clearable></el-input>
          </el-form-item>
          <div v-for="(item, index) in addForm.blockQuestions" :key="index" class="choice">
            <el-form-item class="marginLeft10">
              <el-input v-model="item.Label" class="labelInput" size="small" placeholder="Label"></el-input>
              <span v-if="item.question.TypeID !== 5"><b class="blockQuestionB">[{{questionTypeList.find(it => it.id === item.question.TypeID).name}}]</b>{{item.question.Description}}</span>
              <span v-else><b class="blockQuestionB">[{{questionTypeList.find(it => it.id === item.question.TypeID).name}}]</b>{{item.question.Integration}}</span>
            </el-form-item>
            <el-form-item class="marginLeft20" v-if="[3, 6].indexOf(item.question.TypeID) !== -1">
              <el-button icon="el-icon-bottom-right" type="primary" @click="showAddRoutes(item, index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup">Routing</el-button>
            </el-form-item>
            <el-form-item class="marginLeft20">
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('addForm', index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-up" v-if="index !== 0" type="primary" @click="upChoice('addForm', index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-down" v-if="index !== addForm.blockQuestions.length - 1" type="primary" @click="downChoice('addForm', index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('addForm')" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnSingle">Question</el-button>
            <el-select v-model="currentQuestion" placeholder="Question" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
              <el-option class="questionOption" v-for="item in questionList" :key="item.QuestionID" :label="item.TypeID !== 5 ? '(' + item.QuestionID + ') ' + item.Description : '(' + item.QuestionID + ')' + item.Integration" :value="item.QuestionID"></el-option>
            </el-select>
            <el-select v-model="currentQuestionType" placeholder="Question Type" size="small" class="questionType questionRightBtn" @change="changeQuestionType(currentQuestionType)" style="width: 207px;">
              <el-option v-for="item in questionTypeList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading || isLoadingInsuranceCompany">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------路由编辑弹窗开始------------------------------------------------->
      <el-dialog title="Routing" :visible.sync="routesFormVisible" width="800px" top="20vh" center :before-close="closeAddRoutes">
        <el-form :model="routesForm" ref="routesForm" class="form">
          <div v-if="routesForm.question.TypeID === 3">
            <el-form-item label="Question">
              <span>{{routesForm.question.Description}}</span>
            </el-form-item>
            <el-form-item label="Insurance Company">
              <el-select v-model="currentInsuranceCompany" placeholder="Please Select" no-data-text="No Record" filterable>
                <el-option v-for="item in insuranceCompanyList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-for="(item, index) in routesForm.routes.filter(i => i.InsuranceCorpID === currentInsuranceCompany)" :key="index" class="confirmBtn confirmBtnBlock smallLine">
              <el-row :gutter="10">
                <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7">
                  <el-select v-model="item.Operator" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                    <el-option v-for="it in operatorList" :key="it.id" :label="it.name" :value="it.name"></el-option>
                  </el-select>
                </el-col>
                <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7">
                  <el-input v-model="item.Operand" clearable size="small"></el-input>
                </el-col>
                <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7" v-if="addFormVisible">
                  <el-select v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                    <el-option v-for="it in addForm.blockQuestions.length - currentIndex" :key="it" :label="it === 1 ? 'Move Next' : 'skip ' + (it - 1)" :value="it"></el-option>
                  </el-select>
                </el-col>
                <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7" v-else-if="editFormVisible">
                  <el-select v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                    <el-option v-for="it in editForm.blockQuestions.length - currentIndex" :key="it" :label="it === 1 ? 'Move Next' : 'skip ' + (it - 1)" :value="it"></el-option>
                  </el-select>
                </el-col>
                <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
                  <el-button icon="el-icon-minus" type="primary" @click="delOperator(index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtn"></el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item class="confirmBtn">
              <el-button icon="el-icon-plus" type="primary" @click="addOperator()" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnSingle"></el-button>
            </el-form-item>
            <el-form-item class="confirmBtn">
              <el-button icon="el-icon-check" type="primary" @click="addRoutes()" :loading="isLoading || isLoadingInsuranceCompany">Confirm</el-button>
            </el-form-item>
          </div>
          <div v-else-if="routesForm.question.TypeID === 6">
            <el-form-item label="Question">
              <span>{{routesForm.question.Description}}</span>
            </el-form-item>
            <el-form-item label="Insurance Company">
              <el-select v-model="currentInsuranceCompany" placeholder="Please Select" no-data-text="No Record" filterable>
                <el-option v-for="item in insuranceCompanyList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-for="(item, index) in routesForm.routes.filter(i => i.InsuranceCorpID === currentInsuranceCompany)" :key="index" class="confirmBtn confirmBtnBlock smallLine">
              <el-row :gutter="10">
                <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7" v-show="false">
                  <el-select v-model="item.Operator" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                    <el-option v-for="it in operatorList.filter(i => i.name === '=')" :key="it.id" :label="it.name" :value="it.name"></el-option>
                  </el-select>
                </el-col>
                <el-col :xs="14" :sm="14" :md="14" :lg="14" :xl="14">
                  <el-select v-model="item.Operand" placeholder="Please Select Option" no-data-text="No Record" filterable size="small">
                    <el-option v-for="it in routesForm.question.options" :key="it.ChoiceOptionID" :label="it.Content" :value="it.ChoiceOptionID"></el-option>
                  </el-select>
                </el-col>
                <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7" v-if="addFormVisible">
                  <el-select v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                    <el-option v-for="it in addForm.blockQuestions.length - currentIndex" :key="it" :label="it === 1 ? 'Move Next' : 'skip ' + (it - 1)" :value="it"></el-option>
                  </el-select>
                </el-col>
                <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7" v-else-if="editFormVisible">
                  <el-select v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                    <el-option v-for="it in editForm.blockQuestions.length - currentIndex" :key="it" :label="it === 1 ? 'Move Next' : 'skip ' + (it - 1)" :value="it"></el-option>
                  </el-select>
                </el-col>
                <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
                  <el-button icon="el-icon-minus" type="primary" @click="delOperator(index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtn"></el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item class="confirmBtn">
              <el-button icon="el-icon-plus" type="primary" @click="addOperator()" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnSingle"></el-button>
            </el-form-item>
            <el-form-item class="confirmBtn">
              <el-button icon="el-icon-check" type="primary" @click="addRoutes()" :loading="isLoading || isLoadingInsuranceCompany">Confirm</el-button>
            </el-form-item>
          </div>
        </el-form>
      </el-dialog>
      <!----------------------------------------------路由编辑弹窗结束------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="Edit Block" :visible.sync="editFormVisible" width="1000px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form choiceQuestionForm">
          <el-form-item label="Name" prop="Name">
            <el-input v-model="editForm.Name" clearable></el-input>
          </el-form-item>
          <div v-for="(item, index) in editForm.blockQuestions" :key="index" class="choice">
            <el-form-item class="marginLeft10">
              <el-input v-model="item.Label" class="labelInput" size="small" placeholder="Label"></el-input>
              <span v-if="item.question.TypeID !== 5"><b class="blockQuestionB">[{{questionTypeList.find(it => it.id === item.question.TypeID).name}}]</b>{{item.question.Description}}</span>
              <span v-else><b class="blockQuestionB">[{{questionTypeList.find(it => it.id === item.question.TypeID).name}}]</b>{{item.question.Integration}}</span>
            </el-form-item>
            <el-form-item class="marginLeft20" v-if="[3, 6].indexOf(item.question.TypeID) !== -1">
              <el-button icon="el-icon-bottom-right" type="primary" @click="showAddRoutes(item, index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup">Routing</el-button>
            </el-form-item>
            <el-form-item class="marginLeft20">
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('editForm', index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-up" v-if="index !== 0" type="primary" @click="upChoice('editForm', index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-down" v-if="index !== editForm.blockQuestions.length - 1" type="primary" @click="downChoice('editForm', index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('editForm')" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnSingle">Question</el-button>
            <el-select v-model="currentQuestion" placeholder="Question" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
              <el-option class="questionOption" v-for="item in questionList" :key="item.QuestionID" :label="item.TypeID !== 5 ? '(' + item.QuestionID + ') ' + item.Description : '(' + item.QuestionID + ')' + item.Integration" :value="item.QuestionID"></el-option>
            </el-select>
            <el-select v-model="currentQuestionType" placeholder="Question Type" size="small" class="questionType questionRightBtn" @change="changeQuestionType(currentQuestionType)" style="width: 207px;">
              <el-option v-for="item in questionTypeList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading || isLoadingInsuranceCompany">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      isLoading: false,
      isLoadingInsuranceCompany: false,
      currentQuestionType: null,
      currentQuestion: null,
      questionTypeList: [{id: 1, name: 'Title'}, {id: 2, name: 'Reminder'}, {id: 3, name: 'Property'}, {id: 4, name: 'Simple Answer'}, {id: 5, name: 'Fill In Question'}, {id: 6, name: 'Single Choice Question'}, {id: 7, name: 'Multiple Choice Question'}],
      questionList: [],
      currentInsuranceCompany: null,
      insuranceCompanyList: [],
      operatorList: [{id: 1, name: '='}, {id: 2, name: '>'}, {id: 3, name: '<'}, {id: 4, name: '>='}, {id: 5, name: '<='}],
      // 新增
      addFormVisible: false,
      addForm: {
        Name: null,
        TypeID: 0,
        StatusID: 1,
        blockQuestions: []
      },
      addFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ]
      },
      // 路由编辑
      routesFormVisible: false,
      routesForm: {
        QuestionID: 0,
        question: {
          QuestionID: 0,
          TypeID: 0,
          Description: null,
          Tips: '',
          OutputModeID: 1,
          StatusID: 1,
          Integration: '',
          fillinParts: [],
          options: []
        },
        routes: []
      },
      routesFormBeforeEdit: {},
      currentIndex: 0,
      // 修改
      editFormVisible: false,
      editForm: {
        BlockID: null,
        Name: null,
        TypeID: 0,
        StatusID: 1,
        blockQuestions: [],
        IsNew: false,
        IsNewAdded: false,
        IsRemoved: false
      },
      editFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ]
      },
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
      total: 0
    }
  },
  mounted: function () {
    this.search(null)
    this.initInsuranceCompany()
  },
  methods: {
    // 保险公司列表
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps', {}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          this.insuranceCompanyList = res.data
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // 选择问题类型
    changeQuestionType: function (id) {
      this.currentQuestion = null
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetQuestionsByType', {typeid: id}).then(res => {
        if (res) {
          console.log('查询', res)
          this.questionList = res.data
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    // 添加一行
    addChoice: function (form) {
      if (form === 'addForm') {
        if (this.currentQuestion === null) {
          this.$message({
            type: 'warning',
            message: 'Please Select Question'
          })
        } else {
          this.isLoading = true
          this.axios.post('/api/Services/memoservice.asmx/GetQuestion', {questionid: this.currentQuestion}).then(res => {
            if (res) {
              console.log('查询单个', res)
              this.addForm.blockQuestions.push({QuestionID: this.currentQuestion, Label: null, SequenceNo: 0, IsRoute: false, routes: [], question: res.data})
              this.currentQuestion = null
            }
            this.isLoading = false
          }).catch(err => {
            console.log('查询单个出错', err)
            this.isLoading = false
          })
        }
      } else if (form === 'editForm') {
        if (this.currentQuestion === null) {
          this.$message({
            type: 'warning',
            message: 'Please Select Question'
          })
        } else {
          this.isLoading = true
          this.axios.post('/api/Services/memoservice.asmx/GetQuestion', {questionid: this.currentQuestion}).then(res => {
            if (res) {
              console.log('查询单个', res)
              this.editForm.blockQuestions.push({QuestionID: this.currentQuestion, Label: null, SequenceNo: 0, IsRoute: false, routes: [], question: res.data})
              this.currentQuestion = null
            }
            this.isLoading = false
          }).catch(err => {
            console.log('查询单个出错', err)
            this.isLoading = false
          })
        }
      }
    },
    // 删除一行
    delChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.blockQuestions.splice(index, 1)
      } else if (form === 'editForm') {
        this.editForm.blockQuestions.splice(index, 1)
      }
    },
    // 上移一行
    upChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.blockQuestions[index] = this.addForm.blockQuestions.splice(index - 1, 1, this.addForm.blockQuestions[index])[0]
      } else if (form === 'editForm') {
        this.editForm.blockQuestions[index] = this.editForm.blockQuestions.splice(index - 1, 1, this.editForm.blockQuestions[index])[0]
      }
    },
    // 下移一行
    downChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.blockQuestions[index] = this.addForm.blockQuestions.splice(index + 1, 1, this.addForm.blockQuestions[index])[0]
      } else if (form === 'editForm') {
        this.editForm.blockQuestions[index] = this.editForm.blockQuestions.splice(index + 1, 1, this.editForm.blockQuestions[index])[0]
      }
    },
    // 查询
    search: function (name) {
      this.isLoading = true
      // 后端不支持null查询，把null转换成''
      if (name === null) {
        this.searchName = ''
      } else {
        this.searchName = name
      }
      this.axios.post('/api/Services/memoservice.asmx/SearchBlocks', {query: this.searchName}).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
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
        this.addForm.blockQuestions = []
        this.currentQuestion = null
        this.currentQuestionType = null
        done()
      }).catch(() => {})
    },
    // 新增
    add: function () {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          // 按顺序添加SequenceNo，有routing的IsRoute赋true
          for (let i = 0; i < this.addForm.blockQuestions.length; i++) {
            this.addForm.blockQuestions[i].SequenceNo = i + 1
            if (this.addForm.blockQuestions[i].routes.length > 0) {
              this.addForm.blockQuestions[i].IsRoute = true
            }
          }
          this.axios.post('/api/Services/memoservice.asmx/SaveBlock', {block: JSON.stringify(this.addForm)}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addForm.blockQuestions = []
              this.currentQuestion = null
              this.currentQuestionType = null
              this.addFormVisible = false
              // 如果新增记录符合查询条件，将新增的记录添加到数组最后，总数加1
              if (this.searchName === null || (this.searchName !== null && res.data.Name.indexOf(this.searchName) !== -1)) {
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
    // 显示路由编辑弹窗
    showAddRoutes: function (blockQuestion, index) {
      this.routesFormVisible = true
      this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
        this.routesForm = JSON.parse(JSON.stringify(blockQuestion))
        this.routesFormBeforeEdit = JSON.parse(JSON.stringify(blockQuestion))
        this.currentIndex = JSON.parse(JSON.stringify(index))
      })
    },
    // 添加一行比较属性
    addOperator: function () {
      if (this.currentInsuranceCompany === null) {
        this.$message({
          type: 'warning',
          message: 'Please Select Insurance Company'
        })
      } else {
        this.routesForm.routes.push({InsuranceCorpID: this.currentInsuranceCompany, Operator: '=', Operand: null, MoveStep: 1})
      }
    },
    // 删除一行比较属性
    delOperator: function (index) {
      this.routesForm.routes.splice(index, 1)
    },
    // 隐藏路由编辑弹窗
    closeAddRoutes: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        if (this.addFormVisible) {
          this.addForm.blockQuestions[this.currentIndex] = JSON.parse(JSON.stringify(this.routesFormBeforeEdit))
        } else if (this.editFormVisible) {
          this.editForm.blockQuestions[this.currentIndex] = JSON.parse(JSON.stringify(this.routesFormBeforeEdit))
        }
        this.$refs['routesForm'].resetFields()
        this.currentInsuranceCompany = null
        this.currentIndex = 0
        this.routesForm.routes = []
        done()
      }).catch(() => {})
    },
    // 路由编辑
    addRoutes: function () {
      if (this.addFormVisible) {
        let tempList = this.routesForm.routes.map(item => { return item.InsuranceCorpID + '|' + item.Operator + '|' + item.Operand })
        if (this.routesForm.question.TypeID === 3 && this.routesForm.routes.length > 0 && (this.routesForm.routes.filter(item => item.Operand === null).length > 0 || this.routesForm.routes.filter(item => item.Operand === '').length > 0)) { // 未输入操作数
          this.$message({
            type: 'warning',
            message: 'Please Input Operand'
          })
        } else if (this.routesForm.question.TypeID === 6 && this.routesForm.routes.length > 0 && (this.routesForm.routes.filter(item => item.Operand === null).length > 0 || this.routesForm.routes.filter(item => item.Operand === '').length > 0)) { // 未选择选项
          this.$message({
            type: 'warning',
            message: 'Please Select Option'
          })
        } else if (new Set(tempList).size !== tempList.length) { // 重复选项
          this.$message({
            type: 'warning',
            message: 'Duplicate options'
          })
        } else {
          this.addForm.blockQuestions[this.currentIndex] = JSON.parse(JSON.stringify(this.routesForm))
          this.$refs['routesForm'].resetFields()
          this.currentInsuranceCompany = null
          this.currentIndex = 0
          this.routesForm.routes = []
          this.routesFormVisible = false
        }
      } else if (this.editFormVisible) {
        let tempList = this.routesForm.routes.map(item => { return item.InsuranceCorpID + '|' + item.Operator + '|' + item.Operand })
        if (this.routesForm.question.TypeID === 3 && this.routesForm.routes.length > 0 && (this.routesForm.routes.filter(item => item.Operand === null).length > 0 || this.routesForm.routes.filter(item => item.Operand === '').length > 0)) { // 未输入操作数
          this.$message({
            type: 'warning',
            message: 'Please Input Operand'
          })
        } else if (this.routesForm.question.TypeID === 6 && this.routesForm.routes.length > 0 && (this.routesForm.routes.filter(item => item.Operand === null).length > 0 || this.routesForm.routes.filter(item => item.Operand === '').length > 0)) { // 未选择选项
          this.$message({
            type: 'warning',
            message: 'Please Select Option'
          })
        } else if (new Set(tempList).size !== tempList.length) { // 重复选项
          this.$message({
            type: 'warning',
            message: 'Duplicate options'
          })
        } else {
          this.editForm.blockQuestions[this.currentIndex] = JSON.parse(JSON.stringify(this.routesForm))
          this.$refs['routesForm'].resetFields()
          this.currentInsuranceCompany = null
          this.currentIndex = 0
          this.routesForm.routes = []
          this.routesFormVisible = false
        }
      }
    },
    // 修改弹窗
    showEdit: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetBlock', {blockid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.editFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.editForm = res.data
            for (let i = 0; i < this.editForm.blockQuestions.length; i++) {
              if (this.editForm.blockQuestions[i].routes === null) {
                this.editForm.blockQuestions[i].routes = []
              }
            }
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
        this.editForm.blockQuestions = []
        this.currentQuestion = null
        this.currentQuestionType = null
        done()
      }).catch(() => {})
    },
    // 修改
    edit: function () {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          // 按顺序添加SequenceNo，有routing的IsRoute赋true
          for (let i = 0; i < this.editForm.blockQuestions.length; i++) {
            this.editForm.blockQuestions[i].SequenceNo = i + 1
            if (this.editForm.blockQuestions[i].routes.length > 0) {
              this.editForm.blockQuestions[i].IsRoute = true
            }
          }
          this.axios.post('/api/Services/memoservice.asmx/SaveBlock', {block: JSON.stringify(this.editForm)}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['editForm'].resetFields()
              this.editForm.blockQuestions = []
              this.currentQuestion = null
              this.currentQuestionType = null
              this.editFormVisible = false
              // 如果修改记录符合查询条件，更新该记录；如果不符合，删除该记录，总数减1
              if (this.searchName === null || (this.searchName !== null && res.data.Name.indexOf(this.searchName) !== -1)) {
                this.list = this.list.map(item => { return item.BlockID === res.data.BlockID ? res.data : item })
              } else {
                this.list = this.list.filter(item => item.BlockID !== res.data.BlockID)
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
        this.axios.post('/api/Services/memoservice.asmx/RemoveBlock', {blockid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.BlockID !== id)
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
