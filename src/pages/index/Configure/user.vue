<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">User</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="24" :lg="5" :xl="5">
          <div class="organization-list" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.35)">
            <el-tree ref="organizationTree" :data="organizationIdOptions" :props="defaultProps" default-expand-all :expand-on-click-node="false" node-key="id" @current-change="nodeChange" empty-text="No Record" :highlight-current="true">
              <span slot-scope="{ node, data }" class="organization-node">
                <i class="organization-icon" :class="typeList.find(item => item.id === data.type) !== undefined ? typeList.find(item => item.id === data.type).icon : ''"></i>
                <span class="organization-label">{{ node.label }}</span>
              </span>
            </el-tree>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="19" :xl="19">
          <div class="organization-editBox" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.35)">
            <div class="searchBox">
              <el-form :model="searchForm" ref="searchForm" class="searchForm">
                <el-form-item prop="status" label="Status">
                  <el-select v-model="searchForm.status" placeholder="Status" filterable size="small" style="width: 100px;">
                    <el-option v-for="item in searchStatusOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="" prop="name">
                  <el-input v-model="searchForm.name" placeholder="Name" size="small"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button icon="el-icon-search" type="primary" @click="search(searchForm.status, searchForm.name)" :loading="isLoading" size="small">Go</el-button>
                </el-form-item>
                <el-form-item>
                  <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading" size="small">Reset</el-button>
                </el-form-item>
              </el-form>
            </div>
            <el-table :data="list" empty-text="No Record">
              <el-table-column label="User ID" prop="id" width="100"></el-table-column>
              <el-table-column label="Name" prop="name"></el-table-column>
              <el-table-column label="Organization" prop="organizationName"></el-table-column>
              <el-table-column label="Role" prop="roleName"></el-table-column>
              <el-table-column label="Mobile" prop="mobile"></el-table-column>
              <el-table-column label="Email" prop="email"></el-table-column>
              <el-table-column label="Status" width="100">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.status === 1" size="medium">Normal</el-tag>
                  <el-tag v-else type="danger" size="medium">Inactive</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Action" width="200" fixed="right">
                <template slot-scope="scope">
                  <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row.id)" :loading="isLoading" size="small"></el-button>
                  <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.id)" :loading="isLoading" size="small"></el-button>
                  <el-button icon="el-icon-key" type="primary" @click="showPass(scope.row.id)" :loading="isLoading" size="small"></el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New User" :visible.sync="addFormVisible" width="600px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="User Name" prop="name">
            <el-input v-model.trim="addForm.name" clearable></el-input>
          </el-form-item>
          <el-form-item label="Password" prop="password">
            <el-input v-model.trim="addForm.password" clearable></el-input>
          </el-form-item>
          <el-form-item label="Belong To" prop="organizationId">
            <SelectTree :value="addForm.organizationId" :props="organizationProps" :options="organizationIdOptions" :clearable="true" @getValue="getValueAdd"></SelectTree>
          </el-form-item>
          <el-form-item label="Role" prop="roleId">
            <el-select v-model="addForm.roleId" placeholder="Please Select" filterable clearable>
              <el-option v-for="item in roleIdOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Mobile" prop="mobile">
            <el-input v-model="addForm.mobile" clearable></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="email">
            <el-input v-model="addForm.email" clearable></el-input>
          </el-form-item>
          <el-form-item label="Status" prop="status">
            <el-radio-group v-model="addForm.status">
              <el-radio v-for="item in statusOptions" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="Edit User" :visible.sync="editFormVisible" width="600px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form">
          <el-form-item label="Id" prop="id" v-show="false">
            <el-input v-model="editForm.id" disabled></el-input>
          </el-form-item>
          <el-form-item label="User Name" prop="name">
            <el-input v-model.trim="editForm.name" clearable></el-input>
          </el-form-item>
          <el-form-item label="Belong To" prop="organizationId">
            <SelectTree :value="editForm.organizationId" :props="organizationProps" :options="organizationIdOptions" :clearable="true" @getValue="getValueEdit"></SelectTree>
          </el-form-item>
          <el-form-item label="Role" prop="roleId">
            <el-select v-model="editForm.roleId" placeholder="Please Select" filterable clearable>
              <el-option v-for="item in roleIdOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Mobile" prop="mobile">
            <el-input v-model="editForm.mobile" clearable></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="email">
            <el-input v-model="editForm.email" clearable></el-input>
          </el-form-item>
          <el-form-item label="Status" prop="status">
            <el-radio-group v-model="editForm.status">
              <el-radio v-for="item in statusOptions" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------重置密码弹窗开始------------------------------------------------->
      <el-dialog title="Password Reset" :visible.sync="passFormVisible" width="600px" center :before-close="closePass">
        <el-form :model="passForm" ref="passForm" :rules="passFormRules" class="form">
          <el-form-item label="Id" prop="id" v-show="false">
            <el-input v-model="passForm.id" disabled></el-input>
          </el-form-item>
          <el-form-item label="New Password" prop="password">
            <el-input v-model.trim="passForm.password" clearable type="password"></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="pass()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------重置密码弹窗结束------------------------------------------------->
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
        label: 'label'
      },
      typeList: [{id: 1, name: 'Company / Branch', icon: 'el-icon-office-building'}, {id: 2, name: 'Department', icon: 'el-icon-house'}],
      // 新增
      addFormVisible: false,
      addForm: {
        name: null,
        password: null,
        organizationId: null,
        roleId: null,
        mobile: null,
        email: null,
        status: 1
      },
      organizationProps: {
        value: 'id',
        label: 'label',
        children: 'children'
      },
      roleIdOptions: [],
      statusOptions: [{id: 1, name: 'Normal'}, {id: 2, name: 'Inactive'}],
      addFormRules: {
        name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 50, message: 'Within 50 Characters', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 50, message: 'Within 50 Characters', trigger: 'blur' }
        ],
        organizationId: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        roleId: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 20, message: 'Within 20 Characters', trigger: 'blur' }
        ],
        email: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'email', message: 'Format Error', trigger: 'blur' }
        ]
      },
      // 修改
      editFormVisible: false,
      editForm: {
        id: null,
        name: null,
        organizationId: null,
        roleId: null,
        mobile: null,
        email: null,
        status: 1
      },
      editFormRules: {
        name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 50, message: 'Within 50 Characters', trigger: 'blur' }
        ],
        organizationId: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        roleId: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 20, message: 'Within 20 Characters', trigger: 'blur' }
        ],
        email: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'email', message: 'Format Error', trigger: 'blur' }
        ]
      },
      // 搜索
      searchForm: {
        status: 0,
        name: null
      },
      searchStatusOptions: [{id: 0, name: 'All'}, {id: 1, name: 'Normal'}, {id: 2, name: 'Inactive'}],
      searchOrganization: null,
      searchStatus: null,
      searchName: null,
      // 列表
      list: [],
      pageSize: 10,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 重置密码
      passFormVisible: false,
      passForm: {
        id: null,
        password: null
      },
      passFormRules: {
        password: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 20, message: 'Within 20 Characters', trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function () {
    this.initOrganization()
    this.initRole()
    this.search(null, null)
  },
  methods: {
    // selectTree返回值
    getValueAdd (value) {
      this.addForm.organizationId = value
    },
    getValueEdit (value) {
      this.editForm.organizationId = value
    },
    // 组织列表
    initOrganization: function () {
      // this.isLoadingOrganization = true
      // this.axios.post('/api/', {}).then(res => {
      //   console.log('组织列表', res)
      //   this.organizationIdOptions = res.data.data
      //   this.isLoadingOrganization = false
      // }).catch(err => {
      //   console.log('组织列表出错', err)
      //   this.isLoadingOrganization = false
      // })
      this.organizationIdOptions = [{id: 1, label: 'a', type: 1, children: [{id: 11, label: 'aa', type: 1, children: [{id: 111, label: 'aaa', type: 1}, {id: 112, label: 'aab', type: 2}]}, {id: 12, label: 'ab', type: 2}]}, {id: 2, label: 'b', type: 1}, {id: 3, label: 'c', type: 1}, {id: 4, label: 'd', type: 1}, {id: 5, label: 'e', type: 1}, {id: 6, label: 'f', type: 1}, {id: 7, label: 'g', type: 1}, {id: 8, label: 'h', type: 1}, {id: 9, label: 'i', type: 1}, {id: 10, label: 'j', type: 1}]
    },
    // 角色列表
    initRole: function () {
      // this.isLoadingRole = true
      // this.axios.post('/api/', {}).then(res => {
      //   console.log('组织列表', res)
      //   this.roleIdOptions = res.data.data
      //   this.isLoadingRole = false
      // }).catch(err => {
      //   console.log('组织列表出错', err)
      //   this.isLoadingRole = false
      // })
      this.roleIdOptions = [{id: 1, name: 'admin'}, {id: 2, name: 'manager'}, {id: 3, name: 'visitor'}, {id: 4, name: 'worker'}]
    },
    // 树状选择当前组织
    nodeChange: function (data) {
      this.searchOrganization = data.id
      this.addForm.organizationId = data.id
      this.$refs.organizationTree.setCurrentKey(data.id) // 设置节点高亮
    },
    // 查询
    search: function (status, name) {
      // todo: 查询接口，organization, status, name
      this.searchStatus = status
      this.searchName = name
      // this.isLoading = true
      // this.axios.post('/api/Services/baseservice.asmx/GetStaffs', {institutionid: 1}).then(res => {
      //   console.log('查询', res)
      //   if (res) {
      //     this.list = res.data.data.list
      //     this.total = res.data.data.total
      //     this.currentPage = res.data.data.pageNum
      //   }
      //   this.isLoading = false
      // }).catch(err => {
      //   console.log('查询出错', err)
      //   this.isLoading = false
      // })
      this.list = [
        {id: 1, name: 'Brendan', organizationId: 1, organizationName: 'a', roleId: 1, roleName: 'admin', mobile: '416-88888', email: '13664342612@qq.com', status: 1},
        {id: 2, name: 'Ruby', organizationId: 11, organizationName: 'aa', roleId: 2, roleName: 'manager', mobile: '416-77777', email: '13611111111@qq.com', status: 1},
        {id: 3, name: 'Fiona', organizationId: 12, organizationName: 'ab', roleId: 3, roleName: 'visitor', mobile: '416-66666', email: '13622222222@qq.com', status: 2},
        {id: 4, name: 'Paul', organizationId: 112, organizationName: 'aab', roleId: 3, roleName: 'visitor', mobile: '416-55555', email: '13633333333@qq.com', status: 2},
        {id: 5, name: 'Lee', organizationId: 5, organizationName: 'e', roleId: 2, roleName: 'manager', mobile: '416-33333', email: '13666666666@qq.com', status: 1}
      ]
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.searchStatus = null
      this.searchOrganization = null
      this.addForm.organizationId = null
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
          this.axios.post('/api/', this.addForm).then(res => { // todo: 新增接口
            console.log('新增', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.$refs['addForm'].resetFields()
            this.addFormVisible = false
            this.search(this.searchStatus, this.searchName)
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
        this.editForm = {id: 1, name: 'Jerry', organizationId: 112, roleId: 3, mobile: '14444657871', email: '1@a.com', status: 2}
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
          this.axios.post('/api/', this.editForm).then(res => { // todo: 修改接口
            console.log('修改', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.$refs['editForm'].resetFields()
            this.editFormVisible = false
            this.search(this.searchStatus, this.searchName)
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
          this.search(this.searchStatus, this.searchName)
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
        this.passForm.id = id
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
          this.axios.post('/api/', this.passForm).then(res => { // todo: 修改接口
            console.log('重置密码', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.$refs['passForm'].resetFields()
            this.passFormVisible = false
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
    }
  }
}
</script>

<style scoped>

</style>
