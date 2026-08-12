const fs = require('fs');
const path = require('path');

const vegetables = {
  "cucumber": "photo-1604977042946-1eecc30f269e",
  "okra": "photo-1425543103986-22abb7d7e8d2",
  "bitter-gourd": "photo-1597362925123-77861d3fbac7",
  "bottle-gourd": "photo-1589927986089-35812388d1f4",
  "sponge-gourd": "photo-1589927986089-35812388d1f4",
  "brinjal": "photo-1615485290382-441e4d049cb5",
  "carrot": "photo-1598170845058-32b9d6a5da37",
  "beetroot": "photo-1598170845058-32b9d6a5da37",
  "green-chilli": "photo-1563565375-f3fdfdbefa83",
  "sweet-corn": "photo-1551754655-cd27e38d2076",
  "cabbage": "photo-1594282486552-05b4d80fbb9f",
  "green-leafy-bhaji": "photo-1576045057995-568f588f82fb",
  "spinach": "photo-1576045057995-568f588f82fb",
  "cluster-beans": "photo-1563636619-e9143da7973b",
  "potato": "photo-1518977676601-b53f82aba655",
  "onion": "photo-1618512496248-a07fe83aa8cb",
  "tomato": "photo-1592924357228-91a4daadcfea",
  "cauliflower": "photo-1568584711075-3d021a7c3ca3",
  "green-peas": "photo-1563636619-e9143da7973b",
  "coriander-leaves": "photo-1588872657578-7efd1f1555ed",
  "fenugreek-leaves": "photo-1615485500704-8e990f9900f7",
  "capsicum": "photo-1563565375-f3fdfdbefa83",
  "picador-chilli": "photo-1563565375-f3fdfdbefa83"
};

async function downloadImage(url, filepath) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function run() {
  const dir = path.join(__dirname, 'public', 'images', 'products');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log("Starting download of 23 authentic FlashKart vegetable images...");
  
  if (fs.existsSync(path.join(dir, 'tomato-hybrid.png'))) {
    fs.copyFileSync(path.join(dir, 'tomato-hybrid.png'), path.join(dir, 'tomato.png'));
  }
  if (fs.existsSync(path.join(dir, 'spinach-bunch.png'))) {
    fs.copyFileSync(path.join(dir, 'spinach-bunch.png'), path.join(dir, 'spinach.png'));
  }

  for (const [slug, id] of Object.entries(vegetables)) {
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;
    const filepath = path.join(dir, `${slug}.jpg`);
    console.log(`Downloading image for ${slug}...`);
    try {
      await downloadImage(url, filepath);
      console.log(`✅ Saved ${slug}.jpg`);
    } catch (err) {
      console.warn(`⚠️ Failed to download ${slug}: ${err.message}.`);
    }
  }
  console.log("🎉 All 23 vegetable images processed and stored in public/images/products/");
}

run();
