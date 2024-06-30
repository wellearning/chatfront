<!--
FileName: Accounting/receivableRecords.vue
Author: Ge Chen
Update Date: 2024/6/28
Function: Show all receivable records.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Transaction</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAddReceivable()" :loading="isLoading">New Receivable</el-button>
        <el-button icon="el-icon-plus" type="primary" @click="showAddReceiving()" :loading="isLoading">New Receiving</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm" style="vertical-align: middle">
          <div style="margin-top: 0px;">
            <el-col :span="3">Over Due Summary: </el-col>
            <el-col :span="3" class="padding-top:10px;">1 - 30: ${{overDueItems[3].amount.toLocaleString()}}</el-col>
            <el-col :span="3" class="">31 - 60: ${{overDueItems[2].amount.toLocaleString()}}</el-col>
            <el-col :span="3" class="">Over 60 days: ${{overDueItems[1].amount.toLocaleString()}}</el-col>
          </div>
          <el-form-item label="Over Due" prop="overDueItem">
            <el-select v-model="searchForm.overDueItem" class="yearMonthSelection" size="small" no-data-text="No Record" filterable @change="search()">
              <el-option v-for="item in overDueItems" :key="item.key" :label="item.value" :value="item.key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="search on Name/ID/ClientCode/PolicyNumber" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search()" :loading="isLoading" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table v-if="isLoading === false" height="500" :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <!--el-table-column label="ID" prop="BusinessID" width="100" fixed="left" sortable="custom"></el-table-column-->
        <el-table-column label="ID" prop="BusinessID" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Applicant" prop="Name" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="ClientCode" prop="ClientCode" min-width="160" sortable="custom"></el-table-column>
        <el-table-column label="PolicyNumber" prop="PolicyNumber" min-width="160" sortable="custom"></el-table-column>
        <el-table-column label="Balance" prop="Balance" min-width="100" align="right" sortable="custom" >
          <template v-slot="scope" >
            <span style="text-align: right">${{scope.row.Balance.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Due Date" prop="DueDate_f" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Over Due" prop="OverDue" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Action" width="450">
          <template v-slot="scope">
            <el-button-group>
              <el-button icon="el-icon-edit" type="primary" @click="showReceivable(scope.row)" :loading="isLoading" size="small">Receivable</el-button>
              <el-button icon="el-icon-edit" type="primary" @click="showReceiving(scope.row)" :loading="isLoading" size="small">Receive</el-button>
              <el-button icon="el-icon-edit" type="primary" @click="showRefund(scope.row)" :loading="isLoading" size="small">Refund</el-button>
              <el-button icon="el-icon-view" type="primary" plain @click="showWriteOff(scope.row)" :loading="isLoading" size="small">WriteOff Detail</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------write off records start----------------------------------------------------->
      <el-dialog title="write off records" :visible.sync="viewWriteOffVisible" width="700px" center >
        <el-row>
          <el-col span="12">Policy Number: {{current.PolicyNumber}}</el-col>
          <el-col span="6">Receivable: ${{current.Amount.toLocaleString()}}</el-col>
          <el-col span="6">Balance: ${{current.Balance.toLocaleString()}}</el-col>
        </el-row>
        <el-table height="500" show-summary :data="current.writeOffRecords" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
          <el-table-column label="ID" prop="TransactionRecordID" min-width="100" ></el-table-column>
          <el-table-column label="Date" prop="CreateTime" min-width="200"></el-table-column>
          <el-table-column label="Type" prop="TypeName" min-width="200"></el-table-column>
          <el-table-column label="Amount" prop="Amount" min-width="100">
            <template v-slot="scope" >
              <span style="text-align: right">${{scope.row.Amount.toLocaleString()}}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
      <!----------------------------------------------write off records end----------------------------------------------------->
      <!----------------------------------------------edit弹窗开始----------------------------------------------------->
      <el-dialog :title="editTitle" :visible.sync="editFormVisible" width="700px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form">
          <el-form-item label="PolicyNumber" prop="BusinessID">
            <el-select v-model="editForm.BusinessID" placeholder="select a account" no-data-text="No Record" filterable>
              <el-option v-for="item in accountList" :key="item.BusinessID" :label="item.PolicyNumber" :value="item.BusinessID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Amount" prop="Amount">
            <el-input v-model.number="editForm.Amount" clearable></el-input>
          </el-form-item>
          <el-form-item label="Date" prop="CreateTime">
            <el-date-picker v-model="editForm.CreateTime" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
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
      BusinessTypeID: 4,
      isLoading: false,
      isLoadingAccountList: false,
      currentId: null,
      accountList: [],
      transactionTypes: [],
      accountCount: 0,
      // 列表
      totalList: [],
      list: [],
      current: {
        PolicyNumber: '',
        Amount: 0,
        Balance: 0,
        writeOffRecords: []
      },
      overDueItems: [{key: 0, value: 'All'}, {key: 1, value: 'Over 60 days', amount: 10020}, {key: 2, value: 'Over 31-60 days', amount: 100200}, {key: 3, value: 'Over 1-30 days', amount: 100200}],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 搜索
      searchForm: {
        overDueItem: 0,
        name: ''
      },
      searchName: null,
      isPost: false,
      totalNum: 0,
      finishNum: 0,
      // write off
      viewWriteOffVisible: false,
      // 修改
      editTitle: 'Transaction',
      editFormVisible: false,
      editForm: {
        TransactionRecordID: 0,
        BusiAccountID: null,
        BusinessTypeID: 4,
        BusinessID: null,
        Amount: null,
        leftAmount: 0,
        OrientID: 2,
        TypeID: 1,
        CreateTime: null
      },
      editFormRules: {
        BusiAccountID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        Amount: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function () {
    this.loadTransactionTypes()
    this.loadRecords()
    this.loadAccounts(0)
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
    loadAccounts: function (start) {
      this.isLoadingAccountList = true
      this.axios.post('/api/Services/CommerceService.asmx/GetSelectableBusiAccounts', {start: start, length: 200}).then(res => {
        if (res) {
          console.log('查询', res)
          if (start === 0) {
            this.accountCount = res.count
            this.accountList = res.data
          } else {
            this.accountList = this.accountList.concat(res.data)
          }
          if (this.accountList.length < this.accountCount) {
            this.loadAccounts(this.accountList.length)
          } else {
            this.isLoadingAccountList = false
          }
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingAccountList = false
      })
    },
    // 查询
    loadRecords: function () {
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetReceivableRecords', {}).then(res => {
        if (res) {
          console.log('TransactionRecords', res.data)
          res.data.forEach(r => {
            let dueDate = moment(r.CreateTime)
            if (dueDate.year() <= moment().year()) r.DueDate_f = dueDate.format('YYYY-MM-DD')
            else r.DueDate_f = ''
            r.DueDate = dueDate
            r.Balance = r.Amount - r.Received
            r.writeOffRecords.forEach(wr => {
              wr.CreateTime = moment(wr.CreateTime).format('YYYY-MM-DD')
              let type = this.transactionTypes.find(t => t.key === wr.TypeID)
              if (type !== undefined) wr.TypeName = type.value
              else wr.TypeName = ''
            })
          })
          this.totalList = res.data
          this.list = this.totalList
          this.total = this.list.length
          this.currentPage = 1
          this.statistics(this.totalList)
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
        if (r.OverDue > 60) this.overDueItems[1].amount += r.Balance
        else if (r.OverDue > 30) this.overDueItems[2].amount += r.Balance
        else if (r.OverDue > 0) this.overDueItems[3].amount += r.Balance
      })
    },
    search: function () {
      let query = this.searchForm.name
      let selectable = this.totalList
      if (this.searchForm.overDueItem === 1) {
        selectable = this.totalList.filter(r => r.OverDue > 60)
      } else if (this.searchForm.overDueItem === 2) {
        selectable = this.totalList.filter(r => r.OverDue > 30 && r.OverDue <= 60)
      } else if (this.searchForm.overDueItem === 3) {
        selectable = this.totalList.filter(r => r.OverDue > 0 && r.OverDue <= 30)
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
    // 显示新增弹窗
    showWriteOff: function (record) {
      this.current = record
      // this.writeOffRecords = record.writeOffRecords
      this.viewWriteOffVisible = true
    },
    // 修改弹窗
    showAddReceivable: function () {
      this.editTitle = 'Add new Receivable'
      this.editForm.BusiAccountID = 0
      this.editForm.BusinessID = null
      this.editForm.BusinessTypeID = 4
      this.editForm.Amount = null
      this.editForm.CreateTime = moment()
      this.editForm.OrientID = 1
      this.editForm.TypeID = 1
      this.editForm.IsNew = true
      this.editFormVisible = true
    },
    showAddReceiving: function () {
      this.editTitle = 'Add new Receiving'
      this.editForm.BusiAccountID = 0
      this.editForm.BusinessID = null
      this.editForm.BusinessTypeID = 4
      this.editForm.Amount = null
      this.editForm.CreateTime = moment()
      this.editForm.OrientID = 2
      this.editForm.TypeID = 2
      this.editForm.IsNew = true
      this.editFormVisible = true
    },
    showReceivable: function (record) {
      this.editTitle = 'Receivable Edition'
      this.editForm.BusiAccountID = record.BusiAccountID
      this.editForm.BusinessID = record.BusinessID
      this.editForm.BusinessTypeID = record.BusinessTypeID
      this.editForm.TypeID = 1
      this.editForm.OrientID = 1
      this.editForm.Amount = null
      this.editForm.CreateTime = moment()
      this.editForm.IsNew = true
      this.editFormVisible = true
    },
    showReceiving: function (record) {
      this.editTitle = 'Receiving Edition'
      this.editForm.BusiAccountID = record.BusiAccountID
      this.editForm.BusinessID = record.BusinessID
      this.editForm.BusinessTypeID = record.BusinessTypeID
      this.editForm.TypeID = 2
      this.editForm.OrientID = 2
      this.editForm.Amount = record.Balance
      this.editForm.CreateTime = moment()
      this.editForm.IsNew = true
      this.editFormVisible = true
    },
    showRefund: function (record) {
      this.editTitle = 'Refund Edition'
      this.editForm.BusiAccountID = record.BusiAccountID
      this.editForm.BusinessID = record.BusinessID
      this.editForm.BusinessTypeID = record.BusinessTypeID
      this.editForm.TypeID = 3
      this.editForm.OrientID = 2
      this.editForm.Amount = record.Balance
      this.editForm.CreateTime = moment()
      this.editForm.IsNew = true
      this.editFormVisible = true
    },
    // 关闭修改
    closeEdit: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$refs['editForm'].resetFields()
        done()
      }).catch(() => {})
    },
    // 修改
    edit: function () {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.axios.post('/api/Services/baseservice.asmx/SaveTransaction', {transaction: JSON.stringify(this.editForm)}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.loadRecords()
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
    }
  }
}
</script>

<style scoped>

</style>
