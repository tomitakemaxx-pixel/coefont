// Text of the participant guide. Every block: th (main), en (sub), ja (Japanese edition only).
// Labels in 「」 are the product's own UI text (participant page i18n / Teams chat message).

export const meta = {
  date: '24 September 2026',
  issuer: 'Nippon Steel Trading Corporation',
  title: { th: 'คู่มือการใช้งาน CoeFont Interpreter', ja: 'CoeFont通訳 参加者ガイド' },
  subtitle: {
    th: 'ล่ามแปลภาษาด้วย AI สำหรับผู้เข้าร่วมการประชุม Microsoft Teams',
    en: 'AI interpreter — guide for participants in Microsoft Teams meetings',
    ja: 'AI同時通訳（Teams会議の参加者向け）',
  },
};

export const overview = {
  heading: { th: 'ภาพรวม', en: 'Overview', ja: '概要' },
  items: [
    {
      th: 'ระบบนี้เป็นล่ามแปลภาษาอัตโนมัติด้วย AI คำพูดภาษาญี่ปุ่นจะแสดงเป็นข้อความภาษาไทยบนหน้าจอของคุณ และเลือกฟังเป็นเสียงได้',
      en: 'This is an AI interpreter. Japanese speech is shown on your screen as Thai text, and you can also listen to it as audio.',
      ja: 'AI同時通訳です。日本語の発言がタイ語の文字で表示され、音声で聞くこともできます。',
    },
    {
      th: 'คำพูดภาษาไทยของคุณจะถูกแปลเป็นภาษาญี่ปุ่นให้ฝ่ายญี่ปุ่นโดยอัตโนมัติ',
      en: 'Your Thai speech is translated into Japanese for the Japanese side automatically.',
      ja: 'あなたのタイ語は、日本側に向けて自動で日本語に訳されます。',
    },
  ],
};

export const needs = {
  heading: { th: 'สิ่งที่ต้องเตรียม', en: 'What you need', ja: '必要なもの' },
  items: [
    {
      th: 'คอมพิวเตอร์ หรือโทรศัพท์มือถือที่มีเบราว์เซอร์ (Chrome / Safari / Edge)',
      en: 'A PC or a smartphone with a browser (Chrome / Safari / Edge)',
      ja: 'PCまたはスマートフォン（ブラウザ：Chrome / Safari / Edge）',
    },
    {
      th: 'หูฟัง (จำเป็นเมื่อฟังเสียงแปล เพื่อป้องกันเสียงสะท้อน) และการเชื่อมต่ออินเทอร์เน็ต',
      en: 'Earphones (required when you listen to the audio, to prevent echo) and an internet connection',
      ja: 'イヤホン（音声を聞く場合は必須。エコー防止）、インターネット接続',
    },
    {
      th: 'สามารถเข้าร่วมการประชุม Teams และดูแชทของการประชุมได้ ไม่ต้องสมัครบัญชี CoeFont และไม่ต้องติดตั้งแอปพลิเคชัน',
      en: 'Access to the Teams meeting and its chat. No CoeFont account and no app installation are needed.',
      ja: 'Teams会議とその会議チャットを見られること（CoeFontの登録・アプリ導入は不要）',
    },
  ],
  notes: [
    {
      th: 'ลิงก์ รหัสผ่าน และ QR Code จะแสดงในแชทของการประชุม Teams โดยอัตโนมัติเมื่อฝ่ายญี่ปุ่นเริ่มการแปล กรุณาใช้ข้อมูลจากแชทของการประชุมที่กำลังเข้าร่วมเสมอ',
      en: 'The link, the passcode and the QR code are posted automatically in the Teams meeting chat when the Japanese side starts the interpretation. Always use the ones in the chat of the meeting you are attending.',
      ja: 'リンク・パスコード・QRは、日本側が通訳を開始すると会議チャットに自動投稿されます。必ず参加中の会議のチャットにあるものを使ってください。',
    },
  ],
};

export const steps = {
  heading: { th: 'ขั้นตอนการใช้งาน (คอมพิวเตอร์)', en: 'Steps (PC)', ja: '手順（PC）' },
  items: [
    {
      n: 1,
      blocks: [{
        th: 'เข้าร่วมการประชุม Teams ตามปกติ คุณจะได้ยินเสียงต้นฉบับของการประชุมผ่าน Teams',
        en: 'Join the Teams meeting as usual. You hear the original meeting audio through Teams.',
        ja: 'Teams会議にいつもどおり参加します。会議の原音はTeamsで聞こえます。',
      }],
    },
    {
      n: 2,
      image: { file: 'pc_01_link.png', marker: [13, 88], widthMm: 36 },
      caption: { th: 'ข้อความจาก CoeFont ในแชทของการประชุม', ja: '会議チャットのCoeFontメッセージ' },
      blocks: [
        {
          th: 'เปิดข้อความจาก CoeFont ในแชทของการประชุม แล้วกดปุ่ม 「ブラウザで開く」 (เปิดในเบราว์เซอร์)',
          en: 'Open the CoeFont message in the meeting chat and press 「ブラウザで開く」 (Open in browser).',
          ja: '会議チャットのCoeFontメッセージで「ブラウザで開く」を押します。',
        },
        {
          th: 'หากหาข้อความไม่พบ กรุณาแจ้งฝ่ายญี่ปุ่นให้กดปุ่ม 「チャットに再送」 (ส่งซ้ำในแชท)',
          en: 'If you cannot find the message, ask the Japanese side to press 「チャットに再送」 (Resend to chat).',
          ja: 'メッセージが見つからない場合は、日本側に「チャットに再送」を押してもらいます。',
        },
      ],
    },
    {
      n: 3,
      image: { file: 'pc_02_passcode.png', marker: [11, 46], widthMm: 44 },
      caption: { th: 'ช่องรหัสผ่านและปุ่มเริ่ม', ja: 'パスコード入力と開始ボタン' },
      blocks: [
        {
          th: 'กรอกรหัสผ่านที่แสดงในข้อความ แล้วกดปุ่ม 「เริ่มพร้อมเสียง」 หรือ 「เริ่มด้วยข้อความเท่านั้น」',
          en: 'Enter the passcode shown in the message, then press 「Continue With Audio」 or 「Continue With Text Only」.',
          ja: 'パスコードを入力し、「音声をオンにして開始」または「テキストのみで開始」を押します。',
        },
        {
          th: 'เสียงแปลจะออกจากหน้าเว็บนี้ ไม่ใช่จาก Teams จึงต้องใช้หูฟังเพื่อป้องกันเสียงสะท้อน',
          en: 'The interpretation audio plays from this web page, not from Teams, so use earphones to prevent echo.',
          ja: '通訳音声はこのページから出ます（Teamsではありません）。エコー防止のためイヤホンを使ってください。',
        },
        {
          th: 'หน้าเว็บของ CoeFont จะแสดงเป็นภาษาตามการตั้งค่าของเครื่อง (เช่น ภาษาไทยหรือภาษาอังกฤษ) ภาพในคู่มือนี้เป็นหน้าจอภาษาญี่ปุ่น',
          en: 'The CoeFont web page is shown in your device language (for example Thai or English). The screenshots in this guide show the Japanese version.',
          ja: '参加者ページは端末の言語設定に合わせて表示されます（本書の画面は日本語表示の例）。',
        },
      ],
    },
    {
      n: 4,
      image: { file: 'pc_03_language.png', marker: null, widthMm: 44 },
      caption: { th: 'การตั้งค่าภาษาที่มุมขวาบน', ja: '画面右上の言語設定' },
      blocks: [
        {
          th: 'ที่มุมขวาบนของหน้า ให้เลือกภาษา 「ไทย」 (Thai) หากต้องการอ่านเป็นภาษาอังกฤษ ให้เลือก 「English」',
          en: 'At the top right of the page, select 「Thai」. Choose 「English」 if you prefer English.',
          ja: '画面右上の言語設定でタイ語を選びます（英語で読む場合は English）。',
        },
        {
          th: 'ไอคอนรูปหูฟังข้าง ๆ ใช้เปิดหรือปิดเสียงแปล',
          en: 'The headphone icon next to it turns the interpretation audio on or off.',
          ja: '隣のイヤホンアイコンで、通訳音声のオン・オフを切り替えます。',
        },
      ],
    },
    {
      n: 5,
      wide: true,
      image: { file: 'pc_04_translating.png', marker: null, widthMm: 105 },
      caption: { th: 'หน้าจอแสดงคำแปล', ja: '訳の表示画面' },
      blocks: [
        {
          th: 'คำแปลจะแสดงเป็นข้อความ ด้านซ้ายคือต้นฉบับ ด้านขวาคือคำแปล',
          en: 'The translation is shown as text: the original on the left, the translation on the right.',
          ja: '訳が文字で表示されます（左が原文、右が訳）。',
        },
        {
          th: 'กรุณาอย่าปิดหรือโหลดหน้านี้ใหม่ระหว่างการประชุม เพราะข้อความที่แสดงไว้จะหายไปทั้งหมด',
          en: 'Do not close or reload the page during the meeting. Everything shown so far will be cleared.',
          ja: '会議中はページを閉じたり再読み込みしたりしないでください。表示内容がすべて消えます。',
        },
      ],
    },
  ],
};

export const smartphone = {
  heading: { th: 'การใช้งานด้วยโทรศัพท์มือถือ', en: 'Using a smartphone', ja: 'スマートフォンで使う場合' },
  items: [
    {
      th: 'กรณีเข้าร่วม Teams ด้วยคอมพิวเตอร์: สแกน QR Code ในข้อความของ CoeFont (ภาพในขั้นตอนที่ 2) ด้วยกล้องของโทรศัพท์',
      en: 'If you join Teams on a PC: scan the QR code in the CoeFont message (picture in Step 2) with your phone camera.',
      ja: 'TeamsにPCで参加する場合：CoeFontメッセージのQRコード（手順2の図）をスマートフォンのカメラで読み取ります。',
    },
    {
      th: 'กรณีเข้าร่วม Teams ด้วยโทรศัพท์เครื่องเดียวกัน: แตะลิงก์หรือปุ่ม 「ブラウザで開く」 ในข้อความของ CoeFont',
      en: 'If you join Teams on the same phone: tap the link or 「ブラウザで開く」 in the CoeFont message.',
      ja: 'Teamsも同じスマートフォンで参加する場合：CoeFontメッセージのリンクか「ブラウザで開く」をタップします。',
    },
    {
      th: 'จากนั้นทำตามขั้นตอนที่ 3 ถึง 5 เหมือนกับคอมพิวเตอร์ หากฟังเสียงแปล ให้ต่อหูฟังกับโทรศัพท์',
      en: 'Then follow Steps 3 to 5, the same as on a PC. If you listen to the audio, connect your earphones to the phone.',
      ja: 'その後は手順3〜5と同じです。音声を聞く場合は、イヤホンをスマートフォンにつなぎます。',
    },
    {
      th: 'หากตัวอักษรเล็กเกินไป ให้กดปุ่ม 「A+」 เพื่อขยาย กรุณาเปิดหน้าเว็บค้างไว้ตลอดการประชุม',
      en: 'If the text is too small, press 「A+」 to enlarge it, and keep the page open during the meeting.',
      ja: '文字が小さい場合は「A+」で拡大できます。会議中はページを開いたままにしてください。',
    },
  ],
};

export const trouble = {
  heading: { th: 'หากพบปัญหา', en: 'If something does not work', ja: '困ったとき' },
  cols: [
    { th: 'สิ่งที่เกิดขึ้น', en: 'What you see', ja: '状況' },
    { th: 'วิธีแก้ไข', en: 'What to do', ja: '対処' },
  ],
  rows: [
    [
      { th: 'หน้าเว็บแสดง 「ไม่พบการประชุม กรุณาตรวจสอบ URL」', en: '「Meeting not found. Please check the URL.」', ja: '「ミーティングが見つかりませんでした」と表示' },
      { th: 'เปิดลิงก์ล่าสุดจากแชทของการประชุมอีกครั้ง', en: 'Open the latest link in the meeting chat again.', ja: '会議チャットの最新のリンクを開き直す' },
    ],
    [
      { th: 'หน้าเว็บแสดง 「เชื่อมต่อไม่สำเร็จ」', en: '「Connection failed」', ja: '「接続に失敗しました」と表示' },
      { th: 'รอสักครู่ แล้วโหลดหน้าใหม่และกรอกรหัสผ่านอีกครั้ง', en: 'Wait a moment, reload the page and enter the passcode again.', ja: '少し待ってから再読み込みし、パスコードを入れ直す' },
    ],
    [
      { th: 'หน้าเว็บแสดง 「การประชุมยังไม่เริ่ม」', en: '「This meeting has not started yet」', ja: '「ミーティングはまだ開始されていません」と表示' },
      { th: 'รอที่หน้านี้ หน้าเว็บจะเปลี่ยนเองเมื่อการประชุมเริ่ม', en: 'Wait on this page. It updates automatically when the meeting starts.', ja: 'そのまま待つ（開始すると自動で切り替わる）' },
    ],
    [
      { th: 'ไม่เห็นข้อความภาษาไทย', en: 'No Thai text', ja: 'タイ語が出ない' },
      { th: 'ตรวจสอบว่าเลือกภาษา 「ไทย」 ที่มุมขวาบน', en: 'Check that Thai is selected at the top right.', ja: '右上の言語設定がタイ語か確認' },
    ],
    [
      { th: 'ไม่ได้ยินเสียงแปล', en: 'No interpretation audio', ja: '通訳音声が聞こえない' },
      { th: 'กดไอคอนรูปหูฟัง และตรวจสอบระดับเสียงของเครื่อง', en: 'Press the headphone icon and check your device volume.', ja: 'イヤホンアイコンと端末の音量を確認' },
    ],
    [
      { th: 'หาข้อความของ CoeFont ในแชทไม่พบ', en: 'No CoeFont message in the chat', ja: 'チャットにメッセージが見当たらない' },
      { th: 'แจ้งฝ่ายญี่ปุ่นให้กดปุ่ม 「チャットに再送」', en: 'Ask the Japanese side to press 「チャットに再送」.', ja: '日本側に「チャットに再送」を依頼' },
    ],
    [
      { th: 'ยังใช้งานไม่ได้', en: 'Still not working', ja: 'それでも直らない' },
      { th: 'แจ้งฝ่ายญี่ปุ่นเป็นภาษาอังกฤษ (ดูตารางด้านล่าง)', en: 'Tell the Japanese side in English (see the table below).', ja: '英語で日本側に伝える（下の表）' },
    ],
  ],
};

export const phrases = {
  heading: { th: 'ประโยคภาษาอังกฤษที่ใช้บ่อย', en: 'Useful English phrases', ja: '英語の定型フレーズ' },
  cols: [
    { th: 'ภาษาอังกฤษ', en: 'English', ja: '英語' },
    { th: 'ความหมาย', en: 'Meaning in Thai', ja: '意味' },
  ],
  groups: [
    {
      label: { th: 'ฝ่ายไทยใช้แจ้งฝ่ายญี่ปุ่น', en: 'From the Thai side', ja: 'タイ側から' },
      rows: [
        { en: 'I can’t see the Thai text.', th: 'ไม่เห็นข้อความภาษาไทย', ja: 'タイ語の文字が見えません' },
        { en: 'I can’t hear the interpretation.', th: 'ไม่ได้ยินเสียงแปล', ja: '通訳音声が聞こえません' },
        { en: 'Please resend the CoeFont link in the chat.', th: 'กรุณาส่งลิงก์ CoeFont ในแชทอีกครั้ง', ja: 'CoeFontのリンクをチャットに再送してください' },
        { en: 'Which passcode should I enter?', th: 'ต้องกรอกรหัสผ่านอะไร', ja: 'どのパスコードを入れればよいですか' },
      ],
    },
    {
      label: { th: 'ฝ่ายญี่ปุ่นใช้กับคุณ', en: 'From the Japanese side', ja: '日本側から' },
      rows: [
        { en: 'Please select Thai at the top right.', th: 'กรุณาเลือกภาษาไทยที่มุมขวาบน', ja: '右上でタイ語を選んでください' },
        { en: 'Please press the headphone icon.', th: 'กรุณากดไอคอนรูปหูฟัง', ja: 'イヤホンアイコンを押してください' },
        { en: 'Please reload and enter the passcode again.', th: 'กรุณาโหลดหน้าใหม่แล้วกรอกรหัสผ่านอีกครั้ง', ja: '再読み込みしてパスコードを入れ直してください' },
        { en: 'Can you see the Thai text now?', th: 'ตอนนี้เห็นข้อความภาษาไทยหรือไม่', ja: 'タイ語の文字は見えていますか' },
        { en: 'Please speak a little slower.', th: 'กรุณาพูดช้าลงเล็กน้อย', ja: '少しゆっくり話してください' },
      ],
    },
  ],
};
