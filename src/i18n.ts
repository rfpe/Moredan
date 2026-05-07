export interface Translations {
  // Header
  all: string;
  none: string;
  addEvent: string;
  categories: string;
  exportXlsx: string;
  importXlsx: string;
  settings: string;
  // Modal titles
  editEvent: string;
  manageCategories: string;
  // EventForm
  eventName: string;
  eventNamePlaceholder: string;
  startDate: string;
  endDate: string;
  category: string;
  delete: string;
  cancel: string;
  updateEvent: string;
  saveEvent: string;
  // CategoryForm
  categoryName: string;
  categoryNamePlaceholder: string;
  color: string;
  addCategory: string;
  existingCategories: string;
  close: string;
  // Header
  today: string;
  viewDay: string;
  viewWeek: string;
  viewYearWeek: string;
  viewMonth: string;
  viewVertical: string;
  // Week label prefix (e.g. "W" in "W42")
  weekPrefix: string;
  // SettingsModal
  languageLabel: string;
  browserDefault: string;
  languageHint: string;
  columnAlignment: string;
  firstOfMonth: string;
  firstOfMonthHint: string;
  weekday: string;
  weekdayHint: string;
  showWeekNumbers: string;
  weekNumbersHint: string;
  loadDemoData: string;
  demoDataHint: string;
  clearData: string;
  clearDataHint: string;
  done: string;
}

const translations: Record<string, Translations> = {
  'en-US': {
    today: 'Today', viewDay: 'Day', viewWeek: 'Week', viewYearWeek: 'Year-Week', viewMonth: 'Month', viewVertical: 'Vertical', weekPrefix: 'W',
    all: 'All', none: 'None', addEvent: 'Add Event', categories: 'Categories', exportXlsx: 'Download', importXlsx: 'Import', settings: 'Settings',
    editEvent: 'Edit Event', manageCategories: 'Manage Categories',
    eventName: 'Event Name', eventNamePlaceholder: 'e.g. Vacation', startDate: 'Start Date', endDate: 'End Date',
    category: 'Category', delete: 'Delete', cancel: 'Cancel', updateEvent: 'Update Event', saveEvent: 'Save Event',
    categoryName: 'Category Name', categoryNamePlaceholder: 'e.g. Travel', color: 'Color',
    addCategory: 'Add Category', existingCategories: 'Existing Categories', close: 'Close',
    languageLabel: 'Language', browserDefault: 'Browser default', languageHint: 'Affects month and weekday names on the calendar.',
    columnAlignment: 'Column Alignment', firstOfMonth: '1st of month', firstOfMonthHint: 'Each row starts at day 1.',
    weekday: 'Weekday', weekdayHint: 'Columns align by weekday across all months.',
    showWeekNumbers: 'Show week numbers', weekNumbersHint: 'ISO 8601 — displayed on the first day of each week.',
    loadDemoData: 'Load Demo Data', demoDataHint: 'Replaces all current events and categories with sample data.',
    clearData: 'Clear All Data', clearDataHint: 'Permanently removes all events and resets categories to defaults.', done: 'Done',
  },
  'fr-FR': {
    today: "Aujourd'hui", viewDay: 'Jour', viewWeek: 'Semaine', viewYearWeek: 'Année-Semaine', viewMonth: 'Mois', viewVertical: 'Vertical', weekPrefix: 'S',
    all: 'Tout', none: 'Aucun', addEvent: 'Ajouter un événement', categories: 'Catégories', exportXlsx: 'Télécharger', importXlsx: 'Importer', settings: 'Paramètres',
    editEvent: "Modifier l'événement", manageCategories: 'Gérer les catégories',
    eventName: "Nom de l'événement", eventNamePlaceholder: 'ex. Vacances', startDate: 'Date de début', endDate: 'Date de fin',
    category: 'Catégorie', delete: 'Supprimer', cancel: 'Annuler', updateEvent: 'Mettre à jour', saveEvent: 'Enregistrer',
    categoryName: 'Nom de la catégorie', categoryNamePlaceholder: 'ex. Voyage', color: 'Couleur',
    addCategory: 'Ajouter une catégorie', existingCategories: 'Catégories existantes', close: 'Fermer',
    languageLabel: 'Langue', browserDefault: 'Navigateur par défaut', languageHint: 'Affecte les noms de mois et de jours sur le calendrier.',
    columnAlignment: 'Alignement des colonnes', firstOfMonth: '1er du mois', firstOfMonthHint: 'Chaque ligne commence au jour 1.',
    weekday: 'Jour de la semaine', weekdayHint: "Les colonnes s'alignent par jour de la semaine.",
    showWeekNumbers: 'Afficher les numéros de semaine', weekNumbersHint: 'ISO 8601 — affiché le premier jour de chaque semaine.',
    loadDemoData: 'Charger les données de démo', demoDataHint: 'Remplace tous les événements et catégories par des données exemples.',
    clearData: 'Effacer toutes les données', clearDataHint: 'Supprime définitivement tous les événements et réinitialise les catégories.', done: 'Terminé',
  },
  'de-DE': {
    today: 'Heute', viewDay: 'Tag', viewWeek: 'Woche', viewYearWeek: 'Jahr-Woche', viewMonth: 'Monat', viewVertical: 'Vertikal', weekPrefix: 'KW',
    all: 'Alle', none: 'Keine', addEvent: 'Ereignis hinzufügen', categories: 'Kategorien', exportXlsx: 'Herunterladen', importXlsx: 'Importieren', settings: 'Einstellungen',
    editEvent: 'Ereignis bearbeiten', manageCategories: 'Kategorien verwalten',
    eventName: 'Ereignisname', eventNamePlaceholder: 'z.B. Urlaub', startDate: 'Startdatum', endDate: 'Enddatum',
    category: 'Kategorie', delete: 'Löschen', cancel: 'Abbrechen', updateEvent: 'Aktualisieren', saveEvent: 'Speichern',
    categoryName: 'Kategoriename', categoryNamePlaceholder: 'z.B. Reise', color: 'Farbe',
    addCategory: 'Kategorie hinzufügen', existingCategories: 'Bestehende Kategorien', close: 'Schließen',
    languageLabel: 'Sprache', browserDefault: 'Browser-Standard', languageHint: 'Betrifft Monats- und Wochentagsnamen im Kalender.',
    columnAlignment: 'Spaltenausrichtung', firstOfMonth: '1. des Monats', firstOfMonthHint: 'Jede Zeile beginnt an Tag 1.',
    weekday: 'Wochentag', weekdayHint: 'Spalten werden nach Wochentag über alle Monate ausgerichtet.',
    showWeekNumbers: 'Wochennummern anzeigen', weekNumbersHint: 'ISO 8601 — am ersten Tag jeder Woche angezeigt.',
    loadDemoData: 'Demodaten laden', demoDataHint: 'Ersetzt alle aktuellen Ereignisse und Kategorien durch Beispieldaten.',
    clearData: 'Alle Daten löschen', clearDataHint: 'Löscht alle Ereignisse dauerhaft und setzt die Kategorien zurück.', done: 'Fertig',
  },
  'es-ES': {
    today: 'Hoy', viewDay: 'Día', viewWeek: 'Semana', viewYearWeek: 'Año-Semana', viewMonth: 'Mes', viewVertical: 'Vertical', weekPrefix: 'S',
    all: 'Todos', none: 'Ninguno', addEvent: 'Agregar evento', categories: 'Categorías', exportXlsx: 'Descargar', importXlsx: 'Importar', settings: 'Configuración',
    editEvent: 'Editar evento', manageCategories: 'Gestionar categorías',
    eventName: 'Nombre del evento', eventNamePlaceholder: 'ej. Vacaciones', startDate: 'Fecha de inicio', endDate: 'Fecha de fin',
    category: 'Categoría', delete: 'Eliminar', cancel: 'Cancelar', updateEvent: 'Actualizar evento', saveEvent: 'Guardar evento',
    categoryName: 'Nombre de categoría', categoryNamePlaceholder: 'ej. Viaje', color: 'Color',
    addCategory: 'Agregar categoría', existingCategories: 'Categorías existentes', close: 'Cerrar',
    languageLabel: 'Idioma', browserDefault: 'Predeterminado del navegador', languageHint: 'Afecta los nombres de meses y días en el calendario.',
    columnAlignment: 'Alineación de columnas', firstOfMonth: 'Día 1 del mes', firstOfMonthHint: 'Cada fila comienza en el día 1.',
    weekday: 'Día de la semana', weekdayHint: 'Las columnas se alinean por día de la semana en todos los meses.',
    showWeekNumbers: 'Mostrar números de semana', weekNumbersHint: 'ISO 8601 — mostrado el primer día de cada semana.',
    loadDemoData: 'Cargar datos de demostración', demoDataHint: 'Reemplaza todos los eventos y categorías con datos de muestra.',
    clearData: 'Borrar todos los datos', clearDataHint: 'Elimina permanentemente todos los eventos y restablece las categorías.', done: 'Listo',
  },
  'pt-BR': {
    today: 'Hoje', viewDay: 'Dia', viewWeek: 'Semana', viewYearWeek: 'Ano-Semana', viewMonth: 'Mês', viewVertical: 'Vertical', weekPrefix: 'S',
    all: 'Todos', none: 'Nenhum', addEvent: 'Adicionar evento', categories: 'Categorias', exportXlsx: 'Baixar', importXlsx: 'Importar', settings: 'Configurações',
    editEvent: 'Editar evento', manageCategories: 'Gerenciar categorias',
    eventName: 'Nome do evento', eventNamePlaceholder: 'ex. Férias', startDate: 'Data de início', endDate: 'Data de fim',
    category: 'Categoria', delete: 'Excluir', cancel: 'Cancelar', updateEvent: 'Atualizar evento', saveEvent: 'Salvar evento',
    categoryName: 'Nome da categoria', categoryNamePlaceholder: 'ex. Viagem', color: 'Cor',
    addCategory: 'Adicionar categoria', existingCategories: 'Categorias existentes', close: 'Fechar',
    languageLabel: 'Idioma', browserDefault: 'Padrão do navegador', languageHint: 'Afeta os nomes dos meses e dias da semana no calendário.',
    columnAlignment: 'Alinhamento de colunas', firstOfMonth: 'Dia 1 do mês', firstOfMonthHint: 'Cada linha começa no dia 1.',
    weekday: 'Dia da semana', weekdayHint: 'Colunas alinhadas por dia da semana em todos os meses.',
    showWeekNumbers: 'Mostrar números de semana', weekNumbersHint: 'ISO 8601 — exibido no primeiro dia de cada semana.',
    loadDemoData: 'Carregar dados de demonstração', demoDataHint: 'Substitui todos os eventos e categorias por dados de exemplo.',
    clearData: 'Limpar todos os dados', clearDataHint: 'Remove permanentemente todos os eventos e redefine as categorias.', done: 'Concluído',
  },
  'it-IT': {
    today: 'Oggi', viewDay: 'Giorno', viewWeek: 'Settimana', viewYearWeek: 'Anno-Settimana', viewMonth: 'Mese', viewVertical: 'Verticale', weekPrefix: 'S',
    all: 'Tutti', none: 'Nessuno', addEvent: 'Aggiungi evento', categories: 'Categorie', exportXlsx: 'Scarica', importXlsx: 'Importa', settings: 'Impostazioni',
    editEvent: 'Modifica evento', manageCategories: 'Gestisci categorie',
    eventName: 'Nome evento', eventNamePlaceholder: 'es. Vacanza', startDate: 'Data inizio', endDate: 'Data fine',
    category: 'Categoria', delete: 'Elimina', cancel: 'Annulla', updateEvent: 'Aggiorna evento', saveEvent: 'Salva evento',
    categoryName: 'Nome categoria', categoryNamePlaceholder: 'es. Viaggio', color: 'Colore',
    addCategory: 'Aggiungi categoria', existingCategories: 'Categorie esistenti', close: 'Chiudi',
    languageLabel: 'Lingua', browserDefault: 'Predefinito browser', languageHint: 'Influisce sui nomi di mesi e giorni nel calendario.',
    columnAlignment: 'Allineamento colonne', firstOfMonth: '1° del mese', firstOfMonthHint: 'Ogni riga inizia dal giorno 1.',
    weekday: 'Giorno della settimana', weekdayHint: 'Le colonne si allineano per giorno della settimana in tutti i mesi.',
    showWeekNumbers: 'Mostra numeri settimana', weekNumbersHint: 'ISO 8601 — mostrato il primo giorno di ogni settimana.',
    loadDemoData: 'Carica dati demo', demoDataHint: 'Sostituisce tutti gli eventi e le categorie con dati di esempio.',
    clearData: 'Cancella tutti i dati', clearDataHint: 'Rimuove definitivamente tutti gli eventi e reimposta le categorie.', done: 'Fatto',
  },
  'nl-NL': {
    today: 'Vandaag', viewDay: 'Dag', viewWeek: 'Week', viewYearWeek: 'Jaar-Week', viewMonth: 'Maand', viewVertical: 'Verticaal', weekPrefix: 'W',
    all: 'Alles', none: 'Geen', addEvent: 'Evenement toevoegen', categories: 'Categorieën', exportXlsx: 'Downloaden', importXlsx: 'Importeren', settings: 'Instellingen',
    editEvent: 'Evenement bewerken', manageCategories: 'Categorieën beheren',
    eventName: 'Naam evenement', eventNamePlaceholder: 'bijv. Vakantie', startDate: 'Startdatum', endDate: 'Einddatum',
    category: 'Categorie', delete: 'Verwijderen', cancel: 'Annuleren', updateEvent: 'Evenement bijwerken', saveEvent: 'Evenement opslaan',
    categoryName: 'Categorienaam', categoryNamePlaceholder: 'bijv. Reizen', color: 'Kleur',
    addCategory: 'Categorie toevoegen', existingCategories: 'Bestaande categorieën', close: 'Sluiten',
    languageLabel: 'Taal', browserDefault: 'Browserstandaard', languageHint: 'Beïnvloedt maand- en weekdagnamen in de kalender.',
    columnAlignment: 'Kolomuitlijning', firstOfMonth: '1e van de maand', firstOfMonthHint: 'Elke rij begint op dag 1.',
    weekday: 'Weekdag', weekdayHint: 'Kolommen worden uitgelijnd op weekdag voor alle maanden.',
    showWeekNumbers: 'Weeknummers tonen', weekNumbersHint: 'ISO 8601 — weergegeven op de eerste dag van elke week.',
    loadDemoData: 'Demogegevens laden', demoDataHint: 'Vervangt alle huidige evenementen en categorieën door voorbeeldgegevens.',
    clearData: 'Alle gegevens wissen', clearDataHint: 'Verwijdert alle evenementen definitief en herstelt de categorieën.', done: 'Klaar',
  },
  'ru-RU': {
    today: 'Сегодня', viewDay: 'День', viewWeek: 'Неделя', viewYearWeek: 'Год-Неделя', viewMonth: 'Месяц', viewVertical: 'Вертикаль', weekPrefix: 'Н',
    all: 'Все', none: 'Нет', addEvent: 'Добавить событие', categories: 'Категории', exportXlsx: 'Скачать', importXlsx: 'Импорт', settings: 'Настройки',
    editEvent: 'Изменить событие', manageCategories: 'Управление категориями',
    eventName: 'Название события', eventNamePlaceholder: 'напр. Отпуск', startDate: 'Дата начала', endDate: 'Дата окончания',
    category: 'Категория', delete: 'Удалить', cancel: 'Отмена', updateEvent: 'Обновить событие', saveEvent: 'Сохранить событие',
    categoryName: 'Название категории', categoryNamePlaceholder: 'напр. Путешествие', color: 'Цвет',
    addCategory: 'Добавить категорию', existingCategories: 'Существующие категории', close: 'Закрыть',
    languageLabel: 'Язык', browserDefault: 'По умолчанию браузера', languageHint: 'Влияет на названия месяцев и дней недели в календаре.',
    columnAlignment: 'Выравнивание столбцов', firstOfMonth: '1-й день месяца', firstOfMonthHint: 'Каждая строка начинается с 1-го дня.',
    weekday: 'День недели', weekdayHint: 'Столбцы выровнены по дням недели для всех месяцев.',
    showWeekNumbers: 'Показывать номера недель', weekNumbersHint: 'ISO 8601 — отображается в первый день каждой недели.',
    loadDemoData: 'Загрузить демо-данные', demoDataHint: 'Заменяет все события и категории примерами данных.',
    clearData: 'Очистить все данные', clearDataHint: 'Безвозвратно удаляет все события и сбрасывает категории.', done: 'Готово',
  },
  'ja-JP': {
    today: '今日', viewDay: '日', viewWeek: '週', viewYearWeek: '年間週', viewMonth: '月', viewVertical: '縦', weekPrefix: '第',
    all: 'すべて', none: 'なし', addEvent: 'イベントを追加', categories: 'カテゴリ', exportXlsx: 'ダウンロード', importXlsx: 'インポート', settings: '設定',
    editEvent: 'イベントを編集', manageCategories: 'カテゴリ管理',
    eventName: 'イベント名', eventNamePlaceholder: '例：休暇', startDate: '開始日', endDate: '終了日',
    category: 'カテゴリ', delete: '削除', cancel: 'キャンセル', updateEvent: '更新', saveEvent: '保存',
    categoryName: 'カテゴリ名', categoryNamePlaceholder: '例：旅行', color: '色',
    addCategory: 'カテゴリを追加', existingCategories: '既存のカテゴリ', close: '閉じる',
    languageLabel: '言語', browserDefault: 'ブラウザのデフォルト', languageHint: 'カレンダーの月名と曜日名に影響します。',
    columnAlignment: '列の配置', firstOfMonth: '月の1日', firstOfMonthHint: '各行は1日から始まります。',
    weekday: '曜日', weekdayHint: 'すべての月で曜日に合わせて列が配置されます。',
    showWeekNumbers: '週番号を表示', weekNumbersHint: 'ISO 8601 — 各週の最初の日に表示。',
    loadDemoData: 'デモデータを読み込む', demoDataHint: 'すべてのイベントとカテゴリをサンプルデータに置き換えます。',
    clearData: 'すべてのデータを削除', clearDataHint: 'すべてのイベントを完全に削除し、カテゴリをデフォルトにリセットします。', done: '完了',
  },
  'zh-CN': {
    today: '今天', viewDay: '日', viewWeek: '周', viewYearWeek: '年-周', viewMonth: '月', viewVertical: '竖向', weekPrefix: '第',
    all: '全部', none: '无', addEvent: '添加事件', categories: '分类', exportXlsx: '下载', importXlsx: '导入', settings: '设置',
    editEvent: '编辑事件', manageCategories: '管理分类',
    eventName: '事件名称', eventNamePlaceholder: '例：假期', startDate: '开始日期', endDate: '结束日期',
    category: '分类', delete: '删除', cancel: '取消', updateEvent: '更新事件', saveEvent: '保存事件',
    categoryName: '分类名称', categoryNamePlaceholder: '例：旅行', color: '颜色',
    addCategory: '添加分类', existingCategories: '现有分类', close: '关闭',
    languageLabel: '语言', browserDefault: '浏览器默认', languageHint: '影响日历上的月份和星期名称。',
    columnAlignment: '列对齐', firstOfMonth: '每月第1天', firstOfMonthHint: '每行从第1天开始。',
    weekday: '星期', weekdayHint: '所有月份按星期对齐列。',
    showWeekNumbers: '显示周数', weekNumbersHint: 'ISO 8601 — 显示在每周第一天。',
    loadDemoData: '加载演示数据', demoDataHint: '用示例数据替换所有事件和分类。',
    clearData: '清除所有数据', clearDataHint: '永久删除所有事件并将分类重置为默认值。', done: '完成',
  },
  'ko-KR': {
    today: '오늘', viewDay: '일', viewWeek: '주', viewYearWeek: '연간 주', viewMonth: '월', viewVertical: '세로', weekPrefix: '주',
    all: '전체', none: '없음', addEvent: '이벤트 추가', categories: '카테고리', exportXlsx: '다운로드', importXlsx: '가져오기', settings: '설정',
    editEvent: '이벤트 편집', manageCategories: '카테고리 관리',
    eventName: '이벤트 이름', eventNamePlaceholder: '예: 휴가', startDate: '시작일', endDate: '종료일',
    category: '카테고리', delete: '삭제', cancel: '취소', updateEvent: '이벤트 업데이트', saveEvent: '이벤트 저장',
    categoryName: '카테고리 이름', categoryNamePlaceholder: '예: 여행', color: '색상',
    addCategory: '카테고리 추가', existingCategories: '기존 카테고리', close: '닫기',
    languageLabel: '언어', browserDefault: '브라우저 기본값', languageHint: '달력의 월 및 요일 이름에 영향을 줍니다.',
    columnAlignment: '열 정렬', firstOfMonth: '매월 1일', firstOfMonthHint: '각 행은 1일부터 시작합니다.',
    weekday: '요일', weekdayHint: '모든 월에서 요일별로 열이 정렬됩니다.',
    showWeekNumbers: '주 번호 표시', weekNumbersHint: 'ISO 8601 — 각 주의 첫 날에 표시됩니다.',
    loadDemoData: '데모 데이터 불러오기', demoDataHint: '모든 이벤트와 카테고리를 샘플 데이터로 교체합니다.',
    clearData: '모든 데이터 지우기', clearDataHint: '모든 이벤트를 영구적으로 삭제하고 카테고리를 기본값으로 재설정합니다.', done: '완료',
  },
};

export const getTranslations = (locale: string): Translations => {
  if (translations[locale]) return translations[locale];
  // Try language-only match (e.g. 'fr' matches 'fr-FR')
  const lang = locale.split('-')[0];
  const match = Object.keys(translations).find(k => k.startsWith(lang + '-'));
  return match ? translations[match] : translations['en-US'];
};
