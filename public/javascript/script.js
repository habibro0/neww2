(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission if invalid
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
  })

  // Add event listeners for updating cart item quantity
  document.querySelectorAll('.update-cart').forEach(button => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      const form = event.target.closest('form');
      const productId = form.querySelector('input[name="productId"]').value;
      const quantity = form.querySelector('input[name="quantity"]').value;

      try {
        const response = await fetch('/cart/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId, quantity })
        });

        if (response.ok) {
          const data = await response.json();
          document.querySelector(`#quantity-${productId}`).innerText = data.quantity;
          document.querySelector(`#price-${productId}`).innerText = data.totalPrice;
        } else {
          alert('Failed to update cart item. Please try again.');
        }
      } catch (error) {
        console.error('Error updating cart item:', error);
        alert('An error occurred while updating the cart item.');
      }
    });
  });

  // Add event listeners for removing items from cart
  document.querySelectorAll('.remove-from-cart').forEach(button => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      const form = event.target.closest('form');
      const productId = form.querySelector('input[name="productId"]').value;

      try {
        const response = await fetch('/cart/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        });

        if (response.ok) {
          window.location.reload(); // Reload the page to reflect cart changes
        } else {
          alert('Failed to remove item from cart. Please try again.');
        }
      } catch (error) {
        console.error('Error removing cart item:', error);
        alert('An error occurred while removing the cart item.');
      }
    });
  });
})();

const cameraModal = document.getElementById('cameraModal');
const video = document.getElementById('video');
const closeCamera = document.getElementById('closeCamera');

function openCamera() {
  cameraModal.classList.add('active');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("Error: ", err);
    });
}

closeCamera.addEventListener('click', () => {
  cameraModal.classList.remove('active');
  if (video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    video.srcObject = null;
  }
});
// Smooth Scroll فنکشن
// Smooth Scroll فنکشن
function enableSmoothScroll() {
  // تمام لنکس پر کلک ہونے پر ہموار اسکرولنگ کو فعال کریں
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", function (e) {
          e.preventDefault(); // ڈیفالٹ عمل کو روکنا
          document.querySelector(this.getAttribute("href")).scrollIntoView({
              behavior: "smooth" // اسکرولنگ کو ہموار کرنا
          });
      });
  });
}

// جب صفحہ مکمل لوڈ ہو تو Smooth Scroll کو فعال کریں
document.addEventListener("DOMContentLoaded", function () {
  enableSmoothScroll(); // Smooth Scroll کو فعال کریں
});

// مواد لوڈ کرنے کے لیے AJAX کا استعمال
function loadContent(url) {
  fetch(url)  // URL سے مواد لوڈ کریں
      .then(response => response.text())  // مواد کو ٹیکسٹ میں تبدیل کریں
      .then(data => {
          document.querySelector("#content").innerHTML = data;  // مواد کو اپ ڈیٹ کریں
          gsap.from("h1", { opacity: 0, y: -20, duration: 1 });  // اینیمیشن چلائیں
      });
}

// بٹن پر کلک ہونے پر مواد لوڈ کریں
document.querySelector("#myButton").addEventListener("click", function () {
  loadContent("/newContent.html");  // نئی مواد والی فائل لوڈ کریں
});

// سب لنکس پر کلک ہونے پر AJAX لوڈ کریں
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
      e.preventDefault();  // ڈیفالٹ عمل کو روکنا
      const targetId = this.getAttribute("href");  // ہائپر لنک کا `href` حاصل کریں
      const targetElement = document.querySelector(targetId);  // ہدف ایلیمنٹ حاصل کریں

      // اسکرولنگ کی خوبصورتی
      window.scrollTo({
          top: targetElement.offsetTop,
          behavior: "smooth"  // ہموار اسکرولنگ
      });

      // AJAX کے ذریعے مواد کو لوڈ کریں
      fetch(targetId)  // ٹارگٹ ایلیمنٹ کی فائل لوڈ کریں
          .then(response => response.text())  // جواب کو ٹیکسٹ میں تبدیل کریں
          .then(html => {
              document.querySelector("#content").innerHTML = html;  // مواد کو اپ ڈیٹ کریں
              gsap.from("h1", { opacity: 0, y: -20, duration: 1 });  // اینیمیشن چلائیں
          });
  });
});


// Bootstrap dropdown toggle with hover
const dropdownItems = document.querySelectorAll('.nav-item.dropdown');

dropdownItems.forEach(item => {
    const dropdownMenu = item.querySelector('.dropdown-menu');
    
    // Show dropdown on hover with right offset of 20px
    item.addEventListener('mouseenter', () => {
        dropdownMenu.classList.add('show');
        dropdownMenu.style.right = '20px';  // Adding right offset
    });
    
    // Hide dropdown on mouse leave
    item.addEventListener('mouseleave', () => {
        dropdownMenu.classList.remove('show');
        dropdownMenu.style.right = '';  // Resetting the right property
    });
});
