// استبدل هذه بالبيانات الخاصة بك من Cloudinary
const CLOUDINARY_CLOUD_NAME = "dxisaw6cu";
const CLOUDINARY_UPLOAD_PRESET = "anaqa-products"; // اسم البريسيت الذي أنشأته

// إعدادات Firebase (يجب أن تكون موجودة هنا أيضا)
const firebaseConfig = {
  apiKey: "AIzaSyBV_kaqlAtLTBNEcIHpc0rWHTbWXdgsXME",
  authDomain: "store-b5352.firebaseapp.com",
  projectId: "store-b5352",
  storageBucket: "store-b5352.firebasestorage.app",
  messagingSenderId: "994825915869",
  appId: "1:994825915869:web:57e664699a45b3d2fa3a34",
  measurementId: "G-KGZHS02V07"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database('https://store-b5352-default-rtdb.firebaseio.com/'); // تحديد URL الدقيق

const addProductForm = document.getElementById('add-product-form');
const uploadStatus = document.getElementById('upload-status');

addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. الحصول على بيانات الفورم
    const productName = document.getElementById('product-name').value;
    const productPrice = parseFloat(document.getElementById('product-price').value);
    const productDesc = document.getElementById('product-desc').value;
    const imageFile = document.getElementById('product-image').files[0];

    if (!imageFile || !productName || !productPrice) {
        uploadStatus.textContent = "الرجاء ملء كل الحقول واختيار صورة.";
        return;
    }

    uploadStatus.textContent = "جاري رفع الصورة...";

    // 2. إعداد البيانات لرفعها إلى Cloudinary
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        // 3. رفع الصورة إلى Cloudinary باستخدام API
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();

        if (data.secure_url) {
            const imageUrl = data.secure_url;
            uploadStatus.textContent = "تم رفع الصورة بنجاح! جاري حفظ المنتج...";

            // 4. إنشاء كائن المنتج الجديد
            const newProduct = {
                name: productName,
                price: productPrice,
                desc: productDesc,
                img: imageUrl,
                // يمكنك إضافة بيانات أخرى مثل category, featured, etc.
            };

            console.log("جاهز للحفظ:", newProduct); // تسجيل قبل الحفظ
            try {
                await db.ref('products').push(newProduct);
                console.log("تم الحفظ بنجاح"); // تسجيل بعد النجاح
                uploadStatus.textContent = "🎉 تم إضافة المنتج بنجاح!";
                addProductForm.reset(); // إفراغ الفورم
            } catch (firebaseError) {
                console.error("Firebase Error:", firebaseError);
                uploadStatus.textContent = `حدث خطأ أثناء الحفظ: ${firebaseError.message}`;
            }

        } else {
            throw new Error('فشل رفع الصورة إلى Cloudinary.');
        }

    } catch (error) {
        console.error("Error:", error);
        uploadStatus.textContent = `حدث خطأ: ${error.message}`;
    }
});