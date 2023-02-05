# Exam project Web programing DAT310 2021
## How to run
- Open app.py and run the script
- nid_db.db is included, but if running NID_database.py note that there is a delay for setting timestamp. takes approximal 5-7 sec to run
- From Run: console press the link 127.0.0.1:5000/ or run it from a browser


## Functionalities
- Login as admin to test most functionalities
	- Username: admin, password: admin
	- This displays a hidden option in the aside menu opening up for editing, deleting and inserting new tuples.
- Functionalities are being filtered and checked both in database, flask and js,
<br>so I’ve split them into where the different functionalities are being executed
### Backend
#### Sqlite3
- Using CURRENT_TIMESTAMP, for later use in Additional features, Storage and display of dates.
- Checking encrypted passwords with check_password_hash from werkzeug.security.
- Filtering news table to only return 5 newest entries.
- The idea of store having the attribute 'collection'(true or false) is that an item
<br>may still be in store even though it is out of production. And also, an item may have
<br>zero quantity but still be in production.
	- Backend, if collection is false, and quantity is zero, then it's not being appended
<br>to the store list.
	- Unless admin is logged in, then all items will show.
- Table size and store are separated and are being merged if sid's correlate.
- Passed dates for tour dates are not being returned to server or web page.
- Updating store and size set up to use same function. Subtraction is being done in
<br>sql statement instead of having to store it as a table and using join queries

#### Flask
- Generating hash password with werkzeug.security generate_password_hash.
- And securing uploaded files with secure_filename werkezug.utils.
- Generating random secret_key
- Session cookies samsite is set to 'Stric', though this can negatively affect browsing
<br>nothing has been noticed to affect it.
- Session log out is set to 20 min.
- New user, password and mail can't be empty, and same username or mail can't be duplicated.
- Refreshing the site keeps the user logged in if he/she hasn't pressed the log out button yet.
- All admin features has a check that checks session. If admin is not logged in and a feature
<br>is tried to be accessed an abort(401) will be returned and this will display a custom
<br>unauthorized page.
	- login as admin to load script, log out and run makeAdminPage() in console to test.
- None of the fields where admin can edit, update, and insert tuples are allowed to be empty.
- Checking backend before checkout that a user is actually logged in

### Frontend
#### Js
##### main and login
- Logging in displays a green box welcoming you. If user is not found in the database
<br>a new page will be loaded with red message and registration form.
- Cant register with an existing username or email. Email form is being checked. username and password can't be empty.
<br>displays a message specifying each error that may occur.
- logging in and out changes the icon to indicate log in or out symbol
- empties text in input field if logging is a success.
- you can enter the mains in url window, not case sensitive(/#news, /#store, /#music, /#tour, /#cart, /#registration)

##### Store
- If a new Category is added it is displayed in the filter
- Items sold out or few left will be displayed in the overview (few left will only be displayed if collection=false)
- Collection=false and quantity=0 will not be displayed at all
- Max quantity depends on the quantity for the given item or size
- Quantity of a product added to the cart is subtracted from max quantity of that give item
<br>f.ex if max quantity is 30 and you add 5 to cart, you can't select more than 25
- cant add to cart if no quantity is selected, warning displayed
- sizes with no quantity is not an option in the dropdown
- only the arrows in the quantity input is allowed
##### Cart
- Item quantity can be altered in the store and can also be deleted.
<br>They can not exceed what is available in store
- total price row is only displayed if there is something in the cart
- need to be logged in to checkout. Error messaged displayed, does not empty cart
- checking out empties the cart and displays success message
##### Tour
- Displays dates

##### AdminPage
- Is displayed when logging in as admin.
- Store edit/removes/add
	- sid is locked for edits. only displayed to get the value
	- can’t update or add new if any fields are empty
	- items with sizes lock the quantity input and is calculated by the total.
<br>same with adding new items with size
	- columns with numbers is locked for character
	- adding new item has a checkbox for size and displays a new row if checked of.
<br>this also locks quantity for new items.
- Tour
	- can add dates
	- checks that iso is 2 or 3 before comma
	- no fields can be empty and displays error message if any errors
- Upload files
	- demands validation asking admin to reenter username and password and sends only
<br> if validation is a success. Displays message if so
#### Css
- in Chrome the scrollbar is black and slim in the music
- social icons shakeing on hoover
- animate line under menu and headers for each page
- screen at 480px sets logo as background image

## Credits
- [1.1] https://www.codegrepper.com/code-examples/javascript/empty+value+in+array+javascript
<br>Code used in function updateCheckoutData() in store.js and cart() in menu.js.

- [1.2] https://usefulangle.com/post/310/javascript-file-upload-fetch
<br>Function uploadFile() in admin-removes-edits.js.

- [1.3] scriptInHead(url) used in functions.js is inspired by a script found on a website, but unfortunaly I can't find the url for it.

- [1.4] https://stackoverflow.com/questions/281264/remove-empty-elements-from-an-array-in-javascript
<br>filtering empty lists used in several places. 

- [1.5] [2.3] https://www.w3schools.com/howto/howto_css_modals.asp
<br> Modal box used for popup window to verify password when editing as admin

- [2.1] https://www.w3schools.com/howto/howto_css_shake_image.asp
<br>Shaking icons

- [2.2] https://paulund.co.uk/css-animation-link-underline
<br> animate underline
