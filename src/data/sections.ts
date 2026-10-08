export interface Section {
  id: string;
  num: string;
  /** Display lines, broken by hand so they sit flush-left on the grid. */
  title: string[];
}

export const sections: Section[] = [
  { id: 'section-01', num: '01', title: ['Identity', 'Exploration'] },
  { id: 'section-02', num: '02', title: ['Audience &', 'Emotions'] },
  { id: 'section-03', num: '03', title: ['Brand', 'Positioning'] },
  { id: 'section-04', num: '04', title: ['Visual Language', 'Analysis'] },
  { id: 'section-05', num: '05', title: ['Core Message', 'Development'] },
];

export const sectionLabel = (s: Section) => `${s.num} — ${s.title.join(' ')}`;
