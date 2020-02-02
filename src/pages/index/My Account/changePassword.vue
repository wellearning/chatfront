<template>
  <div style="min-width: 600px;">
    <div class="inPageTitle">
      <span class="inPageNav">Change Password</span>
    </div>
    <div class="inPageContent">
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form" style="width: 600px; margin: auto;">
        <el-form-item label="Id" prop="StaffID" v-show="false">
          <el-input v-model="editForm.StaffID" disabled></el-input>
        </el-form-item>
        <el-form-item label="Old Password" prop="oldPassword">
          <el-input v-model.trim="editForm.oldPassword" clearable type="password"></el-input>
        </el-form-item>
        <el-form-item label="New Password" prop="password">
          <el-input v-model.trim="editForm.password" clearable type="password"></el-input>
        </el-form-item>
        <el-form-item label="Repeat Password" prop="repeatPassword">
          <el-input v-model.trim="editForm.repeatPassword" clearable type="password"></el-input>
        </el-form-item>
        <el-form-item class="confirmBtn">
          <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading">Confirm</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    let validatePass = (rule, value, callback) => {
      if (value === '' || value === null) {
        callback(new Error('Please Enter'))
      } else {
        if (this.editForm.repeatPassword !== '' && this.editForm.repeatPassword !== null) {
          this.$refs.editForm.validateField('repeatPassword')
        }
        callback()
      }
    }
    let validatePass2 = (rule, value, callback) => {
      if (value === '' || value === null) {
        callback(new Error('Please Enter'))
      } else if (value !== this.editForm.password) {
        callback(new Error('The Two Passwords Were Inconsistent'))
      } else {
        callback()
      }
    }
    return {
      isLoading: false,
      editForm: {
        oldPassword: null,
        password: null,
        repeatPassword: null
      },
      editFormRules: {
        oldPassword: [
          { validator: validatePass, trigger: 'blur' }
        ],
        password: [
          { validator: validatePass, trigger: 'blur' }
        ],
        repeatPassword: [
          { validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 修改
    edit: function () {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.axios.post('/api/Services/baseservice.asmx/ChangePassword', {oldpassword: this.editForm.oldPassword, password: this.editForm.password}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['editForm'].resetFields()
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
