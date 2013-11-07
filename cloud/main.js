/* main.js 
 * All calls here are publicly exposed as REST API endpoints. 
*/

/* 'cacheCall' server side REST API method.
 * Example of using $fh.cache, see http://docs.feedhenry.com/wiki/Cache.
 */
exports.cacheCall = function(params, callback) {
    console.log("in Redis cacheCall()");
    var expireTime = (params.expire !== undefined && params.expire !== "") ? params.expire: 10;
    //var bypass = params.bypass !== undefined ? params.bypass : false;
  
    $fh.cache({act:'load', key: 'time'}, function (err, cachedTime) {
      // Cache does not exist.
      if (err) return callback(err);

      var currentTime = Date.now();
      console.log("cachedTime: " + cachedTime);

      if (cachedTime === undefined || cachedTime === null || (parseInt(cachedTime) + (expireTime * 1000)) < currentTime) {
        $fh.cache({
          act: 'save', 
          key: 'time', 
          value: JSON.stringify(currentTime), expire: expireTime
        }, function (err) {          
          var dt = new Date(parseInt(currentTime));
          return callback(err, {data: {time: dt, cached: false}});
        });
      } else {
        var dt = new Date(parseInt(cachedTime));
        return callback(undefined, {data: {time: dt, cached: true}});
      }
    });
};

exports.clearCache = function(params, callback) {
  console.log("in clearCache()");
  $fh.cache({act:'remove', key: 'time'}, function (err, data) {
    callback(err, {data: data});    
  });
};

exports.fhdbCall = function(params, callback) {
  console.log("In dbCall()");
  $fh.db({
      "act" : "create",
      "type" : "ToolboxDitchTest",
      "fields" : {
        "firstName" : "Jim",
        "lastName" : "Feedhenry",
        "address1" : "22 FeedHenry Road",
        "address2" : "Henrytown",
        "country" : "Henryland",
       "phone" : "555-123456"
      }
  }, function(err, res){
    if(err) return callback(err);
    $fh.db({
      "act" : "read",
      "type" : "ToolboxDitchTest",
      "guid" : res.guid
    }, function(err, res){
      if(err) return callback(err);
//      console.log(res);
      callback(undefined, res);
    });
  });   
};

exports.health2 = function(params, callback) {
  // Combination of cachecall and fhdbcall all in one.
  console.log('---------------------------------------------------------------------------');
  var date = new Date();
  console.log(date.toString());
  var ditch_result = {};

  $fh.db({
      "act" : "create",
      "type" : "ToolboxDitchTest",
      "fields" : {
        "firstName" : "Jim",
        "lastName" : "Feedhenry",
        "address1" : "22 FeedHenry Road",
        "address2" : "Henrytown",
        "country" : "Henryland",
       "phone" : "555-123456"
      }
  }, function(err, res){
    if(err) 
    {
      ditch_result = err;
    }
    else
    {
      $fh.db({
        "act" : "read",
        "type" : "ToolboxDitchTest",
        "guid" : res.guid
      }, function(err, res){
        if(err) 
        {
          ditch_result = err;
        }
        else
        {
          ditch_result = "ok"
        }
        //console.log(res);
      });
    }

    // Now the Redis check.
    var redis_result = {};

    var expireTime = (params.expire !== undefined && params.expire !== "") ? params.expire: 10;
    //var bypass = params.bypass !== undefined ? params.bypass : false;
  
    $fh.cache({act:'load', key: 'time'}, function (err, cachedTime) {
      // Cache does not exist.
      if (err) 
      {
        redis_result = err;
      }
      else
      {
         var currentTime = Date.now();
         console.log("cachedTime: " + cachedTime);

         if (cachedTime === undefined || cachedTime === null || (parseInt(cachedTime) + (expireTime * 1000)) < currentTime) {
            $fh.cache(
                      {
                        act: 'save', 
                        key: 'time', 
                        value: JSON.stringify(currentTime), expire: expireTime
                      }, function (err) {          
                        redis_result = err;
                      }
                      );
        } 
    }});

    var return_status, return_message;
    if (!redis_result=={} || !ditch_result=={})
    {
        return_status = "crit";
        return_message=redis_result + "; " + ditch_result;
    }
    else
    {
        return_status = "ok";
        return_message="Everything is operating normally";      
    }

    callback(undefined, {"status":return_status, "message":return_message});
  });   
}

exports.health = function(params, callback) {
//  var html = "<div><p>Everything is Fiiiiiiine.</p></div>";

//  return callback(undefined, html, {'Content-Type' : 'text/html'});
  return callback(undefined, 'Everything fine');
};