// Mobile menu, and the contact form. No dependencies.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var form = document.getElementById('contact-form');
  if (!form) return;
  var notice = document.getElementById('form-notice');
  var cfg = window.SPOTTER_CONFIG || {};

  function setErr(field, message) {
    var wrap = field.closest('.field');
    wrap.classList.toggle('invalid', !!message);
    var err = wrap.querySelector('.err');
    if (err) err.textContent = message || '';
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var ok = true;
    if (f.website.value) return; // honeypot: bots fill this in
    if (f.name.value.trim().length < 2) { setErr(f.name, 'Please enter your name.'); ok = false; } else setErr(f.name, '');
    if (!/^\S+@\S+\.\S+$/.test(f.email.value.trim())) { setErr(f.email, 'Please enter a valid email address.'); ok = false; } else setErr(f.email, '');
    if (f.message.value.trim().length < 10) { setErr(f.message, 'Please write a few words so we can help.'); ok = false; } else setErr(f.message, '');
    if (!ok) { form.querySelector('[aria-invalid="true"]').focus(); return; }

    var data = {
      name: f.name.value.trim(), email: f.email.value.trim(),
      topic: f.topic.value, message: f.message.value.trim()
    };

    // Preferred: post to a form service (set formEndpoint in assets/config.js).
    if (cfg.formEndpoint) {
      fetch(cfg.formEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error('bad response');
        form.reset();
        notice.textContent = 'Thanks, ' + data.name.split(' ')[0] + '. We have your message and will reply within two working days.';
        notice.classList.add('show');
        notice.focus();
      }).catch(function () {
        notice.textContent = 'Sorry, that did not send. Please email us at ' + (cfg.email || 'our contact address') + ' instead.';
        notice.classList.add('show');
      });
      return;
    }

    // Fallback with no backend: open the visitor's email app with the message filled in.
    var to = cfg.email || 'hello@example.com';
    var subject = encodeURIComponent('[' + data.topic + '] Message from ' + data.name);
    var body = encodeURIComponent(data.message + '\n\n' + data.name + '\n' + data.email);
    window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
    notice.textContent = 'Your email app should open with your message ready to send. If it does not, write to ' + to + '.';
    notice.classList.add('show');
  });
})();
