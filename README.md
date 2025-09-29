# 🏰 RNG Arena

Epic medieval tournament battles with turn-based combat and RNG mechanics.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

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
src/
├── main.js              # Application entry point
├── index.html           # Main HTML template
├── styles/              # Modular CSS architecture
│   ├── main.css         # CSS entry point
│   ├── base.css         # Reset & variables
│   ├── layout.css       # Grid & layout
│   ├── animations.css   # Keyframes & effects
│   ├── responsive.css   # Media queries
│   └── components/      # Component-specific styles
├── game/                # Core game logic
│   ├── RNGArena.js     # Main game controller
│   ├── Tournament.js    # Tournament bracket system
│   └── CombatSystem.js  # Battle mechanics
├── components/          # UI components
└── utils/               # Helper utilities
```

### Available Scripts

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
Add character data to `src/game/Tournament.js`:

```javascript
this.heroNames = [
    'Your Hero Name',
    // ... existing names
]

this.heroTitles = {
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

## 🚀 Deployment

The built files in `dist/` can be deployed to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

**Ready for battle?** Run `npm run dev` and start your tournament! ⚔️