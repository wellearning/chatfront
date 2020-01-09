<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Organization</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading || isLoadingList">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
          <div class="organization-list" v-loading="isLoading || isLoadingList" element-loading-background="rgba(255, 255, 255, 0.5)">
            <el-tree ref="organizationTree" :data="list" :props="defaultProps" default-expand-all :expand-on-click-node="false" node-key="id" @current-change="nodeChange" empty-text="No Record" :highlight-current="true">
              <span slot-scope="{ node, data }" class="organization-node">
                <i class="organization-icon" :class="typeList.find(item => item.id === data.type) !== undefined ? typeList.find(item => item.id === data.type).icon : ''"></i>
                <span class="organization-label">{{ node.label }}</span>
              </span>
            </el-tree>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="14" :xl="14">
          <div class="organization-editBox">
            <div class="organization-editTitle">
              <span class="title">Information</span>
              <div class="rightBtnBox" v-if="isAdd">
                <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading || isLoadingList" size="small">Confirm</el-button>
                <el-button icon="el-icon-close" type="primary" @click="cancel()" :loading="isLoading || isLoadingList" size="small" plain>Cancel</el-button>
              </div>
              <div class="rightBtnBox" v-if="isEdit">
                <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading || isLoadingList" size="small">Confirm</el-button>
                <el-button icon="el-icon-delete" type="danger" @click="del()" :loading="isLoading || isLoadingList" size="small">Delete</el-button>
                <el-button icon="el-icon-close" type="primary" @click="cancel()" :loading="isLoading || isLoadingList" size="small" plain>Cancel</el-button>
              </div>
            </div>
            <div class="organization-editContent" v-loading="isLoading || isLoadingList" element-loading-background="rgba(255, 255, 255, 0.5)">
              <el-form class="form" ref="form" :model="form" :rules="formRules">
                <el-form-item label="Id" prop="id" v-show="false">
                  <el-input v-model="form.id" disabled></el-input>
                </el-form-item>
                <el-form-item label="ParentId" prop="parentId" v-show="false">
                  <el-input v-model="form.parentId" disabled></el-input>
                </el-form-item>
                <el-form-item label="Parent" prop="parent">
                  <el-input v-model="form.parent" disabled></el-input>
                </el-form-item>
                <el-form-item label="Type" prop="type">
                  <el-radio-group v-model="form.type">
                    <el-radio v-for="item in typeList" :label="item.id" :key="item.id">
                      <i :class="item.icon"></i>
                      <span>{{item.name}}</span>
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="Name" prop="name">
                  <el-input v-model="form.name"></el-input>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      isLoading: false,
      isLoadingList: false,
      list: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      isAdd: false,
      isEdit: false,
      currentNode: null,
      currentNodeName: null,
      typeList: [{id: 1, name: 'Company / Branch', icon: 'el-icon-office-building'}, {id: 2, name: 'Department', icon: 'el-icon-house'}],
      form: {
        id: null,
        parentId: null,
        parent: null,
        type: 1,
        name: null
      },
      formRules: {
        name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 100, message: 'Within 100 Characters', trigger: 'blur' }
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
      // this.isLoadingList = true
      // this.axios.post('/api/', {}).then(res => {
      //   console.log('查询', res)
      //   this.list = res.data.data
      //   this.isLoadingList = false
      // }).catch(err => {
      //   console.log('查询出错', err)
      //   this.isLoadingList = false
      // })
      this.list = [{id: 1, label: 'a', type: 1, children: [{id: 11, label: 'aa', type: 1, children: [{id: 111, label: 'aaa', type: 1}, {id: 112, label: 'aab', type: 2}]}, {id: 12, label: 'ab', type: 2}]}, {id: 2, label: 'b', type: 1}, {id: 3, label: 'c', type: 1}, {id: 4, label: 'd', type: 1}, {id: 5, label: 'e', type: 1}, {id: 6, label: 'f', type: 1}, {id: 7, label: 'g', type: 1}, {id: 8, label: 'h', type: 1}, {id: 9, label: 'i', type: 1}, {id: 10, label: 'j', type: 1}]
    },
    // 选择某个company或department
    nodeChange: function (data) {
      this.resetForm()
      this.$refs.organizationTree.setCurrentKey(data.id) // 设置节点高亮
      this.currentNode = data.id
      this.currentNodeName = data.label
      this.isAdd = false
      this.isEdit = true
      // todo: 通过id获取单个信息接口
      // this.isLoading = true
      // this.axios.get('/api/?id=' + data.id).then(res => {
      //   console.log('获取单个信息', res)
      //   this.form = res.data.data
      //   this.isLoading = false
      // }).catch(err => {
      //   console.log('获取单个信息出错', err)
      //   this.isLoading = false
      // })
      this.form.parentId = 11
      this.form.parent = 'aa'
      this.form.type = 2
      this.form.name = 'aab'
    },
    // 显示新增
    showAdd: function () {
      this.$refs['form'].resetFields()
      this.isAdd = true
      this.isEdit = false
      if (this.currentNode !== null) {
        this.form.parentId = this.currentNode
        this.form.parent = this.currentNodeName
      }
    },
    // 新增
    add: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          let data = {parentId: this.form.parentId, type: this.form.type, name: this.form.name}
          this.axios.post('/api/', data).then(res => { // todo: 新增接口
            console.log('新增', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.resetForm()
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
    },
    // 取消
    cancel: function () {
      this.resetForm()
    },
    // 修改
    edit: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          let data = {id: this.form.id, parentId: this.form.parentId, type: this.form.type, name: this.form.name}
          this.axios.post('/api/', data).then(res => { // todo: 修改接口
            console.log('修改', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.resetForm()
            this.search()
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
    del: function () {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/?id=' + this.currentNode).then(res => { // todo: 删除接口
          console.log('删除', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          this.resetForm()
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
    // 重置表单
    resetForm: function () {
      this.currentNode = null
      this.currentNodeName = null
      this.$refs['form'].resetFields()
      this.isAdd = false
      this.isEdit = false
      this.$refs.organizationTree.setCurrentKey(null) // 取消节点高亮
    }
  }
}
</script>

<style scoped>

</style>
