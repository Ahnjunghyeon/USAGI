"use client";
import { useEffect, type ReactNode } from "react";

type Props={open:boolean;title:string;description?:string;closeLabel?:string;onClose:()=>void;children:ReactNode};
export default function BottomSheet({open,title,description,closeLabel="Close",onClose,children}:Props){
  useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};document.addEventListener("keydown",onKey);const prev=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow=prev}},[open,onClose]);
  if(!open)return null;
  return <div className="uds-sheet-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="uds-sheet" role="dialog" aria-modal="true" aria-labelledby="uds-sheet-title"><div className="uds-sheet-handle"/><header><div><h2 id="uds-sheet-title">{title}</h2>{description&&<p>{description}</p>}</div><button type="button" className="uds-sheet-close" onClick={onClose} aria-label={closeLabel}>×</button></header><div className="uds-sheet-body">{children}</div></section></div>
}
