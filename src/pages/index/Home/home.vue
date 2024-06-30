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
          <span v-if="activity.EndTime !== undefined" @dblclick="showRankList">{{ date.format('YYYY-MM-DD hh:mm:ss') }}</span>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="" style="padding:10px; font-size: 18px;">
        <el-col :span="24">
          <span>{{ activity.Introduce }}</span>
        </el-col>
      </el-row>
      <div v-if="rankListVisible" style="font-size:16px; line-height: 24px;">
        <el-row :gutter="20" style="margin:10px; ">
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
        </el-row>
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
          <el-table-column label="P/L Premium" prop="PLPremium" class="" min-width="150" sortable="custom">
            <template slot-scope="scope" >
              <span>${{scope.row.PLPremium.toLocaleString()}}</span>
            </template>
          </el-table-column>
          <el-table-column label="C/L Premium" prop="CLPremium" min-width="150" sortable="custom">
            <template slot-scope="scope" >
              <span>${{scope.row.CLPremium.toLocaleString()}}</span>
            </template>
          </el-table-column>
          <el-table-column label="IRCA Premium" prop="IRCAPremium" min-width="150" sortable="custom">
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
      date: moment(),
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
      files: [],
      isLoading: false,
      sponsors: [],
      groupList: [],
      activity: null,
      list: [],
      pageSize: 15,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  mounted: function () {
    this.loadSponsors()
    this.loadActivity()
    this.loadDownloadFiles()
    setInterval(function () {
      this.date = moment()
    }, 1000)
  },
  methods: {
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
    },
    rank: function (name) {
      this.list.sort(this.by(name))
    },
    rankdesc: function (name) {
      this.list.sort(this.bydesc(name))
    },
    customerFormat: function (percentage) {
      if (percentage === this.gold.percentage) return this.gold.amount
      else if (percentage === this.silver.percentage) return this.silver.amount
      else return this.bronze.amount
    },
    fillRank: function () {
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
    },
    showRankList: function () {
      if (this.rankListVisible) this.rankListVisible = false
      else this.rankListVisible = true
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
            this.loadAttendeeDetail(r)
          })
          this.activity = res.data
          this.list = res.data.attendees
          this.total = this.list.length
          this.currentPage = 1
          this.isLoading = false
          this.loadPLStatistic()
          this.loadCLStatistic()
          this.loadIrcaStatistic()
          this.activity.sponsors.forEach(s => {
            this.loadSponsorStatistic(s)
          })
        }
        this.isLoadingOrganization = false
      }).catch(err => {
        console.log('GroupList', err)
        this.isLoadingOrganization = false
      })
    },
    loadPLStatistic: function () {
      this.isLoading = true
      this.axios.post('/api/Services/NewBusinessService.asmx/GetActivityRecords', {activityid: this.activity.ActivityID}).then(res => {
        if (res) {
          console.log('loadPLStatistic', res)
          res.data.forEach(r => {
            let attendee = this.list.find(a => a.AttendeeID === r.InstitutionID)
            // attendee.PLCount = r.NBCounts + r.RemarketCounts
            attendee.PLPremium = r.NBPremium
            // attendee.TotalCount = attendee.PLCount + attendee.CLCount + attendee.IRCACount
            attendee.TotalPremium = attendee.PLPremium + attendee.CLPremium + attendee.IRCAPremium
          })
          this.rankdesc('TotalPremium')
          this.fillRank()
          this.isLoading = false
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadPLStatistic', err)
        this.isLoading = false
      })
    },
    loadCLStatistic: function () {
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetActivityRecords', {activityid: this.activity.ActivityID}).then(res => {
        if (res) {
          console.log('loadCLStatistic', res)
          res.data.forEach(r => {
            let attendee = this.list.find(a => a.AttendeeID === r.InstitutionID)
            // attendee.CLCount = r.NBCounts + r.RemarketCounts + r.RenewalCounts
            attendee.CLPremium = r.NBPremium// + r.RemarketPremium + r.RenewalPremium
            // attendee.TotalCount = attendee.PLCount + attendee.CLCount + attendee.IRCACount
            attendee.TotalPremium = attendee.PLPremium + attendee.CLPremium + attendee.IRCAPremium
          })
          this.rankdesc('TotalPremium')
          this.fillRank()
          this.isLoading = false
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadCLStatistic', err)
        this.isLoading = false
      })
    },
    loadIrcaStatistic: function () {
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetActivityRecords_irca', {activityid: this.activity.ActivityID}).then(res => {
        if (res) {
          console.log('loadCLStatistic', res)
          res.data.forEach(r => {
            let attendee = this.list.find(a => a.AttendeeID === r.InstitutionID)
            // attendee.IRCACount = r.NBCounts + r.RemarketCounts + r.RenewalCounts
            attendee.IRCAPremium = r.NBPremium// + r.RemarketPremium + r.RenewalPremium
            // attendee.TotalCount = attendee.PLCount + attendee.CLCount + attendee.IRCACount
            attendee.TotalPremium = attendee.PLPremium + attendee.CLPremium + attendee.IRCAPremium
          })
          this.rankdesc('TotalPremium')
          this.fillRank()
          this.isLoading = false
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadCLStatistic', err)
        this.isLoading = false
      })
    },
    loadSponsorStatistic: function (sponsor) {
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetActivityRecords_corp', {activityid: this.activity.ActivityID, corpid: sponsor.SponsorID}).then(res => {
        if (res) {
          console.log('loadCLStatistic', res)
          res.data.forEach(r => {
            let attendee = this.list.find(a => a.AttendeeID === r.InstitutionID)
            attendee[sponsor.Name] = r.NBPremium// + r.RemarketPremium + r.RenewalPremium
          })
          this.rankdesc('TotalPremium')
          this.isLoading = false
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadCLStatistic', err)
        this.isLoading = false
      })
    },
    loadAttendeeDetail: function (attendee) {
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
