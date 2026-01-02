# 📚 Libgen Downloader

A simple CLI tool to search and download books from Library Genesis.

> ⚠️ **Alpha Status** - This package is currently in **alpha** and is experiencing timeout issues. Please do not use it in production yet. Our team is actively working on debugging and resolving these issues.

---

## ✨ Features

- 🔍 Search books by name
- 📥 Automatic download to local `books/` directory
- 🔄 Multiple mirror support for reliability
- 📦 Zero external dependencies (uses only Node.js built-ins)

---

## 📋 Requirements

- Node.js (v14 or higher recommended)

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/AdiPat/libgen-downloader.git

# Navigate to the directory
cd libgen-downloader
```

---

## 📖 Usage

```bash
npm run download-book -- --name "<book_name>"
```

### Example

```bash
npm run download-book -- --name "Clean Code"
```

This will:
1. Search for the book across multiple Library Genesis mirrors
2. Display up to 5 matching results
3. Attempt to download the first available book
4. Save it to the `books/` directory

### Output Example

```
Searching for: "Clean Code"...

Searching libgen.lc...

Found 3 result(s):

1. "Clean Code" by Robert C. Martin [pdf, 4.2MB]
2. "Clean Code in Python" by Mariano Anaya [epub, 2.1MB]
3. "Clean Architecture" by Robert C. Martin [pdf, 5.8MB]

Attempting download...

Trying: "Clean Code"...
  Downloading...

Success! Saved to: books/Clean Code - Robert C. Martin.pdf
```

---

## 🐛 Known Issues

| Issue | Status |
|-------|--------|
| Timeout errors during download | 🔧 In Progress |
| Occasional mirror failures | 🔧 In Progress |

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a new branch for your feature/fix

```bash
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes
2. Test your changes thoroughly
3. Ensure the code follows the existing style

### Submitting

1. **Commit** your changes with a clear message

```bash
git commit -m "feat: add your feature description"
```

2. **Push** to your fork

```bash
git push origin feature/your-feature-name
```

3. Open a **Pull Request** against the `main` branch

### Contribution Guidelines

- 📝 Write clear, descriptive commit messages
- 🧪 Test your changes before submitting
- 📚 Update documentation if needed
- 🐛 Report bugs by opening an issue
- 💡 Suggest features through issues
- 🔍 Review open PRs if you can help

### Priority Areas

We especially need help with:

- 🔧 Fixing timeout issues
- 🌐 Improving mirror reliability
- 📊 Adding progress indicators
- ✅ Adding tests

---

## 📁 Project Structure

```
libgen-downloader/
├── download-book.js    # Main script
├── package.json        # Project configuration
├── README.md           # Documentation
└── books/              # Downloaded books (auto-created)
```

---

## ⚠️ Disclaimer

**We don't encourage piracy.** This project is purely for academic and learning purposes and is designed to be used in schools to learn Zen Programming (ZP).

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Aditya Patange**

---

## 🌟 Support

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

<p align="center">
  Made with ❤️ for the open source community
</p>
