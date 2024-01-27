<template>
<div>
  <el-main :model="coverLetter" class="newMemo" >
    <el-row :gutter="20" class="title">
      <el-col :span="2">ID: {{coverLetter.CoverLetterID}}</el-col>
      <el-col :span="2">Code: {{coverLetter.ClientCode}}</el-col>
      <el-col :span="3">Name: {{coverLetter.NameInsured}}</el-col>
      <el-col :span="4">Date: {{dateFormat(coverLetter.EffectiveDate)}}</el-col>
      <el-col :span="7">Title: {{coverLetter.Title}}</el-col>
      <el-col :span="3">Corp: {{coverLetter.CorpName}}</el-col>
      <el-col :span="3">User: {{coverLetter.Author}}</el-col>
    </el-row>
  </el-main>
  <el-form ref="properties" class="newMemo">
    <el-row v-for="p in properties" :gutter="20" class="subtitle" :key="p.ParameterID">
      <el-col :span="4">&#12288;</el-col>
      <el-col :span="8">
        {{p.parameter.DisplayName}}
      </el-col>
      <el-col :span="11">
        <el-form-item>
          <el-checkbox v-if="p.parameter.DataType === 'Check'"  class="additionContent" v-model="p.Value"></el-checkbox>
          <el-input v-if="p.parameter.DataType === 'Text'" class="additionContent" v-model="p.Value" size="mini" placeholder="Text" style="width: 300px;"></el-input>
          <el-date-picker v-else-if="p.parameter.DataType === 'DateTime'" class="additionContent" v-model="p.Value" type="date" size="mini" placeholder="yyyy-mm-dd"></el-date-picker>
          <el-input v-else-if="p.parameter.DataType === 'Number'" class="additionContent" v-model="p.Value" size="mini"  placeholder="Number" style="width: 300px;"></el-input>
          <el-select v-else-if="p.parameter.DataType === 'List'" class="additionContent"  v-model="p.Value" size="mini"  placeholder="Please Select"  style="width: 300px;" no-data-text="No Data" filterable>
            <el-option class="questionOption" v-for="item in p.parameter.listValues" :key="item.Value" :label="item.Name" :value="item.Value"></el-option>
          </el-select>
          <el-input v-else-if="p.parameter.DataType === 'Computed'" class="additionContent" v-model="p.Value" size="mini" disabled="disabled" placeholder="Text" style="width: 300px;"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
  <div class="newMemo-submit">
    <el-button icon="el-icon-check" type="primary" @click="save(false)" :loading="isLoading ">Save</el-button>
    <!--el-button v-if="coverLetter.StatusID === processingtypeid || processingtypeid === 3" icon="el-icon-check" type="primary" @click="save(true)" :loading="isLoading ">Finish</el-button-->
    <el-button v-if="coverLetter.Status === processingtypeid || processingtypeid === 3 || (processingtypeid === 2 && !coverLetter.UploadAudited) || (processingtypeid === 4 && !coverLetter.UWAudited)|| (processingtypeid === 5 && !coverLetter.Uploaded)" icon="el-icon-check" type="primary" @click="save(true)" :loading="isLoading ">Finish</el-button>
  </div>
</div>
</template>

<script>
import moment from 'moment'

export default {
  components: {
  },
  name: 'editAutoCoverLetter',
  data: function () {
    return {
      printDate: null,
      isLoading: false,
      typeid: null,
      properties: []
    }
  },
  props: {
    processingtypeid: {type: Number},
    coverLetter: {
      type: Object
    }
  },
  mounted: function () {
    this.typeid = this.processingtypeid
    this.loadProperties(this.processingtypeid)
  },
  methods: {
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    loadProperties: function (typeid, coverletterid) {
      this.isLoading = true
      if (coverletterid === undefined) coverletterid = this.coverLetter.CoverLetterID
      // coverletterid = this.coverLetter.CoverLetterID
      this.typeid = typeid
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetterProperties', {coverletterid: coverletterid, processingtypeid: typeid}).then(res => {
        if (res) {
          console.log('GetCoverLetterProperties', res)
          this.properties = res.data
          this.properties.forEach(p => {
            if (p.parameter.DataType === 'Check') p.Value = p.Value === 'True'
          })
          // if (!this.isLoading) this.matchAnswerBlockQuestion()
        }
        this.isLoading = false
      }).catch(err => {
        console.log('GetCoverLetterProperties', err)
        this.isLoading = false
      })
    },
    // 关闭Pink Slip
    close: function () {
      this.properties = []
    },
    closeview: function () {
      this.properties = []
    },
    // 提交
    save: function (finished) {
      let enterdate = this.properties.find(p => p.Name === 'EnterDate')
      if (enterdate !== undefined) {
        enterdate.Value = moment(enterdate.Value).format('YYYY/MM/DD hh:mm:ss')
      }
      let value = JSON.stringify(this.properties)
      this.isLoading = true
      this.axios.post('/api/Services/NewBusinessService.asmx/SaveCoverLetterProperties', {properties: value, processingtypeid: this.typeid, finished: finished}).then(res => {
        if (res) {
          console.log('SaveCoverLetterProperties', res)
          if (res.data !== null) {
            this.coverLetter.Status = res.data.Status
            this.coverLetter.StatusID = res.data.StatusID
            this.coverLetter.Score = res.data.Score
            this.coverLetter.QualityScore = res.data.QualityScore
            this.coverLetter.UploadAudited = res.data.UploadAudited
            this.coverLetter.UWAudited = res.data.UWAudited
          }
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          this.$emit('close')
        }
        this.isLoading = false
      }).catch(err => {
        console.log('修改出错', err)
        this.isLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
