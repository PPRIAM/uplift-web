---
name: visual-perception-and-navigation
description: Visual navigation using chrome-devtools and Playwright. Translates accessibility tree nodes into bounding boxes for coordinate-based clicks. Use when the user requests element inspection, mouse movement, page scrolling, or clicking on interactive visual elements.
---

# Visual Perception and Navigation Skill

## When to use this skill
- When navigating a web page using coordinate-based clicks instead of selector-based clicks.
- When capturing visual screenshots and retrieving the accessibility tree to extract element coordinates.
- When scroll-to-view is needed for offscreen elements.

## Workflow
1. Use `navigate_page` to go to the target URL.
2. Use `take_screenshot` to retrieve the visual representation.
3. Use `take_snapshot` to extract the DOM/Accessibility tree nodes.
4. Filter interactive nodes and find their bounding box coordinates.
5. Perform coordinate-based actions (`click`, `hover`) at the center of the elements.
6. Scroll if elements are offscreen.

## Instructions
- Always wait for the network to idle before performing screenshots.
- Calculate the center of the bounding box: `x_center = x + width/2`, `y_center = y + height/2`.
- When tech-savviness is low: ignore elements that contain only abstract icons unless they have an aria-label or visible label text.
