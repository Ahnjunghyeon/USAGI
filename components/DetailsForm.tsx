"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PersonProfileFields from "@/components/forms/PersonProfileFields";
import MbtiSelect from "@/components/forms/MbtiSelect";
import { AppButton } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/FormControls";
import { AGE_RANGES, GENDERS, type UrIsaiContext } from "@/lib/context";
import type { MbtiValue } from "@/lib/mbti";
import { AI_FRIEND_PRESETS, getAiFriendPreset, type AiFriendPresetId } from "@/lib/friend-presets";
import { contextStorage, inputDraftStorage } from "@/lib/client/storage";
import { setupDraftStorage } from "@/lib/client/setup-storage";
import { useLocale } from "@/components/LocaleProvider";
const presetI18n: Record<string, Record<string, { label: string; note: string }>> = {
  en: { custom:{label:"Custom",note:"Set your own tone and personality"}, "mossol-uncle":{label:"Forever-single uncle",note:"Direct and analytical"}, "dating-aunt":{label:"Dating-veteran aunt",note:"Empathetic and open to possibilities"}, "fox-female-friend":{label:"Sharp female friend",note:"Quick-witted and realistic"}, "many-female-friends":{label:"Guy friend with many female friends",note:"Practical but empathetic"} },
  ja: { custom:{label:"カスタム",note:"性格と話し方を自分で設定"}, "mossol-uncle":{label:"恋愛初心者おじさん",note:"少し直球で論理的"}, "dating-aunt":{label:"恋愛経験豊富なお姉さん",note:"共感が早く可能性を広く見る"}, "fox-female-friend":{label:"察しのいい女友だち",note:"目ざとく現実的"}, "many-female-friends":{label:"女友だちが多い男友だち",note:"現実的だけど共感もする"} },
  zh: { custom:{label:"自定义",note:"自己设置性格和说话方式"}, "mossol-uncle":{label:"母胎单身叔叔",note:"比较直接、偏逻辑"}, "dating-aunt":{label:"恋爱经验丰富的姐姐",note:"共情快，也会看多种可能"}, "fox-female-friend":{label:"很会察言观色的女闺蜜",note:"眼光快、很现实"}, "many-female-friends":{label:"女性朋友很多的男闺蜜",note:"现实但也比较会共情"} }
};


export default function DetailsForm() {
  const router = useRouter();
  const {t,value,locale}=useLocale();
  const [input, setInput] = useState<ReturnType<typeof inputDraftStorage.read>>(null);
  const [setup, setSetup] = useState<ReturnType<typeof setupDraftStorage.read>>(null);
  const [loaded, setLoaded] = useState(false);

  const [meSpeaker, setMeSpeaker] = useState("");
  const [meAge, setMeAge] = useState("20대 중반");
  const [meGender, setMeGender] = useState("남성");
  const [meMbti, setMeMbti] = useState<MbtiValue>("모름");
  const [otherAge, setOtherAge] = useState("20대 중반");
  const [otherGender, setOtherGender] = useState("선택 안 함");
  const [otherMbti, setOtherMbti] = useState<MbtiValue>("모름");
  const [friendPresetId, setFriendPresetId] = useState<AiFriendPresetId>("custom");
  const [friendName, setFriendName] = useState("우사기 친구");
  const [friendAge, setFriendAge] = useState("20대 중반");
  const [friendGender, setFriendGender] = useState("선택 안 함");
  const [friendMbti, setFriendMbti] = useState<MbtiValue>("ENTP");
  const [friendPersona, setFriendPersona] = useState(getAiFriendPreset("custom").persona);
  const [showPeopleInfo, setShowPeopleInfo] = useState(false);

  useEffect(() => {
    const nextInput = inputDraftStorage.read();
    const nextSetup = setupDraftStorage.read();
    setInput(nextInput); setSetup(nextSetup); setMeSpeaker(nextInput?.meSpeaker ?? ""); setLoaded(true);
  }, []);

  if (!loaded) return <div className="notice">...</div>;
  if (!setup) return <div className="notice">{t("back")}</div>;

  const selectFriendPreset = (id: AiFriendPresetId) => {
    setFriendPresetId(id);
    const preset = getAiFriendPreset(id);
    setFriendPersona(preset.persona);
    if (id === "custom") return;
    setFriendName(presetI18n[locale]?.[id]?.label ?? preset.name); setFriendAge(preset.ageRange); setFriendGender(preset.gender); setFriendMbti(preset.mbti);
  };

  const next = () => {
    if (input?.method === "text" && input.participants.length > 1 && !meSpeaker) return;
    if (input?.method === "text") inputDraftStorage.write({ ...input, meSpeaker });

    const context: UrIsaiContext = {
      ...setup,
      me: { ageRange: meAge, gender: meGender, mbti: meMbti },
      other: { ageRange: otherAge, gender: otherGender, mbti: otherMbti },
      aiFriend: { name: friendName.trim() || t("friendDefault"), ageRange: friendAge, gender: friendGender, mbti: friendMbti, presetId: friendPresetId, persona: friendPersona },
    };
    contextStorage.write(context);
    router.push(input?.method === "text" ? "/analyze/processing" : "/analyze/upload");
  };

  return <>
    <div className="guide-inline"><div><strong>{t("detailsGuide")}</strong><br/><small>{t("detailsGuideSub")}</small></div></div>

    {input?.method === "text" && input.participants.length > 1 && <section className="form-card stack">
      <SelectField label={t("meWho")} value={meSpeaker} options={["", ...input.participants]} onChange={setMeSpeaker} />
      {!meSpeaker && <div className="action-help">{t("meWhoHelp")}</div>}
    </section>}

    <section className="form-card stack optional-profile-card">
      <div><div className="card-kicker">{t("basicInfo")}</div><h2 className="form-title">{t("peopleInfo")}</h2><p className="form-help">{t("peopleInfoHelp")}</p></div>
      {!showPeopleInfo ? <>
        <div className="profile-summary-row"><strong>{t("me")}</strong><span>{value(meAge)} · {value(meGender)} · {meMbti}</span></div>
        {setup.mode === "direct" && <div className="profile-summary-row"><strong>{t("other")}</strong><span>{value(otherAge)} · {value(otherGender)} · {otherMbti}</span></div>}
        <AppButton variant="secondary" fullWidth onClick={() => setShowPeopleInfo(true)}>{t("editPeopleInfo")}</AppButton>
      </> : <>
        <PersonProfileFields title={t("me")} ageRange={meAge} gender={meGender} mbti={meMbti} onAgeRangeChange={setMeAge} onGenderChange={setMeGender} onMbtiChange={setMeMbti} />
        {setup.mode === "direct" && <PersonProfileFields title={t("other")} ageRange={otherAge} gender={otherGender} mbti={otherMbti} onAgeRangeChange={setOtherAge} onGenderChange={setOtherGender} onMbtiChange={setOtherMbti} />}
        <AppButton variant="ghost" fullWidth onClick={() => setShowPeopleInfo(false)}>{t("collapsePeopleInfo")}</AppButton>
      </>}
    </section>

    <section className="form-card stack friend-settings">
      <div><div className="card-kicker">{t("aiFriendSettings")}</div><h2 className="form-title">{t("chooseFriend")}</h2><p className="form-help">{t("chooseFriendHelp")}</p></div>
      <div className="friend-preset-grid" role="list">
        {AI_FRIEND_PRESETS.map((preset) => <button type="button" role="listitem" aria-pressed={friendPresetId === preset.id} className={`friend-preset-option ${friendPresetId === preset.id ? "selected" : ""}`} onClick={() => selectFriendPreset(preset.id)} key={preset.id}>
          <img src={preset.icon} alt="" width={46} height={46}/><span><strong>{(presetI18n[locale]?.[preset.id]?.label ?? preset.label)}{preset.id !== "custom" ? ` · ${preset.mbti}` : ""}</strong><small>{preset.id === "custom" ? t("directFriendTone") : `${value(preset.ageRange)} · ${value(preset.gender)}`}</small>{preset.id !== "custom" && <small className="friend-preset-note">{presetI18n[locale]?.[preset.id]?.note ?? preset.note}</small>}</span>{friendPresetId === preset.id && <span className="friend-preset-check" aria-hidden="true">✓</span>}
        </button>)}
      </div>
      {friendPresetId === "custom" ? <>
        <div className="friend-custom-fields"><TextField label={t("friendName")} value={friendName} onChange={setFriendName} maxLength={20} /><div className="row"><SelectField label={t("age")} value={friendAge} onChange={setFriendAge}>{AGE_RANGES.map(o=><option key={o} value={o}>{value(o)}</option>)}</SelectField><SelectField label={t("gender")} value={friendGender} onChange={setFriendGender}>{GENDERS.map(o=><option key={o} value={o}>{value(o)}</option>)}</SelectField></div><MbtiSelect value={friendMbti} onChange={setFriendMbti} label={t("friendMbti")} /></div>
        <div className="friend-persona"><strong>{t("directFriendTone")}</strong><span>{locale === "ko" ? friendPersona : (presetI18n[locale]?.[friendPresetId]?.note ?? friendPersona)}</span></div>
      </> : <div className="friend-persona friend-persona-selected"><strong>{presetI18n[locale]?.[friendPresetId]?.label ?? friendName}{t("saysLike")}</strong><span>{locale === "ko" ? friendPersona : (presetI18n[locale]?.[friendPresetId]?.note ?? friendPersona)}</span></div>}
    </section>

    <div className="bottom-actions"><AppButton fullWidth disabled={input?.method === "text" && input.participants.length > 1 && !meSpeaker} onClick={next}>{input?.method === "text" ? t("finalAnalyze") : t("goUpload")}</AppButton></div>
  </>;
}
