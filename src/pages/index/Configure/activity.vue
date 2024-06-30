<!--
FileName: Configure/activity.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show all activity list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Activity</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Activity ID" prop="ActivityID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Activity Name" prop="Name" min-width="300">
        </el-table-column>
        <el-table-column label="Start time" prop="StartTime" min-width="150">
          <template v-slot:="scope">
            <span>{{scope.row.StartTime.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column>
        <el-table-column label="End time"  prop="EndTime" min-width="150">
          <template v-slot:="scope">
            <span>{{scope.row.EndTime.format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Introduction" prop="Introduce" min-width="300">
        </el-table-column>
       <el-table-column label="Action" width="360" fixed="right">
          <template v-slot:="scope">
            <el-button-group>
              <el-button icon="el-icon-document" type="primary" @click="showAttendeeForm(scope.row)" :loading="isLoading" size="small">Attendees</el-button>
              <el-button icon="el-icon-document" type="primary" @click="showSponsorForm(scope.row)" :loading="isLoading" size="small">Sponsors</el-button>
              <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row)" :loading="isLoading" size="small">Edit</el-button>
              <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.ActivityID)" :loading="isLoading" size="small">Delete</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Activity" :visible.sync="addFormVisible" width="600px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form">
          <el-form-item label="Activity Name" prop="name">
            <el-input v-model="addForm.Name" clearable></el-input>
          </el-form-item>
          <el-form-item label="Start Time" prop="StartTime">
            <el-date-picker v-model="addForm.StartTime" clearable></el-date-picker>
          </el-form-item>
          <el-form-item label="End Time" prop="EndTime">
            <el-date-picker v-model="addForm.EndTime" clearable></el-date-picker>
          </el-form-item>
          <el-form-item label="Introduction" prop="name">
            <el-input type="textarea" :rows="3" v-model="addForm.Introduce" clearable></el-input>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------Attendee弹窗开始----------------------------------------------------->
      <el-dialog title="Attendee" :visible.sync="attendeeFormVisible" width="600px" center :before-close="closeAttendee">
        <el-form :model="attendeeForm" ref="attendeeForm" class="form">
          <el-form-item class="marginLeft10">
            <el-checkbox-group v-model="attendeeForm.checkedChildren" >
              <el-checkbox v-for="item in selectedChildren" :label="item.Name" :key="item.AttendeeID"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item class="marginLeft10">
            <el-select v-model="attendeeForm.selectedIDs" filterable multiple placeholder="Please Select">
              <el-option
                v-for="item in children"
                :key="item.AttendeeID"
                :label="item.Name"
                :value="item.AttendeeID">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" plain size="small" @click="selectAttendee()" :loading="isLoading">Select</el-button>
            <el-button icon="el-icon-minus" type="primary" plain size="small" @click="removeAttendee()" :loading="isLoading">Remove</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------Attendee弹窗结束----------------------------------------------------->
      <!----------------------------------------------Sponsor弹窗开始----------------------------------------------------->
      <el-dialog title="Sponsor" :visible.sync="sponsorFormVisible" width="600px" center :before-close="closeSponsor">
        <el-form :model="sponsorForm" ref="sponsorForm" class="form">
          <el-form-item class="marginLeft10">
            <el-checkbox-group v-model="sponsorForm.checkedChildren" >
              <el-checkbox v-for="item in selectedSponsors" :label="item.Name" :key="item.SponsorID"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item class="marginLeft10">
            <el-select v-model="sponsorForm.selectedIDs" filterable multiple placeholder="Please Select">
              <el-option
                v-for="item in selectableSponsors"
                :key="item.SponsorID"
                :label="item.Name"
                :value="item.SponsorID">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" plain size="small" @click="selectSponsor()" :loading="isLoading">Select</el-button>
            <el-button icon="el-icon-minus" type="primary" plain size="small" @click="removeSponsor()" :loading="isLoading">Remove</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------Sponsor弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>
<script>
import moment from 'moment'
export default {
  data: function () {
    return {
      isLoading: false,
      isLoadingHelpData: false,
      currentId: null,
      currentActivity: null,
      currentDescription: null,
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      // 权限
      attendeeFormVisible: false,
      sponsorFormVisible: false,
      currentAttendees: null,
      objectTypes: [],
      // 新增
      addFormVisible: false,
      addForm: {
        Name: null,
        AttendeeTypeID: 1,
        SponsorTypeID: 2,
        StartTime: null,
        EndTime: null,
        Introduce: null
      },
      addFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 30, message: 'Within 30 Characters', trigger: 'blur' }
        ]
      },
      isLoadingAttendees: false,
      attendeeForm: {
        selectedIDs: [],
        checkedChildren: []
      },
      attendees: [],
      selectedChildren: [],
      children: [],
      isLoadingSponsors: false,
      sponsorForm: {
        selectedIDs: [],
        checkedChildren: []
      },
      sponsors: [],
      selectedSponsors: [],
      selectableSponsors: []
    }
  },
  mounted: function () {
    this.loadObjectTypes()
    this.loadAttendees()
    this.loadSponsors()
    this.search()
  },
  methods: {
    loadObjectTypes: function () {
      this.isLoadingHelpData = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'ObjectType'}).then(res => {
        if (res) {
          console.log('objectTypes', res)
          this.objectTypes = res.data
        }
        this.isLoadingHelpData = false
      }).catch(err => {
        console.log('objectTypes', err)
        this.isLoadingHelpData = false
      })
    },
    loadAttendees: function () {
      this.isLoadingStaffs = true
      this.axios.post('/api/Services/baseservice.asmx/GetGroups', {}).then(res => {
        if (res) {
          console.log('attendees', res)
          res.data.forEach(g => {
            let child = {
              AttendeeID: g.InstitutionID,
              Name: g.Name
            }
            this.attendees.push(child)
          })
        }
      }).catch(err => {
        console.log('attendees', err)
        this.isLoadingStaffs = false
      })
    },
    loadSponsors: function () {
      this.isLoadingSponsors = true
      this.axios.post('/api/Services/baseservice.asmx/GetSponsors', {}).then(res => {
        if (res) {
          console.log('GetSponsors', res)
          res.data.forEach(g => {
            let child = {
              SponsorID: g.InsuranceCorpID,
              Name: g.Name
            }
            this.sponsors.push(child)
          })
        }
        this.isLoadingSponsors = false
      }).catch(err => {
        console.log('GetSponsors', err)
        this.isLoadingSponsors = false
      })
    },
    // 查询
    search: function () {
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetActivitys', {}).then(res => {
        if (res) {
          console.log('查询', res)
          res.data.forEach(a => {
            a.StartTime = moment(a.StartTime)
            a.EndTime = moment(a.EndTime)
          })
          this.list = res.data
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
    showEdit: function (activity) {
      this.addForm = activity
      this.addFormVisible = true
    },
    // 删除
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/RemoveActivity', {activityid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.ActivityID !== id)
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
      let rule = '^.{1,30}$'
      if (!new RegExp(rule).test(obj.Name)) {
        this.$message({
          type: 'error',
          message: 'Format Error'
        })
      } else {
        this.isLoading = true
        this.axios.post('/api/Services/baseservice.asmx/SaveActivity', {activity: JSON.stringify(obj)}).then(res => {
          if (res) {
            console.log('修改', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            res.data.StartTime = moment(res.data.StartTime)
            res.data.EndTime = moment(res.data.EndTime)
            this.currentId = null
            this.currentDescription = null
            this.list = this.list.map(item => {
              return item.ActivityID === res.data.ActivityID ? res.data : item
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
      this.list.find(item => item.ActivityID === id).Name = this.currentDescription
      this.currentDescription = null
    },
    // 显示新增弹窗
    showAdd: function () {
      let item = {
        ActivityID: 0,
        Name: '',
        StartTime: null,
        EndTime: null,
        Introduce: '',
        AttendeeTypeID: 1,
        SponsorTypeID: 2,
        IsNew: true
      }
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
          this.addForm.StartTime = moment(this.addForm.StartTime)
          this.addForm.EndTime = moment(this.addForm.EndTime)
          this.axios.post('/api/Services/baseservice.asmx/SaveActivity', {activity: JSON.stringify(this.addForm)}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addFormVisible = false
              res.data.StartTime = moment(res.data.StartTime)
              res.data.EndTime = moment(res.data.EndTime)
              if (this.addForm.IsNew) this.list.push(res.data)
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
    showAttendeeForm: function (activity) {
      this.currentActivity = activity
      this.attendeeForm.selectedIDs = []
      this.isLoadingAttendees = true
      this.axios.post('/api/Services/baseservice.asmx/GetActivityAttendees', {activityid: activity.ActivityID}).then(res => {
        if (res) {
          console.log('GetInstitutionAttendees', res)
          this.selectedChildren = []
          res.data.forEach(is => {
            let atte = this.attendees.find(s => s.AttendeeID === is.AttendeeID)
            if (atte !== undefined) this.selectedChildren.push(atte)
          })
          this.children = this.attendees.filter(s => !this.selectedChildren.includes(s))
          this.isLoadingAttendees = false
          this.attendeeFormVisible = true
        }
      }).catch(err => {
        console.log('staffList', err)
        this.isLoadingAttendees = false
      })
    },
    closeAttendee: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        done()
      }).catch(() => {})
    },
    selectAttendee: function () {
      let childids = this.attendeeForm.selectedIDs
      // if (childid === null) return
      childids.forEach(id => {
        let staff = this.attendees.find(a => a.AttendeeID === id)
        this.selectedChildren.push(staff)
      })
      let inst = this.currentActivity
      let parentid = inst.ActivityID
      let ids = JSON.stringify(childids)
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/AddActivityAttendees', {activityid: parentid, ids: ids}).then(res => {
        if (res) {
          console.log('select staff', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
        }
        this.children = this.attendees.filter(s => !this.selectedChildren.includes(s))
        this.attendeeForm.selectedIDs = []
        this.attendeeForm.checkedChildren = []
        this.isLoading = false
      }).catch(err => {
        console.log('Fail to remove staff', err)
        this.isLoading = false
      })
    },
    removeAttendee: function () {
      let children = []
      let selected = this.selectedChildren
      this.attendeeForm.checkedChildren.forEach(function (item) {
        let attendee = selected.find(a => a.Name === item)
        children.push(attendee.AttendeeID)
      })
      let value = JSON.stringify(children)
      let node = this.currentActivity
      let parentid = node.ActivityID
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/RemoveActivityAttendees', {activityid: parentid, ids: value}).then(res => {
        if (res) {
          console.log('removeAttendee', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          this.selectedChildren = selected.filter(s => !children.includes(s.AttendeeID))
          this.children = this.attendees.filter(s => !this.selectedChildren.includes(s))
          this.attendeeForm.checkedChildren = []
        }
        this.isLoading = false
      }).catch(err => {
        console.log('Fail to remove attendee', err)
        this.isLoading = false
      })
    },
    showSponsorForm: function (activity) {
      this.currentActivity = activity
      this.sponsorForm.selectedIDs = []
      this.isLoadingSponsors = true
      this.axios.post('/api/Services/baseservice.asmx/GetActivitySponsors', {activityid: activity.ActivityID}).then(res => {
        if (res) {
          console.log('GetActivitySponsors', res)
          this.selectedSponsors = []
          res.data.forEach(is => {
            let atte = this.sponsors.find(s => s.SponsorID === is.SponsorID)
            if (atte !== undefined) this.selectedSponsors.push(atte)
          })
          this.selectableSponsors = this.sponsors.filter(s => !this.selectedSponsors.includes(s))
          this.isLoadingSponsors = false
          this.sponsorFormVisible = true
        }
      }).catch(err => {
        console.log('GetActivitySponsors', err)
        this.isLoadingSponsors = false
      })
    },
    closeSponsor: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        done()
      }).catch(() => {})
    },
    selectSponsor: function () {
      let childids = this.sponsorForm.selectedIDs
      // if (childid === null) return
      childids.forEach(id => {
        let staff = this.sponsors.find(a => a.SponsorID === id)
        this.selectedSponsors.push(staff)
      })
      let inst = this.currentActivity
      let parentid = inst.ActivityID
      let ids = JSON.stringify(childids)
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/AddActivitySponsors', {activityid: parentid, ids: ids}).then(res => {
        if (res) {
          console.log('select staff', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
        }
        this.selectableSponsors = this.sponsors.filter(s => !this.selectedSponsors.includes(s))
        this.sponsorForm.selectedIDs = []
        this.sponsorForm.checkedChildren = []
        this.isLoading = false
      }).catch(err => {
        console.log('Fail to remove sponsors', err)
        this.isLoading = false
      })
    },
    removeSponsor: function () {
      let children = []
      let selected = this.selectedSponsors
      this.sponsorForm.checkedChildren.forEach(function (item) {
        let attendee = selected.find(a => a.Name === item)
        children.push(attendee.SponsorID)
      })
      let value = JSON.stringify(children)
      let node = this.currentActivity
      let parentid = node.ActivityID
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/RemoveActivitySponsors', {activityid: parentid, ids: value}).then(res => {
        if (res) {
          console.log('removeSponsors', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          this.selectedSponsors = selected.filter(s => !children.includes(s.SponsorID))
          this.selectableSponsors = this.sponsors.filter(s => !this.selectedSponsors.includes(s))
          this.attendeeForm.checkedChildren = []
        }
        this.isLoading = false
      }).catch(err => {
        console.log('Fail to remove removeSponsors', err)
        this.isLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
