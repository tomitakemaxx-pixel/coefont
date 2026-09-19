/**
 * DOM enhancements applied to guide.html before printing / checking.
 * Loaded by scripts/build.mjs and scripts/check.mjs so both see the same page.
 *
 *  1. swap the built-in illustrations for real screenshots when they exist
 *  2. place the numbered red markers from data-marker="x,y"
 *  3. keep Thai compound words from being split across lines
 */
(function () {
  // Thai has no spaces between words, so the browser decides where to break.
  // These compounds must never be broken in the middle; U+2060 (word joiner)
  // is invisible and is stripped again when the review file is written.
  var NOBREAK = [
    'คำพูด', 'ตัวอักษร', 'ตัวอย่าง', 'ข้อความ', 'หน้าจอ', 'รหัสผ่าน', 'เบราว์เซอร์',
    'คิวอาร์โค้ด', 'ไมโครโฟน', 'แอปพลิเคชัน', 'คอมพิวเตอร์', 'อินเทอร์เน็ต', 'เจ้าหน้าที่',
    'หูฟัง', 'ขั้นตอน', 'ติดตั้ง', 'ตรวจสอบ', 'ภาพประกอบ', 'ภาพรวม', 'ผู้เข้าร่วม',
    'ภาษาไทย', 'ภาษาญี่ปุ่น', 'ภาษาอังกฤษ', 'อัตโนมัติ', 'บัญชีผู้ใช้', 'โทรศัพท์มือถือ',
    'ให้เกียรติ', 'ประชุม', 'สนทนา', 'ก่อนหน้า', 'เชื่อมต่อ', 'ทั้งหมด', 'สมัคร', 'ประโยค',
    'เพราะ', 'ของ', 'อีกครั้ง', 'ด้านล่าง', 'ต้นฉบับ', 'คำแปล', 'เสียงแปล', 'ตำแหน่ง', 'ไอคอน',
    'ระหว่าง', 'ตลอดเวลา', 'ภาษาอื่น', 'สังเกต', 'ตรวจสอบ', 'เลื่อน', 'กล้อง', 'องค์กร',
    'กรอก', 'มุมขวาบน', 'ระดับเสียง', 'ข้อมูล', 'เฉพาะ', 'ปรากฏ', 'แสดง'
  ];
  var WJ = '⁠';

  function protectThai(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (n.parentElement && n.parentElement.closest('svg')) return NodeFilter.FILTER_REJECT;
        return /[฀-๿]/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var t = node.nodeValue;
      NOBREAK.forEach(function (w) {
        if (t.indexOf(w) === -1) return;
        t = t.split(w).join(w.split('').join(WJ));
      });
      node.nodeValue = t;
    });
  }

  window.applyGuideEnhancements = function (opts) {
    opts = opts || {};
    var shots = opts.shots || {};
    document.querySelectorAll('.shot').forEach(function (el) {
      var src = shots[el.dataset.shot];
      if (src) {
        var svg = el.querySelector('svg');
        if (svg) svg.remove();
        var tag = el.querySelector('.tag');
        if (tag) tag.remove();
        var img = document.createElement('img');
        img.src = src;
        el.insertBefore(img, el.firstChild);
        // the caption's ［要確認：実画面に差替］ marker no longer applies
        var fig = el.closest('figure');
        var ja = fig && fig.querySelector('figcaption .ja');
        if (ja) ja.textContent = ja.textContent.replace(/［要確認[^］]*］/g, '').trim();
      }
      var mk = (el.dataset.marker || '').split(',').map(function (s) { return s.trim(); });
      var step = el.closest('.step');
      var num = step && step.querySelector('.num') ? step.querySelector('.num').textContent.trim() : '';
      if (mk.length === 2 && mk[0] && num) {
        var d = document.createElement('span');
        d.className = 'marker';
        d.textContent = num;
        d.style.left = mk[0] + '%';
        d.style.top = mk[1] + '%';
        el.appendChild(d);
      }
    });
    // every figure replaced by a real screenshot -> the "these are illustrations" note is no longer true
    if (!document.querySelector('.shot svg')) {
      var note = document.querySelector('#illustration-note');
      if (note && note.parentElement) note.parentElement.style.display = 'none';
    }
    protectThai(document.body);
  };
})();
