<template>
  <div>
    <div class="printDiv" >
      <el-button icon="el-icon-document" type="primary" @click="toPDF('Questionnaire', printDate)" size="small">Print</el-button>
      <el-button icon="el-icon-document" :loading="isLoading"  type="primary" @click="downloadPDF()" size="small">Download</el-button>
      <el-button icon="el-icon-email" :loading="isLoading"  type="primary" @click="sendEmail()" size="small">SendEmail</el-button>
    </div>
    <div class="viewQuestionnaire" id="questionnaireDom" v-if="businessObj !== null" style="margin-top:0px;">
      <img class="coiLogo" :src="logo" crossorigin="anonymous">
      <el-row :gutter="20" style="margin-top:20px; margin-left:402px; color: steelblue; text-align: right; font-size:14px;">
        <el-col :span="22">
          <div class="viewMemo-subtitle head">{{branch.Address}}{{branch.CityProv}}{{branch.PostCode}}</div>
          <div class="viewMemo-subtitle head">Bus: {{branch.Telphone}}</div>
        </el-col>
        <!--el-col :span="10">
          <div class="viewMemo-subtitle head">{{producer.institution.Telphone}}</div>
          <div class="viewMemo-subtitle head">{{producer.institution.Email}}</div>
          <div class="viewMemo-subtitle head">{{producer.institution.Website}}</div>
        </el-col>
        <el-col :span="10">
          <div class="viewMemo-subtitle head">{{producer.institution.Address}}</div>
          <div class="viewMemo-subtitle head">{{producer.institution.CityProv}}</div>
          <div class="viewMemo-subtitle head">{{producer.institution.PostCode}}</div>
        </el-col-->
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
          <!--div style="font-weight:normal;">Business location at {{businessObj.Address}} {{businessObj.City}} .{{businessObj.Province}}  {{businessObj.PostCode}}</div-->
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
        <div id="questionnaire" :loading="isLoading" >
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
      isLoading: false,
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
    templateBlockID: {type: Number},
    repeatedID: {type: Number},
    objTypeID: {type: Number},
    questionnaireID: {type: Number},
    insuranceCorps: {
      type: Array
    }
  },
  mounted: function () {
    this.loadApplication(this.applicationid, this.repeatedID)
    // if (this.objTypeID === 0) this.loadApplication(this.applicationid)
    // else this.loadApplicationTemplate(this.applicationid, this.templateBlockID, this.repeatedID, this.questionnaireID)
  },
  methods: {
    replaceAttribute: function (text) {
      let patt = /{{(\d+\.)?\w+}}/g
      let maList = text.match(patt)
      if (maList === null) return text
      for (let i = 0; i < maList.length; i++) {
        let ma = maList[i]
        let p = ma.replace(/{{|}}/g, '')
        let value = ''
        let qid = 0
        if (p.indexOf('.') < 0) qid = Number(p)
        else qid = Number(p.substring(0, p.indexOf(/\.|\[/)))
        if (qid === 0) {
          if (this.businessObj[p] !== undefined) {
            let prop = this.businessObj[p]
            if (prop === null) prop = ''
            if (p.indexOf('Date') >= 0) {
              prop = moment(prop).format('YYYY-MM-DD')
              let date = moment(prop)
              if (date.year() < 2001) prop = ''
            }
            value = prop
            text = text.replace(ma, value)
          } else text = text.replace(ma, '')
          continue
        }
        let answer = this.businessObj.answers.find(a => a.QuestionID === qid)
        if (answer === undefined) {
          text = text.replace(ma, '')
          continue
        }
        if (answer.TypeID === 3) { // type of attribute
          let value = answer.AnswerDesc
          if (answer.InputType === 'array') {
            let index = 0
            let subpatt = /\[\d+\]/g
            let submaList = p.match(subpatt)
            if (submaList !== null) {
              index = Number(submaList[0].replace(/\[|\]/, ''))
            }
            let property = p.substring(p.indexOf('.') + 1)
            let objectList = JSON.parse(answer.AnswerDesc)
            let object = objectList[index]
            value = object[property]
          }
          if (value !== undefined) text = text.replace(ma, value)
          else text = text.replace(ma, '')
          continue
        } else {
          let outputway = p.substring(p.indexOf('.') + 1)
          value = answer.AnswerDesc
          if (answer.TypeID === 6) {
            let optionAnswer = answer.optionAnswers.find(oa => oa.IsChecked)
            if (optionAnswer === undefined) optionAnswer = {Content: '', Outputs: '', Addition: ''}
            if (outputway === 'Ans') value = optionAnswer.Content
            else if (outputway === 'Out') {
              value = optionAnswer.Outputs
            } else if (outputway === 'Addi') {
              if (optionAnswer.Addition === null || optionAnswer.Addition === '') value = optionAnswer.Content
              else value = optionAnswer.Addition
            } else if (outputway === 'Orig') {
              value = ''
              answer.optionAnswers.forEach(function (oa) {
                if (oa.IsChecked) value += ' &nbsp&nbsp&nbsp ☑ '
                else value += ' &nbsp&nbsp&nbsp ☐ '
                value += oa.Content
              })
            }
          } else if (answer.TypeID === 7) {
            value = ''
            answer.optionAnswers.forEach(function (oa) {
              if (oa.IsChecked) {
                value += ' &nbsp&nbsp ☑ ' + oa.Content
                if (oa.NeedAddition) value += oa.Addition
              } else value += ' &nbsp&nbsp ☐ ' + oa.Content
            })
          }
        }
        if (value === null) value = ''
        // value = '<span style = "font-weight: bold;">' + value + '</span>'
        text = text.replace(ma, value)
      }
      return text
    },
    createQuestionnaires: function (questionnaires) {
      let $root = $('#questionnaire')
      $root.children().remove()
      let riskid = 0
      questionnaires.forEach(qtn => {
        riskid++
        let $risk = $('<div style="margin:30px 20px 10px 10px;">Location#' + riskid + ': ' + qtn.RiskLocation + '</div>')
        $root.append($risk)
        let index = 0
        qtn.blockQuestions.forEach(bq => {
          let label = bq.Label
          let q = bq.question
          if (q.TypeID === 1) {
            label = ''
          } else if (bq.Label === null || bq.Label === '') {
            index++
            label = index + '.'
          } else {
            label = bq.Label
          }
          // index++
          this.createQuestion(bq, $root, label)
        })
      })
    },
    createQuestion: function (bq, $root, label) {
      let q = bq.question
      // let label = bq.Label
      let $question = $('<div style="margin-left:30px;"></div>')
      if (!(bq.Label === null || bq.Label === '')) {
        $question = $('<div style="margin-left:40px;"></div>')
        // label = index
      }
      $root.append($question)
      if (label !== '') {
        let $label = $('<span class="question">' + label + ' </span>')
        $question.append($label)
      }
      if (q.TypeID === 1) {
        let $des = $('<span class="question">' + q.Description + ' </span>')
        $question.append($des)
      } else if (q.TypeID === 2) {
        let $des = $(q.Description)
        $question.append($des)
      } else if (q.TypeID === 3) {
        let $des = $('<span class="question">' + q.Description + ' </span>')
        $question.append($des)
        if (q.InputType === 'checklist') {
          let $table = $('<table border="1"></table>')
          $question.append($table)
          let $tbody = $('<tbody></tbody>')
          $table.append($tbody)
          this.createCheckList(q, $tbody)
        } else {
          let $input = $('<input type="text" style="border:none; border-bottom:1px solid #000000; width: 120px;" />')
          $question.append($input)
        }
      } else if (q.TypeID === 4) {
        let $des = $('<span class="question">' + q.Description + ' </span>')
        $question.append($des)
        let $input = $('<br><input type="text" style="border:none; border-bottom:1px solid #000000; width: 100%;" />')
        $question.append($input)
      } else if (q.TypeID === 5) {
        let description = ''
        q.fillinParts.forEach(part => {
          if (part.IsFillin) {
            let length = Math.min(parseInt(part.Part) * 12, 300)
            description += '<input type="text" style="border:none; border-bottom:1px solid #000000; width: ' + length + 'px;" />'
          } else {
            description += part.Part
          }
        })
        let $des = $('<span class="question">' + description + ' </span>')
        $question.append($des)
      } else if (q.TypeID === 6) {
        let $des = $('<span class="question">' + q.Description + ' </span>')
        $question.append($des)
        q.options.forEach(item => {
          item.Content = this.replaceAttribute(item.Content)
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
    },
    createQuestionnaire: function () {
      let $root = $('#questionnaire')
      $root.children().remove()
      let index = 0
      this.questions.forEach(q => {
        let label = q.Label
        let $question = $('<div style="margin-left:40px;"></div>')
        if (q.Label === null || q.Label === '') {
          index++
          $question = $('<div style="margin-left:30px;"></div>')
          label = index
        }
        q.Description = this.replaceAttribute(q.Description)
        $root.append($question)
        let $label = $('<span class="question">' + label + '. </span>')
        $question.append($label)
        if (q.TypeID === 2) {
          let $des = $(q.Description)
          $question.append($des)
        } else if (q.TypeID === 3) {
          let $des = $('<span class="question">' + q.Description + ' </span>')
          $question.append($des)
          if (q.InputType === 'checklist') {
            let $table = $('<table border="1"></table>')
            $question.append($table)
            let $tbody = $('<tbody></tbody>')
            $table.append($tbody)
            this.createCheckList(q, $tbody)
          } else {
            let $input = $('<input type="text" style="border:none; border-bottom:1px solid #000000; width: 120px;" />')
            $question.append($input)
          }
        } else if (q.TypeID === 4) {
          let $des = $('<span class="question">' + q.Description + ' </span>')
          $question.append($des)
          let $input = $('<br><input type="text" style="border:none; border-bottom:1px solid #000000; width: 100%;" />')
          $question.append($input)
        } else if (q.TypeID === 5) {
          let description = ''
          q.fillinParts.forEach(part => {
            if (part.IsFillin) {
              description += '<input type="text" style="border:none; border-bottom:1px solid #000000; width: 120px;" />'
            } else {
              description += part.Part
            }
          })
          let $des = $('<span class="question">' + description + ' </span>')
          $question.append($des)
        } else if (q.TypeID === 6) {
          let $des = $('<span class="question">' + q.Description + ' </span>')
          $question.append($des)
          q.options.forEach(item => {
            item.Content = this.replaceAttribute(item.Content)
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
      let columns = Number(question.Tips)
      if (columns === 0) columns = 3
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadDataSource', res)
          let checklist = res.data
          let tdindex = 0
          let $tr = $('<tr></tr>')
          $tbody.append($tr)
          for (let i = 0; i < columns; i++) {
            let $td01 = $('<td></td>')
            let $td02 = $('<td style="word-break: keep-all">Yes</td>')
            let $td03 = $('<td style="word-break: keep-all">No</td>')
            $tr.append($td01).append($td02).append($td03)
          }
          /*
          let $td01 = $('<td></td>')
          let $td02 = $('<td style="word-break: keep-all">Yes</td>')
          let $td03 = $('<td style="word-break: keep-all">No</td>')
          let $td04 = $('<td></td>')
          let $td05 = $('<td style="word-break: keep-all">Yes</td>')
          let $td06 = $('<td style="word-break: keep-all">No</td>')
          let $td07 = $('<td></td>')
          let $td08 = $('<td style="word-break: keep-all">Yes</td>')
          let $td09 = $('<td style="word-break: keep-all">No</td>')
          $tr.append($td01).append($td02).append($td03).append($td04).append($td05).append($td06).append($td07).append($td08).append($td09)
           */
          checklist.forEach(item => {
            if (tdindex === 0) {
              let $tr0 = $('<tr></tr>')
              $tbody.append($tr0)
              $tr = $tr0
            }
            let $td1 = $('<td></td>')
            $td1.text(item.Name)
            let $td2 = $('<td><input type="checkbox"></input></td>')
            let $td3 = $('<td><input type="checkbox"></input></td>')
            $tr.append($td1).append($td2).append($td3)
            tdindex++
            if (tdindex === columns) {
              tdindex = 0
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
      // this.isLoading = true
      this.axios.post(service, para).then(res => {
        if (res) {
          console.log('producer', res)
          this.producer = res.data
          let index = res.data.institution.Address.indexOf(',')
          this.producer.institution.CityProv = res.data.institution.Address.substring(index + 1)
          this.producer.institution.Address = res.data.institution.Address.substring(0, index)
        }
        // this.isLoading = false
      }).catch(err => {
        console.log('loadProducer出错', err)
        this.isLoading = false
      })
    },
    loadQuestionnaires: function (id, repeatedid) {
      let service = '/api/Services/CommerceService.asmx/GetQuestionnaires'
      // let id = this.applicationid
      let para = {applicationid: id, repeatedid: repeatedid}
      // this.isLoading = true
      this.axios.post(service, para).then(res => {
        if (res) {
          console.log('questionnaires', res)
          let questionnaires = res.data
          this.createQuestionnaires(questionnaires)
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
            bq.question.Label = bq.Label
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
    loadApplication: function (id, repeatedid) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      let $root = $('#questionnaire')
      $root.children().remove()
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationFrame', {applicationid: id}).then(res => {
        if (res) {
          console.log('loadApplication', res)
          this.businessObj = res.data
          let corp = this.insuranceCorps.find(c => c.InsuranceCorpID === this.businessObj.InsuranceCorpID)
          if (corp !== undefined) this.businessObj.CorpName = corp.Name
          this.businessObj.ExpiryDate = moment(this.businessObj.ExpiryDate)
          this.loadQuestionnaires(id, repeatedid)
          /*
          if (this.businessObj.applicationTemplate.applicationBlocks.length === 0) {
            this.businessObj.answers = []
            this.loadQuestionnaire()
          } else {
            this.loadCount = 0
            this.totalBlocks = 0
            this.businessObj.applicationTemplate.applicationBlocks.forEach(ablock => {
              this.loadApplicationBlock(ablock, id)
            })
          }
           */
          this.loadProducer()
          // this.isLoading = false
        }
      }).catch(err => {
        console.log('loadApplication出错', err)
        this.isLoading = false
      })
    },
    loadApplicationTemplate: function (applicationid, templateblockid, repeatedid, questionnaireid) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationFrame', {applicationid: applicationid}).then(res => {
        if (res) {
          console.log('loadApplication', res)
          this.businessObj = res.data
          this.businessObj.QuestionnaireID = questionnaireid
          let corp = this.insuranceCorps.find(c => c.InsuranceCorpID === this.businessObj.InsuranceCorpID)
          if (corp !== undefined) this.businessObj.CorpName = corp.Name
          this.businessObj.ExpiryDate = moment(this.businessObj.ExpiryDate)
          this.loadQuestionnaire()
          if (this.businessObj.applicationTemplate.applicationBlocks.length === 0) {
            this.businessObj.answers = []
          } else {
            this.loadCount = 0
            this.totalBlocks = 0
            this.businessObj.applicationTemplate.applicationBlocks.forEach(ablock => {
              if (ablock.TopTemplateBlockID === templateblockid) {
                if (ablock.RepeatedID === repeatedid) {
                  this.loadApplicationBlock(ablock, applicationid)
                } else {
                  this.loadCount++
                }
              } else this.loadApplicationBlock(ablock, applicationid)
            })
          }
          this.loadProducer()
          this.isLoading = false
        }
      }).catch(err => {
        console.log('loadApplication出错', err)
        this.isLoading = false
      })
    },
    loadApplicationBlock: function (aBlock, id) {
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationBlock', {id: aBlock.ApplicationBlockID}).then(res => {
        if (res) {
          console.log('GetApplicationBlock', res)
          aBlock.answers = res.data.answers
          this.loadCount++
          aBlock.answers.forEach(function (answer) {
            answer.RepeatedID = aBlock.RepeatedID
            if (answer.TypeID === 6) {
              answer.optionAnswer = answer.optionAnswers.find(oa => oa.IsChecked)
            }
          })
          if (this.loadCount === this.businessObj.applicationTemplate.applicationBlocks.length) {
            this.resetAnswers()
            this.loadQuestionnaire()
          }
        }
      }).catch(err => {
        console.log('GetApplicationBlock列表出错', err)
        this.loadCount++
        // if (this.loadCount === this.applicationTemplate.templateBlocks.length) this.loadBlockQuestions(atemplate)
      })
    },
    resetAnswers: function () {
      let list = []
      this.businessObj.applicationTemplate.applicationBlocks.forEach(ablock => {
        let list1 = list.concat(ablock.answers)
        list = list1
      })
      this.businessObj.answers = list
      console.log('answers', list)
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
    sendEmail: function () {
      let service = '/api/Services/CommerceService.asmx/SendQuestionnaire'
      let applicationid = this.businessObj.ApplicationID
      let para = {applicationid: applicationid}
      this.isLoading = true
      this.axios.post(service, para).then(res => {
        if (res) {
          console.log('sendEmail', res)
        }
        this.isLoading = false
      }).catch(err => {
        console.log('sendEmail', err)
        this.isLoading = false
      })
    },
    downloadPDF: function () {
      let filename = 'questionnaire.pdf'
      this.downloadData('questionnaire', this.applicationid, filename, filename)
    },
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
table tr td  {
  border: 1px solid rgb(160 160 160);
  padding: 4px 5px;
}
</style>
