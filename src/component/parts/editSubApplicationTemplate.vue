<template>
  <div>
    <div v-if="dataReady" class="newMemo-content">
      <div>{{title}}: {{applicationTemplate === null? '': applicationTemplate.RepeatedID+1}}</div>
      <div v-for="(ab,index) in applicationTemplate.applicationBlocks" :key="index">
        <div v-if="ab.isFirst && (ab.StatusID===1 || ab.StatusID===3)" class="question">
          <span>{{ ab.Title}}</span>
        </div>
        <editApplicationBlock :applicationBlock="ab" :applicationTemplate="applicationTemplate"
                              @showNextBlock="showNextBlock(ab)"
                              @showSkipBlock="showSkipBlock"
                              @resetLeft="resetLeftChildren(ab)"
                              @skipLeft="skipLeftChildren(ab)"
                              @checkOver="checkOver(ab)"
        >
        </editApplicationBlock>
      </div>
      <div class="newMemo-submit">
        <el-button icon="el-icon-check" type="primary" @click="saveApplicationTemplate()" :loading="isLoading">
          {{submitName}}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import editApplicationBlock from '@/component/parts/editApplicationBlock'
// import moment from 'moment'

export default {
  components: {
    editApplicationBlock
  },
  name: 'editSubApplicationTemplate',
  data: function () {
    return {
      isLoading: false,
      isLoadingApplicationBlocks: false,
      isLoadingTemplateBlockQuestions: false,
      dataReady: false,
      title: '',
      submitName: 'Save',
      rateTypes: [],
      loadCount: 0,
      loadBusiRateTypeCount: 0,
      computeReady: false,
      blockQuestions: [],
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
    applicationTemplateId: {
      type: Number
    }
  },
  mounted: function () {
    if (this.applicationTemplate === null) {
      this.loadApplicationTemplate(this.applicationTemplateId)
    }
  },
  methods: {
    addRateType: function () {
      this.rateTypes.push('rate types' + this.rateTypes.length)
    },
    loadBlockQuestions: function (templateid) {
      this.isLoadingBlockQuestions = true
      this.axios.post('/api/Services/BaseService.asmx/GetBlockQuestionsByTemplate_all', {templateid: templateid}).then(res => {
        if (res) {
          console.log('GetBlockQuestionsByTemplate' + templateid, res)
          this.blockQuestions = res.data
          if (!this.isLoadingApplicationBlocks) {
            this.matchBlockQuestions()
          }
        }
        this.isLoadingBlockQuestions = false
      }).catch(err => {
        console.log('GetBlockQuestionsByTemplate出错', err)
        this.isLoadingBlockQuestions = false
      })
    },
    loadApplicationTemplate: function (id) {
      this.applicationTemplate = null
      this.blockQuestions = []
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetSubApplicationTemplate', {id: id}).then(res => {
        if (res) {
          console.log('loadApplicationTemplate', res)
          this.applicationTemplate = res.data
          this.title = res.data.Title
          let templateid = res.data.TemplateID
          this.loadBlockQuestions(templateid)
          this.loadApplicationBlocks()
        }
        this.isLoading = false
      }).catch(err => {
        console.log('GetApplicationBlock列表出错', err)
        this.isLoading = false
      })
    },
    loadApplicationBlocks: function () {
      this.loadCount = 0
      this.isLoadingApplicationBlocks = true
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
            }
          }
        }
      }).catch(err => {
        console.log('GetApplicationBlock列表出错', err)
        this.loadCount++
        // if (this.loadCount === this.applicationTemplate.templateBlocks.length) this.loadBlockQuestions(atemplate)
      })
    },
    matchBlockQuestions: function () {
      console.log('applicationTemplate', this.applicationTemplate)
      this.applicationTemplate.applicationBlocks.forEach(cb => {
        cb.answers.forEach(a => {
          // a.DataSource = a.question.DataSource
          if (a.IsRoute) {
            // console.log('answer.QuestionID:', a.QuestionID)
            a.blockQuestion = this.blockQuestions.find(bq => bq.BlockQuestionID === a.BlockQuestionID)
            if (a.blockQuestion === null) {
              console.log('The unmatched answer:', a)
            }
            if (a.QuestionID === 824) {
              // console.log('answer:', a)
            }
          }
        })
      })
      this.dataReady = true
      this.start()
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
      if (ab.answers[0].StatusID === 1) return
      ab.StatusID = 3
      ab.answers[0].StatusID = 1
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
      nextchild.answers[0].StatusID = 1
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
          // ca.checkvalue = 0
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
      let statusid = 1
      // let children = this.applicationTemplate.templateBlocks
      let children = atemplate.applicationBlocks
      console.log('applicationBlocks', children)
      children.forEach(cb => {
        if (cb.StatusID === 0 || cb.StatusID === 3) statusid = 0
      })
      this.applicationTemplate.StatusID = statusid
      if (statusid === 1) this.submitName = 'Finish'
      // this.$emit('checkOver')
    },
    // 提交
    saveApplicationTemplate: function () {
      let appBlocks = []
      this.applicationTemplate.applicationBlocks.forEach(block => {
        block.answers.forEach(answer => {
          answer.blockQuestion = null
          answer.QuestionDesc = ''
          if (answer.TypeID === 6) answer.optionAnswers = null
          else if (answer.TypeID === 7) {
            answer.optionAnswers = answer.optionAnswers.filter(oa => { return oa.IsChecked })
          }
        })
        // let ablock = JSON.parse(JSON.stringify(block))
        // ablock.answers = undefined
        appBlocks.push(block)
      })
      this.isLoading = true
      this.saveBlockCount = this.applicationTemplate.applicationBlocks.length
      this.saveBlockIndex = 0
      appBlocks.forEach(aBlock => {
        this.saveApplicationBlock(aBlock)
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
          this.$emit('hideEdition')
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
