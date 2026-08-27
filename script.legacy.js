function order(product, sizeId, qtyId) {

  const user = localStorage.getItem("loggedUser");

  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  var size = document.getElementById(sizeId).value;
  var qty = document.getElementById(qtyId).value || 1;

  var phone = "9708810843";

  var message = "Hello, I want to order:\n" +
                "Product: " + product + "\n" +
                "Size: " + size + "\n" +
                "Quantity: " + qty;

  let history = JSON.parse(localStorage.getItem("history")) || [];

history.push({
  product,
  size,
  qty,
  time: new Date().toLocaleString()
});

localStorage.setItem("history", JSON.stringify(history));
  var url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);

  window.location.href = url;
}
let slideIndex = {};
function changeSlide(sliderId, direction) {
  let slides = document.querySelectorAll("#" + sliderId + " .slide");

  if (!slideIndex[sliderId]) {
    slideIndex[sliderId] = 0;
  }

  slides[slideIndex[sliderId]].classList.remove("active");

  slideIndex[sliderId] =
    (slideIndex[sliderId] + direction + slides.length) % slides.length;

  slides[slideIndex[sliderId]].classList.add("active");

  function toggleMenu() {
  let menu = document.getElementById("dropdown");

  if (menu.style.display === "block") {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }
}
window.onclick = function(event) {
  if (!event.target.matches('.menu span')) {
    let dropdown = document.getElementById("dropdown");
    if (dropdown) {
      dropdown.style.display = "none";
    }
  }
}
}
function toggleMenu(){

  let dropdown = document.getElementById("dropdown");

  if(dropdown.style.display === "block"){

    dropdown.style.display = "none";

  }else{

    dropdown.style.display = "block";

  }

}
// ==========================
// CART SYSTEM
// ==========================

// Load Old Cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ADD TO CART
function addToCart(product, price){

  cart.push({

    product: product,

    price: price

  });

  localStorage.setItem("cart", JSON.stringify(cart));

  alert(product + " added to cart");

}


// SHOW CART
function showCart(){

  let cartBox = document.getElementById("cartItems");

  let total = 0;

  if(!cartBox) return;


  cart.forEach((item,index)=>{

    total += item.price;

    cartBox.innerHTML += `

      <div class="card">

        <h3>${item.product}</h3>

        <p>₹${item.price}</p>

        <button onclick="removeCart(${index})">
          Remove
        </button>

      </div>

    `;

  });


  document.getElementById("totalPrice").innerText =
    "Total: ₹" + total;

}


// REMOVE CART ITEM
function removeCart(index){

  cart.splice(index,1);

  localStorage.setItem("cart", JSON.stringify(cart));

  location.reload();

}


// AUTO LOAD CART
showCart();
