const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Android icon sizes
const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// iOS icon sizes
const iosSizes = {
  '20pt@1x': 20,
  '20pt@2x': 40,
  '20pt@3x': 60,
  '29pt@1x': 29,
  '29pt@2x': 58,
  '29pt@3x': 87,
  '40pt@1x': 40,
  '40pt@2x': 80,
  '40pt@3x': 120,
  '60pt@2x': 120,
  '60pt@3x': 180,
  '76pt@1x': 76,
  '76pt@2x': 152,
  '83.5pt@2x': 167,
  '1024pt@1x': 1024
};

async function generateIcons() {
  const sourceImage = path.join(__dirname, '../src/assets/images/logo.png');
  const androidDir = path.join(__dirname, '../android/app/src/main/res');
  const iosDir = path.join(__dirname, '../ios/MentorApp/Images.xcassets/AppIcon.appiconset');

  console.log('Generating Android icons...');
  
  // Generate Android icons
  for (const [folder, size] of Object.entries(androidSizes)) {
    const folderPath = path.join(androidDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate regular icon
    await sharp(sourceImage)
      .resize(size, size)
      .png()
      .toFile(path.join(folderPath, 'ic_launcher.png'));

    // Generate round icon
    await sharp(sourceImage)
      .resize(size, size)
      .png()
      .toFile(path.join(folderPath, 'ic_launcher_round.png'));

    console.log(`Generated ${folder}/ic_launcher.png (${size}x${size})`);
  }

  console.log('Generating iOS icons...');
  
  // Generate iOS icons
  for (const [name, size] of Object.entries(iosSizes)) {
    const fileName = `AppIcon-${name}.png`;
    const filePath = path.join(iosDir, fileName);
    
    await sharp(sourceImage)
      .resize(size, size)
      .png()
      .toFile(filePath);

    console.log(`Generated ${fileName} (${size}x${size})`);
  }

  // Update iOS Contents.json
  const contentsJson = {
    "images": [
      {
        "filename": "AppIcon-20pt@1x.png",
        "idiom": "iphone",
        "scale": "1x",
        "size": "20x20"
      },
      {
        "filename": "AppIcon-20pt@2x.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "20x20"
      },
      {
        "filename": "AppIcon-20pt@3x.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "20x20"
      },
      {
        "filename": "AppIcon-29pt@1x.png",
        "idiom": "iphone",
        "scale": "1x",
        "size": "29x29"
      },
      {
        "filename": "AppIcon-29pt@2x.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "29x29"
      },
      {
        "filename": "AppIcon-29pt@3x.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "29x29"
      },
      {
        "filename": "AppIcon-40pt@1x.png",
        "idiom": "iphone",
        "scale": "1x",
        "size": "40x40"
      },
      {
        "filename": "AppIcon-40pt@2x.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "40x40"
      },
      {
        "filename": "AppIcon-40pt@3x.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "40x40"
      },
      {
        "filename": "AppIcon-60pt@2x.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "60x60"
      },
      {
        "filename": "AppIcon-60pt@3x.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "60x60"
      },
      {
        "filename": "AppIcon-20pt@1x.png",
        "idiom": "ipad",
        "scale": "1x",
        "size": "20x20"
      },
      {
        "filename": "AppIcon-20pt@2x.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "20x20"
      },
      {
        "filename": "AppIcon-29pt@1x.png",
        "idiom": "ipad",
        "scale": "1x",
        "size": "29x29"
      },
      {
        "filename": "AppIcon-29pt@2x.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "29x29"
      },
      {
        "filename": "AppIcon-40pt@1x.png",
        "idiom": "ipad",
        "scale": "1x",
        "size": "40x40"
      },
      {
        "filename": "AppIcon-40pt@2x.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "40x40"
      },
      {
        "filename": "AppIcon-76pt@1x.png",
        "idiom": "ipad",
        "scale": "1x",
        "size": "76x76"
      },
      {
        "filename": "AppIcon-76pt@2x.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "76x76"
      },
      {
        "filename": "AppIcon-83.5pt@2x.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "83.5x83.5"
      },
      {
        "filename": "AppIcon-1024pt@1x.png",
        "idiom": "ios-marketing",
        "scale": "1x",
        "size": "1024x1024"
      }
    ],
    "info": {
      "author": "xcode",
      "version": 1
    }
  };

  fs.writeFileSync(
    path.join(iosDir, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );

  console.log('Generated Contents.json for iOS');
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);