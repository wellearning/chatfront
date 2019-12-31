<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Role</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <el-table :data="list" empty-text="No Record">
        <el-table-column label="Role ID" prop="id" width="100"></el-table-column>
        <el-table-column label="Role Name">
          <template slot-scope="scope">
            <el-input v-model="scope.row.name" :disabled="!(scope.row.id === currentId)"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button v-if="currentId === null && !(scope.row.id === currentId)" icon="el-icon-document" type="primary" @click="showPrivilege(scope.row.id)" :loading="isLoading" size="small">Privileges</el-button>
            <el-button v-if="currentId === null && !(scope.row.id === currentId)" icon="el-icon-edit" type="primary" @click="showEdit(scope.row.id)" :loading="isLoading" size="small">Edit</el-button>
            <el-button v-if="currentId === null && !(scope.row.id === currentId)" icon="el-icon-delete" type="danger" @click="del(scope.row.id)" :loading="isLoading" size="small">Delete</el-button>
            <el-button v-if="scope.row.id === currentId" icon="el-icon-check" type="primary" @click="edit(scope.row)" :loading="isLoading" size="small">Confirm</el-button>
            <el-button v-if="scope.row.id === currentId" icon="el-icon-close" type="primary" @click="cancel()" :loading="isLoading" plain size="small">Cancel</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Role" :visible.sync="addFormVisible" width="600px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="Role Name" prop="name">
            <el-input v-model="addForm.name" clearable></el-input>
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
      list: [],
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
        name: null
      },
      addFormRules: {
        name: [
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
      // todo: 查询接口
      // this.isLoading = true
      // this.axios.post('/api/', {}).then(res => {
      //   console.log('查询', res)
      //   this.list = res.data.data
      //   this.isLoading = false
      // }).catch(err => {
      //   console.log('查询出错', err)
      //   this.isLoading = false
      // })
      this.list = [{id: 1, name: 'admin'}, {id: 2, name: 'manager'}, {id: 3, name: 'visitor'}, {id: 4, name: 'worker'}]
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
    showEdit: function (id) {
      this.currentId = id
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
          this.search()
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
      if (!new RegExp(rule).test(obj.name)) {
        this.$message({
          type: 'error',
          message: 'Format Error'
        })
      } else {
        this.isLoading = true
        this.axios.post('/api/', {id: obj.id, name: obj.name}).then(res => { // todo: 修改接口
          console.log('修改', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          this.currentId = null
          this.search()
          this.isLoading = false
        }).catch(err => {
          console.log('修改出错', err)
          this.isLoading = false
        })
      }
    },
    // 取消修改
    cancel: function () {
      this.currentId = null
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
            this.search()
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
