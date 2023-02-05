var checkoutdata = [];                                                                      // list for filtering empty objects in shoppingcart before cheking out

function checkCart(sid,size){                                                               // checks whether an item is in the shopping cart and returns the position in the list
    let output = false;
    if (size === null){                                                                     // if no size is given only sid need to match
        for (key in shoppingcart){
            if (shoppingcart[key]["sid"] === parseInt(sid)){
                output = key;
            };
        };
    }
    else{
        for (key in shoppingcart){                                                          // if size is given both sid and size need to match
            if (shoppingcart[key]["sid"] === sid && shoppingcart[key]["size"] === size){
                output = key;
            };
        };
    };
    return output                                                                           // if no match in the list it returns false
};
function qtyMax(ElementId,Array,variabel,keyval){                                           // max quantety a user can add to store is as far as the storage reach therefor if a user 
    let s = document.getElementById(ElementId);                                             // adds f.ex 2 t-shirts to the store this needs to be subtracted from the max value 
    let size = s.value;                                                                     // idealy i dont think this is a good solution as it would need some sort of transaction or lock function in the database
    let substract = 0;                                                                      // but this was a good practice figuring out how to make it work
    for (key in shoppingcart){
        if (shoppingcart[key]["sid"]===Array["sid"] && shoppingcart[key][keyval]===size){   
            substract = shoppingcart[key]["quantity"];                                      // gets the quantety in the shoppingcart for that specific item
        };
    };
    variabel.max=Array[size] - substract;                                                   // and subtracts it
};

function Entry(sid,name,price,size=null,quantity,max){                                      // entry for shoppingcart. Is not sent to the database untill checkout
    this.id = shoppingcart.length;                                                          // needs an id for deleting, cant use sid for that
    this.sid = sid;
    this.name = name;
    this.price = price;
    this.size = size;
    this.quantity = quantity;
    this.max = max;                                                                         // need max qty so the user can't exceed it in the cart menu
    this.tr = null;
    this.display = ()=> {                                                                       
        this.tr = document.getElementById("cartbox").appendChild(document.createElement("tr")); // displayes each item in the store
        iterate = [this.name,this.price+"$",this.size];                                         // table for-loop list for name, price and size
        for (i = 0; i < 3; i++){
            let td = newElement(this.tr,"td");
            td.innerText=iterate[i];
        };
        // Quantity
        let tdq = newElement(this.tr,"td");
        tdqInput = newElement(tdq,"input");
        tdqInput.type="number";
        tdqInput.max=this.max;
        tdqInput.min=1;
        tdqInput.value=this.quantity;
        tdqInput.setAttribute("id","cart_item"+this.id);
        tdqInput.onkeydown=function(){                              // block for using keyboad except backspace
            var key = event.keyCode;
            if(key == 8){
                return true;
            }
            else{
                return false;
            };
        };
        tdqInput.onmouseup=this.update;                             // events for trigging update 
        let tdx = newElement(this.tr,"td");
        tdx.innerText="X";
        tdx.classList.add("alert");
        tdx.classList.add("cart_delete");
        tdx.onclick=this.delete;   
    };
    this.delete = ()=>{
        this.tr.parentNode.removeChild(this.tr);
        delete shoppingcart[this.id];
        this.display;                                   // displayes the changes
        totalPrice();                                   // calculate total price
    }
    this.update = ()=>{
        let new_qty = document.getElementById("cart_item"+this.id).value;
        this.quantity=new_qty;                                               //sets new quantity
        totalPrice();                                                        //calculates total price
    }

}
function add_to_cart(sid,name,price,size=null,quantity,max) {               // selecting sizes and quantity inside the store page triggers this function upon clicking the add button
    let warning = document.getElementById("warning");
    warning.innerText="";
    if (isNaN(quantity) === true){;                                                 // can't add an item with no quantity selected
        warning.innerText="* Can't be empty";
        return;
    };
    if (size === null){                                                     // if item is not merged with a size add new entry with size as null
        if (shoppingcart.length === 0){                                     // and if cart is empty just add to cart with no further checking
            let newentry = new Entry(sid,name,price,null,quantity,max);
            shoppingcart.push(newentry);                                    // push to cart
        }
        else {
            let get_key;                                                    // if items in cart check if there is a match and just increase the quantity for that item
            get_key = checkCart(sid,size);
            if (get_key !== false){
                shoppingcart[get_key]["quantity"] = parseInt(shoppingcart[get_key]["quantity"])+parseInt(quantity);
            }
            else{
                let newentry = new Entry(sid,name,price,null,quantity,max); // no matching key push new entry
                shoppingcart.push(newentry);
            };
    };              
    }
    else {                                                                  // same as above just with size included
        if (shoppingcart.length === 0){                                     // add first item if cart empty
            let newentry = new Entry(sid,name,price,size,quantity,max);
            shoppingcart.push(newentry);
        }
        else {
            let get_key;                                                    // match key
            get_key = checkCart(sid,size);
            if (get_key !== false){
                shoppingcart[get_key]["quantity"] = parseInt(shoppingcart[get_key]["quantity"])+parseInt(quantity); // increase qty if match
            }
            else{
                let newentry = new Entry(sid,name,price,size,quantity,max);     // add new if no match
                shoppingcart.push(newentry);
            };
        };       
    };  
};



/**create store items */
function storeItems(result, specialize=null){                                                 // specialize is used to filter it for catagory. When clicking a catagory in store all items witch match to that catagory is displayed
    if (specialize != null){
        for (key in result) {
            if (result[key]["category"] == specialize) {
                let a = newElement(store_div,"a");
                a.href="#Store/"+specialize+"/item"+result[key]["sid"];
                let article = newElement(a,"article");
                article.id = result[key]["sid"];
                article.onclick = function() {
                    storeDetail(article.id);
                };
                let image = newElement(article,"img");
                image.src="static/images/"+result[key]["image"];
                let span = newElement(article,"span");
                if (result[key]["collection"]=="False" && result[key]["quantity"]>=1){          // backend only checked if item had 0 qty and out of production was true and stoped it from being sent frontend
                    let limited = newElement(span,"p");                                         // But if in production is false but the item STILL HAS a quantity this should be displayed differently
                    limited.classList.add("alert");
                    limited.innerText="Few left";
                };
            if (result[key]["collection"]=="True" && result[key]["quantity"]===0) {             // here another message should be displayed if the qty=0 but product is still in production(aka true)
                let sold_out = newElement(span,"p");
                sold_out.classList.add("alert");
                sold_out.innerText="Back in stock soon";
            };
            let detail = newElement(span,"p");
            detail.innerText = result[key]["name"] +" " + result[key]["price"] + " $" ;           
        };
        };
    }
    else {                                                                              // if no catagory display all, cheking the same qty=0 or >= 1, and production true/false
        for (key in result) {
            let a = newElement(store_div,"a");
            a.href="#Store/item"+result[key]["sid"];
            let article = newElement(a,"article");
            article.id = result[key]["sid"];
            article.onclick = function() {
                storeDetail(article.id);
            };
            let image = newElement(article,"img");
            image.src="static/images/"+result[key]["image"]
            let span = newElement(article,"span");
            if (result[key]["collection"]=="False" && result[key]["quantity"]>=1){
                let limited = newElement(span,"p");
                limited.classList.add("alert");
                limited.innerText="Few left";
                
            };
            if (result[key]["collection"]=="True" && result[key]["quantity"]===0) {
                let sold_out = newElement(span,"p");
                sold_out.classList.add("alert");
                sold_out.innerText="Back in stock soon";
            };
            let detail = newElement(span,"p");
            detail.innerText = result[key]["name"] +" " + result[key]["price"] + " $";
        };
    };
};

async function storeDetail(sid) {                                                           // when clicking an item in the store
    let reply = await fetch("/store");
    if (reply.status==200){
        let result = await reply.json();
        let main = document.getElementById("main_loader");
        main.innerText = ""
        for (key in result) {
            if (result[key]["sid"]==sid) {                                                  // if match sid display the info for that item
                let ent_id = result[key]["sid"];
                let ent_name =result[key]["name"];
                let ent_price = result[key]["price"];
                let detail_main = newElement(main,"article");
                detail_main.classList.add("store_detail");
                // image
                let img_div = newElement(detail_main,"div");
                let image = newElement(img_div,"img");
                image.src="static/images/"+result[key]["image"];
                let frame = newElement(detail_main,"fieldset");
                let legend = newElement(frame,"legend");
                legend.innerText=result[key]["name"];
                if (result[key].hasOwnProperty("size")){                                   // if item is merged with size table it ads a select dropdown for the sizes in store
                    // sizes
                    var sizes = result[key]["size"];
                    let span = newElement(frame,"span");
                    let label = newElement(span,"label");
                    label.innerText="size:";
                    let select = newElement(span,"select");
                    select.setAttribute("id", "selectSize");
                    select.onmousedown = function(){
                        sizeFunction();                                                     // set qty to empty upon changing size 
                        };
                    if (sizes["xs"] > 0){                                                   // checks if the size has a quantity and does not add it as an option to the select dropdown if qty=0
                        let xs = newElement(select,"option");
                        xs.value ="xs";
                        xs.innerText="X-small"};
                    if (sizes["s"] > 0){
                        let s = newElement(select,"option");
                        s.value ="s";
                        s.innerText="Small"};
                    if (sizes["m"] > 0){
                        let m = newElement(select,"option");
                        m.value ="m";
                        m.innerText="Medium"};
                    if (sizes["l"] > 0){
                        let l = newElement(select,"option");
                        l.value ="l";
                        l.innerText="Large"};
                    if (sizes["xl"] > 0){
                        let xl = newElement(select,"option");
                        xl.value ="xl";
                        xl.innerText="X-large"};
                    //Quantity
                    span = newElement(frame,"span");
                    label = newElement(span,"label")
                    label.innerText="Qty:";
                    let qty = newElement(span,"input");
                    let warning = newElement(span,"p");
                    let add = newElement(span,"button");
                    warning.setAttribute("id","warning");
                    add.innerText="Add";
                    qty.setAttribute("id","selectQty");
                    qty.type="number";
                    qty.min=1;
                    qty.value="";
                    qty.max=sizes["xs"];
                    if (sizes["xs"]==0&&sizes["s"]==0&&sizes["m"]==0&&sizes["l"]==0&&sizes["xl"]==0){
                        qty = document.getElementById("selectQty")
                        qty.max=0;
                    }
                    else{
                        qty.onmousedown=function(){                         // changes the input.max to the selected size
                            qtyMax("selectSize",sizes,qty,"size");
                            };
                        qty.onkeydown=function(){                           // blockes keybord except from backspace
                            var key = event.keyCode;
                            if(key == 8){
                                return true;
                            }
                            else{
                                return false;
                            };
                        };
                    };
                    function sizeFunction(){                                // set qty to empty when runned
                        let qty = document.getElementById("selectQty");
                        qty.value="";
                        }
                    add.onclick=function(){
                        let ent_size = document.getElementById("selectSize").value;         // gets the values and send it to ad_to_cart function
                        let ent_qty = parseInt(document.getElementById("selectQty").value);
                        let ent_max = document.getElementById("selectQty").max;
                        add_to_cart(ent_id,ent_name,ent_price,ent_size,ent_qty,ent_max);
                        document.getElementById("selectQty").value="";                      // set qty to empty again to prevent dobbel clicking in case the quantity is not available
                        };
                }
                else{
                    quantity = result[key]["quantity"]                                        // if the item is not merged with size table the same happens just without the select dropdown
                    sid=result[key]["sid"]
                    if (result[key]["collection"]=="True" && result[key]["quantity"]===0) {
                        let warning = newElement(frame,"p");
                        warning.innerText="This product is currently sold out but will be back in stock soon";
                        warning.classList.add("alert");
                        let hr = newElement(frame,"hr");
                    };
                    label = newElement(frame,"label");
                    label.innerText="Qty:";
                    let qty = newElement(frame,"input");
                    let warning = newElement(frame,"p");
                    warning.setAttribute("id","warning");
                    let add = newElement(frame,"button");
                    add.innerText="Add";
                    qty.setAttribute("id","selectQty");
                    qty.type="number";
                    qty.min=1;
                    qty.value="";
                    qty.max=quantity;
                    qty.onmousedown=function(){
                        let subtract = 0;
                        let qval = document.getElementById("selectQty");
                        for(i in shoppingcart){
                            if(shoppingcart[i]["sid"]==sid){
                                subtract = shoppingcart[i]["quantity"];
                            };
                        };
                        qval.max=quantity - subtract;
                    };
                    qty.onkeydown=function(){
                        var key = event.keyCode;
                        if(key == 8){
                            return true;
                        }
                        else{
                            return false;
                        };
                    };
                    add.onclick=function(){
                        let ent_qty = parseInt(document.getElementById("selectQty").value);
                        let ent_max = document.getElementById("selectQty").max;
                        add_to_cart(ent_id,ent_name,ent_price,null,ent_qty,ent_max);
                        document.getElementById("selectQty").value="";
                    };
                };        
            };
        };
    };
};
async function categorySelection(category){                 // clicking a category in the store triggers this function
    let reply = await fetch("/store")
    if (category == "All"){                                 // if category is All it filters nothing
        return store()
    }
    if (reply.status==200){
        let result = await reply.json()                     // if another category is selected it is sent to soreItems where it is filtered as the Specialize != null anymore
        let main = document.getElementById("store_div")
        main.innerHTML=""
        storeItems(result, category)
    }
}

async function updateCheckoutData(){                        // when a user clicks the checkout button the content in the shopping cart is sent to the database for updating
    filtered = shoppingcart.filter(function (el) {          // filter in case of empty objects in array
        return el != null;
      });
    for(key in filtered){                                   // push to checkout list
        checkoutdata.push({sid: filtered[key]["sid"],
                            quantity: filtered[key]["quantity"],
                            size: filtered[key]["size"]
        });
    };
    let reply = await fetch("/update-quantity", {           // send list backend
        method: "POST",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify(checkoutdata),
    });
    if(reply.status==200){
        let result = await reply.json();
        if(result==="* Not logged in"){
            displayMessages(result)
        }
        else{
        displayMessages(result);                            // display a message
        checkoutdata=[];                                    // empty both cart and checkout date
        shoppingcart=[];
        cart()
        };                                                  // load page to update and clear cart
    };
};

function totalPrice(){
    let tr = document.getElementById("TOTALPRICE")
    tr.innerText=""
    TOTALPRICE=0
    for (key in shoppingcart){                                                      // calculates the total price
        TOTALPRICE += (shoppingcart[key]["price"]*shoppingcart[key]["quantity"])    
    };
    if(TOTALPRICE==0){return;};                                                     // dont make elements if price is zero
    let th = newElement(tr,"th")
    th.innerText="Total"
    th = newElement(tr,"th")
    th.innerText=TOTALPRICE + "$"
    th = newElement(tr,"th")
    th.setAttribute("id","colspan")
    document.getElementById("colspan").colSpan=3;

};
