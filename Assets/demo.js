$(document).ready(function() {
    var timer = 500;
    var destination;
    var conecount = 3
    var drivernumber; 
    var targetConeStr;
    var matchFlag = false;

    var config = {
        apiKey: "AIzaSyBgbVsxVcSiEnm0UEm1fBcW9cTZl_KUgFo",
        authDomain: "carpoolguardian.firebaseapp.com",
        databaseURL: "https://carpoolguardian.firebaseio.com",
        projectId: "carpoolguardian",
        storageBucket: "carpoolguardian.appspot.com",
        messagingSenderId: "594175940867"
      };
      
    firebase.initializeApp(config);

    var database = firebase.database();
    
    //var cone = 1;

    function readDemoFile(e) {

        database.ref("drivers").once("value").then(function(snapshot) {
            ///Kind of doing this backwards - should fix
            if (snapshot.exists) {
                drivernumber = snapshot.numChildren() + 1;
            } else {
                drivernumber = 1;
            }

            /////
            //first we need to see where this driver is going to go - check what cones are open
            //if they can't get into a cone they queue as a driver in the db

            //start by finding the target cone this sets the targetConeStr global
        

            database.ref("cones").once("value").then(function(snapshot) {
                if (snapshot.exists()) {

                    var data = snapshot.val();   
                    var keys = Object.keys(data);

                    // function findCone () {
                    //     if (drivernumber%conecount === 0) {
                    //         targetConeStr = "3";        
                    //     } else {
                    //         targetConeStr = (drivernumber%conecount).toString();
                    //     }
                    //     console.log("TARGETCONE = ", targetConeStr);
                     
                    // };

                    if (keys.includes("3")) {
                        if (drivernumber%conecount === 0) {
                            targetConeStr = "3";        
                        } else {
                            targetConeStr = (drivernumber%conecount).toString();
                        }

                        if (!keys.includes(targetConeStr)) {
                            destination = ("cones/" + targetConeStr)
                        } else {
                            destination = ("drivers/" + drivernumber)
                        }

                    } else if (keys.includes ("2")) {
                        targetConeStr = "3";
                        destination = ("cones/3")
                        //cone = 3;    
                    } else if (keys.includes ("1")) {
                        targetConeStr = "2";
                        destination = ("cones/2")
                        //cone = 2;
                    }
                } else {
                    targetConeStr = "1";
                    destination = ("cones/1")
                    //cone = 1;
                }


                //     var data = snapshot.val();   
                //     var keys = Object.keys(data);

                //     console.log("THESE ARE THE KEYS", keys);

                //     //if the target cone is empty - this driver should be destined for that cone
                //     if (!keys.includes(targetConeStr)) {
                //         destination = ("cones/" + targetConeStr);
                    
                //     } else {
                //         destination = ("drivers/" + drivernumber)
                //     }
                // } else {
                //     //not positive if this should be cone 1 or targetConeStr - cone 1 makes sense
                //     destination = ("cones/" + targetConeStr);
                // }


                //     if (keys.includes("3")) {

                //         destination = ("drivers/" + drivernumber)
                //     } else if (keys.includes ("2")) {
                //         destination = ("cones/3")
                //         //cone = 3;    
                //     } else if (keys.includes ("1")) {
                //         destination = ("cones/2")
                //         //cone = 2;
                //     }
                // } else {
                //     destination = ("cones/1")
                //     //cone = 1;
                // }


                //     data = snapshot.val();   
                //     keys = Object.keys(data);

                //     if (keys.includes("3")) {

                //         destination = ("drivers/" + drivernumber)
                //     } else if (keys.includes ("2")) {
                //         destination = ("cones/3")
                //         //cone = 3;    
                //     } else if (keys.includes ("1")) {
                //         destination = ("cones/2")
                //         //cone = 2;
                //     }
                // } else {
                //     destination = ("cones/1")
                //     //cone = 1;
                // }

                    

                var base64url;

                if(window.FileReader) {
                    var file  = e.target.files[0];
                    var reader = new FileReader();
                    if (file && file.type.match('image.*')) {
                        reader.readAsDataURL(file);

                    } else {

                    }
                    reader.onloadend = function (e) {
                        $("#newimage").attr("src", reader.result);
                        base64url = reader.result.slice(22);
                        
                        //place the base64 image into the db and the desired destination and run faceDetect
                        database.ref(destination).update({
                            image64: base64url
                        }).then(faceDetect(base64url));
                        };
                };


            });
        });
    };

        function getFaceAPIKey() {
        var api_key = "Y7JHwFafWVDhHq_cLOCO-4jOOeu1m2iN";
        return api_key;
    };

    function getFaceAPISecret() {
        var api_secret = "7cwfnSX5J18-iIvegIVcU10jwdR-vNbq";
        return api_secret;
    };

    function faceDetect(image, name) {
        var api_key = getFaceAPIKey();
        var api_secret = getFaceAPISecret();

        //image = imagearr.pop()
        
        var detectQueryURL = "https://api-us.faceplusplus.com/facepp/v3/detect";
        
        $.ajax({
            //async: true,
            url: detectQueryURL,
            method: "POST",
            data: {
                api_key: api_key,
                api_secret: api_secret,
                image_base64: image
            }
        }).done(function(response) {
            var newtoken = response.faces[0].face_token;

            //now that we have the token, for each family...
            database.ref("families").once("value").then(function(familiesSnapshot) {

                familiesSnapshot.forEach(function(familySnapshot) {
                    //finding that I need to add a timer to delay the API - I think face++ is rate limiting
                    setTimeout(function () {
                        familyid = familySnapshot.key;
                        family = familySnapshot.val();
                        pickup = family.pickup;
            
                        var keys = Object.keys(pickup);
                        console.log("keys", keys);
                        
                        //and each pickup person in that family...
                        keys.forEach(function (key) {
                        
                            pickfirstname = pickup[key].firstname;
        
                            picklastname = pickup[key].lastname;
                            picktoken = pickup[key].token;
                            //run the comparison
                            compareFace([newtoken, picktoken], familyid, key);
                            
                        });
                    }, timer += timer)
                });
            }).then(function () {
                database.ref(destination).update({
                    approved: "false"
                })
            })
        });
    };


            // database.ref("cones/" + cone).update({
            //     token: response.faces[0].face_token

            // }).then(
            //     database.ref("cones").once("value"("child_added", function(snapshot) {
            //     })
            // )
            
            
            
     

    function compareFace(tokenarr, familyid, name) {
        //tokenarr = ['3ac5827eda6cffc5817265899a77ade0', 'feffd52e42ef5de30d0a424b2a9776fb']
        //need to compare the two tokens
        if (tokenarr.length > 1) {
            var compareQueryURL = "https://api-us.faceplusplus.com/facepp/v3/compare";
            console.log("What we're comparing", tokenarr, familyid, name);
            $.ajax({
                url: compareQueryURL,
                method: "POST",
                data: {
                    api_key: "Y7JHwFafWVDhHq_cLOCO-4jOOeu1m2iN",
                    api_secret: "7cwfnSX5J18-iIvegIVcU10jwdR-vNbq",
                    face_token1: tokenarr[0],
                    face_token2: tokenarr[1]
                }
            }).done(function(response) {
                //the response contains a confidence level
                var confidence = response.confidence;
                console.log("I have a response on", tokenarr, familyid, name);
                
                //if the confidence level is over 75% we assume a match and tie the stored pickup data to this driver
                if (response.confidence > 75) {
                    console.log("I have a match on", tokenarr, familyid, name);
                    matchFlag = true;

                    var matchfirstname;
                    var matchlastname;
                    var matchmake;
                    var matchmodel;
                    var matchplate;
                    var matchimage64;

                    //I don't think I'm using drivers here - need to check this
                    database.ref("drivers").once("value").then(function(snapshot) {
                        //get the information about the pickup person
                        database.ref("families/" + familyid).once("value").then(function(snapshot) {
                            family = snapshot.val();
                            console.log("FAMILY", familyid);
                            console.log("KEY", name);

                            console.log("FAMILY SNAP", family.pickup);

                            matchfirstname = family.pickup[name].firstname;
                            matchlastname = family.pickup[name].lastname;
                            matchmake = family.pickup[name].make;
                            matchmodel = family.pickup[name].model;
                            matchplate = family.pickup[name].plate;
                            matchimage64 = family.pickup[name].image64;
                            matchchildren = family.children;
                            
                            //and attach it to the driver
                            console.log(drivernumber);
                            database.ref(destination).update({
                                family: familyid,
                                firstname: matchfirstname,
                                lastname: matchlastname,
                                make: matchmake,
                                model: matchmodel,
                                plate: matchplate,
                                image64: matchimage64,
                                children: matchchildren,
                                confidence: confidence,
                                targetCone: targetConeStr,
                                approved: "true"
                            
                            });

                        });
                    });

                    // database.ref("families/" + familyid + "/pickup/" + key).once("value").then(function(snapshot) {
                    //     match = snapshot.val();

                    //     matchfirstname = match.firstname;
                    //     matchlastname = match.lastname;
                    //     matchmake = match.make;
                    //     matchmodel = match.model;
                    //     matchplate = match.plate;
                    //     matchimage64 = match.image64;

                    //     database.ref("cones/1").update({
                    //         family: familyid,
                    //         firstname: matchfirstname,
                    //         lastname: matchlastname,
                    //         make: matchmake,
                    //         model: matchmodel,
                    //         plate: matchplate,
                    //         image64: matchimage64
                    //     });
                    // });
                    
                }
          
            });      
        };
    };   
    
    function coneCheck() {
        //I think a recursive function is right here - couldn't figure it out
        var cone;
        database.ref("cones").once("value").then(function(snapshot) {
            if (snapshot.exists()) {

                data = snapshot.val();   
                keys = Object.keys(data);

                if (keys.includes("3")) {
                    return ("drivers/" + drivernumber)
                } else if (keys.includes ("2")) {
                    return ("cones/3")
                    //cone = 3;    
                } else if (keys.includes ("1")) {
                    return ("cones/2")
                    //cone = 2;
                }
            } else {
                return ("cones/1")
                //cone = 1;
            }
        });
    };

    $(document).on("click", "#uploadbutton", function(){
     
        $("#fileclick").trigger('click');                 
            return false;
    });
    
    $(document).on("change", "#fileclick", readDemoFile);



    // database.ref("cones").on("child_added", function(snapshot) {
    //     var newdriver = snapshot.val();
    //     var newtoken = newdriver.token

    //     console.log("The newdriver", newdriver);
    //     console.log("The newtoken", newtoken);
    
    //     database.ref("families").once("value").then(function(familiesSnapshot) {
    //         familiesSnapshot.forEach(function(familySnapshot) {
    //             familyid = familySnapshot.key;
    //             family = familySnapshot.val();
    //             pickup = family.pickup;
    
    //             var keys = Object.keys(pickup);
    //             console.log("keys", keys);

    //             keys.forEach(function (key) {
                
    //                 pickfirstname = pickup[key].firstname;

    //                 picklastname = pickup[key].lastname;
    //                 picktoken = pickup[key].token;
    //                 console.log("last", picklastname);

    //                 console.log(newtoken, picktoken);
    //                 compareFace([newtoken, picktoken], familyid, key);
                    // compareFace([newtoken, picktoken]).then(function(result) {
                    //     console.log(result);
                    //});

    //             });
    //         });
    //     });
    // });

    // var newtoken = response.faces[0].face_token;

    // //now that we have the token, for each family...
    // database.ref("families").once("value").then(function(familiesSnapshot) {
    //     familiesSnapshot.forEach(function(familySnapshot, index1) {
    //         familyid = familySnapshot.key;
    //         family = familySnapshot.val();
    //         pickup = family.pickup;

    //         var keys = Object.keys(pickup);
    //         setTimeout(function() {
    //             console.log("keys", keys, pickup);
    //             keys.forEach(function (key, index2) {
    //             console.log(key, pickup);
    //             pickfirstname = pickup[key].firstname;

    //             picklastname = pickup[key].lastname;
    //             picktoken = pickup[key].token;
    //             //run the comparison
    //             //compareFace([newtoken, picktoken], familyid, key)
    //             timeout += 1000;
    //             setTimeout(function() {console.log("run timeout", index2)
    //             }, 1000 * index2);
            
    //         }, 1000 * index1);
    //         //and each pickup person in that family...

        //coneChecker();

        // function coneCheck() {
        //     //I think a recursive function is right here - couldn't figure it out
        //     var cone;
        //     database.ref("cones").once("value").then(function(snapshot) {
        //         if (snapshot.exists()) {
    
        //             data = snapshot.val();   
        //             keys = Object.keys(data);
    
        //             if (keys.includes("3")) {
        //                 cone = 0
        //             } else if (keys.includes ("2")) {
        //                 cone = 3;    
        //             } else if (keys.includes ("1")) {
        //                 cone = 2;
        //             }
        //         } else {
        //             cone = 1;
        //         }
        //     });
        // };

});