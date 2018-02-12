$(document).ready(function() {

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

    var id = sessionStorage.getItem("familyid");
    console.log("ID", id);

    var students = [];



    function Student () {

        this.firstname;
        this.lastname;
        this.age;
        this.grade;
        this.teacher;
        this.econtact = {firstname: "", lastname: "", number: ""};
        this.image;
    }

    function getChild() {
        database.ref("families/" + id + "/children").once("value").then(function (snapshot) {
            $("#student-panel").empty();
            snapshot.forEach(function(childSnapshot) {
                //the child's firstname is the key - calling addStudent to add them
                addStudent(childSnapshot.key);
            })
        })
    };

    function getPickup() {
        database.ref("families/" + id + "/pickup").once("value").then(function (snapshot) {
            $("#pickup-panel").empty();
            snapshot.forEach(function(childSnapshot) {
                //the child's firstname is the key - calling addStudent to add them
                addPickup(childSnapshot.key);
            })
        })
    };

    function newStudent() {
        
        var newname = "newstudent"  //newstudent will temporarily be used as the id for the divs
        
        //Create the new student HTML and place it on the page
        var studentpanel = $("#student-panel");
        var studentdiv = $("<div>");
        studentdiv.addClass("col-md-4");
        studentdiv.addClass("student-area");
        studentdiv.attr("id", newname);
        
            var panel = $("<div>");
            panel.addClass("panel panel-default");
            studentdiv.append(panel);

                var head = $("<div>");
                head.addClass("panel heading customheadheight");
                panel.append(head);

                    var headfirst = $("<input>");
                    headfirst.addClass("form-control");
                    headfirst.attr("id", newname + "-firstname");
                    headfirst.attr("type", "text");
                    headfirst.attr("placeholder", "Enter Firstname");
                    head.append(headfirst);

                    var headlast = $("<input>");
                    headlast.addClass("form-control");
                    headlast.attr("id", newname + "-lastname")
                    headlast.attr("type", "text");
                    headlast.attr("placeholder", "Enter Lastname");
                    head.append(headlast);

                var panelbody = $("<div>");
                panelbody.addClass("panel-body");
                panel.append(panelbody);

            
                    var studentinfo = $("<div>");
                    studentinfo.addClass("col-md-7");
                    panelbody.append(studentinfo);

                        var studentinfolist = $("<dl>");
                        studentinfo.append(studentinfolist);

                            var gradetitle = $("<dt>");
                            gradetitle.text("Grade");
                            studentinfolist.append(gradetitle);
                            var gradedesc = $("<input>");
                            gradedesc.addClass("form-control")
                            gradedesc.attr("type", "text");
                            gradedesc.attr("id", newname + "-gradeinput");
                            gradedesc.attr("placeholder", "Enter Grade Level");                      
                            studentinfolist.append(gradedesc);

                            var teachertitle = $("<dt>");
                            teachertitle.text("Teacher");
                            studentinfolist.append(teachertitle);
                            var teacherdesc = $("<input>");
                            teacherdesc.addClass("form-control")
                            teacherdesc.attr("type", "text");
                            teacherdesc.attr("id", newname + "-teacherinput");
                            teacherdesc.attr("placeholder", "Enter Teacher Name");   
                            studentinfolist.append(teacherdesc);

                            var agetitle = $("<dt>");
                            agetitle.text("Age");
                            studentinfolist.append(agetitle);
                            var agedesc = $("<input>");
                            agedesc.addClass("form-control")
                            agedesc.attr("type", "text");
                            agedesc.attr("id", newname + "-ageinput");
                            agedesc.attr("placeholder", "Enter Child's Age"); 
                            studentinfolist.append(agedesc);

                    var imagearea = $("<div>");
                    imagearea.addClass("col-md-5");
                    panelbody.append(imagearea);


                        var form = $("<form>")
                        imagearea.append(form);

                            var uploadbutton = $("<input>");
                            uploadbutton.addClass("btn btn-default pickupimageupload");
                            uploadbutton.attr("id", newname + "-uploadbutton");
                            uploadbutton.attr("type", "button");
                            uploadbutton.attr("value", "Upload Image");
                            form.append(uploadbutton);

                            var fileclick = $("<input>");
                            fileclick.addClass("btn btn-success");
                            fileclick.attr("id", newname + "-fileclick");
                            fileclick.attr("type", "file");
                            fileclick.attr("style", "display:none");
                            form.append(fileclick);

                            var image = $("<img>");
                            image.addClass("editimg");
                            image.attr("id", newname + "-image");
                            image.attr("src", '');
                            imagearea.append(image);
                    

                var foot = $("<div>");
                foot.addClass("panel-footer");
                panel.append(foot);

                    

                    var button = $("<button>");
                    button.addClass("btn btn-primary newchildsave");
                    button.attr("type", "submit");
                    button.text("Save");
                    foot.append(button);

        studentpanel.append(studentdiv)

        //When the upload button is pressed we get the file
        $(document).on("click", "#" + newname + "-uploadbutton", function(){
          
            $("#" + newname + "-fileclick").trigger('click');                 
                return false;
        });
        
        //And trigger for that file to be fed into the readFile func
        //Readfile will temporarily store a version of the image in firebase as base64 and print a version to the screen
        $(document).on("change", "#" + newname + "-fileclick", readStudentFile);

        //When the save button is clicked, we take the image64 string from the temp firebase
        //And create a new child for this student, storing that image64 and any other values there
        $(document).on("click", ".newchildsave", function () {
            event.preventDefault();
    
            var newstudent = $("#newstudent-firstname")
            var firstname = newstudent.val().trim();
    
            newstudent.attr("id", firstname);

            //Horrible - need to ask about a better way
            database.ref("families/" + id + "/children/" + newname + "/image64").once("value").then(function(snapshot) {
                var image64 = snapshot.val()
                
                if (snapshot.exists()) {
                    
                    database.ref("families/" + id + "/children/" + firstname).set({
                        firstname: firstname,
                        lastname: $("#newstudent-lastname").val().trim(),
                        grade: $("#newstudent-gradeinput").val().trim(),
                        teacher: $("#newstudent-teacherinput").val().trim(),
                        age: $("#newstudent-ageinput").val().trim(),
                        image64: image64
                    }).then(database.ref("families/" + id + "/children/" + newname).remove())

                    //At this point the child has been added to firebase
                    //The last thing we need to do is remove the newchild panel and replace it with the regular panel
                    
                    //getChild should just get ever
                    getChild();

                }
            });

        


         
    
            // database.ref("families/0/children/" + firstname).set({
            //     firstname: firstname,
            //     lastname: $("#newstudent-lastname").val().trim(),
            //     grade: $("#newstudent-gradeinput").val().trim(),
            //     teacher: $("#newstudent-teacherinput").val().trim(),
            //     age: $("#newstudent-ageinput").val().trim()
            // });
    
            //newStudent(firstname);
        })
        
    };
    function addStudent(studentfirst) {

        database.ref("families/" + id + "/children/" + studentfirst).once("value").then(function (snapshot) {
            student = snapshot.val();
            var studentpanel = $("#student-panel");

            var studentdiv = $("<div>");
            studentdiv.addClass("col-md-4");
            studentdiv.addClass("student-area");
            studentdiv.attr("id", student.firstname);

                var panel = $("<div>");
                panel.addClass("panel panel-default");
                studentdiv.append(panel);

                    var head = $("<div>");
                    head.addClass("panel heading customheadheight");
                    panel.append(head);

                        var headtext = $("<h4>");
                        headtext.addClass("panel-heading");
                        headtext.text(student.firstname + " " + student.lastname);
                        head.append(headtext);

                    var panelbody = $("<div>");
                    panelbody.addClass("panel-body");
                    panel.append(panelbody);

                   

                        var studentinfo = $("<div>");
                        studentinfo.addClass("col-md-5");
                        panelbody.append(studentinfo);

                            var studentinfolist = $("<dl>");
                            studentinfo.append(studentinfolist);

                                var gradetitle = $("<dt>");
                                gradetitle.text("Grade");
                                studentinfolist.append(gradetitle);
                                var gradedesc = $("<dd>");
                                gradedesc.addClass("childdata");
                                gradedesc.text(student.grade);
                                studentinfolist.append(gradedesc);

                                var teachertitle = $("<dt>");
                                teachertitle.text("Teacher");
                                studentinfolist.append(teachertitle);
                                var teacherdesc = $("<dd>");
                                teacherdesc.addClass("childdata");
                                teacherdesc.text(student.teacher);
                                studentinfolist.append(teacherdesc);

                                var agetitle = $("<dt>");
                                agetitle.text("Age");
                                studentinfolist.append(agetitle);
                                var agedesc = $("<dd>");
                                agedesc.addClass("childdata");
                                agedesc.text(student.age);
                                studentinfolist.append(agedesc);

                        var imagearea = $("<div>");
                        imagearea.addClass("col-md-7");
                        panelbody.append(imagearea);

                            var image = $("<img>");
                            image.attr("src", "data:image/png;base64," + student.image64);
                            imagearea.append(image);

                    var foot = $("<div>");
                    foot.addClass("panel-footer");
                    panel.append(foot);

                        var button = $("<button>");
                        button.addClass("btn btn-primary childedit");
                        button.attr("type", "submit");
                        button.text("Edit");
                        foot.append(button);
            
            studentpanel.append(studentdiv);
        });           
    };
    function newPickup() {
        
        var newname = "newpickup"  //newstudent will temporarily be used as the id for the divs
        
        //Create the new student HTML and place it on the page
        var pickuppanel = $("#pickup-panel");
        var pickupdiv = $("<div>");
        pickupdiv.addClass("col-md-4");
        pickupdiv.addClass("pickup-area");
        pickupdiv.attr("id", newname);
        
            var panel = $("<div>");
            panel.addClass("panel panel-default");
            pickupdiv.append(panel);

                var head = $("<div>");
                head.addClass("panel heading customheadheight");
                panel.append(head);

                    var headfirst = $("<input>");
                    headfirst.addClass("form-control");
                    headfirst.attr("id", newname + "-firstname");
                    headfirst.attr("type", "text");
                    headfirst.attr("placeholder", "Enter Firstname");
                    head.append(headfirst);

                    var headlast = $("<input>");
                    headlast.addClass("form-control");
                    headlast.attr("id", newname + "-lastname")
                    headlast.attr("type", "text");
                    headlast.attr("placeholder", "Enter Lastname");
                    head.append(headlast);

                var panelbody = $("<div>");
                panelbody.addClass("panel-body");
                panel.append(panelbody);

            
                    var pickupinfo = $("<div>");
                    pickupinfo.addClass("col-md-7");
                    panelbody.append(pickupinfo);

                        var pickupinfolist = $("<dl>");
                        pickupinfo.append(pickupinfolist);

                            var maketitle = $("<dt>");
                            maketitle.text("Vehicle Make");
                            pickupinfolist.append(maketitle);
                            var makedesc = $("<input>");
                            makedesc.addClass("form-control")
                            makedesc.attr("type", "text");
                            makedesc.attr("id", newname + "-makeinput");
                            makedesc.attr("placeholder", "Enter Vehicle Make");                      
                            pickupinfolist.append(makedesc);

                            var modeltitle = $("<dt>");
                            modeltitle.text("Model");
                            pickupinfolist.append(modeltitle);
                            var modeldesc = $("<input>");
                            modeldesc.addClass("form-control")
                            modeldesc.attr("type", "text");
                            modeldesc.attr("id", newname + "-modelinput");
                            modeldesc.attr("placeholder", "Enter Vehicle Model");   
                            pickupinfolist.append(modeldesc);

                            var platetitle = $("<dt>");
                            platetitle.text("Plate");
                            pickupinfolist.append(platetitle);
                            var platedesc = $("<input>");
                            platedesc.addClass("form-control")
                            platedesc.attr("type", "text");
                            platedesc.attr("id", newname + "-plateinput");
                            platedesc.attr("placeholder", "Enter Vehicle Plate ID"); 
                            pickupinfolist.append(platedesc);

                    var imagearea = $("<div>");
                    imagearea.addClass("col-md-5");
                    panelbody.append(imagearea);


                        var form = $("<form>")
                        imagearea.append(form);

                            var uploadbutton = $("<input>");
                            uploadbutton.addClass("btn btn-default pickupimageupload");
                            uploadbutton.attr("id", newname + "-uploadbutton");
                            uploadbutton.attr("type", "button");
                            uploadbutton.attr("value", "Upload Image");
                            form.append(uploadbutton);

                            var fileclick = $("<input>");
                            fileclick.addClass("btn btn-success");
                            fileclick.attr("id", newname + "-fileclick");
                            fileclick.attr("type", "file");
                            fileclick.attr("style", "display:none");
                            form.append(fileclick);

                            var image = $("<img>");
                            image.addClass("editimg");
                            image.attr("id", newname + "-image");
                            image.attr("src", '');
                            imagearea.append(image);
                    

                var foot = $("<div>");
                foot.addClass("panel-footer");
                panel.append(foot);

                    

                    var button = $("<button>");
                    button.addClass("btn btn-primary newpickupsave");
                    button.attr("type", "submit");
                    button.text("Save");
                    foot.append(button);

        pickuppanel.append(pickupdiv);

        //When the upload button is pressed we get the file
        $(document).on("click", "#" + newname + "-uploadbutton", function(){
          
            $("#" + newname + "-fileclick").trigger('click');                 
                return false;
        });
        
        //And trigger for that file to be fed into the readFile func
        //Readfile will temporarily store a version of the image in firebase as base64 and print a version to the screen
        $(document).on("change", "#" + newname + "-fileclick", readPickupFile);

        //When the save button is clicked, we take the image64 string from the temp firebase
        //And create a new child for this student, storing that image64 and any other values there
        $(document).on("click", ".newpickupsave", function () {
            event.preventDefault();
    
            var newpickup = $("#newpickup-firstname")
            var firstname = newpickup.val().trim();
            
            //Overwrite the newpickup top element with the name
            newpickup.attr("id", firstname);


            //Horrible - need to ask about a better way
            database.ref("families/" + id + "/pickup/" + newname + "/image64").once("value").then(function(snapshot) {
      
                var image64 = snapshot.val()
                
                
                if (snapshot.exists()) {
                    
                    database.ref("families/" + id + "/pickup/" + firstname).set({
                        firstname: firstname,
                        lastname: $("#newpickup-lastname").val().trim(),
                        make: $("#newpickup-makeinput").val().trim(),
                        model: $("#newpickup-modelinput").val().trim(),
                        plate: $("#newpickup-plateinput").val().trim(),
                        image64: image64,
                    }).then(database.ref("families/" + id + "/pickup/" + newname).remove())
                      .then(faceDetect(image64, firstname));

                    //At this point the child has been added to firebase
                    //The last thing we need to do is remove the newchild panel and replace it with the regular panel
                    
                    //getChild should just get ever
                    getPickup();

                }
            });

        


         
    
            // database.ref("families/0/children/" + firstname).set({
            //     firstname: firstname,
            //     lastname: $("#newstudent-lastname").val().trim(),
            //     grade: $("#newstudent-gradeinput").val().trim(),
            //     teacher: $("#newstudent-teacherinput").val().trim(),
            //     age: $("#newstudent-ageinput").val().trim()
            // });
    
            //newStudent(firstname);
        })
        
    };
    function addPickup(pickupfirst) {

        database.ref("families/" + id + "/pickup/" + pickupfirst).once("value").then(function (snapshot) {
            pickup = snapshot.val();
            var pickuppanel = $("#pickup-panel");

            var pickupdiv = $("<div>");
            pickupdiv.addClass("col-md-4");
            pickupdiv.addClass("pickup-area");
            pickupdiv.attr("id", pickup.firstname);

                var panel = $("<div>");
                panel.addClass("panel panel-default");
                pickupdiv.append(panel);

                    var head = $("<div>");
                    head.addClass("panel heading customheadheight");
                    panel.append(head);

                        var headtext = $("<h4>");
                        headtext.addClass("panel-heading");
                        headtext.text(pickup.firstname + " " + pickup.lastname);
                        head.append(headtext);

                    var panelbody = $("<div>");
                    panelbody.addClass("panel-body");
                    panel.append(panelbody);

                   

                        var pickupinfo = $("<div>");
                        pickupinfo.addClass("col-md-5");
                        panelbody.append(pickupinfo);

                            var pickupinfolist = $("<dl>");
                            pickupinfo.append(pickupinfolist);

                                var maketitle = $("<dt>");
                                maketitle.text("Make");
                                pickupinfolist.append(maketitle);
                                var makedesc = $("<dd>");
                                makedesc.addClass("pickupdata");
                                makedesc.text(pickup.make);
                                pickupinfolist.append(makedesc);

                                var modeltitle = $("<dt>");
                                modeltitle.text("Model");
                                pickupinfolist.append(modeltitle);
                                var modeldesc = $("<dd>");
                                modeldesc.addClass("pickupdata");
                                modeldesc.text(pickup.model);
                                pickupinfolist.append(modeldesc);

                                var platetitle = $("<dt>");
                                platetitle.text("Plate");
                                pickupinfolist.append(platetitle);
                                var platedesc = $("<dd>");
                                platedesc.addClass("pickupdata");
                                platedesc.text(pickup.plate);
                                pickupinfolist.append(platedesc);

                        var imagearea = $("<div>");
                        imagearea.addClass("col-md-7");
                        panelbody.append(imagearea);

                            var image = $("<img>");
                            image.attr("src", "data:image/png;base64," + pickup.image64);
                            imagearea.append(image);

                    var foot = $("<div>");
                    foot.addClass("panel-footer");
                    panel.append(foot);

                        var button = $("<button>");
                        button.addClass("btn btn-primary pickupedit");
                        button.attr("type", "submit");
                        button.text("Edit");
                        foot.append(button);
            
            pickuppanel.append(pickupdiv);


        });      

    

        //console.log(student);

        //students.push(student);
        
    };

    function newFamily() {

        $("#familyid").text("Family ID: " + id);
    }


    function initStudent(studentsarr) {

        for (var i=0; i<studentsarr.length; i++) {
            var student = new Student();
            student.firstname = studentsarr[i][0];
            student.lastname = studentsarr[i][1];
            student.age = studentsarr[i][2];
            student.grade = studentsarr[i][3];
            student.teacher = studentsarr[i][4];
            student.econtact.firstname = studentsarr[i][5];
            student.econtact.lastname = studentsarr[i][6];
            student.econtact.number = studentsarr[i][7];
            student.image64 = (studentsarr[i][8]);

    

            database.ref("families/" + id + "/children").child(student.firstname).set(student)
                    .then(addStudent(student));
        }

    };

    function editStudent(studentfirst) {

        database.ref("families/" + id + "/children/" + studentfirst).once("value").then(function (snapshot) {
            student = snapshot.val()

            var studentdiv = $("#" + studentfirst);
            
            var panel = $("<div>");
            panel.addClass("panel panel-default");
            studentdiv.append(panel);

                var head = $("<div>");
                head.addClass("panel heading customheadheight");
                panel.append(head);

                    var headfirst = $("<input>");
                    headfirst.addClass("form-control");
                    headfirst.attr("type", "text");
                    headfirst.attr("placeholder", student.firstname);
                    head.append(headfirst);

                    var headlast = $("<input>");
                    headlast.addClass("form-control");
                    headlast.attr("type", "text");
                    headlast.attr("placeholder", student.lastname);
                    head.append(headlast);

                var panelbody = $("<div>");
                panelbody.addClass("panel-body");
                panel.append(panelbody);

            
                    var studentinfo = $("<div>");
                    studentinfo.addClass("col-md-7");
                    panelbody.append(studentinfo);

                        var studentinfolist = $("<dl>");
                        studentinfo.append(studentinfolist);

                            var gradetitle = $("<dt>");
                            gradetitle.text("Grade");
                            studentinfolist.append(gradetitle);
                            var gradedesc = $("<input>");
                            gradedesc.addClass("form-control")
                            gradedesc.attr("type", "text");
                            gradedesc.attr("id", student.firstname + "-gradeinput");
                            gradedesc.attr("placeholder", student.grade);                      
                            studentinfolist.append(gradedesc);

                            var teachertitle = $("<dt>");
                            teachertitle.text("Teacher");
                            studentinfolist.append(teachertitle);
                            var teacherdesc = $("<input>");
                            teacherdesc.addClass("form-control")
                            teacherdesc.attr("type", "text");
                            teacherdesc.attr("id", student.firstname + "-teacherinput");
                            teacherdesc.attr("placeholder", student.teacher);   
                            studentinfolist.append(teacherdesc);

                            var agetitle = $("<dt>");
                            agetitle.text("Age");
                            studentinfolist.append(agetitle);
                            var agedesc = $("<input>");
                            agedesc.addClass("form-control")
                            agedesc.attr("type", "text");
                            agedesc.attr("id", student.firstname + "-ageinput");
                            agedesc.attr("placeholder", student.age); 
                            studentinfolist.append(agedesc);

                    var imagearea = $("<div>");
                    imagearea.addClass("col-md-5");
                    panelbody.append(imagearea);

                        var image = $("<img>");
                        image.addClass("editimg");
                        image.attr("id", student.firstname + "-image");
                        image.attr("src", student.image64);
                        imagearea.append(image);

                        var upload = $("<button>");
                        upload.addClass("btn btn-default childimageupload");
                        upload.attr("type", "submit");
                        upload.text("Upload Image");
                        imagearea.append(upload);

                var foot = $("<div>");
                foot.addClass("panel-footer");
                panel.append(foot);

                    var button = $("<button>");
                    button.addClass("btn btn-primary childsave");
                    button.attr("type", "submit");
                    button.text("Save");
                    foot.append(button);
        
        });
     

        
    };
 
    function readStudentFile(e) {
        var studentfirst = $(this).attr("id").slice(0, -10);
        var base64url;
     
        if(window.FileReader) {
          var file  = e.target.files[0];
          var reader = new FileReader();
          if (file && file.type.match('image.*')) {
            reader.readAsDataURL(file);

          } else {
            $("#" + studentfirst + "-image").css('display', 'none');
            img.attr('src', '');
          }
          reader.onloadend = function (e) {
            $("#" + studentfirst + "-image").attr("src", reader.result);
            base64url = reader.result.slice(22);
            
            database.ref("families/" + id + "/children/" + studentfirst).update({
                image64: base64url

            })
          }
        }   
    };

    function readPickupFile(e) {
        var pickupfirst = $(this).attr("id").slice(0, -10);
        var base64url;
     
        if(window.FileReader) {
          var file  = e.target.files[0];
          var reader = new FileReader();
          if (file && file.type.match('image.*')) {
            reader.readAsDataURL(file);

          } else {
            $("#" + pickupfirst + "-image").css('display', 'none');
            img.attr('src', '');
          }
          reader.onloadend = function (e) {
            $("#" + pickupfirst + "-image").attr("src", reader.result);
            base64url = reader.result.slice(22);
            
            database.ref("families/" + id + "/pickup/" + pickupfirst).update({
                image64: base64url

            })
          }
        }   
    };

    ///////////////////////////////////////
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
            database.ref("families/" + id + "/pickup/" + name).update({
                token: response.faces[0].face_token
            })
            
            
        });
    };

    ///////////////////////////////////////////////////////
    function getWeather() {

        database.ref("weather").once("value").then(function(snapshot) {

            var data = snapshot.val();
            var storedtime = data.storedtime;

            var timenow = moment().unix();
    
            //the weather api docs say that you can't call the api more than once ever 4 hours
            //so we store the weather data into firebase along with a timestamp - then we check if 4 hours has lapsed
            if ((storedtime-timenow) < 0) {
                console.log("GETTING THE WEATHER")
                var key = 'bd5bfbc8a6860c03d4fa7bda85bbd629';
  
                 queryurl = "https://api.openweathermap.org/data/2.5/forecast?zip=28209&units=imperial&appid=" + key,

                $.ajax({ 
                    url : queryurl,
                    method : "GET"
                }).done(function(response) {
                    

                    var weathericon = $("<img>");
                    var iconurl = "http://openweathermap.org/img/w/" + response.list[0].weather[0].icon +".png"
                    var temp = response.list[0].main.temp 
                    var newstoredtime = moment().add(4, 'hours').unix();

                    database.ref("weather").update({
                        iconurl: "http://openweathermap.org/img/w/" + response.list[0].weather[0].icon +".png",
                        temp: response.list[0].main.temp, 
                        storedtime: newstoredtime
                    }).then(showWeather());
                });
            } else {
                showWeather();
            }        
        });
    };

    function showWeather() {

        database.ref("weather").once("value").then(function(snapshot) {

            var data = snapshot.val();

            var temp = data.temp;
            var iconurl = data.iconurl;

            var weather = $("#weather");

            var weathericonspan = $("<span>");
            weather.append(weathericonspan);

            var weathericon = $("<img>");
            weathericon.attr("src", iconurl);
            weathericon.attr("alt", "weathericon");
            weathericonspan.append(weathericon);

            var weathertemp = $("<span>");
            weathertemp.text(temp + String.fromCharCode(176));
            weather.append(weathertemp);
        });
    }

    ///////////////////////////////////////////////////////
    $(document).on("click", "#childadd", function() {
        event.preventDefault();

        newStudent();
    });

    $(document).on("click", "#pickupadd", function() {
        event.preventDefault();

        newPickup();
    });


    $(document).on("click", ".childedit", function() {
        event.preventDefault();

        var studentarea = $(this).parentsUntil("#student-panel")
        //Ugly - can't figure out how to not use an index
        //Goes down into the index of student area to find the student first name id div
        var studentid = $(studentarea[2]).attr("id")

        studentarea.empty();

        editStudent(studentid); //students firstname
    });

    $(document).on("click", ".childsave", function(event) {
        event.preventDefault();


        var studentarea = $(this).parentsUntil("#student-panel")
        var studentid = $(studentarea[2]).attr("id")


        test = $("#" + studentid + "-gradeinput").val().trim();

        database.ref("families/" + id + "/children/" + studentid).update({
            grade: $("#" + studentid + "-gradeinput").val().trim(),
            teacher: $("#" + studentid + "-teacherinput").val().trim(),
            age: $("#" + studentid + "-ageinput").val().trim()
        });
    });

    $(document).on("click", ".pickupsave", function(event) {
        event.preventDefault();

        var pickuparea = $(this).parentsUntil("#pickup-panel")
        var pickupid = $(pickuparea[2]).attr("id")

        database.ref("families/" + id + "/pickup/" + pickupid).update({
            make: $("#" + pickupid + "-makeinput").val().trim(),
            model: $("#" + pickupid + "-modelinput").val().trim(),
            plate: $("#" + pickupid + "-plateinput").val().trim()
        });
    });

    //file upload button
    $(document).on("click", ".childimageupload", function(){


        
        var studentarea = $(this).parentsUntil("#student-panel")
        var studentid = $(studentarea[2]).attr("id")

        $('.fileclick').trigger('click');                 
            return false;
    });

    $(document).on("click", ".pickupimageupload", function(){


        
        var pickuparea = $(this).parentsUntil("#pickup-panel")
        var pickupid = $(pickuparea[2]).attr("id")

        $('.fileclick').trigger('click');                 
            return false;
    });

    $(document).on("change", ".fileclick", readStudentFile);
    $(document).on("change", ".fileclick", readPickupFile);


    newFamily();
    getChild();
    getPickup();
    getWeather();
});