var MongoClient = require('mongodb').MongoClient;
var Promise = require('bluebird');
var _ = require('lodash');
var es = require('elasticsearch');
var personMapper = require('./personMapper')

var url = "mongodb://localhost:27017/predict"
var mongoClient;
var esClient = es.Client({ host: 'http://192.168.59.103:9200' });

var PAGESIZE = 1000;

connect(url)
.then(function(db) {
  mongoClient = db;
  insertPage(0, PAGESIZE);
});

function connect(url) {
  return new Promise(function (resolve, reject) {
    MongoClient.connect(url, function (err, db) {
      if (err)
        return reject(err);

      return resolve(db);
    });
  });
}

function insertPage(page, pageSize, pages) {
  
  if (page > pages) process.exit();
  console.log('Inserting page %d/%d', page, pages ? pages : '?');

  checkPaging()
  .then(allPersons)
  .then(mapToElasticFormat)
  .then(createBulkReq)
  .then(sendReq)
  .then(nextPage)

  function checkPaging() {
    return new Promise(function(resolve, reject) {
      if (pages) return resolve(cnt);
      var cnt = mongoClient.collection('persons_random_master')
      .find({})
      .count(function(err, cnt) {
        if (err) return reject(err);
        pages = Math.ceil(cnt/PAGESIZE);
        return resolve(pages);
      });
    });
  }

  function allPersons() {
    return new Promise(function (resolve, reject) {
      mongoClient.collection('persons_random_master')
      .find({})
      .skip(PAGESIZE * page)
      .limit(PAGESIZE)
      .toArray(function (err, docs) {
        //console.log('Got %d docs', docs.length)
        if (err)
          return reject(err);

        return resolve(docs);
      });
    });
  }

  function mapToElasticFormat(persons) {
    return _.map(persons, personMapper);
  }

  function createBulkReq(personArray) {
    var req = { body: [] };
    _.each(personArray, function(person) {
      //console.log(person._id);
      req.body.push({ "create": { "_index": "predict", "_type": "person", "_id": person._id }});
      req.body.push(person);
    });
    return req;
  }

  function sendReq(req) {
    return esClient.bulk(req)
    .then(function(resp) {
    }, function(err) {
      console.log('err');
      console.log(err)
    })
  }

  function nextPage() {
    return insertPage(++page, pageSize, pages);
  }

}
