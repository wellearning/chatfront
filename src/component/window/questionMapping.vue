<template>
  <div>
    <el-form :model="mappingForm" ref="mappingForm" class="">
      <el-row :gutter="20" class="subtitle">
        <el-col :span="24">
          <el-form-item label="Question" prop="QuestionID">
            <span>{{question.Description}}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-form-item label="PDF Type" prop="CurrentPdfType">
          <el-select v-model="currentPdfType" placeholder="Data Node" no-data-text="No Record">
            <el-option v-for="item in pdfTypes" :key="item.Name" :label="item.Name" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-form-item label="Data Nodes" prop="DataNodes">
          <el-select v-model="mappingForm.DataNodes" placeholder="Data Node" no-data-text="No Record" multiple filterable >
            <el-option v-for="item in dataNodes" :key="item.Name" :label="item.Name" :value="item.Name"></el-option>
          </el-select>
        </el-form-item>
      </el-row>
      <el-row :gutter="20" class="subtitle">
        <el-form-item label="DataMethod" prop="MethodID">
          <el-select v-model="mappingForm.MethodID" placeholder="Data Node" no-data-text="No Record">
            <el-option v-for="item in mappingMethods" :key="item.key" :label="item.value" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-row>
      <div class="newMemo-submit">
        <el-button icon="el-icon-check" type="primary" @click="save" :loading="isSaving">Save</el-button>
        <el-button icon="el-icon-check" type="primary" @click="remove" :loading="isRemoving">Remove</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'sendEmail',
  data: function () {
    return {
      isDev: true,
      rootUrl: '',
      serviceUrl: '',
      handleUrl: '',
      isSaving: false,
      isRemoving: false,
      isLoadingMappingMethods: false,
      isLoadingPdfTypes: false,
      currentPdfType: null,
      pdfTypes: [],
      dataNodes: [],
      mappingMethods: [],
      multipleSelection: [],
      mappingForm: {
        QuestionID: 1,
        DataNodes: [],
        MethodID: 0
      }
    }
  },
  props: {
    question: {
      type: Object
    }
  },
  mounted: function () {
    this.rootUrl = this.isDev ? 'http://localhost:65033' : 'http://18.225.254.140:8085'
    this.serviceUrl = this.rootUrl + '/Services/baseService.ashx'
    this.handleUrl = this.rootUrl + '/Services/basehandle.ashx'
    this.loadMappingMethod()
    this.loadPdfTypes()
  },
  methods: {
    handleSuccess: function (response, file, fileList) {
      // 文件上传成功的回调
      this.$message({
        type: 'success',
        message: 'Attach files uploaded'
      })
      this.mappingForm.Attaches.push(file.name)
    },
    loadMappingMethod: function () {
      this.isLoadingMappingMethods = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'MappingMethod'}).then(res => {
        if (res) {
          console.log('MappingMethods', res)
          this.mappingMethods = res.data
        }
        this.isLoadingMappingMethods = false
      }).catch(err => {
        console.log('loadingMappingMethods error', err)
        this.isLoadingMappingMethods = false
      })
    },
    loadPdfTypes: function () {
      this.isLoadingPdfTypes = true
      let service = this.serviceUrl + '/GetPdfTypes'
      this.axios.post(service, {}).then(res => {
        if (res) {
          console.log('pdfTypes', res)
          this.pdfTypes = res.data
        }
        this.isLoadingPdfTypes = false
      }).catch(err => {
        console.log('loadPdfTypes error', err)
        this.isLoadingPdfTypes = false
      })
    },
    setQuestion: function (q) {
      this.Question = q
    },
    save: function () {
    },
    remove: function () {
    }
  }
}
</script>

<style scoped>

</style>
