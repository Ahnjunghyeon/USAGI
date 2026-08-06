"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseChatText } from "@/lib/chat-text";
import { inputDraftStorage } from "@/lib/client/storage";
import { AppButton } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
export default function ConversationInput(){
 const router=useRouter(); const {t}=useLocale(); const [method,setMethod]=useState<"text"|"image">("text"); const [rawText,setRawText]=useState(""); const parsed=useMemo(()=>rawText.trim()?parseChatText(rawText):null,[rawText]);
 const proceedText=()=>{if(!parsed)return;inputDraftStorage.write({method:"text",rawText,participants:parsed.participants,detectedMode:parsed.detectedMode});router.push("/analyze/context")};
 const proceedImage=()=>{inputDraftStorage.write({method:"image",rawText:"",participants:[],detectedMode:"unknown"});router.push("/analyze/context")};
 return <div className="conversation-input"><div className="inline-ai-notice"><strong>AI</strong><span>{t("inlineAiNotice")}</span></div><div className="guide-bunny" aria-hidden="true"><img src="/usagi-focus.png" alt="" width={88} height={88}/></div><div className="guide-copy"><strong>{t("guideInput")}</strong><span>{t("guideInputSub")}</span></div><div className="input-method-tabs" role="tablist" aria-label={t("inputAria")}><button type="button" className={method==="text"?"selected":""} onClick={()=>setMethod("text")}>{t("textTab")}</button><button type="button" className={method==="image"?"selected":""} onClick={()=>setMethod("image")}>{t("imageTab")}</button></div>{method==="text"?<><textarea className="conversation-textarea" value={rawText} onChange={e=>setRawText(e.target.value)} placeholder={`[Kim] [10:23 AM] 오늘 뭐해?\n[Park] [10:24 AM] 그냥 집에 있어ㅋㅋ`} spellCheck={false}/><div className={`parse-feedback ${parsed?"ok":""}`}>{rawText.trim()&&parsed?<>✓ <strong>{parsed.participants.length}</strong> · {parsed.messages.length}</>:rawText.trim()?t("parseFail"):t("parseHint")}</div><AppButton onClick={proceedText} disabled={!parsed}>{t("analyzeChat")}</AppButton></>:<><div className="image-method-callout"><strong>{t("imageMethodTitle")}</strong><span>{t("imageMethodDesc")}</span></div><AppButton onClick={proceedImage}>{t("imageContinue")}</AppButton></>}</div>
}
