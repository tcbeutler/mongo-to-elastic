var _ = require('lodash')

module.exports = function(person) {
  return {
    _id: person['_id'],
    addressId: person['ad'],
    ageGroup: person['ar'],
    beehive: person['b'], 
    dns: person['d'], 
    dateOfBirth: person['db'],
    heatlhSystemEmployee: person['e'],
    financialClassId: person['f'],
    gender: person['g'],
    holdout: person['h'],
    homeValue: person['ha'],
    householdPreference: person['hp'],
    income: person['i'],
    hasAddress: person['j'],
    homeOwnership: person['k'],
    languageId: person['l'],
    lists: _.map(person['lids'], function(lid) {
      return {
        id: lid['lid'],
        segment: lid['seg']
      }
    }),
    maritalStatus: person['m'],
    donateToCharity: person['n'],
    occupation: person['o'],
    hasPrimaryPhysician: person['p'],
    hasChildren: person['pc'],
    payerType: person['q'],
    race: person['r'],
    religion: person['rg'],
    recipes: _.map(person['rids'], function(rid) {
      return {
        id: rid['r'],
        score: rid['p']
      }
    }),
    supplemental: {
      street1: person['sup']['a'],
      street2: person['sup']['a2'],
      city: person['sup']['c'],
      crrt: person['sup']['crrt'],
      dpbc: person['sup']['dpbc'],
      firstName: person['sup']['fn'],
      lastName: person['sup']['ln'],
      purl: person['sup']['purl'],
      state: person['sup']['s']
    },
    personTypeId: person['t'],
    educationId: person['u'],
    householdType: person['v'],
    wealthRate: person['w'],
    location: person['x'].coordinates.map(Number),//map point lat/lon
    hasEmail: person['y'],
    zip: person['z'],
    zip4: person['z4'],
    mfl: _.map(person['mfl'], function(mfl) {
      return {
        locationId: mfl['id'],
        meters: mfl['m']
      }
    }),
    encounters: _.map(person['en'], function(enc) {
      return {
        admittedAt: enc['a'],
        dischargedAt: enc['d'],
        er: enc['e'],
        patientType: enc['t'],
        locationId: enc['l'],
        providers: _.map(enc['p'], function(provider) {
          return {
            id: provider['i'],
            type: provider['t']
          }
        }),
        mxGroupIds: enc['m']
      }
    })
  }
}