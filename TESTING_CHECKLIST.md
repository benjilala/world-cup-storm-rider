# Prediction Genesis - Manual Testing Checklist

**Test Date:** _________  
**Tester:** _________  
**URL:** http://localhost:3010

---

## ✅ Initial Load Tests

### 1. Map Rendering
- [ ] **Dark basemap loads** (CartoDB Dark Matter style)
- [ ] **Map is centered** at coordinates [0, 18] with zoom 1.25
- [ ] **Navigation controls visible** (top-left, zoom +/- buttons)
- [ ] **No console errors** related to MapLibre GL
- [ ] **Event dots (nodes) are visible** on the map
- [ ] **Event dots have colors** ranging from blue to purple based on consensus

**Expected:** Dark themed map with glowing event dots scattered globally.

---

### 2. Right Command Panel
- [ ] **Panel is visible** on the right side (360px width)
- [ ] **"COMMAND PANEL" header** displays with "Norse Sim" badge
- [ ] **SIM controls** show START/PAUSE button (should show PAUSE initially)
- [ ] **SCENARIO dropdown** is populated with options
- [ ] **INTENSITY slider** shows current mode (CALM/NORMAL/CHAOS)
- [ ] **TOGGLES section** has 3 switches:
  - Show flows (ON by default)
  - Show ripples (ON by default)
  - Highlight whales (ON by default)
- [ ] **DISCLAIMER box** visible at bottom

**Expected:** Fully functional control panel with all interactive elements.

---

### 3. Bottom 4-Panel Console
- [ ] **All 4 panels visible** in grid layout (responsive on mobile)
- [ ] **Panel 1: HOT EVENTS** - Shows table with EVENT, HEAT, 5M columns
- [ ] **Panel 2: CONSENSUS SHIFTS** - Shows consensus data
- [ ] **Panel 3: LINE MOVEMENTS** - Shows line movement data
- [ ] **Panel 4: LIVE TAPE** - Shows live bet events
- [ ] **Data populates** after a few seconds (simulation ticks)
- [ ] **ScrollArea works** in each panel

**Expected:** 4 dark-themed cards with live updating data tables.

---

### 4. Footer Disclaimer
- [ ] **Footer disclaimer visible** at bottom center
- [ ] **Text reads:** "SIMULATION — NOT REAL WAGER DATA"
- [ ] **Styling:** Dark background with blur, white/70 opacity text

**Expected:** Prominent disclaimer badge at bottom of screen.

---

## 🎯 Interactive Tests

### 5. Event Dot Click → Event Intel Drawer
1. [ ] **Click any event dot** on the map
2. [ ] **Drawer slides in** from the right side (420px width)
3. [ ] **Drawer shows "EVENT INTEL" header**
4. [ ] **Event details display:**
   - Event name and league
   - Sport badge
   - Country and start time
5. [ ] **4 metric cards show:**
   - HANDLE (5M)
   - BPM (EST)
   - CONSENSUS (A) with swing
   - LINE with movement indicator
6. [ ] **CASCADE card** shows cascade status
7. [ ] **Selected event dot** highlights on map (cyan border)
8. [ ] **Click outside or close** drawer - it closes properly
9. [ ] **Selected event** deselects on map

**Expected:** Smooth drawer animation with detailed event metrics.

---

### 6. Toggle "Show flows/ripples"

#### Test: Toggle "Show flows" OFF
1. [ ] **Click "Show flows" switch** to turn OFF
2. [ ] **Arc lines disappear** from map (no more curved lines from origins to events)
3. [ ] **Event dots remain visible**
4. [ ] **Ripples remain visible** (if "Show ripples" is still ON)
5. [ ] **Toggle back ON** - arcs reappear

**Expected:** Arcs (flows) toggle on/off without affecting other layers.

#### Test: Toggle "Show ripples" OFF
1. [ ] **Click "Show ripples" switch** to turn OFF
2. [ ] **Expanding circles disappear** from map
3. [ ] **Event dots remain visible**
4. [ ] **Flows remain visible** (if "Show flows" is still ON)
5. [ ] **Toggle back ON** - ripples reappear

**Expected:** Ripples toggle on/off independently.

#### Test: Toggle both OFF
1. [ ] **Turn OFF both flows and ripples**
2. [ ] **Only event dots visible** on map
3. [ ] **Map still interactive** (can click dots, zoom, pan)

**Expected:** Clean map with only event nodes.

---

### 7. Scenario Switch

#### Test: Change Scenario
1. [ ] **Note current scenario** in dropdown
2. [ ] **Open scenario dropdown** - list of scenarios appears
3. [ ] **Select different scenario** (e.g., switch from "Weekend Football" to another)
4. [ ] **Map resets:**
   - Event dots change positions (new events)
   - Event count may change
   - All animations reset
5. [ ] **Bottom console tables reset:**
   - HOT EVENTS updates with new events
   - CONSENSUS SHIFTS clears and rebuilds
   - LINE MOVEMENTS clears and rebuilds
   - LIVE TAPE clears and starts fresh
6. [ ] **Data continues updating** with new scenario
7. [ ] **No console errors** during scenario switch
8. [ ] **Selected event clears** (if one was selected)

**Expected:** Complete simulation reset with new event set, smooth transition.

---

### 8. Intensity Mode → CHAOS

#### Test: Move Intensity to CHAOS
1. [ ] **Current intensity mode** noted (likely NORMAL)
2. [ ] **Drag intensity slider** all the way to the right
3. [ ] **Label updates** to "CHAOS"
4. [ ] **Activity increases noticeably:**
   - More arcs (flows) appearing rapidly
   - More ripples spawning
   - Event dots pulsing more frequently
   - Higher heat scores in HOT EVENTS table
   - LIVE TAPE scrolling faster
   - Higher BPM values
5. [ ] **Map becomes more active** with more visual activity
6. [ ] **No performance issues** (should remain smooth at 60fps)
7. [ ] **No console errors**

**Expected:** Dramatic increase in bet volume, spikes, and whale frequency.

#### Test: Move Intensity to CALM
1. [ ] **Drag slider to left** (CALM)
2. [ ] **Activity decreases:**
   - Fewer arcs
   - Fewer ripples
   - Lower heat scores
   - Slower LIVE TAPE
   - Lower BPM values
3. [ ] **Simulation still running** but much quieter

**Expected:** Minimal activity, calm simulation.

---

## 🐛 Console Error Checks

### 9. Browser Console Inspection
Open browser DevTools (F12 or Cmd+Option+I) and check Console tab:

- [ ] **No errors on initial load**
- [ ] **No errors during normal operation** (let run for 30 seconds)
- [ ] **No errors when clicking event dots**
- [ ] **No errors when toggling flows/ripples**
- [ ] **No errors when switching scenarios**
- [ ] **No errors when changing intensity**
- [ ] **No warnings about missing dependencies**
- [ ] **No MapLibre GL errors**
- [ ] **No Deck.gl errors**
- [ ] **No React hydration errors**

**Record any errors below:**
```
[Error messages here]
```

---

## 🎨 UI/Visual Checks

### 10. Visual Quality
- [ ] **Vignette effect** visible (darker edges)
- [ ] **Noise texture** subtle overlay
- [ ] **Scanlines effect** visible (optional)
- [ ] **Backdrop blur** working on panels
- [ ] **Event dots glow** appropriately
- [ ] **Arc colors** correct (orange for whales, cyan for normal)
- [ ] **Ripple animations** smooth and expanding
- [ ] **Text readable** on all panels
- [ ] **No layout shifts** or jank
- [ ] **Responsive on mobile** (if testing on mobile)

---

## 📊 Data Validation

### 11. Data Integrity
- [ ] **HOT EVENTS table** shows events sorted by heat (highest first)
- [ ] **Heat scores** between 0-100
- [ ] **Handle amounts** formatted correctly ($X.XXM, $X.XK)
- [ ] **BPM values** are positive integers
- [ ] **Consensus percentages** between 0-100%
- [ ] **Line values** are decimals (e.g., 0.50, 0.52)
- [ ] **Timestamps** in LIVE TAPE are recent
- [ ] **Event names** are realistic sports matchups
- [ ] **Countries** match event locations on map

---

## 🔄 State Management

### 12. State Persistence
- [ ] **Pause simulation** - activity stops
- [ ] **Resume simulation** - activity continues
- [ ] **Toggle states persist** when switching scenarios
- [ ] **Intensity persists** when pausing/resuming
- [ ] **Selected event clears** when switching scenarios

---

## ⚡ Performance

### 13. Performance Metrics
- [ ] **Initial load time** < 3 seconds
- [ ] **Frame rate** stable at ~60fps (check DevTools Performance)
- [ ] **No memory leaks** (run for 5 minutes, check memory usage)
- [ ] **Smooth animations** on all layers
- [ ] **No stuttering** when toggling layers
- [ ] **Scenario switch** < 1 second

---

## 🚨 Known Issues / Bugs Found

**List any bugs or issues discovered:**

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## ✅ Test Summary

**Overall Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

**Critical Issues:** _________  
**Minor Issues:** _________  
**Notes:** _________

---

## 🔧 Recommended Fixes

Based on testing, list any recommended fixes with priority:

### High Priority
- 

### Medium Priority
- 

### Low Priority
- 

---

**Testing completed by:** _________  
**Date:** _________  
**Time spent:** _________
