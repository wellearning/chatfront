<!--
FileName: Configure/rateDefine.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all defined coefficient list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Coefficient Define</span>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item>
            <el-select v-model="dataId" @change="changeData()" placeholder="Please Select" filterable clearable>
              <el-option v-for="item in rateTypes" :key="item.ItemID" :label="item.Name" :value="item.ItemID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading || isLoadingTree">New</el-button>
            <el-button icon="el-icon-setting" type="primary" @click="reset()" :loading="isLoading || isLoadingTree">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="inPageContent">
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="BusiRateID" width="100" fixed="left"></el-table-column>
        <el-table-column v-for="(col, index) in busiItems" :key="index" :label="col.Name" :prop="col.Name" min-width="100" sortable="custom" >
          <!--template v-slot="scope" >
            <span>{{scope.row[col.Name]}}</span>
          </template-->
        </el-table-column>
        <el-table-column label="Rate" prop="Rate" width="200">
          <template v-slot:="scope">
            <el-input v-model="scope.row.Rate" :disabled="!(scope.row.BusiRateID === currentId)"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template v-slot:="scope">
            <el-button v-if="currentId === null && !(scope.row.BusiRateID === currentId)" icon="el-icon-edit" type="primary" @click="showEdit(scope.row.BusiRateID, scope.row.Name)" :loading="isLoading || isLoadingTree" size="small">Edit</el-button>
            <el-button v-if="currentId === null && !(scope.row.BusiRateID === currentId)" icon="el-icon-delete" type="danger" @click="del(scope.row.BusiRateID)" :loading="isLoading || isLoadingTree" size="small">Delete</el-button>
            <el-button v-if="scope.row.BusiRateID === currentId" icon="el-icon-check" type="primary" @click="edit(scope.row)" :loading="isLoading || isLoadingTree" size="small">Confirm</el-button>
            <el-button v-if="scope.row.BusiRateID === currentId" icon="el-icon-close" type="primary" @click="cancel(scope.row.BusiRateID)" :loading="isLoading || isLoadingTree" plain size="small">Cancel</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog :title="'Add New ' + dataName" :visible.sync="addFormVisible" width="600px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form" width="500px">
          <el-form-item :label="dataName" prop="name">
            <el-input v-model="addForm.Name" width="500px" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading || isLoadingTree">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      isLoading: false,
      isLoadingTree: false,
      currentId: null,
      currentDescription: null,
      currentRateType: null,
      dataId: null,
      dataName: '',
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      rateTypes: [],
      busiItems: [],
      busiItemValues: [],
      tableColumns: [],
      // 搜索
      searchForm: {
        dataName: ''
      },
      // 新增
      addFormVisible: false,
      addForm: {
        Name: null
      },
      addFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 60, message: 'Within 60 Characters', trigger: 'blur' }
        ]
      },
      // Select Address
      addressFormVisible: false,
      addressForm: {
        selectedID: '',
        checkedChildren: []
      },
      selectedChildren: [],
      children: []
    }
  },
  mounted: function () {
    this.loadRateTypes()
    // this.search()
  },
  methods: {
    changeData: function () {
      if (this.dataId === null) return
      this.currentRateType = this.rateTypes[this.dataId - 1]
      // this.dataName = this.currentRateType.Name
      this.search()
    },

    loadRateTypes: function () {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetDataItems', {datatype: 'RateType'}).then(res => {
        if (res) {
          console.log('查询', res)
          this.rateTypes = res.data
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    // 查询
    search: function () {
      if (this.currentRateType.Name === undefined) return
      this.isLoading = true
      let typeid = this.dataId // parseInt(this.currentRateType.ItemID)
      // let service = '/api/Services/BaseService.asmx/GetBusiRateType'
      // let para = {typeid: typeid}
      this.axios.post('/api/Services/BaseService.asmx/GetBusiRateType', {typeid: typeid}).then(res => {
        if (res) {
          console.log('查询', res)
          let busiItems = res.data.busiItems
          let rates = res.data.rates
          let busiItemValues = res.data.busiItemValues
          this.setColumns(rates, busiItems, busiItemValues)
          console.log('rates', rates)
          this.busiItems = busiItems
          this.list = rates
          this.total = this.list.length
          this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    // 所有参数重置
    reset: function () {
      this.$confirm('Are you sure to reset it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        if (this.currentRateType.Name === undefined) return
        this.isLoading = true
        let typeid = parseInt(this.currentRateType.ItemID)
        this.axios.post('/api/Services/BaseService.asmx/InitialBusiRateType', {typeid: typeid}).then(res => {
          if (res) {
            console.log('查询', res)
            let busiItems = res.data.busiItems
            let rates = res.data.rates
            let busiItemValues = res.data.busiItemValues
            this.setColumns(rates, busiItems, busiItemValues)
            console.log('rates', rates)
            this.busiItems = busiItems
            this.list = rates
            this.total = this.list.length
            this.currentPage = 1
          }
          this.isLoading = false
        }).catch(err => {
          console.log('查询出错', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    setColumns: function (rates, busiItems, busiItemValues) {
      rates.forEach(function (rate) {
        for (let i = 0; i < busiItems.length; i++) {
          let colName = busiItems[i].Name
          let colID = rate.ItemIDs[i]
          let colValue = busiItemValues[i].find(bi => bi.ItemID === colID)
          rate[colName] = colValue === undefined ? '' : colValue.Name
        }
      })
    },
    // 显示修改
    showEdit: function (id, description) {
      this.currentId = id
      this.currentDescription = description
    },
    // 显示修改
    showAddress: function (lessor) {
      this.currentLessor = lessor
      this.selectedChildren = lessor.children
      this.addressFormVisible = true
    },
    // 删除
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/BaseService.asmx/RemoveDataItem', {dataitemid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.DataItemID !== id)
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
      let rule = '^.{1,100}$'
      if (!new RegExp(rule).test(obj.Name)) {
        this.$message({
          type: 'error',
          message: 'Format Error'
        })
      } else {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/SaveBusiRate', {jsonvalue: JSON.stringify(obj)}).then(res => {
          if (res) {
            console.log('修改', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.currentId = null
            this.currentDescription = null
            // this.list = this.list.map(item => {
            //   return item.BusiRateID === res.data.BusiRateID ? res.data : item
            // })
          }
          this.isLoading = false
        }).catch(err => {
          console.log('修改出错', err)
          this.isLoading = false
        })
      }
    },
    // 取消修改
    cancel: function (id) {
      this.currentId = null
      this.list.find(item => item.DataItemID === id).Name = this.currentDescription
      this.currentDescription = null
    },
    // 显示新增弹窗
    showAdd: function () {
      if (this.currentRateType === null) return
      if (this.currentRateType.name === undefined) return
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
          let name = this.addForm.Name
          this.axios.post('/api/Services/BaseService.asmx/AddDataItem', {datatype: this.dataName, name: name, value: name, parentid: 0}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addFormVisible = false
              this.list.push(res.data)
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
    },
    // 隐藏地址弹窗
    closeAddress: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        done()
      }).catch(() => {})
    },
    selectAddress: function () {
      let childid = this.addressForm.selectedID
      if (childid === null) return
      let address = this.children.find(a => a.DataItemID === childid)
      this.selectedChildren.push(address)
      let lessor = this.currentLessor
      let parentid = lessor.DataItemID
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/AddDataItemRelation', {parentid: parentid, childid: childid}).then(res => {
        if (res) {
          console.log('select address', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('Fail to remove address', err)
        this.isLoading = false
      })
    },
    removeAddress: function () {
      let children = []
      let selected = this.selectedChildren
      this.addressForm.checkedChildren.forEach(function (item) {
        let address = selected.find(a => a.Name === item)
        children.push(address)
      })
      let value = JSON.stringify(children)
      let lessor = this.currentLessor
      let parentid = lessor.DataItemID
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/RemoveDataItemChildren', {dataitemid: parentid, children: value}).then(res => {
        if (res) {
          console.log('removeAddress', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          lessor.children = res.data
          this.selectedChildren = lessor.children
        }
        this.isLoading = false
      }).catch(err => {
        console.log('Fail to remove address', err)
        this.isLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
