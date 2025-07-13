<template>
  <div>
    <div class="printDiv" >
      <!--<el-button icon="el-icon-printer" type="primary" v-print="printObj" :loading="isLoading || isLoadingInsuranceCompany" size="small">Print</el-button>-->
      <el-form  class="newMemo">
        <el-row :gutter="20" class="subtitle">
          <el-col :span="18">
            <el-form-item label="CSIO" prop="CsioID">
              <el-select v-model="csioId" placeholder="available csiop" @change="selectChanged" no-data-text="No Record" filterable >
                <el-option v-for="item in csioList" :key="item.CsioID" :label="item.Title" :value="item.CsioID"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <div class="newMemo-submit">
              <el-button icon="el-icon-document" type="primary" @click="toPDF('csiop', new Date())" size="small">Print</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="viewCSIO" id="csioDom">
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
          <td colspan="5" style="border-left: 0px;"><input type="text" v-model="csiop.part6.clientId"/></td>
          <td colspan="5" style="height:12px;border-right: 0px;">NATURE OF INTEREST:</td>
          <td colspan="2" style="border-left: 0px;"><input type="text" v-model="csiop.part6.clientId"/></td>
        </tr>
        <tr>
          <td class="label">9.</td>
          <td colspan="13" class="title">CERTIFICATE AUTHORIZATION</td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="7" style="height:12px;">ISSUER <span style="padding-left:50px;">CHAT Insurance Services Inc</span></td>
          <td rowspan="2" colspan="7">CONTACT NUMBER(S)
            TYPE<input type="text" style="border:0px;width:80px;"/>NO.<input type="text" style="border:0px;width:80px;"/>TYPE<input type="text" style="border:0px;width:80px;"/>NO.<input type="text" style="border:0px;width:80px;"/>
            EMAIL ADDRESS<input type="text" style="border:0px;width:120px;"/>
          </td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="7" style="height:12px;">AUTHORIZED REPRESENTATIVE</td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="7" style="height:12px; border-right: none;">SIGNATURE OF
            AUTHORIZED REPRESENTATIVE</td>
          <td colspan="7" style="height:12px; border-left: none;">DATE<input type="text" style="border:0px;width:120px;"/></td>
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
import $ from 'jquery'
export default {
  name: 'CSIO',
  data: function () {
    return {
      csioId: null,
      currentCsio: 0,
      csioList: [],
      csiop: {
        part1: {
          name: '',
          mailAddress: '',
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
          postal: ''
        },
        part9: {
          issuer: '',
          authorizedRepresentative: '',
          signatureRepresentative: '',
          date: null,
          emailAddress: ''
        }
      },
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      Author: JSON.parse(this.$store.getters.getAccount).Name
    }
  },
  props: {
    businessId: {
      type: Number
    },
    businessTypeId: {
      type: Number
    }
  },
  mounted: function () {
    // this.loadCsios(this.businessId)
    $('input').attr('readonly', 'readonly')
    $('input:checkbox').attr('disabled', 'disabled')
  },
  methods: {
    selectChanged: function () {
      // let item = this.csioList.find(s => s.CsioID === this.csioId)
      // if (item === undefined) return
      // this.csiop = item.Content
    },
    loadCsios: function (id) {
      this.isLoading = true
      this.axios.post('/api/Services/commerceservice.asmx/GetReleasedCsios', {businessid: id}).then(res => {
        if (res) {
          console.log('loadCsios', res)
          this.csioList = res.data
          this.csioList.forEach(c => {
            c.Content = JSON.parse(c.Content)
          })
        }
        this.isLoading = false
      }).catch(err => {
        console.log('loadCsios error', err)
        this.isLoading = false
      })
    },

    close: function (done) {
      done()
    },
    // 转pdf
    toPDF: function (title, EffectiveDate) {
      this.htmlTitle = title + ' ' + EffectiveDate
      this.getPdf('#csioDom')
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
  border: none;
  outline: none;
  width: 98%;
  readonly: true;
}
textarea {
  border: none;
  outline: none;
  width: 98%;
  readonly: true;
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
