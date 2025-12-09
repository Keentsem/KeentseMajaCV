# How to Add Project Screenshots & Mascots

This guide explains how to add screenshots and mascot images to your project pages.

## Folder Structure

Your images should be organized like this:

```
public/
  images/
    projects/
      payment-portal/
        mascot.png
        screenshot1.png
        screenshot2.png
        screenshot3.png
        ...
      construction-portal/
        mascot.png
        screenshot1.png
        screenshot2.png
        ...
      azure-retail/
        mascot.png
        screenshot1.png
        ...
      notary-app/
        mascot.png
        screenshot1.png
        ...
      municipal-platform/
        mascot.png
        screenshot1.png
        ...
```

## Step 1: Prepare Your Images

1. **Mascot/Logo Images**:
   - Size: Recommended 400x400px or square aspect ratio
   - Format: PNG with transparent background preferred
   - File name: `mascot.png`

2. **Screenshot Images**:
   - Size: Any reasonable size (1920x1080 recommended)
   - Format: PNG or JPG
   - File names: `screenshot1.png`, `screenshot2.png`, etc.

## Step 2: Add Images to Folders

1. Open the folder: `public/images/projects/[your-project-name]/`
2. Copy your mascot image and rename it to `mascot.png`
3. Copy your screenshot images and name them sequentially: `screenshot1.png`, `screenshot2.png`, etc.

## Step 3: Update Project HTML File

Open the project HTML file (e.g., `public/projects/payment-portal.html`) and update:

### Update Mascot Image

Find this line:
```html
<img src="../images/projects/PROJECT_FOLDER/mascot.png" alt="Project Mascot" class="project-mascot">
```

Replace `PROJECT_FOLDER` with your actual project folder name:
```html
<img src="../images/projects/payment-portal/mascot.png" alt="Payment Portal Mascot" class="project-mascot">
```

### Update Screenshots

Find the screenshot gallery section and add your screenshots:

```html
<div class="gallery-grid">
  <!-- Screenshot 1 -->
  <div class="screenshot-item" onclick="openLightbox(this)">
    <img src="../images/projects/payment-portal/screenshot1.png" alt="Screenshot 1">
    <div class="screenshot-caption">
      Login Screen
      <br>
      <a href="../images/projects/payment-portal/screenshot1.png" download class="download-btn" onclick="event.stopPropagation()">DOWNLOAD</a>
    </div>
  </div>

  <!-- Screenshot 2 -->
  <div class="screenshot-item" onclick="openLightbox(this)">
    <img src="../images/projects/payment-portal/screenshot2.png" alt="Screenshot 2">
    <div class="screenshot-caption">
      Dashboard View
      <br>
      <a href="../images/projects/payment-portal/screenshot2.png" download class="download-btn" onclick="event.stopPropagation()">DOWNLOAD</a>
    </div>
  </div>

  <!-- Add more screenshots as needed -->
</div>
```

## Step 4: Test Locally

1. Run `npm run dev` to test locally
2. Click on the project from your portfolio homepage
3. Verify:
   - Mascot image loads correctly
   - All screenshots load
   - Clicking screenshots opens full-size view
   - Download buttons work

## Step 5: Deploy

1. Run `npm run build` to rebuild the site
2. Commit and push changes:
   ```bash
   git add public/images public/projects
   git commit -m "Add project screenshots and mascots"
   git push origin main
   ```

3. Wait 1-2 minutes for GitHub Actions to deploy

## Features of the Screenshot Gallery

- **Click to Enlarge**: Click any screenshot to view full-size
- **Download Individual**: Each screenshot has a download button
- **Download All**: Button at the bottom to download all screenshots at once
- **Responsive**: Gallery adapts to mobile/tablet screens
- **Lightbox View**: Full-screen viewing with ESC key to close

## Template Reference

Use `public/projects/project-template.html` as a reference for creating new project pages with the screenshot gallery.

## Tips

- Keep image file sizes reasonable (under 2MB each) for fast loading
- Use descriptive captions for each screenshot
- Add at least 3-5 screenshots to show key features
- Make sure all images are properly cropped and high quality
- Test on mobile to ensure images display correctly
