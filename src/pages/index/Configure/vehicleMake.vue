<!--
FileName: Configure/vehicleMake.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all vehicle make list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Vehicle Make</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading || isLoadingTree">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="ItemID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Vehicle Make" min-width="300">
          <template v-slot:="scope">
            <el-input v-model="scope.row.Name" :disabled="!(scope.row.DataItemID === currentId)"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template v-slot:="scope">
            <el-button v-if="currentId === null && !(scope.row.DataItemID === currentId)" icon="el-icon-edit" type="primary" @click="showEdit(scope.row.DataItemID, scope.row.Name)" :loading="isLoading || isLoadingTree" size="small">Edit</el-button>
            <el-button v-if="currentId === null && !(scope.row.DataItemID === currentId)" icon="el-icon-delete" type="danger" @click="del(scope.row.DataItemID)" :loading="isLoading || isLoadingTree" size="small">Delete</el-button>
            <el-button v-if="scope.row.DataItemID === currentId" icon="el-icon-check" type="primary" @click="edit(scope.row)" :loading="isLoading || isLoadingTree" size="small">Confirm</el-button>
            <el-button v-if="scope.row.DataItemID === currentId" icon="el-icon-close" type="primary" @click="cancel(scope.row.DataItemID)" :loading="isLoading || isLoadingTree" plain size="small">Cancel</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Item" :visible.sync="addFormVisible" width="600px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="vehicle Make" prop="name">
            <el-input v-model="addForm.Name" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading || isLoadingTree">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      isLoading: false,
      isLoadingTree: false,
      currentId: null,
      currentDescription: null,
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
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
      this.axios.post('/api/Services/BaseService.asmx/GetDictionary', {datatype: 'Vehicle Make'}).then(res => {
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
        this.axios.post('/api/Services/BaseService.asmx/RemoveDataItem', {dataitemid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.DataItemID !== id)
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
        this.axios.post('/api/Services/baseservice.asmx/SaveDataItem', {dataitem: JSON.stringify(obj)}).then(res => {
          if (res) {
            console.log('修改', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.currentId = null
            this.currentDescription = null
            this.list = this.list.map(item => {
              return item.ItemID === res.data.ItemID ? res.data : item
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
      this.list.find(item => item.DataItemID === id).Name = this.currentDescription
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
          let name = this.addForm.Name
          this.axios.post('/api/Services/BaseService.asmx/AddDataItem', {datatype: 'Vehicle Make', name: name, value: name, parentid: 0}).then(res => {
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
