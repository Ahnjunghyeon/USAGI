"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadMock() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const applyFiles = (fileList: FileList | File[]) => {
    const images = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    setFiles(images);
    setError(images.length ? "" : "이미지 파일을 1장 이상 선택해주세요.");
  };

  const startAnalysis = () => {
    if (files.length === 0) {
      setError("분석을 시작하려면 대화 캡처를 1장 이상 올려주세요.");
      inputRef.current?.focus();
      return;
    }
    sessionStorage.setItem("urisai-upload-count", String(files.length));
    router.push("/analyze/processing");
  };

  return <>
    <label
      className={`upload-box ${isDragging ? "dragging" : ""}`}
      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); if (e.currentTarget === e.target) setIsDragging(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        applyFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => applyFiles(e.target.files ?? [])}
      />
      <div className="upload-icon">📸</div>
      <strong style={{fontSize:20}}>{isDragging ? "여기에 놓아주세요" : "캡처를 올려주세요"}</strong>
      <span style={{color:"#7d858e", marginTop:8, lineHeight:1.5}}>
        클릭해서 선택하거나 사진을 이 영역에 드래그해 넣을 수 있습니다.<br/>
        카카오톡 · 인스타 DM · 문자 등 여러 장을 한 번에 선택할 수 있습니다.
      </span>
      {files.length > 0 && <span className="chip" style={{marginTop:16}}>{files.length}장 선택됨</span>}
    </label>

    {error && <div className="upload-error" role="alert">{error}</div>}

    <div className="form-card">
      <strong>분석 전에 확인해주세요</strong>
      <p style={{color:"#727983",lineHeight:1.6,marginBottom:0}}>
        이름, 프로필 사진, 전화번호는 분석 대상에 포함하지 않습니다. 실제 AI 연동 단계에서는 익명화 → 분석 → 원본 삭제 순서로 처리할 예정입니다.
      </p>
    </div>

    <div className="bottom-actions">
      <button className="primary" disabled={files.length === 0} onClick={startAnalysis}>분석 시작하기</button>
      {files.length === 0 && <div className="action-help">대화 캡처를 1장 이상 올리면 분석을 시작할 수 있습니다.</div>}
    </div>
  </>;
}
