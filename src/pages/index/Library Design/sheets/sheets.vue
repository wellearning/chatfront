<!--
FileName: Library/sheets/sheets.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show sheet list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Forms for {{businessTypes[btypeId]}}</span>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item>
            <el-select v-model="templateId" @change="templateChange" placeholder="Please Select" filterable clearable>
              <el-option v-for="item in templates" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading">New</el-button>
            <el-button icon="el-icon-plus" type="primary" @click="showEditCsio()" :loading="isLoading">New COIForm</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name)" :loading="isLoading" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="ID" prop="SheetID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Title" prop="Title" min-width="300"></el-table-column>
        <el-table-column label="Template" prop="TemplateTitle" min-width="200"></el-table-column>
        <el-table-column label="Status" prop="StatusID" :formatter="statusName" width="100"></el-table-column>
        <el-table-column label="Type" prop="TypeID" :formatter="typeName" width="100"></el-table-column>
        <el-table-column label="Action" width="500" fixed="right">
          <template v-slot="scope">
            <el-button icon="el-icon-view" type="primary" @click="showView(scope.row)" :loading="isLoading" size="small">View</el-button>
            <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row)" :loading="isLoading" size="small">Edit</el-button>
            <el-button icon="el-icon-upload" type="primary" @click="publish(scope.row)" :loading="isLoading" size="small">{{scope.row.StatusID === 0?'Publish':'Draft'}}</el-button>
            <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.SheetID)" :loading="isLoading" size="small">Delete</el-button>
            <el-button icon="el-icon-copy" type="" @click="duplicate(scope.row.SheetID)" :loading="isLoading" size="small">Duplicate</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------查阅弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewFormVisible" width="1184.56px" center :before-close="closeView">
        <ViewSheet ref="vs" :sheetId="currentId" ></ViewSheet>
      </el-dialog>
      <!----------------------------------------------查阅弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="Edit Form" :visible.sync="editFormVisible" width="1184.56px" height="5000px" center :before-close="closeEdit">
        <EditSheet ref="es" :sheetId="currentId" :templateId="templateId" :businessTypeId="btypeId" @close="closeSheet"></EditSheet>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Form" :visible.sync="addFormVisible" width="1184.56px" center :before-close="closeAdd">
        <EditSheet ref="as" :sheetId="0" :templateId="templateId" :businessTypeId="btypeId" @close="closeAdd"></EditSheet>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog :title="csioFormName" :visible.sync="editCSIOVisible" width="1184.56px" center :before-close="closeAdd">
        <EditCSIO ref="anc" :sheetId="currentId" :businessTypeId="btypeId" @close="closeAdd"></EditCSIO>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import ViewSheet from '@/component/window/sheet'
import EditSheet from '@/component/window/editSheet'
import EditCSIO from '@/component/window/editCSIO'

export default {
  components: {
    ViewSheet,
    EditSheet,
    EditCSIO
  },
  data: function () {
    return {
      btypeId: 1,
      businessTypes: ['', 'PL Memo', 'NB CoverLetter', 'IRCA Memo', 'CL Application'],
      templates: [],
      csioTypes: [],
      template: null,
      templateId: null,
      isLoading: false,
      viewFormVisible: false,
      addFormVisible: false,
      editFormVisible: false,
      editCSIOVisible: false,
      csioFormName: 'Add New CSIO',
      currentId: null,
      currentSheet: null,
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      // 列表
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  watch: {
    $route (to, from) {
      console.log(to.params.id)
      this.btypeId = parseInt(this.$route.params.id)
      // his.typeName = this.businessTypes[this.btypeId] + this.typeName
      this.search(null)
    }
  },
  mounted: function () {
    this.btypeId = Number(this.$route.params.id)
    this.loadCsioTypes()
    // this.search(null)
    this.loadTemplates()
  },
  methods: {
    statusName (row, column) {
      if (row.StatusID === 0) {
        return 'Draft'
      } else if (row.StatusID === 1) {
        return 'Normal'
      } else {
        return 'Stopped'
      }
    },
    typeName (row, column) {
      if (row.TypeID === 0) {
        return 'Form'
      } else if (row.TypeID === 1) {
        return 'Note'
      } else if (row.TypeID === 2) {
        return 'CSIO'
      } else {
        return 'Stopped'
      }
    },
    // 这是针对类型为CSIO的数据
    loadCsioTypes: function () {
      this.isLoadingCsioTypes = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'CsioType'}).then(res => {
        if (res) {
          console.log('CsioTypes', res)
          this.csioTypes = res.data
        }
        this.isLoadingCsioTypes = false
      }).catch(err => {
        console.log('loadCsioTypes error', err)
        this.isLoadingCsioTypes = false
      })
    },
    // 加载Templates
    loadTemplates: function () {
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetTemplatesByBusinessType', {btypeid: this.btypeId}).then(res => {
        if (res) {
          console.log('load templates', res)
          this.templates = res.data
        }
        this.search()
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    templateChange: function () {
      this.template = this.templates.find(t => t.TemplateID === this.templateId)
    },
    // 查询
    search: function (name) {
      this.isLoading = true
      let templates = this.templates
      let csioTypes = this.csioTypes
      this.axios.post('/api/Services/BaseService.asmx/GetSheetsByBusinessType', {typeid: this.btypeId}).then(res => {
        if (res) {
          console.log('查询', res)
          res.data.forEach(function (sheet) {
            if (sheet.TypeID === 2) { // CSIO type
              let csiotype = csioTypes.find(c => c.key === sheet.TemplateID)
              if (csiotype !== undefined) sheet.TemplateTitle = csiotype.value
              else sheet.TemplateTitle = ''
            } else {
              let template = templates.find(c => c.TemplateID === sheet.TemplateID)
              if (template !== undefined) {
                sheet.TemplateTitle = template.Title
              } else sheet.TemplateTitle = ''
            }
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
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search(null)
    },
    // 显示新增弹窗
    showAdd: function () {
      if (this.templateId === null) return
      this.currentSheet = {
        BusinessTypeID: this.btypeId,
        TemplateID: this.templateId
      }
      this.addFormVisible = true
      if (this.$refs.as !== undefined) {
        this.$refs.as.createSheet(0)
        // this.$refs.as.loadTemplateQuestion(this.templateId)
      }
    },
    // 隐藏新增弹窗
    closeAdd: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.addFormVisible = false
        this.search()
        done()
      }).catch(() => {})
    },
    closeSheet: function () {
    },
    // 修改弹窗
    showEdit: function (sheet) {
      if (sheet.TypeID === 2) {
        this.showEditCsio(sheet)
        return
      }
      this.currentId = sheet.SheetID
      this.templateId = sheet.TemplateID
      this.editFormVisible = true
      if (this.$refs.es !== undefined) {
        this.$refs.es.createSheet(sheet.SheetID, sheet.TemplateID)
        this.$refs.es.loadTemplateQuestion(sheet.TemplateID)
        this.$refs.es.loadSheetContent(this.currentId)
      }
    },
    showEditCsio: function (sheet) {
      if (sheet !== undefined) {
        this.currentId = sheet.SheetID
        this.templateId = sheet.TemplateID
        this.csioFormName = 'Edit CSIO: ' + sheet.SheetID
      } else {
        /*
        if (this.templateId === null) {
          this.$message({
            type: 'warning',
            message: 'Please select a template'
          })
          return
        }
        */
        this.currentId = 0
        this.csioFormName = 'Add New CSIO:'
      }
      this.editCSIOVisible = true
      if (this.$refs.anc !== undefined) {
        this.$refs.anc.createSheet(this.currentId)
        // this.$refs.anc.loadTemplateQuestion(this.templateId)
        // this.$refs.anc.loadBusinessQuestion(this.btypeId)
        this.$refs.anc.loadSheetContent(this.currentId)
      }
    },
    publish: function (sheet) {
      let id = sheet.SheetID
      this.$confirm('Are you sure to change the status of the form?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/BaseService.asmx/SwitchStatus', {itemtype: 'Sheet', itemid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            sheet.StatusID = res.data
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
    showView: function (sheet) {
      this.currentId = sheet.SheetID
      this.templateId = sheet.TemplateID
      this.viewFormVisible = true
      if (this.$refs.vs !== undefined) {
        // this.$refs.as.createNewSheet()
        this.$refs.vs.loadSheet(this.currentId)
      }
    },
    // 关闭修改
    closeView: function (done) {
      done()
    },
    // 关闭修改
    closeEdit: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.editFormVisible = false
        this.search()
        done()
      }).catch(() => {})
    },
    // 删除
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/BaseService.asmx/RemoveSheet', {sheetid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.SheetID !== id)
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

    setTemplateName: function (sheet) {
      let temp = this.templates.find(c => c.TemplateID === sheet.TemplateID)
      if (temp !== undefined) {
        sheet.TemplateTitle = temp.Title
      } else temp.TemplateTitle = ''
    },

    duplicate: function (id) {
      this.$confirm('Are you sure to duplicate it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/BaseService.asmx/DuplicateSheet', {sheetid: id}).then(res => {
          if (res) {
            console.log('复制Sheet', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.setTemplateName(res.data)
            this.list.push(res.data)
            this.total = this.list.length
          }
          this.isLoading = false
        }).catch(err => {
          console.log('复制出错', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
