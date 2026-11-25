import React,{useSyncExternalStore,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {getState,subscribe,action,submit,change,update} from './store.js';
import {shell} from './view.js';
import './tailwind.css';
import './styles.css';

function Studio(){
  const state=useSyncExternalStore(subscribe,getState,getState);
  useEffect(()=>{const escape=e=>{if(e.key==='Escape')update({modal:null,menu:false})};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape)},[]);
  return <><div className="min-h-screen" onClick={e=>{const el=e.target.closest('[data-action]');if(el)action(el)}} onSubmit={e=>{e.preventDefault();submit(e.target)}} onChange={e=>change(e.target)} dangerouslySetInnerHTML={{__html:shell({...state,toast:''})}}/>{state.toast&&<div className="toast" role="status">✓ {state.toast}</div>}</>;
}
createRoot(document.getElementById('root')).render(<Studio/>);
