<template>
  <div>
    <div class="printDiv" v-if="viewForm.StatusID === 1">
      <el-button icon="el-icon-document" type="primary" @click="pdf(viewForm.Title, viewForm.EffectiveDate)" :loading="isLoading" size="small">ToPDF</el-button>
      <el-button icon="el-icon-printer" type="primary" v-print="printObj" :loading="isLoading " size="small" @click="printrecord">Print</el-button>
    </div>
    <div class="viewMemo" id="pdfDom">
      <!--<div class="printDate">Print Date: {{printDate}}</div>-->
      <img v-if="viewForm.branch !== null && viewForm.branch.LogoUrl!==null " class="viewLogo" :src="'/api' + viewForm.branch.FormLogoUrl + '?time=' + printDate" crossorigin="anonymous">
      <el-row  v-if="viewForm.branch !== null" :gutter="20">
        <el-col :span="12">
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{rootInstitution.Name}} ({{viewForm.branch.Name}})</i></div>
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{viewForm.branch.Address}}</i></div>
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{viewForm.branch.Telphone}}</i></div>
        </el-col>
        <el-col :span="12">
          <div class="viewMemo-subtitle head"><i class="long">Insurance Company: </i><b>{{viewForm.corpbroker.corp.Name}}</b></div>
          <div class="viewMemo-subtitle head"><i class="long">Broker Code: </i><b>{{viewForm.corpbroker.BrokerCode}}</b></div>
          <div class="viewMemo-subtitle head"><i class="long">CoverLetterID: </i><b>{{viewForm.CoverLetterID}}</b></div>
        </el-col>
      </el-row>
      <div class="viewMemo-title">{{viewForm.Title}}</div>
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="viewMemo-subtitle">EffectiveDate:</div>
        </el-col>
        <el-col :span="8">
          <div class="viewMemo-subtitle"><span>{{viewForm.EffectiveDate}}</span></div>
        </el-col>
        <el-col :span="4">
          <div class="viewMemo-subtitle">RequestDate:</div>
        </el-col>
        <el-col :span="8">
          <div class="viewMemo-subtitle"><span>{{viewForm.RequestDate}}</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="viewMemo-subtitle">ClientCode:</div>
        </el-col>
        <el-col :span="8">
          <div class="viewMemo-subtitle"><span>{{viewForm.ClientCode}}</span></div>
        </el-col>
        <el-col :span="4">
          <div class="viewMemo-subtitle">Name Insured(s):</div>
        </el-col>
        <el-col :span="8">
          <div class="viewMemo-subtitle"><span>{{viewForm.NameInsured}}</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="viewMemo-subtitle">Premium on APP:</div>
        </el-col>
        <el-col :span="8">
          <div class="viewMemo-subtitle"><span>{{viewForm.PremiumOnApp}}</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="foot printDateInFoot">
        <el-col :span="24">
          <div class="viewMemo-subtitle"><span></span></div>
        </el-col>
      </el-row>
      <EditCoverLetterBody :coverLetter="viewForm" :disabled="true"></EditCoverLetterBody>
      <el-row :gutter="20" class="foot printDateInFoot">
        <el-col>
          <b>{{viewForm.Author + ' ' + printDate}}</b>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import EditCoverLetterBody from '@/component/parts/editCoverLetterBody'
export default {
  components: {
    EditCoverLetterBody
  },
  name: 'viewCoverLetter',
  data: function () {
    return {
      printDate: null,
      printObj: {
        id: 'pdfDom',
        popTitle: ''
      },
      isLoading: true,
      totalBlocks: 0,
      rootInstitution: JSON.parse(this.$store.getters.getAccount).rootInstitution,
      author: JSON.parse(this.$store.getters.getAccount).Name,
      viewForm: {
        CoverLetterID: null,
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        ClientCode: null,
        StatusID: 0,
        RequestDate: moment(new Date()),
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        branch: null,
        PremiumOnApp: null,
        Templates: null,
        Author: ''
      }
    }
  },
  props: {
    coverletterid: {
      type: Number
    },
    coverletter: {
      type: Object
    },
    insuranceCorps: {
      type: Array
    }
  },
  mounted: function () {
    this.loadCoverLetter(this.coverletterid)
  },
  methods: {
    loadCoverLetterTemplate: function (ct) {
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetterTemplate', {coverlettertemplateid: ct.CoverLetterTemplateID}).then(res => {
        if (res) {
          console.log('loadCoverLetterTemplate', res)
          ct.coverLetterBlocks = res.data.coverLetterBlocks
          this.loadingCount++
          // if (this.coverLetterForm.coverLetterTemplates.length === this.loadingCount) this.isLoading = false
          // else this.isLoading = true
          if (!this.isLoading) {
            console.log('isLoading', this.isLoading)
            // this.matchAnswerBlockQuestion()
          }
        }
      }).catch(err => {
        console.log('loadCoverLetterTemplate', err)
      })
    },
    loadCoverLetterBlock: function (cb) {
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetterBlock', {coverletterblockid: cb.CoverLetterBlockID}).then(res => {
        if (res) {
          console.log('loadCoverLetterBlock', res)
          cb.answers = res.data.answers
          this.loadingCount++
          if (this.totalBlocks === this.loadingCount) this.isLoading = false
          else this.isLoading = true
          if (!this.isLoading) {
            console.log('isLoading', this.isLoading)
            // this.matchAnswerBlockQuestion()
          }
        }
      }).catch(err => {
        console.log('loadCoverLetterBlock', err)
      })
    },
    loadCoverLetter: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetViewCoverLetter', {coverletterid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.viewForm = res.data
          this.loadingCount = 0
          this.totalBlocks = 0
          this.viewForm.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
          this.viewForm.RequestDate = moment(res.data.RequestDate).format('YYYY-MM-DD')
          this.viewForm.coverLetterTemplates.forEach(ct => {
            this.totalBlocks += ct.coverLetterBlocks.length
            ct.coverLetterBlocks.forEach(cb => {
              return this.loadCoverLetterBlock(cb)
            })
            // return this.loadCoverLetterTemplate(ct)
          })
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.printObj.popTitle = this.viewForm.Title
          })
          // this.isLoading = false
        }
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    // 关闭Pink Slip
    close: function (done) {
      this.viewForm.coverLetterTemplates = []
      /*
      this.viewForm = {
        CoverLetterID: null,
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        ClientCode: null,
        StatusID: 0,
        RequestDate: moment(new Date()),
        // StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        Templates: null
      }
      */
      done()
    },
    pdf: function (title, EffectiveDate) {
      this.htmlTitle = title + ' ' + EffectiveDate
      this.getPdf('#pdfDom')
      this.printrecord()
    },
    // 转pdf
    printrecord: function () {
      this.axios.post('/api/Services/NewBusinessService.asmx/CreatePrintRecord', {coverletterid: this.viewForm.CoverLetterID, typeid: 1}).then(res => {
        if (res) {
          console.log('create printRecord', res)
        }
      }).catch(err => {
        console.log('create printRecord出错', err)
      })
    }

  }
}
</script>

<style scoped>

</style>
