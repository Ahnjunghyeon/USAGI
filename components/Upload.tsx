"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandFeature from "@/components/BrandFeature";

const MAX_FILES = 10, MAX_WIDTH = 1100, MAX_PAYLOAD_CHARS = 3_600_000;
async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지를 처리할 수 없습니다.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", .7);
}

export default function Upload() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [preparing, setPreparing] = useState(false);
  useEffect(() => { sessionStorage.removeItem("usagi-analysis-result"); }, []);

  const applyFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"));
    const images = [...files, ...incoming].slice(0, MAX_FILES);
    setFiles(images);
    setError(images.length ? "" : "이미지 파일을 1장 이상 선택해주세요.");
  };
  const move = (index: number, direction: -1 | 1) => {
    setFiles((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const start = async () => {
    if (!files.length || preparing) return;
    setPreparing(true); setError("");
    try {
      const images = await Promise.all(files.map(compressImage));
      const payloadChars = JSON.stringify(images).length;
      if (payloadChars > MAX_PAYLOAD_CHARS) throw new Error("캡처 용량이 너무 큽니다. 이미지 수를 줄이거나 더 작은 캡처로 다시 시도해 주세요.");
      sessionStorage.setItem("usagi-upload-images", JSON.stringify(images));
      router.push("/analyze/processing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "이미지 준비 중 오류가 발생했습니다.");
      setPreparing(false);
    }
  };

  return <>
    <label className={`upload-box ${isDragging ? "dragging" : ""}`} onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={(e) => { e.preventDefault(); if (e.currentTarget === e.target) setIsDragging(false); }} onDrop={(e) => { e.preventDefault(); setIsDragging(false); applyFiles(e.dataTransfer.files); }}>
      <input type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) applyFiles(e.target.files); e.currentTarget.value = ""; }}/>
      <div className="upload-icon"><BrandFeature variant="stealth" size={56}/></div>
      <strong style={{fontSize:20}}>{isDragging ? "여기에 놓아주세요" : "대화 캡처를 올려주세요"}</strong>
      <span style={{color:"#7d858e",marginTop:8,lineHeight:1.5}}>클릭해서 선택하거나 사진을 이 영역으로 드래그할 수 있습니다.<br/>최대 {MAX_FILES}장까지 분석합니다.</span>
      {files.length > 0 && <span className="chip" style={{marginTop:16}}>{files.length}장 선택됨</span>}
    </label>
    {files.length > 0 && <div className="file-list">
      <div className="action-help" style={{marginBottom:8}}>대화가 보이는 시간 순서대로 정렬해 주세요. 위에서부터 1번 캡처입니다.</div>
      {files.map((file, i) => <div className="file-item" key={`${file.name}-${file.lastModified}-${i}`}>
        <span>{i+1}</span><strong>{file.name}</strong>
        <div style={{display:"flex",gap:6}}>
          <button type="button" disabled={i===0} aria-label="위로 이동" onClick={(e)=>{e.preventDefault();move(i,-1)}}>↑</button>
          <button type="button" disabled={i===files.length-1} aria-label="아래로 이동" onClick={(e)=>{e.preventDefault();move(i,1)}}>↓</button>
          <button type="button" onClick={(e)=>{e.preventDefault();setFiles((prev)=>prev.filter((_,idx)=>idx!==i))}}>삭제</button>
        </div>
      </div>)}
    </div>}
    {error && <div className="upload-error" role="alert">{error}</div>}
    <div className="form-card"><strong>개인정보 안내</strong><p style={{color:"#727983",lineHeight:1.6,marginBottom:0}}>캡처는 분석 요청을 처리하기 위해 외부 AI API로 전송됩니다. 우사기 서버의 데이터베이스나 파일 저장소에 원본 캡처를 영구 저장하는 기능은 포함하지 않았습니다.</p></div>
    <div className="bottom-actions"><button className="primary" disabled={!files.length||preparing} onClick={start}>{preparing?"사진 준비 중...":"분석 시작하기"}</button>{!files.length&&<div className="action-help">대화 캡처를 1장 이상 올려주세요.</div>}</div>
  </>;
}
