"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PersonProfileFields from "@/components/forms/PersonProfileFields";
import MbtiSelect from "@/components/forms/MbtiSelect";
import { AppButton } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/FormControls";
import {
  ANALYSIS_GOALS,
  GROUP_ANALYSIS_GOALS,
  RELATIONSHIP_DURATION_OPTIONS,
  RELATIONSHIPS,
  AGE_RANGES,
  GENDERS,
  type ConversationMode,
  type RelationshipType,
  type UrIsaiContext,
} from "@/lib/context";
import type { MbtiValue } from "@/lib/mbti";
import { AI_FRIEND_PRESETS, getAiFriendPreset, type AiFriendPresetId } from "@/lib/friend-presets";
import { contextStorage } from "@/lib/client/storage";

const relationshipMeta: Record<RelationshipType, { emoji: string; description: string }> = {
  썸: { emoji: "😍", description: "관심 표현, 질문, 대화 확장" },
  연인: { emoji: "❤️", description: "공감, 변화, 갈등과 회복" },
  소개팅: { emoji: "👀", description: "초기 흐름, 후속 대화, 다음 약속" },
  "애매한 사이": { emoji: "🤨", description: "친밀감 변화, 경계, 주도권" },
  전애인: { emoji: "💔", description: "재접촉, 과거 언급, 관계 경계" },
  친구: { emoji: "🧑‍🤝‍🧑", description: "상호성, 친밀감, 연락 균형" },
};

export default function ContextForm() {
  const router = useRouter();
  const [mode, setMode] = useState<ConversationMode>("direct");
  const [groupGoal, setGroupGoal] = useState<string>(GROUP_ANALYSIS_GOALS[4]);
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

  const durations = useMemo(() => RELATIONSHIP_DURATION_OPTIONS[relationship], [relationship]);
  const goals = useMemo(() => ANALYSIS_GOALS[relationship], [relationship]);

  const selectRelationship = (next: RelationshipType) => {
    setRelationship(next);
    setDuration(RELATIONSHIP_DURATION_OPTIONS[next][0]);
    setGoal(ANALYSIS_GOALS[next].at(-1) ?? "전체적으로 봐주세요");
  };

  const selectFriendPreset = (id: AiFriendPresetId) => {
    setFriendPresetId(id);
    const preset = getAiFriendPreset(id);
    setFriendPersona(preset.persona);
    if (id === "custom") return;
    setFriendName(preset.name);
    setFriendAge(preset.ageRange);
    setFriendGender(preset.gender);
    setFriendMbti(preset.mbti);
  };

  const next = () => {
    const context: UrIsaiContext = {
      mode,
      relationship: mode === "group" ? "친구" : relationship,
      duration: mode === "group" ? RELATIONSHIP_DURATION_OPTIONS.친구[0] : duration,
      goal: mode === "group" ? ANALYSIS_GOALS.친구.at(-1) ?? "전체적으로 봐주세요" : goal,
      groupGoal: mode === "group" ? groupGoal : undefined,
      me: { ageRange: meAge, gender: meGender, mbti: meMbti },
      other: { ageRange: otherAge, gender: otherGender, mbti: otherMbti },
      aiFriend: {
        name: friendName.trim() || "우사기 친구",
        ageRange: friendAge,
        gender: friendGender,
        mbti: friendMbti,
        presetId: friendPresetId,
        persona: friendPersona,
      },
    };
    contextStorage.write(context);
    router.push("/analyze/upload");
  };

  return <>
    <section className="form-card stack conversation-mode-card">
      <div><div className="card-kicker">분석 모드</div><h2 className="form-title">어떤 대화를 보여주실 건가요?</h2><p className="form-help">1:1은 두 사람의 흐름을 깊게 보고, 단체톡은 여러 사람 사이에서 나와 유독 자주 이어지는 대화를 찾습니다.</p></div>
      <div className="conversation-mode-grid">
        <button type="button" className={`conversation-mode-option ${mode === "direct" ? "selected" : ""}`} onClick={() => setMode("direct")}><strong>👤 1:1 대화</strong><small>썸 · 연인 · 친구 등 두 사람 분석</small></button>
        <button type="button" className={`conversation-mode-option ${mode === "group" ? "selected" : ""}`} onClick={() => setMode("group")}><strong>👥 단체톡</strong><small>티키타카 · 반응 · 눈에 띄는 사람 찾기</small></button>
      </div>
    </section>

    {mode === "direct" ? <>
      <div className="option-grid">
        {RELATIONSHIPS.map((label) => {
          const meta = relationshipMeta[label];
          return <button type="button" key={label} className={`option ${relationship === label ? "selected" : ""}`} onClick={() => selectRelationship(label)}>
            <span>{meta.emoji}</span><div><strong>{label}</strong><small>{meta.description}</small></div>
          </button>;
        })}
      </div>

      <div className="form-card stack">
        <SelectField label="얼마나 된 사이인가요?" value={duration} options={durations} onChange={setDuration} />
        <SelectField label="무엇이 가장 궁금한가요?" value={goal} options={goals} onChange={setGoal} />
      </div>

      <section className="form-card stack">
        <div><div className="card-kicker">대화 참가자</div><h2 className="form-title">두 사람을 알려주세요</h2><p className="form-help">나이대와 MBTI는 대화 맥락을 이해하기 위한 참고 정보입니다. 실제 대화에서 확인되는 패턴을 우선하여 분석합니다.</p></div>
        <PersonProfileFields title="나" ageRange={meAge} gender={meGender} mbti={meMbti} onAgeRangeChange={setMeAge} onGenderChange={setMeGender} onMbtiChange={setMeMbti} />
        <PersonProfileFields title="상대" ageRange={otherAge} gender={otherGender} mbti={otherMbti} onAgeRangeChange={setOtherAge} onGenderChange={setOtherGender} onMbtiChange={setOtherMbti} />
        <div className="notice">MBTI는 재미와 대화 맥락을 위한 참고 정보이며, 호감도나 감정을 단정하는 근거로 사용하지 않습니다. 성별 조합만으로 관계나 성적 지향을 추정하지 않습니다.</div>
      </section>
    </> : <section className="form-card stack">
      <div><div className="card-kicker">단체톡 분석</div><h2 className="form-title">단톡에서 무엇을 볼까요?</h2><p className="form-help">참가자별 MBTI를 입력받지 않습니다. 실제로 누가 누구의 말을 자주 이어받고, 질문하고, 장난을 주고받는지 중심으로 봅니다.</p></div>
      <SelectField label="가장 궁금한 점" value={groupGoal} options={GROUP_ANALYSIS_GOALS} onChange={setGroupGoal} />
      <PersonProfileFields title="나" ageRange={meAge} gender={meGender} mbti={meMbti} onAgeRangeChange={setMeAge} onGenderChange={setMeGender} onMbtiChange={setMeMbti} />
      <div className="notice">단체톡에서는 성별·MBTI를 다른 참가자의 감정이나 관계를 추정하는 근거로 사용하지 않습니다. 캡처에서 확인되는 상호작용만 분석합니다.</div>
    </section>}

    <section className="form-card stack friend-settings">
      <div><div className="card-kicker">AI 친구 설정</div><h2 className="form-title">어떤 친구에게 상담받을까요?</h2><p className="form-help">친구 캐릭터에 따라 말투와 조언 방식만 달라집니다. 분석 수치와 사실 판단에는 영향을 주지 않습니다.</p></div>
      <div>
        <label className="label">친구 선택</label>
        <div className="friend-preset-grid" role="list">
          {AI_FRIEND_PRESETS.map((preset) => <button type="button" role="listitem" aria-pressed={friendPresetId === preset.id} className={`friend-preset-option ${friendPresetId === preset.id ? "selected" : ""}`} onClick={() => selectFriendPreset(preset.id)} key={preset.id}>
            <img src={preset.icon} alt="" width={46} height={46}/>
            <span><strong>{preset.label}{preset.id !== "custom" ? ` · ${preset.mbti}` : ""}</strong><small>{preset.id === "custom" ? "원하는 성향과 말투를 직접 설정" : `${preset.ageRange} · ${preset.gender}`}</small>{preset.id !== "custom" && <small className="friend-preset-note">{preset.note}</small>}</span>
            {friendPresetId === preset.id && <span className="friend-preset-check" aria-hidden="true">✓</span>}
          </button>)}
        </div>
      </div>

      {friendPresetId === "custom" ? <>
        <div className="friend-custom-fields">
          <TextField label="친구 이름" value={friendName} onChange={setFriendName} maxLength={20} />
          <div className="row"><SelectField label="나이대" value={friendAge} options={AGE_RANGES} onChange={setFriendAge} /><SelectField label="성별" value={friendGender} options={GENDERS} onChange={setFriendGender} /></div>
          <MbtiSelect value={friendMbti} onChange={setFriendMbti} label="친구 MBTI" />
        </div>
        <div className="friend-persona"><strong>직접 설정한 친구의 말투</strong><span>{friendPersona}</span></div>
      </> : <div className="friend-persona friend-persona-selected"><strong>{friendName}은 이렇게 말해요</strong><span>{friendPersona}</span></div>}
    </section>

    <div className="bottom-actions"><AppButton fullWidth onClick={next}>대화 보여주기 →</AppButton></div>
  </>;
}
