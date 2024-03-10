<!--
FileName: Library/questions/routes.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show route list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Routes for {{businessTypes[btypeId]}}</span>
      <div class="rightBtnBox">
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search()" :loading="isLoading" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="currentList.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Block ID" prop="BlockID" width="100" fixed="left" sortable></el-table-column>
        <el-table-column label="BlockName" prop="BlockName" min-width="200" sortable :filters="currentBlocks"
                         :filter-method="filterBlock"></el-table-column>
        <el-table-column label="QuestionID" prop="QuestionID" min-width="100" sortable></el-table-column>
        <el-table-column label="Question" prop="Question" min-width="200"></el-table-column>
        <el-table-column label="InsuranceCorp" prop="CorpName" min-width="150" :filters="currentCorps"
                         :filter-method="filterCorp"></el-table-column>
        <el-table-column label="Op" prop="Operator" min-width="50"></el-table-column>
        <el-table-column label="Operand" prop="Operand" min-width="200"></el-table-column>
        <el-table-column label="MoveStep" prop="step" min-width="100"></el-table-column>
        <el-table-column label="RouteLevel" prop="Level" min-width="100"></el-table-column>
        <el-table-column label="Action" width="50" fixed="right">
          <template slot-scope="scope">
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  components: {
  },
  data: function () {
    return {
      isLoading: false,
      isLoadingBlockQuestion: false,
      isLoadingInsuranceCompany: false,
      currentId: null,
      typeId: 2,
      btypeId: 2,
      businessTypes: ['', 'PL Memo', 'NB CoverLetter', 'IRCA Memo', 'CL Application'],
      typeName: ' Route Question List',
      routeLevels: [{id: 0, name: 'Question'}, {id: 1, name: 'Block'}, {id: 2, name: 'Template'}],
      routeTypes: [{id: 1, name: 'Base On Question'}, {id: 2, name: 'Base On Answer'}],
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      insuranceCorps: [],
      currentCorps: [],
      blocks: [],
      currentBlocks: [],
      questions: [],
      blockQuestions: [],
      routePages: [],
      // 列表
      currentList: [],
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  watch: {
    $route (to, from) {
      console.log(to.params.id)
      this.btypeId = parseInt(this.$route.params.id)
      this.typeName = this.businessTypes[this.btypeId] + this.typeName
      this.loadRoutes()
    }
  },
  mounted: function () {
    this.btypeId = parseInt(this.$route.params.id)
    this.typeName = this.businessTypes[this.btypeId] + this.typeName
    this.loadBlocks()
    this.loadQuestions()
    this.initInsuranceCompany()
    this.loadBlockQuestions()
    this.loadRoutes()
  },
  methods: {
    filterCorp: function (value, row, column) {
      // const property = column['CorpName']
      return row['CorpName'] === value
    },
    filterBlock: function (value, row) {
      return row['BlockName'] === value
    },
    // 保险公司列表
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps_all', {}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          let all = [{InsuranceCorpID: 0, Name: 'All Insurance Company', ShortName: 'All Company'}]
          this.insuranceCorps = [...all, ...res.data]
          this.insuranceCorps.forEach(c => {
            c.text = c.ShortName
            c.value = c.ShortName
          })
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // 查询
    loadQuestions: function () {
      this.isLoadingBlockQuestion = true
      this.axios.post('/api/Services/BaseService.asmx/GetQuestions_Route', {btypeid: this.btypeId}).then(res => {
        if (res) {
          console.log('questions', res)
          this.questions = res.data
        }
        this.isLoadingBlockQuestion = false
      }).catch(err => {
        console.log('question出错', err)
        this.isLoadingBlockQuestion = false
      })
    },
    // 查询
    loadBlocks: function () {
      this.isLoadingBlockQuestion = true
      this.axios.post('/api/Services/BaseService.asmx/GetBlocks', {btypeid: this.btypeId}).then(res => {
        if (res) {
          console.log('blocks', res)
          this.blocks = res.data
          this.blocks.forEach(b => {
            b.text = b.Name
            b.value = b.Name
          })
        }
        this.isLoadingBlockQuestion = false
      }).catch(err => {
        console.log('blocks出错', err)
        this.isLoadingBlockQuestion = false
      })
    },
    // 查询
    loadBlockQuestions: function () {
      this.isLoadingBlockQuestion = true
      this.axios.post('/api/Services/BaseService.asmx/GetBlockQuestions_Route', {btypeid: this.btypeId}).then(res => {
        if (res) {
          console.log('blockQuestions', res)
          this.blockQuestions = res.data
        }
        this.isLoadingBlockQuestion = false
      }).catch(err => {
        console.log('blockQuestions出错', err)
        this.isLoadingBlockQuestion = false
      })
    },
    search: function () {
      let condition = this.searchForm.name
      this.currentList = this.list.filter(r => r.CorpName.indexOf(condition) > -1 || r.BlockName.indexOf(condition) > -1 || r.Question.indexOf(condition) > -1)
      this.currentCorps = this.insuranceCorps.filter(c => this.currentList.find(r => r.InsuranceCorpID === c.InsuranceCorpID) !== undefined)
      this.currentBlocks = this.blocks.filter(b => this.currentList.find(r => r.BlockID === b.BlockID) !== undefined)
    },
    // 查询
    loadRoutes: function () {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetQuestionRouteCount', {btypeid: this.btypeId}).then(res => {
        if (res) {
          console.log('查询', res)
          let count = res.data
          let pagesize = 200
          for (let page = 0; page * pagesize < count; page++) {
            this.loadPage(page, pagesize)
            this.routePages.push([])
          }
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    // 查询
    loadPage: function (page, pagesize) {
      this.axios.post('/api/Services/BaseService.asmx/GetQuestionRoutes', {btypeid: this.btypeId, page: page, pagesize: pagesize}).then(res => {
        if (res) {
          console.log('查询', res)
          this.routePages[page] = res.data
          this.checkPageLoad()
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    checkPageLoad: function () {
      let loading = false
      this.routePages.forEach(p => {
        if (p.length === 0) loading = true
      })
      if (loading) return
      this.isLoading = false
      this.list = []
      this.routePages.forEach(p => {
        this.list = this.list.concat(p)
      })
      this.blocks = this.blocks.filter(b => this.blockQuestions.findIndex(bq => bq.BlockID === b.BlockID) >= 0)
      this.list.forEach(r => {
        let routeLevel = this.routeLevels.find(l => l.id === r.RouteLevel)
        r.Level = routeLevel.name
        let corp = this.insuranceCorps.find(c => c.InsuranceCorpID === r.InsuranceCorpID)
        if (corp === undefined) r.CorpName = r.InsuranceCorpID
        else if (corp.ShortName === null) r.CorpName = corp.Name
        else r.CorpName = corp.ShortName
        let blockQuestion = this.blockQuestions.find(bq => bq.BlockQuestionID === r.BlockQuestionID)
        r.BlockID = blockQuestion.BlockID
        r.QuestionID = blockQuestion.QuestionID
        let block = this.blocks.find(b => b.BlockID === r.BlockID)
        r.BlockName = block.Name
        let question = this.questions.find(b => b.QuestionID === r.QuestionID)
        r.Question = question.Description
        if (question.TypeID === 6) {
          let optionid = Number(r.Operand)
          let option = question.options.find(o => o.ChoiceOptionID === optionid)
          r.Operand = option.Content
        }
        if (r.RouteLevel === 0) {
          if (r.MoveStep === -1) r.step = 'Move To End'
          else if (r.MoveStep === 0) r.step = 'Stay Here'
          else if (r.MoveStep === 1) r.step = 'Move Next'
          else r.step = 'Skip ' + (r.MoveStep - 1)
        } else if (r.RouteLevel === 1) {
          r.step = 'BlockID: ' + r.MoveStep
        } else if (r.RouteLevel === 2) {
          r.step = 'TemplateID: ' + r.MoveStep
        } else r.step = ''
      })
      this.currentList = this.list
      this.currentCorps = this.insuranceCorps
      this.currentBlocks = this.blocks
      this.pageSize = this.list.length
      this.total = this.list.length
      this.currentPage = 1
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search(null)
    }
  }
}
</script>

<style scoped>

</style>
