<template>
  <div>
    <el-form :model="emailForm" ref="emailForm" class="writeEmail">
      <el-row :gutter="20" class="subtitle">
        <el-col :span="24">
          <el-form-item label="Mail to" prop="Mailto">
            <el-input v-model="emailForm.Mailto" type="text" placeholder="Mailto" title="" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-col :span="24">
          <el-form-item label="CC" prop="CC">
            <el-input v-model="emailForm.CC" type="text" placeholder="CC" title="" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-col :span="24">
          <el-form-item label="Subject" prop="Subject">
            <el-input :span="20" v-model="emailForm.Subject" type="text" placeholder="Subject" title="" clearable></el-input>
            <el-checkbox :span="4" v-model="emailForm.ForceCreateAttach" >Force Create Form</el-checkbox>
          </el-form-item>
        </el-col>
        <el-col :span="4">
        </el-col>
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-col :span="24">
          <el-form-item label="Attachments" prop="Attaches">
            <el-upload ref="upload"
              class=""
              :headers = "headObj"
              :data="dataObj"
              action="/api/Services/basehandle.ashx"
              multiple
              :limit="5"
              :on-success="handleSuccess"
            >
              <el-button icon="el-icon-upload" type="primary" size="small">upload</el-button>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="0" class="subtitle">
        <el-col :span="24">
          <el-form-item label="Email Body" prop="MailBody">
            <el-input v-model="emailForm.MailBody" type="textarea" :rows="10" placeholder="Body" title="" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="newMemo-submit">
        <el-button icon="el-icon-check" type="primary" @click="send" :loading="isSendEmail">Send Email</el-button>
        <el-button icon="el-icon-check" type="primary" @click="send(1)" :loading="isSendEmail">Outlook</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'sendEmail',
  data: function () {
    return {
      isSendEmail: false,
      headObj: {
        Authorization: JSON.parse(this.$store.getters.getAccount).Token
      },
      dataObj: {
        itemType: 'emailAttach'
      },
      fileList: [],
      emailForm: {
        EmailBusiTypeID: 1,
        BusinessID: 0,
        Subject: 'Quote request to ',
        Mailto: '',
        CC: '',
        MailBody: '',
        ForceCreateAttach: false,
        Attaches: []
      }
    }
  },
  props: {
    mail: {
      type: Object
    },
    body: {
      type: String
    }
  },
  mounted: function () {
    this.emailForm.BusinessID = this.mail.businessId
    this.emailForm.EmailBusiTypeID = this.mail.mailType
    this.emailForm.Subject = this.mail.subject
    this.emailForm.Mailto = this.mail.mailto
    this.emailForm.MailBody = this.body
  },
  methods: {
    handleSuccess: function (response, file, fileList) {
      // 文件上传成功的回调
      this.$message({
        type: 'success',
        message: 'Attach files uploaded'
      })
      this.emailForm.Attaches.push(file.name)
    },
    setEmail: function (businessId, subject, mailto, mailbody) {
      this.emailForm.BusinessID = businessId
      this.emailForm.Subject = subject
      this.emailForm.Mailto = mailto
      this.emailForm.Attaches = []
      this.emailForm.MailBody = mailbody
      this.$refs.upload.clearFiles()
    },
    send: function (way) {
      let message = 'Are you sure to send the email?'
      if (way === 1) message = 'Please confirm it has been sent already?'
      this.$confirm(message, 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isSendEmail = true
        this.emailForm.TypeID = this.mailType
        if (way === 1) this.emailForm.Mailto = ''
        let value = JSON.stringify(this.emailForm)
        console.log('emailForm', value)
        this.axios.post('/api/Services/CommerceService.asmx/SendEmail', {jsonvalue: value}).then(res => {
          if (res) {
            console.log('sendEmail', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
          }
          this.isSendEmail = false
          this.$emit('hideEmailWindow', this.emailForm.BusinessID)
        }).catch(err => {
          console.log('send email error', err)
          this.isSendEmail = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
