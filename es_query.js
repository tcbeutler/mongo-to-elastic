GET predict/person/_search
{
  "query": {
    "filtered": {
      "filter": {
        "bool": {
          "must": [
            {
              "nested": {
                "path": "recipes",
                "query": {
                  "term": {
                    "recipes.id": 25000
                  }
                }
              }
            },
            {
              "terms": {
                "zip": ["62236","62298","63010","63012","63016","63020","63026","63028","63049","63050","63051","63052","63109","63111","63116","63119","63123","63125","63126","63127","63128","63129"]
              }
            },
            {
              "term": {
                "dns": false
              }
            },
            {
              "term": {
                "holdout": false
              }
            }
          ],
          "must_not": [
            {
              "nested": {
                "path": "lists",
                "query": {
                  "term": {
                    "lists.id": 262
                  }
                }
              }
            }
          ]
        }
      }
    }
  },
  "aggs": {
    "personTypes": {
      "terms": {
        "field": "personTypeId"
      }
    }
  }
}