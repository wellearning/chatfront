<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Memos</span>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingInsuranceCompany" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingInsuranceCompany" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Memo ID" prop="MemoID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Title" prop="Title" min-width="300"></el-table-column>
        <el-table-column label="EffectiveDate" min-width="150">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Author" prop="Author" min-width="150"></el-table-column>
        <el-table-column label="CorpName" prop="CorpName" min-width="200"></el-table-column>
        <el-table-column label="PolicyNumber" prop="PolicyNumber" min-width="200"></el-table-column>
        <el-table-column label="Name Insured(s)" prop="NameInsured" min-width="200"></el-table-column>
        <el-table-column label="Action" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-view" type="primary" @click="view(scope.row.MemoID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">View</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------查阅弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewFormVisible" width="1184.56px" center :before-close="closeView">
        <div class="printDiv" v-if="viewForm.StatusID === 1">
          <el-button icon="el-icon-document" type="primary" @click="pdf(viewForm.Title, viewForm.EffectiveDate)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Print</el-button>
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
              <div class="viewMemo-subtitle">Name Insured(s):</div>
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
                      <span class="content" v-if="item.AnswerDesc !== '' && item.AnswerDesc !== null">{{item.AnswerDesc}}</span>
                      <span class="content noAnswer" v-else>No Answer</span>
                    </div>
                  </div>
                  <!--问题类型为：SimpleAnswer-->
                  <div v-else-if="item.QuestionType === 'SimpleAnswer' && item.OutputModeID !== 3">
                    <div class="question">{{item.QuestionDesc}}</div>
                    <div class="answer">
                      <span class="content" v-if="item.AnswerDesc !== '' && item.AnswerDesc !== null">{{item.AnswerDesc}}</span>
                      <span class="content noAnswer" v-else>No Answer</span>
                    </div>
                  </div>
                  <!--问题类型为：Fillin-->
                  <div v-else-if="item.QuestionType === 'Fillin' && item.OutputModeID !== 3">
                    <div class="question">
                      <span v-for="part in item.fillinAnswers" :key="part.FillinPartID">
                       <span class="fillInPart" v-if="part.IsFillin && (part.FillinContent !== '' && part.FillinContent !== null)">{{part.FillinContent}}</span>
                        <span class="fillInPart noAnswer" v-else-if="part.IsFillin && (part.FillinContent === '' || part.FillinContent !== null)">No Answer</span>
                        <span v-else>{{part.Part}}</span>
                      </span>
                    </div>
                  </div>
                  <!--问题类型为：SingleChoice-->
                  <div v-else-if="item.QuestionType === 'SingleChoice' && item.OutputModeID !== 3">
                    <div>
                      <div class="question" v-if="item.OutputModeID === 1">{{item.QuestionDesc}}</div>
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
                      <div class="question" v-if="item.OutputModeID === 1">{{item.QuestionDesc}}</div>
                      <div class="answer">
                        <div v-if="item.optionAnswers.length > 0">
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
                        <div v-else>
                          <span class="noAnswer">No Answer</span>
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

export default {
  data: function () {
    return {
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      printObj: {
        id: 'pdfDom',
        popTitle: ''
      },
      htmlTitle: 'null', // pdf文件名
      isLoading: false,
      // isLoadingStaffs: false,
      isLoadingInsuranceCompany: false,
      // staffsList: [],
      insuranceCompanyList: [],
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
      // 查阅
      viewFormVisible: false,
      viewForm: {
        Title: null,
        EffectiveDate: null,
        InsuranceCorp: null,
        PolicyNumber: null,
        Author: null,
        StatusID: 0,
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
    this.initInsuranceCompany()
  },
  methods: {
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
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
    // 查询
    search: function (name) {
      this.isLoading = true
      // 后端不支持null查询，把null转换成''
      if (name === null) {
        this.searchName = ''
      } else {
        this.searchName = name
      }
      this.axios.post('/api/Services/memoservice.asmx/SearchMemoes', {query: this.searchName}).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
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
    // 查阅弹窗
    view: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
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
