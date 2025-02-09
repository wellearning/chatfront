<!--
FileName: Accounting/receipt.vue
Author: Ge Chen
Update Date: 2024/7/1
Function: Provide receipt edition, include new edit delete and query.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Receipt/Refund</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" class="" type="primary" @click="showAddReceipt()" :loading="isLoading">New</el-button>
        <!--el-button icon="el-icon-plus" type="primary" @click="showAddRefund()" :loading="isLoading">New Refund</el-button-->
      </div>
      <el-upload
        class="rightBtnBox"
        :headers="headerObj"
        :data="dataObj"
        action="/api/Services/basehandle.ashx"
        multiple
        :on-success="handleSuccess"
        >
        <el-button icon="el-icon-upload" type="primary">import</el-button>
      </el-upload>
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
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table height="500" :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <!--el-table-column label="ID" prop="TransactionRecordID" width="100" fixed="left" sortable="custom"></el-table-column-->
        <el-table-column label="PolicyID" prop="BusinessID" width="100" fixed="left" sortable="custom"></el-table-column>
        <el-table-column label="Producer" prop="ProducerName" min-width="200" sortable="custom"></el-table-column>
        <el-table-column label="ClientCode" prop="ClientCode" min-width="160" sortable="custom"></el-table-column>
        <el-table-column label="PolicyNumber" prop="PolicyNumber" min-width="160" sortable="custom"></el-table-column>
        <el-table-column label="Type" prop="TypeName" min-width="160" sortable="custom"></el-table-column>
        <el-table-column label="Amount" prop="Amount" min-width="100" align="right" sortable="custom">
          <template v-slot="scope">
            <span>${{scope.row.Amount.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Date" prop="CreateTime" min-width="150" align="center" sortable="custom">
          <template v-slot="scope">
            <span>{{scope.row.CreateTime.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template v-slot="scope">
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
      <el-dialog :title="editTitle" :visible.sync="editFormVisible" width="700px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form">
          <el-form-item label="PolicyID" prop="BusinessID">
            <el-input v-model="editForm.BusinessID" type="number" disabled></el-input>
          </el-form-item>
          <el-form-item label="PolicyNumber" prop="BusinessID">
            <el-select v-model="editForm.BusinessID" placeholder="select a account" no-data-text="No Record" filterable>
              <el-option v-for="item in accountList" :key="item.BusinessID" :label="item.PolicyNumber" :value="item.BusinessID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="ClientCode" prop="BusinessID">
            <el-select v-model="editForm.BusinessID" placeholder="select a account" no-data-text="No Record" filterable>
              <el-option v-for="item in accountList" :key="item.BusinessID" :label="item.ClientCode" :value="item.BusinessID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Applicant" prop="BusinessID">
            <el-select v-model="editForm.BusinessID" placeholder="select a account" no-data-text="No Record" filterable>
              <el-option v-for="item in accountList" :key="item.BusinessID" :label="item.Name" :value="item.BusinessID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="TransactionType" prop="TypeID">
            <el-select v-model="editForm.TypeID" placeholder="select a type" no-data-text="No Record" filterable>
              <el-option v-for="item in transactionTypes" :key="item.key" :label="item.value" :value="item.key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Amount" prop="Amount">
            <el-input v-model="editForm.Amount" type="number" clearable></el-input>
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
import store from '../../../store'

export default {
  data: function () {
    return {
      RoleName: JSON.parse(this.$store.getters.getAccount).RoleName,
      BusinessTypeID: 4,
      isLoading: false,
      isLoadingAccountList: false,
      currentId: null,
      editTitle: '',
      transactionTypes: [],
      // 列表
      totalList: [],
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      dataObj: {
        itemType: 'account'
      },
      headerObj: {
        Authorization: JSON.parse(store.getters.getAccount).Token
      },
      // 搜索
      searchForm: {
        name: ''
      },
      searchName: '',
      accountList: [],
      isPost: false,
      totalNum: 0,
      finishNum: 0,
      // 修改
      editFormVisible: false,
      editForm: {
        TransactionRecordID: 0,
        BusiAccountID: null,
        BusinessTypeID: 4,
        BusinessID: null,
        Amount: null,
        leftAmount: 0,
        OrientID: 2,
        TypeID: null,
        CreateTime: null
      },
      editFormRules: {
        BusinessID: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ],
        TypeID: [
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
    this.loadAccounts(0)
    this.loadRecords()
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
    handleSuccess: function (res, file, fileList) {
      console.log('response', res.data)
      if (res.code > 0) {
        this.$message({
          showClose: true,
          type: 'warning',
          message: res.message,
          duration: 3000
        })
        return
      }
      let message = 'The file has been successfully imported.'
      let duration = 6000
      if (res.data.length > 0) {
        message += 'There are some records failed. The list: ' + res.data.join(', ')
        duration = 0
      }
      // 文件上传成功的回调
      this.$message({
        showClose: true,
        type: 'success',
        message: message,
        duration: duration
      })
      this.loadRecords()
    },

    loadTransactionTypes: function () {
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'TransactionType'}).then(res => {
        if (res) {
          console.log('loadTransactionTypes', res)
          this.transactionTypes = res.data.filter(t => t.key >= 20)
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
      this.axios.post('/api/Services/CommerceService.asmx/GetTransactionRecords_edit', {type: 'receipt'}).then(res => {
        if (res) {
          console.log('TransactionRecords', res.data)
          res.data.forEach(r => {
            let type = this.transactionTypes.find(t => t.key === r.TypeID)
            if (type !== undefined) r.TypeName = type.value
            else r.TypeName = ''
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
      let query = this.searchForm.name.trim()
      if (query === '') {
        this.list = this.totalList
      } else {
        this.list = this.totalList.filter(r =>
          r.Name.indexOf(query) >= 0 ||
          r.BusinessID === Number(query) ||
          r.TransactionRecordID === Number(query) ||
          r.ClientCode.indexOf(query) >= 0 ||
          r.PolicyNumber.indexOf(query) >= 0 ||
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
      this.searchForm.name = ''
      this.search()
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
        this.axios.post('/api/Services/BaseService.asmx/RemoveTransaction', {recordid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.loadRecords()
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
      this.editTitle = 'Receipt Record Edition'
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
          let isNew = this.editForm.IsNew
          let account = this.accountList.find(a => a.BusinessID === this.editForm.BusinessID)
          this.editForm.BusinessTypeID = account.BusinessTypeID
          this.isLoading = true
          this.axios.post('/api/Services/baseservice.asmx/SaveTransaction', {transaction: JSON.stringify(this.editForm)}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.loadRecords(0)
            }
            this.isLoading = false
            if (!isNew) this.editFormVisible = false
            else {
              this.editForm.Amount = null
              this.editForm.BusinessID = null
            }
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
    showAddReceipt: function () {
      this.editTitle = 'Add new Receipt'
      this.editForm.BusiAccountID = 0
      this.editForm.BusinessID = null
      this.editForm.Amount = null
      this.editForm.CreateTime = moment()
      this.editForm.TypeID = null
      this.editForm.OrientID = 2
      this.editForm.IsNew = true
      this.editFormVisible = true
    },
    showAddRefund: function () {
      this.editTitle = 'Add new Refund'
      this.editForm.BusiAccountID = 0
      this.editForm.BusinessID = null
      this.editForm.Amount = null
      this.editForm.CreateTime = moment()
      this.editForm.TypeID = 4
      this.editForm.OrientID = 1
      this.editForm.IsNew = true
      this.editFormVisible = true
    }
  }
}
</script>

<style scoped>

</style>
