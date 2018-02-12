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

    sessionStorage.clear();

    $(document).on("click", "#loginbutton", function(event){
        event.preventDefault();

        console.log("here");
        username = $("#username").val().trim();
        password = $("#password").val().trim();

        database.ref("families").once("value").then(function(familiesSnapshot) {
            familiesSnapshot.forEach(function(familySnapshot) {
                var familyid = familySnapshot.key
                var data = familySnapshot.val();
                
                console.log(familyid);
                console.log("USER", data.login.username);

                if (username === data.login.username) {

                    console.log("WE HAVE A MATCH ON ", familyid);
                    sessionStorage.setItem("familyid", familyid);
                    window.location = "file:///Users/pawhalen/Documents/Full%20Stack%20Flex/CarpoolTemp/profile.html"
                }
            });
        });
    });

    $(document).on("click", "#signupbutton", function() {
        $("#signupbutton").hide();

        $("#loginlabel").attr("id", "signinlabel");
        var signinlabel = $("#signinlabel");
        signinlabel.attr("for", "signinbutton");

        var familyid = $("<input>");
        familyid.addClass("form-control");
        familyid.attr("type", "text");
        familyid.attr("id", "familyid");
        familyid.attr("placeholder", "Family ID");
        signinlabel.append(familyid);

        var signinbutton = $("#loginbutton").attr("id", "signinbutton");
        signinbutton.attr("value", "Sign In");





        // var login

        // var signup = $("#signup");

        // var username = $("<input>");
        // username.addClass("form-control");
        // username.attr("id", "username")
        // username.attr("type", "text");
        // username.attr("placeholder", "Create Username");
        // signup.append(username);

        // var password = $("<input>");
        // password.addClass("form-control");
        // password.attr("id", "password")
        // password.attr("type", "text");
        // password.attr("placeholder", "Create Password");
        // signup.append(password);

        // var familyid = $("<input>");
        // familyid.addClass("form-control");
        // familyid.attr("id", "familyid")
        // familyid.attr("type", "text");
        // familyid.attr("placeholder", "Create Family ID");
        // signup.append(familyid);

        // var createuser = $("<button>");
        // createuser.attr("id", "createuser");
        // createuser.addClass("btn btn-default");
        // createuser.attr("type", "button");
        // createuser.attr("label", "Create User");
        // createuser.text("Create User");
        // signup.append(createuser);

    });

    $(document).on("click", "#signinbutton", function() {
        username = $("#username").val().trim();
        password = $("#password").val().trim();
        familyid = $("#familyid").val().trim();

        console.log("CREATE USER");
        database.ref("families/" + familyid + "/login").update({
            username: username,
            password: password
        })

        sessionStorage.setItem("familyid", familyid);
        window.location = "file:///Users/pawhalen/Documents/Full%20Stack%20Flex/CarpoolTemp/profile.html"

    });



       // database.ref("families").update({

    

        // database.ref("families").once("value").then(function(familiesSnapshot) {
        //     familiesSnapshot.forEach(function(familySnapshot) {
                
        // })


});