/* =========================================
   SWAIS VIDHYABHARATHI SIDEBAR
========================================= */

.sidebar {
  width: 260px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;

  background: #fffaf2;

  border-right: 1px solid #eadfd2;

  display: flex;
  flex-direction: column;

  padding: 24px 16px;

  z-index: 100;
}


/* =========================================
   BRAND
========================================= */

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 0 8px 22px;

  border-bottom: 1px solid #eee2d4;
}


.swais-logo {
  width: 46px;
  height: 46px;

  border: 2px solid #e66d16;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;

  color: #e66d16;
}


.swais-logo::before {
  content: "";

  position: absolute;

  width: 34px;
  height: 34px;

  border: 1px solid #e66d16;

  border-radius: 50%;
}


.logo-inner {
  font-family: Georgia, serif;

  font-size: 22px;

  font-weight: 700;

  z-index: 2;
}


.brand-text h2 {
  margin: 0;

  font-family: Georgia, serif;

  font-size: 21px;

  color: #352218;
}


.brand-text p {
  margin: 2px 0 0;

  color: #e66d16;

  font-size: 11px;

  font-weight: 600;
}


/* =========================================
   ROLE
========================================= */

.role-box {
  margin: 20px 4px;

  padding: 12px;

  border-radius: 11px;

  background: #fff0df;

  display: flex;

  align-items: center;

  gap: 10px;
}


.role-dot {
  width: 9px;
  height: 9px;

  border-radius: 50%;

  background: #e66d16;
}


.role-box div:last-child {
  display: flex;

  flex-direction: column;

  gap: 2px;
}


.role-box span {
  color: #4b3021;

  font-size: 11px;

  font-weight: 700;
}


.role-box small {
  color: #9b7e69;

  font-size: 9px;
}


/* =========================================
   MENU TITLE
========================================= */

.sidebar-label {
  padding: 0 12px 10px;

  color: #a08d7d;

  font-size: 9px;

  font-weight: 700;

  letter-spacing: 1.5px;
}


/* =========================================
   MENU
========================================= */

.sidebar-menu {
  display: flex;

  flex-direction: column;

  gap: 5px;
}


.sidebar-item {
  width: 100%;

  border: none;

  background: transparent;

  color: #765f4f;

  padding: 12px 13px;

  border-radius: 10px;

  display: flex;

  align-items: center;

  gap: 12px;

  text-align: left;

  font-size: 12px;

  transition: all 0.2s ease;
}


.sidebar-item:hover {
  background: #fff0df;

  color: #e66d16;

  transform: translateX(2px);
}


.sidebar-item.active {
  color: white;

  background: linear-gradient(
    135deg,
    #ed781d,
    #dc5e0d
  );

  box-shadow:
    0 8px 20px
    rgba(220, 94, 13, 0.18);
}


.alert-badge {
  margin-left: auto;

  width: 19px;
  height: 19px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #d94c3e;

  color: white;

  font-size: 9px;

  font-weight: 700;
}


/* =========================================
   SIDEBAR BOTTOM
========================================= */

.sidebar-bottom {
  margin-top: auto;
}


/* =========================================
   QUOTE
========================================= */

.sidebar-message {
  padding: 13px;

  margin-bottom: 13px;

  border-radius: 12px;

  border: 1px solid #f0dcc5;

  background: #fff1df;
}


.quote {
  height: 15px;

  color: #e66d16;

  font-family: Georgia, serif;

  font-size: 25px;
}


.sidebar-message p {
  margin: 5px 0;

  color: #563a28;

  font-size: 10px;

  font-weight: 600;
}


.sidebar-message span {
  color: #9d7c66;

  font-size: 8px;
}


/* =========================================
   LOGOUT
========================================= */

.logout-button {
  width: 100%;

  padding: 12px;

  border-radius: 10px;

  border: 1px solid #ead8c6;

  background: white;

  color: #795f4d;

  display: flex;

  align-items: center;

  gap: 10px;

  font-size: 12px;

  transition: all 0.2s ease;
}


.logout-button:hover {
  background: #fff0df;

  border-color: #edbb8c;

  color: #df6715;
}