<!--
FileName: Configure/forbidden.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all forbidden list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Restriction</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="ID/Producer/Company/Template/Date" style="width:300px;" size="small" @change="search" @keyup.enter.native="search"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" @click="search" :loading="isLoading" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading||isLoadingInsuranceCorps" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="ForbiddenID" width="50" fixed="left"></el-table-column>
        <el-table-column label="InsurType" prop="InsuranceTypeName" min-width="120"></el-table-column>
        <el-table-column label="Producer" prop="ProducerName" min-width="200"></el-table-column>
        <el-table-column label="InsuranceCompany" prop="CorpName" min-width="200"></el-table-column>
        <el-table-column label="Template" prop="TemplateName" min-width="250"></el-table-column>
        <el-table-column label="Status" prop="Status" min-width="90"></el-table-column>
        <el-table-column label="Effective time" prop="EffectiveDate" min-width="130">
          <template v-slot:="scope">
            <span v-if="scope.row.StatusID!==2" style="">{{scope.row.EffectiveDate.format('YYYY-MM-DD')}}</span>
            <span v-else style="">{{scope.row.EffectiveDate.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Expiry time"  prop="ExpiryDate" min-width="130">
          <template v-slot:="scope">
            <span v-if="scope.row.StatusID !== 2" style="">{{scope.row.ExpiryDate.format('YYYY-MM-DD')}}</span>
            <span v-else style="">{{scope.row.ExpiryDate.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column>
        <!--el-table-column label="Introduction" prop="Introduce" min-width="250">
        </el-table-column-->
       <el-table-column label="Action" width="250" fixed="right">
          <template v-slot:="scope">
            <el-button-group>
              <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row)" :loading="isLoading" size="small">Edit</el-button>
              <el-button icon="el-icon-edit" v-if="scope.row.StatusID === 1" type="primary" @click="stop(scope.row.ForbiddenID)" :loading="isLoading" size="small">Stop</el-button>
              <el-button icon="el-icon-edit" v-if="scope.row.StatusID === 2" type="primary" @click="reuse(scope.row.ForbiddenID)" :loading="isLoading" size="small">Resume</el-button>
              <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.ForbiddenID)" :loading="isLoading" size="small">Delete</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog :title="editFormTitle" :visible.sync="addFormVisible" width="600px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="InsuranceType" prop="InsuranceTypeID">
            <el-select v-model="addForm.InsuranceTypeID" placeholder="InsuranceType" no-data-text="No Record" filterable>
              <el-option v-for="item in insuranceTypes" :key="item.key" :label="item.value" :value="item.key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Producer" prop="ProducerIDs">
            <el-select v-model="addForm.ProducerIDs" placeholder="Producer" no-data-text="No Record" multiple filterable>
              <el-option v-for="item in producers" :key="item.StaffID" :label="item.Name" :value="item.StaffID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="InsuranceCompany" prop="InsuranceCorpIDs">
            <el-select v-model="addForm.InsuranceCorpIDs" placeholder="Insurance Company" no-data-text="No Record" multiple filterable>
              <el-option v-for="item in insuranceCorps" :key="item.InsuranceCorpID" :label="item.ShortName" :value="item.InsuranceCorpID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="addForm.InsuranceTypeID === 2" label="Template" prop="TemplateIDs">
            <el-select v-model="addForm.TemplateIDs" placeholder="Template" no-data-text="No Record" multiple filterable>
              <el-option v-for="item in templates" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Start Time" prop="EffectiveDate">
            <el-date-picker v-model="addForm.EffectiveDate" clearable></el-date-picker>
          </el-form-item>
          <el-form-item label="End Time" prop="ExpiryDate">
            <el-date-picker v-model="addForm.ExpiryDate" clearable></el-date-picker>
          </el-form-item>
          <el-form-item label="Information" prop="Brief">
            <el-input type="textarea" :rows="3" v-model="addForm.Brief" clearable></el-input>
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
      isLoadingTemplates: false,
      isLoadingProducers: false,
      isLoadingInsuranceCorps: false,
      isLoadingBusinessType: false,
      isLoadingInsuranceType: false,
      currentId: null,
      currentForbidden: null,
      currentDescription: null,
      bTypeID: 2,
      editFormTitle: 'Add new restriction',
      list: [],
      totalList: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 权限
      producers: [],
      businessTypes: [],
      templates: [],
      insuranceCorps: [],
      insuranceTypes: [],
      searchForm: {
        name: null
      },
      // 新增
      addFormVisible: false,
      addForm: {
        ForbiddenID: 0,
        BusinessTypeID: 2,
        InsuranceTypeID: 1,
        ProducerIDs: [],
        InsuranceCorpIDs: [],
        TemplateIDs: [],
        EffectiveDate: null,
        ExpiryDate: null,
        Brief: null
      },
      addFormRules: {
        InsuranceTypeID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        EffectiveDate: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        ExpiryDate: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function () {
    this.loadBusinessTypes()
    this.loadInsuranceTypes()
    this.loadTemplates(this.bTypeID)
    this.loadProducers(0)
    this.loadInsuranceCorps()
    this.loadForbiddens(0)
  },
  methods: {
    loadTemplates: function (btypeid) {
      this.isLoadingTemplates = true
      this.axios.post('/api/Services/BaseService.asmx/GetTemplatesByBusinessType', {btypeid: btypeid}).then(res => {
        if (res) {
          console.log('Templates', res)
          this.templates = res.data.filter(t => t.TypeID === 2)
        }
        this.isLoadingTemplates = false
        this.attachInfoes()
      }).catch(err => {
        console.log('Templates error', err)
        this.isLoadingTemplates = false
      })
    },
    loadBusinessTypes: function () {
      this.isLoadingBusinessType = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'BusinessType'}).then(res => {
        if (res) {
          console.log('BusinessTypes', res)
          this.businessTypes = res.data
        }
        this.isLoadingBusinessType = false
      }).catch(err => {
        console.log('BusinessTypes', err)
        this.isLoadingBusinessType = false
      })
    },
    loadInsuranceTypes: function () {
      this.isLoadingInsuranceType = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'InsuranceType'}).then(res => {
        if (res) {
          console.log('InsuranceTypes', res)
          this.insuranceTypes = res.data.filter(t => t.key !== 0)
        }
        this.isLoadingInsuranceType = false
      }).catch(err => {
        console.log('InsuranceTypes', err)
        this.isLoadingInsuranceType = false
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
    // 查询
    loadForbiddens: function (start) {
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetForbiddens', {start: start}).then(res => {
        if (res) {
          console.log('loadForbiddens', res)
          if (start === 0) {
            this.total = res.count
            this.totalList = res.data
          } else {
            this.totalList = this.totalList.concat(res.data)
          }
          if (this.totalList.length === this.total) {
            this.isLoading = false
            this.attachInfoes()
          } else this.loadForbiddens(this.totalList.length)
        }
      }).catch(err => {
        console.log('loadForbiddens', err)
        this.isLoading = false
      })
    },
    attachInfoes: function () {
      if (this.isLoading || this.isLoadingTemplates || this.isLoadingProducers || this.isLoadingInsuranceCorps) {
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
      a.ExpiryDate = moment(a.ExpiryDate)
      let businessType = this.businessTypes.find(p => p.key === a.BusinessTypeID)
      let insuranceType = this.insuranceTypes.find(p => p.key === a.InsuranceTypeID)
      a.BusinessTypeName = businessType.value
      a.InsuranceTypeName = insuranceType.value
      a.InsuranceCorpIDs = JSON.parse(a.InsuranceCorpIDs)
      a.ProducerIDs = JSON.parse(a.ProducerIDs)
      a.TemplateIDs = JSON.parse(a.TemplateIDs)
      if (!Array.isArray(a.InsuranceCorpIDs)) a.InsuranceCorpIDs = []
      if (!Array.isArray(a.ProducerIDs)) a.ProducerIDs = []
      if (!Array.isArray(a.TemplateIDs)) a.TemplateIDs = []
      let corpnames = []
      let producernames = []
      let templatenames = []
      a.InsuranceCorpIDs.forEach(id => {
        let corp = this.insuranceCorps.find(c => c.InsuranceCorpID === id)
        if (corp !== undefined)corpnames.push(corp.ShortName)
      })
      a.ProducerIDs.forEach(id => {
        let producer = this.producers.find(p => p.StaffID === id)
        if (producer !== undefined) producernames.push(producer.Name)
      })
      a.TemplateIDs.forEach(id => {
        let template = this.templates.find(p => p.TemplateID === id)
        if (template !== undefined) templatenames.push(template.Title)
      })
      a.CorpName = corpnames.join(', ')
      a.ProducerName = producernames.join(', ')
      a.TemplateName = templatenames.join(', ')
    },
    // 查询
    search: function () {
      let query = this.searchForm.name
      if (query === null || query === '') {
        this.list = this.totalList
      } else {
        query = query.toLowerCase().trim()
        this.list = this.totalList.filter(r => r.ProducerName.toLowerCase().indexOf(query) >= 0 ||
          r.ForbiddenID === Number(query) ||
          r.InsuranceTypeName.toLowerCase().indexOf(query) >= 0 ||
          r.CorpName.toLowerCase().indexOf(query) >= 0 ||
          r.TemplateName.toLowerCase().indexOf(query) >= 0 ||
          r.EffectiveDate.format('YYYY-MM-DD').indexOf(query) >= 0 ||
          r.ExpiryDate.format('YYYY-MM-DD').indexOf(query) >= 0
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
    showEdit: function (forbidden) {
      this.addForm = JSON.parse(JSON.stringify(forbidden))
      this.editFormTitle = 'Edit Restriction ID: ' + forbidden.ForbiddenID
      this.addFormVisible = true
    },
    // 删除
    stop: function (id) {
      this.$confirm('Are you sure to stop it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/StopForbidden', {id: id}).then(res => {
          if (res) {
            console.log('stop', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.attachInfo(res.data)
            this.totalList = this.totalList.map(item => {
              return item.ForbiddenID === res.data.ForbiddenID ? res.data : item
            })
            this.list = this.totalList
          }
          this.isLoading = false
        }).catch(err => {
          console.log('stop error', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    reuse: function (id) {
      this.$confirm('Are you sure to reuse it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/ReuseForbidden', {id: id}).then(res => {
          if (res) {
            console.log('stop', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.attachInfo(res.data)
            this.totalList = this.totalList.map(item => {
              return item.ForbiddenID === res.data.ForbiddenID ? res.data : item
            })
            this.list = this.totalList
          }
          this.isLoading = false
        }).catch(err => {
          console.log('stop error', err)
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
        this.axios.post('/api/Services/baseservice.asmx/RemoveForbidden', {id: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.ForbiddenID !== id)
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
    // 修改
    edit: function (obj) {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          let forbidden = JSON.parse(JSON.stringfy(this.addForm))
          forbidden.EffectiveDate = moment(forbidden.EffectiveDate)
          forbidden.ExpiryDate = moment(forbidden.ExpiryDate)
          forbidden.ProducerIDs = JSON.stringify(forbidden.ProducerIDs)
          forbidden.InsuranceCorpIDs = JSON.stringify(forbidden.InsuranceCorpIDs)
          forbidden.TemplateIDs = JSON.stringify(forbidden.InsuranceCorpIDs)
          let data = JSON.stringify(forbidden)
          this.axios.post('/api/Services/baseservice.asmx/SaveForbidden', {jsonvalue: data}).then(res => {
            if (res) {
              console.log('edit forbidden', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.resetForm()
              this.attachInfo(res.data)
              this.totalList = this.totalList.map(item => {
                return item.ForbiddenID === res.data.ForbiddenID ? res.data : item
              })
              this.list = this.totalList
            }
            this.isLoading = false
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
    resetForm: function () {
      // this.$refs['addForm'].resetFields()
      this.isAdd = false
      this.isEdit = false
    },

    // 取消修改
    cancel: function (id) {
      this.currentId = null
      this.list.find(item => item.ForbiddenID === id).Name = this.currentDescription
      this.currentDescription = null
    },
    // 显示新增弹窗
    showAdd: function () {
      this.editFormTitle = 'Add New Restriction'
      let item = {
        ForbiddenID: 0,
        InsuranceTypeID: null,
        ProducerIDs: [],
        InsuranceCorpIDs: [],
        TemplateIDs: [],
        EffectiveDate: null,
        ExpiryDate: null,
        Brief: ''
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
          if (this.addForm.ForbiddenID > 0) isNew = false
          this.isLoading = true
          let forbidden = JSON.parse(JSON.stringify(this.addForm))
          if (forbidden.TemplateIDs === null) forbidden.TemplateIDs = []
          forbidden.EffectiveDate = moment(forbidden.EffectiveDate)
          forbidden.ExpiryDate = moment(forbidden.ExpiryDate)
          forbidden.ProducerIDs = JSON.stringify(forbidden.ProducerIDs)
          forbidden.InsuranceCorpIDs = JSON.stringify(forbidden.InsuranceCorpIDs)
          forbidden.TemplateIDs = JSON.stringify(forbidden.TemplateIDs)
          let data = JSON.stringify(forbidden)
          this.axios.post('/api/Services/baseservice.asmx/SaveForbidden', {jsonvalue: data}).then(res => {
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
                  return item.ForbiddenID === res.data.ForbiddenID ? res.data : item
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
