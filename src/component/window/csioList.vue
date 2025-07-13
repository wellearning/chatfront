<template>
    <div>
      <el-form  class="newMemo">
        <!--el-row :gutter="20" class="subtitle">
          <el-col :span="18">
            <el-form-item label="CSIO Template" prop="SheetID">
              <el-select v-model="sheetId" placeholder="csio template" @change="selectChanged" no-data-text="No Record" filterable >
                <el-option v-for="item in sheets" :key="item.SheetID" :label="item.Title" :value="item.SheetID"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <div class="newMemo-submit">
              <el-button icon="el-icon-edit" type="primary" @click="showEdit()" :loading="isLoading">Create</el-button>
            </div>
          </el-col>
        </el-row-->
      </el-form>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="COI ID" prop="CsioID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Title" prop="Title" min-width="300"></el-table-column>
        <el-table-column label="Status" prop="Status" min-width="100"></el-table-column>
        <el-table-column label="Action" width="300">
          <template v-slot="scope">
            <el-button-group>
              <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row)" :loading="isLoading" size="small">Edit</el-button>
              <el-button v-if="scope.row.Status === 'Draft' && scope.row.CsioID > 0" icon="el-icon-s-release" type="primary" @click="release(scope.row)" :loading="isLoading" size="small">Release</el-button>
              <el-button v-if="scope.row.Status === 'Released'" icon="el-icon-s-release" type="primary" @click="withdraw(scope.row)" :loading="isLoading" size="small">Withdraw</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog z-index="5" title="CSIO Edition" :visible.sync="csioEditVisible" width="1184.56px" center>
        <editCsioInstance ref="csioi" :csioTemplate="currentSheet" :businessID="busiID" @csiochange="loadCsios"></editCsioInstance>
      </el-dialog>

    </div>
</template>

<script>
import editCsioInstance from '@/component/window/editCsioInstance'

export default {
  components: {
    editCsioInstance
  },
  name: 'csioList',
  data: function () {
    return {
      sheets: [],
      sheetId: null,
      busiID: null,
      currentSheet: null,
      csioEditVisible: false,
      list: [],
      isLoading: false,
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  props: {
    businessTypeID: {
      type: Number
    },
    businessID: {
      type: Number
    }
  },
  mounted: function () {
    this.busiID = this.businessID
    // this.loadSheets(this.businessID)
    this.loadCsios(this.businessID)
  },
  methods: {
    start: function () {
      console.log('start')
    },
    selectChanged: function () {
      this.currentSheet = this.sheets.find(s => s.SheetID === this.sheetId)
    },
    loadSheets: function (id) {
      this.busiID = id
      this.isLoading = true
      this.axios.post('/api/Services/commerceservice.asmx/GetCsioTemplates', {businessid: id}).then(res => {
        if (res) {
          console.log('loadSheets', res)
          this.sheets = res.data
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadSheets error', err)
        this.isLoading = false
      })
    },
    // 关闭Pink Slip
    loadCsios: function (id) {
      if (id === undefined) id = this.busiID
      this.isLoading = true
      this.axios.post('/api/Services/commerceservice.asmx/GetCsios', {businessid: id}).then(res => {
        if (res) {
          console.log('loadCsios', res)
          this.list = res.data
          this.total = this.list.length
          this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadCsios error', err)
        this.isLoading = false
      })
    },
    showEdit: function (csio) {
      if (csio === undefined) {
        if (this.currentSheet === null || this.currentSheet === undefined) return
        csio = this.currentSheet
      } else {
        this.currentSheet = csio
      }
      this.csioEditVisible = true
      if (this.$refs.csioi !== undefined) {
        this.$refs.csioi.loadCsio(csio)
      }
    },
    release: function (csio) {
      this.isLoading = true
      this.axios.post('/api/Services/commerceservice.asmx/ReleaseCsio', {csioid: csio.CsioID}).then(res => {
        if (res) {
          console.log('release', res)
          csio.StatusID = res.data.StatusID
          csio.Status = res.data.Status
        }
        this.isLoading = false
      }).catch(err => {
        console.log('release error', err)
        this.isLoading = false
      })
    },
    withdraw: function (csio) {
      this.isLoading = true
      this.axios.post('/api/Services/commerceservice.asmx/WithdrawCsio', {csioid: csio.CsioID}).then(res => {
        if (res) {
          console.log('release', res)
          csio.StatusID = res.data.StatusID
          csio.Status = res.data.Status
        }
        this.isLoading = false
      }).catch(err => {
        console.log('release error', err)
        this.isLoading = false
      })
    },
    close: function (done) {
      this.list = []
    }

  }

}
</script>

<style scoped>

</style>
