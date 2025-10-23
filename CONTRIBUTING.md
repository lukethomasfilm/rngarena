# Contributing to RNG: Legends

Thank you for your interest in contributing to RNG: Legends! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Protected Code Areas](#protected-code-areas)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Code Style](#code-style)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a positive community

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Git installed
- A code editor (VS Code recommended)

### Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd rngarena

# Install dependencies
npm install

# Start the development server
npm run dev
```

The game will be available at `http://localhost:8000`

## Development Workflow

### Branch Naming Convention

Use descriptive branch names with the following prefixes:

- `feature/` - New features (e.g., `feature/add-new-monster`)
- `fix/` - Bug fixes (e.g., `fix/audio-autoplay`)
- `refactor/` - Code refactoring (e.g., `refactor/combat-system`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `test/` - Test additions/updates (e.g., `test/add-combat-tests`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Example Workflow

```bash
# Create a new feature branch
git checkout -b feature/add-tooltip-system

# Make your changes
# ... edit files ...

# Run tests and linting
npm run lint
npm run test

# Commit with descriptive message
git add .
git commit -m "feat: add tooltip system for locked monsters"

# Push to your fork
git push origin feature/add-tooltip-system

# Create a Pull Request on GitHub
```

## Protected Code Areas

**⚠️ CRITICAL: The following files have strict modification rules:**

### ❌ DO NOT MODIFY Without Explicit Approval

These files are protected for stability and require explicit permission before modification:

1. **`js/RNGArena.js`** - Main PVP tournament controller
2. **`tournament.js`** - Tournament bracket logic
3. **`js/CombatSystem.js`** - PVP combat timing and mechanics
4. **PVE System Files:**
   - `js/pve/PVEBattleSystem.js`
   - `js/pve/PVECombatSystem.js`
   - `js/pve/PVEMonsters.js`

### CSS Protected Blocks

Certain CSS sections for PVE are protected. Look for comments like:
```css
/* ═══════════════════════════════════════════════════════════════════════════
   PROTECTED: PVE Battle System Styles
   Do not modify without approval
   ═══════════════════════════════════════════════════════════════════════════ */
```

### ✅ SAFE TO MODIFY

You can freely work on:

- Navigation and routing (screen transitions)
- UI/UX improvements (accessibility, styling)
- Analytics and telemetry hooks
- Asset optimization (images, audio)
- Documentation
- Tests
- New features that don't touch combat logic

### Why These Restrictions?

The PVP and PVE systems are highly interconnected and sensitive. Changes to combat timing, DOM selectors, or state management can cause:
- Cross-contamination between PVP and PVE
- Broken animations and timing
- Lost game state
- Audio sync issues

## Commit Guidelines

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks
- `style:` - Code style changes (formatting, no logic change)
- `perf:` - Performance improvements

### Examples

```
feat(pve): add tooltip on locked monsters

Add hover/focus tooltip that explains unlock requirements
for locked monster buttons on the PVE map.

Closes #42
```

```
fix(audio): prevent music autoplay on page load

Music now stays muted until user clicks unmute button,
respecting browser autoplay policies.

Fixes #38
```

```
docs(readme): add testing section

Added instructions for running unit tests and Playwright
smoke tests.
```

## Pull Request Process

### Before Submitting

1. ✅ Run `npm run lint` - No linting errors
2. ✅ Run `npm run test` - All tests pass
3. ✅ Test your changes manually
4. ✅ Update documentation if needed
5. ✅ Verify no protected files were modified

### PR Checklist

When creating a PR, ensure:

- [ ] Branch name follows naming convention
- [ ] Commits follow commit message guidelines
- [ ] Code follows project style
- [ ] Tests added/updated for new features
- [ ] No console errors in browser
- [ ] Works on both PVP and PVE modes (if applicable)
- [ ] README updated if adding new features
- [ ] No protected files modified (or explicit approval obtained)

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation
- [ ] Other (describe)

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #XX
```

## Testing Requirements

### Manual Testing

Before submitting a PR, test these flows:

1. **Loading Screen** - Ensure music mutes correctly
2. **Home Navigation** - All buttons work
3. **PVP Tournament** - Start tournament, verify combat animations
4. **PVE Battles** - Fight Wood Dummy, verify animations and audio
5. **Loot Claim** - Verify popup appears and closes correctly
6. **Fullscreen** - Enter/exit fullscreen mode
7. **Audio Controls** - Mute/unmute works across screens

### Automated Tests (Future)

When available:
```bash
npm run test          # Run unit tests
npm run test:e2e      # Run Playwright tests
```

## Code Style

### JavaScript

- Use ES6+ features (arrow functions, const/let, template literals)
- Prefer `const` over `let` when possible
- Use descriptive variable names
- Add JSDoc comments for functions
- Keep functions small and focused

### HTML

- Use semantic HTML5 elements
- Add `aria-label` to image-only buttons
- Include `alt` text for all images
- Use `loading="lazy"` for non-critical images

### CSS

- Use CSS custom properties for colors/sizes
- Group related styles together
- Add comments for complex styles
- Use BEM-like naming for components
- Ensure `:focus-visible` styles for accessibility

### Example

```javascript
/**
 * Calculate damage with critical hit chance
 * @param {number} baseDamage - The base damage value
 * @param {number} critChance - Critical hit chance (0-1)
 * @returns {{damage: number, isCrit: boolean}}
 */
function calculateDamage(baseDamage, critChance) {
    const isCrit = Math.random() < critChance;
    const damage = isCrit ? baseDamage * 2 : baseDamage;
    return { damage, isCrit };
}
```

## Questions?

If you have questions or need clarification on any of these guidelines, please:

1. Check existing issues and PRs
2. Read the [DEVELOPER_NOTES.md](./DEVELOPER_NOTES.md)
3. Open a new issue with the `question` label

## Thank You!

Your contributions help make RNG: Legends better for everyone. We appreciate your time and effort! 🎮⚔️
