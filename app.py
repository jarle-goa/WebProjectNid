from NID_database import select_news, select_store, select_album, select_album, select_songs, select_tour, select_users
from NID_database import add_news, add_merch, add_album, add_songs, add_user, add_tour, add_size
from NID_database import check_hash_for_login, delete_tuple, edit_store, edit_size, replace_quantity
import sqlite3 as sql3
from flask import Flask, render_template, request, g, redirect, url_for, session, abort
from werkzeug.security import generate_password_hash,check_password_hash
from werkzeug.utils import secure_filename
from datetime import timedelta
import json
import os


# setting path for where uploaded files will go
UPLOAD_FOLDER = "static\images"
# setting which format that will be allowed to upload. File upload is only for admin so admin will only upload image types
ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "gif"]
app = Flask(__name__)
app.debug = True
app.secret_key=os.urandom(20)
# generate random secret key for session
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config['SESSION_COOKIE_SAMESITE'] = "Strict"
#just setting the SameSite to Strict to prevent notification in the console
DATABASE = "nid_db.db"

def get_database():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sql3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(ex):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
@app.before_request
def make_session_permanent():
    session.permanent = True
    app.permanent_session_lifetime = timedelta(minutes=20)
    # setting session to log out after 20 minutes

######################################################################################
#   _____  ___  ___  _____   ___  _____  ________  ___  ________  _____   ___  _____ #
#  /  __/ /  / /  / /     | /  / /  __/ /__   __/ /  / /  __   / /     | /  / /  __/ #
# /  __/ /  /_/  / /  /|  |/  / /  /_     /  /   /  / /  /_/  / /  /|  |/  / /__  /  #
#/__/   /_______/ /__/ |_____/ /____/    /__/   /__/ /_______/ /__/ |_____/ /____/   #
######################################################################################
def valid_login(username, password):
    conn = get_database()
    validate = check_hash_for_login(conn, username,password)
    #imported function from db, checking if hash match password and return true or false
    if validate == True:
        return True
    else:
        return False

def allowed_file(filename):
    # checking allowed files and compare it to the allowed_extensions list
    return "." in filename and filename.rsplit(".",1)[1].lower() in ALLOWED_EXTENSIONS
##################################################
#   ______   ________  ___  ___  ________  _____ #
#  /  _  /  /  __   / /  / /  / /__   __/ /  __/ #
# /     |  /  /_/  / /  /_/  /    /  /   /  __/  #
#/__/|__| /_______/ /_______/    /__/   /____/   #
##################################################

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/news")
def news():
    conn = get_database()
    news = select_news(conn)
    jsonNews = json.dumps(news)
    return jsonNews

@app.route("/store")
def store():
    conn = get_database()
    store = select_store(conn,session.get("username", None))
    # getting session to check if admin is logged in, if not TABLE store 'collection'=false, 'quantity'=0 will not be displayed
    #size = select_size(conn)
    jsonStore = json.dumps(store)
    return jsonStore

@app.route("/music")
def music():
    conn = get_database()
    album = select_album(conn)
    jsonAlbum = json.dumps(album)
    return jsonAlbum

@app.route("/songs")
def songs():
    conn = get_database()
    aid = request.args.get("aid", None)
    songs = select_songs(conn, aid)
    jsonSongs = json.dumps(songs)
    return jsonSongs

@app.route("/tour")
def tour():
    conn = get_database()
    tour = select_tour(conn)
    jsonTour = json.dumps(tour)
    return jsonTour

@app.route("/cart")
def cart():
    conn = get_database()
    tour = select_tour(conn)
    jsonTour = json.dumps(tour)
    return jsonTour

@app.route("/login", methods=["POST"])
def login():
    conn = get_database()
    user = request.get_json()
    username = user["username"]
    password = user["password"]
    validation = valid_login(username,password)
    # Checking if request from input matches encrypted password in database
    user_in_db = False
    users = select_users(conn)
    for i in range (len(users)):
        if users[i]["username"] == username:
            # Check if user is in database
            user_in_db = True
            break
    if user_in_db == False:
        # sends error message if not in database
        return json.dumps("NOT IN DATABASE")
    if validation == True:
        session["username"] = username
        return json.dumps(session["username"])
    return json.dumps(False)

@app.route("/logout")
def logout():
    session.pop("username")
    # removes user from session when logging out
    if session.get("username",None) == None:
        return json.dumps("You are now logged out")
    else:
        return json.dumps("* something went wrong")

@app.route("/newuser", methods=["POST"])
def newuser():
    new_user = request.get_json()
    username = new_user["username"]
    password = new_user["password"]
    email = new_user["email"]
    if username != "" and password != "" and email != "":
        #makes sure no fields from the request input is empty and returns bottom else: message
        conn = get_database()
        if add_user(conn,username,email,generate_password_hash(password)) == False:
            # returns false if primary key is being duplicated, meaning user or mail is all ready in database
            return json.dumps("* This username or email has already been used")
        else:
            add_user(conn,username,email,generate_password_hash(password))
            # if != false new user is added
            return json.dumps("Thank you for joining. Log in via the login bar in the top right corner")
    else:
        return json.dumps("* Some fields did not justify their criteria")

@app.route("/check_session")
def check_session():
    # checks session. This is so user will still stay logged in if one refreshes the page
    # without it the user would seem logged out on the web page, but would still be logged in in the session server side
    if session.get("username", None):
        return json.dumps(session["username"])
    else:
        return json.dumps(False)

@app.route("/admin")
def admin():
    # Ensures that the session actually is logged in as admin, if not a 401 unauthorized error code will be posted
    # error codes displays a custom 401 page
    checkSes = session.get("username",None)
    if checkSes == "admin":
        return json.dumps(True)
    else:
        abort(401)

@app.route("/editnews", methods=["POST"])
def editnews():
    checkSes = session.get("username",None)
    # add news by sending it to the database. Always checking that admin is logged in
    if checkSes == "admin":
        conn = get_database()
        get_post = request.get_json()
        header = get_post["header"]
        post = get_post["post"]
        if header != "" and post != "":
            add_news(conn,header,post)
            return json.dumps("News has been added to page and database")
        else:
            return json.dumps("* All fields needs to be filled")
    else:
        abort(401)

@app.route("/remove-tuple", methods=["POST"])
def removetuple():
    checkSes = session.get("username",None)
    # remove tuple, used used for several tables
    if checkSes == "admin":
        conn = get_database()
        get_info = request.get_json()
        table = get_info["table"]
        idnumber = get_info["id"]
        idName = get_info["idName"]
        delete_tuple(conn,table,idnumber,idName)
        return json.dumps("Tuple has been removed")
    else:
        abort(401)

@app.route("/edit-store", methods=["POST"])
def editstore():
    checkSes = session.get("username",None)
    if checkSes == "admin":
        conn = get_database()
        get_info = request.get_json()
        if "sid" in get_info:
            # if sid is in json request this means this is an existing tuple, so it will be edited
            sid = get_info["sid"]
            collection =get_info["collection"]
            quantity = get_info["quantity"]
            price = get_info["price"]
            category = get_info["category"]
            name = get_info["name"]
            image = get_info["image"]
            if collection != "" and price != "" and category != "" and name != "" and image != "":
                edit_store(conn,sid,collection,quantity,price,category,name,image)
                return json.dumps(f"Item with sid-number {sid} has been changed")
            else:
                return json.dumps("* All fields needs to be filled")
        else:
            # if sid is not to be found this means this is a new insertion so it will be added to the table
            collection = get_info["collection"]
            quantity = get_info["quantity"]
            price = get_info["price"]
            category = get_info["category"]
            name = get_info["name"]
            image = get_info["image"]
            if collection != "" and price != "" and category != "" and name != "" and image != "":
                if quantity == "":
                    quantity=0
                    # makes sure that if the admin sets quantity = 0 to ""(empty) it still ends up as 0
                add_merch(conn,collection,quantity,price,category,name,image)
                if bool(get_info["size"]) == True:
                    # if checkbox in adding new items to store is checked of this returns true, so the new item will get qty for them as well
                    sid = get_info["size_sid"]
                    xs = get_info["xs"]
                    s = get_info["s"]
                    m = get_info["m"]
                    l = get_info["l"]
                    xl = get_info["xl"]
                    if xs!="" and s!="" and m!="" and l!="" and xl!="":
                        add_size(conn,sid,xs,s,m,l,xl)
                    else:
                        return json.dumps("* All fields needs to be filled")
                return json.dumps(f"New item has been added to the store. Remember to upload image, and use filename '{image}'")
            else:
                return json.dumps("* All fields needs to be filled")
    else:
        abort(401)

@app.route("/edit-size", methods=["POST"])
def editsize():
    # an own edit size function as this was not possible to merge with the route above
    checkSes = session.get("username",None)
    if checkSes == "admin":
        conn = get_database()
        get_info = request.get_json()
        sid = get_info["size_sid"]
        xs = get_info["xs"]
        s = get_info["s"]
        m = get_info["m"]
        l = get_info["l"]
        xl = get_info["xl"]
        edit_size(conn,sid,xs,s,m,l,xl)
        return json.dumps(f"Size with sid # {sid} has been edited")
    else:
        abort(401)

@app.route("/upload", methods=["POST"])
def upload():
    # code from lecture examples
    if "file" not in request.files:
        return json.dumps("* No file part")
    file = request.files["file"]
    # if user does not select file, browser also
    # submit a empty part without filename
    if file.filename == "":
        return json.dumps("* No file selected in the form")
    if file and allowed_file(file.filename):
        # "secure" the filename (form input may be forged and filenames can be dangerous)
        filename = secure_filename(file.filename)
        # save the file to the upload folder
        file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        return json.dumps("Success")
    else:
        return json.dumps("* File type must be png, jpg, jpeg or gif")

@app.route("/add-tour", methods=["POST"])
def addtour():
    checkSes = session.get("username",None)
    if checkSes == "admin":
        conn = get_database()
        get_info = request.get_json()
        date = get_info["date"]
        place = get_info["place"]
        location = get_info["location"]
        if location != "" and place != "" and date != "":
            add_tour(conn, date, location, place)
            # makes sure no fields are empty
            return json.dumps("New tour date has been added")
        else:
            return json.dumps("* Some fields may have been empty")
    else:
        abort(401)


# update quantity for when a user checks out
@app.route("/update-quantity", methods=["POST"])
def updatequantity():
    checkSes = session.get("username", None)
    # a user needs to be logged in
    if checkSes != None:
        conn = get_database()
        get_info = request.get_json()
        if len(get_info) == 0:
            return json.dumps("* There are no items in your cart")
        for i in range (len(get_info)):
            if get_info[i]["size"] != None:
                # all entries return a size, but if it has no size its set to None, so if size is not none update both tables store and size
                replace_quantity(conn,get_info[i]["quantity"],"size",get_info[i]["sid"],get_info[i]["size"])
                replace_quantity(conn,get_info[i]["quantity"],"store",get_info[i]["sid"],"quantity")
            else:
                # if size is none update only store table
                replace_quantity(conn,get_info[i]["quantity"],"store",get_info[i]["sid"],"quantity")
        return json.dumps("Thank you for shopping our merch, hope to see you again")
    else:
        return json.dumps("* Not logged in")

@app.route("/validate", methods=["POST"])
def validate():
    user = request.get_json()
    username = user["username"]
    password = user["password"]
    validation = valid_login(username,password)
    if session.get("username",None) == "admin" and validation == True:
        return json.dumps(True)
    else:
        return json.dumps(False)



if __name__ == "__main__":
    print("Server for NID's webpage is now running.....")
    app.run(debug=True)
