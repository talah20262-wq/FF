/* ==========================================================
   MHM Register System
   Part 1
========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    set,
    push
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

import {
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

/* ===============================
Firebase Config
=============================== */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "cssc-4c83c.firebaseapp.com",

    databaseURL: "https://cssc-4c83c-default-rtdb.firebaseio.com",

    projectId: "cssc-4c83c",

    storageBucket: "cssc-4c83c.appspot.com",

    messagingSenderId: "YOUR_SENDER_ID",

    appId: "YOUR_APP_ID"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);

const storage = getStorage(app);

/* ===============================
Elements
=============================== */

const form = document.getElementById("registerForm");

const fullName = document.getElementById("fullName");

const username = document.getElementById("username");

const phone = document.getElementById("phone");

const email = document.getElementById("email");

const password = document.getElementById("password");

const country = document.getElementById("country");

const city = document.getElementById("city");

const accountType = document.getElementById("accountType");

const avatar = document.getElementById("avatar");

const nationalId = document.getElementById("nationalId");

const companyFile = document.getElementById("companyFile");

/* ===============================
Validation
=============================== */

function validate(){

    if(fullName.value.trim()==""){

        alert("ادخل الاسم");

        return false;

    }

    if(username.value.trim()==""){

        alert("ادخل اسم المستخدم");

        return false;

    }

    if(phone.value.trim()==""){

        alert("ادخل الهاتف");

        return false;

    }

    if(email.value.trim()==""){

        alert("ادخل البريد");

        return false;

    }

    if(password.value.length<6){

        alert("كلمة المرور قصيرة");

        return false;

    }

    return true;

}

/* ===============================
Upload Image
=============================== */

async function uploadImage(file,path){

    if(!file){

        return "";

    }

    const imageRef = storageRef(storage,path);

    await uploadBytes(imageRef,file);

    return await getDownloadURL(imageRef);

} /* ==========================================================
   MHM Register System
   Part 2
========================================================== */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!validate()) return;

    try {

        // إنشاء حساب Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email.value.trim(),
            password.value
        );

        const uid = userCredential.user.uid;

        // رفع الملفات
        const avatarURL = await uploadImage(
            avatar.files[0],
            `avatars/${uid}`
        );

        const nationalIdURL = await uploadImage(
            nationalId.files[0],
            `nationalIds/${uid}`
        );

        let companyURL = "";

        if (companyFile.files.length > 0) {

            companyURL = await uploadImage(
                companyFile.files[0],
                `companies/${uid}`
            );

        }

        // إنشاء رقم الطلب
        const requestNumber =
            "RQ" +
            Date.now().toString().substring(5) +
            Math.floor(Math.random() * 999);

        // حفظ الطلب
        await set(
            ref(db, "Requests/" + uid),
            {

                requestNumber: requestNumber,

                uid: uid,

                fullName: fullName.value,

                username: username.value,

                phone: phone.value,

                email: email.value,

                country: country.value,

                city: city.value,

                accountType: accountType.value,

                avatar: avatarURL,

                nationalId: nationalIdURL,

                companyFile: companyURL,

                status: "pending",

                verified: false,

                role: "user",

                createdAt: Date.now()

            }
        );

        // إنشاء إشعار للمستخدم
        await set(
            ref(db, "Notifications/" + uid + "/welcome"),
            {

                title: "تم استلام الطلب",

                body: "طلبك قيد المراجعة من إدارة MHM.",

                time: Date.now(),

                read: false

            }
        );

        // الانتقال إلى صفحة الانتظار
        window.location.href =
            "waiting.html?request=" + requestNumber;

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});/* ==========================================================
   MHM Register System
   Part 3
========================================================== */

/* ========= توليد Access Code ========= */

function generateAccessCode(){

    const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code="CC-";

    for(let i=0;i<4;i++){

        code+=chars[Math.floor(Math.random()*chars.length)];

    }

    code+="-";

    for(let i=0;i<4;i++){

        code+=chars[Math.floor(Math.random()*chars.length)];

    }

    return code;

}

/* ========= توليد ID يبدأ بـ 54 ========= */

export async function generateUserID(){

    const id="54"+Math.floor(
        1000000+
        Math.random()*9000000
    );

    return id;

}

/* ========= معاينة الصورة ========= */

function preview(input,img){

    if(input.files.length===0) return;

    const reader=new FileReader();

    reader.onload=function(e){

        img.src=e.target.result;

        img.style.display="block";

    }

    reader.readAsDataURL(input.files[0]);

}

const avatarPreview=document.getElementById("avatarPreview");

if(avatar && avatarPreview){

    avatar.addEventListener("change",()=>{

        preview(avatar,avatarPreview);

    });

}

/* ========= إعادة تعيين النموذج ========= */

function clearForm(){

    form.reset();

    if(avatarPreview){

        avatarPreview.src="";

        avatarPreview.style.display="none";

    }

}

/* ========= رسالة نجاح ========= */

function success(message){

    alert(message);

}

/* ========= رسالة خطأ ========= */

function error(message){

    alert(message);

}

/* ========= سيتم استدعاء هذه الدالة من لوحة المالك ========= */

export async function approveRequest(request){

    const userID=await generateUserID();

    const accessCode=generateAccessCode();

    await set(

        ref(db,"Users/"+userID),

        {

            id:userID,

            accessCode:accessCode,

            uid:request.uid,

            fullName:request.fullName,

            username:request.username,

            phone:request.phone,

            email:request.email,

            accountType:request.accountType,

            avatar:request.avatar,

            verified:true,

            role:"user",

            status:"active",

            createdAt:Date.now()

        }

    );

    await set(

        ref(db,"Notifications/"+request.uid+"/approved"),

        {

            title:"تم قبول الحساب",

            body:"تم تفعيل حسابك بنجاح.",

            id:userID,

            accessCode:accessCode,

            read:false,

            time:Date.now()

        }

    );

    return{

        id:userID,

        accessCode:accessCode

    };

}

/* ========= جاهزية الملف ========= */

console.log("MHM Register System Loaded");
