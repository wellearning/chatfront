<template>
    <div>
      <el-form :model="applicationForm" ref="applicationForm" class="newMemo" :rules="applicationFormRules">
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="ApplicationID" prop="ApplicationID">
              <el-input v-model="applicationForm.ApplicationID" type="number" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="Applicant" prop="NameInsured">
              <el-input v-model="applicationForm.NameInsured" placeholder="Applicant" title=""></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="Effective Date" prop="EffectiveDate">
              <el-date-picker v-model="applicationForm.EffectiveDate" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="Expiry Date" prop="ExpiryDate">
              <el-date-picker v-model="applicationForm.ExpiryDate" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="Producer" prop="ProducerID">
              <el-select v-model="applicationForm.ProducerID" placeholder="Producer" no-data-text="No Record" filterable >
                <el-option v-for="item in producerList" :key="item.StaffID" :label="item.Name" :value="item.StaffID"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="AppType" prop="TypeID">
              <el-select v-model="applicationForm.TypeID" placeholder="App Type" no-data-text="No Record" filterable >
                <el-option v-for="item in appTypes" :key="item.key" :label="item.value" :value="item.key"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="applicationForm.TypeID === 2" class="subtitle">
          <el-col :span="24">
            <el-form-item label="Remarket From" prop="LeadFromCorpID">
              <el-select v-model="applicationForm.LeadFromCorpID" placeholder="Lead From" no-data-text="No Record" filterable >
                <el-option v-for="item in insuranceCorpList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="Client Code" prop="ClientCode">
              <el-input v-model="applicationForm.ClientCode" placeholder="Client Code" title=""></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="Policy Number" prop="PolicyNumber">
              <el-input v-model="applicationForm.PolicyNumber" placeholder="Policy Number" title=""></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="Premium" prop="Premium">
              <el-input v-model="applicationForm.Premium" type="number" placeholder="Premium" title=""></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="SalesPoints" prop="SalesPoints">
              <el-input v-model="applicationForm.SalesPoints" type="number" placeholder="SalesPoints" title=""></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="InsuranceCorp" prop="InsuranceCorpID">
              <el-select v-model="applicationForm.InsuranceCorpID" placeholder="Template" no-data-text="No Record" filterable >
                <el-option v-for="item in insuranceCorpList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="Agen/Dir" prop="BillWayID">
              <el-select v-model="applicationForm.BillWayID" placeholder="Agen/Dir" no-data-text="No Record" filterable >
                <el-option v-for="item in billWays" :key="item.key" :label="item.value" :value="item.key"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <div v-if="businessTypeId !== 3 && businessTypeId !== 6">
          <!--el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Renewal Questionnaire" prop="QuestionnaireID">
                <el-select v-model="applicationForm.QuestionnaireID" placeholder="Questionnaire" no-data-text="No Record" filterable >
                  <el-option v-for="item in questionnaires" :key="item.BlockID" :label="item.Name" :value="item.BlockID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row-->
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="ApplicationType" prop="TemplateID">
                <el-select v-model="applicationForm.TemplateID" placeholder="Template" no-data-text="No Record" filterable >
                  <el-option v-for="item in templateList" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <!--GmapAutocomplete style="width: 500px; height: 25px;"
                            :options="{
              componentRestrictions: { country: 'ca' },
            }"
                            :value="applicationForm.Address"
                            @place_changed="setPlace">
          </GmapAutocomplete-->
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Address" prop="Address">
                <el-input id="pac-input" v-model="applicationForm.Address" placeholder="Address" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="City" prop="City">
                <el-input v-model="applicationForm.City" placeholder="" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Province" prop="Province">
                <el-input v-model="applicationForm.Province" placeholder="" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="PersonContact" prop="PersonContact">
                <el-input v-model="applicationForm.PersonContact" placeholder="Policy Number" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="PhoneNumber" prop="PhoneNumber">
                <el-input v-model="applicationForm.PhoneNumber" placeholder="Policy Number" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Email" prop="Email">
                <el-input v-model="applicationForm.Email" placeholder="Email" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="BindTime" prop="Email">
              <el-input disabled v-model="BindTime" placeholder="BindTime" title=""></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="newMemo-submit">
          <el-button icon="el-icon-check" type="primary" @click="saveApplication()" :loading="isLoading">Save</el-button>
        </div>
      </el-form>
    </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'editApplicationBase',
  data: function () {
    return {
      isLoading: false,
      isLoadingInsuranceCorps: false,
      isLoadingApplication: false,
      isLoadingQuestionnaires: false,
      isLoadingAppTypes: false,
      isLoadingTemplates: false,
      templateList: [],
      appTypes: [],
      billWays: [],
      producerList: [],
      insuranceCorpList: [],
      questionnaires: [],
      applicationForm: {
        ApplicationID: null,
        NameInsured: null,
        EffectiveDate: null,
        TypeID: null,
        BillWayID: null,
        ProducerID: null,
        InsuranceCorpID: null,
        LeadFromCorpID: 0,
        ExpiryDate: null,
        ClientCode: null,
        PolicyNumber: null,
        Premium: null,
        SalesPoints: null,
        QuestionnaireID: 0,
        TemplateID: 0,
        Address: null,
        City: null,
        Province: null,
        PostCode: null,
        PersonContact: null,
        Email: null,
        PhoneNumber: null,
        BusCode: '',
        Industry: ''
      },
      BindTime: null,
      applicationFormRules: {
        PolicyNumber: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 50, message: 'Within 50 Characters', trigger: 'blur' }
        ],
        EffectiveDate: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        ExpiryDate: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        ProducerID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        TypeID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        ClientCode: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        Premium: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ]
      }
    }
  },
  props: {
    businessTypeId: {
      type: Number
    },
    application: {
      type: Object
    }
  },
  mounted: function () {
    this.loadProducers(0)
    this.loadAppTypes()
    this.loadBillWays()
    this.loadApplicationStatus()
    this.loadTemplates()
    this.loadInsuranceCorps()
    this.loadQuestionnaires()
    this.loadApplication(this.application.ApplicationID)
    // this.setForm(this.application)
  },
  methods: {
    loadProducers: function (start) {
      this.isLoadingProducers = true
      this.axios.post('/api/Services/baseservice.asmx/GetNormalStaffs', {start: start}).then(res => {
        if (res) {
          console.log('producerList', res)
          if (start === 0) {
            this.producerCount = res.count
            this.producerList = res.data
          } else {
            this.producerList = this.producerList.concat(res.data)
          }
          if (this.producerList.length < this.producerCount) {
            this.loadProducers(this.producerList.length)
          } else {
            this.isLoadingProducers = false
            this.attachProducers()
          }
        }
      }).catch(err => {
        console.log('producerList', err)
        this.isLoadingProducers = false
      })
    },
    loadAppTypes: function () {
      this.isLoadingAppTypes = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'AppType'}).then(res => {
        if (res) {
          console.log('loadAppTypes', res)
          if (this.businessTypeId === 3) this.appTypes = res.data
          else this.appTypes = res.data.filter(t => t.key !== 6)
        }
        this.isLoadingAppTypes = false
      }).catch(err => {
        console.log('loadAppTypes出错', err)
        this.isLoadingAppTypes = false
      })
    },
    loadBillWays: function () {
      this.isLoadingAppTypes = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'BillWay'}).then(res => {
        if (res) {
          console.log('loadAppTypes', res)
          this.billWays = res.data
        }
        this.isLoadingAppTypes = false
      }).catch(err => {
        console.log('loadAppTypes出错', err)
        this.isLoadingAppTypes = false
      })
    },
    loadApplicationStatus: function () {
      this.isLoadingInsuranceCorps = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'ApplicationStatus'}).then(res => {
        if (res) {
          console.log('statusList', res)
          this.statusList = res.data
        }
        this.isLoadingInsuranceCorps = false
      }).catch(err => {
        console.log('statusList', err)
        this.isLoadingInsuranceCorps = false
      })
    },
    loadTemplates: function () {
      this.isLoadingTemplates = true
      this.axios.post('/api/Services/BaseService.asmx/GetTemplatesByBusinessType', {btypeid: 4}).then(res => {
        if (res) {
          console.log('Templates列表', res)
          let notapplied = [{TemplateID: 0, Title: 'Not Applied'}]
          this.templateList = notapplied.concat(res.data)
        }
        this.isLoadingTemplates = false
      }).catch(err => {
        console.log('Templates列表出错', err)
        this.isLoadingTemplates = false
      })
    },
    // 保险公司列表
    loadInsuranceCorps: function () {
      this.isLoadingInsuranceCorps = true
      this.axios.post('/api/Services/baseservice.asmx/GetBrokageInsuranceCorps', {}).then(res => {
        if (res) {
          console.log('InsuranceCorps', res)
          this.insuranceCorpList = res.data.filter(c => c.Province === null || c.Province === '' || c.Province === 'ON')
          if (this.businessTypeId === 6 || this.businessTypeId === 7) {
            this.insuranceCorpList = res.data.filter(c => c.BusinessLineID === 3)
          } else {
            this.insuranceCorpList = res.data.filter(c => c.BusinessLineID !== 3)
          }
        }
        this.isLoadingInsuranceCorps = false
      }).catch(err => {
        console.log('InsuranceCorps', err)
        this.isLoadingInsuranceCorps = false
      })
    },
    // Questionnaire
    loadQuestionnaires: function () {
      this.isLoadingQuestionnaires = true
      this.axios.post('/api/Services/baseservice.asmx/GetQuestionnaires', {}).then(res => {
        if (res) {
          console.log('Questionnaires', res)
          let nocorp = [{BlockID: 0, Name: 'No Need'}]
          this.questionnaires = nocorp.concat(res.data)
        }
        this.isLoadingQuestionnaires = false
      }).catch(err => {
        console.log('Questionnaires', err)
        this.isLoadingQuestionnaires = false
      })
    },
    loadApplication: function (id) {
      this.isLoadingApplication = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationBase', {applicationid: id}).then(res => {
        if (res) {
          console.log('ApplicationBase', res)
          if (res.data.BusinessTypeID === 0) res.data.BusinessTypeID = this.application.BusinessTypeID
          this.applicationForm = res.data
          this.applicationForm.RequestDate = moment(res.data.RequestDate)
          this.applicationForm.EffectiveDate = moment(res.data.EffectiveDate)
          this.applicationForm.ExpiryDate = moment(res.data.ExpiryDate)
          this.applicationForm.DateOfBirth = moment(res.data.DateOfBirth)
          this.applicationForm.BindTime = moment(res.data.BindTime)
          if (this.applicationForm.BindTime.year() < 2050) this.BindTime = moment(res.data.BindTime).format('YYYY/MM/DD hh:mm:ss')
          else this.BindTime = null
        }
        this.isLoadingApplication = false
      }).catch(err => {
        console.log('ApplicationBase', err)
        this.isLoadingApplication = false
      })
    },

    // ApplictionTemplate
    loadApplicationTemplate: function () {
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationTemplateSimple', {applicationid: this.application.ApplicationID}).then(res => {
        if (res) {
          console.log('loadApplicationTemplate', res)
          if (res.data !== null) {
            this.applicationForm.applicationTemplate = res.data
            this.applicationForm.TemplateID = res.data.TemplateID
          } else {
            this.applicationForm.applicationTemplate = {
              ApplicationID: this.application.ApplicationID,
              TemplateID: 0,
              Title: ''
            }
            this.applicationForm.TemplateID = 0
          }
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadApplicationTemplate', err)
        this.isLoading = false
      })
    },

    setForm: function (application) {
      this.applicationForm.ApplicationID = application.ApplicationID
      this.applicationForm.NameInsured = application.NameInsured
      this.applicationForm.ClientCode = application.ClientCode
      this.applicationForm.PolicyNumber = application.PolicyNumber
      this.applicationForm.EffectiveDate = application.EffectiveDate
      this.applicationForm.ExpiryDate = application.ExpiryDate
      this.applicationForm.TypeID = application.TypeID
      this.applicationForm.LeadFromCorpID = application.LeadFromCorpID
      this.applicationForm.QuestionnaireID = application.QuestionnaireID
      this.applicationForm.Premium = application.Premium
      this.applicationForm.Address = application.Address
      this.applicationForm.City = application.City
      this.applicationForm.Province = application.Province
      this.applicationForm.PostCode = application.PostCode
      this.applicationForm.PersonContact = application.PersonContact
      this.applicationForm.Email = application.Email
      this.applicationForm.PhoneNumber = application.PhoneNumber
      this.applicationForm.TemplateID = application.TemplateID
      // this.loadApplicationTemplate()
      // if (application.applicationTemplate !== null) this.applicationForm.TemplateID = application.applicationTemplate.TemplateID
      // else this.loadApplicationTemplate()
    },
    changeTemplate: function () {
      let template = this.templateList.find(t => t.TemplateID === this.applicationForm.TemplateID)
      this.applicationForm.applicationTemplate.TemplateID = template.TemplateID
      if (template.TemplateID === 0) {
        this.applicationForm.applicationTemplate.Title = ''
        this.applicationForm.Title = ''
      } else {
        this.applicationForm.applicationTemplate.Title = template.Title
        this.applicationForm.Title = template.Title
      }
    },
    setApplication: function (app) {
      app.ApplicationID = this.applicationForm.ApplicationID
      app.NameInsured = this.applicationForm.NameInsured
      app.ClientCode = this.applicationForm.ClientCode
      app.PolicyNumber = this.applicationForm.PolicyNumber
      app.EffectiveDate = this.applicationForm.EffectiveDate
      app.ExpiryDate = this.applicationForm.ExpiryDate
      app.TypeID = this.applicationForm.TypeID
      app.LeadFromCorpID = this.applicationForm.LeadFromCorpID
      app.QuestionnaireID = this.applicationForm.QuestionnaireID
      app.Premium = this.applicationForm.Premium
      app.applicationTemplate = this.applicationForm.applicationTemplate
      app.Address = this.applicationForm.Address
      app.City = this.applicationForm.City
      app.Province = this.applicationForm.Province
      app.PostCode = this.applicationForm.PostCode
      app.PersonContact = this.applicationForm.PersonContact
      app.Email = this.applicationForm.Email
      app.PhoneNumber = this.applicationForm.PhoneNumber
      app.ProducerID = this.applicationForm.ProducerID
      app.BillWayID = this.applicationForm.BillWayID
      app.InsuranceCorpID = this.applicationForm.InsuranceCorpID
      let producer = this.producerList.find(p => p.StaffID === app.ProducerID)
      if (producer !== undefined) app.Producer = producer.Name
      else app.Producer = ''
      let insuranceCorp = this.insuranceCorpList.find(p => p.InsuranceCorpID === app.InsuranceCorpID)
      if (insuranceCorp !== undefined) app.CorpName = insuranceCorp.Name
      else app.CorpName = ''
      if (app.BillWayID === 1) app.AgenDir = 'A'
      else if (app.BillWayID === 2) app.AgenDir = 'D'
      else app.AgenDir = ''
      let status = this.statusList.find(s => s.key === app.StatusID)
      if (status !== undefined) app.Status = status.value
      else app.Status = ''
    },

    saveApplication: function () {
      this.$confirm('Are you sure to save it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isSavingApplication = true
        // let app = JSON.parse(JSON.stringify(this.application))
        // this.setApplication(app)
        // let value = JSON.stringify(app)
        let value = JSON.stringify(this.applicationForm)
        console.log('Application to save', value)
        this.axios.post('/api/Services/CommerceService.asmx/SaveApplicationBase', {application: value}).then(res => {
          if (res) {
            console.log('saveApplication', res)
            this.applicationForm.ApplicationID = res.data.ApplicationID
            this.applicationForm.StatusID = res.data.StatusID
            this.setApplication(this.application)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.$emit('hideEdition')
          }
          this.isSavingApplication = false
        }).catch(err => {
          console.log('删除出错', err)
          this.saveApplication = false
        })
      }).catch(err1 => {
        console.log('save error:', err1)
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    setPlace (place) {
      this.applicationForm.address = place.formatted_address
    }

  }

}
</script>
<style scoped>

</style>
