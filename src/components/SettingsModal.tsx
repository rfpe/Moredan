import React from 'react';

interface SettingsModalProps {
  locale: string;
  onLocaleChange: (locale: string) => void;
  weekdayAlign: boolean;
  onWeekdayAlignChange: (value: boolean) => void;
  onClose: () => void;
}

const LOCALES = [
  { code: 'en-US', label: 'English' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'es-ES', label: 'Español' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'nl-NL', label: 'Nederlands' },
  { code: 'ru-RU', label: 'Русский' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'zh-CN', label: '中文' },
  { code: 'ko-KR', label: '한국어' },
  { code: 'ar-SA', label: 'العربية' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({
  locale,
  onLocaleChange,
  weekdayAlign,
  onWeekdayAlignChange,
  onClose,
}) => {
  const browserLocale = navigator.language;
  const browserLabel = `Browser default (${browserLocale})`;

  return (
    <div className="settings-form">
      <div className="form-group">
        <label>Calendar Language</label>
        <select value={locale} onChange={e => onLocaleChange(e.target.value)}>
          <option value={browserLocale}>{browserLabel}</option>
          {LOCALES.filter(l => l.code !== browserLocale).map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <span className="settings-hint">Affects month and weekday names on the calendar.</span>
      </div>

      <div className="form-group">
        <label>Column Alignment</label>
        <div className="settings-radio-group">
          <label className="settings-radio-item">
            <input
              type="radio"
              name="alignment"
              checked={!weekdayAlign}
              onChange={() => onWeekdayAlignChange(false)}
            />
            <span>1st of month</span>
            <span className="settings-hint">Each row starts at day 1.</span>
          </label>
          <label className="settings-radio-item">
            <input
              type="radio"
              name="alignment"
              checked={weekdayAlign}
              onChange={() => onWeekdayAlignChange(true)}
            />
            <span>Weekday</span>
            <span className="settings-hint">Columns align by weekday across all months.</span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="primary-btn" onClick={onClose}>Done</button>
      </div>
    </div>
  );
};

export default SettingsModal;
