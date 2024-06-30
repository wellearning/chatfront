<!--
FileName: Accounting/transaction.vue
Author: Ge Chen
Update Date: 2024/5/23
Function: Show all insurance company list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Transaction</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">Receive</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="search on Name/ID/CreateTime" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search()" :loading="isLoading" size="small">Go</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table height="500" :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="TransactionRecordID" width="100" fixed="left" sortable="custom"></el-table-column>
        <el-table-column label="Applicant" prop="Name" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="Debit" prop="Debit" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Credit" prop="Credit" min-width="100"></el-table-column>
        <el-table-column label="CreateTime" prop="CreateTime" min-width="150" sortable="custom">
          <template slot-scope="scope">
            <span>{{scope.row.CreateTime.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="400" fixed="right">
          <template slot-scope="scope">
            <el-button-group>
              <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row)" :loading="isLoading" size="small">Edit</el-button>
              <el-button icon="el-icon-delete" type="danger" @click="del(scope.row)" :loading="isLoading" size="small">Delete</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------edit弹窗开始----------------------------------------------------->
      <el-dialog title="Edit New Record" :visible.sync="editFormVisible" width="700px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form">
          <el-form-item label="Client" prop="BusinessID">
            <el-select v-model="editForm.BusiAccountID" placeholder="select a account" no-data-text="No Record" filterable>
              <el-option v-for="item in accountList" :key="item.BusiAccountID" :label="item.Name" :value="item.BusiAccountID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Receive Amount" prop="Amount">
            <el-input v-model.number="editForm.Amount" clearable></el-input>
          </el-form-item>
          <el-form-item label="Receive Date" prop="CreateDate">
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
      // 列表
      totalList: [],
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      accountList: [],
      isPost: false,
      totalNum: 0,
      finishNum: 0,
      // 修改
      editFormVisible: false,
      editForm: {
        TransactionRecordID: null,
        BusiAccountID: null,
        Amount: null,
        OrientID: 2
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
    this.initAccountList()
  },
  watch: {
    finishNum (val) {
      if (val === this.totalNum && this.isPost) {
        this.$message({
          type: 'success',
          message: 'Operation Succeeded'
        })
        this.BrokerCodeList = []
        this.totalNum = 0
        this.finishNum = 0
        this.isPost = false
        this.privilegesVisible = false
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
    initAccountList: function () {
      this.isLoadingAccountList = true
      this.axios.post('/api/Services/BaseService.asmx/GetBusiAccounts', {busitypeid: this.BusinessTypeID}).then(res => {
        if (res) {
          console.log('查询', res)
          this.accountList = res.data
          this.loadRecords()
        }
        this.isLoadingAccountList = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingAccountList = false
      })
    },
    // 查询
    loadRecords: function () {
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetTransactionRecords', {busitypeid: this.BusinessTypeID}).then(res => {
        if (res) {
          console.log('TransactionRecords', res.data)
          res.data.forEach(r => {
            let account = this.accountList.find(a => a.BusiAccountID === r.BusiAccountID)
            r.Name = account.Name
            if (r.OrientID === 1) r.Debit = r.Amount
            else r.Credit = r.Amount
            r.CreateTime = moment(r.CreateTime)
          })
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
    search: function () {
      let query = this.searchForm.name
      if (query === '') {
        this.list = this.totalList
      } else {
        this.list = this.totalList.filter(r => r.Name.indexOf(query) >= 0 ||
          r.BusinessID === Number(query) ||
          r.TransactionRecordID === Number(query) ||
          r.CreateTime.format('YYYY-MM-DD').indexOf(query) >= 0
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
    },
    // 删除
    del: function (record) {
      let id = record.TransactionRecordID
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/RemoveTransaction', {recordid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.totalList = this.totalList.filter(item => item.InsuranceCorpID !== id)
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
              res.data.CreateTime = moment(res.data.CreateTime)
              if (res.data.OrientID === 1) res.data.Debit = res.data.Amount
              else res.data.Credit = res.data.Amount
              let account = this.accountList.find(a => a.BusiAccountID === res.data.BusiAccountID)
              res.data.Name = account.Name
              this.$refs['editForm'].resetFields()
              this.editFormVisible = false
              let record = this.totalList.find(r => r.TransactionRecordID === res.data.TransactionRecordID)
              if (record === undefined) this.totalList.splice(0, 0, res.data)
              else {
                record.OrientID = res.data.OrientID
                record.Amount = res.data.Amount
                record.Credit = res.data.Credit
                record.Debit = res.data.Debit
                record.CreateTime = res.data.CreateTime
                record.Name = res.data.Name
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
      this.editForm = {OrientID: 2}
      this.editFormVisible = true
    }
  }
}
</script>

<style scoped>

</style>
