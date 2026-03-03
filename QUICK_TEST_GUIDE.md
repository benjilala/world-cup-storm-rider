# Quick Test Guide - Prediction Genesis

**URL:** http://localhost:3010  
**Time needed:** ~10 minutes

---

## 🚀 Quick Start

1. Open http://localhost:3010 in your browser
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to Console tab
4. Follow tests below

---

## ✅ Visual Checklist (30 seconds)

Look at the screen and verify:

- [ ] **Map:** Dark themed map with glowing dots
- [ ] **Top-left:** "Simulation" badge + disclaimer text
- [ ] **Top-left (map):** Zoom +/- controls
- [ ] **Right side:** Command panel (360px wide)
- [ ] **Bottom:** 4 cards in a row (HOT EVENTS, CONSENSUS SHIFTS, LINE MOVEMENTS, LIVE TAPE)
- [ ] **Bottom center:** "SIMULATION — NOT REAL WAGER DATA" badge
- [ ] **Map:** Curved arcs flowing from origins to events
- [ ] **Map:** Expanding ripple circles
- [ ] **Console (DevTools):** No red errors

**If all checked:** ✅ Initial load PASSED

---

## 🎯 Interactive Tests (5 minutes)

### Test 1: Event Intel Drawer (30 seconds)
1. **Click any event dot** on the map
2. **Look for:** Drawer slides in from right
3. **Check:** Event name, sport badge, 4 metric cards visible
4. **Check:** Clicked dot has cyan highlight
5. **Click outside drawer** to close
6. **Check:** Highlight disappears

**Result:** ☐ PASS | ☐ FAIL

---

### Test 2: Toggle Flows (15 seconds)
1. **Find:** "Show flows" switch in right panel
2. **Click to OFF**
3. **Check:** Curved arcs disappear
4. **Click to ON**
5. **Check:** Arcs reappear

**Result:** ☐ PASS | ☐ FAIL

---

### Test 3: Toggle Ripples (15 seconds)
1. **Find:** "Show ripples" switch in right panel
2. **Click to OFF**
3. **Check:** Expanding circles disappear
4. **Click to ON**
5. **Check:** Ripples reappear

**Result:** ☐ PASS | ☐ FAIL

---

### Test 4: Scenario Switch (1 minute)
1. **Find:** SCENARIO dropdown in right panel
2. **Note current scenario** (e.g., "Weekend Football")
3. **Click dropdown** and select different scenario
4. **Check:** Map resets (event dots move)
5. **Check:** Bottom tables clear and rebuild
6. **Check:** HOT EVENTS updates with new events
7. **Check:** LIVE TAPE clears and starts fresh
8. **Check DevTools Console:** No errors

**Result:** ☐ PASS | ☐ FAIL

---

### Test 5: Intensity → CHAOS (2 minutes)
1. **Find:** INTENSITY slider in right panel
2. **Note current mode** (likely "NORMAL")
3. **Drag slider all the way RIGHT**
4. **Check:** Label updates to "CHAOS"
5. **Observe for 30 seconds:**
   - More arcs appearing rapidly
   - More ripples spawning
   - Event dots pulsing more
   - HOT EVENTS heat scores increase
   - LIVE TAPE scrolls faster
   - Higher BPM values
6. **Check:** Performance smooth (no lag)
7. **Check DevTools Console:** No errors

**Metrics to note:**
- Highest heat score: _______
- Highest BPM: _______
- Approximate arcs on screen: _______

**Result:** ☐ PASS | ☐ FAIL

---

### Test 6: Console Errors (1 minute)
1. **DevTools Console:** Clear console
2. **Let run for 30 seconds**
3. **Do random interactions:**
   - Click event dots
   - Toggle switches
   - Change intensity
   - Switch scenario
4. **Check Console:** Count errors

**Errors found:** _______  
**Warnings found:** _______

**Result:** ☐ PASS (0 errors) | ☐ FAIL (errors present)

---

## 🐛 Common Issues to Look For

### Map Issues
- [ ] Map doesn't load (stays black)
- [ ] Event dots don't appear
- [ ] Dots don't respond to clicks
- [ ] Arcs/ripples don't animate
- [ ] Zoom controls don't work

### Panel Issues
- [ ] Right panel not visible
- [ ] Bottom panels not visible
- [ ] Dropdowns don't open
- [ ] Switches don't toggle
- [ ] Slider doesn't move

### Data Issues
- [ ] Tables stay empty (no data)
- [ ] Data doesn't update
- [ ] Negative numbers where shouldn't be
- [ ] NaN or undefined values
- [ ] Timestamps in wrong format

### Performance Issues
- [ ] Lag or stuttering
- [ ] Frame drops
- [ ] Memory leak (use DevTools Memory)
- [ ] CPU spikes to 100%

### Console Errors
- [ ] MapLibre GL errors
- [ ] Deck.gl errors
- [ ] React errors
- [ ] Hydration errors
- [ ] Network errors

---

## 📊 Quick Performance Check

### Chrome DevTools Performance
1. Open DevTools → Performance tab
2. Click Record (circle icon)
3. Let run for 10 seconds in CHAOS mode
4. Stop recording
5. Check FPS (should be ~60)

### Memory Check
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Let run for 2 minutes
4. Take another snapshot
5. Compare (growth should be minimal)

---

## ✅ Pass Criteria

**Minimum to pass:**
- ✅ All visual elements visible
- ✅ Map renders with events
- ✅ Event click opens drawer
- ✅ Toggles work (flows/ripples)
- ✅ Scenario switch works
- ✅ Intensity change works
- ✅ 0 console errors
- ✅ Smooth performance (>30 FPS)

**Ideal:**
- ✅ All above
- ✅ 60 FPS in CHAOS mode
- ✅ No warnings in console
- ✅ No memory leaks
- ✅ All animations smooth

---

## 🚨 If Something Fails

### Map doesn't load
1. Check console for MapLibre GL errors
2. Check network tab for failed requests
3. Verify internet connection (map tiles load from CDN)

### No data in tables
1. Wait 5-10 seconds (simulation needs to tick)
2. Check if simulation is paused (should show PAUSE button)
3. Check console for errors

### Performance issues
1. Check CPU usage in Activity Monitor/Task Manager
2. Close other tabs/apps
3. Try in incognito mode (disable extensions)
4. Check if GPU acceleration is enabled

### Console errors
1. Note the exact error message
2. Note which action triggered it
3. Try to reproduce
4. Check if it happens in incognito mode

---

## 📝 Quick Report Template

**Date:** _______________  
**Browser:** _______________

**Results:**
- Visual checklist: ☐ PASS | ☐ FAIL
- Event drawer: ☐ PASS | ☐ FAIL
- Toggle flows: ☐ PASS | ☐ FAIL
- Toggle ripples: ☐ PASS | ☐ FAIL
- Scenario switch: ☐ PASS | ☐ FAIL
- Intensity CHAOS: ☐ PASS | ☐ FAIL
- Console errors: ☐ PASS | ☐ FAIL

**Overall:** ☐ PASS | ☐ FAIL

**Issues found:**
```
[List any issues]
```

**Console errors:**
```
[Paste any errors]
```

---

## 🎯 Expected Behavior Summary

### On Load
- Dark map appears in ~2 seconds
- Event dots appear immediately
- Right panel shows PAUSE button
- Bottom panels populate in 3-5 seconds
- No console errors

### Event Click
- Drawer slides in smoothly (<300ms)
- Event details populate immediately
- Clicked dot highlights in cyan
- Drawer closes on outside click

### Toggle Flows/Ripples
- Layers toggle instantly
- No lag or stutter
- Other layers remain visible

### Scenario Switch
- Map resets in <1 second
- All tables clear and rebuild
- New data starts flowing
- No console errors

### Intensity CHAOS
- Dramatic increase in activity
- More arcs (5-10x more)
- More ripples (3-5x more)
- Higher heat scores (70-100 range)
- Higher BPM (100-500 range)
- LIVE TAPE scrolls rapidly
- Performance remains smooth

---

**Good luck testing! 🚀**
