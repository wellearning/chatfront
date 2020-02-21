<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Templates</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading || isLoadingBlock">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name)" :loading="isLoading || isLoadingBlock" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingBlock" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingBlock" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Template ID" prop="TemplateID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Title" prop="Title" min-width="300"></el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row.TemplateID)" :loading="isLoading || isLoadingBlock" size="small">Edit</el-button>
            <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.TemplateID)" :loading="isLoading || isLoadingBlock" size="small">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Template" :visible.sync="addFormVisible" width="1000px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form choiceQuestionForm">
          <el-form-item label="Title" prop="Title">
            <el-input v-model="addForm.Title" clearable></el-input>
          </el-form-item>
          <el-form-item label="Type" prop="TypeID">
            <el-select v-model="addForm.TypeID" placeholder="Block" no-data-text="No Record" filterable>
              <el-option v-for="item in typeIdList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <div v-for="(item, index) in addForm.templateBlocks" :key="index" class="choice">
            <el-form-item class="marginLeft10">
              <span><b>{{item.BlockName}}</b></span>
            </el-form-item>
            <el-form-item class="marginLeft20">
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('addForm', index)" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-up" v-if="index !== 0" type="primary" @click="upChoice('addForm', index)" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-down" v-if="index !== addForm.templateBlocks.length - 1" type="primary" @click="downChoice('addForm', index)" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnGroup"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('addForm')" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnSingle">Block</el-button>
            <el-select v-model="currentBlock" placeholder="Block" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
              <el-option class="questionOption" v-for="item in blockList" :key="item.BlockID" :label="item.Name" :value="item.BlockID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading || isLoadingBlock">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="Edit Template" :visible.sync="editFormVisible" width="1000px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form choiceQuestionForm">
          <el-form-item label="Title" prop="Title">
            <el-input v-model="editForm.Title" clearable></el-input>
          </el-form-item>
          <el-form-item label="Type" prop="TypeID">
            <el-select v-model="editForm.TypeID" placeholder="Block" no-data-text="No Record" filterable>
              <el-option v-for="item in typeIdList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <div v-for="(item, index) in editForm.templateBlocks" :key="index" class="choice">
            <el-form-item class="marginLeft10">
              <span><b>{{item.BlockName}}</b></span>
            </el-form-item>
            <el-form-item class="marginLeft20">
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('editForm', index)" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-up" v-if="index !== 0" type="primary" @click="upChoice('editForm', index)" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-down" v-if="index !== editForm.templateBlocks.length - 1" type="primary" @click="downChoice('editForm', index)" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnGroup"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('editForm')" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnSingle">Block</el-button>
            <el-select v-model="currentBlock" placeholder="Block" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
              <el-option class="questionOption" v-for="item in blockList" :key="item.BlockID" :label="item.Name" :value="item.BlockID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading || isLoadingBlock">Confirm</el-button>
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
      isLoadingBlock: false,
      blockList: [],
      currentBlock: null,
      typeIdList: [{id: 1, name: 'Vehicle Template'}, {id: 2, name: 'Property Template'}],
      // 新增
      addFormVisible: false,
      addForm: {
        TypeID: null,
        StatusID: 1,
        Title: null,
        templateBlocks: []
      },
      addFormRules: {
        Title: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        TypeID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ]
      },
      // 修改
      editFormVisible: false,
      editForm: {
        TemplateID: null,
        TypeID: null,
        StatusID: 1,
        Title: null,
        templateBlocks: [],
        IsNew: false
      },
      editFormRules: {
        Title: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        TypeID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
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
    this.initBlock()
  },
  methods: {
    // blocks列表
    initBlock: function () {
      this.isLoadingBlock = true
      this.axios.post('/api/Services/memoservice.asmx/SearchBlocks', {query: ''}).then(res => {
        if (res) {
          console.log('blocks列表', res)
          this.blockList = res.data
          // 同一个template中，同一个block只能有一个
          if (this.addFormVisible) {
            this.blockList = this.blockList.filter(item => (this.addForm.templateBlocks.map(it => it.BlockID)).indexOf(item.BlockID) === -1)
          } else if (this.editFormVisible) {
            this.blockList = this.blockList.filter(item => (this.editForm.templateBlocks.map(it => it.BlockID)).indexOf(item.BlockID) === -1)
          }
        }
        this.isLoadingBlock = false
      }).catch(err => {
        console.log('blocks列表出错', err)
        this.isLoadingBlock = false
      })
    },
    // 添加一行
    addChoice: function (form) {
      if (this.currentBlock === null) {
        this.$message({
          type: 'warning',
          message: 'Please Select Block'
        })
      } else {
        if (form === 'addForm') {
          this.addForm.templateBlocks.push({BlockID: this.currentBlock, BlockName: this.blockList.find(it => it.BlockID === this.currentBlock).Name})
        } else if (form === 'editForm') {
          this.editForm.templateBlocks.push({BlockID: this.currentBlock, BlockName: this.blockList.find(it => it.BlockID === this.currentBlock).Name})
        }
        this.currentBlock = null
        this.initBlock()
      }
    },
    // 删除一行
    delChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.templateBlocks.splice(index, 1)
      } else if (form === 'editForm') {
        this.editForm.templateBlocks.splice(index, 1)
      }
      this.initBlock()
    },
    // 上移一行
    upChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.templateBlocks[index] = this.addForm.templateBlocks.splice(index - 1, 1, this.addForm.templateBlocks[index])[0]
      } else if (form === 'editForm') {
        this.editForm.templateBlocks[index] = this.editForm.templateBlocks.splice(index - 1, 1, this.editForm.templateBlocks[index])[0]
      }
    },
    // 下移一行
    downChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.templateBlocks[index] = this.addForm.templateBlocks.splice(index + 1, 1, this.addForm.templateBlocks[index])[0]
      } else if (form === 'editForm') {
        this.editForm.templateBlocks[index] = this.editForm.templateBlocks.splice(index + 1, 1, this.editForm.templateBlocks[index])[0]
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
      this.axios.post('/api/Services/memoservice.asmx/SearchTemplates', {query: this.searchName}).then(res => {
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
        this.addForm.templateBlocks = []
        this.currentBlock = null
        done()
      }).catch(() => {})
    },
    // 新增
    add: function () {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          // 按顺序添加SequenceNo
          for (let i = 0; i < this.addForm.templateBlocks.length; i++) {
            this.addForm.templateBlocks[i].SequenceNo = i + 1
          }
          this.axios.post('/api/Services/memoservice.asmx/SaveTemplate', {template: JSON.stringify(this.addForm)}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addForm.templateBlocks = []
              this.currentBlock = null
              this.addFormVisible = false
              // 如果新增记录符合查询条件，将新增的记录添加到数组最后，总数加1
              if (this.searchName === null || (this.searchName !== null && res.data.Title.indexOf(this.searchName) !== -1)) {
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
      this.axios.post('/api/Services/memoservice.asmx/GetTemplate', {templateid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.editFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.editForm = res.data
            if (this.editForm.templateBlocks !== null && this.editForm.templateBlocks.length > 0) {
              this.editForm.templateBlocks = this.editForm.templateBlocks.slice().sort((a, b) => { return a.SequenceNo - b.SequenceNo })
              this.initBlock()
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
        this.editForm.templateBlocks = []
        this.currentBlock = null
        done()
      }).catch(() => {})
    },
    // 修改
    edit: function () {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          // 按顺序添加SequenceNo
          for (let i = 0; i < this.editForm.templateBlocks.length; i++) {
            this.editForm.templateBlocks[i].SequenceNo = i + 1
          }
          this.axios.post('/api/Services/memoservice.asmx/SaveTemplate', {template: JSON.stringify(this.editForm)}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['editForm'].resetFields()
              this.editForm.templateBlocks = []
              this.currentBlock = null
              this.editFormVisible = false
              // 如果修改记录符合查询条件，更新该记录；如果不符合，删除该记录，总数减1
              if (this.searchName === null || (this.searchName !== null && res.data.Title.indexOf(this.searchName) !== -1)) {
                this.list = this.list.map(item => { return item.TemplateID === res.data.TemplateID ? res.data : item })
              } else {
                this.list = this.list.filter(item => item.TemplateID !== res.data.TemplateID)
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
        this.axios.post('/api/Services/memoservice.asmx/RemoveTemplate', {templateid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.TemplateID !== id)
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
