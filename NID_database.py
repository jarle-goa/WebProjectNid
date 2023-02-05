# NOTE: Running the database takes about 7 seconds because of time.sleep function#

import sqlite3 as sql3
from sqlite3 import Error
from werkzeug.security import generate_password_hash, check_password_hash

# time.sleep used in inserting data for table news. This is #
# just to create 1 second difference between them as the table stores date #
# using CURRENT_TIMESTAMP #
import time
from datetime import datetime

# Store the datebase as nid_db.db #
database = r"nid_db.db"

# establish connection with a database file #
def connection(db_file):
    conn = None
    try:
        conn = sql3.connect(db_file)
        return conn
    except Error as E:
        print(E)
    return conn

# Code snippets for creating the tables #
table_news = """CREATE TABLE IF NOT EXISTS news (
                date DATETIME,
                head TEXT,
                post TEXT);"""

table_store = """CREATE TABLE IF NOT EXISTS store (
                    sid INTEGER PRIMARY KEY NOT NULL,
                    collection TEXT NOT NULL,
                    quantity INTEGER,
                    price INTEGER NOT NULL,
                    category TEXT NOT NULL,
                    name TEXT NOT NULL,
                    image TEXT NOT NULL);"""
# size is separated from store as not all items have a size. They are being merged in App.py if sid's correlate
table_size = """CREATE TABLE IF NOT EXISTS size (
                    sid INTEGER PRIMARY KEY NOT NULL,
                    xs INTEGER,
                    s INTEGER,
                    m INTEGER,
                    l INTEGER,
                    xl INTEGER,
                    FOREIGN KEY (sid) REFERENCES store (sid)
                    );"""

table_album = """CREATE TABLE IF NOT EXISTS album (
                    aid INTEGER PRIMARY KEY NOT NULL,
                    title TEXT NOT NULL,
                    cover TEXT NOT NULL,
                    year INTEGER
                    );"""

table_song = """CREATE TABLE IF NOT EXISTS songs (
                aid INTEGER,
                lid INTEGER,
                title TEXT,
                lyrics TEXT,
                FOREIGN KEY (aid) REFERENCES album (aid)
                );"""

table_tour = """CREATE TABLE IF NOT EXISTS tour (
                date TEXT,
                location TEXT,
                place TEXT
                );"""

table_users = """CREATE TABLE IF NOT EXISTS users (
                    uid INTEGER PRIMARY KEY NOT NULL,
                    username TEXT UNIQUE,
                    mail TEXT UNIQUE,
                    passhash TEXT
                    );"""



# Functions for creating and dropping tables #
# dropping tables is mainly for testing and not duplicating entry's #
def drop_table(conn, table):
    cur = conn.cursor()
    try:
        sql = f"DROP TABLE {table}"
        cur.execute(sql)
    except Error as E:
        print(E)
    else:
        print(f"    !!Table {table} has successfully been deleted!!")

def create_table(conn, table):
    try:
        cur = conn.cursor()
        cur.execute(table)
    except Error as E:
        print(E)
    else:
        print(f"Table has successfully been created")

# Functions for inserting into table #
### NEWS ###
# Table news takes in heading and the content of the post.
# Date is set to retrieve date from server and uses that as the date to when the post was created
def add_news(conn, head, post):
    sql = """INSERT INTO news(date,head,post)
                VALUES(CURRENT_TIMESTAMP,?,?)"""
    try:
        cur = conn.cursor()
        cur.execute(sql, (head, post))
        conn.commit()
    except Error as E:
        print(E)

### STORE ###
def add_merch(conn, collection, quantity, price, category, name, image):
    # sid auto increments, so it's not an input argument
    sql = """INSERT INTO store(collection,quantity,price,category,name,image)
                VALUES(?,?,?,?,?,?)"""
    try:
        cur = conn.cursor()
        cur.execute(sql, (collection, quantity, price, category, name, image))
        conn.commit()
    except Error as E:
        print(E)

def add_size(conn, sid, xs=0,s=0,m=0,l=0,xl=0):
    # all sizes are set to zero in case user enters a quantity 0 as " " (empty)
    sql = f"""INSERT INTO size (sid,xs,s,m,l,xl)
                VALUES(?,?,?,?,?,?)"""
    try:
        cur = conn.cursor()
        cur.execute(sql, (sid,xs,s,m,l,xl))
        conn.commit()
    except Error as E:
        print(E)

### MUSIC ###
def add_album(conn, title, cover, year):
    # aid auto increments, so it's not an input argument
    sql = """INSERT INTO album(title,cover,year)
            VALUES(?,?,?)"""
    try:
        cur = conn.cursor()
        cur.execute(sql, (title, cover, year))
        conn.commit()
    except Error as E:
        print(E)

def add_songs(conn, aid, lid, title, lyrics):
    sql = """INSERT INTO songs(aid,lid,title,lyrics)
            VALUES(?,?,?,?)"""
    try:
        cur = conn.cursor()
        cur.execute(sql, (aid, lid, title, lyrics))
        conn.commit()
    except Error as E:
        print(E)

### TOUR ###
def add_tour(conn, date, location, place):
    # Tour has no id or primary key. The thought is that one cant have 2 shows at the same day
    # (though it could be possible),so for simplicity it's kept this way. When removing a tour-date all dates
    # that match the condition will be removed
    sql = """INSERT INTO tour(date,location,place)
                VALUES(?,?,?)"""
    try:
        cur = conn.cursor()
        cur.execute(sql, (date, location, place))
        conn.commit()
    except Error as E:
        print(E)

### USERS ###
def add_user(conn, username, mail, passhash):
    # uid auto increments, so it's not an input argument
    sql = """INSERT INTO users(username,mail,passhash)
                VALUES(?,?,?)"""
    try:
        cur = conn.cursor()
        cur.execute(sql, (username, mail, passhash))
        conn.commit()
    except Error:
        # returns false for checking in app.py. returns fals if anny error, most likely error is duplicates of primary key
        return False

# function under checks if password sent from the web matches the encrypted hash
# returns true or false fro further checking in app.py
def check_hash_for_login(conn, username, pasw):
    cur = conn.cursor()
    try:
        sql = ("SELECT passhash FROM users WHERE username = ?")
        cur.execute(sql, (username,))
        for row in cur:
            (password,) = row
            pw = password
            cross_check = check_password_hash(pw, pasw)
            if cross_check == True:
                return True
            else:
                return False
        else:
            return None
    except Error as err:
        print("Error: {}".format(err))

# Functions for making table to list/dict #
# Selecting tables #
def select_news(conn):
    news = []
    cur = conn.cursor()
    cur.execute("SELECT * FROM news ORDER BY date DESC LIMIT 5;")
    # selects only the 5 newest entries and orders them decreasingly from date
    for (date, head, post) in cur:
        news.append({
            "date": date,
            "head": head,
            "post": post})
    return news


## NOTE: In the store the column 'collection' tells if the product is still in production or not
##       but it will still be stored in the database, so the if-statement in the function under
##       makes sure that out-of-stock product that is sold out does not make it to the jsscript
def select_store(conn,session=None):
    store = []
    size = []
    cur = conn.cursor()
    curr = conn.cursor()
    cur.execute("SELECT * FROM store")
    curr.execute("SELECT * FROM size")
    for (sid, collection, quantity, price, category, name, image) in cur:
        if collection == "False" and quantity == 0 and session != "admin":
            # ensures that the admin gets a view of all tuples from the table, regardless if its sold out and out of stock
            pass
        else:
            store.append({
                "sid":sid,
                "collection":collection,
                "quantity":quantity,
                "price":price,
                "category":category,
                "name":name,
                "image":image})
    for (sid, xs, s, m, l, xl) in curr:
        size.append({
            "sid":sid,
            "xs":xs,
             "s":s,
             "m":m,
             "l":l,
             "xl":xl})
    for key in store:
        for sid in size:
            if key["sid"] == sid["sid"]:
                key["size"] = sid
                # merges size and store table if sid's correlate in both tables
    return store

def select_album(conn):
    album = []
    cur = conn.cursor()
    cur.execute("SELECT * FROM album")
    for (aid, title, cover, year) in cur:
        album.append({
            "aid":aid,
            "title":title,
            "cover":cover,
            "year":year
        })
    return album

def select_songs(conn, album_id):
    songs = []
    cur = conn.cursor()
    cur.execute(f"SELECT * FROM songs WHERE aid={album_id}")
    for (aid,lid,title,lyrics) in cur:
        songs.append({
            "aid":aid,
            "lid":lid,
            "title":title,
            "lyrics":lyrics
        })
    return songs

def select_tour(conn):
    tour = []
    now = datetime.today().strftime('%Y-%m-%d')
    # gets today date from server
    cur = conn.cursor()
    cur.execute ("SELECT * FROM tour")
    for (date, location, place) in cur:
        today = datetime.strptime(now, "%Y-%m-%d").date()
        tourdate = datetime.strptime(date, "%Y-%m-%d").date()
        # Sets both format to the same before checking if tour-date has passed
        # if tour-date has passed it will not be posted frontend
        if tourdate >= today:
            tour.append({
                "date":date,
                "location":location,
                "place":place
            })
    return tour

def select_users(conn):
    users = []
    cur = conn.cursor()
    cur.execute("SELECT * FROM users")
    for (uid, username, mail, passhash) in cur:
        users.append({
            "uid":uid,
            "username":username,
            "mail":mail,
            "passhash":passhash
        })
    return users

## Editing, removing, special filtering etc for tables ##

def delete_tuple(conn,fromTable,onCondition,idName):
    sql = f"""DELETE FROM {fromTable} WHERE {idName}='{onCondition}'"""
    # Set up so its able to use for all tables, id names may wary from ids, idu, idt etc
    try:
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()
    except Error as E:
        print(E)

# updates changes for the store table, mainly intended for admin editing
def edit_store(conn, sid, collection,quantity,price,category,name,image):
    sql = f"""UPDATE store SET 
            collection='{collection}', 
            image='{image}', 
            name='{name}', 
            category='{category}', 
            price={price}, 
            quantity={quantity} 
            WHERE sid={sid}"""
    try:
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()
    except Error as E:
        print(E)
# updates changes for the size table, mainly intended for admin editing
def edit_size(conn,sid,xs,s,m,l,xl):
    sql = f"""UPDATE size SET 
            xs={xs}, 
            s={s}, 
            m={m}, 
            l={l}, 
            xl={xl} 
            WHERE sid={sid}"""
    try:
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()
    except Error as E:
        print(E)

# Remove/update quantity from store and size, used for when a customer checks out and complete its order
# Set up to fit both store and size table
def replace_quantity(conn, subtract,table,sid,si_or_qt):
    qty=None
    sql_qty = f"""SELECT {si_or_qt}-{subtract} FROM {table} WHERE sid={sid}"""
    # si_or_qt is checked in app.py whether it is quantity(used for store) or 'xs','s' etc (used for size)
    # subtracts the amount bought in the sql statement
    try:
        cur_qty = conn.cursor()
        cur_qty.execute(sql_qty)
        qty=cur_qty.fetchone()[0]
        # fetchone to only fetch that one quantity, run it before the next update statement
        # so we can update the calculated new quantity to the table
        sql_update= f"""UPDATE {table} SET {si_or_qt}={qty} WHERE (sid={sid})"""
        cur_update = conn.cursor()
        cur_update.execute(sql_update)
        conn.commit()
    except Error as E:
        print(E)


# insertion for testing database
def ins_news(conn):
    ins = [("This should not be displayed","Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."),
            ("Some old post2","Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. "),
            ("Some old post1", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."),
            ("Studio Time","The amount of new material has now been finetuned and we’re scheduled for a month in ...bla bla"),
            ("Halfway Through","We're done with most of the drums, bass and guitars. Now only vocals, editing and mastering is left..."),
            ("New Release","We’re finally done with our recordings for the latest album and it will be out this spring. The sound is…bla bla bla….. etc")]
    for i in ins:
        add_news(conn,i[0],i[1])
        time.sleep(1)
        # timesleep used to get 1 second between the datestamp in news


def ins_merch(conn):
    ins = [("True", 150,12,"Clothes","white t-shirt Logo","white-t-logo.jpg"),
           ("True",130,12,"Clothes","black t-shirt Logo","black-t-logo.jpg"),
           ("False",10,15,"Media","LP PartII: Verden","part2-cover.jpg"),
           ("False",0,15,"Media","LP PartI: Bunnen","part1-cover.jpg"),
           ("True",0,15,"Media","LP PartIII: Apoteose","part3-cover.jpg"),
           ("True",25,9,"Accessories", "Baseball Cap Black Logo","baseball-cap-logo.jpg")]
    for i in ins:
        add_merch(conn,i[0],i[1],i[2],i[3],i[4],i[5])

def ins_size(conn):
    ins = [(1,30,30,0,30,60),(2,32,20,26,26,26)]
    for i in ins:
        add_size(conn,i[0],i[1],i[2],i[3],i[4],i[5])

def ins_album(conn):
    ins = [("Part I:Bunnen","part1-cover.jpg","2018"),
           ("Part II:Verden","part2-cover.jpg","2019"),
           ("Part III:Apoteose","part3-cover.jpg","2020")]
    for i in ins:
        add_album(conn, i[0], i[1], i[2])

def ins_song(conn):
    ins = [(1,1,"song 1.1", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec molestie eros. Etiam ullamcorper nisl semper, tempus sem sit amet, ultrices ante. Aenean consequat sit amet ligula nec luctus. Proin sollicitudin molestie efficitur. Curabitur sed neque in justo blandit cursus. Pellentesque sed turpis id turpis placerat luctus sed eget lacus. Morbi a fermentum enim. Proin ut lectus libero. Nunc quis lectus gravida, convallis arcu interdum, cursus sem. Fusce sem augue, semper sed pretium sit amet, pellentesque vitae leo. Curabitur fermentum sit amet nunc eget vestibulum. Maecenas ac convallis metus. Fusce laoreet volutpat erat, id tempus enim accumsan vitae. Vivamus auctor dignissim libero, malesuada egestas tortor commodo sit amet. Suspendisse eu bibendum neque. Praesent sit amet leo sit amet urna tincidunt luctus id eu sapien. Donec fringilla dapibus pellentesque. Proin commodo risus eu consequat blandit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut pharetra libero quis eleifend dictum. Morbi tempor sollicitudin justo, eu pellentesque nibh placerat eget. Cras eros est, rutrum sed odio eget, egestas sodales justo. Vestibulum porttitor, sem id venenatis sagittis, dui leo facilisis lectus, vel vulputate magna diam eget ex. Mauris egestas feugiat sollicitudin. Ut in suscipit odio. Ut et massa dui. Aliquam massa ante, gravida quis tincidunt eu, pellentesque vel dolor. Nunc imperdiet gravida odio. Donec suscipit eros sed lacus maximus ultrices. Donec faucibus quam ac faucibus iaculis. Sed erat nulla, volutpat a metus et, vestibulum vehicula augue. Nulla facilisi. Maecenas id justo vel nunc porttitor tempus. Donec eleifend feugiat scelerisque. Mauris in ultricies sem. In hac habitasse platea dictumst. Nullam dictum, odio eu tempor lobortis, nunc sem dapibus est, eget hendrerit quam mauris eget libero. Curabitur interdum nisl posuere odio pretium, nec fermentum risus imperdiet. Vivamus faucibus nibh at egestas dictum. Duis elementum erat eu pretium hendrerit. Vestibulum enim ante, ullamcorper vitae quam ac, interdum varius mauris. Cras sit amet neque congue nunc accumsan egestas. Pellentesque elementum, erat ut porttitor gravida, ipsum ipsum commodo purus, a cursus felis arcu at odio. Donec quis lorem felis. Duis sit amet auctor massa, eget interdum dui. Curabitur sit amet enim at ex porta iaculis. Vivamus hendrerit mi vitae turpis condimentum sollicitudin. Donec laoreet lacinia quam id viverra. Vivamus rutrum sem vel nulla malesuada, a viverra risus eleifend. Cras suscipit urna massa, sit amet vulputate elit auctor nec. Phasellus convallis turpis ut tu pis congue, nec laoreet nunc ultricies. Nam cursus efficitur efficitur. Aliquam tincidunt finibus leo eu placerat. Nam a bibendum urna. Praesent eget maximus lacus. Nullam molestie enim sit amet ipsum rutrum, eget eleifend diam tempus. Nullam metus elit, commodo quis tempor in, ullamcorper sed elit. Curabitur eu risus ullamcorper, vulputate sapien vel, rhoncus eros. "),
           (1,2,"song 1.2", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec molestie eros. Etiam ullamcorper nisl semper, tempus sem sit amet, ultrices ante. Aenean consequat sit amet ligula nec luctus. Proin sollicitudin molestie efficitur. Curabitur sed neque in justo blandit cursus. Pellentesque sed turpis id turpis placerat luctus sed eget lacus. Morbi a fermentum enim. Proin ut lectus libero. Nunc quis lectus gravida, convallis arcu interdum, cursus sem. Fusce sem augue, semper sed pretium sit amet, pellentesque vitae leo. Curabitur fermentum sit amet nunc eget vestibulum. Maecenas ac convallis metus. Fusce laoreet volutpat erat, id tempus enim accumsan vitae. Vivamus auctor dignissim libero, malesuada egestas tortor commodo sit amet. Suspendisse eu bibendum neque. Praesent sit amet leo sit amet urna tincidunt luctus id eu sapien. Donec fringilla dapibus pellentesque. Proin commodo risus eu consequat blandit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut pharetra libero quis eleifend dictum. Morbi tempor sollicitudin justo, eu pellentesque nibh placerat eget. Cras eros est, rutrum sed odio eget, egestas sodales justo. Vestibulum porttitor, sem id venenatis sagittis, dui leo facilisis lectus, vel vulputate magna diam eget ex. Mauris egestas feugiat sollicitudin. Ut in suscipit odio. Ut et massa dui. Aliquam massa ante, gravida quis tincidunt eu, pellentesque vel dolor. Nunc imperdiet gravida odio. Donec suscipit eros sed lacus maximus ultrices. Donec faucibus quam ac faucibus iaculis. Sed erat nulla, volutpat a metus et, vestibulum vehicula augue. Nulla facilisi. Maecenas id justo vel nunc porttitor tempus. Donec eleifend feugiat scelerisque. Mauris in ultricies sem. In hac habitasse platea dictumst. Nullam dictum, odio eu tempor lobortis, nunc sem dapibus est, eget hendrerit quam mauris eget libero. Curabitur interdum nisl posuere odio pretium, nec fermentum risus imperdiet. Vivamus faucibus nibh at egestas dictum. Duis elementum erat eu pretium hendrerit. Vestibulum enim ante, ullamcorper vitae quam ac, interdum varius mauris. Cras sit amet neque congue nunc accumsan egestas. Pellentesque elementum, erat ut porttitor gravida, ipsum ipsum commodo purus, a cursus felis arcu at odio. Donec quis lorem felis. Duis sit amet auctor massa, eget interdum dui. Curabitur sit amet enim at ex porta iaculis. Vivamus hendrerit mi vitae turpis condimentum sollicitudin. Donec laoreet lacinia quam id viverra. Vivamus rutrum sem vel nulla malesuada, a viverra risus eleifend. Cras suscipit urna massa, sit amet vulputate elit auctor nec. Phasellus convallis turpis ut tu pis congue, nec laoreet nunc ultricies. Nam cursus efficitur efficitur. Aliquam tincidunt finibus leo eu placerat. Nam a bibendum urna. Praesent eget maximus lacus. Nullam molestie enim sit amet ipsum rutrum, eget eleifend diam tempus. Nullam metus elit, commodo quis tempor in, ullamcorper sed elit. Curabitur eu risus ullamcorper, vulputate sapien vel, rhoncus eros. "),
           (1,3,"song 1.3", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec molestie eros. Etiam ullamcorper nisl semper, tempus sem sit amet, ultrices ante. Aenean consequat sit amet ligula nec luctus. Proin sollicitudin molestie efficitur. Curabitur sed neque in justo blandit cursus. Pellentesque sed turpis id turpis placerat luctus sed eget lacus. Morbi a fermentum enim. Proin ut lectus libero. Nunc quis lectus gravida, convallis arcu interdum, cursus sem. Fusce sem augue, semper sed pretium sit amet, pellentesque vitae leo. Curabitur fermentum sit amet nunc eget vestibulum. Maecenas ac convallis metus. Fusce laoreet volutpat erat, id tempus enim accumsan vitae. Vivamus auctor dignissim libero, malesuada egestas tortor commodo sit amet. Suspendisse eu bibendum neque. Praesent sit amet leo sit amet urna tincidunt luctus id eu sapien. Donec fringilla dapibus pellentesque. Proin commodo risus eu consequat blandit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut pharetra libero quis eleifend dictum. Morbi tempor sollicitudin justo, eu pellentesque nibh placerat eget. Cras eros est, rutrum sed odio eget, egestas sodales justo. Vestibulum porttitor, sem id venenatis sagittis, dui leo facilisis lectus, vel vulputate magna diam eget ex. Mauris egestas feugiat sollicitudin. Ut in suscipit odio. Ut et massa dui. Aliquam massa ante, gravida quis tincidunt eu, pellentesque vel dolor. Nunc imperdiet gravida odio. Donec suscipit eros sed lacus maximus ultrices. Donec faucibus quam ac faucibus iaculis. Sed erat nulla, volutpat a metus et, vestibulum vehicula augue. Nulla facilisi. Maecenas id justo vel nunc porttitor tempus. Donec eleifend feugiat scelerisque. Mauris in ultricies sem. In hac habitasse platea dictumst. Nullam dictum, odio eu tempor lobortis, nunc sem dapibus est, eget hendrerit quam mauris eget libero. Curabitur interdum nisl posuere odio pretium, nec fermentum risus imperdiet. Vivamus faucibus nibh at egestas dictum. Duis elementum erat eu pretium hendrerit. Vestibulum enim ante, ullamcorper vitae quam ac, interdum varius mauris. Cras sit amet neque congue nunc accumsan egestas. Pellentesque elementum, erat ut porttitor gravida, ipsum ipsum commodo purus, a cursus felis arcu at odio. Donec quis lorem felis. Duis sit amet auctor massa, eget interdum dui. Curabitur sit amet enim at ex porta iaculis. Vivamus hendrerit mi vitae turpis condimentum sollicitudin. Donec laoreet lacinia quam id viverra. Vivamus rutrum sem vel nulla malesuada, a viverra risus eleifend. Cras suscipit urna massa, sit amet vulputate elit auctor nec. Phasellus convallis turpis ut tu pis congue, nec laoreet nunc ultricies. Nam cursus efficitur efficitur. Aliquam tincidunt finibus leo eu placerat. Nam a bibendum urna. Praesent eget maximus lacus. Nullam molestie enim sit amet ipsum rutrum, eget eleifend diam tempus. Nullam metus elit, commodo quis tempor in, ullamcorper sed elit. Curabitur eu risus ullamcorper, vulputate sapien vel, rhoncus eros. "),
           (2,1,"song 2.1", "lyrics"),
           (2,2,"song 2.2", "lyrics"),
           (2,3,"song 2.3", "lyrics"),
           (3,1,"song 3.1", "lyrics"),
           (3,2,"song 3.2", "lyrics"),
           (3,3,"song 3.3", "lyrics")]
    for i in ins:
        add_songs(conn,i[0],i[1],i[2],i[3])

def ins_tour(conn):
    ins = [("2023-08-10","Uffa Huset","NO, Trondheim"),
           ("2021-08-11","Garage","NO, Bergen"),
           ("2021-07-29","Checkpoint","NO, Stavanger"),
           ("2021-07-26","Kick Scene","NO, Kristiansand"),
           ("2021-07-14","John Doe","NO, Oslo"),
           ("2020-07-07","Folken","NO, Stavanger"),
           ("2020-07-02","John Doe","NO, Oslo"),
           ("2020-06-26","Somewhere", "NA/NA")]
    for i in ins:
        add_tour(conn,i[0],i[1],i[2])

def ins_user(conn):
    ins = [("johndoe", "john@doe.com",generate_password_hash("password!")),
           ("gunnar", "gunnar@mail.com",generate_password_hash("password.")),
           ("marykay", "mary@kay.net",generate_password_hash("password?")),
           ("admin", "admin@nid.no",generate_password_hash("admin"))]
    for i in ins:
        add_user(conn,i[0],i[1],i[2])

def initiate():
    conn = connection(database)
    if conn is not None:
        drop_table(conn,"news")
        drop_table(conn,"store")
        drop_table(conn,"size")
        drop_table(conn,"album")
        drop_table(conn,"songs")
        drop_table(conn,"users")
        drop_table(conn,"tour")
        create_table(conn, table_news)
        create_table(conn, table_store)
        create_table(conn, table_size)
        create_table(conn, table_album)
        create_table(conn, table_song)
        create_table(conn, table_users)
        create_table(conn, table_tour)
        print("Pleas wait while inserting sqlite3 TIMESTAMP.....")
        ins_news(conn)
        print(".....sqlite3 TIMESTAMP Done")
        ins_merch(conn)
        ins_size(conn)
        ins_album(conn)
        ins_song(conn)
        ins_tour(conn)
        ins_user(conn)
        conn.close()

if __name__ == '__main__':
    initiate()
