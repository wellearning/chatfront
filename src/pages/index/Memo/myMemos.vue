<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">My Memos</span>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Memo ID" prop="MemoID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Title" prop="Title" min-width="300"></el-table-column>
        <el-table-column label="RequestDate" min-width="150">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.RequestDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-view" type="primary" @click="view(scope.row.MemoID)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">View</el-button>
            <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row.MemoID)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Edit</el-button>
            <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.MemoID)" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" size="small">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="Edit Memo" :visible.sync="memoFormVisible" width="1000px" center :before-close="closeEdit">
        <el-form :model="memoForm" ref="memoForm" class="newMemo" :rules="memoFormRules">
          <el-row :gutter="20" class="title">
            <el-col :span="6">&#12288;</el-col>
            <el-col :span="12">
              <el-form-item prop="Title">
                <el-input v-model="memoForm.Title" placeholder="Title"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">&#12288;</el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="12">
              <el-form-item label="Effective Date" prop="EffectiveDate">
                <el-date-picker v-model="memoForm.EffectiveDate" type="date" placeholder="Effective Date"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Insurance Company" prop="InsuranceCorpID">
                <el-select v-model="memoForm.InsuranceCorpID" placeholder="Insurance Company" no-data-text="No Record" filterable @change="changeInsuranceCompany()">
                  <el-option v-for="item in insuranceCompanyList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="12">
              <el-form-item label="Policy Number" prop="PolicyNumber">
                <el-input v-model="memoForm.PolicyNumber" placeholder="Policy Number"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Templates" prop="Templates">
                <el-select v-model="memoForm.Templates" placeholder="Templates" no-data-text="No Record" filterable multiple collapse-tags :disabled="memoForm.InsuranceCorpID === null" @change="changeTemplates(memoForm.Templates)">
                  <el-option v-for="item in templatesList" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="newMemo-content" v-for="item in currentTemplates" :key="item.TemplateID">
          <!--<div class="newMemo-content-template-title">{{item.Title}}</div>-->
          <div v-for="it in item.templateBlocks" :key="it.BlockID">
            <!--<div class="newMemo-content-block-title">{{item.BlockName}}</div>-->
            <div v-for="i in it.block.blockQuestions" :key="i.BlockQuestionID">
              <div class="answerMemo" v-if="i.question.TypeID === 1 && !i.question.isSkip">
                <div class="typeTitle"><span v-if="i.question.Label !== undefined && i.question.Label !== null && i.question.Label !== ''">{{i.question.Label}}&nbsp;&nbsp;</span>{{i.question.Description}}</div>
              </div>
              <div class="answerMemo" v-else-if="i.question.TypeID === 2 && !i.question.isSkip">
                <div class="typeReminder"><span v-if="i.question.Label !== undefined && i.question.Label !== null && i.question.Label !== ''">{{i.question.Label}}&nbsp;&nbsp;</span>{{i.question.Description}}</div>
              </div>
              <div class="answerMemo" v-else-if="i.question.TypeID === 3 && !i.question.isSkip">
                <AnswerProperty :question="i.question" :templateId="item.TemplateID" :blockSequenceNo="it.SequenceNo" :questionSequenceNo="i.SequenceNo" @changeValue="countShipNumber"></AnswerProperty>
              </div>
              <div class="answerMemo" v-else-if="i.question.TypeID === 4 && !i.question.isSkip">
                <AnswerSimpleAnswer :question="i.question"></AnswerSimpleAnswer>
              </div>
              <div class="answerMemo" v-else-if="i.question.TypeID === 5 && !i.question.isSkip">
                <AnswerFillInQuestion :question="i.question"></AnswerFillInQuestion>
              </div>
              <div class="answerMemo" v-else-if="i.question.TypeID === 6 && !i.question.isSkip">
                <AnswerSingleChoiceQuestion :question="i.question" :templateId="item.TemplateID" :blockSequenceNo="it.SequenceNo" :questionSequenceNo="i.SequenceNo" @changeValue="countShipNumber"></AnswerSingleChoiceQuestion>
              </div>
              <div class="answerMemo" v-else-if="i.question.TypeID === 7 && !i.question.isSkip">
                <AnswerMultipleChoiceQuestion :question="i.question"></AnswerMultipleChoiceQuestion>
              </div>
            </div>
          </div>
        </div>
        <div class="newMemo-submit">
          <el-button icon="el-icon-check" type="primary" @click="submit()" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany">Confirm</el-button>
        </div>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------查阅弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewFormVisible" width="1000px" center :before-close="closeView">
        <div class="viewMemo">
          <div class="viewMemo-title">{{viewForm.Title}}</div>
          <el-row :gutter="20">
            <el-col :span="4">
              <div class="viewMemo-subtitle">EffectiveDate:</div>
            </el-col>
            <el-col :span="8">
              <div class="viewMemo-subtitle"><span>{{viewForm.EffectiveDate}}</span></div>
            </el-col>
            <el-col :span="4">
              <div class="viewMemo-subtitle">InsuranceCorp:</div>
            </el-col>
            <el-col :span="8">
              <div class="viewMemo-subtitle"><span>{{viewForm.InsuranceCorp}}</span></div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="4">
              <div class="viewMemo-subtitle">PolicyNumber:</div>
            </el-col>
            <el-col :span="8">
              <div class="viewMemo-subtitle"><span>{{viewForm.PolicyNumber}}</span></div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="4">
              <div class="viewMemo-subtitle">Author:</div>
            </el-col>
            <el-col :span="8">
              <div class="viewMemo-subtitle"><span>{{viewForm.Author}}</span></div>
            </el-col>
            <el-col :span="4">
              <div class="viewMemo-subtitle">RequestDate:</div>
            </el-col>
            <el-col :span="8">
              <div class="viewMemo-subtitle"><span>{{viewForm.RequestDate}}</span></div>
            </el-col>
          </el-row>
          <div class="viewMemo-content">
            <div v-for="i in viewForm.memoTemplates" :key="i.MemoTemplateID">
              <div v-for="it in i.memoBlocks" :key="it.MemoBlockID">
                <div class="viewMemo-content-answer" v-for="item in it.answers" :key="item.AnswerID">
                  <div v-if="item.Outputs === '1|false'" class="title">
                    <div class="question"><span v-if="item.Addition !== undefined && item.Addition !== null && item.Addition !== ''">{{item.Addition}}&nbsp;&nbsp;</span>{{item.QuestionDesc}}</div>
                  </div>
                  <div v-else-if="item.Outputs === '2|false'">
                    <div class="question"><span v-if="item.Addition !== undefined && item.Addition !== null && item.Addition !== ''">{{item.Addition}}&nbsp;&nbsp;</span>{{item.QuestionDesc}}</div>
                  </div>
                  <div v-else-if="item.Outputs === '3|false' || item.Outputs === '4|false'">
                    <div class="question"><span v-if="item.Addition !== undefined && item.Addition !== null && item.Addition !== ''">{{item.Addition}}&nbsp;&nbsp;</span>{{item.QuestionDesc}}</div>
                    <div class="answer" v-if="JSON.parse(item.AnswerDesc) !== null">
                      <span class="content">{{JSON.parse(item.AnswerDesc)}}</span>
                    </div>
                    <div class="answer" v-else>
                      <span class="noAnswer">No Answer</span>
                    </div>
                  </div>
                  <div v-else-if="item.Outputs === '5|false'">
                    <div class="question">
                      <span v-if="item.Addition !== undefined && item.Addition !== null && item.Addition !== ''">{{item.Addition}}&nbsp;&nbsp;</span>
                      <span v-for="(part, index) in JSON.parse(item.AnswerDesc)" :key="index">
                        <span class="fillInPart" v-if="part.IsFillin && (part.FillinContent !== undefined && part.FillinContent !== null && part.FillinContent !== '')">{{part.FillinContent}}</span>
                        <span class="fillInPart noAnswer" v-else-if="part.IsFillin && (part.FillinContent === undefined || part.FillinContent === null || part.FillinContent === '')">No Answer</span>
                        <span v-else>{{part.Part}}</span>
                      </span>
                    </div>
                  </div>
                  <div v-else-if="item.Outputs === '6|false'">
                    <div v-if="JSON.parse(item.AnswerDesc) === null || (JSON.parse(item.AnswerDesc) !== null && JSON.parse(item.AnswerDesc).OutputModeID !== 3)">
                      <div class="question"><span v-if="item.Addition !== undefined && item.Addition !== null && item.Addition !== ''">{{item.Addition}}&nbsp;&nbsp;</span>{{item.QuestionDesc}}</div>
                      <div class="answer">
                        <span v-if="JSON.parse(item.AnswerDesc) !== null && JSON.parse(item.AnswerDesc).OutputModeID === 1">
                          <span class="content">{{JSON.parse(item.AnswerDesc).Content}}</span>
                          <i class="addition" v-if="JSON.parse(item.AnswerDesc).AdditionContent !== null">Addition:<b>{{JSON.parse(item.AnswerDesc).AdditionContent}}</b></i>
                        </span>
                        <span v-else-if="JSON.parse(item.AnswerDesc) !== null && JSON.parse(item.AnswerDesc).OutputModeID === 2">
                          <span class="content">{{JSON.parse(item.AnswerDesc).Outputs}}</span>
                          <i class="addition" v-if="JSON.parse(item.AnswerDesc).AdditionContent !== null">Addition:<b>{{JSON.parse(item.AnswerDesc).AdditionContent}}</b></i>
                        </span>
                        <span class="noAnswer" v-else-if="JSON.parse(item.AnswerDesc) === null">No Answer</span>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="item.Outputs === '7|false'">
                    <div v-if="JSON.parse(item.AnswerDesc) === null || (JSON.parse(item.AnswerDesc) !== null && JSON.parse(item.AnswerDesc).filter(option => option.OutputModeID === 3).length === 0)">
                      <div class="question"><span v-if="item.Addition !== undefined && item.Addition !== null && item.Addition !== ''">{{item.Addition}}&nbsp;&nbsp;</span>{{item.QuestionDesc}}</div>
                      <div class="answer">
                        <div v-for="(option, index) in JSON.parse(item.AnswerDesc)" :key="index">
                          <span v-if="option.OutputModeID === 1">
                            <span class="content">{{option.Content}}</span>
                            <i class="addition" v-if="option.AdditionContent !== null">Addition:<b>{{option.AdditionContent}}</b></i>
                          </span>
                          <span v-else-if="option.OutputModeID === 2">
                            <span class="content">{{option.Outputs}}</span>
                            <i class="addition" v-if="option.AdditionContent !== null">Addition:<b>{{option.AdditionContent}}</b></i>
                          </span>
                        </div>
                        <div class="noAnswer" v-if="JSON.parse(item.AnswerDesc) === null">No Answer</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>
      <!----------------------------------------------查阅弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import AnswerProperty from '@/component/property/answerProperty'
import AnswerSimpleAnswer from '@/component/simpleAnswer/answerSimpleAnswer'
import AnswerFillInQuestion from '@/component/fillInQuestion/answerFillInQuestion'
import AnswerSingleChoiceQuestion from '@/component/choiceQuestion/answerSingleChoiceQuestion'
import AnswerMultipleChoiceQuestion from '@/component/choiceQuestion/answerMultipleChoiceQuestion'

export default {
  components: {
    AnswerProperty,
    AnswerSimpleAnswer,
    AnswerFillInQuestion,
    AnswerSingleChoiceQuestion,
    AnswerMultipleChoiceQuestion
  },
  data: function () {
    return {
      isLoading: false,
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      // 列表
      tempList: [],
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 修改
      isLoadingTemplates: false,
      isLoadingInsuranceCompany: false,
      templatesList: [],
      insuranceCompanyList: [],
      currentTemplates: [],
      memoFormVisible: false,
      memoForm: {
        MemoID: null,
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        PolicyNumber: null,
        StatusID: 1,
        RequestDate: moment(new Date()),
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        Templates: null
      },
      memoFormRules: {
        Title: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        EffectiveDate: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        InsuranceCorpID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        PolicyNumber: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        Templates: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ]
      },
      // 查阅
      viewFormVisible: false,
      viewForm: {
        Title: null,
        EffectiveDate: null,
        InsuranceCorp: null,
        PolicyNumber: null,
        Author: null,
        RequestDate: null,
        memoTemplates: [{
          memoBlocks: [{
            answers: []
          }]
        }],
        answerList: []
      }
    }
  },
  mounted: function () {
    this.search(null)
    this.initTemplates()
    this.initInsuranceCompany()
  },
  methods: {
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    // 查询
    search: function (name) {
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetMemoesByStaff', {staffid: JSON.parse(this.$store.getters.getAccount).StaffID}).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          if (name !== null) {
            this.searchName = name
            this.list = this.list.filter(item => item.Title.indexOf(this.searchName) !== -1)
          }
          this.total = this.list.length
          this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search(null)
    },
    // 删除
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/memoservice.asmx/RemoveMemo', {memoid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.MemoID !== id)
            this.total = this.list.length
          }
          this.isLoading = false
        }).catch(err => {
          console.log('删除出错', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    // Templates列表
    initTemplates: function () {
      this.isLoadingTemplates = true
      this.axios.post('/api/Services/memoservice.asmx/SearchTemplates', {query: ''}).then(res => {
        if (res) {
          console.log('Templates列表', res)
          this.templatesList = res.data
        }
        this.isLoadingTemplates = false
      }).catch(err => {
        console.log('Templates列表出错', err)
        this.isLoadingTemplates = false
      })
    },
    // 保险公司列表
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps', {}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          this.insuranceCompanyList = res.data
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // 选择保险公司
    changeInsuranceCompany: function () {
      this.memoForm.Templates = []
      this.currentTemplates = []
    },
    // 选择Templates
    changeTemplates: function (array, isAnswer) {
      let oldArray = this.currentTemplates.map(it => { return it.TemplateID })
      // 比对新旧数组，添加template
      for (let i = 0; i < array.length; i++) {
        if (oldArray.find(item => item === array[i]) === undefined) {
          this.isLoading = true
          this.axios.post('/api/Services/memoservice.asmx/GetTemplate', {templateid: array[i]}).then(res => {
            if (res) {
              console.log('添加Templates', res)
              let temp = res.data
              // 对所有问题赋值value，选择题的每个选项赋值AdditionContent
              for (let p = 0; p < temp.templateBlocks.length; p++) {
                for (let q = 0; q < temp.templateBlocks[p].block.blockQuestions.length; q++) {
                  temp.templateBlocks[p].block.blockQuestions[q].question.Label = temp.templateBlocks[p].block.blockQuestions[q].Label
                  if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 6) {
                    temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = false
                    temp.templateBlocks[p].block.blockQuestions[q].question.value = null
                    temp.templateBlocks[p].block.blockQuestions[q].question.options.forEach(item => { item.AdditionContent = null })
                  } else if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 7) {
                    temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = false
                    temp.templateBlocks[p].block.blockQuestions[q].question.value = []
                    temp.templateBlocks[p].block.blockQuestions[q].question.options.forEach(item => { item.AdditionContent = null })
                  } else {
                    temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = false
                    temp.templateBlocks[p].block.blockQuestions[q].question.value = null
                  }
                }
              }
              // 将答案填充
              if (isAnswer === 'Answer') {
                let blocks = this.memoForm.memoTemplates.find(item => item.TemplateID === array[i]).memoBlocks
                for (let p = 0; p < blocks.length; p++) {
                  for (let q = 0; q < blocks[p].answers.length; q++) {
                    blocks[p].answers[q].AnswerDesc = JSON.parse(blocks[p].answers[q].AnswerDesc)
                    if (blocks[p].answers[q].Outputs.indexOf('true') > -1) {
                      temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = true
                    }
                    if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 3) { // property
                      temp.templateBlocks[p].block.blockQuestions[q].question.value = blocks[p].answers[q].AnswerDesc
                    } else if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 4) { // simpleAnswer
                      temp.templateBlocks[p].block.blockQuestions[q].question.value = blocks[p].answers[q].AnswerDesc
                    } else if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 5) { // fillIn
                      for (let a = 0; a < blocks[p].answers[q].AnswerDesc.length; a++) {
                        if (blocks[p].answers[q].AnswerDesc[a].IsFillin && blocks[p].answers[q].AnswerDesc[a].FillinContent !== undefined) {
                          temp.templateBlocks[p].block.blockQuestions[q].question.fillinParts.find(it => it.FillinPartID === blocks[p].answers[q].AnswerDesc[a].FillinPartID).FillinContent = blocks[p].answers[q].AnswerDesc[a].FillinContent
                        }
                      }
                    } else if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 6) { // single
                      if (blocks[p].answers[q].AnswerDesc !== null) {
                        temp.templateBlocks[p].block.blockQuestions[q].question.value = blocks[p].answers[q].AnswerDesc.ChoiceOptionID
                        temp.templateBlocks[p].block.blockQuestions[q].question.options.find(it => it.ChoiceOptionID === blocks[p].answers[q].AnswerDesc.ChoiceOptionID).AdditionContent = blocks[p].answers[q].AnswerDesc.AdditionContent
                      }
                    } else if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 7) { // multiple
                      if (blocks[p].answers[q].AnswerDesc !== null && blocks[p].answers[q].AnswerDesc.length > 0) {
                        temp.templateBlocks[p].block.blockQuestions[q].question.value = blocks[p].answers[q].AnswerDesc.map(it => it.ChoiceOptionID)
                        for (let a = 0; a < temp.templateBlocks[p].block.blockQuestions[q].question.value.length; a++) {
                          temp.templateBlocks[p].block.blockQuestions[q].question.options.find(it => it.ChoiceOptionID === temp.templateBlocks[p].block.blockQuestions[q].question.value[a]).AdditionContent = blocks[p].answers[q].AnswerDesc.find(it => it.ChoiceOptionID === temp.templateBlocks[p].block.blockQuestions[q].question.value[a]).AdditionContent
                        }
                      }
                    } else { // title, reminder
                      temp.templateBlocks[p].block.blockQuestions[q].question.value = null
                    }
                  }
                }
              }
              this.currentTemplates.push(temp)
            }
            this.isLoading = false
          }).catch(err => {
            console.log('添加Templates出错', err)
            this.isLoading = false
          })
        }
      }
      // 比对新旧数组，删除template
      for (let i = 0; i < oldArray.length; i++) {
        if (array.find(item => item === oldArray[i]) === undefined) {
          this.currentTemplates = this.currentTemplates.filter(item => item.TemplateID !== oldArray[i])
        }
      }
    },
    // 更新跳过个数
    countShipNumber: function (TemplateID, blockSequenceNo, questionSequenceNo, value) {
      let template = this.currentTemplates.find(item => item.TemplateID === TemplateID)
      let block = template.templateBlocks.find(item => item.SequenceNo === blockSequenceNo)
      let question = block.block.blockQuestions.find(item => item.SequenceNo === questionSequenceNo)
      let routes = question.routes.filter(item => item.InsuranceCorpID === this.memoForm.InsuranceCorpID)
      let skipNumber = 1
      // property
      if (question.question.TypeID === 3) {
        for (let i = 0; i < routes.length; i++) {
          if (isNaN(routes[i].Operand)) { // true代表非数字，字符串比较
            if (routes[i].Operator === '=' && value === routes[i].Operand) {
              skipNumber = routes[i].MoveStep
              break
            } else {
              skipNumber = 1
            }
          } else { // false代表是有效数字，数字比较
            if (routes[i].Operator === '=' && parseInt(value) === parseInt(routes[i].Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '>' && parseInt(value) > parseInt(routes[i].Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '<' && parseInt(value) < parseInt(routes[i].Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '>=' && parseInt(value) >= parseInt(routes[i].Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '<=' && parseInt(value) <= parseInt(routes[i].Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else {
              skipNumber = 1
            }
          }
        }
      }
      // singleChoice
      if (question.question.TypeID === 6) {
        // 单选题判断答案所属routes，得出跳过个数
        if (routes.find(item => parseInt(item.Operand) === value) !== undefined) {
          skipNumber = routes.find(item => parseInt(item.Operand) === value).MoveStep
        } else {
          skipNumber = 1
        }
      }
      if (skipNumber > 1) { // 如果跳过个数（n）大于1，对后面（n - 1）个问题赋null值（多选为[]），isSkip属性赋true值，同时执行countShipNumber发放，将这（n - 1）个问题处理的isSkip属性赋true值的问题，isSkip属性赋false值
        for (let i = 1; i < skipNumber; i++) {
          if (block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.TypeID === 7) {
            block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.value = []
            this.countShipNumber(TemplateID, blockSequenceNo, block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).SequenceNo, [])
          } else {
            block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.value = null
            this.countShipNumber(TemplateID, blockSequenceNo, block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).SequenceNo, null)
          }
          block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.isSkip = true
        }
      } else { // 如果跳过个数（n）等于1，对后面连续的n个SequenceNo大于当前SequenceNo且isSkip为true的问题，isSkip属性赋false值，如果SequenceNo大于当前SequenceNo且isSkip为false，跳出循环，避免影响后续的跳过（1跳过2，4跳过5,3的时候停止，不然5会被恢复可见）
        for (let i = 0; i < block.block.blockQuestions.length; i++) {
          if (block.block.blockQuestions[i].SequenceNo > questionSequenceNo) {
            if (block.block.blockQuestions[i].question.isSkip === true) {
              block.block.blockQuestions[i].question.isSkip = false
            } else {
              break
            }
          }
        }
      }
    },
    // 修改弹窗
    showEdit: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetMemo', {memoid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.memoFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.memoForm = res.data
            this.memoForm.EffectiveDate = moment(res.data.EffectiveDate)
            this.memoForm.RequestDate = moment(res.data.RequestDate)
            this.memoForm.Templates = res.data.memoTemplates.map(item => { return item.TemplateID })
            this.changeTemplates(this.memoForm.Templates, 'Answer')
            this.initTemplates()
            this.initInsuranceCompany()
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    // 关闭修改
    closeEdit: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$refs['memoForm'].resetFields()
        this.currentTemplates = []
        done()
      }).catch(() => {})
    },
    // 提交
    submit: function () {
      this.$refs['memoForm'].validate((valid) => {
        if (valid) {
          // form
          let form = JSON.parse(JSON.stringify(this.memoForm))
          // templates
          let templates = JSON.parse(JSON.stringify(this.currentTemplates))
          templates = templates.map(item => { return { TemplateID: item.TemplateID, memoBlocks: item.templateBlocks } })
          for (let i = 0; i < templates.length; i++) {
            templates[i].memoBlocks = templates[i].memoBlocks.map(item => { return { BlockID: item.BlockID, answers: item.block.blockQuestions } })
            for (let j = 0; j < templates[i].memoBlocks.length; j++) {
              for (let k = 0; k < templates[i].memoBlocks[j].answers.length; k++) {
                if (templates[i].memoBlocks[j].answers[k].question.TypeID === 3) { // property
                  templates[i].memoBlocks[j].answers[k].question.AnswerDesc = templates[i].memoBlocks[j].answers[k].question.value
                } else if (templates[i].memoBlocks[j].answers[k].question.TypeID === 4) { // simpleAnswer
                  templates[i].memoBlocks[j].answers[k].question.AnswerDesc = templates[i].memoBlocks[j].answers[k].question.value
                } else if (templates[i].memoBlocks[j].answers[k].question.TypeID === 5) { // fillIn
                  templates[i].memoBlocks[j].answers[k].question.AnswerDesc = templates[i].memoBlocks[j].answers[k].question.fillinParts.map(it => {
                    return { FillinPartID: it.FillinPartID, IsFillin: it.IsFillin, Part: it.Part, FillinContent: it.FillinContent }
                  })
                } else if (templates[i].memoBlocks[j].answers[k].question.TypeID === 6) { // single
                  if (templates[i].memoBlocks[j].answers[k].question.value !== null) {
                    templates[i].memoBlocks[j].answers[k].question.AnswerDesc = {
                      ChoiceOptionID: templates[i].memoBlocks[j].answers[k].question.value,
                      OutputModeID: templates[i].memoBlocks[j].answers[k].question.OutputModeID,
                      Content: templates[i].memoBlocks[j].answers[k].question.options.find(it => it.ChoiceOptionID === templates[i].memoBlocks[j].answers[k].question.value).Content,
                      Outputs: templates[i].memoBlocks[j].answers[k].question.options.find(it => it.ChoiceOptionID === templates[i].memoBlocks[j].answers[k].question.value).Outputs,
                      AdditionContent: templates[i].memoBlocks[j].answers[k].question.options.find(it => it.ChoiceOptionID === templates[i].memoBlocks[j].answers[k].question.value).AdditionContent
                    }
                  } else {
                    templates[i].memoBlocks[j].answers[k].question.AnswerDesc = null
                  }
                } else if (templates[i].memoBlocks[j].answers[k].question.TypeID === 7) { // multiple
                  if (templates[i].memoBlocks[j].answers[k].question.value.length > 0) {
                    templates[i].memoBlocks[j].answers[k].question.AnswerDesc = templates[i].memoBlocks[j].answers[k].question.value.map(it => {
                      return {
                        ChoiceOptionID: it,
                        OutputModeID: templates[i].memoBlocks[j].answers[k].question.OutputModeID,
                        Content: templates[i].memoBlocks[j].answers[k].question.options.find(i => i.ChoiceOptionID === it).Content,
                        Outputs: templates[i].memoBlocks[j].answers[k].question.options.find(i => i.ChoiceOptionID === it).Outputs,
                        AdditionContent: templates[i].memoBlocks[j].answers[k].question.options.find(i => i.ChoiceOptionID === it).AdditionContent
                      }
                    })
                  } else {
                    templates[i].memoBlocks[j].answers[k].question.AnswerDesc = null
                  }
                } else { // title, reminder
                  templates[i].memoBlocks[j].answers[k].question.AnswerDesc = null
                }
                templates[i].memoBlocks[j].answers[k] = {QuestionID: templates[i].memoBlocks[j].answers[k].QuestionID, BlockQuestionID: templates[i].memoBlocks[j].answers[k].BlockQuestionID, QuestionDesc: templates[i].memoBlocks[j].answers[k].question.Description, AnswerDesc: JSON.stringify(templates[i].memoBlocks[j].answers[k].question.AnswerDesc), Addition: templates[i].memoBlocks[j].answers[k].question.Label, Outputs: templates[i].memoBlocks[j].answers[k].question.TypeID + '|' + templates[i].memoBlocks[j].answers[k].question.isSkip}
              }
            }
          }
          // TODO: 如果选用的templates能修改，则全部使用新增的templates（即this.currentTemplates）；如果不能修改的话，可以使用for循环对应更新AnswerDesc（必须结构完全一样才能对应ijk）
          form.memoTemplates = templates
          // for (let i = 0; i < form.memoTemplates.length; i++) {
          //   for (let j = 0; j < form.memoTemplates[i].memoBlocks.length; j++) {
          //     for (let k = 0; k < form.memoTemplates[i].memoBlocks[j].answers.length; k++) {
          //       form.memoTemplates[i].memoBlocks[j].answers[k].AnswerDesc = templates[i].memoBlocks[j].answers[k].AnswerDesc
          //     }
          //   }
          // }
          this.isLoading = true
          this.axios.post('/api/Services/memoservice.asmx/SaveMemo', {memo: JSON.stringify(form)}).then(res => {
            if (res) {
              console.log('提交', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['memoForm'].resetFields()
              this.currentTemplates = []
              this.memoFormVisible = false
              // 如果修改记录符合查询条件，更新该记录；如果不符合，删除该记录，总数减1
              if (this.searchName === null || (this.searchName !== null && res.data.Title.indexOf(this.searchName) !== -1)) {
                this.list = this.list.map(item => { return item.MemoID === res.data.MemoID ? res.data : item })
              } else {
                this.list = this.list.filter(item => item.MemoID !== res.data.MemoID)
                this.total = this.list.length
              }
            }
            this.isLoading = false
          }).catch(err => {
            console.log('提交出错', err)
            this.isLoading = false
          })
        } else {
          this.$message({
            type: 'error',
            message: 'Format Error'
          })
        }
      })
    },
    // 查阅弹窗
    view: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetMemo', {memoid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.viewFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.viewForm = res.data
            this.viewForm.InsuranceCorp = this.insuranceCompanyList.find(item => item.InsuranceCorpID === res.data.InsuranceCorpID).Name
            this.viewForm.Author = JSON.parse(this.$store.getters.getAccount).Name // todo
            this.viewForm.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
            this.viewForm.RequestDate = moment(res.data.RequestDate).format('YYYY-MM-DD')
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    // 关闭查阅
    closeView: function (done) {
      this.viewForm = {}
      done()
    }
  }
}
</script>

<style scoped>

</style>
