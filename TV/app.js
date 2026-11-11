/* TV Libre IPTV: primera versión web. Solo fuentes autorizadas por su titular. */
(() => {
'use strict';
const $ = (id) => document.getElementById(id);
const state = { section:'live', category:'Todos', search:'', items:[], source:'', favorites:new Set(readFavorites()), epg:new Map(), xtream:null, playing:null, hls:null, tsPlayer:null, demo:false,attempt:0,liveFormat:"direct" };
const navTitles = {live:'TV en directo',movies:'Películas',series:'Series',favorites:'Mis favoritos',guide:'Guía de programación'};
let toastTimer;
function readFavorites(){try{return JSON.parse(localStorage.getItem('tvlibre_favorites')||'[]')}catch{return []}}
const SERVERS_KEY='tvlibre_xtream_servers_v1';

// La biblioteca se guarda en IndexedDB (más capacidad que localStorage).
// Los archivos seleccionados no se reabren desde el disco: guardamos su contenido importado.
const DB_NAME='tvlibre_bibliotecas_v10';
const LAST_LIBRARY='tvlibre_last_library_v10';
let dbPromise;
function database(){
 if(!('indexedDB' in window))return Promise.reject(Error('IndexedDB no está disponible en este navegador'));
 if(!dbPromise) dbPromise=new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('libraries'))db.createObjectStore('libraries',{keyPath:'key'});if(!db.objectStoreNames.contains('meta'))db.createObjectStore('meta',{keyPath:'key'})};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('Error al abrir almacenamiento'));
 });return dbPromise;
}
async function dbOp(store,mode,fn){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction(store,mode);let req;try{req=fn(tx.objectStore(store))}catch(err){reject(err);return}tx.oncomplete=()=>resolve(req?.result);tx.onerror=()=>reject(tx.error||Error('Error guardando biblioteca'));tx.onabort=()=>reject(tx.error||Error('Guardado cancelado'))})}
const dbGet=(store,key)=>dbOp(store,'readonly',s=>s.get(key));
const dbPut=(store,value)=>dbOp(store,'readwrite',s=>s.put(value));
const dbAll=(store)=>dbOp(store,'readonly',s=>s.getAll());
const dbDelete=(store,key)=>dbOp(store,'readwrite',s=>s.delete(key));
const libraryKey=(type,name)=>type+':'+name;
let activeLibraryKey='';
function safeStorageGet(key){try{return localStorage.getItem(key)}catch{return null}}
function safeStorageSet(key,value){try{localStorage.setItem(key,value)}catch(e){console.warn('No se pudo guardar preferencia:',e)}}
function packItems(items,type){if(type!=='xtream')return items;return items.map(item=>{
 const copy={...item};delete copy.url;
 if(item.type==='movies'){const match=item.url?.match(/\.([a-z0-9]+)(?:\?|$)/i);copy.extension=match?.[1]||'mp4'}
 return copy;
})}
function unpackItems(lib){if(lib.type!=='xtream')return lib.items;
 return lib.items.map(item=>{
  const copy={...item};if(state.xtream&&item.type==='live')copy.url=buildXtreamMedia('live',item.id,state.liveFormat);
  if(state.xtream&&item.type==='movies')copy.url=buildXtreamMedia('movies',item.id,item.extension||'mp4');
  return copy;
 })
}
async function rememberLibrary(type,name,items,extras={}){
 const key=libraryKey(type,name),lib={key,type,name,items:packItems(items,type),updated:new Date().toISOString(),...extras};
 try{await dbPut('libraries',lib);activeLibraryKey=key;safeStorageSet(LAST_LIBRARY,key);await refreshLibrarySelector();}
 catch(e){notify('No se pudo guardar la biblioteca. Comprueba el espacio del navegador: '+e.message)}
}
async function refreshLibrarySelector(){
 const select=$('savedLibraries');if(!select)return;
 const previous=activeLibraryKey||safeStorageGet(LAST_LIBRARY)||'';
 const libs=await dbAll('libraries').catch(()=>[]);libs.sort((a,b)=>b.updated.localeCompare(a.updated));
 select.replaceChildren();for(const lib of libs){const o=document.createElement('option');o.value=lib.key;o.textContent=lib.name+' ('+lib.items.length+')';select.append(o)}
 select.value=previous;if(!libs.some(x=>x.key===previous)&&libs.length)select.value=libs[0].key;
 $('noLibraryHint').hidden=libs.length>0;
}
async function showLibrary(key){
 const lib=await dbGet('libraries',key).catch(()=>null);if(!lib)return false;
 if(lib.type==='xtream'){
  state.xtream=null;
  const server=getSavedServers().find(x=>x.name===lib.serverName);
  if(server){loadSavedServer(server.name);if(server.password)state.xtream={host:server.host,username:server.username,password:server.password};state.liveFormat=server.liveFormat||'m3u8'}
 }
 activeLibraryKey=key;safeStorageSet(LAST_LIBRARY,key);
 setItems(unpackItems(lib),lib.name,false,true);
 if(lib.type==='xtream'&&!state.xtream)notify('Catálogo recuperado. Conecta tu cuenta Xtream para reproducir contenidos.');
 $('savedLibraries').value=key;
 return true;
}
async function removeLibrary(){const key=$('savedLibraries').value;if(!key)return;
 if(!confirm('¿Eliminar esta biblioteca guardada?'))return;
 await dbDelete('libraries',key);activeLibraryKey='';safeStorageSet(LAST_LIBRARY,'');
 state.items=[];state.source='';state.xtream=null;render();await refreshLibrarySelector();notify('Biblioteca eliminada');
}
async function restoreStartup(){
 updateSavedServers();const last=safeStorageGet(LAST_LIBRARY);
 await refreshLibrarySelector();
 if(last)await showLibrary(last);
 else if($('savedLibraries').value)await showLibrary($('savedLibraries').value);
 const cachedEpg=await dbGet('meta','epg').catch(()=>null);
 if(cachedEpg?.xml)try{parseXmlTv(cachedEpg.xml,true)}catch(e){console.warn('No se pudo restaurar EPG',e)}
 if(!state.items.length){const servers=getSavedServers();if(servers.length)loadSavedServer(servers[0].name)}
}
async function saveEpg(xml){try{await dbPut('meta',{key:'epg',xml,updated:Date.now()})}catch(e){notify('No se pudo guardar la guía EPG: '+e.message)}}
function downloadM3UForVlc(){
 const item=state.playing;if(!item?.url)return;
 const content='#EXTM3U\n#EXTINF:-1,'+item.name.replace(/[\r\n,]/g,' ')+'\n'+item.url+'\n';
 const blob=new Blob([content],{type:'audio/x-mpegurl'});const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='tvlibre-canal-vlc.m3u';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
 notify('Lista descargada. Ábrela con VLC para probar el directo.');
}

function getSavedServers(){try{const value=JSON.parse(localStorage.getItem(SERVERS_KEY)||'[]');return Array.isArray(value)?value.filter(x=>x&&typeof x.name==='string'&&typeof x.host==='string'&&typeof x.username==='string').slice(0,50):[]}catch{return []}}
function putSavedServers(servers){try{localStorage.setItem(SERVERS_KEY,JSON.stringify(servers));return true}catch(e){throw Error('Este navegador no permite guardar conexiones desde este archivo. Puedes usar Exportar JSON para conservarlas.')}}
function serverFields(){const entry={name:$('xtreamName').value.trim()||$('xtreamHost').value.trim(),host:cleanHost($('xtreamHost').value),username:$('xtreamUser').value.trim(),liveFormat:$('xtreamLiveFormat').value};if($('xtreamRememberPass').checked&&$('xtreamPass').value)entry.password=$('xtreamPass').value;return entry}
function updateSavedServers(selected=''){const list=$('savedXtream');list.replaceChildren();const option=document.createElement('option');option.value='';option.textContent='Nueva conexión';list.append(option);for(const server of getSavedServers()){const opt=document.createElement('option');opt.value=server.name;opt.textContent=server.name;list.append(opt)}list.value=selected}
function loadSavedServer(name){const server=getSavedServers().find(x=>x.name===name);if(!server)return;$('xtreamName').value=server.name;$('xtreamHost').value=server.host;$('xtreamUser').value=server.username;$('xtreamPass').value=typeof server.password==='string'?server.password:'';$('xtreamRememberPass').checked=!!server.password;$('xtreamLiveFormat').value=['ts','direct'].includes(server.liveFormat)?server.liveFormat:'m3u8';message(server.password?'Conexión cargada con contraseña guardada.':'Conexión cargada. Introduce la contraseña para conectar.');}
function saveSavedServer(silent=false){const entry=serverFields();if(!onlyHttp(entry.host)||!entry.username){if(!silent)message('Introduce una URL y usuario válidos antes de guardar.',true);return false}const servers=getSavedServers();const idx=servers.findIndex(x=>x.name===entry.name);if(idx>=0)servers[idx]=entry;else servers.push(entry);try{putSavedServers(servers);updateSavedServers(entry.name);if(!silent)message(entry.password?'Conexión y contraseña guardadas en este navegador.':'Conexión guardada sin contraseña.');return true}catch(e){if(!silent)message('No se pudo guardar en este navegador: '+e.message,true);return false}}
function deleteSavedServer(){const name=$('savedXtream').value||$('xtreamName').value.trim();if(!name)return;const servers=getSavedServers().filter(x=>x.name!==name);try{putSavedServers(servers)}catch(e){message(e.message,true);return}updateSavedServers();$('xtreamName').value='';$('xtreamHost').value='';$('xtreamUser').value='';$('xtreamPass').value='';$('xtreamRememberPass').checked=false;message('Conexión eliminada del navegador.');}
function exportSavedServers(){const body=JSON.stringify({format:'tvlibre-servers-v1',servers:getSavedServers().map(({name,host,username,liveFormat})=>({name,host,username,liveFormat}))},null,2);const blob=new Blob([body],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='tvlibre-servidores.json';document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);message('Archivo exportado sin contraseñas.');}
async function importSavedServers(file){try{if(file.size>200000)throw Error('Archivo demasiado grande');const json=JSON.parse(await file.text());if(json.format!=='tvlibre-servers-v1'||!Array.isArray(json.servers))throw Error('Formato de archivo incorrecto');const servers=getSavedServers();let count=0;for(const candidate of json.servers.slice(0,50)){if(!candidate||typeof candidate.name!=='string'||typeof candidate.host!=='string'||typeof candidate.username!=='string')continue;const entry={name:candidate.name.trim().slice(0,100),host:cleanHost(candidate.host),username:candidate.username.trim(),liveFormat:['ts','direct'].includes(candidate.liveFormat)?candidate.liveFormat:'m3u8'};if(!entry.name||!onlyHttp(entry.host)||!entry.username)continue;const idx=servers.findIndex(s=>s.name===entry.name);if(idx>=0)servers[idx]=entry;else servers.push(entry);count++}putSavedServers(servers.slice(0,50));updateSavedServers();message(`${count} conexiones importadas. Tendrás que escribir sus contraseñas.`)}catch(e){message('No se pudo importar: '+e.message,true)}}
function persistFavorites(){localStorage.setItem('tvlibre_favorites',JSON.stringify([...state.favorites]));}
function notify(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4400)}
function message(text,err=false){$('settingsNotice').textContent=text;$('settingsNotice').style.color=err?'#ffb0b0':'#c3b7ff';if(err) notify(text)}
function openOverlay(id){$(id).hidden=false;document.body.style.overflow='hidden';$(id).querySelector('button')?.focus()}
function closeOverlay(id){$(id).hidden=true;if(!document.querySelector('.overlay:not([hidden])'))document.body.style.overflow=''}
function onlyHttp(url){try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)}catch{return false}}
function cleanHost(v){return v.trim().replace(/\/+$/,'')}
function normalizeTitle(v){return String(v||'Sin título').trim()}
function idFor(item){return `${item.source}|${item.type}|${item.id}`}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function compatibleImage(v){return v && onlyHttp(v)?v:''}
function parseM3U(input){const lines=input.replace(/^\uFEFF/,'').split(/\r?\n/);const out=[];let metadata=null;let seq=0;
 for(const raw of lines){const s=raw.trim();if(!s)continue;
 if(s.startsWith('#EXTINF:')){const attrs={};for(const match of s.matchAll(/([\w-]+)="([^"]*)"/g))attrs[match[1]]=match[2];const name=s.includes(',')?s.slice(s.indexOf(',')+1).trim():attrs['tvg-name'];metadata={name:name||attrs['tvg-name']||'Canal',icon:attrs['tvg-logo']||'',category:attrs['group-title']||'Sin categoría',tvgId:attrs['tvg-id']||'',type:'live'};continue}
 if(s.startsWith('#'))continue;
 if(metadata && onlyHttp(s)){out.push({...metadata,id:`m3u-${seq++}`,url:s,source:'m3u'});metadata=null}
 }
 return out;
}
function demoItems(){return [{id:'demo-1',name:'Canal de demostración',url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',category:'Ejemplo',icon:'',tvgId:'',type:'live',source:'demo'}]}
function setItems(items,source,reset=true,restored=false){state.items=reset?items:[...state.items,...items];state.source=source;state.demo=source==='Demostración';$('sourceStatus').textContent=source;state.category='Todos';state.search='';$('searchInput').value='';$('banner').hidden=items.length>0;render();closeOverlay('settingsOverlay');notify(`${items.length} elementos ${restored?'restaurados':'cargados'}`)}
function filteredBase(){const sec=state.section;if(sec==='favorites')return state.items.filter(i=>state.favorites.has(idFor(i)));if(sec==='guide')return state.items.filter(i=>i.type==='live');return state.items.filter(i=>i.type===sec)}
function itemsShown(){return filteredBase().filter(i=>(state.category==='Todos'||i.category===state.category)&&(!state.search||i.name.toLocaleLowerCase().includes(state.search.toLocaleLowerCase())))}
function programme(item){const entries=state.epg.get(item.tvgId)||state.epg.get(item.name.toLocaleLowerCase())||[];const now=Date.now();return entries.find(p=>p.start<=now&&p.stop>now)||null}
function updateTabs(){document.querySelectorAll('[data-section]').forEach(b=>b.classList.toggle('active',b.dataset.section===state.section));$('pageTitle').textContent=navTitles[state.section];$('sectionTitle').textContent=state.section==='guide'?'Programación actual':state.section==='favorites'?'Tu selección':state.section==='live'?'Canales disponibles':state.section==='movies'?'Películas disponibles':'Series disponibles';}
function renderCategories(){const set=new Set(filteredBase().map(i=>i.category||'Sin categoría'));if(state.category!=='Todos'&&!set.has(state.category))state.category='Todos';const chips=$('categoryChips');chips.replaceChildren();['Todos',...Array.from(set).sort((a,b)=>a.localeCompare(b,'es'))].forEach(cat=>{const b=document.createElement('button');b.className='chip'+(cat===state.category?' selected':'');b.textContent=cat;b.addEventListener('click',()=>{state.category=cat;render()});chips.append(b)})}
function render(){updateTabs();renderCategories();const shown=itemsShown(),grid=$('contentGrid');grid.replaceChildren();$('contentCount').textContent=`${shown.length} ${shown.length===1?'elemento':'elementos'}`;$('emptyState').hidden=shown.length>0;
 const emptyTitle=$('emptyState').querySelector('h3'),emptyText=$('emptyState').querySelector('p');if(state.items.length){emptyTitle.textContent='No hay resultados';emptyText.textContent='Prueba otra categoría, búsqueda o sección.';}else{emptyTitle.textContent='Tu biblioteca empieza aquí';emptyText.textContent='Añade una fuente IPTV para mostrar canales, películas y series. También puedes explorar una demostración sin conexión.'}
 for(const item of shown){const card=document.createElement('article');card.className=`item-card ${item.type}`;const poster=document.createElement('div');poster.className='poster';const img=compatibleImage(item.icon);if(img){const el=document.createElement('img');el.src=img;el.alt='';el.loading='lazy';el.referrerPolicy='no-referrer';el.onerror=()=>{el.remove();const ph=document.createElement('span');ph.className='placeholder-logo';ph.textContent=item.type==='live'?'◉':item.type==='movies'?'▶':'▤';poster.prepend(ph)};poster.append(el)}else{const ph=document.createElement('span');ph.className='placeholder-logo';ph.textContent=item.type==='live'?'◉':item.type==='movies'?'▶':'▤';poster.append(ph)}const kind=document.createElement('span');kind.className='kind';kind.textContent=item.type==='live'?'EN DIRECTO':item.type==='movies'?'PELÍCULA':'SERIE';poster.append(kind);const info=document.createElement('div');info.className='card-info';const main=document.createElement('button');main.className='item-main';main.innerHTML=`<h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(state.section==='guide'?(programme(item)?.title||'Sin programación'):(item.category||'Sin categoría'))}</p>`;main.title=`Abrir ${item.name}`;main.addEventListener('click',()=>openItem(item));poster.style.cursor='pointer';poster.addEventListener('click',()=>openItem(item));const fav=document.createElement('button');fav.className='fav-btn'+(state.favorites.has(idFor(item))?' is-fav':'');fav.textContent=state.favorites.has(idFor(item))?'♥':'♡';fav.title='Añadir o quitar favorito';fav.setAttribute('aria-label',fav.title);fav.addEventListener('click',()=>toggleFavorite(item));info.append(main,fav);card.append(poster,info);grid.append(card)}
}
function toggleFavorite(item){const id=idFor(item);if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);persistFavorites();render()}
function chooseSection(section){state.section=section;state.category='Todos';state.search='';$('searchInput').value='';document.querySelector('.sidebar').classList.remove('open');render()}
async function requestText(url){if(!onlyHttp(url))throw Error('La dirección debe empezar por http:// o https://');const response=await fetch(url,{credentials:'omit'});if(!response.ok)throw Error(`El servidor respondió ${response.status}`);return await response.text()}
function actionableError(err){const txt=err?.message||String(err);if(location.protocol==='file:' && (txt.includes('Failed to fetch')||txt.includes('NetworkError')||txt.includes('Load failed')))return 'Chrome ha bloqueado la consulta desde un archivo local (file://). Esto depende de la política CORS del proveedor y no puede evitarse con JavaScript. Puedes probar Abrir con servidor local, sin instalar Python.';return txt.includes('Failed to fetch')||txt.includes('NetworkError')?'El navegador no pudo conectar. Puede ser un bloqueo CORS, contenido HTTP dentro de HTTPS, una dirección incorrecta o un servidor no disponible. Prueba importando un archivo M3U o usando una pasarela privada.':txt}
async function importM3UUrl(){const url=$('m3uUrl').value.trim();message('Cargando lista…');try{const data=await requestText(url);const items=parseM3U(data);if(!items.length)throw Error('No se encontraron canales válidos. Comprueba el formato M3U.');setItems(items,'M3U desde URL');await rememberLibrary('m3u',`M3U: ${url}`,items,{url})}catch(err){message(actionableError(err),true)}}
async function importM3UText(text,source){const items=parseM3U(text);if(!items.length){message('No se encontraron canales válidos en el texto M3U.',true);return}setItems(items,source);await rememberLibrary('m3u',source,items)}
async function xtreamAPI(action,params={}){const cfg=state.xtream;if(!cfg)throw Error('Primero conecta tu cuenta Xtream');const u=new URL(cfg.host+'/player_api.php');u.searchParams.set('username',cfg.username);u.searchParams.set('password',cfg.password);if(action)u.searchParams.set('action',action);Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,String(v)));const raw=await requestText(u.toString());let data;try{data=JSON.parse(raw)}catch{throw Error('El servidor no devolvió JSON válido.')}return data}
function buildXtreamMedia(kind,id,extension){const {host,username,password}=state.xtream;const user=encodeURIComponent(username),pass=encodeURIComponent(password),streamId=encodeURIComponent(id);if(kind==='live'&&extension==='direct')return `${host}/${user}/${pass}/${streamId}`;const path=kind==='live'?'live':kind==='movies'?'movie':'series';const ext=extension|| (kind==='live'?'m3u8':'mp4');return `${host}/${path}/${user}/${pass}/${streamId}.${encodeURIComponent(ext)}`}
async function importXtream(){const host=cleanHost($('xtreamHost').value),username=$('xtreamUser').value.trim(),password=$('xtreamPass').value;if(!onlyHttp(host)||!username||!password){message('Introduce servidor, usuario y contraseña válidos.',true);return}state.liveFormat=$('xtreamLiveFormat').value;state.xtream={host,username,password};message('Conectando y descargando catálogo…');try{const auth=await xtreamAPI();if(auth.user_info?.auth===0)throw Error('El servidor rechazó el usuario o contraseña.');const actions=['get_live_categories','get_vod_categories','get_series_categories','get_live_streams','get_vod_streams','get_series'];const res=await Promise.allSettled(actions.map(a=>xtreamAPI(a)));const data=Object.fromEntries(actions.map((a,i)=>[a,res[i].status==='fulfilled'&&Array.isArray(res[i].value)?res[i].value:[]]));const names={};for(const [key,kind] of [['get_live_categories','live'],['get_vod_categories','movies'],['get_series_categories','series']]){names[kind]=new Map(data[key].map(x=>[String(x.category_id),x.category_name||'Sin categoría']))}
const items=[];for(const s of data.get_live_streams){if(s.stream_id==null)continue;items.push({id:String(s.stream_id),name:normalizeTitle(s.name),icon:s.stream_icon||'',category:names.live.get(String(s.category_id))||'Sin categoría',tvgId:s.epg_channel_id||'',type:'live',source:'xtream',url:buildXtreamMedia('live',s.stream_id,state.liveFormat)})}
for(const s of data.get_vod_streams){if(s.stream_id==null)continue;items.push({id:String(s.stream_id),name:normalizeTitle(s.name),icon:s.stream_icon||'',category:names.movies.get(String(s.category_id))||'Sin categoría',type:'movies',source:'xtream',url:buildXtreamMedia('movies',s.stream_id,s.container_extension||'mp4')})}
for(const s of data.get_series){if(s.series_id==null)continue;items.push({id:String(s.series_id),name:normalizeTitle(s.name),icon:s.cover||'',category:names.series.get(String(s.category_id))||'Sin categoría',type:'series',source:'xtream'})}
if(!items.length)throw Error('Conectado, pero el proveedor no devolvió contenidos. Puede bloquear las consultas desde el navegador.');setItems(items,'Xtream Codes');try{saveSavedServer(true)}catch(e){console.warn('No se ha podido guardar el servidor:',e)}await rememberLibrary('xtream',`Xtream: ${$('xtreamName').value.trim()||host}`,items,{serverName:$('xtreamName').value.trim()||host});}catch(err){state.xtream=null;message(actionableError(err),true)}}
function parseXmlTv(xml,restored=false){const doc=new DOMParser().parseFromString(xml,'text/xml');if(doc.querySelector('parsererror'))throw Error('El archivo XMLTV no contiene XML válido.');const channelNames=new Map();for(const ch of doc.querySelectorAll('channel')){const name=ch.querySelector('display-name')?.textContent?.trim();if(name)channelNames.set(ch.getAttribute('id'),name.toLocaleLowerCase())}
const epg=new Map();for(const p of doc.querySelectorAll('programme')){const channel=p.getAttribute('channel')||'',title=p.querySelector('title')?.textContent?.trim()||'Programa sin título',start=parseXmlDate(p.getAttribute('start')),stop=parseXmlDate(p.getAttribute('stop'));if(!start||!stop)continue;const entry={title,start,stop};for(const key of [channel,channelNames.get(channel)].filter(Boolean)){if(!epg.has(key))epg.set(key,[]);epg.get(key).push(entry)}}for(const values of epg.values())values.sort((a,b)=>a.start-b.start);state.epg=epg;render();closeOverlay('settingsOverlay');notify(`Guía EPG cargada (${epg.size} identificadores)`);if(!restored)saveEpg(xml)}
function parseXmlDate(s){if(!s)return 0;const m=s.match(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)?\s*([+-]\d{4})?/);if(!m)return 0;const [_,y,mo,d,h,min,sec='00',tz='+0000']=m;const mins=Number(tz.slice(1,3))*60+Number(tz.slice(3,5));const sign=tz[0]==='-'?-1:1;return Date.UTC(+y,+mo-1,+d,+h,+min,+sec)-sign*mins*60000}
async function loadEpgURL(){message('Cargando guía…');try{const xml=await requestText($('epgUrl').value.trim());parseXmlTv(xml)}catch(err){message(actionableError(err),true)}}
function openItem(item){if(item.source==='xtream'&&!state.xtream){notify('Selecciona y conecta tu servidor Xtream antes de reproducir.');selectSourceTab('xtream');openOverlay('settingsOverlay');return}if(item.type==='series'){openSeries(item);return}playItem(item)}
// Reproducción HLS en Chrome con hls.js. Las solicitudes de manifest y segmentos
// necesitan CORS del proveedor; abrir la URL directamente en VLC no lo garantiza.
function resetPlayer(){
 state.attempt++;
 if(state.hls){state.hls.destroy();state.hls=null}
 if(state.tsPlayer){const ts=state.tsPlayer;state.tsPlayer=null;try{ts.pause()}catch(e){}try{ts.unload()}catch(e){}try{ts.detachMediaElement()}catch(e){}try{ts.destroy()}catch(e){}}
 const v=$('videoPlayer');v.pause();v.removeAttribute('src');v.load();
 $('videoError').hidden=true;$('playbackStatus').textContent='Preparando reproducción…';
 $('retryHls').hidden=true;$('retryTs').hidden=true;$('retryDirect').hidden=true;$('retryMpegts').hidden=true;$('openVlc').hidden=true;
 $('hlsInfo').textContent='';$('hlsInfo').hidden=true;
}
function showVideoError(text){
 $('videoError').hidden=false;$('videoError').textContent=text;$('playbackStatus').textContent='No se ha podido reproducir';
 if(state.playing?.source==='xtream'&&state.playing.type==='live'){
  $('retryHls').hidden=false;$('retryTs').hidden=false;$('retryDirect').hidden=false;$('retryMpegts').hidden=false;$('openVlc').hidden=false;
 }
}
function playbackIssue(detail){
 const u=state.playing?.url||'';let reason=detail||'Error de reproducción';
 if(location.protocol==='https:'&&u.startsWith('http:'))reason+=' · Página HTTPS con vídeo HTTP: contenido mixto bloqueado.';
 else if(location.protocol==='file:')reason+=' · Estás abriendo index.html directamente. El proveedor debe permitir CORS con origen null para HLS.js.';
 reason+=' · VLC puede reproducir el enlace aunque Chrome lo bloquee por CORS, segmentos inaccesibles, autorización o códec.';
 showVideoError(reason);
}
function hlsStatus(text){$('hlsInfo').hidden=false;$('hlsInfo').textContent=text}
function safeHlsError(data){
 // No mostrar URL ni los tokens de acceso en mensajes visibles.
 const kind=String(data?.details||data?.type||'desconocido');
 const code=data?.response?.code;
 let message='HLS: '+kind+(Number.isInteger(code)?' (HTTP '+code+')':'');
 if(/manifestLoadError|levelLoadError|fragLoadError|keyLoadError/.test(kind)){
  message+=' · No se pudo descargar la lista HLS o sus segmentos. Comprueba CORS, conexión y autorización.';
 }else if(/manifestParsingError/.test(kind)){
  message+=' · La respuesta no parece una lista HLS válida.';
 }else if(/buffer|mux|codec|media/.test(kind.toLowerCase())){
  message+=' · El navegador no ha podido procesar el vídeo o su códec.';
 }
 return message;
}
// Motor probado para transmisiones MPEG-TS en directo (sin recodificar).
function playMpegTs(url,attempt){
 const v=$('videoPlayer');
 if(!window.mpegts||!window.mpegts.isSupported()){
  playbackIssue('El navegador no admite MPEG-TS.js o no se ha descargado su biblioteca.');return;
 }
 try{
  // Perfil ESTABLE del test funcional: 1 MB de búfer, sin perseguir la latencia.
  const cfg={enableWorker:false,enableStashBuffer:true,stashInitialSize:1024*1024,
   autoCleanupSourceBuffer:true,autoCleanupMaxBackwardDuration:90,
   autoCleanupMinBackwardDuration:45,lazyLoad:false,
   liveBufferLatencyChasing:false,liveSync:false};
  const player=window.mpegts.createPlayer({type:'mpegts',isLive:true,url,cors:true,withCredentials:false},cfg);
  state.tsPlayer=player;
  hlsStatus('MPEG-TS · modo estable: búfer 1 MB, baja prioridad a la latencia. Conectando…');
  player.on(window.mpegts.Events.MEDIA_INFO,info=>{
   if(attempt!==state.attempt)return;
   const width=info?.width||'?';const height=info?.height||'?';
   hlsStatus(`MPEG-TS · ${width}×${height} · vídeo ${info?.videoCodec||'?'} · audio ${info?.audioCodec||'?'} · modo estable`);
  });
  player.on(window.mpegts.Events.ERROR,(type,detail,info)=>{
   if(attempt!==state.attempt)return;
   // No imprimir objetos que puedan contener URLs con credenciales.
   const safeType=String(type||'error').slice(0,80);
   const safeDetail=String(detail||'sin detalle').slice(0,80);
   playbackIssue('MPEG-TS: '+safeType+' / '+safeDetail+' · Revisar conexión, CORS y formato de origen.');
  });
  player.attachMediaElement(v);
  player.load();
  v.muted=false;
  const promise=player.play();
  if(promise?.catch)promise.catch(error=>{
   if(attempt!==state.attempt)return;
   if(error?.name==='NotAllowedError')hlsStatus('Pulsa ▶ en el vídeo para iniciar la reproducción.');
   else playbackIssue('MPEG-TS no pudo iniciar reproducción: '+(error?.name||'error'));
  });
 }catch(err){if(attempt===state.attempt)playbackIssue('Fallo inicializando MPEG-TS: '+(err?.name||'error'))}
}
function playItem(item){
 resetPlayer();state.playing=item;$('playerTitle').textContent=item.name;
 $('playerSub').textContent=item.category||'Reproducción';
 $('playerFavorite').textContent=state.favorites.has(idFor(item))?'♥ Quitar de favoritos':'♡ Añadir a favoritos';
 openOverlay('playerOverlay');$('openVlc').hidden=item.type!=='live';
 const v=$('videoPlayer');const url=item.url;const attempt=state.attempt;
 if(!onlyHttp(url)){showVideoError('La dirección de reproducción no es válida.');return}
 if(location.protocol==='https:'&&url.startsWith('http:')){
  playbackIssue('Chrome no permite cargar esta transmisión HTTP desde una web HTTPS');return;
 }
 const isHls=/\.m3u8(?:[?#]|$)/i.test(url);
 const isMpegTsLive=item.type==='live' && (!isHls||item.forceTs===true);
 try{
  if(isMpegTsLive){playMpegTs(url,attempt);return;}
  if(isHls){
   const nativeHls=!!(v.canPlayType('application/vnd.apple.mpegurl')||v.canPlayType('application/x-mpegURL'));
   if(nativeHls){
    hlsStatus('HLS nativo del navegador');v.src=url;
    v.play().catch(e=>{if(attempt===state.attempt)playbackIssue('El navegador no pudo iniciar HLS: '+e.message)});
    return;
   }
   if(!window.Hls){
    playbackIssue('No se cargó HLS.js. Comprueba que hay Internet y que Chrome no bloquea cdn.jsdelivr.net.');return;
   }
   if(!window.Hls.isSupported()){
    playbackIssue('HLS.js no está soportado en esta versión de Chrome.');return;
   }
   const h=new window.Hls({enableWorker:true,lowLatencyMode:false,backBufferLength:60,
    manifestLoadingTimeOut:12000,fragLoadingTimeOut:15000,levelLoadingTimeOut:12000});
   state.hls=h;let recovered=false,manifestReady=false,bufferReady=false,started=false,phase='conectando';
   const tryStart=()=>{
    if(attempt!==state.attempt||started||!bufferReady)return;
    started=true;phase='iniciando';
    v.play().catch(e=>{
     if(attempt!==state.attempt||!v.paused)return;
     // NotAllowedError: se necesita gesto de usuario. No es un fallo del stream.
     if(e.name==='NotAllowedError'){
      hlsStatus('Chrome requiere pulsar ▶ en el reproductor para iniciar el canal.');return;
     }
     playbackIssue('Chrome rechazó el vídeo después de recibir segmentos HLS: '+e.message);
    });
   };
   h.on(window.Hls.Events.MEDIA_ATTACHED,()=>{
    if(attempt===state.attempt){phase='manifest';hlsStatus('HLS.js conectado · solicitando lista de reproducción…');h.loadSource(url)}
   });
   h.on(window.Hls.Events.MANIFEST_PARSED,(_ev,data)=>{
    if(attempt!==state.attempt)return;
    manifestReady=true;phase='segmentos';
    hlsStatus('Lista HLS recibida · '+(data?.levels?.length||'?')+' calidad(es) · esperando primer segmento…');
    // No ejecutar play() todavía: primero deben cargarse y añadirse los segmentos.
   });
   h.on(window.Hls.Events.FRAG_LOADED,()=>{
    if(attempt===state.attempt&&v.readyState<3)hlsStatus('Segmento HLS descargado · esperando decodificación…');
   });
   h.on(window.Hls.Events.FRAG_BUFFERED,()=>{
    if(attempt!==state.attempt)return;
    phase='buffer';bufferReady=true;
    hlsStatus('Segmento añadido al reproductor · iniciando vídeo…');tryStart();
   });
   h.on(window.Hls.Events.ERROR,(_ev,data)=>{
    if(attempt!==state.attempt)return;
    const msg=safeHlsError(data);
    hlsStatus(msg);
    if(!data.fatal)return;
    if(data.type===window.Hls.ErrorTypes.MEDIA_ERROR&&!recovered){
     recovered=true;h.recoverMediaError();hlsStatus('Error de decodificación: reintentando una vez…');return;
    }
    playbackIssue(msg+(manifestReady?' · Lista HLS recibida.':' · Error antes de recibir la lista HLS.'));
   });
   // Evitar que un error genérico del elemento <video> oculte uno de HLS.js.
   v.addEventListener('error',()=>{
    if(attempt!==state.attempt||state.hls!==h)return;
    const code=v.error?.code||'?';
    hlsStatus('Error de vídeo código '+code+' · fase '+phase+'. '+(bufferReady?'Se recibieron segmentos; posible códec incompatible.':'No se ha recibido un segmento reproducible; comprobar CORS, lista y códecs.'));
   },{once:true});
   h.attachMedia(v);return;
  }
  if(/\.ts(?:[?#]|$)/i.test(url)&&!v.canPlayType('video/mp2t')){
   playbackIssue('Chrome no reproduce MPEG-TS directamente. Prueba la opción HLS (.m3u8).');return;
  }
  if(item.type==='live')hlsStatus('Esta URL no termina en .m3u8: reproducción directa HTML5, sin HLS.js.');
  v.src=url;
  v.play().catch(e=>{if(attempt===state.attempt)playbackIssue('No se inició el vídeo: '+e.message)});
 }catch(err){if(attempt===state.attempt)playbackIssue(actionableError(err))}
}
function retryStream(extension){
 const item=state.playing;
 if(!item||item.source!=='xtream'||item.type!=='live'||!state.xtream)return;
 playItem({...item,url:buildXtreamMedia('live',item.id,extension)});
}
async function openSeries(item){$('detailTitle').textContent=item.name;$('episodeList').replaceChildren();$('episodeNotice').textContent='Cargando temporadas y episodios…';openOverlay('detailOverlay');try{const data=await xtreamAPI('get_series_info',{series_id:item.id});const eps=data.episodes||{};let count=0;for(const season of Object.keys(eps).sort((a,b)=>Number(a)-Number(b))){const group=document.createElement('section');group.className='episode-group';const h=document.createElement('h3');h.textContent=`Temporada ${season}`;group.append(h);for(const ep of eps[season]||[]){const id=ep.id??ep.stream_id;if(id==null)continue;const title=ep.title||`Episodio ${ep.episode_num||''}`;const b=document.createElement('button');b.className='episode-btn';b.textContent=`▶ ${title}`;b.addEventListener('click',()=>{closeOverlay('detailOverlay');playItem({id:`${item.id}-${id}`,name:`${item.name} · ${title}`,type:'episode',source:'xtream',category:item.category,url:buildXtreamMedia('series',id,ep.container_extension||'mp4')})});group.append(b);count++} $('episodeList').append(group)}$('episodeNotice').textContent=count?`${count} episodios disponibles`:'El proveedor no devolvió episodios.'}catch(err){$('episodeNotice').textContent=actionableError(err)}}
function closePlayer(){resetPlayer();state.playing=null;closeOverlay('playerOverlay')}
function selectSourceTab(tab){document.querySelectorAll('[data-source-tab]').forEach(b=>b.classList.toggle('selected',b.dataset.sourceTab===tab));for(const key of ['m3u','xtream','epg'])$(`${key}Panel`).hidden=key!==tab;message('')}
function setup(){document.querySelectorAll('[data-section]').forEach(b=>b.addEventListener('click',()=>chooseSection(b.dataset.section)));$('settingsBtn').addEventListener('click',()=>openOverlay('settingsOverlay'));$('openSettingsTop').addEventListener('click',()=>openOverlay('settingsOverlay'));$('heroConnect').addEventListener('click',()=>openOverlay('settingsOverlay'));$('emptyConnect').addEventListener('click',()=>openOverlay('settingsOverlay'));$('demoBtn').addEventListener('click',()=>setItems(demoItems(),'Demostración'));$('menuBtn').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));$('searchInput').addEventListener('input',e=>{state.search=e.target.value;render()});document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeOverlay(b.dataset.close)));document.querySelectorAll('[data-source-tab]').forEach(b=>b.addEventListener('click',()=>selectSourceTab(b.dataset.sourceTab)));$('savedLibraries').addEventListener('change',e=>showLibrary(e.target.value));$('deleteLibrary').addEventListener('click',removeLibrary);$('loadM3uUrl').addEventListener('click',importM3UUrl);$('loadM3uText').addEventListener('click',()=>importM3UText($('m3uText').value,'Texto M3U'));$('m3uFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{await importM3UText(await file.text(),`Archivo: ${file.name}`)}catch(err){message(actionableError(err),true)}});updateSavedServers();$('savedXtream').addEventListener('change',e=>{if(e.target.value)loadSavedServer(e.target.value);else{$('xtreamName').value='';$('xtreamHost').value='';$('xtreamUser').value='';$('xtreamPass').value='';$('xtreamRememberPass').checked=false}});$('saveXtream').addEventListener('click',()=>saveSavedServer());$('deleteXtream').addEventListener('click',deleteSavedServer);$('exportXtream').addEventListener('click',exportSavedServers);$('importXtream').addEventListener('click',()=>$('importXtreamFile').click());$('importXtreamFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(file)await importSavedServers(file);e.target.value='' });$('loadXtream').addEventListener('click',importXtream);$('loadEpgUrl').addEventListener('click',loadEpgURL);$('epgFile').addEventListener('change',async e=>{const f=e.target.files?.[0];if(f)try{parseXmlTv(await f.text())}catch(err){message(actionableError(err),true)}});$('closePlayer').addEventListener('click',closePlayer);$('retryHls').addEventListener('click',()=>retryStream('m3u8'));$('retryTs').addEventListener('click',()=>retryStream('ts'));$('retryDirect').addEventListener('click',()=>retryStream('direct'));$('retryMpegts').addEventListener('click',()=>{if(state.playing)playItem({...state.playing,forceTs:true})});$('openVlc').addEventListener('click',downloadM3UForVlc);$('videoPlayer').addEventListener('playing',()=>{$('playbackStatus').textContent='Reproduciendo';$('videoError').hidden=true});$('videoPlayer').addEventListener('waiting',()=>{$('playbackStatus').textContent='Cargando datos de vídeo…'});$('playerFavorite').addEventListener('click',()=>{if(state.playing){toggleFavorite(state.playing);$('playerFavorite').textContent=state.favorites.has(idFor(state.playing))?'♥ Quitar de favoritos':'♡ Añadir a favoritos'}});$('videoPlayer').addEventListener('error',()=>{if(state.playing&&!state.hls&&!state.tsPlayer)playbackIssue('El elemento de vídeo ha informado de un error (código '+($('videoPlayer').error?.code||'?')+')')});$('resetData').addEventListener('click',()=>{if(!confirm('¿Limpiar la biblioteca actual, guía y favoritos? Las bibliotecas guardadas seguirán disponibles hasta que las elimines.'))return;state.items=[];state.epg.clear();state.xtream=null;activeLibraryKey='';safeStorageSet(LAST_LIBRARY,'');dbDelete('meta','epg').catch(()=>{});state.favorites.clear();persistFavorites();state.source='';$('sourceStatus').textContent='Sin fuente conectada';$('banner').hidden=false;render();closeOverlay('settingsOverlay');notify('Datos borrados')});document.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='Backspace'&&!(e.target instanceof HTMLInputElement)&&!(e.target instanceof HTMLTextAreaElement)){const open=['playerOverlay','detailOverlay','settingsOverlay'].find(id=>!$(id).hidden);if(open){e.preventDefault();open==='playerOverlay'?closePlayer():closeOverlay(open)}else document.querySelector('.sidebar').classList.remove('open')}if(['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key)&&!['INPUT','TEXTAREA','VIDEO'].includes(document.activeElement?.tagName||'')){const focusable=[...document.querySelectorAll('button:not([disabled])')].filter(b=>b.getClientRects().length>0);const i=focusable.indexOf(document.activeElement);if(i>=0){e.preventDefault();focusable[(i+(e.key==='ArrowDown'||e.key==='ArrowRight'?1:-1)+focusable.length)%focusable.length]?.focus()}}});render();restoreStartup().catch(e=>notify('No se pudo recuperar la biblioteca: '+e.message));if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./service-worker.js').catch(()=>{});}
setup();
})();
