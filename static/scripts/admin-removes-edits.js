// function page for functions linked to the admin page.


// For uploading files, inspired by one found on net. Referances [1.2]! this function is runned callback in verifyAdmin
async function uploadFile() {
	let data = new FormData();
	data.append('title', 'Sample Title');
	data.append('file', document.querySelector("#file-to-upload").files[0]);    // get file from id-name
	let reply = await fetch('/upload', {
	    method: 'POST',                     // send to backend
	    credentials: 'same-origin',
        body: data
	});
	if(reply.status == 200){                // check result and display succsess or not
        let result = await reply.json()
        displayMessages(result)
    }
    else{
        if (reply.status==401){                                         // displayes custom unathorized 401 page
            unauthorized()
        };
    };
};

// removes tuples in database, additional is f.ex sizes when removing a tuple with sizes in store
async function removeTuple(id, idName, table, additional=null){
    let reply = await fetch("/remove-tuple", {
        method: "POST",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
            id: id,
            idName: idName,
            table: table
        }),
    });
    if (reply.status==401){unauthorized()};
    if (reply.status==200){
        let result = await reply.json();
        displayMessages(result)
    };
    if (additional !== null){
        if (additional === "size"){
            let reply = await fetch("/remove-tuple", {
                method: "POST",
                headers: {
                    "content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    idName: idName,
                    table: additional
                }),
            });
        };
    };
};


// function for checking that tour country and region is entered correctly
function checkIso(stringIsoRegion,){
    let output = document.getElementById("new-tour-place");
    let IsoRegionArr = stringIsoRegion.split(",");          // split at comma and makes a list
    if (IsoRegionArr.length == 2){                          // length is not 2 if input has 0 or more than 1 comma
        if(IsoRegionArr[0].length == 2 || IsoRegionArr[0].length == 3){                         // checks that first item in list is 2 or 3 in length
            output.value = IsoRegionArr[0].toUpperCase().trim()+", "+IsoRegionArr[1].trim()     // trims ends of spaces
        }
        else{
            displayMessages("* Not a valid ISO code, check countrycode.org for the correct ISO code");
            output.value=""
        };
    }
    else{
        displayMessages("* Not a valid ISO code, check countrycode.org for the correct ISO code");
        output.value=""
    };
    
};

// for suming together quantity when size is selected in edit-store
function autoSum(sid){
    // get value from all inputs
    let xs = document.getElementById("xs"+sid).value
    let s = document.getElementById("s"+sid).value
    let m = document.getElementById("m"+sid).value
    let l = document.getElementById("l"+sid).value
    let xl = document.getElementById("xl"+sid).value
    let qty = document.getElementById("quantity"+sid)
    // make sure they are int
    let setQty = parseInt(xs)+parseInt(s)+parseInt(m)+parseInt(l)+parseInt(xl)
    // enable quantety to set new value
    qty.disabled="false"
    qty.value=setQty
    // and lock it again
    qty.disabled="true"
};

// send news backend
async function sendNews(){
    let header = document.getElementById("header-input").value
    let post = document.getElementById("post-input").value
    let reply = await fetch("/editnews", {
        method: "POST",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
            header: header,
            post: post
        }),
    });
    if (reply.status==200){
        let result = await reply.json();
        displayMessages(result)
    }
    else{
        if (reply.status==401){                                         // displayes custom unathorized 401 page
            unauthorized()
        };
    };
};

// function for editing items in the store by updating tuples in the database
async function editStoreItem(sid, size=false){
    // get all values
    let collection=document.getElementById("collection"+sid).value;
    let quantity=document.getElementById("quantity"+sid).value;
    let price=document.getElementById("price"+sid).value;
    let category=document.getElementById("category"+sid).value;
    let name=document.getElementById("name"+sid).value;
    let image=document.getElementById("image"+sid).value;
    if (size===true){
        // if size is true get all values
        let xs = document.getElementById("xs"+sid).value;
        let s = document.getElementById("s"+sid).value;
        let m = document.getElementById("m"+sid).value;
        let l = document.getElementById("l"+sid).value;
        let xl = document.getElementById("xl"+sid).value;
        if(xs==""||s==""||m==""||l==""||xl==""){                // makes sure no fields are empty and breaks with return;
            displayMessages("* All fields needs to be filled")
            return;
        };
        let reply = await fetch("/edit-size", {
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({
                size_sid: sid,
                xs: xs,
                s: s,
                m: m,
                l: l,
                xl: xl        
            }),
        });
    };
    let reply = await fetch("/edit-store", {
        method: "POST",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
            sid: sid,
            collection: collection,
            quantity: quantity,
            price: price,
            category: category,
            name: name,
            image: image
        }),
    });
    if (reply.status==200){                 // checking that all criterias are fulfilled back-end in Flask server
        let result = await reply.json();
        displayMessages(result);            // and returns a success or error message in top left corner
    }
    else{
        if (reply.status==401){                                         // displayes custom unathorized 401 page
            unauthorized()
        };
    };
};

// function for adding a new item to the store by sending it to the database
async function newStoreItem(sid=null){
    // is checked backend if "None" so set all none
    let size = 0
    let xs = "None"
    let s = "None"
    let m = "None"
    let l = "None"
    let xl = "None"
    // if size is not null get value
    if (sid != null){
        size = 1
        xs = document.getElementById("xs-new").value;
        s = document.getElementById("s-new").value;
        m = document.getElementById("m-new").value;
        l = document.getElementById("l-new").value;
        xl = document.getElementById("xl-new").value;
    };
    // get value from main-row
    let collection=document.getElementById("new-collection").value;
    let quantity=document.getElementById("quantity-new").value;
    let price=document.getElementById("new-price").value;
    let category=document.getElementById("new-category").value;
    let name=document.getElementById("new-name").value;
    let image=document.getElementById("new-image").value;
    // send all, backend checks the size
    let reply = await fetch("/edit-store", {
        method: "POST",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
            collection: collection,
            quantity: quantity,
            price: price,
            category: category,
            name: name,
            image: image,
            size: size,
            size_sid: sid,
            xs: xs,
            s: s,
            m: m,
            l: l,
            xl: xl        
        }),
    });
    if (reply.status==200){                 // checking that all criterias are fulfilled back-end in Flask server
        let result = await reply.json();
        AStore()
        displayMessages(result)             // and returns an success or error message in top left corner
    }
    else{
        if (reply.status==401){                                         // displayes custom unathorized 401 page
            unauthorized()
        };
    };
};
//  sending new tour dates to database
async function newTourDate(){
    let date = document.getElementById("new-tour-date").value
    let location = document.getElementById("new-tour-location").value
    let place = document.getElementById("new-tour-place").value
    let reply = await fetch("/add-tour", {
        method: "POST",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
            date: date,
            location: location,
            place: place       
        }),
    });
    if(reply.status==200){
        let result = await reply.json();
        displayMessages(result);
    }
    else{
        if (reply.status==401){                                         // displayes custom unathorized 401 page
            unauthorized()
        };
    };
};


// verif that admin knows the username and password
function verifyAdmin(funct){ // funct is the function sent in as callback
    let main_loader = document.getElementById("main_loader");
    let div1 = newElement(main_loader,"div");                               // create modal box. insp by w3schools [1.5]
    div1.classList.add("modal");
    div1.setAttribute("id","myModal");
    div2 = newElement(div1,"div");
    div2.classList.add("modal-content");
    let span = newElement(div2,"span");
    span.classList.add("close");
    span.innerHTML="&times;";
    let form = newElement(div2,"form")
    form.method="POST"
    let p = newElement(form,"p");
    let label = newElement(p,"label");
    label.classList.add("verrify-label");
    label.innerText="Verrify Username"
    let input = newElement(p,"input");
    input.setAttribute("id","verrify-username")
    p = newElement(form,"p");
    label = newElement(p,"label");
    label.classList.add("verrify-label");
    label.innerText="Verrify Password"
    input = newElement(p,"input");
    input.setAttribute("id","verrify-password");
    input.type="password";
    let image = newElement(p,"img");
    image.style="float: right;"
    image.src="static/icons/key.png"
    image.classList.add("regicons")
    image.title = "Send in to database"
    let modal = document.getElementById("myModal");
    modal.style.display = "block";                              // shows the modal box
    let close = document.getElementsByClassName("close")[0];
    close.onclick=function(){
        modal.style.display = "none";                           // hides it if the x is pressed and set values to "" and dispålayes a message that validation failed
        document.getElementById("verrify-username").value=""
        document.getElementById("verrify-password").value=""
        displayMessages("* Validation failed")
    };
    image.onclick=async function(){ // by pressing on the key the password is checked backend
        modal.style.display = "none";
        let username = document.getElementById("verrify-username").value
        let password = document.getElementById("verrify-password").value
        let reply = await fetch("/validate", {
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
        });
        document.getElementById("verrify-username").value=""
        document.getElementById("verrify-password").value=""
        result = await reply.json();
        if(result == true){                     // if result is true the callback function is runned, meaning the image is being uploaded
            funct();
        }   
        else{                                   // if password or username is wrong validation failes and no callback function is runned
            displayMessages("* Validation failed")
        };
    };
};