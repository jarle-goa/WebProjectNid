// script for functions that are being used in several scripts
//Used @param and @return when all was in one script because they gave a description/suggestion what to pass in to the function. Splitting the scripts, it no longer provided any description so i just stopped doing it
/**
 * 
 * @param {Data} addToElement                                               
 * @param {String} newElement 
 * @returns appendchilde
 */
function newElement (addToElement,newElement){                              // takes in an element that an childe shall be appended to and what type the childe will be
    output = addToElement.appendChild(document.createElement(newElement));   // just to make the lines a bit shorter and coding pure java a bit faster
    return output;
}


                                                                            // Script checks if a script is allready in header. As the site only uploads the necessary scripts in the beginning
function scriptInHead(url) {                                                // and add more scripts as new "pages" are being opend. Script referanced in readme.MD [1.3]
    if (!url) url = "/xxx.js";                                              // if no input just make a fictional script to avoid errors
    var scripts = document.head.getElementsByTagName('script');             // get all in header containing the word 'script'
    for (var i = scripts.length; i--;) {
        script_comp = scripts[i].outerHTML;
        if (script_comp == url){ return true;                               // compares the scrips gotten from header and the one sent in as an argument
    }}
    return false;
};

/**
 * @param {String} location
 * @returns {Loads a new script into the header}
 */
function loadScript(location){                                  // loads a new script into the header
    let script = document.createElement("script");
    script.src = location;                                      // sets script src as argument
    document.head.appendChild(script);                          // appends script to head
}

function displayMessages(message){                              // function for displaying error messages and success messages
    let msg = document.getElementById("ERROR");                 // get id from an unused div at the top of the main_loader
    msg.innerText="";                                           // empties previous message
    msg.className = msg.className.replace(/\bappbox\b/g);       // removes classname to avoid empty green og red boxes
    msg.className = msg.className.replace(/\balertbox\b/g);
    if (message != null){
        msg = document.getElementById("ERROR");
        msg.innerText="";
        if (message.charAt(0) == "*"){                          // if message has a *, strip the star, display the message and add red for error message
            mesage = message.substring(1);
            msg.innerText=mesage;
            msg.classList.add("alertbox");
        }
        else{
            msg.innerText=message;                              // mesages with no stars displayes the message and add green for success message
            msg.classList.add("appbox");
        }
    }
};

function unauthorized(){                                        // makes a custom unauthoriced site for code 401
    let body = document.getElementById("body");
    body.innerText="";
    body.setAttribute("id","unauthorized");
    let div = newElement(body,"div");
    let h1 = newElement(div,"h1");
    let h3 = newElement(div,"h3");
    h3.innerText="return to main"
    h3.onclick=async function(){                                // returns to main site
        let reply = await fetch("/");
        let result = await reply.text();                        // the text of the whole index.html file
        document.documentElement.innerHTML = result;            // displayes it as inner html
        news();                                                 // launch the news site as it does not launch on load as it should
        check_session();
    };
    h1.innerText="This site is off limits";
    let image = newElement(div,"img");
    image.src="static/logo/8EC9B346-8E6B-4FEF-8876-1C4A8783337F.png";
    

};
function checkHash() {                                          // simpel route for main pages. Stay on page upon refreshing and opens for typing /#store, /#tour etc in url window
    check_session()
    if (window.location.hash.toLowerCase()=="#news"){
        news();
    };
    if (window.location.hash.toLowerCase()=="#store"){
        store();
    };
    if (window.location.hash.toLowerCase()=="#music"){
        music();
    };
    if (window.location.hash.toLowerCase()=="#tour"){
        tour();
    };
    if (window.location.hash.toLowerCase()=="#cart"){
        cart();
    };
    if (window.location.hash.toLowerCase()=="#adminpage"){
        makeAdminPage();
    };
    if (window.location.hash.toLowerCase()=="#registration"){
        userAction()
    };
};
