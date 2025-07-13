<!--
FileName: Library/questions/attributes.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show attribute list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Attributes for {{businessTypes[btypeId]}}</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">New</el-button>
        <el-button icon="el-icon-plus" type="primary" @click="showQuestionList()" :loading="isLoading">Print</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search()" :loading="isLoading" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Attribute ID" prop="QuestionID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Use Times" prop="UseTimes" width="100" fixed="left">
          <template slot-scope="scope">
            <a href="#" @click="showBlocksDetail(scope.row.QuestionID)">{{scope.row.UseTimes}}</a>
          </template>
        </el-table-column>
        <el-table-column label="Content" prop="Description" min-width="300"></el-table-column>
        <el-table-column label="Input Type" prop="InputType" width="100"></el-table-column>
        <el-table-column label="Data Source" prop="DataSource" width="200"></el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row.QuestionID)" :loading="isLoading" size="small">Edit</el-button>
            <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.QuestionID)" :loading="isLoading" size="small">Delete</el-button>
            <el-button icon="el-icon-edit" type="primary" @click="showMapping(scope.row)" :loading="isLoading" size="small">Mapping</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <!--el-dialog title="Add New Attribute" :visible.sync="addFormVisible" width="1000px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="Output Way" prop="OutputModeID">
            <el-radio-group v-model="addForm.OutputModeID">
              <el-radio v-for="item in outputWayList" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Content" prop="Description">
            <el-input v-model="addForm.Description" clearable></el-input>
          </el-form-item>
          <el-form-item label="Input Type" prop="InputType">
            <el-radio-group v-model="addForm.InputType">
              <el-radio v-for="item in inputTypeList" :label="item.value" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="addForm.InputType === 'list' || addForm.InputType === 'checkList'" label="Data Source" prop="DataSource" >
            <el-select v-model="addForm.DataSource" placeholder="Data Type" size="small" class="" >
              <el-option v-for="item in dataTypes" :key="item.ItemID" :label="item.Name" :value="item.ItemValue"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="addForm.InputType === 'children'||addForm.InputType === 'computed'" label="Data Source" prop="DataSource" >
            <el-input v-model="addForm.DataSource" clearable></el-input>
          </el-form-item>
          <el-form-item label="Question Tips" prop="Tips">
            <el-input v-model="addForm.Tips" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog-->
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="Edit Attribute" :visible.sync="editFormVisible" width="1000px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form">
          <el-form-item label="Output Way" prop="OutputModeID">
            <el-radio-group v-model="editForm.OutputModeID">
              <el-radio v-for="item in outputWayList" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Attribute Name" prop="Description">
            <el-input v-model="editForm.Description" clearable></el-input>
          </el-form-item>
          <el-form-item label="Input Type" prop="InputType">
            <el-radio-group v-model="editForm.InputType">
              <el-radio v-for="item in inputTypeList" :label="item.value" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="editForm.InputType === 'text'" label="Data Source" prop="DataSource" >
            <el-input v-model="editForm.DataSource" clearable></el-input>
          </el-form-item>
          <el-form-item v-if="editForm.InputType === 'list'" label="Data Source" prop="DataSource" >
            <el-select v-model="editForm.DataSource" placeholder="Data Type" size="small" class="" >
              <el-option v-for="item in listDataTypes" :key="item.ItemID" :label="item.Name" :value="item.Name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="editForm.InputType === 'sublist'" label="Data Source" prop="DataSource" >
            <el-select v-model="editForm.DataSource" placeholder="Data Type" size="small" class="" >
              <el-option v-for="item in listDataTypes" :key="item.ItemID" :label="item.Name" :value="item.Name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="editForm.InputType === 'sublist'" label="Parent Data Source" prop="ParentDataSource" >
            <el-select v-model="editForm.ParentDataSource" placeholder="Data Type" size="small" class="" >
              <el-option v-for="item in listDataTypes" :key="item.ItemID" :label="item.Name" :value="item.Name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="editForm.InputType === 'sublist'" label="ParentID" prop="ParentID" >
            <el-input v-model="editForm.ParentID" clearable></el-input>
          </el-form-item>
          <el-form-item v-if="editForm.InputType === 'checklist'" label="Data Source" prop="DataSource" >
            <el-select v-model="editForm.DataSource" placeholder="Data Type" size="small" class="" >
              <el-option v-for="item in checklistDataTypes" :key="item.ItemID" :label="item.Name" :value="item.Name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="editForm.InputType === 'children'" label="Parent Source" prop="DataSource" >
            <el-select v-model="editForm.DataSource" placeholder="Data Type" size="small" class="" >
              <el-option v-for="item in listAttributes" :key="item.QuestionID" :label="item.Description" :value="item.Description"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item  v-if="editForm.InputType === 'computed'" label="Rate Source" >
            <el-col :span="18">
              <el-select v-model="currentRateIndex" placeholder="Rate Source" size="small" class="" >
                <el-option v-for="(item, index) in rates" :key="index" :label="item.Name" :value="index"></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button icon="el-icon-plus" type="primary" size="small" @click="addRate(editForm.DataSource)"></el-button>
            </el-col>
          </el-form-item>
          <el-form-item  v-if="editForm.InputType === 'computed'" label="Attribute Source" >
            <el-col :span="18">
              <el-select v-model="currentAttributeIndex" placeholder="Attribute Source" size="small" class="" >
                <el-option v-for="(item, index) in attributes" :key="index" :label="item.Description" :value="index"></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button icon="el-icon-plus" type="primary" size="small" @click="addAttribute()"></el-button>
            </el-col>
          </el-form-item>
          <el-form-item v-if="editForm.InputType === 'computed'" label="Formula" prop="DataSource" >
            <el-input v-model="editForm.DataSource" clearable></el-input>
          </el-form-item>
          <el-form-item v-if="editForm.InputType === 'array'" label="Data Source" prop="DataSource" >
            <el-select v-model="editForm.DataSource" placeholder="Data Type" size="small" class="" >
              <el-option v-for="item in objectDataTypes" :key="item.ItemID" :label="item.Name" :value="item.Name"></el-option>
            </el-select>
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
      <!----------------------------------------------QuestionMapping弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="mappingVisible" width="800px" center :before-close="closeMapping">
        <Mapping ref="mpp" :Question="currentQuestion"></Mapping>
      </el-dialog>
      <!----------------------------------------------QuestionList弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import UsedBlockList from '@/component/window/usedBlockList'
import QuestionList from '@/component/window/questionList'
import Mapping from '@/component/window/questionMapping'

export default {
  components: {
    UsedBlockList,
    QuestionList,
    Mapping
  },
  data: function () {
    return {
      isLoading: false,
      currentId: null,
      currentQuestion: null,
      typeId: 3,
      currentRateIndex: null,
      currentAttributeIndex: null,
      btypeId: 2,
      businessTypes: ['', 'PL Memo', 'NB CoverLetter', 'IRCA Memo', 'CL Application'],
      typeName: 'Attribute',
      attributes: [],
      listAttributes: [],
      rates: [],
      questionListVisible: false,
      blocksDetailVisible: false,
      mappingVisible: false,
      inputTypeList: [
        {id: 1, name: 'text', value: 'text'},
        {id: 2, name: 'date', value: 'date'},
        {id: 3, name: 'number', value: 'number'},
        {id: 4, name: 'list', value: 'list'},
        {id: 5, name: 'children', value: 'children'},
        {id: 6, name: 'bit', value: 'bit'},
        {id: 7, name: 'array', value: 'array'},
        {id: 8, name: 'money', value: 'money'},
        {id: 9, name: 'checklist', value: 'checklist'},
        {id: 10, name: 'percent', value: 'percent'},
        {id: 11, name: 'computed', value: 'computed'},
        {id: 12, name: 'address', value: 'address'},
        {id: 14, name: 'sublist', value: 'sublist'}
      ],
      // 新增
      outputWayList: [{id: 1, name: 'Normal'}, {id: 3, name: 'None'}],
      addFormVisible: false,
      addForm: {
        TypeID: 3,
        RateID: 0,
        AttributeID: 0,
        Description: null,
        Tips: null,
        OutputModeID: 1,
        StatusID: 1,
        InputType: 'text',
        DataSource: null,
        ParentDataSource: null,
        ParentID: 0,
        fillinParts: null,
        options: null
      },
      addFormRules: {
        Description: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ]
      },
      // 修改
      editFormVisible: false,
      editForm: {
        QuestionID: null,
        TypeID: 3,
        Description: null,
        Tips: null,
        OutputModeID: 1,
        StatusID: 1,
        InputType: null,
        DataSource: null,
        ParentDataSource: null,
        ParentID: 0,
        fillinParts: null,
        options: null,
        IsNew: false
      },
      editFormRules: {
        Description: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ]
      },
      // 搜索
      searchForm: {
        name: ''
      },
      searchName: null,
      dataSourceVisible: false,
      isLoadingDataTypes: false,
      dataTypes: [],
      objectDataTypes: [],
      listDataTypes: [],
      checklistDataTypes: [],
      // 列表
      tempList: [],
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
      this.search()
    }
  },
  mounted: function () {
    this.btypeId = parseInt(this.$route.params.id)
    this.typeName = this.businessTypes[this.btypeId] + this.typeName
    this.loadRateTypes()
    this.loadDataTypes()
    this.loadAttributes()
    this.loadQuestions(0)
  },
  methods: {
    addRate: function () {
      let rate = this.rates[this.currentRateIndex]
      this.editForm.DataSource += rate.Name
    },
    addAttribute: function () {
      let item = this.attributes[this.currentAttributeIndex]
      this.editForm.DataSource += item.Description
    },
    showQuestionList: function () {
      this.questionListVisible = true
      if (this.$refs.ql !== undefined) {
        this.$refs.ql.loadQuestions(this.typeId)
      }
    },
    closeQuestionList: function () {
      this.questionListVisible = false
    },
    closeMapping: function () {
      this.mappingVisible = false
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
    // 获取数据类型列表
    loadRateTypes: function () {
      this.isLoadingDataTypes = true
      this.axios.post('/api/Services/baseService.asmx/GetDataItems', { datatype: 'RateType' }).then(res => {
        if (res) {
          console.log('RateTypes', res)
          this.rates = res.data
        }
        this.isLoadingDataTypes = false
      }).catch(err => {
        console.log('RateTypes', err)
        this.isLoadingDataTypes = false
      })
    },
    // 获取数据类型列表
    loadAttributes: function () {
      this.isLoadingDataTypes = true
      this.axios.post('/api/Services/baseService.asmx/GetQuestionsByType', { typeid: 3, btypeid: this.btypeId }).then(res => {
        if (res) {
          console.log('Attributes', res)
          this.attributes = res.data.filter(q => q.InputType === 'number' || q.InputType === 'computed')
          this.listAttributes = res.data.filter(q => q.InputType === 'list')
          // this.totalList = res.data
          // this.list = this.totalList
          // this.total = this.list.length
          // this.currentPage = 1
        }
        this.isLoadingDataTypes = false
      }).catch(err => {
        console.log('Attributes', err)
        this.isLoadingDataTypes = false
      })
    },
    // 获取数据类型列表
    loadDataTypes: function () {
      this.isLoadingDataTypes = true
      this.axios.post('/api/Services/baseService.asmx/GetDataTypes', { }).then(res => {
        if (res) {
          console.log('数据类型列表', res)
          this.dataTypes = res.data
          this.objectDataTypes = res.data.filter(d => d.ItemValue === 'object')
          this.listDataTypes = res.data.filter(d => d.ItemValue === 'list' || d.ItemValue === 'children')
          this.checklistDataTypes = res.data.filter(d => d.ItemValue === 'checklist')
        }
        this.isLoadingDataTypes = false
      }).catch(err => {
        console.log('数据类型列表', err)
        this.isLoadingDataTypes = false
      })
    },
    search: function () {
      let query = this.searchForm.name.toLowerCase()
      if (query === '') {
        this.list = this.totalList
      } else {
        this.list = this.totalList.filter(r => r.Description.toLowerCase().indexOf(query) >= 0 ||
          r.QuestionID === Number(query) ||
          r.InputType.toLowerCase().indexOf(query) >= 0 ||
          (r.DataSource !== null && r.DataSource.toLowerCase().indexOf(query) >= 0)
        )
      }
      this.total = this.list.length
      this.pageCount = Math.ceil(this.total / this.pageSize)
    },
    // 查询
    load: function (start) {
      // this.isLoading = true
      if (start === 0) {
        this.totalList = []
        this.isLoading = true
        // this.isLoadingAll = true
      }
      this.axios.post('/api/Services/BaseService.asmx/GetQuestions', {typeid: 3, btypeid: this.btypeId, start: start}).then(res => {
        if (res) {
          console.log('loadQuestion', res)
          this.totalList = res.data
          this.list = this.totalList
          this.total = this.list.length
          this.currentPage = 1
          if (start === 0) {
            this.total = res.count
            this.totalList = res.data
            this.list = this.totalList
            this.pageCount = Math.ceil(this.total / this.pageSize)
            this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            // this.isLoading = false
          } else {
            this.totalList = this.totalList.concat(res.data)
          }
          if (this.totalList.length >= this.total) {
            this.list = this.totalList
            this.pageCount = Math.ceil(this.total / this.pageSize)
            this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            this.isLoading = false
          } else this.load(this.totalList.length)
        }
        // this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
        // this.isLoadingAll = false
      })
    },
    loadQuestions: function (start) {
      this.isLoading = true
      let id = 3
      this.axios.post('/api/Services/BaseService.asmx/GetQuestions', {typeid: id, btypeid: this.btypeId, start: start}).then(res => {
        if (res) {
          console.log('查询', res)
          if (start === 0) {
            this.questionCount = res.count
            this.totalList = res.data
            this.total = res.count
            this.currentPage = 1
          } else {
            this.totalList = this.totalList.concat(res.data)
          }
          if (this.totalList.length < this.questionCount) {
            this.loadQuestions(this.totalList.length)
          } else {
            this.list = this.totalList
            this.isLoading = false
          }
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = ''
      this.search()
    },
    // 显示新增弹窗
    showAdd: function () {
      this.editFormTitle = 'Add New Attribute'
      let question = {
        QuestionID: 0,
        TypeID: 3,
        Description: '',
        Tips: '',
        OutputModeID: 1,
        StatusID: 1,
        InputType: 'text',
        DataSource: '',
        IsNew: true
      }
      this.editForm = question
      this.editFormVisible = true
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
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    showMapping: function (question) {
      this.currentQuestion = question
      this.mappingVisible = true
      if (this.$refs.mpp !== undefined) {
        this.$refs.mpp.setQuestion(question)
      }
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
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.axios.post('/api/Services/BaseService.asmx/SaveQuestion', {question: JSON.stringify(this.editForm), btypeid: this.btypeId}).then(res => {
            if (res) {
              console.log('修改', res)
              if (this.editForm.IsNew) {
                let question = res.data
                this.list.splice(0, 0, question)
                this.total = this.list.length
              }
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['editForm'].resetFields()
              this.editFormVisible = false
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
    }
  }
}
</script>

<style scoped>

</style>
