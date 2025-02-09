<!--
FileName: Configure/organization.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all organization list and do all operations on the list.
-->
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
                <el-button v-if="currentInstitution.TypeID === 3" icon="el-icon-plus" type="primary" @click="showStaffForm()" :loading="isLoading || isLoadingList" size="small">Add Member</el-button>
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
                <el-form-item label="Memo ProcessingType" prop="MemoProcessingType">
                  <el-radio-group v-model="form.MemoProcessingType">
                    <el-radio v-for="item in processingTypeList" :label="item.key" :key="item.key">
                      <span>{{item.value}}</span>
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="Coverletter ProcessingType" prop="CoverletterProcessingType">
                  <el-radio-group v-model="form.CoverletterProcessingType">
                    <el-radio v-for="item in processingTypeList" :label="item.key" :key="item.key">
                      <span>{{item.value}}</span>
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="Application ProcessingType" prop="ApplicationProcessingType">
                  <el-radio-group v-model="form.ApplicationProcessingType">
                    <el-radio v-for="item in processingTypeList" :label="item.key" :key="item.key">
                      <span>{{item.value}}</span>
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="Name" prop="Name">
                  <el-input v-model="form.Name"></el-input>
                </el-form-item>
                <el-form-item label="BranchCode" prop="BranchCode">
                  <el-input v-model="form.BranchCode"></el-input>
                </el-form-item>
                <el-form-item label="Telphone" prop="Telphone">
                  <el-input v-model="form.Telphone"></el-input>
                </el-form-item>
                <el-form-item label="Address" prop="Address">
                  <el-input v-model="form.Address"></el-input>
                </el-form-item>
                <el-form-item label="PostCode" prop="PostCode">
                  <el-input v-model="form.PostCode"></el-input>
                </el-form-item>
                <el-form-item label="Email" prop="PostCode">
                  <el-input v-model="form.Email"></el-input>
                </el-form-item>
                <el-form-item label="Website" prop="PostCode">
                  <el-input v-model="form.Website"></el-input>
                </el-form-item>
                <!--el-upload
                  class="upload-demo"
                  ref="upload"
                  action="https://jsonplaceholder.typicode.com/posts/"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :file-list="fileList"
                  :auto-upload="false">
                  <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                  <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
                  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                </el-upload-->
              </el-form>
            </div>
          </div>
        </el-col>
      </el-row>
      <!----------------------------------------------add staffs 弹窗开始----------------------------------------------------->
      <el-dialog title="Select Staff" :visible.sync="staffFormVisible" width="600px" center :before-close="closeStaff">
        <el-form :model="staffForm" ref="staffForm" class="form">
          <el-form-item class="marginLeft10">
            <el-checkbox-group v-model="staffForm.checkedChildren" >
              <el-checkbox v-for="staff in selectedChildren" :label="staff.Name" :key="staff.StaffID"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item class="marginLeft10">
            <el-select v-model="staffForm.selectedIDs" filterable multiple placeholder="Please Select">
              <el-option
                v-for="item in children"
                :key="item.StaffID"
                :label="item.Name"
                :value="item.StaffID">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" plain size="small" @click="selectStaff()" :loading="isLoading">Select</el-button>
            <el-button icon="el-icon-minus" type="primary" plain size="small" @click="removeStaff()" :loading="isLoading">Remove</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------add staffs 窗结束----------------------------------------------------->
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
      fileList: [
        {name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'},
        {name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}
      ],
      defaultProps: {
        children: 'children',
        label: 'Name'
      },
      isAdd: false,
      isEdit: false,
      currentInstitution: null,
      currentNode: null,
      currentNodeName: null,
      typeList: [
        {key: 1, value: 'Department', icon: 'el-icon-house'},
        {key: 2, value: 'Branch', icon: 'el-icon-office-building'},
        {key: 3, value: 'Group', icon: 'el-icon-watch'}
      ],
      processingTypeList: [{key: 1, value: 'Centralized'}, {key: 2, value: 'Independent'}],
      form: {
        InstitutionID: null,
        ParentID: 0,
        Parent: null,
        TypeID: 1,
        BusinessProcessingTypeID: 1,
        MemoProcessingType: 1,
        CoverletterProcessingType: 1,
        ApplicationProcessingType: 1,
        Name: null,
        BranchCode: null,
        Telphone: null,
        Address: null,
        PostCode: null,
        Email: null,
        Website: null
      },
      formRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 100, message: 'Within 100 Characters', trigger: 'blur' }
        ],
        BranchCode: [
          { max: 100, message: 'Within 100 Characters', trigger: 'blur' }
        ],
        Telphone: [
          { max: 100, message: 'Within 100 Characters', trigger: 'blur' }
        ],
        Address: [
          { max: 100, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        PostCode: [
          { max: 100, message: 'Within 100 Characters', trigger: 'blur' }
        ],
        Email: [
          { max: 100, message: 'Within 100 Characters', trigger: 'blur' }
        ],
        Website: [
          { max: 100, message: 'Within 100 Characters', trigger: 'blur' }
        ]
      },
      staffFormVisible: false,
      isLoadingStaffs: false,
      staffList: [],
      staffCount: 0,
      staffForm: {
        selectedIDs: [],
        checkedChildren: []
      },
      selectedChildren: [],
      children: []
    }
  },
  mounted: function () {
    this.loadStaffs(0)
    this.search()
  },
  methods: {
    submitUpload () {
      this.$refs.upload.submit()
    },
    handleRemove (file, fileList) {
      console.log(file, fileList)
    },
    handlePreview (file) {
      console.log(file)
    },
    loadStaffs: function (start) {
      this.isLoadingStaffs = true
      this.axios.post('/api/Services/baseservice.asmx/GetNormalStaffs', {start: start}).then(res => {
        if (res) {
          console.log('staffList', res)
          // this.staffList = res.data
          if (start === 0) {
            this.staffCount = res.count
            this.staffList = res.data
          } else {
            let list = this.staffList.concat(res.data)
            this.staffList = list
          }
          if (this.staffList.length >= this.staffCount) {
            this.isLoadingStaffs = false
          } else {
            this.loadStaffs(this.staffList.length)
          }
        }
      }).catch(err => {
        console.log('staffList', err)
        this.isLoadingStaffs = false
      })
    },
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
      this.currentInstitution = data
      this.currentNodeName = data.Name
      this.isAdd = false
      this.isEdit = true
      this.form.IsNew = data.IsNew
      this.form.StatusID = data.StatusID
      this.form.InstitutionID = data.InstitutionID
      this.form.ParentID = data.ParentID
      if (data.ParentID !== 0) {
        this.form.Parent = this.listForParent.find(item => item.InstitutionID === data.ParentID).Name
      } else {
        this.form.Parent = null
      }
      this.form.TypeID = data.TypeID
      this.form.BusinessProcessingTypeID = data.BusinessProcessingTypeID
      this.form.MemoProcessingType = data.MemoProcessingType
      this.form.CoverletterProcessingType = data.CoverletterProcessingType
      this.form.ApplicationProcessingType = data.ApplicationProcessingType
      this.form.Name = data.Name
      this.form.BranchCode = data.BranchCode
      this.form.Telphone = data.Telphone
      this.form.Address = data.Address
      this.form.PostCode = data.PostCode
      this.form.Email = data.Email
      this.form.Website = data.Website
    },
    // 显示新增
    showAdd: function () {
      this.$refs['form'].resetFields()
      this.form.IsNew = true
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
          let data = JSON.stringify(this.form)
          // let data = {ParentID: this.form.ParentID, TypeID: this.form.TypeID, BusinessProcessingTypeID: this.form.BusinessProcessingTypeID, Name: this.form.Name, StatusID: 1, BranchCode: this.form.BranchCode, Telphone: this.form.Telphone, Address: this.form.Address, PostCode: this.form.PostCode, Email: this.form.Email, Website: this.form.Website}
          this.axios.post('/api/Services/baseservice.asmx/SaveInstitution', {inst: data}).then(res => {
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
          // let data = {InstitutionID: this.form.InstitutionID, ParentID: this.form.ParentID, TypeID: this.form.TypeID, BusinessProcessingTypeID: this.form.BusinessProcessingTypeID, Name: this.form.Name, StatusID: 1, IsNew: false, BranchCode: this.form.BranchCode, Telphone: this.form.Telphone, Address: this.form.Address, PostCode: this.form.PostCode, Email: this.form.Email, Website: this.form.Website}
          let data = JSON.stringify(this.form)
          this.axios.post('/api/Services/baseservice.asmx/SaveInstitution', {inst: data}).then(res => {
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
        this.axios.post('/api/Services/baseservice.asmx/RemoveInstitution', {institutionid: this.currentNode}).then(res => {
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
    },
    // 隐藏地址弹窗
    showStaffForm: function () {
      let inst = this.currentInstitution
      inst.staffs = []
      this.staffForm.selectedIDs = []
      this.isLoadingStaffs = true
      this.axios.post('/api/Services/baseservice.asmx/GetInstitutionStaffs', {institutionid: inst.InstitutionID}).then(res => {
        if (res) {
          console.log('GetInstitutionStaffs', res)
          res.data.forEach(is => {
            let staff = this.staffList.find(s => s.StaffID === is.StaffID)
            if (staff !== undefined) inst.staffs.push(staff)
          })
          this.selectedChildren = inst.staffs
          this.children = this.staffList.filter(s => !this.selectedChildren.includes(s))
          this.isLoadingStaffs = false
          this.staffFormVisible = true
        }
      }).catch(err => {
        console.log('staffList', err)
        this.isLoadingStaffs = false
      })
    },
    closeStaff: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        done()
      }).catch(() => {})
    },
    selectStaff: function () {
      let childids = this.staffForm.selectedIDs
      // if (childid === null) return
      childids.forEach(id => {
        let staff = this.children.find(a => a.StaffID === id)
        this.selectedChildren.push(staff)
      })
      let inst = this.currentInstitution
      let parentid = inst.InstitutionID
      let ids = JSON.stringify(childids)
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/AddInstitutionStaffs', {institutionid: parentid, staffids: ids}).then(res => {
        if (res) {
          console.log('select staff', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
        }
        this.children = this.staffList.filter(s => !this.selectedChildren.includes(s))
        this.staffForm.selectedIDs = []
        this.staffForm.checkedChildren = []
        this.isLoading = false
      }).catch(err => {
        console.log('Fail to remove staff', err)
        this.isLoading = false
      })
    },
    removeStaff: function () {
      let children = []
      let selected = this.selectedChildren
      this.staffForm.checkedChildren.forEach(function (item) {
        let staff = selected.find(a => a.Name === item)
        children.push(staff.StaffID)
      })
      let value = JSON.stringify(children)
      let node = this.currentInstitution
      let parentid = node.InstitutionID
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/RemoveInstitutionStaffs', {institutionid: parentid, children: value}).then(res => {
        if (res) {
          console.log('removeStaff', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          this.selectedChildren = selected.filter(s => !children.includes(s.StaffID))
          this.children = this.staffList.filter(s => !this.selectedChildren.includes(s))
          this.staffForm.checkedChildren = []
        }
        this.isLoading = false
      }).catch(err => {
        console.log('Fail to remove staff', err)
        this.isLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
