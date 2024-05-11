<!--
FileName: Configure/user.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all user list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">User</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading || isLoadingOrganization || isLoadingRole" size="small">New</el-button>
        <el-button icon="el-icon-refresh" @click="exportExcel()" :loading="isLoading" size="small">ToExcel</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="24" :lg="6" :xl="5">
          <div class="organization-list" v-loading="isLoading || isLoadingOrganization || isLoadingRole" element-loading-background="rgba(255, 255, 255, 0.5)">
            <el-tree ref="organizationTree" :data="organizationIdOptions" :props="defaultProps" default-expand-all :expand-on-click-node="false" node-key="InstitutionID" @current-change="nodeChange" empty-text="No Record" :highlight-current="true">
              <span slot-scope="{ node, data }" class="organization-node">
                <i class="organization-icon" :class="typeList.find(item => item.key === data.TypeID) !== undefined ? typeList.find(item => item.key === data.TypeID).icon : ''"></i>
                <span class="organization-label">{{ node.label }}</span>
              </span>
            </el-tree>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="19">
          <div class="organization-editBox">
            <div class="searchBox">
              <el-form :model="searchForm" ref="searchForm" class="searchForm">
                <el-form-item prop="status" label="Status" v-show="true">
                  <el-select v-model="searchForm.status" placeholder="Status" filterable size="small" style="width: 100px;">
                    <el-option v-for="item in searchStatusOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="" prop="name">
                  <el-input v-model="searchForm.name" placeholder="Name" size="small" clearable></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button icon="el-icon-search" type="primary" @click="search()" :loading="isLoading || isLoadingOrganization || isLoadingRole" size="small">Go</el-button>
                </el-form-item>
                <!--el-form-item>
                  <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingOrganization || isLoadingRole" size="small">Reset</el-button>
                </el-form-item-->
              </el-form>
            </div>
            <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingOrganization || isLoadingRole" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
              <el-table-column label="ID" prop="StaffID" width="80" fixed="left" sortable="custom"></el-table-column>
              <el-table-column label="Name" prop="Name" min-width="100" sortable="custom"></el-table-column>
              <el-table-column label="BranchCode" prop="institution.BranchCode" min-width="100"></el-table-column>
              <el-table-column label="Mobile" prop="Mobile" min-width="100"></el-table-column>
              <el-table-column label="Email" prop="Email" min-width="150"></el-table-column>
              <el-table-column label="Status" width="100">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.StatusID === 1" size="medium">Active</el-tag>
                  <el-tag v-else type="danger" size="medium">Inactive</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="PCode" prop="ProducerCode" min-width="110" sortable="custom"></el-table-column>
              <el-table-column label="Role" prop="role.Name" min-width="110"></el-table-column>
              <el-table-column label="Action" width="300" fixed="right">
                <template slot-scope="scope">
                  <el-tooltip class="item" effect="dark" :content="scope.row.StatusID === 2 ? 'Set Active' : 'Set Inactive'" placement="top-end">
                    <el-button :icon="scope.row.StatusID === 2 ? 'el-icon-open' : 'el-icon-turn-off'" :type="scope.row.StatusID === 2 ? 'success' : 'danger'" @click="switchStatus(scope.row.StaffID)" :loading="isLoading || isLoadingOrganization || isLoadingRole" size="small"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="Reset Password" placement="top-end">
                    <el-button icon="el-icon-key" type="primary" @click="showPass(scope.row.StaffID)" :loading="isLoading || isLoadingOrganization || isLoadingRole" size="small"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="Edit" placement="top-end">
                    <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row.StaffID)" :loading="isLoading || isLoadingOrganization || isLoadingRole" size="small"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="Delete" placement="top-end">
                    <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.StaffID)" :loading="isLoading || isLoadingOrganization || isLoadingRole" size="small"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="Producer" placement="top-end" v-if="scope.row.StatusID === 1" >
                    <el-button icon="el-icon-edit" type="primary" @click="showEditProducer(scope.row)" :loading="isLoading || isLoadingProducer" size="small"></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
            </el-pagination>
          </div>
        </el-col>
      </el-row>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New User" :visible.sync="addFormVisible" width="600px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="Institution" prop="institution">
            <SelectTree :value="addForm.institution" :props="organizationProps" :options="organizationIdOptions" :clearable="true" @getValue="getValueAdd"></SelectTree>
          </el-form-item>
          <el-form-item label="Role" prop="role">
            <el-select v-model="addForm.role" placeholder="Please Select" filterable clearable>
              <el-option v-for="item in roleIdOptions" :key="item.RoleID" :label="item.Name" :value="item.RoleID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Name" prop="Name">
            <el-input v-model.trim="addForm.Name" clearable></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="Email">
            <el-input v-model="addForm.Email" clearable></el-input>
          </el-form-item>
          <el-form-item label="Password" prop="Password">
            <el-input v-model.trim="addForm.Password" clearable type="password"></el-input>
          </el-form-item>
          <el-form-item label="Mobile" prop="Mobile">
            <el-input v-model="addForm.Mobile" clearable></el-input>
          </el-form-item>
          <el-form-item label="ProducerCode" prop="ProducerCode">
            <el-input v-model="addForm.ProducerCode" clearable></el-input>
          </el-form-item>
          <el-form-item label="ProducerLevel" prop="ProducerLevel" v-show="true">
            <el-radio-group v-model="addForm.ProducerLevel">
              <el-radio v-for="item in producerLevels" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Status" prop="StatusID" v-show="false">
            <el-radio-group v-model="addForm.StatusID">
              <el-radio v-for="item in statusOptions" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading || isLoadingOrganization || isLoadingRole">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="Edit User" :visible.sync="editFormVisible" width="600px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form">
          <el-form-item label="Id" prop="StaffID" v-show="false">
            <el-input v-model="editForm.StaffID" disabled></el-input>
          </el-form-item>
          <el-form-item label="Institution" prop="InstitutionID">
            <SelectTree :value="editForm.InstitutionID" :props="organizationProps" :options="organizationIdOptions" :clearable="true" @getValue="getValueEdit"></SelectTree>
          </el-form-item>
          <el-form-item label="Role" prop="role">
            <el-select v-model="editForm.role" placeholder="Please Select" filterable clearable>
              <el-option v-for="item in roleIdOptions" :key="item.RoleID" :label="item.Name" :value="item.RoleID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Name" prop="Name">
            <el-input v-model.trim="editForm.Name" clearable></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="Email">
            <el-input v-model="editForm.Email" clearable></el-input>
          </el-form-item>
          <el-form-item label="Mobile" prop="Mobile">
            <el-input v-model="editForm.Mobile" clearable></el-input>
          </el-form-item>
          <el-form-item label="ProducerCode" prop="ProducerCode">
            <el-input v-model="editForm.ProducerCode" clearable></el-input>
          </el-form-item>
          <el-form-item label="ProducerLevel" prop="ProducerLevel" v-show="true">
            <el-radio-group v-model="editForm.ProducerLevel">
              <el-radio v-for="item in producerLevels" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Status" prop="StatusID" v-show="false">
            <el-radio-group v-model="editForm.StatusID">
              <el-radio v-for="item in statusOptions" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading || isLoadingOrganization || isLoadingRole">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------重置密码弹窗开始------------------------------------------------->
      <el-dialog title="Password Reset" :visible.sync="passFormVisible" width="600px" center :before-close="closePass">
        <el-form :model="passForm" ref="passForm" :rules="passFormRules" class="form">
          <el-form-item label="Id" prop="StaffID" v-show="false">
            <el-input v-model="passForm.StaffID" disabled></el-input>
          </el-form-item>
          <el-form-item label="New Password" prop="Password">
            <el-input v-model.trim="passForm.Password" clearable type="password"></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="pass()" :loading="isLoading || isLoadingOrganization || isLoadingRole">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------重置密码弹窗结束------------------------------------------------->
      <!----------------------------------------------Producer弹窗开始----------------------------------------------------->
      <el-dialog title="Producer Editor" :visible.sync="producerFormVisible" width="1000px" center :before-close="closeEdit">
        <el-form :model="producerForm" ref="editForm" :rules="producerFormRules" class="form choiceQuestionForm">
          <el-form-item label="Title" prop="Title">
            <el-input v-model="producerForm.Name" clearable></el-input>
          </el-form-item>
          <div v-for="(item, index) in producerForm.producers" :key="index" class="choice">
            <el-form-item class="marginLeft10">
              <span><b>{{item.StaffID + '. ' + item.Name}}</b></span>
            </el-form-item>
            <el-form-item class="marginLeft20">
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('producerForm', index)" :loading="isLoading || isLoadingProducer" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-up" v-if="index !== 0" type="primary" @click="upChoice('producerForm', index)" :loading="isLoading || isLoadingProducer" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-down" v-if="index !== producerForm.producers.length - 1" type="primary" @click="downChoice('producerForm', index)" :loading="isLoading || isLoadingProducer" plain size="small" class="questionRightBtnGroup"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('producerForm')" :loading="isLoading || isLoadingProducer" plain size="small" class="questionRightBtnSingle">Producer</el-button>
            <el-select v-model="producerForm.ProducerID" placeholder="Producer" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
              <el-option class="questionOption" v-for="item in producerForm.selectableProducers" :key="item.StaffID" :label="item.StaffID + '. ' + item.Name" :value="item.StaffID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="editProducer()" :loading="isLoading || isLoadingProducer">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------Producer弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import SelectTree from '@/component/selectTree/selectTree'
export default {
  components: {
    SelectTree
  },
  data: function () {
    return {
      isLoading: false,
      isLoadingOrganization: false,
      isLoadingRole: false,
      organizationIdOptions: [],
      defaultProps: {
        children: 'children',
        label: 'Name'
      },
      typeList: [{key: 1, value: 'Department', icon: 'el-icon-house'}, {key: 2, value: 'Branch', icon: 'el-icon-office-building'}],
      // 新增
      addFormVisible: false,
      addForm: {
        Name: null,
        Password: null,
        institution: null,
        role: null,
        Mobile: null,
        Email: null,
        ProducerCode: null,
        ProducerLevel: 1,
        StatusID: 1
      },
      organizationProps: {
        value: 'InstitutionID',
        children: 'children',
        label: 'Name'
      },
      roleIdOptions: [],
      statusOptions: [{id: 1, name: 'Active'}, {id: 2, name: 'Inactive'}],
      producerCount: 0,
      producerList: [],
      producerLevels: [{id: 1, name: 'Level 1'}, {id: 2, name: 'Level 2'}],
      addFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 50, message: 'Within 50 Characters', trigger: 'blur' }
        ],
        Password: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 50, message: 'Within 50 Characters', trigger: 'blur' }
        ],
        institution: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        role: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        Mobile: [
          { max: 20, message: 'Within 20 Characters', trigger: 'blur' }
        ],
        Email: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'email', message: 'Format Error', trigger: 'blur' }
        ],
        ProducerCode: [
          { max: 20, message: 'Within 100 Characters', trigger: 'blur' }
        ]
      },
      // 修改
      editFormVisible: false,
      editForm: {
        StaffID: null,
        Name: null,
        InstitutionID: null,
        institution: null,
        role: null,
        Mobile: null,
        Email: null,
        ProducerCode: null,
        ProducerLevel: 1,
        StatusID: 1
      },
      editFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 50, message: 'Within 50 Characters', trigger: 'blur' }
        ],
        institution: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        role: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        Mobile: [
          { max: 20, message: 'Within 20 Characters', trigger: 'blur' }
        ],
        Email: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'email', message: 'Format Error', trigger: 'blur' }
        ],
        ProducerCode: [
          { max: 20, message: 'Within 100 Characters', trigger: 'blur' }
        ]
      },
      // 搜索
      searchForm: {
        status: 0,
        name: ''
      },
      searchStatusOptions: [{id: 0, name: 'All'}, {id: 1, name: 'Active'}, {id: 2, name: 'Inactive'}],
      searchOrganization: null,
      searchStatus: null,
      searchName: null,
      // 列表
      totalList: [],
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 重置密码
      passFormVisible: false,
      passForm: {
        StaffID: null,
        Password: null
      },
      passFormRules: {
        Password: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 20, message: 'Within 20 Characters', trigger: 'blur' }
        ]
      },
      isLoadingProducer: false,
      producerFormVisible: false,
      producerForm: {
        StaffID: null,
        Name: null,
        ProducerID: null,
        selectableProducers: [],
        producers: [],
        csrproducerlist: []
      },
      producerFormRules: {
      }
    }
  },
  mounted: function () {
    this.initOrganization()
    this.initRole()
    this.search(null, null)
    this.loadProducers(0)
  },
  methods: {
    exportExcel: function () {
      let tablename = 'users.xlsx'
      this.downloadData('users', '0', '0', tablename)
    },
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
    },
    rank: function (name) {
      this.list.sort(this.by(name))
    },
    rankdesc: function (name) {
      this.list.sort(this.bydesc(name))
    },
    // selectTree返回值
    getValueAdd (value) {
      this.addForm.institution = value
    },
    getValueEdit (value) {
      this.editForm.InstitutionID = Number(value)
    },
    // 组织列表
    initOrganization: function () {
      this.isLoadingOrganization = true
      this.axios.post('/api/Services/baseservice.asmx/GetOrganization', {}).then(res => {
        if (res) {
          console.log('查询树', res)
          this.organizationIdOptions = res.data
        }
        this.isLoadingOrganization = false
      }).catch(err => {
        console.log('查询树出错', err)
        this.isLoadingOrganization = false
      })
    },
    // 角色列表
    initRole: function () {
      this.isLoadingRole = true
      this.axios.post('/api/Services/baseservice.asmx/GetRoles', {}).then(res => {
        if (res) {
          console.log('角色', res)
          this.roleIdOptions = res.data
        }
        this.isLoadingRole = false
      }).catch(err => {
        console.log('角色出错', err)
        this.isLoadingRole = false
      })
    },
    // 树状选择当前组织
    nodeChange: function (data) {
      this.searchOrganization = data.InstitutionID
      this.addForm.institution = data.InstitutionID
      this.$refs.organizationTree.setCurrentKey(data.InstitutionID) // 设置节点高亮
      this.list = this.producerList.filter(p => p.InstitutionID === data.InstitutionID)
      // this.search(this.searchStatus, this.searchName)
      this.total = this.list.length
      this.pageCount = Math.ceil(this.total / this.pageSize)
    },
    // 查询
    search: function () {
      let query = this.searchForm.name
      let selectable = this.producerList
      if (this.searchForm.status > 0) {
        selectable = this.producerList.filter(p => p.StatusID === this.searchForm.status)
      }
      if (query === '') {
        this.list = selectable
      } else {
        this.list = selectable.filter(p => p.Name.indexOf(query) >= 0 ||
          p.StaffID === Number(query) ||
          (p.Email !== null && p.Email.indexOf(query) >= 0) ||
          (p.Mobile !== null && p.Mobile.indexOf(query) >= 0) ||
          (p.ProducerCode !== null && p.ProducerCode.indexOf(query) >= 0)
        )
      }
      this.total = this.list.length
      this.pageCount = Math.ceil(this.total / this.pageSize)
    },

    // 查询
    /*
    search: function (status, name, page) {
      this.isLoading = true
      this.searchStatus = status
      this.searchName = name
      let goPage = 1
      if (page !== undefined) {
        goPage = page
      }
      if (this.searchOrganization === null) {
        this.isLoading = false
      } else {
        this.axios.post('/api/Services/baseservice.asmx/GetStaffs_s', {institutionid: this.searchOrganization}).then(res => {
          if (res) {
            console.log('查询树', res)
            this.list = res.data
            if (this.searchName !== null) {
              this.list = this.list.filter(item => item.Name.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)
            }
            this.total = this.list.length
            this.currentPage = goPage
          }
          this.isLoading = false
        }).catch(err => {
          console.log('查询树出错', err)
          this.isLoading = false
        })
      }
    },
    */
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.searchStatus = null
      this.searchOrganization = null
      this.addForm.institution = null
      this.$refs.organizationTree.setCurrentKey(null) // 取消节点高亮
      this.search(null, null)
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
          let form = JSON.parse(JSON.stringify(this.addForm))
          form.InstitutionID = Number(form.institution)
          form.institution = {InstitutionID: form.institution}
          form.role = {RoleID: form.role}
          this.axios.post('/api/Services/baseservice.asmx/SaveStaff', {staff: JSON.stringify(form)}).then(res => {
            if (res) {
              console.log('新增', res)
              this.producerList.splice(0, 0, res.data)
              this.list.splice(0, 0, res.data)
              this.total = this.list.length
              this.pageCount = Math.ceil(this.total / this.pageSize)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addFormVisible = false
              // this.search(this.searchStatus, this.searchName, this.currentPage)
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
      this.axios.post('/api/Services/baseservice.asmx/GetStaff', {staffid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.editFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            let form = JSON.parse(JSON.stringify(res.data))
            if (form.institution !== null) {
              // form.institution = form.institution.InstitutionID
              form.InstitutionID = form.institution.InstitutionID
            }
            if (form.role !== null) {
              form.role = form.role.RoleID
            }
            this.editForm = form
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
          let form = JSON.parse(JSON.stringify(this.editForm))
          form.institution = {InstitutionID: form.InstitutionID}
          form.role = {RoleID: form.role}
          this.axios.post('/api/Services/baseservice.asmx/SaveStaff', {staff: JSON.stringify(form)}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              let index = this.producerList.findIndex(s => s.StaffID === res.data.StaffID)
              if (index < 0) this.producerList.splice(0, 0, res.data)
              else this.producerList.splice(index, 1, res.data)
              index = this.list.findIndex(s => s.StaffID === res.data.StaffID)
              if (index < 0) this.list.splice(0, 0, res.data)
              else this.list.splice(index, 1, res.data)
              this.$refs['editForm'].resetFields()
              this.editFormVisible = false
              // this.search()
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
        this.axios.post('/api/Services/baseservice.asmx/RemoveStaff', {staffid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.search(this.searchStatus, this.searchName, this.currentPage)
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
    // 重置密码弹窗
    showPass: function (id) {
      this.passFormVisible = true
      this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
        this.passForm.StaffID = id
      })
    },
    // 关闭重置密码
    closePass: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$refs['passForm'].resetFields()
        done()
      }).catch(() => {})
    },
    // 重置密码
    pass: function () {
      this.$refs['passForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.axios.post('/api/Services/baseservice.asmx/ResetPassword', {staffid: this.passForm.StaffID, password: this.passForm.Password}).then(res => {
            if (res) {
              console.log('重置密码', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['passForm'].resetFields()
              this.passFormVisible = false
            }
            this.isLoading = false
          }).catch(err => {
            console.log('重置密码出错', err)
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
    // 切换状态
    switchStatus: function (id) {
      this.$confirm('Are you sure to switch status?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/SwitchStaffStatus', {staffid: id}).then(res => {
          if (res) {
            console.log('切换', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.search(this.searchStatus, this.searchName, this.currentPage)
          }
          this.isLoading = false
        }).catch(err => {
          console.log('切换出错', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    // producer form
    loadProducers: function (start) {
      this.isLoadingProducer = true
      this.axios.post('/api/Services/baseservice.asmx/GetAllProducers', {start: start}).then(res => {
        if (res) {
          console.log('producerList', res)
          if (start === 0) {
            this.producerCount = res.count
            this.producerList = res.data
          } else {
            this.producerList = this.producerList.concat(res.data)
          }
          if (this.producerList.length >= this.producerCount) {
            this.isLoadingProducer = false
          } else {
            this.loadProducers(this.producerList.length)
          }
        }
      }).catch(err => {
        console.log('producerList', err)
        this.isLoadingProducer = false
      })
    },
    // blocks列表
    initProducer: function () {
      this.isLoadingProducer = true
      this.axios.post('/api/Services/BaseService.asmx/GetSelectableProducers', {}).then(res => {
        if (res) {
          console.log('producer列表', res)
          this.producerList = res.data.filter(p => p.StatusID === 1)
          this.producerList.sort(this.by('Name'))
        }
        this.isLoadingProducer = false
      }).catch(err => {
        console.log('producer列表出错', err)
        this.isLoadingProducer = false
      })
    },
    // 添加一行
    addChoice: function (form) {
      this.producerForm.producers.push(this.producerList.find(s => s.StaffID === this.producerForm.ProducerID))
    },
    // 删除一行
    delChoice: function (form, index) {
      this.producerForm.producers.splice(index, 1)
    },
    // 修改弹窗
    showEditProducer: function (staff) {
      this.producerForm.StaffID = staff.StaffID
      this.producerForm.Name = staff.Name
      this.producerForm.selectableProducers = this.producerList.filter(s => s.InstitutionID === staff.InstitutionID && s.StatusID === 1)
      this.isLoadingProducer = true
      this.axios.post('/api/Services/baseservice.asmx/GetCSRProducers', {csrid: this.producerForm.StaffID}).then(res => {
        if (res) {
          console.log('Producer列表', res)
          this.producerForm.producers = res.data
          this.producerForm.selectableProducers = this.producerForm.selectableProducers.filter(sp => res.data.findIndex(p => p.StaffID === sp.StaffID) < 0)
        }
        this.isLoadingProducer = false
      }).catch(err => {
        console.log('producer列表出错', err)
        this.isLoadingProducer = false
      })

      this.producerFormVisible = true
    },
    // 关闭修改
    closeEditProducer: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.producerForm.producers = []
        this.producerForm.csrproducerlist = []
        this.producerFormVisible = false
        done()
      }).catch(() => {})
    },
    // 修改
    editProducer: function () {
      this.isLoading = true
      // 按顺序添加SequenceNo
      for (let i = 0; i < this.producerForm.producers.length; i++) {
        let csrproducer = {}
        csrproducer.CSRID = this.producerForm.StaffID
        csrproducer.ProducerID = this.producerForm.producers[i].StaffID
        this.producerForm.csrproducerlist.push(csrproducer)
      }
      this.axios.post('/api/Services/BaseService.asmx/SaveCSRProducers', {csrid: this.producerForm.StaffID, list: JSON.stringify(this.producerForm.csrproducerlist)}).then(res => {
        if (res) {
          console.log('修改', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          this.producerForm.producers = []
          this.producerForm.csrproducerlist = []
          this.producerFormVisible = false
        }
        this.isLoading = false
      }).catch(err => {
        console.log('修改出错', err)
        this.isLoading = false
      })
    }

  }
}
</script>

<style scoped>

</style>
