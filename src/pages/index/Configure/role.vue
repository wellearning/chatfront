<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Role</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Role ID" prop="RoleID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Role Name" min-width="300">
          <template slot-scope="scope">
            <el-input v-model="scope.row.Name" :disabled="!(scope.row.RoleID === currentId)"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template slot-scope="scope">
            <!--<el-button v-if="currentId === null && !(scope.row.RoleID === currentId)" icon="el-icon-document" type="primary" @click="showPrivilege(scope.row.RoleID)" :loading="isLoading" size="small">Privileges</el-button>-->
            <el-button v-if="currentId === null && !(scope.row.RoleID === currentId)" icon="el-icon-edit" type="primary" @click="showEdit(scope.row.RoleID, scope.row.Name)" :loading="isLoading" size="small">Edit</el-button>
            <el-button v-if="currentId === null && !(scope.row.RoleID === currentId)" icon="el-icon-delete" type="danger" @click="del(scope.row.RoleID)" :loading="isLoading" size="small">Delete</el-button>
            <el-button v-if="scope.row.RoleID === currentId" icon="el-icon-check" type="primary" @click="edit(scope.row)" :loading="isLoading" size="small">Confirm</el-button>
            <el-button v-if="scope.row.RoleID === currentId" icon="el-icon-close" type="primary" @click="cancel(scope.row.RoleID)" :loading="isLoading" plain size="small">Cancel</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Role" :visible.sync="addFormVisible" width="600px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="Role Name" prop="name">
            <el-input v-model="addForm.Name" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------权限弹窗开始----------------------------------------------------->
      <el-dialog title="Privileges" :visible.sync="privilegesVisible" width="600px" center :before-close="closePrivileges">
        <el-form class="form">
          <el-form-item class="confirmBtn">
            <el-tree :data="menuList" :props="defaultProps" default-expand-all :expand-on-click-node="false" show-checkbox node-key="id" empty-text="No Record" ref="tree">
              <span slot-scope="{ node, data }">
                <span>{{ node.label }}</span>
              </span>
            </el-tree>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="privileges()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------权限弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      isLoading: false,
      currentId: null,
      currentDescription: null,
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 权限
      privilegesVisible: false,
      currentPrivileges: null,
      menuList: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      // 新增
      addFormVisible: false,
      addForm: {
        Name: null
      },
      addFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 30, message: 'Within 30 Characters', trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function () {
    this.search()
  },
  methods: {
    // 查询
    search: function () {
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetRoles', {}).then(res => {
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
    // 显示权限弹窗
    showPrivilege: function (id) {
      // this.isLoading = true
      // this.axios.get('/api/get?id=' + id).then(res => { // todo: 根据id显示权限接口
      //   console.log('查询单个权限', res)
      //   this.privilegesVisible = true
      //   this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
      //     this.currentPrivileges = id
      //     this.menuList = res.data.data
      //   })
      //   this.isLoading = false
      // }).catch(err => {
      //   console.log('查询单个权限出错', err)
      //   this.isLoading = false
      // })
      this.privilegesVisible = true
      this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
        this.currentPrivileges = id
        this.menuList = (JSON.parse(this.$store.getters.getPermissionList))[0].children
        this.$refs.tree.setCheckedKeys([11, 121, 122, 123])
      })
    },
    // 隐藏权限弹窗
    closePrivileges: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.currentPrivileges = null
        this.menuList = []
        done()
      }).catch(() => {})
    },
    // 提交权限
    privileges: function () {
      this.isLoading = true
      this.axios.post('/api/', {id: this.currentPrivileges, list: [...this.$refs.tree.getHalfCheckedKeys(), ...this.$refs.tree.getCheckedKeys()]}).then(res => { // todo: 提交权限接口，半选和全选全部传递
        console.log('提交权限', res)
        this.$message({
          type: 'success',
          message: 'Operation Succeeded'
        })
        this.currentPrivileges = null
        this.menuList = []
        this.privilegesVisible = false
        this.isLoading = false
      }).catch(err => {
        console.log('提交权限出错', err)
        this.isLoading = false
      })
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
        this.axios.post('/api/Services/baseservice.asmx/RemoveRole', {roleid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.RoleID !== id)
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
      let rule = '^.{1,30}$'
      if (!new RegExp(rule).test(obj.Name)) {
        this.$message({
          type: 'error',
          message: 'Format Error'
        })
      } else {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/SaveRole', {role: JSON.stringify(obj)}).then(res => {
          if (res) {
            console.log('修改', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.currentId = null
            this.currentDescription = null
            this.list = this.list.map(item => {
              return item.RoleID === res.data.RoleID ? res.data : item
            })
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
      this.list.find(item => item.RoleID === id).Name = this.currentDescription
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
          this.axios.post('/api/Services/baseservice.asmx/SaveRole', {role: JSON.stringify(this.addForm)}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addFormVisible = false
              this.list.push(res.data)
              this.total = this.list.length
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
