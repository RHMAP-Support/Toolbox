/* main.js 
 * All calls here are publicly exposed as REST API endpoints. 
*/

/* 'cacheCall' server side REST API method.
 * Example of using $fh.cache, see http://docs.feedhenry.com/wiki/Cache.
 */
exports.cacheCall = function(params, callback) {
    timeLog("in Redis cacheCall()");
    var expireTime = (params.expire !== undefined && params.expire !== "") ? params.expire: 10;
    //var bypass = params.bypass !== undefined ? params.bypass : false;
  
    $fh.cache({act:'load', key: 'time'}, function (err, cachedTime) {
      // Cache does not exist.
      if (err) return callback(err);

      var currentTime = Date.now();
      timeLog("cachedTime: " + cachedTime);

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

exports.redis = function(params, callback) {
    timeLog("in Redis cacheCall()");
    var expireTime = (params.expire !== undefined && params.expire !== "") ? params.expire: 10;
    //var bypass = params.bypass !== undefined ? params.bypass : false;
  
    $fh.cache({act:'load', key: 'time'}, function (err, cachedTime) {
      // Cache does not exist.
      if (err) return callback(err);

      var currentTime = Date.now();
      timeLog("cachedTime: " + cachedTime);

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
  timeLog("in clearCache()");
  $fh.cache({act:'remove', key: 'time'}, function (err, data) {
    callback(err, {data: data});    
  });
};

exports.fhdbCall = function(params, callback) {
  timeLog("In dbCall()");
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
//      timeLog(res);
      callback(undefined, res);
    });
  });   
};

exports.health2 = function(params, callback) {
  // Combination of cachecall and fhdbcall all in one.
  timeLog('---------------------------------------------------------------------------');
  timeLog('Hi!!!!');

//  var ditch_result = checkDitch();
//  timeLog("Ditch is back");
//  timeLog(ditch_result);

  var ditch_result;
  var isTimedOut = true;  // Assume that a timeout is going to happen.

  var timeout = 1000 * 5; // one second = 1000 x 1 ms

/*
  // The isTimedOut variable is set to false in the $fh.db callback to if its true then the callback wasn't reached. 
  setTimeout(function() {
     if (isTimedOut) {
        // The isTimedOut variable is set to false in the $fh.db function below so it is still true after a few seconds then $fh.db hasn't completed.
        timeLog("I can't get to the db, AAAAARGH");
        ditch_result = "Connection to MongoDb via $fh.db timed out after " + timeout + " seconds.";
     }
     else {

     }
   }, timeout);
*/

  timeLog('About to call $fh.db create');
  // Create a temporary entry.
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
    // Callback has been reached, falsify this variable so that the setTimeout above won't do anything.
    isTimedOut = false;
    timeLog("in callback");

    if(err) 
    {
      timeLog('fh.db error');
      ditch_result = err;
    }
    else
    {
      timeLog('fh.db create is ok');
      // Now tidy up and delete the entry.
      timeLog("deleting " + res.guid);

      $fh.db({
        "act" : "delete",
        "type" : "ToolboxDitchTest",
        // Add some extra chars to the guid to generate an error.
        "guid" : res.guid
      }, function(err, data){
        // Currently, this callback is not reached if an error is thrown.
        timeLog("returned from delete");
        timeLog("data is " + JSON.stringify(data))
        if(err)
        {
          timeLog("err - " + err);
          ditch_result = err;
        
          ditch_result = ditch_result + String.fromCharCode(13) + "DITCH HOST -> " + process.env.FH_DITCH_HOST || "";
          ditch_result = ditch_result + String.fromCharCode(13) + "DITCH PORT -> " + process.env.FH_DITCH_PORT || "";
        }
        else
        {
          timeLog("ok");
          ditch_result = "ditch is ok"
        }
        timeLog(ditch_result);
      });
    }
  })

  // Now the Redis check.

  timeLog("now for redis");
  var redis_result = {};
/*
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
       timeLog("cachedTime: " + cachedTime);

       if (cachedTime === undefined || cachedTime === null || (parseInt(cachedTime) + (expireTime * 1000)) < currentTime) {
          $fh.cache(
                    {
                      act: 'save', 
                      key: 'time', 
                      value: JSON.stringify(currentTime), expire: expireTime
                    }, function (err) {          
                      redis_result = err;
                      redis_result = redis_result + String.fromCharCode(13) + "REDIS HOST -> " + process.env.FH_REDIS_HOST || "";
                      redis_result = redis_result + String.fromCharCode(13) + "REDIS PORT -> " + process.env.FH_REDIS_PORT || "";
                    }
                    );
      }
    }
  })
*/
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

};

exports.health = function(params, callback) {
//  var html = "<div><p>Everything is Fiiiiiiine.</p></div>";

//  return callback(undefined, html, {'Content-Type' : 'text/html'});
  return callback(undefined, 'Everything fine');
};

function checkDitch() {
  var ditch_result;
  var isTimedOut = true;  // Assume that a timeout is going to happen.

  var timeout = 1000 * 5; // one second = 1000 x 1 ms
  setTimeout(function() {
     if (isTimedOut) {
        // The isTimedOut variable is set to false in the $fh.db function below so it is still true after a few seconds then $fh.db hasn't completed.
        timeLog("I can't get to the db, AAAAARGH");
        timeLog("returning");
        return("Cannot access MongoDb via $fh.db after " + timeout + " seconds");
        timeLog("I have not returned");
     }
     else {

     }
   }, timeout);

  timeLog('About to call $fh.db create');
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
    isTimedOut = false;
    if(err) 
    {
      timeLog('fh.db error');
      ditch_result = err;
    }
    else
    {
      timeLog('fh.db create is ok');
      $fh.db({
        "act" : "read",
        "type" : "ToolboxDitchTest",
        "guid" : res.guid
      }, function(err, res){
        if(err) 
        {
          ditch_result = err;
        
          ditch_result = ditch_result + String.fromCharCode(13) + "DITCH HOST -> " + process.env.FH_DITCH_HOST || "";
          ditch_result = ditch_result + String.fromCharCode(13) + "DITCH PORT -> " + process.env.FH_DITCH_PORT || "";
        }
        else
        {
          ditch_result = "ditch is ok"
        }
      });
    }
    timeLog(ditch_result);
    return(ditch_result);
  })
};

function timeLog(statement) {
    var date = new Date();

    var hour = date.getHours(); 
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    console.log(year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec + " --- " + statement);
};