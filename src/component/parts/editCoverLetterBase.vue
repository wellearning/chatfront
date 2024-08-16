<template>
    <div>
      <el-form :model="coverLetterForm" ref="coverLetterForm" class="newMemo" :rules="coverLetterFormRules">
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="CoverLetterID" prop="CoverLetterID">
              <el-input v-model="coverLetterForm.CoverLetterID" type="number" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="NameInsured" prop="NameInsured">
              <el-input v-model="coverLetterForm.NameInsured" placeholder="NameInsured" title=""></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="Effective Date" prop="EffectiveDate">
              <el-date-picker v-model="coverLetterForm.EffectiveDate" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="Producer" prop="ProducerID">
              <el-select v-model="coverLetterForm.ProducerID" placeholder="Producer" no-data-text="No Record" filterable >
                <el-option v-for="item in producerList" :key="item.StaffID" :label="item.Name" :value="item.StaffID"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="Insurance Corporation" prop="InsuranceCorpID">
              <el-select v-model="coverLetterForm.InsuranceCorpID" placeholder="Insurance Corporation" disabled no-data-text="No Record" filterable >
                <el-option v-for="item in insuranceCorpList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="Client Code" prop="ClientCode">
              <el-input v-model="coverLetterForm.ClientCode" placeholder="Client Code" title=""></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="24">
            <el-form-item label="PremiumOnApp" prop="PremiumOnApp">
              <el-input v-model="coverLetterForm.PremiumOnApp" type="number" placeholder="PremiumOnApp" title=""></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="newMemo-submit">
          <el-button icon="el-icon-check" type="primary" @click="saveCoverLetter()" :loading="isLoading">Save</el-button>
        </div>
      </el-form>
    </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'editCoverLetterBase',
  data: function () {
    return {
      isLoading: false,
      isLoadingInsuranceCorps: false,
      isLoadingCoverLetter: false,
      isSavingCoverLetter: false,
      producerList: [],
      // insuranceCorpList: [],
      coverLetterForm: {
        CoverLetterID: null,
        NameInsured: null,
        EffectiveDate: null,
        RequestDate: null,
        ProducerID: null,
        ClientCode: null,
        PremiumOnApp: null
      },
      coverLetterFormRules: {
        EffectiveDate: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        ProducerID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        ClientCode: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        PremiumOnApp: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ]
      }
    }
  },
  props: {
    coverletter: {
      type: Object
    },
    insuranceCorpList: {
      type: Array
    }
  },
  mounted: function () {
    this.loadProducers(0)
    // this.loadInsuranceCorps()
    this.loadCoverLetter(this.coverletter.CoverLetterID)
  },
  methods: {
    loadProducers: function (start) {
      this.isLoadingProducers = true
      this.axios.post('/api/Services/baseservice.asmx/GetAllProducers', {start: start}).then(res => {
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
            // this.attachProducers()
          }
        }
      }).catch(err => {
        console.log('producerList', err)
        this.isLoadingProducers = false
      })
    },
    // 保险公司列表
    loadInsuranceCorps: function () {
      this.isLoadingInsuranceCorps = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps_all', {}).then(res => {
        if (res) {
          console.log('InsuranceCorps', res)
          this.insuranceCorpList = res.data
        }
        this.isLoadingInsuranceCorps = false
      }).catch(err => {
        console.log('InsuranceCorps', err)
        this.isLoadingInsuranceCorps = false
      })
    },
    loadCoverLetter: function (id) {
      this.isLoadingCoverLetter = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetterBase', {coverletterid: id}).then(res => {
        if (res) {
          console.log('CoverLetterBase', res)
          this.coverLetterForm = res.data
          this.coverLetterForm.RequestDate = moment(res.data.RequestDate)
          this.coverLetterForm.EffectiveDate = moment(res.data.EffectiveDate)
        }
        this.isLoadingCoverLetter = false
      }).catch(err => {
        console.log('CoverLetterBase', err)
        this.isLoadingCoverLetter = false
      })
    },

    setForm: function (coverLetter) {
      this.coverLetterForm.CoverLetterID = coverLetter.CoverLetterID
      this.coverLetterForm.NameInsured = coverLetter.NameInsured
      this.coverLetterForm.ClientCode = coverLetter.ClientCode
      this.coverLetterForm.EffectiveDate = coverLetter.EffectiveDate
      this.coverLetterForm.PremiumOnApp = coverLetter.PremiumOnApp
    },
    setCoverLetter: function (letter) {
      letter.CoverLetterID = this.coverLetterForm.CoverLetterID
      letter.NameInsured = this.coverLetterForm.NameInsured
      letter.ClientCode = this.coverLetterForm.ClientCode
      letter.EffectiveDate = this.coverLetterForm.EffectiveDate
      letter.RequestDate = this.coverLetterForm.RequestDate
      letter.PremiumOnApp = this.coverLetterForm.PremiumOnApp
    },

    saveCoverLetter: function () {
      this.$confirm('Are you sure to save it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isSavingCoverLetter = true
        let value = JSON.stringify(this.coverLetterForm)
        console.log('CoverLetter to save', value)
        this.axios.post('/api/Services/NewBusinessService.asmx/SaveCoverLetterBase', {coverLetter: value}).then(res => {
          if (res) {
            console.log('saveCoverLetter', res)
            this.setCoverLetter(this.coverletter)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.$emit('hideEdition')
          }
          this.isSavingCoverLetter = false
        }).catch(err => {
          console.log('saveCoverLetter error', err)
          this.saveCoverLetter = false
        })
      }).catch(err1 => {
        console.log('save error:', err1)
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
