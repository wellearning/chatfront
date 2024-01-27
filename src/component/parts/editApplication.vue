<template>
  <div>
    <el-form :model="applicationForm" ref="applicationForm" class="newMemo" :rules="applicationFormRules">
      <el-row :gutter="20" class="title">
        <el-col :span="6">&#12288;</el-col>
        <el-col :span="12">
          <el-form-item prop="Title">
            <el-input v-model="applicationForm.Title" placeholder="Title"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">&#12288;</el-col>
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-col :span="7">
          <el-form-item label="Effective Date" prop="EffectiveDate">
            <el-date-picker v-model="applicationForm.EffectiveDate" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="Client Code" prop="ClientCode">
            <el-input v-model="applicationForm.ClientCode" placeholder="Client Code" title=""></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="Producer" prop="ProducerID">
            <el-select v-model="applicationForm.ProducerID" placeholder="Producer" no-data-text="No Record" filterable>
              <el-option v-for="item in producerList" :key="item.StaffID" :label="item.Name" :value="item.StaffID"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="Application" prop="Templates">
            <el-select v-model="currentTemplateID" placeholder="Application Type" no-data-text="No Record" filterable collapse-tags :disabled="applicationForm.NameInsured === null" @change="changeTemplates()">
              <el-option v-for="item in templateList" :key="item.TemplateID" :label="item.Title" :value="item.TemplateID"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="subtitle">
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
        <el-col :span="4">
          <el-form-item label="Phone" prop="PhoneNumber">
            <el-input v-model="applicationForm.PhoneNumber" placeholder="" title=""></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="Email" prop="Email">
            <el-input v-model="applicationForm.Email" placeholder="" title=""></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-col :span="7">
          <el-form-item label="Mailing Address" prop="Address">
            <el-input v-model="applicationForm.Address" placeholder="Mailing address street" title=""></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="City" prop="City">
            <el-input v-model="applicationForm.City" placeholder="" title=""></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="Province" prop="Province">
            <el-input v-model="applicationForm.Province" placeholder="" title=""></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="PostCode" prop="PostCode">
            <el-input v-model="applicationForm.PostCode" placeholder="" title=""></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <EditApplicationBody v-if="isAnswering" ref="eat"  :applicTemplate="applicationForm.applicationTemplate" @checkOver="checkOver()" :disabled="false"></EditApplicationBody>
    <div v-if="isAnswering" class="newMemo-submit">
      <el-button icon="el-icon-check" type="primary" @click="submit('save')" :loading="isLoading">Save</el-button>
      <el-button icon="el-icon-check" type="primary" @click="submit('saveAndPrint')" :loading="isLoading" v-if="applicationForm.StatusID === 1">Save & Print</el-button>
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
      printDate: null,
      isLoading: false,
      loadingCount: 0,
      isLoadingProducer: false,
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
        ProducerID: JSON.parse(this.$store.getters.getAccount).StaffID,
        StaffID: JSON.parse(this.$store.getters.getAccount).StaffID,
        applicationTemplate: null,
        Templates: null
      },
      applicationFormRules: {
        Title: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        ClientCode: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        TemplateType: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        NameInsured: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
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
    loadApplication: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      // this.initTemplates()
      // this.initInsuranceCompany()
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationFrame', {applicationid: id}).then(res => {
        if (res) {
          this.applicationForm = res.data
          this.currentTemplateID = this.applicationForm.applicationTemplate.TemplateID
          // this.applicationForm.Templates = []
          let effdate = moment(res.data.EffectiveDate)
          this.applicationForm.EffectiveDate = effdate
          this.isAnswering = true
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
          let sequenceno = 0
          let template = application.applicationTemplate
          template.blockQuestions = null
          template.templateBlocks = null
          template.SequenceNo = sequenceno
          sequenceno++
          console.log('submit application:', application)
          template.applicationBlocks.forEach(block => {
            block.answers.forEach(answer => {
              answer.blockQuestion = null
              answer.QuestionDesc = ''
              if (answer.TypeID === 6) answer.optionAnswers = null
              else if (answer.TypeID === 7) {
                answer.optionAnswers = answer.optionAnswers.filter(oa => { return oa.IsChecked })
              }
            })
          })
          // console.log('submit application:', application)
          if (type === 'save' || (type === 'saveAndPrint')) {
            let value = JSON.stringify(application)
            console.log('SaveApplication', application)
            this.isLoading = true
            this.axios.post('/api/Services/CommerceService.asmx/SaveApplication', {application: value}).then(res => {
              if (res) {
                console.log('修改', res)
                this.$message({
                  type: 'success',
                  message: 'Operation Succeeded'
                })
                this.$refs['applicationForm'].resetFields()
                this.currentTemplates = []
                this.AnsweredArr = []
                this.totalQuestionNum = 1
                this.$emit('close', res.data.ApplicationID, type)
                if (type === 'saveAndPrint') {
                }
              }
              this.isLoading = false
              // this.applicationForm = null
            }).catch(err => {
              console.log('修改出错', err)
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
    }

  }
}
</script>

<style scoped>

</style>
