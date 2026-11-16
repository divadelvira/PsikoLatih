(function () {
  var KEY = 'psikolatih.v1', USER = 'psikoUser';
  var ls = window.localStorage, rawSet = Storage.prototype.setItem;
  function login() { location.href = '/login'; }
  function put(body) {
    return fetch('/api/progress', { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'text/plain' }, body: body, keepalive: true }).catch(function () {});
  }
  function widget(user, admin) {
    // styled by .who in auth.css; sits in the sidebar so it shows when the mobile menu is open
    var d = document.createElement('div');
    d.className = 'who';
    var n = document.createElement('span');
    n.textContent = user;
    d.append(n);
    if (admin) {
      var a = document.createElement('a');
      a.href = '/admin';
      a.textContent = 'Admin';
      d.append(a);
    }
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = 'Keluar';
    b.onclick = function () {
      fetch('/api/logout', { method: 'POST', credentials: 'same-origin' }).catch(function () {}).then(function () {
        ls.removeItem(KEY); ls.removeItem(USER); login();
      });
    };
    d.append(b);
    var s = document.getElementById('streak');
    if (s) s.after(d); else document.body.appendChild(d);
  }
  fetch('/api/progress', { credentials: 'same-origin' }).then(function (r) {
    if (r.status === 401) { login(); return null; }
    return r.json();
  }).then(function (d) {
    if (!d) return;
    var local = ls.getItem(KEY), mark = ls.getItem(USER);
    if (typeof d.progress === 'string') rawSet.call(ls, KEY, d.progress);
    else if (local !== null && (mark === null || mark === d.user)) put(local);
    else ls.removeItem(KEY);
    rawSet.call(ls, USER, d.user);

    var timer;
    Storage.prototype.setItem = function (k, v) {
      rawSet.call(this, k, v);
      if (this === ls && k === KEY) {
        clearTimeout(timer);
        timer = setTimeout(function () { timer = undefined; put(String(v)); }, 1000);
      }
    };
    addEventListener('pagehide', function () {
      if (timer === undefined) return;
      clearTimeout(timer);
      var v = ls.getItem(KEY);
      if (v !== null) navigator.sendBeacon('/api/progress', new Blob([v], { type: 'text/plain' }));
    });
    widget(d.user, d.admin);
    // app.js reads localStorage synchronously at load, so it must come after the fill above.
    var s = document.createElement('script');
    s.src = '/app.js';
    document.body.appendChild(s);
  }).catch(login);
})();
