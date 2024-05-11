<template>
  <div>
    <div class="printDiv" >
      <el-button icon="el-icon-document" type="primary" @click="toPDF('csio', new Date())" size="small">Print</el-button>
      <!--<el-button icon="el-icon-printer" type="primary" v-print="printObj" :loading="isLoading || isLoadingInsuranceCompany" size="small">Print</el-button>-->
    </div>
    <div class="viewCSIO" id="csioDom">
      <table>
        <thead>
          <tr>
            <!--th style="width:10px"></th-->
            <th colspan="2" style="padding-left:10px;  text-align:left;font-size: 1.0rem;">CSIO ></th>
            <th colspan="10" style="font-family: 'Roboto Thin'; text-align: center;font-size: 1.9rem;">CERTIFICATE OF LIABILITY INSURANCE</th>
            <th style=""></th>
            <th style="width:100px"></th>
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
          <td colspan="7" class="blank"></td>
          <td colspan="7"></td>
        </tr>
        <tr>
          <td colspan="7" class="blank"></td>
          <td colspan="7"></td>
        </tr>
        <tr>
          <td colspan="7" class="blank"></td>
          <td colspan="7"></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="5" style="height:12px;"></td>
          <td class="postcode">POSTAL
          CODE</td>
          <td style="border-left: 0px;"></td>
          <td colspan="5"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td style="border-left: 0px;"></td>
        </tr>
        <tr>
          <td class="label">3.</td>
          <td colspan="13" class="title">DESCRIPTION OF OPERATIONS/LOCATIONS/AUTOMOBILES/SPECIAL ITEMS TO WHICH THIS CERTIFICATE APPLIES <span style="font-weight: normal;font-size:0.8rem;">(but only with respect to the operations of the named insured)</span></td>
        </tr>
        <tr>
          <td colspan="14" class="blank"></td>
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
          <td rowspan="2" colspan="3">INSURANCE COMPANY
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
            <input type="checkbox" /> EMPLOYER'S LIABILITY
            <input type="checkbox" /> CROSS LIABILITY
            <br>

            <input type="checkbox" /> WAIVER OF SUBROGATION
            <br>
            <br>
            <input type="checkbox" /> TENANTS LEGAL LIABILITY
            <input type="checkbox" /> POLLUTION LIABILITY EXTENSION
            <input type="checkbox" /><br>
            <input type="checkbox" />
          </td>
          <td rowspan="9" colspan="3"></td>
          <td rowspan="9" colspan="2"></td>
          <td rowspan="9" colspan="2"></td>
          <td rowspan="2" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">COMMERCIAL GENERAL LIABILITY
            <span style="padding-left:5px;">BODILY INJURY AND PROPERTY DAMAGE</span><br>
            <span style="padding-left:5px;">LIABILITY</span>
          <div style="padding-left:100px; padding-bottom:10px;margin:-10px">- GENERAL AGGREGATE
          - EACH OCCURRENCE</div></td>
          <td style="height:28px;"></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="2" style="line-height: 12px; padding: 0px 5px;">PRODUCTS AND COMPLETED OPERATIONS
            AGREGATE</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="2" style="line-height: 12px;"><input type="checkbox" /> PERSONAL INSUARY LIABILITY
            OR
            <input type="checkbox" /> PERSONAL AND ADVERTISING INSURAY
          LIABILITY</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="2">MEDICAL PAYMENTS</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="2">TENANTS LEGAL LIABILITY</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="2">POLLUTION LIABILITY EXTENSION</td>
          <td></td>
          <td></td>
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
          <td colspan="2"><input type="checkbox"/> NON-OWNED AUTOMOBILES</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="3">
            <input type="checkbox" /> HIRED AUTOMOBILES
          </td>
          <td colspan="3"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"><input type="checkbox" /> HIRED AUTOMOBILES</td>
          <td></td>
          <td></td>
        </tr>
        <tr style="letter-spacing: 0px;">
          <td rowspan="4" colspan="3"><div style="font-weight: bolder; text-align: left;">AUTOMOBILE LIABILITY</div>
            <input type="checkbox" /> DESCRIBED AUTOMOBILES
            <input type="checkbox" /> ALLOWED AUTOMOBILES
            <input type="checkbox" /> LEASED AUTOMOBILES**
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
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="2">BODILY INJURY (PER PERSON)</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="2">BODILY INJURY (PER ACCIDENT)</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="2">PROPERTY DAMAGE</td>
          <td></td>
          <td></td>
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
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="2">AGGREGATE</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="2" class="blank"></td>
          <td></td>
          <td></td>
        </tr>
        <tr style="letter-spacing: 0px;">
          <td rowspan="1" colspan="3"><div style="font-weight: bolder; text-align: left;">OTHER LIABILITY (SPECIFY)</div>
            <input type="checkbox" />
          </td>
          <td rowspan="1" colspan="3"></td>
          <td rowspan="1" colspan="2"></td>
          <td rowspan="1" colspan="2"></td>
          <td colspan="2"></td>
          <td></td>
          <td></td>
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
          <td colspan="7" class="blank"></td>
          <td colspan="7"></td>
        </tr>
        <tr>
          <td colspan="7" class="blank"></td>
          <td colspan="7"></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="5" style="height:12px;"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td style="border-left: 0px;"></td>
          <td colspan="7"></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="7" style="height:12px;">BROKER CLIENT ID:</td>
          <td colspan="5"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td style="border-left: 0px;"></td>
        </tr>
        <tr>
          <td class="label">8.</td>
          <td colspan="13" class="title">CERTIFICATE AUTHORIZATION</td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="7" style="height:12px;">ISSUER</td>
          <td rowspan="2" colspan="7">CONTACT NUMBER(S)
          TYPE<input type="text" style="border:0px;width:80px;"/>NO.<input type="text" style="border:0px;width:80px;"/>TYPE<input type="text" style="border:0px;width:80px;"/>NO.<input type="text" style="border:0px;width:80px;"/>
            TYPE<input type="text" style="border:0px;width:80px;"/>NO.<input type="text" style="border:0px;width:80px;"/>TYPE<input type="text" style="border:0px;width:80px;"/>NO.<input type="text" style="border:0px;width:80px;"/>
          </td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="7" style="height:12px;">AUTHORIZED REPRESENTATIVE</td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="7" style="height:12px;padding:0px;">SIGNATURE OF
            AUTHORIZED REPRESENTATIVE</td>
          <td colspan="7" style="height:12px;">DATE<input type="text" style="border:0px;width:120px;"/>EMAIL ADDRESS<input type="text" style="border:0px;width:120px;"/></td>
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
  name: 'CSIO',
  data: function () {
    return {
      printDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      Author: JSON.parse(this.$store.getters.getAccount).Name
    }
  },
  props: {
    businessObjId: {
      type: Number
    },
    businessTypeId: {
      type: Number
    }
  },
  mounted: function () {
    this.businessObjId(this.businessObjId)
  },
  methods: {
    start: function () {
      console.log('start')
    },
    loadBusinessObj: function () {
    },
    loadApplication: function (id) {
      this.printDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      this.isLoading = true
      this.axios.post('/api/Services/CommerceService.asmx/GetApplicationAttr', {applicationid: id}).then(res => {
        if (res) {
          console.log('loadApplication', res)
          this.businessObj = res.data
          this.businessObj.ExpiryDate = moment(res.data.ExpiryDate).format('YYYY-MM-DD')
          this.businessObj.DateOfBirth = moment(res.data.DateOfBirth).format('YYYY-MM-DD')
          let effdate = moment(res.data.EffectiveDate)
          if (effdate.year() > 2020) this.businessObj.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY-MM-DD')
          else this.businessObj.EffectiveDate = ''
          this.loadProducer()
          this.isLoading = false
        }
      }).catch(err => {
        console.log('loadApplication出错', err)
        this.isLoading = false
      })
    },

    // 关闭Pink Slip
    close: function (done) {
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
        memoTemplates: [{
          memoBlocks: [{
            answers: []
          }]
        }],
        answerList: []
      }
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
}
input[type=checkbox] {
  vertical-align: -2px;
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
