<!--
FileName: Configure/vehicleTag.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all vehicleTag list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Tag Follow up</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="ID/Producer/ClientCode/Date/Status" style="width:300px;" size="small" @change="search" @keyup.enter.native="search"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" @click="search" :loading="isLoading" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading||isLoadingProducers" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="BusineesType" prop="BusinessType" width="120" fixed="left" ></el-table-column>
        <el-table-column label="ID" prop="BusinessID" width="90" fixed="left"  sortable="custom"></el-table-column>
        <el-table-column label="Code" prop="ClientCode" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="Producer/User" prop="Producer" min-width="140" sortable="custom"></el-table-column>
        <el-table-column label="Company" prop="Corp" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="Vehicle" prop="Vehicle" min-width="200"></el-table-column>
        <el-table-column label="OverDue" prop="OverDue" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Status" prop="Status" min-width="90" sortable="custom"></el-table-column>
        <el-table-column label="Effective date" prop="EffectiveDate" min-width="130">
          <template v-slot:="scope">
            <span>{{scope.row.EffectiveDate.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column>
        <el-table-column label="CreateDate"  prop="CreateDate" min-width="130">
          <template v-slot:="scope">
            <span>{{scope.row.CreateDate.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column>
       <el-table-column label="Action" width="320" fixed="right">
          <template v-slot:="scope">
            <el-button-group>
              <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row)" :loading="isLoading" size="small">Edit</el-button>
              <el-button icon="el-icon-edit" :type="scope.row.installType" @click="setInstalled(scope.row)" :loading="isLoading" size="small">Install</el-button>
              <el-button icon="el-icon-edit" :type="scope.row.processType" @click="setProcessed(scope.row)" :loading="isLoading" size="small">Process</el-button>
              <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.VehicleTagID)" :loading="isLoading" size="small">Del</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog :title="editFormTitle" :visible.sync="addFormVisible" width="600px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="BusinessType" prop="BusinessTypeID">
            <el-select v-model="addForm.BusinessTypeID" @change="selectBusinessType" placeholder="BusinessType" no-data-text="No Record" filterable >
              <el-option v-for="item in businessTypes" :key="item.key" :label="item.value" :value="item.key"></el-option>
            </el-select>
          </el-form-item>
          <div v-if="addForm.BusinessTypeID===2">
            <el-form-item label="CoverLetter" prop="coverletter">
              <el-select v-model="addForm.BusinessID" placeholder="CoverLetterID/ClientCode" @change="selectCoverLetter" no-data-text="No Record" remote :remote-method="loadCoverLetters" filterable>
                <el-option v-for="item in coverletters" :key="item.CoverLetterID" :label="item.CoverLetterID+'|'+item.ClientCode+'|'+item.Producer" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="ClientCode" prop="ClientCode">
              <el-input v-model="addForm.ClientCode" readonly clearable></el-input>
            </el-form-item>
            <el-form-item label="Producer" prop="Producer">
              <el-input v-model="addForm.Producer" readonly clearable></el-input>
            </el-form-item>
          </div>
          <div v-if="addForm.BusinessTypeID===1">
            <el-form-item label="Memo" prop="coverletter">
              <el-select v-model="addForm.BusinessID" placeholder="MemoID/PolicyNumber" @change="selectCoverLetter" no-data-text="No Record" remote :remote-method="loadCoverLetters" filterable>
                <el-option v-for="item in coverletters" :key="item.MemoID" :label="item.MemoID+'|'+item.PolicyNumber+'|'+item.Author" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="PolicyNumber" prop="ClientCode">
              <el-input v-model="addForm.ClientCode" readonly clearable></el-input>
            </el-form-item>
            <el-form-item label="User" prop="Producer">
              <el-input v-model="addForm.Producer" readonly clearable></el-input>
            </el-form-item>
          </div>
          <el-form-item label="EffectiveDate" prop="EffectiveDate">
            <el-date-picker v-model="addForm.EffectiveDate" readonly clearable></el-date-picker>
          </el-form-item>
          <el-form-item label="Vehicle Info" prop="Vehicle">
            <el-input type="textarea" :rows="3" v-model="addForm.Vehicle" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>
<script>
import moment from 'moment'
export default {
  data: function () {
    return {
      isLoading: false,
      isLoadingProducers: false,
      isLoadingTagStatus: false,
      isLoadingInsuranceCorps: false,
      currentId: null,
      currentVehicleTag: null,
      currentDescription: null,
      bTypeID: 2,
      editFormTitle: 'Edit Tag',
      list: [],
      totalList: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 权限
      producers: [],
      businessTypes: [
        {key: 1, value: 'Policy Change'},
        {key: 2, value: 'New Business'}
      ],
      insuranceCorps: [],
      tagStatus: [],
      coverletters: [],
      searchForm: {
        name: null
      },
      // 新增
      addFormVisible: false,
      addForm: {
        VehicleTagID: 0,
        BusinessTypeID: 2,
        BusinessID: 0,
        ClientCode: null,
        ProducerID: null,
        Producer: null,
        InsuranceCorpID: null,
        Corp: null,
        EffectiveDate: null,
        CreateDate: moment(),
        Vehicle: null,
        coverletter: null
      },
      addFormRules: {
        BusinessID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function () {
    let id = this.$route.params.id === undefined ? 2 : Number(this.$route.params.id)
    if (id !== undefined) {
      this.btypeId = Number(id)
    }
    this.loadTagStatus()
    this.loadInsuranceCorps()
    this.loadProducers(0)
    this.loadVehicleTags(0)
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
    loadTagStatus: function () {
      this.isLoadingTagStatus = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'TagStatus'}).then(res => {
        if (res) {
          console.log('loadTagStatus', res)
          this.tagStatus = res.data
        }
        this.isLoadingTagStatus = false
      }).catch(err => {
        console.log('loadTagStatus', err)
        this.isLoadingTagStatus = false
      })
    },
    selectBusinessType: function () {
      this.coverletters = []
      this.addForm.BusinessID = null
      this.addForm.ClientCode = ''
      this.addForm.Producer = null
      this.addForm.InsuranceCorpID = null
      this.addForm.EffectiveDate = null
    },
    selectCoverLetter: function (item) {
      if (this.addForm.BusinessTypeID === 2) {
        this.addForm.BusinessID = item.CoverLetterID
        this.addForm.ClientCode = item.ClientCode
        this.addForm.ProducerID = item.ProducerID
        this.addForm.Producer = item.Producer
      } else {
        this.addForm.BusinessID = item.MemoID
        this.addForm.ClientCode = item.PolicyNumber
        this.addForm.ProducerID = item.StaffID
        this.addForm.Producer = item.Author
      }
      this.addForm.InsuranceCorpID = item.InsuranceCorpID
      this.addForm.EffectiveDate = moment(item.EffectiveDate)
    },
    loadCoverLetters: function (query) {
      this.isLoadingTemplates = true
      let service = '/api/Services/NewBusinessService.asmx/QueryTagCoverLetters'
      if (this.addForm.BusinessTypeID === 1) service = '/api/Services/MemoService.asmx/QueryTagMemos'
      this.axios.post(service, {query: query}).then(res => {
        if (res) {
          console.log('loadCoverLetters', res)
          this.coverletters = res.data
        }
        this.isLoadingTemplates = false
        // this.attachInfoes()
      }).catch(err => {
        console.log('loadCoverLetters error', err)
        this.isLoadingTemplates = false
      })
    },
    loadInsuranceCorps: function () {
      this.isLoadingInsuranceCorps = true
      this.axios.post('/api/Services/baseservice.asmx/GetBrokageInsuranceCorps', {}).then(res => {
        if (res) {
          console.log('loadInsuranceCorps', res)
          this.insuranceCorps = res.data
        }
        this.isLoadingInsuranceCorps = false
        this.attachInfoes()
      }).catch(err => {
        console.log('loadInsuranceCorps', err)
        this.isLoadingInsuranceCorps = false
      })
    },
    loadProducers: function (start) {
      this.isLoadingProducers = true
      this.axios.post('/api/Services/baseservice.asmx/GetNormalStaffs', {start: start}).then(res => {
        if (res) {
          console.log('producers', res)
          if (start === 0) {
            this.producerCount = res.count
            this.producers = res.data
          } else {
            this.producers = this.producers.concat(res.data)
          }
          if (this.producers.length < this.producerCount) {
            this.loadProducers(this.producers.length)
          } else {
            this.isLoadingProducers = false
            this.attachInfoes()
          }
        }
      }).catch(err => {
        console.log('producers', err)
        this.isLoadingProducers = false
      })
    },
    // 查询
    loadVehicleTags: function (start) {
      this.isLoading = true
      this.axios.post('/api/Services/newbusinessservice.asmx/GetVehicleTags', {start: start}).then(res => {
        if (res) {
          console.log('loadVehicleTags', res)
          if (start === 0) {
            this.total = res.count
            this.totalList = res.data
          } else {
            this.totalList = this.totalList.concat(res.data)
          }
          if (this.totalList.length === this.total) {
            this.isLoading = false
            this.attachInfoes()
          } else this.loadVehicleTags(this.totalList.length)
        }
      }).catch(err => {
        console.log('loadVehicleTags', err)
        this.isLoading = false
      })
    },
    attachInfoes: function () {
      if (this.isLoading || this.isLoadingProducers || this.isLoadingInsuranceCorps) {
        return
      }
      this.totalList.forEach(a => {
        this.attachInfo(a)
      })
      this.list = this.totalList
      this.currentPage = 1
      this.pageCount = Math.ceil(this.total / this.pageSize)
    },
    attachInfo: function (a) {
      a.EffectiveDate = moment(a.EffectiveDate)
      a.CreateDate = moment(a.CreateDate)
      let status = this.tagStatus.find(p => p.key === a.StatusID)
      a.Status = status === undefined ? '' : status.value
      let producer = this.producers.find(p => p.StaffID === a.ProducerID)
      a.Producer = producer === undefined ? '' : producer.Name
      let corp = this.insuranceCorps.find(p => p.InsuranceCorpID === a.InsuranceCorpID)
      a.Corp = corp === undefined ? '' : corp.ShortName
      let btype = this.businessTypes.find(p => p.key === a.BusinessTypeID)
      a.BusinessType = btype === undefined ? '' : btype.value
      if (a.Status === 'Installed') {
        a.installType = 'success'
        a.processType = 'primary'
      } else if (a.Status === 'Processed') {
        a.installType = 'primary'
        a.processType = 'success'
      } else {
        a.installType = 'primary'
        a.processType = 'primary'
      }
    },
    // 查询
    search: function () {
      let query = this.searchForm.name
      if (query === null || query === '') {
        this.list = this.totalList
      } else {
        query = query.toLowerCase().trim()
        this.list = this.totalList.filter(r => r.Producer.toLowerCase().indexOf(query) >= 0 ||
          r.VehicleTagID === Number(query) ||
          r.BusinessID === Number(query) ||
          r.ClientCode.toLowerCase().indexOf(query) >= 0 ||
          r.Status.toLowerCase() === query ||
          r.EffectiveDate.format('YYYY-MM-DD').indexOf(query) >= 0
        )
      }
      this.total = this.list.length
      this.pageCount = Math.ceil(this.total / this.pageSize)
    },
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search()
    },
    // 显示修改
    showEdit: function (vehicleTag) {
      this.addForm = JSON.parse(JSON.stringify(vehicleTag))
      this.editFormTitle = 'Edit Tag ID: ' + vehicleTag.VehicleTagID
      this.addFormVisible = true
    },
    // 删除
    setProcessed: function (item) {
      this.setStatus(item, 'Processed')
    },
    setInstalled: function (item) {
      this.setStatus(item, 'Installed')
    },
    setStatus: function (item, status) {
      this.$confirm('Are you sure to set status change?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/NewBusinessService.asmx/SetVehicleTagStatus', {tagid: item.VehicleTagID, status: status}).then(res => {
          if (res) {
            console.log('setInstalled', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            item.StatusID = res.data.StatusID
            this.attachInfo(item)
            // let status = this.tagStatus.find(p => p.key === item.StatusID)
            // item.Status = status === undefined ? '' : status.value
          }
          this.isLoading = false
        }).catch(err => {
          console.log('setStatus error', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/NewBusinessService.asmx/RemoveVehicleTag', {tagid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.VehicleTagID !== id)
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
    resetForm: function () {
      // this.$refs['addForm'].resetFields()
      this.isAdd = false
      this.isEdit = false
    },

    // 取消修改
    cancel: function (id) {
      this.currentId = null
      this.list.find(item => item.VehicleTagID === id).Name = this.currentDescription
      this.currentDescription = null
    },
    // 显示新增弹窗
    showAdd: function () {
      this.editFormTitle = 'Add New Tag'
      let item = {
        VehicleTagID: 0,
        BusinessID: null,
        ClientCode: null,
        ProducerID: 0,
        Producer: null,
        EffectiveDate: null,
        CreateDate: moment(),
        Vehicle: ''
      }
      // this.resetForm()
      this.addForm = item
      this.addFormVisible = true
    },
    // 隐藏新增弹窗
    closeAdd: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$refs['addForm'].resetFields()
        done()
      }).catch(() => {})
    },
    // 新增
    add: function () {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          let isNew = true
          if (this.addForm.VehicleTagID > 0) isNew = false
          if (isNew) {
            let exist = this.totalList.find(t => t.BusinessID === this.addForm.BusinessID)
            if (exist !== undefined) {
              this.$message({
                type: 'warning',
                message: 'The coverletter is set tag already.'
              })
              return
            }
          }
          this.isLoading = true
          let vehicleTag = JSON.parse(JSON.stringify(this.addForm))
          vehicleTag.coverletter = null
          vehicleTag.EffectiveDate = moment(vehicleTag.EffectiveDate)
          vehicleTag.CreateDate = moment(vehicleTag.CreateDate)
          let data = JSON.stringify(vehicleTag)
          this.axios.post('/api/Services/NewBusinessService.asmx/SaveVehicleTag', {jsonvalue: data}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addFormVisible = false
              this.attachInfo(res.data)
              if (isNew) this.totalList.unshift(res.data)
              else {
                this.totalList = this.totalList.map(item => {
                  return item.VehicleTagID === res.data.VehicleTagID ? res.data : item
                })
              }
              this.list = this.totalList
              this.total = this.list.length
            }
            this.isLoading = false
          }).catch(err => {
            console.log('新增出错', err)
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
