<template>
  <div>
    <el-row :gutter="20"  style="margin-top:0px; margin-left:52px; font-family: Corbel; font-size: 20px; font-weight:bold; text-align: center">
      <el-col :span="21" v-if="sheets.length === 0"><div>No Form available</div></el-col>
      <el-col :span="21" v-else-if="sheetSelectedVisible">
        <el-radio-group v-model="currentSheet" @change="changeSheet()">
          <el-radio v-for="(item, index) in sheets" v-bind:key="index" :label="index">
            <span>{{item.Title}}</span>
          </el-radio>
        </el-radio-group>
      </el-col>
      <el-col :span="21" v-else><div>&nbsp;</div></el-col>
      <el-col :span="3"><span style="font-size:16px; font-weight:normal; text-align: right"></span></el-col>
    </el-row>
    <div class="printDiv" v-if="sheetVisible">
      <!--el-button icon="el-icon-document" type="primary" @click="toPDF()" size="small">Print</el-button>
      <el-button-- v-if="businessTypeId === 4" icon="el-icon-document" type="primary" @click="downloadPDF()" size="small">toPdf</el-button-->
      <el-button icon="el-icon-printer" type="primary" v-print="printObj" size="small">Print</el-button>
    </div>
    <div class="viewSheet" id="sheetDom" v-if="sheetVisible">
      <img class="coiLogo" :src="logo" crossorigin="anonymous">
      <el-row :gutter="20" style="border-bottom:solid #0000ff 2px; margin-top:20px;  margin-left:10px; margin-right:20px; color: steelblue; text-align: right; font-size:14px;">
        <el-col :span="24">
          <!--div class="viewMemo-subtitle head">ID: {{businessObjId}}</div-->
          <div class="viewMemo-subtitle head">{{sheetForm.BranchStreet}}{{sheetForm.BranchCity}} {{sheetForm.BranchPostcode}}</div>
          <div class="viewMemo-subtitle head">Bus: {{sheetForm.BranchTel}} Email: {{sheetForm.BranchEmail}} Website: {{sheetForm.Website}}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:8px; margin-left:402px; color: steelblue; text-align: center; font-size:14px;">
        <el-col :span="24">
          <div class="viewMemo-subtitle head"></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin:65px; margin-left:52px; font-family: Corbel; font-size: 20px; font-weight:bold; text-align: center">
        <el-col :span="22">
          <div class="viewMemo-subtitle head" style="margin-left:30px;"><span>{{sheet.title}}</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:20px; margin-left:26px;font-weight:normal; font-size:14px; text-align: left">
        <el-col :span="24">
          <div v-if="sheet.TypeID === 0">{{'Broker: ' + producer.Name + ', Email: ' + producer.Email}}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top:4px; margin-left:24px; margin-right:64px; font-size:14px; font-weight: normal;">
        <el-col :span="24">
          <div id="sheet" style="margin-bottom:100px;font-family: Corbel">
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="foot printDateInFoot">
        <el-col>
          <!--b>{{'Broker: ' + producer.Name + ', Email: ' + producer.Email}}, {{'AppID: ' + businessObjId}}</b><br /-->
          <span>{{'AppID: ' + businessObjId}}， Printed by {{Author}} on {{printDate}}</span>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import $ from 'jquery'
export default {
  name: 'sheet',
  data: function () {
    return {
      autoPageDepart: true,
      printDate: null,
      printObj: {
        id: 'sheetDom',
        popTitle: ''
      },
      currentDate: moment(new Date()).format('MMMM DD, YYYY'),
      Author: JSON.parse(this.$store.getters.getAccount).Name,
      logo: '/api' + JSON.parse(this.$store.getters.getAccount).institution.FormLogoUrl + '?time=' + moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      businessObj: null,
      currentSheetId: null,
      producer: {StaffID: 0, Name: ''},
      templateId: 0,
      typeID: 0,
      sheet: {
        title: '',
        tables: [
          {
            title: '',
            trs: [
              {
                tds: [
                  {colspan: 2, text: 'Date: 7/31/2023'},
                  {rowspan: 3, colspan: 4, text: 'Producer: Nancy'},
                  {colspan: 2, text: 'Email: commercial@chatin.ca'},
                  {colspan: 4, text: 'Marketer/Contactor: CHAT C/L Team'}
                ]
              }
            ]
          },
          {
            title: 'Applicant:',
            trs: [
              {
                tds: [
                  {colspan: 12, text: 'Name of Applicant: BBC Broadcast ltd'},
                  {colspan: 12, text: 'Prospect/Client Code(must be provided): 531245'}
                ]
              },
              {
                tds: [
                  {colspan: 8, text: 'Person Contact: Julia'},
                  {colspan: 8, text: 'Phone #: 916-533-2345'},
                  {colspan: 8, text: 'Email: bbc@hotmail.com'}
                ]
              },
              {
                tds: [
                  {colspan: 24, text: 'MailAddress: 123 Sheperd North York, On.'}
                ]
              },
              {
                tds: [
                  {colspan: 24, text: 'Risk1 Location: 123 Sheperd North York, On.'}
                ]
              },
              {
                tds: [
                  {colspan: 24, text: 'Describe of Business Operation: On dollar mart'}
                ]
              },
              {
                tds: [
                  {colspan: 24, text: 'Describe any details related to Business Activity: On dollar mart.'}
                ]
              }
            ]
          },
          {
            title: 'LOSS HISTORY',
            tr: {
              ths: [{th: 'Data of loss'}, {th: 'Details'}, {th: 'Paid out'}]
            },
            values: '{{LossHistory}}'
          }
        ]
      },
      sheetForm: {
        BranchTel: JSON.parse(this.$store.getters.getAccount).institution.Telphone,
        BranchEmail: JSON.parse(this.$store.getters.getAccount).institution.Email,
        Website: JSON.parse(this.$store.getters.getAccount).institution.Website,
        BranchStreet: JSON.parse(this.$store.getters.getAccount).institution.Address,
        BranchCity: '',
        BranchPostcode: JSON.parse(this.$store.getters.getAccount).institution.PostCode
      },
      sheetVisible: true,
      sheetSelectedVisible: false,
      currentSheet: null,
      sheets: {},
      repeatedCount: 0,
      loadArrayCount: 0 // Array table 需要异步加载，这个是控制其完全加载的参数
    }
  },
  props: {
    sheetId: {
      type: Number
    },
    businessObjId: {
      type: Number
    },
    businessTypeId: {
      type: Number
    },
    sheetTypeId: {
      type: Number
    }
  },
  mounted: function () {
    this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    if (this.sheetId !== undefined) {
      this.currentSheetId = this.sheetId
      this.loadSheet(this.sheetId)
    }
    if (this.businessObjId !== undefined) {
      this.loadBusinessObj(this.businessObjId)
    }
  },
  methods: {
    IsDate (dateVal) {
      if (dateVal === undefined) return false
      if (dateVal === null) return false
      if (dateVal.length > 12 && isNaN(dateVal) && !isNaN(Date.parse(dateVal))) return true
      else return false
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    start: function () {
      console.log('start')
    },
    changeSheet: function () {
      let index = this.currentSheet
      let sheet = this.sheets[index]
      // this.sheetId = sheet.SheetID
      this.currentSheetId = sheet.SheetID
      let sheetContent = JSON.parse(sheet.Content)
      let s = this.parseSheet(sheetContent)
      this.sheet = s
      this.sheetVisible = true
      this.createSheet(s)
    },
    getArrayAnswer: function (title, index) {
      let patt = /{{\d+}}/
      let maList = title.match(patt)
      if (maList.length === 0) return undefined
      let ma = maList[0]
      let p = ma.replace(/{{|}}/g, '')
      let qid = Number(p)
      if (index === undefined) index = 0
      let answer = this.businessObj.answers.filter(a => a.QuestionID === qid)[index]
      return answer
    },
    getTableVisible: function (table, index) {
      let patt = /\[\[\d+\]\]/
      let maList = table.title.match(patt)
      if (maList === null) return true
      let ma = maList[0]
      table.title = table.title.replace(patt, '')
      let p = ma.replace(/\[\[|\]\]/g, '')
      let qid = Number(p)
      if (index === undefined) index = 0
      let answer = this.businessObj.answers.filter(a => a.QuestionID === qid)[index]
      if (answer === undefined) return false
      if (answer.StatusID === 1) return true
      else return false
    },
    replaceAttribute: function (text, index) {
      let patt = /{{(\d+\.)?\w+}}/g
      let maList = text.match(patt)
      if (maList === null) return text
      for (let i = 0; i < maList.length; i++) {
        let ma = maList[i]
        let p = ma.replace(/{{|}}/g, '')
        let value = ''
        if (p.indexOf('.') > 0) {
          let qid = Number(p.substring(0, p.indexOf('.')))
          let outputway = p.substring(p.indexOf('.') + 1)
          if (qid === 756) {
            console.log(qid)
          }
          let answer = this.businessObj.answers.find(a => a.QuestionID === qid && a.StatusID === 1)
          if (index !== undefined) {
            answer = this.businessObj.answers.find(a => a.RepeatedID === index && a.QuestionID === qid && a.StatusID === 1)
            // if (answer === undefined) return null
          }
          if (answer === undefined) {
            text = text.replace(ma, '')
            continue
          }
          if (answer.InputType === 'array') {
            continue
          }
          if (answer.TypeID === 3) {
            if (answer.InputType === 'money') {
              value = '$' + Number(answer.AnswerDesc).toLocaleString()
            } else if (answer.InputType === 'date') {
              value = this.dateFormat(answer.AnswerDesc)
            } else value = answer.AnswerDesc
          } else if (answer.TypeID === 5) {
            if (outputway === 'Orig') {
              value = ''
              answer.partAnswers.forEach(p => {
                value += ' ' + this.parseFillinPart(p)
              })
            } else {
              let partAnswer = answer.partAnswers.find(p => p.IsFillin)
              if (partAnswer !== undefined) {
                value = this.parseFillinPart(partAnswer)
                // if (partAnswer.InputType === 'money') value = '$' + Number(partAnswer.Part).toLocaleString()
                // else value = partAnswer.Part
              } else value = ''
            }
          } else if (answer.TypeID === 6) {
            let optionAnswer = answer.optionAnswers.find(oa => oa.IsChecked)
            if (optionAnswer === undefined) optionAnswer = {Content: '', Outputs: '', Addition: ''}
            if (optionAnswer.Addition === null) optionAnswer.Addition = ''
            if (outputway === 'Ans') value = optionAnswer.Content
            else if (outputway === 'Out') {
              if (optionAnswer.Outputs === null) optionAnswer.Outputs = ''
              value = optionAnswer.Outputs.replace('{addition}', optionAnswer.Addition)
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
          } else {
            value = answer.AnswerDesc
          }
          // if (answer.InputType === 'date') {
          //  value = this.dateFormat(value)
          // }
          if (this.IsDate(value)) {
            // value = this.dateFormat(value)
            // let time = new Date(value)
            // value = moment(time).format('YYYY-MM-DD')
          }
          // text = text.replace(ma, value)
        } else if (this.businessObj[p] !== undefined) {
          let prop = this.businessObj[p]
          if (prop === null) prop = ''
          if (p.indexOf('Date') >= 0) {
            prop = moment(prop).format('YYYY-MM-DD')
            let date = moment(prop)
            if (date.year() < 2001) prop = ''
          }
          value = prop
        }
        if (value === null) value = ''
        value = '<span style = "font-weight: bold;">' + value + '</span>'
        text = text.replace(ma, value)
      }
      return text
    },
    parseFillinPart: function (p) {
      let value = ''
      if (p.IsFillin) {
        if (p.InputType === 'money') value = '$' + Number(p.Part).toLocaleString()
        else if (p.InputType === 'date') value = moment(p.Part).format('MMM Do YYYY')
        else value = p.Part
      } else {
        value = '<span style="font-weight: normal;">' + p.Part + '</span>'
      }
      return value
    },
    parseSheet: function (sheet) {
      if (this.businessObj === null) return sheet
      let sequenceTables = []
      let tableslist = []
      let tables = []
      tableslist.push(tables)
      for (let i = 0; i < sheet.tables.length; i++) {
        let table = sheet.tables[i]
        if (!table.repeatable) {
          tableslist.forEach(tables => {
            sequenceTables = sequenceTables.concat(tables)
          })
          tableslist = []
          let parsetable = this.parseTable(table)
          sequenceTables.push(parsetable)
          continue
        }
        // reorganize repeatable tables as a group
        for (let index = 0; index < this.repeatedCount; index++) {
          let t = this.parseTable(table, index)
          if (t !== null) {
            let tables = tableslist[index]
            if (tables === undefined) {
              tables = []
              tableslist.push(tables)
            }
            tables.push(t)
            // sheet.tables.splice(i, 0, t)
          } else {
            if (this.repeatedCount === 10 || index + 1 > this.repeatedCount) this.repeatedCount = index + 1
            break
          }
        }
      }
      // add the last tableslist to sequenceTables
      tableslist.forEach(tables => {
        sequenceTables = sequenceTables.concat(tables)
      })
      sheet.tables = sequenceTables
      return sheet
    },
    parseTable: function (table, index) {
      if (index !== undefined) {
        table = JSON.parse(JSON.stringify(table))
      }
      if (table.title === undefined) {
        table.title = ''
      }
      if (!this.getTableVisible(table, index)) return null
      let title = table.title
      for (let j = 0; j < table.trs.length; j++) {
        let tr = table.trs[j]
        for (let k = 0; k < tr.tds.length; k++) {
          let td = tr.tds[k]
          let text = td.text
          let span = '' + td.colspan
          let spans = span.split(',')
          if (spans.length > 1) {
            td.colspan = spans[0]
            td.rowspan = spans[1]
          }
          if (index !== undefined) {
            let value = this.replaceAttribute(text, index)
            if (value === null) {
              return null
            } else td.text = value
          } else td.text = this.replaceAttribute(text)
        }
      }

      if (title.indexOf('{{index}}') >= 0) {
        title = title.replace('{{index}}', index + 1)
        table.title = title
      }
      if (title.indexOf('{{') >= 0) {
        // the table is added by an array property
        let answer = this.getArrayAnswer(title, index)
        // 如果answer没有回答或跳过，则不显示该table
        // if (answer === undefined) return null
        // if (answer.StatusID !== 1) return null
        title = title.replace(/{{\d+}}/, '')
        table.title = title
        if (table.trs === undefined) table.trs = []
        if (answer !== undefined && answer.StatusID === 1) {
          let count = this.loadArrayCount
          count++
          this.loadArrayCount = count
          this.addArrayTable(answer, table)
        }
      }
      return table
    },
    addArrayTable: function (answer, table) {
      if (answer.DataSource === null || answer.DataSource === '') return
      this.isLoading = true
      // service = '/api/Services/baseservice.asmx/GetObjectProperties'
      // param = { parenttype: answer.DataSource }
      this.axios.post('/api/Services/BaseService.asmx/GetObjectProperties', {parenttype: answer.DataSource}).then(res => {
        if (res) {
          console.log('ArrayItems', res)
          let columns = res.data
          let tr = {tds: []}
          table.trs.push(tr)
          for (let i = 0; i < columns.length; i++) {
            if (columns[i].children.length > 0) columns[i].InputType = columns[i].children[0].Name
            else columns[i].InputType = 'text'
            let td = {text: columns[i].Name, colspan: 1}
            tr.tds.push(td)
          }
          let items = []
          if (answer.AnswerDesc !== null) items = JSON.parse(answer.AnswerDesc)
          items.forEach(function (item) {
            let tr = {tds: []}
            table.trs.push(tr)
            columns.forEach(c => {
              let value = item[c.Name]
              if (value === undefined) value = item[c.ItemValue]
              if (c.InputType === 'date' && value !== '') {
                value = moment(value).format('YYYY-MM-DD')
                let date = moment(value)
                if (date.year() < 1900) value = ''
              } else if (c.InputType === 'money' && value !== '') {
                value = '$' + Number(value).toLocaleString()
              } else if (c.InputType === 'moneyplus' && !isNaN(value)) {
                value = '$' + Number(value).toLocaleString()
              }
              let td = {text: '<b>' + value + '</b>', colspan: 1}
              tr.tds.push(td)
            })
            /*
            for (let name in item) {
              let value = item[name]
              if (name.indexOf('Date') >= 0) {
                value = moment(value).format('YYYY-MM-DD')
                let date = moment(value)
                if (date.year() < 2001) value = ''
              }

              let td = {text: '<b>' + value + '</b>', colspan: 1}
              tr.tds.push(td)
            }
             */
          })
        }
        this.isLoading = false
        let count = this.loadArrayCount
        count--
        this.loadArrayCount = count
        if (count === 0) this.createSheet()
      }).catch(err => {
        console.log('ArrayItems', err)
        this.isLoading = false
      })
    },
    createSheet: function (sheet) {
      let pageheight = 1586 // 1446
      let $sheetDom = $('#sheetDom')
      if (sheet === undefined) sheet = this.sheet
      let $sheet = $('#sheet')
      $sheet.children().remove()
      let autoPageDepart = this.autoPageDepart
      sheet.tables.forEach(function (table) {
        if (table === null) return
        let sheetheight = $sheetDom.height()
        // $sheet.append($('<div>' + sheetheight + '</div>'))
        let $div = $('<div style="margin-bottom: 20px"></div>')
        $sheet.append($div)
        if (table.title !== undefined) {
          let $title = $('<div style="font-weight: bold; font-size: 18px"></div>').text(table.title)
          $div.append($title)
        }
        let $table = $('<table border="1"  style="font-weight: normal;  font-size: 16px; word-break: keep-all; width: 730pt; min-height: 25px; line-height: 36px; text-align: left; border-collapse: collapse;">')
        if (sheet.TypeID === 1) {
          $table = $('<table border="0"  style="font-weight: normal;  font-size: 16px; word-break: keep-all; width: 730pt; min-height: 25px; line-height: 36px; text-align: left; border-collapse: collapse;">')
        }
        $div.append($table)
        table.trs.forEach(function (tr) {
          let $tr = $('<tr></tr>')
          $table.append($tr)
          tr.tds.forEach(function (td) {
            let $td = $('<td colspan="' + td.colspan + '">' + td.text + '</td>')
            if (td.rowspan !== undefined) $td.attr('rowspan', td.rowspan)
            $tr.append($td)
          })
        })
        if (autoPageDepart) {
          let tableheight = $div.height()
          let pageleft = sheetheight % pageheight
          let page = Math.floor(sheetheight / pageheight)
          if (tableheight + pageleft + 20 > pageheight) {
            let margintop = (pageheight - pageleft + 40)
            if (page === 0) margintop = margintop + 20
            $div.css('margin-top', margintop)
          }
        }
        // $div.append($('<div>' + tableheight + '</div>'))
      })
    },
    loadSheet: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      let service = '/api/Services/baseservice.asmx/GetSheet'
      let para = {sheetid: id}
      this.isLoading = true
      this.axios.post(service, para).then(res => {
        if (res) {
          console.log('sheet', res)
          let sheetContent = JSON.parse(res.data.Content)
          this.sheet = this.parseSheet(sheetContent)
          this.sheet.TypeID = res.data.TypeID
          if (this.loadArrayCount === 0) this.createSheet()
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadSheet error', err)
        this.isLoading = false
      })
    },
    loadProducer: function (producerid) {
      let service = '/api/Services/baseservice.asmx/GetStaff'
      if (producerid === undefined) producerid = this.businessObj.StaffID
      if (this.businessObj.ProducerID !== undefined) producerid = this.businessObj.ProducerID
      let para = {staffid: producerid}
      this.isLoading = true
      this.axios.post(service, para).then(res => {
        if (res) {
          console.log('producer', res)
          this.producer = res.data
          this.sheetForm.BranchTel = this.producer.institution.Telphone
          this.sheetForm.BranchEmail = this.producer.institution.Email
          this.sheetForm.Website = this.producer.institution.Website
          this.sheetForm.BranchStreet = this.producer.institution.Address
          this.sheetForm.BranchCity = ''
          this.sheetForm.BranchPostcode = this.producer.institution.PostCode
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadProducer error', err)
        this.isLoading = false
      })
    },
    loadBusinessObj: function (id, sheetTypeId) {
      this.isLoading = true
      $('#sheet').children().remove()
      if (sheetTypeId !== undefined) this.sheetTypeId = sheetTypeId
      this.sheet.title = ''
      this.sheetSelectedVisible = false
      // this.sheetVisible = false
      this.currentSheet = -1
      let server = '/api/Services/memoservice.asmx/GetViewMemo'
      let para = {memoid: id}
      if (this.businessTypeId === 2) {
        server = '/api/Services/businessService.asmx/GetCoverLetter'
        para = {coverletterid: id}
      } else if (this.businessTypeId === 4) {
        this.loadApplication(id)
        return
        // server = '/api/Services/CommerceService.asmx/GetViewApplication'
        // para = {applicationid: id}
      }
      this.axios.post(server, para).then(res => {
        if (res) {
          console.log('businessObj', res)
          this.businessObj = res.data
          this.loadSheets(id)
          this.loadProducer()
        }
        this.isLoading = false
      }).catch(err => {
        console.log('Get businessObj err', err)
        this.isLoading = false
      })
    },
    loadSheets: function (id) {
      this.isLoading = true
      let server = ''
      let para = null
      if (this.businessTypeId === 1) {
        server = '/api/Services/memoService.asmx/GetSheetsByType'
        para = {memoid: id, sheettypeid: this.sheetTypeId}
      } else if (this.businessTypeId === 4) {
        server = '/api/Services/CommerceService.asmx/GetApplicationSheets'
        para = {applicationid: id}
      } else return
      this.axios.post(server, para).then(res => {
        if (res) {
          console.log('loadSheets', res)
          this.sheets = res.data
          if (this.sheets.length === 1) {
            // this.sheetId = this.sheets[0].SheetID
            this.currentSheetId = this.sheets[0].SheetID
            let s = JSON.parse(this.sheets[0].Content)
            this.sheet = this.parseSheet(s)
            this.sheet.TypeID = this.sheets[0].TypeID
            this.sheetVisible = true
            this.createSheet(s)
          } else if (this.sheets.length > 1) {
            this.sheetSelectedVisible = true
          }
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadSheets error', err)
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
          this.loadCount = 0
          this.totalBlocks = 0
          // this.businessObj.RequestDate = moment(res.data.RequestDate).format('YYYY-MM-DD')
          // let effdate = moment(res.data.EffectiveDate)
          // if (effdate.year() > 2020) this.businessObj.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
          // else this.businessObj.EffectiveDate = ''
          this.businessObj.applicationTemplate.applicationBlocks.forEach(ablock => {
            if (ablock !== null) {
              this.loadApplicationBlock(ablock, id)
              if (this.repeatedCount <= ablock.RepeatedID) this.repeatedCount = ablock.RepeatedID + 1
            } else this.loadCount++
          })
          this.loadProducer(res.data.ProducerID)
          this.isLoading = false
        }
      }).catch(err => {
        console.log('loadApplication error', err)
        this.isLoading = false
      })
    },
    loadApplicationBlock: function (aBlock, id) {
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationBlock_net', {id: aBlock.ApplicationBlockID}).then(res => {
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
            this.loadSheets(id)
          }
        }
      }).catch(err => {
        console.log('GetApplicationBlock error', err)
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
    downloadPDF: function () {
      let effdate = moment(this.businessObj.EffectiveDate)
      let title = this.sheet.title.replaceAll(' ', '_')
      let filename = title + effdate.format('YYYYMMDD') + '.pdf'
      let arg2 = this.businessTypeId + '|' + this.currentSheetId
      this.downloadData('sheet', this.businessObjId, arg2, filename)
    },
    // 转pdf
    toPDF: function () {
      this.htmlTitle = this.sheet.title + this.printDate
      this.getPdf('#sheetDom')
      let typeid = 5
      if (this.businessTypeId === 4) typeid = 6
      this.axios.post('/api/Services/BaseService.asmx/CreatePrintRecord', {id: this.businessObjId, typeid: typeid}).then(res => {
        if (res) {
          console.log('create printRecord', res)
        }
      }).catch(err => {
        console.log('CreatePrintRecord error', err)
      })
    }

  }
}
</script>

<style scoped>

</style>
