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
            <el-tree ref="organizationTree" :data="list" :props="defaultProps" default-expand-all :expand-on-click-node="false" node-key="InstitutionID" @current-change="nodeChange" empty-text="No Record" :highlight-current="true">
              <span slot-scope="{ node, data }" class="organization-node">
                <i class="organization-icon" :class="typeList.find(item => item.key === data.TypeID) !== undefined ? typeList.find(item => item.key === data.TypeID).icon : ''"></i>
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
                <el-form-item label="Parent" prop="Parent">
                  <el-input v-model="form.Parent" disabled></el-input>
                </el-form-item>
                <el-form-item label="Type" prop="TypeID">
                  <el-radio-group v-model="form.TypeID">
                    <el-radio v-for="item in typeList" :label="item.key" :key="item.key">
                      <i :class="item.icon"></i>
                      <span>{{item.value}}</span>
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="Name" prop="Name">
                  <el-input v-model="form.Name"></el-input>
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
      listForParent: [],
      defaultProps: {
        children: 'children',
        label: 'Name'
      },
      isAdd: false,
      isEdit: false,
      currentNode: null,
      currentNodeName: null,
      typeList: [{key: 1, value: 'Department', icon: 'el-icon-house'}, {key: 2, value: 'Branch', icon: 'el-icon-office-building'}],
      form: {
        InstitutionID: null,
        ParentID: 0,
        Parent: null,
        TypeID: 1,
        Name: null
      },
      formRules: {
        Name: [
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
      this.isLoadingList = true
      this.axios.post('/api/Services/baseservice.asmx/GetOrganization', {}).then(res => {
        if (res) {
          console.log('查询树', res)
          this.list = res.data
        }
        this.isLoadingList = false
      }).catch(err => {
        console.log('查询树出错', err)
        this.isLoadingList = false
      })
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetInstitutions', {}).then(res => {
        if (res) {
          console.log('查询列表', res)
          this.listForParent = res.data
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询列表出错', err)
        this.isLoading = false
      })
    },
    // 选择某个company或department
    nodeChange: function (data) {
      this.resetForm()
      this.$refs.organizationTree.setCurrentKey(data.InstitutionID) // 设置节点高亮
      this.currentNode = data.InstitutionID
      this.currentNodeName = data.Name
      this.isAdd = false
      this.isEdit = true
      this.form.InstitutionID = data.InstitutionID
      this.form.ParentID = data.ParentID
      if (data.ParentID !== 0) {
        this.form.Parent = this.listForParent.find(item => item.InstitutionID === data.ParentID).Name
      } else {
        this.form.Parent = null
      }
      this.form.TypeID = data.TypeID
      this.form.Name = data.Name
    },
    // 显示新增
    showAdd: function () {
      this.$refs['form'].resetFields()
      this.isAdd = true
      this.isEdit = false
      if (this.currentNode !== null) {
        this.form.ParentID = this.currentNode
        this.form.Parent = this.currentNodeName
      }
    },
    // 新增
    add: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          let data = {ParentID: this.form.ParentID, TypeID: this.form.TypeID, Name: this.form.Name, StatusID: 1}
          this.axios.post('/api/Services/baseservice.asmx/SaveInstitution', {inst: JSON.stringify(data)}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.resetForm()
              this.search()
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
    // 取消
    cancel: function () {
      this.resetForm()
    },
    // 修改
    edit: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          let data = {InstitutionID: this.form.InstitutionID, ParentID: this.form.ParentID, TypeID: this.form.TypeID, Name: this.form.Name, StatusID: 1, IsNew: false, IsNewAdded: false, IsRemoved: false}
          this.axios.post('/api/Services/baseservice.asmx/SaveInstitution', {inst: JSON.stringify(data)}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.resetForm()
              this.search()
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
    del: function () {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/RemoveInstitution' + {institutionid: this.currentNode}).then(res => { // todo: 删除接口
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.resetForm()
            this.search()
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
