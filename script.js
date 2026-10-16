// Pak VPN website — small interactions: mobile nav, FAQ accordion, copy-to-clipboard.
(function () {
  // Mobile navigation toggle
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // FAQ accordion (one open at a time)
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    if (!q) return;
    q.addEventListener("click", function () {
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (o) { o.classList.remove("open"); });
      if (!wasOpen) item.classList.add("open");
    });
  });

  // Copy buttons (promo code, EasyPaisa number)
  document.querySelectorAll("[data-copy]").forEach(function (el) {
    el.addEventListener("click", function () {
      var text = el.getAttribute("data-copy");
      var done = function () {
        var original = el.textContent;
        el.classList.add("copied");
        if (el.classList.contains("copy-btn")) el.textContent = "Copied ✓";
        setTimeout(function () {
          el.classList.remove("copied");
          if (el.classList.contains("copy-btn")) el.textContent = original;
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) { /* clipboard unavailable */ }
        document.body.removeChild(ta);
        done();
      }
    });
  });
})();

  // Download buttons: no href (so the browser shows no link preview on hover);
  // the click builds the download link on the fly instead.
  document.querySelectorAll("[data-dl]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var a = document.createElement("a");
      a.href = btn.getAttribute("data-dl");
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  });

// ---------- website order form (payment confirmation) ----------
var orderForm = document.getElementById("orderForm");
if (orderForm) {
  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var plan = document.getElementById("ordPlan").value;
    var phone = document.getElementById("ordPhone").value.trim();
    var tid = document.getElementById("ordTid").value.trim();
    var ok = document.getElementById("orderOk");
    var err = document.getElementById("orderErr");
    ok.classList.add("hidden"); err.classList.add("hidden");
    if (!/^03\d{9}$/.test(phone)) {
      err.textContent = "Please enter a valid 11-digit mobile number starting with 03.";
      err.classList.remove("hidden"); return;
    }
    if (tid.length < 6) {
      err.textContent = "Please enter the Transaction ID (TID) from your EasyPaisa receipt.";
      err.classList.remove("hidden"); return;
    }
    var id = "ORD-" + Date.now().toString(36).toUpperCase();
    var orders = [];
    try { orders = JSON.parse(localStorage.getItem("pakvpn_web_orders") || "[]"); } catch (x) { orders = []; }
    orders.push({ id: id, plan: plan, phone: phone, tid: tid, ts: Date.now(), status: "Pending Verification" });
    try { localStorage.setItem("pakvpn_web_orders", JSON.stringify(orders)); } catch (x) {}
    ok.innerHTML = "<b>Order submitted!</b> Your Order ID is <b>" + id + "</b>. Once your payment is verified, you will receive a redeem code — enter it in the Pak VPN app (Redeem Pro code) and Pro activates instantly.<br>For faster activation, also send your TID on WhatsApp to <b>0336 3268833</b>.";
    ok.classList.remove("hidden");
    orderForm.querySelector(".order-submit").disabled = true;
  });
}
