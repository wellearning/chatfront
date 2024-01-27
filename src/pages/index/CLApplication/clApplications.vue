<!--
FileName: clApplications.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all commercial application list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">All Applications</span>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name, 0)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingInsuranceCompany" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingInsuranceCompany" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="ApplicationID" width="60" fixed="left"></el-table-column>
        <el-table-column label="Title" prop="Title" min-width="300"></el-table-column>
        <el-table-column label="Producer" prop="Producer" min-width="100"></el-table-column>
        <el-table-column label="Applicant" prop="NameInsured" min-width="200"></el-table-column>
        <el-table-column label="RequestDate" min-width="150">
          <template slot-scope="scope">
            <span>{{dateFormat(scope.row.RequestDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" prop="Status" min-width="100"></el-table-column>
        <el-table-column label="Action" width="480" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-view" type="primary" @click="showViewApplication(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">View</el-button>
            <el-button icon="el-icon-view"  type="primary" @click="showSheet(scope.row.ApplicationID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">FORM</el-button>
            <el-button icon="el-icon-delete" v-if="scope.row.StatusID !== 2 " type="danger" @click="del(scope.row.ApplicationID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Del</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList" @current-change="handleCurrentChange">
      </el-pagination>
      <!----------------------------------------------查阅弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewFormVisible" width="1184.56px" center :before-close="closeView">
        <ViewApplication ref="vm" :applicationid="currentApplicationID" :insuranceCorps="insuranceCompanyList"></ViewApplication>
      </el-dialog>
      <!----------------------------------------------查阅弹窗结束----------------------------------------------------->
      <!----------------------------------------------Sheet 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="sheetFormVisible" width="1184.56px"  height="2184.56px" center >
        <ViewSheet ref="vs" :businessObjId="currentApplicationID" :businessTypeId="4"></ViewSheet>
      </el-dialog>
      <!----------------------------------------------Sheet 弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import ViewSheet from '@/component/window/sheet'
import ViewApplication from '@/component/window/viewApplication'

export default {
  components: {
    ViewSheet,
    ViewApplication
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
      currentApplication: null,
      currentApplicationID: 0,
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      isAll: false,
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
        applicationTemplates: [{
          applicationBlocks: [{
            answers: []
          }]
        }],
        answerList: []
      },
      pinkSlipFormVisible: false,
      coiFormVisible: false,
      sheetFormVisible: false,
      pinkSlipForm: {
        InsuranceCorpName: null,
        InsuranceCorpAddress: null,
        InsuredName: null,
        InsuredAddress: 'Not provide',
        InsuredCity: 'Not provide',
        VehicleInfo: 'Not provide',
        EffectiveDate: null,
        ExpiryDate: null,
        PolicyNumber: null,
        Broker: ''
      },
      // processing
      ProcessingTypeID: null,
      ProcessingTitle: '',
      processingVisible: false
    }
  },
  mounted: function () {
    this.search(null, 0)
    this.initInsuranceCompany()
  },
  methods: {
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
    showApplication: function (id) {
      this.viewFormVisible = true
      if (this.$refs.vm !== undefined) {
        this.$refs.vm.loadApplication(id)
      }
    },
    showViewApplication: function (application) {
      this.setCurrent(application)
      this.showApplication(application.ApplicationID)
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
    // 删除
    del: function (id) {
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
    search: function (name, start) {
      this.isLoading = true
      if (start === 0) this.list = []
      // 后端不支持null查询，把null转换成''
      if (name === null) {
        this.searchName = ''
      } else {
        this.searchName = name
      }
      this.axios.post('/api/Services/CommerceService.asmx/SearchApplications', {query: this.searchName, start: start}).then(res => {
        if (res) {
          console.log('查询', res)
          if (res.data.length < this.pagerCount * this.pageSize) {
            this.isAll = true
          } else {
            this.isAll = false
          }
          this.list = this.list.concat(res.data)
          this.total = this.list.length
          this.pageCount = Math.ceil(this.total / this.pageSize)
          // this.list = res.data
          // this.total = this.list.length
          // this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    handleCurrentChange: function (val) {
      console.log(`当前页: ${val}`)
      if (val === this.pageCount && !this.isAll) {
        this.search(null, this.total)
      }
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search(null, 0)
    },
    // UW弹窗
    showUnderWriter: function (application) {
      this.currentApplication = application
      this.currentApplicationID = application.ApplicationID
      this.ProcessingTypeID = 1
      this.ProcessingTitle = 'Underwriting Processing'
      this.processingVisible = true
      if (this.$refs.enbp !== undefined) {
        this.$refs.enbp.loadProperties(1, application.ApplicationID)
      }
    },
    // 查阅弹窗
    view: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplication', {applicationid: id}).then(res => {
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
    showSheet: function (applicationid) {
      this.currentApplicationID = applicationid
      this.sheetFormVisible = true
      if (this.$refs.vs !== undefined) {
        this.$refs.vs.loadBusinessObj(applicationid)
      }
    }
  }
}
</script>

<style scoped>

</style>
