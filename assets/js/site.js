(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Dropdown menus (hamburger + share) =====
  var dropdowns = [];

  function closeAll(except) {
    dropdowns.forEach(function (d) {
      if (d === except) return;
      d.panel.classList.remove('open');
      d.btn.setAttribute('aria-expanded', 'false');
    });
  }

  document.querySelectorAll('[data-dropdown]').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    var d = { btn: btn, panel: panel };
    dropdowns.push(d);
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !panel.classList.contains('open');
      closeAll(d);
      panel.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        var first = panel.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      }
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeAll();
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dropdown')) closeAll();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = dropdowns.filter(function (d) { return d.panel.classList.contains('open'); })[0];
    closeAll();
    if (open) open.btn.focus();
  });

  // ===== Typewriter =====
  // Elements with [data-tw] keep their real text in the DOM (for screen readers, SEO and no-JS);
  // a transparent copy reserves the space while an overlay types it out.
  function prepare(el) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    var ghost = document.createElement('span');
    ghost.className = 'tw-ghost';
    ghost.textContent = text;
    var live = document.createElement('span');
    live.className = 'tw-live';
    live.setAttribute('aria-hidden', 'true');
    el.textContent = '';
    el.classList.add('tw');
    el.appendChild(ghost);
    el.appendChild(live);
    return { el: el, text: text, live: live };
  }

  function typeOut(item, speed) {
    return new Promise(function (resolve) {
      var i = 0;
      (function step() {
        i++;
        item.live.textContent = item.text.slice(0, i);
        if (i < item.text.length) {
          setTimeout(step, speed);
        } else {
          item.el.textContent = item.text;
          resolve();
        }
      })();
    });
  }

  function typeSequence(items, speed, pause) {
    return items.reduce(function (p, item) {
      return p.then(function () { return typeOut(item, speed); })
              .then(function () { return new Promise(function (r) { setTimeout(r, pause); }); });
    }, Promise.resolve());
  }

  function whenVisible(el, cb) {
    if (!('IntersectionObserver' in window)) { cb(); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { obs.disconnect(); cb(); }
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  }

  var arrow = document.querySelector('.scroll-down');
  function showArrow() { if (arrow) arrow.classList.add('show'); }

  if (reduced) {
    showArrow();
  } else {
    // Grouped lines type one after another (home intro).
    var groups = {};
    document.querySelectorAll('[data-tw-group]').forEach(function (el) {
      var g = el.getAttribute('data-tw-group');
      (groups[g] = groups[g] || []).push(prepare(el));
    });
    Object.keys(groups).forEach(function (g) {
      var items = groups[g];
      setTimeout(function () {
        typeSequence(items, 18, 380).then(showArrow);
      }, 500);
    });

    // Single lines type when scrolled into view.
    document.querySelectorAll('[data-tw]:not([data-tw-group])').forEach(function (el) {
      var item = prepare(el);
      var speed = parseInt(el.getAttribute('data-tw-speed'), 10) || 22;
      whenVisible(el, function () {
        typeOut(item, speed).then(function () {
          if (el.hasAttribute('data-tw-arrow')) showArrow();
        });
      });
    });
    if (!Object.keys(groups).length && !document.querySelector('[data-tw-arrow]')) {
      setTimeout(showArrow, 600);
    }
  }

  if (arrow) {
    arrow.addEventListener('click', function () {
      var target = document.querySelector(arrow.getAttribute('data-target'));
      if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  }

  // ===== Back to top =====
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    var onScroll = function () { toTop.classList.toggle('show', window.scrollY > 300); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  // ===== Footer year =====
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ===== GitHub repositories (projects page) =====
  var repoList = document.getElementById('github-projects');
  if (repoList) {
    var user = 'Ayushsahnios';
    var perPage = 6;
    var page = 1;
    var repos = [];
    var skip = ['zero-cloud-home-lab'];
    var langColors = {
      Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6', Go: '#00ADD8', HTML: '#e34c26',
      CSS: '#563d7c', Shell: '#89e051', Java: '#b07219', 'Jupyter Notebook': '#DA5B0B', Dockerfile: '#384d54', HCL: '#844FBA'
    };
    var prevBtn = document.getElementById('prevPage');
    var nextBtn = document.getElementById('nextPage');

    var esc = function (str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(String(str)));
      return div.innerHTML;
    };

    var render = function () {
      var start = (page - 1) * perPage;
      var slice = repos.slice(start, start + perPage);
      repoList.innerHTML = slice.map(function (r) {
        var lang = r.language || 'Code';
        var color = langColors[r.language] || '#8b949e';
        var updated = new Date(r.pushed_at || r.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return '' +
          '<a class="hcard hcard--mini" href="' + esc(r.html_url) + '" target="_blank" rel="noopener noreferrer">' +
            '<div class="hcard-content">' +
              '<p class="hcard-title">' + esc(r.name) + '</p>' +
              '<p class="hcard-text">' + esc(r.description || 'No description yet — open the repo to take a look.') + '</p>' +
              '<p class="meta"><span>🕑 Updated ' + esc(updated) + '</span><span>🔨 ' + esc(lang) + '</span></p>' +
            '</div>' +
            '<div class="hcard-img">' +
              '<div class="repo-cover" aria-hidden="true">' +
                '<span class="prompt">$ git clone</span>' +
                '<span class="name">' + esc(user + '/' + r.name) + '</span>' +
                '<span class="lang"><span class="dot" style="background:' + color + '"></span>' + esc(lang) +
                  (r.stargazers_count ? ' · ★ ' + esc(r.stargazers_count) : '') + '</span>' +
              '</div>' +
            '</div>' +
          '</a>';
      }).join('');
      prevBtn.disabled = page === 1;
      nextBtn.disabled = start + perPage >= repos.length;
    };

    fetch('https://api.github.com/users/' + user + '/repos?per_page=100&sort=pushed')
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (data) {
        repos = data.filter(function (r) { return !r.fork && skip.indexOf(r.name) === -1; });
        if (!repos.length) {
          repoList.innerHTML = '<p class="load-note">No public repositories yet.</p>';
          prevBtn.hidden = nextBtn.hidden = true;
          return;
        }
        render();
      })
      .catch(function (err) {
        repoList.innerHTML = '<p class="load-note">Couldn\'t load repositories (' + esc(err.message) +
          '). Visit <a href="https://github.com/' + user + '" target="_blank" rel="noopener noreferrer">github.com/' + user + '</a> instead.</p>';
        prevBtn.hidden = nextBtn.hidden = true;
      });

    prevBtn.addEventListener('click', function () { if (page > 1) { page--; render(); } });
    nextBtn.addEventListener('click', function () { if (page * perPage < repos.length) { page++; render(); } });
  }

  // ===== Packet Hunter — catch the packets drifting across the home page =====
  var canvas = document.getElementById('packets');
  if (canvas && !reduced) {
    var ctx = canvas.getContext('2d');
    var badge = document.getElementById('gameBadge');
    var scoreEl = document.getElementById('gameScore');
    var packets = [];
    var bursts = [];
    var w = 0, h = 0, dpr = 1;
    var swallowClick = false;
    var coarse = window.matchMedia('(pointer: coarse)').matches;
    var score = 0;
    try { score = parseInt(localStorage.getItem('packetScore'), 10) || 0; } catch (e) {}
    scoreEl.textContent = score;
    if (score > 0) badge.hidden = false;

    var resize = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    var spawn = function () {
      if (packets.length < 2 && !document.hidden) {
        var fromLeft = Math.random() > 0.5;
        packets.push({
          x: fromLeft ? -20 : w + 20,
          y: h * 0.15 + Math.random() * h * 0.7,
          vx: (fromLeft ? 1 : -1) * (0.6 + Math.random() * 0.7),
          vy: (Math.random() - 0.5) * 0.3,
          born: performance.now()
        });
        // On touch screens the badge would sit on top of content, so it only appears after a first catch.
        if (!coarse) badge.hidden = false;
      }
      setTimeout(spawn, 7000 + Math.random() * 7000);
    };

    var pop = function (i, px, py) {
      packets.splice(i, 1);
      for (var k = 0; k < 14; k++) {
        var ang = (Math.PI * 2 * k) / 14;
        var sp = 1.4 + Math.random() * 2.2;
        bursts.push({ x: px, y: py, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1 });
      }
      score++;
      scoreEl.textContent = score;
      badge.hidden = false;
      try { localStorage.setItem('packetScore', score); } catch (e) {}
      badge.classList.add('bump');
      setTimeout(function () { badge.classList.remove('bump'); }, 220);
    };

    window.addEventListener('pointerdown', function (e) {
      for (var i = packets.length - 1; i >= 0; i--) {
        var p = packets[i];
        if (Math.hypot(e.clientX - p.x, e.clientY - p.y) < (coarse ? 44 : 34)) {
          pop(i, p.x, p.y);
          swallowClick = true;
          setTimeout(function () { swallowClick = false; }, 400);
          break;
        }
      }
    }, { passive: true });

    // A click that catches a packet shouldn't also open the card underneath it.
    window.addEventListener('click', function (e) {
      if (swallowClick) { e.preventDefault(); e.stopPropagation(); swallowClick = false; }
    }, true);

    var frame = function (now) {
      ctx.clearRect(0, 0, w, h);
      for (var i = packets.length - 1; i >= 0; i--) {
        var p = packets[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -40 || p.x > w + 40) { packets.splice(i, 1); continue; }
        var s = 12 * (1 + 0.15 * Math.sin((now - p.born) / 220));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((now - p.born) / 900);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#201c1c';
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.restore();
      }
      for (var j = bursts.length - 1; j >= 0; j--) {
        var b = bursts[j];
        b.x += b.vx; b.y += b.vy; b.vx *= 0.95; b.vy *= 0.95; b.life -= 0.035;
        if (b.life <= 0) { bursts.splice(j, 1); continue; }
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2.2 * b.life, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(32, 28, 28, ' + b.life + ')';
        ctx.fill();
      }
      requestAnimationFrame(frame);
    };

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(frame);
    setTimeout(spawn, 6000);
    console.log('%c📦 Packet Hunter is live — click the drifting packets!', 'font-family:monospace;font-size:13px');
  }
})();
