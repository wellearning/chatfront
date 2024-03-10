<template>
  <div>
    <div class="printDiv" >
      <el-button icon="el-icon-document" type="primary" @click="toPDF('Questionnaire', printDate)" size="small">Print</el-button>
    </div>
    <div class="viewQuestionnaire" id="questionnaireDom" v-if="businessObj !== null" style="margin-top:0px;">
      <img class="coiLogo" :src="logo" crossorigin="anonymous">
      <el-row :gutter="20" style="margin-top:-01px; margin-left:402px; color: steelblue; text-align: right; font-size:14px;">
        <el-col :span="10">
          <div class="viewMemo-subtitle head">{{producer.institution.Telphone}}</div>
          <div class="viewMemo-subtitle head">{{producer.institution.Email}}</div>
          <div class="viewMemo-subtitle head">{{producer.institution.Website}}</div>
        </el-col>
        <el-col :span="10">
          <div class="viewMemo-subtitle head">{{producer.institution.Address}}</div>
          <div class="viewMemo-subtitle head">{{producer.institution.CityProv}}</div>
          <div class="viewMemo-subtitle head">{{producer.institution.PostCode}}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:20px; margin-left:55px; ">
        <el-col :span="12">
          <div class="viewMemo-subtitle head">{{currentDate.format("LL")}}</div>
          <div class="viewMemo-subtitle head">{{businessObj.NameInsured}}</div>
          <div class="viewMemo-subtitle head">{{businessObj.Address}}</div>
          <div class="viewMemo-subtitle head">{{businessObj.City + ', ' + businessObj.Province + ', ' + businessObj.PostCode}}</div>
        </el-col>
        <el-col :span="12">
          <div style="border-width: thin;border-style: solid; text-align: center; font-weight:bold;margin-right:20px; padding:40px;">Policy Renewal Questionnaire
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:40px; margin-left:55px; font-family: Corbel; font-size: 20px; font-weight:bold; text-align: left">
        <el-col :span="2">
          <div>Re:</div>
        </el-col>
        <el-col :span="22">
          <div>Your policy {{businessObj.CorpName}} {{businessObj.PolicyNumber}} expiry on {{businessObj.ExpiryDate.format("LL")}}</div>
          <div style="font-weight:normal;">Business location at {{businessObj.Address}} {{businessObj.City}} .{{businessObj.Province}}  {{businessObj.PostCode}}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:20px; margin-left:55px; font-size:18px; font-weight: normal;">
        <div>Dear Insured,</div>
      </el-row>
      <el-row :gutter="20" style="margin-top:10px; margin-left:55px; font-size:18px; font-weight: normal;">
        <div>Please be advised the above-mentioned policy will be expire on {{businessObj.ExpiryDate.format("LL")}} and we are preparing for renewal.</div>
      </el-row>
      <el-row :gutter="20" style="margin-top:20px; margin-left:55px; font-size:18px; font-weight: normal;">
        <div>In order for us to obtain renewal quotes and/or seek an alternative quote in your favor, we require updated information
          at least 30 to 45 days prior to the policy expiration. Please complete the below questionnaire.
        </div>
      </el-row>
      <el-row :gutter="20" style="margin-top:20px; margin-left:40px; margin-right:60px; word-break: break-word; font-weight: normal;">
        <div id="questionnaire">
        </div>
      </el-row>
      <el-row :gutter="20" style="margin-top:20px; margin-left:55px; font-size:19px; ">
        Please sign and return the completed form to Commercial Lines Department via fax or email to info@chatin.ca
      </el-row>
      <el-row :gutter="20" style="margin-top:10px; margin-left:55px; font-size:18px;">
        <el-col :span="8">
          <div style="border-width: 2px;border-bottom-style: solid;padding-top:20px;"></div>
        </el-col>
        <br>Client Signature and Date
      </el-row>
      <el-row :gutter="20" style="margin-top:0px; margin-left:55px; font-size:18px;">
        <p>
          Unless we are advised otherwise, the renewal will be handled in accordance with expiring terms & limits.
        Therefore, it is very important that you review your policy to ensure your coverage is still adequate. If you
          have any questions, please contact your broker {{producer.Name}}.</p>
        <p>
          We trust that you will find the above in order. Finally, from all of us at CHAT Insurance Services Inc., we thank you for
          this opportunity for choosing us as your insurance provider and look forward to your continued support!
        </p>
        <p>
          Sincerely.
        </p>
        <div>
          {{producer.Name}}
          Associated Broker
        </div>
        <p>
          CHAT Insurance Services Inc.
        </p>
      </el-row>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import $ from 'jquery'
export default {
  name: 'coi',
  data: function () {
    return {
      currentDate: moment(new Date()),
      printDate: null,
      Author: JSON.parse(this.$store.getters.getAccount).Name,
      logo: '/api' + JSON.parse(this.$store.getters.getAccount).institution.FormLogoUrl + '?time=' + moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      root: JSON.parse(this.$store.getters.getAccount).rootInstitution,
      branch: JSON.parse(this.$store.getters.getAccount).institution,
      businessObj: null,
      // email: this.branch.Email === null ? this.root.Email : this.branch.Email,
      application: {
        BranchStreet: 'BranchStreet',
        BranchCity: 'BranchCity',
        BranchPostcode: '',
        BranchTel: 'BranchTel',
        BranchEmail: 'Email:',
        Website: 'Website:',
        CurrentDate: 'CurrentDate',
        Lessor: 'Lessor',
        LessorType: 'LR',
        Street: 'Street',
        City: null,
        Owner: 'Owner',
        InsuranceCompany: 'InsuranceCompany',
        PolicyNumber: 'PolicyNumber',
        EffectiveDate: 'Month Day, Year',
        ExpiryDate: 'ExpiryDate',
        VehicleInfo: '(vehicle\'s year, make, model and VIN#)',
        ThirdParty: '',
        AllPerils: '',
        Collision: '',
        Comprehensive: '',
        SpecialPerils: '',
        OPCFs: '',
        OPCF23: 'Excluded',
        OPCF5: 'Excluded'
      },
      questions: [],
      producer: {
        institution: {
          Address: '',
          PostCode: '',
          Telephone: '',
          Email: '',
          Website: '',
          LogoUrl: ''
        }
      }
    }
  },
  props: {
    applicationid: {
      type: Number
    },
    insuranceCorps: {
      type: Array
    }
  },
  mounted: function () {
    this.loadApplication(this.applicationid)
  },
  methods: {
    createQuestionnaire: function () {
      let $root = $('#questionnaire')
      let index = 0
      this.questions.forEach(q => {
        index++
        let $question = $('<div style="margin-left:30px;"></div>')
        $root.append($question)
        let $label = $('<span class="question">' + index + '. </span>')
        $question.append($label)
        if (q.TypeID === 3) {
          let $des = $('<span class="question">' + q.Description + ' </span>')
          $question.append($des)
          if (q.InputType === 'checklist') {
            let $table = $('<table></table>')
            $question.append($table)
            let $tbody = $('<tbody></tbody>')
            $table.append($tbody)
            this.createCheckList(q, $tbody)
          } else {
            let $input = $('<input type="text" style="border:none; border-bottom:1px solid #000000; width: 120px;" />')
            $question.append($input)
          }
        } else if (q.TypeID === 5) {
          let $des = $('<span class="question">' + q.Description + ' </span>')
          $question.append($des)
        } else if (q.TypeID === 6) {
          let $des = $('<span class="question">' + q.Description + ' </span>')
          $question.append($des)
          q.options.forEach(item => {
            let $cb = $('<input type="checkbox"/> <label>' + item.Content + ' </label>')
            $question.append($cb)
            if (item.Tips !== null) {
              let $tips = $('<span>' + item.Tips + '</span>')
              $question.append($tips)
            }
            if (item.NeedAddition) {
              let $addi = $('<input type="text" placeholder="" style="border:none; border-bottom:1px solid #000000; width: 120px;" />')
              $question.append($addi)
            }
          })
          if (q.Tips !== null) {
            let $qtips = $('<span>' + q.Tips + '</span>')
            $question.append($qtips)
          }
        }
      })
    },
    createCheckList: function (question, $tbody) {
      let service = '/api/Services/baseservice.asmx/GetDataItems'
      let param = { datatype: question.DataSource }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadDataSource', res)
          let checklist = res.data
          let tdindex = 0
          let $tr = null
          checklist.forEach(item => {
            if (tdindex === 0) {
              let $tr0 = $('<tr></tr>')
              $tbody.append($tr0)
              $tr = $tr0
            }
            let $td1 = $('<td></td>')
            $td1.text(item.Name)
            let $td2 = $('<td><input type="checkbox"></input> Yes <input type="checkbox"></input> No</td>')
            $tr.append($td1).append($td2)
            if (tdindex === 2) {
              tdindex = 0
            } else {
              tdindex++
            }
          })
        }
      }).catch(err => {
        console.log('GetDictionary', err)
        // this.isLoadingDataSource = false
      })
    },

    loadProducer: function () {
      let service = '/api/Services/baseservice.asmx/GetStaff'
      let producerid = this.businessObj.StaffID
      if (this.businessObj.ProducerID !== undefined) producerid = this.businessObj.ProducerID
      let para = {staffid: producerid}
      this.isLoading = true
      this.axios.post(service, para).then(res => {
        if (res) {
          console.log('producer', res)
          this.producer = res.data
          let index = res.data.institution.Address.indexOf(',')
          this.producer.institution.CityProv = res.data.institution.Address.substring(index + 1)
          this.producer.institution.Address = res.data.institution.Address.substring(0, index)
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadProducer出错', err)
        this.isLoading = false
      })
    },
    loadQuestionnaire: function () {
      let service = '/api/Services/baseservice.asmx/GetBlock'
      let blockid = this.businessObj.QuestionnaireID
      let para = {blockid: blockid}
      this.isLoading = true
      this.axios.post(service, para).then(res => {
        if (res) {
          console.log('questionnaire', res)
          this.questions = []
          res.data.blockQuestions.forEach(bq => {
            this.questions.push(bq.question)
          })
          this.createQuestionnaire()
        }
        console.log('questions', this.questions)
        this.isLoading = false
      }).catch(err => {
        console.log('loadProducer出错', err)
        this.isLoading = false
      })
    },
    loadApplication: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationFrame', {applicationid: id}).then(res => {
        if (res) {
          console.log('loadApplication', res)
          this.businessObj = res.data
          let corp = this.insuranceCorps.find(c => c.InsuranceCorpID === this.businessObj.InsuranceCorpID)
          if (corp !== undefined) this.businessObj.CorpName = corp.Name
          this.businessObj.ExpiryDate = moment(this.businessObj.ExpiryDate)
          this.loadProducer()
          this.loadQuestionnaire()
          this.isLoading = false
        }
      }).catch(err => {
        console.log('loadApplication出错', err)
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
      this.getPdf('#questionnaireDom')
    }

  }
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 1000px;
  border: 2px solid rgb(140 140 140);
  font-family: 'Roboto Thin';
  font-size: 0.8rem;
  letter-spacing: 0px;
}
td {
  border: 1px solid rgb(160 160 160);
  padding: 4px 5px;
}
</style>
