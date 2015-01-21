var MongoClient = require('mongodb').MongoClient;
var Promise = require('bluebird');
var _ = require('lodash');
var es = require('elasticsearch');
var personMapper = require('./personMapper')

var mongoUrl = "mongodb://localhost:27017/predict"
var mongoCollection = "persons_southeast"
var esClient = es.Client({
  host: 'localhost:9200',
  //log: 'trace'
});

var mongoClient;
var PAGESIZE = 1000;

var CLIENTKEY = 'southeast';

connect(mongoUrl)
.then(function(db) {
  mongoClient = db;
  insertPage(0, PAGESIZE);
});

function connect(mongoUrl) {
  return new Promise(function (resolve, reject) {
    MongoClient.connect(mongoUrl, function (err, db) {
      if (err)
        return reject(err);

      return resolve(db);
    });
  });
}

function insertPage(page, pageSize, pages) {
  
  if (page > pages) process.exit();
  console.log('Inserting page %d/%d', page, pages ? pages : 0);

  checkPaging()
  .then(allPersons)
  .then(mapToElasticFormat)
  .then(createBulkReq)
  .then(sendReq)
  .then(nextPage)

  function checkPaging() {
    return new Promise(function(resolve, reject) {
      if (pages) return resolve(cnt);
      var cnt = mongoClient.collection(mongoCollection)
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
      mongoClient.collection(mongoCollection)
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
      req.body.push({ "create": { "_index": CLIENTKEY, "_type": "person", "_id": person._id }});
      req.body.push(person);
    });
    return req;
  }

  function sendReq(req) {

    return esClient.bulk(req)
    .then(function(resp) {
      var responses = _.pluck(resp.items, 'create');
      _.each(responses, function(createResult) {
        if (createResult.status != 201) {
          console.log('ERROR DURING CREATE');
          console.log(createResult);
        }
      })
    }, function(err) {
      console.log('err');
      console.log(err)
    })
  }

  function nextPage() {
    return insertPage(++page, pageSize, pages);
  }

}
