<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Business Parameter</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading || isLoadingOrganization">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Parameter Name" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name)" :loading="isLoading || isLoadingOrganization" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingOrganization" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingOrganization" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="ParameterID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Name" prop="Name" min-width="200"></el-table-column>
        <el-table-column label="BusinessType" prop="BusinessType" min-width="100"></el-table-column>
        <el-table-column label="InsuranceType" prop="InsuranceType" min-width="100"></el-table-column>
        <el-table-column label="ProcessingType" prop="ProcessingType" min-width="200"></el-table-column>
        <el-table-column label="Sequence" prop="SequenceNo" min-width="100"></el-table-column>
        <el-table-column label="UW Score" prop="Score" min-width="100"></el-table-column>
        <el-table-column label="Q-Score" prop="QualityScore" min-width="100"></el-table-column>
        <el-table-column label="Action" width="320" fixed="right">
          <template v-slot="scope">
            <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row)" :loading="isLoading || isLoadingOrganization" size="small">Edit</el-button>
            <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.ParameterID)" :loading="isLoading || isLoadingOrganization" size="small">Delete</el-button>
            <el-button v-if="scope.row.DataType === 'List'" icon="el-icon-document" type="primary" @click="showListValue(scope.row)" :loading="isLoading || isLoadingOrganization" size="small">ListValue</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Business Parameter" :visible.sync="addFormVisible" width="600px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="BusinessType" prop="BusinessTypeID">
            <el-select v-model="addForm.BusinessTypeID" placeholder="Block" no-data-text="No Record" filterable>
              <el-option v-for="item in businessTypes" :key="item.ID" :label="item.Name" :value="item.ID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="InsuranceType" prop="InsuranceTypeID">
            <el-select v-model="addForm.InsuranceTypeID" placeholder="Block" no-data-text="No Record" filterable>
              <el-option v-for="item in insuranceTypes" :key="item.ID" :label="item.Name" :value="item.ID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="ProcessingType" prop="ProcessingTypeID">
            <el-select v-model="addForm.ProcessingTypeID" placeholder="Block" no-data-text="No Record" filterable>
              <el-option v-for="item in processingTypes" :key="item.ID" :label="item.Name" :value="item.ID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Name" prop="Name">
            <el-input v-model="addForm.Name" clearable></el-input>
          </el-form-item>
          <el-form-item label="DisplayName" prop="DisplayName">
            <el-input v-model="addForm.DisplayName" clearable></el-input>
          </el-form-item>
          <el-form-item label="DataType" prop="DataType">
            <el-select v-model="addForm.DataType" placeholder="Block" no-data-text="No Record" filterable>
              <el-option v-for="item in dataTypes" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="UW Score" prop="Score">
            <el-input v-model.number="addForm.Score" clearable></el-input>
          </el-form-item>
          <el-form-item label="QualityScore" prop="QualityScore">
            <el-input v-model.number="addForm.QualityScore" clearable></el-input>
          </el-form-item>
          <el-form-item label="Remark" prop="Remark">
            <el-input v-model="addForm.Remark" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading || isLoadingOrganization">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="Edit Business Parameter" :visible.sync="editFormVisible" width="700px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form">
          <el-form-item label="BusinessType" prop="BusinessTypeID">
            <el-select v-model="editForm.BusinessTypeID" placeholder="Block" no-data-text="No Record" filterable>
              <el-option v-for="item in businessTypes" :key="item.ID" :label="item.Name" :value="item.ID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="InsuranceType" prop="InsuranceTypeID">
            <el-select v-model="editForm.InsuranceTypeID" placeholder="Block" no-data-text="No Record" filterable>
              <el-option v-for="item in insuranceTypes" :key="item.ID" :label="item.Name" :value="item.ID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="ProcessingType" prop="ProcessingTypeID">
            <el-select v-model="editForm.ProcessingTypeID" placeholder="Block" no-data-text="No Record" filterable>
              <el-option v-for="item in processingTypes" :key="item.ID" :label="item.Name" :value="item.ID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Name" prop="Name">
            <el-input v-model="editForm.Name" clearable></el-input>
          </el-form-item>
          <el-form-item label="DisplayName" prop="DisplayName">
            <el-input v-model="editForm.DisplayName" clearable></el-input>
          </el-form-item>
          <el-form-item label="DataType" prop="DataType">
            <el-select v-model="editForm.DataType" placeholder="Block" no-data-text="No Record" filterable>
              <el-option v-for="item in dataTypes" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="UW Score" prop="Score">
            <el-input v-model.number="editForm.Score" clearable></el-input>
          </el-form-item>
          <el-form-item label="QualityScore" prop="QualityScore">
            <el-input v-model.number="editForm.QualityScore" clearable></el-input>
          </el-form-item>
          <el-form-item label="Remark" prop="Remark">
            <el-input v-model="editForm.Remark" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading || isLoadingOrganization">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------ListValue弹窗开始----------------------------------------------------->
      <el-dialog title="List Value" :visible.sync="listValueVisible" width="800px" center :before-close="closeListValue">
        <el-table :data="listValueList" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
          <el-table-column label="ID" prop="ListValueID" width="100" fixed="left"></el-table-column>
          <el-table-column label="Name" prop="Name" min-width="100"></el-table-column>
          <el-table-column label="Value" prop="Value" min-width="100"></el-table-column>
          <el-table-column label="UW Score" prop="Score" min-width="100"></el-table-column>
          <el-table-column label="Q-Score" prop="QualityScore" min-width="100"></el-table-column>
          <el-table-column label="Action" width="200" fixed="right">
            <template v-slot="scope">
              <el-button icon="el-icon-edit" type="primary" @click="showListValueEdit(scope.row)" :loading="isLoading || isLoadingOrganization" size="small">Edit</el-button>
              <el-button icon="el-icon-delete" type="danger" @click="delListValue(scope.row.ListValueID)" :loading="isLoading || isLoadingOrganization" size="small">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-form :model="editListValueForm" ref="editListValueForm" :rules="editListValueFormRules" class="form">
          <el-form-item label="Name" prop="Name">
            <el-input v-model="editListValueForm.Name" clearable></el-input>
          </el-form-item>
          <el-form-item label="Value" prop="Value">
            <el-input v-model="editListValueForm.Value" clearable></el-input>
          </el-form-item>
          <el-form-item label="UW Score" prop="Score">
            <el-input v-model.number="editListValueForm.Score" clearable></el-input>
          </el-form-item>
          <el-form-item label="QualityScore" prop="QualityScore">
            <el-input v-model.number="editListValueForm.QualityScore" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="addListValue()" :loading="isLoading || isLoadingOrganization">Add</el-button>
            <el-button icon="el-icon-check" type="primary" @click="editListValue()" :loading="isLoading || isLoadingOrganization">Update</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------ListValue弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      isLoading: false,
      isLoadingOrganization: false,
      currentId: null,
      currentParameter: null,
      currentListValue: null,
      // 列表
      list: [],
      listLength: 0,
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      // 权限
      listValueVisible: false,
      listValueList: [],
      isPost: false,
      totalNum: 0,
      finishNum: 0,
      businessTypes: [{ID: 1, Name: 'PolicyChange'}, {ID: 2, Name: 'NewBusiness'}, {ID: 3, Name: 'Commerce'}],
      insuranceTypes: [{ID: 1, Name: 'Auto'}, {ID: 2, Name: 'Property'}],
      processingTypes: [{ID: 1, Name: 'Underwriting'}, {ID: 2, Name: 'Upload'}, {ID: 3, Name: 'Decline'}],
      dataTypes: ['Text', 'Number', 'DateTime', 'Check', 'List', 'Computed'],
      // 新增
      addFormVisible: false,
      addForm: {
        BusinessTypeID: 1,
        InsuranceTypeID: 1,
        ProcessingTypeID: 1,
        DataType: 'Text',
        Name: '',
        DisplayName: null,
        Remark: null,
        Score: 0,
        QualityScore: 0,
        SequenceNo: 0
      },
      addFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 100, message: 'Within 100 Characters', trigger: 'blur' }
        ],
        Score: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ],
        QualityScore: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ]
      },
      // 修改
      editFormVisible: false,
      editForm: {
        ParameterID: null,
        BusinessTypeID: 0,
        InsuranceTypeID: 0,
        ProcessingTypeID: 0,
        DataType: 'Text',
        Name: null,
        DisplayName: null,
        Remark: null,
        Score: 0,
        QualityScore: 0,
        SequenceNo: 0,
        StatusID: 1,
        IsNew: false,
        IsNewAdded: false,
        IsRemoved: false
      },
      editFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 100, message: 'Within 100 Characters', trigger: 'blur' }
        ],
        Score: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ],
        QualityScore: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ],
        SequenceNo: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ]
      },
      editListValueForm: {
        ListValueID: 0,
        ParameterID: 0,
        Name: null,
        Value: null,
        Score: 0,
        QualityScore: 0
      },
      editListValueFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 100, message: 'Within 100 Characters', trigger: 'blur' }
        ],
        Value: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 100, message: 'Within 100 Characters', trigger: 'blur' }
        ],
        Score: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ],
        QualityScore: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function () {
    this.search(null)
  },
  watch: {
    finishNum (val) {
      if (val === this.totalNum && this.isPost) {
        this.$message({
          type: 'success',
          message: 'Operation Succeeded'
        })
        this.totalNum = 0
        this.finishNum = 0
        this.isPost = false
        this.listValueVisible = false
        this.isLoading = false
      }
    }
  },
  methods: {
    // 查询
    search: function (name) {
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetBusinessParameters_all', {}).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          this.listLength = this.list.length
          if (name !== null) {
            this.searchName = name
            this.list = this.list.filter(item => item.Name.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)
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
    // 隐藏权限弹窗
    closeListValue: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        done()
      }).catch(() => {})
    },
    // 删除
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/RemoveBusinessParameter', {parameterid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.ParameterID !== id)
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
    // 修改弹窗
    showEdit: function (parameter) {
      this.editForm = parameter
      this.editFormVisible = true
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
          this.axios.post('/api/Services/baseservice.asmx/SaveBusinessParameter', {parameter: JSON.stringify(this.editForm)}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['editForm'].resetFields()
              this.editFormVisible = false
              // 如果修改记录符合查询条件，更新该记录；如果不符合，删除该记录，总数减1
              if (this.searchName === null || (this.searchName !== null && res.data.Name.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)) {
                this.list = this.list.map(item => { return item.ParameterID === res.data.ParameterID ? res.data : item })
              } else {
                this.list = this.list.filter(item => item.ParameterID !== res.data.ParameterID)
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
          this.addForm.SequenceNo = this.listLength
          this.isLoading = true
          this.axios.post('/api/Services/baseservice.asmx/SaveBusinessParameter', {parameter: JSON.stringify(this.addForm)}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addFormVisible = false
              this.listLength++
              // 如果新增记录符合查询条件，将新增的记录添加到数组最后，总数加1
              if (this.searchName === null || (this.searchName !== null && res.data.Name.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)) {
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
    // 显示ListValue弹窗
    showListValue: function (parameter) {
      this.currentParameter = parameter
      this.listValueList = parameter.listValues
      this.editListValueForm.ParameterID = parameter.ParameterID
      this.listValueVisible = true
      this.editListValueForm = {
        ListValueID: 0,
        ParameterID: parameter.ParameterID,
        Name: null,
        Value: null,
        Score: 0,
        QualityScore: 0
      }
      // this.$refs['editListValueForm'].resetFields()
    },
    // 删除ListValue
    delListValue: function (id) {
      this.$confirm('Are you sure to delete the listValue?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/RemoveListValue', {id: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.listValueList = this.listValueList.filter(l => l.ListValueID !== id)
            this.currentParameter.listValues = this.listValueList
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
    // 修改Listvalue
    showListValueEdit: function (listValue) {
      this.editListValueForm = listValue
      // this.currentListValue = listValue
    },
    // 修改ListValue
    editListValue: function () {
      this.$refs['editListValueForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.axios.post('/api/Services/baseservice.asmx/SaveListValue', {listvalue: JSON.stringify(this.editListValueForm)}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              // this.$refs['editListValueForm'].resetFields()
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
    // 新增
    addListValue: function () {
      this.$refs['editListValueForm'].validate((valid) => {
        if (valid) {
          this.editListValueForm.IsNew = true
          this.isLoading = true
          this.axios.post('/api/Services/baseservice.asmx/SaveListValue', {listvalue: JSON.stringify(this.editListValueForm)}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['editListValueForm'].resetFields()
              this.listValueList.push(res.data)
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
