'use strict';

// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  locale: 'pt-PT',
  currency: 'EUR',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  locale: 'en-US',
  currency: 'USD',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  locale: 'en-GB',
  currency: 'GBP',
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  locale: 'fr-FR',
  currency: 'EUR',
};

// Global Variables

let timeToLogout = 300; // 300 seconds = 5 mins

let currentAccount, clock;

// Variable to keep track of the index for sorting movement dates

let sortCurrentIndex = 0;

// Variable to keep track of movementDates index

// let movementDatesIndex = 0;

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
const btnClose = document.querySelector('.form-btn--close');
const btnSort = document.querySelector('.summary-sort-btn');

// Form Inputs

const inputLoginUsername = document.querySelector('.login-input--username');
const inputLoginPin = document.querySelector('.login-input--password');
const inputTransferTo = document.querySelector('.form-input--to');
const inputTransferAmount = document.querySelector(
  '.form-input--transfer-amount'
);
const inputLoanAmount = document.querySelector('.form-input--loan-amount');
const inputCloseUsername = document.querySelector('.form-input--username');
const inputClosePin = document.querySelector('.form-input--pin');

// Creating an object to get the date and time

const getNowDateTimeObj = {
  newDate: new Date(),
  dateOpts: {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  },
  getDateTime() {
    return new Intl.DateTimeFormat(currentAccount.locale, this.dateOpts).format(
      this.newDate
    );
  },
  getISOString(date) {
    return date.toISOString();
  },
};

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

const findAccount = function (accs, username, password = true) {
  const foundAcc = password
    ? accs.find((accs) => accs.username === username && accs.pin === password)
    : accs.find((accs) => accs.username === username);

  return foundAcc;
};

// Calculate the balance

const calcBalance = function (acc) {
  const balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  return balance;
};

// Creating a function to generate movementDates array in account object returns isoString date format

const createMovementDates = function (acc) {
  let movementDatesIndex = 0;

  // Check if the acc is an object
  if (typeof acc !== 'object' || typeof acc === null) {
    console.error('Expected an object, but received', acc);
    return; // exists the function early
  }

  const currentDateTime = getNowDateTimeObj['newDate'];

  console.log(currentDateTime);

  if (!acc.movementDates) {
    acc.movementDates = Array.from({ length: 8 }, (_, i) => {
      const date = new Date(currentDateTime);
      console.log(date);
      date.setDate(date.getDate() - i);

      return getNowDateTimeObj.getISOString(date);
    }).reverse();
  } else {
    movementDatesIndex += 1;

    console.log('movementDatesIndex', movementDatesIndex);

    acc.movementDates = Array.from(
      { length: acc.movementDates.length + movementDatesIndex },
      (_, i) => {
        const date = new Date(currentDateTime);
        console.log(date);
        date.setDate(date.getDate() - i);

        return getNowDateTimeObj.getISOString(date);
      }
    ).reverse();
  }
};

// Format movements

// This function will render a day date string on each movement row

const formatMovementDate = function (isoStringDate, movementDate) {
  console.log(movementDate);
  // Converting the isoString in to a timestamp in milliseconds
  const currentTimestamp = Date.parse(isoStringDate);
  const movementTimestamp = Date.parse(movementDate);

  console.log(currentTimestamp, movementTimestamp);

  // Calculating the difference between the two timestamps

  const diffInMilliseconds = currentTimestamp - movementTimestamp;
  const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

  console.log(diffInMilliseconds, diffInDays);

  // I will use a ternary operation instead of if statements but the principle is much the same

  return diffInDays === 0
    ? 'Today'
    : diffInDays < 2
    ? 'Yesterday'
    : `${Math.floor(diffInDays)} days ago`;
};

// Display Movements

const displayMovements = function (acc, sort = false) {
  // Clear the movements container
  containerMovements.innerHTML = '';

  console.log(acc.movements);

  // Sorting movements - using slice() here to return a shallow copy

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  console.log(movs);

  // Creating the html markup, we need to iterate through the movements array
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // The currentIndex keeps track of the movements index
    // so that we can use it to access the movementDates array: gets the last element in the array and then at every iteration minus by index, reverses the order of the elements in the array

    sortCurrentIndex = sort ? movs.length - 1 - i : i;

    const date = getNowDateTimeObj['newDate'];

    console.log(
      'date',
      date,
      'sortIndex',
      sortCurrentIndex,
      'foreach index',
      i
    );

    const displayMovementsDate = sort
      ? formatMovementDate(
          getNowDateTimeObj.getISOString(date),
          acc.movementDates[sortCurrentIndex]
        )
      : formatMovementDate(
          getNowDateTimeObj.getISOString(date),
          acc.movementDates[i]
        );

    const movementVals = formatCur(mov, acc.locale, acc.currency);

    const html = `
      
    <div class="movements-row">
        <div class="movements-type movements-type--${type}">
        ${i + 1} ${type}
        </div>

        <div class="movements-info">
        <div class="movements-date">${displayMovementsDate}</div>
        <div class="movements-value">${movementVals}</div>
    </div>
          
      `;

    // Inserting the html markup into the containerMovements

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// A factory function to return display summary calculations

const calcDisplaySummary = function (acc) {
  console.log(acc);
  // Income

  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  // Withdrawals

  const withdrawals = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  // Interest

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int) => int >= 1)
    .reduce((prev, curr) => prev + curr, 0);

  return {
    incomes,
    withdrawals,
    interest,
  };
};

// Currency formatter function - this is a simple function - we can pass in any value: the movements and/or the return values from calcDisplaySummary

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// Timer function

const startLogoutTimer = function () {
  let time = 300;

  const convertToString = (s) => {
    const mins = String(Math.floor(s / 60));
    const secs = String(s % 60);

    return `${mins.padStart(2, 0)}:${secs.padStart(2, 0)}`;
  };

  const logOut = function () {
    app.classList.add('hidden');
    clearInterval(clock);
  };

  const ticker = () => {
    time >= 0 ? (labelTimer.textContent = convertToString(time)) : logOut();

    time--;
  };

  ticker(); // this ensures that the ticker is invoked immediately when this function is invoked; so there is no delay
  clock = setInterval(ticker, 1000);

  return clock; // we are returning the interval id and this will be reassigned back to the global variable clock
};

// Display Ui

const displayUi = function (acc) {
  // Display balance

  // Creating a side-effect adding balance property to acc
  acc.balance = calcBalance(acc);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);

  // Display date

  // we need to parse the isoString to a Date object

  const dateString = getNowDateTimeObj.getDateTime();

  console.log(dateString);

  labelDate.textContent = dateString;

  // Display movements

  displayMovements(acc);

  // Display Summary

  const incomesLable = formatCur(
    calcDisplaySummary(acc).incomes,
    acc.locale,
    acc.currency
  );

  const withdrawalsLable = formatCur(
    calcDisplaySummary(acc).withdrawals,
    acc.locale,
    acc.currency
  );

  const interestLable = formatCur(
    calcDisplaySummary(acc).interest,
    acc.locale,
    acc.currency
  );

  labelSumIn.textContent = `${incomesLable}`;
  labelSumOut.textContent = `${withdrawalsLable}`;
  labelSumInterest.textContent = `${interestLable}`;
};

// Helper function to toggle the movements in ascending & descending order

let sorted = false;

const toggleMovementsOrder = function () {
  sorted = !sorted;

  displayMovements(currentAccount, sorted);
};

// Transfer function

const transfer = function (amount, receiverAcc) {
  // Clear timer

  clearInterval(clock);
  clock = startLogoutTimer();

  console.log(receiverAcc);

  // add positive amount to reciever account

  receiverAcc.movements.push(amount);

  // clear transfer form inputs

  inputTransferTo.value = inputTransferAmount.value = '';

  setTimeout(function () {
    alert('Transfer completed!');
  }, 2000);

  displayUi(currentAccount);
};

// Event Handlers

// User needs to login with username and password stored as Pin

btnLogin.addEventListener('click', function (e) {
  // halts the browser from reloading
  e.preventDefault();

  // Clear timer

  clearInterval(clock);
  clock = startLogoutTimer();

  // Find the account for the current user - password has been set to true as default argument

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

// Movements will be sorted when clicked

btnSort.addEventListener('click', toggleMovementsOrder);

// Deposit will be transferred to recipient

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  // Clear timer

  clearInterval(clock);
  clock = startLogoutTimer();

  const transferTo = inputTransferTo.value;
  const transferAmount = +inputTransferAmount.value; // + is the same as Number() constructor function

  // Searches by username

  const transferToAccount = findAccount(accounts, transferTo, false);

  console.log(transferToAccount, transferAmount);

  // add negative amount to current account

  currentAccount.movements.push(-transferAmount);

  // transfer the amount to reciever account
  transfer(transferAmount, transferToAccount);

  // Updating the movementDates array
  currentAccount.movementDates.push(
    getNowDateTimeObj.getISOString(getNowDateTimeObj['newDate'])
  );

  // We need to create the movementDates array in the receiver account

  createMovementDates(transferToAccount);

  // Displaying the UI
  displayUi(currentAccount);
});

// User will be able to get a loan - if the loan amount requested is less than 10% of the current account balance.

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  // Clear timer

  clearInterval(clock);
  clock = startLogoutTimer();

  const loanAmount = Math.floor(inputLoanAmount.value);

  // We need a variable to store any movement that is >= than the loan amount, this is because: if we determined the loan based on the current balance, then a user would be able to request a loan on top of a loan. We would need another means of checking, if the user has already requested a loan previously.

  const someMovement = currentAccount.movements.some(
    (mov) => mov >= loanAmount * 0.1
  );

  console.log(someMovement);

  if (loanAmount > 0 && someMovement) {
    // To simulate a loan request from db

    setTimeout(function () {
      currentAccount.movements.push(loanAmount);
      currentAccount.movementDates.push(
        getNowDateTimeObj.getISOString(getNowDateTimeObj['newDate'])
      );
      alert('Loan Approved.');
      displayUi(currentAccount);
    }, 2500);
  } else {
    alert(
      'Sorry, the amount requested is higher than 10% of your current balance.'
    );
  }

  inputLoanAmount.value = '';
});

// Deletes the current account

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  // Function to close the account

  const closeAcc = () => {
    if (
      inputCloseUsername.value === currentAccount.username &&
      +inputClosePin.value === currentAccount.pin
    ) {
      const index = accounts.findIndex(
        (acc) => acc.username === currentAccount.username
      );

      console.log(index);

      if (index > -1) {
        accounts.splice(index, 1);
        // alert('Account closed.');
      }

      inputCloseUsername.value = inputClosePin.value = '';

      alert('Account closed!');

      app.style.opacity = 0;
    } else {
      alert('There is no matching account with username and password entered.');
    }
  };

  // Simulates a db query to delete the current account

  setTimeout(closeAcc, 2 * 1000);
});
