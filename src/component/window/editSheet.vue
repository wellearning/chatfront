<template>
  <div>
    <div class="editSheet" id="sheetDom">
      <el-row :gutter="20" style="margin-top:65px; margin-left:52px; font-family: Corbel; font-size: 20px; font-weight:bold; text-align: center">
        <el-col :span="24">
          <div class="viewMemo-subtitle head" style="margin-left:20px;">
            <!--span>{{sheetContent.title}}</span-->
            <el-form class="" label-width="10px" label-position="center" size="large">
              <el-form-item>
                <el-col :span="2">
                  <el-radio-group left v-model="TypeID">
                    <el-radio :label="0">
                      <span>Normal</span>
                    </el-radio>
                    <el-radio :label="1">
                      <span>Notes</span>
                    </el-radio>
                  </el-radio-group>
                </el-col>
                <el-col :span="10">
                  <el-input v-model="sheetContent.title" placeholder="Title of the form"   clearable></el-input>
                </el-col>
                <el-col :span="6">
                  <el-select v-model="currentQuestion" value-key="QuestionID" placeholder="Question" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
                    <el-option class="questionOption" v-for="item in questions" :key="item.QuestionID" :label="item.QuestionID + '. ' + item.Description" :value="item"></el-option>
                  </el-select>
                </el-col>
                <el-col :span="6">
                  <el-radio-group v-model="outputType">
                    <el-radio :label="1">
                      <span>Que</span>
                    </el-radio>
                    <el-radio :label="2">
                      <span>Ans</span>
                    </el-radio>
                    <el-radio :label="3">
                      <span>Out</span>
                    </el-radio>
                    <el-radio :label="4">
                      <span>Addi</span>
                    </el-radio>
                    <el-radio :label="5">
                      <span>Orig</span>
                    </el-radio>
                  </el-radio-group>
                </el-col>
              </el-form-item>
            </el-form>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="height:600px; overflow:auto; margin-top:40px; margin-left:84px; font-size:18px; font-weight: bold;">
        <el-col :span="24">
          <div id="sheet" v-for="(t, i) in sheetContent.tables" v-bind:key="i">
            <div>
              <!--span>{{t.title}}</span-->
              <el-form class="" label-width="0px" style="padding-top: 16px" label-position="center" size="large">
                <el-form-item>
                  <el-col :span="12">
                    <el-input v-model="t.title" placeholder="Title of the table" clearable></el-input>
                  </el-col>
                  <el-col :span="8">
                    <el-button-group>
                      <el-button size="small" type="primary" @click="addTableQ(t)">AddArrayQuestion</el-button>
                      <el-button size="small" type="primary" @click="addTableVisibleCondition(t)">AddVisibleQuestion</el-button>
                    </el-button-group>
                  </el-col>
                  <el-col :span="2">
                    <el-checkbox v-model="t.repeatable">Repeatable</el-checkbox>
                  </el-col>
                </el-form-item>
              </el-form>
            </div>
            <table border="1"  style="width: 730pt; min-height: 25px; line-height: 25px; text-align: center; border-collapse: collapse;">
              <tr v-for="(r,j) in t.trs" v-bind:key="j">
                <td v-for="(d,k) in r.tds" v-bind:key="k" >
                  {{d.text}}
                  <div>
                    <el-button icon="el-icon-arrow-left" v-if="k !== 0" type="primary" @click="leftCol(r, k)"  plain size="small" class="leftBtnGroup"></el-button>
                    <el-button icon="el-icon-arrow-right" v-if="k !== r.tds.length - 1" type="primary" @click="rightCol(r, k)"  plain size="small" class="leftBtnGroup"></el-button>
                    <el-button icon="el-icon-minus" type="primary" @click="delCol(r, k)"  plain size="small" class="leftBtnGroup"></el-button>
                  </div>
                </td>
                <td colspan="6">
                  <el-form class="searchForm">
                    <el-form-item>
                      <el-col :span="24">
                        <el-input v-model="r.text" placeholder="content of the col"   clearable></el-input>
                      </el-col>
                      <el-col :span="10">
                        <el-input v-model="r.colspan" placeholder="width" type="text"  clearable></el-input>
                      </el-col>
                      <el-col :span="14">
                        <el-button icon="el-icon-plus" size="small" type="primary" @click="addCol(r)"></el-button>
                        <el-button icon="el-icon-minus" size="small" type="primary" @click="delRow(t.trs, j)"></el-button>
                        <el-button size="small" type="primary" @click="addQ(r)">Q</el-button>
                        <el-button icon="el-icon-arrow-up" v-if="j !== 0"  size="small" type="primary" @click="upRow(t,j)"></el-button>
                      </el-col>
                    </el-form-item>
                  </el-form>
                </td>
              </tr>
              <tr>
                <td colspan="24">
                  <el-form class="searchForm">
                    <el-form-item>
                      <el-button icon="el-icon-plus" type="primary" @click="addRow(t)">Add Row</el-button>
                      <el-button icon="el-icon-minus" type="primary" @click="removeTable(i)">Remove Table</el-button>
                      <el-button icon="el-icon-arrow-up" v-if="i !== 0"  type="primary" plain @click="upTable(sheetContent, i)"></el-button>
                      <el-button icon="el-icon-arrow-down" v-if="i !== sheetContent.tables.length - 1" type="primary" plain @click="downTable(sheetContent, i)"></el-button>
                    </el-form-item>
                  </el-form>
                </td>
              </tr>
            </table>

          </div>
          <el-form class="searchForm">
            <el-form-item>
              <el-input v-model="editForm.tableTitle" clearable></el-input>
            </el-form-item>
            <el-form-item>
              <el-button icon="el-icon-plus" type="primary" @click="addTable()">Add Table</el-button>
              <el-button icon="el-icon-plus" type="primary" v-loading="isLoading"  @click="saveSheet()">Save Form</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'sheet',
  data: function () {
    return {
      isLoading: false,
      printDate: null,
      currentDate: moment(new Date()).format('MMMM DD, YYYY'),
      template: null,
      questions: [],
      currentQuestionId: 0,
      currentQuestion: null,
      outputType: 2,
      TypeID: 0,
      sheet: {},
      sheetContent: {
        title: 'COMMERCIAL ACCOUNT SUMMARY',
        tables: [
          {
            title: '',
            trs: [
              {
                tds: [
                  {colspan: 2, text: 'Date: {{7/31/2023}}'},
                  {colspan: 4, text: 'Producer: Nancy'},
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
          }
        ]
      },
      editForm: {
        tableTitle: '',
        tdText: ''
      }
    }
  },
  props: {
    sheetId: {
      type: Number
    },
    templateId: {
      type: Number
    },
    businessTypeId: {
      type: Number
    }
  },
  mounted: function () {
    // if (this.sheetId !== undefined) this.createSheet()
    if (this.sheetId !== 0) {
      this.loadSheetContent(this.sheetId)
    }
    this.createSheet(this.sheetId, this.templateId)
    this.loadTemplateQuestion(this.templateId)
  },
  methods: {
    start: function () {
      console.log('start')
    },
    addRepeatableTable: function () {
      let title = this.editForm.tableTitle
      let table = {title: title, trs: [], repeatable: true}
      this.sheetContent.tables.push(table)
      this.editForm.tableTitle = ''
    },
    addTable: function () {
      let title = this.editForm.tableTitle
      let table = {title: title, trs: [], repeatable: false}
      this.sheetContent.tables.push(table)
      this.editForm.tableTitle = ''
    },
    removeTable: function (i) {
      let tables = this.sheetContent.tables
      tables.splice(i, 1)
      this.sheetContent.tables = tables
    },
    addRow: function (table) {
      let row = {
        tds: [],
        text: '',
        colspan: 4
      }
      table.trs.push(row)
    },
    delRow: function (trs, j) {
      trs.splice(j, 1)
    },
    addCol: function (row) {
      let td = {
        text: row.text,
        colspan: Number(row.colspan)
      }
      row.tds.push(td)
      row.text = ''
      row.colspan = 1
    },

    delCol: function (row, index) {
      let cols = row.tds.splice(index, 1)
      row.text = cols[0].text
      row.colspan = Number(cols[0].colspan)
    },
    leftCol: function (row, index) {
      let temp = row.tds.splice(index, 1)
      row.tds.splice(index - 1, 0, temp[0])
    },
    rightCol: function (row, index) {
      let temp = row.tds.splice(index, 1)
      row.tds.splice(index + 1, 0, temp[0])
    },
    upRow: function (table, index) {
      let temp = table.trs.splice(index, 1)
      table.trs.splice(index - 1, 0, temp[0])
    },
    upTable: function (sheet, index) {
      let temp = sheet.tables.splice(index, 1)
      sheet.tables.splice(index - 1, 0, temp[0])
    },
    downTable: function (sheet, index) {
      let temp = sheet.tables.splice(index, 1)
      sheet.tables.splice(index + 1, 0, temp[0])
    },
    addQ: function (row) {
      if (row === undefined) return
      if (this.currentQuestion === null) return
      if (row.text === undefined) row.text = ''
      if (this.outputType === 1) {
        row.text += this.currentQuestion.Description
      } else if (this.outputType === 2) {
        row.text += '{{' + this.currentQuestion.QuestionID + '.Ans}}'
      } else if (this.outputType === 3) {
        row.text += '{{' + this.currentQuestion.QuestionID + '.Out}}'
      } else if (this.outputType === 4) {
        row.text += '{{' + this.currentQuestion.QuestionID + '.Addi}}'
      } else if (this.outputType === 5) {
        row.text += '{{' + this.currentQuestion.QuestionID + '.Orig}}'
      }
    },
    addTableQ: function (table) {
      if (table === undefined) return
      if (this.currentQuestion === null) return
      if (this.currentQuestion.InputType !== 'array') return
      if (table.title === undefined) table.title = ''
      table.title = this.currentQuestion.Description + '{{' + this.currentQuestion.QuestionID + '}}'
    },
    addTableVisibleCondition: function (table) {
      if (table === undefined) return
      if (this.currentQuestion === null) return
      if (table.title === undefined) table.title = ''
      table.title += '[[' + this.currentQuestion.QuestionID + ']]'
    },
    createSheet: function (sheetId, templateId) {
      let newSheet = {}
      newSheet.SheetID = sheetId
      newSheet.TemplateID = templateId
      newSheet.BusinessTypeID = this.businessTypeId
      if (this.sheetId === 0) newSheet.IsNew = true
      else newSheet.IsNew = false
      this.sheet = newSheet
      this.sheetContent = {
        title: '',
        tables: []
      }
    },
    loadSheetContent: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetSheet', {sheetid: id}).then(res => {
        if (res) {
          console.log('SheetContent', res)
          this.TypeID = res.data.TypeID
          let content = JSON.parse(res.data.Content)
          content.tables.forEach(function (table) {
            table.trs.forEach(function (tr) {
              tr.text = ''
              tr.colspan = 1
              tr.tds.forEach(function (td) {
                td.colspan = Number(td.colspan)
              })
            })
          })
          this.sheetContent = content
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询SheetContent出错', err)
        this.isLoading = false
      })
    },

    loadTemplateQuestion: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      if (id === undefined) id = this.sheet.TemplateID
      if (id === 0) return
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetQuestionsByTemplate', {templateid: id}).then(res => {
        if (res) {
          console.log('Questions of Template' + id, res)
          this.questions = res.data
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询template出错', err)
        this.isLoading = false
      })
    },

    saveSheet: function () {
      this.isLoading = true
      let value = this.sheet
      value.TypeID = this.TypeID
      console.log('sheet', value)
      value.Title = this.sheetContent.title
      value.Content = JSON.stringify(this.sheetContent)
      this.axios.post('/api/Services/BaseService.asmx/SaveSheet', {sheet: JSON.stringify(value)}).then(res => {
        if (res) {
          console.log('新增', res)
          this.sheet = res.data
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          // this.$parent.search()
        }
        this.isLoading = false
      }).catch(err => {
        console.log('saveSheet', err)
        this.isLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
