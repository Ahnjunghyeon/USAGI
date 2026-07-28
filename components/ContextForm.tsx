"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AGE_RANGES, ANALYSIS_GOALS, GENDERS, RELATIONSHIP_DURATION_OPTIONS, RELATIONSHIPS, type RelationshipType, type UrIsaiContext } from "@/lib/context";
import { MBTI_GROUPS, type MbtiValue } from "@/lib/mbti";
import { AI_FRIEND_PRESETS, getAiFriendPreset, type AiFriendPresetId } from "@/lib/friend-presets";

const relationshipMeta: Record<RelationshipType, { emoji: string; description: string }> = {
  썸: { emoji: "😍", description: "관심 표현, 질문, 대화 확장" },
  연인: { emoji: "❤️", description: "공감, 변화, 갈등과 회복" },
  소개팅: { emoji: "👀", description: "초기 흐름, 후속 대화, 다음 약속" },
  "애매한 사이": { emoji: "🤨", description: "친밀감 변화, 경계, 주도권" },
  전애인: { emoji: "💔", description: "재접촉, 과거 언급, 관계 경계" },
  친구: { emoji: "🧑‍🤝‍🧑", description: "상호성, 친밀감, 연락 균형" },
};

function MbtiSelect({ value, onChange, label, disabled = false }: { value: MbtiValue; onChange: (value: MbtiValue) => void; label: string; disabled?: boolean }) {
  return <div>
    <label className="label">{label}</label>
    <select className="field" value={value} disabled={disabled} onChange={(e)=>onChange(e.target.value as MbtiValue)}>
      <option value="모름">모름</option>
      {MBTI_GROUPS.map((group)=><optgroup key={group.label} label={group.label}>{group.types.map((type)=><option value={type} key={type}>{type}</option>)}</optgroup>)}
    </select>
  </div>;
}

export default function ContextForm() {
  const router = useRouter();
  const [relationship, setRelationship] = useState<RelationshipType>("썸");
  const [duration, setDuration] = useState(RELATIONSHIP_DURATION_OPTIONS.썸[1]);
  const [goal, setGoal] = useState(ANALYSIS_GOALS.썸[4]);
  const [meAge, setMeAge] = useState("20대 중반");
  const [meGender, setMeGender] = useState("남성");
  const [meMbti, setMeMbti] = useState<MbtiValue>("ENFP");
  const [otherAge, setOtherAge] = useState("20대 중반");
  const [otherGender, setOtherGender] = useState("여성");
  const [otherMbti, setOtherMbti] = useState<MbtiValue>("ISFP");
  const [friendPresetId, setFriendPresetId] = useState<AiFriendPresetId>("custom");
  const [friendName, setFriendName] = useState("우사기 친구");
  const [friendAge, setFriendAge] = useState("20대 중반");
  const [friendGender, setFriendGender] = useState("선택 안 함");
  const [friendMbti, setFriendMbti] = useState<MbtiValue>("ENTP");
  const [friendPersona, setFriendPersona] = useState(getAiFriendPreset("custom").persona);

  const durations = useMemo(()=>RELATIONSHIP_DURATION_OPTIONS[relationship], [relationship]);
  const goals = useMemo(()=>ANALYSIS_GOALS[relationship], [relationship]);
  const selectedFriendPreset = getAiFriendPreset(friendPresetId);

  const selectRelationship = (next: RelationshipType) => {
    setRelationship(next);
    setDuration(RELATIONSHIP_DURATION_OPTIONS[next][0]);
    setGoal(ANALYSIS_GOALS[next][ANALYSIS_GOALS[next].length - 1]);
  };

  const selectFriendPreset = (id: AiFriendPresetId) => {
    setFriendPresetId(id);
    const preset = getAiFriendPreset(id);
    if (id === "custom") {
      setFriendPersona(preset.persona);
      return;
    }
    setFriendName(preset.name);
    setFriendAge(preset.ageRange);
    setFriendGender(preset.gender);
    setFriendMbti(preset.mbti);
    setFriendPersona(preset.persona);
  };

  const next = () => {
    const context: UrIsaiContext = {
      relationship,
      duration,
      goal,
      me: { ageRange: meAge, gender: meGender, mbti: meMbti },
      other: { ageRange: otherAge, gender: otherGender, mbti: otherMbti },
      aiFriend: { name: friendName.trim() || "우사기 친구", ageRange: friendAge, gender: friendGender, mbti: friendMbti, presetId: friendPresetId, persona: friendPersona },
    };
    localStorage.setItem("urisai-context", JSON.stringify(context));
    router.push("/analyze/upload");
  };

  return <>
    <div className="option-grid">
      {RELATIONSHIPS.map((label) => {
        const meta = relationshipMeta[label];
        return <button key={label} className={`option ${relationship===label?"selected":""}`} onClick={()=>selectRelationship(label)}>
          <span>{meta.emoji}</span>
          <div><strong>{label}</strong><small>{meta.description}</small></div>
        </button>;
      })}
    </div>

    <div className="form-card stack">
      <div>
        <label className="label">얼마나 된 사이인가요?</label>
        <select className="field" value={duration} onChange={(e)=>setDuration(e.target.value)}>{durations.map((item)=><option key={item}>{item}</option>)}</select>
      </div>
      <div>
        <label className="label">무엇이 가장 궁금한가요?</label>
        <select className="field" value={goal} onChange={(e)=>setGoal(e.target.value)}>{goals.map((item)=><option key={item}>{item}</option>)}</select>
      </div>
    </div>

    <section className="form-card stack">
      <div><div className="card-kicker">대화 참가자</div><h2 className="form-title">두 사람을 알려주세요</h2><p className="form-help">나이대와 MBTI는 대화 맥락을 이해하기 위한 참고 정보입니다. 실제 대화에서 확인되는 패턴을 우선하여 분석합니다.</p></div>
      <div className="person-box">
        <strong>나</strong>
        <div className="row"><div><label className="label">나이대</label><select className="field" value={meAge} onChange={(e)=>setMeAge(e.target.value)}>{AGE_RANGES.map((item)=><option key={item}>{item}</option>)}</select></div><div><label className="label">성별</label><select className="field" value={meGender} onChange={(e)=>setMeGender(e.target.value)}>{GENDERS.map((item)=><option key={item}>{item}</option>)}</select></div></div>
        <MbtiSelect value={meMbti} onChange={setMeMbti} label="MBTI" />
      </div>
      <div className="person-box">
        <strong>상대</strong>
        <div className="row"><div><label className="label">나이대</label><select className="field" value={otherAge} onChange={(e)=>setOtherAge(e.target.value)}>{AGE_RANGES.map((item)=><option key={item}>{item}</option>)}</select></div><div><label className="label">성별</label><select className="field" value={otherGender} onChange={(e)=>setOtherGender(e.target.value)}>{GENDERS.map((item)=><option key={item}>{item}</option>)}</select></div></div>
        <MbtiSelect value={otherMbti} onChange={setOtherMbti} label="MBTI" />
      </div>
      <div className="notice">MBTI는 재미와 대화 맥락을 위한 참고 정보이며, 호감도나 감정을 단정하는 근거로 사용하지 않습니다.</div>
    </section>

    <section className="form-card stack friend-settings">
      <div><div className="card-kicker">AI 친구 설정</div><h2 className="form-title">어떤 친구에게 상담받을까요?</h2><p className="form-help">친구 캐릭터에 따라 말투와 조언 방식만 달라집니다. 분석 수치와 사실 판단에는 영향을 주지 않습니다.</p></div>
      <div>
        <label className="label">친구 선택</label>
        <div className="friend-preset-grid" role="list">
          {AI_FRIEND_PRESETS.map((preset)=>(
            <button
              type="button"
              role="listitem"
              aria-pressed={friendPresetId === preset.id}
              className={`friend-preset-option ${friendPresetId === preset.id ? "selected" : ""}`}
              onClick={()=>selectFriendPreset(preset.id)}
              key={preset.id}
            >
              <img src={preset.icon} alt="" width={46} height={46}/>
              <span>
                <strong>{preset.label}</strong>
                <small>{preset.id === "custom" ? "원하는 친구를 직접 설정" : `${preset.ageRange} · ${preset.gender} · ${preset.mbti}`}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div><label className="label">친구 이름</label><input className="field" value={friendName} onChange={(e)=>setFriendName(e.target.value)} maxLength={20} disabled={friendPresetId !== "custom"}/></div>
      <div className="row"><div><label className="label">나이대</label><select className="field" value={friendAge} onChange={(e)=>setFriendAge(e.target.value)} disabled={friendPresetId !== "custom"}>{AGE_RANGES.map((item)=><option key={item}>{item}</option>)}</select></div><div><label className="label">성별</label><select className="field" value={friendGender} onChange={(e)=>setFriendGender(e.target.value)} disabled={friendPresetId !== "custom"}>{GENDERS.map((item)=><option key={item}>{item}</option>)}</select></div></div>
      <MbtiSelect value={friendMbti} onChange={setFriendMbti} label="친구 MBTI" disabled={friendPresetId !== "custom"} />
      <div className="friend-persona"><strong>{friendPresetId === "custom" ? "직접 설정 모드" : "이 친구는 이렇게 말해요"}</strong><span>{friendPersona}</span></div>
      <div className="friend-preview">
        <img className="friend-avatar" src={selectedFriendPreset.icon} alt={`${friendName || "우사기 친구"} 아이콘`} width={48} height={48}/>
        <div><strong>{friendName || "우사기 친구"}</strong><small>{friendAge} · {friendGender} · {friendMbti}</small></div>
      </div>
    </section>

    <div className="bottom-actions"><button className="primary" onClick={next}>대화 보여주기 →</button></div>
  </>;
}
