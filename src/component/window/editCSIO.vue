<template>
  <div>
    <div class="editSheet" id="sheetDom">
      <el-row :gutter="20" style="margin-top:5px; margin-left:52px; font-family: Corbel; font-size: 20px; font-weight:bold; text-align: center">
        <el-col :span="24">
          <div class="viewMemo-subtitle head" style="margin-left:20px;">
            <!--span>{{sheetContent.title}}</span-->
            <el-form class="" label-width="10px" label-position="center" size="large">
              <el-form-item>
                <el-col :span="4">
                  <el-select v-model="csioTypeId" value-key="key" placeholder="coi type" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
                    <el-option class="" v-for="item in csioTypes" :key="item.key" :label="item.value" :value="item.key"></el-option>
                  </el-select>
                </el-col>
                <el-col :span="16">
                  <el-input v-model="title" label="Title" placeholder="title of csio form" clearable></el-input>
                </el-col>
              </el-form-item>
              <el-form-item>
                <el-col :span="4">
                  <el-select v-model="questionTypeId" value-key="key" @change="loadQuestions(0)" placeholder="question type" size="small" class="questionType questionRightBtnGroup" no-data-text="No Record" filterable>
                    <el-option class="" v-for="item in questionTypes" :key="item.key" :label="item.value" :value="item.key"></el-option>
                  </el-select>
                </el-col>
                <el-col :span="10">
                  <el-select v-model="currentQuestion" value-key="QuestionID" placeholder="Question" size="small" style="width: 100%" no-data-text="No Record" filterable>
                    <el-option class="questionOption" v-for="item in questions" :key="item.QuestionID" :label="item.QuestionID + '. ' + item.Description" :value="item"></el-option>
                  </el-select>
                </el-col>
                <el-col :span="10">
                  <el-radio-group v-model="outputType" @change="addQ">
                    <el-radio :label="1">
                      <span>Que</span>
                    </el-radio>
                    <el-radio :label="2">
                      <span>Ans</span>
                    </el-radio>
                    <el-radio :label="3">
                      <span>Out</span>
                    </el-radio>
                    <el-radio :label="4">
                      <span>Addi</span>
                    </el-radio>
                    <el-radio :label="5">
                      <span>Orig</span>
                    </el-radio>
                  </el-radio-group>
                </el-col>
              </el-form-item>
              <el-form-item>
                <el-col :span="18">
                  <el-input v-model="expression" name="expression" placeholder="expression" clearable></el-input>
                </el-col>
                <el-col :span="3">
                  <el-button icon="el-icon-plus" type="primary" @click="addQ()">Add</el-button>
                </el-col>
                <el-col :span="3">
                  <el-button type="primary" @click="saveSheet()" :loading="isLoading">Save</el-button>
                </el-col>
              </el-form-item>
            </el-form>
          </div>
        </el-col>
      </el-row>
    </div>
    <div v-if="csioTypeId === 0" class="viewCSIO" id="csioDom">
      <table>
        <colgroup>
          <col style="width:20px;">
          <col style="width:120px;">
          <col style="width:140px;">
          <col style="width:30px;">
          <col style="width:40px;">
          <col style="width:70px;">
          <col style="width:80px;">
          <col style="width:20px;">
          <col style="width:50px;">
          <col style="width:40px;">
          <col style="width:150px;">
          <col style="width:90px;">
          <col style="width:68px;">
          <col style="width:82px;">
        </colgroup>
        <thead>
        <tr>
          <!--th style="width:10px"></th-->
          <th colspan="2" style="padding-left:10px;  text-align:left;font-size: 1.0rem;">CSIO ></th>
          <th colspan="10" style="font-family: 'Roboto Thin'; text-align: center;font-size: 1.9rem;">CERTIFICATE OF LIABILITY INSURANCE</th>
          <th style=""></th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td colspan="14" style="font-family: 'Roboto Thin';line-height: 14px;letter-spacing:0px; text-align: center;font-size: 1.0rem;">This certificate is issued as a matter of information only and conffers no rights upon the certificate holder and imposes no liability on the issurer.
            This certificate does not amend, extend or alter the coverage afforded by the policies blow.</td>
        </tr>
        <tr>
          <td class="label">1.</td>
          <td colspan="6" class="title">CERTIFICATE HOLDER - NAME AND MAILING ADDRESS</td>
          <td class="label">2.</td>
          <td colspan="6" class="title">INSURED'S FULL NAME AND MAILING ADDRESS</td>
        </tr>
        <tr>
          <td colspan="7" class="blank"><input type="text" v-model="csio.part1.name"/></td>
          <td colspan="7"><input type="text" v-model="csio.part2.name"/></td>
        </tr>
        <tr>
          <td colspan="7" class="blank"><input type="text" v-model="csio.part1.mailAddress"/></td>
          <td colspan="7"><input type="text" v-model="csio.part2.mailAddress"/></td>
        </tr>
        <tr>
          <td colspan="7" class="blank"><input type="text" /></td>
          <td colspan="7"><input type="text" /></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="5" style="height:12px;"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td colspan="" style="border-left: 0px;"><input type="text" v-model="csio.part1.postal"/></td>
          <td colspan="5"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td colspan="1" style="border-left: 0px;"><input type="text" v-model="csio.part2.postal"/></td>
        </tr>
        <tr>
          <td class="label">3.</td>
          <td colspan="13" class="title">DESCRIPTION OF OPERATIONS/LOCATIONS/AUTOMOBILES/SPECIAL ITEMS TO WHICH THIS CERTIFICATE APPLIES <span style="font-weight: normal;font-size:0.8rem;">(but only with respect to the operations of the named insured)</span></td>
        </tr>
        <tr>
          <td colspan="14" class="blank"><input type="text" v-model="csio.part3.description"/></td>
        </tr>
        <tr>
          <td colspan="14" class="blank"></td>
        </tr>
        <tr>
          <td colspan="14" class="blank"></td>
        </tr>
        <tr>
          <td class="label">4.</td>
          <td colspan="13" class="title">COVERAGE</td>
        </tr>
        <tr>
          <td colspan="14" style="line-height:14px; padding-left:10px;font-size: 0.8rem;font-family: 'Roboto Thin';">This is certify that the policies of insurance listed below have been insured to the insured named above for the policy period indicated notwithstanding any requirements, terms
            or conditions of any contract or other document with respect to which this certificate may be insured or may pertain. The insurance afforded by the policies described herein is
            subject to all terms, exclusions and conditions of such policies.
            <div style="padding-left:400px;font-weight:bold; padding-bottom:10px;margin:-10px;font-size: 1.1rem;">LIMITS SHOWN MAY HAVE BEEN REDUCED BY PAID CLAIMS</div>
          </td>
        </tr>
        <tr style="text-align: center; font-weight:bold;font-size:0.8rem;">
          <td rowspan="2" colspan="3">TYPE OF INSURANCE</td>
          <td rowspan="2" colspan="3" style="width:150px;">INSURANCE COMPANY
            AND POLICY NUMBER</td>
          <td rowspan="2" colspan="2">EFFECTIVE
            DATE
            YYYY/MM/DD</td>
          <td rowspan="2" colspan="2">EXPIRY
            DATE
            YYYY/MM/DD</td>
          <td rowspan="1" colspan="4" style="line-height: 12px; padding: 0px 5px;">LIMITS OF LIABILITY
            (Canadian dollars unless indicated otherwise) </td>
        </tr>
        <tr style="text-align: center; font-weight:bold;font-size:0.8rem;">
          <td colspan="2">COVERAGE</td>
          <td>DED.</td>
          <td style="line-height: 12px; padding: 0px 5px;">AMOUNT OF
            INSURANCE</td>
        </tr>
        <tr style="letter-spacing: 0px;">
          <td rowspan="9" colspan="3" style="line-height: 20px;"><div style="font-weight: bolder; text-align: center;">COMMERCIAL GENERAL LIABILITY</div>
            <input type="checkbox" /> CLAIMS MADE <span style="padding:0 5px;font-weight:bolder;">OR</span>  <input type="checkbox" /> OCCURRENCE
            <input type="checkbox" /> PRODUCTS AND/OR COMPLETED OPERATIONS
            <input type="checkbox"/> EMPLOYER'S LIABILITY
            <input type="checkbox" /> CROSS LIABILITY
            <br>
            <input type="text" v-model="csio.part4.generalLiability.liabilities"/>
            <input type="checkbox" /> WAIVER OF SUBROGATION
            <br>
            <br>
            <input type="checkbox"/> TENANTS LEGAL LIABILITY
            <input type="checkbox"/> POLLUTION LIABILITY EXTENSION
            <input type="checkbox" /><br>
            <input type="checkbox" />
          </td>
          <td rowspan="9" colspan="3"><input type="text" v-model="csio.part4.generalLiability.insuranceCompany"/><br />
            <input type="text" v-model="csio.part4.generalLiability.policyNumber"/></td>
          <td rowspan="9" colspan="2"><input type="text" v-model="csio.part4.generalLiability.effectiveDate"/></td>
          <td rowspan="9" colspan="2"><input type="text" v-model="csio.part4.generalLiability.expiryDate"/></td>
          <td rowspan="2" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">COMMERCIAL GENERAL LIABILITY
            <span style="padding-left:5px;">BODILY INJURY AND PROPERTY DAMAGE</span><br>
            <span style="padding-left:5px;">LIABILITY</span>
            <div style="padding-left:90px; padding-bottom:10px;margin:-10px">- GENERAL AGGREGATE
              - EACH OCCURRENCE</div></td>
          <td style="height:28px;"><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.generalAggregate.ded"/></td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.generalAggregate.amount"/></td>
        </tr>
        <tr>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.eachOccurrence.ded"/></td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.eachOccurrence.amount"/></td>
        </tr>
        <tr>
          <td colspan="2" style="line-height: 12px; padding: 0px 5px;">PRODUCTS AND COMPLETED OPERATIONS
            AGGREGATE</td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.operationsAggregate.ded"/></td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.operationsAggregate.amount"/></td>
        </tr>
        <tr>
          <td colspan="2" style="line-height: 12px;"><input type="checkbox" /> PERSONAL INSUARY LIABILITY
            OR
            <input type="checkbox" /> PERSONAL AND ADVERTISING INSURAY
            LIABILITY</td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.injuryLiability.ded"/></td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.injuryLiability.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">MEDICAL PAYMENTS</td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.medicalPayments.ded"/></td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.medicalPayments.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">TENANTS LEGAL LIABILITY</td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.tenantsLegalLiability.ded"/></td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.tenantsLegalLiability.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">POLLUTION LIABILITY EXTENSION</td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.pollutionLiabilityExtension.ded"/></td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.pollutionLiabilityExtension.amount"/></td>
        </tr>
        <tr>
          <td colspan="2" class="blank"></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="2" class="blank"></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="3">
            <input type="checkbox" /> NON-OWNED AUTOMOBILES
          </td>
          <td colspan="3"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"><input type="checkbox" /> NON-OWNED AUTOMOBILES</td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.nonOwnedLimit.ded"/></td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.nonOwnedLimit.amount"/></td>
        </tr>
        <tr>
          <td colspan="3">
            <input type="checkbox" /> HIRED AUTOMOBILES
          </td>
          <td colspan="3"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"><input type="checkbox"/> HIRED AUTOMOBILES</td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.hiredAutomobiles.ded"/></td>
          <td><input type="text" v-model="csio.part4.generalLiability.limitOfLiability.hiredAutomobiles.amount"/></td>
        </tr>
        <tr style="letter-spacing: 0px;">
          <td rowspan="4" colspan="3"><div style="font-weight: bolder; text-align: left;">AUTOMOBILE LIABILITY</div>
            <input type="checkbox" /> DESCRIBED AUTOMOBILES
            <input type="checkbox"/> ALLOWED AUTOMOBILES
            <input type="checkbox"/> LEASED AUTOMOBILES**
            **ALL AUTOMOBILES LEASED IN EXCESS OF
            30 DAYS WHERE THE INSURED IS REQUIRED
            TO PROVIDE INSURANCE
          </td>
          <td rowspan="4" colspan="3"></td>
          <td rowspan="4" colspan="2"></td>
          <td rowspan="4" colspan="2"></td>
          <td colspan="2">BODILY INJURY AND PROPERTY
            DAMAGE COMBINED
          </td>
          <td><input type="text" v-model="csio.part4.automobileLiability.limitOfLiability.damageCombined.ded"/></td>
          <td><input type="text" v-model="csio.part4.automobileLiability.limitOfLiability.damageCombined.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">BODILY INJURY (PER PERSON)</td>
          <td><input type="text" v-model="csio.part4.automobileLiability.limitOfLiability.bodilyInjuryPerson.ded"/></td>
          <td><input type="text" v-model="csio.part4.automobileLiability.limitOfLiability.bodilyInjuryPerson.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">BODILY INJURY (PER ACCIDENT)</td>
          <td><input type="text" v-model="csio.part4.automobileLiability.limitOfLiability.bodilyInjuryAccident.ded"/></td>
          <td><input type="text" v-model="csio.part4.automobileLiability.limitOfLiability.bodilyInjuryAccident.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">PROPERTY DAMAGE</td>
          <td><input type="text" v-model="csio.part4.automobileLiability.limitOfLiability.propertyDamage.ded"/></td>
          <td><input type="text" v-model="csio.part4.automobileLiability.limitOfLiability.propertyDamage.amount"/></td>
        </tr>
        <tr style="letter-spacing: 0px;">
          <td rowspan="3" colspan="3"><div style="font-weight: bolder; text-align: left;">EXCESS LIABILITY</div>
            <input type="checkbox" /> UMBRELLA FORM
            <input type="checkbox" />
          </td>
          <td rowspan="3" colspan="3"></td>
          <td rowspan="3" colspan="2"></td>
          <td rowspan="3" colspan="2"></td>
          <td colspan="2">EACH OCCURRENCE</td>
          <td><input type="text" v-model="csio.part4.excessLiability.limitOfLiability.eachOccurrence.ded"/></td>
          <td><input type="text" v-model="csio.part4.excessLiability.limitOfLiability.eachOccurrence.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">AGGREGATE</td>
          <td><input type="text" v-model="csio.part4.excessLiability.limitOfLiability.aggregate.ded"/></td>
          <td><input type="text" v-model="csio.part4.excessLiability.limitOfLiability.aggregate.amount"/></td>
        </tr>
        <tr>
          <td colspan="2" class="blank"></td>
          <td></td>
          <td></td>
        </tr>
        <tr style="letter-spacing: 0px;">
          <td rowspan="1" colspan="3"><div style="font-weight: bolder; text-align: left;">OTHER LIABILITY (SPECIFY)</div>
            <input type="checkbox" />
            <input type="text" v-model="csio.part4.otherLiability.liabilities"/>
          </td>
          <td rowspan="1" colspan="3"><input type="text" v-model="csio.part4.otherLiability.insuranceCompany"/></td>
          <td rowspan="1" colspan="2"><input type="text" v-model="csio.part4.otherLiability.effectiveDate"/></td>
          <td rowspan="1" colspan="2"><input type="text" v-model="csio.part4.otherLiability.expiryDate"/></td>
          <td colspan="2"></td>
          <td><input type="text" v-model="csio.part4.otherLiability.limitOfLiability.aggregate.ded"/></td>
          <td><input type="text" v-model="csio.part4.otherLiability.limitOfLiability.aggregate.amount"/></td>
        </tr>
        <tr style="letter-spacing: 0px;">
          <td rowspan="1" colspan="3">
            <input type="checkbox" />
          </td>
          <td rowspan="1" colspan="3"></td>
          <td rowspan="1" colspan="2"></td>
          <td rowspan="1" colspan="2"></td>
          <td colspan="2"></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td class="label">5.</td>
          <td colspan="13" class="title">CANCELLATION</td>
        </tr>
        <tr>
          <td colspan="14" style="font-size: 1.0rem; line-height: 14px;">Should any of the above described policies be cancelled before the expiration date thereof, the issuing company will endeavor to mail ____ days written notice to the certificate
            holder named above, but failure to mail such notice shall impose no obligation or liability of ny kink upon the company, its agents or representatives.
          </td>
        </tr>
        <tr>
          <td class="label">6.</td>
          <td colspan="6" class="title">BROKERAGE/AGENCY FULL NAME AND MAILING ADDRESS</td>
          <td class="label">7.</td>
          <td colspan="6" class="title" style="line-height: 11px;">ADDITIONAL INSURED NAME AND MAILING ADDRESS
            <span style="font-weight: normal;font-size:0.7rem">(commercial General Liability- but only with respect to the operations of the Named Insured)</span></td>
        </tr>
        <tr>
          <td colspan="7" class="blank"><input type="text" v-model="csio.part6.name"/></td>
          <td colspan="7"><input type="text" v-model="csio.part7.name"/></td>
        </tr>
        <tr>
          <td colspan="7" class="blank"><input type="text" v-model="csio.part6.mailAddress"/></td>
          <td colspan="7"><input type="text" v-model="csio.part7.mailAddress"/></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="5" style="height:12px;"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td style="border-left: 0px;"><input type="text" v-model="csio.part6.postal"/></td>
          <td colspan="5"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td style="border-left: 0px;"><input type="text" v-model="csio.part7.postal"/></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="2" style="height:12px;border-right: 0px;">BROKER CLIENT ID:</td>
          <td colspan="5" style="border-left: 0px;"><input type="text" v-model="csio.part6.clientId"/></td>
          <td colspan="4" style="height:12px;border-right: 0px;">NATURE OF INTEREST:</td>
          <td colspan="3" style="border-left: 0px;"><input type="text" v-model="csio.part7.nature"/></td>
        </tr>
        <tr>
          <td class="label">8.</td>
          <td colspan="13" class="title">CERTIFICATE AUTHORIZATION</td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="2" style="height:12px;border-right: 0px;">ISSUER</td>
          <td colspan="5" style="border-left: 0px;"><input type="text" v-model="csio.part8.issuer"/></td>
          <!--td rowspan="2" colspan="7">CONTACT NUMBER(S)
            TYPE <input type="text" v-model="csio.part8.type1" style="border:0px;width:80px;"/>NO. <input type="text" v-model="csio.part8.no1" style="border:0px;width:80px;"/>TYPE <input type="text" v-model="csio.part8.type2" style="border:0px;width:80px;"/>NO. <input type="text" v-model="csio.part8.no2" style="border:0px;width:80px;"/>
            TYPE <input type="text" v-model="csio.part8.type3" style="border:0px;width:80px;"/>NO. <input type="text" v-model="csio.part8.no3" style="border:0px;width:80px;"/>TYPE <input type="text" v-model="csio.part8.type4" style="border:0px;width:80px;"/>NO. <input type="text" v-model="csio.part8.no4" style="border:0px;width:80px;"/>
          </td-->
          <td rowspan="2" colspan="7">CONTACT NUMBER(S)
            Representitive: <input type="text" v-model="csio.part8.type1" style="width:160px;"/>   Email: <input type="text" v-model="csio.part8.no1" style="width:160px;"/>
            Company: <input type="text" v-model="csio.part8.type3" style="width:160px;"/>   Email: <input type="text" v-model="csio.part8.no3" style="width:160px;"/>
          </td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="3" style="height:12px;border-right: 0px;">AUTHORIZED REPRESENTATIVE</td>
          <td colspan="4" style="border-left: 0px;"><input type="text" v-model="csio.part8.authorizedRepresentative"/></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="7" style="height:12px;padding:0px;">SIGNATURE OF
            AUTHORIZED REPRESENTATIVE</td>
          <!--td colspan="7" style="height:12px;">DATE <input type="text" v-model="csio.part8.date" style="width:120px;"/>EMAIL ADDRESS <input type="text" v-model="csio.part8.emailAddress" style="width:120px;"/></td-->
          <td colspan="7" style="height:12px;">DATE <input type="text" v-model="csio.part8.date" style="width:180px;"/></td>
        </tr>
        </tbody>
      </table>
      <div style="padding:5px;margin-top:-25px;font-width: bolder;font-size:0.9rem;">
        CSIO - Certificte of Liability Insurance CA4301e 201609
        <div style="font-weight:normal; padding-right:30px; text-align: right; margin-top:-18px;">©2021. Centre for Study of Insurance Operaations. All rights reserved</div>
      </div>
    </div>
    <div v-if="csioTypeId === 1" class="viewCSIO" id="csioDomp">
      <table>
        <colgroup>
          <col style="width:20px;">
          <col style="width:120px;">
          <col style="width:140px;">
          <col style="width:30px;">
          <col style="width:40px;">
          <col style="width:70px;">
          <col style="width:80px;">
          <col style="width:20px;">
          <col style="width:50px;">
          <col style="width:40px;">
          <col style="width:150px;">
          <col style="width:68px;">
          <col style="width:90px;">
          <col style="width:82px;">
        </colgroup>
        <thead>
        <tr>
          <!--th style="width:10px"></th-->
          <th colspan="2" style="padding-left:10px;  text-align:left;font-size: 1.0rem;">CSIO ></th>
          <th colspan="10" style="font-family: 'Roboto Thin'; text-align: center;font-size: 1.9rem;">CERTIFICATE OF PROPERTY INSURANCE</th>
          <th style=""></th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td colspan="14" style="font-family: 'Roboto Thin';line-height: 14px;letter-spacing:0px; text-align: center;font-size: 1.0rem;">This certificate is issued as a matter of information only and confers no rights upon the certificate holder and imposes no liability on the insurer.
            This certificate does not amend, extend or alter the coverage afforded by the policies below.</td>
        </tr>
        <tr>
          <td class="label">1.</td>
          <td colspan="6" class="title">CERTIFICATE HOLDER - NAME AND MAILING ADDRESS</td>
          <td class="label">2.</td>
          <td colspan="6" class="title">INSURED'S FULL NAME AND MAILING ADDRESS</td>
        </tr>
        <tr>
          <td colspan="7" class="blank"><input type="text" v-model="csiop.part1.name"/></td>
          <td colspan="7"><input type="text" v-model="csiop.part2.name"/></td>
        </tr>
        <tr>
          <td colspan="7" class="blank"><input type="text" v-model="csiop.part1.mailAddress"/></td>
          <td colspan="7"><input type="text" v-model="csiop.part2.mailAddress"/></td>
        </tr>
        <tr>
          <td colspan="7" class="blank"><input type="text" /></td>
          <td colspan="7"><input type="text" /></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="5" style="height:12px;"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td colspan="" style="border-left: 0px;"><input type="text" v-model="csiop.part1.postal"/></td>
          <td colspan="5"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td colspan="1" style="border-left: 0px;"><input type="text" v-model="csiop.part2.postal"/></td>
        </tr>
        <tr>
          <td class="label">3.</td>
          <td colspan="13" class="title">LOCATION OF PREMISES / DESCRIPTION OF PROPERTY TO WHICH THIS CERTIFICATE APPLIES</td>
        </tr>
        <tr>
          <td colspan="14" class="blank"><input type="text" v-model="csiop.part3.description"/></td>
        </tr>
        <tr>
          <td colspan="14" class="blank"></td>
        </tr>
        <tr>
          <td colspan="14" class="blank"></td>
        </tr>
        <tr>
          <td class="label">4.</td>
          <td colspan="13" class="title">COVERAGES</td>
        </tr>
        <tr>
          <td colspan="14" style="line-height:14px; padding-left:10px;font-size: 0.8rem;font-family: 'Roboto Thin';">This is to certify that the policies of insurance listed below have been issued to the insured named above for the policy period indicated notwithstanding any requirements,
            terms or conditions of any contract or other document with respect to which this certificate may be issued or may pertain. The insurance afforded by the policies described
            herein is subject to all terms, exclusions and conditions of such policies.
          </td>
        </tr>
        <tr style="text-align: center; font-weight:bold;font-size:0.8rem;">
          <td rowspan="2" colspan="3">TYPE OF INSURANCE</td>
          <td rowspan="2" colspan="3" style="width:150px;">INSURANCE COMPANY
            AND POLICY NUMBER</td>
          <td rowspan="2" colspan="2">EFFECTIVE
            DATE
            YYYY/MM/DD</td>
          <td rowspan="2" colspan="2">EXPIRY
            DATE
            YYYY/MM/DD</td>
          <td rowspan="1" colspan="4" style="line-height: 14px; padding: 5px 5px;">LIMITS OF LIABILITY
            (Canadian dollars unless indicated otherwise) </td>
        </tr>
        <tr style="text-align: center; font-weight:bold;font-size:0.8rem;">
          <td colspan="2">COVERAGE</td>
          <td>DEDUCTIBLE</td>
          <td style="line-height: 12px; padding: 0px 5px;">AMOUNT OF
            INSURANCE</td>
        </tr>
        <tr style="letter-spacing: 0px;">
          <td rowspan="11" colspan="3" style="line-height: 20px;">
            <input type="checkbox" v-model="csiop.part4.first.liability.PROPERTY" /> PROPERTY
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="csiop.part4.first.liability.NAMED_PERILS"/> NAMED PERILS
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="csiop.part4.first.liability.BROAD_FORM" /> BROAD FORM
            <input type="checkbox" v-model="csiop.part4.first.liability.COINSURANCE"/> CO-INSURANCE %
            <input type="checkbox" v-model="csiop.part4.first.liability.STATED_AMOUNT" /> STATED AMOUNT
            <input type="checkbox" v-model="csiop.part4.first.liability.MARGIN_CLAUSE" /> MARGIN CLAUSE %
          </td>
          <td rowspan="11" colspan="3">
            <input type="text" v-model="csiop.part4.first.insuranceCompany"/><br />
            <input type="text" v-model="csiop.part4.first.policyNumber"/></td>
          <td rowspan="11" colspan="2"><input type="text" v-model="csiop.part4.first.effectiveDate"/></td>
          <td rowspan="11" colspan="2"><input type="text" v-model="csiop.part4.first.expiryDate"/></td>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.first.LOL.POED.SELF" /> P.O.E.D.  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="csiop.part4.first.LOL.POED.RC" /> RC &nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="csiop.part4.first.LOL.POED.ACV" /> ACV
          </td>
          <td><input type="text" v-model="csiop.part4.first.LOL.POED.ded"/></td>
          <td><input type="text" v-model="csiop.part4.first.LOL.POED.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.first.LOL.BUILDING.SELF" /> BUILDING &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="csiop.part4.first.LOL.BUILDING.RC" /> RC &nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="csiop.part4.first.LOL.BUILDING.ACV" /> ACV
          </td>
          <td><input type="text" v-model="csiop.part4.first.LOL.BUILDING.ded"/></td>
          <td><input type="text" v-model="csiop.part4.first.LOL.BUILDING.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.first.LOL.EQUIPMENT.SELF" /> EQUIPMENT&nbsp;&nbsp;<input type="checkbox" v-model="csiop.part4.first.LOL.EQUIPMENT.RC" /> RC &nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="csiop.part4.first.LOL.EQUIPMENT.ACV" /> ACV
          </td>
          <td><input type="text" v-model="csiop.part4.first.LOL.EQUIPMENT.ded"/></td>
          <td><input type="text" v-model="csiop.part4.first.LOL.EQUIPMENT.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.first.LOL.STOCK.SELF" /> STOCK &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <input type="checkbox" v-model="csiop.part4.first.LOL.STOCK.RC" /> RC &nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="csiop.part4.first.LOL.STOCK.ACV" /> ACV
          </td>
          <td><input type="text" v-model="csiop.part4.first.LOL.STOCK.ded"/></td>
          <td><input type="text" v-model="csiop.part4.first.LOL.STOCK.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.first.LOL.COED.SELF" /> C.O.E.D. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="csiop.part4.first.LOL.COED.RC" /> RC &nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="csiop.part4.first.LOL.COED.ACV" /> ACV
          </td>
          <td><input type="text" v-model="csiop.part4.first.LOL.COED.ded"/></td>
          <td><input type="text" v-model="csiop.part4.first.LOL.COED.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.first.LOL.BUSINESS_INCOME.SELF" /> BUSINESS INCOME
          </td>
          <td><input type="text" v-model="csiop.part4.first.LOL.BUSINESS_INCOME.ded"/></td>
          <td><input type="text" v-model="csiop.part4.first.LOL.BUSINESS_INCOME.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.first.LOL.EXTRA_EXPENSE.SELF" /> EXTRA EXPENSE
          </td>
          <td><input type="text" v-model="csiop.part4.first.LOL.EXTRA_EXPENSE.ded"/></td>
          <td><input type="text" v-model="csiop.part4.first.LOL.EXTRA_EXPENSE.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.first.LOL.RENTAL_INCOME.SELF" /> RENTAL INCOME
          </td>
          <td><input type="text" v-model="csiop.part4.first.LOL.RENTAL_INCOME.ded"/></td>
          <td><input type="text" v-model="csiop.part4.first.LOL.RENTAL_INCOME.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.first.LOL.EARTHQUAKE.SELF" /> EARTHQUAKE
          </td>
          <td><input type="text" v-model="csiop.part4.first.LOL.EARTHQUAKE.ded"/></td>
          <td><input type="text" v-model="csiop.part4.first.LOL.EARTHQUAKE.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.first.LOL.FLOOD.SELF" /> FLOOD
          </td>
          <td><input type="text" v-model="csiop.part4.first.LOL.FLOOD.ded"/></td>
          <td><input type="text" v-model="csiop.part4.first.LOL.FLOOD.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.first.LOL.SEWER_BACKUP.SELF" /> SEWER BACKUP
          </td>
          <td><input type="text" v-model="csiop.part4.first.LOL.SEWER_BACKUP.ded"/></td>
          <td><input type="text" v-model="csiop.part4.first.LOL.SEWER_BACKUP.amount"/></td>
        </tr>

        <tr style="letter-spacing: 0px;">
          <td rowspan="4" colspan="3" style="line-height: 20px;">
            <input type="checkbox" v-model="csiop.part4.second.liability.INLAND_MARINE" /> INLAND MARINE
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="csiop.part4.second.liability.NAMED_PERILS"/> NAMED PERILS
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="csiop.part4.second.liability.BROAD_FORM" /> BROAD FORM
            <input type="checkbox" v-model="csiop.part4.second.liability.ACTUAL_CASH_VALUE"/> ACTUAL CASH VALUE
            <input type="checkbox" v-model="csiop.part4.second.liability.REPLACEMENT_COST" /> REPLACEMENT COST
          </td>
          <td rowspan="4" colspan="3">
            <input type="text" v-model="csiop.part4.second.insuranceCompany"/><br />
            <input type="text" v-model="csiop.part4.second.policyNumber"/></td>
          <td rowspan="4" colspan="2"><input type="text" v-model="csiop.part4.second.effectiveDate"/></td>
          <td rowspan="4" colspan="2"><input type="text" v-model="csiop.part4.second.expiryDate"/></td>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.second.LOL.CONTRACTOR_EQUIPMENT.SELF" /> CONTRACTOR'S EQUIPMENT
          </td>
          <td><input type="text" v-model="csiop.part4.second.LOL.CONTRACTOR_EQUIPMENT.ded"/></td>
          <td><input type="text" v-model="csiop.part4.second.LOL.CONTRACTOR_EQUIPMENT.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.second.LOL.CARGO.SELF" /> CARGO
          </td>
          <td><input type="text" v-model="csiop.part4.second.LOL.CARGO.ded"/></td>
          <td><input type="text" v-model="csiop.part4.second.LOL.CARGO.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.second.LOL.OTHER0.SELF" />
          </td>
          <td><input type="text" v-model="csiop.part4.second.LOL.OTHER0.ded"/></td>
          <td><input type="text" v-model="csiop.part4.second.LOL.OTHER0.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">
            <input type="checkbox" v-model="csiop.part4.second.LOL.OTHER1.SELF" />
          </td>
          <td><input type="text" v-model="csiop.part4.second.LOL.OTHER1.ded"/></td>
          <td><input type="text" v-model="csiop.part4.second.LOL.OTHER1.amount"/></td>
        </tr>

        <tr style="letter-spacing: 0px;">
          <td rowspan="1" colspan="3" style="line-height: 20px;">
            <input type="checkbox" v-model="csiop.part4.thirdLiability.liability.BOILER" /> BOILER & MACHINERY /
            <span style="padding-left: 16px;">EQUIPMENT BREAKDOWN</span><br>
            <span>OPTION#</span>
          </td>
          <td rowspan="1" colspan="3">
          <td rowspan="1" colspan="2"></td>
          <td rowspan="1" colspan="2"></td>
          <td rowspan="1" colspan="2"></td>
          <td><input type="text" v-model="csiop.part4.thirdLiability.ded"/></td>
          <td><input type="text" v-model="csiop.part4.thirdLiability.amount"/></td>
        </tr>

        <tr style="letter-spacing: 0px;">
          <td rowspan="3" colspan="3" style="line-height: 20px;">
            Commercial General Liability
          </td>
          <td rowspan="3" colspan="3">
            <input type="text" v-model="csiop.part4.forthLiability.insuranceCompany"/><br />
            <input type="text" v-model="csiop.part4.forthLiability.policyNumber"/></td>
          <td rowspan="3" colspan="2"><input type="text" v-model="csiop.part4.forthLiability.effectiveDate"/></td>
          <td rowspan="3" colspan="2"><input type="text" v-model="csiop.part4.forthLiability.expiryDate"/></td>
          <td rowspan="1" colspan="2"><input type="text" v-model="csiop.part4.forthLiability.LOL.Other0.name"/></td>
          <td><input type="text" v-model="csiop.part4.forthLiability.LOL.Other0.ded"/></td>
          <td><input type="text" v-model="csiop.part4.forthLiability.LOL.Other0.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2"><input type="text" v-model="csiop.part4.forthLiability.LOL.Other1.name"/></td>
          <td><input type="text" v-model="csiop.part4.forthLiability.LOL.Other1.ded"/></td>
          <td><input type="text" v-model="csiop.part4.forthLiability.LOL.Other1.amount"/></td>
        </tr>
        <tr>
          <td rowspan="1" colspan="2"><input type="text" v-model="csiop.part4.forthLiability.LOL.Other2.name"/></td>
          <td><input type="text" v-model="csiop.part4.forthLiability.LOL.Other2.ded"/></td>
          <td><input type="text" v-model="csiop.part4.forthLiability.LOL.Other2.amount"/></td>
        </tr>

        <tr>
          <td class="label">5.</td>
          <td colspan="13" class="title">ADDITIONAL INFORMATION</td>
        </tr>
        <tr>
          <td colspan="14" style="font-size: 1.0rem; line-height: 14px;">
            <textarea rows="3" style="width: 100%;" v-model="csiop.part5.text"/>
          </td>
        </tr>

        <tr>
          <td class="label">6.</td>
          <td colspan="13" class="title">CANCELLATION</td>
        </tr>
        <tr>
          <td colspan="14" style="font-size: 1.0rem; line-height: 14px;">Should any of the above described policies be cancelled before the expiration date thereof, the issuing company will endeavor to mail ____ days written notice to the certificate
            holder named above, but failure to mail such notice shall impose no obligation or liability of ny kink upon the company, its agents or representatives.
          </td>
        </tr>

        <tr>
          <td class="label">7.</td>
          <td colspan="6" class="title">BROKERAGE/AGENCY FULL NAME AND MAILING ADDRESS</td>
          <td class="label">8.</td>
          <td colspan="6" class="title" style="line-height: 11px;">INTERESTED PARTY NAME AND MAILING ADDRESS</td>
        </tr>
        <tr>
          <td colspan="7" class="blank"><input type="text" v-model="csiop.part7.name"/></td>
          <td colspan="7"><input type="text" v-model="csiop.part8.name"/></td>
        </tr>
        <tr>
          <td colspan="7" class="blank"><input type="text" v-model="csiop.part7.mailAddress"/></td>
          <td colspan="7"><input type="text" v-model="csiop.part8.mailAddress"/></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="5" style="height:12px;"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td style="border-left: 0px;"><input type="text" v-model="csiop.part7.postal"/></td>
          <td colspan="5"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td style="border-left: 0px;"><input type="text" v-model="csiop.part8.postal"/></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="2" style="height:12px;border-right: 0px;">BROKER CLIENT ID:</td>
          <td colspan="5" style="border-left: 0px;"><input type="text" v-model="csiop.part7.clientId"/></td>
          <td colspan="4" style="height:12px;border-right: 0px;">NATURE OF INTEREST:</td>
          <td colspan="3" style="border-left: 0px;"><input type="text" v-model="csiop.part8.nature"/></td>
        </tr>
        <tr>
          <td class="label">9.</td>
          <td colspan="13" class="title">CERTIFICATE AUTHORIZATION</td>
        </tr>
        <tr style="padding:0px;">
          <!--td colspan="7" style="height:12px;">ISSUER <span style="padding-left:50px;">CHAT Insurance Services Inc</span></td-->
          <td colspan="2" style="height:12px;border-right: 0px;">ISSUER</td>
          <td colspan="5" style="border-left: 0px;"><input type="text" v-model="csiop.part9.issuer"/></td>
          <!--td rowspan="2" colspan="7">CONTACT NUMBER(S)
            TYPE <input type="text" v-model="csiop.part9.type1" style="border:0px;width:80px;"/>NO. <input type="text" v-model="csiop.part9.no1" style="border:0px;width:80px;"/>TYPE <input type="text" v-model="csiop.part9.type2" style="border:0px;width:80px;"/>NO. <input type="text" v-model="csiop.part9.no2" style="border:0px;width:80px;"/>
            EMAIL ADDRESS <input type="text" v-model="csiop.part9.emailAddress" style="border:0px;width:120px;"/>
          </td-->
          <td rowspan="2" colspan="7">CONTACT NUMBER(S)
            Representitive: <input type="text" v-model="csiop.part9.type1" style="width:160px;"/>   Email: <input type="text" v-model="csiop.part9.no1" style="width:160px;"/>
            Company: <input type="text" v-model="csiop.part9.type2" style="width:160px;"/>   Email: <input type="text" v-model="csiop.part9.no2" style="width:160px;"/>
          </td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="3" style="height:12px;border-right: 0px;">AUTHORIZED REPRESENTATIVE</td>
          <td colspan="4" style="border-left: 0px;"><input type="text" v-model="csiop.part9.authorizedRepresentative"/></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="7" style="height:12px; border-right: none;">SIGNATURE OF
            AUTHORIZED REPRESENTATIVE</td>
          <td colspan="7" style="height:12px; border-left: none;">DATE <input type="text" v-model="csiop.part9.date" style="width:180px;"/></td>
        </tr>
        </tbody>
      </table>
      <div style="padding:5px;margin-top:-25px;font-width: bolder;font-size:0.9rem;">
        CSIO - Certificte of Liability Insurance CA4301e 201609
        <div style="font-weight:normal; padding-right:30px; text-align: right; margin-top:-18px;">©2021. Centre for Study of Insurance Operaations. All rights reserved</div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'sheet',
  data: function () {
    return {
      csio: {
        part1: {
          name: '{{holder.name}}',
          mailAddress: '{{holder.address}}',
          postal: ''
        },
        part2: {
          name: '',
          mailAddress: '',
          postal: ''
        },
        part3: {
          description: ''
        },
        part4: {
          generalLiability: {
            liabilities: '',
            insuranceCompany: '',
            policyNumber: '',
            effectiveDate: '',
            expiryDate: '',
            limitOfLiability: {
              generalAggregate: {
                ded: '',
                amount: ''
              },
              eachOccurrence: {
                ded: '',
                amount: ''
              },
              operationsAggregate: {
                ded: '',
                amount: ''
              },
              injuryLiability: {
                option: '',
                ded: '',
                amount: ''
              },
              medicalPayments: {
                ded: '',
                amount: ''
              },
              tenantsLegalLiability: {
                ded: '',
                amount: ''
              },
              pollutionLiabilityExtension: {
                ded: '',
                amount: ''
              },
              nonOwnedLimit: {
                ded: '',
                amount: ''
              },
              hiredAutomobiles: {
                ded: '',
                amount: ''
              }
            }
          },
          automobileLiability: {
            liabilities: '',
            insuranceCompany: '',
            PolicyNumber: '',
            effectiveDate: '',
            expiryDate: '',
            limitOfLiability: {
              damageCombined: {
                ded: '',
                amount: ''
              },
              bodilyInjuryPerson: {
                ded: '',
                amount: ''
              },
              bodilyInjuryAccident: {
                ded: '',
                amount: ''
              },
              propertyDamage: {
                ded: '',
                amount: ''
              }
            }
          },
          excessLiability: {
            liabilities: '',
            insuranceCompany: '',
            PolicyNumber: '',
            effectiveDate: '',
            expiryDate: '',
            limitOfLiability: {
              eachOccurrence: {
                ded: '',
                amount: ''
              },
              aggregate: {
                ded: '',
                amount: ''
              }
            }
          },
          otherLiability: {
            liabilities: '',
            insuranceCompany: '',
            PolicyNumber: '',
            effectiveDate: '',
            expiryDate: '',
            limitOfLiability: {
              aggregate: {
                ded: '',
                amount: ''
              }
            }
          }
        },
        part5: {
          days: null
        },
        part6: {
          name: '',
          mailAddress: '',
          postal: '',
          clientId: ''
        },
        part7: {
          name: '',
          mailAddress: '',
          postal: '',
          nature: ''
        },
        part8: {
          issuer: '',
          authorizedRepresentative: '',
          signatureRepresentative: '',
          date: null,
          emailAddress: '',
          type1: '',
          no1: '',
          type2: '',
          no2: '',
          type3: '',
          no3: '',
          type4: '',
          no4: ''
        }
      },
      csiop: {
        part1: {
          name: '{{holder.name}}',
          mailAddress: '{{holder.address}}',
          postal: ''
        },
        part2: {
          name: '',
          mailAddress: '',
          postal: ''
        },
        part3: {
          description: ''
        },
        part4: {
          first: {
            liabilities: '',
            liability: {
              PROPERTY: false,
              NAMED_PERILS: false,
              BROAD_FORM: false,
              COINSURANCE: false,
              STATED_AMOUNT: false,
              MARGIN_CLAUSE: false
            },
            insuranceCompany: '',
            policyNumber: '',
            effectiveDate: '',
            expiryDate: '',
            LOL: {
              POED: {
                SELF: false,
                RC: false,
                ACV: false,
                ded: '',
                amount: ''
              },
              BUILDING: {
                SELF: false,
                RC: false,
                ACV: false,
                ded: '',
                amount: ''
              },
              EQUIPMENT: {
                SELF: false,
                RC: false,
                ACV: false,
                ded: '',
                amount: ''
              },
              STOCK: {
                SELF: false,
                RC: false,
                ACV: false,
                ded: '',
                amount: ''
              },
              COED: {
                SELF: false,
                RC: false,
                ACV: false,
                ded: '',
                amount: ''
              },
              BUSINESS_INCOME: {
                SELF: false,
                ded: '',
                amount: ''
              },
              EXTRA_EXPENSE: {
                SELF: false,
                ded: '',
                amount: ''
              },
              RENTAL_INCOME: {
                SELF: false,
                ded: '',
                amount: ''
              },
              EARTHQUAKE: {
                SELF: false,
                ded: '',
                amount: ''
              },
              FLOOD: {
                SELF: false,
                ded: '',
                amount: ''
              },
              SEWER_BACKUP: {
                SELF: false,
                ded: '',
                amount: ''
              }
            }
          },
          second: {
            liabilities: '',
            liability: {
              INLAND_MARINE: false,
              NAMED_PERILS: false,
              BROAD_FORM: false,
              ACTUAL_CASH_VALUE: false,
              REPLACEMENT_COST: false
            },
            insuranceCompany: '',
            PolicyNumber: '',
            effectiveDate: '',
            expiryDate: '',
            LOL: {
              CONTRACTOR_EQUIPMENT: {
                SELF: false,
                ded: '',
                amount: ''
              },
              CARGO: {
                SELF: false,
                ded: '',
                amount: ''
              },
              OTHER0: {
                SELF: false,
                ded: '',
                amount: ''
              },
              OTHER1: {
                SELF: false,
                ded: '',
                amount: ''
              }
            }
          },
          thirdLiability: {
            liabilities: '',
            liability: {
              BOILER: false
            },
            insuranceCompany: '',
            PolicyNumber: '',
            effectiveDate: '',
            expiryDate: '',
            LOL: {
            }
          },
          forthLiability: {
            liabilities: '',
            insuranceCompany: '',
            PolicyNumber: '',
            effectiveDate: '',
            expiryDate: '',
            LOL: {
              Other0: {
                name: '',
                ded: '',
                amount: ''
              },
              Other1: {
                name: '',
                ded: '',
                amount: ''
              },
              Other2: {
                name: '',
                ded: '',
                amount: ''
              }
            }
          }
        },
        part5: {
          text: null
        },
        part6: {
          days: null
        },
        part7: {
          name: '',
          mailAddress: '',
          postal: '',
          clientId: ''
        },
        part8: {
          name: '',
          mailAddress: '',
          postal: '',
          nature: ''
        },
        part9: {
          issuer: '',
          authorizedRepresentative: '',
          signatureRepresentative: '',
          date: null,
          emailAddress: '',
          type1: '',
          no1: '',
          type2: '',
          no2: ''
        }
      },
      title: '',
      expression: '',
      isLoading: false,
      isLoadingCsioTypes: false,
      isLoadingQuestionTypes: false,
      printDate: null,
      currentDate: moment(new Date()).format('MMMM DD, YYYY'),
      questionTypes: [],
      questions: [],
      csioTypes: [],
      csioTypeId: 0,
      questionTypeId: 3,
      currentQuestionId: 0,
      currentQuestion: null,
      outputType: 2,
      TypeID: 2,
      editForm: {
        tableTitle: '',
        tdText: ''
      }
    }
  },
  props: {
    sheetId: {
      type: Number
    },
    businessTypeId: {
      type: Number
    }
  },
  mounted: function () {
    // if (this.sheetId !== undefined) this.createSheet()
    this.loadCsioTypes()
    this.loadQuestionTypes()
    if (this.sheetId !== 0) {
      this.loadSheetContent(this.sheetId)
    }
    this.createSheet(this.sheetId)
    // this.loadTemplateQuestion(this.template.TemplateID)
    this.loadQuestions(0)
  },
  methods: {
    start: function () {
      console.log('start')
    },
    loadCsioTypes: function () {
      this.isLoadingCsioTypes = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'CsioType'}).then(res => {
        if (res) {
          console.log('CsioTypes', res)
          this.csioTypes = res.data
        }
        this.isLoadingCsioTypes = false
      }).catch(err => {
        console.log('loadCsioTypes error', err)
        this.isLoadingCsioTypes = false
      })
    },
    loadQuestionTypes: function () {
      this.isLoadingQuestionTypes = true
      this.axios.post('/api/Services/baseservice.asmx/GetEnumData', {enumtype: 'QuestionType'}).then(res => {
        if (res) {
          console.log('QuestionTypes', res)
          this.questionTypes = res.data
        }
        this.isLoadingQuestionTypes = false
      }).catch(err => {
        console.log('loadQuestionTypes error', err)
        this.isLoadingQuestionTypes = false
      })
    },
    addQ: function () {
      if (this.currentQuestion === null) return
      if (this.outputType === 1) {
        this.expression += this.currentQuestion.Description
      } else if (this.outputType === 2) {
        this.expression += '{{' + this.currentQuestion.QuestionID + '.Ans}}'
      } else if (this.outputType === 3) {
        this.expression += '{{' + this.currentQuestion.QuestionID + '.Out}}'
      } else if (this.outputType === 4) {
        this.expression += '{{' + this.currentQuestion.QuestionID + '.Addi}}'
      } else if (this.outputType === 5) {
        this.expression += '{{' + this.currentQuestion.QuestionID + '.Orig}}'
      }
    },
    createSheet: function (sheetId) {
      let newSheet = {}
      newSheet.SheetID = sheetId
      newSheet.TemplateID = this.csioTypeId
      newSheet.BusinessTypeID = this.businessTypeId
      if (this.sheetId === 0) newSheet.IsNew = true
      else newSheet.IsNew = false
      this.sheet = newSheet
      // this.title = template.Title
    },
    loadSheetContent: function (id) {
      if (id === undefined) return
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetSheet', {sheetid: id}).then(res => {
        if (res) {
          console.log('SheetContent', res)
          this.sheet = res.data
          this.TypeID = res.data.TypeID
          this.csioTypeId = res.data.TemplateID
          this.title = res.data.Title
          let content = JSON.parse(res.data.Content)
          if (res.data.TemplateID === 0) this.csio = content
          else this.csiop = content
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询SheetContent出错', err)
        this.isLoading = false
      })
    },

    loadTemplateQuestion: function (id) {
      if (id === undefined || id === null) return
      if (id === 0) return
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/baseservice.asmx/GetQuestionsByTemplate', {templateid: id}).then(res => {
        if (res) {
          console.log('Questions of Template' + id, res)
          this.questions = res.data
        }
        this.isLoading = false
      }).catch(err => {
        console.log('查询template出错', err)
        this.isLoading = false
      })
    },

    loadQuestions: function (start) {
      this.isLoading = true
      let id = this.questionTypeId
      this.axios.post('/api/Services/BaseService.asmx/GetSimpleQuestionsByType', {typeid: id, btypeid: this.businessTypeId, start: start}).then(res => {
        if (res) {
          console.log('查询', res)
          if (start === 0) {
            this.questionCount = res.count
            this.questions = res.data
          } else {
            this.questions = this.questions.concat(res.data)
          }
          if (this.questions.length < this.questionCount) {
            this.loadQuestions(this.questions.length)
          } else {
            this.isLoading = false
          }
        }
      }).catch(err => {
        console.log('loadQuestions error', err)
        this.isLoading = false
      })
    },

    saveSheet: function () {
      this.isLoading = true
      let value = this.sheet
      value.TypeID = this.TypeID
      value.TemplateID = this.csioTypeId
      value.Title = this.title
      console.log('sheet', value)
      if (this.csioTypeId === 0) {
        // value.Title = this.csioTypes[0].value
        value.Content = JSON.stringify(this.csio)
      } else {
        value.Content = JSON.stringify(this.csiop)
      }
      this.axios.post('/api/Services/BaseService.asmx/SaveSheet', {sheet: JSON.stringify(value)}).then(res => {
        if (res) {
          console.log('新增', res)
          this.sheet = res.data
          this.$message({
            type: 'success',
            message: 'Operation Succeeded'
          })
          // this.$parent.search()
        }
        this.isLoading = false
      }).catch(err => {
        console.log('saveSheet', err)
        this.isLoading = false
      })
    }
  }
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 1000px;
  border: 2px solid rgb(140 140 140);
  font-family: 'Roboto Thin';
  font-size: 0.8rem;
  letter-spacing: 0px;
  table-layout: fixed;
}
input[type=checkbox] {
  vertical-align: -2px;
}
input[type=text] {
  border: solid 1px;
  border-color: #b4bccc;
  outline: #3a8ee6;
  width: 98%;
}
caption {
  caption-side: bottom;
  padding: 5px;
  margin-top: -17px ;
  font-weight: bold;
  text-align: left;
}

thead,
tfoot {
  background-color: rgb(255 255 255);
}

th{
  border-left: 0px solid rgb(160 160 160);
  border-bottom: 1px solid rgb(160 160 160);
  padding: 0px 0px;
}
td {
  border: 1px solid rgb(160 160 160);
  padding: 4px 5px;
}
td.label {
  font-family: 'Roboto Thin';
  background-color: #000000;
  color:#ffffff;
  font-size: 0.8rem;
  padding: 2px 5px;
  width:12px;
  height:10px;
}
td.title {
  font-family: 'Roboto Thin';
  font-weight: bold;
  font-size: 0.8rem;
  padding: 2px 5px;
  height:10px;
}
td.postcode {
  width:50px;padding:0px 10px; line-height: 11px;
  border-right: 0px;
}
td.blank {
  height: 15px;
}
</style>
