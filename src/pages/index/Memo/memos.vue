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
        <el-table-column label="Author" prop="Author" min-width="150"></el-table-column>
        <el-table-column label="RequestDate" min-width="150">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.RequestDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-view" type="primary" @click="view(scope.row.MemoID)" :loading="isLoading || isLoadingInsuranceCompany" size="small"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
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
                  <div v-if="item.Outputs === '2|false'">
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

export default {
  data: function () {
    return {
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
      this.isLoading = true
      this.axios.post('/api/Services/memoservice.asmx/GetMemo', {memoid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.viewFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.viewForm = res.data
            this.viewForm.InsuranceCorp = this.insuranceCompanyList.find(item => item.InsuranceCorpID === res.data.InsuranceCorpID).Name
            this.viewForm.Author = 'TODO' // todo
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
