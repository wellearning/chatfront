<template>
  <div class="inPageContent">
    <div class="searchBox">
      <el-main class="" >
        <el-row :gutter="20" class="title" v-loading="isLoadingCoverLetter">
          <el-col :span="4" class="">CoverLetterID: {{coverLetter.CoverLetterID}} </el-col>
          <el-col :span="4">Client Code: {{coverLetter.ClientCode}}</el-col>
          <el-col :span="4">Name Insured: {{coverLetter.NameInsured}}</el-col>
          <el-col :span="4">Premium: ${{coverLetter.Premium.toLocaleString()}}</el-col>
          <el-col :span="4">UW Score: {{coverLetter.Score}}</el-col>
          <el-col :span="4">Quality Score: {{coverLetter.QualityScore}}</el-col>
        </el-row>
      </el-main>
    </div>
    <el-table :data="properties.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoadingCoverLetter" element-loading-background="rgba(255, 255, 255, 0.5)">
      <el-table-column label="ID" prop="PropertyID" width="100" fixed="left"></el-table-column>
      <!--el-table-column label="" prop="Name" min-width="1"></el-table-column-->
      <el-table-column label="Name" prop="Name" min-width="150"></el-table-column>
      <el-table-column label="Value" prop="Value" min-width="250"></el-table-column>
      <el-table-column label="UW Score" prop="Score" min-width="80"></el-table-column>
      <el-table-column label="Quality Score" prop="QualityScore" min-width="80"></el-table-column>

    </el-table>
    <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=letterTotal class="pageList">
    </el-pagination>
  </div>
</template>

<script>
export default {
  components: {
  },
  name: 'viewCoverLetter',
  data: function () {
    return {
      isLoadingCoverLetter: false,
      isLoadingInsuranceCompany: false,
      insuranceCorps: [],
      properties: [],
      pageSize: 10,
      pagerCount: 5,
      currentPage: 1,
      letterTotal: 0
    }
  },
  props: {
    coverLetter: {
      type: Object
    }
  },
  mounted: function () {
    this.loadProperties()
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
    loadProperties: function (id) {
      let coverletterid = this.coverLetter.CoverLetterID
      if (id !== undefined) coverletterid = id
      this.isLoading = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetCoverLetterProperties_score', {coverletterid: coverletterid, processingtypeid: 1}).then(res => {
        if (res) {
          console.log('loadProperties', res)
          this.properties = res.data
          this.letterTotal = this.properties.length
          this.currentPage = 1
          this.isLoading = false
        }
      }).catch(err => {
        console.log('loadProperties', err)
        this.isLoading = false
      })
    }

  }
}
</script>

<style scoped>

</style>
