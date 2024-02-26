'use strict';

// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  locale: 'pt-PT',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  locale: 'en-US',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  locale: 'en-GB',
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  locale: 'fr-FR',
};

// Global Variables

let currentAccount;

const accounts = [account1, account2, account3, account4];

// Query All Elements

// Label Elements

const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance-value');
const labelSumIn = document.querySelector('.summary-value--in');
const labelSumOut = document.querySelector('.summary-value--out');
const labelSumInterest = document.querySelector('.summary-value--interest');
const labelTimer = document.querySelector('.timer');

// Container elements

const app = document.querySelector('.main');
const containerMovements = document.querySelector('.section-movements');

// App Buttons

const btnLogin = document.querySelector('.login-btn');
const btnTransfer = document.querySelector('.form-btn--transfer');
const btnLoan = document.querySelector('.form-btn--loan');
const btnClose = document.querySelector('.form-btn-close');
const btnSort = document.querySelector('.summary-sort-btn');

// Form Inputs

const inputLoginUsername = document.querySelector('.login-input--username');
const inputLoginPin = document.querySelector('.login-input--password');
const inputTransferTo = document.querySelector('.form-input--to');
const inputTransferAmount = document.querySelector('.form-input--amount');
const inputLoanAmount = document.querySelector('.form-input--loan-amount');

//  Functions

// Helper Functions

// Creating the usernames: this function will create a side-effect by creating a username property in the accounts data object.

const createUsernames = function (accs) {
  accs.forEach(
    (acc) =>
      (acc.username = acc.owner
        .toLowerCase()
        .split(' ')
        .map((name) => name[0])
        .join(''))
  );
};

console.log(accounts);

//  Invoke the function here: so username property is created in object

createUsernames(accounts);

// Find the correct account

const findAccount = function (accs, username, password) {
  return accs.find(
    (accs) => accs.username === username && accs.pin === password
  );
};

// Calculate the balance

const calcBalance = function (acc) {
  const balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  return balance;
};

// Get the current date and time

const getNowDateAndTime = function (locale) {
  const now = new Date();

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  };

  const dateTime = now.toLocaleString(locale, options);

  console.log(typeof dateTime, dateTime); // e.g. expect 25/02/2024, 17:18:34

  // We need to format the above dateTime in way that the Date constructor can accept

  const [datePart, timePart] = dateTime.split(', '); // there is char empty space after date

  console.log(datePart, timePart);

  const [day, month, year] = datePart.split('/');

  console.log(day, month, year);

  return `${year}-${month}-${day}T${timePart}`;
};

// Creating a function to generate movementDates array in account object returns isoString date format

const createMovementDates = function (acc) {
  // Check if the acc is an object
  if (typeof acc !== 'object' || typeof acc === null) {
    console.error('Expected an object, but received', acc);
    return; // exists the function early
  }

  const currentDateAndTime = getNowDateAndTime(currentAccount.locale); // uses our function to get and time

  console.log(currentDateAndTime);

  acc.movementDates = Array.from({ length: 8 }, (_, i) => {
    const date = new Date(currentDateAndTime);
    console.log(date);
    date.setDate(date.getDate() - i);

    return date.toISOString();
  }).reverse();
};

// Display Movements

const displayMovements = function (acc, sort = false) {
  // Clear the movements container
  containerMovements.innerHTML = '';

  console.log(acc);

  // Sorting movements - using slice() here to return a shallow copy

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  console.log(movs);

  // Creating the html markup, we need to iterate through the movements array
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      
    <div class="movements-row">
        <div class="movements-type movements-type--${type}">
        ${i + 1} ${type}
        </div>

        <div class="movements-info">
        <div class="movements-date">3 days ago</div>
        <div class="movements-value">${mov}£</div>
    </div>
          
      `;

    // Inserting the html markup into the containerMovements

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Display Ui

const displayUi = function (acc) {
  // Display balance

  // Creating a side-effect adding balance property to acc
  acc.balance = calcBalance(acc);
  labelBalance.textContent = `${acc.balance}£`;

  // Display date

  // we need to parse the isoString to a Date object

  const isoString = getNowDateAndTime(currentAccount.locale);

  console.log(isoString);

  // isoString is an object so we can construct our formatted date

  const dateAndTime = new Date(isoString);

  const day = `${dateAndTime.getDate()}`.padStart(2, 0);
  const month = `${dateAndTime.getMonth() + 1}`.padStart(2, 0);
  const year = dateAndTime.getFullYear().toString();
  const hours = `${dateAndTime.getHours()}`.padStart(2, 0);
  const minutes = `${dateAndTime.getMinutes()}`.padStart(2, 0);

  console.log(day, month, year, hours, minutes);

  labelDate.textContent = `${day}/${month}/${year}, ${hours}:${minutes}`;

  // Display movements

  displayMovements(acc);

  // Display Summary
  // Start the timer
};

// Event Handlers

// User needs to login with username and password stored as Pin

btnLogin.addEventListener('click', function (e) {
  // halts the browser from reloading
  e.preventDefault();

  // Find the account for the current user
  currentAccount = findAccount(
    accounts,
    inputLoginUsername.value,
    +inputLoginPin.value
  );

  console.log(currentAccount);

  // Display UI and message

  if (currentAccount) {
    app.classList.remove('hidden');
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    // Clear the input fields

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();

    // Creating the side-effect in accounts object for movementDates
    createMovementDates(currentAccount);

    // Display current account

    displayUi(currentAccount);
  }
});
