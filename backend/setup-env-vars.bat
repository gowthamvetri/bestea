@echo off
echo ========================================
echo BESTEA Backend Environment Variables
echo ========================================
echo.
echo Copy these values to Vercel Dashboard
echo Go to: https://vercel.com/dashboard
echo Then: Your Backend Project ^> Settings ^> Environment Variables
echo.
echo ========================================
echo REQUIRED VARIABLES:
echo ========================================
echo.
echo 1. MONGODB_URI
echo mongodb+srv://gowthamvetriii:gowtham@tea.ojbg4hi.mongodb.net/?retryWrites=true^&w=majority^&appName=tea
echo.
echo 2. JWT_SECRET
echo your_super_secret_jwt_key_minimum_32_characters_long
echo.
echo 3. CLIENT_URL
echo https://bestea-hwja.vercel.app
echo.
echo 4. NODE_ENV
echo production
echo.
echo 5. CLOUDINARY_CLOUD_NAME
echo dzilrsn1z
echo.
echo 6. CLOUDINARY_API_KEY
echo 373465214492218
echo.
echo 7. CLOUDINARY_API_SECRET
echo XMxUvssCE1wcbVfFakNefyoLRtQ
echo.
echo ========================================
echo After adding all variables:
echo 1. Go to Deployments tab
echo 2. Click ... on latest deployment
echo 3. Click Redeploy
echo 4. Uncheck "Use existing Build Cache"
echo 5. Click Redeploy
echo ========================================
pause
