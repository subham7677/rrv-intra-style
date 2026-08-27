import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDpJo1gj-88BOMAQjcdAIux0FLMqjFjPVQ",
  authDomain: "rrv-login.firebaseapp.com",
  projectId: "rrv-login",
  storageBucket: "rrv-login.firebasestorage.app",
  messagingSenderId: "463084346548",
  appId: "1:463084346548:web:f3e7a88bb9c77270b48be1",
  measurementId: "G-XQ5TWPTSE9"
};

// 🔥 INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);



// ==========================
// SIGNUP
// ==========================

window.signup = function () {

  let email = document.getElementById("signupEmail").value;

  let password = document.getElementById("signupPassword").value;


  createUserWithEmailAndPassword(auth, email, password)

    .then((userCredential) => {

      alert("Signup Successful");

      window.location.href = "login.html";

    })

    .catch((error) => {

      alert(error.message);

    });

};



// ==========================
// LOGIN
// ==========================

window.login = function () {

  let email = document.getElementById("loginEmail").value;

  let password = document.getElementById("loginPassword").value;


  signInWithEmailAndPassword(auth, email, password)

    .then((userCredential) => {

      const user = userCredential.user;

      // SAVE LOGIN USER
      localStorage.setItem("loggedUser", user.email);

      alert("Login Successful");

      window.location.href = "index.html";

    })

    .catch((error) => {

      alert(error.message);

    });

};



// ==========================
// CHECK LOGIN USER
// ==========================

window.addEventListener("DOMContentLoaded", () => {

  const user = localStorage.getItem("loggedUser");

  const userName = document.getElementById("userName");

  const loginLink = document.getElementById("loginLink");

  const signupLink = document.getElementById("signupLink");

  const logoutLink = document.getElementById("logoutLink");


  if (user && userName) {

    // SHOW USER EMAIL
    userName.innerText = user;

    // HIDE LOGIN SIGNUP
    if (loginLink) loginLink.style.display = "none";

    if (signupLink) signupLink.style.display = "none";

    // SHOW LOGOUT
    if (logoutLink) logoutLink.style.display = "block";

  }

});



// ==========================
// LOGOUT
// ==========================

window.logout = function () {

  signOut(auth)

    .then(() => {

      // REMOVE USER
      localStorage.removeItem("loggedUser");

      alert("Logged Out");

      window.location.href = "login.html";

    })

    .catch((error) => {

      alert(error.message);

    });

};
// ==========================
// FORGOT PASSWORD
// ==========================

window.forgotPassword = function () {

  let email = prompt("Enter your email");

  if (!email) {

    alert("Please enter email");

    return;

  }

  sendPasswordResetEmail(auth, email)

    .then(() => {

      alert("Password reset email sent");

    })

    .catch((error) => {

      alert(error.message);

    });

};