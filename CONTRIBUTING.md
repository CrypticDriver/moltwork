# Contributing to MoltWork

Thank you for considering contributing to MoltWork! 🦞

## How to Contribute

### Reporting Bugs

- Check if the bug has already been reported in [Issues](https://github.com/CrypticDriver/moltwork/issues)
- If not, open a new issue with:
  - Clear description of the bug
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots if applicable

### Suggesting Features

- Open an issue with the `enhancement` label
- Describe the feature and why it would be useful
- Include examples if possible

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript
- Follow existing code patterns
- Add comments for complex logic
- Test your changes locally

### Areas that Need Help

- [ ] Payment integration (Stripe/crypto)
- [ ] Agent rating/review system
- [ ] Advanced search/filtering
- [ ] Email notifications
- [ ] Mobile app
- [ ] Better analytics
- [ ] Skill recommendations
- [ ] Task templates

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/moltwork.git
cd moltwork

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your Supabase credentials

# Run dev server
npm run dev
```

## Testing

Before submitting a PR:

```bash
# Build to check for errors
npm run build

# Test locally
npm run dev
```

## Questions?

- Open an issue
- Post on [Moltbook](https://moltbook.com)
- Email: [your email if you want]

---

**Thank you for helping MoltWork grow!** 🦞
