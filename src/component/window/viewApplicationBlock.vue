<template>
  <div v-if="applicationBlock !== null">
    <div class="viewApplicationBlock" id="pdfDom">
      <div class="viewMemo-title">{{blockName}}</div>
      <div class="viewMemo-content">
        <div class="viewMemo-content-answer" v-for="(item, index) in applicationBlock.answers" :key="index">
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
                      <span v-for="part in item.fillinAnswers" :key="part.FillinPartID">
                        <span class="fillInPart" v-if="part.IsFillin && (part.FillinContent !== '' && part.FillinContent !== null)">{{isNaN(part.FillinContent) && !isNaN(Date.parse(part.FillinContent)) ? dateFormat(part.FillinContent) : part.FillinContent}}</span>
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
                  <i class="addition" v-if="item.optionAnswer.NeedAddition">
                    <span>{{item.optionAnswer.Tips}}</span>
                    <b>{{item.optionAnswer.Addition}}</b>
                  </i>
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
                          <span v-if="option.OutputModeID === 1">
                            <span class="content">{{option.Content}}</span>
                            <i class="addition" v-if="option.AdditionContent !== null && option.AdditionContent !== ''"><b>{{option.AdditionContent}}</b></i>
                          </span>
                    <span v-else-if="option.OutputModeID === 2">
                            <span class="content">{{option.Outputs}}</span>
                      <!--<i class="addition" v-if="option.AdditionContent !== null && option.AdditionContent !== ''"><b>{{option.AdditionContent}}</b></i>-->
                          </span>
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
  name: 'viewApplication',
  data: function () {
    return {
      isLoading: false,
      rootInstitution: JSON.parse(this.$store.getters.getAccount).rootInstitution,
      applicationBlock: null
    }
  },
  props: {
    applicationBlockId: {
      type: Number
    },
    blockName: {
      type: String
    }
  },
  mounted: function () {
    this.loadApplicationBlock(this.applicationBlockId)
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
    loadApplicationBlock: function (id, name) {
      this.applicationBlockId = id
      this.applicationBlock = null
      if (name !== undefined) this.blockName = name
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationBlock', {id: id}).then(res => {
        if (res) {
          console.log('GetApplicationBlock', res)
          this.applicationBlock = res.data
          this.applicationBlock.answers.forEach(function (answer) {
            if (answer.TypeID === 6) {
              answer.optionAnswer = answer.optionAnswers.find(oa => oa.IsChecked)
            } else if (answer.TypeID === 5) {
              // this.showAttribute(answer)
            }
          })
        }
      }).catch(err => {
        console.log('GetApplicationBlock列表出错', err)
        this.loadCount++
        // if (this.loadCount === this.applicationTemplate.templateBlocks.length) this.loadBlockQuestions(atemplate)
      })
    }
  }
}
</script>

<style scoped>

</style>
