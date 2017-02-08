var User = require("./models/user");

var items = require('./models/item')

module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user,
            items: items
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
            
            
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messagesrs
        }));
        
        //add to items to cart through /add-to-cart route
        app.post('/add-to-cart', isLoggedIn, function(req, res) {
            User.findOne({_id: req.user._id}, function(err, user) {
                var itemId = req.body.id;
                var price = items[itemId].price;
                var title = items[itemId].title;
                var qty = items[itemId].qty;
                //because itemId is dynamic, it has to use[ ]bracket notation.

                if(!user.local.cart) {
                    user.local.cart = {}
                }
                
                if(typeof user.local.cart[itemId] === 'undefined'){
                     user.local.cart[itemId] =  {
                        title: title,
                        id: itemId,
                        qty: qty,
                        price: price
                    }
                } 
                
                else{
                    user.local.cart[itemId].qty += 1;
                    // user.local.cart[itemId].price = user.local.cart[itemId].qty * user.local.cart[itemId].price;
                }
                
                user.markModified('local.cart');
                //have to tell mongoose that local.cart is modified;
                user.save(function(err, user) {
                    res.send(user);
                });
            });
          
        });
     
        
        app.get('/shopping-cart', isLoggedIn, function(req, res) {
            User.findOne({_id: req.user._id}, function(err, user) {
                //delete null on mongod shell
                //add empty cart message
                var cart = [];
                //console.log(itemId) = undefined
                for(var id in user.local.cart){
                    cart.push(id);
                }
                
                var cartItems = cart.map(id => user.local.cart[id] );
                //cartItems = [ { title: 'Kale', id: '1', qty: 2, price: 6056 }...]
                //map gives us new array, doesn't change the orignal array.
                console.log(cartItems)
                res.render('shopping-cart.ejs', { 
                    cartItems: cartItems
                    //this cartItems should be renderd in html
                });
            });
        });
        
        // delete item from cart route
        app.delete('/delete-item', isLoggedIn, function(req, res) {
            User.findOne({_id: req.user._id}, function(err, user) {
                
                var id = req.body.id;
                //console.log(user.local.cart);
               
                for(var itemId in user.local.cart){
                    //user.local.cart[id] will give us user.local.cart[id]'s value
                    if(itemId == id){
                        user.local.cart[itemId].qty = user.local.cart[itemId].qty -1;
                        // user.local.cart[itemId].price = items[itemId].price;
                        if(user.local.cart[itemId].qty == 0){
                            delete user.local.cart[itemId]
                        }
                    }
                }
                user.markModified('local.cart');
    
                user.save(function(err, user) {
                    console.log('after i insert modifed', user.local.cart);
                    res.send(user);
                    
                });
            });
        });
        
        
        
        
        app.delete('/empty-cart', isLoggedIn, function(req, res){
            User.findOne({_id: req.user.id}, function(err, user){
                user.local.cart = {};
                user.markModified('local.cart');
                user.save(function(err, user) {
                    console.log('after i empty', user.local.cart);
                    res.send(user);
                });
            })
        })
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}