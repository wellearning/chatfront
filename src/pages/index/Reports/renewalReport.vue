<!--
FileName: Reports/managerReport.vue
Author: Ge Chen
Update Date: 2024/6/26
Function: Show manager report.
-->
<template>
  <div>
    <div class="inPageTitle">
      <a class="inPageNav" href="#"  style="color:darkblue" title="">Renewal Report</a>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search" :loading="isLoading" size="small">Go</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
          <el-row :gutter="20" class="title" v-loading="isLoading">
            <el-col :span="4" class="">Questionnaire: </el-col>
            <el-col :span="4" v-for="item in emailStatusList" :key="item.key">{{item.value}}: {{item.count}}</el-col>
          </el-row>
          <el-row :gutter="20" class="title" v-loading="isLoading">
            <el-col :span="4" class="">Renewal: </el-col>
            <el-col :span="4" v-for="item in renewalStatusList" :key="item.key">{{item.name}}: {{item.count}}</el-col>
          </el-row>
        </el-main>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="ApplicationID" width="60" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column label="Applicant" prop="NameInsured" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Producer" prop="Producer" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Company" prop="CorpName" min-width="150" sortable="custom"></el-table-column>
        <el-table-column label="PolicyNum" prop="PolicyNumber" min-width="120" sortable="custom"></el-table-column>
        <!--el-table-column label="Premium" prop="Premium" min-width="80" sortable="custom"></el-table-column-->
        <el-table-column label="A/D" prop="AgenDir" min-width="70" sortable="custom"></el-table-column>
        <el-table-column label="EffecDate" prop="EffectiveDate" min-width="90" sortable="custom">
          <template v-slot="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="ExpiryDate" prop="ExpiryDate" min-width="90" sortable="custom">
          <template v-slot="scope">
            <span>{{dateFormat(scope.row.ExpiryDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Questionnaire" prop="QuestionnaireStatus" min-width="100" :show-overflow-tooltip="true" sortable="custom"></el-table-column>
        <el-table-column label="Status" prop="RenewalStatus" min-width="120" :show-overflow-tooltip="true" sortable="custom">
          <template v-slot="scope">
            <el-tag v-if="scope.row.RenewalStatus === 'NeedBinding' || scope.row.RenewalStatus === 'NeedAction'" type="danger" size="medium">{{scope.row.RenewalStatus}}</el-tag>
            <span v-else>{{scope.row.RenewalStatus}}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  components: {

  },
  data: function () {
    return {
      isLoadingApplications: false,
      isLoadingInsuranceCompany: false,
      isLoadingProducers: false,
      isPost: false,
      totalNum: 0,
      finishNum: 0,
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      // printObj: {
      //   id: 'pdfDom',
      //   popTitle: ''
      // },
      htmlTitle: 'null', // pdf文件名
      isLoading: false,
      // 搜索
      searchForm: {
        name: null
      },
      // 列表
      list: [],
      questionnaireSummary: {
        notSent: 0,
        autoSent: 0,
        manuallySent: 0,
        obtained: 0,
        total: 0
      },
      renewalSummary: {
        open: 0,
        binding: 0,
        action: 0,
        total: 0
      },
      renewalStatusList: [],
      emailStatusList: [],
      producers: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  mounted: function () {
    this.loadProducers(0)
    this.loadRenewalStatus()
    this.loadEmailStatus()
    this.initInsuranceCompany()
    this.loadApplications(0)
  },
  watch: {
    finishNum (val) {
      if (val === this.totalNum && this.isPost) {
        this.currentTemplates = this.currentTemplates.sort((a, b) => { return a.orderId - b.orderId })
        this.setNumber()
        this.totalNum = 0
        this.finishNum = 0
        this.isPost = false
        this.isLoading = false
      }
    }
  },
  methods: {
    switchRecords: function () {
      if (this.managerVisible) this.search()
      else this.loadProducer()
    },
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
    },
    rank: function (name) {
      if (this.adminVisible) this.list.sort(this.by(name))
      else {
        if (name.indexOf('Institution') >= 0) name = name.replace('Institution', 'Producer')
        this.producers.sort(this.by(name))
      }
      // this.list.sort(this.by(name))
    },
    rankdesc: function (name) {
      if (this.adminVisible) this.list.sort(this.bydesc(name))
      else {
        if (name.indexOf('Institution') >= 0) name = name.replace('Institution', 'Producer')
        this.producers.sort(this.bydesc(name))
      }
      // this.list.sort(this.bydesc(name))
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps', {}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          this.insuranceCorpList = res.data// .filter(c => c.BusinessLineID !== 1)
        }
        this.isLoadingInsuranceCompany = false
        this.attachCorps()
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    loadRenewalStatus: function () {
      this.isLoadingStatus = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'ApplicationRenewalStatus'}).then(res => {
        if (res) {
          console.log('statusList', res)
          this.renewalStatusList = res.data
          res.data.forEach(s => {
            if (s.value === 'Opened') s.name = 'Open Renewal'
            else if (s.value === 'NeedBinding') s.name = 'Need Binding'
            else if (s.value === 'NeedAction') s.name = 'Need Action'
            else s.name = s.value
          })
        }
        this.isLoadingStatus = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingStatus = false
      })
    },
    loadEmailStatus: function () {
      this.isLoadingStatus = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'EmailStatus'}).then(res => {
        if (res) {
          console.log('statusList', res)
          this.emailStatusList = res.data
        }
        this.isLoadingStatus = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingStatus = false
      })
    },
    loadProducers: function (start) {
      this.isLoadingProducers = true
      this.axios.post('/api/Services/baseservice.asmx/GetAllProducers', {start: start}).then(res => {
        if (res) {
          console.log('producerList', res)
          if (start === 0) {
            this.producerCount = res.count
            this.producerList = res.data
          } else {
            this.producerList = this.producerList.concat(res.data)
          }
          if (this.producerList.length < this.producerCount) {
            this.loadProducers(this.producerList.length)
          } else {
            this.isLoadingProducers = false
            this.attachProducers()
          }
        }
      }).catch(err => {
        console.log('producerList', err)
        this.isLoadingProducers = false
      })
    },
    attachProducers: function () {
      if (!this.isLoadingApplications && !this.isLoadingProducers) {
        this.totalList.forEach(a => {
          let producer = this.producerList.find(p => p.StaffID === a.ProducerID)
          if (producer !== undefined) a.Producer = producer.Name
          else a.Producer = ''
          if (a.StaffID === a.ProducerID) a.Author = a.Producer
          else {
            let author = this.producerList.find(p => p.StaffID === a.StaffID)
            if (author !== undefined) a.Author = author.Name
            else a.Author = ''
          }
        })
      }
    },
    attachCorps: function () {
      if (!this.isLoadingApplications && !this.isLoadingInsuranceCompany) {
        this.totalList.forEach(a => {
          let corp = this.insuranceCorpList.find(c => c.InsuranceCorpID === a.InsuranceCorpID)
          if (corp !== undefined) a.CorpName = corp.ShortName
          else a.CorpName = ''
        })
      }
    },
    summary: function () {
      let list = this.totalList
      this.emailStatusList.forEach(s => {
        let items = list.filter(a => a.QuestionnaireStatus === s.value)
        s.count = items.length
      })
      this.renewalStatusList.forEach(s => {
        let items = list.filter(a => a.RenewalStatus === s.name)
        s.count = items.length
      })
      this.renewalStatusList = this.renewalStatusList.filter(s => s.count > 0)
    },
    loadApplications: function (start) {
      this.isLoadingApplications = true
      if (start === 0) this.totalList = []
      this.axios.post('/api/Services/CommerceService.asmx/GetRenewals', {start: start}).then(res => {
        if (res) {
          console.log('Application查询', res)
          if (start === 0) {
            this.total = res.count
            this.totalList = res.data
          } else {
            this.totalList = this.totalList.concat(res.data)
          }
          if (this.totalList.length === this.total) {
            this.totalList.forEach(a => {
              this.attachInfo(a)
            })
            this.list = this.totalList
            this.pageCount = Math.ceil(this.total / this.pageSize)
            this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            this.isLoadingApplications = false
            this.attachProducers()
            this.attachCorps()
            this.summary()
          } else this.loadApplications(this.totalList.length)
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingApplications = false
      })
    },
    attachInfo: function (a) {
      a.EffectiveDate = moment(a.EffectiveDate)
      a.ExpiryDate = moment(a.ExpiryDate)
      a.RequestDate = moment(a.RequestDate)
      a.DateOfBirth = moment(a.DateOfBirth)
      let corp = this.insuranceCorpList.find(c => c.InsuranceCorpID === a.InsuranceCorpID)
      if (corp !== undefined) a.CorpName = corp.ShortName
      else a.CorpName = ''
      this.setRenewalStatus(a)
      let status = this.emailStatusList.find(s => s.key === a.QuestionnaireStatus)
      if (status !== undefined) a.QuestionnaireStatus = status.value
      else a.QuestionnaireStatus = ''
      if (a.BillWayID === 1) a.AgenDir = 'A'
      else if (a.BillWayID === 2) a.AgenDir = 'D'
      else a.AgenDir = ''
      // this.attachProducers()
    },
    setRenewalStatus: function (app) {
      let astatus = this.renewalStatusList.find(s => s.key === app.RenewalStatus)
      app.RenewalStatus = astatus.name
    },

    // 查询
    search: function () {
      let query = this.searchForm.name
      if (query === '' || query === null) {
        this.list = this.totalList
      } else {
        this.list = this.totalList.filter(r => r.Title.indexOf(query) >= 0 ||
          r.ApplicationID === Number(query) ||
          r.Producer.indexOf(query) >= 0 ||
          (r.NameInsured !== null && r.NameInsured.indexOf(query) >= 0) ||
          (r.PolicyNumber !== null && r.PolicyNumber.indexOf(query) >= 0) ||
          (r.ClientCode !== null && r.ClientCode.indexOf(query) >= 0) ||
          (r.QuestionnaireStatus.indexOf(query) >= 0) ||
          r.EffectiveDate.format('YYYY-MM-DD').indexOf(query) >= 0 ||
          r.ExpiryDate.format('YYYY-MM-DD').indexOf(query) >= 0
        )
      }
      this.total = this.list.length
      this.pageCount = Math.ceil(this.total / this.pageSize)
      this.currentPage = 1
      this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
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
