<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Properties</span>
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
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Property ID" prop="QuestionID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Use Times" prop="UseTimes" width="100" fixed="left">
          <template slot-scope="scope">
            <a href="#" @click="showBlocksDetail(scope.row.QuestionID)">{{scope.row.UseTimes}}</a>
          </template>
        </el-table-column>
        <el-table-column label="Content" prop="Description" min-width="300"></el-table-column>
        <el-table-column label="Input Type" prop="InputType" width="100"></el-table-column>
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
      <el-dialog title="Add New Property" :visible.sync="addFormVisible" width="1000px" center :before-close="closeAdd">
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
          <el-form-item v-if="addForm.InputType === 'list'" label="Data Source" prop="DataSource" >
            <el-select v-model="addForm.DataSource" placeholder="Data Type" size="small" class="" >
              <el-option v-for="item in dataTypes" :key="item.ItemID" :label="item.Name" :value="item.ItemValue"></el-option>
            </el-select>
            <!--<el-input v-model="editForm.DataSource" clearable></el-input>-->
          </el-form-item>
          <el-form-item v-if="addForm.InputType === 'children'" label="Data Source" prop="DataSource" >
            <el-input v-model="addForm.DataSource" clearable></el-input>
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
      <el-dialog title="Edit Property" :visible.sync="editFormVisible" width="1000px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form">
          <el-form-item label="Output Way" prop="OutputModeID">
            <el-radio-group v-model="editForm.OutputModeID">
              <el-radio v-for="item in outputWayList" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Content" prop="Description">
            <el-input v-model="editForm.Description" clearable></el-input>
          </el-form-item>
          <el-form-item label="Input Type" prop="InputType">
            <el-radio-group v-model="editForm.InputType">
              <el-radio v-for="item in inputTypeList" :label="item.value" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="editForm.InputType === 'list'" label="Data Source" prop="DataSource" >
            <el-select v-model="editForm.DataSource" placeholder="Data Type" size="small" class="" >
              <el-option v-for="item in dataTypes" :key="item.ItemID" :label="item.Name" :value="item.ItemValue"></el-option>
            </el-select>
            <!--<el-input v-model="editForm.DataSource" clearable></el-input>-->
          </el-form-item>
          <el-form-item v-if="editForm.InputType === 'children'" label="Data Source" prop="DataSource" >
            <el-input v-model="editForm.DataSource" clearable></el-input>
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
    </div>
  </div>
</template>

<script>
import UsedBlockList from '@/component/window/usedBlockList'

export default {
  components: {
    UsedBlockList
  },
  data: function () {
    return {
      isLoading: false,
      blocksDetailVisible: false,
      inputTypeList: [{id: 1, name: 'text', value: 'text'}, {id: 2, name: 'date', value: 'date'}, {id: 3, name: 'number', value: 'number'}, {id: 4, name: 'list', value: 'list'}, {id: 5, name: 'children', value: 'children'}],
      // 新增
      outputWayList: [{id: 1, name: 'Normal'}, {id: 3, name: 'None'}],
      addFormVisible: false,
      addForm: {
        TypeID: 3,
        Description: null,
        Tips: null,
        OutputModeID: 1,
        StatusID: 1,
        InputType: 'text',
        DataSource: null,
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
        name: null
      },
      searchName: null,
      dataSourceVisible: false,
      isLoadingDataTypes: false,
      dataTypes: [],
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
    this.loadDataTypes()
  },
  methods: {
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
    loadDataTypes: function () {
      this.isLoadingDataTypes = true
      this.axios.post('/api/Services/baseservice.asmx/GetDataTypes', { }).then(res => {
        if (res) {
          console.log('数据类型列表', res)
          this.dataTypes = res.data
        }
        this.isLoadingDataTypes = false
      }).catch(err => {
        console.log('数据类型列表', err)
        this.isLoadingDataTypes = false
      })
    },
    // 查询
    search: function (name) {
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetQuestionsByTypeQuery', {typeid: 3, query: name}).then(res => {
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
        done()
      }).catch(() => {})
    },
    // 修改
    edit: function () {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.axios.post('/api/Services/memoservice.asmx/SaveQuestion', {question: JSON.stringify(this.editForm)}).then(res => {
            if (res) {
              console.log('修改', res)
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
