<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Data Define</span>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item>
            <el-select v-model="searchForm.dataName" @change="changeData()" placeholder="Please Select" filterable clearable>
              <el-option v-for="item in dataItems" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading || isLoadingTree">New</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="inPageContent">
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="ItemID" width="100" fixed="left"></el-table-column>
        <el-table-column :label="searchForm.dataName" min-width="300">
          <template v-slot:="scope">
            <el-input v-model="scope.row.Name" :disabled="!(scope.row.DataItemID === currentId)"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template v-slot:="scope">
            <el-button v-if="currentId === null && !(scope.row.DataItemID === currentId)" icon="el-icon-edit" type="primary" @click="showEdit(scope.row.DataItemID, scope.row.Name)" :loading="isLoading || isLoadingTree" size="small">Edit</el-button>
            <el-button v-if="currentId === null && !(scope.row.DataItemID === currentId)" icon="el-icon-edit" type="primary" @click="showAddress(scope.row)" :loading="isLoading || isLoadingTree" size="small">Address</el-button>
            <el-button v-if="currentId === null && !(scope.row.DataItemID === currentId)" icon="el-icon-delete" type="danger" @click="del(scope.row.DataItemID)" :loading="isLoading || isLoadingTree" size="small">Delete</el-button>
            <el-button v-if="scope.row.DataItemID === currentId" icon="el-icon-check" type="primary" @click="edit(scope.row)" :loading="isLoading || isLoadingTree" size="small">Confirm</el-button>
            <el-button v-if="scope.row.DataItemID === currentId" icon="el-icon-close" type="primary" @click="cancel(scope.row.DataItemID)" :loading="isLoading || isLoadingTree" plain size="small">Cancel</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog :title="'Add New ' + searchForm.dataName" :visible.sync="addFormVisible" width="600px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item :label="searchForm.dataName" prop="name">
            <el-input v-model="addForm.Name" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading || isLoadingTree">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------地址弹窗开始----------------------------------------------------->
      <el-dialog title="Select Address" :visible.sync="addressFormVisible" width="600px" center :before-close="closeAddress">
        <el-form :model="addressForm" ref="addressForm" :rules="addFormRules" class="form">
          <el-form-item class="marginLeft10">
            <el-checkbox-group v-model="addressForm.checkedAddresses" >
              <el-checkbox v-for="address in selectedAddresses" :label="address.Name" :key="address.DataItemID"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item class="marginLeft10">
            <el-select v-model="addressForm.selectedID" filterable placeholder="Please Select">
              <el-option
                v-for="item in addresses"
                :key="item.DataItemID"
                :label="item.Name"
                :value="item.DataItemID">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" plain size="small" @click="selectAddress()" :loading="isLoading || isLoadingTree">Select</el-button>
            <el-button icon="el-icon-minus" type="primary" plain size="small" @click="removeAddress()" :loading="isLoading || isLoadingTree">Remove</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------地址窗结束----------------------------------------------------->
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
      currentDataItem: null,
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      dataItems: ['Lessor', 'Lienholder', 'Mortgagee'],
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
          { max: 30, message: 'Within 30 Characters', trigger: 'blur' }
        ]
      },
      // Select Address
      addressFormVisible: false,
      addressForm: {
        selectedID: '',
        checkedAddresses: []
      },
      selectedAddresses: [],
      addresses: []
    }
  },
  mounted: function () {
    this.loadAddresses()
    // this.search()
  },
  methods: {
    changeData: function () {
      if (this.searchForm.dataName === '') return
      this.search()
    },

    loadAddresses: function () {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetDictionary', {datatype: 'Address'}).then(res => {
        if (res) {
          console.log('查询', res)
          this.addresses = res.data
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    // 查询
    search: function () {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetDictionaryWithChildren', {parenttype: this.searchForm.dataName, childtype: 'Address'}).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          // this.currentLessor = this.list[0]
          this.total = this.list.length
          this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
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
      this.selectedAddresses = lessor.children
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
        this.axios.post('/api/Services/baseservice.asmx/SaveDataItem', {dataitem: JSON.stringify(obj)}).then(res => {
          if (res) {
            console.log('修改', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.currentId = null
            this.currentDescription = null
            this.list = this.list.map(item => {
              return item.ItemID === res.data.ItemID ? res.data : item
            })
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
      if (this.searchForm.dataName === '') return
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
          this.axios.post('/api/Services/BaseService.asmx/AddDataItem', {datatype: this.searchForm.dataName, name: name, value: name, parentid: 0}).then(res => {
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
      let address = this.addresses.find(a => a.DataItemID === childid)
      this.selectedAddresses.push(address)
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
      let selected = this.selectedAddresses
      this.addressForm.checkedAddresses.forEach(function (item) {
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
          this.selectedAddresses = lessor.children
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
