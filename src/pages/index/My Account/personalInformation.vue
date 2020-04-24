<template>
  <div style="min-width: 600px;">
    <div class="inPageTitle">
      <span class="inPageNav">Personal Information</span>
    </div>
    <div class="inPageContent">
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form" style="width: 600px; margin: auto;">
        <el-form-item label="Id" prop="StaffID" v-show="false">
          <el-input v-model="editForm.StaffID" disabled></el-input>
        </el-form-item>
        <el-form-item label="Institution" prop="institution">
          <el-input v-model="editForm.institution.Name" disabled></el-input>
          <!--<SelectTree :value="editForm.institution" :props="organizationProps" :options="organizationIdOptions" :clearable="true" @getValue="getValueEdit" disabled></SelectTree>-->
        </el-form-item>
        <el-form-item label="Role" prop="role">
          <el-input v-model="editForm.role.Name" disabled></el-input>
          <!--<el-select v-model="editForm.role" placeholder="Please Select" disabled filterable clearable>
            <el-option v-for="item in roleIdOptions" :key="item.RoleID" :label="item.Name" :value="item.RoleID"></el-option>
          </el-select>-->
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
      organizationProps: {
        value: 'InstitutionID',
        children: 'children',
        label: 'Name'
      },
      roleIdOptions: [],
      statusOptions: [{id: 1, name: 'Normal'}, {id: 2, name: 'Inactive'}],
      editForm: {
        StaffID: null,
        Name: null,
        institution: null,
        role: null,
        Mobile: null,
        Email: null,
        ProducerCode: null,
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
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 20, message: 'Within 20 Characters', trigger: 'blur' }
        ],
        Email: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'email', message: 'Format Error', trigger: 'blur' }
        ],
        ProducerCode: [
          { max: 20, message: 'Within 100 Characters', trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function () {
    this.initOrganization()
    this.initRole()
    this.search()
  },
  methods: {
    // selectTree返回值
    getValueEdit (value) {
      this.editForm.institution = value
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
    // 查询
    search: function () {
      this.axios.post('/api/Services/baseservice.asmx/GetStaff', {staffid: JSON.parse(this.$store.getters.getAccount).StaffID}).then(res => {
        if (res) {
          console.log('查询单个', res)
          let form = JSON.parse(JSON.stringify(res.data))
          // form.institution = form.institution.InstitutionID
          // form.role = form.role.RoleID
          this.editForm = form
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    // 修改
    edit: function () {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          let form = JSON.parse(JSON.stringify(this.editForm))
          // form.institution = {InstitutionID: form.institution}
          // form.role = {RoleID: form.role}
          this.axios.post('/api/Services/baseservice.asmx/SaveStaff', {staff: JSON.stringify(form)}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['editForm'].resetFields()
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
    }
  }
}
</script>

<style scoped>

</style>
