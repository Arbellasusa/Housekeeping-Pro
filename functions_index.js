const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const fetch     = require('node-fetch');
admin.initializeApp();
const db = admin.firestore();

const WA_TOKEN    = functions.config().whatsapp?.token;
const WA_PHONE_ID = functions.config().whatsapp?.phone_id;
const WA_VERSION  = 'v19.0';
const WA_URL      = `https://graph.facebook.com/${WA_VERSION}/${WA_PHONE_ID}/messages`;

async function sendWA(to, body) {
  if(!to||!body||!WA_TOKEN||!WA_PHONE_ID) return;
  const phone = to.replace(/[^0-9]/g,'');
  try {
    await fetch(WA_URL, { method:'POST',
      headers:{'Authorization':`Bearer ${WA_TOKEN}`,'Content-Type':'application/json'},
      body: JSON.stringify({messaging_product:'whatsapp',to:phone,type:'text',text:{body}})
    });
    await db.collection('wa_logs').add({
      to:phone.slice(-4).padStart(phone.length,'*'),
      ts:admin.firestore.FieldValue.serverTimestamp()
    });
  } catch(e){ console.error('WA:',e.message); }
}
async function getContacto(rol){
  const snap = await db.collection('settings').doc('whatsapp').get();
  if(!snap.exists)return null;
  return snap.data()[rol]||null;
}

exports.onSolicitudUrgente = functions.firestore.document('solicitudes/{id}').onCreate(async(snap)=>{
  const s=snap.data(); if(s.prioridad!=='urgente')return;
  const tel=await getContacto('almacenero'); if(!tel)return;
  await sendWA(tel,`🚨 *URGENTE — Hyde House Hotel*\nHab. ${s.hab}\n${s.item} × ${s.qty}\n👤 ${s.nombreUsuario}`);
});

exports.onInventarioCambio = functions.firestore.document('inventario/{id}').onWrite(async(change)=>{
  const d=change.after.data(); if(!d)return;
  const f=Math.max(0,(d.existenciaInicial||0)+(d.entradas||0)-(d.salidas||0));
  const estado=f===0?'agotado':f<=(d.minimo||0)?'bajo':'ok';
  if(estado==='ok')return;
  const dAntes=change.before.data()||{};
  const fAntes=Math.max(0,(dAntes.existenciaInicial||0)+(dAntes.entradas||0)-(dAntes.salidas||0));
  const estadoAntes=fAntes===0?'agotado':fAntes<=(dAntes.minimo||0)?'bajo':'ok';
  if(estado===estadoAntes)return;
  const tel=await getContacto('almacenero'); if(!tel)return;
  await sendWA(tel,`${estado==='agotado'?'🔴':'⚠️'} *${estado.toUpperCase()} — ${d.nombre}*\nHyde House Hotel\nExistencia: ${f} ${d.unidad||'ud'} (mín: ${d.minimo||0})\n¡Favor reponer! 🙏`);
});

exports.onIncidenciaNueva = functions.firestore.document('incidencias/{id}').onCreate(async(snap)=>{
  const inc=snap.data();
  const [telSup,telAdm]=await Promise.all([getContacto('supervisor'),getContacto('admin')]);
  const msg=`🔧 *INCIDENCIA — Hyde House Hotel*\nHab. ${inc.hab}\n${inc.descripcion}\n👤 ${inc.nombreUsuario}\n${inc.fotoURL?'📸 Hay foto en la app':''}`;
  if(telSup) await sendWA(telSup,msg);
  if(telAdm&&telAdm!==telSup) await sendWA(telAdm,msg);
});

exports.onHabLista = functions.firestore.document('habitaciones_listas/{id}').onCreate(async(snap)=>{
  const h=snap.data();
  const tel=await getContacto('supervisor'); if(!tel)return;
  await sendWA(tel,`✅ *HAB. LISTA — ${h.hab}*\n👤 ${h.nombreUsuario}\n📸 ${h.fotosURLs?.length||0} foto(s)${h.obs?'\n📝 '+h.obs:''}`);
});

exports.reporteDiario = functions.pubsub.schedule('0 8 * * *').timeZone('America/New_York').onRun(async()=>{
  const hoy=new Date().toISOString().slice(0,10);
  const [invSnap,solSnap]=await Promise.all([db.collection('inventario').get(),db.collection('solicitudes').where('fecha','==',hoy).get()]);
  const bajos=invSnap.docs.map(d=>d.data()).filter(p=>{const f=Math.max(0,(p.existenciaInicial||0)+(p.entradas||0)-(p.salidas||0));return f<=(p.minimo||0);});
  const tel=await getContacto('almacenero'); if(!tel)return;
  let msg=`📊 *Reporte Diario — Hyde House Hotel*\n📅 ${hoy}\n📦 Solicitudes: ${solSnap.size}\n`;
  if(bajos.length){msg+=`\n⚠️ Bajo stock:\n`;bajos.slice(0,8).forEach(p=>{const f=Math.max(0,(p.existenciaInicial||0)+(p.entradas||0)-(p.salidas||0));msg+=`  • ${p.nombre}: ${f} ${p.unidad||'ud'}\n`;});}
  else msg+='\n✅ Todo el stock OK\n';
  await sendWA(tel,msg);
  await db.collection('reportes_diarios').add({fecha:hoy,solicitudes:solSnap.size,bajos:bajos.length,ts:admin.firestore.FieldValue.serverTimestamp()});
});

exports.crearUsuario = functions.https.onCall(async(data,ctx)=>{
  if(!ctx.auth) throw new functions.https.HttpsError('unauthenticated','Login requerido');
  const caller=await db.collection('usuarios').doc(ctx.auth.uid).get();
  if(!caller.exists||caller.data().rol!=='admin') throw new functions.https.HttpsError('permission-denied','Solo admin');
  const user=await admin.auth().createUser({email:data.email,password:data.password,displayName:data.nombre});
  await db.collection('usuarios').doc(user.uid).set({
    uid:user.uid,nombre:data.nombre,email:data.email,rol:data.rol,
    hotelCodigo:'HYDE_HOTEL',creadoPor:ctx.auth.uid,
    creadoEn:admin.firestore.FieldValue.serverTimestamp()
  });
  return{uid:user.uid};
});
