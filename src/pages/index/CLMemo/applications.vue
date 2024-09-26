<!--
FileName: applications.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all commercial application list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">{{businessType.value}} Policies</span>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <!--el-form-item>
            <el-date-picker @change="search()"
                            v-model="searchForm.periodDates" class="middleWidth"
                            type="daterange"
                            unlink-panels
                            placeholder="StartDate - EndDate">
            </el-date-picker>
          </el-form-item-->
          <el-form-item label="Frequently Used" prop="Year">
            <el-select v-model="searchForm.period" placeholder="" class="middleWidth" no-data-text="No Record" filterable @change="changePeriod()">
              <el-option v-for="item in periods" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search()" size="small">Go</el-button>
            <el-button icon="el-icon-search" type="primary" @click="resetSearch()" size="small">Reset</el-button>
            <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading" size="small">New</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="inPageContent">
      <el-table height="840" :data="currentlist" empty-text="No Record" v-loading="isLoadingApplications || isLoadingProducers" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="ApplicationID" width="60" fixed="left" sortable="custom"></el-table-column>
        <el-table-column label="ClientCode" prop="ClientCode" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="PolicyNum" prop="PolicyNumber" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="Applicant" prop="NameInsured" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="AppType" prop="AppType" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="InsCorp" prop="CorpName" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="EffectiveDate" prop="EffectiveDate" min-width="130" sortable="custom">
          <template slot-scope="scope">
            <span>{{scope.row.EffectiveDate.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column>
        <!--el-table-column label="ExpiryDate" prop="ExpiryDate" min-width="150" sortable="custom">
          <template slot-scope="scope">
            <span>{{scope.row.ExpiryDate.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column-->
        <el-table-column label="A/D" prop="AgenDir" min-width="70" sortable="custom"></el-table-column>
        <el-table-column label="Producer" prop="Producer" min-width="100" sortable="custom"></el-table-column>
        <!--el-table-column label="Status" prop="Status" min-width="100" sortable="custom"></el-table-column-->
        <el-table-column label="Action" width="360">
          <template v-slot="scope">
            <el-button-group>
              <el-button icon="el-icon-edit" type="primary" @click="showEdition(scope.row)"  size="small">BaseInfo</el-button>
              <el-button icon="el-icon-remove" type="danger" @click="del(scope.row)"  size="small">Delete</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList" @current-change="handleCurrentChange">
      </el-pagination>
      <!----------------------------------------------BaseInfo Edition 弹窗开始----------------------------------------------------->
      <el-dialog z-index="5" title="Application Base Info Edition" :visible.sync="applicationFormVisible" width="600px" center>
        <EditApplicationBase ref="eab" :businessTypeId="btypeId" :application="currentApplication" @hideEdition="hideEdition()"></EditApplicationBase>
      </el-dialog>
      <!----------------------------------------------BaseInfo弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import EditApplicationBase from '@/component/parts/editApplicationBase'

export default {
  components: {
    EditApplicationBase
  },
  data: function () {
    return {
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      Author: JSON.parse(this.$store.getters.getAccount).Name,
      printObj: {
        id: 'pdfDom',
        popTitle: ''
      },
      htmlTitle: 'null', // pdf文件名
      btypeId: 3,
      businessType: {key: 3, value: 'IRCA'},
      isLoading: false,
      isLoadingAll: false,
      isLoadingApplications: false,
      isLoadingProducers: false,
      isLoadingInsuranceCorps: false,
      applicationFormVisible: false,
      producerList: [],
      statusList: [],
      appTypes: [],
      insuranceCorpList: [],
      periods: [
        {name: 'All', value: 0},
        {name: 'Month to Date', value: 1},
        {name: 'Year to Date', value: 2},
        {name: 'Last 30 Days', value: 30},
        {name: 'Last 90 Days', value: 90},
        {name: 'Last 182 Days', value: 182},
        {name: 'Last 365 Days', value: 365}],
      // appTypes: [{ID: 1, Name: 'New Business'}, {ID: 2, Name: 'Remarket'}, {ID: 3, Name: 'LOA'}, {ID: 4, Name: 'Rewrite'}],
      // 搜索
      searchForm: {
        name: null,
        periodDates: '',
        period: 0
      },
      searchName: null,
      // 列表
      currentlist: [],
      list: [],
      totalList: [],
      currentApplication: null,
      currentApplicationID: 0,
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      isAll: false
    }
  },
  mounted: function () {
    this.btypeId = Number(this.$route.params.id)
    this.loadAppTypes()
    this.loadBusinessTypes(this.btypeId)
    this.loadProducers(0)
    this.loadApplicationStatus()
    this.initInsuranceCompany()
    // this.initTemplates()
    this.searchForm.period = 0
    this.changePeriod()
  },
  methods: {
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
      this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    rank: function (name) {
      this.list.sort(this.by(name))
    },
    rankdesc: function (name) {
      this.list.sort(this.bydesc(name))
    },
    changePeriod: function () {
      if (this.searchForm.period === 0) {
        let year = new Date().getFullYear()
        let month = new Date().getMonth()
        let startDate = new Date(2020, 0, 1)
        let endDate = new Date(year + 10, month, 1)
        this.searchForm.periodDates = [startDate, endDate]
      } else if (this.searchForm.period === 1) {
        let year = new Date().getFullYear()
        let month = new Date().getMonth()
        let startDate = new Date(year, month, 1)
        let endDate = new Date(year + 1, month, 1)
        this.searchForm.periodDates = [startDate, endDate]
      } else if (this.searchForm.period === 2) {
        let year = new Date().getFullYear()
        let month = new Date().getMonth()
        let startDate = new Date(year, 0, 1)
        let endDate = new Date(year + 1, month, 1)
        this.searchForm.periodDates = [startDate, endDate]
      } else {
        let now = new Date().getTime()
        let startDate = new Date(now - this.searchForm.period * 24 * 60 * 60 * 1000)
        let endDate = new Date()
        this.searchForm.periodDates = [startDate, endDate]
      }
      this.loadApplications(0)
    },
    /**
     * @return {boolean}
     */
    IsDate (dateval) {
      if (dateval.length > 20 && isNaN(dateval) && !isNaN(Date.parse(dateval))) return true
      else return false
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    setCurrent: function (application) {
      this.currentApplication = application
      this.currentApplicationID = application.ApplicationID
    },
    // 保险公司列表
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps_all', {}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          this.insuranceCorpList = res.data
        }
        this.isLoadingInsuranceCompany = false
        this.attachInsCorp()
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // 删除
    del: function (row) {
      let id = row.ApplicationID
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/CommerceService.asmx/RemoveApplication', {applicationid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.ApplicationID !== id)
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
    // 查询
    search: function () {
      let query = this.searchForm.name
      if (query === '' || query === null) {
        this.list = this.totalList
      } else {
        this.list = this.totalList.filter(r =>
          r.ApplicationID === Number(query) ||
          (r.ClientCode !== null && r.ClientCode.indexOf(query) >= 0) ||
          r.Producer.indexOf(query) >= 0 ||
          (r.NameInsured !== null && r.NameInsured.indexOf(query) >= 0) ||
          (r.PolicyNumber !== null && r.PolicyNumber.indexOf(query) >= 0) ||
          r.EffectiveDate.format('YYYY-MM-DD').indexOf(query) >= 0 ||
          r.ExpiryDate.format('YYYY-MM-DD').indexOf(query) >= 0
        )
      }
      this.total = this.list.length
      this.pageCount = Math.ceil(this.total / this.pageSize)
      this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    loadAppTypes: function () {
      this.isLoadingInsuranceCorps = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'AppType'}).then(res => {
        if (res) {
          console.log('AppTypes', res)
          this.appTypes = res.data
        }
        this.isLoadingInsuranceCorps = false
      }).catch(err => {
        console.log('AppTypes', err)
        this.isLoadingInsuranceCorps = false
      })
    },
    loadBusinessTypes: function (id) {
      this.isLoadingInsuranceCorps = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'BusinessType'}).then(res => {
        if (res) {
          console.log('statusList', res)
          this.businessType = res.data.find(t => t.key === id)
        }
        this.isLoadingInsuranceCorps = false
      }).catch(err => {
        console.log('statusList', err)
        this.isLoadingInsuranceCorps = false
      })
    },
    loadApplicationStatus: function () {
      this.isLoadingInsuranceCorps = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'ApplicationStatus'}).then(res => {
        if (res) {
          console.log('statusList', res)
          this.statusList = res.data
        }
        this.isLoadingInsuranceCorps = false
      }).catch(err => {
        console.log('statusList', err)
        this.isLoadingInsuranceCorps = false
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
            if (producer !== undefined) a.Author = author.Name
            else a.Author = ''
          }
        })
      }
    },
    attachInsCorp: function () {
      if (!this.isLoadingApplications && !this.isLoadingInsuranceCompany) {
        this.totalList.forEach(a => {
          let corp = this.insuranceCorpList.find(p => p.InsuranceCorpID === a.InsuranceCorpID)
          if (corp !== undefined) a.CorpName = corp.ShortName
          else a.CorpName = ''
        })
      }
    },
    loadApplications: function (start) {
      if (start === 0) {
        this.totalList = []
        this.isLoadingApplications = true
        this.isLoadingAll = true
      }
      let startDate = this.dateFormat(this.searchForm.periodDates[0])
      let endDate = this.dateFormat(this.searchForm.periodDates[1])
      this.axios.post('/api/Services/CommerceService.asmx/GetApplications', {btypeid: this.btypeId, startdate: startDate, enddate: endDate, start: start}).then(res => {
        if (res) {
          console.log('Applications', res)
          this.attachApplications((res.data))
          if (start === 0) {
            this.total = res.count
            this.totalList = res.data
            this.list = this.totalList
            this.pageCount = Math.ceil(this.total / this.pageSize)
            this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            this.isLoadingApplications = false
          } else {
            this.totalList = this.totalList.concat(res.data)
          }
          if (this.totalList.length === this.total) {
            this.totalList.sort(this.bydesc('ApplicationID'))
            this.list = this.totalList
            this.pageCount = Math.ceil(this.total / this.pageSize)
            this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            this.isLoadingAll = false
            this.attachInsCorp()
            this.attachProducers()
          } else this.loadApplications(this.totalList.length)
        }
      }).catch(err => {
        console.log('loadApplications error', err)
        this.isLoadingApplications = false
        this.isLoadingAll = false
      })
    },
    attachApplications: function (applications) {
      applications.forEach(a => {
        a.EffectiveDate = moment(a.EffectiveDate)
        a.ExpiryDate = moment(a.ExpiryDate)
        a.RequestDate = moment(a.RequestDate)
        a.DateOfBirth = moment(a.DateOfBirth)
        let status = this.statusList.find(s => s.key === a.StatusID)
        if (status !== undefined) a.Status = status.value
        else a.Status = ''
        // let producer = this.producerList.find(p => p.StaffID === a.ProducerID)
        // if (producer !== undefined) a.Producer = producer.Name
        // else a.Producer = ''
        // let corp = this.insuranceCorpList.find(p => p.InsuranceCorpID === a.InsuranceCorpID)
        // if (corp !== undefined) a.CorpName = corp.ShortName
        // else a.CorpName = ''
        if (a.BillWayID === 1) a.AgenDir = 'A'
        else if (a.BillWayID === 2) a.AgenDir = 'D'
        else a.AgenDir = ''
        let appType = this.appTypes.find(t => t.key === a.TypeID)
        if (appType !== undefined) a.AppType = appType.value
        else a.AppType = ''
      })
    },
    handleCurrentChange: function (val) {
      console.log(`当前页: ${val}`)
      if (val === this.pageCount && !this.isAll) {
      } else {
      }
      this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search()
    },
    // 关闭修改
    closeEdit: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        // this.$refs['editForm'].resetFields()
        // this.editForm.templateBlocks = []
        // this.currentBlock = null
        done()
      }).catch(() => {})
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
        applicationTemplates: [{
          applicationBlocks: [{
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
      this.axios.post('/api/Services/CommerceService.asmx/CreatePrintRecord', {applicationid: this.viewForm.ApplicationID, typeid: 1}).then(res => {
        if (res) {
          console.log('create printRecord', res)
        }
      }).catch(err => {
        console.log('导出Application PDF出错', err)
      })
    },
    showAdd: function () {
      let application = {
        IsNew: true,
        ApplicationID: 0,
        BusinessTypeID: this.btypeId,
        NameInsured: null,
        ClientCode: null,
        ExpiryDate: moment(),
        EffectiveDate: moment(),
        ProducerID: null,
        PolicyNumber: null,
        Premium: null,
        InsuranceCorpID: null,
        BillWayDI: null,
        TypeID: null,
        Address: '',
        City: '',
        Province: '',
        PostCode: '',
        Email: ''
      }
      this.currentApplication = application
      this.applicationFormVisible = true
      if (this.$refs.eab !== undefined) {
        this.$refs.eab.loadApplication(application.ApplicationID)
      }
    },
    showEdition: function (application) {
      this.currentApplication = application
      this.applicationFormVisible = true
      if (this.$refs.eab !== undefined) {
        this.$refs.eab.loadApplication(application.ApplicationID)
      }
    },
    hideEdition: function () {
      if (this.currentApplication.IsNew) {
        this.totalList.splice(0, 0, this.currentApplication)
        this.search()
      }
      this.applicationFormVisible = false
    }

  }
}
</script>

<style scoped>

</style>
