import React from 'react';
import type { Translations } from '../i18n';

interface SettingsModalProps {
  locale: string;
  onLocaleChange: (locale: string) => void;
  weekdayAlign: boolean;
  onWeekdayAlignChange: (value: boolean) => void;
  showWeekNumbers: boolean;
  onShowWeekNumbersChange: (value: boolean) => void;
  onLoadDemoData: () => void;
  onClearData: () => void;
  onClose: () => void;
  t: Translations;
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
];

const SettingsModal: React.FC<SettingsModalProps> = ({
  locale,
  onLocaleChange,
  weekdayAlign,
  onWeekdayAlignChange,
  showWeekNumbers,
  onShowWeekNumbersChange,
  onLoadDemoData,
  onClearData,
  onClose,
  t,
}) => {
  const browserLocale = navigator.language;
  const browserLabel = `${t.browserDefault} (${browserLocale})`;

  return (
    <div className="settings-form">
      <div className="form-group">
        <label>{t.languageLabel} (Language)</label>
        <select value={locale} onChange={e => onLocaleChange(e.target.value)}>
          <option value={browserLocale}>{browserLabel}</option>
          {LOCALES.filter(l => l.code !== browserLocale).map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <span className="settings-hint">{t.languageHint}</span>
      </div>

      <div className="form-group">
        <label>{t.columnAlignment}</label>
        <div className="settings-radio-group">
          <label className="settings-radio-item">
            <input
              type="radio"
              name="alignment"
              checked={!weekdayAlign}
              onChange={() => onWeekdayAlignChange(false)}
            />
            <span>{t.firstOfMonth}</span>
            <span className="settings-hint">{t.firstOfMonthHint}</span>
          </label>
          <label className="settings-radio-item">
            <input
              type="radio"
              name="alignment"
              checked={weekdayAlign}
              onChange={() => onWeekdayAlignChange(true)}
            />
            <span>{t.weekday}</span>
            <span className="settings-hint">{t.weekdayHint}</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label className="settings-checkbox-item">
          <input
            type="checkbox"
            checked={showWeekNumbers}
            onChange={e => onShowWeekNumbersChange(e.target.checked)}
          />
          <span>{t.showWeekNumbers}</span>
        </label>
        <span className="settings-hint">{t.weekNumbersHint}</span>
      </div>

      <div className="settings-demo-section">
        <button type="button" className="demo-btn" onClick={onLoadDemoData}>
          {t.loadDemoData}
        </button>
        <span className="settings-hint">{t.demoDataHint}</span>
      </div>

      <div className="settings-demo-section">
        <button type="button" className="demo-btn demo-btn--destructive" onClick={onClearData}>
          {t.clearData}
        </button>
        <span className="settings-hint">{t.clearDataHint}</span>
      </div>

      <div className="form-actions">
        <button type="button" className="primary-btn" onClick={onClose}>{t.done}</button>
      </div>
    </div>
  );
};

export default SettingsModal;
