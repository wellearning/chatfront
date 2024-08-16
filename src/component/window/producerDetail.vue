<template>
  <div class="inPageContent">
    <div class="searchBox">
      <el-main class="" >
        <el-row :gutter="20" class="title" v-loading="isLoadingProducer">
          <el-col :span="3" class="">Summary of {{producer.ProducerName}}: </el-col>
          <el-col :span="3">NB Counts: {{producer.NBCounts}}</el-col>
          <el-col :span="4">NB Premium: ${{producer.NBPremium.toLocaleString()}}</el-col>
          <el-col :span="3">Remarket Counts: {{producer.RemarketCounts}}</el-col>
          <el-col :span="4">Remarket Premium: ${{producer.RemarketPremium.toLocaleString()}}</el-col>
          <el-col v-if="businessLineID===2" :span="3">Renewal Counts: {{producer.RenewalCounts}}</el-col>
          <el-col v-if="businessLineID===2" :span="4">Renewal Premium: ${{producer.RenewalPremium.toLocaleString()}}</el-col>
          <el-col v-if="businessLineID===1" :span="4">Score Average: {{producer.ScoreAverage}}</el-col>
        </el-row>
      </el-main>
    </div>
    <el-table :data="objects.slice((producercurrentPage - 1) * pageSize, producercurrentPage * pageSize)" empty-text="No Record" v-loading="isLoadingProducer" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
      <el-table-column v-if="businessLineID===1" label="ID" prop="CoverLetterID" width="80" fixed="left" sortable="custom">
      </el-table-column>
      <el-table-column v-if="businessLineID===2" label="ID" prop="BusinessID" width="80" fixed="left" sortable="custom">
      </el-table-column>
      <!--el-table-column label="" prop="ClientCode" min-width="1"></el-table-column-->
      <el-table-column label="Client Code" prop="ClientCode" min-width="100" sortable="custom">
      </el-table-column>
      <el-table-column v-if="businessLineID===2" label="PolicyNumber" prop="PolicyNumber" min-width="120" sortable="custom">
      </el-table-column>
      <el-table-column v-if="businessLineID===1" label="Named Insured(s)" prop="NameInsured" min-width="150" sortable="custom">
      </el-table-column>
      <el-table-column v-if="businessLineID===1" label="App Type" prop="LeadsFrom" min-width="100" sortable="custom">
      </el-table-column>
      <el-table-column v-if="businessLineID===2" label="App Type" prop="TypeName" min-width="100" sortable="custom">
      </el-table-column>
      <el-table-column label="Company" prop="CorpName" min-width="150" sortable="custom">
      </el-table-column>
      <el-table-column v-if="businessLineID===1" label="Line of Business" prop="Title" min-width="150" sortable="custom"></el-table-column>
      <el-table-column label="Effective Date" prop="EffectiveDate" min-width="120" sortable="custom">
      </el-table-column>
      <el-table-column v-if="businessLineID===1" label="Status" prop="StatusName" min-width="120" sortable="custom"></el-table-column>
      <el-table-column v-if="businessLineID===1" label="APP Premium" prop="PremiumOnApp" min-width="120" sortable="custom">
      </el-table-column>
      <el-table-column label="Premium" prop="Premium" min-width="120" sortable="custom">
      </el-table-column>
      <el-table-column v-if="businessLineID===1" label="UW Score" prop="Score" min-width="80" sortable="custom">
      </el-table-column>
      <el-table-column v-if="businessLineID===1" label="Quality Score" prop="QualityScore" min-width="80" sortable="custom">
      </el-table-column>
      <el-table-column v-if="businessLineID===1" label="Detail" prop="" min-width="80">
        <template v-slot="scope" >
          <a v-if="scope.row.Score>0||scope.row.QualityScore>0" @click = "showCoverLetter(scope.row)" href="#" style="color:darkblue" title="Click here to show the details.">detail</a>
        </template>
      </el-table-column>

    </el-table>
    <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=producercurrentPage layout="prev, pager, next" :total=producertotal class="pageList">
    </el-pagination>
    <div v-if="coverLetterVisible">
      <CoverLetterDetail ref="letterD" :coverLetter="currentCoverLetter"></CoverLetterDetail>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import CoverLetterDetail from '@/component/window/coverLetterDetail'

export default {
  components: {
    CoverLetterDetail
  },
  name: 'viewCoverLetter',
  data: function () {
    return {
      isLoadingProducer: false,
      coverLetterVisible: false,
      isLoadingInsuranceCompany: false,
      insuranceCorps: [],
      currentCoverLetter: null,
      /* producer: {
        producerName: null,
        NBCounts: 0,
        RemarketCounts: 0,
        NBPremium: 0,
        RemarketPremium: 0,
        RenewalCounts: 0,
        RenewalPremium: 0,
        ScoreAverage: 0
      },
      */
      objects: [],
      producercurrentPage: 1,
      producertotal: 0,
      pageSize: 10,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  props: {
    producer: {
      type: Object
    },
    searchForm: {
      type: Object
    },
    businessLineID: {
      type: Number
    }
  },
  mounted: function () {
    this.loadAppTypes()
    this.loadInsuranceCorps()
    if (this.businessLineID === 2) {
      this.loadApplicationStatus()
    }
    this.loadProducerDetails(0)
  },
  methods: {
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
    },
    rank: function (name) {
      this.objects.sort(this.by(name))
    },
    rankdesc: function (name) {
      this.objects.sort(this.bydesc(name))
    },
    loadApplicationStatus: function () {
      this.isLoadingStatus = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'ApplicationStatus'}).then(res => {
        if (res) {
          console.log('statusList', res)
          this.appStatusList = res.data
        }
        this.isLoadingStatus = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingStatus = false
      })
    },
    loadAppTypes: function () {
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'AppType'}).then(res => {
        if (res) {
          console.log('statusList', res)
          this.appTypeList = res.data
        }
        this.isLoading = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoading = false
      })
    },
    loadInsuranceCorps: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetBrokageInsuranceCorps', {}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          this.insuranceCorps = res.data
          this.isLoadingInsuranceCompany = false
          this.attachInfo()
        }
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    loadProducer: function (id, searchForm) {
      this.producer.ProducerID = id
      if (searchForm !== undefined) this.searchForm = searchForm
      this.loadProducerDetails(0)
    },
    attachInfo: function () {
      if (this.isLoadingInsuranceCompany || this.isLoadingProducer) return
      this.objects.forEach(c => {
        if (c.appPremium !== undefined) c.appPremium = '$' + c.PremiumOnApp.toLocaleString()
        c.submitPremium = '$' + c.Premium.toLocaleString()
        c.EffectiveDate = moment(c.EffectiveDate).format('YYYY-MM-DD')
        let corp = this.insuranceCorps.find(ic => ic.InsuranceCorpID === c.InsuranceCorpID)
        if (corp === undefined) c.CorpName = ''
        else c.CorpName = corp.ShortName
        if (this.businessLineID === 2) {
          let status = this.appStatusList.find(co => co.key === c.Status)
          if (status !== undefined) c.StatusName = status.value
          else c.StatusName = ''
          let type = this.appTypeList.find(co => co.key === c.AppTypeID)
          if (type !== undefined) c.TypeName = type.value
          else c.TypeName = ''
        }
      })
    },
    loadProducerDetails: function (start) {
      let producerid = this.producer.ProducerID
      let businessLineID = this.businessLineID
      let year = this.searchForm.Year
      let month = this.searchForm.Month
      this.isLoadingProducer = true
      let service = '/api/Services/NewBusinessService.asmx/GetCoverLetters_producer_start'
      let param = {producerid: producerid, year: year, month: month, start: start}
      if (this.viewMonthly === 'Year to Date') {
        service = '/api/Services/NewBusinessService.asmx/GetCoverLetters_producer_year_start'
        param = {producerid: producerid, year: year, start: start}
      }
      if (businessLineID === 2) {
        service = '/api/Services/CommerceService.asmx/GetProducerDetails'
        if (this.viewMonthly === 'Year to Date') {
          service = '/api/Services/CommerceService.asmx/GetProducerDetails_year'
        }
        // service = service.replace('NewBusinessService', 'CommerceService')
        // service = service.replace('CoverLetter', 'Term')
        // service = service.replace('_start', '')
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadProducerDetails:' + start, res)
          if (start === 0) {
            this.objects = res.data
            this.producertotal = res.count
            this.producercurrentPage = 1
          } else {
            this.objects = this.objects.concat(res.data)
          }
          if (this.objects.length < this.producertotal) {
            this.loadProducerDetails(this.objects.length)
          } else {
            this.isLoadingProducer = false
            this.attachInfo()
          }
        }
      }).catch(err => {
        console.log('loadProducerDetails', err)
        this.isLoadingProducer = false
      })
    },
    showCoverLetter: function (letter) {
      this.currentCoverLetter = letter
      this.coverLetterVisible = true
      if (this.$refs.letterD !== undefined) {
        this.$refs.letterD.loadProperties(letter.CoverLetterID)
      }
    }
  }
}
</script>

<style scoped>

</style>
