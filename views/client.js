var paymentForm = document.getElementById('payment-form');
var paymentBody = document.getElementById("body");



paymentForm.addEventListener('submit', (event) => {
  event.preventDefault();
  
  paymentBody.classList.add("loading");

  var token = document.getElementById("token").value;
  
  var name_on_card = document.getElementById('name_on_card').value;
  var card_number = document.getElementById("card_number").value;
  var card_exp_month = document.getElementById("card_exp_month").value;
  var card_exp_year = document.getElementById("card_exp_year").value;
  var card_cvc = document.getElementById("card_cvc").value;
  var amount = document.getElementById("amount").value;

  console.log("DATA",token, name_on_card, card_number, card_exp_month, card_exp_year, card_cvc, amount)
  
  var stripe = Stripe(
    "pk_live_51IQugbDvURnOPWYXi1vv1afIRm3UqCU6KUnYCWzKVJWkidmqRbe4FCGDnEl58XdmJ2GjqYgXW4OlX16q2HrHq4Yf00Z3BTFXYb"
  );

  fetch("http://localhost:3000/payment", {
    method: "POST",
    headers: {
      Authorization:token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name_on_card,
      card_number,
      card_exp_month,
      card_exp_year,
      card_cvc,
      amount,
    }),
    
  })
    .then(function (result) {
      return result.json();
    })
    .then(function (stripeData) {
      console.log(
        "stripeData",
        stripeData.stripePaymentIntent.client_secret,
        stripeData.stripePaymentMethod.id
      );
      stripe
        .confirmCardPayment(stripeData.stripePaymentIntent.client_secret, {
          payment_method: stripeData.stripePaymentMethod.id,
        })
        .then(function (result) {
          if (result.error) {
            // Show error to your customer
            console.log("Payment Failed!"+"\nDetails: ", result.error.message);
            alert("Payment Failed!"+"\nDetails: "+result.error.message);            
          } else {
            if (result.paymentIntent.status === "succeeded") {
              alert("Payment Successfull!");
            }
          }
          paymentBody.classList.remove("loading");
        });      
      
    }).catch((error) => {
      console.log("Payment Error" + "\nDetails: ", error);
      alert("Payment Error!"+"\nDetails: "+error);
      paymentBody.classList.remove("loading");
    });

})

