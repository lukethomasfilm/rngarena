# 🏰 RNG Arena

Epic medieval tournament battles with turn-based combat and RNG mechanics.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Features

- **Epic Tournament Battles** - 100-participant single-elimination tournament
- **Turn-based Combat** - Strategic RNG-based fighting system
- **Live Chat** - Interactive tournament commentary
- **Dynamic Loot System** - Tier-based rewards progression
- **Responsive Design** - Works on desktop and mobile
- **Beautiful Animations** - Smooth combat and victory effects

## 🛠️ Development

### Project Structure

```
rngarena/
├── index.html           # Main HTML template
├── styles.css           # Main stylesheet
├── js/                  # Core game modules
│   ├── RNGArena.js      # Main game controller
│   ├── BracketSystem.js # Tournament bracket system
│   ├── CombatSystem.js  # Battle mechanics
│   ├── ChatSystem.js    # Chat commentary system
│   ├── EmojiSystem.js   # Floating emoji reactions
│   ├── LootSystem.js    # Reward/loot mechanics
│   └── constants.js     # Game constants & config
├── tournament.js        # Tournament initialization
├── public/              # Static assets
│   └── images/          # Game images & backgrounds
└── vite.config.js       # Vite configuration
```

### Available Scripts

- `npm start` - Start development server with hot reload (alias for `npm run dev`)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Check code quality with ESLint
- `npm run format` - Format code with Prettier

### Game Mechanics

#### Combat System
- **Health Points**: Scales by tournament round (5→8→12→20 HP)
- **Damage Values**: 1, 2, 3, or 7 (crit) damage per attack
- **Critical Hits**: 12.5% chance for 7 damage with special effects

#### Tournament Structure
- **100 Participants**: Generated with medieval-themed names
- **9 Rounds**: Round 1-6, Quarterfinals, Semifinals, Final
- **Following System**: Track your chosen hero's progress
- **Dynamic Odds**: Real-time probability calculations

## 🎨 Customization

### Adding New Characters
Add character data to `js/constants.js`:

```javascript
export const HERO_NAMES = [
    'Your Hero Name',
    // ... existing names
]

export const HERO_TITLES = {
    'Your Hero Name': ['Title One', 'Title Two']
}
```

### Custom Battle Backgrounds
Add new background images to `public/images/backgrounds/` and update CSS:

```css
.arena-viewport.your-theme {
    background: url('/images/backgrounds/your_background.png') !important;
    background-size: cover !important;
    background-position: center bottom !important;
}
```

## 📱 Mobile Support

The game is fully responsive and optimized for:
- **Desktop**: Side-by-side layout with full features
- **Tablet**: Optimized grid layout
- **Mobile**: Vertical stacking with touch-friendly controls

## 🏗️ Built With

- **Vite** - Fast build tool and dev server
- **Vanilla JavaScript** - ES6+ modules for clean architecture
- **CSS Grid/Flexbox** - Modern responsive layout
- **CSS Custom Properties** - Maintainable theming system

## 🧪 Testing

### Running Tests

```bash
# Run unit tests (when available)
npm run test

# Run end-to-end tests (when available)
npm run test:e2e

# Run linter to check code quality
npm run lint

# Format code
npm run format
```

### Manual Testing Checklist

Before submitting changes, test these flows:

- [ ] **Loading Screen** - Music starts muted, unmute button works
- [ ] **Home Navigation** - All menu buttons navigate correctly
- [ ] **PVP Tournament** - Start tournament, verify combat animations
- [ ] **PVE Battles** - Fight Wood Dummy, verify all animations and audio
- [ ] **Loot Claim** - Popup appears and closes correctly
- [ ] **Fullscreen Mode** - Enter/exit fullscreen works
- [ ] **Audio Controls** - Mute/unmute persists across screens
- [ ] **Keyboard Navigation** - Tab through buttons, Enter/Space to activate
- [ ] **No Console Errors** - Check browser console for errors

### Accessibility Testing

- [ ] Screen reader compatibility (use NVDA/JAWS/VoiceOver)
- [ ] Keyboard-only navigation (no mouse required)
- [ ] Focus indicators visible on all interactive elements
- [ ] Motion reduced when `prefers-reduced-motion` is enabled

## 🔧 Troubleshooting

### Common Issues

#### Dev Server Won't Start

**Problem:** `npm run dev` fails or port is already in use

**Solutions:**
```bash
# Kill process using port 8000
npx kill-port 8000

# Or use a different port
npm run dev -- --port 3000
```

#### Audio Won't Play

**Problem:** Music doesn't play after unmuting

**Solutions:**
- Click the unmute button (🔊) on the loading screen
- Check browser autoplay policies (Chrome/Safari may block)
- Ensure audio files exist in `/sfx/` directory
- Check browser console for audio loading errors

#### Images Not Loading

**Problem:** Background images or sprites don't appear

**Solutions:**
- Verify image paths start with `/images/` (not `./images/`)
- Check that images exist in `public/images/` directory
- Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- Check browser console for 404 errors

#### PVP/PVE Cross-Contamination

**Problem:** PVP affects PVE or vice versa

**Solutions:**
- Ensure all PVP selectors use `pvpScreen.querySelector()`
- Ensure all PVE elements use `pve-` prefixed IDs
- Check DEVELOPER_NOTES.md for architectural separation rules
- Verify no global `document.querySelector()` calls for shared classes

#### Animations Not Working

**Problem:** Combat animations don't play

**Solutions:**
- Ensure `prefers-reduced-motion` is not set in OS settings
- Check that CSS animation classes are applied to fighter containers, not sprites
- Verify fighter sprites have `opacity: 1` after setup
- Check browser console for JavaScript errors

#### Build Errors

**Problem:** `npm run build` fails

**Solutions:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf dist .vite

# Try building again
npm run build
```

### Debug Mode

Enable debug logging in browser console:

```javascript
// In browser console
localStorage.setItem('debug', 'true')
location.reload()
```

View game state:

```javascript
// Access game instance
window.arena

// View current state
window.arena.currentRound
window.arena.following
```

### Performance Issues

If the game runs slowly:

1. **Reduce Animations** - Enable "reduce motion" in OS accessibility settings
2. **Close Other Tabs** - Free up browser memory
3. **Disable Browser Extensions** - Some extensions interfere with animations
4. **Check Console** - Look for performance warnings

### Browser Compatibility

**Supported Browsers:**
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**Known Issues:**
- Safari may require user interaction before playing audio
- Older browsers may not support CSS Grid properly

### Getting Help

If you encounter issues not covered here:

1. Check [DEVELOPER_NOTES.md](./DEVELOPER_NOTES.md) for detailed architecture info
2. Search existing [GitHub Issues](../../issues)
3. Create a new issue with:
   - Browser and version
   - Steps to reproduce
   - Console error messages
   - Screenshots if applicable

## 🚀 Deployment

The built files in `dist/` can be deployed to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

### Deployment Checklist

- [ ] Run `npm run build`
- [ ] Test the production build with `npm run preview`
- [ ] Verify no console errors
- [ ] Test on mobile devices
- [ ] Ensure all assets load correctly (images, audio)
- [ ] Configure HTTPS for PWA installation support

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

**Ready for battle?** Run `npm start` and start your tournament! ⚔️