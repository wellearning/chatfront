<template>
  <div>
    <div v-if="activity!==null">
      <el-row :gutter="20" class="inPageNav">
        <el-col :span="10">
          <span>{{ activity.Name }}</span>
        </el-col>
        <el-col :span="5">
          <span v-if="activity.StartTime !== undefined">Start from: {{ activity.StartTime.format('YYYY-MM-DD') }}</span>
        </el-col>
        <el-col :span="5">
          <span v-if="activity.EndTime !== undefined">to: {{ activity.EndTime.format('YYYY-MM-DD') }}</span>
        </el-col>
        <el-col :span="4" style="font-size: 14px;" >
          <span>{{ date.format('YYYY-MM-DD hh:mm:ss') }}</span>
          <i v-if="rankListVisible" class="el-icon-caret-top" @click="showRankList"></i>
          <i v-else class="el-icon-s-data" @click="showRankList"></i>
          <!--i v-if="rankListVisible" :class="historyClass" @click="showHistory"></i-->
          <i v-if="historyVisible" :class="playClass" @click="playHistory"></i>
          <i v-if="historyVisible" class="el-icon-d-arrow-right" @click="speedUp"></i>
          <i v-if="historyVisible" class="el-icon-d-arrow-left" @click="speedDown"></i>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="" style="padding:10px; font-size: 18px;">
        <el-col :span="24">
          <span>{{ activity.Introduce }}</span>
        </el-col>
      </el-row>
      <div v-if="rankListVisible" style="font-size:16px; line-height: 24px;">
        <el-row :gutter="20" style="margin:10px; ">
          <el-col :span="24" style="text-align: center; font-size: 18pt;">
            <span>{{ endDate.format('YYYY-MM-DD') }}</span>
          </el-col>
        </el-row>
        <el-row v-for="(item, index) in rankList" :key="index" :gutter="20" style="margin:10px; ">
          <el-col :span="5" style="text-align: right;">
            <span>{{ item.name }}</span>
          </el-col>
          <el-col :span="14">
            <el-progress :stroke-width="26" :text-inside="true" :percentage="item.percentage" :format="customerFormat" :color="item.color"></el-progress>
          </el-col>
        </el-row>
        <!--el-row :gutter="20" style="margin:10px; ">
          <el-col :span="5" style="text-align: right;">
            <span>{{ gold.name }}</span>
          </el-col>
          <el-col :span="10">
            <el-progress :stroke-width="26" :text-inside="true" :percentage="gold.percentage" :format="customerFormat" :color="gold.color"></el-progress>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin:10px; ">
          <el-col :span="5" style="text-align: right;">
            <span>{{ silver.name }}</span>
          </el-col>
          <el-col :span="10">
            <el-progress :stroke-width="26" :text-inside="true" :percentage="silver.percentage" :format="customerFormat" :color="silver.color"></el-progress>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin:10px;">
          <el-col :span="5" style="text-align: right; margin-bottom: 10px;">
            <span>{{ bronze.name }}</span>
          </el-col>
          <el-col :span="10" style="padding-bottom: 10px;">
            <el-progress :stroke-width="26" :text-inside="true" :percentage="bronze.percentage" :format="customerFormat" :color="bronze.color"></el-progress>
          </el-col>
        </el-row-->
      </div>
      <div class="inPageContent">
        <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record"
                  v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable"
                  row-key="ID" :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        >
          <el-table-column label="ID" prop="ID" min-width="120" fixed="left" sortable="custom">
          </el-table-column>
          <el-table-column label="Name" prop="Name" min-width="150" sortable="custom">
          </el-table-column>
          <el-table-column v-if="statisticTypes.includes(2)" label="P/L Premium" prop="PLPremium" class="" min-width="150" sortable="custom">
            <template slot-scope="scope" >
              <span>${{scope.row.PLPremium.toLocaleString()}}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="statisticTypes.includes(4)" label="C/L Premium" prop="CLPremium" min-width="150" sortable="custom">
            <template slot-scope="scope" >
              <span>${{scope.row.CLPremium.toLocaleString()}}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="statisticTypes.includes(3)" label="IRCA Premium" prop="IRCAPremium" min-width="150" sortable="custom">
            <template slot-scope="scope" >
              <span>${{scope.row.IRCAPremium.toLocaleString()}}</span>
            </template>
          </el-table-column>
          <el-table-column label="Total Premium" prop="TotalPremium" min-width="150" sortable="custom">
            <template slot-scope="scope" >
              <span>${{scope.row.TotalPremium.toLocaleString()}}</span>
            </template>
          </el-table-column>
          <el-table-column v-for="(col, index) in activity.sponsors" :key="index" :label="col.Name" :prop="col.Name" min-width="150" sortable="custom" >
            <template slot-scope="scope" >
              <span>{{scope.row[col.Name]}}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
        </el-pagination>
      </div>
    </div>
    <div v-else>
      <el-row :gutter="20" class="inPageNav">
        <el-col :span="16">
          <div class="welcome">
            <img src="../../../assets/images/welcome.png">
            <p>Welcome, {{JSON.parse(this.$store.getters.getAccount).Name}}</p>
          </div>
        </el-col>
        <!--el-col :span="8" v-if="files.length > 0">
          <div>Useful files:</div>
          <div v-for="(item, index) in files" :key="index">
            <a :href="'/api' + 'upload/' + subPath + '/' + item">{{item}}</a>
          </div>
        </el-col-->
      </el-row>
    </div>

    <div>
      <!--label>
        AutoComplete
        <GmapAutocomplete style="width: 500px; height: 25px;"
                          :options="{
            componentRestrictions: { country: 'ca' },
          }"
                          :value="address" @place_changed="setPlace">
        </GmapAutocomplete>
        <button @click="usePlace">Add</button>
      </label>
      <el-input v-model="address"></el-input>
      <el-input v-model="city"></el-input>
      <el-input v-model="province"></el-input>
      <el-input v-model="postcode"></el-input>
      <br/>
      <GmapMap-- style="width: 100%; height: 700px;" :zoom="18" :center="{lat: 43.8596837, lng: -79.33951909999999}">
        <GmapMarker v-for="(marker, index) in markers"
                    :key="index"
                    :position="marker.position"
        />
        <GmapMarker
          v-if="this.place"
          label="★"
          :position="{
          lat: this.place.geometry.location.lat(),
          lng: this.place.geometry.location.lng(),
        }"
        />
      </GmapMap-->
    </div>

  </div>
</template>

<script>
import moment from 'moment'
export default {
  data: function () {
    return {
      rankListVisible: false,
      historyVisible: false,
      speed: 10,
      playStatus: 0,
      playClass: 'el-icon-video-play',
      historyClass: 'el-icon-film',
      date: moment(),
      endDate: moment(),
      days: 0,
      gold: {name: 'Justin', amount: 3432, color: '#238429', percentage: 100},
      silver: {name: 'James', amount: 1234, color: '#cd84c9', percentage: 90},
      bronze: {name: 'Brown', amount: 234, color: '#cd8429', percentage: 80},
      markers: [{position: {lat: 43.8596837, lng: -79.33951909999999}}],
      place: null,
      address: '101- 306 Town Centre Blvd, Markham, ON ',
      city: '',
      province: '',
      postcode: '',
      lat: 0,
      lng: 0,
      addressTypes: ['street_number', 'route', 'sublocality', 'locality', 'administrative_area_level_1', 'postal_code'],
      subPath: 'usefulFiles',
      businessTypes: [],
      statisticTypes: [],
      files: [],
      isLoading: false,
      isLoadingPL: false,
      isLoadingCL: false,
      isLoadingIRCA: false,
      sponsors: [],
      groupList: [],
      activity: null,
      rankList: [],
      list: [],
      pageSize: 15,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  mounted: function () {
    this.loadBusinessTypes()
    this.loadSponsors()
    this.loadActivity()
    this.loadDownloadFiles()
    this.interval = setInterval(this.updateClock, 1000)
  },
  methods: {
    loadBusinessTypes: function () {
      this.isLoadingHelpData = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'BusinessType'}).then(res => {
        if (res) {
          console.log('BusinessTypes', res)
          this.businessTypes = res.data
        }
        this.isLoadingHelpData = false
      }).catch(err => {
        console.log('BusinessTypes', err)
        this.isLoadingHelpData = false
      })
    },
    updateClock: function () {
      this.date = moment()
      if (!this.rankListVisible) return
      if (this.endDate > this.date.add(-1, 'd')) return
      if (!this.historyVisible) return
      if (this.playStatus === 1) return
      if (this.date.seconds() % this.speed === 0) {
        let startDate = moment('2024-06-01')
        this.days = this.days + 1
        this.endDate = startDate.add(this.days, 'd')
        this.loadStatistics(this.days)
      }
    },
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
    },
    rank: function (name) {
      this.list.sort(this.by(name))
      this.fillRank(name)
    },
    rankdesc: function (name) {
      this.list.sort(this.bydesc(name))
      this.fillRank(name)
    },
    customerFormat: function (percentage) {
      for (let i = 0; i < this.rankList.length; i++) {
        let item = this.rankList[i]
        if (percentage === item.percentage) return item.amount
      }
      return 0
      /*
      if (percentage === this.gold.percentage) return this.gold.amount
      else if (percentage === this.silver.percentage) return this.silver.amount
      else return this.bronze.amount
       */
    },
    fillRank: function (name) {
      if (this.list.length === 0) return
      if (this.isLoadingCL || this.isLoadingPL || this.isLoadingIRCA) return
      // let startDate = moment([2024, 5])
      // let days = this.date.dayOfYear() - startDate.dayOfYear()
      // this.endDate = startDate.add(this.days, 'd')
      // this.rankdesc('TotalPremium')
      let rankList = []
      let count = this.pageSize
      let topPremium = this.activity.TopValue// 600000 * days / 90 // this.list[0].TotalPremium
      this.list.forEach(a => {
        if (rankList.length >= count) return
        let att = {
          name: a.Name,
          amount: a.TotalPremium,
          color: a.color
        }
        if (name !== undefined && a[name] !== undefined) {
          att.amount = a[name]
        }
        att.percentage = att.amount / topPremium * 100
        rankList.push(att)
      })
      this.rankList = rankList
      console.log('rankList', rankList)
      /*
      if (this.list.length > 0) {
        this.gold.name = this.list[0].Name
        this.gold.amount = this.list[0].TotalPremium.toLocaleString()
      }
      if (this.list.length > 1) {
        this.silver.name = this.list[1].Name
        this.silver.amount = this.list[1].TotalPremium.toLocaleString()
        if (this.list[0].TotalPremium > 0) this.silver.percentage = this.list[1].TotalPremium / this.list[0].TotalPremium * 100
        else this.silver.percentage = 100
      }
      if (this.list.length > 2) {
        this.bronze.name = this.list[2].Name
        this.bronze.amount = this.list[2].TotalPremium.toLocaleString()
        if (this.list[0].TotalPremium > 0) this.bronze.percentage = this.list[2].TotalPremium / this.list[0].TotalPremium * 100
        else this.bronze.percentage = 100
      }
       */
    },
    showRankList: function () {
      if (this.rankListVisible) {
        this.rankListVisible = false
        this.historyVisible = false
        this.endDate = moment()
        this.loadStatistics()
      } else {
        this.rankListVisible = true
        this.days = 0
        // this.loadStatistics(this.days)
      }
    },
    showHistory: function () {
      if (this.historyVisible) {
        this.days = -1
        this.historyClass = 'el-icon-data-board'
        this.historyVisible = false
        this.endDate = moment()
        this.loadStatistics()
      } else {
        this.days = 0
        this.endDate = this.activity.StartTime
        this.historyClass = 'el-icon-film'
        this.historyVisible = true
        this.playStatus = 0
        this.playClass = 'el-icon-video-pause'
        this.loadStatistics(0)
      }
    },
    playHistory: function () {
      if (this.playStatus === 1) {
        this.playClass = 'el-icon-video-pause'
        this.playStatus = 0
      } else {
        this.playClass = 'el-icon-video-play'
        this.playStatus = 1
      }
    },
    speedUp: function () {
      if (this.speed > 5) this.speed -= 5
    },
    speedDown: function () {
      if (this.speed < 30) this.speed += 5
    },
    loadSponsors: function () {
      this.isLoadingSponsors = true
      this.axios.post('/api/Services/baseservice.asmx/GetSponsors', {}).then(res => {
        if (res) {
          console.log('GetSponsors', res)
          res.data.forEach(g => {
            let child = {
              SponsorID: g.InsuranceCorpID,
              Name: g.Name
            }
            this.sponsors.push(child)
          })
        }
        this.isLoadingSponsors = false
      }).catch(err => {
        console.log('GetSponsors', err)
        this.isLoadingSponsors = false
      })
    },
    loadActivity: function () {
      this.isLoadingOrganization = true
      this.axios.post('/api/Services/baseservice.asmx/GetCurrentActivity', {}).then(res => {
        if (res) {
          console.log('CurrentActivity', res)
          if (res.data === null) return
          res.data.StartTime = moment(res.data.StartTime)
          res.data.EndTime = moment(res.data.EndTime)
          if (res.data.StaticItems === null) res.data.businessTypes = []
          else res.data.businessTypes = res.data.StaticItems.split(',')
          this.activity = res.data
          res.data.attendees.forEach(r => {
            r.ID = r.AttendeeID
            r.PLCount = 0
            r.PLPremium = 0
            r.CLCount = 0
            r.CLPremium = 0
            r.IRCACount = 0
            r.IRCAPremium = 0
            r.TotalCount = 0
            r.TotalPremium = 0
            res.data.sponsors.forEach(s => {
              r[s.Name] = 0
            })
            r.children = []
            if (res.data.AttendeeTypeID === 1) this.loadAttendeeDetail(r)
          })
          this.activity = res.data
          this.list = res.data.attendees
          let r = 128
          let g = 32
          let b = 192
          let diff = 15
          let diff2 = 31
          let diff3 = 47
          res.data.attendees.forEach(a => {
            r += diff
            g -= diff2
            b += diff3
            if (r > 255) r = r - 256
            if (g < 0) g = g + 256
            if (b > 255) b = b - 256
            let hr = r.toString(16)
            let hg = g.toString(16)
            let hb = b.toString(16)
            if (hr.length === 1) hr = '0' + hr
            if (hg.length === 1) hg = '0' + hg
            if (hb.length === 1) hb = '0' + hb
            a.color = '#' + hr + hg + hb
          })
          this.total = this.list.length
          this.currentPage = 1
          this.isLoading = false
          this.loadStatistics()
        }
        this.isLoadingOrganization = false
      }).catch(err => {
        console.log('GroupList', err)
        this.isLoadingOrganization = false
      })
    },
    loadStatistics: function (days) {
      this.statisticTypes = []
      let loadingCount = 0
      this.activity.businessTypes.forEach(b => {
        let btype = this.businessTypes.find(t => t.value === b)
        if (btype !== undefined) {
          this.statisticTypes.push(btype.key)
          this.loadStatistic(days, btype.key)
          loadingCount++
        }
      })
      // this.loadPLStatistic(days)
      // this.loadStatistic(days, 4)
      // this.loadStatistic(days, 3)
      // this.loadCLStatistic(days)
      // this.loadIrcaStatistic(days)
      this.activity.sponsors.forEach(s => {
        this.loadSponsorStatistic(s)
        loadingCount++
      })
      this.loadingStatisticsCount = loadingCount
    },
    statisticsLoadFinished: function () {
      if (this.loadingStatisticsCount === 0) {
        let name = 'TotalPremium'
        if (this.activity.DefaultRank !== undefined && this.activity.DefaultRank !== null) name = this.activity.DefaultRank
        this.rankdesc(name)
      }
    },
    loadPLStatistic: function (days) {
      this.isLoadingPL = true
      let service = '/api/Services/NewBusinessService.asmx/GetActivityRecords'
      let param = {activityid: this.activity.ActivityID}
      if (days !== undefined) {
        service = '/api/Services/NewBusinessService.asmx/GetActivityRecords_days'
        param = {activityid: this.activity.ActivityID, days: days}
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadPLStatistic', res)
          res.data.forEach(r => {
            let attendee = this.list.find(a => a.AttendeeID === r.InstitutionID)
            // attendee.PLCount = r.NBCounts + r.RemarketCounts
            attendee.PLPremium = r.NBPremium
            // attendee.TotalCount = attendee.PLCount + attendee.CLCount + attendee.IRCACount
            attendee.TotalPremium = attendee.PLPremium + attendee.CLPremium + attendee.IRCAPremium
          })
          this.isLoadingPL = false
          this.loadingStatisticsCount--
          this.statisticsLoadFinished()
        }
      }).catch(err => {
        console.log('loadPLStatistic', err)
        this.isLoadingPL = false
        this.loadingStatisticsCount--
      })
    },
    loadStatistic: function (days, businesstypeid) {
      if (businesstypeid === 2) {
        this.loadPLStatistic(days)
        return
      }
      this.isLoadingCL = true
      let service = '/api/Services/BaseService.asmx/GetActivityRecords'
      let param = {activityid: this.activity.ActivityID, businesstypeid: businesstypeid}
      if (days !== undefined) {
        service = '/api/Services/BaseService.asmx/GetActivityRecords_days'
        param = {activityid: this.activity.ActivityID, days: days, businesstypeid: businesstypeid}
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadStatistic', res)
          res.data.forEach(r => {
            let attendee = this.list.find(a => a.AttendeeID === r.InstitutionID)
            if (businesstypeid === 3) {
              attendee.IRCAPremium = r.NBPremium// + r.RemarketPremium + r.RenewalPremium
            } else if (businesstypeid === 4) {
              attendee.CLPremium = r.NBPremium// + r.RemarketPremium + r.RenewalPremium
            }
            attendee.TotalPremium = attendee.PLPremium + attendee.CLPremium + attendee.IRCAPremium
          })
          this.isLoadingCL = false
          this.loadingStatisticsCount--
          this.statisticsLoadFinished()
        }
      }).catch(err => {
        console.log('loadStatistic', err)
        this.isLoadingCL = false
        this.loadingStatisticsCount--
      })
    },
    loadCLStatistic: function (days) {
      this.isLoadingCL = true
      let service = '/api/Services/CommerceService.asmx/GetActivityRecords'
      let param = {activityid: this.activity.ActivityID}
      if (days !== undefined) {
        service = '/api/Services/CommerceService.asmx/GetActivityRecords_days'
        param = {activityid: this.activity.ActivityID, days: days}
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadCLStatistic', res)
          res.data.forEach(r => {
            let attendee = this.list.find(a => a.AttendeeID === r.InstitutionID)
            // attendee.CLCount = r.NBCounts + r.RemarketCounts + r.RenewalCounts
            attendee.CLPremium = r.NBPremium// + r.RemarketPremium + r.RenewalPremium
            // attendee.TotalCount = attendee.PLCount + attendee.CLCount + attendee.IRCACount
            attendee.TotalPremium = attendee.PLPremium + attendee.CLPremium + attendee.IRCAPremium
          })
          this.isLoadingCL = false
          this.loadingStatisticsCount--
        }
      }).catch(err => {
        console.log('loadCLStatistic', err)
        this.isLoading = false
      })
    },
    loadIrcaStatistic: function (days) {
      this.isLoadingIRCA = true
      let service = '/api/Services/CommerceService.asmx/GetActivityRecords_irca'
      let param = {activityid: this.activity.ActivityID}
      if (days !== undefined) {
        service = '/api/Services/CommerceService.asmx/GetActivityRecords_irca_days'
        param = {activityid: this.activity.ActivityID, days: days}
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadIrcaStatistic', res)
          res.data.forEach(r => {
            let attendee = this.list.find(a => a.AttendeeID === r.InstitutionID)
            // attendee.IRCACount = r.NBCounts + r.RemarketCounts + r.RenewalCounts
            attendee.IRCAPremium = r.NBPremium// + r.RemarketPremium + r.RenewalPremium
            // attendee.TotalCount = attendee.PLCount + attendee.CLCount + attendee.IRCACount
            attendee.TotalPremium = attendee.PLPremium + attendee.CLPremium + attendee.IRCAPremium
          })
          this.isLoadingIRCA = false
          this.loadingStatisticsCount--
        }
      }).catch(err => {
        console.log('loadIrcaStatistic', err)
        this.isLoadingIRCA = false
      })
    },
    loadSponsorStatistic: function (sponsor) {
      this.isLoading = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetActivityRecords_corp', {activityid: this.activity.ActivityID, corpid: sponsor.SponsorID}).then(res => {
        if (res) {
          console.log('loadSponsorStatistic', res)
          res.data.forEach(r => {
            let attendee = this.list.find(a => a.AttendeeID === r.InstitutionID)
            attendee[sponsor.Name] = r.NBPremium// + r.RemarketPremium + r.RenewalPremium
          })
        }
        this.isLoading = false
        this.loadingStatisticsCount--
        this.statisticsLoadFinished()
      }).catch(err => {
        console.log('loadSponsorStatistic', err)
        this.isLoading = false
        this.loadingStatisticsCount--
      })
    },
    loadAttendeeDetail_: function (attendee) {
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetActivityRecords_producer', {activityid: this.activity.ActivityID, attendeeid: attendee.AttendeeID}).then(res => {
        if (res) {
          console.log('loadAttendeeDetail', res)
          res.data.forEach(r => {
            let child = {}
            attendee.children.push(child)
            child.ID = attendee.AttendeeID + '_' + r.ProducerID
            child.Name = r.ProducerName
            child.PLPremium = r.PremiumList[0]
            child.CLPremium = r.PremiumList[1]
            child.IRCAPremium = r.PremiumList[2]
            child.TotalPremium = child.PLPremium + child.CLPremium + child.IRCAPremium
            let i = 3
            this.activity.sponsors.forEach(s => {
              child[s.Name] = r.PremiumList[i]
              i++
            })
          })
          this.rankdesc('TotalPremium')
          this.isLoading = false
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadAttendeeDetail', err)
        this.isLoading = false
      })
    },
    loadAttendeeDetail: function (attendee) {
      if (this.activity.AttendeeTypeID !== 1) return
      this.isLoading = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetActivityRecords_producer', {activityid: this.activity.ActivityID, attendeeid: attendee.AttendeeID}).then(res => {
        if (res) {
          console.log('loadAttendeeDetail', res)
          res.data.forEach(r => {
            let child = {}
            attendee.children.push(child)
            child.ID = attendee.AttendeeID + '_' + r.ProducerID
            child.Name = r.ProducerName
            child.PLPremium = r.BusiTypePremiums[1]
            child.CLPremium = r.BusiTypePremiums[3]
            child.IRCAPremium = r.BusiTypePremiums[2]
            child.TotalPremium = child.PLPremium + child.CLPremium + child.IRCAPremium
            let i = 0
            this.activity.sponsors.forEach(s => {
              child[s.Name] = r.CorpPremiums[i]
              i++
            })
          })
          this.rankdesc('TotalPremium')
          this.isLoading = false
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadAttendeeDetail', err)
        this.isLoading = false
      })
    },
    loadDownloadFiles () {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetFiles', {subpath: this.subPath}).then(res => {
        if (res) {
          console.log('loadDownloadFiles', res)
          this.files = res.data
          this.isLoading = false
        }
      }).catch(err => {
        console.log('loadDownloadFiles出错', err)
        this.isLoading = false
      })
    },
    setPlace (place) {
      this.city = ''
      // this.place = place
      // this.lat = place.geometry.location.lat()
      // this.lng = place.geometry.location.lng()
      let address = place.formatted_address
      this.address = address
      if (place.address_components === undefined) return
      this.city = place.vicinity
      place.address_components.forEach(c => {
        // if (c.types.indexOf('subpremise') >= 0) address += c.short_name
        // else if (c.types.indexOf('street_number') >= 0) address += ' ' + c.short_name
        // else if (c.types.indexOf('route') >= 0) address += ' ' + c.short_name
        // if (c.types.indexOf('sublocality') >= 0) this.city = c.short_name
        // else if (this.city === '' && c.types.indexOf('administrative_area_level_3') >= 0) this.city = c.short_name
        if (c.types.indexOf('administrative_area_level_1') >= 0) this.province = c.short_name
        else if (c.types.indexOf('postal_code') >= 0) this.postcode = c.short_name
      })

      // this.address = lat + ',' + lng
    },
    geolocate: function () {
      navigator.geolocation.getCurrentPosition(position => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      })
    },
    usePlace (place) {
      if (this.place) {
        this.markers.push({
          position: {
            lat: this.place.geometry.location.lat(),
            lng: this.place.geometry.location.lng()
          }
        })
        this.place = null
      }
    }
  }
}
</script>

<style scoped>

</style>
