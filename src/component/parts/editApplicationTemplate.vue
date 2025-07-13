<template>
  <div>
    <div v-if="dataReady" class="newMemo-content">
      <div>{{ applicationTemplate.Title}}</div>
      <div v-for="(ab,index) in applicationTemplate.applicationBlocks" :key="index">
        <div v-if="ab.isFirst && (ab.StatusID===1 || ab.StatusID===3)" class="question">
          <span>{{ ab.Title}}</span>
          <el-button v-if="!ab.isFirstTemplate" icon="el-icon-minus" type="primary" plain size="small" @click="removeTemplate(ab)">Remove {{ab.Title}}</el-button>
        </div>
        <editApplicationBlock :applicationBlock="ab" :applicationTemplate="applicationTemplate"
                              @showNextBlock="showNextBlock(ab)"
                              @showSkipBlock="showSkipBlock"
                              @resetLeft="resetLeftChildren(ab)"
                              @skipLeft="skipLeftChildren(ab)"
                              @checkOver="checkOver(ab)"
        >
        </editApplicationBlock>
        <div v-if="ab.isLast && ab.StatusID === 1">
          <el-button v-if="ab.isLastTemplate" icon="el-icon-plus" type="primary" plain size="small" @click="addTemplate(ab)">Add new risk {{ab.Title}}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import editApplicationBlock from '@/component/parts/editApplicationBlock'

export default {
  components: {
    editApplicationBlock
  },
  name: 'editApplicationTemplate',
  data: function () {
    return {
      isLoading: false,
      isLoadingApplicationBlocks: false,
      isLoadingTemplateBlockQuestions: false,
      dataReady: false,
      rateTypes: [],
      loadCount: 0,
      blockQuestions: [],
      loadBusiRateTypeCount: 0,
      computeReady: false,
      computedAttributes: [], // 需要计算的属性
      computableAttributes: [], // 可参与计算的属性
      operandAttributes: [], // 实际参与计算的属性
      operandRateTypes: [], // 实际参与计算的系数表
      ratableAttributes: [], // 可参与检索系数表的属性，是list类的属性
      rateItems: [], // 系数表涉及参数值列表集
      rateAttributes: [], // 系数表涉及的属性
      applicationTemplate: null
    }
  },
  props: {
    applicTemplate: {
      type: Object
    }
  },
  mounted: function () {
    this.applicationTemplate = this.applicTemplate
    if (this.applicationTemplate.IsNew) {
      this.loadApplicationChildren()
    } else {
      this.loadTemplateBlockQuestions(this.applicationTemplate)
      this.loadApplicationBlocks()
    }
    // this.loadBlockQuestions()
    // this.setComputedAttributes()
    // this.setRateTypes()
    // this.viewCoverLetter()
  },
  methods: {
    addRateType: function () {
      this.rateTypes.push('rate types' + this.rateTypes.length)
    },
    matchAnswerBlockQuestion: function (atemplate) {
      console.log('matchAnswerBlockQuestion', atemplate)
      atemplate.templateBlocks.forEach(tb => {
        if (tb.ChildTypeID === 1) return
        tb.applicationBlock.answers.forEach(a => {
          // a.DataSource = a.question.DataSource
          if (a.IsRoute) {
            console.log('answer.QuestionID:', a.QuestionID)
            if (a.QuestionID === 821) {
              console.log('answer:', a)
            }
            a.blockQuestion = atemplate.blockQuestions.find(bq => bq.BlockQuestionID === a.BlockQuestionID)
            if (a.blockQuestion === null) {
              console.log('The unmatched answer:', a)
            }
          }
        })
      })
      /*
      atemplate.applicationBlocks.forEach(cb => {
        cb.answers.forEach(a => {
          // a.DataSource = a.question.DataSource
          if (a.IsRoute) {
            console.log('answer.QuestionID:', a.QuestionID)
            if (a.QuestionID === 821) {
              console.log('answer:', a)
            }
            a.blockQuestion = atemplate.blockQuestions.find(bq => bq.BlockQuestionID === a.BlockQuestionID)
            if (a.blockQuestion === null) {
              console.log('The unmatched answer:', a)
            }
          }
        })
      })
      */
    },
    fillApplicationBlocks: function (atemplate) {
      atemplate.applicationBlocks = []
      atemplate.templateBlocks.forEach(tb => {
        tb.applicationBlock.TemplateBlockID = tb.TemplateBlockID
        tb.applicationBlock.StatusID = 0
        atemplate.applicationBlocks.push(tb.applicationBlock)
      })
      if (!atemplate.isSub) return
      let last = atemplate.applicationBlocks.length - 1
      atemplate.applicationBlocks[last].isLast = true
      atemplate.applicationBlocks[0].isFirst = true
      atemplate.applicationBlocks[0].Title = atemplate.Title
      atemplate.applicationBlocks[last].Title = atemplate.Title
    },
    loadBlockQuestions: function (atemplate) {
      this.isLoadingBlockQuestions = true
      this.axios.post('/api/Services/BaseService.asmx/GetBlockQuestionsByTemplate', {templateid: atemplate.TemplateID}).then(res => {
        if (res) {
          console.log('GetBlockQuestionsByTemplate' + atemplate.TemplateID, res)
          atemplate.blockQuestions = res.data
          this.matchAnswerBlockQuestion(atemplate)
          if (this.dataReady) {
            if (!atemplate.dataReady) this.insertApplicationTemplate(atemplate)
          } else this.setDataReady()
        }
        this.isLoadingBlockQuestions = false
      }).catch(err => {
        console.log('GetBlockQuestionsByTemplate出错', err)
        this.isLoadingBlockQuestions = false
      })
    },
    loadApplicationChildren: function () {
      this.applicationTemplate.loadCount = 0
      this.applicationTemplate.dataReady = false
      this.applicationTemplate.applicationBlocks = []
      this.applicationTemplate.templateBlocks.forEach(tb => {
        tb.StatusID = 0
        tb.isAnswer = false
        tb.dataReady = false
        if (tb.ChildTypeID === 0) {
          if (this.applicationTemplate.IsNew) this.loadNewApplicationBlock(tb, this.applicationTemplate)
          // else this.loadApplicationBlock(tb)
        } else {
          if (this.applicationTemplate.IsNew) {
            tb.applicationTemplates = []
            this.loadNewApplicationTemplate(tb, this.applicationTemplate)
          } // else this.loadApplicationTemplate(tb)
        }
      })
      this.applicationTemplate.templateBlocks[0].isAnswer = true
    },
    loadNewApplicationBlock: function (templateBlock, atemplate) {
      let start = false
      // if (templateBlock.SequenceNo === 1) start = true
      this.axios.post('/api/Services/CommerceService.asmx/GetNewApplicationBlock', {templateblockid: templateBlock.TemplateBlockID, start: start}).then(res => {
        if (res) {
          console.log('GetNewApplicationBlock', res.data)
          templateBlock.applicationBlock = res.data
          // atemplate.applicationBlocks.push(res.data)
          templateBlock.dataReady = true
          atemplate.loadCount++
          if (atemplate.loadCount === atemplate.templateBlocks.length) {
            // atemplate.dataReady = true
            this.fillApplicationBlocks(atemplate)
            this.loadBlockQuestions(atemplate)
          }
        }
      }).catch(err => {
        console.log('GetNewApplicationBlock列表出错', err)
        this.loadCount++
        // if (this.loadCount === this.applicationTemplate.templateBlocks.length) this.dataReady = true
      })
    },
    loadNewApplicationTemplate: function (templateBlock, atemplate) {
      this.axios.post('/api/Services/CommerceService.asmx/GetNewApplicationTemplateShell', {templateid: templateBlock.BlockID}).then(res => {
        if (res) {
          console.log('GetNewApplicationTemplateShell', res)
          let subatemplate = res.data
          templateBlock.applicationTemplates.push(subatemplate)
          subatemplate.TemplateBlockID = templateBlock.TemplateBlockID
          subatemplate.isSub = true
          subatemplate.StatusID = 0
          subatemplate.loadCount = 0
          subatemplate.applicationBlocks = []
          subatemplate.RepeatID = templateBlock.applicationTemplates.length
          subatemplate.templateBlocks.forEach(tb => {
            tb.dataReady = false
            this.loadNewApplicationBlock(tb, subatemplate)
          })
          atemplate.loadCount++
          if (atemplate.loadCount === atemplate.templateBlocks.length) {
            // atemplate.dataReady = true
            // templateBlock.dataReady = true
            this.loadBlockQuestions(atemplate)
          }
        }
      }).catch(err => {
        console.log('loadNewApplicationTemplate出错', err)
        atemplate.loadCount++
        // if (atemplate.loadCount === atemplate.templateBlocks.length) atemplate.dataReady = true
      })
    },
    loadApplicationTemplate: function (templateBlock) {
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationBlock', {}).then(res => {
        if (res) {
          console.log('GetApplicationBlock', res)
          templateBlock.applicationBlock = res.data
          this.loadCount++
          // if (this.loadCount === this.applicationTemplate.templateBlocks.length) this.dataReady = true
        }
      }).catch(err => {
        console.log('GetApplicationBlock列表出错', err)
        this.loadCount++
        // if (this.loadCount === this.applicationTemplate.templateBlocks.length) this.dataReady = true
      })
    },
    loadApplicationBlocks: function () {
      this.loadCount = 0
      this.isLoadingApplicationBlocks = true
      // this.applicationTemplate.loadCount = 0
      // this.applicationTemplate.dataReady = false
      this.applicationTemplate.applicationBlocks.forEach(ablock => {
        this.loadApplicationBlock(ablock)
      })
    },
    loadApplicationBlock: function (aBlock) {
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationBlock', {id: aBlock.ApplicationBlockID}).then(res => {
        if (res) {
          console.log('GetApplicationBlock', res.data)
          let appblock = this.applicationTemplate.applicationBlocks.find(ab => ab.ApplicationBlockID === aBlock.ApplicationBlockID)
          appblock.answers = res.data.answers
          aBlock.answers = res.data.answers
          this.loadCount++
          if (this.loadCount === this.applicationTemplate.applicationBlocks.length) {
            // console.log('loadCount:', this.loadCount)
            // console.log('isLoadingTemplateBlockQuestions:', this.isLoadingTemplateBlockQuestions)
            this.isLoadingApplicationBlocks = false
            if (!this.isLoadingTemplateBlockQuestions) {
              this.matchBlockQuestions()
              this.dataReady = true
            }
            // this.loadBlockQuestions()
          }
        }
      }).catch(err => {
        console.log('GetApplicationBlock列表出错', err)
        this.loadCount++
        // if (this.loadCount === this.applicationTemplate.templateBlocks.length) this.loadBlockQuestions(atemplate)
      })
    },
    loadTemplateBlockQuestions: function (atemplate) {
      console.log('loadTemplateBlockQuestions start from', atemplate)
      if (atemplate !== undefined) this.applicationTemplate = atemplate
      // console.log('this.applicationTemplate', this.applicationTemplate)
      this.isLoadingTemplateBlockQuestions = true
      this.axios.post('/api/Services/BaseService.asmx/GetBlockQuestionsByTemplate_all', {templateid: this.applicationTemplate.TemplateID}).then(res => {
        if (res) {
          console.log('GetBlockQuestionsByTemplate_all', res)
          this.applicationTemplate.blockQuestions = res.data
          // console.log('isLoadingTemplateBlockQuestions:', this.isLoadingTemplateBlockQuestions)
          if (!this.isLoadingApplicationBlocks) {
            // console.log('loadCount:', this.loadCount)
            this.matchBlockQuestions()
            this.dataReady = true
          }
        }
        this.isLoadingTemplateBlockQuestions = false
      }).catch(err => {
        console.log('GetBlockQuestionsByTemplate出错', err)
        this.isLoadingTemplateBlockQuestions = false
      })
    },
    matchBlockQuestions: function () {
      console.log('applicationTemplate', this.applicationTemplate)
      this.applicationTemplate.applicationBlocks.forEach(cb => {
        cb.answers.forEach(a => {
          // a.DataSource = a.question.DataSource
          if (a.IsRoute) {
            // console.log('answer.QuestionID:', a.QuestionID)
            a.blockQuestion = this.applicationTemplate.blockQuestions.find(bq => bq.BlockQuestionID === a.BlockQuestionID)
            if (a.blockQuestion === null) {
              console.log('The unmatched answer:', a)
            }
            if (a.QuestionID === 824) {
              // console.log('answer:', a)
            }
          }
        })
      })
    },
    setDataReady: function () {
      this.applicationTemplate.dataReady = true
      this.applicationTemplate.templateBlocks.forEach(child => {
        if (child.ChildTypeID === 1) {
          if (child.applicationTemplates.length === 0) {
            console.log('child.applicationTemplates.length === 0')
            child.dataReady = false
            this.applicationTemplate.dataReady = false
            return
          }
          child.dataReady = true
          child.applicationTemplates.forEach(atemplate => {
            atemplate.dataReady = true
            atemplate.templateBlocks.forEach(tb => {
              if (!tb.dataReady) {
                atemplate.dataReady = false
                child.dataReady = false
                this.applicationTemplate.dataReady = false
              }
            })
          })
        }
      })
      if (this.applicationTemplate.dataReady) {
        this.resetApplicationBlocks()
        this.dataReady = true
        this.start()
      } else this.dataReady = false
    },
    loadComputeEnv: function () {
      this.setComputedAttributes()
      this.setRateTypes()
    },
    setPropertyAttributes: function () {
      this.applicationTemplate.rateTypes = this.rateTypes
      this.applicationTemplate.rateItems = this.rateItems
      this.applicationTemplate.computableAttributes = this.computableAttributes
      this.applicationTemplate.computedAttributes = this.computedAttributes
      this.applicationTemplate.rateAttributes = this.rateAttributes
      this.applicationTemplate.operandAttributes = this.operandAttributes
      this.applicationTemplate.operandRateTypes = this.operandRateTypes
      this.start()
    },
    resetApplicationBlocks: function () {
      this.applicationTemplate.applicationBlocks = []
      this.applicationTemplate.templateBlocks.forEach(tb => {
        if (tb.ChildTypeID === 0) {
          tb.applicationBlock.TemplateBlockID = tb.TemplateBlockID
          tb.applicationBlock.topTemplateBlockID = tb.TemplateBlockID
          this.applicationTemplate.applicationBlocks.push(tb.applicationBlock)
        } else {
          // let repeatedID = 0
          this.resetRepeatedID(tb)
          tb.applicationTemplates.forEach(at => {
            at.applicationBlocks.forEach(ab => {
              ab.topTemplateBlockID = tb.TemplateBlockID
              this.applicationTemplate.applicationBlocks.push(ab)
              if (ab.isFirst) {
                // if (ab.RepeatedID === tb.applicationTemplates.length - 1) ab.isLastTemplate = true
                if (ab.RepeatedID === 0) ab.isFirstTemplate = true
                else ab.isFirstTemplate = false
              }
              if (ab.isLast) {
                if (ab.RepeatedID === tb.applicationTemplates.length - 1) ab.isLastTemplate = true
                else ab.isLastTemplate = false
                // if (ab.RepeatedID === 0) ab.isFirstTemplate = true
              }
            })
          })
        }
      })
      // console.log('applicationBlocks', this.applicationTemplate.applicationBlocks)
    },
    addTemplate: function (ab) {
      let templateBlock = this.applicationTemplate.templateBlocks.find(tb => tb.TemplateBlockID === ab.topTemplateBlockID)
      this.loadNewApplicationTemplate(templateBlock, this.applicationTemplate)
    },
    insertApplicationTemplate: function (atemplate) {
      let ablock = this.applicationTemplate.applicationBlocks.find(ab => atemplate.TemplateBlockID === ab.topTemplateBlockID && ab.isLastTemplate)
      if (ablock === undefined) {
        console.log('applicationBlocks', this.applicationTemplate.applicationBlocks)
        console.log('atemplate', atemplate)
        this.resetApplicationBlocks()
        atemplate.applicationBlocks[0].StatusID = 3
        atemplate.applicationBlocks[0].answers[0].StatusID = 1
      } else {
        ablock.isLastTemplate = false
        let index = this.applicationTemplate.applicationBlocks.indexOf(ablock)
        atemplate.applicationBlocks.forEach(ab => {
          ab.RepeatedID = ablock.RepeatedID + 1
          ab.topTemplateBlockID = atemplate.TemplateBlockID
          if (ab.isFirst) {
            ab.StatusID = 3
            ab.answers[0].StatusID = 1
          }
          if (ab.isLast) ab.isLastTemplate = true
          index++
          this.applicationTemplate.applicationBlocks.splice(index, 0, ab)
        })
      }
      this.checkOver()
      console.log('applicationBlocks', this.applicationTemplate.applicationBlocks)
    },
    removeTemplate: function (ab) {
      if (!confirm('Are you sure to remove the template?')) return
      let templateBlock = this.applicationTemplate.templateBlocks.find(tb => tb.TemplateBlockID === ab.topTemplateBlockID)
      let length = templateBlock.applicationTemplates[0].applicationBlocks.length
      let index = this.applicationTemplate.applicationBlocks.findIndex(a => a.RepeatedID === ab.RepeatedID && a.topTemplateBlockID === ab.topTemplateBlockID && a.isFirst)
      this.applicationTemplate.applicationBlocks.splice(index, length)
      index = templateBlock.applicationTemplates.findIndex(at => at.RepeatedID === ab.RepeatedID)
      templateBlock.applicationTemplates.splice(index, 1)
      this.resetRepeatedID(templateBlock)
      this.resetApplicationBlocks()
      this.checkOver()
      if (templateBlock.applicationTemplates.length === 0) this.loadNewApplicationTemplate(templateBlock, this.applicationTemplate)
    },
    resetRepeatedID: function (templateBlock) {
      let index = 0
      templateBlock.applicationTemplates.forEach(at => {
        at.RepeatedID = index
        at.applicationBlocks.forEach(ab => {
          ab.RepeatedID = index
        })
        index++
      })
    },
    // 加载计算环境
    setComputedAttributes: function () {
      this.computedAttributes = []
      let appTemp = this.applicationTemplate
      for (let j = 0; j < appTemp.applicationBlocks.length; j++) {
        let appBlock = appTemp.applicationBlocks[j]
        for (let k = 0; k < appBlock.answers.length; k++) {
          let answer = appBlock.answers[k]
          if (answer.InputType === 'computed') {
            let oprands = this.getOperands(answer.DataSource)
            answer.operands = oprands
            this.computedAttributes.push(answer)
          }
          if (answer.InputType === 'number' || answer.InputType === 'money' || answer.InputType === 'computed') {
            this.computableAttributes.push(answer)
          } else if (answer.InputType === 'list') {
            this.ratableAttributes.push(answer)
          }
        }
      }
      console.log('computableAttributes', this.computableAttributes)
      for (let i = 0; i < this.computedAttributes.length; i++) {
        let attr = this.computedAttributes[i]
        for (let j = 0; j < attr.operands.length; j++) {
          let oper = attr.operands[j]
          let operAttr = this.computableAttributes.find(a => a.QuestionDesc === oper)
          if (operAttr === undefined) {
            this.operandRateTypes.push(oper)
          } else {
            let operAttr1 = this.operandAttributes.find(a => a.QuestionDesc === oper)
            if (operAttr1 === undefined) this.operandAttributes.push(operAttr)
          }
        }
      }
    },
    setRateTypes: function () {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetDataItems', {datatype: 'RateType'}).then(res => {
        if (res) {
          console.log('Load RateTypes', res)
          let types = res.data
          this.rateTypes = types
          this.loadBusiRateTypeCount = 0
          for (let i = 0; i < types.length; i++) {
            let type = types[i]
            let typename = this.operandRateTypes.find(t => t === type.Name)
            if (typename === undefined) {
              this.loadBusiRateTypeCount++
              continue
            }
            this.loadRateType(type)
          }
        }
        this.isLoading = false
      }).catch(err => {
        console.log('Load RateTypes出错', err)
        this.isLoading = false
      })
    },
    loadRateType: function (rateType) {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetBusiRateType', {typeid: rateType.ItemID}).then(res => {
        if (res) {
          console.log('GetBusiRateType查询', res)
          rateType.type = res.data
          let busiItems = res.data.busiItems
          for (let i = 0; i < busiItems.length; i++) {
            let itemName = busiItems[i].Name
            let attr = this.ratableAttributes.find(a => a.DataSource === itemName)
            if (attr !== undefined) {
              this.rateAttributes.push(attr)
              let rateItem = {name: itemName, itemValues: res.data.busiItemValues[i]}
              this.rateItems.push(rateItem)
            }
          }
          this.loadBusiRateTypeCount++
          if (this.loadBusiRateTypeCount === this.rateTypes.length) {
            this.computeReady = true
            this.setPropertyAttributes()
          }
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadRateType出错', err)
        this.isLoading = false
      })
    },
    // 运行时
    start: function () {
      // if (!this.dataReady || !this.computeReady) return
      let ab = this.applicationTemplate.applicationBlocks[0]
      // let tb = this.applicationTemplate.templateBlocks.find(t => t.TemplateBlockID === ab.topTemplateBlockID)
      // tb.StatusID = 1
      ab.StatusID = 3
      for (let i = 0; i < ab.answers.length; i++) {
        let answer = ab.answers[i]
        if (answer.TypeID === 1 || answer.TypeID === 2) answer.StatusID = 1
        else {
          answer.StatusID = 1
          break
        }
      }
      // ab.answers[0].StatusID = 1
    },
    showNextBlock: function (child) {
      let tblist = this.applicationTemplate.applicationBlocks
      let index = tblist.indexOf(child)
      if (index === tblist.length - 1) {
        this.checkOver()
        return
      }
      index++
      let nextchild = tblist[index]
      console.log('Next child is ', nextchild)
      // set the first non-title and non-reminder question statusid to 1
      for (let i = 0; i < nextchild.answers.length; i++) {
        let ca = nextchild.answers[i]
        ca.StatusID = 1
        if (ca.TypeID > 2) break
      }
      // nextchild.answers[0].StatusID = 1
      nextchild.isAnswer = true
      nextchild.StatusID = 3
    },
    showSkipBlock: function (currentBlockId, repeatedId, targitBlockId) {
      console.log('Skip Block ID is ', currentBlockId)
      let children = this.applicationTemplate.applicationBlocks
      let current = this.applicationTemplate.applicationBlocks.findIndex(ab => ab.BlockID === currentBlockId && ab.RepeatedID === repeatedId)
      let index = this.applicationTemplate.applicationBlocks.findIndex(ab => ab.BlockID === targitBlockId && ab.RepeatedID === repeatedId)
      if (index === -1) {
        console.log('The Block is not exist, blockId = ', targitBlockId)
        return
      }
      for (let i = current + 1; i < index; i++) {
        this.skipBlock(children[i])
      }
      let nextChild = children[index]
      this.resetLeftChildren(nextChild)
      nextChild.answers[0].StatusID = 1
      nextChild.StatusID = 3
    },
    resetLeftChildren: function (ablock) {
      let atemplate = this.applicationTemplate
      let index = atemplate.applicationBlocks.indexOf(ablock)
      for (let i = index + 1; i < atemplate.applicationBlocks.length; i++) {
        let ab = atemplate.applicationBlocks[i]
        this.resetBlock(ab)
      }
    },
    resetBlock: function (cb) {
      cb.StatusID = 0
      cb.answers.forEach(ca => {
        ca.StatusID = 0
        // ca.AnswerDesc = ''
        ca.hasAnswer = false
        if (ca.TypeID === 6) {
          ca.checkvalue = 0
        }
      })
    },
    skipLeftChildren: function (child) {
      let atemplate = this.applicationTemplate
      let index = atemplate.applicationBlocks.indexOf(child)
      for (let i = index + 1; i < atemplate.applicationBlocks.length; i++) {
        let tb = atemplate.applicationBlocks[i]
        this.skipBlock(tb.applicationBlock)
      }
    },
    skipBlock: function (cb) {
      cb.StatusID = 2
      cb.answers.forEach(ca => {
        ca.StatusID = 2
        ca.AnswerDesc = ''
        ca.hasAnswer = false
        if (ca.TypeID === 5) {
          ca.partAnswers.forEach(pa => {
            if (pa.IsFillin) pa.Part = ''
          })
        } else if (ca.TypeID === 6) {
          ca.checkvalue = 0
        }
      })
    },
    checkOver: function () {
      let atemplate = this.applicationTemplate
      atemplate.StatusID = 1
      // let children = this.applicationTemplate.templateBlocks
      let children = atemplate.applicationBlocks
      console.log('applicationBlocks', children)
      let notanswer = true
      let answered = true
      children.forEach(cb => {
        if (!notanswer && !answered) return
        if (notanswer && cb.StatusID !== 0) notanswer = false
        if (answered && (cb.StatusID === 0 || cb.StatusID === 3)) answered = false
        // if (cb.StatusID === 0 || cb.StatusID === 3) atemplate.StatusID = 0
      })
      if (notanswer) atemplate.StatusID = 0
      else if (answered) atemplate.StatusID = 1
      else atemplate.StatusID = 3
      this.$emit('checkOver')
    }
  }
}
</script>

<style scoped>

</style>
