<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Producer Statistics</span>
      <div class="rightBtnBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="Start Date" prop="StartDate">
            <el-date-picker v-model="searchForm.StartDate" type="date" placeholder="yyyy-mm-dd" ></el-date-picker>
          </el-form-item>
          <el-form-item label="End Date" prop="EndDate">
            <el-date-picker v-model="searchForm.EndDate" type="date" placeholder="yyyy-mm-dd" ></el-date-picker>
          </el-form-item>
          <el-form-item label="Business Property" prop="BusinessProperty">
            <el-select v-model="searchForm.ParameterID" placeholder="" no-data-text="No Record" filterable>
              <el-option v-for="item in businessParameters" :key="item.ParameterID" :label="item.DisplayName" :value="item.ParameterID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="statistics()" :loading="isLoading ">Go!</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="inPageContent">
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="" prop="ProducerID" width="60" fixed="left">
          <template slot="header" >
            <span @click = "rank('ProducerID')" @dblclick="rankdesc('ProducerID')" title="Click to rank, double click to rank desc">ID</span>
          </template>
        </el-table-column>
        <el-table-column label="" prop="ProducerName" min-width="150">
          <template slot="header" >
            <span @click = "rank('ProducerName')" @dblclick="rankdesc('ProducerName')" title="Click to rank, double click to rank desc">Producer Name</span>
          </template>
        </el-table-column>
        <!--el-table-ciolumn label="" prop="ProducerName" min-width="150">
          <template slot="header" >
            <span @click = "rank('ProducerName')" @dblclick="rankdesc('ProducerName')" title="Click to rank, double click to rank desc">ProducerName</span>
          </template>
        </el-table-ciolumn-->
        <el-table-column label="" prop="NBCounts" min-width="100">
          <template slot="header" >
            <span @click = "rank('NBCounts')" @dblclick="rankdesc('NBCounts')" title="Click to rank, double click to rank desc">Counts</span>
          </template>
        </el-table-column>
        <el-table-column  prop="NBPremium" min-width="100">
          <template slot="header" >
            <span @click = "rank('NBPremium')" @dblclick="rankdesc('NBPremium')" title="Click to rank, double click to rank desc">Premium</span>
          </template>
          <template slot-scope="scope" >
            <span>${{scope.row.NBPremium.toLocaleString()}}</span>
          </template>
        </el-table-column>
        <el-table-column v-for="(col, index) in tableColumns" :key="index" :label="col.Name" :prop="col.Prop" min-width="100">
          <!--template slot="header" >
            <span @click = "rank(col)" @dblclick="rankdesc(col)" title="Click to rank, double click to rank desc">{{col}}</span>
          </template-->
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  components: {

  },
  data: function () {
    return {
      businessParameters: [],
      tableColumns: [],
      parameter: null,
      isLoading: false,
      isLoadingYearToDate: false,
      // 搜索
      searchForm: {
        StartDate: moment(new Date()),
        EndDate: moment(new Date()),
        ParameterID: 0
      },
      searchName: null,
      // 列表
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  mounted: function () {
    this.loadBusinessParameters()
  },
  watch: {
  },
  methods: {
    rank: function (name) {
      console.log('rank')
      this.list.sort(this.by(name))
    },
    rankdesc: function (name) {
      console.log('rank')
      this.list.sort(this.bydesc(name))
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    setColumns (parameter) {
      if (parameter.DataType === 'Check') {
        this.tableColumns = [{'Name': 'Counts of ' + parameter.DisplayName, 'Prop': 'RemarketCounts'}, {'Name': 'Premium of ' + parameter.DisplayName, 'Prop': 'RemarketPremium'}]
      } else if (parameter.DataType === 'List') {
        this.tableColumns = []
        for (var i = 0; i < parameter.listValues.length; i++) {
          // this.tableColumns.push(parameter.listValues[i].Name)
          this.tableColumns.push({'Name': 'Counts of ' + parameter.listValues[i].Name, 'Prop': 'ListCounts' + i})
        }
      }
    },
    loadBusinessParameters: function () {
      this.isLoadingYearToDate = true
      this.axios.post('/api/Services/BaseService.asmx/GetBusinessParameters', {businesstypeid: 2, processingtypeid: 1}).then(res => {
        if (res) {
          console.log('查询', res)
          this.businessParameters = res.data
          this.searchForm.ParameterID = this.businessParameters[0].ParameterID
        }
        this.isLoadingYearToDate = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoadingYearToDate = false
      })
    },
    statistics: function () {
      this.parameter = this.businessParameters.find(p => p.ParameterID === this.searchForm.ParameterID)
      this.setColumns(this.parameter)
      this.search()
    },
    // 查询
    search: function () {
      this.isLoading = true
      let startdate = moment(this.searchForm.StartDate).format('YYYY-MM-DD')
      let enddate = moment(this.searchForm.EndDate).format('YYYY-MM-DD')
      this.axios.post('/api/Services/NewBusinessService.asmx/GetProducerStatistics', { parameterid: this.searchForm.ParameterID, startdate: startdate, enddate: enddate }).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          this.list.sort(this.bydesc('NBPremium'))
          if (this.parameter.DataType === 'List') {
            this.list.forEach(function (item) {
              for (var i = 0; i < item.listValueRecords.length; i++) {
                item['ListCounts' + i] = item.listValueRecords[i].Count
                item['ListPremium' + i] = item.listValueRecords[i].Premium
              }
            })
          }
          this.total = this.list.length
          this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchName = null
      this.search(null)
    }

  }
}
</script>

<style scoped>

</style>
