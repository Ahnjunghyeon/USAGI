"use client";

import MbtiSelect from "@/components/forms/MbtiSelect";
import { SelectField } from "@/components/ui/FormControls";
import { AGE_RANGES, GENDERS } from "@/lib/context";
import type { MbtiValue } from "@/lib/mbti";
import { useLocale } from "@/components/LocaleProvider";

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
  const {t,value}=useLocale();
  return <div className="person-box">
    <strong>{title}</strong>
    <div className="row">
      <SelectField label={t("age")} value={ageRange} onChange={onAgeRangeChange}>{AGE_RANGES.map((option)=><option key={option} value={option}>{value(option)}</option>)}</SelectField>
      <SelectField label={t("gender")} value={gender} onChange={onGenderChange}>{GENDERS.map((option)=><option key={option} value={option}>{value(option)}</option>)}</SelectField>
    </div>
    <MbtiSelect value={mbti} onChange={onMbtiChange} />
  </div>;
}
