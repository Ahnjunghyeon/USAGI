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

export default function DetailsForm() {
  const router = useRouter();
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

  useEffect(() => {
    const nextInput = inputDraftStorage.read();
    const nextSetup = setupDraftStorage.read();
    setInput(nextInput); setSetup(nextSetup); setMeSpeaker(nextInput?.meSpeaker ?? ""); setLoaded(true);
  }, []);

  if (!loaded) return <div className="notice">우사기가 앞 단계 정보를 챙기고 있어요...</div>;
  if (!setup) return <div className="notice">앞 단계의 설정이 없어요. 이전 단계로 돌아가 다시 선택해 주세요.</div>;

  const selectFriendPreset = (id: AiFriendPresetId) => {
    setFriendPresetId(id);
    const preset = getAiFriendPreset(id);
    setFriendPersona(preset.persona);
    if (id === "custom") return;
    setFriendName(preset.name); setFriendAge(preset.ageRange); setFriendGender(preset.gender); setFriendMbti(preset.mbti);
  };

  const next = () => {
    if (input?.method === "text" && input.participants.length > 1 && !meSpeaker) return;
    if (input?.method === "text") inputDraftStorage.write({ ...input, meSpeaker });

    const context: UrIsaiContext = {
      ...setup,
      me: { ageRange: meAge, gender: meGender, mbti: meMbti },
      other: { ageRange: otherAge, gender: otherGender, mbti: otherMbti },
      aiFriend: { name: friendName.trim() || "우사기 친구", ageRange: friendAge, gender: friendGender, mbti: friendMbti, presetId: friendPresetId, persona: friendPersona },
    };
    contextStorage.write(context);
    router.push(input?.method === "text" ? "/analyze/processing" : "/analyze/upload");
  };

  return <>
    <div className="guide-inline"><div><span>🐰</span><strong>좋아. 마지막으로 이것만 알려줘.</strong>
    <br></br><small>모르는 항목은 ‘모름’으로 두어도 분석할 수 있어요.</small></div></div>

    {input?.method === "text" && input.participants.length > 1 && <section className="form-card stack">
      <SelectField label="이 대화에서 본인은 누구인가요?" value={meSpeaker} options={["", ...input.participants]} onChange={setMeSpeaker} />
      {!meSpeaker && <div className="action-help">텍스트에서는 말풍선 방향이 없어서 본인을 한 번만 알려주세요.</div>}
    </section>}

    <section className="form-card stack">
      <div><div className="card-kicker">기본 정보</div><h2 className="form-title">사람 정보를 조금만 알려주세요</h2><p className="form-help">나이·MBTI는 보조 맥락입니다. 성별만으로 관계나 성적 지향을 추정하지 않습니다.</p></div>
      <PersonProfileFields title="나" ageRange={meAge} gender={meGender} mbti={meMbti} onAgeRangeChange={setMeAge} onGenderChange={setMeGender} onMbtiChange={setMeMbti} />
      {setup.mode === "direct" && <PersonProfileFields title="상대" ageRange={otherAge} gender={otherGender} mbti={otherMbti} onAgeRangeChange={setOtherAge} onGenderChange={setOtherGender} onMbtiChange={setOtherMbti} />}
    </section>

    <section className="form-card stack friend-settings">
      <div><div className="card-kicker">AI 친구 설정</div><h2 className="form-title">누구한테 상담받을까요?</h2><p className="form-help">분석 사실은 같고 말투와 조언 방식만 달라집니다.</p></div>
      <div className="friend-preset-grid" role="list">
        {AI_FRIEND_PRESETS.map((preset) => <button type="button" role="listitem" aria-pressed={friendPresetId === preset.id} className={`friend-preset-option ${friendPresetId === preset.id ? "selected" : ""}`} onClick={() => selectFriendPreset(preset.id)} key={preset.id}>
          <img src={preset.icon} alt="" width={46} height={46}/><span><strong>{preset.label}{preset.id !== "custom" ? ` · ${preset.mbti}` : ""}</strong><small>{preset.id === "custom" ? "원하는 성향과 말투를 직접 설정" : `${preset.ageRange} · ${preset.gender}`}</small>{preset.id !== "custom" && <small className="friend-preset-note">{preset.note}</small>}</span>{friendPresetId === preset.id && <span className="friend-preset-check" aria-hidden="true">✓</span>}
        </button>)}
      </div>
      {friendPresetId === "custom" ? <>
        <div className="friend-custom-fields"><TextField label="친구 이름" value={friendName} onChange={setFriendName} maxLength={20} /><div className="row"><SelectField label="나이대" value={friendAge} options={AGE_RANGES} onChange={setFriendAge} /><SelectField label="성별" value={friendGender} options={GENDERS} onChange={setFriendGender} /></div><MbtiSelect value={friendMbti} onChange={setFriendMbti} label="친구 MBTI" /></div>
        <div className="friend-persona"><strong>직접 설정한 친구의 말투</strong><span>{friendPersona}</span></div>
      </> : <div className="friend-persona friend-persona-selected"><strong>{friendName}은 이렇게 말해요</strong><span>{friendPersona}</span></div>}
    </section>

    <div className="bottom-actions"><AppButton fullWidth disabled={input?.method === "text" && input.participants.length > 1 && !meSpeaker} onClick={next}>{input?.method === "text" ? "잠깐, 제대로 봐볼게 →" : "캡처 올리러 가기 →"}</AppButton></div>
  </>;
}
