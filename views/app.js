
$(document).ready(function() {
    var totalPrice = function() {
        var total = 0
        var prices = $('.price-totals')
        prices.each(function(price) {
            var priceString = prices[price];
        
            total += parseFloat((priceString).innerText);
            console.log(total.toFixed(2))
        })
        $('.grossPrice').html(total.toFixed(2));
      
    }
    totalPrice()
    
    $('.no-items-in-cart').hide()
    
    function showEmptyCartMessage() {
        if(!$('.qty').length) {
            $('.no-items-in-cart').show();
            $('#checkout').attr('disabled', true)
        } else {
            $('.no-items-in-cart').hide()
            $('#checkout').attr('disabled', false)
        }
    }
    
    showEmptyCartMessage()
    
    $(".add-to-cart").on("click", function() {
        var id = $(this).attr('data-id'); 
        console.log("add to cart",id)
        toastr.success("Item add to cart successfully")
        
        var data = {
            id: id,
            //qty: data.qty
        }
        
        $.ajax({
            url:'/add-to-cart',
            data: data,
            type: 'POST'
        })
    })
    
    //delete item from cart
    $(".delete-item").on("click", function() { 
        var self = $(this);
        var id = self.attr('data-id'); 
        var data= {
            id:id
        }
    
        $.ajax({
            url: '/delete-item',
            data: data,
            type: 'DELETE',
        })
        
        .done(function(user) {
            function removeItem(){
                self.closest('tr').remove();
                toastr.success('Item removed from cart');
            }
            
            if(user.local.cart)  {
                var item = user.local.cart[id];
                if(item) {
                    var newPrice = item.price * item.qty;
                    self.closest('tr').find('.price').html(newPrice);
                    self.closest('tr').find('.qty').html(item.qty);
                }
                else {
                  removeItem();
                }
            }
            else {
                removeItem();
            } 
        
            totalPrice()
            showEmptyCartMessage()
        })
    })
    
    $("#checkout").on("click", function(){
        swal("Great Buy!", "You have purchased items successfully.", "success");
        // remove all <tr> from the DOM
        // empty the users cart on server
        
         $.ajax({
            url: '/empty-cart',
            type: 'DELETE'
        })
        
        .done(function(user) {
            console.log(user)
            var cart = $('.cart-items');
            cart.each(function(item) {
                cart[item].innerHTML = ''
            })
            totalPrice();
            showEmptyCartMessage();
          
        })
    })
    
})