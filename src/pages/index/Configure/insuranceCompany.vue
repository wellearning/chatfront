<!--
FileName: Configure/insuranceCompany.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all insurance company list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Insurance Company</span>
      <div class="rightBtnBox">
        <el-button v-if="RoleName === 'Developer'" icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading || isLoadingOrganization">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Company Name" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name)" :loading="isLoading || isLoadingOrganization" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingOrganization" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingOrganization" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Company ID" prop="InsuranceCorpID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Company Name" prop="Name" min-width="200"></el-table-column>
        <el-table-column label="Short Name" prop="ShortName" min-width="100"></el-table-column>
        <el-table-column label="Address" prop="Address" min-width="200"></el-table-column>
        <el-table-column label="BusinessLine" width="100">
          <template v-slot:="scope">
            <span v-if="scope.row.BusinessLineID === 0" size="medium">Both</span>
            <span v-else-if="scope.row.BusinessLineID === 1" size="medium">Personal</span>
            <span v-else size="medium">Commercial</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="100">
          <template v-slot:="scope">
            <span v-if="scope.row.StatusID === 0" size="medium">Draft</span>
            <span v-if="scope.row.StatusID === 1" size="medium">Normal</span>
            <span v-else type="danger" size="medium">Stopped</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="320" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-document" type="primary" @click="showPrivilege(scope.row)" :loading="isLoading || isLoadingOrganization" size="small">Broker Code</el-button>
            <el-button v-if="RoleName === 'Developer'" icon="el-icon-edit" type="primary" @click="showEdit(scope.row.InsuranceCorpID)" :loading="isLoading || isLoadingOrganization" size="small">Edit</el-button>
            <el-button v-if="RoleName === 'Developer'" icon="el-icon-delete" type="danger" @click="del(scope.row.InsuranceCorpID)" :loading="isLoading || isLoadingOrganization" size="small">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Insurance Company" :visible.sync="addFormVisible" width="600px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="Name" prop="Name">
            <el-input v-model="addForm.Name" clearable></el-input>
          </el-form-item>
          <el-form-item label="Short Name" prop="ShortName">
            <el-input v-model="addForm.ShortName" clearable></el-input>
          </el-form-item>
          <el-form-item label="Parent Corperation" prop="ParentID">
            <el-select v-model="addForm.ParentID" placeholder="Parent Corperation" no-data-text="No Record" filterable>
              <el-option v-for="item in corpList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Province" prop="Province">
            <el-select v-model="addForm.Province" placeholder="Province" no-data-text="No Record" filterable>
              <el-option v-for="item in provinceList" :key="item.ItemID" :label="item.Name" :value="item.Name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Address" prop="Address">
            <el-input v-model="addForm.Address" clearable></el-input>
          </el-form-item>
          <el-form-item label="AutoBindingAuthority" prop="AutoBindingAuthority">
            <el-input v-model.number="addForm.AutoBindingAuthority" clearable></el-input>
          </el-form-item>
          <el-form-item label="PropertyBindingAuthority" prop="PropertyBindingAuthority">
            <el-input v-model.number="addForm.PropertyBindingAuthority" clearable></el-input>
          </el-form-item>
          <el-form-item label="HomeMinimum" prop="HomeMinimum">
            <el-input v-model.number="addForm.HomeMinimum" clearable></el-input>
          </el-form-item>
          <el-form-item label="RentedDwelling" prop="RentedDwelling">
            <el-input v-model.number="addForm.RentedDwelling" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading || isLoadingOrganization">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="Edit Insurance Company" :visible.sync="editFormVisible" width="700px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form">
          <el-form-item label="Name" prop="Name">
            <el-input v-model="editForm.Name" clearable></el-input>
          </el-form-item>
          <el-form-item label="Short Name" prop="ShortName">
            <el-input v-model="editForm.ShortName" clearable></el-input>
          </el-form-item>
          <el-form-item label="Parent Corperation" prop="ParentID">
            <el-select v-model="editForm.ParentID" placeholder="Parent Corperation" no-data-text="No Record" filterable>
              <el-option v-for="item in corpList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Province" prop="Province">
            <el-select v-model="editForm.Province" placeholder="Province" no-data-text="No Record" filterable>
              <el-option v-for="item in provinceList" :key="item.ItemID" :label="item.Name" :value="item.Name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Address" prop="Address">
            <el-input v-model="editForm.Address" clearable></el-input>
          </el-form-item>
          <el-form-item label="AutoBindingAuthority" prop="AutoBindingAuthority">
            <el-input v-model.number="editForm.AutoBindingAuthority" clearable></el-input>
          </el-form-item>
          <el-form-item label="PropertyBindingAuthority" prop="PropertyBindingAuthority">
            <el-input v-model.number="editForm.PropertyBindingAuthority" clearable></el-input>
          </el-form-item>
          <el-form-item label="HomeMinimum" prop="HomeMinimum">
            <el-input v-model.number="editForm.HomeMinimum" clearable></el-input>
          </el-form-item>
          <el-form-item label="RentedDwelling" prop="RentedDwelling">
            <el-input v-model.number="editForm.RentedDwelling" clearable></el-input>
          </el-form-item>
          <el-form-item label="BusinessLine" prop="BusinessLineID">
            <el-radio-group v-model="editForm.BusinessLineID">
              <el-radio v-for="item in businessLineList" :label="item.key" :key="item.key">
                <span>{{item.value}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Status" prop="StatusID">
            <el-radio-group v-model="editForm.StatusID">
              <el-radio v-for="item in statusList" :label="item.key" :key="item.key">
                <span>{{item.value}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading || isLoadingOrganization">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------BrokerCode弹窗开始----------------------------------------------------->
      <el-dialog title="BrokerCode" :visible.sync="privilegesVisible" width="600px" center :before-close="closePrivileges">
        <el-form class="form">
          <el-form-item v-for="(item, index) in BrokerCodeList" :label="item.Name + '(' + item.BranchCode + ')'" :key="index">
            <el-input v-model="item.BrokerCode" clearable maxlength="20"></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="privileges()" :loading="isLoading || isLoadingOrganization">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------BrokerCode弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      RoleName: JSON.parse(this.$store.getters.getAccount).RoleName,
      isLoading: false,
      isLoadingOrganization: false,
      currentId: null,
      // 列表
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
      // 权限
      privilegesVisible: false,
      corpList: [],
      provinceList: [],
      organizationList: [],
      BrokerCodeList: [],
      isPost: false,
      totalNum: 0,
      finishNum: 0,
      businessLineList: [{key: 0, value: 'Both'}, {key: 1, value: 'Personal'}, {key: 2, value: 'Commercial'}],
      statusList: [{key: 0, value: 'Draft'}, {key: 1, value: 'Normal'}, {key: 2, value: 'Stopped'}],
      // 新增
      addFormVisible: false,
      addForm: {
        Name: null,
        ShortName: null,
        ParentID: 0,
        Province: null,
        Address: null,
        AutoBindingAuthority: null,
        PropertyBindingAuthority: null,
        HomeMinimum: null,
        RentedDwelling: null
      },
      addFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 100, message: 'Within 100 Characters', trigger: 'blur' }
        ],
        ShortName: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 30, message: 'Within 30 Characters', trigger: 'blur' }
        ],
        Address: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 200, message: 'Within 200 Characters', trigger: 'blur' }
        ],
        AutoBindingAuthority: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ],
        PropertyBindingAuthority: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ],
        HomeMinimum: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ],
        RentedDwelling: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ]
      },
      // 修改
      editFormVisible: false,
      editForm: {
        InsuranceCorpID: null,
        Name: null,
        ShortName: null,
        ParentID: 0,
        Province: null,
        Address: null,
        AutoBindingAuthority: null,
        PropertyBindingAuthority: null,
        HomeMinimum: null,
        RentedDwelling: null,
        BusinessLineID: 0,
        StatusID: 1,
        IsNew: false,
        IsNewAdded: false,
        IsRemoved: false
      },
      editFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 100, message: 'Within 100 Characters', trigger: 'blur' }
        ],
        ShortName: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 30, message: 'Within 30 Characters', trigger: 'blur' }
        ],
        Address: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 200, message: 'Within 200 Characters', trigger: 'blur' }
        ],
        AutoBindingAuthority: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ],
        PropertyBindingAuthority: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ],
        HomeMinimum: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ],
        RentedDwelling: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { type: 'number', message: 'Format Error', trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function () {
    this.initProvinceList()
    this.search(null)
    this.initOrganization()
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
    initProvinceList: function () {
      this.isLoadingProvinceList = true
      this.axios.post('/api/Services/baseservice.asmx/GetDictionary', {datatype: 'Province'}).then(res => {
        if (res) {
          console.log('查询', res)
          this.provinceList = res.data
          // this.search(null)
        }
        this.isLoadingProvinceList = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingProvinceList = false
      })
    },
    // 查询组织架构
    initOrganization: function () {
      this.isLoadingOrganization = true
      this.axios.post('/api/Services/baseservice.asmx/GetInstitutions', {}).then(res => {
        if (res) {
          console.log('查询', res)
          this.organizationList = res.data.filter(item => item.TypeID === 2)
        }
        this.isLoadingOrganization = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingOrganization = false
      })
    },
    initInsuranceCorps: function () {
      let corp = {InsuranceCorpID: 0, Name: 'No Parent'}
      let clist = []
      clist.push(corp)
      this.list.forEach(function (c) {
        let co = {InsuranceCorpID: c.InsuranceCorpID, Name: c.Name}
        clist.push(co)
      })
      this.corpList = clist
    },
    // 查询
    search: function (name) {
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps', {}).then(res => {
        if (res) {
          console.log('InsuranceCorps', res.data)
          this.list = res.data
          this.initInsuranceCorps()
          if (name !== null) {
            this.searchName = name
            this.list = this.list.filter(item => item.Name.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)
          }
          this.total = this.list.length
          this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search(null)
    },
    // 显示权限弹窗
    showPrivilege: function (corp) {
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorpBrokers', {corpid: corp.InsuranceCorpID}).then(res => {
        if (res) {
          console.log('InsuranceCorpBrokers', res)
          this.privilegesVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            // this.BrokerCodeList = JSON.parse(JSON.stringify(corp.institutions)).map(item => { return {InsuranceCorpID: corp.InsuranceCorpID, Name: item.Name, BranchCode: item.BranchCode, BrokerCode: null, corp: null, broker: null} })
            this.BrokerCodeList = JSON.parse(JSON.stringify(this.organizationList)).map(item => { return {InsuranceCorpID: corp.InsuranceCorpID, Name: item.Name, BranchCode: item.BranchCode, BrokerCode: null, corp: null, broker: null} })
            for (let i = 0; i < res.data.length; i++) {
              if (this.BrokerCodeList.find(item => item.BranchCode === res.data[i].BranchCode) !== undefined) {
                this.BrokerCodeList.find(item => item.BranchCode === res.data[i].BranchCode).InsuranceCorpBrokerID = res.data[i].InsuranceCorpBrokerID
                this.BrokerCodeList.find(item => item.BranchCode === res.data[i].BranchCode).BrokerCode = res.data[i].BrokerCode
              }
            }
          })
          console.log('BrokerCodeList', this.BrokerCodeList)
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    // 隐藏权限弹窗
    closePrivileges: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.BrokerCodeList = []
        done()
      }).catch(() => {})
    },
    // 提交BrokerCode
    privileges: function () {
      this.BrokerCodeList = this.BrokerCodeList.filter(item => item.BrokerCode !== null)
      this.isPost = true
      this.totalNum = this.BrokerCodeList.length
      for (let i = 0; i < this.BrokerCodeList.length; i++) {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/SaveInsuranceCorpBroker', {corpbroker: JSON.stringify(this.BrokerCodeList[i])}).then(res => {
          if (res) {
            console.log('提交BrokerCode', res)
            this.finishNum = this.finishNum + 1
          }
        }).catch(err => {
          console.log('提交BrokerCode出错', err)
          this.isLoading = false
        })
      }
    },
    // 删除
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/RemoveInstitutionInsuranceCorp', {corpid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.InsuranceCorpID !== id)
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
    // 修改弹窗
    showEdit: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorp', {corpid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.editFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.editForm = res.data
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
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
          this.axios.post('/api/Services/baseservice.asmx/SaveInsuranceCorp', {corp: JSON.stringify(this.editForm)}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['editForm'].resetFields()
              this.editFormVisible = false
              // 如果修改记录符合查询条件，更新该记录；如果不符合，删除该记录，总数减1
              if (this.searchName === null || (this.searchName !== null && res.data.Name.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)) {
                this.list = this.list.map(item => { return item.InsuranceCorpID === res.data.InsuranceCorpID ? res.data : item })
              } else {
                this.list = this.list.filter(item => item.InsuranceCorpID !== res.data.InsuranceCorpID)
                this.total = this.list.length
              }
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
    // 显示新增弹窗
    showAdd: function () {
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
          this.axios.post('/api/Services/baseservice.asmx/SaveInsuranceCorp', {corp: JSON.stringify(this.addForm)}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addFormVisible = false
              // 如果新增记录符合查询条件，将新增的记录添加到数组最后，总数加1
              if (this.searchName === null || (this.searchName !== null && res.data.Name.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)) {
                this.list.push(res.data)
                this.total = this.list.length
              }
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
