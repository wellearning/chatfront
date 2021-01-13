<template>
  <div>
    <div class="printDiv" >
      <el-button icon="el-icon-document" type="primary" @click="toPDF('COI', coiForm.CurrentDate)" size="small">Print</el-button>
      <!--<el-button icon="el-icon-printer" type="primary" v-print="printObj" :loading="isLoading || isLoadingInsuranceCompany" size="small">Print</el-button>-->
    </div>
    <div class="viewCOI" id="coiDom">
      <el-row :gutter="20" style="margin-top:-17px; margin-left:402px; color: steelblue; text-align: right; font-size:14px;">
        <el-col :span="10">
          <div class="viewMemo-subtitle head">{{coiForm.BranchTel}}</div>
          <div class="viewMemo-subtitle head">{{coiForm.BranchEmail}}</div>
          <div class="viewMemo-subtitle head">{{coiForm.Website}}</div>
        </el-col>
        <el-col :span="10">
          <div class="viewMemo-subtitle head">{{coiForm.BranchStreet}}</div>
          <div class="viewMemo-subtitle head">{{coiForm.BranchCity}}</div>
          <div class="viewMemo-subtitle head">{{coiForm.BranchPostcode}}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:25px; margin-left:85px; ">
        <el-col :span="12">
          <div class="viewMemo-subtitle head" style="margin-bottom:18px;">{{coiForm.CurrentDate}}</div>
          <div class="viewMemo-subtitle head">{{coiForm.Lessor}}</div>
          <div class="viewMemo-subtitle head">{{coiForm.Street}}</div>
          <div class="viewMemo-subtitle head">{{coiForm.City}}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:65px; margin-left:52px; font-family: Corbel; font-size: 20px; font-weight:bold; text-align: center">
        <el-col :span="22">
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span>CONFIRMATION OF INSURANCE</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:40px; margin-left:84px; font-size:18px; font-weight: bold;">
        <el-col :span="24">
          <div class="viewMemo-subtitle head" ><span >Re: </span><span style="display: inline-block; padding-left:40px">{{coiForm.Owner}}</span></div>
          <div class="viewMemo-subtitle head" style="padding-left: 68px"><span>Insurance Company: </span><span style="font-weight: normal">{{coiForm.InsuranceCompany}}</span></div>
          <div class="viewMemo-subtitle head" style="padding-left: 68px"><span>Policy# </span><span style="font-weight: normal">{{coiForm.PolicyNumber}}</span></div>
          <div class="viewMemo-subtitle head" style="padding-left: 68px"><span>Effective Date: </span><span style="font-weight: normal">{{coiForm.EffectiveDate}}</span><span style="display: inline-block; padding-left:20px;">Expiry Date: </span><span style="display: inline-block; padding-left:10px; font-weight: normal">{{coiForm.ExpiryDate}}</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:40px; margin-left:55px;">
        <el-col :span="22">
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span>Further to your request following is the insurance confirmation for the </span></div>
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="font-weight: bold;">{{coiForm.VehicleInfo}}</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:55px; margin-left:55px; font-weight: bold;">
        <el-col :span="22">
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="text-decoration: underline">Coverage </span><span style="display: inline-block; padding-left:330px">Limit/Liability</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:20px; margin-left:55px; font-size:19px; ">
        <el-col :span="20">
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="">Third Party Liability </span><span style="display: inline-block; padding-left:245px">{{coiForm.ThirdParty}}</span></div>
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="">All Perils Deductible </span><span style="display: inline-block; padding-left:241px">{{coiForm.AllPerils}}</span></div>
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="">Collision Deductible </span><span style="display: inline-block; padding-left:243px">{{coiForm.Collision}}</span></div>
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="">Comprehensive Deductible </span><span style="display: inline-block; padding-left:193px">{{coiForm.Comprehensive}}</span></div>
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="">Specified Perils Deductible </span><span style="display: inline-block; padding-left:193px">{{coiForm.SpecialPerils}}</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:25px; margin-left:55px; font-size:18px;">
        <el-col :span="20">
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="">OPCFs: </span><span style="display: inline-block; padding-left:30px">{{coiForm.OPCFs}}</span></div>
          <!--
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="">OPCF# 23A Lienholder </span><span style="display: inline-block; padding-left:330px">{{coiForm.OPCF23}}</span></div>
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="">OPCF5- Permission to Rent or Lease Automobiles </span><span style="display: inline-block; padding-left:138px">{{coiForm.OPCF5}}</span></div>
          <-->
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:25px; margin-left:55px; font-size:18px;">
        <el-col :span="20">
          <!--<div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="">{{coiForm.LessorType}}</span><span style="font-weight: bold;">{{coiForm.Lessor}}</span><span style="display: inline-block; padding-left:40px;font-weight: bold;">{{coiForm.LessorType}}</span><span style="display: inline-block; padding-left:100px;font-weight: bold;"> LR = Lessor  LH = Lienholder</span></div>-->
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="">{{coiForm.LessorType}}: </span><span style="font-weight: bold;">{{coiForm.Lessor}}</span></div>
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="">Address: </span><span style="font-weight: bold;">{{coiForm.Street}}</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:15px; margin-left:55px; font-size:18px;">
        <el-col :span="20">
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="">We for any further details, please forward your request via fax to 1-888-233-3218.</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:55px; margin-left:80px; font-size:18px;">
        <el-col :span="20">
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span style="">Sincerely,</span></div>
          <div class="viewMemo-subtitle head" style="margin-top: 50px"><span style="padding-left:23px;">Signature: _____________________</span></div>
          <div class="viewMemo-subtitle head" style="margin-top: 30px"><span style="padding-left:44px;">Name: _____________________</span></div>
          <div class="viewMemo-subtitle head" style="margin-top: 30px"><span style="padding-left:46px;">Title: ______________________</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="printDateInFoot">
        <el-col>
          <div style="margin-top: 20px; padding-right:50px;">
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
  name: 'coi',
  data: function () {
    return {
      printDate: null,
      Author: JSON.parse(this.$store.getters.getAccount).Name,
      coiForm: {
        BranchStreet: 'BranchStreet',
        BranchCity: 'BranchCity',
        BranchPostcode: '',
        BranchTel: 'BranchTel',
        BranchEmail: 'Emial: info@chatin.ca',
        Website: 'http://www.chatin.ca',
        CurrentDate: 'CurrentDate',
        Lessor: 'Lessor',
        LessorType: 'LR',
        Street: 'Street',
        City: null,
        Owner: 'Owner',
        InsuranceCompany: 'InsuranceCompany',
        PolicyNumber: 'PolicyNumber',
        EffectiveDate: 'Month Day, Year',
        ExpiryDate: 'ExpiryDaate',
        VehicleInfo: '(vehicle\'s year, make, model and VIN#)',
        ThirdParty: '',
        AllPerils: '',
        Collision: '',
        Comprehensive: '',
        SpecialPerils: '',
        OPCFs: '',
        OPCF23: 'Excluded',
        OPCF5: 'Excluded'
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
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetViewMemo', {memoid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.coiFormVisible = true
          // this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
          // })
          this.coiForm.CurrentDate = moment(new Date()).format('MMMM DD, YYYY')
          let memo = res.data
          let insuranceCorp = this.insuranceCorps.find(item => item.InsuranceCorpID === memo.InsuranceCorpID)
          this.coiForm.InsuranceCompany = insuranceCorp.Name
          this.coiForm.InsuranceCorpAddress = insuranceCorp.Address
          this.coiForm.EffectiveDate = moment(memo.EffectiveDate).format('MMMM DD, YYYY')
          this.coiForm.ExpiryDate = moment(memo.EffectiveDate).add(30, 'days').format('MMMM DD, YYYY')
          // this.coiForm.Dates = EffectiveDate + '           ' + ExpiryDate
          let expirydate = memo.answers.find(a => a.QuestionDesc.indexOf('Policy Expiry Date') >= 0)
          if (expirydate !== undefined) this.coiForm.ExpiryDate = moment(expirydate.AnswerDesc).format('MMMM DD, YYYY')

          this.coiForm.PolicyNumber = memo.PolicyNumber
          // this.coiForm.InsuredName = memo.NameInsured
          // this.coiForm.InsuredAddress = memo.AddressInsured
          this.coiForm.Broker = memo.branch.Name
          if (memo.branch !== undefined) {
            let address = memo.branch.Address
            let addlist = address.split(',')
            let add1 = addlist.slice(0, -2)
            let add2 = addlist.slice(-2)
            this.coiForm.BranchStreet = add1.join(',')
            this.coiForm.BranchCity = add2.join(',')
            this.coiForm.BranchPostcode = memo.branch.PostCode
            this.coiForm.BranchTel = 'Tel: ' + memo.branch.Telphone
          }
          let insuredname = memo.NameInsured
          let answer0 = memo.answers.find(a => a.QuestionDesc.indexOf('Last name') > 0)
          if (answer0 !== undefined) insuredname = answer0.AnswerDesc
          this.coiForm.Owner = insuredname
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
          this.coiForm.VehicleInfo = vehicleYear + ' ' + vehicleMake + ' ' + vehicleModel + ' ' + vin
          answer = memo.answers.find(a => a.QuestionDesc === 'Address Line 1:')
          if (answer !== undefined) this.coiForm.InsuredAddress = answer.AnswerDesc
          answer = memo.answers.find(a => a.QuestionDesc === 'Address Line 2:')
          if (answer !== undefined) this.coiForm.InsuredCity = answer.AnswerDesc
          answer = memo.answers.find(a => a.QuestionDesc.indexOf('Lessor Name') >= 0)
          if (answer !== undefined) {
            this.coiForm.Lessor = answer.AnswerDesc
            this.coiForm.LessorType = 'Lessor'
          } else {
            answer = memo.answers.find(a => a.QuestionDesc.indexOf('Lienholder Name') >= 0)
            if (answer !== undefined) {
              this.coiForm.Lessor = answer.AnswerDesc
              this.coiForm.LessorType = 'Lienholder'
            }
          }
          let address
          answer = memo.answers.find(a => a.QuestionDesc.indexOf('Lessor Address') >= 0)
          if (answer !== undefined) address = answer.AnswerDesc
          else {
            answer = memo.answers.find(a => a.QuestionDesc.indexOf('Lienholder Address') >= 0)
            if (answer !== undefined) address = answer.AnswerDesc
          }
          if (address !== undefined) {
            // let addlist = address.split(',')
            // let add1 = addlist.slice(0, -3)
            // let add2 = addlist.slice(-2)
            // this.coiForm.Street = add1.join(',')
            // this.coiForm.City = add2.join(',')
            this.coiForm.Street = address
          }
          answer = memo.answers.find(a => a.QuestionDesc.indexOf('Owner of the new vehicle') >= 0)
          if (answer !== undefined) this.coiForm.Owner = answer.AnswerDesc
          answer = memo.answers.find(a => a.QuestionDesc.indexOf('Liability Coverage') >= 0)
          if (answer !== undefined) {
            let list = answer.AnswerDesc.split('::')
            if (list[0] === '68') this.coiForm.ThirdParty = '$1,000,000'
            else if (list[0] === '69') this.coiForm.ThirdParty = '$2,000,000'
            else this.coiForm.ThirdParty = answer.Addition
          }
          answer = memo.answers.find(a => a.QuestionDesc.indexOf('Physical Damage Coverage') >= 0)
          if (answer !== undefined) {
            let values = answer.Addition.split('|')
            let list = answer.AnswerDesc.split('|')
            list.forEach(a => {
              if (a.indexOf('All') >= 0) {
                let val = values.shift()
                this.coiForm.AllPerils = val === 0 ? '' : '$' + val
              } else if (a.indexOf('Com') >= 0) {
                let val = values.shift()
                this.coiForm.Comprehensive = val === 0 ? '' : '$' + val
              } else if (a.indexOf('Col') >= 0) {
                let val = values.shift()
                this.coiForm.Collision = val === '' ? '' : '$' + val
              }
            })
          }
          answer = memo.answers.find(a => a.QuestionDesc.indexOf('OPCFs') >= 0)
          if (answer !== undefined) {
            let opcfs = answer.AnswerDesc.replaceAll(/Limit:/g, '')
            opcfs = opcfs.replaceAll(/[0-9]+::/g, '')
            opcfs = opcfs.replace('|Accident Waiver (if applicable)', '')
            opcfs = opcfs.replace('|Anymore?', '')
            opcfs = opcfs.replaceAll(/\.|\s/g, '')
            opcfs = opcfs.replaceAll(/\$[0-9]*/g, '')
            this.coiForm.OPCFs = opcfs.replaceAll('|', ', ')
          }
          answer = memo.answers.find(a => a.QuestionDesc.indexOf('Is this vehicle leased, financed or owned') >= 0)
          if (answer !== undefined) {
            if (answer.AnswerDesc.indexOf('Financed')) this.coiForm.OPCF5 = 'Included'
            else if (answer.AnswerDesc.indexOf('Leased')) this.coiForm.OPCF23 = 'Included'
          }
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
      this.getPdf('#coiDom')
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
