# Prism Games - Jumpscare Setup Guide

## Getting Pixabay API Key for Horror Videos & Sounds

The game now uses **Pixabay API** to fetch authentic horror videos and sound effects dynamically.

### Setup Steps:

1. **Get Your Free Pixabay API Key:**
   - Visit: https://pixabay.com/api/
   - Sign up for a free account
   - Generate an API key from your dashboard
   - Copy the API key

2. **Create `.env.local` file in `prismgames/` directory:**
   ```bash
   cp .env.example .env.local
   ```

3. **Add your API key to `.env.local`:**
   ```
   REACT_APP_PIXABAY_API_KEY=your_actual_api_key_here
   ```

4. **Restart the development server:**
   ```bash
   npm run dev
   ```

## Features:

✅ **Dynamic Horror Videos** - Fetches random horror videos from Pixabay API
✅ **Horror Sounds** - Plays authentic horror sound effects and scary audio
✅ **Fallback Content** - Uses Tenor GIFs if Pixabay API fails
✅ **Automatic Audio Unlock** - Bypasses browser autoplay restrictions
✅ **Real Horror Media** - Licensed content from Pixabay

## How It Works:

- When a player **fails a task**, the game triggers a jumpscare
- The app **fetches a horror video** from Pixabay API
- A **horror sound effect plays** simultaneously
- After 2.5 seconds, a "Retry If You Dare" button appears

## Pixabay API Limits:

- Free tier: **50 requests per hour**
- Each failed task makes 1-2 API calls
- Perfect for small to medium usage

## Troubleshooting:

**No API Key?** The game uses fallback content:
- Will display Tenor horror GIFs
- Will play default horror scream sound
- Still fully playable!

**API Rate Limited?** Fallbacks kick in automatically
- Check your request count at pixabay.com/api/
- Free tier resets hourly

---

**Note:** For production deployment, consider upgrading to Pixabay's paid plan for higher rate limits.
