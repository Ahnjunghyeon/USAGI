"use client";

import MbtiSelect from "@/components/forms/MbtiSelect";
import { SelectField } from "@/components/ui/FormControls";
import { AGE_RANGES, GENDERS } from "@/lib/context";
import type { MbtiValue } from "@/lib/mbti";

type Props = {
  title: string;
  ageRange: string;
  gender: string;
  mbti: MbtiValue;
  onAgeRangeChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onMbtiChange: (value: MbtiValue) => void;
};

export default function PersonProfileFields({ title, ageRange, gender, mbti, onAgeRangeChange, onGenderChange, onMbtiChange }: Props) {
  return <div className="person-box">
    <strong>{title}</strong>
    <div className="row">
      <SelectField label="나이대" value={ageRange} options={AGE_RANGES} onChange={onAgeRangeChange} />
      <SelectField label="성별" value={gender} options={GENDERS} onChange={onGenderChange} />
    </div>
    <MbtiSelect value={mbti} onChange={onMbtiChange} />
  </div>;
}
