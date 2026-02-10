# Specification

## Summary
**Goal:** Refresh the app’s UI to a romantic, soft iOS-inspired pastel theme and add premium, lightweight motion (touch feedback, transitions, and subtle anime-inspired micro-animations) across all screens.

**Planned changes:**
- Update the global theme tokens (colors/gradients/glow) to a consistent pastel pink/purple/soft red iOS-style palette across Login, Home/People discovery, Chat list/thread, Profile, and sheets/dialogs.
- Add reusable iOS-style touch motion patterns for interactive elements (button press/bounce, card lift/shadow, pressed states for nav items and list rows) and apply them consistently.
- Implement smooth fade + slight slide transitions for switching main tabs and for entering/exiting a chat thread.
- Add lightweight anime-inspired micro-animations (subtle ambient hearts/sparks, avatar/image entrance, gentle breathing on prominent avatars/profile photos).
- Ensure all motion is performance-friendly and respects `prefers-reduced-motion` by minimizing/disable animations when enabled.

**User-visible outcome:** The app looks more romantic and iOS-like, feels more responsive with premium touch feedback, transitions smoothly between tabs and chats, and includes subtle, lightweight micro-animations—with reduced motion support for accessibility.
