<template>
  <div>
    <div class="printDiv" >
      <el-button icon="el-icon-document" type="primary" @click="toPDF(pinkSlipForm.InsuredName, pinkSlipForm.EffectiveDate)" size="small">Print</el-button>
      <!--<el-button icon="el-icon-printer" type="primary" v-print="printObj" :loading="isLoading || isLoadingInsuranceCompany" size="small">Print</el-button>-->
    </div>
    <div class="viewPinkSlip" id="pinkSlipDom">
      <!--<img src="http://134.175.142.102:8080/upload/pinkslip.png" >
      <div class="printDate">Print Date: {{printDate}}</div>-->
      <el-row :gutter="20" style="margin-bottom:30px">
        <el-col :span="12">
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.InsuranceCorpName}}</i></div>
          <!-- <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.InsuranceCorpAddress}}</i></div>-->
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-bottom:35px">
        <el-col :span="12">
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.InsuredName}}</i></div>
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.InsuredAddress}}</i></div>
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.InsuredCity}}</i></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-bottom:60px">
        <el-col :span="4">
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.EffectiveDate}}</i></div>
        </el-col>
        <el-col :span="4">
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.ExpiryDate}}</i></div>
        </el-col>
        <el-col :span="4">
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.PolicyNumber}}</i></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-bottom:60px">
        <el-col :span="8">
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{pinkSlipForm.VehicleInfo}}</i></div>
        </el-col>
        <el-col :span="4">
          <!--<div class="viewMemo-subtitle head">{{pinkSlipForm.Broker}}</div>-->
        </el-col>
      </el-row>
      <el-row :gutter="20" class="foot printDateInFoot">
        <el-col>
          <div style="margin-top: 420px; padding-right:550px;">
            <b>{{Author + ' ' + printDate}}</b>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'pinkSlip',
  data: function () {
    return {
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      Author: JSON.parse(this.$store.getters.getAccount).Name,
      pinkSlipForm: {
        InsuranceCorpName: null,
        InsuranceCorpAddress: null,
        InsuredName: null,
        InsuredAddress: null,
        InsuredCity: 'North York, On. M1K 3B8',
        VehicleInfo: null,
        EffectiveDate: null,
        ExpiryDate: null,
        PolicyNumber: null,
        Broker: ''
      }
    }
  },
  props: {
    memoid: {
      type: Number
    },
    insuranceCorps: {
      type: Array
    }
  },
  mounted: function () {
    this.loadMemo(this.memoid)
  },
  methods: {
    start: function () {
      console.log('start')
    },
    loadMemo: function (id) {
      // this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetViewMemo', {memoid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.pinkSlipFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            let memo = res.data
            let insuranceCorp = this.insuranceCorps.find(item => item.InsuranceCorpID === memo.InsuranceCorpID)
            this.pinkSlipForm.InsuranceCorpName = insuranceCorp.Name
            this.pinkSlipForm.InsuranceCorpAddress = insuranceCorp.Address
            this.pinkSlipForm.EffectiveDate = moment(memo.EffectiveDate).format('DD/MM/YYYY')
            this.pinkSlipForm.ExpiryDate = moment(memo.EffectiveDate).add(30, 'days').format('DD/MM/YYYY')
            this.pinkSlipForm.PolicyNumber = memo.PolicyNumber
            // this.pinkSlipForm.InsuredName = memo.NameInsured
            // this.pinkSlipForm.InsuredAddress = memo.AddressInsured
            this.pinkSlipForm.Broker = memo.branch.Name
            let insuredname = memo.NameInsured
            let answer0 = memo.answers.find(a => a.QuestionDesc.indexOf('Last name') > 0)
            if (answer0 !== undefined) insuredname = answer0.AnswerDesc
            this.pinkSlipForm.InsuredName = insuredname
            let vehicleYear = '2015'
            let vehicleModel = ''
            let vehicleMake = 'Toyota'
            let vin = ''
            let answer = memo.answers.find(a => a.QuestionDesc === 'Vehicle Year: ')
            if (answer !== undefined) vehicleYear = answer.AnswerDesc
            answer = memo.answers.find(a => a.QuestionDesc === 'Vehicle Make: ')
            if (answer !== undefined) vehicleMake = answer.AnswerDesc
            answer = memo.answers.find(a => a.QuestionDesc === 'Vehicle Model: ')
            if (answer !== undefined) vehicleModel = answer.AnswerDesc
            answer = memo.answers.find(a => a.QuestionDesc === 'VIN #: ')
            if (answer !== undefined) vin = answer.AnswerDesc
            this.pinkSlipForm.VehicleInfo = vehicleYear + ' ' + vehicleMake + ' ' + vehicleModel + ' ' + vin
            answer = memo.answers.find(a => a.QuestionDesc === 'Address Line 1:')
            if (answer !== undefined) this.pinkSlipForm.InsuredAddress = answer.AnswerDesc
            answer = memo.answers.find(a => a.QuestionDesc === 'Address Line 2:')
            if (answer !== undefined) this.pinkSlipForm.InsuredCity = answer.AnswerDesc
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    // 关闭Pink Slip
    close: function (done) {
      this.viewForm = {
        Title: null,
        EffectiveDate: null,
        InsuranceCorp: null,
        PolicyNumber: null,
        Author: null,
        branch: {
          Name: null,
          Address: null,
          Telphone: null
        },
        corpbroker: {
          BrokerCode: null,
          corp: {
            Name: null
          }
        },
        RequestDate: null,
        memoTemplates: [{
          memoBlocks: [{
            answers: []
          }]
        }],
        answerList: []
      }
      done()
    },
    // 转pdf
    toPDF: function (title, EffectiveDate) {
      this.htmlTitle = title + ' ' + EffectiveDate
      this.getPdf('#pinkSlipDom')
      this.axios.post('/api/Services/memoservice.asmx/CreatePrintRecord', {memoid: this.memoid, typeid: 2}).then(res => {
        if (res) {
          console.log('create printRecord', res)
        }
      }).catch(err => {
        console.log('查询单个出错', err)
      })
    }

  }
}
</script>

<style scoped>

</style>
