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
        <el-table-column label="Title" prop="Title" min-width="200"></el-table-column>
        <el-table-column label="EffectiveDate" min-width="150">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="CorpName" prop="CorpName" min-width="200"></el-table-column>
        <el-table-column label="PolicyNumber" prop="PolicyNumber" min-width="200"></el-table-column>
        <el-table-column label="NameInsured(s)" prop="NameInsured" min-width="200"></el-table-column>
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
          <div v-if="memoForm.Templates.length > 1" class="newMemo-content-template-title">{{item.Title}}</div>
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
                <AnswerSimpleAnswer :question="i.question" :templateId="item.TemplateID" :blockSequenceNo="it.SequenceNo" :questionSequenceNo="i.SequenceNo"></AnswerSimpleAnswer>
              </div>
              <div class="answerMemo" v-else-if="i.question.TypeID === 5 && !i.question.isSkip">
                <AnswerFillInQuestion :question="i.question" :templateId="item.TemplateID" :blockSequenceNo="it.SequenceNo" :questionSequenceNo="i.SequenceNo"></AnswerFillInQuestion>
              </div>
              <div class="answerMemo" v-else-if="i.question.TypeID === 6 && !i.question.isSkip">
                <AnswerSingleChoiceQuestion :question="i.question" :templateId="item.TemplateID" :blockSequenceNo="it.SequenceNo" :questionSequenceNo="i.SequenceNo" @changeValue="countShipNumber"></AnswerSingleChoiceQuestion>
              </div>
              <div class="answerMemo" v-else-if="i.question.TypeID === 7 && !i.question.isSkip">
                <AnswerMultipleChoiceQuestion :question="i.question" :templateId="item.TemplateID" :blockSequenceNo="it.SequenceNo" :questionSequenceNo="i.SequenceNo"></AnswerMultipleChoiceQuestion>
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
      <el-dialog title="" :visible.sync="viewFormVisible" width="1184.56px" center :before-close="closeView">
        <div class="printDiv">
          <el-button icon="el-icon-document" type="primary" @click="pdf(viewForm.Title, viewForm.EffectiveDate)" :loading="isLoading || isLoadingInsuranceCompany" size="small">To PDF</el-button>
          <!--<el-button icon="el-icon-printer" type="primary" v-print="printObj" :loading="isLoading || isLoadingInsuranceCompany" size="small">Print</el-button>-->
        </div>
        <div class="viewMemo" id="pdfDom">
          <!--<div class="printDate">Print Date: {{printDate}}</div>-->
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="viewMemo-subtitle head"><i style="width: unset;">Chat Insurance Services Inc ({{viewForm.branch.Name}})</i></div>
              <div class="viewMemo-subtitle head"><i style="width: unset;">{{viewForm.branch.Address}}</i></div>
              <div class="viewMemo-subtitle head"><i style="width: unset;">{{viewForm.branch.Telphone}}</i></div>
            </el-col>
            <el-col :span="12">
              <div class="viewMemo-subtitle head"><i class="long">Insurance Company: </i><b>{{viewForm.corpbroker.corp.Name}}</b></div>
              <div class="viewMemo-subtitle head"><i class="long">Broker Code: </i><b>{{viewForm.corpbroker.BrokerCode}}</b></div>
              <div class="viewMemo-subtitle head"><i class="long">Print Date: </i><b>{{printDate}}</b></div>
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
              <div class="viewMemo-subtitle">PolicyNumber:</div>
            </el-col>
            <el-col :span="8">
              <div class="viewMemo-subtitle"><span>{{viewForm.PolicyNumber}}</span></div>
            </el-col>
            <el-col :span="4">
              <div class="viewMemo-subtitle">NameInsured(s):</div>
            </el-col>
            <el-col :span="8">
              <div class="viewMemo-subtitle"><span>{{viewForm.NameInsured}}</span></div>
            </el-col>
          </el-row>
          <div class="viewMemo-content">
            <div v-for="i in viewForm.memoTemplates" :key="i.MemoTemplateID">
              <div v-if="viewForm.memoTemplates.length > 1" class="newMemo-content-template-title">{{i.Title}}</div>
              <div v-for="it in i.memoBlocks" :key="it.MemoBlockID">
                <div class="viewMemo-content-answer" v-for="(item, index) in it.normalAnswers" :key="index">
                  <!--问题类型为：Title-->
                  <div v-if="item.QuestionType === 'Title' && item.OutputModeID !== 3" class="title">
                    <div class="question">{{item.QuestionDesc}}</div>
                  </div>
                  <!--问题类型为：Reminder-->
                  <div v-else-if="item.QuestionType === 'Reminder && item.OutputModeID !== 3'">
                    <div class="question">{{item.QuestionDesc}}</div>
                  </div>
                  <!--问题类型为：Property-->
                  <div v-else-if="item.QuestionType === 'Property' && item.OutputModeID !== 3">
                    <div class="question">{{item.QuestionDesc}}</div>
                    <div class="answer">
                      <span class="content">{{item.AnswerDesc}}</span>
                    </div>
                  </div>
                  <!--问题类型为：SimpleAnswer-->
                  <div v-else-if="item.QuestionType === 'SimpleAnswer' && item.OutputModeID !== 3">
                    <div class="question">{{item.QuestionDesc}}</div>
                    <div class="answer">
                      <span class="content">{{item.AnswerDesc}}</span>
                    </div>
                  </div>
                  <!--问题类型为：Fillin-->
                  <div v-else-if="item.QuestionType === 'Fillin' && item.OutputModeID !== 3">
                    <div class="question">
                      <span v-for="part in item.fillinAnswers" :key="part.FillinPartID">
                        <span class="fillInPart" v-if="part.IsFillin">{{part.FillinContent}}</span>
                        <span v-else>{{part.Part}}</span>
                      </span>
                    </div>
                  </div>
                  <!--问题类型为：SingleChoice-->
                  <div v-else-if="item.QuestionType === 'SingleChoice' && item.OutputModeID !== 3">
                    <div>
                      <div class="question">{{item.QuestionDesc}}</div>
                      <div class="answer">
                        <span v-if="item.optionAnswer !== null && item.optionAnswer.OutputModeID === 1">
                          <span class="content">{{item.optionAnswer.Content}}</span>
                          <i class="addition" v-if="item.optionAnswer.AdditionContent !== null && item.optionAnswer.AdditionContent !== ''">Addition:<b>{{item.optionAnswer.AdditionContent}}</b></i>
                        </span>
                        <span v-else-if="item.optionAnswer !== null && item.optionAnswer.OutputModeID === 2">
                          <span class="content">{{item.optionAnswer.Outputs}}</span>
                          <i class="addition" v-if="item.optionAnswer.AdditionContent !== null && item.optionAnswer.AdditionContent !== ''">Addition:<b>{{item.optionAnswer.AdditionContent}}</b></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <!--问题类型为：MultipleChoice-->
                  <div v-else-if="item.QuestionType === 'MultipleChoice' && item.OutputModeID !== 3">
                    <div>
                      <div class="question">{{item.QuestionDesc}}</div>
                      <div class="answer">
                        <div v-for="(option, indexOption) in item.optionAnswers" :key="indexOption">
                          <span v-if="option.OutputModeID === 1">
                            <span class="content">{{option.Content}}</span>
                            <i class="addition" v-if="option.AdditionContent !== null && option.AdditionContent !== ''">Addition:<b>{{option.AdditionContent}}</b></i>
                          </span>
                          <span v-else-if="option.OutputModeID === 2">
                            <span class="content">{{option.Outputs}}</span>
                            <i class="addition" v-if="option.AdditionContent !== null && option.AdditionContent !== ''">Addition:<b>{{option.AdditionContent}}</b></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <el-row :gutter="20" class="foot">
            <el-col :span="12">
              <div class="viewMemo-subtitle foot">______________________________(Signature of Insureds)</div>
            </el-col>
            <el-col :span="12">
              <div class="viewMemo-subtitle foot">______________________________(Signature Date)</div>
            </el-col>
          </el-row>
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
      printDate: moment(new Date()).format('YYYY-MM-DD'),
      printObj: {
        id: 'pdfDom',
        popTitle: ''
      },
      htmlTitle: 'null', // pdf文件名
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
              // 对所有问题赋值value、isSkip，选择题的每个选项赋值AdditionContent
              // 修改相对于新增，需要的额外字段
              temp.IsNew = true
              // 修改相对于新增，需要的额外字段
              for (let p = 0; p < temp.templateBlocks.length; p++) {
                // 修改相对于新增，需要的额外字段
                temp.templateBlocks[p].block.IsNew = true
                // 修改相对于新增，需要的额外字段
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
                  } else if (temp.templateBlocks[p].block.blockQuestions[q].question.TypeID === 5) {
                    temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = false
                    temp.templateBlocks[p].block.blockQuestions[q].question.value = null
                    temp.templateBlocks[p].block.blockQuestions[q].question.fillinParts.forEach(item => { item.FillinContent = null })
                  } else {
                    temp.templateBlocks[p].block.blockQuestions[q].question.isSkip = false
                    temp.templateBlocks[p].block.blockQuestions[q].question.value = null
                  }
                }
              }
              // 根据保险公司，跳过baseOnQuestion的问题
              for (let p = 0; p < temp.templateBlocks.length; p++) {
                for (let q = 0; q < temp.templateBlocks[p].block.blockQuestions.length; q++) {
                  if (temp.templateBlocks[p].block.blockQuestions[q].RouteTypeID === 1) {
                    let skipNumber = 1
                    let routes = temp.templateBlocks[p].block.blockQuestions[q].routes.find(item => item.InsuranceCorpID === this.memoForm.InsuranceCorpID)
                    if (routes === undefined) {
                      routes = temp.templateBlocks[p].block.blockQuestions[q].routes.find(item => item.InsuranceCorpID === 0)
                    }
                    if (routes !== undefined) {
                      skipNumber = routes.MoveStep
                      if (skipNumber > 1) { // 如果跳过个数（n）大于1，isSkip属性赋true值
                        for (let i = 1; i < skipNumber; i++) {
                          temp.templateBlocks[p].block.blockQuestions[q + i].question.isSkip = true
                          temp.templateBlocks[p].block.blockQuestions[q + i].question.numType = 'alwaysSkip'
                        }
                      }
                    }
                  }
                }
              }
              // 将答案填充
              if (isAnswer === 'Answer') {
                if (this.memoForm.memoTemplates.find(item => item.TemplateID === array[i]) !== undefined) {
                  // 修改相对于新增，需要的额外字段
                  temp.IsNew = false
                  temp.MemoTemplateID = this.memoForm.memoTemplates.find(item => item.TemplateID === array[i]).MemoTemplateID
                  temp.MemoID = this.memoForm.memoTemplates.find(item => item.TemplateID === array[i]).MemoID
                  // 修改相对于新增，需要的额外字段
                }
                let blocks = this.memoForm.memoTemplates.find(item => item.TemplateID === array[i]).memoBlocks
                for (let p = 0; p < blocks.length; p++) {
                  let matchBlock = temp.templateBlocks.find(item => item.BlockID === blocks[p].BlockID).block
                  // 修改相对于新增，需要的额外字段
                  matchBlock.IsNew = false
                  matchBlock.MemoBlockID = blocks[p].MemoBlockID
                  matchBlock.MemoTemplateID = blocks[p].MemoTemplateID
                  matchBlock.SequenceNo = blocks[p].SequenceNo
                  matchBlock.answers = blocks[p].answers
                  // 修改相对于新增，需要的额外字段
                  // 将此block中，GetMemo有回答的问题赋予回答
                  for (let q = 0; q < blocks[p].normalAnswers.length; q++) {
                    let matchQuestion = matchBlock.blockQuestions.find(item => item.QuestionID === blocks[p].normalAnswers[q].QuestionID)
                    // 修改相对于新增，需要的额外字段
                    matchQuestion.question.AnswerID = blocks[p].normalAnswers[q].AnswerID
                    matchQuestion.question.MemoBlockID = blocks[p].normalAnswers[q].MemoBlockID
                    // 修改相对于新增，需要的额外字段
                    // if (blocks[p].normalAnswers[q].QuestionType === 'Title') {
                    // } else if (blocks[p].normalAnswers[q].QuestionType === 'Reminder') {
                    if (blocks[p].normalAnswers[q].QuestionType === 'Property') {
                      matchQuestion.question.value = blocks[p].normalAnswers[q].AnswerDesc
                    } else if (blocks[p].normalAnswers[q].QuestionType === 'SimpleAnswer') {
                      matchQuestion.question.value = blocks[p].normalAnswers[q].AnswerDesc
                    } else if (blocks[p].normalAnswers[q].QuestionType === 'Fillin') {
                      for (let a = 0; a < blocks[p].normalAnswers[q].fillinAnswers.length; a++) {
                        if (blocks[p].normalAnswers[q].fillinAnswers[a].IsFillin) {
                          matchQuestion.question.fillinParts.find(it => it.FillinPartID === blocks[p].normalAnswers[q].fillinAnswers[a].FillinPartID).FillinContent = blocks[p].normalAnswers[q].fillinAnswers[a].FillinContent
                        }
                      }
                    } else if (blocks[p].normalAnswers[q].QuestionType === 'SingleChoice') {
                      if (blocks[p].normalAnswers[q].optionAnswer !== null) {
                        matchQuestion.question.value = blocks[p].normalAnswers[q].optionAnswer.ChoiceOptionID
                        matchQuestion.question.options.find(it => it.ChoiceOptionID === blocks[p].normalAnswers[q].optionAnswer.ChoiceOptionID).AdditionContent = blocks[p].normalAnswers[q].optionAnswer.AdditionContent
                      }
                    } else if (blocks[p].normalAnswers[q].QuestionType === 'MultipleChoice') {
                      matchQuestion.question.value = blocks[p].normalAnswers[q].optionAnswers.map(it => it.ChoiceOptionID)
                      for (let a = 0; a < matchQuestion.question.value.length; a++) {
                        matchQuestion.question.options.find(it => it.ChoiceOptionID === matchQuestion.question.value[a]).AdditionContent = blocks[p].normalAnswers[q].optionAnswers.find(it => it.ChoiceOptionID === matchQuestion.question.value[a]).AdditionContent
                      }
                    }
                  }
                }
              }
              temp.orderId = i
              this.currentTemplates.push(temp)
              this.currentTemplates = this.currentTemplates.sort((a, b) => { return a.orderId - b.orderId })
              // 执行routes
              for (let a = 0; a < this.currentTemplates.length; a++) {
                for (let b = 0; b < this.currentTemplates[a].templateBlocks.length; b++) {
                  for (let c = 0; c < this.currentTemplates[a].templateBlocks[b].block.blockQuestions.length; c++) {
                    if (this.currentTemplates[a].templateBlocks[b].block.blockQuestions[c].question.TypeID === 3 || this.currentTemplates[a].templateBlocks[b].block.blockQuestions[c].question.TypeID === 6) {
                      this.countShipNumber(this.currentTemplates[a].TemplateID, this.currentTemplates[a].templateBlocks[b].SequenceNo, this.currentTemplates[a].templateBlocks[b].block.blockQuestions[c].SequenceNo, this.currentTemplates[a].templateBlocks[b].block.blockQuestions[c].question.value)
                    }
                  }
                }
              }
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
      // 自动填充title
      if (array.length === 0) {
        this.memoForm.Title = null
      } else if (array.length === 1) {
        this.memoForm.Title = this.templatesList.find(item => item.TemplateID === array[0]).Title
      } else {
        this.memoForm.Title = 'Multiple Changes'
      }
      // console.log('完整问题', this.currentTemplates)
    },
    // 更新跳过个数
    countShipNumber: function (TemplateID, blockSequenceNo, questionSequenceNo, value) {
      let template = this.currentTemplates.find(item => item.TemplateID === TemplateID)
      let block = template.templateBlocks.find(item => item.SequenceNo === blockSequenceNo)
      let question = block.block.blockQuestions.find(item => item.SequenceNo === questionSequenceNo)
      let routes = question.routes.filter(item => item.InsuranceCorpID === this.memoForm.InsuranceCorpID)
      if (routes.length === 0) {
        routes = question.routes.filter(item => item.InsuranceCorpID === 0)
      }
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
            if (routes[i].Operator === '=' && parseFloat(value) === parseFloat(routes[i].Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '>' && parseFloat(value) > parseFloat(routes[i].Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '<' && parseFloat(value) < parseFloat(routes[i].Operand)) {
              skipNumber = routes[i].MoveStep
              break
            } else if (routes[i].Operator === '>=' && parseFloat(value) >= parseFloat(routes[i].Operand)) {
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
        if (routes.find(item => parseFloat(item.Operand) === value) !== undefined) {
          skipNumber = routes.find(item => parseFloat(item.Operand) === value).MoveStep
        } else {
          skipNumber = 1
        }
      }
      // 如果跳过个数（n）大于1，对后面（n - 1）个问题赋null值（多选为[]），isSkip属性赋true值，同时执行countShipNumber发放，将这（n - 1）个问题处理的isSkip属性赋true值的问题，isSkip属性赋false值
      for (let i = 1; i < skipNumber; i++) {
        if (block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.TypeID === 7) {
          block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.value = []
          block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.options.forEach(item => { item.AdditionContent = null })
          this.countShipNumber(TemplateID, blockSequenceNo, block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).SequenceNo, [])
        } else if (block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.TypeID === 6) {
          block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.value = null
          block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.options.forEach(item => { item.AdditionContent = null })
          this.countShipNumber(TemplateID, blockSequenceNo, block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).SequenceNo, null)
        } else if (block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.TypeID === 5) {
          block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.value = null
          block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.fillinParts.forEach(item => { item.FillinContent = null })
          this.countShipNumber(TemplateID, blockSequenceNo, block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).SequenceNo, null)
        } else {
          block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.value = null
          this.countShipNumber(TemplateID, blockSequenceNo, block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).SequenceNo, null)
        }
        block.block.blockQuestions.find(item => item.SequenceNo === (questionSequenceNo + i)).question.isSkip = true
      }
      // 对后面连续的n个SequenceNo大于当前SequenceNo + skipNumber - 1且isSkip为true的问题，isSkip属性赋false值，如果SequenceNo大于当前SequenceNo且isSkip为false，跳出循环，避免影响后续的跳过（1跳过2，4跳过5,3的时候停止，不然5会被恢复可见）
      for (let i = 0; i < block.block.blockQuestions.length; i++) {
        if (block.block.blockQuestions[i].SequenceNo > questionSequenceNo + skipNumber - 1) {
          if (block.block.blockQuestions[i].question.isSkip === true) {
            if (block.block.blockQuestions[i].question.numType !== 'alwaysSkip') {
              block.block.blockQuestions[i].question.isSkip = false
            }
          } else {
            break
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
          // 校验全部回答
          let allAnswer = true
          // form
          let form = JSON.parse(JSON.stringify(this.memoForm))
          // templates
          let templates = JSON.parse(JSON.stringify(this.currentTemplates))
          // 修改相对于新增，需要的额外字段
          templates = templates.map(item => { return { TemplateID: item.TemplateID, Title: item.Title, memoBlocks: item.templateBlocks, IsNew: item.IsNew, MemoTemplateID: item.MemoTemplateID, MemoID: item.MemoID } })
          templates.forEach(item => {
            if (item.MemoTemplateID === undefined) {
              delete item.MemoTemplateID
            }
            if (item.MemoID === undefined) {
              delete item.MemoID
            }
          })
          // 修改相对于新增，需要的额外字段
          for (let i = 0; i < templates.length; i++) {
            // 过滤掉被隐藏的问题
            // 修改相对于新增，需要的额外字段
            templates[i].memoBlocks = templates[i].memoBlocks.map(item => { return { BlockID: item.BlockID, IsNew: item.block.IsNew, MemoBlockID: item.block.MemoBlockID, MemoTemplateID: item.block.MemoTemplateID, SequenceNo: item.block.SequenceNo, answers: item.block.answers, normalAnswers: item.block.blockQuestions.filter(it => it.question.isSkip === false) } })
            templates[i].memoBlocks.forEach(item => {
              if (item.MemoBlockID === undefined) {
                delete item.MemoBlockID
              }
              if (item.MemoTemplateID === undefined) {
                delete item.MemoTemplateID
              }
              if (item.SequenceNo === undefined) {
                delete item.SequenceNo
              }
              if (item.answers === undefined) {
                delete item.answers
              }
            })
            // 修改相对于新增，需要的额外字段
            for (let j = 0; j < templates[i].memoBlocks.length; j++) {
              for (let k = 0; k < templates[i].memoBlocks[j].normalAnswers.length; k++) {
                if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 1) {
                  // 问题类型为：Title
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: null,
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'Title',
                    AnswerID: templates[i].memoBlocks[j].normalAnswers[k].question.AnswerID,
                    MemoBlockID: templates[i].memoBlocks[j].normalAnswers[k].question.MemoBlockID
                  }
                } else if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 2) {
                  // 问题类型为：Reminder
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: null,
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'Reminder',
                    AnswerID: templates[i].memoBlocks[j].normalAnswers[k].question.AnswerID,
                    MemoBlockID: templates[i].memoBlocks[j].normalAnswers[k].question.MemoBlockID
                  }
                } else if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 3) {
                  // 问题类型为：Property
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: templates[i].memoBlocks[j].normalAnswers[k].question.value,
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'Property',
                    AnswerID: templates[i].memoBlocks[j].normalAnswers[k].question.AnswerID,
                    MemoBlockID: templates[i].memoBlocks[j].normalAnswers[k].question.MemoBlockID
                  }
                  // 未回答
                  // if (templates[i].memoBlocks[j].normalAnswers[k].AnswerDesc === '' || templates[i].memoBlocks[j].normalAnswers[k].AnswerDesc === null) {
                  //   allAnswer = false
                  // }
                } else if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 4) {
                  // 问题类型为：SimpleAnswer
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: templates[i].memoBlocks[j].normalAnswers[k].question.value,
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'SimpleAnswer',
                    AnswerID: templates[i].memoBlocks[j].normalAnswers[k].question.AnswerID,
                    MemoBlockID: templates[i].memoBlocks[j].normalAnswers[k].question.MemoBlockID
                  }
                  // 未回答
                  // if (templates[i].memoBlocks[j].normalAnswers[k].AnswerDesc === '' || templates[i].memoBlocks[j].normalAnswers[k].AnswerDesc === null) {
                  //   allAnswer = false
                  // }
                } else if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 5) {
                  // 问题类型为：Fillin
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    fillinAnswers: templates[i].memoBlocks[j].normalAnswers[k].question.fillinParts.map(it => {
                      return { FillinPartID: it.FillinPartID, IsFillin: it.IsFillin, Part: it.Part, FillinContent: it.FillinContent !== undefined ? it.FillinContent : '' }
                    }),
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: '',
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'Fillin',
                    AnswerID: templates[i].memoBlocks[j].normalAnswers[k].question.AnswerID,
                    MemoBlockID: templates[i].memoBlocks[j].normalAnswers[k].question.MemoBlockID
                  }
                  // 未回答
                  // if (templates[i].memoBlocks[j].normalAnswers[k].fillinAnswers.find(item => item.IsFillin + '|' + item.FillinContent === 'true|') !== undefined || templates[i].memoBlocks[j].normalAnswers[k].fillinAnswers.find(item => item.IsFillin + '|' + item.FillinContent === 'true|null') !== undefined) {
                  //   allAnswer = false
                  // }
                } else if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 6) {
                  // 问题类型为：SingleChoice
                  let optionAnswer = {}
                  if (templates[i].memoBlocks[j].normalAnswers[k].question.value !== null) {
                    optionAnswer = {
                      ChoiceOptionID: templates[i].memoBlocks[j].normalAnswers[k].question.value,
                      OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                      Content: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(it => it.ChoiceOptionID === templates[i].memoBlocks[j].normalAnswers[k].question.value).Content,
                      Outputs: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(it => it.ChoiceOptionID === templates[i].memoBlocks[j].normalAnswers[k].question.value).Outputs,
                      AdditionContent: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(it => it.ChoiceOptionID === templates[i].memoBlocks[j].normalAnswers[k].question.value).AdditionContent
                    }
                    // NeedAddition为true但是未填写AdditionContent
                    // let NeedAddition = templates[i].memoBlocks[j].normalAnswers[k].question.options.find(it => it.ChoiceOptionID === templates[i].memoBlocks[j].normalAnswers[k].question.value).NeedAddition
                    // let AdditionContent = templates[i].memoBlocks[j].normalAnswers[k].question.options.find(it => it.ChoiceOptionID === templates[i].memoBlocks[j].normalAnswers[k].question.value).AdditionContent
                    // if (NeedAddition && (AdditionContent === null || AdditionContent === '')) {
                    //   allAnswer = false
                    // }
                  } else { // 未回答
                    optionAnswer = null
                    // allAnswer = false
                  }
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    optionAnswer: optionAnswer,
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: '',
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'SingleChoice',
                    AnswerID: templates[i].memoBlocks[j].normalAnswers[k].question.AnswerID,
                    MemoBlockID: templates[i].memoBlocks[j].normalAnswers[k].question.MemoBlockID
                  }
                } else if (templates[i].memoBlocks[j].normalAnswers[k].question.TypeID === 7) {
                  // 问题类型为：MultipleChoice
                  let optionAnswers = []
                  if (templates[i].memoBlocks[j].normalAnswers[k].question.value.length > 0) {
                    optionAnswers = templates[i].memoBlocks[j].normalAnswers[k].question.value.map(it => {
                      return {
                        ChoiceOptionID: it,
                        OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                        Content: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(i => i.ChoiceOptionID === it).Content,
                        Outputs: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(i => i.ChoiceOptionID === it).Outputs,
                        AdditionContent: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(i => i.ChoiceOptionID === it).AdditionContent,
                        SequenceNo: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(i => i.ChoiceOptionID === it).SequenceNo,
                        NeedAddition: templates[i].memoBlocks[j].normalAnswers[k].question.options.find(i => i.ChoiceOptionID === it).NeedAddition
                      }
                    })
                    // 按SequenceNo排序
                    optionAnswers = optionAnswers.slice().sort((a, b) => { return a.SequenceNo - b.SequenceNo })
                    // NeedAddition为true但是未填写AdditionContent
                    // if (optionAnswers.find(item => item.NeedAddition + '|' + item.AdditionContent === 'true|') !== undefined || optionAnswers.find(item => item.NeedAddition + '|' + item.AdditionContent === 'true|null') !== undefined) {
                    //   allAnswer = false
                    // }
                    optionAnswers = optionAnswers.map(it => {
                      return {
                        ChoiceOptionID: it.ChoiceOptionID,
                        OutputModeID: it.OutputModeID,
                        Content: it.Content,
                        Outputs: it.Outputs,
                        AdditionContent: it.AdditionContent
                      }
                    })
                  } else { // 未回答
                    // allAnswer = false
                  }
                  templates[i].memoBlocks[j].normalAnswers[k] = {
                    optionAnswers: optionAnswers,
                    QuestionID: templates[i].memoBlocks[j].normalAnswers[k].QuestionID,
                    BlockQuestionID: templates[i].memoBlocks[j].normalAnswers[k].BlockQuestionID,
                    QuestionDesc: templates[i].memoBlocks[j].normalAnswers[k].question.Description,
                    AnswerDesc: '',
                    OutputModeID: templates[i].memoBlocks[j].normalAnswers[k].question.OutputModeID,
                    QuestionType: 'MultipleChoice',
                    AnswerID: templates[i].memoBlocks[j].normalAnswers[k].question.AnswerID,
                    MemoBlockID: templates[i].memoBlocks[j].normalAnswers[k].question.MemoBlockID
                  }
                }
                // 修改相对于新增，需要的额外字段
                if (templates[i].memoBlocks[j].normalAnswers[k].AnswerID === undefined) {
                  delete templates[i].memoBlocks[j].normalAnswers[k].AnswerID
                }
                if (templates[i].memoBlocks[j].normalAnswers[k].MemoBlockID === undefined) {
                  delete templates[i].memoBlocks[j].normalAnswers[k].MemoBlockID
                }
                // 修改相对于新增，需要的额外字段
              }
            }
          }
          if (allAnswer) {
            form.memoTemplates = templates
            // console.log('提交问题', form)
            this.isLoading = true
            this.axios.post('/api/Services/memoservice.asmx/SaveMemo', {memo: JSON.stringify(form)}).then(res => {
              if (res) {
                console.log('修改', res)
                this.$message({
                  type: 'success',
                  message: 'Operation Succeeded'
                })
                this.$refs['memoForm'].resetFields()
                this.currentTemplates = []
                this.memoFormVisible = false
              }
              this.isLoading = false
            }).catch(err => {
              console.log('修改出错', err)
              this.isLoading = false
            })
          } else {
            this.$message({
              type: 'warning',
              message: 'Please Answer All Questions'
            })
          }
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
            this.viewForm.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
            this.viewForm.RequestDate = moment(res.data.RequestDate).format('YYYY-MM-DD')
            this.printObj.popTitle = this.viewForm.Title // + '( ' + this.viewForm.Author + ')'
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
    pdf: function (title, EffectiveDate) {
      this.htmlTitle = title + ' ' + EffectiveDate
      this.getPdf('#pdfDom')
    }
  }
}
</script>

<style scoped>

</style>
