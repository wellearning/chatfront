<template>
  <div>
    <div style="max-height:800px; overflow: auto; ">
      <el-form :model="applicationForm" ref="applicationForm" class="newMemo" :rules="applicationFormRules">
        <el-row :gutter="20" class="title">
          <el-col :span="6">&#12288;</el-col>
          <el-col :span="12">
            <el-form-item prop="Title">
              <el-input v-model="applicationForm.Title" placeholder="Title"></el-input>
            </el-form-item>
          </el-col>
          <!--el-col :span="6">&#12288;
            <el-button icon="el-icon-view" type="primary" plain v-if="!showMore" @click="showMoreInfo()">Show More</el-button>
            <el-button icon="el-icon-hide" type="primary" plain v-if="showMore" @click="hideMoreInfo()">Hide More</el-button>
            <el-button-- icon="el-icon-hide" type="primary" plain v-if="showMore" @click="reset()">Reset</el-button>
          </el-col-->
        </el-row>
        <el-row :gutter="20" class="subtitle">
          <el-col :span="7">
            <el-form-item label="Effective Date" prop="EffectiveDate">
              <el-date-picker v-model="EffectiveDate" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Client Code" prop="ClientCode">
              <el-input v-model="applicationForm.ClientCode" placeholder="Client Code" title=""></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="Producer" prop="ProducerID">
              <el-select v-model="applicationForm.ProducerID" placeholder="Producer" no-data-text="No Record" filterable>
                <el-option v-for="item in producerList" :key="item.StaffID" :label="item.Name" :value="item.StaffID"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Application" prop="Templates">
              <el-select v-model="currentTemplateID" placeholder="Application Type" no-data-text="No Record" filterable collapse-tags @change="changeTemplates()">
                <el-option v-for="item in templateList" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!--el-row :gutter="20" v-if="showMore" class="subtitle">
          <el-col :span="7">
            <el-form-item label="Applicant" prop="NameInsured">
              <el-input v-model="applicationForm.NameInsured" placeholder="last, first or business name" title="Last Name, First Name or Business Name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Owner/Principal" prop="PersonContact">
              <el-input v-model="applicationForm.PersonContact" placeholder="last name, first name" title=""></el-input>
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
        <el-row :gutter="20" v-if="showMore" class="subtitle">
          <el-col :span="7">
            <el-form-item label="Mailing Address" prop="Address">
              <el-input v-model="applicationForm.Address" placeholder="Street No" title=""></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="City" prop="City">
              <el-input v-model="applicationForm.City" placeholder="" title=""></el-input>
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
      <EditApplicationBody v-if="isAnswering" ref="eat"  :applicTemplate="applicationForm.applicationTemplate" @checkOver="checkOver()" :disabled="false"></EditApplicationBody>
    </div>
    <div v-if="isAnswering" class="newMemo-submit">
      <el-button icon="el-icon-check" type="primary" @click="submit('save')" :loading="isLoading">Save</el-button>
      <el-button icon="el-icon-check" type="primary" @click="submit('finish')" :loading="isLoading" v-if="applicationForm.StatusID === 1">Finish</el-button>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import EditApplicationBody from '@/component/parts/editApplicationTemplate'

export default {
  components: {
    EditApplicationBody
  },
  name: 'editApplication',
  data: function () {
    return {
      RoleName: JSON.parse(this.$store.getters.getAccount).RoleName,
      EffectiveDate: null,
      printDate: null,
      showMore: false,
      isLoading: false,
      loadingCount: 0,
      isLoadingProducer: false,
      application: null,
      insuranceCompanyList: [],
      // templatesList: [],
      currentTemplates: [],
      currentTemplateID: null,
      producerList: [],
      isAnswering: false,
      applicationForm: {
        ApplicationID: null,
        Title: '',
        ClientCode: null,
        Address: '',
        City: '',
        Province: 'On',
        PostCode: '',
        EffectiveDate: null,
        PersonContact: null,
        PhoneNumber: null,
        Email: null,
        StatusID: 0,
        RequestDate: moment(new Date()),
        DateOfBirth: new Date(),
        ProducerID: JSON.parse(this.$store.getters.getAccount).StaffID,
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        applicationTemplate: null,
        Templates: null
      },
      applicationFormRules: {
        Title: [
          { required: false, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        ProducerID: [
          { required: false, message: 'Please Select', trigger: 'blur' }
        ],
        ClientCode: [
          { required: false, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        TemplateType: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ]
      }
    }
  },
  props: {
    applicationid: {
      type: Number
    },
    insuranceCorps: {
      type: Array
    },
    templateList: {
      type: Array
    },
    applicationFormVisible: {type: Boolean}
  },
  mounted: function () {
    this.initProducers()
    this.loadApplication(this.applicationid)
    console.log('TemplateList', this.templateList)
  },
  methods: {
    reset: function () {
      this.applicationForm.ClientCode = this.application.ClientCode
      this.applicationForm.Address = this.application.Address
      this.applicationForm.City = this.application.City
      this.applicationForm.Province = this.application.Province
      this.applicationForm.PostCode = this.application.PostCode
      this.applicationForm.PersonContact = this.application.PersonContact
      this.applicationForm.DateOfBirth = this.application.DateOfBirth
      this.applicationForm.PhoneNumber = this.application.PhoneNumber
      this.applicationForm.Email = this.application.Email
    },
    showMoreInfo: function () { this.showMore = true },
    hideMoreInfo: function () { this.showMore = false },
    // 重置Memo
    clearApplication: function () {
      this.isAnswering = false
      this.applicationForm.StatusID = 0
      this.applicationForm.applicationTemplate = null
      this.currentTemplates = []
      this.totalQuestionNum = 1
    },
    // 选择Templates
    changeTemplates: function () {
      if (this.isAnswering) this.clearApplication()
      this.loadApplicationTemplate(this.currentTemplateID)
      let template = this.templateList.find(item => item.TemplateID === this.currentTemplateID)
      if (template !== undefined) this.applicationForm.Title = template.Title
    },
    loadApplicationTemplate: function (templateid) {
      this.axios.post('/api/Services/CommerceService.asmx/GetNewApplicationTemplateShell', {templateid: templateid}).then(res => {
        if (res) {
          console.log('GetNewApplicationTemplateShell', res)
          let ctemplate = res.data
          ctemplate.ApplicationID = this.applicationForm.ApplicationID
          this.applicationForm.applicationTemplate = ctemplate
          this.isAnswering = true
          this.isLoading = false
        }
      }).catch(err => {
        console.log('GetNewApplicationTemplateShell列表出错', err)
        this.isLoading = false
      })
    },

    // 初始化Producer列表
    initProducers: function () {
      this.isLoadingProducer = true
      let service = '/api/Services/baseservice.asmx/GetProducers'
      if (this.RoleName.indexOf('processing') > -1 || this.RoleName.indexOf('Developer') >= 0) {
        service = '/api/Services/baseservice.asmx/GetSelectableProducers'
      }
      this.axios.post(service, {}).then(res => {
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
    loadApplication: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      // this.initTemplates()
      // this.initInsuranceCompany()
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationFrame', {applicationid: id}).then(res => {
        if (res) {
          console.log('loadApplication', res)
          this.application = res.data
          this.applicationForm = JSON.parse(JSON.stringify(res.data))
          if (res.data.applicationTemplate !== null) this.currentTemplateID = this.applicationForm.applicationTemplate.TemplateID
          // this.applicationForm.Templates = []
          let effdate = moment(res.data.EffectiveDate)
          if (effdate.year() > 2020) this.EffectiveDate = effdate.format()
          this.applicationForm.EffectiveDate = effdate
          this.application.EffectiveDate = effdate
          let dob = moment(res.data.DateOfBirth)
          if (dob.year() < 1920) this.applicationForm.DateOfBirth = moment(new Date())
          else this.applicationForm.DateOfBirth = dob.format()
          this.application.DateOfBirth = dob
          let expdate = moment(res.data.ExpiryDate)
          this.applicationForm.ExpiryDate = expdate
          if (this.applicationForm.applicationTemplate !== null) this.isAnswering = true
          else {
            this.isAnswering = false
            return
          }
          // build application tree
          this.applicationForm.applicationTemplate.templateBlocks.forEach(tb => {
            if (tb.ChildTypeID === 0) {
              let appBlock = this.applicationForm.applicationTemplate.applicationBlocks.find(ab => ab.TemplateBlockID === tb.TemplateBlockID)
              tb.applicationBlock = appBlock
              tb.applicationBlock.topTemplateBlockID = tb.applicationBlock.TemplateBlockID
              return
            }
            // tb.applicationBlocks = []
            tb.applicationTemplates = []
            let firstBlockId = tb.subTemplateBlocks[0].BlockID
            let lastBlockId = tb.subTemplateBlocks[tb.subTemplateBlocks.length - 1].BlockID
            this.applicationForm.applicationTemplate.applicationBlocks.forEach(ab => {
              let templateBlock = tb.subTemplateBlocks.find(subtb => subtb.TemplateBlockID === ab.TemplateBlockID)
              if (templateBlock === undefined) return
              // tb.applicationBlocks.push(ab)
              let subatemplate = tb.applicationTemplates.find(at => at.RepeatedID === ab.RepeatedID)
              if (subatemplate === undefined) {
                subatemplate = {
                  RepeatedID: ab.RepeatedID,
                  applicationBlocks: []
                }
                tb.applicationTemplates.push(subatemplate)
              }
              subatemplate.applicationBlocks.push(ab)
              ab.StatusID = 1
              ab.topTemplateBlockID = tb.TemplateBlockID
              if (ab.BlockID === firstBlockId) {
                ab.isFirst = true
                ab.Title = tb.BlockName
              }
              if (ab.BlockID === lastBlockId) ab.isLast = true
            })
            if (tb.applicationTemplates.length === 0) return
            let last = tb.applicationTemplates.length - 1
            let lastab = tb.applicationTemplates[last].applicationBlocks.length - 1
            tb.applicationTemplates[last].applicationBlocks[lastab].isLastTemplate = true
            tb.applicationTemplates[0].applicationBlocks[lastab].isFirstTemplate = true
          })
          this.applicationForm.applicationTemplate.applicationBlocks.forEach(ab => {
            this.applicationForm.applicationTemplate.templateBlocks.forEach(tb => {
              if (tb.ChildTypeID === 0) return
              let templateBlock = tb.subTemplateBlocks.find(subtb => subtb.TemplateBlockID === ab.TemplateBlockID)
              if (templateBlock !== undefined) {
                if (templateBlock.applicationBlocks === undefined) templateBlock.applicationBlocks = []
                templateBlock.applicationBlocks.push(ab)
              }
            })
          })
          console.log('ApplicationFrame', this.applicationForm)
          // trigger sub functions
          if (this.$refs.eat !== undefined) {
            this.$refs.eat.loadTemplateBlockQuestions(this.applicationForm.applicationTemplate)
            this.$refs.eat.loadApplicationBlocks()
          }
        }
        this.isLoading = false
      }).catch(err => {
        console.log('ApplicationFrame', err)
        this.isLoading = false
      })
    },
    // 关闭Pink Slip
    close: function (done) {
      this.viewForm = {
        ApplicationID: null,
        Title: null,
        EffectiveDate: null,
        InsuranceCorpID: null,
        ClientCode: null,
        StatusID: 0,
        RequestDate: moment(new Date()),
        DateOfBirth: moment(new Date()),
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        Templates: null
      }
      done()
    },
    // 选择EffectiveDate
    changeEffectiveDate: function (date) {
      // 获取变量值，用于之后回答时routing比对
      this.EffectiveDate = moment(date).format('YYYY-MM-DD')
    },
    checkOver: function () {
      // if (this.applicationForm.StatusID > 1) return
      if (this.applicationForm.applicationTemplate.StatusID === 1) this.applicationForm.StatusID = 1
      else this.applicationForm.StatusID = 0
    },

    // 提交
    submit: function (type) {
      this.$refs['applicationForm'].validate((valid) => {
        if (valid) {
          let application = JSON.parse(JSON.stringify(this.applicationForm))
          application.InsuranceTypeID = this.TemplateTypeID
          application.RequestDate = moment(application.RequestDate)
          application.BindTime = moment(application.BindTime)
          if (this.EffectiveDate !== null) application.EffectiveDate = this.EffectiveDate
          else application.EffectiveDate = moment(new Date(2000, 1, 1))
          let sequenceno = 0
          let template = application.applicationTemplate
          template.blockQuestions = null
          template.templateBlocks = null
          template.SequenceNo = sequenceno
          sequenceno++
          console.log('submit application:', application)
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
          // console.log('submit application:', application)
          if (type === 'save' || (type === 'finish')) {
            console.log('SaveApplication', application)
            this.isLoading = true
            this.saveBlockCount = application.applicationTemplate.applicationBlocks.length
            this.saveBlockIndex = 0
            // application.applicationTemplate.applicationBlocks.forEach(aBlock => {
            // this.saveApplicationBlock(aBlock)
            // })
            let ablocks = application.applicationTemplate.applicationBlocks
            application.applicationTemplate.applicationBlocks = appBlocks
            application.branch = null
            application.children = undefined
            let value = JSON.stringify(application)
            console.log('the length of Application', value.length)
            this.axios.post('/api/Services/CommerceService.asmx/SaveApplication', {application: value}).then(res => {
              if (res) {
                console.log('SaveApplication', res)
                ablocks.forEach(aBlock => {
                  let block = res.data.applicationTemplate.applicationBlocks.find(ab => ab.BlockID === aBlock.BlockID && ab.RepeatedID === aBlock.RepeatedID)
                  if (block !== undefined) aBlock.ApplicationTemplateID = block.ApplicationTemplateID
                  // aBlock.ApplicationTemplateID = res.data.applicationTemplate.ApplicationTemplateID
                  this.saveApplicationBlock(aBlock)
                })
                this.$refs['applicationForm'].resetFields()
                this.currentTemplates = []
                this.AnsweredArr = []
                this.totalQuestionNum = 1
                this.$emit('close', res.data.ApplicationID, type)
                if (type === 'finish') {
                }
              }
              this.isLoading = false
              // this.applicationForm = null
            }).catch(err => {
              console.log('saveApplication', err)
              // this.isLoading = false
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
