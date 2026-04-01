# Marvel Heroes Registry

A comprehensive, interactive database and game featuring Marvel heroes and villains. Built with a modern tech stack, this application offers real-time search, a gacha collection system, strategic battles, and multi-language support.

![Marvel Heroes Registry](https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=1200)

## 🚀 Features

- **Hero Registry**: Browse a massive database of Marvel characters with detailed stats and abilities.
- **Gacha System**: Test your luck to recruit new heroes into your collection.
- **Collection Management**: Track your owned heroes, level them up, and manage duplicates.
- **Battle System**: Engage in strategic combat against iconic teams like the Avengers, X-Men, and the Suicide Squad.
- **Challenges**: Complete specific missions with varying difficulty levels to earn gold and unique badges.
- **Shop**: Spend your hard-earned gold on hero packs and upgrades.
- **Multi-language Support**: Fully localized in English and Traditional Chinese.
- **Responsive Design**: A brutalist, high-energy UI that looks great on all devices.

## 🎮 Game Mechanics

### ⚔️ Battle Balance
- **Dynamic Difficulty**: Challenge opponents are scaled based on your team's average level.
- **Difficulty Scaling**: Each challenge level adds a flat level bonus and a 5% increase to all enemy stats (HP, ATK, DEF, SPD).
- **Random Fluctuation**: Opponent levels fluctuate by **+/- 2** levels each time you enter a battle, adding variety and strategic opportunities.
- **Battle Intel**: Real-time logs will alert you if an enemy is "Weakened" (low level roll) or at "Peak Performance" (high level roll).

### 🛡️ Pity System (Challenge Mode)
- **Repeated Attempts**: If you fail or retry a specific challenge, the opponent's level will gradually decrease.
- **Weakening Effect**: Each attempt reduces the enemy level by 1, up to a maximum of **-3 levels**.
- **Victory Reset**: The attempt counter resets once you successfully complete the challenge.

### 🤝 Team Synergy
- **Faction Bonus**: Using 3 heroes from the same team (e.g., all Avengers) grants a **25% boost** to all stats.
- **Team Attack**: Pure-team compositions have a chance to trigger a powerful "Assemble" attack, dealing **60% of total team attack** to all enemies.

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Internationalization**: [i18next](https://www.i18next.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/marvel-heroes-registry.git
   cd marvel-heroes-registry
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📂 Project Structure

- `src/App.tsx`: Main application logic and routing.
- `src/data/`: Contains the hero database and game constants.
- `src/components/`: Reusable UI components (HeroCard, etc.).
- `src/types.ts`: TypeScript interfaces and types.
- `src/i18n.ts`: Internationalization configuration.
- `src/index.css`: Global styles and Tailwind configuration.

## 📜 License

This project is for educational purposes. Marvel and all related characters are trademarks of Marvel Characters, Inc.

---

Built with ❤️ by [Your Name/GitHub Handle]
