<!--
FileName: Library/block/blocks.vue
Author: Ge Chen
Update Date: 2023/9/20
Function: Show block list and all operations on the list.
-->
<template>
  <div>
    <div class="inPageTitle">
      <span class="inPageNav">Blocks for {{businessTypes[btypeId]}}</span>
      <div class="rightBtnBox">
        <el-button icon="el-icon-plus" type="primary" @click="showAdd()" :loading="isLoading || isLoadingInsuranceCompany">New</el-button>
      </div>
    </div>
    <div class="inPageContent">
      <div class="searchBox">
        <el-form :model="searchForm" ref="searchForm" class="searchForm">
          <el-form-item label="" prop="name">
            <el-input v-model="searchForm.name" placeholder="Name" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search(searchForm.name)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Go</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" @click="resetSearch()" :loading="isLoading || isLoadingInsuranceCompany" size="small">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" empty-text="No Record" v-loading="isLoading || isLoadingInsuranceCompany" element-loading-background="rgba(255, 255, 255, 0.5)">
        <el-table-column label="Block ID" prop="BlockID" width="100" fixed="left"></el-table-column>
        <el-table-column label="Use Times" prop="UseTimes" width="100" fixed="left">
          <template slot-scope="scope">
            <a href="#" @click="showTemplatesDetail(scope.row.BlockID)">{{scope.row.UseTimes}}</a>
          </template>
        </el-table-column>
        <el-table-column label="Name" prop="Name" min-width="300"></el-table-column>
        <el-table-column label="Type" prop="TypeName" min-width="300"></el-table-column>
        <el-table-column label="Action" width="300" fixed="right">
          <template v-slot="scope">
            <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row.BlockID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Edit</el-button>
            <el-button icon="el-icon-delete" type="danger" @click="del(scope.row.BlockID)" :loading="isLoading || isLoadingInsuranceCompany" size="small">Delete</el-button>
            <el-button icon="el-icon-copy" type="" @click="duplicate(scope.row.BlockID)" :loading="isLoading" size="small">Duplicate</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background :page-size=pageSize :pager-count=pagerCount :current-page.sync=currentPage layout="prev, pager, next" :total=total class="pageList">
      </el-pagination>
      <!----------------------------------------------新增弹窗开始----------------------------------------------------->
      <el-dialog title="Add New Block" :visible.sync="addFormVisible" width="1000px" center :before-close="closeAdd">
        <el-form :model="addForm" ref="addForm" :rules="addFormRules" class="form choiceQuestionForm">
          <el-row>
            <el-col span="16">
              <el-form-item label="Name" prop="Name">
                <el-input v-model="addForm.Name" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col span="8">
              <el-form-item label="Type" prop="TypeID">
                <el-select v-model="addForm.TypeID" placeholder="Block Type" size="small" class="">
                  <el-option v-for="item in blockTypes" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <div v-for="(item, index) in addForm.blockQuestions" :key="index" class="choice">
            <el-form-item class="marginLeft10">
              <el-input v-model="item.Label" class="labelInput" size="small" placeholder="Label"></el-input>
              <span><b class="blockQuestionB">[{{questionTypeList.find(it => it.id === item.question.TypeID).name}}]</b>{{item.question.QuestionID+ item.question.InputType+ '. ' + item.question.Description}}</span>
            </el-form-item>
            <el-form-item class="marginLeft20">
              <el-checkbox v-model="item.IsRoute">Is Route</el-checkbox>
            </el-form-item>
            <el-form-item class="marginLeft20" v-if="item.IsRoute">
              <el-radio-group v-model="item.RouteTypeID">
                <el-radio :label="1">
                  <span>Base On Question</span>
                </el-radio>
                <el-radio :label="2" v-if="item.question.TypeID === 6 || (item.question.TypeID === 3 && (item.question.InputType.indexOf('list') >= 0 ||item.question.InputType === 'number' || item.question.InputType === 'date'))">
                  <span>Base On Answer</span>
                </el-radio>
              </el-radio-group>
              <el-button icon="el-icon-bottom-right" type="primary" @click="showAddRoutes(item, index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup">Route</el-button>
            </el-form-item>
            <el-form-item class="marginLeft20">
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('addForm', index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-up" v-if="index !== 0" type="primary" @click="upChoice('addForm', index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-down" v-if="index !== addForm.blockQuestions.length - 1" type="primary" @click="downChoice('addForm', index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('addForm')" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnSingle">Question</el-button>
            <el-select v-model="currentQuestion" placeholder="Question" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
              <el-option class="questionOption" v-for="item in questionList" :key="item.QuestionID" :label="item.QuestionID + '. ' + item.Description" :value="item.QuestionID"></el-option>
            </el-select>
            <el-select v-model="currentQuestionType" placeholder="Question Type" size="small" class="questionType questionRightBtn" @change="changeQuestionType(currentQuestionType)" style="width: 207px;">
              <el-option v-for="item in questionTypeList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="add()" :loading="isLoading || isLoadingInsuranceCompany">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------新增弹窗结束----------------------------------------------------->
      <!----------------------------------------------路由编辑弹窗开始------------------------------------------------->
      <el-dialog title="Route" :visible.sync="routesFormVisible" width="800px" top="20vh" center :before-close="closeAddRoutes">
        <el-form :model="routesForm" ref="routesForm" class="form">
          <el-form-item label="Question">
            <span>{{routesForm.Description}}</span>
          </el-form-item>
          <el-form-item label="Insurance Company">
            <el-select v-model="currentInsuranceCompany" placeholder="Please Select" no-data-text="No Record" filterable>
              <el-option v-for="item in insuranceCompanyList" :key="item.InsuranceCorpID" :label="item.Name" :value="item.InsuranceCorpID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-for="(item, index) in routesForm.routes.filter(i => i.InsuranceCorpID === currentInsuranceCompany)" :key="index" class="confirmBtn confirmBtnBlock smallLine">
            <el-row :gutter="10">
              <el-radio-group v-model="item.RouteLevel">
                <el-radio :label="0">
                  <span>Route On Question</span>
                </el-radio>
                <el-radio :label="1">
                  <span>Route On Block</span>
                </el-radio>
                <el-radio :label="2">
                  <span>Route On Template</span>
                </el-radio>
              </el-radio-group>
            </el-row>
            <!--RouteType为BaseOnQuestion开始-->
            <div v-if="routesForm.RouteTypeID === 1">
              <el-row :gutter="10">
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" v-show="false">
                  <el-input v-model="item.Operator" clearable size="small"></el-input>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" v-show="false">
                  <el-input v-model="item.Operand" clearable size="small"></el-input>
                </el-col>
                <el-col :xs="21" :sm="21" :md="21" :lg="21" :xl="21" v-if="addFormVisible">
                  <el-select v-if="item.RouteLevel === 0" v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                    <el-option :key="0" label="Stay Here" :value="0"></el-option>
                    <el-option v-for="it in addForm.blockQuestions.length - currentIndex" :key="it" :label="it === 0 ? 'Move Next' : 'skip ' + (it - 1)" :value="it"></el-option>
                    <el-option :key="-1" label="Move To End" :value="-1"></el-option>
                  </el-select>
                  <el-select v-else-if="item.RouteLevel === 1" v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                    <el-option v-for="block in blocks" :key="block.BlockID" :label="block.BlockID + '.' + block.Name" :value="block.BlockID"></el-option>
                  </el-select>
                  <el-select v-else v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                    <el-option v-for="template in templates" :key="template.TemplateID" :label="template.TemplateID + '.' + template.Title" :value="template.TemplateID"></el-option>
                  </el-select>
                </el-col>
                <el-col :xs="21" :sm="21" :md="21" :lg="21" :xl="21" v-else-if="editFormVisible">
                  <el-select v-if="item.RouteLevel === 0" v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                    <el-option :key="0" label="Stay Here" :value="0"></el-option>
                    <el-option v-for="it in editForm.blockQuestions.length - currentIndex" :key="it" :label="it === 1 ? 'Move Next' : 'skip ' + (it - 1)" :value="it"></el-option>
                    <el-option :key="-1" label="Move To End" :value="-1"></el-option>
                  </el-select>
                  <el-select v-else-if="item.RouteLevel === 1" v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                    <el-option v-for="block in blocks" :key="block.BlockID" :label="block.BlockID + '.' + block.Name" :value="block.BlockID"></el-option>
                  </el-select>
                  <el-select v-else v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                    <el-option v-for="template in templates" :key="template.TemplateID" :label="template.TemplateID + '.' + template.Title" :value="template.TemplateID"></el-option>
                  </el-select>
                </el-col>
                <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
                  <el-button icon="el-icon-minus" type="primary" @click="delOperator(index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtn"></el-button>
                </el-col>
              </el-row>
            </div>
            <!--RouteType为BaseOnQuestion结束-->
            <!--RouteType为BaseOnAnswer开始-->
            <div v-else>
              <div v-if="routesForm.question.TypeID === 3">
                <el-row :gutter="10">
                  <el-col v-if="routesForm.question.InputType.indexOf('list') >= 0" :xs="14" :sm="14" :md="14" :lg="14" :xl="14">
                    <el-select v-model="item.Operand" placeholder="Please Select Option" no-data-text="No Record" filterable size="small">
                      <el-option v-for="it in routesForm.question.options" :key="it.ItemID" :label="it.Name" :value="it.Name"></el-option>
                    </el-select>
                  </el-col>
                  <div v-else>
                    <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7">
                      <el-select v-model="item.Operator" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                        <el-option v-for="it in operatorList" :key="it.id" :label="it.name" :value="it.name"></el-option>
                      </el-select>
                    </el-col>
                    <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7">
                      <el-input v-model="item.Operand" clearable size="small"></el-input>
                    </el-col>
                  </div>
                  <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7" v-if="addFormVisible">
                    <el-select v-if="item.RouteLevel === 0" v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                      <el-option :key="0" label="Stay Here" :value="0"></el-option>
                      <el-option v-for="it in addForm.blockQuestions.length - currentIndex" :key="it" :label="it === 0 ? 'Stay Here' : 'skip ' + (it - 1)" :value="it"></el-option>
                      <el-option :key="-1" label="Move To End" :value="-1"></el-option>
                    </el-select>
                    <el-select v-else-if="item.RouteLevel === 1" v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                      <el-option v-for="block in blocks" :key="block.BlockID" :label="block.BlockID + '.' + block.Name" :value="block.BlockID"></el-option>
                    </el-select>
                    <el-select v-else v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                      <el-option v-for="template in templates" :key="template.TemplateID" :label="template.TemplateID + '.' + template.Title" :value="template.TemplateID"></el-option>
                    </el-select>
                  </el-col>
                  <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7" v-else-if="editFormVisible">
                    <el-select v-if="item.RouteLevel === 0" v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                      <el-option :key="0" label="Stay Here" :value="0"></el-option>
                      <el-option v-for="it in editForm.blockQuestions.length - currentIndex" :key="it" :label="it === 0 ? 'Stay Here' : 'skip ' + (it - 1)" :value="it"></el-option>
                      <el-option :key="-1" label="Move To End" :value="-1"></el-option>
                    </el-select>
                    <el-select v-else-if="item.RouteLevel === 1" v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                      <el-option v-for="block in blocks" :key="block.BlockID" :label="block.BlockID + '.' + block.Name" :value="block.BlockID"></el-option>
                    </el-select>
                    <el-select v-else v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                      <el-option v-for="template in templates" :key="template.TemplateID" :label="template.TemplateID + '.' + template.Title" :value="template.TemplateID"></el-option>
                    </el-select>
                  </el-col>
                  <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
                    <el-button icon="el-icon-minus" type="primary" @click="delOperator(index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtn"></el-button>
                  </el-col>
                </el-row>
              </div>
              <div v-else-if="routesForm.question.TypeID === 6">
                <el-row :gutter="10">
                  <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7" v-show="false">
                    <el-select v-model="item.Operator" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                      <el-option v-for="it in operatorList.filter(i => i.name === '=')" :key="it.id" :label="it.name" :value="it.name"></el-option>
                    </el-select>
                  </el-col>
                  <el-col :xs="14" :sm="14" :md="14" :lg="14" :xl="14">
                    <el-select v-model="item.Operand" placeholder="Please Select Option" no-data-text="No Record" filterable size="small">
                      <el-option v-for="it in routesForm.question.options" :key="(it.ChoiceOptionID).toString()" :label="it.Content" :value="(it.ChoiceOptionID).toString()"></el-option>
                    </el-select>
                  </el-col>
                  <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7" v-if="addFormVisible">
                    <el-select v-if="item.RouteLevel === 0" v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                      <el-option :key="0" label="Stay Here" :value="0"></el-option>
                      <el-option v-for="it in addForm.blockQuestions.length - currentIndex" :key="it" :label="it === 0 ? 'Stay Here' : 'skip ' + (it - 1)" :value="it"></el-option>
                      <el-option :key="-1" label="Move To End" :value="-1"></el-option>
                    </el-select>
                    <el-select v-else-if="item.RouteLevel === 1" v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                      <el-option v-for="block in blocks" :key="block.BlockID" :label="block.BlockID + '.' + block.Name" :value="block.BlockID"></el-option>
                    </el-select>
                    <el-select v-else v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                      <el-option v-for="template in templates" :key="template.TemplateID" :label="template.TemplateID + '.' + template.Title" :value="template.TemplateID"></el-option>
                    </el-select>
                  </el-col>
                  <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7" v-else-if="editFormVisible">
                    <el-select v-if="item.RouteLevel === 0" v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                      <el-option :key="0" label="Stay Here" :value="0"></el-option>
                      <el-option v-for="it in editForm.blockQuestions.length - currentIndex" :key="it" :label="it === 0 ? 'Stay Here' : 'skip ' + (it - 1)" :value="it"></el-option>
                      <el-option :key="-1" label="Move To End" :value="-1"></el-option>
                    </el-select>
                    <el-select v-else-if="item.RouteLevel === 1" v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                      <el-option v-for="block in blocks" :key="block.BlockID" :label="block.BlockID + '.' + block.Name" :value="block.BlockID"></el-option>
                    </el-select>
                    <el-select v-else v-model="item.MoveStep" placeholder="Please Select" no-data-text="No Record" filterable size="small">
                      <el-option v-for="template in templates" :key="template.TemplateID" :label="template.TemplateID + '.' + template.Title" :value="template.TemplateID"></el-option>
                    </el-select>
                  </el-col>
                  <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
                    <el-button icon="el-icon-minus" type="primary" @click="delOperator(index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtn"></el-button>
                  </el-col>
                </el-row>
              </div>
            </div>
            <!--RouteType为BaseOnAnswer结束-->
          </el-form-item>
          <div v-if="routesForm.question.TypeID === 6">
            <el-form-item class="confirmBtn" v-if="routesForm.routes.filter(i => i.InsuranceCorpID === currentInsuranceCompany).length < routesForm.question.options.length">
              <el-button icon="el-icon-plus" type="primary" @click="addOperator()" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnSingle"></el-button>
            </el-form-item>
          </div>
          <div v-else-if="routesForm.question.TypeID === 3 && (routesForm.question.InputType.indexOf('list') >= 0 || routesForm.question.InputType==='children'||routesForm.question.InputType === 'number' || routesForm.question.InputType === 'date')">
            <el-form-item class="confirmBtn">
              <el-button icon="el-icon-plus" type="primary" @click="addOperator()" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnSingle"></el-button>
            </el-form-item>
          </div>
          <div v-else>
            <el-form-item class="confirmBtn" v-if="routesForm.routes.find(i => i.InsuranceCorpID === currentInsuranceCompany) === undefined">
              <el-button icon="el-icon-plus" type="primary" @click="addOperator()" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnSingle"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="addRoutes()" :loading="isLoading || isLoadingInsuranceCompany">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------路由编辑弹窗结束------------------------------------------------->
      <!----------------------------------------------修改弹窗开始----------------------------------------------------->
      <el-dialog title="Edit Block" :visible.sync="editFormVisible" width="1000px" center :before-close="closeEdit">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" class="form choiceQuestionForm">
          <el-form-item label="Name" prop="Name">
            <el-input v-model="editForm.Name" clearable></el-input>
          </el-form-item>
          <div v-for="(item, index) in editForm.blockQuestions" :key="index" class="choice">
            <el-form-item class="marginLeft10">
              <el-input v-model="item.Label" class="labelInput" size="small" placeholder="Label"></el-input>
              <span><b class="blockQuestionB">[{{questionTypeList.find(it => it.id === item.question.TypeID).name}}]</b>{{item.question.QuestionID + '. ' + item.question.Description}}</span>
            </el-form-item>
            <el-form-item class="marginLeft20">
              <el-checkbox v-model="item.IsRoute">Is Route</el-checkbox>
            </el-form-item>
            <el-form-item class="marginLeft20" v-if="item.IsRoute">
              <el-radio-group v-model="item.RouteTypeID">
                <el-radio :label="1">
                  <span>Base On Question</span>
                </el-radio>
                <el-radio :label="2" v-if="item.question.TypeID === 6 || (item.question.TypeID === 3 && (item.question.InputType.indexOf('list') >= 0 || item.question.InputType === 'children' ||item.question.InputType === 'number' || item.question.InputType === 'date'))">
                  <span>Base On Answer</span>
                </el-radio>
              </el-radio-group>
              <el-button icon="el-icon-bottom-right" type="primary" @click="showAddRoutes(item, index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup">Route</el-button>
            </el-form-item>
            <el-form-item class="marginLeft20">
              <el-button icon="el-icon-minus" type="primary" @click="delChoice('editForm', index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-up" v-if="index !== 0" type="primary" @click="upChoice('editForm', index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup"></el-button>
              <el-button icon="el-icon-arrow-down" v-if="index !== editForm.blockQuestions.length - 1" type="primary" @click="downChoice('editForm', index)" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnGroup"></el-button>
            </el-form-item>
          </div>
          <el-form-item class="confirmBtn smallLine">
            <el-button icon="el-icon-plus" type="primary" @click="addChoice('editForm')" :loading="isLoading || isLoadingInsuranceCompany" plain size="small" class="questionRightBtnSingle">Question</el-button>
            <el-select v-model="currentQuestion" placeholder="Question" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
              <el-option class="questionOption" v-for="item in questionList" :key="item.QuestionID" :label="item.QuestionID + '. ' + item.Description" :value="item.QuestionID"></el-option>
            </el-select>
            <el-select v-model="currentQuestionType" placeholder="Question Type" size="small" class="questionType questionRightBtn" @change="changeQuestionType(currentQuestionType)" style="width: 207px;">
              <el-option v-for="item in questionTypeList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="confirmBtn">
            <el-button icon="el-icon-check" type="primary" @click="edit()" :loading="isLoading || isLoadingInsuranceCompany">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!----------------------------------------------修改弹窗结束----------------------------------------------------->
      <!----------------------------------------------BlockQuestionDetail弹窗开始----------------------------------------------------->
      <el-dialog title="Templates Used Detail" :visible.sync="templatesDetailVisible" width="800px" center :before-close="closeTemplatesDetail">
        <UsedTemplateList ref="tl" :blockID="currentId" ></UsedTemplateList>
      </el-dialog>
      <!----------------------------------------------BlockQuestionDetail弹窗结束----------------------------------------------------->
    </div>
  </div>
</template>

<script>
import UsedTemplateList from '@/component/window/usedTemplateList'
export default {
  components: {
    UsedTemplateList
  },
  data: function () {
    return {
      btypeId: 1,
      businessTypes: ['', 'PL Memo', 'NB CoverLetter', 'IRCA Memo', 'CL Application'],
      isLoading: false,
      currentId: null,
      templatesDetailVisible: false,
      routeLevels: [{id: 0, name: 'Question'}, {id: 1, name: 'Block'}],
      routeTypeList: [{id: 1, name: 'Base On Question'}, {id: 2, name: 'Base On Answer'}],
      blockTypes: [{id: 1, name: 'Normal'}, {id: 2, name: 'Direction'}, {id: 3, name: 'Questionnaire'}, {id: 4, name: 'CSIO'}],
      isLoadingInsuranceCompany: false,
      currentQuestionType: null,
      currentQuestion: null,
      questionTypeList: [{id: 1, name: 'Title'}, {id: 2, name: 'Reminder'}, {id: 3, name: 'Attribute'}, {id: 4, name: 'Simple Answer'}, {id: 5, name: 'Fill In Question'}, {id: 6, name: 'Single Choice Question'}, {id: 7, name: 'Multiple Choice Question'}],
      questionList: [],
      blocks: [],
      templates: [],
      currentInsuranceCompany: null,
      insuranceCompanyList: [],
      operatorList: [{id: 1, name: '='}, {id: 2, name: '>'}, {id: 3, name: '<'}, {id: 4, name: '>='}, {id: 5, name: '<='}],
      // 新增
      addFormVisible: false,
      addForm: {
        Name: null,
        TypeID: 1,
        StatusID: 1,
        blockQuestions: []
      },
      addFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ]
      },
      // 路由编辑
      routesFormVisible: false,
      routesForm: {
        QuestionID: 0,
        RouteLevel: 0,
        question: {
          QuestionID: 0,
          TypeID: 0,
          Description: null,
          Tips: '',
          OutputModeID: 1,
          StatusID: 1,
          InputType: null,
          fillinParts: [],
          options: []
        },
        routes: []
      },
      routesFormBeforeEdit: {},
      currentIndex: 0,
      // 修改
      editFormVisible: false,
      editForm: {
        BlockID: null,
        Name: null,
        TypeID: 1,
        StatusID: 1,
        blockQuestions: [],
        IsNew: false
      },
      editFormRules: {
        Name: [
          { required: true, message: 'Please Enter', trigger: 'blur' },
          { max: 512, message: 'Within 512 Characters', trigger: 'blur' }
        ]
      },
      // 搜索
      searchForm: {
        name: null
      },
      searchName: null,
      // 列表
      tempList: [],
      list: [],
      pageSize: 20,
      pagerCount: 5,
      currentPage: 1,
      total: 0
    }
  },
  watch: {
    $route (to, from) {
      console.log(to.params.id)
      this.btypeId = parseInt(this.$route.params.id)
      // this.typeName = this.businessTypes[this.btypeId] + this.typeName
      this.search(null)
    }
  },
  mounted: function () {
    this.btypeId = this.$route.params.id
    this.search(null)
    this.initInsuranceCompany()
    this.loadTemplates()
  },
  methods: {
    loadDataSource: function (question) {
      // this.isLoadingDataSource = true
      let service = '/api/Services/baseservice.asmx/GetDataItems'
      let param = { datatype: question.DataSource }
      if (question.InputType === 'sublist') {
        service = '/api/Services/baseservice.asmx/GetSubDataItems'
        param = { questionid: question.QuestionID }
      }
      this.axios.post(service, param).then(res => {
        if (res) {
          console.log('loadDataSource', res)
          this.routesForm.question.options = res.data
        }
        // this.isLoadingDataSource = false
      }).catch(err => {
        console.log('GetDictionary', err)
        // this.isLoadingDataSource = false
      })
    },
    loadChildren: function (question) {
      let form = this.editForm
      if (this.addFormVisible) form = this.addForm
      let parentBQ = form.blockQuestions.find(q => q.Description === question.DataSource)
      if (parentBQ === undefined) return
      let parent = parentBQ.question
      this.axios.post('/api/Services/baseservice.asmx/GetChildrenDictionaryByParentType', { parenttype: parent.DataSource }).then(res => {
        if (res) {
          console.log('GetChildrenDictionary', res)
          this.routesForm.question.options = res.data
        }
        // this.isLoadingDataSource = false
      }).catch(err => {
        console.log('GetChildrenDictionary', err)
        // this.isLoadingDataSource = false
      })
    },

    // show used block list
    showTemplatesDetail: function (id) {
      this.currentId = id
      this.templatesDetailVisible = true
      if (this.$refs.tl !== undefined) {
        this.$refs.tl.loadTemplates(id)
      }
    },
    closeTemplatesDetail: function () {
      this.templatesDetailVisible = false
      this.currentId = null
    },
    // Templates
    loadTemplates: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetTemplatesByBusinessType', {btypeid: this.btypeId}).then(res => {
        if (res) {
          console.log('loadTemplates', res)
          this.templates = res.data
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('loadTemplates', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // 保险公司列表
    initInsuranceCompany: function () {
      this.isLoadingInsuranceCompany = true
      this.axios.post('/api/Services/baseservice.asmx/GetInsuranceCorps_all', {}).then(res => {
        if (res) {
          console.log('保险公司列表', res)
          let all = [{InsuranceCorpID: 0, Name: 'All Insurance Company'}]
          this.insuranceCompanyList = [...all, ...res.data]
        }
        this.isLoadingInsuranceCompany = false
      }).catch(err => {
        console.log('保险公司列表出错', err)
        this.isLoadingInsuranceCompany = false
      })
    },
    // 选择问题类型
    changeQuestionType: function (id) {
      this.currentQuestion = null
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetSimpleQuestionsByType', {typeid: id, btypeid: this.btypeId}).then(res => {
        if (res) {
          console.log('查询', res)
          this.questionList = res.data
          // 同一个block中，同一个question只能有一个
          if (this.addFormVisible) {
            this.questionList = this.questionList.filter(item => this.addForm.blockQuestions.map(it => it.QuestionID).indexOf(item.QuestionID) === -1)
          } else if (this.editFormVisible) {
            this.questionList = this.questionList.filter(item => this.editForm.blockQuestions.map(it => it.QuestionID).indexOf(item.QuestionID) === -1)
          }
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询出错', err)
        this.isLoading = false
      })
    },
    // 添加一行
    addChoice: function (form) {
      if (this.currentQuestion === null) {
        this.$message({
          type: 'warning',
          message: 'Please Select Question'
        })
      } else {
        if (form === 'addForm') {
          this.isLoading = true
          this.axios.post('/api/Services/BaseService.asmx/GetQuestion', {questionid: this.currentQuestion}).then(res => {
            if (res) {
              console.log('查询单个', res)
              this.addForm.blockQuestions.push({QuestionID: this.currentQuestion, Label: null, SequenceNo: 0, RouteTypeID: 1, IsRoute: false, question: res.data, routes: []})
              this.currentQuestion = null
              this.changeQuestionType(this.currentQuestionType)
            }
            this.isLoading = false
          }).catch(err => {
            console.log('查询单个出错', err)
            this.isLoading = false
          })
        } else if (form === 'editForm') {
          this.isLoading = true
          this.axios.post('/api/Services/BaseService.asmx/GetQuestion', {questionid: this.currentQuestion}).then(res => {
            if (res) {
              console.log('查询单个', res)
              this.editForm.blockQuestions.push({QuestionID: this.currentQuestion, Label: null, SequenceNo: 0, RouteTypeID: 1, IsRoute: false, question: res.data, routes: []})
              this.currentQuestion = null
              this.changeQuestionType(this.currentQuestionType)
            }
            this.isLoading = false
          }).catch(err => {
            console.log('查询单个出错', err)
            this.isLoading = false
          })
        }
      }
    },
    // 删除一行
    delChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.blockQuestions.splice(index, 1)
      } else if (form === 'editForm') {
        this.editForm.blockQuestions.splice(index, 1)
      }
      if (this.currentQuestionType !== null) {
        this.changeQuestionType(this.currentQuestionType)
      }
    },
    // 上移一行
    upChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.blockQuestions[index] = this.addForm.blockQuestions.splice(index - 1, 1, this.addForm.blockQuestions[index])[0]
      } else if (form === 'editForm') {
        this.editForm.blockQuestions[index] = this.editForm.blockQuestions.splice(index - 1, 1, this.editForm.blockQuestions[index])[0]
      }
    },
    // 下移一行
    downChoice: function (form, index) {
      if (form === 'addForm') {
        this.addForm.blockQuestions[index] = this.addForm.blockQuestions.splice(index + 1, 1, this.addForm.blockQuestions[index])[0]
      } else if (form === 'editForm') {
        this.editForm.blockQuestions[index] = this.editForm.blockQuestions.splice(index + 1, 1, this.editForm.blockQuestions[index])[0]
      }
    },
    // 查询
    search: function (name) {
      this.isLoading = true
      // 后端不支持null查询，把null转换成''
      if (name === null) {
        this.searchName = ''
      } else {
        this.searchName = name
      }
      this.axios.post('/api/Services/BaseService.asmx/SearchBlocks', {query: this.searchName, btypeid: this.btypeId}).then(res => {
        if (res) {
          console.log('查询', res)
          this.list = res.data
          this.blocks = res.data
          res.data.forEach(b => {
            let type = this.blockTypes.find(t => t.id === b.TypeID)
            b.TypeName = type.name
          })
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
    },
    // 显示新增弹窗
    showAdd: function () {
      this.addFormVisible = true
    },
    // 隐藏新增弹窗
    closeAdd: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$refs['addForm'].resetFields()
        this.addForm.blockQuestions = []
        this.currentQuestion = null
        this.currentQuestionType = null
        done()
      }).catch(() => {})
    },
    // 新增
    add: function () {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          // 按顺序添加SequenceNo，如果IsRoute为false，routes赋为[]
          for (let i = 0; i < this.addForm.blockQuestions.length; i++) {
            this.addForm.blockQuestions[i].SequenceNo = i + 1
            if (!this.addForm.blockQuestions[i].IsRoute) {
              this.addForm.blockQuestions[i].routes = []
            }
          }
          let value = JSON.stringify(this.addForm)
          console.log('block to save', value)
          this.axios.post('/api/Services/BaseService.asmx/SaveBlock', {block: value, btypeid: this.btypeId}).then(res => {
            if (res) {
              console.log('新增', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['addForm'].resetFields()
              this.addForm.blockQuestions = []
              this.currentQuestion = null
              this.currentQuestionType = null
              this.addFormVisible = false
              // 如果新增记录符合查询条件，将新增的记录添加到数组最后，总数加1
              if (this.searchName === null || (this.searchName !== null && res.data.Name.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)) {
                this.list.push(res.data)
                this.total = this.list.length
              }
            }
            this.isLoading = false
          }).catch(err => {
            console.log('新增出错', err)
            this.isLoading = false
          })
        } else {
          this.$message({
            type: 'error',
            message: 'Format Error'
          })
        }
      })
    },
    // 显示路由编辑弹窗
    showAddRoutes: function (blockQuestion, index) {
      this.routesFormVisible = true
      this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
        this.routesForm = JSON.parse(JSON.stringify(blockQuestion))
        this.routesFormBeforeEdit = JSON.parse(JSON.stringify(blockQuestion))
        this.currentIndex = index
        if (blockQuestion.question.TypeID === 3) {
          if (blockQuestion.question.InputType.indexOf('list') >= 0) this.loadDataSource(blockQuestion.question)
          else if (blockQuestion.question.InputType === 'children') this.loadChildren(blockQuestion.question)
        }
      })
    },
    // 添加一行比较属性
    addOperator: function () {
      if (this.currentInsuranceCompany === null) {
        this.$message({
          type: 'warning',
          message: 'Please Select Insurance Company'
        })
      } else {
        this.routesForm.routes.push({InsuranceCorpID: this.currentInsuranceCompany, Operator: '=', Operand: null, MoveStep: 1, RouteLevel: 0})
      }
    },
    // 删除一行比较属性，因为使用了filter，所以不能直接this.routesForm.routes.splice(index, 1)，这样删除的可能是过滤掉的别的保险公司对应的routing
    delOperator: function (index) {
      let delObj = this.routesForm.routes.filter(i => i.InsuranceCorpID === this.currentInsuranceCompany)[index]
      this.routesForm.routes = this.routesForm.routes.filter(i => i !== delObj)
    },
    // 隐藏路由编辑弹窗
    closeAddRoutes: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        if (this.addFormVisible) {
          this.addForm.blockQuestions[this.currentIndex] = this.routesFormBeforeEdit
        } else if (this.editFormVisible) {
          this.editForm.blockQuestions[this.currentIndex] = this.routesFormBeforeEdit
        }
        this.$refs['routesForm'].resetFields()
        this.currentInsuranceCompany = null
        this.currentIndex = 0
        this.routesForm.routes = []
        done()
      }).catch(() => {})
    },
    // 路由编辑
    addRoutes: function () {
      if (this.addFormVisible) {
        let tempList = this.routesForm.routes.map(item => { return item.InsuranceCorpID + '|' + item.Operator + '|' + item.Operand })
        if (this.routesForm.RouteTypeID === 2 && this.routesForm.question.TypeID === 3 && this.routesForm.routes.length > 0 && (this.routesForm.routes.filter(item => item.Operand === null).length > 0 || this.routesForm.routes.filter(item => item.Operand === '').length > 0)) { // 未输入操作数
          this.$message({
            type: 'warning',
            message: 'Please Input Operand'
          })
        } else if (this.routesForm.RouteTypeID === 2 && this.routesForm.question.TypeID === 6 && this.routesForm.routes.length > 0 && (this.routesForm.routes.filter(item => item.Operand === null).length > 0 || this.routesForm.routes.filter(item => item.Operand === '').length > 0)) { // 未选择选项
          this.$message({
            type: 'warning',
            message: 'Please Select Option'
          })
        } else if (this.routesForm.RouteTypeID === 2 && new Set(tempList).size !== tempList.length) { // 重复选项
          this.$message({
            type: 'warning',
            message: 'Duplicate options'
          })
        } else {
          this.addForm.blockQuestions[this.currentIndex].routes = JSON.parse(JSON.stringify(this.routesForm.routes))
          this.$refs['routesForm'].resetFields()
          this.currentInsuranceCompany = null
          this.currentIndex = 0
          this.routesForm.routes = []
          this.routesFormVisible = false
        }
      } else if (this.editFormVisible) {
        let tempList = this.routesForm.routes.map(item => { return item.InsuranceCorpID + '|' + item.Operator + '|' + item.Operand })
        if (this.routesForm.RouteTypeID === 2 && this.routesForm.question.TypeID === 3 && this.routesForm.routes.length > 0 && (this.routesForm.routes.filter(item => item.Operand === null).length > 0 || this.routesForm.routes.filter(item => item.Operand === '').length > 0)) { // 未输入操作数
          this.$message({
            type: 'warning',
            message: 'Please Input Operand'
          })
        } else if (this.routesForm.RouteTypeID === 2 && this.routesForm.question.TypeID === 6 && this.routesForm.routes.length > 0 && (this.routesForm.routes.filter(item => item.Operand === null).length > 0 || this.routesForm.routes.filter(item => item.Operand === '').length > 0)) { // 未选择选项
          this.$message({
            type: 'warning',
            message: 'Please Select Option'
          })
        } else if (this.routesForm.RouteTypeID === 2 && new Set(tempList).size !== tempList.length) { // 重复选项
          this.$message({
            type: 'warning',
            message: 'Duplicate options'
          })
        } else {
          this.editForm.blockQuestions[this.currentIndex].routes = JSON.parse(JSON.stringify(this.routesForm.routes))
          this.$refs['routesForm'].resetFields()
          this.currentInsuranceCompany = null
          this.currentIndex = 0
          this.routesForm.routes = []
          this.routesFormVisible = false
        }
      }
    },
    // 修改弹窗
    showEdit: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/BaseService.asmx/GetBlock', {blockid: id}).then(res => {
        if (res) {
          console.log('block', res)
          this.editFormVisible = true
          this.$nextTick(() => { // resetFields初始化到第一次打开dialog时里面的form表单里的值，所以先渲染form表单，后改变值，这样resetFields后未空表单
            this.editForm = res.data
            for (let i = 0; i < this.editForm.blockQuestions.length; i++) {
              if (this.editForm.blockQuestions[i].routes === null) {
                this.editForm.blockQuestions[i].routes = []
              }
            }
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询block出错', err)
        this.isLoading = false
      })
    },
    // 关闭修改
    closeEdit: function (done) {
      this.$confirm('Are you sure to close it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$refs['editForm'].resetFields()
        this.editForm.blockQuestions = []
        this.currentQuestion = null
        this.currentQuestionType = null
        done()
      }).catch(() => {})
    },
    // 修改
    edit: function () {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          // 按顺序添加SequenceNo，如果IsRoute为false，routes赋为[]
          for (let i = 0; i < this.editForm.blockQuestions.length; i++) {
            this.editForm.blockQuestions[i].SequenceNo = i + 1
            if (!this.editForm.blockQuestions[i].IsRoute) {
              this.editForm.blockQuestions[i].routes = []
            }
          }
          this.axios.post('/api/Services/BaseService.asmx/SaveBlock', {block: JSON.stringify(this.editForm), btypeid: this.btypeId}).then(res => {
            if (res) {
              console.log('修改', res)
              this.$message({
                type: 'success',
                message: 'Operation Succeeded'
              })
              this.$refs['editForm'].resetFields()
              this.editForm.blockQuestions = []
              this.currentQuestion = null
              this.currentQuestionType = null
              this.editFormVisible = false
              // 如果修改记录符合查询条件，更新该记录；如果不符合，删除该记录，总数减1
              if (this.searchName === null || (this.searchName !== null && res.data.Name.toLowerCase().indexOf(this.searchName.toLowerCase()) !== -1)) {
                this.list = this.list.map(item => { return item.BlockID === res.data.BlockID ? res.data : item })
              } else {
                this.list = this.list.filter(item => item.BlockID !== res.data.BlockID)
                this.total = this.list.length
              }
            }
            this.isLoading = false
          }).catch(err => {
            console.log('修改出错', err)
            this.isLoading = false
          })
        } else {
          this.$message({
            type: 'error',
            message: 'Format Error'
          })
        }
      })
    },
    // 删除
    del: function (id) {
      this.$confirm('Are you sure to delete it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/NewBusinessService.asmx/RemoveBlock', {blockid: id}).then(res => {
          if (res) {
            console.log('删除', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list = this.list.filter(item => item.BlockID !== id)
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
    duplicate: function (id) {
      this.$confirm('Are you sure to duplicate it?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.axios.post('/api/Services/BaseService.asmx/DuplicateBlock', {blockid: id}).then(res => {
          if (res) {
            console.log('Duplicate', res)
            this.$message({
              type: 'success',
              message: 'Operation Succeeded'
            })
            this.list.push(res.data)
            this.total = this.list.length
          }
          this.isLoading = false
        }).catch(err => {
          console.log('duplicate error', err)
          this.isLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation Cancelled'
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
