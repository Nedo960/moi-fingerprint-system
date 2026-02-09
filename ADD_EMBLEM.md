# How to Add Kuwait Emblem to PDF

The PDF currently shows a placeholder for the Kuwait emblem. To add the actual emblem:

## Option 1: Upload Emblem to Backend (Recommended)

1. Save the Kuwait emblem image as `kuwait-emblem.png`
2. Upload it to `/backend/public/` folder
3. Update `/backend/routes/pdf.js` line 76-79 to:

```html
<td style="border:none; text-align:center; width:34%;">
  <img src="${process.env.BACKEND_URL || 'https://moi-fingerprint-backend.onrender.com'}/public/kuwait-emblem.png"
       alt="شعار الكويت"
       style="width:90px; height:90px; object-fit:contain;" />
</td>
```

4. Push changes to GitHub
5. Render will redeploy automatically

## Option 2: Use Working Image URL

Find a reliable public URL for the Kuwait emblem and replace line 76-79 in `/backend/routes/pdf.js`:

```html
<td style="border:none; text-align:center; width:34%;">
  <img src="https://your-working-url-here.com/kuwait-emblem.png"
       alt="شعار الكويت"
       style="width:90px; height:90px; object-fit:contain;" />
</td>
```

## Testing

After making changes:
1. Wait for Render to redeploy
2. Create a new approved form
3. Click print - emblem should now display

---

**Current Status:** Placeholder circle with text is shown until real emblem is added.
