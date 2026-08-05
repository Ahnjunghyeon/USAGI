"use client";

import { SelectField } from "@/components/ui/FormControls";
import { MBTI_GROUPS, type MbtiValue } from "@/lib/mbti";
import { useLocale } from "@/components/LocaleProvider";

export default function MbtiSelect({ value, onChange, label = "MBTI", disabled = false }: { value: MbtiValue; onChange: (value: MbtiValue) => void; label?: string; disabled?: boolean }) {
  const {t}=useLocale();
  return <SelectField label={label} value={value} disabled={disabled} onChange={(next) => onChange(next as MbtiValue)}>
    <option value="모름">{t("unknown")}</option>
    {MBTI_GROUPS.map((group) => <optgroup key={group.label} label={group.label}>
      {group.types.map((type) => <option value={type} key={type}>{type}</option>)}
    </optgroup>)}
  </SelectField>;
}
