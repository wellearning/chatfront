<!--
FileName: clApplicationProcessing.vue
Author: Ge Chen
Update Date: 2024/1/8
Function: Show all commercial application list and do all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Application Processing</span>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Content" size="small" @change="search" @keyup.enter.native="search"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search()" :loading="isLoadingTotal" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoadingTotal" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table height="600" :data="currentlist" empty-text="No Record" @expand-change="loadApplication" :loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.5)" @sort-change="sorttable">
        <el-table-column label="ID" prop="ApplicationID" width="60" fixed="left" sortable="custom">
        </el-table-column>
        <el-table-column width="20" type="expand" :loading="isLoading" >
          <template slot-scope="props">
            <el-table :data="props.row.blocks" row-key="id" default-expand-all :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
              <el-table-column prop="BlockName" label="Block Name" min-width="300"/>
              <el-table-column prop="Status" label="Status" min-width="100"/>
              <el-table-column label="Sub-Action" width="380">
                <template slot-scope="scope">
                  <el-button v-if="scope.row.TypeID === 0" icon="el-icon-view" type="primary" @click="showViewApplicationBlock(scope.row)" :loading="isLoading" size="small">View</el-button>
                  <el-button v-if="scope.row.TypeID === 0" icon="el-icon-edit"  type="primary" @click="showEditBlock(scope.row)" :loading="isLoadingApplicationBlock" size="small">Edit</el-button>
                  <el-button v-if="scope.row.TypeID === 1" icon="el-icon-edit" type="primary" :disabled="props.row.StatusID > 1" @click="showEditSubApplicationTemplate(scope.row)" :loading="isLoading" size="small">Edit</el-button>
                  <el-button v-if="scope.row.TypeID === 1" icon="el-icon-delete" type="danger" @click="removeSubApplicationTemplate(scope.row)" :loading="isLoading" size="small">Del</el-button>
                  <el-button v-if="scope.row.TypeID === 2" icon="el-icon-plus" type="primary" @click="addSubApplicationTemplate(scope.row)" :loading="isLoading" size="small">Add</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="Title" prop="Title" min-width="150" sortable="custom"></el-table-column>
        <el-table-column label="ClientCode" prop="ClientCode" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="Producer" prop="Producer" min-width="100" sortable="custom"></el-table-column>
        <el-table-column label="Applicant" prop="NameInsured" min-width="180" sortable="custom"></el-table-column>
        <el-table-column label="Company" prop="CorpName" min-width="120" sortable="custom"></el-table-column>
        <el-table-column label="Prem" prop="Premium" min-width="80" sortable="custom"></el-table-column>
        <el-table-column label="EffecDate" prop="EffectiveDate" min-width="90" sortable="custom">
          <template v-slot="scope">
            <span>{{dateFormat(scope.row.EffectiveDate)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" prop="Status" min-width="60" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="Action" width="360" >
          <template slot-scope="scope">
            <el-button-group>
              <el-button icon="el-icon-view" v-if="scope.row.StatusID === 6" type="info" plain @click="showViewApplication(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">View</el-button>
              <el-button icon="el-icon-edit" v-if="scope.row.StatusID !== 6" type="primary" @click="showEditApplication(scope.row)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Edit</el-button>
              <el-button icon="el-icon-view" v-if="scope.row.StatusID !== 6"  type="primary" @click="showSheet(scope.row.ApplicationID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">FORM</el-button>
              <el-button icon="el-icon-view" v-if="scope.row.StatusID !== 6"  :type="processType(scope.row)" @click="showQuotation(scope.row)"  size="small">Process</el-button>
              <el-button icon="el-icon-delete" v-if="scope.row.StatusID !== 6" type="danger" @click="voidApplication(scope.row.ApplicationID)" :loading="isLoading" size="small">Void</el-button>
              <!--el-button icon="el-icon-unlock" v-if="scope.row.StatusID === 6" type="warning" @click="reinstateApplication(scope.row.ApplicationID)" :loading="isLoading" size="small">Reinstate</el-button-->
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList" @current-change="handleCurrentChange">
      </el-pagination>
      <!----------------------------------------------查阅弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewApplicationVisible" width="1184.56px" center :before-close="closeView">
        <ViewApplication ref="vm" :applicationid="currentApplicationID" :insuranceCorps="insuranceCorpList"></ViewApplication>
      </el-dialog>
      <!----------------------------------------------查阅弹窗结束----------------------------------------------------->
      <!----------------------------------------------查阅applicationBlock弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="viewApplicationBlockVisible" width="984.56px" center>
        <ViewApplicationBlock ref="vab" :applicationBlockId="currentApplicationBlockID" :blockName="currentBlockName"></ViewApplicationBlock>
      </el-dialog>
      <!----------------------------------------------查阅applicationBlock弹窗结束----------------------------------------------------->
      <!----------------------------------------------Sheet 弹窗开始----------------------------------------------------->
      <el-dialog title="" :visible.sync="sheetFormVisible" width="1184.56px"  height="2184.56px" center >
        <ViewSheet ref="vs" :businessObjId="currentApplicationID" :businessTypeId="4"></ViewSheet>
      </el-dialog>
      <!----------------------------------------------Sheet 弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog z-index="5" title="" :visible.sync="editApplicationWindowVisible" width="1550px" top="10px" center :before-close="closeEdit">
        <EditApplication ref="eacl" :applicationid="currentApplicationID" :templateList="templateList" @close="closeEditApplication"></EditApplication>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------修改ApplicationBlock弹窗开始----------------------------------------------------->
      <el-dialog z-index="5" title="" :visible.sync="editApplicationBlockVisible" width="984.56px" center :before-close="closeEdit">
        <editApplicationBlock :applicationBlock="currentApplicationBlock" :applicationTemplate="currentApplicationTemplate"
                              @showNextBlock="showNextBlock"
                              @showSkipBlock="showSkipBlock"
                              @resetLeft="resetLeftChildren"
                              @skipLeft="skipLeftChildren"
                              @checkOver="checkOver"
        >
        </editApplicationBlock>
        <div class="newMemo-submit">
          <el-button v-if="currentApplicationBlock!==null && currentApplicationBlock.StatusID !== 1" icon="el-icon-check" type="primary" @click="saveApplicationBlock(false)" :loading="isLoading">Save</el-button>
          <el-button v-if="currentApplicationBlock!==null && currentApplicationBlock.StatusID === 1" icon="el-icon-check" type="primary" @click="saveApplicationBlock(true)" :loading="isLoading">Finish</el-button>
        </div>
      </el-dialog>
      <!----------------------------------------------修改ApplicationBlock弹窗结束----------------------------------------------------->
      <!----------------------------------------------报价弹窗开始----------------------------------------------------->
      <el-dialog v-if="currentApplication !== null" :title="'Request Quotation: ' + currentApplication.ApplicationID" :visible.sync="quotationVisible" width="1000px" center :before-close="closeEdit">
        <el-form  class="newMemo">
          <el-row :gutter="20" class="subtitle">
            <el-col :span="18">
              <el-form-item label="Insurance Company" prop="InsuranceCorpID">
                <el-select v-model="multipleSelection" placeholder="Insurance Company" no-data-text="No Record" multiple filterable >
                  <el-option v-for="item in currentApplication.unselectedCorps" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <div class="newMemo-submit">
                <el-button icon="el-icon-check" type="primary" @click="saveQuotations()" :loading="isLoading">Request</el-button>
                <el-button icon="el-icon-info" circle @click="showQuotationSuggestion()" :loading="isLoading"></el-button>
              </div>
            </el-col>
          </el-row>
        </el-form>

        <el-table
          :data="currentApplication.quote === undefined ? [] : currentApplication.quote.quotations"
          tooltip-effect="dark"
          style="width: 100%">
          <el-table-column
            prop="CorpName"
            label="Insurance Corporation"
            width="250">
          </el-table-column>
          <el-table-column
            prop="Premium"
            label="Premium"
            width="100">
          </el-table-column>
          <el-table-column label="Status" prop="StatusName" min-width="100"></el-table-column>
          <el-table-column label="Action" width="400">
            <template v-slot="scope">
              <el-button-group>
                <el-button icon="el-icon-view" type="primary" @click="showSendEmail(scope.row)" :loading="isLoadingInsuranceCompany" size="small">Email</el-button>
                <el-button icon="el-icon-view" type="primary" @click="showQuotationProcessing(scope.row, 2)" :loading="isLoadingInsuranceCompany" size="small">Quote</el-button>
                <el-button v-if="roleName.indexOf('Branch') < 0" icon="el-icon-view" type="primary" @click="showQuotationBind(scope.row)" :loading="isLoadingInsuranceCompany" size="small">Bind</el-button>
                <!--el-button icon="el-icon-view" type="primary" @click="showQuotationProcessing(scope.row)" :loading="isLoadingInsuranceCompany" size="small">Action</el-button-->
                <el-button icon="el-icon-delete" type="warning" @click="showQuotationProcessing(scope.row,3)" :loading="isLoadingInsuranceCompany" size="small">Decline</el-button>
                <el-button icon="el-icon-delete" type="danger" @click="delQuotation(scope.row.InsuranceCorpQuotationID)" :loading="isLoadingInsuranceCompany" size="small">Del</el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
      <!----------------------------------------------报价弹窗结束----------------------------------------------------->
      <!----------------------------------------------InsuranceCorp Bind 弹窗开始----------------------------------------------------->
      <el-dialog title="Insurance Corporation Quotation Binding" :visible.sync="quotationBindVisible" width="600px" center>
        <el-form :model="quotationBindForm" ref="quotationBindForm" class="newMemo" :rules="quotationBindFormRules">
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Producer" prop="ProducerID">
                <el-select v-model="quotationBindForm.ProducerID" placeholder="Producer" no-data-text="No Record" filterable >
                  <el-option v-for="item in producerList" :key="item.StaffID" :label="item.Name" :value="item.StaffID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Effective Date" prop="EffectiveDate">
                <el-date-picker v-model="quotationBindForm.EffectiveDate" @change="effectiveDateChange" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Expiry Date" prop="ExpiryDate">
                <el-date-picker v-model="quotationBindForm.ExpiryDate" type="date" placeholder="yyyy-mm-dd"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="AppType" prop="TypeID">
                <el-select v-model="quotationBindForm.TypeID" placeholder="App Type" no-data-text="No Record" filterable >
                  <el-option v-for="item in appTypes" :key="item.ID" :label="item.Name" :value="item.ID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="quotationBindForm.TypeID === 2" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Remarket From" prop="LeadFromCorpID">
                <el-select v-model="quotationBindForm.LeadFromCorpID" placeholder="Lead From" no-data-text="No Record" filterable >
                  <el-option v-for="item in insuranceCorpList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Client Code" prop="ClientCode">
                <el-input v-model="quotationBindForm.ClientCode" placeholder="Client Code" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Policy Number" prop="PolicyNumber">
                <el-input v-model="quotationBindForm.PolicyNumber" placeholder="Policy Number" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Premium" prop="Premium">
                <el-input v-model="quotationBindForm.Premium" type="number" placeholder="Premium" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Sales Points" prop="SalesPoints">
                <el-input v-model="quotationBindForm.SalesPoints" type="number" placeholder="Sales Points" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Agency/Director Bill" prop="BillWayID">
                <el-select v-model="quotationBindForm.BillWayID" placeholder="Agency/Director" no-data-text="No Record" filterable >
                  <el-option v-for="item in billWays" :key="item.ID" :label="item.Name" :value="item.ID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <!--el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Outstanding Balance" prop="OutstandingBalance">
                <el-input v-model="quotationBindForm.OutstandingBalance" type="number" placeholder="Outstanding Balance" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row-->
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Renewal Questionnaire" prop="QuestionnaireID">
                <el-select v-model="quotationBindForm.QuestionnaireID" placeholder="Questionnaire" no-data-text="No Record" filterable >
                  <el-option v-for="item in questionnaires" :key="item.BlockID" :label="item.Name" :value="item.BlockID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="newMemo-submit">
            <el-button icon="el-icon-check" type="primary" @click="quotationBind()" :loading="isLoading">Bind</el-button>
          </div>
        </el-form>
      </el-dialog>
      <!----------------------------------------------InsuranceCorp Bind弹窗结束----------------------------------------------------->
      <!----------------------------------------------InsuranceCorpQuotation Processing 弹窗开始----------------------------------------------------->
      <el-dialog title="Insurance Corporation Quotation Processing" :visible.sync="quotationProcessingVisible" width="800px" center :before-close="closeEdit">
        <el-form :model="quotationProcessingForm" ref="quotationProcessingForm" class="newMemo" :rules="quotationProcessingFormRules">
          <!--el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Processing Type" prop="StatusID">
                <el-select v-model="quotationProcessingForm.StatusID" placeholder="Processing Type" no-data-text="No Record" filterable >
                  <el-option v-for="item in quotationProcessings" :key="item.StatusID" :label="item.Name" :value="item.StatusID"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row-->
          <el-row :gutter="20" v-if="quotationProcessingForm.Status === 2" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Premium" prop="Premium">
                <el-input v-model="quotationProcessingForm.Premium" type="number" placeholder="Premium" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="0" class="subtitle">
            <el-col :span="24">
              <el-form-item :label="quotationProcessingForm.Status === 1? 'Email Body':'Description'" prop="Brief">
                <el-input v-model="quotationProcessingForm.Brief" type="textarea" :rows="5" placeholder="Description" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="newMemo-submit">
            <el-button icon="el-icon-check" type="primary" @click="checkQuotationProcessInput" :loading="isLoading">{{quotationProcessingForm.Status === 1? 'Send Email':'Confirm'}}</el-button>
          </div>
        </el-form>
      </el-dialog>
      <!----------------------------------------------InsuranceCorpQuotation Processing弹窗结束----------------------------------------------------->
      <!----------------------------------------------InsuranceCorpQuotation Send Email 弹窗开始----------------------------------------------------->
      <el-dialog :title="'Application to ' + quotationProcessingForm.CorpName" :visible.sync="quotationEmailVisible" width="1000px" center :before-close="closeEdit">
        <!--el-form :model="quotationProcessingForm" ref="quotationProcessingForm" class="writeEmail" :rules="quotationProcessingFormRules">
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Mail to" prop="Mailto">
                <el-input v-model="quotationProcessingForm.Mailto" type="text" placeholder="Mailto" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Subject" prop="Subject">
                <el-input v-model="quotationProcessingForm.Subject" type="text" placeholder="Subject" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="0" class="subtitle">
            <el-col :span="24">
              <el-form-item label="Email Body" prop="Brief">
                <el-input v-model="quotationProcessingForm.MailBody" type="textarea" :rows="10" placeholder="Body" title=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="newMemo-submit">
            <el-button icon="el-icon-check" type="primary" @click="checkQuotationProcessInput" :loading="isQuotationProcessing">Send Email</el-button>
          </div>
        </el-form-->
        <sendEmail ref="se" :mail="quoteEmail" @hideEmailWindow="hideEmailWindow">
        </sendEmail>
      </el-dialog>
      <!----------------------------------------------InsuranceCorpQuotation Send Email 弹窗结束----------------------------------------------------->
      <!----------------------------------------------SubApplicationTemplate Edition 弹窗开始----------------------------------------------------->
      <el-dialog z-index="5" title="SubApplicationTemplate Edition" :visible.sync="subapplicationTemplateEditionVisible" width="984.56px" center>
        <editSubApplicationTemplate ref="esat" :applicationTemplateId="currentBlockItem.ApplicationTemplateID" @hideEdition="hideEdition()"></editSubApplicationTemplate>
      </el-dialog>
      <!----------------------------------------------SubApplicationTemplate Edition弹窗结束----------------------------------------------------->
      <!----------------------------------------------Quotation Suggestion 弹窗开始----------------------------------------------------->
      <el-dialog :title="'Hit Ratio for '+currentApplication.Operating " :visible.sync="quotationSuggestionVisible" width="900px" center>
        <div class="searchBox">
          <el-main class="" >
            <!--el-row :gutter="20" class="title" v-loading="">
              <el-col :span="8" class="">Total Bound # in 90D: {{hitRatioSummary.bound90}}</el-col>
              <el-col :span="8">Total Applied # in 90D: {{hitRatioSummary.applied90}}</el-col>
              <el-col :span="8">Total Bound % in 90D: {{hitRatioSummary.ratio90}}%</el-col>
              <el-col :span="8" class="">Total Bound # in 365D: {{hitRatioSummary.bound365}}</el-col>
              <el-col :span="8">Total Applied # in 365D: {{hitRatioSummary.applied365}}</el-col>
              <el-col :span="8">Total Bound % in 365D: {{hitRatioSummary.ratio365}}%</el-col>
            </el-row-->
            <el-row :gutter="20" class="title" v-loading="">
              <el-col :span="6" class="">Bound # in 90D: {{hitRatioSummary.bound90}}</el-col>
              <el-col :span="6">Bound % in 90D: {{hitRatioSummary.ratio90}}%</el-col>
              <el-col :span="6" class="">Bound # in 365D: {{hitRatioSummary.bound365}}</el-col>
              <el-col :span="6">Bound % in 365D: {{hitRatioSummary.ratio365}}%</el-col>
            </el-row>
          </el-main>
        </div>
        <el-table
          :data="quotationSuggestions"
          tooltip-effect="dark"
          height="600px"
          style="width: 100%"
          @selection-change="handleSelectionChange" @sort-change="sorttableHit">
          <el-table-column
            type="selection"
            min-width="50">
          </el-table-column>
          <el-table-column
            prop="CorpName"
            label="Insurance Company"
            min-width="150" sortable="custom">
          </el-table-column>
          <el-table-column label="Bound # in 90D" prop="BoundCount0" min-width="120" sortable="custom"></el-table-column>
          <el-table-column label="Bound % in 90D" prop="HitRatio0" min-width="120" sortable="custom"></el-table-column>
          <el-table-column label="Bound # in 365D" prop="BoundCount1" min-width="120" sortable="custom"></el-table-column>
          <el-table-column label="Bound % in 365D" prop="HitRatio1" min-width="120" sortable="custom"></el-table-column>
        </el-table>
      </el-dialog>
      <!----------------------------------------------Quotation Suggestion弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import ViewSheet from '@/component/window/sheet'
import ViewApplication from '@/component/window/viewApplication'
import ViewApplicationBlock from '@/component/window/viewApplicationBlock'
import editApplicationBlock from '@/component/parts/editApplicationBlock'
import EditApplication from '@/component/parts/editApplication'
import editSubApplicationTemplate from '@/component/parts/editSubApplicationTemplate'
import sendEmail from '@/component/window/sendEmail'

export default {
  components: {
    editApplicationBlock,
    ViewSheet,
    EditApplication,
    editSubApplicationTemplate,
    ViewApplicationBlock,
    ViewApplication,
    sendEmail
  },
  data: function () {
    return {
      roleName: JSON.parse(this.$store.getters.getAccount).role.Name,
      EffectiveDate: null,
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      Author: JSON.parse(this.$store.getters.getAccount).Name,
      printObj: {
        id: 'pdfDom',
        popTitle: ''
      },
      htmlTitle: 'null', // pdf文件名
      isLoading: false,
      isLoadingTotal: false,
      isLoadingApplications: false,
      isLoadingTemplateBlockQuestions: false,
      isLoadingApplicationBlock: false,
      isLoadingApplicationQuotations: false,
      isLoadingProducers: false,
      isLoadingInsuranceCompany: false,
      isQuotationProcessing: false,
      templateList: [],
      insuranceCorpList: [],
      producerList: [],
      statusList: [],
      billWays: [{ID: 1, Name: 'Agency Bill'}, {ID: 2, Name: 'Direct Bill'}],
      questionnaires: [{ID: 0, Name: 'No Need'}, {ID: 1, Name: 'Questionnaire1.pdf'}, {ID: 2, Name: 'Questionnaire2.pdf'}],
      appTypes: [{ID: 1, Name: 'New Business'}, {ID: 2, Name: 'Remarket'}, {ID: 3, Name: 'LOA'}, {ID: 4, Name: 'Rewrite'}],
      quotationProcessings: [
        {StatusID: 2, Name: 'Quote', Status: 'Quoted'},
        {StatusID: 3, Name: 'Decline', Status: 'Declined'}
      ],
      currentInsuranceCorpID: null,
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      // 列表
      tempList: [],
      list: [],
      currentlist: [],
      totalList: [],
      quotations: [],
      quoteEmail: {
        businessId: 0,
        mailType: 1,
        subject: null,
        mailto: null
      },
      currentApplication: {
        quote: {
          quotations: []
        },
        unselectedCorps: []
      },
      currentApplicationID: 0,
      currentApplicationTemplate: null,
      currentApplicationBlockID: 0,
      currentBlockName: null,
      currentBlockItem: {ApplicationTemplateID: null},
      currentApplicationBlock: null,
      pageSize: 10,
      pagerCount: 5,
      currentPage: 1,
      total: 0,
      isAll: false,
      quotationVisible: false,
      quotationBindVisible: false,
      quotationSuggestionVisible: false,
      quotationProcessingVisible: false,
      quotationEmailVisible: false,
      quotationSuggestions: null,
      hitRatioSummary: {
        bound90: 0,
        applied90: 0,
        ratio90: null,
        bound365: 0,
        applied365: 0,
        ratio365: null
      },
      quotationProcessingForm: {
        InsuranceCorpQuotationID: null,
        ApplicationID: 0,
        InsuranceCorpID: 0,
        Status: 0,
        emailStatus: 0,
        StatusID: 0,
        CorpName: '',
        Brief: null,
        Premium: null
      },
      quotationProcessingFormRules: {
        StatusID: [
          { required: false, message: 'Please Select', trigger: 'blur' }
        ],
        Brief: [
          { required: false, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        Premium: [
          { required: false, message: 'Please Enter', trigger: 'blur' }
        ]
      },
      quotationBindForm: {
        InsuranceCorpQuotationID: null,
        ProducerID: null,
        EffectiveDate: null,
        TypeID: 1,
        LeadFromCorpID: 0,
        ExpiryDate: null,
        ClientCode: null,
        PolicyNumber: null,
        Premium: null,
        SalesPoints: null,
        BillWayID: null,
        OutstandingBalance: 0,
        QuestionnaireID: 0
      },
      quotationBindFormRules: {
        PolicyNumber: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 50, message: 'Within 50 Characters', trigger: 'blur' }
        ],
        EffectiveDate: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ],
        ExpiryDate: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ],
        TypeID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        BillWayID: [
          { required: true, message: 'Please Select', trigger: 'blur' }
        ],
        ClientCode: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ],
        Premium: [
          { required: true, message: 'Please Enter', trigger: 'blur' }
        ]
      },
      editApplicationWindowVisible: false,
      editApplicationBlockVisible: false,
      multipleSelection: [],
      // 查阅
      viewApplicationBlockVisible: false,
      viewApplicationVisible: false,
      viewForm: {
        Title: null,
        EffectiveDate: null,
        InsuranceCorp: null,
        PolicyNumber: null,
        Author: null,
        StatusID: 0,
        branch: {
          Name: null,
          Address: null,
          Telphone: null
        },
        corpbroker: {
          BrokerCode: null,
          corp: {
            Name: null
          }
        },
        RequestDate: null,
        DateOfBirth: null,
        applicationTemplates: [{
          applicationBlocks: [{
            answers: []
          }]
        }],
        answerList: []
      },
      pinkSlipFormVisible: false,
      coiFormVisible: false,
      sheetFormVisible: false,
      pinkSlipForm: {
        InsuranceCorpName: null,
        InsuranceCorpAddress: null,
        InsuredName: null,
        InsuredAddress: 'Not provide',
        InsuredCity: 'Not provide',
        VehicleInfo: 'Not provide',
        EffectiveDate: null,
        ExpiryDate: null,
        PolicyNumber: null,
        Broker: ''
      },
      // processing
      ProcessingTypeID: null,
      ProcessingTitle: '',
      processingVisible: false,
      subapplicationTemplateEditionVisible: false
    }
  },
  mounted: function () {
    this.loadProducers()
    this.loadApplicationStatus()
    this.initInsuranceCompany()
    this.initTemplates()
    this.loadQuestionnaires()
    // this.search(null, 0)
    this.loadApplications(0)
  },
  methods: {
    sorttable: function (column) {
      if (column.order === 'descending') this.rankdesc(column.prop)
      else this.rank(column.prop)
      this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    rank: function (name) {
      this.list.sort(this.by(name))
    },
    rankdesc: function (name) {
      this.list.sort(this.bydesc(name))
    },
    sorttableHit: function (column) {
      if (column.order === 'descending') this.rankdescHit(column.prop)
      else this.rankHit(column.prop)
    },
    rankHit: function (name) {
      this.quotationSuggestions.sort(this.by(name))
    },
    rankdescHit: function (name) {
      this.quotationSuggestions.sort(this.bydesc(name))
    },
    processType: function (app) {
      if (app.StatusID === 4) return 'success'
      else return 'primary'
    },
    showQuotationBind: function (quotation) {
      this.quotationBindForm.InsuranceCorpQuotationID = quotation.InsuranceCorpQuotationID
      let effdate = moment(this.currentApplication.EffectiveDate)
      if (effdate.year() > 2020) this.quotationBindForm.EffectiveDate = effdate
      else this.quotationBindForm.EffectiveDate = null
      let expdate = moment(this.currentApplication.ExpiryDate)
      if (expdate.year() > 2020) this.quotationBindForm.ExpiryDate = expdate
      else this.quotationBindForm.ExpiryDate = null
      this.quotationBindForm.ProducerID = this.currentApplication.ProducerID
      // this.quotationBindForm.ClientCode = this.currentApplication.ClientCode
      this.quotationBindForm.PolicyNumber = quotation.PolicyNumber// this.currentApplication.PolicyNumber
      if (this.currentApplication.TypeID > 0) this.quotationBindForm.TypeID = this.currentApplication.TypeID
      else this.quotationBindForm.TypeID = 1
      this.quotationBindForm.LeadFromCorpID = this.currentApplication.LeadFromCorpID
      this.quotationBindForm.ClientCode = quotation.ClientCode
      this.quotationBindForm.Premium = quotation.Premium
      this.quotationBindForm.SalesPoints = quotation.SalesPoints
      this.quotationBindForm.OutstandingBalance = this.currentApplication.OutstandingBalance
      this.quotationBindVisible = true
    },
    showSendEmail: function (quotation) {
      let corp = this.insuranceCorpList.find(c => c.InsuranceCorpID === quotation.InsuranceCorpID)
      let quote = this.currentApplication.quote
      let operating = quote.Operating === null ? '' : quote.Operating
      // let subject = 'Quote request to ' + quotation.CorpName + '|' + operating + ' - ' + this.currentApplication.NameInsured
      let subject = 'Quote request | ' + this.currentApplication.NameInsured + ' | ' + operating
      this.quotationProcessingForm.CorpName = corp.ShortName
      if (this.$refs.se !== undefined) {
        this.$refs.se.setEmail(quotation.InsuranceCorpQuotationID, subject, corp.Email)
      } else {
        this.quoteEmail.businessId = quotation.InsuranceCorpQuotationID
        this.quoteEmail.subject = subject
        this.quoteEmail.mailto = corp.Email
      }
      this.quotationEmailVisible = true
    },
    showQuotationProcessing: function (quotation, statusid) {
      console.log('quotation', quotation)
      this.quotationProcessingForm = quotation
      this.quotationProcessingForm.Status = statusid
      this.quotationProcessingVisible = true
      /*
      this.quotationBindForm.InsuranceCorpQuotationID = quotation.InsuranceCorpQuotationID
      this.quotationBindForm.ApplicationID = quotation.ApplicationID
      this.quotationBindForm.InsuranceCorpID = quotation.InsuranceCorpID
      this.quotationBindForm.Premium = quotation.Premium
      this.quotationProcessingForm.Brief = quotation.Brief
      */
    },
    quotationBind: function () {
      this.$refs['quotationBindForm'].validate((valid) => {
        if (valid) {
          this.$confirm('Are you sure to bind it?', 'Confirm', {
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
            let id = this.quotationBindForm.InsuranceCorpQuotationID
            this.isLoadingApplicationQuotations = true
            let value = JSON.stringify(this.quotationBindForm)
            this.axios.post('/api/Services/CommerceService.asmx/BindQuotation', {id: id, jsonvalue: value}).then(res => {
              if (res) {
                console.log('bind', res)
                this.$message({
                  type: 'success',
                  message: 'Operation Succeeded'
                })
                this.currentApplication.StatusID = res.data
                this.setApplicationStatus(this.currentApplication)
                this.currentApplication.EffectiveDate = this.quotationBindForm.EffectiveDate
                this.currentApplication.Premium = this.quotationBindForm.Premium
                let quotation = this.currentApplication.quote.quotations.find(q => q.InsuranceCorpQuotationID === id)
                quotation.Status = 4
                quotation.StatusName = 'Bound'
                quotation.Premium = this.quotationBindForm.Premium
                quotation.SalesPoints = this.quotationBindForm.SalesPoints
                quotation.PolicyNumber = this.quotationBindForm.PolicyNumber
                quotation.ClientCode = this.quotationBindForm.ClientCode
                quotation.BillWayID = this.quotationBindForm.BillWayID
              }
              this.isLoadingApplicationQuotations = false
              this.quotationBindVisible = false
            }).catch(err => {
              console.log('删除出错', err)
              this.isLoadingApplicationQuotations = false
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: 'Operation Cancelled'
            })
          })
        } else {
          this.$message({
            type: 'error',
            message: 'Format Error'
          })
        }
      })
    },
    effectiveDateChange: function () {
      this.quotationBindForm.ExpiryDate = moment(this.quotationBindForm.EffectiveDate).add(1, 'year')
    },
    setApplicationStatus: function (app) {
      // let astatus = this.applicationStatuses.find(s => s.StatusID === app.StatusID)
      // app.Status = astatus.Name
      let astatus = this.statusList.find(s => s.key === app.StatusID)
      app.Status = astatus.value
    },
    checkQuotationProcessInput: function () {
      this.$refs['quotationProcessingForm'].validate((valid) => {
        if (valid) {
          this.quotationProcess()
        } else {
          this.$message({
            type: 'error',
            message: 'Format Error'
          })
        }
      })
    },
    quotationProcess: function () {
      this.$confirm('Are you sure to process it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        let id = this.quotationProcessingForm.InsuranceCorpQuotationID
        this.isQuotationProcessing = true
        this.quotationProcessingForm.StatusID = this.quotationProcessingForm.Status + 10 * this.quotationProcessingForm.emailStatus
        let value = JSON.stringify(this.quotationProcessingForm)
        console.log('quotationProcessingForm', value)
        this.axios.post('/api/Services/CommerceService.asmx/QuotationProcess', {jsonvalue: value}).then(res => {
          if (res) {
            console.log('quotationProcess', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            let appStatusID = res.data
            let quotation = this.currentApplication.quote.quotations.find(q => q.InsuranceCorpQuotationID === id)
            quotation.Status = this.quotationProcessingForm.Status
            let qstatus = this.quotationProcessings.find(s => s.StatusID === quotation.Status)
            quotation.StatusName = qstatus.Status
            this.currentApplication.StatusID = appStatusID
            this.setApplicationStatus(this.currentApplication)
          }
          this.isQuotationProcessing = false
          this.quotationProcessingVisible = false
        }).catch(err => {
          console.log('quotationProcess error', err)
          this.isQuotationProcessing = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    resetQuotations: function (app) {
      app.unselectedCorps = this.insuranceCorpList.filter(c => app.quote.quotations.find(q => q.InsuranceCorpID === c.InsuranceCorpID) === undefined)
      this.multipleSelection = []
    },
    showQuotation: function (application) {
      this.setCurrent(application)
      this.multipleSelection = []
      this.loadApplicationQuotation(application)
    },
    loadApplicationQuotation: function (app) {
      this.isLoadingApplicationQuotations = true
      this.axios.post('/api/Services/CommerceService.asmx/GetQuotations', {applicationid: app.ApplicationID}).then(res => {
        if (res) {
          console.log('GetQuotations', res.data)
          res.data.quotations.forEach(q => {
            q.QuoteTime = moment(q.QuoteTime)
            let corp = this.insuranceCorpList.find(c => c.InsuranceCorpID === q.InsuranceCorpID)
            q.CorpName = corp.ShortName === '' ? corp.Name : corp.ShortName
          })
          app.quote = res.data
          app.unselectedCorps = this.insuranceCorpList.filter(c => app.quote.quotations.find(q => q.InsuranceCorpID === c.InsuranceCorpID) === undefined)
          console.log('selectables', app.unselectedCorps)
          this.isLoadingApplicationQuotations = false
          this.quotationVisible = true
        }
      }).catch(err => {
        console.log('GetQuotations列表出错', err)
        this.isLoadingApplicationQuotations = false
      })
    },
    handleSelectionChange: function (val) {
      let ids = []
      val.forEach(item => {
        ids.push(item.InsuranceCorpID)
      })
      this.multipleSelection = ids
    },
    showQuotationSuggestion: function () {
      let app = this.currentApplication
      this.loadQuotationSuggestions(app)
    },
    loadQuotationSuggestions: function (app) {
      // this.isLoadingApplicationQuotations = true
      this.axios.post('/api/Services/CommerceService.asmx/GetQuotationSuggestions', {applicationid: app.ApplicationID}).then(res => {
        if (res) {
          console.log('GetQuotationSuggestions', res.data)
          if (res.data.OperatingID === 0) {
            this.isLoadingApplicationQuotations = false
            this.$message({
              type: 'info',
              message: 'No suggestion available.'
            })
            return
          }
          app.Operating = res.data.Operating
          /*
          res.data.forEach(r => {
            let corp = this.insuranceCorpList.find(c => c.InsuranceCorpID === r.InsuranceCorpID)
            if (corp !== undefined) r.CorpName = corp.ShortName
            r.QuotedRate = Math.floor(r.QuotedCount * 100 / r.AppliedCount)
            r.BoundRate = Math.floor(r.BoundCount * 100 / r.AppliedCount)
          })
          res.data.sort(this.bydesc('BoundRate'))
          this.quotationSuggestions = res.data
           */
          let data = []
          let totalBound90 = 0
          let totalApplied90 = 0
          let totalBound365 = 0
          let totalApplied365 = 0
          this.insuranceCorpList.forEach(c => {
            if (c.InsuranceCorpID === 0) return
            let data0 = res.data.StatisticsList[0].find(r => r.InsuranceCorpID === c.InsuranceCorpID)
            let data1 = res.data.StatisticsList[1].find(r => r.InsuranceCorpID === c.InsuranceCorpID)
            let item = {
              InsuranceCorpID: c.InsuranceCorpID,
              CorpName: c.ShortName === '' ? c.Name : c.ShortName,
              AppliedCount0: data0 === undefined ? 0 : data0.AppliedCount,
              BoundCount0: data0 === undefined ? 0 : data0.BoundCount,
              AppliedCount1: data1 === undefined ? 0 : data1.AppliedCount,
              BoundCount1: data1 === undefined ? 0 : data1.BoundCount
            }
            item.HitRatio0 = item.AppliedCount0 === 0 ? null : Math.floor(item.BoundCount0 / item.AppliedCount0 * 100)
            item.HitRatio1 = item.AppliedCount1 === 0 ? null : Math.floor(item.BoundCount1 / item.AppliedCount1 * 100)
            data.push(item)
            totalBound90 += item.BoundCount0
            totalApplied90 += item.AppliedCount0
            totalBound365 += item.BoundCount1
            totalApplied365 += item.AppliedCount1
          })
          this.hitRatioSummary.bound90 = totalBound90
          this.hitRatioSummary.applied90 = totalApplied90
          this.hitRatioSummary.bound365 = totalBound365
          this.hitRatioSummary.applied365 = totalApplied365
          this.hitRatioSummary.ratio90 = totalApplied90 === 0 ? '' : Math.floor(100 * totalBound90 / totalApplied90)
          this.hitRatioSummary.ratio365 = totalApplied365 === 0 ? '' : Math.floor(100 * totalBound365 / totalApplied365)
          this.quotationSuggestions = data
          console.log('Hit Ratio Data', data)
          // this.isLoadingApplicationQuotations = false
          this.quotationSuggestionVisible = true
        }
      }).catch(err => {
        console.log('GetQuotationSuggestions', err)
        this.isLoadingApplicationQuotations = false
      })
    },
    saveQuotations: function () {
      let ids = []
      this.multipleSelection.forEach(id => {
        ids.push(id)
      })
      if (ids.length === 0) return
      let corpids = JSON.stringify(ids)
      let appid = this.currentApplicationID
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/ApplyQuotations', {applicationid: appid, corpids: corpids}).then(res => {
        if (res) {
          console.log('修改', res)
          res.data.forEach(q => {
            q.QuoteTime = moment(q.QuoteTime)
          })
          let app = this.currentApplication
          if (app.quote === undefined) {
            app.quote = {
              ApplicationID: app.ApplicationID,
              quotations: []
            }
          }
          app.quote.quotations = app.quote.quotations.concat(res.data)
          this.resetQuotations(app)
          if (app.StatusID === 1) {
            app.StatusID = 2
            this.setApplicationStatus(app)
          }
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
        }
        this.isLoading = false
        // this.quotationBindForm = null
      }).catch(err => {
        console.log('修改出错', err)
        this.$message({
          type: 'error',
          message: 'Operation failed'
        })
        this.isLoading = false
      })
    },
    // 删除
    delQuotation: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoadingApplicationQuotations = true
        this.axios.post('/api/Services/CommerceService.asmx/RemoveQuotation', {id: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.currentApplication.StatusID = res.data
            this.setApplicationStatus(this.currentApplication)
            this.currentApplication.quote.quotations = this.currentApplication.quote.quotations.filter(item => item.InsuranceCorpQuotationID !== id)
            this.resetQuotations(this.currentApplication)
          }
          this.isLoadingApplicationQuotations = false
        }).catch(err => {
          console.log('删除出错', err)
          this.isLoadingApplicationQuotations = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    saveApplicationBlock: function (close) {
      let blockitem = this.currentBlockItem
      let ablock = JSON.parse(JSON.stringify(this.currentApplicationBlock))
      ablock.answers.forEach(answer => {
        answer.blockQuestion = null
        answer.QuestionDesc = ''
        if (answer.TypeID === 6) answer.optionAnswers = null
        else if (answer.TypeID === 7) {
          answer.optionAnswers = answer.optionAnswers.filter(oa => { return oa.IsChecked })
        }
      })
      let value = JSON.stringify(ablock)
      console.log('SaveApplicationBlock', ablock)
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/SaveApplicationBlock', {applicationblock: value}).then(res => {
        if (res) {
          console.log('修改', res)
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          let appBlock = res.data
          blockitem.applicationBlock = res.data
          blockitem.Status = appBlock.StatusID === 0 ? 'Not Answer' : (appBlock.StatusID === 1 ? 'Answered' : (appBlock.StatusID === 2 ? 'Skipped' : 'Answering'))
        }
        this.isLoading = false
        if (close) this.editApplicationBlockVisible = false
      }).catch(err => {
        console.log('修改出错', err)
        this.$message({
          type: 'error',
          message: 'Operation failed'
        })
        this.isLoading = false
      })
    },
    hideEdition: function () {
      this.applicationFormVisible = false
      this.subapplicationTemplateEditionVisible = false
    },
    hideEmailWindow: function (quotationid) {
      this.quotationEmailVisible = false
      let quotation = this.currentApplication.quote.quotations.find(q => q.InsuranceCorpQuotationID === quotationid)
      if (quotation !== undefined) {
        if (quotation.Status === 0) {
          quotation.Status = 1
          quotation.emailStatus = 1
          quotation.StatusName = 'Submitted'
        }
      }
    },
    closeEditApplication: function (id, type) {
      this.editApplicationWindowVisible = false
      if (type === 'saveAndPrint') {
        this.showApplication(id)
      }
      // this.search(this.searchForm.name, 0)
      this.loadApplications(0)
    },
    // 关闭修改
    closeEdit: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        // this.$refs['editForm'].resetFields()
        // this.editForm.templateBlocks = []
        // this.currentBlock = null
        done()
      }).catch(() => {})
    },
    showNextBlock: function () {},
    showSkipBlock: function () {},
    resetLeftChildren: function () {},
    skipLeftChildren: function () {},
    checkOver: function () {},
    /**
     * @return {boolean}
     */
    IsDate (dateval) {
      return dateval.length > 20 && isNaN(dateval) && !isNaN(Date.parse(dateval))
      // if (dateval.length > 20 && isNaN(dateval) && !isNaN(Date.parse(dateval))) return true
      // else return false
    },
    // 日期格式
    dateFormat (date) {
      let result = moment(date)
      if (result.year() > 2020) return result.format('YYYY-MM-DD')
      else return ''
      // return moment(date).format('YYYY-MM-DD')
    },
    setCurrent: function (application) {
      this.currentApplication = application
      this.currentApplicationID = application.ApplicationID
    },
    showViewApplicationBlock: function (blockItem) {
      let id = blockItem.applicationBlock.ApplicationBlockID
      this.currentApplicationBlockID = id
      this.currentBlockName = blockItem.BlockName
      this.viewApplicationBlockVisible = true
      if (this.$refs.vab !== undefined) {
        this.$refs.vab.loadApplicationBlock(id, blockItem.BlockName)
      }
    },
    showApplication: function (id) {
      this.viewApplicationVisible = true
      if (this.$refs.vm !== undefined) {
        this.$refs.vm.loadApplication(id)
      }
    },
    showViewApplication: function (application) {
      if (application !== undefined) this.setCurrent(application)
      this.showApplication(this.currentApplication.ApplicationID)
    },
    showEditApplication: function (application) {
      let id = application.ApplicationID
      this.currentApplicationID = id
      this.editApplicationWindowVisible = true
      if (this.$refs.eacl !== undefined) {
        this.$refs.eacl.loadApplication(id)
      }
    },
    showEditBlock: function (blockItem) {
      this.currentBlockItem = blockItem
      let aTemplate = blockItem.applicationTemplate
      if (aTemplate.blockQuestion === undefined) this.loadTemplateBlockQuestions(aTemplate)
      let aBlock = blockItem.applicationBlock
      this.loadApplicationBlock(aTemplate, aBlock)
    },
    showEditSubApplicationTemplate: function (blockItem) {
      this.currentBlockItem = blockItem
      this.subapplicationTemplateEditionVisible = true
      if (this.$refs.esat !== undefined) {
        this.$refs.esat.loadApplicationTemplate(blockItem.ApplicationTemplateID)
      }
    },
    loadApplication: function (app) {
      // if (app.applicationTemplate !== null) return
      let id = app.ApplicationID
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationFrame', {applicationid: id}).then(res => {
        if (res) {
          console.log('GetApplicationFrame', res.data)
          app.applicationTemplate = res.data.applicationTemplate
          if (app.applicationTemplate !== null) {
            app.applicationTemplate.applicationBlocks = app.applicationTemplate.applicationBlocks.filter(ab => ab !== null)
            // build application tree
            app.blocks = []
            app.blockCount = 0
            let id = 0
            app.applicationTemplate.templateBlocks.forEach(tb => {
              if (tb.ChildTypeID === 0) {
                let appBlock = app.applicationTemplate.applicationBlocks.find(ab => ab.TemplateBlockID === tb.TemplateBlockID)
                if (appBlock !== undefined) {
                  tb.applicationBlock = appBlock
                  tb.applicationBlock.topTemplateBlockID = tb.applicationBlock.TemplateBlockID
                }
                let blockItem = {
                  id: id++,
                  TypeID: 0,
                  templateBlock: tb,
                  BlockID: tb.BlockID,
                  BlockName: tb.BlockName,
                  Status: appBlock === undefined ? 'Not Answer' : (appBlock.StatusID === 0 ? 'Not Answer' : (appBlock.StatusID === 1 ? 'Answered' : (appBlock.StatusID === 2 ? 'Skipped' : 'Answering'))),
                  applicationBlock: appBlock,
                  app: app,
                  applicationTemplate: app.applicationTemplate
                }
                app.blocks.push(blockItem)
                app.blockCount = id
                return
              }
              // tb.applicationBlocks = []
              let appb = {
                id: id++,
                BlockID: tb.BlockID,
                BlockName: tb.BlockName,
                TypeID: 2,
                ApplicationID: app.ApplicationID,
                applicationTemplate: app.applicationTemplate,
                templateBlock: tb,
                app: app,
                children: []
              }
              app.blocks.push(appb)
              // fill in subApplicationTemplate
              tb.applicationTemplates = app.applicationTemplate.children.filter(c => c.TemplateID === tb.BlockID)
              app.applicationTemplate.applicationBlocks.forEach(ab => {
                let templateBlock = tb.subTemplateBlocks.find(subtb => subtb.TemplateBlockID === ab.TemplateBlockID)
                if (templateBlock === undefined) return
                // tb.applicationBlocks.push(ab)
                let subatemplate = tb.applicationTemplates.find(at => at.RepeatedID === ab.RepeatedID)
                if (subatemplate === undefined) {
                  subatemplate = {
                    BlockName: tb.BlockName,
                    RepeatedID: ab.RepeatedID,
                    applicationBlocks: []
                  }
                  tb.applicationTemplates.push(subatemplate)
                }
                if (subatemplate.applicationBlocks === null) subatemplate.applicationBlocks = []
                subatemplate.applicationBlocks.push(ab)
                ab.topTemplateBlockID = tb.TemplateBlockID
                ab.BlockName = templateBlock.BlockName
              })
              tb.applicationTemplates.forEach(at => {
                at.TemplateID = tb.TemplateID
                let childat = {
                  id: id++,
                  ApplicationTemplateID: at.ApplicationTemplateID,
                  ApplicationID: app.ApplicationID,
                  BlockID: appb.BlockID,
                  TemplateBlockID: tb.TemplateBlockID,
                  RepeatedID: at.RepeatedID,
                  Parent: appb,
                  BlockName: tb.BlockName + ':' + (at.RepeatedID + 1),
                  TypeID: 1,
                  QuestionnaireID: at.QuestionnaireID,
                  app: app,
                  applicationTemplate: app.applicationTemplate,
                  children: []
                }
                appb.children.push(childat)
                at.applicationBlocks.forEach(ab => {
                  let childab = {
                    id: id++,
                    TypeID: 0,
                    BlockID: ab.BlockID,
                    BlockName: ab.BlockName + ':' + (at.RepeatedID + 1),
                    Status: ab.StatusID === 0 ? 'Not Answer' : (ab.StatusID === 1 ? 'Answered' : (ab.StatusID === 2 ? 'Skipped' : 'Answering')),
                    app: app,
                    applicationBlock: ab,
                    applicationTemplate: at
                  }
                  childat.children.push(childab)
                })
              })
            })
            app.blockCount = id
            this.loadTemplateBlockQuestions(app.applicationTemplate)
          }
          // console.log('ApplicationFrame', app)
        }
        this.isLoading = false
      }).catch(err => {
        console.log('ApplicationFrame', err)
        this.isLoading = false
      })
    },
    loadApplicationBlock: function (aTemplate, aBlock) {
      this.isLoadingApplicationBlock = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationBlock', {id: aBlock.ApplicationBlockID}).then(res => {
        if (res) {
          console.log('GetApplicationBlock', res.data)
          aBlock.answers = res.data.answers
          this.matchBlockQuestions(aTemplate, aBlock)
          this.isLoadingApplicationBlock = false
          if (aBlock.answers[0].StatusID !== 1) {
            aBlock.answers[0].StatusID = 1
            aBlock.StatusID = 1
          }
          this.currentApplicationBlock = aBlock
          this.currentApplicationTemplate = aTemplate
          this.editApplicationBlockVisible = true
        }
      }).catch(err => {
        console.log('GetApplicationBlock列表出错', err)
        this.isLoadingApplicationBlock = false
      })
    },
    loadTemplateBlockQuestions: function (atemplate) {
      console.log('loadTemplateBlockQuestions start from', atemplate)
      this.isLoadingTemplateBlockQuestions = true
      this.axios.post('/api/Services/BaseService.asmx/GetBlockQuestionsByTemplate_all', {templateid: atemplate.TemplateID}).then(res => {
        if (res) {
          console.log('GetBlockQuestionsByTemplate_all', res)
          atemplate.blockQuestions = res.data
          atemplate.children.forEach(c => {
            c.blockQuestions = atemplate.blockQuestions
          })
          // console.log('isLoadingTemplateBlockQuestions:', this.isLoadingTemplateBlockQuestions)
        }
        this.isLoadingTemplateBlockQuestions = false
      }).catch(err => {
        console.log('GetBlockQuestionsByTemplate出错', err)
        this.isLoadingTemplateBlockQuestions = false
      })
    },
    matchBlockQuestions: function (aTemplate, aBlock) {
      console.log('applicationTemplate', aTemplate)
      if (aTemplate.blockQuestions === undefined) return
      aBlock.answers.forEach(a => {
        if (a.IsRoute) {
          // console.log('answer.QuestionID:', a.QuestionID)
          a.blockQuestion = aTemplate.blockQuestions.find(bq => bq.BlockQuestionID === a.BlockQuestionID)
          if (a.blockQuestion === null) {
            console.log('The unmatched answer:', a)
          }
          if (a.QuestionID === 824) {
            // console.log('answer:', a)
          }
        }
      })
    },
    addSubApplicationTemplate: function (blockItem) {
      this.$confirm('Are you sure to add new?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        let appid = blockItem.ApplicationID
        this.isLoading = true
        this.axios.post('/api/Services/CommerceService.asmx/AddSubApplicationTemplate', {applicationid: appid, templateid: blockItem.BlockID}).then(res => {
          if (res) {
            console.log('AddSubApplicationTemplate', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            let id = blockItem.app.blockCount
            let atBlockItem = {
              id: id++,
              BlockID: blockItem.BlockID,
              BlockName: blockItem.BlockName + ':',
              TypeID: 1,
              children: []
            }
            blockItem.children.push(atBlockItem)
            let childIndex = 0
            res.data.forEach(ab => {
              childIndex = ab.RepeatedID + 1
              // let templateblock = blockItem.applicationTemplate.templateBlocks.find(tb => tb.BlockID === ab.BlockID)
              let templateblock = blockItem.templateBlock.subTemplateBlocks.find(subtb => subtb.BlockID === ab.BlockID)
              let blockname = ''
              if (templateblock !== undefined) blockname = templateblock.BlockName
              let child = {
                id: id++,
                ApplicationBlockID: ab.ApplicationBlockID,
                applicationBlock: ab,
                applicationTemplate: blockItem.applicationTemplate,
                RepeatedID: ab.RepeatedID,
                BlockID: ab.BlockID,
                BlockName: blockname + ':' + childIndex,
                Status: 'Not Answer',
                TypeID: 0
              }
              atBlockItem.children.push(child)
            })
            atBlockItem.BlockName += childIndex
            blockItem.app.blockCount = id
          }
          this.isLoading = false
        }).catch(err => {
          console.log('删除出错', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    removeSubApplicationTemplate: function (blockItem) {
      this.$confirm('Are you sure to remove it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        let id = blockItem.ApplicationID
        this.isLoading = true
        this.axios.post('/api/Services/CommerceService.asmx/RemoveSubApplicationTemplate', {applicationid: id, templateid: blockItem.BlockID, repeatedid: blockItem.RepeatedID}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            let parent = blockItem.Parent
            let index = blockItem.RepeatedID
            parent.children.splice(index, 1)
          }
          this.isLoading = false
        }).catch(err => {
          console.log('删除出错', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    // Templates列表
    initTemplates: function () {
      this.isLoadingTemplates = true
      this.axios.post('/api/Services/BaseService.asmx/GetTemplatesByBusinessType', {btypeid: 4}).then(res => {
        if (res) {
          console.log('Templates列表', res)
          this.templateList = res.data
        }
        this.isLoadingTemplates = false
      }).catch(err => {
        console.log('Templates列表出错', err)
        this.isLoadingTemplates = false
      })
    },
    // Questionnaire
    loadQuestionnaires: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetQuestionnaires', {}).then(res => {
        if (res) {
          console.log('Questionnaires', res)
          let nocorp = [{BlockID: 0, Name: 'No Need'}]
          this.questionnaires = nocorp.concat(res.data)
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    loadApplicationStatus: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'ApplicationStatus'}).then(res => {
        if (res) {
          console.log('statusList', res)
          this.statusList = res.data
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    loadProducers: function () {
      this.isLoadingProducers = true
      this.axios.post('/api/Services/baseservice.asmx/GetSelectableProducers', {}).then(res => {
        if (res) {
          console.log('loadProducers', res)
          this.producerList = res.data
          if (!this.isLoadingApplications) {
            this.totalList.forEach(a => {
              let producer = this.producerList.find(p => p.StaffID === a.ProducerID)
              if (producer !== undefined) a.Producer = producer.Name
              else a.Producer = ''
              if (a.StaffID === a.ProducerID) a.Author = a.Producer
              else {
                let author = this.producerList.find(p => p.StaffID === a.StaffID)
                if (producer !== undefined) a.Author = author.Name
                else a.Author = ''
              }
            })
          }
        }
        this.isLoadingProducers = false
      }).catch(err => {
        console.log('loadProducers', err)
        this.isLoadingProducers = false
      })
    },
    // 保险公司列表
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps', {}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          let nocorp = [{InsuranceCorpID: 0, Name: 'No Company'}]
          this.insuranceCorpList = nocorp.concat(res.data.filter(c => c.BusinessLineID !== 1))
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // 删除
    voidApplication: function (id) {
      this.$confirm('Are you sure to void it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/CommerceService.asmx/VoidApplication', {applicationid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            console.log('void', this.list)
            let app = this.list.find(item => item.ApplicationID === id)
            app.StatusID = res.data
            this.setApplicationStatus(app)
            // this.list.splice(index, 1)
            // this.list = this.list.filter(item => item.ApplicationID !== id)

            this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            this.total = this.list.length
          }
          this.isLoading = false
        }).catch(err => {
          console.log('删除出错', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    reinstateApplication: function (id) {
      this.$confirm('Are you sure to reinstate it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/CommerceService.asmx/UnvoidApplication', {applicationid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            console.log('Unvoid', this.list)
            let app = this.list.find(item => item.ApplicationID === id)
            app.StatusID = res.data
            this.setApplicationStatus(app)

            // this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            // this.total = this.list.length
          }
          this.isLoading = false
        }).catch(err => {
          console.log('删除出错', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    },
    loadApplications: function (start) {
      // this.isLoadingApplications = true
      if (start === 0) {
        this.totalList = []
        this.isLoadingTotal = true
        this.isLoaing = true
      }
      this.axios.post('/api/Services/CommerceService.asmx/GetProcessings', {start: start}).then(res => {
        if (res) {
          console.log('Applications查询', res)
          if (start === 0) {
            this.total = res.count
            this.totalList = res.data
            this.list = this.totalList
            this.pageCount = Math.ceil(this.total / this.pageSize)
            this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            this.isLoading = false
          } else {
            this.totalList = this.totalList.concat(res.data)
          }
          if (this.totalList.length === this.total) {
            this.totalList.sort(this.bydesc('ApplicationID'))
            this.totalList.forEach(a => {
              this.attachInfo(a)
              /*
              let status = this.statusList.find(s => s.key === a.StatusID)
              if (status !== undefined) a.Status = status.value
              else a.Status = ''
              if (!this.isLoadingProducers) {
                let producer = this.producerList.find(p => p.StaffID === a.ProducerID)
                if (producer !== undefined) a.Producer = producer.Name
                else a.Producer = ''
              }
               */
            })
            this.list = this.totalList
            this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
            // this.pageCount = Math.ceil(this.total / this.pageSize)
            // this.isLoadingApplications = false
            this.isLoadingTotal = false
          } else this.loadApplications(this.totalList.length)
        }
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
        this.isLoadingTotal = false
      })
    },
    attachInfo: function (a) {
      a.EffectiveDate = moment(a.EffectiveDate)
      a.ExpiryDate = moment(a.ExpiryDate)
      // let corp = this.insuranceCompanyList.find(c => c.InsuranceCorpID === a.InsuranceCorpID)
      // if (corp !== undefined) a.CorpName = corp.Name
      // else a.CorpName = ''
      let status = this.statusList.find(s => s.key === a.Status)
      if (status !== undefined) a.Status = status.value
      else a.Status = ''
      if (!this.isLoadingProducers) {
        let producer = this.producerList.find(p => p.StaffID === a.ProducerID)
        if (producer !== undefined) a.Producer = producer.Name
        else a.Producer = ''
        if (a.StaffID === a.ProducerID) a.Author = a.Producer
        else {
          let author = this.producerList.find(p => p.StaffID === a.StaffID)
          if (author !== undefined) a.Author = author.Name
          else a.Author = ''
        }
      }
    },
    // 查询
    search: function () {
      let query = this.searchForm.name.toLowerCase().trim()
      if (query === '') {
        this.list = this.totalList
      } else {
        this.list = this.totalList.filter(r => r.Title.toLowerCase().indexOf(query) >= 0 ||
          r.ApplicationID === Number(query) ||
          (r.Producer !== null && r.Producer.toLowerCase().indexOf(query) >= 0) ||
          (r.NameInsured !== null && r.NameInsured.toLowerCase().indexOf(query) >= 0) ||
          (r.PolicyNumber !== null && r.PolicyNumber.toLowerCase().indexOf(query) >= 0) ||
          (r.ClientCode !== null && r.ClientCode.toLowerCase().indexOf(query) >= 0) ||
          r.EffectiveDate.format('YYYY-MM-DD').indexOf(query) >= 0 ||
          r.ExpiryDate.format('YYYY-MM-DD').indexOf(query) >= 0
        )
      }
      this.total = this.list.length
      this.pageCount = Math.ceil(this.total / this.pageSize)
      this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    /*
    search: function (name, start) {
      this.isLoading = true
      if (start === 0) this.list = []
      // 后端不支持null查询，把null转换成''
      if (name === null) {
        this.searchName = ''
      } else {
        this.searchName = name
      }
      this.axios.post('/api/Services/CommerceService.asmx/GetProcessingApplications', {query: this.searchName, start: start}).then(res => {
        if (res) {
          console.log('查询', res)
          if (res.data.length < this.pagerCount * this.pageSize) this.isAll = true
          else this.isAll = false
          res.data.forEach(a => {
            if (a.InsuranceCorpID === 0) a.CorpName = ''
            else {
              let corp = this.insuranceCorpList.find(i => i.InsuranceCorpID === a.InsuranceCorpID)
              if (corp !== undefined) a.CorpName = corp.Name
              else a.CorpName = ''
            }
            let status = this.statusList.find(s => s.key === a.StatusID)
            if (status !== undefined) a.Status = status.value
            else a.Status = ''
            let producer = this.producerList.find(p => p.StaffID === a.ProducerID)
            if (producer !== undefined) a.Producer = producer.Name
            else a.Producer = ''
          })
          this.list = this.list.concat(res.data)
          this.total = this.list.length
          this.pageCount = Math.ceil(this.total / this.pageSize)
          console.log('pageCount', this.pageCount)
          this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
          // this.list = res.data
          // this.total = this.list.length
          // this.currentPage = 1
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
     */
    handleCurrentChange: function (val) {
      console.log(`当前页: ${val}`)
      if (val === this.pageCount && !this.isAll) {
        // this.search(null, this.total)
      } else {
      }
      this.currentlist = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    // 重置查询
    resetSearch: function () {
      this.$refs['searchForm'].resetFields()
      this.searchForm.name = ''
      this.search()
    },
    // UW弹窗
    showUnderWriter: function (application) {
      this.currentApplication = application
      this.currentApplicationID = application.ApplicationID
      this.ProcessingTypeID = 1
      this.ProcessingTitle = 'Underwriting Processing'
      this.processingVisible = true
      if (this.$refs.enbp !== undefined) {
        this.$refs.enbp.loadProperties(1, application.ApplicationID)
      }
    },
    // 查阅弹窗
    view: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplication', {applicationid: id}).then(res => {
        if (res) {
          console.log('查询单个', res)
          this.viewApplicationVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.viewForm = res.data
            this.viewForm.InsuranceCorp = this.insuranceCorpList.find(item => item.InsuranceCorpID === res.data.InsuranceCorpID).Name
            this.viewForm.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
            this.viewForm.RequestDate = moment(res.data.RequestDate).format('YYYY-MM-DD')
            this.viewForm.DateOfBirth = moment(res.data.DateOfBirth).format('YYYY-MM-DD')
            this.printObj.popTitle = this.viewForm.Title // + '( ' + this.viewForm.Author + ')'
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询单个出错', err)
        this.isLoading = false
      })
    },
    // 关闭查阅
    closeView: function (done) {
      this.viewForm = {
        Title: null,
        EffectiveDate: null,
        InsuranceCorp: null,
        PolicyNumber: null,
        Author: null,
        branch: {
          Name: null,
          Address: null,
          Telphone: null
        },
        corpbroker: {
          BrokerCode: null,
          corp: {
            Name: null
          }
        },
        RequestDate: null,
        DateOfBirth: null,
        applicationTemplates: [{
          applicationBlocks: [{
            answers: []
          }]
        }],
        answerList: []
      }
      done()
    },
    // 转pdf
    pdf: function (title, EffectiveDate) {
      this.htmlTitle = title + ' ' + EffectiveDate
      this.getPdf('#pdfDom')
      this.axios.post('/api/Services/CommerceService.asmx/CreatePrintRecord', {applicationid: this.viewForm.ApplicationID, typeid: 1}).then(res => {
        if (res) {
          console.log('create printRecord', res)
        }
      }).catch(err => {
        console.log('导出Application PDF出错', err)
      })
    },
    showSheet: function (applicationid) {
      this.currentApplicationID = applicationid
      this.sheetFormVisible = true
      if (this.$refs.vs !== undefined) {
        this.$refs.vs.loadBusinessObj(applicationid)
      }
    }
  }
}
</script>

<style scoped>

</style>
