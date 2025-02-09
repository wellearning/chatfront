<!--
FileName: Reports/managerReport.vue
Author: Ge Chen
Update Date: 2024/6/26
Function: Show manager report.
-->
<template>
  <div>
    <div class="inPageTitle">
      <a class="inPageNav" href="#" @click="showMain" style="color:darkblue" title="Click here to return to the main report.">Brokage Report</a>
      <div class="rightBtnBox">
        <el-select v-model="searchForm.FigureID" placeholder="" class="yearMonthSelection" no-data-text="No Record" filterable @change="showMain()">
          <el-option v-for="item in reportItems" :key="item.key" :label="item.value" :value="item.key"></el-option>
        </el-select>
        <el-button icon="el-icon-refresh" @click="exportExcel()" :loading="isLoading" size="middle">ToExcel</el-button>
        <!--el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item>
            <el-button icon="el-icon-arrow-left" type="default" title="Prev Month" @click="prevMonth()" :loading="isLoading "></el-button>
          </el-form-item>
          <el-form-item label="Year" prop="Year">
            <el-select v-model="searchForm.Year" placeholder="" class="yearMonthSelection" no-data-text="No Record" filterable @change="changeYear()">
              <el-option v-for="item in searchForm.years" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Month" prop="Month">
            <el-select v-model="searchForm.Month" placeholder="" class="yearMonthSelection" no-data-text="No Record" filterable @change="changeYearMonth()">
              <el-option v-for="item in searchForm.months" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-arrow-right" type="default" title="Next Month" @click="nextMonth()" :loading="isLoading "></el-button>
          </el-form-item>
        </el-form-->
      </div>
    </div>
    <div v-if="managerVisible" class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
        </el-main>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="BrokageID" width="60" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column label="Name" prop="Name" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column label="Total Users" prop="TotalStaffCount" min-width="120" sortable="custom">
        </el-table-column>
        <el-table-column label="Active Users" prop="ActiveStaffCount" min-width="120" sortable="custom">
        </el-table-column>
        <el-table-column label="Memos" prop="PLMemoCount" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="PLCoverLetters" prop="PLCoverLetterCount" min-width="120" sortable="custom">
        </el-table-column>
        <el-table-column label="CL Applications" prop="CLApplicationCount" min-width="120" sortable="custom">
        </el-table-column>
        <el-table-column label="IRCAs" prop="IRCACount" min-width="120" sortable="custom">
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
    </div>
    <div v-else class="inPageContent">
      <div class="searchBox">
        <el-main class="" >
        </el-main>
      </div>
      <el-table :data="hlist.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="Year" prop="Year" width="60" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column label="Month" prop="Month" width="60" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column label="Chat" prop="Chat" min-width="150" sortable="custom">
        </el-table-column>
        <el-table-column label="BT" prop="BT" min-width="120" sortable="custom">
        </el-table-column>
        <el-table-column label="BU" prop="BU" min-width="120" sortable="custom">
        </el-table-column>
        <el-table-column label="AZ" prop="AZ" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column label="PSI" prop="PSI" min-width="120" sortable="custom">
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
    </div>
    <div>
      <el-row v-if="managerVisible">
        <el-col :span="8">
          <v-chart :options="optionStaffCount"/>
        </el-col>
        <el-col :span="8">
          <v-chart :options="optionMemoCount"/>
        </el-col>
        <el-col :span="8">
          <v-chart :options="optionCoverLetterCount"/>
        </el-col>
      </el-row>
      <el-row v-if="managerVisible">
        <el-col :span="8">
          <v-chart :options="optionApplicationCount"/>
        </el-col>
        <el-col :span="8">
          <v-chart :options="optionIRCACount"/>
        </el-col>
      </el-row>
      <el-row v-if="!managerVisible">
        <el-col :span="8">
          <v-chart :options="optionChat"/>
        </el-col>
        <el-col :span="8">
          <v-chart :options="optionBT"/>
        </el-col>
        <el-col :span="8">
          <v-chart :options="optionBU"/>
        </el-col>
      </el-row>
      <el-row v-if="!managerVisible">
        <el-col :span="8">
          <v-chart :options="optionAZ"/>
        </el-col>
        <el-col :span="8">
          <v-chart :options="optionPsi"/>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import ECharts from 'vue-echarts'
import 'echarts/lib/component/title'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/polar'
export default {
  components: {
    'v-chart': ECharts
  },
  data: function () {
    return {
      optionStaffCount: {
        title: {
          text: 'Total Users'
        },
        legend: {
          data: ['total', 'active']
        },
        xAxis: {
          type: 'category',
          data: ['Chat', 'Bti', 'BU', 'AZ', 'PSI']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'total',
            data: [],
            type: 'line'
          },
          {
            name: 'active',
            data: [],
            type: 'line'
          }
        ]
      },
      optionMemoCount: {
        title: {
          text: 'Total Memos'
        },
        xAxis: {
          type: 'category',
          data: ['Chat', 'Bti', 'BU', 'AZ', 'PSI']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [],
            type: 'line'
          }
        ]
      },
      optionCoverLetterCount: {
        title: {
          text: 'Total Coverletters'
        },
        xAxis: {
          type: 'category',
          data: ['Chat', 'Bti', 'BU', 'AZ', 'PSI']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [],
            type: 'bar'
          }
        ]
      },
      optionApplicationCount: {
        title: {
          text: 'Total CL Applications'
        },
        xAxis: {
          type: 'category',
          data: ['Chat', 'Bti', 'BU', 'AZ', 'PSI']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [],
            type: 'bar'
          }
        ]
      },
      optionIRCACount: {
        title: {
          text: 'Total IRCA'
        },
        xAxis: {
          type: 'category',
          data: ['Chat', 'Bti', 'BU', 'AZ', 'PSI']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [],
            type: 'bar'
          }
        ]
      },
      optionChat: {
        title: {
          text: 'Chat'
        },
        xAxis: {
          type: 'category',
          data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [],
            type: 'line'
          },
          {
            data: [],
            type: 'line'
          },
          {
            data: [],
            type: 'line'
          }
        ]
      },
      optionBT: {
        title: {
          text: 'Chat'
        },
        xAxis: {
          type: 'category',
          data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [],
            type: 'line'
          },
          {
            data: [],
            type: 'line'
          },
          {
            data: [],
            type: 'line'
          }
        ]
      },
      optionBU: {
        title: {
          text: 'Chat'
        },
        xAxis: {
          type: 'category',
          data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [],
            type: 'line'
          },
          {
            data: [],
            type: 'line'
          },
          {
            data: [],
            type: 'line'
          }
        ]
      },
      optionAZ: {
        title: {
          text: 'Chat'
        },
        xAxis: {
          type: 'category',
          data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [],
            type: 'line'
          },
          {
            data: [],
            type: 'line'
          },
          {
            data: [],
            type: 'line'
          }
        ]
      },
      optionPsi: {
        title: {
          text: 'Chat'
        },
        xAxis: {
          type: 'category',
          data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [],
            type: 'line'
          },
          {
            data: [],
            type: 'line'
          },
          {
            data: [],
            type: 'line'
          }
        ]
      },

      isPost: false,
      totalNum: 0,
      finishNum: 0,
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      htmlTitle: 'null', // pdf文件名
      isLoading: false,
      reportItems: [
        {key: 0, value: 'OverView'},
        {key: 3, value: 'PLMemoCount'},
        {key: 4, value: 'PLCoverLetterCount'},
        {key: 5, value: 'CLApplicationCount'},
        {key: 6, value: 'IRCACount'}
      ],
      // 搜索
      searchForm: {
        name: null,
        FigureID: 0,
        Year: 2022,
        Month: 1,
        years: [],
        months: [
          {name: 'January', value: 1},
          {name: 'February', value: 2},
          {name: 'March', value: 3},
          {name: 'April', value: 4},
          {name: 'May', value: 5},
          {name: 'June', value: 6},
          {name: 'July', value: 7},
          {name: 'August', value: 8},
          {name: 'September', value: 9},
          {name: 'October', value: 10},
          {name: 'November', value: 11},
          {name: 'December', value: 12}]
      },
      // 列表
      brokages: [],
      list: [],
      hlist: [],
      managerVisible: true,
      pageSize: 12,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  mounted: function () {
    this.searchForm.Year = new Date().getFullYear()
    this.searchForm.Month = new Date().getMonth() + 1
    for (let i = 2020; i <= this.searchForm.Year; i++) {
      this.searchForm.years.push(i)
    }
    this.showMain()
  },
  watch: {
    finishNum (val) {
      if (val === this.totalNum && this.isPost) {
        this.currentTemplates = this.currentTemplates.sort((a, b) => { return a.orderId - b.orderId })
        this.setNumber()
        this.totalNum = 0
        this.finishNum = 0
        this.isPost = false
        this.isLoading = false
      }
    }
  },
  methods: {
    switchRecords: function () {
      if (this.managerVisible) this.search()
      else this.loadProducer()
    },
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
    },
    rank: function (name) {
      if (this.managerVisible) this.list.sort(this.by(name))
      else {
        this.applicationlist.sort(this.by(name))
        // if (name.indexOf('Institution') >= 0) name = name.replace('Institution', 'Producer')
        // this.producers.sort(this.by(name))
      }
      // this.list.sort(this.by(name))
    },
    rankdesc: function (name) {
      if (this.managerVisible) this.list.sort(this.bydesc(name))
      else {
        this.applicationlist.bydesc(this.by(name))
        // if (name.indexOf('Institution') >= 0) name = name.replace('Institution', 'Producer')
        // this.producers.sort(this.bydesc(name))
      }
      // this.list.sort(this.bydesc(name))
    },
    prevMonth: function () {
      if (this.searchForm.Month === 1) {
        this.searchForm.Month = 12
        this.searchForm.Year--
        this.loadYearToDate()
      } else this.searchForm.Month--
      this.showMain()
    },
    nextMonth: function () {
      if (this.searchForm.Month === 12) {
        this.searchForm.Month = 1
        this.searchForm.Year++
        this.loadYearToDate()
      } else this.searchForm.Month++
      this.showMain()
    },
    changeYear: function () {
      this.loadYearToDate()
      this.showMain()
    },
    changeYearMonth: function () {
      this.showMain()
    },
    // 日期格式
    dateFormat (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    showMain: function () {
      if (this.searchForm.FigureID === 0) {
        this.managerVisible = true
        this.producerVisible = false
        this.applicationVisible = false
        this.loadBrokageData()
      } else {
        this.managerVisible = false
        this.producerVisible = true
        this.loadBrokageHistory(this.searchForm.FirgureID)
      }
    },
    // 查询
    loadBrokageData: function () {
      this.isLoading = true
      let service = '/api/Services/BaseService.asmx/GetBrokageData'
      let param = {year: this.searchForm.Year, month: this.searchForm.Month}

      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          let optiondata0 = []
          let optiondata1 = []
          let optiondata2 = []
          let optiondata3 = []
          let optiondata4 = []
          let optiondata5 = []
          let colors = ['#a912c0', '#e83d33', '#12ef33', '#5434ab', '#ed3298']
          let i = 0
          res.data.forEach(r => {
            optiondata0.push({value: r.TotalStaffCount, itemStyle: {color: colors[i]}})
            optiondata1.push({value: r.ActiveStaffCount, itemStyle: {color: colors[i]}})
            optiondata2.push({value: r.PLMemoCount, itemStyle: {color: colors[i]}})
            optiondata3.push({value: r.PLCoverLetterCount, itemStyle: {color: colors[i]}})
            optiondata4.push({value: r.CLApplicationCount, itemStyle: {color: colors[i]}})
            optiondata5.push({value: r.IRCACount, itemStyle: {color: colors[i]}})
            i++
          })
          this.optionStaffCount.series[0].data = optiondata0
          this.optionStaffCount.series[1].data = optiondata1
          this.optionMemoCount.series[0].data = optiondata2
          this.optionCoverLetterCount.series[0].data = optiondata3
          this.optionApplicationCount.series[0].data = optiondata4
          this.optionIRCACount.series[0].data = optiondata5
          this.list.sort(this.bydesc('TotalStaffCount'))
          this.total = this.list.length
          this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadBrokageData error', err)
        this.isLoading = false
      })
    },
    // 查询Brokage历史数据
    loadBrokageHistory: function (figureId) {
      this.isLoading = true
      let service = '/api/Services/BaseService.asmx/GetBrokageHistory'
      let param = {figureid: figureId}

      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('查询', res)
          res.data.forEach(r => {
            r.Chat = r.Figures[0]
            r.BT = r.Figures[1]
            r.BU = r.Figures[2]
            r.AZ = r.Figures[3]
            r.PSI = r.Figures[4]
          })
          this.hlist = res.data
          this.total = this.hlist.length
          this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadBrokageData error', err)
        this.isLoading = false
      })
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.search(null)
    },
    exportExcel: function () {
      let tablename = 'users.xlsx'
      this.downloadData('brokagesusers', '0', '0', tablename)
    }

  }
}
</script>

<style scoped>

</style>
