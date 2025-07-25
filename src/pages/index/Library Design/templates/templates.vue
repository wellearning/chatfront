<!--
FileName: Library/templates/templates.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show template list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Templates for {{businessTypes[btypeId]}}</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading || isLoadingBlock">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name)" :loading="isLoading || isLoadingBlock" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingBlock" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingBlock" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Template ID" prop="TemplateID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Heat" prop="SequenceNo" min-width="100"></el-table-column>
        <el-table-column label="Title" prop="Title" min-width="300"></el-table-column>
        <el-table-column label="Province" prop="Province" min-width="200"></el-table-column>
        <el-table-column label="Status" prop="StatusID" :formatter="statusName" width="200"></el-table-column>
        <el-table-column v-if="btypeId === 1" label="NeedPinkSlip" prop="NeedPinkSlip"  :formatter="printPinkSlip" width="150"></el-table-column>
        <el-table-column v-if="btypeId === 2" label="Level" prop="ProducerLevel"  width="100"></el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row.TemplateID)" :loading="isLoading || isLoadingBlock" size="small">Edit</el-button>
            <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.TemplateID)" :loading="isLoading || isLoadingBlock" size="small">Delete</el-button>
            <el-button icon="el-icon-copy" type="" @click="duplicate(scope.row.TemplateID)" :loading="isLoading || isLoadingBlock" size="small">Duplicate</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Template" :visible.sync="addFormVisible" width="1000px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form choiceQuestionForm">
          <el-form-item label="Title" prop="Title">
            <el-input v-model="addForm.Title" clearable></el-input>
          </el-form-item>
          <el-form-item label="Type" prop="TypeID">
            <el-select v-model="addForm.TypeID" placeholder="" @change="showInsuranceCorp(addForm.TypeID)" no-data-text="No Record" filterable>
              <el-option v-for="item in typeIdList" :key="item.key" :label="item.value" :value="item.key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Status" prop="StatusID">
            <el-select v-model="addForm.StatusID" placeholder="Status" no-data-text="No Record" filterable>
              <el-option v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="btypeId === 1" label="Need Pink Slip">
            <el-checkbox v-model="addForm.NeedPinkSlip"></el-checkbox>
          </el-form-item>
          <el-form-item label="InsuranceCorp" prop="InsuranceCorpID" v-if = "insuranceCorpVisible">
            <el-select v-model="addForm.InsuranceCorpID" placeholder="InsuranceCorp" no-data-text="No Record" filterable>
              <el-option v-for="item in insuranceCorpList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Province" prop="Province">
            <el-select v-model="addForm.ProvinceID" placeholder="Province" no-data-text="No Record" filterable>
              <el-option v-for="item in provinceList" :key="item.ItemID" :label="item.Name" :value="item.ItemID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="btypeId === 2" label="ProducerLevel" prop="ProducerLevel" v-show="true">
            <el-radio-group v-model="addForm.ProducerLevel">
              <el-radio v-for="item in producerLevels" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <!--el-form-item label="Producer Level" v-if="btypeId === 2" prop="ProduceLevel">
            <el-select v-model="editForm.ProducerLevel" placeholder="" no-data-text="No Record" filterable>
              <el-option v-for="item in producerLevels" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item-->
          <div v-for="(item, index) in addForm.templateBlocks" :key="index" class="choice">
            <el-form-item class="marginLeft10">
              <span><b>{{item.BlockID + '. ' + item.BlockName + (item.ChildTypeID == 1?'(T)':'')}}</b></span>
            </el-form-item>
            <el-form-item class="marginLeft20">
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('addForm', index)" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-up" v-if="index !== 0" type="primary" @click="upChoice('addForm', index)" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-down" v-if="index !== addForm.templateBlocks.length - 1" type="primary" @click="downChoice('addForm', index)" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnGroup"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('addForm')" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnSingle">Block</el-button>
            <el-select v-model="currentBlock" placeholder="Block" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
              <el-option class="questionOption" v-for="item in blockList" :key="item.BlockID" :label="item.BlockID + '. ' + item.Name" :value="item.BlockID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice_t('addForm')" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnSingle">Template</el-button>
            <el-select v-model="currentTemplate" placeholder="Template" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
              <el-option class="questionOption" v-for="item in tempList" :key="item.TemplateID" :label="item.TemplateID + '. ' + item.Title" :value="item.TemplateID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading || isLoadingBlock">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="Edit Template" :visible.sync="editFormVisible" width="1000px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form choiceQuestionForm">
          <el-form-item label="Title" prop="Title">
            <el-input v-model="editForm.Title" clearable></el-input>
          </el-form-item>
          <el-form-item label="Type" prop="TypeID">
            <el-select v-model="editForm.TypeID" placeholder="Type" @change="showInsuranceCorp(editForm.TypeID)" no-data-text="No Record" filterable>
              <el-option v-for="item in typeIdList" :key="item.key" :label="item.value" :value="item.key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Status" prop="StatusID">
            <el-select v-model="editForm.StatusID" placeholder="Status" no-data-text="No Record" filterable>
              <el-option v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="btypeId === 1" label="Need Pink Slip">
            <el-checkbox v-model="editForm.NeedPinkSlip"></el-checkbox>
          </el-form-item>
          <el-form-item label="InsuranceCorp" prop="InsuranceCorpID" v-if = "insuranceCorpVisible">
            <el-select v-model="editForm.InsuranceCorpID" placeholder="InsuranceCorp" no-data-text="No Record" filterable>
              <el-option v-for="item in insuranceCorpList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Province" prop="Province">
            <el-select v-model="editForm.ProvinceID" placeholder="Province" no-data-text="No Record" filterable>
              <el-option v-for="item in provinceList" :key="item.ItemID" :label="item.Name" :value="item.ItemID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="btypeId === 2 || btypeId === 9" label="ProducerLevel" prop="ProducerLevel" v-show="true">
            <el-radio-group v-model="editForm.ProducerLevel">
              <el-radio v-for="item in producerLevels" :label="item.id" :key="item.id">
                <span>{{item.name}}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <!--el-form-item label="Producer Level" v-if="btypeId === 2" prop="ProduceLevel">
            <el-select v-model="editForm.ProducerLevel" placeholder="" no-data-text="No Record" filterable>
              <el-option v-for="item in producerLevels" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item-->
          <div v-for="(item, index) in editForm.templateBlocks" :key="index" class="choice">
            <el-form-item class="marginLeft10">
              <span><b>{{item.BlockID + '. ' + item.BlockName + (item.ChildTypeID == 1?'(T)':'')}}</b></span>
            </el-form-item>
            <el-form-item class="marginLeft20">
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('editForm', index)" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-up" v-if="index !== 0" type="primary" @click="upChoice('editForm', index)" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-down" v-if="index !== editForm.templateBlocks.length - 1" type="primary" @click="downChoice('editForm', index)" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnGroup"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('editForm')" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnSingle">Block</el-button>
            <el-select v-model="currentBlock" placeholder="Block" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
              <el-option class="questionOption" v-for="item in blockList" :key="item.BlockID" :label="item.BlockID + '. ' + item.Name" :value="item.BlockID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice_t('editForm')" :loading="isLoading || isLoadingBlock" plain size="small" class="questionRightBtnSingle">Templ</el-button>
            <el-select v-model="currentTemplate" placeholder="Template" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
              <el-option class="questionOption" v-for="item in tempList" :key="item.TemplateID" :label="item.TemplateID + '. ' + item.Title" :value="item.TemplateID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading || isLoadingBlock">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      btypeId: 1,
      businessTypes: ['', 'PL Memo', 'NB CoverLetter', 'IRCA Memo', 'CL Application'],
      isLoading: false,
      isLoadingBlock: false,
      isLoadingInsuranceCorpList: false,
      isLoadingProvinceList: false,
      blockList: [],
      currentBlock: null,
      currentTemplate: null,
      typeIdList: [{key: 1, value: 'Vehicle Template'}, {key: 2, value: 'Property Template'}],
      statusList: [{id: 0, name: 'Draft'}, {id: 1, name: 'Normal'}, {id: 2, name: 'Stopped'}],
      producerLevels: [{id: 0, name: 'Level 0'}, {id: 1, name: 'Level 1'}, {id: 2, name: 'Level 2'}],
      insuranceCorpList: [],
      provinceList: [],
      insuranceCorpVisible: false,
      // 新增
      addFormVisible: false,
      addForm: {
        TypeID: null,
        StatusID: 0,
        Title: null,
        InsuranceCorpID: 0,
        ProvinceID: 0,
        ProducerLevel: 1,
        NeedPinkSlip: false,
        templateBlocks: []
      },
      addFormRules: {
        Title: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        TypeID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ]
      },
      // 修改
      editFormVisible: false,
      editForm: {
        TemplateID: null,
        TypeID: null,
        StatusID: 0,
        Title: null,
        InsuranceCorpID: 0,
        ProvinceID: null,
        ProducerLevel: null,
        NeedPinkSlip: false,
        templateBlocks: [],
        IsNew: false
      },
      editFormRules: {
        Title: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        TypeID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ]
      },
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      // 列表
      tempList: [],
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
      this.btypeId = Number(parseInt(this.$route.params.id))
      // his.typeName = this.businessTypes[this.btypeId] + this.typeName
      this.search(null)
    }
  },
  mounted: function () {
    this.btypeId = Number(this.$route.params.id)
    // this.search(null)
    this.initTemplateTypes()
    this.initBlock()
    this.initProvinceList()
    this.initInsuranceCorpList()
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
    printPinkSlip (row, column) {
      if (row.NeedPinkSlip) {
        return 'True'
      } else {
        return 'False'
      }
    },
    // 查询保险公司
    initInsuranceCorpList: function () {
      this.isLoadingInsuranceCorpList = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps_all', {}).then(res => {
        if (res) {
          console.log('查询', res)
          this.insuranceCorpList = res.data
          this.search(null)
        }
        this.isLoadingInsuranceCorpList = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingInsuranceCorpList = false
      })
    },
    // 查询保险公司
    initProvinceList: function () {
      this.isLoadingProvinceList = true
      this.axios.post('/api/Services/baseservice.asmx/GetDictionary', {datatype: 'Province'}).then(res => {
        if (res) {
          console.log('查询', res)
          let all = [{ItemID: 0, Name: 'All Province'}]
          this.provinceList = [...all, ...res.data]
          // this.provinceList = res.data
          // this.search(null)
        }
        this.isLoadingProvinceList = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingProvinceList = false
      })
    },
    initTemplateTypes: function () {
      this.isLoadingProvinceList = true
      let service = '/api/Services/baseservice.asmx/GetEnumData'
      let para = {enumtype: 'InsuranceType'}
      if (this.btypeId === 4) para = {enumtype: 'TemplateType_CL'}
      this.axios.post(service, para).then(res => {
        if (res) {
          console.log('typeIdList', res)
          this.typeIdList = res.data
        }
        this.isLoadingProvinceList = false
      }).catch(err => {
        console.log('typeIdList error', err)
        this.isLoadingProvinceList = false
      })
    },

    // blocks列表
    initBlock: function () {
      this.isLoadingBlock = true
      this.axios.post('/api/Services/BaseService.asmx/SearchBlocks', {query: '', btypeid: this.btypeId}).then(res => {
        if (res) {
          console.log('blocks列表', res)
          this.blockList = res.data
          // 同一个template中，同一个block只能有一个
          if (this.addFormVisible) {
            this.blockList = this.blockList.filter(item => (this.addForm.templateBlocks.map(it => it.BlockID)).indexOf(item.BlockID) === -1)
          } else if (this.editFormVisible) {
            this.blockList = this.blockList.filter(item => (this.editForm.templateBlocks.map(it => it.BlockID)).indexOf(item.BlockID) === -1)
          }
        }
        this.isLoadingBlock = false
      }).catch(err => {
        console.log('blocks列表出错', err)
        this.isLoadingBlock = false
      })
    },
    // 添加一行
    addChoice: function (form) {
      if (this.currentBlock === null) {
        this.$message({
          type: 'warning',
          message: 'Please Select Block'
        })
      } else {
        if (form === 'addForm') {
          this.addForm.templateBlocks.push({BlockID: this.currentBlock, BlockName: this.blockList.find(it => it.BlockID === this.currentBlock).Name})
        } else if (form === 'editForm') {
          this.editForm.templateBlocks.push({BlockID: this.currentBlock, BlockName: this.blockList.find(it => it.BlockID === this.currentBlock).Name})
        }
        this.currentBlock = null
        this.initBlock()
      }
    },
    addChoice_t: function (form) {
      if (this.currentTemplate === null) {
        this.$message({
          type: 'warning',
          message: 'Please Select Template'
        })
      } else {
        if (form === 'addForm') {
          this.addForm.templateBlocks.push({ChildTypeID: 1, BlockID: this.currentTemplate, BlockName: this.tempList.find(it => it.TemplateID === this.currentTemplate).Title})
        } else if (form === 'editForm') {
          this.editForm.templateBlocks.push({ChildTypeID: 1, BlockID: this.currentTemplate, BlockName: this.tempList.find(it => it.TemplateID === this.currentTemplate).Title})
        }
        this.currentTemplate = null
        // this.initBlock()
      }
    },
    // 删除一行
    delChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.templateBlocks.splice(index, 1)
      } else if (form === 'editForm') {
        this.editForm.templateBlocks.splice(index, 1)
      }
      this.initBlock()
    },
    // 上移一行
    upChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.templateBlocks[index] = this.addForm.templateBlocks.splice(index - 1, 1, this.addForm.templateBlocks[index])[0]
      } else if (form === 'editForm') {
        this.editForm.templateBlocks[index] = this.editForm.templateBlocks.splice(index - 1, 1, this.editForm.templateBlocks[index])[0]
      }
    },
    // 下移一行
    downChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.templateBlocks[index] = this.addForm.templateBlocks.splice(index + 1, 1, this.addForm.templateBlocks[index])[0]
      } else if (form === 'editForm') {
        this.editForm.templateBlocks[index] = this.editForm.templateBlocks.splice(index + 1, 1, this.editForm.templateBlocks[index])[0]
      }
    },
    // 查询
    search: function (name) {
      this.isLoading = true
      // 后端不支持null查询，把null转换成''
      if (name === null) {
        this.searchName = ''
      } else {
        this.searchName = name
      }
      let corpList = this.insuranceCorpList
      this.axios.post('/api/Services/BaseService.asmx/SearchTemplates', {query: this.searchName, btypeid: this.btypeId}).then(res => {
        if (res) {
          console.log('SearchTemplates', res)
          res.data.forEach(function (temp) {
            let corp = corpList.find(c => c.InsuranceCorpID === temp.InsuranceCorpID)
            if (corp !== undefined) {
              temp.CorpName = corp.ShortName
            } else temp.CorpName = ''
          })
          this.list = res.data
          if (this.tempList.length === 0) {
            this.tempList = res.data
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
    // 显示新增弹窗
    showAdd: function () {
      this.addFormVisible = true
    },
    showInsuranceCorp: function (typeid) {
      if (typeid === 1 && this.btypeId !== 4) this.insuranceCorpVisible = true
      else this.insuranceCorpVisible = false
    },
    // 隐藏新增弹窗
    closeAdd: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$refs['addForm'].resetFields()
        this.addForm.templateBlocks = []
        this.currentBlock = null
        done()
      }).catch(() => {})
    },
    // 新增
    add: function () {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          // 按顺序添加SequenceNo
          for (let i = 0; i < this.addForm.templateBlocks.length; i++) {
            this.addForm.templateBlocks[i].SequenceNo = i + 1
          }
          let value = JSON.stringify(this.addForm)
          this.axios.post('/api/Services/BaseService.asmx/SaveTemplate', {template: value, btypeid: this.btypeId}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addForm.templateBlocks = []
              this.currentBlock = null
              this.addFormVisible = false
              // 如果新增记录符合查询条件，将新增的记录添加到数组最后，总数加1
              if (this.searchName === null || (this.searchName !== null && res.data.Title.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)) {
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
    },
    // 修改弹窗
    showEdit: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetTemplate', {templateid: id}).then(res => {
        if (res) {
          console.log('GetTemplate', res)
          this.editFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.editForm = res.data
            this.showInsuranceCorp(this.editForm.TypeID)
            if (this.editForm.templateBlocks !== null && this.editForm.templateBlocks.length > 0) {
              this.editForm.templateBlocks = this.editForm.templateBlocks.slice().sort((a, b) => { return a.SequenceNo - b.SequenceNo })
              this.initBlock()
            }
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
        this.editForm.templateBlocks = []
        this.currentBlock = null
        done()
      }).catch(() => {})
    },
    // 修改
    edit: function () {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          // 按顺序添加SequenceNo
          for (let i = 0; i < this.editForm.templateBlocks.length; i++) {
            this.editForm.templateBlocks[i].SequenceNo = i + 1
          }
          this.axios.post('/api/Services/BaseService.asmx/SaveTemplate', {template: JSON.stringify(this.editForm), btypeid: this.btypeId}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['editForm'].resetFields()
              this.editForm.templateBlocks = []
              this.currentBlock = null
              this.editFormVisible = false
              // 如果修改记录符合查询条件，更新该记录；如果不符合，删除该记录，总数减1
              if (this.searchName === null || (this.searchName !== null && res.data.Title.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)) {
                this.list = this.list.map(item => { return item.TemplateID === res.data.TemplateID ? res.data : item })
              } else {
                this.list = this.list.filter(item => item.TemplateID !== res.data.TemplateID)
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
    // 删除
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/BaseService.asmx/RemoveTemplate', {templateid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.TemplateID !== id)
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

    setCorpName: function (temp) {
      let corp = this.insuranceCorpList.find(c => c.InsuranceCorpID === temp.InsuranceCorpID)
      if (corp !== undefined) {
        temp.CorpName = corp.ShortName
      } else temp.CorpName = ''
    },

    duplicate: function (id) {
      this.$confirm('Are you sure to duplicate it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/BaseService.asmx/DuplicateTemplate', {templateid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.setCorpName(res.data)
            this.list.push(res.data)
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
    }
  }
}
</script>

<style scoped>

</style>
