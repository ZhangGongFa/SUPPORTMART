// JavaScript for Supportmart landing page
document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', (!expanded).toString());
  });
  // Close nav on link click (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('show');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Counter animation when visible
  const counters = document.querySelectorAll('.counter');
  const observerOptions = {
    threshold: 0.5
  };
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 2000; // 2 seconds
        let current = 0;
        const stepTime = 20;
        const increment = target / (duration / stepTime);
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current);
          }
        }, stepTime);
        observer.unobserve(el);
      }
    });
  }, observerOptions);
  counters.forEach(counter => counterObserver.observe(counter));

  // Form submission handling
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const response = document.getElementById('form-response');
      response.textContent = 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm.';
      form.reset();
    });
  }

  // Marketplace initialisation
  if (document.querySelector('.product-grid')) {
    initMarketplace();
  }

  // Technology page initialisation
  if (document.querySelector('.tech-tabs')) {
    initTechPage();
  }
});

// Marketplace functions
function initMarketplace() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  const cartToggle = document.querySelector('.cart-toggle');
  const cartPanel = document.querySelector('.cart-panel');
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartCount = document.querySelector('.cart-count');
  const cartTotal = document.querySelector('.cart-total');
  // If any of these elements is missing, do nothing
  if (!cartToggle || !cartPanel || !cartItemsContainer || !cartCount || !cartTotal) {
    return;
  }
  const cart = {};

  addToCartButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const id = card.getAttribute('data-id');
      const name = card.getAttribute('data-name');
      const price = parseInt(card.getAttribute('data-price'), 10);
      if (cart[id]) {
        cart[id].qty += 1;
      } else {
        cart[id] = { name, price, qty: 1 };
      }
      updateCartUI();
    });
  });

  cartToggle.addEventListener('click', () => {
    cartPanel.classList.toggle('active');
  });

  function updateCartUI() {
    let itemCount = 0;
    let total = 0;
    cartItemsContainer.innerHTML = '';
    Object.keys(cart).forEach(key => {
      const item = cart[key];
      itemCount += item.qty;
      total += item.qty * item.price;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-qty">x${item.qty}</span>
        <span class="cart-item-price">${(item.price * item.qty).toLocaleString()} đ</span>
      `;
      cartItemsContainer.appendChild(div);
    });
    cartCount.textContent = itemCount;
    cartTotal.innerHTML = 'Tổng: ' + total.toLocaleString() + '&nbsp;đ';
  }
}

// Technology page functions
function initTechPage() {
  // Tab switching logic
  const tabs = document.querySelectorAll('.tech-tab');
  const panes = document.querySelectorAll('.tab-pane');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and panes
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      // Activate selected tab and pane
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
  // Draw AI line chart in the SVG container. We avoid external libraries for offline reliability.
  const aiSvg = document.getElementById('aiChart');
  if (aiSvg) {
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim();
    // Labels represent days of a week; data approximates a real demand trend
    const labels = ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','CN'];
    const forecastData = [100, 120, 140, 160, 180, 190, 210];
    const actualData   = [90, 110, 130, 150, 170, 185, 200];
    drawLineChart(aiSvg, labels, forecastData, actualData, primaryColor, secondaryColor);
  }
  // Initialise IoT sensor dynamic values
  const sensorEls = [
    document.getElementById('sensor1'),
    document.getElementById('sensor2'),
    document.getElementById('sensor3'),
    document.getElementById('sensor4')
  ];
  if (sensorEls.every(el => el !== null)) {
    // Start interval to update values randomly within a realistic range
    setInterval(() => {
      // Temperature for warehouse (sensor1): fluctuate between 3 and 5°C
      const tempWarehouse = (Math.random() * 2 + 3).toFixed(1);
      sensorEls[0].textContent = tempWarehouse + '°C';
      // Humidity for warehouse (sensor2): fluctuate between 80 and 90%
      const humWarehouse = Math.floor(Math.random() * 10 + 80);
      sensorEls[1].textContent = humWarehouse + '%';
      // Temperature for truck (sensor3): fluctuate between 1 and 4°C
      const tempTruck = (Math.random() * 3 + 1).toFixed(1);
      sensorEls[2].textContent = tempTruck + '°C';
      // Humidity for truck (sensor4): fluctuate between 70 and 85%
      const humTruck = Math.floor(Math.random() * 15 + 70);
      sensorEls[3].textContent = humTruck + '%';
    }, 3000);
  }
}

// Utility to draw simple line charts using SVG. Accepts an SVG element,
// labels (unused currently), two datasets, and two colours. The chart is
// rendered within a 100×100 coordinate system with margins. Each dataset
// is drawn as a polyline with points and axes.
function drawLineChart(svg, labels, data1, data2, colour1, colour2) {
  // Clear existing content
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  // Calculate min and max values for scaling
  const allData = data1.concat(data2);
  const minVal = Math.min(...allData, 0);
  const maxVal = Math.max(...allData);
  const range = maxVal - minVal || 1;
  const marginX = 5;
  const marginY = 5;
  const plotWidth = 100 - marginX * 2;
  const plotHeight = 100 - marginY * 2;
  const stepX = plotWidth / (data1.length - 1);
  // Helper to build points string
  const buildPoints = (data) => {
    return data.map((v, i) => {
      const x = marginX + i * stepX;
      const y = marginY + plotHeight - ((v - minVal) / range) * plotHeight;
      return x + ',' + y;
    }).join(' ');
  };
  // Draw axes
  const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  axis.setAttribute('x1', marginX);
  axis.setAttribute('y1', marginY + plotHeight);
  axis.setAttribute('x2', marginX + plotWidth);
  axis.setAttribute('y2', marginY + plotHeight);
  axis.setAttribute('stroke', '#ccc');
  axis.setAttribute('stroke-width', '0.5');
  svg.appendChild(axis);
  // Draw first dataset
  const poly1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  poly1.setAttribute('points', buildPoints(data1));
  poly1.setAttribute('fill', 'none');
  poly1.setAttribute('stroke', colour1);
  poly1.setAttribute('stroke-width', '1.5');
  svg.appendChild(poly1);
  // Draw circles for first dataset
  data1.forEach((v, i) => {
    const cx = marginX + i * stepX;
    const cy = marginY + plotHeight - ((v - minVal) / range) * plotHeight;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', 1.5);
    circle.setAttribute('fill', colour1);
    svg.appendChild(circle);
  });
  // Draw second dataset
  const poly2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  poly2.setAttribute('points', buildPoints(data2));
  poly2.setAttribute('fill', 'none');
  poly2.setAttribute('stroke', colour2);
  poly2.setAttribute('stroke-width', '1.5');
  svg.appendChild(poly2);
  // Draw circles for second dataset
  data2.forEach((v, i) => {
    const cx = marginX + i * stepX;
    const cy = marginY + plotHeight - ((v - minVal) / range) * plotHeight;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', 1.5);
    circle.setAttribute('fill', colour2);
    svg.appendChild(circle);
  });
}