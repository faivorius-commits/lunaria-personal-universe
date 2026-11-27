# Lunaria Personal Universe

LUNARIA V1–V5 — MASTER DEVELOPMENT & INTEGRATION PROMPT



Build and integrate Lunaria V1, V2, V3, V4, and V5 into ONE complete, cohesive, fully functional personal digital universe.



This is not a request to create a simple landing page or a static UI mockup. Build a real application with working interactions, persistent database storage, authentication, file uploads, games, and responsive design.



V5 must contain all features from V1–V4 while introducing the new V5 experience.



---



1. PRODUCT IDENTITY



Product Name: Lunaria

Concept: Your Personal Digital Universe



Lunaria is a private digital world where users can organize their daily lives, track personal development, collect memories, manage projects, learn new things, play games, and personalize their own space.



The experience should feel like entering a beautiful little digital universe.



Visual Direction



Use a dreamy, cute, futuristic, 3D-inspired aesthetic.



Main color palette:



- Baby pink

- Soft pastel pink

- Lavender

- Gradient purple

- Periwinkle blue

- Soft sky blue

- White and subtle silver accents



Main gradient direction:

Pink → Lavender → Purple → Blue.



Design characteristics:



- Beautiful gradient backgrounds.

- Soft 3D objects and decorative elements.

- Floating glassmorphism cards.

- Rounded cards and smooth corners.

- Subtle shadows and realistic depth.

- 3D floating planets, stars, moons, clouds, crystals, butterflies, and magical objects.

- Soft glowing effects.

- Animated transitions.

- Smooth hover interactions.

- Beautiful loading animations.

- Unique illustrations for every module.

- Elegant typography.

- Cute but not childish.

- Professional, polished, and visually consistent.



Use actual 3D elements where appropriate, such as Three.js or React Three Fiber, and use lightweight CSS 3D transforms for smaller decorative elements.



Do not overload the interface. Optimize 3D effects for mobile devices and provide reduced-motion and performance-friendly alternatives.



The application must look beautiful on both Android phones and desktop computers.



---



2. SUPABASE CONFIGURATION



Connect the entire application to this Supabase project.



Supabase Project URL:

https://mfeazhpafclmfnieqbhd.supabase.co



Supabase Publishable Key:

sb_publishable_IQOCAFvWFxG8qVdhRhIl1w_vES1vD5p



Use these exact values in the frontend environment configuration:



VITE_SUPABASE_URL=https://mfeazhpafclmfnieqbhd.supabase.co



VITE_SUPABASE_ANON_KEY=sb_publishable_IQOCAFvWFxG8qVdhRhIl1w_vES1vD5p



Use the Supabase JavaScript client.



IMPORTANT:



- Do not create a different Supabase project.

- Do not replace the provided URL or publishable key.

- Do not expose service_role keys or secret keys in frontend code.

- Use Supabase Auth, PostgreSQL, Storage, and Row Level Security.

- Preserve existing user data and tables.

- Inspect the existing database schema before making changes.

- Create additional SQL migrations instead of deleting existing data.

- Enable RLS for all user-owned tables.

- Ensure users can only access their own records and files.



---



3. AUTHENTICATION — EMAIL AND PASSWORD ONLY



Create a beautiful authentication experience.



Required:



- Sign up using email and password.

- Login using email and password.

- Logout.

- Persistent authentication session.

- Password visibility toggle.

- Password validation.

- Email validation.

- Friendly authentication error messages.

- Forgot password and password reset through email.



STRICT REQUIREMENT:



Do not add:



- Google Login.

- Google OAuth.

- Sign in with Google.

- Social login.

- Any other third-party login provider.



Only email and password authentication using Supabase Auth.



Create a beautiful login and registration screen that matches Lunaria's pink-purple-blue visual identity.



---



4. APPLICATION PIN LOCK



Implement a Lunaria application lock.



Initial PIN: 1440



Requirements:



- After authentication, show the PIN screen before entering the main application.

- The initial PIN must be 1440.

- Create an elegant custom numeric PIN interface.

- Use four numeric input positions.

- Include a delete/backspace button.

- Include an unlock animation.

- Display a friendly error when the PIN is incorrect.

- Add a lock screen animation with a 3D moon or crystal.

- Allow the user to change their PIN in Settings.

- Preserve the PIN setting between sessions.



Security requirements:



- Never store the PIN as readable plaintext.

- Use an appropriate salted hash for local PIN verification.

- Clearly treat this as an additional application lock, not a replacement for Supabase account authentication.

- Do not claim a client-side PIN gate provides protection against someone who can inspect or modify the application code.



---



5. VERSION FEATURE MAP



All versions must be integrated cumulatively.



V1 — FOUNDATION



Core application structure:



- Dashboard.

- Navigation.

- Daily World.

- Workspace.

- Arcade.

- Explore.

- World Weather.

- Randomizer.

- Knowledge Garden.

- Memories.

- My Diary.

- My Vault.

- Collections.

- My Garden.



Create a consistent application structure and navigation system.



V2 — PERSONAL MANAGEMENT



- Supabase authentication.

- Workspace task management.

- Diary entries.

- Knowledge notes.

- File uploads.

- Memories.

- Collections.

- World Weather.

- Randomizer.

- Arcade.

- Settings.

- Session management.



All user-owned data must persist after refreshing the page.



V3 — LIFE TRACKING



Task Management



Two task types:



Small Task



- One-time task.

- Deadline.

- Completion button.

- Completion status.

- Automatic activity history.



Long Task



- Long-running project.

- Deadline.

- Daily progress tracking.

- Percentage progress.

- Progress notes.

- Historical progress timeline.

- Completion status.



A Long Task must not lose its previous progress records when a new progress update is added.



Overdue unfinished tasks must automatically become failed and move to Failed Archive.



Diary Integration



Record meaningful activities automatically:



- Task completion.

- Long Project progress updates.

- Habit check-ins.

- Journey entries.

- Memory creation.

- Recipe creation.



Avoid duplicate activity logs.



Habits



- Daily habits.

- Weekly habits.

- Monthly habits.

- Custom descriptions.

- Editable emoji.

- Completion history.

- Period-based tracking and reset.



Journey



- Daily emotional check-ins.

- Personal reflections.

- Journey history.

- Beautiful visual timeline.



Recipe Book



Inside Collections:



- Recipe name.

- Category.

- Ingredients.

- Instructions.

- Images.

- Create, edit, and delete.



Memory Gallery



- Upload personal photos.

- Photo title.

- Date.

- Caption.

- Gallery view.

- Edit and delete.

- Private storage.



Arcade



Maintain the original Memory Garden game and expand it with more game types in V5.



---



6. V4 — PERSONAL INTELLIGENCE



V4 focuses on making Lunaria more useful, organized, and intelligent as a personal management system.



Calendar



Create a functional calendar:



- Monthly view.

- Weekly view.

- Daily view.

- Create events.

- Edit events.

- Delete events.

- Event descriptions.

- Event dates.

- Task deadlines.

- Upcoming events.

- Visual event indicators.



Calendar events must be stored in Supabase.



Personal Analytics



Create a beautiful statistics dashboard:



- Completed tasks.

- Active tasks.

- Failed tasks.

- Long Project progress.

- Habit completion.

- Diary activity.

- Memory collection.

- Recipe collection.

- Weekly and monthly summaries.



Use beautiful charts, progress rings, and gradient visualizations.



All analytics must be calculated from actual database records.



Global Search



Allow searching across:



- Tasks.

- Long Projects.

- Diary.

- Habits.

- Memories.

- Recipes.

- Knowledge Garden.

- Collections.

- Calendar events.



Include category filters and clickable search results that open the original item.



Data Management



Every applicable module should support:



- Create.

- Read.

- Update.

- Delete.

- Search.

- Filter.

- Sort.



Ensure that updates are actually saved to Supabase.



---



7. V5 — PERSONAL UNIVERSE



V5 expands Lunaria into a more immersive, customizable, and interactive personal digital world.



A. Personalization Studio



Allow users to customize:



- Theme.

- Main gradient colors.

- Accent colors.

- Background.

- Card appearance.

- Layout density.

- Dashboard widgets.

- Widget visibility.

- Widget order.

- Decorative elements.



Provide several beautiful presets:



1. Pink Galaxy.

2. Lavender Dream.

3. Purple Stardust.

4. Blue Moonlight.

5. Cotton Candy.

6. Aurora Fantasy.



Allow users to save their own theme preferences.



B. Advanced Knowledge Garden



Build a beautiful knowledge management system.



Features:



- Knowledge cards.

- Categories.

- Tags.

- Search.

- Edit and delete.

- Related notes.

- Reference links.

- Organized knowledge collections.



Create a unique visual presentation inspired by a magical library or floating knowledge garden.



C. Advanced Media Library



Allow users to upload their own:



- Photos.

- Images.

- Videos.

- Audio files.

- Documents.



Requirements:



- File upload.

- File preview when supported.

- File categories.

- Custom title.

- Description.

- Upload date.

- Edit metadata.

- Delete files.

- Search and filter.

- Private Supabase Storage.



Do not use temporary browser blob URLs as permanent saved file references.



Use signed URLs for private previews.



D. Interactive Widgets



Create customizable dashboard widgets:



- Calendar.

- Today's Tasks.

- Long Projects.

- Habits.

- Weather.

- Diary.

- Recent Memories.

- Randomizer.

- Personal Statistics.



Users should be able to rearrange and hide widgets.



E. Cross-Module Integration



Make modules communicate with each other.



Examples:



- Completing a task creates a Diary activity.

- Updating a Long Project creates a progress-history entry and Diary activity.

- Creating a Memory can appear in the dashboard.

- Calendar events can connect to tasks.

- Knowledge cards can link to relevant projects.

- Media files can be attached to Memories or Collections.



---



8. LONG PROJECT — PRESERVE AND ADD THIS EXISTING PROJECT



IMPORTANT: Add the following existing project to the Long Task / Long Project section.



Do not omit it.

Do not rename it.

Do not replace it with a sample project.

Do not reset its progress history.



Create this exact project:



Title:

Cybersecurity Resilience Game: 47 Cards



Label:

Cybersecurity



Assigned by:

ASEAN Cybersecurity School



Project Type:

Long Project



Progress History:



Progress Entry 1:



- Date: 25 November 2026

- Description: Finished 27/47 cards

- Progress: 57%



Progress Entry 2:



- Date: 27 November 2026

- Description: Finished the rest of the cards

- Progress: 100%



Final Status:

Completed



Final Progress:

100%



Display the project in the Long Project section with:



- A beautiful cybersecurity-themed project card.

- A clear 100% progress bar.

- A completed status badge.

- Assigned-by information.

- Cybersecurity label.

- Historical progress timeline.

- Both progress entries with their exact dates and descriptions.



The timeline must show that the project progressed from 57% to 100%.



Do not invent additional progress entries.



The project must be persisted in Supabase, not just displayed as hardcoded frontend content.



If a matching project already exists, update or reconcile it without creating duplicates.



---



9. ARCADE — MULTIPLE UNIQUE GAMES



The Arcade must become a real mini-game collection.



Do not make it just one memory matching game.



Create multiple original, playable games with different mechanics, visual styles, and difficulty levels.



Suggested games:



1. Memory Garden



A beautiful memory card matching game.



- Multiple card themes.

- Different board sizes.

- Move counter.

- Timer.

- Restart.

- Difficulty selection.



2. Star Catcher



A magical reflex game.



- Catch falling stars.

- Avoid incorrect objects.

- Score system.

- Increasing difficulty.

- Smooth animations.



3. Crystal Match



A colorful matching puzzle.



- Match similar crystals.

- Combo system.

- Levels.

- Score.

- Unique animations.



4. Puzzle Galaxy



A visual puzzle game.



- Multiple puzzle images.

- Difficulty levels.

- Move counter.

- Completion animation.



5. Word Quest



A vocabulary and word puzzle game.



- Word search.

- Word matching.

- Difficulty selection.

- Score tracking.



6. Cybersecurity Challenge



An educational cybersecurity mini-game.



- Safe fictional scenarios.

- Identify suspicious messages.

- Recognize phishing indicators.

- Basic security awareness questions.

- Score and explanation after answering.



All games must be genuinely playable.



Do not create buttons that merely pretend to start a game.



Each game must have:



- Instructions.

- Start button.

- Restart button.

- Score or progress.

- Win/completion state.

- Difficulty selection where appropriate.

- Responsive controls for touchscreens.

- Original visual design.



Create a beautiful Arcade lobby with unique 3D game cards, animated illustrations, and a magical game-world atmosphere.



Use original artwork and do not copy copyrighted game assets.



---



10. 3D EXPERIENCE AND VISUAL DETAILS



This is an important design requirement.



Make Lunaria feel like an immersive digital universe.



Add:



- 3D floating moon.

- 3D planets.

- 3D crystal decorations.

- Floating stars.

- Soft clouds.

- Gradient glass cards.

- Layered backgrounds.

- Depth effects.

- Parallax interactions.

- Animated transitions between modules.

- Interactive 3D dashboard decorations.



The Home Dashboard should feel like entering a small magical universe.



Each module should have its own identity while preserving the overall Lunaria visual system.



Examples:



- Diary: dreamy floating journal.

- Calendar: magical floating calendar.

- Arcade: colorful 3D game world.

- Knowledge Garden: floating library.

- Memories: photo constellation gallery.

- Workspace: organized floating task cards.

- Collections: beautiful personal collection shelves.



Avoid excessive animations that make the app slow.



---



11. DASHBOARD



Create an attractive personalized dashboard containing:



- Greeting.

- Current date.

- Weather.

- Daily progress.

- Today's tasks.

- Active Long Projects.

- Habit check-ins.

- Upcoming events.

- Recent Diary entries.

- Recent Memories.

- Quick shortcuts.

- Random inspirational prompts.



Add a beautiful section:



"What are you feeling today?"



When the user selects a feeling, navigate to Journey and allow them to create a check-in.



Do not automatically save a check-in before the user confirms it.



---



12. USER FILE UPLOADS



Users must be able to add their own content without editing source code.



Allow uploads directly through the application.



Support:



- Personal profile photo.

- Dashboard background image.

- Memory photos.

- Collection images.

- Recipe photos.

- Gallery images.

- Documents.

- Audio.

- Video.



Use Supabase Storage with private buckets and user-specific folders.



Allow users to preview, replace, and delete their uploaded content.



Provide file size validation, file type validation, upload progress, and clear error messages.



---



13. DATABASE AND SECURITY



Review the existing database before changing anything.



Preserve:



- Existing user accounts.

- Existing tasks.

- Existing Long Projects.

- Existing task history.

- Existing diary entries.

- Existing memories.

- Existing collections.

- Existing user data.



Use additional migrations where needed.



Database requirements:



- Proper foreign keys.

- Appropriate indexes.

- Timestamps.

- User ownership.

- Row Level Security.

- Safe Storage policies.

- No duplicate activity records.

- Correct update and delete behavior.



Use ownership policies based on the authenticated user's UUID.



Never use a service-role key in the frontend.



Never disable RLS just to make a feature work.



---



14. RESPONSIVE DESIGN



The app must work properly on:



- Android phones.

- iPhones.

- Tablets.

- Desktop browsers.



Mobile requirements:



- Responsive sidebar or bottom navigation.

- Touch-friendly buttons.

- No horizontal overflow.

- Proper modal sizing.

- Responsive game controls.

- Readable typography.

- Optimized 3D effects.

- Fast loading.



Desktop requirements:



- Spacious dashboard.

- Balanced cards.

- Elegant sidebar.

- Rich visual interactions.



---



15. QUALITY CONTROL



Before considering the project finished:



1. Inspect all existing project files.

2. Inspect the existing Supabase schema.

3. Preserve all existing features.

4. Implement the new features.

5. Verify authentication.

6. Verify PIN lock.

7. Verify image and file uploads.

8. Verify task persistence.

9. Verify Long Project progress history.

10. Verify the exact Cybersecurity Resilience Game project data.

11. Verify calendar persistence.

12. Verify games are playable.

13. Verify analytics use actual data.

14. Verify user isolation through RLS.

15. Verify responsive layouts.

16. Run TypeScript checks.

17. Run a production build.

18. Fix all build errors.

19. Test all visible buttons.

20. Provide a clear list of implemented features and remaining limitations.



Do not claim that a feature works if it is only a placeholder.



Do not remove features to simplify implementation.



If a feature cannot be completed, explain why and leave a clear implementation note.



---



FINAL GOAL



Deliver LUNARIA V5 — THE COMPLETE PERSONAL DIGITAL UNIVERSE.



It must combine:



- Personal management.

- Life tracking.

- Long Project management.

- Calendar.

- Diary.

- Habits.

- Memories.

- Collections.

- Knowledge Garden.

- Media Library.

- Arcade with multiple games.

- Personalization Studio.

- 3D visual experience.

- Supabase authentication and persistence.



The final visual identity must be cute, dreamy, pink-purple-blue gradient, immersive, elegant, and beautifully 3D.



No AI assistant. No Google login. Email and password only. Initial PIN: 1440. Use the provided Supabase project.



Build a complete, cohesive, functional application — not just a visual prototype.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a66695ca-b555-4765-aa5b-27ba42c910e5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
