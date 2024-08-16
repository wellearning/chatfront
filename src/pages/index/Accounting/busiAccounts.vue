<!--
FileName: Accounting/busiAccounts.vue
Author: Ge Chen
Update Date: 2024/5/23
Function: Show all insurance company list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Outstanding</span>
      <div class="rightBtnBox">
        <!--el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">New</el-button-->
        <el-button icon="el-icon-download" @click="exportExcel()" :loading="isDownloading" size="small">ToExcel</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <div style="margin-top: 0px;">
            <el-col :span="3">Over Due Summary: </el-col>
            <el-col :span="3" class="padding-top:10px;">1 - 30 days: ${{overDueItems[3].amount.toLocaleString()}}</el-col>
            <el-col :span="3" class="">31 - 60 days: ${{overDueItems[2].amount.toLocaleString()}}</el-col>
            <el-col :span="3" class="">Over 60 days: ${{overDueItems[1].amount.toLocaleString()}}</el-col>
          </div>
          <el-form-item label="Over Due" prop="overDueItem">
            <el-select v-model="searchForm.overDueItem" class="yearMonthSelection" size="small" no-data-text="No Record" filterable @change="search()">
              <el-option v-for="item in overDueItems" :key="item.key" :label="item.value" :value="item.key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="search on Name/ID/CreateTime" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search()" :loading="isLoading" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table height="500" :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <!--el-table-column label="ID" prop="BusinessID" width="100" fixed="left" sortable="custom"></el-table-column-->
        <el-table-column label="ID" prop="BusinessID" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="PolicyNumber" prop="PolicyNumber" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="Producer" prop="ProducerName" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="ClientCode" prop="ClientCode" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="Branch" prop="Branch" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="Balance" prop="Balance" min-width="100" sortable="custom">
          <template v-slot="scope" >
            <span style="text-align: right">${{scope.row.Balance.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Due Date" prop="DueDate_f" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Over Due" prop="OverDays" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="Action" width="200" fixed="right">
          <template v-slot="scope">
            <el-button-group>
              <el-button icon="el-icon-view" type="primary" plain @click="loadTransactionRecords(scope.row)" :loading="isLoading" size="small">Show Detail</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------transaction records start----------------------------------------------------->
      <el-dialog title="Transaction Detail" :visible.sync="viewDetailVisible" width="700px" center >
        <el-row>
          <el-col span="12">Policy Number: {{current.PolicyNumber}}</el-col>
          <el-col span="6">Balance: ${{current.Balance.toLocaleString()}}</el-col>
        </el-row>
        <el-table height="500" :data="current.records" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
          <el-table-column label="ID" prop="TransactionRecordID" min-width="100" ></el-table-column>
          <el-table-column label="Date" prop="CreateTime" min-width="100"></el-table-column>
          <el-table-column label="Type" prop="TypeName" min-width="100"></el-table-column>
          <el-table-column label="Plus +" prop="Debit" min-width="100">
            <template v-slot="scope" >
              <span v-if="scope.row.OrientID === 0" style="text-align: right">${{scope.row.Debit.toLocaleString()}}</span>
            </template>
          </el-table-column>
          <el-table-column label="Minus -" prop="Credit" min-width="100">
            <template v-slot="scope" >
              <span v-if="scope.row.OrientID === 1" style="text-align: right">${{scope.row.Credit.toLocaleString()}}</span>
            </template>
          </el-table-column>
          <el-table-column label="Balance" prop="Balance" min-width="100">
            <template v-slot="scope" >
              <span style="text-align: right">${{scope.row.Balance.toLocaleString()}}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
      <!----------------------------------------------transaction records end----------------------------------------------------->
      <!----------------------------------------------edit弹窗开始----------------------------------------------------->
      <el-dialog title="Edit New Record" :visible.sync="editFormVisible" width="700px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form">
          <el-form-item label="Account ID" prop="BusiAccountID">
            <el-input v-model="editForm.BusiAccountID" readonly clearable></el-input>
          </el-form-item>
          <el-form-item label="Business ID" prop="BusinessID">
            <el-input v-model="editForm.BusinessID" readonly clearable></el-input>
          </el-form-item>
          <el-form-item label="Name" prop="Name">
            <el-input v-model="editForm.Name" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------edit弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  data: function () {
    return {
      RoleName: JSON.parse(this.$store.getters.getAccount).RoleName,
      reportTypeID: 1,
      BusinessTypeID: 4,
      isDownloading: false,
      isLoading: false,
      isLoadingAccountList: false,
      isLoadingRecord: false,
      currentId: null,
      current: {
        PolicyNumber: '',
        Balance: 0,
        records: []
      },
      transactionTypes: [],
      overDueItems: [{key: 0, value: 'All'}, {key: 1, value: 'Over 60 days', amount: 10020}, {key: 2, value: 'Over 31-60 days', amount: 100200}, {key: 3, value: 'Over 1-30 days', amount: 100200}],
      viewDetailVisible: false,
      // 列表
      totalList: [],
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 搜索
      searchForm: {
        name: ''
      },
      searchName: null,
      accountList: [],
      isPost: false,
      totalNum: 0,
      finishNum: 0,
      // 修改
      editFormVisible: false,
      editForm: {
        BusiAccountID: null,
        BusinessID: null,
        Name: null,
        Balance: null,
        BusinessTypeID: 4
      },
      editFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function () {
    if (this.$route.params.id !== undefined) this.reportTypeID = Number(this.$route.params.id)
    this.loadTransactionTypes()
    this.loadAccounts()
  },
  watch: {
    finishNum (val) {
      if (val === this.totalNum && this.isPost) {
        this.$message({
          type: 'success',
          message: 'Operation Succeeded'
        })
        this.totalNum = 0
        this.finishNum = 0
        this.isPost = false
        this.isLoading = false
      }
    }
  },
  methods: {
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
    },
    rank: function (name) {
      this.list.sort(this.by(name))
    },
    rankdesc: function (name) {
      this.list.sort(this.bydesc(name))
    },
    loadTransactionTypes: function () {
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'TransactionType'}).then(res => {
        if (res) {
          console.log('loadTransactionTypes', res)
          this.transactionTypes = res.data
        }
      }).catch(err => {
        console.log('loadTransactionTypes', err)
      })
    },
    loadTransactionRecords: function (account) {
      account.records = []
      this.current = account
      this.isLoadingRecord = true
      this.axios.post('/api/Services/baseservice.asmx/GetAccountTransactionRecords', {accountid: account.BusiAccountID}).then(res => {
        if (res) {
          console.log('loadTransactionTypes', res)
          account.records = res.data
          let balance = 0
          account.records.forEach(r => {
            r.CreateTime = moment(r.CreateTime).format('YYYY-MM-DD')
            let type = this.transactionTypes.find(t => t.key === r.TypeID)
            if (type !== undefined) r.TypeName = type.value
            else r.TypeName = ''
            if (r.OrientID === 0) {
              r.Debit = r.Amount
              r.Credit = ''
              balance += r.Debit
              r.Balance = balance
            } else {
              r.Debit = ''
              r.Credit = r.Amount
              balance -= r.Amount
              r.Balance = balance
            }
          })
          this.viewDetailVisible = true
        }
        this.isLoadingRecord = false
      }).catch(err => {
        console.log('loadTransactionTypes', err)
        this.isLoadingRecord = false
      })
    },
    // 查询
    loadAccounts: function () {
      this.isLoading = true
      let service = '/api/Services/CommerceService.asmx/GetBusiAccounts'
      if (this.reportTypeID === 2) service = '/api/Services/CommerceService.asmx/GetMyBusiAccounts'
      this.axios.post(service, {}).then(res => {
        if (res) {
          console.log('loadAccounts', res.data)
          res.data.forEach(r => {
            let dueDate = moment(r.DueDate)
            if (dueDate.year() <= moment().year()) r.DueDate_f = dueDate.format('YYYY-MM-DD')
            else r.DueDate_f = ''
            r.DueDate = dueDate
          })
          this.statistics(res.data)
          this.totalList = res.data
          this.list = this.totalList
          this.total = this.list.length
          this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    statistics: function (records) {
      this.overDueItems[1].amount = 0
      this.overDueItems[2].amount = 0
      this.overDueItems[3].amount = 0
      records.forEach(r => {
        if (r.OverDays > 60) this.overDueItems[1].amount += r.Balance
        else if (r.OverDays > 30) this.overDueItems[2].amount += r.Balance
        else if (r.OverDays > 0) this.overDueItems[3].amount += r.Balance
      })
    },
    search: function () {
      let query = this.searchForm.name
      let selectable = this.totalList
      if (this.searchForm.overDueItem === 1) {
        selectable = this.totalList.filter(r => r.OverDays > 60)
      } else if (this.searchForm.overDueItem === 2) {
        selectable = this.totalList.filter(r => r.OverDays > 30 && r.OverDays <= 60)
      } else if (this.searchForm.overDueItem === 3) {
        selectable = this.totalList.filter(r => r.OverDays > 0 && r.OverDays <= 30)
      }
      if (query === '') {
        this.list = selectable
      } else {
        this.list = selectable.filter(r => r.Name.indexOf(query) >= 0 ||
          r.BusinessID === Number(query) ||
          r.ClientCode.indexOf(query) >= 0 ||
          r.PolicyNumber.indexOf(query) >= 0 ||
          r.BusiAccountID === Number(query)
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
      this.search()
    },
    // 删除
    del: function (account) {
      let id = account.BusiAccountID
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/RemoveBusiAccount', {accountid: id}).then(res => {
          if (res) {
            console.log('delete account', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.totalList = this.totalList.filter(item => item.BusiAccountID !== id)
            this.search()
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
    // 修改弹窗
    showEdit: function (record) {
      this.editForm = record
      this.editFormVisible = true
    },
    // 关闭修改
    closeEdit: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        // this.$refs['editForm'].resetFields()
        done()
      }).catch(() => {})
    },
    // 修改
    edit: function () {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.axios.post('/api/Services/baseservice.asmx/SaveBusiAccount', {account: JSON.stringify(this.editForm)}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['editForm'].resetFields()
              this.editFormVisible = false
              let account = this.totalList.find(r => r.BusiAccountID === res.data.BusiAccountID)
              if (account === undefined) this.totalList.splice(0, 0, res.data)
              else {
                account.Name = res.data.Name
              }
              this.search()
            }
            this.isLoading = false
            this.editFormVisible = false
          }).catch(err => {
            console.log('修改出错', err)
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
    // 显示新增弹窗
    showAdd: function () {
      this.editForm = {BusinessTypeID: 4}
      this.editFormVisible = true
    },
    exportExcel: function () {
      this.isDownloading = true
      let tablename = 'outstandingReport.xlsx'
      this.downloadData('accounts', this.BusinessTypeID, this.reportTypeID, tablename, this)
    }
  }
}
</script>

<style scoped>

</style>
