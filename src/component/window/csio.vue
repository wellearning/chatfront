<template>
  <div>
    <div class="printDiv" >
      <el-button icon="el-icon-document" type="primary" @click="toPDF('csio', new Date())" size="small">Print</el-button>
      <!--<el-button icon="el-icon-printer" type="primary" v-print="printObj" :loading="isLoading || isLoadingInsuranceCompany" size="small">Print</el-button>-->
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
          <td colspan="7" class="blank"><input type="text" :value="csio.certificateHolder.name"/></td>
          <td colspan="7"><input type="text" :value="csio.insured.name"/></td>
        </tr>
        <tr>
          <td colspan="7" class="blank"><input type="text" :value="csio.certificateHolder.mailAddress"/></td>
          <td colspan="7"><input type="text" :value="csio.insured.mailAddress"/></td>
        </tr>
        <tr>
          <td colspan="7" class="blank"><input type="text" /></td>
          <td colspan="7"><input type="text" /></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="5" style="height:12px;"></td>
          <td class="postcode">POSTAL
          CODE</td>
          <td colspan="" style="border-left: 0px;"><input type="text" :value="csio.certificateHolder.postal"/></td>
          <td colspan="5"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td colspan="1" style="border-left: 0px;"><input type="text" :value="csio.insured.postal"/></td>
        </tr>
        <tr>
          <td class="label">3.</td>
          <td colspan="13" class="title">DESCRIPTION OF OPERATIONS/LOCATIONS/AUTOMOBILES/SPECIAL ITEMS TO WHICH THIS CERTIFICATE APPLIES <span style="font-weight: normal;font-size:0.8rem;">(but only with respect to the operations of the named insured)</span></td>
        </tr>
        <tr>
          <td colspan="14" class="blank"><input type="text" :value="csio.riskDescription.line0"/></td>
        </tr>
        <tr>
          <td colspan="14" class="blank"><input type="text" :value="csio.riskDescription.line1"/></td>
        </tr>
        <tr>
          <td colspan="14" class="blank"><input type="text" :value="csio.riskDescription.line2"/></td>
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
            <input type="checkbox" :checked="csio.coverage.general.CLAIMS_MADE" /> CLAIMS MADE <span style="padding:0 5px;font-weight:bolder;">OR</span>  <input type="checkbox"  :checked="csio.coverage.general.OCCURRENCE"/> OCCURRENCE
            <input type="checkbox" :checked="csio.coverage.general.Operations" /> PRODUCTS AND/OR COMPLETED OPERATIONS
            <input type="checkbox"  :checked="csio.coverage.general.Employers"/> EMPLOYER'S LIABILITY
            <input type="checkbox" :checked="csio.coverage.general.Cross" /> CROSS LIABILITY
            <br>

            <input type="checkbox" :checked="csio.coverage.general.WAIVER" /> WAIVER OF SUBROGATION
            <br>
            <br>
            <input type="checkbox" :checked="csio.coverage.general.TENANTS" /> TENANTS LEGAL LIABILITY
            <input type="checkbox" :checked="csio.coverage.general.POLLUTION" /> POLLUTION LIABILITY EXTENSION
            <input type="checkbox" /><br>
            <input type="checkbox" />
          </td>
          <td rowspan="9" colspan="3">{{csio.CorpName}}<br />{{csio.PolicyNumber}}</td>
          <td rowspan="9" colspan="2">{{csio.EffectiveDate}}</td>
          <td rowspan="9" colspan="2">{{csio.ExpiryDate}}</td>
          <td rowspan="2" colspan="2" style="font-weight: normal;font-family: 'JetBrains Mono Thin'; line-height:12px;letter-spacing:0px;">COMMERCIAL GENERAL LIABILITY
            <span style="padding-left:5px;">BODILY INJURY AND PROPERTY DAMAGE</span><br>
            <span style="padding-left:5px;">LIABILITY</span>
          <div style="padding-left:90px; padding-bottom:10px;margin:-10px">- GENERAL AGGREGATE
          - EACH OCCURRENCE</div></td>
          <td style="height:28px;"><input type="text" :value="csio.coverage.general.BodilyInjury.ded"/></td>
          <td><input type="text" :value="csio.coverage.general.BodilyInjury.amount"/></td>
        </tr>
        <tr>
          <td><input type="text" :value="csio.coverage.general.PropertyDamage.ded"/></td>
          <td><input type="text" :value="csio.coverage.general.PropertyDamage.amount"/></td>
        </tr>
        <tr>
          <td colspan="2" style="line-height: 12px; padding: 0px 5px;">PRODUCTS AND COMPLETED OPERATIONS
            AGGREGATE</td>
          <td><input type="text" :value="csio.coverage.general.Aggregate.ded"/></td>
          <td><input type="text" :value="csio.coverage.general.Aggregate.amount"/></td>
        </tr>
        <tr>
          <td colspan="2" style="line-height: 12px;"><input type="checkbox" /> PERSONAL INSUARY LIABILITY
            OR
            <input type="checkbox" /> PERSONAL AND ADVERTISING INSURAY
          LIABILITY</td>
          <td><input type="text" :value="csio.coverage.general.PersonalInjury.ded"/></td>
          <td><input type="text" :value="csio.coverage.general.PersonalInjury.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">MEDICAL PAYMENTS</td>
          <td><input type="text" :value="csio.coverage.general.MedicalPayment.ded"/></td>
          <td><input type="text" :value="csio.coverage.general.MedicalPayment.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">TENANTS LEGAL LIABILITY</td>
          <td><input type="text" :value="csio.coverage.general.TenantsLegal.ded"/></td>
          <td><input type="text" :value="csio.coverage.general.TenantsLegal.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">POLLUTION LIABILITY EXTENSION</td>
          <td><input type="text" :value="csio.coverage.general.PollutionLimit.ded"/></td>
          <td><input type="text" :value="csio.coverage.general.PollutionLimit.amount"/></td>
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
            <input type="checkbox" :checked="csio.coverage.NONOWNED" /> NON-OWNED AUTOMOBILES
          </td>
          <td colspan="3"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"><input type="checkbox" :checked="csio.coverage.NONOWNED"/> NON-OWNED AUTOMOBILES</td>
          <td><input type="text" :value="csio.coverage.NonOwnedLimit.ded"/></td>
          <td><input type="text" :value="csio.coverage.NonOwnedLimit.amount"/></td>
        </tr>
        <tr>
          <td colspan="3">
            <input type="checkbox" :checked="csio.coverage.HIRED" /> HIRED AUTOMOBILES
          </td>
          <td colspan="3"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"><input type="checkbox" :checked="csio.coverage.HIRED"/> HIRED AUTOMOBILES</td>
          <td><input type="text" :value="csio.coverage.HiredLimit.ded"/></td>
          <td><input type="text" :value="csio.coverage.HiredLimit.amount"/></td>
        </tr>
        <tr style="letter-spacing: 0px;">
          <td rowspan="4" colspan="3"><div style="font-weight: bolder; text-align: left;">AUTOMOBILE LIABILITY</div>
            <input type="checkbox" :checked="csio.coverage.automobile.DESCRIBED" /> DESCRIBED AUTOMOBILES
            <input type="checkbox" :checked="csio.coverage.automobile.ALLOWED"/> ALLOWED AUTOMOBILES
            <input type="checkbox" :checked="csio.coverage.automobile.LEASED"/> LEASED AUTOMOBILES**
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
          <td><input type="text" :value="csio.coverage.automobile.BodilyPropertyCombined.ded"/></td>
          <td><input type="text" :value="csio.coverage.automobile.BodilyPropertyCombined.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">BODILY INJURY (PER PERSON)</td>
          <td><input type="text" :value="csio.coverage.automobile.BodilyInjuryPerson.ded"/></td>
          <td><input type="text" :value="csio.coverage.automobile.BodilyInjuryPerson.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">BODILY INJURY (PER ACCIDENT)</td>
          <td><input type="text" :value="csio.coverage.automobile.BodilyInjuryAccident.ded"/></td>
          <td><input type="text" :value="csio.coverage.automobile.BodilyInjuryAccident.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">PROPERTY DAMAGE</td>
          <td><input type="text" :value="csio.coverage.automobile.PropertyDamage.ded"/></td>
          <td><input type="text" :value="csio.coverage.automobile.PropertyDamage.amount"/></td>
        </tr>
        <tr style="letter-spacing: 0px;">
          <td rowspan="3" colspan="3"><div style="font-weight: bolder; text-align: left;">EXCESS LIABILITY</div>
            <input type="checkbox" :checked="csio.coverage.excess.UmbrellaForm"/> UMBRELLA FORM
            <input type="checkbox" :checked="csio.coverage.excess.OtherType"/>
          </td>
          <td rowspan="3" colspan="3"></td>
          <td rowspan="3" colspan="2"></td>
          <td rowspan="3" colspan="2"></td>
          <td colspan="2">EACH OCCURRENCE</td>
          <td><input type="text" :value="csio.coverage.excess.EachOccurrence.ded"/></td>
          <td><input type="text" :value="csio.coverage.excess.EachOccurrence.amount"/></td>
        </tr>
        <tr>
          <td colspan="2">AGGREGATE</td>
          <td><input type="text" :value="csio.coverage.excess.Aggregate.ded"/></td>
          <td><input type="text" :value="csio.coverage.excess.Aggregate.amount"/></td>
        </tr>
        <tr>
          <td colspan="2" class="blank"></td>
          <td></td>
          <td></td>
        </tr>
        <tr style="letter-spacing: 0px;">
          <td rowspan="1" colspan="3"><div style="font-weight: bolder; text-align: left;">OTHER LIABILITY (SPECIFY)</div>
            <input type="checkbox" :checked="csio.coverage.other.OtherType"/>
          </td>
          <td rowspan="1" colspan="3"><input type="text" :value="csio.coverage.other.Other"/></td>
          <td rowspan="1" colspan="2"></td>
          <td rowspan="1" colspan="2"></td>
          <td colspan="2"></td>
          <td><input type="text" :value="csio.coverage.other.OtherLimit.ded"/></td>
          <td><input type="text" :value="csio.coverage.other.OtherLimit.amount"/></td>
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
          <td colspan="7" class="blank"><input type="text" :value="csio.broker.name"/></td>
          <td colspan="7"><input type="text" :value="csio.additionalInsured.name"/></td>
        </tr>
        <tr>
          <td colspan="7" class="blank"><input type="text" :value="csio.broker.mailAddress"/></td>
          <td colspan="7"><input type="text" :value="csio.additionalInsured.mailAddress"/></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="5" style="height:12px;"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td style="border-left: 0px;"><input type="text" :value="csio.broker.postal"/></td>
          <td colspan="7"></td>
        </tr>
        <tr style="padding:0px;">
          <td colspan="2" style="height:12px;border-right: 0px;">BROKER CLIENT ID:</td>
          <td colspan="5" style="border-left: 0px;"><input type="text" :value="csio.broker.clientId"/></td>
          <td colspan="5"></td>
          <td class="postcode">POSTAL
            CODE</td>
          <td style="border-left: 0px;"><input type="text" :value="csio.additionalInsured.postal"/></td>
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
      businessObj: {
      },
      csio: {
        CorpName: 'April (on)',
        PolicyNumber: 'policy number',
        EffectiveDate: '2024/12/31',
        ExpiryDate: '2025/12/31',
        certificateHolder: {
          name: 'Ruby Zhan',
          mailAddress: '101 Kinaston Gdn. NY, On',
          postal: 'M1K 3B8'
        },
        insured: {
          name: 'Branden Li',
          mailAddress: '101 Kinaston Gdn. NY, On',
          postal: 'M1K 3B8'
        },
        additionalInsured: {
          name: 'Branden Li',
          mailAddress: '101 Kinaston Gdn. NY, On',
          postal: 'M1K 3B8'
        },
        broker: {
          name: 'Branden Li',
          mailAddress: '101 Kinaston Gdn. NY, On',
          postal: 'M1K 3B8',
          clientId: null
        },
        riskDescription: {
          line0: 'operations',
          line1: 'locations',
          line2: 'specialItems'
        },
        coverage: {
          general: {
            CLAIMS_MADE: true,
            OCCURRENCE: true,
            Operations: true,
            Employers: true,
            Cross: true,
            WAIVER: true,
            TENANTS: true,
            POLLUTION: true,
            PersonalInjury: true,
            PersonalAdvertisingInjury: true,
            BodilyInjury: {
              ded: '2343',
              amount: '23432'
            },
            PropertyDamage: {
              ded: '',
              amount: ''
            },
            Aggregate: {
              ded: '',
              amount: ''
            },
            PersonalInjuryLimit: {
              ded: '',
              amount: ''
            },
            MedicalPayment: {
              ded: '',
              amount: ''
            },
            TenantsLegal: {
              ded: '',
              amount: ''
            },
            PollutionLimit: {
              ded: '',
              amount: ''
            }
          },
          automobile: {
            DESCRIBED: false,
            ALLOWED: false,
            LEASED: false,
            BodilyPropertyCombined: {
              ded: '',
              amount: ''
            },
            BodilyInjuryPerson: {
              ded: '',
              amount: ''
            },
            BodilyInjuryAccident: {
              ded: '',
              amount: ''
            },
            PropertyDamage: {
              ded: '',
              amount: ''
            }
          },
          excess: {
            UmbrellaForm: false,
            OtherType: false,
            Other: '',
            EachOccurrence: {
              ded: '',
              amount: ''
            },
            Aggregate: {
              ded: '',
              amount: ''
            }
          },
          other: {
            OtherType: false,
            Other: '',
            OtherLimit: {
              ded: '',
              amount: ''
            }
          },
          NONOWNED: false,
          HIRED: false,
          NonOwnedLimit: {
            ded: '',
            amount: ''
          },
          HiredLimit: {
            ded: '',
            amount: ''
          }
        }
      },
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
    this.initialCSIO()
    this.loadBusinessObj(this.businessObjId)
  },
  methods: {
    initialCSIO: function () {
      console.log('initialCSIO')
      this.csio = {
        CorpName: '',
        PolicyNumber: '',
        EffectiveDate: '',
        ExpiryDate: '',
        certificateHolder: {
          name: '',
          mailAddress: '',
          postal: ''
        },
        insured: {
          name: '',
          mailAddress: '',
          postal: ''
        },
        additionalInsured: {
          name: '',
          mailAddress: '',
          postal: ''
        },
        broker: {
          name: '',
          mailAddress: '',
          postal: '',
          clientId: ''
        },
        riskDescription: {
          line0: '',
          line1: '',
          line2: ''
        },
        coverage: {
          general: {
            CLAIMS_MADE: false,
            OCCURRENCE: false,
            Operations: false,
            Employers: false,
            Cross: false,
            WAIVER: false,
            TENANTS: false,
            POLLUTION: false,
            PersonalInjury: false,
            PersonalAdvertisingInjury: false,
            BodilyInjury: {
              ded: '',
              amount: ''
            },
            PropertyDamage: {
              ded: '',
              amount: ''
            },
            Aggregate: {
              ded: '',
              amount: ''
            },
            PersonalInjuryLimit: {
              ded: '',
              amount: ''
            },
            MedicalPayment: {
              ded: '',
              amount: ''
            },
            TenantsLegal: {
              ded: '',
              amount: ''
            },
            PollutionLimit: {
              ded: '',
              amount: ''
            }
          },
          automobile: {
            DESCRIBED: false,
            ALLOWED: false,
            LEASED: false,
            BodilyPropertyCombined: {
              ded: '',
              amount: ''
            },
            BodilyInjuryPerson: {
              ded: '',
              amount: ''
            },
            BodilyInjuryAccident: {
              ded: '',
              amount: ''
            },
            PropertyDamage: {
              ded: '',
              amount: ''
            }
          },
          excess: {
            UmbrellaForm: false,
            OtherType: false,
            Other: '',
            EachOccurrence: {
              ded: '',
              amount: ''
            },
            Aggregate: {
              ded: '',
              amount: ''
            }
          },
          other: {
            OtherType: false,
            Other: '',
            OtherLimit: {
              ded: '',
              amount: ''
            }
          },
          NONOWNED: false,
          HIRED: false,
          NonOwnedLimit: {
            ded: '',
            amount: ''
          },
          HiredLimit: {
            ded: '',
            amount: ''
          }
        }
      }
    },
    loadBusinessObj: function (id) {
      this.axios.post('/api/Services/CommerceService.asmx/GetCSIO', {applicationid: id}).then(res => {
        if (res) {
          console.log('loadBusinessObj', res)
          this.csio = res.data
          this.csio.EffectiveDate = moment(res.data.EffectiveDate).format('YYYY/MM/DD')
          this.csio.ExpiryDate = moment(res.data.ExpiryDate).format('YYYY/MM/DD')
          this.isLoading = false
        }
      }).catch(err => {
        console.log('loadBusinessObj', err)
        this.isLoading = false
      })
    },
    loadApplication: function (id) {
      this.loadBusinessObj(id)
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
