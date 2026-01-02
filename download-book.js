const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.join(__dirname, 'books');
const MIRRORS = [
  { host: 'libgen.lc', https: false },
  { host: 'libgen.is', https: false },
  { host: 'libgen.rs', https: false }
];

function parseArgs() {
  const args = process.argv.slice(2);
  const nameIndex = args.indexOf('--name');
  if (nameIndex === -1 || !args[nameIndex + 1]) {
    console.error('Usage: npm run download-book -- --name <book_name>');
    process.exit(1);
  }
  return args[nameIndex + 1];
}

function sanitizeFilename(name) {
  return name.replace(/[/\\?%*:|"<>]/g, '-').substring(0, 200);
}

function httpGet(url, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location, timeout).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    const req = protocol.get(url, { timeout: 60000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', (err) => { file.close(); fs.unlink(dest, () => {}); reject(err); });
    req.on('timeout', () => { req.destroy(); file.close(); fs.unlink(dest, () => {}); reject(new Error('Timeout')); });
  });
}

async function searchLibgen(mirror, query) {
  const proto = mirror.https ? 'https' : 'http';
  const searchUrl = `${proto}://${mirror.host}/search.php?req=${encodeURIComponent(query)}&res=25&view=simple&phrase=1&column=def`;
  console.log(`Searching ${mirror.host}...`);

  const { status, data } = await httpGet(searchUrl);
  if (status !== 200) throw new Error(`HTTP ${status}`);

  // Extract IDs from search results
  const idMatches = data.match(/book\/index\.php\?md5=([a-fA-F0-9]{32})/g) || [];
  const md5List = [...new Set(idMatches.map(m => m.match(/md5=([a-fA-F0-9]{32})/)[1]))];

  if (md5List.length === 0) return [];

  // Fetch book details from JSON API
  const apiUrl = `${proto}://${mirror.host}/json.php?ids=${md5List.join(',')}&fields=id,title,author,extension,md5,filesize`;
  const apiRes = await httpGet(apiUrl);
  if (apiRes.status !== 200) throw new Error(`API HTTP ${apiRes.status}`);

  return JSON.parse(apiRes.data);
}

async function getDownloadLink(md5) {
  // Try library.lol (common download mirror)
  const pageUrl = `http://library.lol/main/${md5}`;
  const { status, data } = await httpGet(pageUrl);
  if (status !== 200) return null;

  const match = data.match(/href="(https?:\/\/[^"]+)">GET<\/a>/);
  return match ? match[1] : null;
}

async function main() {
  const bookName = parseArgs();
  console.log(`Searching for: "${bookName}"...\n`);

  if (!fs.existsSync(BOOKS_DIR)) {
    fs.mkdirSync(BOOKS_DIR, { recursive: true });
  }

  let results = [];
  for (const mirror of MIRRORS) {
    try {
      results = await searchLibgen(mirror, bookName);
      if (results.length > 0) break;
    } catch (err) {
      console.log(`  ${mirror.host} failed: ${err.message}`);
    }
  }

  if (results.length === 0) {
    console.log('\nNo results found.');
    return;
  }

  console.log(`\nFound ${results.length} result(s):\n`);
  results.slice(0, 5).forEach((b, i) => {
    const size = b.filesize ? `${(parseInt(b.filesize) / 1024 / 1024).toFixed(1)}MB` : '?';
    console.log(`${i + 1}. "${b.title}" by ${b.author || 'Unknown'} [${b.extension}, ${size}]`);
  });

  console.log('\nAttempting download...\n');

  for (const book of results.slice(0, 5)) {
    const title = book.title || 'Unknown';
    const author = book.author || 'Unknown';
    const ext = book.extension || 'pdf';

    try {
      console.log(`Trying: "${title}"...`);
      const downloadUrl = await getDownloadLink(book.md5);
      if (!downloadUrl) {
        console.log('  No download link found, trying next...');
        continue;
      }

      const filename = sanitizeFilename(`${title} - ${author}.${ext}`);
      const filepath = path.join(BOOKS_DIR, filename);

      console.log(`  Downloading...`);
      await downloadFile(downloadUrl, filepath);
      console.log(`\nSuccess! Saved to: books/${filename}`);
      return;
    } catch (err) {
      console.log(`  Failed: ${err.message}, trying next...`);
    }
  }

  console.log('\nCould not download any result.');
}

main().catch(console.error);
