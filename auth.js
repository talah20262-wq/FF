import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

import { auth } from "./firebase.js";

export async function login(email,password){

    return await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

}

export async function register(email,password){

    return await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

}

export async function logout(){

    await signOut(auth);

}
