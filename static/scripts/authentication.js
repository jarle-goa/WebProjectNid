  /////////////////////////
 //    HEADER LOGIN     //
/////////////////////////
async function loggingin(){
    let username = document.getElementById("username").value
    let password = document.getElementById("password").value

    let reply = await fetch("/login", {                         // Gets values from input fields and sends it backend to be checked in flask
        method: "POST",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        }),
    });
    if (reply.status==200){
        let result = await reply.json();
        if (result === "NOT IN DATABASE"){                      // If user is not found in database a registration page is loaded via userAction()
            userAction("* Seems like you are not a registered user. Fill in the form if you would like to register");
        }
        else {
            if (result != false ){                                   // if a match in database
                check_session();                                     // checking session as this opens for hidden adminpage and ads user to a variabel
                window.location.hash="#User/"+result
                loggedInUser=result;                                 // even though check_session is supposed to add user to a variable it is not done so we do it again here
                document.getElementById("password").value="";        // empties input fields
                document.getElementById("username").value="";
                let loginbar = document.getElementById("login_logout");
                loginbar.innerText="";
                let image = newElement(loginbar,"img");              // changes icon to indicate a logout symbol
                image.classList.add("invicons");
                image.src="static/icons/out.png";
                image.onclick = function(){
                    loggingout();                                    // and changes the onclick from loggin to loggingout
                    };
                
                displayMessages("Welcome "+loggedInUser);            // displayes a welcome message and notification that the login was a success
            };
        };   
        if (result == false){                                        // if flask returns false this means the user was found but the wrong password was entered. 
            displayMessages("* Wrong username or password");         // For safety reasons this is not specified 
        };
    };
};
async function loggingout() {                                   // function runned when user clicks the logout icon
    let reply = await fetch("/logout");
    if (reply.status==200){
        check_session();                                        // checks session to make sure user is logged out both backend and front end. sets loggedInUser=null
        result = await reply.json();
        userIcon();                                             // sets login icon back                            
        window.location.hash="#News"                                                 // loads news page to make sure no restricted pages is left open
    }
}
function userAction(message=null){                              // opens page when a user is not found in the database and makes a registration page
    window.location.hash="#Registration"
    let page = document.getElementById("main_loader");
    page.innerHTML="";
    let div = newElement(page,"div");
    div.setAttribute("id","new_user");
    let h2 = newElement(div,"h2");
    h2.innerText = "New User";
    displayMessages(message);
    let form = newElement(div,"form");
    form.method="POST";
    // new username input
    let span = newElement(form,"span");
    let label = newElement(span,"label");
    let input = newElement(span,"input");
    label.innerText="Username";
    input.name="new_username";
    input.type="text";
    input.setAttribute("id","new_username");
    // new password input
    span = newElement(form,"span");
    label = newElement(span,"label");
    input = newElement(span,"input");
    label.innerText="Password";
    input.name="new_password";
    input.type="password";                                       // password hides plain text
    input.setAttribute("id","new_password");
    // new email input
    span = newElement(form,"span");
    label = newElement(span,"label");
    input = newElement(span,"input");
    label.innerText="Email";
    input.name="new_email";
    input.type="email";                      //type:email checks that its an email format
    input.setAttribute("id","new_email");
    // submit button/icon
    span = newElement(form,"span");
    let image = newElement(span,"img");
    image.src="static/icons/add.png";
    image.classList.add("regicons");
    image.onclick = function(){             // on click triggers a function that sends the new info to the database via flask
        newUser();
    };
};
async function newUser(){
    let username = document.getElementById("new_username").value;
    let password = document.getElementById("new_password").value;
    let email = document.getElementById("new_email").value;
    let reply = await fetch("/newuser", {
        method: "POST",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password,
            email: email
        }),
    });
    if (reply.status==200){
        let result = await reply.json();
        displayMessages(result);                         // displayes message if all was ok or not. Checks things backend so message can be error or succsess
    };
};


function userIcon(){                                                        // function to change the login icon back and forth
    let loginbar = document.getElementById("login_logout");
    loginbar.innerText="";
    let image = newElement(loginbar,"img");
    image.classList.add("invicons");
    if (loggedInUser == null){
        image.src="static/icons/enter.png";
        image.onclick = function(){
            loggingin();
        };
    }
    else {
        image.src="static/icons/out.png"
        image.onclick = function(){
            loggingout();
        };
    };
};



