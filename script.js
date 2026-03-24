// 🛒 CART DATA
let cart = [
  { name: "Milk", price: 5 },
  { name: "Bread", price: 5 }
];

let total = cart.reduce((sum, item) => sum + item.price, 0);

// 📦 Render Cart
document.getElementById("items").innerHTML =
  cart.map(item => `
    <div class="item">
      <span>${item.name}</span>
      <span>₹${item.price}</span>
    </div>
  `).join("");

document.getElementById("total").innerText = "Total: ₹" + total;


// 🧠 Payment State
let paymentStarted = false;


// 💳 Generate QR
function generateQR() {
  document.getElementById("qrBox").classList.remove("hidden");

  document.getElementById("qrcode").innerHTML = "";
  document.getElementById("receiptQR").innerHTML = "";
  document.getElementById("receiptBox").classList.remove("hidden");

  let upiLink = `upi://pay?pa=mondalsagnik025-1@okaxis&pn=Sagnik%20Mondal&am=${total}&cu=INR`;

  new QRCode(document.getElementById("qrcode"), {
    text: upiLink,
    width: 180,
    height: 180
  });

  document.getElementById("txn").innerHTML =
    "<span class='loading'>⏳ Waiting for payment...</span>";

  paymentStarted = true;

  // Backup timer
  setTimeout(() => {
    if (paymentStarted) {
      paymentStarted = false;
      processPayment();
    }
  }, 8000);
}


// 👀 Detect return from UPI app
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible" && paymentStarted) {
    paymentStarted = false;
    processPayment();
  }
});


// 🚀 Process Payment
async function processPayment() {
  document.getElementById("txn").innerHTML =
    "<span class='loading'>🔄 Verifying payment...</span>";

  try {
    // Fake transaction ID (since backend not on Vercel)
    let txnId = "TXN" + Math.floor(100000 + Math.random() * 900000);

    document.getElementById("txn").innerHTML =
      `<span class="success">✅ Payment Successful<br>Transaction ID: ${txnId}</span>`;

    document.getElementById("receiptQR").innerHTML = "";

    let receiptData = {
      txn: txnId,
      total: total,
      items: cart,
      status: "PAID"
    };

    // 📷 Exit QR
    new QRCode(document.getElementById("receiptQR"), {
      text: JSON.stringify(receiptData),
      width: 150,
      height: 150
    });

    // 📱 Send WhatsApp
    setTimeout(() => {
      sendWhatsAppReceipt(txnId);
    }, 1000);

  } catch (error) {
    document.getElementById("txn").innerHTML =
      "<span style='color:red;'>❌ Payment Failed</span>";
  }
}


// 💬 WhatsApp Sender (FINAL)
function sendWhatsAppReceipt(txnId) {
  let phone = document.getElementById("phone").value.trim();

  if (!phone || phone.length < 10) {
    alert("⚠️ Enter valid mobile number!");
    return;
  }

  let whatsappNumber = "91" + phone;

  // 🔥 YOUR VERCEL LINK
  let baseURL = "https://scanngo.vercel.app/receipt.html";

  let encodedData = encodeURIComponent(JSON.stringify({
    txn: txnId,
    total: total,
    items: cart,
    status: "PAID"
  }));

  let link = `${baseURL}?data=${encodedData}`;

  let message =
`🛒 Scan-N-Go Receipt

Transaction ID: ${txnId}
Total: ₹${total}
Status: PAID

📱 View QR Receipt:
${link}`;

  window.location.href =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}