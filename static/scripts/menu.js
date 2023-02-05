// This script is being loaded on the first site and should contain the var elements
// Script also contains async functions for each menu choise and other onload-functions

  /////////////////////////
 //   GLOBAL OBJECTS    //
/////////////////////////
var shoppingcart=[];
var loggedInUser=null;
var TOTALPRICE=0;

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
 //      Check session on load, incase of refreashing the page, the session is still active in app.py     //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
async function check_session(){
    displayMessages();
    let reply = await fetch("/check_session");
    if (reply.status==200){
        result = await reply.json();
        if (result != false){
            loggedInUser = result;
            if(result === "admin"){   
                loggedInUser = result;                                                              // if session returns admin the admin page is displayed in the menu
                let show_admin = document.getElementById("hidden");
                show_admin.style.display="inherit";
                if (scriptInHead('<script src="/static/scripts/music.js"></script>') === false) {   // if the script is not allready in header it get loaded into the head
                    loadScript("/static/scripts/admin.js")
                };
            };
            return true;
        }
        else{
            loggedInUser = null; 
            let show_admin = document.getElementById("hidden");
            show_admin.style.display="none";
            userIcon()
            return false;
        };
    };
};

  /////////////////////////
 //      MAIN MENU      //
/////////////////////////

async function news() {
    let reply = await fetch("/news");
    if (reply.status==200){
        userIcon();
        let result = await reply.json();
        let main = document.getElementById("main_loader");
        main.innerText = "";                                // empty main_loader before creating a new "page". is used in several places
        let header = newElement(main,"h2"); 
        header.classList.add("header_line");
        header.innerText="News";
        for (key in result) {                               // Iterates through the result an posts an article with the content for each result
            let article = newElement(main,"article");
            let div = newElement(article,"div");
            let date = newElement(div,"p"); 
            date.classList.add("news_date");
            date.innerText=result[key]["date"];
            let head = newElement(div,"h3");
            head.innerText=result[key]["head"];
            let post = newElement(article,"p");
            post.innerText=result[key]["post"];
        };
    };
};

async function store() {
    if (scriptInHead('<script src="/static/scripts/store.js"></script>') === false){    // Loads new script if not in header
        loadScript("/static/scripts/store.js");
    };
    let reply = await fetch("/store");
    if (reply.status==200){
        let result = await reply.json();
        let main = document.getElementById("main_loader");
        main.innerText = "";
        let header = newElement(main,"h2"); 
        header.classList.add("header_line");
        header.innerText="Store";
        let category_list = ["All"];                                                    // A list for filtering categorys
        for (key in result) {
            if (category_list.includes(result[key]["category"]) == false) {             // Checks if category is in list
                category_list.push(result[key]["category"]);                            // pushes the category to list if not
            };
        };
        let category = newElement(main,"span");
        category.classList.add("category");
        for (i = 0; i < category_list.length; i++){                                     // iterates through the category list and creates a h4 for each
            let items = newElement(category,"h4"); 
            items.classList.add("animate_line");
            let a = newElement(items,"a"); 
            a.href="#Store/"+category_list[i];                                          // sets a hash route
            a.innerText=category_list[i];
            items.id = category_list[i];
            items.onclick = function(){
                categorySelection(items.id);                                            // clicking an category triggers the function. Lays in store.js
            };
        };
        let store_div = newElement(main,"div"); 
        store_div.setAttribute("id","store_div");
        storeItems(result);                                                             // runs a function that creates an element for each item in store table. Lays in store.js
    };
};


async function music() {
    if (scriptInHead('<script src="/static/scripts/music.js"></script>') === false){    // Loads new script if not in header
        loadScript("/static/scripts/music.js")
    }
    let reply = await fetch("/music");
    if (reply.status==200){
        let result = await reply.json();
        let main = document.getElementById("main_loader");
        main.innerText = "";
        let header = newElement(main,"h2"); 
        header.classList.add("header_line");
        header.innerText="Music";
        let collection_div = newElement(main,"div");                                    // div for the albums with images
        let album_list_div = newElement(collection_div,"div");
        album_list_div.classList.add("cover_div");
        let lyric_list_div = newElement(collection_div,"div");                          // div for the lyrics
        lyric_list_div.setAttribute("id", "songs_div");
        for (var key = result.length - 1; key >= 0; key--) {                            // iterates through the albums and creates an elemt for each
            let cover_div = newElement(album_list_div,"div");
            cover_div.classList.add("cover_container");
            let cover_a = newElement(cover_div,"a");
            let cover_span = newElement(cover_a,"span");
            cover_a.href="#Music/"+result[key]["title"].replace(/[&\/\\#,+()$~%. '":*?<>{}]/g,'-');                                        // sets hash route
            cover_span.classList.add("cover_title");
            let title_p = newElement(cover_span,"p");
            title_p.innerText = result[key]["title"];
            let year_p = newElement(cover_span,"p");
            year_p.innerText = result[key]["year"];
            let image = newElement(cover_div,"img");
            image.src="static/images/"+result[key]["cover"];                            // add image path
            image.classList.add("cover_images");
            cover_div.id = result[key]["aid"];
            cover_div.onclick = function() {
            listSongs(cover_div.id);                                                    // triggers function to list lyrics. Lays in music.js
            };
        };
    };
};
async function tour() {
    let reply = await fetch("/tour");
    if (reply.status==200){
        let result = await reply.json();
        let main = document.getElementById("main_loader");
        main.innerText = "";
        let header = newElement(main,"h2"); 
        header.classList.add("header_line");
        header.innerText="Tour";
        let table = newElement(main,"table");                                           // create table for the tour dates
        let tr = newElement(table,"tr");
        let th = newElement(tr,"th");                                                   // set headers in table Date, Venue, Country
        th.innerText = "Date";                                                       
        th = newElement(tr,"th");
        th.innerText = "Venue";
        th = newElement(tr,"th");
        th.innerText = "Country";
        for (key in result) {                                                           // iterates tour dates and makes a new tr and td row for date, location, place
            let sub = newElement(table,"tr");
            let row = newElement(sub,"td");
            row.innerText = result[key]["date"];
            row = newElement(sub,"td");
            row.innerText = result[key]["location"];
            row = newElement(sub,"td");
            row.innerText = result[key]["place"];
        };
    };
};
function cart() {
    let main = document.getElementById("main_loader");
    main.innerText = "";
    let header = newElement(main,"h2");
    header.classList.add("header_line");
    header.innerText="Cart";
    let shopbox = newElement(main,"table");
    shopbox.setAttribute("id","cartbox");
    let headers = ["Item","Price","Size","Quantity","Delete"];                          // headers in a list so a for loop can iterate through it and therefor get shorter code
    let tr = newElement(shopbox,"tr");
    for (i = 0; i < headers.length; i++){
        let th = newElement(tr,"th");
        th.innerText = headers[i];
    };
    for (key in shoppingcart){
        shoppingcart[key].display();                                                    // referances to Entry object in store.js
    };
    tr = newElement(shopbox,"tr")
    tr.setAttribute("id","TOTALPRICE")
    filtered = shoppingcart.filter(function (el) {                                      // if deleting an item from Entry -> store.js. it is still stored as an empty object.
        return el != null;                                                              // to avoid empty objects in the shoppingcart a new list filtered is used to calculate the total
      });                                                                               // referanced in readme.MD [1.4]
    if (filtered.length != 0 ){
        totalPrice()   
    };
    let button = newElement(main,"button")                                              // checkout button that triggers updateCheckoutData.Lays in store.js
    button.innerText="checkout"
    button.onclick = function(){
        updateCheckoutData()
    };
};
