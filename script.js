// Demo database in memory
let bookings = [];
let currentTab = 'upcoming';
let searchVal = "";
let popupBookingId = null;

// Many-to-many simulation (Company <-> Vendors)
// List of vendors (for selection)
const vendorsList = ["Vendor 1", "Vendor 2", "Vendor 3"];

// --- Utility functions ---
function capitalize(str) { return str[0].toUpperCase()+str.slice(1);}
function closePopup() {
  document.getElementById('popup').style.display = 'none';
  document.getElementById('assignForm').reset();
  popupBookingId = null;
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.replace(' ','').toLowerCase() === tab);
  });
  renderBookings();
}

function searchBookings() {
  searchVal = document.getElementById('searchBox').value.trim().toLowerCase();
  renderBookings();
}

// --- Rendering ---
function renderBookings() {
  const tbody = document.querySelector('#bookingsTable tbody');
  tbody.innerHTML = '';
  let items = bookings.filter(b => b.status === currentTab);

  // Simple search over multiple fields
  if (searchVal) {
    items = items.filter(b =>
      b.guest.toLowerCase().includes(searchVal) ||
      b.pickup.toLowerCase().includes(searchVal) ||
      b.dropoff.toLowerCase().includes(searchVal) ||
      b.vehicle.toLowerCase().includes(searchVal) ||
      b.vendor.toLowerCase().includes(searchVal) ||
      (b.driver && b.driver.toLowerCase().includes(searchVal))
    );
  }

  items.reverse().forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${b.datetime ? b.datetime.replace('T', ' ').slice(0, 16) : ''}</td>
      <td>${b.guest}</td>
      <td>${b.pickup}</td>
      <td>${b.dropoff}</td>
      <td>${b.vehicle}${b.vehicleNo?`<br><small>${b.vehicleNo}</small>`:''}</td>
      <td>${b.tripType}</td>
      <td>${b.vendor}</td>
      <td><span class="status ${b.status}">${capitalize(b.status)}</span></td>
      <td>
        ${b.status === 'upcoming' ? `
          <button onclick="openAssignPopup(${b.id})">Vendor Accept</button>
          <button onclick="cancelTrip(${b.id})" class="cancel">Cancel</button>
          <button onclick="placeInOpenMarket(${b.id})" style="background:#ffece0;color:#a04509;">Open Market</button>
        ` : ''}
        ${b.status === 'ongoing' ? `
          <button onclick="completeTrip(${b.id})">Complete</button>
        ` : ''}
        ${b.status === 'openmarket' ? `
          <button onclick="assignOpenMarket(${b.id})" style="background:#b27d14">Accept</button>
        ` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- Booking Form ---
document.getElementById('bookingForm').onsubmit = function (e) {
  e.preventDefault();
  const f = e.target;
  const formObj = Object.fromEntries(new FormData(f).entries());
  const newBooking = {
    id: Date.now(),
    guest: formObj.guest,
    pickup: formObj.pickup,
    dropoff: formObj.dropoff,
    passengers: formObj.passengers,
    email: formObj.email,
    mobile: formObj.mobile,
    address: formObj.address,
    tripType: formObj.tripType,
    datetime: formObj.datetime,
    vehicle: formObj.vehicle,
    vendor: formObj.vendor,
    status: 'upcoming',
    payment: 'unpaid',
    driver: '',
    vehicleNo: ''
  };
  bookings.push(newBooking);
  f.reset();
  switchTab('upcoming');
  renderBookings();
};

// --- Popup for driver and vehicle assign ---
function openAssignPopup(bookingId) {
  popupBookingId = bookingId;
  document.getElementById('popup').style.display = 'flex';
}
document.getElementById('assignForm').onsubmit = function(e){
  e.preventDefault();
  const driver = e.target.driver.value;
  const vehicleNo = e.target.vehicleNo.value;
  const b = bookings.find(x => x.id === popupBookingId);
  if(b){
    b.driver = driver;
    b.vehicleNo = vehicleNo;
    b.status = 'ongoing';
  }
  closePopup();
  switchTab('ongoing');
  renderBookings();
}

// --- Cancel Trip ---
function cancelTrip(id) {
  const b = bookings.find(x => x.id === id);
  if(b) b.status = 'cancelled';
  switchTab('cancelled');
  renderBookings();
}

// --- Complete Trip ---
function completeTrip(id) {
  const b = bookings.find(x => x.id === id);
  if(b){
    b.status = 'completed';
    b.payment = 'paid';
  }
  switchTab('completed');
  renderBookings();
}

// --- Place In Open Market ---
function placeInOpenMarket(id) {
  const b = bookings.find(x => x.id === id);
  if(b) b.status = 'openmarket';
  switchTab('openmarket');
  renderBookings();
}

// --- Accept from Open Market ---
function assignOpenMarket(id) {
  openAssignPopup(id);
  // After popup submit, status will change to ongoing
}

// --- Window bindings for inline HTML handlers ---
window.switchTab = switchTab;
window.openAssignPopup = openAssignPopup;
window.cancelTrip = cancelTrip;
window.completeTrip = completeTrip;
window.placeInOpenMarket = placeInOpenMarket;
window.assignOpenMarket = assignOpenMarket;
window.searchBookings = searchBookings;

// First render:
renderBookings();
