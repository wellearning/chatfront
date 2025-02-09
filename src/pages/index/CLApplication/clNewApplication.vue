<!--
FileName: clNewApplication.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Create new commercial application.
-->
<template>
  <div v-loading="isLoading || isLoadingTemplates" element-loading-background="rgba(0, 0, 0, 0)">
    <EditDirectionBlock v-if="isDirecting" :busiTypeID=4 @directReady="directReady"></EditDirectionBlock>
    <div v-else>
      <el-form :model="applicationForm" ref="applicationForm" class="newMemo" :rules="applicationFormRules">
        <el-row :gutter="20" class="title">
          <el-col :span="6">&#12288;</el-col>
          <el-col :span="12">
            <el-form-item prop="Title">
              <el-input v-model="applicationForm.Title" placeholder="Title" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">&#12288;</el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="6">
            <el-form-item label="Effective Date" prop="EffectiveDate">
              <el-date-picker v-model="EffectiveDate" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Client Code" prop="ClientCode">
              <el-input v-model="applicationForm.ClientCode" placeholder="Client Code" title=""></el-input>
              <!--el-autocomplete v-model="applicationForm.ClientCode" placeholder="Client Code" style="width:100%"
                               :fetch-suggestions="querySearch" @select="handleSelect" :trigger-on-focus="false"
                               value-key="ClientCode"
              ></el-autocomplete-->
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="Producer" prop="ProducerID">
              <el-select v-model="applicationForm.ProducerID" placeholder="Producer" no-data-text="No Record" filterable>
                <el-option v-for="item in producerList" :key="item.StaffID" :label="item.Name" :value="item.StaffID"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="ApplicationTemplate" prop="TemplateID">
              <el-select v-model="applicationForm.TemplateID" placeholder="Application Type" no-data-text="No Record" filterable @change="changeTemplates()">
                <el-option v-for="item in templateList" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!--el-row :gutter="20" class="subtitle" v-if="showMore">
          <el-col :span="7">
            <el-form-item label="Applicant" prop="NameInsured">
              <el-input v-model="applicationForm.NameInsured" placeholder="Last, First Name or Business Name" title="Last Name, First Name or Business Name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Owner/Principal" prop="PersonContact">
              <el-input v-model="applicationForm.PersonContact" placeholder="Last name, First name" title=""></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="Phone" prop="PhoneNumber">
              <el-input v-model="applicationForm.PhoneNumber" placeholder="" title=""></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="DOB" prop="DateOfBirth">
              <el-date-picker v-model="applicationForm.DateOfBirth" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="Email" prop="Email">
              <el-input v-model="applicationForm.Email" placeholder="" title=""></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="subtitle" v-if="showMore">
          <el-col :span="7">
            <el-form-item label="Mailing Address" prop="Address">
              <el-input v-model="applicationForm.Address" placeholder="Street No" title=""></el-input>
              <el-autocomplete v-model="applicationForm.Address" placeholder="Mailling Address" style="width:100%"
                               :fetch-suggestions="querySearchAddress" @select="handleSelectAddress" :trigger-on-focus="false"
                               value-key="Address"
              ></el-autocomplete>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="City" prop="City">
              <el-input v-model="applicationForm.City" placeholder="City" title=""></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="Province" prop="Province">
              <el-input v-model="applicationForm.Province" placeholder="" title=""></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="PostCode" prop="PostCode">
              <el-input v-model="applicationForm.PostCode" placeholder="" title=""></el-input>
            </el-form-item>
          </el-col>
        </el-row-->
      </el-form>
      <div class="newMemo-submit">
        <el-button icon="el-icon-check" type="primary" @click="beginToAnswer()" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="!isAnswering" :disabled="applicationForm.TemplateID === null">Start</el-button>
        <!--el-button icon="el-icon-view" type="primary" plain v-if="!showMore" @click="showMoreInfo()">Show More</el-button>
        <el-button icon="el-icon-hide" type="primary" plain v-if="showMore" @click="hideMoreInfo()">Hide More</el-button-->
        <el-button icon="el-icon-hide" type="primary" plain v-if="showMore" @click="reset()">Reset</el-button>
      </div>
      <EditApplicationBody v-if="isAnswering" :applicTemplate="applicationForm.applicationTemplate" @checkOver="checkOver()"></EditApplicationBody>
      <div class="newMemo-submit">
        <el-button tabindex="0" icon="el-icon-check" type="primary" @click="submit('save')" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="isAnswering">Save</el-button>
        <el-button icon="el-icon-check" type="primary" @click="submit('finish')" :loading="isLoading || isLoadingTemplates || isLoadingInsuranceCompany" v-if="isAnswering && applicationForm.StatusID === 1">Finish</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import EditDirectionBlock from '@/component/parts/editDirectionBlock'
import EditApplicationBody from '@/component/parts/editApplicationTemplate'
import moment from 'moment'
import {isNumeric} from 'echarts/lib/util/number'

export default {
  components: {
    EditDirectionBlock,
    EditApplicationBody
  },
  data: function () {
    return {
      isDirecting: true,
      showMore: false,
      EffectiveDate: null,
      isAnswering: false,
      isLoading: false,
      isLoadingTemplates: false,
      isLoadingInsuranceCompany: false,
      isLoadingProducer: false,
      isLoadingClients: false,
      isLoadingBlockQuestions: false,
      applicationForm: {
        BusinessTypeID: 4,
        Title: null,
        // EffectiveDate: null,
        ClientCode: '',
        Address: '',
        City: '',
        Province: 'ON',
        PostCode: '',
        PersonContact: '',
        DateOfBirth: null,
        PhoneNumber: '',
        Email: '',
        StatusID: 0,
        ProducerID: JSON.parse(this.$store.getters.getAccount).StaffID,
        RequestDate: moment(new Date()),
        NameInsured: null,
        TemplateID: null,
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        Author: JSON.parse(this.$store.getters.getAccount).Name,
        corp: null,
        applicationTemplate: null
        // applicationTemplates: []
      },
      applicationFormRules: {
        Title: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        EffectiveDate: [
          { required: false, message: 'Please Select', trigger: 'blur' }
        ],
        DateOfBirth: [
          { required: false, message: 'Please Select', trigger: 'blur' }
        ],
        ClientCode: [
          { required: false, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        ProducerID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        TemplateID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        NameInsured: [
          { required: false, message: 'Please Enter', trigger: 'blur' }
        ]
      },
      TemplateTypeID: 2,
      templateList: [],
      currentTemplateID: null,
      currentTemplate: null,
      currentTemplates: [],
      insuranceCompanyList: [],
      producerList: [],
      clients: [],
      clientCount: 0,
      blockQuestions: [],
      properties: [],
      directionBlock: null
    }
  },
  mounted: function () {
    // this.loadClients(0)
    this.initTemplates()
    this.initInsuranceCompany()
    this.initProducers()
    // this.getMakerList()
  },
  watch: {
  },
  methods: {
    querySearch: function (queryString, cb) {
      let clients = this.clients
      let results = queryString ? clients.filter(this.createFilter(queryString)) : clients
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter: function (queryString) {
      return (client) => {
        return (client.ClientCode.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    handleSelect: function (item) {
      console.log(item)
      this.applicationForm.Address = item.Address
      this.applicationForm.City = item.City
      this.applicationForm.Province = item.Province
      this.applicationForm.PersonContact = item.Contactor
      this.applicationForm.NameInsured = item.NameAuto
      this.applicationForm.PhoneNumber = item.PhoneNumber
      this.applicationForm.PostCode = item.PostCode
      this.applicationForm.Email = item.Email
      let dob = moment(item.DateOfBirth)
      this.applicationForm.DateOfBirth = dob.format('YYYY-MM-DD')
    },
    querySearchAddress: function (queryString, cb) {
      let clients = this.clients.filter(c => c.Address !== null)
      let results = queryString ? clients.filter(this.createFilterAdderss(queryString)) : clients
      // 调用 callback 返回建议列表的数据
      if (results.length > 0) this.setAddress(results[0])
      else this.setAddress()
      cb(results)
    },
    createFilterAdderss: function (queryString) {
      let words = queryString.split(' ')
      words = words.filter(w => !isNumeric(w) && w !== '')
      return (client) => {
        if (words.length === 0) return false
        let result = true
        let cwords = client.Address.split(' ')
        cwords = cwords.filter(w => !isNumeric(w))
        words.forEach(word => {
          if (!result) return
          let cword = cwords.find(cw => cw.toLowerCase().indexOf(word.toLowerCase()) === 0)
          if (cword === undefined) result = false
        })
        return result
      }
    },
    handleSelectAddress: function (item) {
      this.setAddress(item)
    },
    setAddress: function (item) {
      if (item !== undefined) {
        this.applicationForm.City = item.City
        this.applicationForm.Province = item.Province
        this.applicationForm.PostCode = item.PostCode
      } else {
        this.applicationForm.City = ''
        this.applicationForm.Province = ''
        this.applicationForm.PostCode = ''
      }
    },
    reset: function () {
      this.applicationForm.ClientCode = ''
      this.applicationForm.Address = ''
      this.applicationForm.City = ''
      this.applicationForm.Province = 'ON'
      this.applicationForm.PostCode = ''
      this.applicationForm.PersonContact = ''
      this.applicationForm.DateOfBirth = null
      this.applicationForm.PhoneNumber = ''
      this.applicationForm.Email = ''
    },
    showMoreInfo: function () { this.showMore = true },
    hideMoreInfo: function () { this.showMore = false },
    directReady: function (templateid) {
      if (templateid !== undefined) this.applicationForm.TemplateID = templateid
      this.changeTemplates()
      this.isDirecting = false
    },
    loadBlockQuestions: function () {
      this.isLoadingBlockQuestions = true
      this.axios.post('/api/Services/BaseService.asmx/GetBlockQuestionsByTemplate', {templateid: this.applicationForm.TemplateID}).then(res => {
        if (res) {
          console.log('BlockQuestions', res)
          this.blockQuestions = res.data
          if (!this.isLoading) this.matchAnswerBlockQuestion()
        }
        this.isLoadingBlockQuestions = false
      }).catch(err => {
        console.log('loadBlockQuestions出错', err)
        this.isLoadingBlockQuestions = false
      })
    },
    loadApplicationTemplate: function (templateid, start) {
      this.axios.post('/api/Services/CommerceService.asmx/GetNewApplicationTemplateShell', {templateid: templateid}).then(res => {
        if (res) {
          console.log('GetNewApplicationTemplateShell', res)
          let ctemplate = res.data
          this.applicationForm.applicationTemplate = ctemplate
          this.isAnswering = true
          this.isLoading = false
          // this.applicationForm.applicationTemplates.push(ctemplate)
          // this.currentTemplate.templateBlocks.forEach(tb => {
          // let start = tb.BlockID === this.currentTemplate.templateBlocks[0].BlockID
          // this.loadApplicationBlock(tb.TemplateBlockID, start)
          // })
        }
      }).catch(err => {
        console.log('GetNewApplicationTemplateShell列表出错', err)
        this.isLoading = false
      })
    },
    // Templates列表
    initTemplates: function () {
      this.isLoadingTemplates = true
      this.axios.post('/api/Services/BaseService.asmx/GetTemplatesByBusinessType', {btypeid: 4}).then(res => {
        if (res) {
          console.log('Templates列表', res)
          this.templateList = res.data
        }
        this.isLoadingTemplates = false
      }).catch(err => {
        console.log('Templates列表出错', err)
        this.isLoadingTemplates = false
      })
    },
    loadClients: function (start) {
      this.isLoadingProducers = true
      this.axios.post('/api/Services/baseservice.asmx/GetBusinessLineClients', {businesslineid: 2, start: start}).then(res => {
        if (res) {
          console.log('clients', res)
          if (start === 0) {
            this.clientCount = res.count
            this.clients = res.data
          } else {
            this.clients = this.clients.concat(res.data)
          }
          if (this.clients.length < this.clientCount) {
            this.loadClients(this.clients.length)
          } else {
            this.isLoadingClients = false
          }
        }
      }).catch(err => {
        console.log('clients', err)
        this.isLoadingClients = false
      })
    },

    // 初始化保险公司列表
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorpsByBusinessLine', {lineid: 2}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          this.insuranceCompanyList = res.data.filter(c => c.BusinessLineID !== 1)
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // 初始化Producer列表
    initProducers: function () {
      this.isLoadingProducer = true
      this.axios.post('/api/Services/baseservice.asmx/GetProducers', {}).then(res => {
        if (res) {
          console.log('Producer列表', res)
          this.producerList = res.data
        }
        this.isLoadingProducer = false
      }).catch(err => {
        console.log('producer列表出错', err)
        this.isLoadingProducer = false
      })
    },
    // 重置Memo
    clearApplication: function () {
      this.isAnswering = false
      this.applicationForm.StatusID = 0
      this.applicationForm.applicationTemplate = null
      // this.currentTemplates = []
      this.totalQuestionNum = 1
    },
    // 选择EffectiveDate
    changeEffectiveDate: function (date) {
      // 获取变量值，用于之后回答时routing比对
      this.EffectiveDate = moment(date).format('YYYY-MM-DD')
    },
    // 选择保险公司
    changeInsuranceCompany: function () {
      if (this.isAnswering) this.clearApplication()
    },
    // 选择Templates
    changeTemplates: function () {
      if (this.isAnswering) this.clearApplication()
      this.currentTemplate = this.templateList.find(item => item.TemplateID === this.applicationForm.TemplateID)
      if (this.currentTemplate !== undefined) this.applicationForm.Title = this.currentTemplate.Title
    },
    // 开始回答
    beginToAnswer: function () {
      this.isLoading = true
      // this.loadBlockQuestions()
      this.loadApplicationTemplate(this.applicationForm.TemplateID)
    },
    checkOver: function () {
      if (this.applicationForm.applicationTemplate.StatusID === 1) this.applicationForm.StatusID = 1
      else this.applicationForm.StatusID = 0
    },
    // 提交
    submit: function (type) {
      this.$refs['applicationForm'].validate((valid) => {
        if (valid) {
          let application = JSON.parse(JSON.stringify(this.applicationForm))
          if (this.EffectiveDate !== null) application.EffectiveDate = this.EffectiveDate
          if (application.DateOfBirth === null) application.DateOfBirth = new Date(2000, 1, 1)
          application.BindTime = moment(application.BindTime)
          application.InsuranceTypeID = this.TemplateTypeID
          application.BusinessTypeID = 4
          let sequenceno = 0
          let template = application.applicationTemplate
          template.blockQuestions = null
          template.templateBlocks = null
          template.SequenceNo = sequenceno
          sequenceno++
          let appBlocks = []
          template.applicationBlocks.forEach(block => {
            block.answers.forEach(answer => {
              answer.blockQuestion = null
              answer.QuestionDesc = ''
              if (answer.TypeID === 6) answer.optionAnswers = null
              else if (answer.TypeID === 7) {
                answer.optionAnswers = answer.optionAnswers.filter(oa => { return oa.IsChecked })
              }
            })
            let ablock = JSON.parse(JSON.stringify(block))
            ablock.answers = undefined
            appBlocks.push(ablock)
          })
          if (type === 'save' || (type === 'finish')) {
            // console.log('提交问题', form)
            this.isLoading = true
            this.saveBlockCount = application.applicationTemplate.applicationBlocks.length
            this.saveBlockIndex = 0
            let ablocks = application.applicationTemplate.applicationBlocks
            application.applicationTemplate.applicationBlocks = appBlocks
            let value = JSON.stringify(application)
            console.log('the length of Application', value.length)
            this.axios.post('/api/Services/CommerceService.asmx/SaveApplication', {application: value}).then(res => {
              if (res) {
                console.log('修改', res)
                ablocks.forEach(aBlock => {
                  aBlock.ApplicationTemplateID = res.data.applicationTemplate.ApplicationTemplateID
                  this.saveApplicationBlock(aBlock)
                })
                this.$refs['applicationForm'].resetFields()
                this.currentTemplates = []
                this.applicationFormVisible = false
                if (type === 'finish') {
                  // this.$store.state.ApplicationID = res.data.ApplicationID
                }
                this.$router.push({path: '/clMyApplications'})
              }
              this.isLoading = false
            }).catch(err => {
              console.log('保存出错', err)
              this.isLoading = false
            })
          } else {
            this.$message({
              type: 'warning',
              message: 'Please Answer All Questions'
            })
          }
        } else {
          this.$message({
            type: 'error',
            message: 'Format Error'
          })
        }
      })
    },
    saveApplicationBlock: function (ablock) {
      let value = JSON.stringify(ablock)
      console.log('SaveApplicationBlock', ablock)
      this.axios.post('/api/Services/CommerceService.asmx/SaveApplicationBlock', {applicationblock: value}).then(res => {
        if (res) {
          console.log('saveApplicationBlock', res)
        }
        this.saveBlockIndex++
        if (this.saveBlockIndex === this.saveBlockCount) {
          this.isLoading = false
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
        }
      }).catch(err => {
        console.log('修改出错', err)
        this.$message({
          type: 'error',
          message: 'Operation failed'
        })
        this.isLoading = false
      })
    }

  }
}
</script>

<style scoped>

</style>
