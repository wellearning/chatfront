<template>
  <div>
    <div v-if="dataReady" class="newMemo-content">
      <div v-for="child in applicationTemplate.templateBlocks" :key="child.TemplateBlockID">
        <div>Template Block: {{ child.TemplateBlockID}}</div>
        <div v-if="child.ChildTypeID === 0">
          <editApplicationBlock :applicationBlock="child.applicationBlock" :applicationTemplate="applicationTemplate"
                                @showNextBlock="showNextChild(child)"
                                @resetLeft="resetLeftChildren(child)"
                                @skipLeft="skipLeftChildren(child)"
                                @checkOver="childCheckOver(child)"
          >
          </editApplicationBlock>
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
  name: 'editChildApplicationTemplate',
  data: function () {
    return {
      isLoading: false,
      dataReady: false,
      rateTypes: [],
      loadCount: 0,
      blockQuestions: [],
      computedAttributes: [], // 需要计算的属性
      computableAttributes: [], // 可参与计算的属性
      operandAttributes: [], // 实际参与计算的属性
      operandRateTypes: [], // 实际参与计算的系数表
      ratableAttributes: [], // 可参与检索系数表的属性，是list类的属性
      rateItems: [], // 系数表涉及参数值列表集
      rateAttributes: [] // 系数表涉及的属性
    }
  },
  props: {
    applicationTemplate: {
      type: Object
    }
  },
  mounted: function () {
    this.loadApplicationChildren()
    // this.loadBlockQuestions()
    // this.setComputedAttributes()
    // this.setRateTypes()
    // this.viewCoverLetter()
  },
  methods: {
    matchAnswerBlockQuestion: function () {
      this.applicationTemplate.applicationBlocks.forEach(cb => {
        cb.answers.forEach(a => {
          // a.DataSource = a.question.DataSource
          if (a.IsRoute) {
            a.blockQuestion = this.blockQuestions.find(bq => bq.BlockQuestionID === a.BlockQuestionID)
          }
        })
      })
    },
    loadBlockQuestions: function () {
      this.isLoadingBlockQuestions = true
      this.axios.post('/api/Services/BaseService.asmx/GetBlockQuestionsByTemplate', {templateid: this.applicationTemplate.TemplateID}).then(res => {
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
    loadApplicationChildren: function () {
      this.loadCount = 0
      this.dataReady = false
      this.applicationTemplate.applicationBlocks = []
      this.applicationTemplate.templateBlocks.forEach(tb => {
        tb.StatusID = 0
        tb.isAnswer = false
        if (tb.ChildTypeID === 0) {
          if (this.applicationTemplate.IsNew) this.loadNewApplicationBlock(tb)
          else this.loadApplicationBlock(tb)
        } else {
          if (this.applicationTemplate.IsNew) {
            tb.applicationTemplates = []
            this.loadNewApplicationTemplate(tb)
          } else this.loadApplicationTemplate(tb)
        }
      })
      this.applicationTemplate.templateBlocks[0].isAnswer = true
    },
    loadNewApplicationBlock: function (templateBlock) {
      let start = false
      if (templateBlock.SequenceNo === 1) start = true
      this.axios.post('/api/Services/CommerceService.asmx/GetNewApplicationBlock', {templateblockid: templateBlock.TemplateBlockID, start: start}).then(res => {
        if (res) {
          console.log('GetNewApplicationBlock', res.data)
          templateBlock.applicationBlock = res.data
          this.applicationTemplate.applicationBlocks.push(res.data)
          this.loadCount++
          if (this.loadCount === this.applicationTemplate.templateBlocks.length) {
            this.dataReady = true
            this.loadBlockQuestions()
          }
        }
      }).catch(err => {
        console.log('Templates列表出错', err)
        this.loadCount++
        if (this.loadCount === this.applicationTemplate.templateBlocks.length) this.dataReady = true
      })
    },
    loadApplicationBlock: function (templateBlock) {
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationBlock', {templateblockid: templateBlock.TemplateBlockID}).then(res => {
        if (res) {
          console.log('GetApplicationBlock', res)
          templateBlock.applicationBlock = res.data
          this.loadCount++
          if (this.loadCount === this.applicationTemplate.templateBlocks.length) this.dataReady = true
        }
      }).catch(err => {
        console.log('GetApplicationBlock列表出错', err)
        this.loadCount++
        if (this.loadCount === this.applicationTemplate.templateBlocks.length) this.dataReady = true
      })
    },
    loadNewApplicationTemplate: function (templateBlock) {
      this.axios.post('/api/Services/CommerceService.asmx/GetNewApplicationTemplateShell', {templateid: templateBlock.BlockID}).then(res => {
        if (res) {
          console.log('GetNewApplicationTemplateShell', res)
          let atemplate = res.data
          atemplate.StatusID = 0
          atemplate.RepeatID = templateBlock.applicationTemplates.length
          templateBlock.applicationTemplates.push(atemplate)
          this.loadCount++
          if (this.loadCount === this.applicationTemplate.templateBlocks.length) {
            this.dataReady = true
            this.loadBlockQuestions()
          }
        }
      }).catch(err => {
        console.log('Templates列表出错', err)
        this.loadCount++
        if (this.loadCount === this.applicationTemplate.templateBlocks.length) this.dataReady = true
      })
    },
    loadApplicationTemplate: function (templateBlock) {
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationBlock', {}).then(res => {
        if (res) {
          console.log('GetApplicationBlock', res)
          templateBlock.applicationBlock = res.data
          this.loadCount++
          if (this.loadCount === this.applicationTemplate.templateBlocks.length) this.dataReady = true
        }
      }).catch(err => {
        console.log('GetApplicationBlock列表出错', err)
        this.loadCount++
        if (this.loadCount === this.applicationTemplate.templateBlocks.length) this.dataReady = true
      })
    },
    showNextChild: function (child) {
      let tblist = this.applicationTemplate.templateBlocks
      let index = tblist.indexOf(child)
      if (index === tblist.length - 1) {
        this.checkOver()
        return
      }
      let nextchild = tblist[index + 1]
      nextchild.isAnswer = true
      if (nextchild.ChildTypeID === 0) this.showBlock(nextchild)
      else this.showTemplate(nextchild)
    },
    showBlock: function (child) {
      child.applicationBlock.answers[0].StatusID = 1
    },
    showTemplate: function (child) {
      let atemplate = child.applicationTemplates[0]
      atemplate.isAnswer = true
    },
    resetLeftChildren: function (child) {
      let atemplate = this.applicationTemplate
      let index = atemplate.templateBlocks.indexOf(child)
      for (let i = index + 1; i < atemplate.templateBlocks.length; i++) {
        let tb = atemplate.templateBlocks[i]
        if (tb.ChildTypeID === 0) this.resetBlock(tb.applicationBlock)
        else this.resetTemplate(tb.applicationTemplate)
      }
    },
    resetBlock: function (cb) {
      cb.answers.forEach(ca => {
        ca.StatusID = 0
        if (ca.IsRoute && ca.TypeID === 6) {
          ca.checkvalue = 0
          ca.hasAnswer = false
        }
      })
    },
    resetTemplate: function (atemplate) {
      atemplate.applicationBlocks.forEach(ab => this.resetBlock(ab))
    },
    skipLeftChildren: function (child) {
      let atemplate = this.applicationTemplate
      let index = atemplate.templateBlocks.indexOf(child)
      for (let i = index + 1; i < atemplate.templateBlocks.length; i++) {
        let tb = atemplate.templateBlocks[i]
        if (tb.ChildTypeID === 0) this.skipBlock(tb.applicationBlock)
        else this.skipTemplate(tb.applicationTemplate)
      }
    },
    skipBlock: function (cb) {
      cb.answers.forEach(ca => {
        ca.StatusID = 2
      })
    },
    skipTemplate: function (ct) {
      ct.applicationBlocks.forEach(cb => {
        this.skipBlock(cb)
      })
    },
    childCheckOver: function (tblock) {
      if (tblock.ChildTypeID === 0) {
        if (tblock.applicationBlock.StatusID !== 1) {
          tblock.StatusID = 0
        } else tblock.StatusID = 1
      } else {
        tblock.StatusID = 1
        tblock.applicationTemplates.forEach(atemplate => {
          if (atemplate.StatusID === 0) {
            tblock.StatusID = 0
          }
        })
      }
      if (tblock.StatusID === 1) this.checkOver()
    },
    checkOver: function () {
      let atemplate = this.applicationTemplate
      atemplate.StatusID = 1
      this.applicationTemplate.templateBlocks.forEach(tb => {
        if (tb.StatusID !== 1) atemplate.StatusID = 0
      })
      if (atemplate.StatusID === 1) this.$emit('checkOver')
    }
  }
}
</script>

<style scoped>

</style>
