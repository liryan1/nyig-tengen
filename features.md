# Feature Log

- [ ]

## Completed

- [x] Navigation header currently shows "learn > sets > 13" on `/learn/sets/13`, but we want it to show "learn > sets > Test problem set" - the name of the actual problem set.
- [x] This is also the case for the start problem set dialog. Current: `Start Problem Set 13`, change to: `Start Test problem set?`
- [x] Mobile shows the last 2 breadcrumbs, text smaller
- [x] [BUG] Sets Completed on teams page is double counting the same problem completed multiple times - it should dedupe by problem set num
- [x] Add teams card on home page that directs the user to `/teams`
- [x] Make metadata for all pages
- [x] Not logged in user is seeing: "Error loading teams. Please try again." - we should make the teams that shows basic information public - not logged in users cannot view team pages or request to join them, the buttons are disabled on the team card. On the /team page if the user is not logged in, indicate a alert that the user must be logged in to view team pages or request to join
- [x] [BUG?] @components/learn/pages/ProblemSetDoPage.tsx - the casting for problemOrder doesn't make sense. Simplify this.
- [x] Change "Not attempting. Progress will not be saved." to alert for consistency
