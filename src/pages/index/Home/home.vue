<template>
  <div>
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
      <br/-->
      <GmapMap style="width: 100%; height: 700px;" :zoom="18" :center="{lat: 43.8596837, lng: -79.33951909999999}">
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
      </GmapMap>
    </div>

    <!--el-row :gutter="20" class="inPageNav">
      <el-col :span="16">
        <div class="welcome">
          <img src="../../../assets/images/welcome.png">
          <p>Welcome, {{JSON.parse(this.$store.getters.getAccount).Name}}</p>
        </div>
      </el-col>
      <el-col :span="8" v-if="files.length > 0">
        <div>Useful files:</div>
        <div v-for="(item, index) in files" :key="index">
          <a :href="'/api' + 'upload/' + subPath + '/' + item">{{item}}</a>
        </div>
      </el-col>
    </el-row-->
  </div>
</template>

<script>
export default {
  data: function () {
    return {
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
      isLoading: false
    }
  },
  mounted: function () {
    this.loadDownloadFiles()
  },
  methods: {
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
