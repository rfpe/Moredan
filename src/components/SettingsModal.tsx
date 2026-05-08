import React, { useState } from 'react';
import type { Translations } from '../i18n';
import { type EventAttribute, type AttributeType } from '../types';

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
  eventAttributes: EventAttribute[];
  onAddAttribute: (name: string, type: AttributeType) => void;
  onUpdateAttribute: (id: string, name: string, type: AttributeType) => void;
  onDeleteAttribute: (id: string) => void;
  onReorderAttributes: (attrs: EventAttribute[]) => void;
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

const TYPE_LABELS: Record<AttributeType, string> = {
  text: 'Text',
  textarea: 'Note',
  url: 'URL',
};

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
  eventAttributes,
  onAddAttribute,
  onUpdateAttribute,
  onDeleteAttribute,
  onReorderAttributes,
}) => {
  const browserLocale = navigator.language;
  const browserLabel = `${t.browserDefault} (${browserLocale})`;

  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrType, setNewAttrType] = useState<AttributeType>('text');

  const sortedAttrs = [...eventAttributes].sort((a, b) => a.order - b.order);

  const moveAttr = (id: string, dir: -1 | 1) => {
    const idx = sortedAttrs.findIndex(a => a.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= sortedAttrs.length) return;
    const next = [...sortedAttrs];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onReorderAttributes(next);
  };

  const handleAddAttr = () => {
    const trimmed = newAttrName.trim();
    if (!trimmed) return;
    onAddAttribute(trimmed, newAttrType);
    setNewAttrName('');
    setNewAttrType('text');
  };

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

      <div className="settings-section">
        <h3 className="settings-section-title">Custom Event Attributes</h3>
        <p className="settings-hint">Extra fields shown on every event form.</p>

        {sortedAttrs.map((attr, idx) => (
          <div className="attribute-row" key={attr.id}>
            <input
              type="text"
              className="attribute-row__name"
              defaultValue={attr.name}
              onBlur={e => {
                const trimmed = e.target.value.trim();
                onUpdateAttribute(attr.id, trimmed || attr.name, attr.type);
                if (!trimmed) e.target.value = attr.name;
              }}
            />
            <select
              value={attr.type}
              onChange={e => onUpdateAttribute(attr.id, attr.name, e.target.value as AttributeType)}
            >
              {(Object.keys(TYPE_LABELS) as AttributeType[]).map(k => (
                <option key={k} value={k}>{TYPE_LABELS[k]}</option>
              ))}
            </select>
            <button type="button" className="icon-btn" onClick={() => moveAttr(attr.id, -1)} title="Move up" disabled={idx === 0}>↑</button>
            <button type="button" className="icon-btn" onClick={() => moveAttr(attr.id, 1)} title="Move down" disabled={idx === sortedAttrs.length - 1}>↓</button>
            <button type="button" className="icon-btn icon-btn--danger" onClick={() => onDeleteAttribute(attr.id)} title="Delete">✕</button>
          </div>
        ))}

        <div className="attribute-row attribute-row--add">
          <input
            type="text"
            className="attribute-row__name"
            placeholder="Attribute name"
            value={newAttrName}
            onChange={e => setNewAttrName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAttr())}
          />
          <select value={newAttrType} onChange={e => setNewAttrType(e.target.value as AttributeType)}>
            {(Object.keys(TYPE_LABELS) as AttributeType[]).map(k => (
              <option key={k} value={k}>{TYPE_LABELS[k]}</option>
            ))}
          </select>
          <button type="button" className="primary-btn" onClick={handleAddAttr} disabled={!newAttrName.trim()}>
            Add
          </button>
        </div>
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
