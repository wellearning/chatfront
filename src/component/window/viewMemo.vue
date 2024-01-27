<template>
  <div v-if="memo !== null">
    <!--div class="printDiv" v-if="memo.StatusID === 1">
      <el-button icon="el-icon-document" type="primary" @click="pdf(memo.Title, memo.EffectiveDate)" :loading="isLoading" size="small">Print</el-button>
    </div-->
    <div class="viewMemo" id="pdfDom">
      <img v-if="memo.branch.FormLogoUrl !== null " class="viewLogo" :src="'/api' + memo.branch.FormLogoUrl + '?time=' + printDate" crossorigin="anonymous">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{rootInstitution.Name}} ({{memo.branch.Name}})</i></div>
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{memo.branch.Address}}</i></div>
          <div class="viewMemo-subtitle head"><i style="width: unset;">{{memo.branch.Telphone}}</i></div>
        </el-col>
        <el-col :span="12">
          <div class="viewMemo-subtitle head"><i class="long">Insurance Company: </i><b>{{memo.InsuranceCorp}}</b></div>
          <div class="viewMemo-subtitle head"><i class="long">Broker Code: </i><b>{{memo.corpbroker === null? '': memo.corpbroker.BrokerCode}}</b></div>
          <!--<div class="viewMemo-subtitle head"><i class="long">Print Date: </i><b>{{printDate}}</b></div>-->
        </el-col>
      </el-row>
      <div class="viewMemo-title">{{memo.Title}}</div>
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="viewMemo-subtitle">EffectiveDate:</div>
        </el-col>
        <el-col :span="8">
          <div class="viewMemo-subtitle"><span>{{memo.EffectiveDate}}</span></div>
        </el-col>
        <el-col :span="4">
          <div class="viewMemo-subtitle">RequestDate:</div>
        </el-col>
        <el-col :span="8">
          <div class="viewMemo-subtitle"><span>{{memo.RequestDate}}</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="viewMemo-subtitle">PolicyNumber:</div>
        </el-col>
        <el-col :span="8">
          <div class="viewMemo-subtitle"><span>{{memo.PolicyNumber}}</span></div>
        </el-col>
        <el-col :span="4">
          <div class="viewMemo-subtitle">Name Insured(s):</div>
        </el-col>
        <el-col :span="8">
          <div class="viewMemo-subtitle"><span>{{memo.NameInsured}}</span></div>
        </el-col>
      </el-row>
      <div class="viewMemo-content">
        <div class="viewMemo-content-answer" v-for="(item, index) in memo.answers" :key="index">
          <!--问题类型为：Title-->
          <div v-if="item.TypeID === 1 && item.OutputModeID !== 3" class="title">
            <div class="question fontNormal">{{item.QuestionDesc}}</div>
          </div>
          <!--问题类型为：Reminder-->
          <div v-else-if="item.TypeID === 2 && item.OutputModeID !== 3">
            <div class="question fontNormal">{{item.QuestionDesc}}</div>
          </div>
          <!--问题类型为：Attribute-->
          <div v-else-if="item.TypeID === 3 && item.OutputModeID !== 3" onloadstart="showAttribute(item)" >
            <ViewAttribute  ref="viewAttribute" :answer="item"></ViewAttribute>
            <!--div class="question">
              <span>{{item.QuestionDesc}}</span>
              <span class="answer marginLeft10px">
                <span class="content" v-if="item.AnswerDesc === null || item.AnswerDesc === ''"></span>
                <span class="content" v-else-if="IsDate(item.AnswerDesc)">{{dateFormat(item.AnswerDesc)}}</span>
                <span class="content" v-else>{{item.AnswerDesc}}</span>
              </span>
            </div-->
          </div>
          <!--问题类型为：SimpleAnswer-->
          <div v-else-if="item.TypeID === 4 && item.OutputModeID !== 3">
            <div class="question">{{item.QuestionDesc}}</div>
            <div class="answer">
              <span class="content" v-if="item.AnswerDesc !== '' && item.AnswerDesc !== null">{{item.AnswerDesc}}</span>
              <span class="content noAnswer" v-else>No Answer</span>
            </div>
          </div>
          <!--问题类型为：Fillin-->
          <div v-else-if="item.TypeID === 5 && item.OutputModeID !== 3">
            <div class="question">
                      <span v-for="part in item.partAnswers" :key="part.FillinPartID">
                        <span class="fillInPart" v-if="part.IsFillin && (part.FillinContent !== '' && part.FillinContent !== null)">{{isNaN(part.FillinContent) && isDate(part.FillinContent) ? dateFormat(part.FillinContent) : part.FillinContent}}</span>
                        <span class="fillInPart noAnswer" v-else-if="part.IsFillin && (part.FillinContent === '' || part.FillinContent === null)">No Answer</span>
                        <span v-else>{{part.Part}}</span>
                      </span>
            </div>
          </div>
          <!--问题类型为：SingleChoice-->
          <div v-else-if="item.TypeID === 6 && item.OutputModeID !== 3 && item.optionAnswer !== undefined">
            <div>
              <div class="question fontNormal" v-if="item.OutputModeID === 1">{{item.QuestionDesc}}</div>
              <div class="answer">
                        <span v-if="item.optionAnswer !== null && item.OutputModeID === 1">
                          <span class="content">{{item.optionAnswer.Content}}</span>
                          <i class="addition" v-if="item.optionAnswer.AdditionContent !== null && item.optionAnswer.AdditionContent !== ''"><b>{{item.optionAnswer.AdditionContent}}</b></i>
                        </span>
                <span v-else-if="item.optionAnswer !== null && item.OutputModeID === 2">
                          <span class="content">{{item.optionAnswer.Outputs}}</span>
                  <!--<i class="addition" v-if="item.optionAnswer.AdditionContent !== null && item.optionAnswer.AdditionContent !== ''"><b>{{item.optionAnswer.AdditionContent}}</b></i>-->
                        </span>
              </div>
            </div>
          </div>
          <!--问题类型为：MultipleChoice-->
          <div v-else-if="item.TypeID === 7 && item.OutputModeID !== 3">
            <div>
              <div class="question fontNormal" v-if="item.OutputModeID === 1">{{item.QuestionDesc}}</div>
              <div class="answer">
                <div v-if="item.optionAnswers.length > 0">
                  <div v-for="(option, indexOption) in item.optionAnswers" :key="indexOption">
                    <div v-if="option.IsChecked">
                      <span v-if="item.OutputModeID === 1">
                        <span class="content">{{option.Content}}</span>
                        <i class="addition" v-if="option.Addition !== null && option.Addition !== ''"><b>{{option.Addition}}</b></i>
                      </span>
                      <span v-else-if="item.OutputModeID === 2">
                        <span class="content">{{option.Outputs}}</span>
                        <!--<i class="addition" v-if="option.AdditionContent !== null && option.AdditionContent !== ''"><b>{{option.AdditionContent}}</b></i>-->
                      </span>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <span class="noAnswer">No Answer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-row :gutter="20" class="foot printDateInFoot">
        <el-col>
          <b>{{printDate}}</b>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import ViewAttribute from '@/component/answerParts/viewAttribute'
export default {
  components: {
    ViewAttribute
  },
  name: 'viewMemo',
  data: function () {
    return {
      printDate: null,
      printObj: {
        id: 'pdfDom',
        popTitle: ''
      },
      isLoading: false,
      totalBlocks: 0,
      rootInstitution: JSON.parse(this.$store.getters.getAccount).rootInstitution,
      memo: null
    }
  },
  props: {
    memoid: {
      type: Number
    },
    insuranceCorps: {
      type: Array
    }
  },
  mounted: function () {
    this.loadMemo(this.memoid)
  },
  methods: {
    IsDate (dateVal) {
      if (dateVal.length > 12 && isNaN(dateVal) && !isNaN(Date.parse(dateVal))) return true
      else return false
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    showAttribute: function (answer) {
      if (this.$refs.viewAttribute !== undefined) {
        this.$refs.viewAttribute.parseAnswer(answer)
      }
    },
    loadMemo: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/MemoService.asmx/GetViewMemo', {memoid: id}).then(res => {
        if (res) {
          console.log('loadMemo', res)
          this.memo = res.data
          this.loadingCount = 0
          this.totalBlocks = 0
          this.memo.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
          this.memo.RequestDate = moment(res.data.RequestDate).format('YYYY-MM-DD')
          this.memo.InsuranceCorp = this.insuranceCorps.find(item => item.InsuranceCorpID === res.data.InsuranceCorpID).Name
          this.memo.answers.forEach(function (answer) {
            if (answer.TypeID === 6) {
              answer.optionAnswer = answer.optionAnswers.find(oa => oa.IsChecked)
            }
          })
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.printObj.popTitle = this.memo.Title
          })
          this.isLoading = false
        }
      }).catch(err => {
        console.log('loadMemo出错', err)
        this.isLoading = false
      })
    },
    // 关闭Pink Slip
    close: function (done) {
      this.memo.memoTemplates = []
      done()
    },
    pdf: function (title, EffectiveDate) {
      this.htmlTitle = title + ' ' + EffectiveDate
      this.getPdf('#pdfDom')
      this.printrecord()
    },
    // 转pdf
    printrecord: function () {
      this.axios.post('/api/Services/MemoService.asmx/CreatePrintRecord', {memoid: this.memo.MemoID, typeid: 1}).then(res => {
        if (res) {
          console.log('create printRecord', res)
        }
      }).catch(err => {
        console.log('create printRecord出错', err)
      })
    }

  }
}
</script>

<style scoped>

</style>
