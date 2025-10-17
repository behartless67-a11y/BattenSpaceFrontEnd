# Batten Space Frontend - Session Updates
**Date:** October 17, 2025

## Summary
Enhanced the Batten Space portal with a new Room Analytics tool, improved UI layout, and integrated live room usage statistics from the existing Azure Function API.

---

## Major Features Added

### 1. Room Analytics Tool
A dedicated standalone page for facilities management to view detailed room usage statistics.

**Location:** `/room-analytics`

**Features:**
- Real-time room usage data from Azure Function API
- Time range filters: Today, Week (default), Month
- Top 5 most-used rooms ranking
- Summary cards showing:
  - Average hours per day across all rooms
  - Total events scheduled today
  - Number of active rooms being tracked
- Placeholder sections for future features:
  - Usage trends charts
  - Capacity analysis
  - Event calendar integration
  - Export reports functionality

**Technical Implementation:**
- Created `RoomStats` component ([src/components/RoomStats.tsx](src/components/RoomStats.tsx))
- Fetches data from existing Azure Function: `https://roomtool-calendar-function.azurewebsites.net/api/getcalendar`
- Parses ICS calendar files to extract event data
- Calculates average usage hours per day over selected time period
- Auto-refreshes every 15 minutes
- Tracks 8 rooms across Garrett Hall and Pavilion X

**Rooms Tracked:**
- Garrett Hall: Conference Room A L014, Great Hall 100, Seminar Room L039, Student Lounge 206
- Pavilion X: Upper Garden, Basement Room 1, Basement Room 2, Basement Exhibit

---

## UI/UX Improvements

### Main Dashboard Enhancements

1. **Increased Whitespace**
   - Added more spacing between header and welcome message (py-12 vs py-6)
   - Increased hero section bottom margin (mb-16 vs mb-8)
   - Better visual breathing room throughout

2. **Tool Cards Layout**
   - Changed from 2-column grid to 3-column grid (`md:grid-cols-3`)
   - Removed max-width constraint for full-width utilization
   - All 3 tools now display in a single row on desktop

3. **Enhanced Tool Card Design**
   - Larger cards with more padding (p-8 vs p-6)
   - Centered vertical layout instead of horizontal
   - Bigger icons (20x20 vs 16x16)
   - Larger headings (text-2xl vs text-xl)
   - Better text sizing and spacing
   - Full-height cards with flex layout

4. **Footer Updates**
   - Added Batten School logo ([bat_rgb_ko.png](public/bat_rgb_ko.png))
   - Increased padding (py-8 vs py-4)
   - Removed copyright text and "University of Virginia" text
   - Clean layout with logo on left, support email on right

5. **Personalized Welcome**
   - Welcome message now includes user's first and last name
   - Extracts name from Azure AD claims or formats from email
   - Falls back gracefully if name unavailable

---

## Technical Details

### Files Created

1. **[src/components/RoomStats.tsx](src/components/RoomStats.tsx)**
   - Main room analytics component
   - ICS calendar parsing logic
   - Time range filtering (Day/Week/Month)
   - Statistics calculation and display
   - ~350 lines

2. **[src/app/room-analytics/page.tsx](src/app/room-analytics/page.tsx)**
   - Dedicated analytics page
   - Full-page layout with back button
   - Placeholder cards for future features
   - ~130 lines

3. **[public/bat_rgb_ko.png](public/bat_rgb_ko.png)**
   - Batten School logo image
   - Displayed in footer

### Files Modified

1. **[src/app/page.tsx](src/app/page.tsx)**
   - Added Room Analytics tool to tools array
   - Enhanced layout spacing and grid configuration
   - Improved tool card design
   - Added user name extraction logic
   - Updated routing to support internal pages

2. **[src/components/Footer.tsx](src/components/Footer.tsx)**
   - Added logo image with Next.js Image component
   - Increased padding
   - Simplified text content
   - Improved layout structure

---

## API Integration

### Azure Function Connection
The Room Analytics feature connects to your existing RoomTool Azure Function:

**Endpoint:** `https://roomtool-calendar-function.azurewebsites.net/api/getcalendar`

**Parameters:**
- `room`: Room ID (e.g., `confa`, `greathall`, `seminar`)

**Response:** ICS calendar format with event data

**How It Works:**
1. Component fetches calendar data for each room
2. Parses ICS format to extract events (start time, end time, duration)
3. Filters events based on selected time range
4. Calculates average hours per day
5. Counts today's events
6. Ranks rooms by usage
7. Displays top 5 rooms with statistics

---

## Room Usage Metrics Explanation

### "Average Hours Per Day"
This metric shows the **average number of hours per day** a room is booked during the selected time period.

**Calculation:**
- Sum all event durations in the time period
- Divide by number of days in the period
- Round to 1 decimal place

**Example:**
- If "Week" is selected and Great Hall shows "10.7h":
  - **10.7 hours per day** on average
  - Over 7 days = approximately **75 total hours** (10.7 × 7)

**Time Ranges:**
- **Today:** Usage for current day only (0-24 hours)
- **Week:** 7-day average (last 7 days)
- **Month:** 30-day average (last 30 days)

---

## Deployment Notes

### Azure Static Web Apps Compatibility
- Uses static export (`output: "export"` in next.config.js)
- No server-side API routes (would fail with static export)
- All data fetching happens client-side
- Compatible with Azure Static Web Apps hosting

### Environment Support
- **Production:** Uses Azure Easy Auth for authentication
- **Local Development:** Mock authentication enabled for testing
- Room analytics work in both environments

---

## Future Enhancement Ideas

Based on the placeholder cards in Room Analytics page:

1. **Usage Trends Charts**
   - Line/bar charts showing usage over time
   - Peak hours visualization
   - Day-of-week patterns
   - Seasonal trends

2. **Capacity Analysis**
   - Room capacity utilization percentages
   - Booking efficiency metrics
   - Recommendations for optimization

3. **Event Calendar View**
   - Integrated calendar showing all room bookings
   - Filter by room, date, or event type
   - Quick booking status overview

4. **Export Reports**
   - CSV/PDF export functionality
   - Custom date range selection
   - Detailed usage breakdowns
   - Administrative summaries

---

## Testing Checklist

✅ Main dashboard loads with 3 tools in single row
✅ Tool cards display larger with centered layout
✅ Welcome message shows personalized greeting
✅ Footer displays Batten School logo
✅ Increased spacing looks balanced
✅ Room Analytics tool navigates to `/room-analytics`
✅ Room statistics load from Azure Function
✅ Time range filters work (Today/Week/Month)
✅ Top 5 rooms display correctly
✅ Back button returns to dashboard
✅ Changes committed and pushed to GitHub

---

## Git Commit

**Commit Hash:** `4af7894`
**Branch:** `main`
**Remote:** `https://github.com/behartless67-a11y/BattenSpaceFrontEnd`

**Commit Message:**
```
Add Room Analytics tool and enhance UI layout

Major features:
- Add new Room Analytics standalone page with live room usage statistics
- Integrate with Azure Function API for real-time calendar data
- Display usage metrics with time range filters (Today/Week/Month)
- Show top 5 most-used rooms with average hours per day

UI improvements:
- Increase whitespace between header and welcome message
- Display all tool cards in single row with larger size
- Enhance tool card design with centered layout
- Increase footer padding
- Add Batten School logo to footer

Technical changes:
- Create RoomStats component with ICS calendar parsing
- Add room-analytics page route
- Update main page with personalized welcome
- Add internal routing support
```

---

## Next Steps

1. **Deploy to Azure** - Changes will auto-deploy via GitHub Actions
2. **Test in Production** - Verify authentication and room data loading
3. **Gather Feedback** - Get input from facilities team on analytics
4. **Plan Enhancements** - Prioritize future features (charts, reports, etc.)

---

## Resources

- **Repository:** https://github.com/behartless67-a11y/BattenSpaceFrontEnd
- **Live Site:** https://thebattenspace.org
- **Room Reservations:** https://roomres.thebattenspace.org
- **Azure Function:** https://roomtool-calendar-function.azurewebsites.net
- **Documentation:** [README.md](README.md)
