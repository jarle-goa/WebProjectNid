// this is the javascript for creating the hidden admin page. It is only inteded for admin so the layout is not so importen
// Creates a simple admin page with a list of all posts that are able to edit
async function makeAdminPage(){
    let reply = await fetch("/admin");                                                                  //checks that session is admin backend 
    if (reply.status==200){
        if (scriptInHead('<script src="/static/scripts/admin-removes-edits.js"></script>') === false){  // loads new script
            loadScript("/static/scripts/admin-removes-edits.js")
        }
        let main = document.getElementById("main_loader");
        main.innerText="";
        // create header
        let h2 = newElement(main, "h2");
        h2.innerText="Admin Page";
        let p = newElement(main, "p");
        p.innerText="Welcome admin. Here you can edit content on the list below";
        let ul = newElement(main, "ul");
        // create Edit News
        let li = newElement(ul, "li");
        let a = newElement(li, "a")
        a.innerText="News";
        a.href="#Adminpage/Edit-News"
        li.onclick = function() {
            ANews()
        };
        // create Edit Store
        li = newElement(ul, "li");
        a = newElement(li, "a")
        a.innerText="Store";
        a.href="#Adminpage/Edit-Store"
        li.onclick = function() {
            AStore()
        };
        // create Edit Music
        li = newElement(ul, "li");
        a = newElement(li, "a")
        a.innerText="Music";
        a.href="#Adminpage/Edit-Music"
        li.onclick = function() {
            AMusic()
        };
        // create Edit Tour
        li = newElement(ul, "li");
        a = newElement(li, "a")
        a.innerText="Tour";
        a.href="#Adminpage/Edit-Tour"
        li.onclick = function() {
            ATour()
        };
        // create Edit Users
        li = newElement(ul, "li");
        a = newElement(li, "a")
        a.innerText="Users";
        a.href="#Adminpage/Edit-Users"
        li.onclick = function() {
            AUsers()
        };
        // create Upload file
        li = newElement(ul, "li");
        a = newElement(li,"a");
        a.innerText="Upload files";
        a.href="#Adminpage/Upload-files";
        li.onclick = function() {
            Aupload()
        };
        // create new div to represent new content to be loaded
        let admin_div = newElement(main,"div");
        admin_div.setAttribute("id", "admin-div")
    }
    else{
        if (reply.status==401){                                         // displayes custom unathorized 401 page
            unauthorized()
        };
    };
};


// Function runned when pressing news from adminpage
function ANews() {
    if (loggedInUser="admin"){
        let admin_div = document.getElementById("admin-div")
        admin_div.innerText=""
        let p = newElement(admin_div,"p")
        p.innerText="Header"
        let form = newElement(admin_div,"form")
        form.method="POST"
        let hInput = newElement(form,"input")                       // input field for header of news post
        hInput.setAttribute("id","header-input")
        hInput.name="header-input"
        p = newElement(form,"p")
        p.innerText="Post"
        let pInput = newElement(form,"textarea")                    // textarea for the post of the news post
        pInput.setAttribute("id","post-input")
        pInput.name="post-input"
        pInput.rows="3"
        pInput.cols="80"
        let image = newElement(form,"img");
        image.src="static/icons/send.png"
        image.classList.add("regicons")
        image.title = "Send in to database"
        image.onclick = function(){                                 // on click triggers function that layes in admin-removes-edit.js file
            sendNews()
        };
    };
};



// Function runned when pressing store from adminpage
async function AStore() {
    let reply = await fetch("/store");
    if (reply.status==200){
        let sizeCheck = null
        let last_sid=null
        let admin_div=document.getElementById("admin-div");
        admin_div.innerText="";
        let result = await reply.json();
        let form = newElement(admin_div,"form");
        form.method="POST";
        let table = newElement(form,"table");
        // create table and th
        table.classList.add("admin-table");
        let tr = newElement(table,"tr");
        let th = newElement(tr,"th");
        let input = newElement(th,"input");
        input.value="sid";
        input.disabled="true";
        input.classList.add("admin-table-input-small");
        input.setAttribute("id","id-name");
        th = newElement(tr,"th");
        th.innerText="Collection";
        th = newElement(tr,"th");
        th.innerText="Quantity";
        th = newElement(tr,"th");
        th.innerText="Price";
        th = newElement(tr,"th");
        th.innerText="Category";
        th = newElement(tr,"th");
        th.innerText="Name";
        th = newElement(tr,"th");
        th.innerText="Image";
        th = newElement(tr,"th");
        // iterate through result and make new row for each item in result
        for (key in result){
            tr = newElement(table,"tr");
            //sid
            let td = newElement(tr,"td")
            let inp = newElement(td,"input");
            inp.setAttribute("id","sid"+result[key]["sid"])
            inp.classList.add("admin-table-input-small")
            inp.type="text";
            inp.disabled = "true";                                 // disable input for id, should not be able to change
            inp.value=result[key]["sid"];
            // collection
            td = newElement(tr,"td")
            let select = newElement(td,"select");
            select.setAttribute("id","collection"+result[key]["sid"]);
            select.classList.add("admin-table-input-medium")       // sets dropdown select with value as from result
            if (result[key]["collection"]==="True"){
                let option = newElement(select,"option");
                option.value=result[key]["collection"];
                option.innerText= "IN STOCK"
                option=newElement(select,"option");                 // adds new option with the opposite
                option.value="False";
                option.innerText="NOT IN STOCK"
            };
            if (result[key]["collection"]==="False"){               // opposite of the same if statement above, depending on if the original result["collection"] is true or false
                let option = newElement(select,"option");
                option.value=result[key]["collection"];
                option.innerText= "NOT IN STOCK"
                option=newElement(select,"option");
                option.value="True";
                option.innerText="IN STOCK"
            };
            // quantity w/size
            td = newElement(tr,"td")
            let size=false                                      
            if (result[key].hasOwnProperty("size")){                // if item has size disable quantity as this will be calculated out from the total in sizes
                size=true   
                sizeCheck="size"
                inp = newElement(td,"input");
                inp.setAttribute("id","quantity"+result[key]["sid"])
                inp.classList.add("admin-table-input-small")
                inp.type="number";
                inp.value=result[key]["quantity"];
                inp.disabled = "true"
            }
            // quantity w/out size
            else{
                inp = newElement(td,"input");                       // else input is open
                inp.setAttribute("id","quantity"+result[key]["sid"])
                inp.classList.add("admin-table-input-small")
                inp.type="number";
                inp.min=0
                inp.value=result[key]["quantity"];
                inp.onkeydown=function(){
                    var key = event.keyCode;                        // only allow backspace and 0-9 num, this is used often. Tried making a function for it but did not succseed
                    if(key == 48||key == 49||key == 50||key == 51||key == 52||key == 53||key == 54||key == 55||key == 56||key == 57||key == 8){
                        return true;
                    }
                    else{
                        return false
                    };
                };
            };
            // price
            td = newElement(tr,"td")
            inp = newElement(td,"input");
            inp.setAttribute("id","price"+result[key]["sid"])
            inp.classList.add("admin-table-input-small")
            inp.type="number";
            inp.value=result[key]["price"];
            inp.onkeydown=function(){
                var key = event.keyCode;
                if(key == 48||key == 49||key == 50||key == 51||key == 52||key == 53||key == 54||key == 55||key == 56||key == 57||key == 8){
                    return true;
                }
                else{
                    return false
                };
            };
            //Category
            td = newElement(tr,"td")
            inp = newElement(td,"input");
            inp.setAttribute("id","category"+result[key]["sid"])
            inp.classList.add("admin-table-input-medium")
            inp.type="text";
            inp.value=result[key]["category"];
            // name/description
            td = newElement(tr,"td")
            inp = newElement(td,"input");
            inp.setAttribute("id","name"+result[key]["sid"])
            inp.type="text";
            inp.value=result[key]["name"];
            // image
            td = newElement(tr,"td")
            inp = newElement(td,"input");
            inp.setAttribute("id","image"+result[key]["sid"])
            inp.type="text";
            inp.value=result[key]["image"];
            td = newElement(tr,"td");
            // cell for 2 icons for edit or delete
            let span =newElement(td,"span")
            let image = newElement(span,"img");
            let sid = result[key]["sid"];
            image.src="static/icons/edit.png";
            image.classList.add("regicons");
            image.title="Edit in database"
            image.onmousedown = function(){
                editStoreItem(sid,size);
            };
            image.onmouseup = function(){   // updates the changes on display after being updated
                AStore()
            };
            image = newElement(span,"img");
            image.title = "Delete from database"
            image.src="static/icons/remove.png";
            image.classList.add("regicons");
            image.onmousedown = function(){
                removeTuple(sid,Object.keys(result[0])[0],"store",sizeCheck);
            };
            image.onmouseup = function(){       // updates the changes on display after being deleted
                AStore()
            };
            if (result[key].hasOwnProperty("size")){        // if item has size a new row is created under the "main row" of the item it belongs to
                let sizes = result[key]["size"]
                tr = newElement(table,"tr");
                td = newElement(tr,"td");
                td.innerText=""
                td = newElement(tr,"td");
                td.setAttribute("id","colspan"+sizes["sid"]);
                document.getElementById("colspan"+sizes["sid"]).colSpan=6;
                td.innerText="Sizes:";
                for (key = 1; key < 6; key++){                  // make a cell for each size xs,s,m,l,xl
                    let label = newElement(td,"label");
                    label.innerText=Object.keys(sizes)[key]     // get object name f.ex 'xs' and sex label as that
                    let input = newElement(td,"input");
                    input.value = sizes[Object.keys(sizes)[key]]    // get value/quanteti of the object name
                    input.classList.add("admin-table-input-small")
                    input.type="number"
                    input.min=0
                    input.onkeydown=function(){
                        var key = event.keyCode;            // bloack characters
                        if(key == 48||key == 49||key == 50||key == 51||key == 52||key == 53||key == 54||key == 55||key == 56||key == 57||key == 8){
                            return true;
                        }
                        else{
                            return false
                        };
                    };
                    input.setAttribute("id",[Object.keys(sizes)[key]]+sizes["sid"])
                    input.onchange= function(){
                        autoSum(sid)                        // sum together the total of all sizes and set quantity to it
                    };
                };
            };

        };
        // at the end create a new row for new items
        tr = newElement(table,"tr");
        td = newElement(tr,"td");
        td.innerText="";
        td = newElement(tr,"td");
        select = newElement(td,"select");
        select.classList.add("admin-table-input-medium");
        select.setAttribute("id","new-collection");
            option = newElement(select,"option");
            option.value="True";
            option.innerText="IN STOCK";
            
            option = newElement(select,"option");
            option.value="False";
            option.innerText="NOT IN STOCK";
        
        td = newElement(tr,"td")
        input = newElement(td,"input");
        input.setAttribute("id","quantity-new");
        input.classList.add("admin-table-input-small");
        input.type="number";
        input.min=0
        input.onkeydown=function(){
            var key = event.keyCode;
            if(key == 48||key == 49||key == 50||key == 51||key == 52||key == 53||key == 54||key == 55||key == 56||key == 57||key == 8){
                return true;
            }
            else{
                return false
            };
        };

        td = newElement(tr,"td")
        input = newElement(td,"input");
        input.setAttribute("id","new-price");
        input.classList.add("admin-table-input-small");
        input.type="number";
        input.min=0
        input.onkeydown=function(){
            var key = event.keyCode;
            if(key == 48||key == 49||key == 50||key == 51||key == 52||key == 53||key == 54||key == 55||key == 56||key == 57||key == 8){
                return true;
            }
            else{
                return false
            };
        };

        td = newElement(tr,"td")
        input = newElement(td,"input");
        input.setAttribute("id","new-category");
        input.classList.add("admin-table-input-medium");
        input.type="text";
        input.onchange = function(){
            let set = document.getElementById("new-category")
            let out = set.value.charAt(0).toUpperCase() + set.value.slice(1).toLowerCase();
            set.value=out
        };

        td = newElement(tr,"td")
        input = newElement(td,"input");
        input.setAttribute("id","new-name");
        input.type="text";

        td = newElement(tr,"td")
        input = newElement(td,"input");
        input.setAttribute("id","new-image");
        input.type="text"

        td = newElement(tr,"td");
        image = newElement(td,"img");
        image.src="static/icons/send.png"
        image.classList.add("regicons")
        image.title = "Send in to database"
        image.onclick = async function(){
            newStoreItem(last_sid);
        };
        // create a checkbox for if the new item has sizes or not
        tr = newElement(table,"tr");
        td = newElement(tr,"td");
        td.colSpan=2;
        label = newElement(td,"label");
        label.innerText="New item w/ size";
        checkbox = newElement(td,"input");
        checkbox.type="checkbox";
        checkbox.setAttribute("id","new-size");
        td = newElement(tr,"td");
        td.setAttribute("id","table-data-size")
        checkbox.onchange=function(){
            if (document.getElementById("new-size").checked==true){
                last_sid = result[result.length - 1]["sid"] + 1
                document.getElementById("quantity-new").disabled=true;      //if size disable quantity input as this will be summed together
                td = document.getElementById("table-data-size");
                td.innerText=""
                td.colSpan=5;
                let sizes_list = ["xs","s","m","l","xl"];
                for (key in sizes_list){
                    let label = newElement(td,"label");
                    label.innerText=sizes_list[key];
                    let input = newElement(td,"input");
                    input.classList.add("admin-table-input-small");
                    input.setAttribute("id",sizes_list[key]+"-new");
                    input.type="number";
                    input.value = 0;
                    input.min = 0;
                    input.onkeydown=function(){
                        var key = event.keyCode;
                        if(key == 48||key == 49||key == 50||key == 51||key == 52||key == 53||key == 54||key == 55||key == 56||key == 57||key == 8){
                            return true;
                        }
                        else{
                            return false
                        };
                    };
                    input.onchange= function(){
                        autoSum("-new")             // sum the total and display in quantity
                    };
                };
            };
            if (document.getElementById("new-size").checked==false){            // if check on and of make sure quantity is enabled and that the "sub-row" goes away
                document.getElementById("quantity-new").disabled=false;
                document.getElementById("table-data-size").innerText="";
                sizeCheck=null
                last_sid=null
            };
        };
    };
};





async function AMusic() {
    let admin_div = document.getElementById("admin-div")
    admin_div.innerText=""


    admin_div.innerText="Sorry this page is not ready yet :("
};

async function ATour() {
    let reply = await fetch("/tour");
    if (reply.status==200){
        let result = await reply.json();
        let main = document.getElementById("admin-div");
        main.innerText = ""
        let form = newElement(main,"form");
        form.method="POST";
        // create table and th
        let table = newElement(form,"table");
        table.classList.add("admin-table")
        let tr = newElement(table,"tr");
        let th = newElement(tr,"th");
        th.innerText = "Date";
        th = newElement(tr,"th");
        th.innerText = "Venue";
        th = newElement(tr,"th");
        th.innerText = "Country";
        // iterate through result and create new row for each result index
        for (key in result) {
            let sub = newElement(table,"tr");
            // date
            let row = newElement(sub,"td");
            let input = newElement(row,"input");
            input.type="date"
            input.value=result[key]["date"]
            input.setAttribute("id","edit-date"+result[key]["date"])
            // location / venue
            row = newElement(sub,"td");
            input = newElement(row,"input");
            input.value = result[key]["location"];
            input.setAttribute("id","edit-location");
            // place / country
            row = newElement(sub,"td");
            input = newElement(row,"input");
            input.value = result[key]["place"]
            input.setAttribute("id","edit-place")
            row = newElement(sub,"td");
            // delete icon
            let span =newElement(row,"span")
            let tourID = result[key]["date"];
            let image = newElement(span,"img");
            image.title = "Delete from database"
            image.src="static/icons/remove.png";
            image.classList.add("regicons");
            image.onmousedown = function(){
                removeTuple(tourID,Object.keys(result[0])[0],"tour")
            };
            image.onmouseup = function(){       // update changes on display
                ATour()
            };
        };
        // at the end make empty cells for new tour date
        let sub = newElement(table,"tr");
        let row = newElement(sub,"td");
        let input = newElement(row,"input");
        input.setAttribute("id","new-tour-date")
        input.type="date"
        row = newElement(sub,"td");
        input = newElement(row,"input");
        input.setAttribute("id","new-tour-location")
        input.placeholder="Venue Name"
        row = newElement(sub,"td");
        input = newElement(row,"input");
        input.setAttribute("id","new-tour-place")
        input.placeholder="ISO, Region"
        input.onchange = function(){
            inToFunction = document.getElementById("new-tour-place").value  // checks that the set up is xx, something or xxx, something
            checkIso(inToFunction)
        };
        row = newElement(sub,"td");
        // cell for image
        image = newElement(row,"img");
        image.src="static/icons/send.png"
        image.classList.add("regicons")
        image.title = "Send in to database"
        image.onclick = async function(){
            newTourDate();
        };
        image.onmouseup= function(){
            ATour();
        };

    };
};
async function AUsers() {
    let admin_div = document.getElementById("admin-div")
    admin_div.innerText=""




    admin_div.innerText="Sorry this page is not ready yet :("
};
// creates a simpel upload file page
function Aupload(){
    let admin_div=document.getElementById("admin-div");
    admin_div.innerText="";
    let form = newElement(admin_div,"form")
    form.method="POST";
    form.enctype="multipart/form-data";
    let input = newElement(form,"input");
    input.type="file"
    input.setAttribute("id","file-to-upload")
    image = newElement(form,"img");
    image.src="static/icons/send.png"
    image.classList.add("regicons")
    image.title = "Send file to server"
    image.onclick = async function(){
        verifyAdmin(uploadFile);        // runs a callback function to verify username and password before sending files for higher security
    };
};

