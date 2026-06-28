import {
ref,
set,
push,
get,
child,
update,
remove
}
from
"https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

import { db } from "./firebase.js";

export async function save(path,data){

    await set(ref(db,path),data);

}

export async function read(path){

    const snap=await get(child(ref(db),path));

    return snap.val();

}

export async function edit(path,data){

    await update(ref(db,path),data);

}

export async function del(path){

    await remove(ref(db,path));

}

export async function create(path,data){

    const newRef=push(ref(db,path));

    await set(newRef,data);

    return newRef.key;

}
